'use client';

import { useRouter } from "next/navigation";
import OrderDetailPageHeader from "@/components/orders/headers/OrderDetailPageHeader";
import CancellationSummaryCard from "@/components/orders/cards/CancellationSummaryCard";
import RefundInformationNotice from "@/components/orders/RefundInformationNotice";
import Button from "@/components/ui/buttons/Button";
import type { OrderDetail } from "@/components/account/types";

interface CancelSuccessProps {
  order: OrderDetail;
  reason: string;
}

export default function CancelSuccess({ order, reason }: CancelSuccessProps) {
  const router = useRouter();

  return (
    <div className="bg-[#FDFBF7] md:bg-white min-h-[100dvh] flex flex-col pb-[160px]">
      <OrderDetailPageHeader title="Order Cancelled" backHref={`/orders/${order.orderNumber}`} />
      
      <div className="flex-1 lg:py-8 max-w-3xl mx-auto w-full pt-8 lg:pt-0">
        
        {/* Success Header */}
        <div className="flex flex-col items-center justify-center px-4 text-center mt-4">
          <div className="flex size-[72px] items-center justify-center rounded-full bg-orange-50 mb-6">
            <div className="flex size-14 items-center justify-center rounded-full bg-primary-orange text-white">
              <svg className="size-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </div>
          </div>
          
          <h1 className="text-xl font-bold text-text-primary mb-2">Order Cancelled Successfully</h1>
          <p className="text-sm text-text-secondary max-w-[260px] mx-auto leading-relaxed">
            Your order <span className="font-bold text-text-primary">#{order.orderNumber}</span> has been cancelled
          </p>
        </div>

        <CancellationSummaryCard order={order} reason={reason} />
        
        <RefundInformationNotice order={order} />

      </div>

      {/* Sticky footer for actions */}
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-border-strong p-4 pb-safe lg:static lg:bg-transparent lg:border-none lg:mt-6 lg:max-w-3xl lg:mx-auto lg:p-0">
        <div className="flex flex-col gap-3">
          <Button
            variant="filled"
            size="lg"
            onClick={() => router.push('/')}
            className="h-12 w-full rounded-full font-bold text-sm"
          >
            Continue Shopping
          </Button>
          <Button
            variant="outline"
            size="lg"
            onClick={() => router.push('/orders')}
            className="h-12 w-full rounded-full font-bold text-sm"
          >
            View Order History
          </Button>
        </div>
      </div>
    </div>
  );
}
