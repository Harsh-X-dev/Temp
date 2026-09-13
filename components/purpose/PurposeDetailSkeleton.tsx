"use client";

import React from "react";

export default function PurposeDetailSkeleton() {
  return (
    <div className="w-full min-h-screen flex flex-col bg-surface-subtle pb-6 sm:pb-8 font-['Montserrat']">
      {/* Top Header Bar */}
      <header className="sticky top-0 z-30 flex h-14 items-center justify-between bg-white px-4 md:px-6 lg:px-8 border-b border-[#F0EBE1]">
        <div className="flex items-center gap-3">
          {/* Back button skeleton */}
          <div className="h-9 w-9 rounded-full bg-[#f0ece6] animate-shimmer shrink-0" />
          {/* Page Title skeleton */}
          <div className="h-5 w-24 sm:w-32 bg-[#ede8e1] rounded-[6px] animate-shimmer" />
        </div>

        {/* Right Search Action skeleton */}
        <div className="h-9 w-9 rounded-full bg-[#f0ece6] animate-shimmer shrink-0" />
      </header>

      {/* Main Content Area */}
      <main className="mx-auto w-full max-w-5xl flex flex-col">
        {/* Hero Image Banner Skeleton */}
        <div className="relative h-[200px] sm:h-[260px] md:h-[300px] w-full bg-[#ECE7DE] animate-shimmer overflow-hidden">
          {/* Bottom-left Banner Title Badge */}
          <div className="absolute bottom-4 left-4 sm:bottom-6 sm:left-6 z-10">
            <div className="h-7 sm:h-8 md:h-9 w-28 sm:w-36 bg-[#DDD7CD] rounded-[6px] animate-shimmer shadow-xs" />
          </div>
        </div>

        {/* Intro Description Card Skeleton */}
        <div className="border-b border-[#EAE3D8] bg-white px-4 py-5 sm:px-6 sm:py-6 flex flex-col gap-2.5">
          {/* Headline */}
          <div className="h-5 sm:h-6 w-3/5 sm:w-1/2 bg-[#ede8e1] rounded-[4px] animate-shimmer" />
          {/* Description Lines */}
          <div className="h-3.5 sm:h-4 w-full bg-[#ede8e1] rounded-[4px] animate-shimmer mt-1" />
          <div className="h-3.5 sm:h-4 w-[90%] bg-[#ede8e1] rounded-[4px] animate-shimmer" />
          <div className="h-3.5 sm:h-4 w-[60%] bg-[#ede8e1] rounded-[4px] animate-shimmer" />
        </div>

        {/* Products Grid Section Skeleton */}
        <div className="flex flex-col px-4 pt-4 pb-6 sm:px-6">
          {/* Section Heading */}
          <div className="h-5 sm:h-6 w-40 sm:w-48 bg-[#ede8e1] rounded-[4px] animate-shimmer mb-4" />

          {/* 2-Column Product Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4.5">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="flex flex-col gap-2 rounded-[16px] bg-white p-2.5 sm:p-3 border border-[#EFEAE2] shadow-[0_2px_6px_rgba(0,0,0,0.02)]"
              >
                {/* Product Image Square */}
                <div className="aspect-square w-full rounded-[12px] bg-[#ECE7DE] animate-shimmer" />
                {/* Title Line */}
                <div className="h-3.5 w-4/5 bg-[#ede8e1] rounded-[4px] animate-shimmer mt-1" />
                {/* Rating Bar */}
                <div className="h-3 w-1/2 bg-[#f3efe8] rounded-[4px] animate-shimmer" />
                {/* Price Line */}
                <div className="flex items-center gap-2 mt-0.5">
                  <div className="h-4 w-16 bg-[#ede8e1] rounded-[4px] animate-shimmer" />
                  <div className="h-3 w-10 bg-[#f3efe8] rounded-[4px] animate-shimmer" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
