import type { Order } from "@/components/account/types";
import OrderStatusBadge from "@/components/orders/states/OrderStatusBadge";
import OrderItemRow from "@/components/orders/OrderItemRow";
import Link from "next/link";

interface OrderHistoryCardProps {
  order: Order;
}

export default function OrderHistoryCard({ order }: OrderHistoryCardProps) {
  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(price);
  };

  const showTrack = ["confirmed", "processing", "shipped", "out_for_delivery", "delivered"].includes(order.status);
  const showRate = order.status === "delivered";

  return (
    <div className="bg-white border border-[#e5e0da] rounded-[12px] flex flex-col gap-3 items-start p-4 w-full">
      {/* Top row: order number + status badge */}
      <div className="flex items-center justify-between w-full">
        <p className="text-[13px] font-semibold text-[#211e1a] whitespace-nowrap leading-normal">
          Order #{order.orderNumber}
        </p>
        <OrderStatusBadge status={order.status} />
      </div>

      {/* Date */}
      <p className="text-[11px] font-normal text-[#a89a85] leading-normal w-full -mt-1">
        Placed on {formatDate(order.placedAt)}
      </p>

      {/* Divider */}
      <div className="bg-[#e5e0da] h-px w-full shrink-0" />

      {/* Items */}
      <div className="flex flex-col gap-3 items-start w-full">
        {order.items.map((item) => (
          <OrderItemRow key={item.id} item={item} status={order.status} />
        ))}
      </div>

      {/* Divider */}
      <div className="bg-[#e5e0da] h-px w-full shrink-0" />

      {/* Bottom row: total + actions */}
      <div className="flex items-center justify-between w-full">
        <p className="text-[13px] font-semibold text-[#211e1a] whitespace-nowrap leading-normal">
          Total: {formatPrice(order.total)}
        </p>
        <div className="flex gap-3 items-center">
          {showRate && (() => {
            const firstItem = order.items[0];
            const isSingle = order.items.length === 1 && firstItem?.productSlug;
            const reviewHref = isSingle
              ? `/product/${firstItem.productSlug}/write-review?orderItemId=${firstItem.id}`
              : "/profile/reviews/pending";
            return (
              <Link
                href={reviewHref}
                className="text-[12px] font-semibold text-[#ff5400] whitespace-nowrap leading-normal"
              >
                Rate Products
              </Link>
            );
          })()}
          {showTrack && (
            <Link
              href={`/orders/${order.orderNumber}`}
              prefetch={true}
              className="bg-white border border-[#ff5400] flex h-8 items-center px-3 rounded-[18px] shrink-0 text-[12px] font-semibold text-[#ff5400] whitespace-nowrap leading-normal transition-colors hover:bg-orange-50 active:scale-95"
            >
              Track Order
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
