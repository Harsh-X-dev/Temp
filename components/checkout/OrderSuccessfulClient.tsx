'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import Button from '@/components/ui/buttons/Button';

interface OrderSuccessfulClientProps {
  initialOrderId?: string;
  initialItems?: string;
  initialTotal?: string;
}

export default function OrderSuccessfulClient({
  initialOrderId = '#GEM-2025-7842',
  initialItems = '1',
  initialTotal = '1,349',
}: OrderSuccessfulClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const orderId = searchParams.get('orderId') || initialOrderId;
  const items = searchParams.get('items') || initialItems;
  const total = searchParams.get('total')
    ? (isNaN(Number(searchParams.get('total'))) ? searchParams.get('total')! : parseInt(searchParams.get('total') as string).toLocaleString('en-IN'))
    : initialTotal;

  return (
    <div className="bg-white flex flex-col items-center justify-center relative size-full min-h-screen w-full">
      {/* Close Button */}
      <button
        onClick={() => router.push('/')}
        className="absolute right-[16px] md:right-[32px] top-[16px] md:top-[32px] bg-white border border-border-strong flex flex-col items-center justify-center rounded-[14px] size-[28px] hover:bg-surface-subtle transition-colors z-10"
        aria-label="Close"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#211e1a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M18 6L6 18M6 6l12 12"></path>
        </svg>
      </button>

      {/* Main Content */}
      <div className="flex flex-col items-center justify-center px-[16px] w-full max-w-md py-8">

        {/* Success Icon */}
        <div className="bg-primary-orange relative rounded-[40px] shrink-0 size-[80px] flex items-center justify-center mb-[16px]">
          <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M5 13l4 4L19 7"></path>
          </svg>
        </div>

        <h1 className="font-['Montserrat'] font-bold leading-[28px] text-[20px] text-text-primary text-center mb-[4px]">
          Order placed successfully!
        </h1>

        <p className="font-['Montserrat'] font-medium leading-[20px] text-[14px] text-text-secondary text-center mb-[8px]">
          Order {orderId.startsWith('#') ? orderId : `#${orderId}`}
        </p>

        <p className="font-['Montserrat'] font-normal leading-[20px] text-[14px] text-text-secondary text-center">
          Estimated delivery: 5-7 Aug 2025
        </p>

        <p className="font-['Montserrat'] font-normal leading-[20px] text-[14px] text-text-muted text-center">
          {items} items • Total paid: ₹{total}
        </p>

        {/* Divider */}
        <div className="flex flex-col items-center py-[32px] w-full">
          <div className="bg-border-strong h-px w-[80px]" />
        </div>

        <p className="font-['Montserrat'] font-normal leading-[18px] max-w-[280px] text-[13px] text-text-secondary text-center">
          Thank you for shopping with Gemostone! Your sacred items are being prepared with care.
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col gap-[12px] items-center pt-[40px] w-full">
          <Button
            variant="filled"
            size="lg"
            onClick={() => router.push(`/orders/${orderId}`)}
            className="h-[50px] w-full font-semibold text-[15px]"
          >
            Track Order
          </Button>
          <Button
            variant="outline"
            size="lg"
            onClick={() => router.push('/')}
            className="h-[50px] w-full font-semibold text-[15px]"
          >
            Continue Shopping
          </Button>
        </div>

      </div>
    </div>
  );
}
