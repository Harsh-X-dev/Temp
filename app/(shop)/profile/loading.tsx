export default function ProfileLoading() {
  return (
    <div className="flex min-h-screen w-full flex-col bg-[#fbf8f4]">
      {/* Header */}
      <header className="sticky top-0 z-50 flex h-[56px] items-center justify-between border-b border-[#e5e0da] bg-white px-4">
        <div className="flex items-center gap-3">
          <div className="size-8 rounded-full animate-shimmer" />
          <div className="h-5 w-24 rounded-[6px] animate-shimmer" />
        </div>
      </header>

      {/* Content */}
      <main className="flex-1 w-full max-w-lg mx-auto p-4 flex flex-col gap-4">
        {/* Profile hero shimmer */}
        <div className="flex items-center gap-4 rounded-[16px] border border-[#e5e0da] bg-white p-4">
          <div className="size-[64px] rounded-full animate-shimmer shrink-0" />
          <div className="flex-1 space-y-2">
            <div className="h-5 w-36 rounded animate-shimmer" />
            <div className="h-4 w-28 rounded animate-shimmer" />
          </div>
        </div>

        {/* Menu rows shimmer */}
        <div className="rounded-[16px] border border-[#e5e0da] bg-white divide-y divide-[#e5e0da]">
          {[1, 2, 3, 4].map((n) => (
            <div key={n} className="flex items-center justify-between p-4">
              <div className="flex items-center gap-3">
                <div className="size-8 rounded-[8px] animate-shimmer" />
                <div className="h-4 w-32 rounded animate-shimmer" />
              </div>
              <div className="size-4 rounded animate-shimmer" />
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
