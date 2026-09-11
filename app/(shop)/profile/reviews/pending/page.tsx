"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createSupabaseBrowserClient } from "@/services/supabase/client";
import { fetchPendingReviews } from "@/services/reviews.service";
import type { PendingReview } from "@/components/account/types";
import PendingReviewCard from "@/components/reviews/PendingReviewCard";

export default function PendingReviewsPage() {
  const { isAuthenticated, loading, initialized } = useAuth();
  const router = useRouter();

  const [pendingReviews, setPendingReviews] = useState<PendingReview[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (initialized && !loading && !isAuthenticated) {
      router.replace("/login?redirectTo=/profile/reviews/pending");
    }
  }, [initialized, loading, isAuthenticated, router]);

  useEffect(() => {
    async function loadPendingReviews() {
      if (!isAuthenticated) return;
      
      try {
        const supabase = createSupabaseBrowserClient();
        const data = await fetchPendingReviews(supabase);
        setPendingReviews(data);
      } catch (error) {
        console.error("Failed to load pending reviews:", error);
      } finally {
        setIsLoading(false);
      }
    }
    loadPendingReviews();
  }, [isAuthenticated]);

  if (!initialized || loading || (isAuthenticated && isLoading)) {
    return (
      <div className="bg-[#FDFBF7] md:bg-white min-h-[100dvh] flex flex-col">
        <header className="sticky top-0 z-50 flex h-[58px] lg:h-auto items-center justify-between border-b border-border-strong lg:border-none bg-white px-4 lg:px-0 lg:pt-8 lg:mb-2 lg:max-w-3xl mx-auto w-full lg:static">
          <div className="flex gap-3 lg:gap-4 items-center relative">
            <Link
              href="/profile/reviews"
              className="flex size-10 lg:size-12 items-center justify-center rounded-full border border-border-strong bg-white text-text-primary transition-colors hover:bg-surface-neutral active:scale-95"
              aria-label="Go back"
            >
              <svg className="size-5 lg:size-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
            </Link>
            <h1 className="text-lg lg:text-3xl font-bold text-text-primary">Pending Reviews</h1>
          </div>
        </header>
        <div className="flex-1 lg:py-8 max-w-3xl mx-auto w-full pt-8 px-4 flex justify-center">
          <div className="size-8 border-4 border-primary-orange border-t-transparent rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#FDFBF7] md:bg-white min-h-[100dvh] flex flex-col pb-8">
      <header className="sticky top-0 z-50 flex h-[58px] lg:h-auto items-center justify-between border-b border-border-strong lg:border-none bg-white px-4 lg:px-0 lg:pt-8 lg:mb-2 lg:max-w-3xl mx-auto w-full lg:static">
        <div className="flex gap-3 lg:gap-4 items-center relative">
          <Link
            href="/profile/reviews"
            className="flex size-10 lg:size-12 items-center justify-center rounded-full border border-border-strong bg-white text-text-primary transition-colors hover:bg-surface-neutral active:scale-95"
            aria-label="Go back"
          >
            <svg className="size-5 lg:size-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
          </Link>
          <h1 className="text-lg lg:text-3xl font-bold text-text-primary">Pending Reviews</h1>
        </div>
        <div className="size-10" aria-hidden="true" />
      </header>
      
      <div className="flex-1 lg:py-8 max-w-3xl mx-auto w-full">
        {pendingReviews.length > 0 ? (
          <>
            <div className="mx-4 lg:mx-0 mt-6 mb-6 flex items-center gap-3 rounded-xl border border-border-strong bg-[#FDFBF7] p-4 shadow-sm">
              <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-orange-50">
                <svg className="size-5 text-primary-orange" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                </svg>
              </div>
              <p className="text-xs md:text-sm text-text-secondary leading-relaxed">
                You have <span className="font-bold text-primary-orange">{pendingReviews.length} items</span> waiting for your review. Share your experience to help other seekers!
              </p>
            </div>
            <div className="flex flex-col gap-4">
              {pendingReviews.map((item) => (
                <PendingReviewCard key={item.id} item={item} />
              ))}
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
            <div className="mb-4 flex size-16 items-center justify-center rounded-full bg-orange-50">
              <svg className="size-8 text-primary-orange" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-lg font-bold text-text-primary">All caught up!</h2>
            <p className="mt-2 max-w-xs text-sm text-text-secondary leading-relaxed">
              You have no pending reviews. Thank you for your feedback!
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
