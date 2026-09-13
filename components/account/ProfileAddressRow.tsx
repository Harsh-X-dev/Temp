"use client";

import { useState, useRef, useEffect } from "react";
import type { Address } from "./types";

interface ProfileAddressRowProps {
  address: Address;
  fullName?: string | null;
  isSaving: boolean;
  onSetDefault: (id: string) => void;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
}

export default function ProfileAddressRow({
  address,
  fullName,
  isSaving,
  onSetDefault,
  onEdit,
  onDelete,
}: ProfileAddressRowProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isMenuOpen) return;

    function handleClickOutside(event: MouseEvent | TouchEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsMenuOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("touchstart", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isMenuOpen]);

  const recipientName = address.fullName || fullName;
  const recipientPhone = address.phone;

  const addressParts = [
    recipientName,
    address.line1,
    address.line2,
    address.city,
    address.state,
    address.pincode,
    address.country,
  ].filter(Boolean);

  const fullAddress = addressParts.join(", ");

  const typeLabel = address.addressType
    ? address.addressType.charAt(0).toUpperCase() + address.addressType.slice(1)
    : "Address";

  const displayTitle = `${typeLabel}${address.isDefault ? " (Default)" : ""}`;

  return (
    <div className="flex gap-[12px] items-start py-[14px] first:pt-0 last:pb-0">
      {/* Radio button for default address selection */}
      <div className="pt-0.5 shrink-0">
        <button
          type="button"
          onClick={() => !address.isDefault && onSetDefault(address.id)}
          disabled={isSaving || address.isDefault}
          className={`flex size-[20px] items-center justify-center rounded-full border-2 transition-all cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-orange focus-visible:ring-offset-1 ${
            address.isDefault
              ? "border-primary-orange bg-white"
              : "border-border-strong bg-white hover:border-primary-orange"
          }`}
          aria-label={address.isDefault ? "Current default address" : "Set as default address"}
        >
          {address.isDefault && (
            <span className="size-[9px] rounded-full bg-primary-orange" />
          )}
        </button>
      </div>

      {/* Address Details */}
      <div className="flex-1 min-w-0 flex flex-col gap-[4px]">
        <p className="text-[13px] font-semibold text-text-primary leading-normal">
          {displayTitle}
        </p>
        <p className="text-[12px] font-normal leading-[18px] text-text-secondary pr-1">
          {fullAddress}
        </p>
        {recipientPhone && (
          <p className="text-[11px] font-normal text-text-muted">
            Phone: {recipientPhone}
          </p>
        )}
      </div>

      {/* 3-Dot Menu & Action Popup */}
      <div className="relative shrink-0 pt-0.5" ref={menuRef}>
        <button
          type="button"
          onClick={() => setIsMenuOpen((prev) => !prev)}
          disabled={isSaving}
          className="flex size-[28px] items-center justify-center rounded-full text-text-muted hover:text-text-primary hover:bg-surface-neutral active:scale-95 transition-all cursor-pointer focus:outline-none focus-visible:ring-1 focus-visible:ring-primary-orange disabled:opacity-50"
          aria-label="Address options"
          aria-haspopup="true"
          aria-expanded={isMenuOpen}
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 16 16"
            fill="currentColor"
            className="size-[16px]"
          >
            <circle cx="8" cy="3" r="1.5" />
            <circle cx="8" cy="8" r="1.5" />
            <circle cx="8" cy="13" r="1.5" />
          </svg>
        </button>

        {isMenuOpen && (
          <div
            role="menu"
            className="absolute right-0 top-0 z-30 flex flex-col items-center justify-center rounded-[8px] border border-border-strong bg-white py-[6px] px-[12px] shadow-[0_4px_12px_rgba(0,0,0,0.08)] min-w-[72px]"
          >
            <button
              type="button"
              role="menuitem"
              onClick={() => {
                setIsMenuOpen(false);
                onEdit(address.id);
              }}
              disabled={isSaving}
              className="w-full text-center py-[3px] text-[12px] font-semibold text-text-primary hover:text-primary-orange transition-colors cursor-pointer"
            >
              Edit
            </button>
            <button
              type="button"
              role="menuitem"
              onClick={() => {
                setIsMenuOpen(false);
                onDelete(address.id);
              }}
              disabled={isSaving}
              className="w-full text-center py-[3px] text-[12px] font-semibold text-primary-orange hover:text-primary-orange-hover transition-colors cursor-pointer"
            >
              Delete
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
