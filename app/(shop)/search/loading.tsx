export default function SearchLoading() {
  return (
    <div className="flex flex-col flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 md:px-8 bg-white min-h-full pt-3 pb-8">
      {/* Top Search Input Bar Skeleton */}
      <div className="w-full max-w-2xl mx-auto pt-1 mb-3">
        <div className="flex items-center gap-2.5 w-full">
          {/* Back button circle */}
          <div className="size-9 rounded-full animate-shimmer shrink-0" />

          {/* Search input bar with placeholder and search icon */}
          <div className="flex-1 h-[44px] rounded-[24px] border-[1.5px] border-[#e5e0da] bg-[#fbf8f4] flex items-center justify-between px-4">
            <div className="h-3.5 w-[140px] sm:w-[180px] rounded-full animate-shimmer" />
            <div className="size-4.5 rounded-full animate-shimmer shrink-0" />
          </div>
        </div>
      </div>

      {/* Main Content Skeleton */}
      <div className="max-w-2xl mx-auto py-2 space-y-6 w-full">
        {/* Trending Searches Skeleton */}
        <section>
          <div className="h-4 w-32 rounded animate-shimmer mb-3" />
          <div className="flex flex-wrap gap-2">
            <div className="h-[34px] w-[235px] rounded-full animate-shimmer" />
            <div className="h-[34px] w-[265px] rounded-full animate-shimmer" />
            <div className="h-[34px] w-[115px] rounded-full animate-shimmer" />
            <div className="h-[34px] w-[135px] rounded-full animate-shimmer" />
            <div className="h-[34px] w-[170px] rounded-full animate-shimmer" />
          </div>
        </section>

        {/* Shop by Category Skeleton */}
        <section className="w-full">
          <div className="flex items-center justify-between mb-3">
            <div className="h-4 w-32 rounded animate-shimmer" />
            <div className="h-3.5 w-16 rounded animate-shimmer" />
          </div>
          <div className="-mx-4 sm:-mx-6 md:-mx-8 pl-4 sm:pl-6 md:pl-8 flex items-center gap-3 overflow-hidden py-1">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div
                key={i}
                className="flex flex-col items-center justify-start p-2.5 pt-3 gap-2 shrink-0 bg-[#f5f1ea] rounded-[14px] min-w-[94px] max-w-[104px] h-[108px]"
              >
                <div className="size-[44px] rounded-full animate-shimmer shrink-0" />
                <div className="w-[60px] h-[10px] rounded animate-shimmer mt-0.5" />
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
