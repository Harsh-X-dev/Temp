/**
 * Corner-radius scale — the typed mirror of the --radius-* CSS custom
 * properties in app/globals.css. 137 arbitrary rounded-[Npx] values across
 * ~70 files were found resolving mostly to these 5 sizes at last audit.
 */
export const radius = {
  sm: "8px",
  md: "12px",
  lg: "16px",
  xl: "24px",
  pill: "999px",
} as const;

export type RadiusToken = keyof typeof radius;
