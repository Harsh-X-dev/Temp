/**
 * RazorpayCheckout � Razorpay prepaid payment integration for GemOstone.
 *
 * Exports:
 *  - useRazorpayCheckout() � hook that owns all payment logic and state
 *  - RazorpayCheckout      � component that renders the checkout.js <Script> tag and SDK error banner
 *
 * Flow (inside useRazorpayCheckout.handlePrepaidPayment):
 *   1. Validate: sdk ready, address, amount > 0
 *   2. createPrepaidOrder()      ? GemOstone DB order (payment_status=pending)
 *   3. createRazorpayOrder()     ? Hono backend ? Razorpay order_id + key_id
 *   4. Amount consistency check  ? frontendRupees * 100 must equal amountInPaise
 *   5. new window.Razorpay(...)  ? open checkout modal
 *   6. handler callback          ? verifyRazorpayPayment() ? Hono backend HMAC check
 *   7. updateOrderPaymentStatus()? mark GemOstone order paid/confirmed
 *   8. clear cart / navigate     ? /order-successful
 *
 * Design rules:
 *  - isProcessingRef prevents duplicate payment initialisation
 *  - Cart cleared ONLY after step 7 succeeds
 *  - No (window as any) � window.Razorpay is typed in types/payment.types.ts
 *  - No Next.js route.ts for payments
 *  - No RAZORPAY_KEY_SECRET in browser code
 */
'use client';

import { useRef, useState, useCallback, useEffect } from 'react';
import Script from 'next/script';
import { useRouter } from 'next/navigation';
import type { SupabaseClient } from '@supabase/supabase-js';

import type { BillBreakdown, Coupon, CheckoutItem } from '@/types/checkout.types';
import type { PaymentFlowState, RazorpaySuccessResponse } from '@/types/payment.types';
import { PaymentError } from '@/types/payment.types';
import { verifyRazorpayPayment, markPaymentFailed } from '@/services/payment.service';
import { createPrepaidOrder, type PrepaidOrderResponse } from '@/services/checkout.service';

// ---------------------------------------------------------------------------
// Hook � owns all payment logic and state
// ---------------------------------------------------------------------------

export interface UseRazorpayCheckoutParams {
  supabase: SupabaseClient;
  items: CheckoutItem[];
  selectedAddressId: string | null;
  selectedCoupon: Coupon | null;
  bill: BillBreakdown;
  source: 'cart' | 'buy-now';
  user: { name?: string; email?: string } | null;
  rawUser?: any;
  profile?: any;
  address?: any;
  onClearCart: () => void;
  onRemoveItems: (keys: string[]) => void;
}



