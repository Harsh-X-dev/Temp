'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useMemo, useCallback, useState } from 'react';
import BackButton from '@/components/ui/buttons/BackButton';
import { useCheckoutStore } from '@/store/checkout.store';
import { useCartStore } from '@/store/cart.store';
import { useAuth } from '@/hooks/useAuth';
import { createSupabaseBrowserClient } from '@/services/supabase/client';
import RazorpayCheckout, { useRazorpayCheckout } from '@/components/payment/RazorpayCheckout';
import { calculateCouponDiscount } from '@/services/checkout.service';
import type { BillBreakdown } from '@/types/checkout.types';
import { isBusy } from '@/components/payment/PaymentStatus';

/**
 * PaymentFailedClient — Matches Figma node 1304-15600.
 * Displays when a transaction fails or is declined by the gateway.
 * Directly integrates RazorpayCheckout to relaunch the payment gateway
 * in 0ms instant speed when clicking "Try Again".
 */
export default function PaymentFailedClient() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // -- Checkout store ---------------------------------------------------------
  const source = useCheckoutStore((s) => s.source);
  const items = useCheckoutStore((s) => s.items);
  const selectedAddressId = useCheckoutStore((s) => s.selectedAddressId);
  const selectedCoupon = useCheckoutStore((s) => s.selectedCoupon);
  const calculationData = useCheckoutStore((s) => s.calculationData);

  // -- Cart store -------------------------------------------------------------
  const clearCart = useCartStore((s) => s.clearCart);
  const removeItem = useCartStore((s) => s.removeItem);

  // -- Auth -------------------------------------------------------------------
  const { user, profile, addresses } = useAuth();
  const supabase = useMemo(() => createSupabaseBrowserClient(), []);

  // Prefetch routes
  useEffect(() => {
    router.prefetch('/checkout/payment');
    router.prefetch('/order-successful');
  }, [router]);

  // -- Authoritative Bill Calculation -----------------------------------------
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
    const deliveryCharges = calculationData?.shipping_amount || 0;
    const taxableAmount = Math.max(0, afterProductDiscount - couponDiscount);
    const taxes = calculationData?.tax_amount || 0;
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

  // -- Razorpay Hook (Pre-warmed in background while on this screen) -----------
  const {
    paymentState,
    sdkError,
    handlePrepaidPayment,
    handleSdkReady,
    handleSdkError,
  } = useRazorpayCheckout({
    supabase,
    items,
    selectedAddressId,
    selectedCoupon,
    bill: baseBill,
    source: (source || 'cart') as 'cart' | 'buy-now',
    user: user ? { name: user.user_metadata?.full_name ?? '', email: user.email ?? '' } : null,
    rawUser: user,
    profile,
    address: selectedAddress,
    onClearCart: handleClearCart,
    onRemoveItems: handleRemoveItems,
  });

  const isRetrying = isBusy(paymentState);

  const handleTryAgain = useCallback(() => {
    if (items.length > 0 && selectedAddressId) {
      handlePrepaidPayment();
    } else {
      router.push('/checkout/payment');
    }
  }, [items.length, selectedAddressId, handlePrepaidPayment, router]);

  const total = searchParams.get('total')
    ? parseFloat(searchParams.get('total') as string).toLocaleString('en-IN')
    : baseBill.grandTotal > 0
      ? baseBill.grandTotal.toLocaleString('en-IN')
      : '1,349.10';

  const reason = searchParams.get('reason') || 'Your payment could not be processed. Please try again or use a different payment method.';

  return (
    <div className="bg-[#fbf9f5] min-h-screen flex flex-col items-center justify-between w-full font-['Montserrat']">
      <RazorpayCheckout
        onSdkReady={handleSdkReady}
        onSdkError={handleSdkError}
        sdkError={sdkError}
      />

      <div className="w-full max-w-full md:max-w-[480px] mx-auto min-h-screen flex flex-col justify-between bg-[#fbf9f5] relative md:border-x md:border-[#e5e0da] shadow-sm pb-[24px]">
        {/* Top Header */}
        <header className="sticky top-0 z-30 bg-white border-b border-[#e5e0da] px-[16px] py-[12px] flex items-center justify-between w-full">
          <div className="flex items-center gap-[12px]">
            <BackButton href="/checkout/payment" />
            <h1 className="font-bold text-[16px] text-[#211e1a]">Payment</h1>
          </div>
        </header>

        {/* Main Content Card */}
        <main className="flex flex-col items-center justify-center px-[24px] py-[40px] flex-1 w-full text-center">
          {/* Exclamation Error Icon matching Figma */}
          <div className="bg-[#ff5400] relative rounded-full size-[72px] flex items-center justify-center shadow-md mb-[24px]">
            <svg
              width="36"
              height="36"
              viewBox="0 0 24 24"
              fill="none"
              stroke="white"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
          </div>

          <h2 className="font-bold text-[22px] leading-[28px] text-[#211e1a] mb-[8px]">
            Payment Failed
          </h2>

          <p className="font-normal text-[13px] leading-[20px] text-[#6b6459] max-w-[320px] mb-[28px]">
            {reason}
          </p>

          {/* Order Amount Card matching Figma */}
          <div className="bg-white border border-[#e5e0da] rounded-[16px] p-[16px] px-[20px] flex items-center justify-between w-full max-w-[360px] shadow-xs mb-[32px]">
            <span className="font-normal text-[14px] text-[#6b6459]">
              Order Amount
            </span>
            <span className="font-bold text-[16px] text-[#211e1a]">
              ₹{total}
            </span>
          </div>

          {/* Action Buttons matching Figma */}
          <div className="flex flex-col gap-[12px] w-full max-w-[360px]">
            <button
              type="button"
              disabled={isRetrying}
              onClick={handleTryAgain}
              className="bg-[#ff5400] hover:bg-[#e04a00] active:scale-[0.99] disabled:opacity-70 text-white font-semibold text-[15px] h-[50px] rounded-full w-full flex items-center justify-center transition-all cursor-pointer shadow-xs gap-2"
            >
              {isRetrying && (
                <svg className="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                </svg>
              )}
              {isRetrying ? 'Opening Gateway...' : 'Try Again'}
            </button>

            <button
              type="button"
              onClick={() => router.push('/checkout/payment')}
              className="bg-transparent hover:bg-[#fff5ee] active:scale-[0.99] border border-[#ff5400] text-[#ff5400] font-semibold text-[15px] h-[50px] rounded-full w-full flex items-center justify-center transition-all cursor-pointer"
            >
              Change Payment Method
            </button>
          </div>
        </main>
      </div>
    </div>
  );
}

