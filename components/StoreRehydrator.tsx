"use client";

import { useEffect } from "react";
import { useWishlistStore } from "@/store/wishlist.store";
import { useCartStore } from "@/store/cart.store";

/**
 * Rehydrates all persisted Zustand stores from localStorage on mount.
 * Must be rendered inside the root layout so it runs on every page.
 *
 * Because both stores use `skipHydration: true`, nothing is read from
 * localStorage automatically — this component is the single place that
 * triggers that read, avoiding a React SSR hydration mismatch.
 *
 * This component renders no DOM output.
 */
export default function StoreRehydrator() {
  useEffect(() => {
    useWishlistStore.persist.rehydrate();
    useCartStore.persist.rehydrate();
  }, []);

  return null;
}
