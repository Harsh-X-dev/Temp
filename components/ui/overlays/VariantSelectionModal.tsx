"use client";

import { useEffect, useState, useMemo } from "react";
import { createPortal } from "react-dom";
import { useHasMounted } from "@/hooks/useHasMounted";
import { toast } from "@/lib/toast";
import type { Product, ProductVariant } from "@/types/shared.types";

interface VariantSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: Product;
  onSelectVariant: (variant: ProductVariant) => void;
  actionTitle?: string;
  ctaText?: string;
}

export default function VariantSelectionModal({
  isOpen,
  onClose,
  product,
  onSelectVariant,
  actionTitle = "Select Options",
  ctaText = "Add to Cart",
}: VariantSelectionModalProps) {
  const mounted = useHasMounted();

  const activeVariants = useMemo(() => {
    return (product.variants || []).filter((v) => v.isActive);
  }, [product.variants]);

  const getOpt1 = (v: any) => v?.option1Value ?? v?.option1_value ?? null;
  const getOpt2 = (v: any) => v?.option2Value ?? v?.option2_value ?? null;
  const getOpt3 = (v: any) => v?.option3Value ?? v?.option3_value ?? null;

  // Compute option groups (either directly from product.options or derived from database variants)
  const optionGroups = useMemo(() => {
    if (activeVariants.length === 0) return [];

    const o1 = Array.from(new Set(activeVariants.map(getOpt1).filter(Boolean))) as string[];
    const o2 = Array.from(new Set(activeVariants.map(getOpt2).filter(Boolean))) as string[];
    const o3 = Array.from(new Set(activeVariants.map(getOpt3).filter(Boolean))) as string[];

    if (product.options && product.options.length > 0) {
      return product.options
        .map((opt, idx) => {
          const vals = opt.values && opt.values.length > 0 ? opt.values : idx === 0 ? o1 : idx === 1 ? o2 : o3;
          return {
            name: opt.name,
            values: vals,
          };
        })
        .filter((g) => g.values && g.values.length > 0);
    }

    // Fallback: derive option groups from active variants
    const groups: { name: string; values: string[] }[] = [];
    if (o1.length > 0) groups.push({ name: "Size", values: o1 });
    if (o2.length > 0) groups.push({ name: "Quality", values: o2 });
    if (o3.length > 0) groups.push({ name: "Material", values: o3 });

    // If still empty but activeVariants exist with labels
    if (groups.length === 0 && activeVariants.length > 0) {
      const labels = activeVariants.map((v) => v.label).filter((l) => l && l !== "One size");
      if (labels.length > 0) {
        groups.push({ name: "Option", values: labels });
      }
    }

    return groups;
  }, [product.options, activeVariants]);

  // State for selected option per group
  const [selectedOptions, setSelectedOptions] = useState<Record<string, string>>({});

  // Reset selected options when modal opens or product changes:
  // Only auto-select single-choice options (e.g. Origin: Nepal). Do NOT preselect multi-choice options (e.g. Size: S, M).
  useEffect(() => {
    if (isOpen) {
      const initial: Record<string, string> = {};
      if (optionGroups.length > 0) {
        optionGroups.forEach((group) => {
          if (group.values.length === 1) {
            initial[group.name] = group.values[0];
          }
        });
      }
      setSelectedOptions(initial);
    }
  }, [isOpen, optionGroups]);

  // Prevent background scrolling when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  // Check if all option groups with choices have been selected
  const allRequiredSelected = useMemo(() => {
    if (optionGroups.length === 0) return true;
    return optionGroups.every((g) => Boolean(selectedOptions[g.name]));
  }, [optionGroups, selectedOptions]);

  // Match the currently selected variant
  const selectedVariant = useMemo(() => {
    if (activeVariants.length === 0) return null;

    if (optionGroups.length === 0) {
      return activeVariants[0];
    }

    const opt1Name = optionGroups[0]?.name;
    const opt2Name = optionGroups[1]?.name;
    const opt3Name = optionGroups[2]?.name;

    const target1 = opt1Name ? selectedOptions[opt1Name] : null;
    const target2 = opt2Name ? selectedOptions[opt2Name] : null;
    const target3 = opt3Name ? selectedOptions[opt3Name] : null;

    // Try matching multi-axis options
    const found = activeVariants.find((v) => {
      const val1 = getOpt1(v);
      const val2 = getOpt2(v);
      const val3 = getOpt3(v);

      const matches1 = !target1 || !val1 || val1 === target1 || v.label === target1;
      const matches2 = !target2 || !val2 || val2 === target2;
      const matches3 = !target3 || !val3 || val3 === target3;

      return matches1 && matches2 && matches3;
    });

    return found || activeVariants[0];
  }, [activeVariants, optionGroups, selectedOptions]);

  if (!isOpen || !mounted) return null;

  // Price calculations
  const priceNum = selectedVariant
    ? selectedVariant.price
    : parseInt(product.price?.replace(/[^\d]/g, "") || "0", 10) || 0;

  const compareAtPriceNum = selectedVariant?.compareAtPrice
    ? selectedVariant.compareAtPrice
    : product.mrp
    ? parseInt(product.mrp.replace(/[^\d]/g, "") || "0", 10) || null
    : null;

  const discountPercent =
    compareAtPriceNum && compareAtPriceNum > priceNum
      ? Math.round(((compareAtPriceNum - priceNum) / compareAtPriceNum) * 100)
      : null;

  const handleOptionClick = (groupName: string, value: string) => {
    setSelectedOptions((prev) => ({
      ...prev,
      [groupName]: value,
    }));
  };

  const handleConfirm = () => {
    if (!allRequiredSelected) {
      const missingGroup = optionGroups.find((g) => !selectedOptions[g.name]);
      toast.error(
        "Option Required",
        missingGroup
          ? `Please select a ${missingGroup.name.toLowerCase()} option.`
          : "Please select all required options."
      );
      return;
    }

    if (selectedVariant) {
      onSelectVariant(selectedVariant);
    } else {
      // Fallback
      onSelectVariant({
        id: product.defaultVariantId || "default",
        sku: product.defaultVariantSku || "default-sku",
        label: product.defaultVariantLabel || "Standard",
        price: priceNum,
        compareAtPrice: compareAtPriceNum,
        isActive: true,
      });
    }
  };

  return createPortal(
    <div
      className="fixed inset-0 z-[9999] flex items-end sm:items-center justify-center bg-[rgba(28,25,23,0.45)] backdrop-blur-sm animate-in fade-in duration-200 w-full max-w-full overflow-x-hidden"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-full sm:max-w-[420px] bg-[#fcf9f5] rounded-t-[24px] sm:rounded-[24px] shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-bottom sm:slide-in-from-bottom-0 sm:zoom-in-95 duration-200 max-h-[85vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Drag / Pull handle */}
        <div className="flex items-center justify-center pt-3 pb-1.5 w-full">
          <div className="w-[36px] h-[4px] rounded-[2px] bg-[#78716c] opacity-30" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-6 pb-3 pt-1 border-b border-[#e7e2d8] w-full max-w-full">
          <h3 className="font-['Montserrat',sans-serif] font-bold text-[18px] text-[#1c1917]">
            {actionTitle}
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="w-7 h-7 flex items-center justify-center rounded-full text-[#1c1917] hover:bg-black/5 active:scale-95 transition-all cursor-pointer"
            aria-label="Close modal"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Options Body */}
        <div className="flex flex-col gap-4 px-6 py-4 overflow-y-auto overflow-x-hidden max-h-[50vh] no-scrollbar w-full max-w-full">
          {optionGroups.length > 0 ? (
            optionGroups.map((group) => {
              const isSingleValue = group.values.length === 1;

              return (
                <div key={group.name} className="flex flex-col gap-1.5 w-full">
                  <span className="font-['Montserrat',sans-serif] text-[13px] font-normal text-[#6b6459]">
                    {group.name}
                  </span>

                  {isSingleValue ? (
                    <p className="font-['Montserrat',sans-serif] text-[14px] font-semibold text-[#211e1a]">
                      {group.values[0]}
                    </p>
                  ) : (
                    <div className="flex flex-wrap gap-2 pt-0.5">
                      {group.values.map((val) => {
                        const isSelected = selectedOptions[group.name] === val;
                        return (
                          <button
                            key={val}
                            type="button"
                            onClick={() => handleOptionClick(group.name, val)}
                            className={`flex items-start px-[14px] py-[8px] rounded-[999px] transition-colors cursor-pointer ${
                              isSelected
                                ? "bg-primary-orange text-white border border-primary-orange"
                                : "bg-white border border-border-strong text-text-primary hover:bg-[#fafafa]"
                            }`}
                          >
                            <p
                              className={`font-semibold leading-[16px] text-[13px] ${
                                isSelected ? "text-white" : "text-text-primary"
                              }`}
                            >
                              {val}
                            </p>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })
          ) : activeVariants.length > 0 ? (
            <div className="flex flex-col gap-2">
              <span className="font-['Montserrat',sans-serif] text-[13px] font-normal text-[#6b6459]">
                Variant
              </span>
              <div className="flex flex-wrap gap-2">
                {activeVariants.map((variant) => {
                  const isSelected = selectedVariant?.id === variant.id && allRequiredSelected;
                  return (
                    <button
                      key={variant.id}
                      type="button"
                      onClick={() => onSelectVariant(variant)}
                      className={`flex items-start px-[14px] py-[8px] rounded-[999px] transition-colors cursor-pointer ${
                        isSelected
                          ? "bg-primary-orange text-white border border-primary-orange"
                          : "bg-white border border-border-strong text-text-primary hover:bg-[#fafafa]"
                      }`}
                    >
                      <p
                        className={`font-semibold leading-[16px] text-[13px] ${
                          isSelected ? "text-white" : "text-text-primary"
                        }`}
                      >
                        {variant.label}
                      </p>
                    </button>
                  );
                })}
              </div>
            </div>
          ) : null}
        </div>

        {/* Price Summary Pane */}
        <div className="bg-[#fbf8f4] border-t border-b border-[#e7e2d8] px-6 py-3 flex items-center gap-3 w-full max-w-full overflow-hidden">
          <span className="font-['Montserrat',sans-serif] font-bold text-[24px] text-[#ff5400] leading-none">
            ₹{priceNum.toLocaleString("en-IN")}
          </span>
          {compareAtPriceNum && compareAtPriceNum > priceNum && (
            <span className="font-['Montserrat',sans-serif] font-normal text-[14px] text-[#a89a85] line-through leading-none">
              ₹{compareAtPriceNum.toLocaleString("en-IN")}
            </span>
          )}
          {discountPercent !== null && discountPercent > 0 && (
            <span className="border border-[#ff5400] bg-white px-2 py-0.5 rounded-[4px] text-[#ff5400] text-[11px] font-semibold font-['Montserrat',sans-serif] leading-tight">
              {discountPercent}% OFF
            </span>
          )}
        </div>

        {/* Action Panel */}
        <div className="px-6 pt-3.5 pb-6 w-full max-w-full">
          <button
            type="button"
            onClick={handleConfirm}
            className="w-full h-[48px] rounded-full bg-[#ff5400] hover:bg-[#e04d00] active:scale-[0.98] text-white text-[15px] font-bold font-['Montserrat',sans-serif] flex items-center justify-center shadow-md transition-all cursor-pointer"
          >
            {ctaText}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}

