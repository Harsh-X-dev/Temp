"use client";

import React from "react";

interface CartSkeletonProps {
  isBuyNow?: boolean;
}

export default function CartSkeleton({ isBuyNow = true }: CartSkeletonProps) {
  return (
    <div className="min-h-[100dvh] bg-[#fbf8f4] flex flex-col items-center w-full font-['Montserrat']">
      <div className="w-full max-w-full md:max-w-[480px] mx-auto min-h-[100dvh] flex flex-col bg-[#fbf8f4] relative md:border-x md:border-[#e5e0da] shadow-sm">
        {/* Header */}
        <header className="sticky top-0 z-20 w-full bg-white border-b border-[#e5e0da] h-[56px] px-[16px] flex items-center justify-between shrink-0">
          <div className="flex items-center gap-[12px]">
            <div className="size-[28px] rounded-full bg-[#f0ece6] animate-shimmer" />
            <div className="h-5 w-24 bg-[#ede8e1] rounded-[6px] animate-shimmer" />
          </div>
          <div className="bg-[#f5f1ea] px-[10px] py-[4px] rounded-[24px]">
            <div className="h-3 w-10 bg-[#e5e0da] rounded animate-shimmer" />
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 w-full px-[24px] pt-[16px] pb-[140px] md:pb-[150px] flex flex-col gap-[16px]">
          {/* 1. Item Card */}
          <div className="bg-white border border-[#e5e0da] rounded-[16px] p-[16px] flex flex-col gap-[12px] shadow-sm">
            <div className="flex gap-[16px] items-start">
              {/* Product Thumbnail */}
              <div className="size-[72px] rounded-[12px] bg-[#f0ece6] animate-shimmer shrink-0" />

              {/* Details */}
              <div className="flex-1 flex flex-col gap-2">
                <div className="flex justify-between items-start">
                  <div className="h-4 w-3/4 bg-[#ede8e1] rounded-[4px] animate-shimmer" />
                  <div className="size-4 bg-[#f0ece6] rounded animate-shimmer" />
                </div>
                <div className="h-3 w-1/2 bg-[#f0ece6] rounded-[4px] animate-shimmer" />

                <div className="flex justify-between items-center mt-2">
                  <div className="h-7 w-20 rounded-[8px] bg-[#f5f1ea] animate-shimmer" />
                  <div className="h-5 w-16 bg-[#ede8e1] rounded-[4px] animate-shimmer" />
                </div>
              </div>
            </div>
          </div>

          {/* 2. Delivery Address Card */}
          <div className="bg-white border border-[#e5e0da] rounded-[12px] p-[16px] flex gap-[12px] items-center">
            <div className="bg-[#FFF5ED] size-[32px] rounded-[16px] flex items-center justify-center shrink-0">
              <div className="size-4 bg-[#FFD7C2] rounded-full animate-shimmer" />
            </div>
            <div className="flex-1 flex flex-col gap-1.5">
              <div className="flex items-center gap-2">
                <div className="h-4 w-28 bg-[#ede8e1] rounded animate-shimmer" />
                <div className="h-3.5 w-12 bg-[#FFD7C2] rounded-full animate-shimmer" />
              </div>
              <div className="h-3 w-40 bg-[#f0ece6] rounded animate-shimmer" />
            </div>
            <div className="size-4 bg-[#f0ece6] rounded animate-shimmer shrink-0" />
          </div>

          {/* 3. Coupon Box */}
          <div className="flex flex-col gap-2">
            <div className="flex gap-2">
              <div className="flex-1 h-[48px] rounded-[12px] bg-white border border-[#e5e0da] animate-shimmer" />
              <div className="w-[80px] h-[48px] rounded-[12px] bg-[#FFD7C2] animate-shimmer" />
            </div>
            <div className="h-3.5 w-24 bg-[#f0ece6] rounded animate-shimmer mt-1" />
          </div>

          {/* 4. Delivery Estimation Banner */}
          <div className="h-[48px] rounded-[12px] bg-[#f5f1ea] border border-[#e5e0da]/60 animate-shimmer w-full" />

          {/* 5. Bill Summary */}
          <div className="flex flex-col gap-3 pt-3 border-t border-[#e5e0da]/60">
            <div className="flex justify-between items-center">
              <div className="h-3.5 w-16 bg-[#ede8e1] rounded animate-shimmer" />
              <div className="h-3.5 w-12 bg-[#ede8e1] rounded animate-shimmer" />
            </div>
            <div className="flex justify-between items-center">
              <div className="h-3.5 w-16 bg-[#ede8e1] rounded animate-shimmer" />
              <div className="h-3.5 w-10 bg-[#ede8e1] rounded animate-shimmer" />
            </div>
            <div className="flex justify-between items-center pt-2 border-t border-dashed border-[#e5e0da]">
              <div className="h-4 w-12 bg-[#211e1a]/20 rounded animate-shimmer" />
              <div className="h-5 w-16 bg-[#FF5400]/30 rounded animate-shimmer" />
            </div>
          </div>
        </main>

        {/* Sticky Bottom Bar */}
        <div className="fixed bottom-0 left-0 right-0 z-30 bg-[#fbf8f4]/95 backdrop-blur-md border-t border-[#e5e0da] p-4 flex flex-col items-center">
          <div className="w-full max-w-full md:max-w-[480px] flex flex-col gap-2 items-center">
            <div className="w-full h-[52px] rounded-[26px] bg-[#ff5400]/40 animate-shimmer" />
            <div className="h-3 w-36 bg-[#e5e0da] rounded animate-shimmer" />
          </div>
        </div>
      </div>
    </div>
  );
}
