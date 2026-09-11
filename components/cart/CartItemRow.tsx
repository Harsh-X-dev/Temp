'use client';

import Image from 'next/image';
import { CartItem, useCartStore } from '@/store/cart.store';
import { useCheckoutStore } from '@/store/checkout.store';
import { toast } from '@/lib/toast';
import QuantityStepper from './QuantityStepper';

interface CartItemRowProps {
  item: CartItem;
  isBuyNow?: boolean;
}

export default function CartItemRow({ item, isBuyNow }: CartItemRowProps) {
  const cartRemoveItem = useCartStore((state) => state.removeItem);
  const checkoutRemoveItem = useCheckoutStore((state) => state.removeItem);
  const removeItem = isBuyNow ? checkoutRemoveItem : cartRemoveItem;

  const currentTotal = item.price * item.quantity;
  const compareTotal = item.compareAtPrice ? item.compareAtPrice * item.quantity : null;

  return (
    <div className="flex gap-[12px] items-start w-full py-0 relative">
      {/* Product Image matching Figma node 187:86 */}
      <div className="relative rounded-[12px] shrink-0 size-[70px] bg-[#f5f1ea] overflow-hidden">
        {item.imageUrl ? (
          <Image
            src={item.imageUrl}
            alt={item.title}
            fill
            className="object-cover rounded-[12px]"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-[10px] text-[#a89a85]">
            No Image
          </div>
        )}
      </div>

      {/* Product Details (Middle) matching Figma node 187:87 */}
      <div className="flex flex-1 flex-col gap-[4px] min-w-0 font-['Montserrat'] font-normal">
        <p className="leading-[20px] text-[13px] text-[#211e1a] truncate">
          {item.title}
        </p>
        {item.variantLabel && (
          <p className="leading-[16px] text-[12px] text-[#a89a85] truncate">
            {item.variantLabel.replace(/\s*\/\s*/g, ', ')}
          </p>
        )}
        <div className="mt-[2px]">
          <QuantityStepper itemKey={item.key} quantity={item.quantity} title={item.title} isBuyNow={isBuyNow} />
        </div>
      </div>

      {/* Price & Remove (Right) matching Figma node 187:94 */}
      <div className="flex flex-col items-end justify-between self-stretch shrink-0 whitespace-nowrap pl-2">
        <button
          type="button"
          onClick={() => {
            removeItem(item.key);
            toast.info("Removed from Cart 🗑️", `${item.title} has been removed from your cart.`);
          }}
          className="font-['Montserrat'] font-normal text-[#6b6459] hover:text-red-500 text-[13px] leading-normal p-0 transition-colors cursor-pointer"
          aria-label="Remove item"
        >
          ✕
        </button>

        <div className="flex flex-col items-end">
          <p className="font-['Montserrat'] font-semibold text-[13px] text-[#ff5400] leading-[20px]">
            ₹{currentTotal.toLocaleString('en-IN')}
          </p>
          {compareTotal && compareTotal > currentTotal && (
            <p className="font-['Montserrat'] font-normal text-[12px] text-[#a89a85] line-through leading-normal">
              ₹{compareTotal.toLocaleString('en-IN')}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
