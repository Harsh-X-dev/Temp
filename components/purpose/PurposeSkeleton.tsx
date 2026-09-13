"use client";

import React from "react";

export default function PurposeSkeleton() {
  return (
    <div className="w-full min-h-screen flex flex-col bg-surface-subtle pb-6 sm:pb-8 font-['Montserrat']">
      {/* Top Header Bar */}
      <header className="sticky top-0 z-30 flex h-14 items-center justify-between bg-white px-4 md:px-6 lg:px-8 border-b border-[#F0EBE1]">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-full bg-[#f0ece6] animate-shimmer shrink-0" />
          <div className="h-5 w-36 sm:w-44 bg-[#ede8e1] rounded-[6px] animate-shimmer" />
        </div>

        {/* Right Search Action */}
        <div className="h-9 w-9 rounded-full bg-[#f0ece6] animate-shimmer shrink-0" />
      </header>

      {/* Main Content List */}
      <main className="mx-auto w-full max-w-3xl px-4 pt-4 md:px-6">
        {/* Eyebrow Label: FILTER JEWELRY BY INTENTION */}
        <div className="h-3.5 w-44 bg-[#ede8e1] rounded-[4px] animate-shimmer mb-3.5" />

        {/* Purpose Cards List */}
        <div className="flex flex-col gap-2.5 sm:gap-3">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <div
              key={i}
              className="flex items-center justify-between rounded-[16px] border border-[#EFEAE2] bg-white p-3.5 sm:p-4 shadow-[0_2px_6px_rgba(0,0,0,0.02)]"
            >
              {/* Left Info: Icon & Labels */}
              <div className="flex items-center gap-3.5 sm:gap-4">
                <div className="flex h-[46px] w-[46px] sm:h-[48px] sm:w-[48px] shrink-0 items-center justify-center rounded-[14px] bg-[#FFF5ED] border border-[#FDE5D4]/80">
                  <div className="h-5 w-5 rounded-[4px] bg-[#fed7aa]/60 animate-shimmer" />
                </div>
                <div className="flex flex-col">
                  <div className="h-4 w-24 sm:w-28 bg-[#ede8e1] rounded-[4px] animate-shimmer" />
                  <div className="h-3.5 w-36 sm:w-48 bg-[#ffedd5] rounded-[4px] animate-shimmer mt-1.5" />
                </div>
              </div>

              {/* Right Chevron Placeholder */}
              <div className="h-4 w-4 rounded-[4px] bg-[#ede8e1] animate-shimmer shrink-0 ml-2" />
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
