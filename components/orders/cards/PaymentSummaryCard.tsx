import type { OrderPaymentSummary } from "@/components/account/types";

interface PaymentSummaryCardProps {
  payment: OrderPaymentSummary;
}

export default function PaymentSummaryCard({ payment }: PaymentSummaryCardProps) {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(price);
  };

  return (
    <div className="rounded-xl border border-[#E5E0DA] bg-white p-5 lg:mx-0">
      <div className="flex items-center gap-2 mb-4">
        <svg className="size-5 text-[#FF6B00]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
        </svg>
        <h2 className="text-[15px] font-bold text-[#211E1A]">Payment Summary</h2>
      </div>

      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between text-[13px] text-[#6B6459]">
          <span>Subtotal</span>
          <span className="font-medium text-[#211E1A]">{formatPrice(payment.subtotal)}</span>
        </div>
        
        <div className="flex items-center justify-between text-[13px] text-[#6B6459]">
          <span>Shipping</span>
          <span className="font-medium text-[#211E1A]">{payment.shipping === 0 ? "Free" : formatPrice(payment.shipping)}</span>
        </div>
        
        {payment.discountApplied !== 0 && (
          <div className="flex items-center justify-between text-[13px] text-[#FF6B00]">
            <span>Discount Applied</span>
            <span className="font-medium text-[#FF6B00]">-{formatPrice(payment.discountApplied)}</span>
          </div>
        )}
        
        {payment.gst !== 0 && (
          <div className="flex items-center justify-between text-[13px] text-[#6B6459]">
            <span>GST (3%)</span>
            <span className="font-medium text-[#211E1A]">{formatPrice(payment.gst)}</span>
          </div>
        )}

        {payment.codFee !== undefined && payment.codFee > 0 && (
          <div className="flex items-center justify-between text-[13px] text-[#6B6459]">
            <span>Cash on Delivery Fee</span>
            <span className="font-medium text-[#211E1A]">{formatPrice(payment.codFee)}</span>
          </div>
        )}
      </div>

      <div className="my-5 h-px bg-[#E5E0DA]" />

      <div className="flex items-center justify-between">
        <span className="text-[15px] font-bold text-[#211E1A]">Total Paid</span>
        <span className="text-[15px] font-bold text-[#FF6B00]">{formatPrice(payment.totalPaid)}</span>
      </div>
    </div>
  );
}