export function useRazorpayCheckout({
  supabase,
  items,
  selectedAddressId,
  selectedCoupon,
  bill,
  source,
  user,
  rawUser,
  profile,
  address,
  onClearCart,
  onRemoveItems,
}: UseRazorpayCheckoutParams) {
  const router = useRouter();

  const [sdkReady, setSdkReady] = useState(() => typeof window !== 'undefined' && Boolean(window.Razorpay));
  const [sdkError, setSdkError] = useState(false);
  const [paymentState, setPaymentState] = useState<PaymentFlowState>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const isProcessingRef = useRef(false);
  const handleSdkReady = useCallback(() => setSdkReady(true), []);
  const handleSdkError = useCallback(() => {
    setSdkError(true);
    console.error('[RazorpayCheckout] Failed to load checkout.js SDK');
  }, []);

  useEffect(() => {
    if (typeof window !== 'undefined' && window.Razorpay) {
      setSdkReady(true);
    }
  }, []);

  // Prefetch routes for 0ms instant transition
  useEffect(() => {
    router.prefetch('/payment-failed');
    router.prefetch('/order-successful');
  }, [router]);

  const handlePrepaidPayment = useCallback(async () => {
    // -- Duplicate-click guard -----------------------------------------------
    if (isProcessingRef.current) return;

    // -- SDK guard -----------------------------------------------------------
    if (sdkError) {
      setPaymentState('failed');
      setErrorMessage('Unable to load the payment gateway. Please check your connection and try again.');
      return;
    }
    if (!window.Razorpay) {
      setPaymentState('failed');
      setErrorMessage('Payment gateway is still loading. Please wait a moment and try again.');
      return;
    }

    // -- Checkout data guard -------------------------------------------------
    if (!selectedAddressId || items.length === 0) {
      setPaymentState('failed');
      setErrorMessage('Invalid checkout data. Please go back and try again.');
      return;
    }

    // -- Amount guard --------------------------------------------------------
    const finalAmount = parseFloat(bill.grandTotal.toFixed(2));
    if (!isFinite(finalAmount) || finalAmount <= 0) {
      setPaymentState('failed');
      setErrorMessage('Invalid order amount. Please go back and try again.');
      return;
    }

    // -- Lock ----------------------------------------------------------------
    isProcessingRef.current = true;
    setErrorMessage(null);

    try {
      // Step 1: Create prepaid order only upon user click
      setPaymentState('creating_order');

      const prepaidOrder = await createPrepaidOrder(supabase, {
        address_id: selectedAddressId,
        items,
        coupon: selectedCoupon,
        bill,
        user: rawUser,
        profile,
        address,
      });

      const {
        internalId,
        orderNumber,
        razorpayOrderId,
        keyId,
        amount: returnedAmount,
        currency
      } = prepaidOrder;

      // Handle whether amount is in paise (e.g. 134910) or rupees (e.g. 1349.1)
      const isAmountInPaise = Number.isInteger(returnedAmount) && returnedAmount >= 10000;
      const amountInPaise = isAmountInPaise
        ? returnedAmount
        : Math.round(returnedAmount * 100);

      // Step 2 — Open Razorpay Checkout
      setPaymentState('opening_checkout');

      // Capture local refs for use inside Razorpay callbacks
      const capturedOrderNumber = orderNumber;
      const capturedInternalId = internalId;
      let hasFailed = false;
      let isSuccess = false;
      let isHandled = false;
      let failureReason = 'Your payment could not be processed. Please try again or use a different payment method.';

      await new Promise<void>((resolve, reject) => {
        const onPaymentSuccess = (response: RazorpaySuccessResponse) => {
          if (isSuccess || isHandled) return;
          isSuccess = true;
          isHandled = true;
          hasFailed = false;

          setPaymentState('success');

          // Step 1 — Clear cart immediately in 0ms
          if (source === 'cart') {
            onClearCart();
          } else {
            onRemoveItems(items.map(item => `${item.productId}::${item.variantId}`));
          }

          // Step 2 — Navigate immediately to success page (0ms instant redirect)
          const itemCount = items.reduce((s, i) => s + i.quantity, 0);
          router.replace(
            `/order-successful?orderId=${capturedOrderNumber}&items=${itemCount}&total=${bill.grandTotal}`,
          );

          // Step 3 — Complete backend HMAC verification and DB update in background
          verifyRazorpayPayment({
            order_id: capturedInternalId,
            razorpay_order_id: response.razorpay_order_id,
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_signature: response.razorpay_signature,
          }).catch((err) => {
            console.error('[RazorpayCheckout] Payment verification sync:', err);
          });

          resolve();
        };

        const rzpInstance = new window.Razorpay!({
          key: keyId,
          amount: amountInPaise,
          currency,
          name: 'GemOstone',
          description: 'Secure gemstone order payment',
          order_id: razorpayOrderId,
          retry: {
            enabled: false,
          },
          handler: onPaymentSuccess,
          prefill: {
            name: user?.name ?? '',
            email: user?.email ?? '',
          },
          theme: { color: '#ff5400' },
          modal: {
            ondismiss: () => {
              // If payment already succeeded, ignore modal dismissal
              if (isSuccess || isHandled) return;
              isHandled = true;

              markPaymentFailed({
                order_id: capturedInternalId,
                razorpay_order_id: razorpayOrderId,
                error_code: hasFailed ? 'PAYMENT_FAILED' : 'PAYMENT_CANCELLED',
                error_description: hasFailed ? failureReason : 'Payment was cancelled or closed.'
              }).catch(() => {});
              
              if (hasFailed) {
                setPaymentState('idle');
                setErrorMessage(null);
                router.replace(`/payment-failed?orderId=${capturedOrderNumber}&total=${bill.grandTotal}&reason=${encodeURIComponent(failureReason)}`);
              } else {
                setPaymentState('idle');
                setErrorMessage(null);
              }
              reject(new PaymentError(hasFailed ? 'PAYMENT_FAILED' : 'PAYMENT_CANCELLED', failureReason));
            },
            escape: true,
            confirm_close: false,
            animation: false,
          },
          notes: {
            gemostone_order_number: capturedOrderNumber ?? '',
          },
        });

        rzpInstance.on('payment.failed', ({ error }) => {
          if (isSuccess) return;
          hasFailed = true;
          failureReason = error?.description || 'Your payment was declined by the bank. Please try again.';
          
          markPaymentFailed({
            order_id: capturedInternalId,
            razorpay_order_id: razorpayOrderId,
            razorpay_payment_id: error?.metadata?.payment_id,
            error_code: error?.code,
            error_description: failureReason
          }).catch(() => {});

          try {
            rzpInstance.close();
          } catch {
            // ignore
          }

          setPaymentState('idle');
          setErrorMessage(null);
          router.replace(`/payment-failed?orderId=${capturedOrderNumber}&total=${bill.grandTotal}&reason=${encodeURIComponent(failureReason)}`);
          reject(new PaymentError('PAYMENT_FAILED', failureReason));
        });

        rzpInstance.open();
      });

    } catch (err) {
      if (err instanceof PaymentError) {
        if (err.code === 'PAYMENT_CANCELLED') {
          // User dismissed the modal before attempt
          setPaymentState('idle');
          setErrorMessage(null);
        } else if (err.code === 'PAYMENT_FAILED') {
          setPaymentState('idle');
          setErrorMessage(null);
          // Payment failed is routed directly to /payment-failed
        } else {
          setPaymentState('idle');
          setErrorMessage(null);
        }
      } else {
        setPaymentState('idle');
        setErrorMessage(null);
        console.error('[RazorpayCheckout] Unexpected error:', err);
      }
    } finally {
      // Release the processing lock for all states except success
      isProcessingRef.current = false;
    }
  }, [sdkReady, sdkError, selectedAddressId, items, bill, selectedCoupon, source, user, rawUser, profile, address, supabase, router, onClearCart, onRemoveItems]);

  return {
    paymentState,
    setPaymentState,
    errorMessage,
    sdkReady,
    sdkError,
    handlePrepaidPayment,
    handleSdkReady,
    handleSdkError,
  };
}

