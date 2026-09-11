/**
 * Non-default spacing values only.
 *
 * Tailwind's built-in 4px-grid spacing scale (p-4 = 16px, gap-2 = 8px, ...)
 * already covers most spacing in this app and does not need a parallel
 * constants file — use the plain Tailwind utility for anything on that
 * grid. This file exists only for the handful of off-grid values that
 * repeat across sheet/modal shells, which is where the duplication
 * actually was.
 */
export const spacing = {
  /** Sticky sheet header horizontal padding (AddressFormSheet, InitialProfileCreationSheet). */
  sheetHeaderX: "20px",
  /** Sticky sheet body horizontal padding. */
  sheetBodyX: "24px",
  /** iOS safe-area bottom padding added to fixed footer bars. */
  safeAreaBottom: "env(safe-area-inset-bottom, 0px)",
} as const;
