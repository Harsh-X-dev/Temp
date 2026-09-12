export default function CollectionLoading() {
  return (
    <div className="w-full flex flex-col pt-1 pb-10">
      {/* 1. Page Heading Skeleton (Figma Node 1484:99) */}
      <div className="mb-4 md:mb-5 lg:mb-6">
        <div className="h-5 w-28 sm:w-36 rounded-[6px] animate-shimmer" />
      </div>

      {/* 2. Filter / Sort Action Bar Skeleton (Figma Node 1484:100) */}
      <div className="flex items-center justify-between w-full mb-3">
        {/* Filter button pill */}
        <div className="h-[31px] w-[91px] rounded-[20px] animate-shimmer" />
        {/* Sort dropdown line */}
        <div className="h-[14px] w-[100px] rounded-[4px] animate-shimmer" />
      </div>

      {/* 3. Product Count Skeleton Line (Figma Node 1484:103) */}
      <div className="mb-4">
        <div className="h-[15px] w-[80px] rounded-[4px] animate-shimmer" />
      </div>

      {/* 4. Product Grid Skeleton — Matches exact ProductGrid responsive layout (Figma Node 1484:104) */}
      <div className="grid grid-cols-2 gap-3.5 gap-y-6 sm:gap-4 sm:gap-y-7 md:grid-cols-3 md:gap-5 md:gap-y-8 lg:grid-cols-4 lg:gap-6">
        {[...Array(8)].map((_, i) => (
          <div key={i} className="flex min-w-0 flex-1 flex-col w-full">
            {/* Product Image Skeleton */}
            <div className="aspect-square w-full rounded-[12px] animate-shimmer" />

            {/* Product Info Skeleton */}
            <div className="flex flex-col mt-2.5 gap-1.5 w-full">
              {/* Title line */}
              <div className="h-3.5 w-[85%] rounded-[6px] animate-shimmer" />
              {/* Rating line */}
              <div className="h-2.5 w-[50%] rounded-[4px] animate-shimmer" />
              {/* Price line */}
              <div className="h-3.5 w-[45%] rounded-[6px] animate-shimmer mt-0.5" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

