"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import { useHasMounted } from "@/hooks/useHasMounted";
import { useBodyScrollLock } from "@/hooks/useBodyScrollLock";
import { useEscapeKey } from "@/hooks/useEscapeKey";
import { useBottomSheetDrag } from "@/hooks/useBottomSheetDrag";
import type { CategoryConfig } from "@/types/shared.types";
import Button from "@/components/ui/buttons/Button";

interface CategoryFilterSheetProps {
  isOpen: boolean;
  onClose: () => void;
  categories: CategoryConfig[];
  currentSlug: string;
  onApply: (slug: string) => void;
}

/**
 * Slide-up sheet allowing the user to select a category and switch collection views.
 * Adheres to the existing sheet design patterns (CouponSheet, AddressPickerSheet).
 */
export default function CategoryFilterSheet({
  isOpen,
  onClose,
  categories,
  currentSlug,
  onApply,
}: CategoryFilterSheetProps) {
  const mounted = useHasMounted();
  const [selectedSlug, setSelectedSlug] = useState<string>(currentSlug);

  const { sheetRef, dragHandleProps } = useBottomSheetDrag({
    isOpen,
    onClose,
    thresholdFraction: 0.35,
  });

  // Sync selected slug when sheet opens or currentSlug changes
  useEffect(() => {
    if (isOpen) {
      setSelectedSlug(currentSlug);
    }
  }, [isOpen, currentSlug]);

  useBodyScrollLock(isOpen);
  useEscapeKey(isOpen, onClose);

  const handleApply = () => {
    onApply(selectedSlug);
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
        aria-label="Filter by Category"
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
          <h2 className="font-bold text-lg text-text-primary">
            Filter by Category
          </h2>
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

        {/* Category List */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden px-5 py-4 divide-y divide-[#f5f1ea] no-scrollbar w-full max-w-full">
          {categories.length === 0 ? (
            <div className="py-8 text-center text-sm text-text-muted">
              No categories available
            </div>
          ) : (
            categories.map((cat) => {
              const isSelected = cat.id === selectedSlug;
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setSelectedSlug(cat.id)}
                  className={`w-full flex items-center justify-between py-3.5 px-3 rounded-xl text-left transition-colors cursor-pointer ${
                    isSelected
                      ? "bg-primary-orange/5 font-semibold text-primary-orange"
                      : "hover:bg-surface-neutral text-text-primary font-medium"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    {/* Category Icon / Fallback */}
                    <div
                      className={`size-10 rounded-full flex items-center justify-center overflow-hidden border ${
                        isSelected
                          ? "border-primary-orange bg-white"
                          : "border-border-strong bg-surface-subtle"
                      }`}
                    >
                      {cat.icon ? (
                        <Image
                          src={cat.icon}
                          alt={cat.label}
                          width={40}
                          height={40}
                          className="size-full object-cover"
                        />
                      ) : (
                        <span
                          className="flex size-full items-center justify-center bg-gradient-to-br from-primary-orange to-[#ff8c42] text-sm text-white select-none"
                          aria-hidden="true"
                        >
                          ✨
                        </span>
                      )}
                    </div>

                    <span className="text-sm">{cat.label}</span>
                  </div>

                  {/* Radio Indicator */}
                  <div
                    className={`size-5 rounded-full border flex items-center justify-center transition-colors ${
                      isSelected
                        ? "border-primary-orange bg-primary-orange text-white"
                        : "border-[#d1c9bf] bg-white"
                    }`}
                  >
                    {isSelected && (
                      <div className="size-2 rounded-full bg-white" />
                    )}
                  </div>
                </button>
              );
            })
          )}
        </div>

        {/* Footer with Apply Button */}
        <div className="p-4 border-t border-[#f0ebe4] bg-white rounded-b-[24px] sm:rounded-b-2xl shrink-0 w-full max-w-full">
          <Button
            type="button"
            variant="filled"
            onClick={handleApply}
            className="w-full h-11 rounded-full text-sm font-semibold"
          >
            Apply
          </Button>
        </div>
      </div>
    </div>,
    document.body
  );
}
