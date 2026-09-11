"use client";

import { useEffect } from "react";
import { createPortal } from "react-dom";
import type { ReactNode } from "react";
import { useBodyScrollLock } from "@/hooks/useBodyScrollLock";
import { useEscapeKey } from "@/hooks/useEscapeKey";
import { useHasMounted } from "@/hooks/useHasMounted";

interface SheetProps {
  isOpen: boolean;
  onClose: () => void;
  children: ReactNode;
  /** Accessible name for the dialog — required, sheets have no <h1> an AT can fall back to. */
  "aria-label": string;
  className?: string;
  /** Backdrop uses this z-index, the panel uses zIndex + 10. Raise both together to stack above another sheet. */
  zIndex?: number;
}

/**
 * Bottom sheet shell: backdrop, slide-up panel, scroll lock, Escape-to-close,
 * and `inert` while closed so its contents drop out of the tab order and
 * accessibility tree without breaking the close animation.
 *
 * Extracted from AddressFormSheet, which had this exact backdrop + lifecycle
 * logic duplicated across CouponSheet, AddressPickerSheet,
 * CategoryFilterSheet, InitialProfileCreationSheet and
 * VariantSelectionModal. This component owns only the shell — header, body
 * and footer are composed by the caller as children.
 */
export default function Sheet({
  isOpen,
  onClose,
  children,
  className = "",
  zIndex = 80,
  ...props
}: SheetProps) {
  const mounted = useHasMounted();
  useBodyScrollLock(isOpen);
  useEscapeKey(isOpen, onClose);

  if (!isOpen || !mounted) return null;

  return createPortal(
    <>
      <div
        className="fixed inset-0 bg-black/40 transition-opacity duration-300 w-full max-w-full overflow-x-hidden"
        style={{ zIndex }}
        onClick={onClose}
        aria-hidden="true"
      />
      <div
        role="dialog"
        aria-modal={isOpen}
        aria-label={props["aria-label"]}
        inert={!isOpen}
        style={{ zIndex: zIndex + 10 }}
        className={`fixed inset-0 flex flex-col bg-white transition-transform duration-300 ease-out w-full max-w-full overflow-x-hidden ${
          isOpen ? "translate-y-0" : "translate-y-full"
        } ${className}`}
      >
        {children}
      </div>
    </>,
    document.body
  );
}
