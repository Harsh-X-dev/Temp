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
import { useOrdersStore } from "@/store/orders.store";
import { logoutSession } from "@/services/auth.service";
import {
  updateProfile as updateProfileService,
  uploadAvatar as uploadAvatarService,
  deleteAvatar as deleteAvatarService,
  fetchProfileWithAddresses,
  type UpdateProfileInput,
} from "@/services/profile.service";
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
  /** True when an explicit OTP login transition is actively in progress. */
  loginInProgress: boolean;
  /**
   * Sign out the user: calls Supabase signOut, clears all storage and cookies,
   * resets in-memory stores, and redirects to /login.
   */
  logout: () => Promise<void>;
  /** Update current profile details (full name, date of birth, gender). */
  updateProfile: (input: UpdateProfileInput) => Promise<{ success: boolean; message?: string }>;
  /** Upload and change user's avatar image. */
  uploadAvatar: (file: File) => Promise<string>;
  /** Remove user's avatar image. */
  removeAvatar: () => Promise<void>;
  /** Directly update profile in Zustand store. */
  setProfile: (profile: UserProfile | null) => void;
  /** Refetch latest profile and addresses from Supabase. */
  refreshProfile: () => Promise<void>;
}

/**
 * Clears all client-accessible cookies across all domain and path permutations,
 * using modern CookieStore API when supported as well as document.cookie fallback.
 */
async function clearAllCookies() {
  if (typeof document === "undefined") return;

  // 1. Try modern Chromium cookieStore API (deletes with exact matching domain/path)
  if (typeof window !== "undefined" && "cookieStore" in window && typeof (window as unknown as { cookieStore?: { getAll: () => Promise<Array<{ name: string; domain?: string; path?: string }>>; delete: (options: { name: string; domain?: string; path?: string }) => Promise<void> } }).cookieStore?.getAll === "function") {
    try {
      const cs = (window as unknown as { cookieStore: { getAll: () => Promise<Array<{ name: string; domain?: string; path?: string }>>; delete: (options: { name: string; domain?: string; path?: string }) => Promise<void> } }).cookieStore;
      const allCookies = await cs.getAll();
      for (const c of allCookies) {
        try {
          await cs.delete({
            name: c.name,
            domain: c.domain || undefined,
            path: c.path || "/",
          });
        } catch {}
        try {
          await cs.delete({ name: c.name });
        } catch {}
      }
    } catch {}
  }

  // 2. Comprehensive document.cookie sweep across all domain and path combinations
  const cookies = document.cookie.split(";");
  const hostname = window.location.hostname;
  const pathParts = window.location.pathname.split("/").filter(Boolean);
  const paths = [
    "/",
    "",
    window.location.pathname,
    ...pathParts.map((_, i) => "/" + pathParts.slice(0, i + 1).join("/")),
  ];

  // Domain variations to handle localhost, IP, and subdomains
  const hostParts = hostname.split(".");
  const domains: (string | undefined)[] = [
    undefined,
    "",
    hostname,
    `.${hostname}`,
  ];
  if (hostname === "localhost" || hostname === "127.0.0.1") {
    domains.push("localhost", ".localhost", "127.0.0.1");
  } else {
    for (let i = 0; i < hostParts.length - 1; i++) {
      const parentDomain = hostParts.slice(i).join(".");
      domains.push(parentDomain, `.${parentDomain}`);
    }
  }

  const allNames = new Set<string>();
  for (const cookie of cookies) {
    const eqPos = cookie.indexOf("=");
    const name = (eqPos > -1 ? cookie.substring(0, eqPos) : cookie).trim();
    if (name) allNames.add(name);
  }

  // Also include well-known tracking / third-party / session cookie names
  const knownPrefixes = ["_ga", "_gid", "_gat", "rzp_", "__next", "sb-"];
  for (const name of Array.from(allNames)) {
    for (const prefix of knownPrefixes) {
      if (name.startsWith(prefix)) allNames.add(name);
    }
  }

  for (const name of allNames) {
    for (const p of paths) {
      for (const d of domains) {
        const domainAttr = d ? `; domain=${d}` : "";
        const pathAttr = p ? `; path=${p}` : "";
        document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; max-age=0${pathAttr}${domainAttr};`;
        document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; max-age=0${pathAttr}${domainAttr}; SameSite=Lax;`;
      }
    }
  }
}

