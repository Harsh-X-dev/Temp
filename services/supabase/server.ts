/**
 * Supabase server client.
 *
 * Use in Server Components, Server Actions, and Route Handlers.
 *
 * This client uses the plain `createClient` from `@supabase/supabase-js`
 * rather than the cookie-aware `createServerClient` from `@supabase/ssr`.
 *
 * The cookie-aware variant is only required when you need to read or refresh
 * the authenticated user's session from cookies (i.e. for protected pages and
 * auth-gated data). For public data queries where RLS allows the `anon` role
 * to read rows without a session (such as the `banners` table), the plain
 * client is the correct and simpler choice — it avoids unnecessary cookie
 * reads and header manipulation on every request.
 *
 * When you later need to read auth state from a Server Component (e.g. to
 * personalise data), replace this with `createServerClient` from
 * `@supabase/ssr` and pass the Next.js `cookies()` adapter.
 */
import { createClient } from "@supabase/supabase-js";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { config } from "@/lib/constants/config";

/**
 * Returns a Supabase client configured for server-side use.
 * Call once per request / per server component invocation.
 */
export function createSupabaseServerClient() {
  return createClient(config.supabaseUrl, config.supabaseAnonKey);
}

/**
 * Returns a Supabase client configured for Server Actions and Route Handlers
 * that require reading the authenticated user's session from cookies.
 */
export async function createSupabaseServerActionClient() {
  const cookieStore = await cookies();

  return createServerClient(config.supabaseUrl, config.supabaseAnonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          );
        } catch {
          // The `setAll` method was called from a Server Component.
          // This can be ignored if you have middleware refreshing
          // user sessions.
        }
      },
    },
  });
}
/**
 * Returns a Supabase admin client configured for server-side use.
 * This client uses the service role key to bypass Row Level Security (RLS).
 * MUST ONLY BE USED IN SECURE SERVER ENVIRONMENTS (e.g. API routes).
 */
export function createSupabaseAdmin() {
  // Deliberately read directly rather than adding this to lib/constants/config.ts —
  // that file is imported by client-safe code (services/supabase/client.ts), and the
  // service role key must never sit in a module a Client Component could import.
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!serviceRoleKey) {
    throw new Error("Missing Supabase environment variable: SUPABASE_SERVICE_ROLE_KEY must be set.");
  }

  return createClient(config.supabaseUrl, serviceRoleKey);
}

/**
 * Returns a Supabase client configured for server-side use that requires authentication.
 * Call this in Server Actions or Route Handlers where you need to verify the user's session.
 */
export async function createSupabaseServerAuthClient() {
  const cookieStore = await cookies();

  return createServerClient(config.supabaseUrl, config.supabaseAnonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          );
        } catch {
          // The `setAll` method was called from a Server Component.
          // This can be ignored if you have middleware refreshing
          // user sessions.
        }
      },
    },
  });
}
