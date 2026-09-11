/**
 * proxy.ts — Next.js 16 route proxy (formerly middleware.ts).
 *
 * Runs on every matched request before rendering.
 * Responsibilities:
 *   1. Refresh Supabase session tokens (keeps cookies current).
 *   2. Protect authenticated-only routes: redirect guests to /login.
 *   3. Redirect already-authenticated users away from /login.
 *
 * IMPORTANT: Only optimistic cookie-based checks happen here.
 * Real data authorization (RLS) happens in Supabase on every query.
 */
import { type NextRequest, NextResponse } from "next/server";
import { createSupabaseMiddlewareClient } from "@/services/supabase/middleware";

// Routes that require a valid session
const PROTECTED_ROUTES = [
  "/profile",
  "/orders",
  "/checkout",
  "/account",
];

// Auth routes — authenticated users should not see these
const AUTH_ROUTES = ["/login"];

function isProtected(pathname: string): boolean {
  return PROTECTED_ROUTES.some(
    (route) => pathname === route || pathname.startsWith(route + "/"),
  );
}

function isAuthRoute(pathname: string): boolean {
  return AUTH_ROUTES.some(
    (route) => pathname === route || pathname.startsWith(route + "/"),
  );
}

export async function proxy(request: NextRequest) {
  const { supabase, response } = createSupabaseMiddlewareClient(request);
  const pathname = request.nextUrl.pathname;

  // Refresh session — this call also writes updated tokens to cookies
  // via the setAll handler in createSupabaseMiddlewareClient.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const isSignedIn = Boolean(user);

  // Redirect unauthenticated users away from protected routes
  if (isProtected(pathname) && !isSignedIn) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirectTo", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Redirect authenticated users away from auth routes (back to home)
  if (isSignedIn && isAuthRoute(pathname)) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths EXCEPT:
     * - _next/static (static files)
     * - _next/image (image optimisation)
     * - favicon.ico
     * - public assets (images, fonts, etc.)
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|woff|woff2)$).*)",
  ],
};