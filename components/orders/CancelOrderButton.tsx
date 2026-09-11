import Link from "next/link";
import type { OrderStatus } from "@/components/account/types";

interface CancelOrderButtonProps {
  orderNumber: string;
  status: OrderStatus;
}

export default function CancelOrderButton({ orderNumber, status }: CancelOrderButtonProps) {
  // Cancel action must be absent for delivered, cancelled, refunded, and returned orders.
  const isCancellable = ["pending", "confirmed", "processing", "shipped"].includes(status);

  if (!isCancellable) return null;

  return (
    <div className="flex flex-col gap-4">
      <Link
        href={`/orders/${orderNumber}/cancel`}
        className="flex h-[42px] w-full items-center justify-center rounded-full border border-[#FF6B00] text-[15px] font-bold text-[#FF6B00] transition-colors hover:bg-[#FFF6ED] active:scale-[0.98]"
      >
        Cancel Order
      </Link>
    </div>
  );
}
