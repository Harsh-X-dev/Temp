"use client";

import { useEffect, useState, useRef, useId } from "react";
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

  const prevIsOpenRef = useRef(false);

  // Sync state only when modal opens
  useEffect(() => {
    if (isOpen && !prevIsOpenRef.current) {
      const min = parseInt(searchParams.get("minPrice") || `${minLimit}`, 10);
      const max = parseInt(searchParams.get("maxPrice") || `${maxLimit}`, 10);
      setMinPrice(isNaN(min) ? minLimit : min);
      setMaxPrice(isNaN(max) ? maxLimit : max);

      // 1. Types (Category)
      const typesParam = searchParams.get("types");
      if (typesParam) {
        setSelectedTypes(typesParam.split(",").map((t) => t.trim()).filter(Boolean));
      } else if (currentSlug && currentSlug !== "all" && !currentSlug.toLowerCase().includes("mukhi")) {
        // Find matching category label from categories or fallback formatted slug
        const matchedCategory = categories.find(
          (c) =>
            (c.id || "").toLowerCase() === currentSlug.toLowerCase() ||
            (c.label || "").toLowerCase() === currentSlug.toLowerCase() ||
            (c.id || "").toLowerCase() === currentSlug.toLowerCase().replace(/s$/, "") ||
            currentSlug.toLowerCase() === (c.id || "").toLowerCase() + "s"
        );
        const targetLabel = matchedCategory
          ? matchedCategory.label
          : currentSlug.replace(/[-_]/g, " ").replace(/\b\w/g, (l) => l.toUpperCase());

        // Check if gemstoneTypes has exact match or matching label
        const matchedInGemstoneTypes = gemstoneTypes.find(
          (g) => g.toLowerCase() === targetLabel.toLowerCase() || g.toLowerCase() === currentSlug.toLowerCase()
        );

        setSelectedTypes([matchedInGemstoneTypes || targetLabel]);
      } else {
        setSelectedTypes([]);
      }

      // 2. Mukhi Types
      const mukhiParam = searchParams.get("mukhi");
      if (mukhiParam) {
        if (
          mukhiParam.toLowerCase() === "all_mukhi" ||
          mukhiParam.toLowerCase() === "all" ||
          mukhiParam.toLowerCase() === "mukhi" ||
          mukhiParam.toLowerCase() === "mukhi-series" ||
          mukhiParam.toLowerCase() === "mukhi_series"
        ) {
          setSelectedMukhi([...mukhiTypes]);
        } else {
          setSelectedMukhi(mukhiParam.split(",").map((t) => t.trim()).filter(Boolean));
        }
      } else if (currentSlug && currentSlug.toLowerCase().includes("mukhi")) {
        // Automatically pre-select all available mukhi chips on mukhi-series collection pages
        setSelectedMukhi([...mukhiTypes]);
      } else {
        setSelectedMukhi([]);
      }

      const originParam = searchParams.get("origin");
      setSelectedOrigins(originParam ? originParam.split(",").filter(Boolean) : []);

      setSelectedRating(searchParams.get("rating") || "");
    }
    prevIsOpenRef.current = isOpen;
  }, [isOpen, searchParams, minLimit, maxLimit, currentSlug, categories, gemstoneTypes, mukhiTypes]);

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

  // Toggle array item helper (case-insensitive & singular/plural tolerant)
  const toggleArrayItem = (list: string[], item: string, setter: (val: string[]) => void) => {
    const isPresent = list.some(
      (x) =>
        x.toLowerCase() === item.toLowerCase() ||
        x.toLowerCase() === item.toLowerCase().replace(/s$/, "") ||
        item.toLowerCase() === x.toLowerCase().replace(/s$/, "")
    );
    if (isPresent) {
      setter(
        list.filter(
          (x) =>
            x.toLowerCase() !== item.toLowerCase() &&
            x.toLowerCase() !== item.toLowerCase().replace(/s$/, "") &&
            item.toLowerCase() !== x.toLowerCase().replace(/s$/, "")
        )
      );
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

    // Always delete legacy inStock parameter
    params.delete("inStock");

    let targetPath = pathname;

    if (pathname.startsWith("/collection")) {
      const isMukhiPage = currentSlug.toLowerCase().includes("mukhi");

      if (selectedTypes.length === 0 && (selectedMukhi.length === 0 || (isMukhiPage && selectedMukhi.length === 0))) {
        // User deselected all categories / mukhi -> Navigate to All Products
        targetPath = "/collection/all";
        params.delete("types");
        params.delete("mukhi");
      } else if (selectedTypes.length === 1) {
        const typeItem = selectedTypes[0];
        const matchedCollection = categories.find(
          (c) =>
            (c.label || "").toLowerCase() === typeItem.toLowerCase() ||
            (c.id || "").toLowerCase() === typeItem.toLowerCase() ||
            (c.id || "").toLowerCase() === typeItem.toLowerCase().replace(/s$/, "") ||
            typeItem.toLowerCase() === (c.id || "").toLowerCase() + "s"
        );

        if (matchedCollection && matchedCollection.id !== "all") {
          targetPath = `/collection/${matchedCollection.id}`;
          params.delete("types");
        } else {
          targetPath = "/collection/all";
          params.set("types", typeItem);
        }
      } else if (selectedTypes.length > 1) {
        targetPath = "/collection/all";
        params.set("types", selectedTypes.join(","));
      } else if (isMukhiPage && selectedMukhi.length === 0) {
        targetPath = "/collection/all";
        params.delete("types");
        params.delete("mukhi");
      }
    } else {
      if (selectedTypes.length > 0) {
        params.set("types", selectedTypes.join(","));
      } else {
        params.delete("types");
      }
    }

    const queryString = params.toString() ? `?${params.toString()}` : "";
    router.push(`${targetPath}${queryString}`);
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
              <div className="flex flex-wrap items-center gap-2">
                {gemstoneTypes.map((type) => {
                  const isSelected = selectedTypes.some((st) => {
                    const cleanSt = st.toLowerCase().trim();
                    const cleanType = type.toLowerCase().trim();
                    return (
                      cleanSt === cleanType ||
                      cleanSt === cleanType.replace(/s$/, "") ||
                      cleanType === cleanSt.replace(/s$/, "")
                    );
                  });
                  return (
                    <button
                      key={type}
                      type="button"
                      onClick={() => toggleArrayItem(selectedTypes, type, setSelectedTypes)}
                      className={`inline-flex items-center justify-center gap-1.5 h-[34px] px-3.5 rounded-full border text-[13px] font-medium transition-colors duration-75 cursor-pointer select-none ${
                        isSelected
                          ? "bg-[#fff5ee] border-[#ff5400] text-[#ff5400] shadow-2xs"
                          : "bg-white border-[#e7e2d8] text-[#1c1917] hover:border-[#a8a29e]"
                      }`}
                    >
                      {isSelected && (
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="shrink-0 text-[#ff5400]">
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                      )}
                      <span className="leading-none whitespace-nowrap">{type}</span>
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
              <div className="flex flex-wrap items-center gap-2">
                {mukhiTypes.map((mukhi) => {
                  const isSelected = selectedMukhi.includes(mukhi);
                  return (
                    <button
                      key={mukhi}
                      type="button"
                      onClick={() => toggleArrayItem(selectedMukhi, mukhi, setSelectedMukhi)}
                      className={`inline-flex items-center justify-center gap-1.5 h-[34px] px-3.5 rounded-full border text-[13px] font-medium transition-colors duration-75 cursor-pointer select-none ${
                        isSelected
                          ? "bg-[#fff5ee] border-[#ff5400] text-[#ff5400] shadow-2xs"
                          : "bg-white border-[#e7e2d8] text-[#1c1917] hover:border-[#a8a29e]"
                      }`}
                    >
                      {isSelected && (
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="shrink-0 text-[#ff5400]">
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                      )}
                      <span className="leading-none whitespace-nowrap">{mukhi}</span>
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
              <div className="flex flex-wrap items-center gap-2">
                {origins.map((origin) => {
                  const isSelected = selectedOrigins.includes(origin);
                  return (
                    <button
                      key={origin}
                      type="button"
                      onClick={() => toggleArrayItem(selectedOrigins, origin, setSelectedOrigins)}
                      className={`inline-flex items-center justify-center gap-1.5 h-[34px] px-3.5 rounded-full border text-[13px] font-medium transition-colors duration-75 cursor-pointer select-none ${
                        isSelected
                          ? "bg-[#fff5ee] border-[#ff5400] text-[#ff5400] shadow-2xs"
                          : "bg-white border-[#e7e2d8] text-[#1c1917] hover:border-[#a8a29e]"
                      }`}
                    >
                      {isSelected && (
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="shrink-0 text-[#ff5400]">
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                      )}
                      <span className="leading-none whitespace-nowrap">{origin}</span>
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
            <div className="flex flex-wrap items-center gap-2">
              {RATING_OPTIONS.map((opt) => {
                const isSelected = selectedRating === opt.value;
                return (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setSelectedRating(isSelected ? "" : opt.value)}
                    className={`inline-flex items-center justify-center gap-1.5 h-[34px] px-3.5 rounded-full border text-[13px] font-medium transition-colors duration-75 cursor-pointer select-none ${
                      isSelected
                        ? "bg-[#fff5ee] border-[#ff5400] text-[#ff5400] shadow-2xs"
                        : "bg-white border-[#e7e2d8] text-[#1c1917] hover:border-[#a8a29e]"
                    }`}
                  >
                    {isSelected && (
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="shrink-0 text-[#ff5400]">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    )}
                    <span className="leading-none whitespace-nowrap">{opt.label}</span>
                  </button>
                );
              })}
            </div>
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
