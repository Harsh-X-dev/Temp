'use client';

import { useSearchParams } from 'next/navigation';
import BackButton from '@/components/ui/buttons/BackButton';
import { useCheckoutStore } from '@/store/checkout.store';

interface CheckoutHeaderProps {
  itemCount?: number;
  backHref?: string;
}

/**
 * Checkout page header matching Figma node 544:110 (node 527-908)
 */
export default function CheckoutHeader({ itemCount, backHref }: CheckoutHeaderProps) {
  const searchParams = useSearchParams();
  const source = useCheckoutStore((s) => s.source);
  const isBuyNow = searchParams.get('buyNow') === '1' || source === 'buy-now';

  const defaultBackHref = isBuyNow
    ? (searchParams.toString() ? `/cart?${searchParams.toString()}` : '/cart?buyNow=1')
    : '/cart';

  const targetHref = backHref || defaultBackHref;

  return (
    <header className="sticky top-0 z-20 w-full bg-white border-b border-[#e5e0da] h-[56px] px-[16px] flex items-center justify-between shrink-0">
      <div className="flex items-center gap-[12px]">
        <BackButton href={targetHref} className="size-[28px] rounded-[14px]" />
        <h1 className="font-['Montserrat'] font-bold text-[18px] text-[#211e1a] leading-[24px] whitespace-nowrap">
          Review your order
        </h1>
      </div>
      {itemCount !== undefined && itemCount > 0 && (
        <div className="bg-[#f5f1ea] px-[10px] py-[4px] rounded-[24px] shrink-0">
          <span className="font-['Montserrat'] font-semibold text-[12px] text-[#6b6459] leading-[16px] whitespace-nowrap">
            {itemCount} {itemCount === 1 ? 'item' : 'items'}
          </span>
        </div>
      )}
    </header>
  );
}
