export default function ShopLoading() {
  return (
    <div className="flex w-full max-w-full min-w-0 flex-col overflow-x-hidden bg-surface-subtle pb-16">
      {/* 1. Hero Banner Carousel Shimmer (Matches BannerCarousel) */}
      <div className="mx-auto w-full max-w-[1920px] px-4 md:px-6 lg:px-8 pt-4">
        <div className="w-full aspect-[16/9] md:aspect-[21/9] max-h-[480px] rounded-[16px] animate-shimmer" />
      </div>

      {/* 2. Shop by Category (Matches CategoryGrid - 4 Rectangular Cards) */}
      <section className="mx-auto mt-6 w-full max-w-[1920px] px-4 md:px-6 lg:px-8">
        <div className="flex items-center justify-between pb-3 pt-2">
          <div className="h-6 w-44 rounded-[6px] animate-shimmer" />
          <div className="h-4 w-16 rounded-[4px] animate-shimmer" />
        </div>
        <div className="grid grid-cols-1 gap-4 pb-6 sm:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((n) => (
            <div
              key={n}
              className="h-[180px] sm:h-[200px] w-full rounded-[12px] animate-shimmer p-5 flex flex-col justify-end gap-2"
            >
              <div className="h-6 w-32 rounded-[6px] bg-white/40" />
              <div className="h-7 w-20 rounded-[20px] bg-white/60" />
            </div>
          ))}
        </div>
      </section>

      {/* 3. Bestsellers Section (Matches BestsellersSection) */}
      <section className="mx-auto mt-2 w-full max-w-[1920px] px-4 md:px-6 lg:px-8">
        <div className="flex items-center justify-between pb-4 pt-2">
          <div className="h-6 w-32 rounded-[6px] animate-shimmer" />
          <div className="h-4 w-16 rounded-[4px] animate-shimmer" />
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((n) => (
            <div
              key={n}
              className="flex flex-col gap-3 rounded-[16px] bg-white border border-[#e5e0da] p-3 shadow-xs"
            >
              <div className="aspect-square w-full rounded-[12px] animate-shimmer" />
              <div className="h-4 w-3/4 rounded-[4px] animate-shimmer mt-1" />
              <div className="h-3 w-1/2 rounded-[4px] animate-shimmer" />
              <div className="flex items-center justify-between pt-2">
                <div className="h-5 w-20 rounded-[4px] animate-shimmer" />
                <div className="h-8 w-16 rounded-[18px] animate-shimmer" />
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
