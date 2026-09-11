export default function CollectionLoading() {
  return (
    <div className="w-full animate-pulse">
      {/* 1. Page Heading Skeleton */}
      <div className="mb-4 md:mb-5 lg:mb-6">
        <div className="h-7 w-48 sm:h-8 sm:w-64 rounded-md bg-[#ece7df]" />
      </div>

      {/* 2. Filter / Sort Action Bar Skeleton */}
      <div className="mb-5 md:mb-6 flex flex-col gap-4 w-full">
        <div className="flex items-center justify-between w-full">
          {/* Filter button */}
          <div className="h-8 sm:h-9 w-24 rounded-full bg-[#ece7df]" />
          {/* Sort anchor */}
          <div className="h-8 sm:h-9 w-32 rounded-md bg-[#ece7df]" />
        </div>
        {/* Product count */}
        <div className="h-4 w-20 rounded bg-[#ece7df]" />
      </div>

      {/* 3. Product Grid Skeleton — Matches exact ProductGrid responsive layout */}
      <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 md:gap-5 lg:grid-cols-4 lg:gap-6">
        {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
          <div key={n} className="flex min-w-0 flex-1 flex-col w-full">
            {/* Product Image */}
            <div className="aspect-square w-full rounded-[12px] bg-[#ece7df]" />

            {/* Product Info */}
            <div className="flex flex-col mt-2.5 gap-1.5 w-full">
              {/* Title */}
              <div className="h-4 w-4/5 rounded bg-[#ece7df]" />
              {/* Rating */}
              <div className="h-3 w-1/3 rounded bg-[#ece7df]" />
              {/* Price & MRP */}
              <div className="flex items-baseline gap-2 mt-0.5">
                <div className="h-4 w-16 rounded bg-[#ece7df]" />
                <div className="h-3 w-12 rounded bg-[#ece7df]" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
