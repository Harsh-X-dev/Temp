"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { useAuthStore } from "@/store/auth.store";
import { createSupabaseBrowserClient } from "@/services/supabase/client";
import { fetchSingleOrder } from "@/services/orders.service";
import type { OrderDetail } from "@/components/account/types";
import { useOrdersStore } from "@/store/orders.store";

import Link from "next/link";
import OrderDetailPageHeader from "@/components/orders/headers/OrderDetailPageHeader";
import OrderSummaryCard from "@/components/orders/cards/OrderSummaryCard";
import OrderTrackingTimeline from "@/components/orders/timeline/OrderTrackingTimeline";
import DeliveryAddressCard from "@/components/orders/cards/DeliveryAddressCard";
import PaymentSummaryCard from "@/components/orders/cards/PaymentSummaryCard";
import CancelOrderButton from "@/components/orders/CancelOrderButton";
import { OrderTrackingPageSkeleton } from "@/components/orders/states/OrderStates";

export default function OrderTrackingPage() {
  const { orderNumber } = useParams<{ orderNumber: string }>();
  const { isAuthenticated, loading, initialized } = useAuth();
  const user = useAuthStore((s) => s.user);
  const router = useRouter();

  const getCachedOrder = useOrdersStore((s) => s.getOrder);
  const upsertOrder = useOrdersStore((s) => s.upsertOrder);

  // Initialize with cached order if available for 0ms immediate render
  const cached = getCachedOrder(orderNumber);
  const [order, setOrder] = useState<OrderDetail | null>(cached || null);
  const [isLoading, setIsLoading] = useState(!cached);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (initialized && !loading && !isAuthenticated) {
      router.replace(`/login?redirectTo=/orders/${orderNumber}`);
    }
  }, [initialized, loading, isAuthenticated, router, orderNumber]);

  useEffect(() => {
    async function loadOrder() {
      if (!isAuthenticated && !user) return;
      try {
        const supabase = createSupabaseBrowserClient();
        const singleOrder = await fetchSingleOrder(supabase, orderNumber, user?.id);

        if (singleOrder) {
          setOrder(singleOrder);
          upsertOrder(singleOrder);
        } else if (!cached) {
          setError("Order not found");
        }
      } catch (err: any) {
        if (!cached) {
          setError(err.message || "Failed to load order details");
        }
      } finally {
        setIsLoading(false);
      }
    }
    loadOrder();
  }, [isAuthenticated, user?.id, orderNumber, upsertOrder, cached]);

  if ((!initialized || loading || (isAuthenticated && isLoading)) && !order) {
    return <OrderTrackingPageSkeleton />;
  }

  if (error || !order) {
    return (
      <div className="bg-[#FDFBF7] md:bg-white min-h-[100dvh] flex flex-col">
        <OrderDetailPageHeader />
        <div className="flex-1 flex items-center justify-center py-16 px-[16px]">
          <div className="text-center">
            <h2 className="text-lg font-bold text-text-primary">Order Not Found</h2>
            <p className="mt-2 text-sm text-text-secondary">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#F8F6F0] flex-1 flex flex-col font-['Montserrat']">
      <OrderDetailPageHeader />
      <div className="flex-1 max-w-lg mx-auto w-full pt-4 pb-12 px-[16px] space-y-4">
        <OrderSummaryCard order={order} />
        <OrderTrackingTimeline events={order.trackingEvents} />
        <DeliveryAddressCard address={order.deliveryAddress} />
        <PaymentSummaryCard payment={order.paymentSummary} />
        <CancelOrderButton orderNumber={order.orderNumber} status={order.status} />

        {/* Need Help & Refund Policy Links */}
        <div className="pt-4 flex flex-wrap items-center justify-center gap-6">
          {/* <Link
            href="/support"
            className="flex items-center gap-2 text-sm text-[#6B6459] font-medium hover:text-primary-orange transition-colors"
          >
            <svg
              className="size-4 text-[#8C8477]"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <span className="underline decoration-[#8C8477] underline-offset-2">
              Need Help?
            </span>
          </Link> */}

          <Link
            href="/refund-policy"
            className="flex items-center gap-2 text-sm text-[#6B6459] font-medium hover:text-primary-orange transition-colors"
          >
            <svg
              className="size-4 text-[#8C8477]"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
            <span className="underline decoration-[#8C8477] underline-offset-2">
              Refund Policy
            </span>
          </Link>
        </div>
      </div>
    </div>
  );
}
