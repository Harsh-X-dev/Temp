"use client";

import { useState } from "react";
import Image from "next/image";
import ClientLink from "@/components/ui/navigation/ClientLink";
import { usePathname } from "next/navigation";
import type { CategoryConfig } from "@/types/shared.types";

interface CategoryBarProps {
  categories: CategoryConfig[];
}

/**
 * Horizontally scrollable category bar with circular icons.
 * Active category is derived from the current pathname so that
 * deep links and page refreshes always highlight the correct circle.
 *
 * - /               → "all" is active
 * - /collection/[slug] → that slug is active
 *
 * Scroll position is preserved naturally because this component stays
 * mounted inside app/(shop)/collection/layout.tsx while navigating
 * between categories — no storage mechanism is needed.
 */
export default function CategoryBar({ categories }: CategoryBarProps) {
  const pathname = usePathname();

  // Derive the active slug from the current route
  const activeSlug = (() => {
    const match = pathname.match(/^\/collection\/([^/]+)/);
    return match ? match[1] : "all";
  })();

  return (
    <section aria-label="Product categories" className="w-full">
      <div
        className="no-scrollbar flex items-start gap-4 overflow-x-auto scroll-smooth px-4 py-2 sm:px-5 md:px-6 lg:px-8"
        style={{ scrollSnapType: "x mandatory" }}
      >
        {categories.map((cat) => {
          const isActive = cat.id === activeSlug;
          return <CategoryBarItem key={cat.id} cat={cat} isActive={isActive} />;
        })}
      </div>
    </section>
  );
}

function CategoryBarItem({ cat, isActive }: { cat: CategoryConfig; isActive: boolean }) {
  const [imageLoaded, setImageLoaded] = useState(false);
  const href = cat.id === "all" ? "/collection/all" : `/collection/${cat.id}`;

  return (
    <ClientLink
      href={href}
      aria-current={isActive ? "page" : undefined}
      className={`group flex shrink-0 flex-col items-center gap-2 focus-visible:outline-none transition-all duration-300 ease-out hover:scale-[1.03] active:scale-[0.97]`}
      style={{ scrollSnapAlign: "start" }}
    >
      {/* Outer selection wrapper */}
      <div
        className={`flex items-center justify-center rounded-full transition-colors duration-300 ${
          isActive
            ? "border-[2.5px] border-primary-orange p-[3px]"
            : "border-[2.5px] border-transparent p-[3px]"
        }`}
      >
        {/* Image Container */}
        <div
          className={`relative flex size-[54px] sm:size-[60px] md:size-[68px] items-center justify-center overflow-hidden rounded-full shadow-xs transition-shadow duration-300 bg-[#ede8e1] ${
            isActive
              ? "bg-primary-orange shadow-md ring-2 ring-primary-orange/20"
              : "hover:shadow-md"
          }`}
        >
          {!imageLoaded && cat.icon && (
            <div className="absolute inset-0 size-full animate-shimmer rounded-full z-0" />
          )}
          {cat.icon ? (
            <Image
              src={cat.icon}
              alt={cat.label}
              fill
              className={`object-cover relative z-10 transition-opacity duration-300 ${
                imageLoaded ? "opacity-100" : "opacity-0"
              }`}
              sizes="(max-width: 640px) 54px, (max-width: 768px) 60px, 68px"
              priority={false}
              onLoad={() => setImageLoaded(true)}
            />
          ) : (
            /* Gradient fallback if category has no image */
            <div
              className="h-full w-full bg-gradient-to-br from-[#f87171] to-[#fb923c] opacity-80"
              aria-hidden="true"
            />
          )}
        </div>
      </div>

      {/* Label */}
      <span
        className={`max-w-[72px] sm:max-w-[80px] truncate text-center text-[12px] sm:text-[13px] transition-colors duration-200 ${
          isActive
            ? "font-semibold text-primary-orange"
            : "font-medium text-text-secondary group-hover:text-text-primary"
        }`}
      >
        {cat.label}
      </span>
    </ClientLink>
  );
}
