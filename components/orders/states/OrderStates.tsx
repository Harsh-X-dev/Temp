export function OrderHistorySkeleton() {
  return (
    <div className="flex flex-col gap-4 w-full">
      {[...Array(5)].map((_, i) => (
        <div
          key={i}
          className="bg-white border border-[#e5e0da] rounded-[12px] p-4 flex flex-col gap-3 w-full"
        >
          {/* Top row */}
          <div className="flex items-center justify-between w-full">
            <div className="animate-shimmer h-[14px] w-[120px] rounded-[4px]" />
            <div className="animate-shimmer h-[12px] w-[80px] rounded-[4px]" />
          </div>

          {/* Product row */}
          <div className="flex items-center gap-3 w-full">
            <div className="animate-shimmer size-16 rounded-[8px] shrink-0" />
            <div className="flex flex-1 flex-col gap-2 min-w-0">
              <div className="animate-shimmer h-[14px] w-[160px] max-w-[70%] rounded-[4px]" />
              <div className="animate-shimmer h-[12px] w-[80px] rounded-[4px]" />
              <div className="animate-shimmer h-[14px] w-[60px] rounded-[4px]" />
            </div>
          </div>

          {/* Status / Action row */}
          <div className="flex items-center justify-between w-full">
            <div className="animate-shimmer h-[12px] w-[120px] rounded-[4px]" />
            <div className="animate-shimmer h-[28px] w-[80px] rounded-[14px] shrink-0" />
          </div>
        </div>
      ))}
    </div>
  );
}

/** Full-page skeleton matching Figma node 1482:1169 */
export function OrderHistoryPageSkeleton() {
  return (
    <div className="bg-[#fbf8f4] flex-1 h-full flex flex-col w-full">
      {/* Header skeleton */}
      <header className="bg-white border-b border-[#e5e0da] flex h-[56px] items-center gap-3 px-[16px] shrink-0 w-full">
        <div className="animate-shimmer size-8 rounded-full shrink-0" />
        <div className="animate-shimmer h-[18px] w-[127px] rounded-[6px] shrink-0" />
      </header>

      {/* Content skeleton */}
      <div className="flex flex-col gap-4 px-[16px] pt-4 pb-6 w-full">
        {/* Filter pills skeleton */}
        <div className="flex gap-2 overflow-x-auto no-scrollbar -mx-[16px] px-[16px]">
          <div className="animate-shimmer h-8 w-[44px] rounded-[18px] shrink-0" />
          <div className="animate-shimmer h-8 w-[94px] rounded-[18px] shrink-0" />
          <div className="animate-shimmer h-8 w-[79px] rounded-[18px] shrink-0" />
          <div className="animate-shimmer h-8 w-[86px] rounded-[18px] shrink-0" />
          <div className="animate-shimmer h-8 w-[88px] rounded-[18px] shrink-0" />
        </div>

        {/* Cards skeleton */}
        <OrderHistorySkeleton />
      </div>
    </div>
  );
}

export function OrderTrackingPageSkeleton() {
  return (
    <div className="bg-[#fbf8f4] min-h-screen flex flex-col font-['Montserrat']">
      {/* Header */}
      <header className="bg-white border-b border-[#e5e0da] flex h-[56px] items-center gap-3 px-[16px] shrink-0 w-full">
        <div className="animate-shimmer size-8 rounded-full shrink-0" />
        <div className="animate-shimmer h-[18px] w-[140px] rounded-[6px] shrink-0" />
      </header>

      {/* Content */}
      <div className="flex-1 max-w-lg mx-auto w-full pt-4 pb-12 px-[16px] space-y-4">
        <div className="bg-white border border-[#e5e0da] rounded-[16px] p-4 flex flex-col gap-3">
          <div className="flex justify-between items-center">
            <div className="h-4 w-32 rounded animate-shimmer" />
            <div className="h-6 w-20 rounded-full animate-shimmer" />
          </div>
          <div className="flex gap-3">
            <div className="size-16 rounded-[8px] animate-shimmer shrink-0" />
            <div className="flex-1 flex flex-col gap-2">
              <div className="h-4 w-40 rounded animate-shimmer" />
              <div className="h-3 w-24 rounded animate-shimmer" />
            </div>
          </div>
        </div>

        <div className="bg-white border border-[#e5e0da] rounded-[16px] p-4 flex flex-col gap-4">
          <div className="h-4 w-28 rounded animate-shimmer" />
          <div className="h-32 w-full rounded-[12px] animate-shimmer" />
        </div>

        <div className="bg-white border border-[#e5e0da] rounded-[16px] p-4 flex flex-col gap-2">
          <div className="h-4 w-36 rounded animate-shimmer" />
          <div className="h-3 w-48 rounded animate-shimmer" />
          <div className="h-3 w-32 rounded animate-shimmer" />
        </div>

        <div className="bg-white border border-[#e5e0da] rounded-[16px] p-4 flex flex-col gap-2">
          <div className="h-4 w-32 rounded animate-shimmer" />
          <div className="h-20 w-full rounded-[8px] animate-shimmer" />
        </div>
      </div>
    </div>
  );
}

import Link from 'next/link';

export function OrdersEmptyState() {
  return (
    <div className="flex flex-col items-center justify-center w-full min-h-[50vh] px-6 py-12 md:py-24 mt-12 md:mt-16">
      {/* Illustration Container */}
      <div className="flex h-[160px] w-[160px] items-center justify-center rounded-full bg-[#fcf9f5] mb-6">
        <div className="relative h-[100px] w-[100px] flex items-center justify-center">
          <svg
            className="size-16 text-[#d08f52]"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={1.2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
          </svg>
        </div>
      </div>

      {/* Message Text */}
      <h3 className="text-[18px] font-bold text-text-primary text-center mb-2">
        No Orders Yet
      </h3>
      <p className="text-[14px] text-text-secondary text-center max-w-[280px] md:max-w-sm mb-8 leading-relaxed">
        There are no orders on your history list yet. Start exploring and discover your lucky gemstones.
      </p>

      {/* Actions */}
      <div className="flex w-full max-w-[364px] gap-4">
        <Link 
          href="/wishlist" 
          className="flex-1 bg-primary-orange text-white font-semibold text-[15px] h-[50px] rounded-[24px] flex items-center justify-center hover:bg-primary-orange-hover active:scale-[0.98] transition-all"
        >
          Wishlist
        </Link>
        <Link 
          href="/collection/all" 
          className="flex-1 bg-primary-orange text-white font-semibold text-[15px] h-[50px] rounded-[24px] flex items-center justify-center hover:bg-primary-orange-hover active:scale-[0.98] transition-all"
        >
          Shop Now
        </Link>
      </div>
    </div>
  );
}

