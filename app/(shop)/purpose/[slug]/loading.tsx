export default function PurposeDetailLoading() {
  return (
    <div className="w-full min-h-[100dvh] flex flex-col bg-surface-subtle pb-24 lg:pb-12">
      {/* Header Skeleton */}
      <div className="flex h-14 items-center justify-between bg-white px-4 md:px-6 lg:px-8 border-b border-border-subtle">
        <div className="flex items-center gap-3">
          <div className="size-9 rounded-full bg-border-strong animate-pulse" />
          <div className="h-5 w-24 rounded bg-border-strong animate-pulse" />
        </div>
        <div className="size-9 rounded-full bg-border-strong animate-pulse" />
      </div>

      <div className="mx-auto w-full max-w-5xl flex flex-col">
        {/* Banner Skeleton */}
        <div className="h-[200px] sm:h-[260px] md:h-[300px] w-full bg-border-strong animate-pulse" />

        {/* Intro Skeleton */}
        <div className="bg-white px-4 py-5 sm:px-6 sm:py-6 border-b border-border-subtle flex flex-col gap-2.5">
          <div className="h-6 w-3/4 rounded bg-border-strong animate-pulse" />
          <div className="h-4 w-full rounded bg-border-strong animate-pulse" />
          <div className="h-4 w-5/6 rounded bg-border-strong animate-pulse" />
        </div>

        {/* Products Grid Skeleton */}
        <div className="px-4 pt-5 pb-8 sm:px-6">
          <div className="h-6 w-40 rounded bg-border-strong animate-pulse mb-4" />
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="flex flex-col gap-2">
                <div className="aspect-square w-full rounded-[12px] bg-border-strong animate-pulse" />
                <div className="h-4 w-3/4 rounded bg-border-strong animate-pulse" />
                <div className="h-4 w-1/2 rounded bg-border-strong animate-pulse" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
