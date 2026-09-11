import type { OrderDetail } from "@/components/account/types";

interface CancellationSummaryCardProps {
  order: OrderDetail;
  reason: string;
}

export default function CancellationSummaryCard({ order, reason }: CancellationSummaryCardProps) {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(price);
  };
  
  const formatDate = (date: Date) => {
    return date.toLocaleDateString("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
    }) + " at " + date.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
    });
  };

  const refundTotal = order.total; // For this phase, refund is the whole order total

  return (
    <div className="rounded-xl border border-border-strong bg-white p-4 md:p-5 mx-4 lg:mx-0 mt-8">
      <h2 className="text-sm font-bold text-text-primary mb-4">Cancellation Summary</h2>
      
      <div className="my-4 h-px bg-border-light" />
      
      <div className="flex flex-col gap-3">
        <div className="flex items-start justify-between text-sm">
          <span className="text-text-secondary shrink-0">Cancellation Reason</span>
          <span className="font-medium text-text-primary text-right ml-4">{reason}</span>
        </div>
        
        <div className="flex items-center justify-between text-sm">
          <span className="text-text-secondary">Cancelled On</span>
          <span className="font-medium text-text-primary">{formatDate(new Date())}</span>
        </div>
        
        <div className="flex items-center justify-between text-sm">
          <span className="text-text-secondary">Refund Amount</span>
          <span className="font-bold text-primary-orange">{formatPrice(refundTotal)}</span>
        </div>
        
        <div className="flex items-center justify-between text-sm">
          <span className="text-text-secondary">Refund Status</span>
          <span className="font-bold text-primary-orange">Processing</span>
        </div>
        
        <div className="flex items-center justify-between text-sm">
          <span className="text-text-secondary">Expected Refund</span>
          <span className="font-medium text-text-primary">5-7 business days</span>
        </div>
      </div>
    </div>
  );
}
