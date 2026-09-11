import type { OrderDetail } from "@/components/account/types";

interface RefundSummaryCardProps {
  order: OrderDetail;
}

export default function RefundSummaryCard({ order }: RefundSummaryCardProps) {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(price);
  };

  const refundTotal = order.total; // For this phase, refund is the whole order total

  return (
    <div className="rounded-xl border border-border-strong bg-white p-4 md:p-5 mx-4 lg:mx-0 mt-6">
      <h2 className="text-sm font-bold text-text-primary mb-4">Refund Summary</h2>
      
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between text-sm text-text-secondary">
          <span>Item Amount</span>
          <span className="font-medium text-text-primary">{formatPrice(order.paymentSummary.subtotal)}</span>
        </div>
        
        <div className="flex items-center justify-between text-sm text-text-secondary">
          <span>Shipping</span>
          <span className="font-medium text-text-primary">{order.paymentSummary.shipping === 0 ? "₹0" : formatPrice(order.paymentSummary.shipping)}</span>
        </div>
      </div>

      <div className="my-4 h-px bg-border-light" />

      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <span className="text-sm font-bold text-text-primary">Refund Total</span>
          <span className="text-base font-bold text-primary-orange">{formatPrice(refundTotal)}</span>
        </div>
        
        <div className="flex items-start gap-1.5 mt-1">
          <svg className="size-3.5 shrink-0 text-text-muted mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="text-[11px] text-text-muted leading-relaxed">
            Refund will be credited to original payment method within 5-7 business days
          </p>
        </div>
      </div>
    </div>
  );
}
