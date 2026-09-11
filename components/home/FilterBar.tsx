"use client";

import { useState } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import FilterModal from "./FilterModal";
import SortFilterSheet, { SORT_OPTIONS } from "./sheets/SortFilterSheet";
import type { CategoryConfig } from "@/types/shared.types";
import type { FilterMetadata } from "@/services/product.service";

interface FilterBarProps {
  /** Total number of products being displayed. */
  productCount: number;
  /** Active categories list for the filter sheet. */
  categories?: CategoryConfig[];
  /** Current collection slug (e.g. 'all', 'rudraksha'). */
  currentSlug?: string;
  /** Current active sort key (e.g. 'price_asc', 'price_desc'). */
  currentSort?: string;
  /** Dynamic filter metadata from database. */
  filterMetadata?: FilterMetadata;
}

export default function FilterBar({
  productCount,
  categories = [],
  currentSlug = "all",
  currentSort,
  filterMetadata,
}: FilterBarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isSortOpen, setIsSortOpen] = useState(false);

  // Active sort from prop or URL
  const activeSort = currentSort || searchParams.get("sort") || "relevance";

  // Check if any filters are active
  const isFilterActive =
    isFilterOpen ||
    Boolean(searchParams.get("minPrice")) ||
    Boolean(searchParams.get("maxPrice")) ||
    Boolean(searchParams.get("types")) ||
    Boolean(searchParams.get("mukhi")) ||
    Boolean(searchParams.get("origin")) ||
    Boolean(searchParams.get("rating")) ||
    searchParams.get("inStock") === "true";

  // Handle Sort selection
  const handleSortApply = (sortKey: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("sort", sortKey);
    router.push(`${pathname}?${params.toString()}`);
  };

  // Get human-readable sort label
  const getSortLabel = () => {
    const option = SORT_OPTIONS.find((opt) => opt.value === activeSort);
    return option ? `Sort: ${option.label}` : "Sort: Relevance";
  };

  return (
    <>
      <div className="flex flex-col gap-4 w-full">
        <div className="flex items-center justify-between w-full">
          {/* Filter Button */}
          <button
            type="button"
            onClick={() => setIsFilterOpen(true)}
            aria-expanded={isFilterOpen}
            aria-haspopup="dialog"
            className={`flex items-center justify-center gap-1.5 h-8 sm:h-9 px-3.5 rounded-full border text-[13px] sm:text-sm font-medium transition-colors cursor-pointer shadow-xs ${
              isFilterOpen || isFilterActive
                ? "border-primary-orange bg-[#fff5ee] text-primary-orange"
                : "border-[#d1c9bf] bg-white text-text-primary hover:border-text-primary"
            }`}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill={isFilterOpen || isFilterActive ? "currentColor" : "none"}
              stroke="currentColor"
              strokeWidth={1.8}
              strokeLinecap="round"
              strokeLinejoin="round"
              className={`w-3.5 h-3.5 ${
                isFilterOpen || isFilterActive ? "text-primary-orange fill-primary-orange" : "text-text-secondary fill-none"
              }`}
              aria-hidden="true"
            >
              <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
            </svg>
            <span>Filters</span>
          </button>

          {/* Sort Dropdown Anchor */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setIsSortOpen(true)}
              aria-expanded={isSortOpen}
              aria-haspopup="dialog"
              className={`flex items-center justify-center gap-1.5 h-8 sm:h-9 px-1 text-[13px] sm:text-sm font-medium transition-colors cursor-pointer ${
                isSortOpen || (activeSort && activeSort !== "relevance")
                  ? "text-primary-orange font-semibold"
                  : "text-text-secondary hover:text-text-primary"
              }`}
            >
              <span>{getSortLabel()}</span>
              <svg
                className={`w-3.5 h-3.5 transition-transform duration-200 ${
                  isSortOpen
                    ? "rotate-180 text-primary-orange"
                    : activeSort && activeSort !== "relevance"
                    ? "text-primary-orange"
                    : "text-text-secondary"
                }`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.8}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </button>
          </div>
        </div>

        {/* Product Count Display */}
        <p className="text-[12px] sm:text-[13px] font-normal text-text-muted">
          {productCount} {productCount === 1 ? "product" : "products"}
        </p>
      </div>

      {/* Comprehensive Filter Modal (Figma node 1194:100) */}
      <FilterModal
        isOpen={isFilterOpen}
        onClose={() => setIsFilterOpen(false)}
        categories={categories}
        currentSlug={currentSlug}
        filterMetadata={filterMetadata}
      />

      {/* Sort Filter Sheet */}
      <SortFilterSheet
        isOpen={isSortOpen}
        onClose={() => setIsSortOpen(false)}
        currentSort={activeSort}
        onApply={handleSortApply}
      />
    </>
  );
}

