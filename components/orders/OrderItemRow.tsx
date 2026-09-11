import Image from "next/image";
import type { OrderItem } from "@/components/account/types";

interface OrderItemRowProps {
  item: OrderItem;
  status: string;
}

export default function OrderItemRow({ item, status }: OrderItemRowProps) {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(price);
  };

  const isCancelled = ["cancelled", "returned", "refunded"].includes(status);

  return (
    <div className="flex items-center gap-3 w-full">
      {/* Thumbnail: 40x40, rounded-[12px] */}
      <div className="size-10 shrink-0 overflow-hidden rounded-[12px] bg-[#f5f1ea]">
        {item.imageUrl ? (
          <Image
            src={item.imageUrl}
            alt={item.productTitle}
            width={40}
            height={40}
            className="size-full object-cover"
            unoptimized
          />
        ) : (
          <div className="flex size-full items-center justify-center">
            <svg
              className="size-5 text-[#8C8477] opacity-50"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
          </div>
        )}
      </div>

      {/* Item text */}
      <div className="flex flex-1 flex-col gap-[2px] items-start min-w-0">
        <p className="text-[12px] font-medium text-[#211e1a] leading-normal line-clamp-2 w-full">
          {item.quantity > 1 && (
            <span className="font-semibold mr-1">{item.quantity} ×</span>
          )}
          {item.productTitle}
        </p>
        {item.variantTitle && (
          <p className="text-[11px] text-[#6b6459] leading-normal">
            {item.variantTitle.replace(/\s*\/\s*/g, ', ')}
          </p>
        )}
        {isCancelled && (
          <p className="text-[11px] font-normal text-[#6b6459] leading-normal">
            Refund initiated
          </p>
        )}
      </div>

      {/* Price */}
      <p
        className={`text-[12px] font-semibold leading-normal whitespace-nowrap shrink-0 ${
          isCancelled ? "line-through text-[#ff5400]" : "text-[#ff5400]"
        }`}
      >
        {formatPrice(item.unitPrice * item.quantity)}
      </p>
    </div>
  );
}
