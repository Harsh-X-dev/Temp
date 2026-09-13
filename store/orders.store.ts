import { create } from "zustand";
import type { OrderDetail, Review } from "@/components/account/types";

interface OrdersState {
  orders: OrderDetail[];
  reviews: Review[];
  pendingReviewsCount: number;
  lastFetchedOrders: number | null;
  lastFetchedReviews: number | null;
  setOrders: (orders: OrderDetail[]) => void;
  setReviews: (reviews: Review[], pendingCount?: number) => void;
  getOrder: (orderNumber: string) => OrderDetail | undefined;
  upsertOrder: (order: OrderDetail) => void;
  clearOrders: () => void;
}

export const useOrdersStore = create<OrdersState>((set, get) => ({
  orders: [],
  reviews: [],
  pendingReviewsCount: 0,
  lastFetchedOrders: null,
  lastFetchedReviews: null,

  setOrders: (orders) =>
    set({
      orders,
      lastFetchedOrders: Date.now(),
    }),

  setReviews: (reviews, pendingCount) =>
    set((state) => ({
      reviews,
      pendingReviewsCount:
        pendingCount !== undefined ? pendingCount : state.pendingReviewsCount,
      lastFetchedReviews: Date.now(),
    })),

  getOrder: (orderNumber) =>
    get().orders.find((o) => o.orderNumber === orderNumber),

  upsertOrder: (order) =>
    set((state) => {
      const exists = state.orders.some((o) => o.orderNumber === order.orderNumber);
      return {
        orders: exists
          ? state.orders.map((o) => (o.orderNumber === order.orderNumber ? order : o))
          : [order, ...state.orders],
      };
    }),

  clearOrders: () =>
    set({
      orders: [],
      reviews: [],
      pendingReviewsCount: 0,
      lastFetchedOrders: null,
      lastFetchedReviews: null,
    }),
}));
