/**
 * Checkout store — manages temporary checkout session state.
 *
 * This store is NOT persisted. It holds ephemeral data for the current
 * checkout session: which products are being purchased, the selected
 * address, and the applied coupon.
 *
 * Permanent data (addresses, coupons, product details) lives in Supabase
 * and is fetched at render time by the checkout page.
 *
 * The checkout session is created by either:
 *   1. "Buy Now" — single product checkout
 *   2. "Proceed to Checkout" from cart — all cart items
 */
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { CheckoutItem, CheckoutSource, Coupon, CalculateCheckoutResponse } from "@/types/checkout.types";

interface CheckoutState {
  /** Where this checkout originated: "buy-now" or "cart". */
  source: CheckoutSource | null;

  /** Products in the current checkout session. */
  items: CheckoutItem[];

  /** ID of the selected delivery address. */
  selectedAddressId: string | null;

  /** Currently applied coupon (null if none). */
  selectedCoupon: Coupon | null;

  /** Authoritative calculated prices returned directly by /api/v1/checkout/calculate */
  calculationData: CalculateCheckoutResponse['data'] | null;

  // ── Actions ──────────────────────────────────────────────────────────

  /** Start a Buy Now checkout with a single product. */
  startBuyNow: (item: CheckoutItem) => void;

  /** Start a cart checkout with all selected cart items. */
  startCartCheckout: (items: CheckoutItem[]) => void;

  /** Update the selected delivery address. */
  setSelectedAddress: (addressId: string | null) => void;

  /** Apply or remove a coupon. */
  setCoupon: (coupon: Coupon | null) => void;

  /** Set authoritative calculated prices from backend API */
  setCalculationData: (data: CalculateCheckoutResponse['data'] | null) => void;

  /** Update quantity of an item in the checkout session */
  updateQuantity: (key: string, quantity: number) => void;

  /** Remove an item from the checkout session */
  removeItem: (key: string) => void;

  /** Clear the entire checkout session. */
  reset: () => void;
}

const initialState = {
  source: null as CheckoutSource | null,
  items: [] as CheckoutItem[],
  selectedAddressId: null as string | null,
  selectedCoupon: null as Coupon | null,
  calculationData: null as CalculateCheckoutResponse['data'] | null,
};

export const useCheckoutStore = create<CheckoutState>()(
  persist(
    (set) => ({
      ...initialState,

      startBuyNow: (item) =>
        set((state) => {
          const isSameItem = state.items.length === 1 && state.items[0].variantId === item.variantId;
          return {
            source: "buy-now",
            items: [
              {
                ...item,
                variantLabel: item.variantLabel ? item.variantLabel.replace(/\s*\/\s*/g, ', ') : item.variantLabel,
              },
            ],
            selectedAddressId: state.selectedAddressId ?? null,
            selectedCoupon: state.selectedCoupon ?? null,
            calculationData: isSameItem ? state.calculationData : null,
          };
        }),

      startCartCheckout: (items) =>
        set((state) => ({
          source: "cart",
          items: items.map((item) => ({
            ...item,
            variantLabel: item.variantLabel ? item.variantLabel.replace(/\s*\/\s*/g, ', ') : item.variantLabel,
          })),
          selectedAddressId: state.selectedAddressId,
          selectedCoupon: state.selectedCoupon,
          calculationData: state.calculationData,
        })),

      setSelectedAddress: (addressId) => set({ selectedAddressId: addressId }),

      setCoupon: (coupon) => set({ selectedCoupon: coupon }),

      setCalculationData: (data) => set({ calculationData: data }),

      updateQuantity: (key, quantity) =>
        set((state) => ({
          items: state.items.map((item) =>
            `${item.productId}::${item.variantId}` === key ? { ...item, quantity } : item
          ),
        })),

      removeItem: (key) =>
        set((state) => ({
          items: state.items.filter((item) => `${item.productId}::${item.variantId}` !== key),
        })),

      reset: () => set(initialState),
    }),
    {
      name: "gemostone_checkout_session",
      storage: createJSONStorage(() => (typeof window !== "undefined" ? window.sessionStorage : localStorage)),
    }
  )
);
