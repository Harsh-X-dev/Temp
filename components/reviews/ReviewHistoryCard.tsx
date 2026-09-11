import Link from "next/link";
import Image from "next/image";
import type { Review } from "@/components/account/types";
import RatingStars from "./RatingStars";

interface ReviewHistoryCardProps {
  review: Review;
}

export default function ReviewHistoryCard({ review }: ReviewHistoryCardProps) {
  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  return (
    <Link
      href={`/product/${review.productSlug}`}
      className="block rounded-[12px] border border-border-strong bg-white p-[16px] w-full cursor-pointer transition-shadow hover:shadow-sm"
    >
      {/* Card content: gap-[12px] between all rows */}
      <div className="flex flex-col gap-[12px]">

        {/* Product Info Header */}
        <div className="flex gap-[12px] items-center w-full">
          {/* Thumbnail 54×54 */}
          <div className="relative shrink-0 size-[54px] rounded-[12px] border border-border-strong overflow-hidden bg-surface-neutral">
            {review.productImageUrl ? (
              <Image
                src={review.productImageUrl}
                alt={review.productTitle}
                fill
                className="object-cover pointer-events-none rounded-[12px]"
                sizes="54px"
                quality={85}
                loading="lazy"
              />
            ) : (
              <div className="flex size-full items-center justify-center">
                <svg className="size-5 text-text-muted opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
            )}
          </div>

          {/* Meta Column */}
          <div className="flex flex-[1_0_0] flex-col gap-[4px] items-start min-w-0">
            <p className="text-[13px] font-semibold text-text-primary leading-normal overflow-hidden text-ellipsis w-full whitespace-nowrap">
              {review.productTitle}
            </p>
            {/* Rating and Date row */}
            <div className="flex items-center justify-between w-full">
              <RatingStars
                rating={review.rating}
                iconClassName="size-[14px]"
                className="gap-[4px]"
              />
              <span className="text-[11px] font-medium text-text-muted whitespace-nowrap leading-normal">
                {formatDate(review.createdAt)}
              </span>
            </div>
          </div>
        </div>

        {/* Review Body */}
        {review.body && (
          <p className="text-[13px] font-normal text-text-secondary leading-[18px] w-full">
            {review.body}
          </p>
        )}

        {/* Divider line */}
        <div className="h-px w-full bg-border-strong" />

        {/* Card Actions: Verified Purchase */}
        {review.isVerifiedPurchase && (
          <div className="flex items-center gap-[4px]">
            <svg className="size-[12px] text-primary-orange shrink-0" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <span className="text-[11px] font-semibold text-primary-orange whitespace-nowrap leading-normal">
              Verified Purchase
            </span>
          </div>
        )}
      </div>
    </Link>
  );
}