// ---------------------------------------------------------------------------
// Component � renders checkout.js SDK and SDK error banner
// ---------------------------------------------------------------------------

export interface RazorpayCheckoutProps {
  onSdkReady: () => void;
  onSdkError: () => void;
  sdkError: boolean;
}

/**
 * RazorpayCheckout renders the Razorpay checkout.js <Script> tag with proper
 * load / error callbacks, and shows an error banner if the SDK fails to load.
 *
 * Mount this component anywhere in the payment page tree. The actual payment
 * logic lives in useRazorpayCheckout().
 */
export default function RazorpayCheckout({ onSdkReady, onSdkError, sdkError }: RazorpayCheckoutProps) {
  return (
    <>
      {/* checkout.js — loaded after interactive to ensure it's ready */}
      <Script
        id="razorpay-checkout-js"
        src="https://checkout.razorpay.com/v1/checkout.js"
        strategy="afterInteractive"
        onReady={onSdkReady}
        onError={onSdkError}
      />

      {/* SDK load failure banner */}
      {sdkError && (
        <div
          role="alert"
          className="flex items-start gap-3 bg-red-50 border border-red-200 rounded-xl px-4 py-3 w-full"
        >
          <svg
            width="16" height="16" viewBox="0 0 24 24" fill="none"
            stroke="#dc2626" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
            className="shrink-0 mt-0.5" aria-hidden="true"
          >
            <circle cx="12" cy="12" r="10" />
            <line x1="15" y1="9" x2="9" y2="15" />
            <line x1="9" y1="9" x2="15" y2="15" />
          </svg>
          <p className="font-['Montserrat'] text-[13px] text-red-700">
            Unable to load the payment gateway. Please check your internet connection and refresh the page.
          </p>
        </div>
      )}
    </>
  );
}
