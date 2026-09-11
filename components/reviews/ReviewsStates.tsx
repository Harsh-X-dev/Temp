export function ReviewsSkeleton() {
  return (
    <div className="flex flex-col gap-4">
      {/* Summary Skeleton */}
      <div className="rounded-[12px] border border-border-strong bg-white p-[16px] w-full flex items-center justify-between">
        <div className="space-y-2 flex-1">
          <div className="h-4 w-32 rounded-[6px] animate-shimmer" />
          <div className="h-3 w-40 rounded-[6px] animate-shimmer" />
        </div>
        <div className="h-[32px] w-px bg-border-strong mx-4" />
        <div className="flex gap-4">
          <div className="h-8 w-14 rounded-[8px] animate-shimmer" />
          <div className="h-8 w-14 rounded-[8px] animate-shimmer" />
        </div>
      </div>

      {/* Card Skeletons */}
      {[...Array(3)].map((_, i) => (
        <div key={i} className="rounded-[12px] border border-border-strong bg-white p-[16px] w-full">
          <div className="flex items-center gap-3">
            <div className="size-[54px] rounded-[12px] animate-shimmer shrink-0" />
            <div className="flex-1 space-y-2 py-1">
              <div className="h-4 w-44 max-w-[70%] rounded-[6px] animate-shimmer" />
              <div className="h-3 w-28 rounded-[6px] animate-shimmer" />
            </div>
          </div>
          <div className="mt-4 space-y-2">
            <div className="h-3.5 w-full rounded-[6px] animate-shimmer" />
            <div className="h-3.5 w-4/5 rounded-[6px] animate-shimmer" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function ReviewsPageSkeleton() {
  return (
    <div className="bg-surface-subtle min-h-[100dvh] flex flex-col font-['Montserrat']">
      <header className="sticky top-0 z-50 flex h-[58px] items-center justify-between border-b border-border-strong bg-white px-[16px] max-w-lg mx-auto w-full">
        <div className="flex gap-3 items-center">
          <div className="size-9 rounded-full animate-shimmer shrink-0" />
          <div className="h-5 w-28 rounded animate-shimmer" />
        </div>
      </header>
      <div className="flex-1 max-w-lg mx-auto w-full px-[16px] pt-4 pb-12">
        <ReviewsSkeleton />
      </div>
    </div>
  );
}

export function ReviewsEmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center px-4">
      <div className="flex size-20 items-center justify-center rounded-full bg-white -border-light mb-5">
        <svg
          className="size-10 text-text-muted"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={1.5}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
          />
        </svg>
      </div>
      <h3 className="text-lg font-bold text-text-primary">No reviews yet</h3>
      <p className="mt-1 text-sm text-text-secondary max-w-sm">
        You haven&apos;t left any reviews for your past purchases. Share your experience with the community!
      </p>
    </div>
  );
}
