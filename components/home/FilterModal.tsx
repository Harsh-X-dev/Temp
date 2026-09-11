"use client";

import { useEffect, useState, useId } from "react";
import { createPortal } from "react-dom";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useHasMounted } from "@/hooks/useHasMounted";
import { useBottomSheetDrag } from "@/hooks/useBottomSheetDrag";
import type { CategoryConfig } from "@/types/shared.types";
import type { FilterMetadata } from "@/services/product.service";

interface FilterModalProps {
  isOpen: boolean;
  onClose: () => void;
  categories?: CategoryConfig[];
  currentSlug?: string;
  filterMetadata?: FilterMetadata;
}

const RATING_OPTIONS = [
  { label: "4★ & above", value: "4" },
  { label: "3★ & above", value: "3" },
];

export default function FilterModal({
  isOpen,
  onClose,
  categories = [],
  currentSlug = "all",
  filterMetadata,
}: FilterModalProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const { sheetRef, dragHandleProps } = useBottomSheetDrag({
    isOpen,
    onClose,
    thresholdFraction: 0.35,
  });

  const minLimit = filterMetadata?.minPrice ?? 0;
  const maxLimit = filterMetadata?.maxPrice ?? 10000;

  const gemstoneTypes = filterMetadata?.gemstoneTypes || [];
  const mukhiTypes = filterMetadata?.mukhiTypes || [];
  const origins = filterMetadata?.origins || [];

  // Local staged state
  const [minPrice, setMinPrice] = useState<number>(minLimit);
  const [maxPrice, setMaxPrice] = useState<number>(maxLimit);
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [selectedMukhi, setSelectedMukhi] = useState<string[]>([]);
  const [selectedOrigins, setSelectedOrigins] = useState<string[]>([]);
  const [selectedRating, setSelectedRating] = useState<string>("");
  const [inStockOnly, setInStockOnly] = useState<boolean>(false);

  // Sync state from current URL params when opened
  useEffect(() => {
    if (isOpen) {
      const min = parseInt(searchParams.get("minPrice") || `${minLimit}`, 10);
      const max = parseInt(searchParams.get("maxPrice") || `${maxLimit}`, 10);
      setMinPrice(isNaN(min) ? minLimit : min);
      setMaxPrice(isNaN(max) ? maxLimit : max);

      const typesParam = searchParams.get("types");
      setSelectedTypes(typesParam ? typesParam.split(",").filter(Boolean) : []);

      const mukhiParam = searchParams.get("mukhi");
      setSelectedMukhi(mukhiParam ? mukhiParam.split(",").filter(Boolean) : []);

      const originParam = searchParams.get("origin");
      setSelectedOrigins(originParam ? originParam.split(",").filter(Boolean) : []);

      setSelectedRating(searchParams.get("rating") || "");
      setInStockOnly(searchParams.get("inStock") === "true");
    }
  }, [isOpen, searchParams, minLimit, maxLimit]);

  // Lock body & html scroll completely when modal is open to prevent background scrolling
  useEffect(() => {
    if (isOpen) {
      const originalBodyOverflow = document.body.style.overflow;
      const originalHtmlOverflow = document.documentElement.style.overflow;

      document.body.style.overflow = "hidden";
      document.documentElement.style.overflow = "hidden";

      return () => {
        document.body.style.overflow = originalBodyOverflow;
        document.documentElement.style.overflow = originalHtmlOverflow;
      };
    }
  }, [isOpen]);

  // Escape key handler
  useEffect(() => {
    if (!isOpen) return;
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [isOpen, onClose]);

  // Toggle array item helper
  const toggleArrayItem = (list: string[], item: string, setter: (val: string[]) => void) => {
    if (list.includes(item)) {
      setter(list.filter((x) => x !== item));
    } else {
      setter([...list, item]);
    }
  };

  // Clear all filters
  const handleClearAll = () => {
    setMinPrice(minLimit);
    setMaxPrice(maxLimit);
    setSelectedTypes([]);
    setSelectedMukhi([]);
    setSelectedOrigins([]);
    setSelectedRating("");
    setInStockOnly(false);
  };

  // Apply filters and push to URL
  const handleApply = () => {
    const params = new URLSearchParams(searchParams.toString());

    if (minPrice > minLimit) {
      params.set("minPrice", minPrice.toString());
    } else {
      params.delete("minPrice");
    }

    if (maxPrice < maxLimit) {
      params.set("maxPrice", maxPrice.toString());
    } else {
      params.delete("maxPrice");
    }

    if (selectedTypes.length > 0) {
      params.set("types", selectedTypes.join(","));
    } else {
      params.delete("types");
    }

    if (selectedMukhi.length > 0) {
      params.set("mukhi", selectedMukhi.join(","));
    } else {
      params.delete("mukhi");
    }

    if (selectedOrigins.length > 0) {
      params.set("origin", selectedOrigins.join(","));
    } else {
      params.delete("origin");
    }

    if (selectedRating) {
      params.set("rating", selectedRating);
    } else {
      params.delete("rating");
    }

    if (inStockOnly) {
      params.set("inStock", "true");
    } else {
      params.delete("inStock");
    }

    const queryString = params.toString() ? `?${params.toString()}` : "";
    router.push(`${pathname}${queryString}`);
    onClose();
  };

  // Calculate dual slider percentage
  const priceRangeSpan = Math.max(1, maxLimit - minLimit);
  const minPercent = Math.round(((minPrice - minLimit) / priceRangeSpan) * 100);
  const maxPercent = Math.round(((maxPrice - minLimit) / priceRangeSpan) * 100);

  const mounted = useHasMounted();

  if (!isOpen || !mounted) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[100] flex flex-col justify-end bg-[rgba(28,25,23,0.45)] backdrop-blur-xs transition-opacity duration-200 w-full max-w-full overflow-hidden"
      onTouchMove={(e) => e.preventDefault()}
    >
      {/* Backdrop tap to close */}
      <div className="absolute inset-0" onClick={onClose} aria-hidden="true" />

      {/* Bottom Sheet Modal Container (Figma node 1194:101) */}
      <div
        ref={sheetRef}
        role="dialog"
        aria-modal="true"
        aria-label="Filter products"
        className="relative z-10 flex flex-col w-full max-w-full sm:max-w-md sm:mx-auto bg-[#fcf9f5] rounded-t-[24px] shadow-2xl overflow-hidden max-h-[85vh]"
        onTouchMove={(e) => e.stopPropagation()}
      >
        {/* Pull Handle (Draggable & Clickable) */}
        <div
          {...dragHandleProps}
          className="flex items-center justify-center pt-3 pb-2 shrink-0 w-full select-none cursor-grab active:cursor-grabbing touch-none"
        >
          <div className="h-1.5 w-10 rounded-full bg-[#78716c]/40 hover:bg-[#78716c]/60 transition-colors" />
        </div>

        {/* Header (Figma node 1194:104) */}
        <div className="flex items-center justify-between px-6 pb-4 border-b border-[#e7e2d8] shrink-0 w-full max-w-full">
          <h2 className="text-[18px] font-bold leading-normal text-[#1c1917]">
            Filters
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close filters"
            className="p-1 rounded-full text-[#1c1917] hover:bg-[#e7e2d8]/50 transition-colors cursor-pointer"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* Scrollable Filter Options Body (Figma node 1194:108) */}
        <div className="flex-1 overflow-y-auto overscroll-contain px-6 py-4 flex flex-col gap-6 no-scrollbar w-full max-w-full">
          {/* 1. Price Range (Figma node 1194:109) */}
          <div className="flex flex-col gap-3 w-full max-w-full">
            <label className="text-[14px] font-bold text-[#1c1917]">
              Price Range
            </label>

            {/* Custom Dual Range Slider with contained padding */}
            <div className="relative flex items-center w-full h-6 py-2 px-2 overflow-hidden">
              {/* Background Track */}
              <div className="absolute left-2 right-2 h-1 bg-[#e7e2d8] rounded-full" />
              {/* Active Orange Range Highlight */}
              <div
                className="absolute h-1 bg-[#ff5400] rounded-full"
                style={{
                  left: `calc(8px + (100% - 16px) * ${minPercent / 100})`,
                  width: `calc((100% - 16px) * ${(maxPercent - minPercent) / 100})`,
                }}
              />

              {/* Native Range Inputs */}
              <input
                type="range"
                min={minLimit}
                max={maxLimit}
                step={100}
                value={minPrice}
                onChange={(e) => {
                  const val = Math.min(Number(e.target.value), maxPrice - 100);
                  setMinPrice(val);
                }}
                className="absolute inset-x-2 h-1 opacity-0 pointer-events-auto cursor-pointer z-30"
                aria-label="Minimum price"
              />
              <input
                type="range"
                min={minLimit}
                max={maxLimit}
                step={100}
                value={maxPrice}
                onChange={(e) => {
                  const val = Math.max(Number(e.target.value), minPrice + 100);
                  setMaxPrice(val);
                }}
                className="absolute inset-x-2 h-1 opacity-0 pointer-events-auto cursor-pointer z-30"
                aria-label="Maximum price"
              />

              {/* Visual Draggable Thumb Handles */}
              <div
                className="absolute size-4 rounded-full bg-[#ff5400] border-2 border-white shadow-md pointer-events-none -translate-x-1/2"
                style={{ left: `calc(8px + (100% - 16px) * ${minPercent / 100})` }}
              />
              <div
                className="absolute size-4 rounded-full bg-[#ff5400] border-2 border-white shadow-md pointer-events-none -translate-x-1/2"
                style={{ left: `calc(8px + (100% - 16px) * ${maxPercent / 100})` }}
              />
            </div>

            {/* Min / Max Badges (Figma node 1194:115) */}
            <div className="flex items-center gap-3 pt-1 text-[13px] w-full">
              <div className="flex-1 flex items-center gap-1.5 px-3 py-2 bg-white border border-[#e7e2d8] rounded-lg min-w-0">
                <span className="text-[#78716c]">Min:</span>
                <span className="font-semibold text-[#1c1917] truncate">₹{minPrice.toLocaleString("en-IN")}</span>
              </div>
              <div className="flex-1 flex items-center gap-1.5 px-3 py-2 bg-white border border-[#e7e2d8] rounded-lg min-w-0">
                <span className="text-[#78716c]">Max:</span>
                <span className="font-semibold text-[#1c1917] truncate">₹{maxPrice.toLocaleString("en-IN")}</span>
              </div>
            </div>
          </div>

          {/* 2. Category (Figma node 1194:122) */}
          {gemstoneTypes.length > 0 && (
            <div className="flex flex-col gap-2.5">
              <span className="text-[14px] font-bold text-[#1c1917]">
                Category
              </span>
              <div className="flex flex-wrap gap-2">
                {gemstoneTypes.map((type) => {
                  const isSelected = selectedTypes.includes(type);
                  return (
                    <button
                      key={type}
                      type="button"
                      onClick={() => toggleArrayItem(selectedTypes, type, setSelectedTypes)}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-2xl border text-[12px] transition-all cursor-pointer ${isSelected
                          ? "bg-[#fff5ee] border-[#ff5400] text-[#ff5400] font-semibold shadow-xs"
                          : "bg-white border-[#e7e2d8] text-[#1c1917] hover:border-[#78716c] font-normal"
                        }`}
                    >
                      {isSelected && (
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                      )}
                      <span>{type}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* 3. Mukhi Type (Figma node 1194:137) */}
          {mukhiTypes.length > 0 && (
            <div className="flex flex-col gap-2.5">
              <span className="text-[14px] font-bold text-[#1c1917]">
                Mukhi Type
              </span>
              <div className="flex flex-wrap gap-2">
                {mukhiTypes.map((mukhi) => {
                  const isSelected = selectedMukhi.includes(mukhi);
                  return (
                    <button
                      key={mukhi}
                      type="button"
                      onClick={() => toggleArrayItem(selectedMukhi, mukhi, setSelectedMukhi)}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-2xl border text-[12px] transition-all cursor-pointer ${isSelected
                          ? "bg-[#fff5ee] border-[#ff5400] text-[#ff5400] font-semibold shadow-xs"
                          : "bg-white border-[#e7e2d8] text-[#1c1917] hover:border-[#78716c] font-normal"
                        }`}
                    >
                      {isSelected && (
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                      )}
                      <span>{mukhi}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* 4. Origin (Figma node 1194:149) */}
          {origins.length > 0 && (
            <div className="flex flex-col gap-2.5">
              <span className="text-[14px] font-bold text-[#1c1917]">
                Origin
              </span>
              <div className="flex flex-wrap gap-2">
                {origins.map((origin) => {
                  const isSelected = selectedOrigins.includes(origin);
                  return (
                    <button
                      key={origin}
                      type="button"
                      onClick={() => toggleArrayItem(selectedOrigins, origin, setSelectedOrigins)}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-2xl border text-[12px] transition-all cursor-pointer ${isSelected
                          ? "bg-[#fff5ee] border-[#ff5400] text-[#ff5400] font-semibold shadow-xs"
                          : "bg-white border-[#e7e2d8] text-[#1c1917] hover:border-[#78716c] font-normal"
                        }`}
                    >
                      {isSelected && (
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                      )}
                      <span>{origin}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* 5. Rating (Figma node 1194:158) */}
          <div className="flex flex-col gap-2.5">
            <span className="text-[14px] font-bold text-[#1c1917]">
              Rating
            </span>
            <div className="flex flex-wrap gap-2">
              {RATING_OPTIONS.map((opt) => {
                const isSelected = selectedRating === opt.value;
                return (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setSelectedRating(isSelected ? "" : opt.value)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-2xl border text-[12px] transition-all cursor-pointer ${isSelected
                        ? "bg-[#fff5ee] border-[#ff5400] text-[#ff5400] font-semibold shadow-xs"
                        : "bg-white border-[#e7e2d8] text-[#1c1917] hover:border-[#78716c] font-normal"
                      }`}
                  >
                    {isSelected && (
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    )}
                    <span>{opt.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 6. In Stock Only (Figma node 1194:166) */}
          <div className="flex items-center justify-between py-1">
            <span className="text-[14px] font-bold text-[#1c1917]">
              In Stock Only
            </span>
            <button
              type="button"
              role="switch"
              aria-checked={inStockOnly}
              onClick={() => setInStockOnly(!inStockOnly)}
              className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${inStockOnly ? "bg-[#ff5400]" : "bg-[#e7e2d8]"
                }`}
            >
              <span
                className={`pointer-events-none inline-block size-5 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${inStockOnly ? "translate-x-5" : "translate-x-0"
                  }`}
              />
            </button>
          </div>
        </div>

        {/* Sticky Action Footer (Figma node 1194:170) */}
        <div className="flex items-center justify-between gap-4 p-5 border-t border-[#e7e2d8] bg-white shrink-0">
          <button
            type="button"
            onClick={handleClearAll}
            className="text-[14px] font-semibold text-[#78716c] underline hover:text-[#1c1917] transition-colors cursor-pointer px-2"
          >
            Clear All
          </button>
          <button
            type="button"
            onClick={handleApply}
            className="flex-1 h-12 flex items-center justify-center rounded-full bg-[#ff5400] text-white font-bold text-[15px] hover:bg-[#e04a00] active:scale-[0.99] transition-all shadow-md cursor-pointer"
          >
            Apply Filters
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
