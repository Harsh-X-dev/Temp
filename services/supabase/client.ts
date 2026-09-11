/**
 * Supabase browser client.
 *
 * Use in Client Components that need to interact with Supabase from the
 * browser (e.g. real-time subscriptions, client-side auth state).
 *
 * `createBrowserClient` from `@supabase/ssr` uses a singleton pattern
 * internally — calling this function multiple times always returns the
 * same underlying client instance.
 *
 * Do NOT use this in Server Components, Server Actions, or Route Handlers.
 * Use `@/lib/supabase/server` for server-side access.
 */
import { createBrowserClient } from "@supabase/ssr";
import { config } from "@/lib/constants/config";

export function createSupabaseBrowserClient() {
  return createBrowserClient(config.supabaseUrl, config.supabaseAnonKey);
}
