'use client';

import type { CheckoutItem } from '@/types/checkout.types';
import CheckoutItemCard from '@/components/checkout/cards/CheckoutItemCard';

interface CheckoutItemsProps {
  items: CheckoutItem[];
}

export default function CheckoutItems({ items }: CheckoutItemsProps) {
  if (items.length === 0) return null;

  return (
    <div className="flex flex-col gap-3 items-start relative shrink-0 w-full">
      {items.map((item) => (
        <CheckoutItemCard
          key={`${item.productId}::${item.variantId}`}
          item={item}
        />
      ))}
    </div>
  );
}
