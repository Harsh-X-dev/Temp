'use client';

import { useCartStore } from '@/store/cart.store';
import { useCheckoutStore } from '@/store/checkout.store';
import { toast } from '@/lib/toast';

interface QuantityStepperProps {
  itemKey: string;
  quantity: number;
  title: string;
  isBuyNow?: boolean;
}

export default function QuantityStepper({ itemKey, quantity, title, isBuyNow }: QuantityStepperProps) {
  const cartUpdateQuantity = useCartStore((state) => state.updateQuantity);
  const checkoutUpdateQuantity = useCheckoutStore((state) => state.updateQuantity);
  const cartRemoveItem = useCartStore((state) => state.removeItem);
  const checkoutRemoveItem = useCheckoutStore((state) => state.removeItem);

  const updateQuantity = isBuyNow ? checkoutUpdateQuantity : cartUpdateQuantity;
  const removeItem = isBuyNow ? checkoutRemoveItem : cartRemoveItem;

  const handleDecrement = () => {
    if (quantity > 1) {
      updateQuantity(itemKey, quantity - 1);
    } else {
      // If decrementing below 1, remove the item
      removeItem(itemKey);
      toast.info("Removed from Cart 🗑️", `${title} has been removed from your cart.`);
    }
  };

  const handleIncrement = () => {
    updateQuantity(itemKey, quantity + 1);
  };

  return (
    <div className="border border-[#e5e0da] bg-white content-stretch flex gap-[10px] items-center leading-[16px] overflow-clip px-[8px] py-[4px] relative rounded-[12px] shrink-0 text-[12px] w-fit">
      <button
        onClick={handleDecrement}
        className="relative shrink-0 text-[#6b6459] w-[14px] flex items-center justify-center cursor-pointer hover:text-[#211e1a] font-normal"
        aria-label="Decrease quantity"
      >
        −
      </button>
      <p className="relative shrink-0 text-[#211e1a] min-w-[12px] text-center font-normal">
        {quantity}
      </p>
      <button
        onClick={handleIncrement}
        className="relative shrink-0 text-[#6b6459] w-[14px] flex items-center justify-center cursor-pointer hover:text-[#211e1a] font-normal"
        aria-label="Increase quantity"
      >
        +
      </button>
    </div>
  );
}
