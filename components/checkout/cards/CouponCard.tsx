'use client';

import type { Coupon } from '@/types/checkout.types';

interface CouponCardProps {
  coupon: Coupon;
  onApply: (coupon: Coupon) => void;
  isApplied: boolean;
  subtotal: number;
}

/**
 * Individual coupon display card in the coupon sheet.
 * Shows coupon code, description, discount info, min order, and an Apply/Applied button.
 */
export default function CouponCard({
  coupon,
  onApply,
  isApplied,
  subtotal,
}: CouponCardProps) {
  const isBelowMinOrder =
    coupon.minOrderAmount !== null && subtotal < coupon.minOrderAmount;

  const discountLabel =
    coupon.discountType === 'percentage'
      ? `${coupon.discountValue}% OFF${
          coupon.maxDiscountAmount ? ` (up to ₹${coupon.maxDiscountAmount.toLocaleString('en-IN')})` : ''
        }`
      : `₹${coupon.discountValue.toLocaleString('en-IN')} OFF`;

  return (
    <div
      className={`border rounded-[12px] p-[14px] transition-all ${
        isApplied
          ? 'border-primary-orange bg-[#fff8f5]  -[#ff5400]/20'
          : 'border-border-strong bg-white'
      }`}
    >
      {/* Code + Apply Row */}
      <div className="flex items-center justify-between mb-[8px]">
        <div className="flex items-center gap-[8px]">
          {/* Coupon icon */}
          <div className="bg-surface-neutral rounded-[8px] p-[6px] shrink-0">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M19.5 12.5c0-1.46.97-2.73 2.36-3.12.36-.1.64-.42.64-.8V7c0-.55-.45-1-1-1H2.5c-.55 0-1 .45-1 1v1.58c0 .38.28.7.64.8 1.39.39 2.36 1.66 2.36 3.12s-.97 2.73-2.36 3.12c-.36.1-.64.42-.64.8V18c0 .55.45 1 1 1h19c.55 0 1-.45 1-1v-1.58c0-.38-.28-.7-.64-.8-1.39-.39-2.36-1.66-2.36-3.12z" stroke="#ff5400" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M10 7l-1 10M15 7l-1 10" stroke="#ff5400" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" opacity="0.4" />
            </svg>
          </div>

          {/* Coupon code */}
          <span className="font-['Montserrat'] font-bold text-[14px] text-text-primary tracking-wide uppercase">
            {coupon.code}
          </span>
        </div>

        {/* Apply button */}
        <button
          type="button"
          onClick={() => onApply(coupon)}
          disabled={isBelowMinOrder}
          className={`font-['Montserrat'] font-semibold text-[13px] px-[14px] py-[6px] rounded-[999px] transition-colors cursor-pointer disabled:cursor-not-allowed ${
            isApplied
              ? 'bg-primary-orange text-white'
              : isBelowMinOrder
              ? 'bg-surface-neutral text-text-muted'
              : 'bg-[#fff0e6] text-primary-orange hover:bg-[#ffe0cc]'
          }`}
        >
          {isApplied ? 'Applied ✓' : 'Apply'}
        </button>
      </div>

      {/* Discount label */}
      <p className="font-['Montserrat'] font-semibold text-[13px] text-primary-orange mb-[4px]">
        {discountLabel}
      </p>

      {/* Description */}
      {coupon.description && (
        <p className="font-['Montserrat'] text-[12px] text-text-secondary leading-[18px]">
          {coupon.description}
        </p>
      )}

      {/* Min order warning */}
      {isBelowMinOrder && coupon.minOrderAmount && (
        <p className="font-['Montserrat'] text-[11px] text-[#e04d00] mt-[6px]">
          Min. order: ₹{coupon.minOrderAmount.toLocaleString('en-IN')}
        </p>
      )}
    </div>
  );
}
