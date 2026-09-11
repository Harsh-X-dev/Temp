"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useAuthStore } from "@/store/auth.store";
import { useRouter } from "next/navigation";
import { createSupabaseBrowserClient } from "@/services/supabase/client";
import { fetchCustomerReviews, fetchPendingReviews } from "@/services/reviews.service";
import type { Review } from "@/components/account/types";

import ReviewsPageHeader from "@/components/reviews/ReviewsPageHeader";
import ReviewSummaryCard from "@/components/reviews/ReviewSummaryCard";
import PendingReviewsCallout from "@/components/reviews/PendingReviewsCallout";
import ReviewHistoryCard from "@/components/reviews/ReviewHistoryCard";
import { ReviewsSkeleton, ReviewsPageSkeleton, ReviewsEmptyState } from "@/components/reviews/ReviewsStates";
import { useOrdersStore } from "@/store/orders.store";

export default function ReviewsPage() {
  const { profile, isAuthenticated, loading, initialized } = useAuth();
  const user = useAuthStore((s) => s.user);
  const router = useRouter();

  const storeReviews = useOrdersStore((s) => s.reviews);
  const pendingCount = useOrdersStore((s) => s.pendingReviewsCount);
  const setStoreReviews = useOrdersStore((s) => s.setReviews);

  const [isLoadingReviews, setIsLoadingReviews] = useState(!storeReviews || storeReviews.length === 0);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (initialized && !loading && !isAuthenticated) {
      router.replace("/login?redirectTo=/profile/reviews");
    }
  }, [initialized, loading, isAuthenticated, router]);

  useEffect(() => {
    if (!user) {
      setIsLoadingReviews(false);
      return;
    }

    if (!storeReviews || storeReviews.length === 0) {
      setIsLoadingReviews(true);
    }

    async function loadReviews() {
      try {
        const supabase = createSupabaseBrowserClient();
        const [data, pendingData] = await Promise.all([
          fetchCustomerReviews(supabase, user!.id),
          fetchPendingReviews(supabase, user!.id),
        ]);

        setStoreReviews(data, pendingData.length);
      } catch (err: any) {
        setError(err.message || "Failed to load reviews");
      } finally {
        setIsLoadingReviews(false);
      }
    }
    loadReviews();
  }, [user?.id, setStoreReviews]);

  const totalReviews = storeReviews.length;
  const averageRating = totalReviews > 0
    ? storeReviews.reduce((acc, r) => acc + r.rating, 0) / totalReviews
    : 0;

  // Show skeleton only if there is no cached data yet
  if ((!initialized || loading || isLoadingReviews) && storeReviews.length === 0) {
    return <ReviewsPageSkeleton />;
  }

  return (
    <div className="bg-surface-subtle min-h-[100dvh] flex flex-col">
      <ReviewsPageHeader />
      {/* Scroll Content */}
      <div className="flex-1 max-w-lg mx-auto w-full flex flex-col gap-[16px] pt-[16px] pb-[32px] px-[16px]">

        <ReviewSummaryCard
          profile={profile}
          totalReviews={totalReviews}
          averageRating={averageRating}
        />

        {/* List Heading */}
        <div className="flex items-center justify-between w-full whitespace-nowrap">
          <p className="text-[13px] font-bold text-text-primary leading-normal">
            Your Past Reviews ({totalReviews})
          </p>
          <p className="text-[12px] font-medium text-text-muted leading-normal">
            Most Recent First
          </p>
        </div>

        {/* Reviews Stack */}
        {error ? (
          <div className="rounded-[12px] bg-red-50 p-[16px] text-center text-red-600 border border-red-100">
            {error}
          </div>
        ) : storeReviews.length > 0 ? (
          <div className="flex flex-col gap-[12px] w-full">
            {storeReviews.map((review) => (
              <ReviewHistoryCard key={review.id} review={review} />
            ))}
          </div>
        ) : (
          <ReviewsEmptyState />
        )}

        <PendingReviewsCallout count={pendingCount} />
      </div>
    </div>
  );
}
