"use client";

import { useSyncExternalStore } from "react";

const emptySubscribe = () => () => {};

/**
 * True once the component has hydrated on the client, false during SSR and
 * the first client render. Use to gate values that legitimately differ
 * between server and client (persisted store state, localStorage, etc.)
 * without a hydration mismatch.
 *
 * Replaces the `useState(false)` + `useEffect(() => setMounted(true), [])`
 * idiom that was hand-rolled in BottomNav, Navbar, WishlistButton (ui/ and
 * product/ toggle variant), CartButton, VariantSelectionModal, and the
 * wishlist page. Calling setState synchronously inside an effect body
 * triggers an extra, avoidable render pass (flagged by the
 * react-hooks/set-state-in-effect lint rule); useSyncExternalStore is the
 * primitive React ships specifically for "this value differs from the
 * server snapshot" and lets React handle the swap natively instead.
 */
export function useHasMounted(): boolean {
  return useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false,
  );
}
