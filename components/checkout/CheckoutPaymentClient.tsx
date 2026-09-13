/**
 * CheckoutPaymentClient — payment method selection and payment initiation.
 *
 * Matches Figma design (node 543-51) with exact card styling, secure payment note,
 * and sticky bottom bar with total amount and pay CTA.
 */
'use client';

import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import BackButton from '@/components/ui/buttons/BackButton';
import Button from '@/components/ui/buttons/Button';
import { useCheckoutStore } from '@/store/checkout.store';
import { useCartStore } from '@/store/cart.store';
import { calculateCouponDiscount, createCodOrder } from '@/services/checkout.service';
import { useAuth } from '@/hooks/useAuth';
import { createSupabaseBrowserClient } from '@/services/supabase/client';
import type { BillBreakdown } from '@/types/checkout.types';
import RazorpayCheckout, { useRazorpayCheckout } from '@/components/payment/RazorpayCheckout';
import PaymentStatusBanner, { getPayButtonLabel, isBusy } from '@/components/payment/PaymentStatus';
import { isSyntheticEmail } from '@/lib/validators';
import { toast } from '@/lib/toast';

type PaymentMethod = 'prepaid' | 'cod';
const PREPAID_METHODS: PaymentMethod[] = ['prepaid'];

export default function CheckoutPaymentClient() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // -- Checkout store ---------------------------------------------------------
  const source = useCheckoutStore((s) => s.source);
  const items = useCheckoutStore((s) => s.items);
  const selectedAddressId = useCheckoutStore((s) => s.selectedAddressId);
  const selectedCoupon = useCheckoutStore((s) => s.selectedCoupon);

  // -- Cart store -------------------------------------------------------------
  const clearCart = useCartStore((s) => s.clearCart);
  const removeItem = useCartStore((s) => s.removeItem);

  // -- Auth -------------------------------------------------------------------
  const { user, profile, addresses, isAuthenticated, loading: authLoading } = useAuth();
  const supabase = useMemo(() => createSupabaseBrowserClient(), []);

  // -- UI State ---------------------------------------------------------------
  const [mounted, setMounted] = useState(false);
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod>('prepaid');
  const [isCodProcessing, setIsCodProcessing] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Redirect if user is not logged in
  useEffect(() => {
    if (mounted && !authLoading && !isAuthenticated) {
      toast.info('Login Required 🔒', 'Please log in to complete your purchase.');
      router.replace('/login?redirectTo=/checkout/payment');
    }
  }, [mounted, authLoading, isAuthenticated, router]);

  // Redirect if checkout session is empty
  useEffect(() => {
    if (mounted && (!source || items.length === 0 || !selectedAddressId)) {
      router.replace('/cart');
    }
  }, [mounted, source, items.length, selectedAddressId, router]);

  const calculationData = useCheckoutStore((s) => s.calculationData);

  // -- Authoritative Bill calculation directly from Backend API (0ms) ---------
  const baseBill = useMemo<BillBreakdown>(() => {
    const isServerCalcSynced = Boolean(
      calculationData &&
      (calculationData.coupon_applied?.code || null) === (selectedCoupon?.code || null)
    );

    if (isServerCalcSynced && calculationData) {
      const productDiscount = Math.max(0, (calculationData.total_savings || 0) - (calculationData.discount_amount || 0));
      return {
        subtotal: calculationData.subtotal + productDiscount,
        productDiscount,
        couponDiscount: calculationData.discount_amount || 0,
        deliveryCharges: calculationData.shipping_amount || 0,
        taxes: calculationData.tax_amount || 0,
        grandTotal: calculationData.total,
      };
    }

    const rawSubtotal = items.reduce(
      (sum, item) => sum + (item.compareAtPrice ?? item.price) * item.quantity,
      0,
    );
    const productDiscount = items.reduce((sum, item) => {
      if (item.compareAtPrice && item.compareAtPrice > item.price) {
        return sum + (item.compareAtPrice - item.price) * item.quantity;
      }
      return sum;
    }, 0);
    const afterProductDiscount = rawSubtotal - productDiscount;
    const couponDiscount = calculateCouponDiscount(selectedCoupon, afterProductDiscount);
    const isFreeDelivery = Boolean(
      selectedCoupon?.isFreeShipping ||
      selectedCoupon?.discountType === "free_shipping" ||
      afterProductDiscount >= 999
    );
    const deliveryCharges = isFreeDelivery ? 0 : 99;
    const taxableAmount = Math.max(0, afterProductDiscount - couponDiscount);
    const taxes = 0;
    const grandTotal = Math.max(0, taxableAmount + deliveryCharges + taxes);

    return {
      subtotal: rawSubtotal,
      productDiscount,
      couponDiscount,
      deliveryCharges,
      taxes,
      grandTotal,
    };
  }, [calculationData, items, selectedCoupon]);

  const prepaidBill = baseBill;

  // COD extra charge disabled (commented out for now)
  // const displayedGrandTotal = selectedMethod === 'cod' ? baseBill.grandTotal + 50 : baseBill.grandTotal;
  const displayedGrandTotal = baseBill.grandTotal;

  // -- Cart manipulation callbacks --------------------------------------------
  const handleClearCart = useCallback(() => {
    if (source === 'cart') {
      clearCart();
    }
  }, [source, clearCart]);

  const handleRemoveItems = useCallback((keys: string[]) => {
    keys.forEach(key => removeItem(key));
  }, [removeItem]);

  const selectedAddress = useMemo(
    () => addresses.find((a) => a.id === selectedAddressId) ?? null,
    [addresses, selectedAddressId]
  );

  // -- Razorpay hook ----------------------------------------------------------
  const {
    paymentState,
    errorMessage,
    sdkReady,
    sdkError,
    handlePrepaidPayment,
    handleSdkReady,
    handleSdkError,
  } = useRazorpayCheckout({
    supabase,
    items,
    selectedAddressId,
    selectedCoupon,
    bill: prepaidBill,
    source: source as 'cart' | 'buy-now',
    user: user
      ? {
          name: user.user_metadata?.full_name ?? '',
          email:
            profile?.email && !isSyntheticEmail(profile.email)
              ? profile.email
              : '',
        }
      : null,
    rawUser: user,
    profile,
    address: selectedAddress,
    onClearCart: handleClearCart,
    onRemoveItems: handleRemoveItems,
  });

  // Prefetch order-successful for 0ms navigation
  useEffect(() => {
    router.prefetch('/order-successful');
  }, [router]);

  const isPrepaid = PREPAID_METHODS.includes(selectedMethod);
  const isAnythingBusy = isCodProcessing || (isPrepaid && isBusy(paymentState));

  // -- COD handler ------------------------------------------------------------
  const handleCodPayment = useCallback(async () => {
    if (isCodProcessing) return;
    setIsCodProcessing(true);

    // COD extra charge disabled (commented out for now)
    // const codBill = { ...baseBill, grandTotal: baseBill.grandTotal + 50 };
    const codBill = baseBill;

    try {
      const result = await createCodOrder(supabase, {
        address_id: selectedAddressId as string,
        items,
        coupon: selectedCoupon,
        bill: codBill,
        user,
        profile,
        address: selectedAddress,
      });

      if (source === 'cart') {
        clearCart();
      } else {
        items.forEach(item => removeItem(`${item.productId}::${item.variantId}`));
      }

      const itemCount = items.reduce((s, i) => s + i.quantity, 0);
      router.replace(`/order-successful?orderId=${result.orderId}&items=${itemCount}&total=${codBill.grandTotal}`);
    } catch (err: any) {
      console.error('[CheckoutPaymentClient] COD order error:', err);
      toast.error('Order Placement Failed', err?.message || 'Please try again.');
      setIsCodProcessing(false);
    }
  }, [isCodProcessing, baseBill, supabase, selectedAddressId, items, selectedCoupon, user, profile, selectedAddress, source, clearCart, removeItem]);

  // -- Unified Pay handler ----------------------------------------------------
  const handlePay = useCallback(() => {
    if (selectedMethod === 'cod') {
      handleCodPayment();
    } else {
      handlePrepaidPayment();
    }
  }, [selectedMethod, handleCodPayment, handlePrepaidPayment]);
  const payButtonLabel = isPrepaid
    ? getPayButtonLabel(paymentState, displayedGrandTotal)
    : isCodProcessing
      ? 'Placing order...'
      : `Pay ₹${displayedGrandTotal.toLocaleString('en-IN')}`;

  if (!mounted || authLoading) {
    return (
      <div className="min-h-screen bg-[#fbf9f5] flex flex-col items-center justify-between w-full">
        <div className="w-full max-w-xl mx-auto flex flex-col flex-1 pb-[100px] md:pb-6">
          <header className="flex h-[56px] md:h-[64px] items-center justify-between px-4 border-b border-border-strong bg-white shrink-0">
            <div className="flex items-center gap-3">
              <div className="size-8 rounded-full animate-shimmer" />
              <div className="h-5 w-28 rounded animate-shimmer" />
            </div>
          </header>
          <div className="p-4 flex flex-col gap-4">
            <div className="h-20 w-full rounded-[16px] bg-white border border-[#e5e0da] p-4 animate-shimmer" />
            <div className="h-32 w-full rounded-[16px] bg-white border border-[#e5e0da] p-4 animate-shimmer" />
            <div className="h-44 w-full rounded-[16px] bg-white border border-[#e5e0da] p-4 animate-shimmer" />
          </div>
        </div>
      </div>
    );
  }
  if (!isAuthenticated) return null;
  if (!source || items.length === 0 || !selectedAddressId) return null;

  return (
    <div className="min-h-screen bg-surface-subtle flex flex-col items-center justify-between w-full -mb-16 lg:-mb-10">
      <RazorpayCheckout
        onSdkReady={handleSdkReady}
        onSdkError={handleSdkError}
        sdkError={sdkError}
      />

      <div className="w-full max-w-xl mx-auto flex flex-col flex-1 pb-[100px] md:pb-6 bg-surface-subtle">
        {/* Header - Pure White */}
        <header className="flex h-[56px] md:h-[64px] items-center justify-between px-4 border-b border-border-strong bg-white shrink-0">
          <div className="flex items-center gap-3">
            <BackButton href="/checkout" className="size-[28px] md:size-[36px] shrink-0" />
            <h1 className="font-bold text-[18px] md:text-[20px] text-text-primary">
              Payment
            </h1>
          </div>
          <div className="flex items-center justify-center size-[32px] rounded-full border border-border-strong bg-white">
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#211e1a"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            </svg>
          </div>
        </header>

        {/* Content - Warm subtle bg */}
        <div className="flex flex-col gap-4 px-4 pt-5 pb-6">
          <h2 className="font-semibold text-[13px] md:text-[14px] text-text-primary">
            Select payment method
          </h2>

          {/* Option 1: Prepaid */}
          <button
            id="payment-method-prepaid"
            type="button"
            className={`w-full bg-white rounded-[14px] p-4 flex items-center justify-between cursor-pointer transition-colors text-left shadow-2xs border-2 ${
              selectedMethod === 'prepaid'
                ? 'border-[#ff5400]'
                : 'border-[#e5e0da] hover:border-gray-300'
            }`}
            onClick={() => setSelectedMethod('prepaid')}
            disabled={isAnythingBusy}
          >
            <div className="flex items-center gap-3.5">
              <div className="size-[36px] rounded-full bg-surface-neutral flex items-center justify-center shrink-0">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <rect x="6.5" y="2.5" width="11" height="19" rx="2.5" stroke="#ff5400" strokeWidth="1.8" />
                  <circle cx="12" cy="17.5" r="1" fill="#ff5400" />
                </svg>
              </div>
              <div className="flex flex-col">
                <p className="font-semibold text-[13px] md:text-[14px] text-text-primary leading-tight">
                  Prepaid
                </p>
                <p className="text-[11px] md:text-[12px] text-text-muted leading-tight mt-0.5">
                  UPI, Cards, Net Banking
                </p>
              </div>
            </div>

            <div
              className={`size-[18px] rounded-full border-2 flex items-center justify-center transition-colors ${
                selectedMethod === 'prepaid'
                  ? 'border-[#ff5400] bg-[#ff5400]'
                  : 'border-[#e5e0da] bg-white'
              }`}
            >
              {selectedMethod === 'prepaid' && (
                <div className="size-[6px] rounded-full bg-white" />
              )}
            </div>
          </button>

          {/* Option 2: Cash on Delivery */}
          <button
            id="payment-method-cod"
            type="button"
            className={`w-full bg-white rounded-[14px] p-4 flex items-center justify-between cursor-pointer transition-colors text-left shadow-2xs border-2 ${
              selectedMethod === 'cod'
                ? 'border-[#ff5400]'
                : 'border-[#e5e0da] hover:border-gray-300'
            }`}
            onClick={() => setSelectedMethod('cod')}
            disabled={isAnythingBusy}
          >
            <div className="flex items-center gap-3.5">
              <div className="size-[36px] rounded-full bg-surface-neutral flex items-center justify-center text-[#6b6459] shrink-0">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                  <rect x="1" y="3" width="15" height="13" />
                  <polygon points="16 8 20 8 23 11 23 16 16 16 16 8" />
                  <circle cx="5.5" cy="18.5" r="2.5" />
                  <circle cx="18.5" cy="18.5" r="2.5" />
                </svg>
              </div>
              <div className="flex flex-col">
                <p className="font-semibold text-[13px] md:text-[14px] text-text-primary leading-tight">
                  Cash on Delivery
                </p>
                {/* <p className="text-[11px] md:text-[12px] text-text-muted leading-tight mt-0.5">
                  ₹50 extra charge
                </p> */}
                <p className="text-[11px] md:text-[12px] text-text-muted leading-tight mt-0.5">
                  Pay with cash upon delivery
                </p>
              </div>
            </div>

            <div
              className={`size-[18px] rounded-full border-2 flex items-center justify-center transition-colors ${
                selectedMethod === 'cod'
                  ? 'border-[#ff5400] bg-[#ff5400]'
                  : 'border-[#e5e0da] bg-white'
              }`}
            >
              {selectedMethod === 'cod' && (
                <div className="size-[6px] rounded-full bg-white" />
              )}
            </div>
          </button>

          {/* Secure note */}
          <p className="text-[12px] text-text-muted">
            You&apos;ll be redirected to a secure payment page
          </p>

          {/* Divider */}
          <div className="h-px bg-border-strong w-full my-1" />

          {/* Order Total Row */}
          <div className="flex items-center justify-between text-[14px] md:text-[15px]">
            <span className="text-text-secondary">Order Total</span>
            <span className="font-bold text-text-primary text-[15px]">
              ₹{displayedGrandTotal.toLocaleString('en-IN')}
            </span>
          </div>

          {/* Status banner */}
          {isPrepaid && (
            <PaymentStatusBanner state={paymentState} errorMessage={errorMessage} />
          )}
        </div>
      </div>

      {/* Sticky Bottom Bar */}
      <footer className="fixed md:sticky bottom-0 left-0 right-0 z-40 bg-white border-t border-border-strong px-4 pt-3.5 pb-[max(0.875rem,env(safe-area-inset-bottom))] shadow-sm">
        <div className="max-w-xl mx-auto w-full flex items-center justify-between">
          <div className="flex flex-col">
            <span className="text-[11px] text-text-muted leading-none mb-1">
              Total amount
            </span>
            <span className="text-[16px] font-bold text-text-primary leading-none">
              ₹{displayedGrandTotal.toLocaleString('en-IN')}
            </span>
          </div>

          <Button
            id="pay-button"
            variant="filled"
            size="lg"
            onClick={handlePay}
            disabled={isAnythingBusy}
            aria-busy={isAnythingBusy}
            className="h-[46px] md:h-[50px] px-8 rounded-full font-bold text-[14px] md:text-[15px] bg-primary-orange hover:bg-primary-orange-hover text-white shadow-sm transition-all"
          >
            {payButtonLabel}
          </Button>
        </div>
      </footer>
    </div>
  );
}
