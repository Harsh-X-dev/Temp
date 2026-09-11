import type { OrderDetail } from "@/components/account/types";

interface RefundInformationNoticeProps {
  order: OrderDetail;
}

export default function RefundInformationNotice({ order }: RefundInformationNoticeProps) {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(price);
  };
  
  const refundTotal = order.total; // For this phase, refund is the whole order total
  
  return (
    <div className="rounded-xl border border-orange-100 bg-orange-50/50 p-4 mx-4 lg:mx-0 mt-4 flex items-start gap-3">
      <div className="shrink-0 mt-0.5">
        <svg className="size-5 text-primary-orange" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </div>
      <p className="text-xs leading-relaxed text-text-secondary">
        Refund of <span className="font-bold text-primary-orange">{formatPrice(refundTotal)}</span> will be credited to your original payment method within <span className="font-bold text-primary-orange">5-7 business days</span>
      </p>
    </div>
  );
}
