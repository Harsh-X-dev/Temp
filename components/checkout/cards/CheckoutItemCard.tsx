'use client';

import Image from 'next/image';
import type { CheckoutItem } from '@/types/checkout.types';

interface CheckoutItemCardProps {
  item: CheckoutItem;
}

export default function CheckoutItemCard({ item }: CheckoutItemCardProps) {
  const totalPrice = item.price * item.quantity;
  const compareTotalPrice = item.compareAtPrice ? item.compareAtPrice * item.quantity : null;
  const hasMrpDiscount = compareTotalPrice && compareTotalPrice > totalPrice;

  return (
    <div className="bg-white border border-[#e5e0da] rounded-[12px] p-[16px] flex gap-[12px] items-center w-full">
      {/* Product Image matching Figma node 544:119 */}
      <div className="relative rounded-[12px] shrink-0 size-[60px] bg-[#f5f1ea] overflow-hidden">
        {item.imageUrl ? (
          <Image
            src={item.imageUrl}
            alt={item.title}
            fill
            className="object-cover rounded-[12px]"
            sizes="60px"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-[10px] text-[#a89a85]">
            No Image
          </div>
        )}
      </div>

      {/* Product Details matching Figma node 544:120 */}
      <div className="flex flex-1 flex-col gap-[4px] min-w-0 font-['Montserrat'] font-normal whitespace-nowrap">
        <p className="leading-[20px] text-[13px] text-[#211e1a] truncate">
          {item.title}
        </p>
        {item.variantLabel && (
          <p className="leading-[16px] text-[12px] text-[#6b6459] truncate">
            {item.variantLabel.replace(/\s*\/\s*/g, ', ')}
          </p>
        )}
        <p className="leading-[16px] text-[12px] text-[#6b6459]">
          Qty: {item.quantity}
        </p>
      </div>

      {/* Price matching Figma node 545:52 */}
      <div className="flex gap-[6px] items-center whitespace-nowrap shrink-0 pl-2">
        {hasMrpDiscount && (
          <span className="font-['Montserrat'] font-normal text-[12px] text-[#a89a85] line-through leading-[16px]">
            ₹{compareTotalPrice.toLocaleString('en-IN')}
          </span>
        )}
        <span className="font-['Montserrat'] font-semibold text-[13px] text-[#ff5400] leading-[20px]">
          ₹{totalPrice.toLocaleString('en-IN')}
        </span>
      </div>
    </div>
  );
}
