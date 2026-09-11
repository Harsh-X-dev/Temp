/**
 * Font-size scale — the typed mirror of the --text-* CSS custom properties
 * in app/globals.css. 401 arbitrary text-[Npx] values across ~90 files were
 * found resolving to just 9 distinct sizes at last audit; this is that
 * de-duplicated scale.
 *
 * Font family is intentionally not listed here — `body` in globals.css
 * already sets Montserrat as the inherited default, so no component needs
 * to redeclare a font family (92 files currently do via the redundant
 * arbitrary value `font-['Montserrat']`, which just re-asserts what's
 * already inherited).
 */
export const fontSize = {
  "2xs": "10px",
  xs: "11px",
  sm: "12px",
  base: "13px",
  md: "14px",
  lg: "15px",
  xl: "16px",
  "2xl": "18px",
  "3xl": "20px",
} as const;

export type FontSizeToken = keyof typeof fontSize;
