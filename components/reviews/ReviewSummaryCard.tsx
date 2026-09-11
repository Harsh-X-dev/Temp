import type { UserProfile } from "@/components/account/types";

interface ReviewSummaryCardProps {
  profile: UserProfile | null;
  totalReviews: number;
  averageRating: number;
}

export default function ReviewSummaryCard({
  profile,
  totalReviews,
  averageRating,
}: ReviewSummaryCardProps) {
  const firstName = profile?.fullName ? profile.fullName.split(" ")[0] : "Spiritual";

  return (
    <div className="flex items-center justify-between rounded-[12px] border border-border-strong bg-white p-[16px] w-full">
      {/* Left: User Welcome */}
      <div className="flex flex-col gap-[4px] flex-[1_0_0] min-w-0 whitespace-nowrap">
        <p className="text-[13px] font-medium text-text-secondary leading-normal">
          {firstName}&apos;s Reviews
        </p>
        <p className="text-[12px] font-semibold text-primary-orange leading-normal">
          Level 4 Spiritual Seeker
        </p>
      </div>

      {/* Divider */}
      <div className="h-[32px] w-px bg-border-strong shrink-0" />

      {/* Center: Written count */}
      <div className="flex flex-col gap-[2px] items-center w-[80px] whitespace-nowrap shrink-0">
        <span className="text-[18px] font-bold text-text-primary leading-normal">
          {totalReviews}
        </span>
        <span className="text-[11px] font-medium text-text-muted leading-normal">
          Written
        </span>
      </div>

      {/* Right: Average Rating */}
      <div className="flex flex-col gap-[2px] items-center w-[80px] whitespace-nowrap shrink-0">
        <span className="text-[18px] font-bold text-primary-orange leading-normal">
          {averageRating.toFixed(1)} ★
        </span>
        <span className="text-[11px] font-medium text-text-muted leading-normal">
          Average
        </span>
      </div>
    </div>
  );
}
