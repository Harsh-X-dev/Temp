/**
 * Indian Rupee formatting — ₹12,345, no decimals. Used identically across
 * 18 files (42 hardcoded ₹ signs, 32 separate `toLocaleString("en-IN")`
 * calls at last audit) before being consolidated here.
 */
export function formatPrice(value: number): string {
  return `₹${Math.round(value).toLocaleString("en-IN")}`;
}
