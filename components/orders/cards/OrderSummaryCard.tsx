import type { OrderDetail } from "@/components/account/types";
import OrderStatusBadge from "@/components/orders/states/OrderStatusBadge";
import OrderItemRow from "@/components/orders/OrderItemRow";

interface OrderSummaryCardProps {
  order: OrderDetail;
}

export default function OrderSummaryCard({ order }: OrderSummaryCardProps) {
  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  return (
    <div className="rounded-xl border border-[#E5E0DA] bg-white p-5 lg:mx-0">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-[15px] font-bold text-[#211E1A]">Order #{order.orderNumber}</h2>
          <p className="mt-1 text-[13px] text-[#A69C8E]">Placed on {formatDate(order.placedAt)}</p>
        </div>
        <OrderStatusBadge status={order.status} />
      </div>

      <div className="my-5 h-px bg-[#E5E0DA]" />

      {/* Items */}
      <div className="flex flex-col gap-4">
        {order.items && order.items.length > 0 ? (
          order.items.map((item) => (
            <OrderItemRow key={item.id} item={item} status={order.status} />
          ))
        ) : (
          <p className="text-[13px] text-text-secondary py-2">
            No items were found for this order.
          </p>
        )}
      </div>
    </div>
  );
}
