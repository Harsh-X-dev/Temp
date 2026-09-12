'use client';

import { useState, useEffect, useMemo } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Review } from '@/types/product.types';
import { IconStarFilled, IconStarOutline, IconCheck, IconThumbsUp, IconThumbsUpFilled } from '@/components/productDetailPage/Icons';
import { toast } from '@/lib/toast';
import { markReviewHelpful, checkCanUserReviewProduct } from '@/services/reviews.service';
import { createSupabaseBrowserClient } from '@/services/supabase/client';
import { useAuth } from '@/hooks/useAuth';

interface ReviewsSectionProps {
  rating: number;
  reviewCount: number;
  reviews: Review[];
  productSlug: string;
  productId?: string;
  reviewEligibility?: { 
    eligible: boolean; 
    reason: 'ELIGIBLE' | 'NOT_LOGGED_IN' | 'NOT_PURCHASED' | 'ALREADY_REVIEWED';
    orderId?: string;
  };
}

export default function ReviewsSection({ 
  rating, 
  reviewCount, 
  reviews, 
  productSlug, 
  productId,
  reviewEligibility: initialEligibility 
}: ReviewsSectionProps) {
  const router = useRouter();
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const supabase = useMemo(() => createSupabaseBrowserClient(), []);

  const [eligibility, setEligibility] = useState<{
    eligible: boolean;
    reason: 'ELIGIBLE' | 'NOT_LOGGED_IN' | 'NOT_PURCHASED' | 'ALREADY_REVIEWED';
    orderId?: string;
  }>(initialEligibility || { eligible: false, reason: 'NOT_LOGGED_IN' });

  useEffect(() => {
    if (!isAuthenticated || !user?.id || !productId) {
      if (!isAuthenticated && !authLoading) {
        setEligibility({ eligible: false, reason: 'NOT_LOGGED_IN' });
      }
      return;
    }

    let isSubscribed = true;
    checkCanUserReviewProduct(supabase, productId, user.id).then((res) => {
      if (isSubscribed) {
        setEligibility(res);
      }
    }).catch(() => {});

    return () => {
      isSubscribed = false;
    };
  }, [isAuthenticated, user?.id, productId, supabase, authLoading]);

  // Prefetch write-review route for 0ms instant transition
  useEffect(() => {
    if (productSlug) {
      router.prefetch(`/product/${productSlug}/write-review`);
    }
  }, [productSlug, router]);

  const [helpfulCounts, setHelpfulCounts] = useState<Record<string, number>>(
    reviews.reduce((acc, r) => ({ ...acc, [r.id]: r.helpfulCount || 0 }), {})
  );
  const [clickedHelpful, setClickedHelpful] = useState<Set<string>>(new Set());

  const handleWriteReviewClick = (e: React.MouseEvent) => {
    if (!authLoading && !isAuthenticated) {
      e.preventDefault();
      toast.info("Please Login 🔒", "You need to be logged in to write a review.", { duration: 3000 });
      router.push(`/login?redirectTo=${encodeURIComponent(`/product/${productSlug}/write-review`)}`);
      return;
    }

    if (eligibility.reason === 'NOT_PURCHASED') {
      e.preventDefault();
      toast.error("Purchase Required 🛍️", "Please purchase the item before you give a review.", { duration: 3000 });
      return;
    }

    if (eligibility.reason === 'ALREADY_REVIEWED') {
      e.preventDefault();
      toast.error("Already Reviewed 📝", "You have already submitted a review for this product.", { duration: 3000 });
      return;
    }

    if (eligibility.orderId) {
      e.preventDefault();
      router.push(`/product/${productSlug}/write-review?orderId=${eligibility.orderId}`);
    }
  };

  const handleHelpfulClick = async (reviewId: string) => {
    const isCurrentlyClicked = clickedHelpful.has(reviewId);
    const action = isCurrentlyClicked ? 'decrement' : 'increment';
    const delta = isCurrentlyClicked ? -1 : 1;

    // Optimistically update UI
    setHelpfulCounts(prev => ({ ...prev, [reviewId]: Math.max(0, (prev[reviewId] || 0) + delta) }));
    setClickedHelpful(prev => {
      const next = new Set(prev);
      if (isCurrentlyClicked) next.delete(reviewId);
      else next.add(reviewId);
      return next;
    });

    // Fire API call
    const result = await markReviewHelpful(reviewId, action);
    if (!result.success) {
      // Revert if API failed
      setHelpfulCounts(prev => ({ ...prev, [reviewId]: Math.max(0, (prev[reviewId] || 0) - delta) }));
      setClickedHelpful(prev => {
        const next = new Set(prev);
        if (isCurrentlyClicked) next.add(reviewId);
        else next.delete(reviewId);
        return next;
      });
    } else if (typeof result.helpful_count === 'number') {
      setHelpfulCounts(prev => ({ ...prev, [reviewId]: result.helpful_count! }));
    }
  };

  // Calculate histogram data from actual reviews
  const histogram = [5, 4, 3, 2, 1].map((stars) => {
    const count = reviews.filter(r => Math.round(r.rating) === stars).length;
    const percentage = reviewCount > 0 ? Math.round((count / reviewCount) * 100) : 0;
    return { stars, percentage };
  });

  const renderStars = (ratingValue: number) => {
    return (
      <div className="flex gap-[2px] items-center text-primary-orange">
        {[1, 2, 3, 4, 5].map((star) => (
          star <= ratingValue ? <IconStarFilled key={star} className="w-[14px] h-[14px]" /> : <IconStarOutline key={star} className="w-[14px] h-[14px] text-[#e5e0da]" />
        ))}
      </div>
    );
  };

  return (
    <div className="flex flex-col gap-[16px] items-start w-full relative shrink-0">
      <h2 className="font-bold leading-[24px] text-text-primary text-[18px]">
        Customer Reviews
      </h2>

      <div className="bg-[#FAF7F2] border border-[#E7E2D8] flex flex-col items-start rounded-[16px] w-full shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
        <div className="flex flex-col gap-[16px] w-full p-[16px] sm:p-[20px]">
          <div className="flex items-center justify-between w-full">
            <div className="flex gap-[8px] items-baseline">
              <p className="font-bold leading-[32px] text-text-primary text-[28px]">
                {rating > 0 ? rating.toFixed(1) : '0.0'}
              </p>
              <p className="font-normal leading-[16px] text-text-muted text-[14px]">
                out of 5
              </p>
            </div>
            <div className="flex flex-col gap-[4px] items-end">
              {renderStars(Math.round(rating))}
              <p className="font-normal leading-[16px] text-text-muted text-[12px]">
                {reviewCount} {reviewCount === 1 ? 'review' : 'reviews'}
              </p>
            </div>
          </div>

          <div className="h-px w-full bg-[#E7E2D8]"></div>

          <div className="flex flex-col gap-[8px] items-start w-full">
            {histogram.map((bar) => (
              <div key={bar.stars} className="flex gap-[10px] items-center w-full">
                <span className="font-medium leading-[16px] text-[#78716C] text-[12.5px] w-[26px] shrink-0">
                  {bar.stars}★
                </span>
                <div className="bg-[#E7E2D8] flex-1 h-[7px] rounded-full overflow-hidden">
                  <div
                    className="bg-primary-orange h-full rounded-full transition-all duration-300"
                    style={{ width: `${bar.percentage}%` }}
                  ></div>
                </div>
                <span className="font-medium leading-[16px] text-[#A8A29E] text-[12px] text-right w-[34px] shrink-0">
                  {bar.percentage}%
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="w-full px-[16px] sm:px-[20px] pb-[16px] sm:pb-[20px]">
          <Link 
            href={
              eligibility.eligible && eligibility.orderId
                ? `/product/${productSlug}/write-review?orderId=${eligibility.orderId}`
                : `/product/${productSlug}/write-review`
            } 
            onClick={handleWriteReviewClick}
            className="w-full py-[11px] rounded-full border border-primary-orange text-primary-orange font-semibold text-[14px] flex items-center justify-center bg-white transition-all hover:bg-primary-orange hover:text-white shadow-xs cursor-pointer"
          >
            Write a Review
          </Link>
        </div>
      </div>

      <div className="flex flex-col gap-[24px] w-full mt-4">
        {reviews.map((review) => {
          const helpfulCount = helpfulCounts[review.id] || 0;
          return (
            <div key={review.id} className="flex flex-col gap-[12px] pb-[20px] border-b border-border-strong border-solid last:border-0 last:pb-0 w-full">
              <div className="flex justify-between items-start w-full">
                {renderStars(review.rating)}
                <span className="text-[12px] text-text-muted">
                  {new Intl.DateTimeFormat('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }).format(new Date(review.createdAt))}
                </span>
              </div>

              <h3 className="text-[14px] font-bold text-text-primary">
                {review.title}
              </h3>

              <p className="text-[14px] text-text-secondary leading-[20px]">
                {review.body}
              </p>

              {review.images && review.images.length > 0 && (
                <div className="flex gap-[8px] mt-[4px]">
                  {review.images.map((imgUrl, i) => (
                    <div key={i} className="relative w-[64px] h-[64px] rounded-[8px] overflow-hidden bg-surface-neutral border border-border-strong">
                      <Image src={imgUrl} alt="Review image" fill className="object-cover" />
                    </div>
                  ))}
                </div>
              )}

              <div className="flex items-center gap-[6px] mt-[4px]">
                <span className="text-[12px] font-medium text-text-primary">
                  {review.customerName}
                </span>
                {review.isVerifiedPurchase && (
                  <div className="bg-[#fff4eb] text-primary-orange rounded-[999px] px-[6px] py-[2px] flex items-center gap-[4px]">
                    <IconCheck />
                    <span className="text-[10px] font-semibold">Verified Purchase</span>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between mt-[4px] w-full">
                <span className="text-[12px] text-text-muted">
                  {helpfulCount} {helpfulCount === 1 ? 'person' : 'people'} found this helpful
                </span>
                <button
                  onClick={() => handleHelpfulClick(review.id)}
                  className={`flex items-center gap-[6px] border rounded-[999px] px-[12px] py-[6px] transition-colors ${clickedHelpful.has(review.id)
                      ? 'border-primary-orange text-primary-orange bg-[#fff4eb]'
                      : 'border-border-strong text-text-secondary hover:bg-surface-subtle'
                    }`}
                >
                  {clickedHelpful.has(review.id) ? <IconThumbsUpFilled /> : <IconThumbsUp />}
                  <span className="text-[12px] font-medium">Helpful</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
