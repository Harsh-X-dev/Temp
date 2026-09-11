import Image from "next/image";
import Link from "next/link";
import { assets } from "@/lib/assets";
import type { PendingReview } from "@/components/account/types";

interface PendingReviewCardProps {
  item: PendingReview;
}

export default function PendingReviewCard({ item }: PendingReviewCardProps) {
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

  return (
    <div className="flex flex-col gap-4 rounded-xl border border-border-strong bg-white p-4 md:p-5 mx-4 lg:mx-0 shadow-sm">
      {/* Top Header: Image, Title, Price, Date */}
      <div className="flex items-center gap-4">
        <div className="relative size-16 shrink-0 overflow-hidden rounded-full border border-border-strong bg-surface-neutral">
          <Image
            src={item.productImageUrl || assets.heroProduct}
            alt={item.productTitle}
            fill
            className="object-cover"
            sizes="64px"
            unoptimized
          />
        </div>
        <div className="flex flex-1 flex-col justify-center">
          <h3 className="text-sm font-bold text-text-primary line-clamp-1 mb-1">
            {item.productTitle}
          </h3>
          <div className="flex items-center justify-between">
            <span className="text-sm font-bold text-primary-orange">{formatPrice(item.price)}</span>
            <span className="text-[11px] md:text-xs text-text-secondary whitespace-nowrap ml-2">
              Purchased: {formatDate(item.purchasedAt)}
            </span>
          </div>
        </div>
      </div>

      <div className="h-px bg-border-strong" />

      {/* Bottom Actions */}
      <div className="flex items-center justify-between">
        {item.isVerifiedPurchase ? (
          <div className="flex items-center gap-1.5">
            <svg className="size-4 text-primary-orange" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <span className="text-xs font-bold text-primary-orange">
              Verified Purchase
            </span>
          </div>
        ) : (
          <div /> // empty placeholder to keep button on right
        )}

        <Link
          href={`/product/${item.productSlug}/write-review?orderId=${item.orderId || ''}&orderItemId=${item.id}`}
          className="flex items-center justify-center rounded-full bg-primary-orange px-5 py-2 text-xs md:text-sm font-bold text-white transition-opacity hover:opacity-90 active:scale-95"
        >
          <span>Write a Review</span>
          <svg className="ml-1.5 size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14 5l7 7m0 0l-7 7m7-7H3" />
          </svg>
        </Link>
      </div>
    </div>
  );
}
