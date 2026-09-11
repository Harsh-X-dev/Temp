"use client";

import { createPortal } from "react-dom";
import { useHasMounted } from "@/hooks/useHasMounted";
import { useBodyScrollLock } from "@/hooks/useBodyScrollLock";
import { useEscapeKey } from "@/hooks/useEscapeKey";
import { useBottomSheetDrag } from "@/hooks/useBottomSheetDrag";

export type SortOptionValue =
  | "relevance"
  | "price_asc"
  | "price_desc"
  | "newest"
  | "rating_desc";

interface SortOption {
  label: string;
  value: SortOptionValue;
}

export const SORT_OPTIONS: SortOption[] = [
  { label: "Relevance", value: "relevance" },
  { label: "Price: Low to High", value: "price_asc" },
  { label: "Price: High to Low", value: "price_desc" },
  { label: "Newest First", value: "newest" },
  { label: "Rating: High to Low", value: "rating_desc" },
];

interface SortFilterSheetProps {
  isOpen: boolean;
  onClose: () => void;
  currentSort: string;
  onApply: (sortValue: string) => void;
}

/**
 * Slide-up sheet allowing the user to select a sort order.
 */
export default function SortFilterSheet({
  isOpen,
  onClose,
  currentSort,
  onApply,
}: SortFilterSheetProps) {
  const mounted = useHasMounted();
  useBodyScrollLock(isOpen);
  useEscapeKey(isOpen, onClose);

  const { sheetRef, dragHandleProps } = useBottomSheetDrag({
    isOpen,
    onClose,
    thresholdFraction: 0.35,
  });

  const activeSort = currentSort || "relevance";

  const handleSelect = (value: string) => {
    onApply(value);
    onClose();
  };

  if (!isOpen || !mounted) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[100] flex flex-col justify-end w-full max-w-full overflow-hidden"
      onTouchMove={(e) => e.preventDefault()}
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 transition-opacity duration-300 w-full max-w-full"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Sheet */}
      <div
        ref={sheetRef}
        role="dialog"
        aria-modal="true"
        aria-label="Sort By"
        onTouchMove={(e) => e.stopPropagation()}
        className="relative z-10 max-h-[85vh] w-full max-w-full bg-white rounded-t-[24px] flex flex-col overflow-hidden sm:max-w-lg sm:mx-auto sm:rounded-2xl sm:my-auto overscroll-contain shadow-2xl"
      >
        {/* Top Handle Area (Draggable & Clickable) */}
        <div
          {...dragHandleProps}
          className="w-full flex flex-col items-center pt-3 pb-2 select-none cursor-grab active:cursor-grabbing touch-none"
        >
          <div className="w-10 h-1.5 bg-[#d1c9bf] hover:bg-[#b0a79d] rounded-full transition-colors" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-5 pb-4 border-b border-[#f0ebe4] shrink-0 w-full max-w-full">
          <h2 className="font-bold text-lg text-text-primary">Sort By</h2>
          <button
            type="button"
            onClick={onClose}
            className="flex size-9 items-center justify-center rounded-full text-[#1c1917] hover:bg-[#e7e2d8]/50 transition-colors cursor-pointer"
            aria-label="Close"
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* Sort Options List */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden overscroll-contain px-5 py-2 divide-y divide-[#f5f1ea] no-scrollbar w-full max-w-full">
          {SORT_OPTIONS.map((option) => {
            const isSelected = option.value === activeSort;
            return (
              <button
                key={option.value}
                type="button"
                onClick={() => handleSelect(option.value)}
                className={`w-full flex items-center justify-between py-4 text-left transition-colors cursor-pointer ${
                  isSelected
                    ? "font-semibold text-primary-orange"
                    : "text-text-primary font-medium hover:bg-surface-neutral"
                }`}
              >
                <span className="text-sm">{option.label}</span>

                {/* Radio Indicator */}
                <div
                  className={`size-5 rounded-full border flex items-center justify-center transition-colors ${
                    isSelected
                      ? "border-primary-orange bg-white"
                      : "border-[#d1c9bf] bg-white"
                  }`}
                >
                  {isSelected && (
                    <div className="size-2.5 rounded-full bg-primary-orange" />
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>,
    document.body
  );
}
