"use client";

/**
 * useAuth — the single public hook for consuming authentication state.
 *
 * Components should ONLY use this hook, never read from useAuthStore directly
 * or call Supabase functions inline. This keeps auth logic centralized and
 * makes components easy to test.
 *
 * Layering: components → useAuth → useAuthStore ← AuthProvider → Supabase
 */
import { useCallback } from "react";
import { useRouter } from "next/navigation";
import { createSupabaseBrowserClient } from "@/services/supabase/client";
import { useAuthStore } from "@/store/auth.store";
import { useCartStore } from "@/store/cart.store";
import { useWishlistStore } from "@/store/wishlist.store";
import { useCheckoutStore } from "@/store/checkout.store";
import type { UserProfile, Address } from "@/components/account/types";
import type { User, Session } from "@supabase/supabase-js";

interface UseAuthReturn {
  /** Supabase User object. Null when logged out. */
  user: User | null;
  /** Supabase Session. Null when logged out. */
  session: Session | null;
  /** Profile from public.profiles. Null when loading or logged out. */
  profile: UserProfile | null;
  /** User's saved addresses. Empty array when loading or logged out. */
  addresses: Address[];
  /** True when user has a valid Supabase session. */
  isAuthenticated: boolean;
  /** True while the initial session check is in progress. */
  loading: boolean;
  /** True after the first auth check completes (success or failure). */
  initialized: boolean;
  /**
   * Sign out the user: calls Supabase signOut, clears all storage and cookies,
   * resets in-memory stores, and redirects to /login.
   */
  logout: () => Promise<void>;
}

/**
 * Clears all client-accessible cookies across root, current domain, and host paths.
 */
function clearAllCookies() {
  if (typeof document === "undefined") return;

  const cookies = document.cookie.split(";");
  const hostname = window.location.hostname;
  const isLocalhost = hostname === "localhost" || hostname === "127.0.0.1";

  for (const cookie of cookies) {
    const eqPos = cookie.indexOf("=");
    const name = (eqPos > -1 ? cookie.substring(0, eqPos) : cookie).trim();
    if (!name) continue;

    // Clear standard path cookie
    document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/;`;
    document.cookie = `${name}=; max-age=0; path=/;`;

    // Domain-scoped variations
    if (!isLocalhost) {
      document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/; domain=${hostname};`;
      document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/; domain=.${hostname};`;
      document.cookie = `${name}=; max-age=0; path=/; domain=${hostname};`;
      document.cookie = `${name}=; max-age=0; path=/; domain=.${hostname};`;
    }

    // Default path fallback
    document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT;`;
    document.cookie = `${name}=; max-age=0;`;
  }
}

/**
 * Clears both localStorage and sessionStorage completely.
 */
function clearAllStorage() {
  if (typeof window === "undefined") return;

  try {
    localStorage.clear();
  } catch (e) {
    console.error("[useAuth] Failed to clear localStorage:", e);
  }

  try {
    sessionStorage.clear();
  } catch (e) {
    console.error("[useAuth] Failed to clear sessionStorage:", e);
  }
}

export function useAuth(): UseAuthReturn {
  const router = useRouter();
  const {
    user,
    session,
    profile,
    addresses,
    isAuthenticated,
    loading,
    initialized,
    clear,
  } = useAuthStore();

  const logout = useCallback(async () => {
    try {
      const supabase = createSupabaseBrowserClient();
      await supabase.auth.signOut();
    } catch (e) {
      console.error("[useAuth] Supabase signOut error:", e);
    } finally {
      // Clear in-memory Zustand stores
      clear();
      useCartStore.getState().clearCart();
      useWishlistStore.getState().resetLocalWishlist();
      useCheckoutStore.getState().reset();

      // Clear all browser storage & cookies
      clearAllStorage();
      clearAllCookies();

      // Navigate to login
      router.push("/login");
      router.refresh();
    }
  }, [clear, router]);

  return {
    user,
    session,
    profile,
    addresses,
    isAuthenticated,
    loading,
    initialized,
    logout,
  };
}
