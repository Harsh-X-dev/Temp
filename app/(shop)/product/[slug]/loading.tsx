export default function ProductDetailLoading() {
  return (
    <div className="min-h-screen bg-[#fbf8f4] flex flex-col font-['Montserrat']">
      {/* Header */}
      <header className="bg-white border-b border-[#e5e0da] flex h-[56px] items-center justify-between px-4 sticky top-0 z-20">
        <div className="size-8 rounded-full animate-shimmer" />
        <div className="flex items-center gap-3">
          <div className="size-8 rounded-full animate-shimmer" />
          <div className="size-8 rounded-full animate-shimmer" />
        </div>
      </header>

      {/* Hero Image Skeleton */}
      <div className="w-full max-w-lg mx-auto flex flex-col gap-4 p-4 pb-28">
        <div className="w-full aspect-square rounded-[20px] bg-white border border-[#e5e0da] p-6 flex items-center justify-center">
          <div className="size-48 rounded-full animate-shimmer" />
        </div>

        {/* Thumbnail row */}
        <div className="flex gap-2 justify-center">
          {[1, 2, 3, 4].map((n) => (
            <div key={n} className="size-14 rounded-[10px] bg-white border border-[#e5e0da] animate-shimmer" />
          ))}
        </div>

        {/* Product Details Card */}
        <div className="bg-white border border-[#e5e0da] rounded-[16px] p-4 flex flex-col gap-3">
          <div className="h-6 w-3/4 rounded animate-shimmer" />
          <div className="h-4 w-1/3 rounded animate-shimmer" />
          <div className="flex items-center gap-3 mt-1">
            <div className="h-7 w-28 rounded animate-shimmer" />
            <div className="h-5 w-20 rounded animate-shimmer" />
          </div>
        </div>

        {/* Specifications Card */}
        <div className="bg-white border border-[#e5e0da] rounded-[16px] p-4 flex flex-col gap-3">
          <div className="h-5 w-36 rounded animate-shimmer" />
          <div className="grid grid-cols-2 gap-3">
            {[1, 2, 3, 4].map((n) => (
              <div key={n} className="h-12 rounded-[8px] animate-shimmer" />
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Sticky CTA Skeleton */}
      <div className="fixed bottom-0 left-0 right-0 z-30 bg-white border-t border-[#e5e0da] p-4 flex justify-center">
        <div className="w-full max-w-lg flex gap-3">
          <div className="h-[48px] flex-1 rounded-[24px] animate-shimmer" />
          <div className="h-[48px] flex-1 rounded-[24px] animate-shimmer" />
        </div>
      </div>
    </div>
  );
}
