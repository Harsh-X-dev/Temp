export default function ProductDetailLoading() {
  return (
    <div className="min-h-screen bg-[#fbf8f4] flex flex-col font-['Montserrat']">
      {/* 1. Header Shimmer (Figma Node 1484:157) */}
      <header className="bg-white border-b border-[#e5e0da] flex h-[56px] items-center justify-between px-4 md:px-6 sticky top-0 z-20 w-full">
        {/* Left Back Arrow Circle */}
        <div className="size-[28px] rounded-full animate-shimmer shrink-0" />

        {/* Centered Logo Shimmer */}
        <div className="h-[34px] sm:h-[38px] w-[130px] sm:w-[162px] rounded-[8px] animate-shimmer shrink-0" />

        {/* Right Action Icons Shimmer (Share & Cart) */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="size-[24px] rounded-[6px] animate-shimmer" />
          <div className="size-[24px] rounded-[6px] animate-shimmer" />
        </div>
      </header>

      {/* 2. Main Content Area (Figma Node 1484:163) */}
      <main className="w-full max-w-7xl mx-auto flex flex-col md:flex-row gap-4 md:gap-12 px-4 md:px-8 pt-4 md:pt-8 pb-28 md:pb-12 flex-1">
        {/* Left Column: Image Area (Figma Node 1484:164) */}
        <div className="w-full md:w-1/2 flex flex-col gap-3">
          {/* Hero Image Skeleton */}
          <div className="h-[360px] sm:h-[392px] md:h-[520px] lg:h-[600px] w-full rounded-[12px] animate-shimmer" />

          {/* Thumbnails Row (Figma Node 1484:166) */}
          <div className="flex gap-2.5 overflow-hidden">
            {[...Array(4)].map((_, i) => (
              <div
                key={i}
                className="size-[70px] sm:size-[84px] rounded-[8px] animate-shimmer shrink-0"
              />
            ))}
          </div>
        </div>

        {/* Right Column: Details & Variant Selection (Figma Node 1484:171) */}
        <div className="w-full md:w-1/2 flex flex-col gap-4">
          {/* Title & Price Skeletons */}
          <div className="flex flex-col gap-2">
            <div className="h-[22px] w-[80%] rounded-[6px] animate-shimmer" />
            <div className="flex items-center gap-2.5 mt-1">
              <div className="h-[22px] w-[90px] rounded-[6px] animate-shimmer" />
              <div className="h-[16px] w-[60px] rounded-[4px] animate-shimmer" />
            </div>
          </div>

          {/* Variant Selector Card (Figma Node 1484:176) */}
          <div className="bg-white rounded-[12px] p-4 flex flex-col gap-3.5 border border-[#e5e0da] shadow-xs">
            {/* Variant Card Header */}
            <div className="flex items-center justify-between w-full">
              <div className="h-[18px] w-[120px] rounded-[6px] animate-shimmer" />
              <div className="h-[16px] w-[70px] rounded-[4px] animate-shimmer" />
            </div>

            {/* Option 1 Label & Chips */}
            <div className="flex flex-col gap-2">
              <div className="h-[14px] w-[50px] rounded-[4px] animate-shimmer" />
              <div className="flex gap-2">
                <div className="h-[32px] w-[60px] rounded-[8px] animate-shimmer" />
                <div className="h-[32px] w-[60px] rounded-[8px] animate-shimmer" />
              </div>
            </div>

            {/* Option 2 Label & Chips */}
            <div className="flex flex-col gap-2">
              <div className="h-[14px] w-[70px] rounded-[4px] animate-shimmer" />
              <div className="flex gap-2">
                <div className="h-[32px] w-[75px] rounded-[8px] animate-shimmer" />
                <div className="h-[32px] w-[75px] rounded-[8px] animate-shimmer" />
                <div className="h-[32px] w-[75px] rounded-[8px] animate-shimmer" />
              </div>
            </div>
          </div>

          {/* Section Tabs Bar (Figma Node 1484:311) */}
          <div className="flex gap-2 overflow-x-hidden py-1">
            <div className="h-[32px] w-[95px] rounded-[24px] animate-shimmer shrink-0" />
            <div className="h-[32px] w-[70px] rounded-[24px] animate-shimmer shrink-0" />
            <div className="h-[32px] w-[110px] rounded-[24px] animate-shimmer shrink-0" />
            <div className="h-[32px] w-[100px] rounded-[24px] animate-shimmer shrink-0" />
          </div>

          {/* Description Block (Figma Node 1484:316) */}
          <div className="flex flex-col gap-2 pt-1">
            <div className="h-[18px] w-[110px] rounded-[6px] animate-shimmer mb-1" />
            <div className="h-[14px] w-full rounded-[4px] animate-shimmer" />
            <div className="h-[14px] w-full rounded-[4px] animate-shimmer" />
            <div className="h-[14px] w-[80%] rounded-[4px] animate-shimmer" />
          </div>
        </div>
      </main>

      {/* 3. Bottom Sticky Action Bar (Figma Node 1484:191) */}
      <div className="fixed bottom-0 inset-x-0 bg-white h-[76px] sm:h-[88px] border-t border-[#e5e0da] px-4 md:px-6 py-3 flex items-center justify-center gap-3 z-30">
        <div className="w-full max-w-md flex gap-3">
          <div className="h-[48px] flex-1 rounded-[24px] animate-shimmer" />
          <div className="h-[48px] flex-1 rounded-[24px] animate-shimmer" />
        </div>
      </div>
    </div>
  );
}
