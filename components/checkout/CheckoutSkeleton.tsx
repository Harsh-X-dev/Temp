"use client";

import React from "react";

export default function CheckoutSkeleton() {
  return (
    <div className="min-h-[100dvh] bg-[#fbf8f4] flex flex-col items-center w-full font-['Montserrat']">
      <div className="w-full max-w-full md:max-w-[480px] mx-auto min-h-[100dvh] flex flex-col bg-[#fbf8f4] relative md:border-x md:border-[#e5e0da] shadow-sm">
        {/* Header matching Figma node 544:110 */}
        <header className="sticky top-0 z-20 w-full bg-white border-b border-[#e5e0da] h-[56px] px-[16px] flex items-center justify-between shrink-0">
          <div className="flex items-center gap-[12px]">
            <div className="size-[28px] rounded-full bg-[#f0ece6] animate-shimmer shrink-0" />
            <div className="h-5 w-36 bg-[#ede8e1] rounded-[6px] animate-shimmer" />
          </div>
          <div className="bg-[#f5f1ea] px-[10px] py-[4px] rounded-[24px]">
            <div className="h-3.5 w-10 bg-[#e5e0da] rounded animate-shimmer" />
          </div>
        </header>

        {/* Main Content matching Figma node 544:116 */}
        <main className="w-full px-[16px] pt-[16px] pb-[140px] md:pb-[150px] flex flex-col gap-[16px] flex-1">
          {/* 1. Item Card matching Figma node 544:117 */}
          <div className="bg-white border border-[#e5e0da] rounded-[12px] p-[16px] flex gap-[12px] items-center w-full shadow-xs">
            <div className="size-[60px] rounded-[12px] bg-[#f0ece6] animate-shimmer shrink-0" />
            <div className="flex flex-1 flex-col gap-[6px] min-w-0">
              <div className="h-4 w-32 bg-[#ede8e1] rounded-[4px] animate-shimmer" />
              <div className="h-3 w-24 bg-[#f0ece6] rounded-[4px] animate-shimmer" />
              <div className="h-3 w-12 bg-[#f0ece6] rounded-[4px] animate-shimmer" />
            </div>
            <div className="h-5 w-14 bg-[#ff5400]/20 rounded-[4px] animate-shimmer shrink-0" />
          </div>

          {/* 2. Deliver to Address Card matching Figma node 544:132 */}
          <div className="bg-white border border-[#e5e0da] rounded-[12px] p-[16px] flex flex-col gap-[10px] items-start w-full shadow-xs">
            <div className="flex items-center justify-between w-full">
              <div className="flex gap-[8px] items-center">
                <div className="size-[24px] rounded-full bg-[#FFF5ED] flex items-center justify-center shrink-0">
                  <div className="size-3.5 bg-[#FFD7C2] rounded-full animate-shimmer" />
                </div>
                <div className="h-4 w-20 bg-[#ede8e1] rounded-[4px] animate-shimmer" />
              </div>
              <div className="h-4 w-14 bg-[#ff5400]/20 rounded-[4px] animate-shimmer" />
            </div>
            <div className="flex flex-col gap-[4px] w-full pl-[32px]">
              <div className="h-4 w-28 bg-[#ede8e1] rounded-[4px] animate-shimmer" />
              <div className="h-3 w-48 bg-[#f0ece6] rounded-[4px] animate-shimmer" />
              <div className="h-3 w-28 bg-[#f0ece6] rounded-[4px] animate-shimmer" />
            </div>
          </div>

          {/* 3. Coupon Card matching Figma node 544:139 */}
          <div className="bg-white border border-[#e5e0da] rounded-[12px] p-[16px] flex items-center justify-between w-full shadow-xs">
            <div className="flex gap-[10px] items-center">
              <div className="size-[32px] rounded-[16px] bg-[#FFF5ED] flex items-center justify-center shrink-0">
                <div className="size-4 bg-[#FFD7C2] rounded-full animate-shimmer" />
              </div>
              <div className="flex flex-col gap-[3px]">
                <div className="h-4 w-32 bg-[#ede8e1] rounded-[4px] animate-shimmer" />
                <div className="h-3 w-16 bg-[#f0ece6] rounded-[4px] animate-shimmer" />
              </div>
            </div>
            <div className="h-4 w-14 bg-[#ff5400]/20 rounded-[4px] animate-shimmer" />
          </div>

          {/* 4. Bill Summary Breakdown matching Figma node 544:148 */}
          <div className="border-t border-[#e5e0da] pt-[16px] flex flex-col gap-[12px] items-start w-full">
            <div className="flex justify-between items-center w-full">
              <div className="h-3.5 w-16 bg-[#ede8e1] rounded animate-shimmer" />
              <div className="h-3.5 w-12 bg-[#ede8e1] rounded animate-shimmer" />
            </div>
            <div className="flex justify-between items-center w-full">
              <div className="h-3.5 w-16 bg-[#ede8e1] rounded animate-shimmer" />
              <div className="h-3.5 w-10 bg-[#ede8e1] rounded animate-shimmer" />
            </div>
            <div className="h-px bg-[#e5e0da] w-full shrink-0" />
            <div className="flex justify-between items-center w-full">
              <div className="h-4 w-14 bg-[#211e1a]/20 rounded animate-shimmer" />
              <div className="h-6 w-20 bg-[#ff5400]/30 rounded animate-shimmer" />
            </div>
          </div>
        </main>

        {/* Sticky Payment Footer matching Figma node 544:166 */}
        <footer
          className="fixed inset-x-0 bottom-0 z-40 w-full bg-white border-t border-[#e5e0da]"
          style={{
            bottom: 0,
            paddingBottom: "max(env(safe-area-inset-bottom, 0px), 0px)",
            boxShadow: "0 -2px 10px rgba(0,0,0,0.05), 0 50px 0 50px #ffffff",
          }}
        >
          <div className="relative mx-auto w-full max-w-[480px] px-[16px] pt-2.5 pb-2 flex items-center justify-between">
            <div className="flex flex-col gap-[3px] items-start">
              <div className="h-3 w-20 bg-[#f0ece6] rounded animate-shimmer" />
              <div className="h-5 w-16 bg-[#ede8e1] rounded animate-shimmer" />
            </div>
            <div className="h-[50px] w-[180px] rounded-[24px] bg-[#ff5400]/40 animate-shimmer" />
          </div>
        </footer>
      </div>
    </div>
  );
}
