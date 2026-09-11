/**
 * Color tokens — the typed, importable mirror of the CSS custom properties
 * defined in app/globals.css. Same values, same names; two forms because
 * Tailwind classes need the CSS variables, but plain TS/inline-style code
 * (SVG `stroke`, `fill`, chart libraries, etc.) needs a real string constant.
 *
 * 808 hardcoded hex colors were found scattered across ~110 component files
 * at last audit — this file is the source new and migrated code should read
 * from instead of retyping a hex literal.
 */
export const colors = {
  primaryOrange: "#ff5400",
  primaryOrangeHover: "#e04d00",
  baseWhite: "#ffffff",

  textPrimary: "#211e1a",
  textSecondary: "#6b6459",
  textMuted: "#a89a85",
  textTertiary: "#a89a85",

  borderStrong: "#e5e0da",
  borderLight: "#f0ebe4",

  surfaceNeutral: "#f5f1ea",
  surfaceSubtle: "#fbf8f4",
  surfaceSecondary: "#f5f1ea",
  surfaceSecondaryHover: "#e5e0da",
} as const;

export type ColorToken = keyof typeof colors;
