export default function CheckoutLoading() {
  return (
    <div className="min-h-screen bg-[#fbf8f4] flex flex-col items-center w-full">
      <div className="w-full max-w-full md:max-w-[480px] mx-auto min-h-screen flex flex-col bg-[#fbf8f4] relative md:border-x md:border-[#e5e0da]">
        {/* Header */}
        <header className="sticky top-0 z-50 flex h-[56px] items-center justify-between border-b border-[#e5e0da] bg-white px-4">
          <div className="flex items-center gap-3">
            <div className="size-8 rounded-full animate-shimmer" />
            <div className="h-5 w-24 rounded-[6px] animate-shimmer" />
          </div>
        </header>

        {/* Content */}
        <main className="w-full px-[16px] pt-[16px] pb-24 flex flex-col gap-[16px] flex-1">
          {/* Item shimmer */}
          <div className="h-[90px] w-full rounded-[16px] border border-[#e5e0da] bg-white p-4 animate-shimmer" />

          {/* Address shimmer */}
          <div className="h-[100px] w-full rounded-[16px] border border-[#e5e0da] bg-white p-4 animate-shimmer" />

          {/* Coupon shimmer */}
          <div className="h-[64px] w-full rounded-[16px] border border-[#e5e0da] bg-white p-4 animate-shimmer" />

          {/* Bill summary shimmer */}
          <div className="h-[200px] w-full rounded-[16px] border border-[#e5e0da] bg-white p-4 animate-shimmer" />
        </main>
      </div>
    </div>
  );
}
