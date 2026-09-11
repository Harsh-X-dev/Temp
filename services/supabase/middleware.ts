/**
 * Supabase cookie-aware client for use in proxy.ts (Next.js 16 middleware).
 *
 * Uses createServerClient from @supabase/ssr so it can read and refresh
 * the Supabase session from the request's cookie headers.
 *
 * DO NOT use this in Client Components. Use @/lib/supabase/client instead.
 * DO NOT use this in Server Components. Use @/lib/supabase/server instead.
 */
import { createServerClient } from "@supabase/ssr";
import { type NextRequest, NextResponse } from "next/server";
import { config } from "@/lib/constants/config";

/**
 * Creates a Supabase client that reads auth tokens from request cookies
 * and writes refreshed tokens back to response cookies.
 *
 * Returns both the client and the (potentially modified) response so that
 * cookie mutations are forwarded to the browser.
 */
export function createSupabaseMiddlewareClient(request: NextRequest) {
  // Start with a passthrough response so we can attach cookie mutations.
  let response = NextResponse.next({
    request,
  });

  const supabase = createServerClient(
    config.supabaseUrl,
    config.supabaseAnonKey,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          // Write cookie updates onto both the request (for downstream handlers)
          // and the response (so the browser receives the refreshed token).
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value),
          );
          response = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  return { supabase, response };
}