/**
 * Clears localStorage, sessionStorage, IndexedDB databases, and CacheStorage completely.
 */
async function clearAllStorage() {
  if (typeof window === "undefined") return;

  // 1. localStorage
  try {
    localStorage.clear();
  } catch (e) {
    console.error("[useAuth] Failed to clear localStorage:", e);
  }

  // 2. sessionStorage
  try {
    sessionStorage.clear();
  } catch (e) {
    console.error("[useAuth] Failed to clear sessionStorage:", e);
  }

  // 3. IndexedDB
  try {
    if (window.indexedDB && typeof window.indexedDB.databases === "function") {
      const dbs = await window.indexedDB.databases();
      for (const db of dbs) {
        if (db.name) {
          window.indexedDB.deleteDatabase(db.name);
        }
      }
    }
  } catch (e) {
    console.error("[useAuth] Failed to clear IndexedDB:", e);
  }

  // 4. CacheStorage
  try {
    if ("caches" in window) {
      const keys = await window.caches.keys();
      for (const key of keys) {
        await window.caches.delete(key);
      }
    }
  } catch (e) {
    console.error("[useAuth] Failed to clear caches:", e);
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
    loginInProgress,
    clear,
    setProfile,
    setAddresses,
  } = useAuthStore();

  const updateProfile = useCallback(
    async (input: UpdateProfileInput) => {
      const supabase = createSupabaseBrowserClient();
      const res = await updateProfileService(supabase, input);

      // Optimistically update local profile in store
      const current = useAuthStore.getState().profile;
      if (current) {
        setProfile({
          ...current,
          fullName: input.fullName,
          dob: input.dob ?? input.birthDate ?? current.dob,
          gender: input.gender ?? current.gender,
          avatarUrl: input.avatarUrl !== undefined ? (input.avatarUrl || null) : current.avatarUrl,
          updatedAt: new Date().toISOString(),
        });
      }
      return res;
    },
    [setProfile]
  );

  const uploadAvatar = useCallback(
    async (file: File) => {
      const supabase = createSupabaseBrowserClient();
      return await uploadAvatarService(supabase, file);
    },
    []
  );

  const removeAvatar = useCallback(async () => {
    // Local avatar removal is confirmed upon form submission (updateProfile({ avatarUrl: null }))
  }, []);

  const refreshProfile = useCallback(async () => {
    try {
      const supabase = createSupabaseBrowserClient();
      const { profile: refreshedProfile, addresses: refreshedAddresses } =
        await fetchProfileWithAddresses(supabase);
      setProfile(refreshedProfile);
      setAddresses(refreshedAddresses);
    } catch (err) {
      console.error("[useAuth] Failed to refresh profile:", err);
    }
  }, [setProfile, setAddresses]);

  const logout = useCallback(async () => {
    try {
      const supabase = createSupabaseBrowserClient();
      const { data } = await supabase.auth.getSession();
      const token = data.session?.access_token;

      // 1. Call the backend logout API to revoke session & clear HttpOnly refresh cookie
      const res = await logoutSession(token);

      // 2. Only call Supabase signOut as fallback if backend logout did not succeed.
      // If backend logout already succeeded, the session in Supabase is already revoked/deleted,
      // so calling supabase.auth.signOut() would fail with "session_not_found" (403 Forbidden).
      if (!res?.success) {
        await supabase.auth.signOut();
      }
    } catch (e) {
      console.error("[useAuth] Logout error:", e);
    } finally {
      // Clear all in-memory Zustand stores
      clear();
      useCartStore.getState().clearCart();
      useWishlistStore.getState().resetLocalWishlist();
      useCheckoutStore.getState().reset();
      useOrdersStore.getState().clearOrders();

      // Clear all browser storage, IndexedDB, caches, and cookies
      await clearAllStorage();
      await clearAllCookies();

      // Hard redirect to /login to ensure all client/server state and caches are completely reset
      if (typeof window !== "undefined") {
        window.location.replace("/login");
      } else {
        router.push("/login");
      }
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
    loginInProgress,
    logout,
    updateProfile,
    uploadAvatar,
    removeAvatar,
    setProfile,
    refreshProfile,
  };
}
