import type { OrderStatus } from "@/components/account/types";

interface OrderStatusBadgeProps {
  status: OrderStatus;
}

export default function OrderStatusBadge({ status }: OrderStatusBadgeProps) {
  // Figma: delivered/shipped/cancelled → bg-[#fbf8f4] text-[#ff5400]
  // processing/pending/confirmed → bg-[#fbf8f4] text-[#a89a85]
  let label = status.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase());
  let textColor = "text-[#a89a85]";

  switch (status) {
    case "delivered":
      label = "Delivered";
      textColor = "text-[#ff5400]";
      break;
    case "shipped":
      label = "Shipped";
      textColor = "text-[#ff5400]";
      break;
    case "out_for_delivery":
      label = "Out for Delivery";
      textColor = "text-[#ff5400]";
      break;
    case "cancelled":
    case "returned":
    case "refunded":
      label = "Cancelled";
      textColor = "text-[#ff5400]";
      break;
    case "processing":
    case "pending":
    case "confirmed":
      label = "Processing";
      textColor = "text-[#a89a85]";
      break;
  }

  return (
    <span
      className={`inline-flex items-center bg-[#fbf8f4] rounded-[12px] px-[10px] py-[6px] text-[11px] font-semibold leading-normal whitespace-nowrap shrink-0 ${textColor}`}
    >
      {label}
    </span>
  );
}
