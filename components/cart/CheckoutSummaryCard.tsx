'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useCartStore } from '@/store/cart.store';
import { useCheckoutStore } from '@/store/checkout.store';
import Button from '@/components/ui/buttons/Button';

interface CheckoutSummaryCardProps {
  isBuyNow?: boolean;
  couponDiscount?: number;
}

/**
 * Cart-side price breakdown (subtotal/shipping/discount/total) plus the
 * "Proceed to checkout" CTA. Not to be confused with
 * components/orders/OrderSummaryCard, which summarizes an already-placed
 * order's status and line items — the two were both named "OrderSummaryCard"
 * in different folders despite doing unrelated jobs.
 */
export default function CheckoutSummaryCard({ isBuyNow, couponDiscount = 0 }: CheckoutSummaryCardProps) {
  const [mounted, setMounted] = useState(false);
  const cartSubtotal = useCartStore((state) => state.cartSubtotal);
  const cartItems = useCartStore((state) => state.items);
  const checkoutItems = useCheckoutStore((state) => state.items);
  const startCartCheckout = useCheckoutStore((state) => state.startCartCheckout);
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const timer = window.setTimeout(() => setMounted(true), 0);
    return () => window.clearTimeout(timer);
  }, []);

  const subtotal = mounted 
    ? (isBuyNow ? checkoutItems.reduce((acc, item) => acc + (item.price * item.quantity), 0) : cartSubtotal())
    : 0;

  const discount = couponDiscount;
  const total = subtotal - discount;

  if (!mounted) return null;

  return (
    <div className="flex flex-col gap-[16px] w-full">
      {/* Top Border / Separator if needed, but CouponSection is separate now. */}

      <div className="bg-surface-neutral content-stretch flex gap-[10px] items-center p-[12px] relative rounded-[12px] shrink-0 w-full mt-2">
        <div className="relative shrink-0 size-[18px] flex items-center justify-center">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M22 12c0 5.52-4.48 10-10 10S2 17.52 2 12 6.48 2 12 2s10 4.48 10 10z" stroke="#6b6459" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"></path>
            <path d="M12 8v5" stroke="#6b6459" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"></path>
            <path d="M9 2h6" stroke="#6b6459" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"></path>
          </svg>
        </div>
        <p className="flex-[1_0_0] font-medium leading-[18px] min-w-px relative text-[13px] text-text-secondary">
          Free delivery by Aug 5-7
        </p>
      </div>

      <div className="bg-[#f0ebe4] h-px relative shrink-0 w-full my-[4px]" />

      {/* Summary Lines */}
      <div className="flex flex-col gap-[8px] items-start relative shrink-0 w-full whitespace-nowrap">
        <div className="flex font-normal items-start justify-between leading-[20px] relative shrink-0 text-[14px] w-full">
          <p className="relative shrink-0 text-text-secondary">Subtotal</p>
          <p className="relative shrink-0 text-text-primary">₹{subtotal.toLocaleString('en-IN')}</p>
        </div>
        <div className="flex font-normal items-start justify-between leading-[20px] relative shrink-0 text-[14px] w-full">
          <p className="relative shrink-0 text-text-secondary">Shipping</p>
          <p className="relative shrink-0 text-text-primary">Free</p>
        </div>
        {discount > 0 && (
          <div className="flex font-normal items-start justify-between leading-[20px] relative shrink-0 text-[14px] w-full">
            <p className="relative shrink-0 text-text-secondary">Discount</p>
            <p className="relative shrink-0 text-[#328d4b]">-₹{discount.toLocaleString('en-IN')}</p>
          </div>
        )}
        <div className="flex items-start justify-between relative shrink-0 w-full mt-2">
          <p className="font-semibold leading-[20px] relative shrink-0 text-[14px] text-text-primary">Total</p>
          <p className="font-bold leading-[24px] relative shrink-0 text-[16px] text-primary-orange">
            ₹{total.toLocaleString('en-IN')}
          </p>
        </div>
      </div>

      {/* Checkout Section (Fixed at bottom on mobile, inline on desktop) */}
      <div
        className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-border-strong px-4 pt-3 shadow-[0_-4px_16px_rgba(0,0,0,0.06)] md:static md:p-0 md:bg-transparent md:border-0 md:shadow-none md:mt-4"
        style={{ paddingBottom: 'calc(12px + env(safe-area-inset-bottom, 0px))' }}
      >
        <div className="w-full max-w-md mx-auto md:max-w-none flex flex-col gap-[6px]">
          {/* TODO: Wire to order creation RPC when built */}
          <Button
            variant="filled"
            size="lg"
            onClick={() => {
              if (!isBuyNow) {
                const checkoutMappedItems = cartItems.map((item) => ({
                  productId: item.productId,
                  variantId: item.variantId,
                  title: item.title,
                  price: item.price,
                  compareAtPrice: item.compareAtPrice,
                  imageUrl: item.imageUrl,
                  variantLabel: item.variantLabel,
                  quantity: item.quantity,
                }));
                
                // We capture current state before it gets reset by startCartCheckout
                const { selectedAddressId, selectedCoupon, setSelectedAddress, setCoupon } = useCheckoutStore.getState();
                
                startCartCheckout(checkoutMappedItems);
                
                // Restore selected address and coupon so they aren't lost
                if (selectedAddressId) setSelectedAddress(selectedAddressId);
                if (selectedCoupon) setCoupon(selectedCoupon);

                router.push('/checkout');
              } else {
                const params = new URLSearchParams(searchParams.toString());
                if (checkoutItems[0]?.quantity) {
                  params.set('qty', String(checkoutItems[0].quantity));
                }
                const queryString = params.toString();
                router.push(queryString ? `/checkout?${queryString}` : '/checkout');
              }
            }}
            className="h-[50px] w-full text-[16px] font-semibold"
          >
            Proceed to checkout
          </Button>
          <p className="font-normal leading-[16px] text-[12px] text-text-muted text-center w-full">
            Cash on Delivery available
          </p>
        </div>
      </div>
    </div>
  );
}
