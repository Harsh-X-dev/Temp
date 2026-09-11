'use client';

import type { Coupon } from '@/types/checkout.types';

interface CouponSectionProps {
  selectedCoupon: Coupon | null;
  couponDiscount: number;
  onViewOffers: () => void;
  onRemoveCoupon: () => void;
}

export default function CouponSection({
  selectedCoupon,
  couponDiscount,
  onViewOffers,
  onRemoveCoupon,
}: CouponSectionProps) {
  if (selectedCoupon) {
    return (
      <div className="bg-white border border-[#e5e0da] rounded-[12px] p-[16px] flex items-center justify-between w-full font-['Montserrat']">
        {/* Left icon + text matching Figma node 544:140 */}
        <div className="flex gap-[10px] items-center">
          <div className="bg-[#f5f1ea] size-[32px] rounded-[16px] flex items-center justify-center shrink-0">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path
                d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"
                stroke="#ff5400"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <line x1="7" y1="7" x2="7.01" y2="7" stroke="#ff5400" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <div className="flex flex-col gap-[2px] items-start whitespace-nowrap">
            <p className="font-medium text-[13px] text-[#211e1a] leading-[18px]">
              {selectedCoupon.code} applied
            </p>
            <p className="font-normal text-[12px] text-[#6b6459] leading-[16px]">
              {selectedCoupon.discountType === 'percentage'
                ? `${selectedCoupon.discountValue}% off`
                : `₹${couponDiscount.toLocaleString('en-IN')} off`}
            </p>
          </div>
        </div>

        {/* Remove button matching Figma node 544:147 */}
        <button
          type="button"
          onClick={onRemoveCoupon}
          className="font-medium text-[12px] text-[#ff5400] hover:underline cursor-pointer leading-[16px] whitespace-nowrap"
        >
          Remove
        </button>
      </div>
    );
  }

  return (
    <div
      onClick={onViewOffers}
      className="bg-white border border-[#e5e0da] hover:border-[#ff5400]/40 rounded-[12px] p-[16px] flex items-center justify-between w-full font-['Montserrat'] cursor-pointer transition-colors"
    >
      <div className="flex gap-[10px] items-center">
        <div className="bg-[#f5f1ea] size-[32px] rounded-[16px] flex items-center justify-center shrink-0">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path
              d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"
              stroke="#ff5400"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <line x1="7" y1="7" x2="7.01" y2="7" stroke="#ff5400" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
        <div className="flex flex-col gap-[2px] items-start whitespace-nowrap">
          <p className="font-medium text-[13px] text-[#211e1a] leading-[18px]">
            Apply coupon
          </p>
          <p className="font-normal text-[12px] text-[#6b6459] leading-[16px]">
            Check available offers
          </p>
        </div>
      </div>
      <span className="font-medium text-[12px] text-[#ff5400] hover:underline whitespace-nowrap">
        Offers ›
      </span>
    </div>
  );
}
