"use client";

import { useEffect } from "react";

/**
 * Locks page scroll while `active` is true, restoring whatever inline
 * `overflow` value was already on <body> when it unlocks — so two stacked
 * sheets/modals can't unlock the page for each other.
 *
 * Previously each sheet (AddressFormSheet, CouponSheet, CategoryFilterSheet,
 * AddressPickerSheet, InitialProfileCreationSheet, VariantSelectionModal)
 * hand-rolled this effect, most hardcoding the restore value to `''`.
 */
export function useBodyScrollLock(active: boolean): void {
  useEffect(() => {
    if (!active) return;
    const previousBody = document.body.style.overflow;
    const previousHtml = document.documentElement.style.overflow;

    document.body.style.overflow = "hidden";
    document.documentElement.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousBody;
      document.documentElement.style.overflow = previousHtml;
    };
  }, [active]);
}
