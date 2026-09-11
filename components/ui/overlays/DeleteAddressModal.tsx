"use client";

import { useState } from "react";
import { createPortal } from "react-dom";
import { useHasMounted } from "@/hooks/useHasMounted";
import { useBodyScrollLock } from "@/hooks/useBodyScrollLock";
import { useEscapeKey } from "@/hooks/useEscapeKey";
import type { Address } from "@/components/account/types";

interface DeleteAddressModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void> | void;
  address?: Address | null;
  isDeleting?: boolean;
}

export default function DeleteAddressModal({
  isOpen,
  onClose,
  onConfirm,
  address,
  isDeleting: externalIsDeleting,
}: DeleteAddressModalProps) {
  const mounted = useHasMounted();
  const [internalLoading, setInternalLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isDeleting = externalIsDeleting ?? internalLoading;

  useBodyScrollLock(isOpen);
  useEscapeKey(isOpen, () => {
    if (!isDeleting) onClose();
  });

  if (!isOpen || !mounted) return null;

  const handleConfirm = async () => {
    setError(null);
    try {
      setInternalLoading(true);
      await onConfirm();
      onClose();
    } catch (err: any) {
      setError(err?.message || "Failed to delete address. Please try again.");
    } finally {
      setInternalLoading(false);
    }
  };

  return createPortal(
    <div className="fixed inset-0 z-[150] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-xs transition-opacity duration-200"
        onClick={() => {
          if (!isDeleting) onClose();
        }}
        aria-hidden="true"
      />

      {/* Modal Dialog Box */}
      <div
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="delete-address-title"
        aria-describedby="delete-address-desc"
        className="relative w-full max-w-[358px] rounded-[12px] bg-white shadow-[0px_4px_24px_0px_rgba(0,0,0,0.15)] border border-[#e5e0da] flex flex-col items-center px-[22px] pt-[16px] pb-[28px] z-[151]"
      >
        {/* Title */}
        <h3
          id="delete-address-title"
          className="font-['Montserrat',sans-serif] font-semibold text-[16px] leading-normal text-[#212121] text-center"
        >
          Delete Address
        </h3>

        {/* Subtitle */}
        <p
          id="delete-address-desc"
          className="font-['Montserrat',sans-serif] font-normal text-[13px] leading-[1.5] text-[#666666] text-center mt-[8px]"
        >
          Are you sure you want to delete this address?
        </p>

        {/* Error message */}
        {error && (
          <div className="mt-4 w-full rounded-lg bg-red-50 border border-red-200 p-2.5 text-xs text-red-600 text-center">
            {error}
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex items-center justify-center gap-[12px] mt-[24px] w-full">
          {/* Cancel */}
          <button
            type="button"
            onClick={onClose}
            disabled={isDeleting}
            className="h-[41px] w-[128px] rounded-[24px] border border-[#e5e0da] bg-white px-[28px] py-[10px] font-['Montserrat',sans-serif] font-semibold text-[14px] text-[#212121] text-center whitespace-nowrap transition-colors hover:bg-[#f5f3f0] active:scale-[0.98] disabled:opacity-50 cursor-pointer"
          >
            Cancel
          </button>

          {/* Delete */}
          <button
            type="button"
            onClick={handleConfirm}
            disabled={isDeleting}
            className="h-[41px] w-[152px] rounded-[24px] bg-[#ff5400] px-[28px] py-[10px] font-['Montserrat',sans-serif] font-semibold text-[14px] text-white text-center whitespace-nowrap transition-all hover:bg-[#e64c00] active:scale-[0.98] disabled:opacity-60 flex items-center justify-center gap-2 cursor-pointer"
          >
            {isDeleting ? (
              <>
                <div className="size-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                <span>Deleting...</span>
              </>
            ) : (
              "Delete"
            )}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
