import { create } from "zustand";
import { persist } from "zustand/middleware";
import { useAuthStore } from "@/store/auth.store";
import { createSupabaseBrowserClient } from "@/services/supabase/client";
import {
  addToWishlistDb,
  removeFromWishlistDb,
  clearWishlistDb,
  syncGuestWishlistToDb,
} from "@/services/wishlist.service";

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
function isUUID(id: string) {
  return UUID_RE.test(id);
}

interface WishlistState {
  wishlistIds: string[];
  addToWishlist: (id: string) => void;
  removeFromWishlist: (id: string) => void;
  clearWishlist: () => void;
  resetLocalWishlist: () => void;
  toggleWishlist: (id: string) => void;
  isInWishlist: (id: string) => boolean;
  loadUserWishlist: (customerId: string, guestIds?: string[]) => Promise<void>;
  setWishlistIds: (ids: string[]) => void;
}

/**
 * Wishlist store — supports instant optimistic UI, guest localStorage persistence,
 * and automatic synchronization with Supabase when the user is logged in.
 *
 * Behavior:
 *   - Guest: IDs persist in browser localStorage (`gemostone-wishlist`).
 *   - Authenticated: Actions optimistically update UI instantly and sync to `public.wishlists` DB.
 *   - Login: Guest items merge into the user's Supabase wishlist.
 *   - Logout: Local state is completely reset (resetLocalWishlist), leaving zero residual items.
 */
export const useWishlistStore = create<WishlistState>()(
  persist(
    (set, get) => ({
      wishlistIds: [],

      setWishlistIds: (ids) => {
        set({ wishlistIds: ids.filter(isUUID) });
      },

      addToWishlist: (id) => {
        if (!isUUID(id)) return;
        if (!get().wishlistIds.includes(id)) {
          set((state) => ({ wishlistIds: [id, ...state.wishlistIds] }));

          // Sync with database if logged in
          const userId = useAuthStore.getState().user?.id;
          if (userId) {
            const supabase = createSupabaseBrowserClient();
            addToWishlistDb(supabase, userId, id).catch((err) =>
              console.error("[useWishlistStore] Failed to sync add to DB:", err)
            );
          }
        }
      },

      removeFromWishlist: (id) => {
        if (get().wishlistIds.includes(id)) {
          set((state) => ({
            wishlistIds: state.wishlistIds.filter((wid) => wid !== id),
          }));

          // Sync with database if logged in
          const userId = useAuthStore.getState().user?.id;
          if (userId) {
            const supabase = createSupabaseBrowserClient();
            removeFromWishlistDb(supabase, userId, id).catch((err) =>
              console.error("[useWishlistStore] Failed to sync remove from DB:", err)
            );
          }
        }
      },

      clearWishlist: () => {
        set({ wishlistIds: [] });

        // Sync with database if logged in
        const userId = useAuthStore.getState().user?.id;
        if (userId) {
          const supabase = createSupabaseBrowserClient();
          clearWishlistDb(supabase, userId).catch((err) =>
            console.error("[useWishlistStore] Failed to sync clear to DB:", err)
          );
        }
      },

      resetLocalWishlist: () => {
        // Resets local state only (used upon logout so we don't wipe the DB account data)
        set({ wishlistIds: [] });
      },

      toggleWishlist: (id) => {
        if (get().isInWishlist(id)) {
          get().removeFromWishlist(id);
        } else {
          get().addToWishlist(id);
        }
      },

      isInWishlist: (id) => get().wishlistIds.includes(id),

      loadUserWishlist: async (customerId, guestIds = []) => {
        if (!customerId) return;
        try {
          const supabase = createSupabaseBrowserClient();
          const currentIds = guestIds.length > 0 ? guestIds : get().wishlistIds;
          const mergedIds = await syncGuestWishlistToDb(supabase, customerId, currentIds);
          set({ wishlistIds: mergedIds });
        } catch (err) {
          console.error("[useWishlistStore] Failed to load user wishlist:", err);
        }
      },
    }),
    {
      name: "gemostone-wishlist",
      skipHydration: true,
    }
  )
);
