import Link from "next/link";

interface PendingReviewsCalloutProps {
  count: number;
}

export default function PendingReviewsCallout({ count }: PendingReviewsCalloutProps) {
  if (count <= 0) return null;

  return (
    <div className="flex flex-col gap-[12px] rounded-[12px] bg-surface-subtle border border-border-strong p-[16px] w-full">
      {/* Promo Text Stack */}
      <div className="flex flex-col gap-[4px] w-full">
        <p className="text-[13px] font-bold text-text-primary leading-normal whitespace-nowrap">
          Rate your recent purchases
        </p>
        <p className="text-[12px] font-normal text-text-secondary leading-[16px]">
          You have {count} unreviewed gemstone items. Sharing your energy experiences helps the seeker community.
        </p>
      </div>

      {/* Write Review CTA */}
      <Link
        href="/profile/reviews/pending"
        className="inline-flex w-fit items-center gap-[8px] justify-center rounded-[20px] bg-primary-orange px-[16px] py-[10px] transition-opacity hover:opacity-90"
      >
        <span className="text-[12px] font-semibold text-white whitespace-nowrap leading-normal">
          Review Pending Items ({count})
        </span>
        <svg className="size-[14px] shrink-0 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
        </svg>
      </Link>
    </div>
  );
}
