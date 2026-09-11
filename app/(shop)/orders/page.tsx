"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useAuthStore } from "@/store/auth.store";
import { useRouter } from "next/navigation";
import { createSupabaseBrowserClient } from "@/services/supabase/client";
import { fetchCustomerOrders } from "@/services/orders.service";
import type { Order } from "@/components/account/types";

import OrdersPageHeader from "@/components/orders/headers/OrdersPageHeader";
import OrderStatusFilter from "@/components/orders/states/OrderStatusFilter";
import OrderHistoryCard from "@/components/orders/cards/OrderHistoryCard";
import { OrderHistoryPageSkeleton, OrdersEmptyState } from "@/components/orders/states/OrderStates";
import { useOrdersStore } from "@/store/orders.store";

const STATUSES = ["All", "Processing", "Shipped", "Delivered", "Cancelled"];

export default function OrdersPage() {
  const { isAuthenticated, loading, initialized } = useAuth();
  const user = useAuthStore((s) => s.user);
  const router = useRouter();

  const storeOrders = useOrdersStore((s) => s.orders);
  const setStoreOrders = useOrdersStore((s) => s.setOrders);

  const [isLoadingOrders, setIsLoadingOrders] = useState(!storeOrders || storeOrders.length === 0);
  const [error, setError] = useState<string | null>(null);
  const [selectedStatus, setSelectedStatus] = useState("All");

  useEffect(() => {
    if (initialized && !loading && !isAuthenticated) {
      router.replace("/login?redirectTo=/orders");
    }
  }, [initialized, loading, isAuthenticated, router]);

  useEffect(() => {
    if (!user) {
      setIsLoadingOrders(false);
      return;
    }

    if (!storeOrders || storeOrders.length === 0) {
      setIsLoadingOrders(true);
    }

    async function loadOrders() {
      try {
        const supabase = createSupabaseBrowserClient();
        const data = await fetchCustomerOrders(supabase, user!.id);
        setStoreOrders(data);
      } catch (err: any) {
        setError(err.message || "Failed to load orders");
      } finally {
        setIsLoadingOrders(false);
      }
    }
    loadOrders();
  }, [user?.id, setStoreOrders]);

  const filteredOrders = storeOrders.filter((order) => {
    if (selectedStatus === "All") return true;

    const dbStatus = order.status.toLowerCase();
    const uiStatus = selectedStatus.toLowerCase();

    if (uiStatus === "processing") {
      return ["pending", "confirmed", "processing"].includes(dbStatus);
    }
    if (uiStatus === "cancelled") {
      return ["cancelled", "returned", "refunded"].includes(dbStatus);
    }

    return dbStatus === uiStatus;
  });

  // Show skeleton only if there is no cached data yet
  if ((!initialized || loading || isLoadingOrders) && storeOrders.length === 0) {
    return <OrderHistoryPageSkeleton />;
  }

  return (
    <div className="bg-[#fbf8f4] flex-1 h-full flex flex-col">
      <OrdersPageHeader />
      <div className="flex flex-col gap-4 px-[16px] pt-4 pb-20 md:pb-6 w-full">
        <OrderStatusFilter
          statuses={STATUSES}
          selectedStatus={selectedStatus}
          onSelect={setSelectedStatus}
        />

        {error ? (
          <div className="rounded-lg bg-red-50 p-4 text-center text-red-600 border border-red-100">
            {error}
          </div>
        ) : filteredOrders.length > 0 ? (
          <div className="flex flex-col gap-3 w-full">
            {filteredOrders.map((order) => (
              <OrderHistoryCard key={order.id} order={order} />
            ))}
          </div>
        ) : (
          <OrdersEmptyState />
        )}
      </div>
    </div>
  );
}
