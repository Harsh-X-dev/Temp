export default function ShopLoading() {
  return (
    <div className="flex w-full max-w-full min-w-0 flex-col overflow-x-hidden bg-surface-subtle pb-16">
      {/* 1. Hero Banner Carousel Shimmer (Exact full-bleed geometry) */}
      <div className="mx-auto w-full max-w-[1920px] min-w-0">
        <div className="relative flex h-[440px] sm:h-[500px] md:h-[600px] lg:h-[700px] w-full flex-col items-center justify-center overflow-hidden bg-[#ede8e1] animate-shimmer">
          {/* Centered Content Shimmer */}
          <div className="flex flex-col items-center justify-center gap-3 sm:gap-4 md:gap-5 px-4 w-full">
            {/* Subtitle Pill */}
            <div className="h-3 w-28 sm:w-36 rounded-full bg-white/40 animate-pulse" />
            {/* Main Title Lines */}
            <div className="h-8 sm:h-10 md:h-12 w-[70%] max-w-[440px] rounded-lg bg-white/50 animate-pulse" />
            <div className="h-6 sm:h-8 md:h-10 w-[45%] max-w-[280px] rounded-lg bg-white/50 animate-pulse" />
            {/* CTA Button Pill */}
            <div className="mt-2 sm:mt-4 h-10 sm:h-11 w-32 sm:w-36 rounded-full bg-white/70 animate-pulse shadow-sm" />
          </div>

          {/* Carousel Pagination Dots */}
          <div className="absolute bottom-6 left-0 right-0 flex items-center justify-center gap-2">
            <div className="h-2 w-6 rounded-full bg-white/80" />
            <div className="h-2 w-2 rounded-full bg-white/40" />
            <div className="h-2 w-2 rounded-full bg-white/40" />
          </div>
        </div>
      </div>

      {/* 2. Shop by Purpose Row Shimmer (6 active items) */}
      <section aria-label="Loading Shop by Purpose" className="mx-auto mt-4 sm:mt-6 w-full max-w-[1920px]">
        <div className="flex items-center justify-between pb-3 pt-2 px-4 md:px-6 lg:px-8">
          <div className="h-5 w-36 sm:w-44 rounded-[6px] animate-shimmer" />
          <div className="h-4 w-14 rounded-[4px] animate-shimmer" />
        </div>
        <div className="no-scrollbar flex items-center overflow-x-auto py-2">
          <div className="shrink-0 w-4 md:w-6 lg:w-8" />
          <div className="flex items-center gap-4 sm:gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="flex flex-col items-center gap-2 shrink-0">
                <div className="h-[64px] w-[64px] sm:h-[68px] sm:w-[68px] rounded-[18px] bg-[#FFF5ED] border border-[#FDE5D4]/80 animate-shimmer" />
                <div className="h-3 w-12 sm:w-14 rounded animate-shimmer mt-0.5" />
              </div>
            ))}
          </div>
          <div className="shrink-0 w-4 md:w-6 lg:w-8" />
        </div>
      </section>

      {/* 3. Shop by Category (4 Rectangular Cards) */}
      <section aria-label="Loading Shop by Category" className="mx-auto mt-2 sm:mt-4 w-full max-w-[1920px]">
        <div className="flex items-center justify-between pb-3 pt-2 sm:pt-4 px-4 md:px-6 lg:px-8">
          <div className="h-5 w-40 sm:w-48 rounded-[6px] animate-shimmer" />
          <div className="h-4 w-14 rounded-[4px] animate-shimmer" />
        </div>
        <div className="grid grid-cols-1 gap-4 pb-6 px-4 sm:grid-cols-2 lg:grid-cols-4 md:px-6 lg:px-8">
          {[1, 2, 3, 4].map((n) => (
            <div
              key={n}
              className="h-[200px] w-full rounded-[12px] bg-[#ede8e1] animate-shimmer p-5 flex flex-col justify-end gap-2"
            >
              <div className="h-6 w-32 rounded-[6px] bg-white/40" />
              <div className="h-8 w-20 rounded-[20px] bg-white/60" />
            </div>
          ))}
        </div>
      </section>

      {/* 4. Bestsellers Section (Horizontal Scroll Matching UI) */}
      <section aria-label="Loading Bestsellers" className="mx-auto mt-6 w-full max-w-[1920px] overflow-hidden">
        <div className="flex items-center justify-between pb-4 pt-2 px-4 md:px-6 lg:px-8">
          <div className="h-5 w-32 sm:w-40 rounded-[6px] animate-shimmer" />
          <div className="h-4 w-14 rounded-[4px] animate-shimmer" />
        </div>
        <div className="no-scrollbar flex items-start overflow-x-auto pb-8">
          <div className="shrink-0 w-4 md:w-6 lg:w-8" />
          <div className="flex items-start gap-4">
            {[1, 2, 3, 4, 5].map((n) => (
              <div key={n} className="flex w-[160px] shrink-0 flex-col gap-3">
                {/* Product Image Frame */}
                <div className="h-[180px] w-full rounded-[12px] bg-[#ede8e1] animate-shimmer" />
                {/* Title */}
                <div className="h-3.5 w-[85%] rounded-[4px] animate-shimmer" />
                {/* Rating line */}
                <div className="h-2.5 w-[50%] rounded-[4px] animate-shimmer" />
                {/* Price */}
                <div className="h-4 w-16 rounded-[4px] animate-shimmer" />
              </div>
            ))}
          </div>
          <div className="shrink-0 w-4 md:w-6 lg:w-8" />
        </div>
      </section>

      {/* 5. Split Story Banner Shimmer */}
      <div className="mx-auto mt-4 w-full max-w-[1920px] min-w-0">
        <div className="relative flex h-[280px] sm:h-[320px] md:h-[380px] lg:h-[420px] w-full flex-col justify-between overflow-hidden bg-[#ede8e1] animate-shimmer p-[24px] sm:p-8 md:p-10 lg:p-12">
          <div className="flex flex-col gap-2">
            <div className="h-3 w-28 rounded-full bg-white/40" />
            <div className="h-7 sm:h-9 w-48 sm:w-64 rounded-lg bg-white/50" />
          </div>
          <div className="flex w-full max-w-full sm:max-w-md items-center gap-[12px]">
            <div className="h-10 flex-1 rounded-[20px] bg-white/70" />
            <div className="h-10 flex-1 rounded-[20px] bg-white/70" />
          </div>
        </div>
      </div>

      {/* 6. Mukhi Series Story Banner Shimmer */}
      <div className="mx-auto mt-3 sm:mt-4 w-full max-w-[1920px] px-4 md:px-6 lg:px-8 pb-1">
        <div className="h-[180px] sm:h-[200px] md:h-[240px] w-full rounded-[16px] bg-[#ede8e1] animate-shimmer p-5 flex flex-col justify-between">
          <div className="h-5 w-36 rounded bg-white/50" />
          <div className="h-4 w-24 rounded bg-white/60" />
        </div>
      </div>

      {/* 7. Trust Banner Shimmer */}
      <div className="mx-auto mt-4 w-full max-w-[1920px] border-y border-border-strong bg-surface-subtle px-4 py-4 md:px-10 lg:px-20">
        <div className="flex w-full items-center justify-between">
          {[1, 2, 3].map((n) => (
            <div key={n} className="flex flex-1 flex-col items-center gap-2 px-2">
              <div className="size-5 rounded-full animate-shimmer" />
              <div className="h-3 w-20 rounded animate-shimmer" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
