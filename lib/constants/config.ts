/**
 * The one place in this project that reads `process.env.NEXT_PUBLIC_*`.
 *
 * Every other file imports typed constants from here instead of touching
 * `process.env` directly — that's what actually prevents a new hardcoded
 * path from creeping back in, not just fixing the ones found today.
 *
 * Found duplicated before this file existed:
 *  - The Supabase `PUBLISHABLE_KEY || ANON_KEY` fallback was copy-pasted
 *    identically 5 times across services/supabase/{client,server,middleware}.ts.
 *  - The backend base-URL fallback was implemented independently twice
 *    (services/http.ts and services/reviews.service.ts).
 *  - The production domain "https://gemostone.com" was hardcoded 10 times
 *    across app/layout.tsx, app/sitemap.ts and app/robots.ts for SEO
 *    metadata, with no env var backing it at all.
 *
 * Only NEXT_PUBLIC_* values live here — they're inlined into the client
 * bundle by Next.js at build time regardless, so centralizing them creates
 * no new exposure. SUPABASE_SERVICE_ROLE_KEY is intentionally NOT here: it
 * must never be reachable from a file a Client Component can import, so it
 * stays a local, server-only read where it's already used.
 */

/**
 * Backend API root, normalised to always end with /api/v1 so any relative
 * path — '/auth/send-otp', '/v1/auth/send-otp', or '/api/v1/auth/send-otp'
 * — resolves to a valid route. Same logic every caller used to reimplement.
 */
function getNormalizedApiBaseUrl(): string {
  // If running in the browser (client-side), route through Next.js proxy rewrite to eliminate CORS
  if (typeof window !== "undefined") {
    return "/backend-api/v1";
  }
  const envUrl = (process.env.NEXT_PUBLIC_API_URL || "https://gemo-stone-backend-web-app.vercel.app/v1").trim();
  const cleanUrl = envUrl.replace(/\/+$/, "");
  const rootDomain = cleanUrl.replace(/\/+(api\/v1|v1|api)$/, "");
  return `${rootDomain}/api/v1`;
}

export const config = {
  apiBaseUrl: getNormalizedApiBaseUrl(),
  supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL!,
  supabaseAnonKey: (process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)!,
  /** Canonical production domain — was hardcoded 10x for SEO metadata. */
  siteUrl: (process.env.NEXT_PUBLIC_SITE_URL || "https://gemostone.com").replace(/\/+$/, ""),
} as const;
