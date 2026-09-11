'use client';

import type { BillBreakdown } from '@/types/checkout.types';

interface BillSummaryProps {
  bill: BillBreakdown;
  couponCode?: string | null;
}

export default function BillSummary({ bill, couponCode }: BillSummaryProps) {
  return (
    <div className="border-t border-[#e5e0da] pt-[16px] flex flex-col gap-[12px] items-start w-full font-['Montserrat'] text-[13px] whitespace-nowrap">
      {/* Subtotal matching Figma node 544:149 */}
      <div className="flex font-normal items-center justify-between leading-[20px] text-[13px] w-full">
        <span className="text-[#6b6459]">Subtotal</span>
        <span className="text-[#211e1a]">
          ₹{bill.subtotal.toLocaleString('en-IN')}
        </span>
      </div>

      {/* Product Discount */}
      {bill.productDiscount > 0 && (
        <div className="flex font-normal items-center justify-between leading-[20px] text-[#ff5400] text-[13px] w-full">
          <span>Product Discount</span>
          <span>
            -₹{bill.productDiscount.toLocaleString('en-IN')}
          </span>
        </div>
      )}

      {/* Coupon Discount matching Figma node 544:152 */}
      {bill.couponDiscount > 0 && (
        <div className="flex font-normal items-center justify-between leading-[20px] text-[#ff5400] text-[13px] w-full">
          <span>
            Discount {couponCode ? `(${couponCode})` : '(WELCOME10)'}
          </span>
          <span>
            -₹{bill.couponDiscount.toLocaleString('en-IN')}
          </span>
        </div>
      )}

      {/* Shipping matching Figma node 544:155 */}
      <div className="flex font-normal items-center justify-between leading-[20px] text-[13px] w-full">
        <span className="text-[#6b6459]">Shipping</span>
        <span className="text-[#211e1a]">
          {bill.deliveryCharges === 0 ? 'Free' : `₹${bill.deliveryCharges.toLocaleString('en-IN')}`}
        </span>
      </div>

      {/* GST / Taxes matching Figma node 544:158 */}
      {bill.taxes > 0 && (
        <div className="flex font-normal items-center justify-between leading-[20px] text-[13px] w-full">
          <span className="text-[#6b6459]">GST (3%)</span>
          <span className="text-[#211e1a]">
            ₹{bill.taxes.toLocaleString('en-IN')}
          </span>
        </div>
      )}

      {/* Divider matching Figma node 544:161 */}
      <div className="h-px bg-[#e5e0da] w-full shrink-0" />

      {/* Grand Total matching Figma node 544:162 */}
      <div className="flex items-center justify-between leading-[24px] w-full">
        <span className="font-semibold text-[15px] text-[#211e1a]">Total</span>
        <span className="font-bold text-[18px] text-[#ff5400]">
          ₹{bill.grandTotal.toLocaleString('en-IN')}
        </span>
      </div>
    </div>
  );
}
