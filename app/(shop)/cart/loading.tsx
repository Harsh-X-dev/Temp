export default function CartLoading() {
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
        {/* Delivery address shimmer */}
        <div className="h-[76px] w-full rounded-[16px] border border-[#e5e0da] bg-white p-4 animate-shimmer" />

        {/* Cart items shimmer */}
        {[1, 2].map((n) => (
          <div key={n} className="flex gap-3 rounded-[16px] border border-[#e5e0da] bg-white p-4">
            <div className="size-[72px] rounded-[12px] animate-shimmer shrink-0" />
            <div className="flex-1 flex flex-col gap-2">
              <div className="h-4 w-3/4 rounded animate-shimmer" />
              <div className="h-3 w-1/2 rounded animate-shimmer" />
              <div className="h-5 w-20 rounded animate-shimmer mt-2" />
            </div>
          </div>
        ))}

        {/* Bill summary shimmer */}
        <div className="h-[180px] w-full rounded-[16px] border border-[#e5e0da] bg-white p-4 animate-shimmer" />
      </main>
    </div>
  );
}
