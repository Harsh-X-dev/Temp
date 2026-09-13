"use client";

import React from "react";

export default function WriteReviewSkeleton() {
  return (
    <div className="min-h-screen bg-white flex flex-col w-full justify-between -mb-16 lg:-mb-10 font-['Montserrat']">
      {/* Header */}
      <header className="sticky top-0 z-30 flex h-[56px] md:h-[64px] items-center px-4 md:px-8 border-b border-[#e5e0da] bg-white shrink-0">
        <div className="max-w-xl mx-auto w-full flex items-center">
          <div className="w-[28px] h-[28px] md:w-[36px] md:h-[36px] rounded-full bg-[#f0ece6] animate-shimmer shrink-0" />
          <div className="ml-3 h-5 md:h-6 w-36 bg-[#ede8e1] rounded-[6px] animate-shimmer" />
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 w-full max-w-xl mx-auto px-4 pt-3.5 pb-4 flex flex-col gap-4">
        {/* Product Card */}
        <div className="bg-[#fbf8f4] border border-[#e5e0da] rounded-[12px] p-3 flex items-center gap-3 shadow-2xs shrink-0">
          <div className="w-[56px] h-[56px] rounded-[8px] bg-[#f0ece6] animate-shimmer shrink-0" />
          <div className="flex flex-col gap-1.5 min-w-0 flex-1">
            <div className="h-4 w-36 bg-[#ede8e1] rounded-[4px] animate-shimmer" />
            <div className="h-4 w-16 bg-[#ff5400]/20 rounded-[4px] animate-shimmer" />
          </div>
        </div>

        {/* 1. Rating Section */}
        <div className="flex flex-col gap-2 shrink-0">
          <div className="h-4 w-24 bg-[#ede8e1] rounded-[4px] animate-shimmer" />
          <div className="flex items-center gap-2">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="size-[28px] md:size-[32px] rounded-full bg-[#f0ece6] animate-shimmer" />
            ))}
          </div>
        </div>

        {/* 2. Review Title */}
        <div className="flex flex-col gap-2 shrink-0">
          <div className="h-4 w-24 bg-[#ede8e1] rounded-[4px] animate-shimmer" />
          <div className="h-[44px] rounded-[10px] border border-[#e5e0da] bg-[#fafafa] animate-shimmer w-full" />
        </div>

        {/* 3. Your Review */}
        <div className="flex flex-col gap-2 shrink-0">
          <div className="h-4 w-24 bg-[#ede8e1] rounded-[4px] animate-shimmer" />
          <div className="h-[120px] rounded-[10px] border border-[#e5e0da] bg-[#fafafa] animate-shimmer w-full" />
        </div>

        {/* 4. Add Photos */}
        <div className="flex flex-col gap-2 shrink-0">
          <div className="h-4 w-36 bg-[#ede8e1] rounded-[4px] animate-shimmer" />
          <div className="w-[64px] h-[64px] rounded-[10px] border border-dashed border-[#e5e0da] bg-[#fafafa] animate-shimmer" />
          <div className="h-3 w-3/4 bg-[#f0ece6] rounded-[4px] animate-shimmer mt-1" />
        </div>
      </main>

      {/* Sticky Bottom Bar */}
      <footer className="sticky bottom-0 z-40 bg-white border-t border-[#e5e0da] px-4 pt-4 pb-[max(1.5rem,env(safe-area-inset-bottom))] md:pt-5 md:pb-6 shadow-sm">
        <div className="max-w-xl mx-auto w-full">
          <div className="w-full h-[48px] md:h-[52px] rounded-full bg-[#ff5400]/40 animate-shimmer" />
        </div>
      </footer>
    </div>
  );
}
