"use client";

/**
 * AuthProvider — initializes and maintains auth state for the entire app.
 *
 * Responsibilities:
 *   1. On mount: restore any existing Supabase session.
 *   2. Subscribe to Supabase onAuthStateChange for real-time updates.
 *   3. On SIGNED_IN / TOKEN_REFRESHED: fetch profile + addresses in one query, populate store.
 *   4. On SIGNED_OUT: clear the auth store.
 *   5. On completion: mark store as initialized so loading gates lift.
 *
 * State is stored in useAuthStore (Zustand). This component has no context value —
 * consumers read from the store via useAuth().
 *
 * Wrap this around the app in the root layout.
 */
import { useEffect } from "react";
import { createSupabaseBrowserClient } from "@/services/supabase/client";
import { useAuthStore } from "@/store/auth.store";
import { useWishlistStore } from "@/store/wishlist.store";
import { useCartStore } from "@/store/cart.store";
import { fetchProfileWithAddresses } from "@/services/profile.service";

export default function AuthProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const { setAuth, setProfile, setAddresses, clear, setLoading, setInitialized } =
    useAuthStore();

  useEffect(() => {
    const supabase = createSupabaseBrowserClient();

    /**
     * Loads profile + addresses + wishlist after a valid session is confirmed.
     * Called both on initial mount and on any subsequent SIGNED_IN event.
     */
    async function loadUserData(userId: string) {
      try {
        const { profile, addresses } = await fetchProfileWithAddresses(supabase);
        setProfile(profile);
        setAddresses(addresses);
      } catch {
        // Non-fatal: do not overwrite profile if already established
        if (!useAuthStore.getState().profile) {
          setProfile(null);
          setAddresses([]);
        }
      }

      // Sync & load user's wishlist from Supabase
      if (userId) {
        useWishlistStore.getState().loadUserWishlist(userId).catch((err) => {
          console.error("[AuthProvider] Wishlist sync error:", err);
        });
      }
    }

    // ── 1. Restore session on mount ───────────────────────────────────────
    async function initializeAuth() {
      setLoading(true);
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();

        // If an active login transition (useLoginFlow) has started ownership,
        // yield completely: do NOT call loadUserData(), do NOT overwrite profile,
        // and do NOT set initialized=true prematurely.
        if (useAuthStore.getState().loginInProgress) {
          return;
        }

        if (session?.user) {
          setAuth(session.user, session);
          await loadUserData(session.user.id);
        } else {
          clear();
        }
      } catch {
        if (!useAuthStore.getState().loginInProgress) {
          clear();
        }
      } finally {
        if (!useAuthStore.getState().loginInProgress) {
          setLoading(false);
          setInitialized(true);
        }
      }
    }

    initializeAuth();

    // ── 2. Subscribe to auth state changes ───────────────────────────────
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === "SIGNED_IN" || event === "TOKEN_REFRESHED") {
        if (session?.user) {
          setAuth(session.user, session);
          // Do not race with useLoginFlow when it is actively establishing auth and resolving profile
          if (!useAuthStore.getState().loginInProgress) {
            await loadUserData(session.user.id);
          } else if (session.user.id) {
            useWishlistStore.getState().loadUserWishlist(session.user.id).catch((err) => {
              console.error("[AuthProvider] Wishlist sync error:", err);
            });
          }
        }
      } else if (event === "SIGNED_OUT") {
        clear();
        useWishlistStore.getState().resetLocalWishlist();
        useCartStore.getState().clearCart();
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return <>{children}</>;
}
