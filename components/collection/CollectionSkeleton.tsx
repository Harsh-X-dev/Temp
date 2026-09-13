"use client";

import React from "react";

export default function CollectionSkeleton() {
  return (
    <div className="w-full flex flex-col pt-1 pb-10 font-['Montserrat']">
      {/* 1. Page Heading Skeleton */}
      <div className="mb-4 md:mb-5 lg:mb-6">
        <div className="h-6 w-36 sm:w-48 rounded-[6px] bg-[#ede8e1] animate-shimmer" />
      </div>

      {/* 2. Filter / Sort Action Bar Skeleton */}
      <div className="flex items-center justify-between w-full mb-3">
        {/* Filter button pill */}
        <div className="h-[34px] w-[96px] rounded-[20px] bg-[#ede8e1] animate-shimmer" />
        {/* Sort dropdown line */}
        <div className="h-[20px] w-[110px] rounded-[4px] bg-[#ede8e1] animate-shimmer" />
      </div>

      {/* 3. Product Count Skeleton Line */}
      <div className="mb-4">
        <div className="h-[15px] w-[80px] rounded-[4px] bg-[#ede8e1] animate-shimmer" />
      </div>

      {/* 4. Product Grid Skeleton — Matches exact ProductGrid responsive layout */}
      <div className="grid grid-cols-2 gap-3.5 gap-y-6 sm:gap-4 sm:gap-y-7 md:grid-cols-3 md:gap-5 md:gap-y-8 lg:grid-cols-4 lg:gap-6">
        {[...Array(8)].map((_, i) => (
          <div key={i} className="flex min-w-0 flex-1 flex-col w-full">
            {/* Product Image Skeleton */}
            <div className="aspect-square w-full rounded-[14px] bg-[#ECE7DE] animate-shimmer shadow-2xs" />

            {/* Product Info Skeleton */}
            <div className="flex flex-col mt-2.5 gap-1.5 w-full">
              {/* Title line */}
              <div className="h-3.5 w-[85%] rounded-[4px] bg-[#ede8e1] animate-shimmer" />
              {/* Rating line */}
              <div className="h-2.5 w-[50%] rounded-[4px] bg-[#f5f1eb] animate-shimmer" />
              {/* Price line */}
              <div className="h-4 w-[45%] rounded-[4px] bg-[#ede8e1] animate-shimmer mt-0.5" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
