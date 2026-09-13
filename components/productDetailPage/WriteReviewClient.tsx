'use client';

import { useState, useRef, useEffect, useMemo } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { IconStarOutline, IconStarFilled } from '@/components/productDetailPage/Icons';
import BackButton from '@/components/ui/buttons/BackButton';
import { toast } from '@/lib/toast';
import { useAuth } from '@/hooks/useAuth';
import { checkCanUserReviewProduct } from '@/services/reviews.service';
import { createSupabaseBrowserClient } from '@/services/supabase/client';
import { submitReviewAction } from '@/app/(shop)/product/[slug]/write-review/actions';

interface ProductInfo {
  id: string;
  title: string;
  slug: string;
  price: number;
  compareAtPrice: number | null;
  imageUrl: string;
}

/**
 * Fast client-side image compression: reduces image payload to ~80KB
 * for lightning-fast network transmission.
 */
function compressReviewImage(file: File, maxWidth = 1200, quality = 0.75): Promise<File> {
  return new Promise((resolve) => {
    if (!file.type.startsWith('image/')) {
      resolve(file);
      return;
    }
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new window.Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        if (width > maxWidth) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(file);
          return;
        }
        ctx.drawImage(img, 0, 0, width, height);

        canvas.toBlob(
          (blob) => {
            if (!blob) {
              resolve(file);
              return;
            }
            const compressedFile = new File([blob], file.name, {
              type: 'image/jpeg',
              lastModified: Date.now(),
            });
            resolve(compressedFile);
          },
          'image/jpeg',
          quality
        );
      };
      img.onerror = () => resolve(file);
      img.src = event.target?.result as string;
    };
    reader.onerror = () => resolve(file);
    reader.readAsDataURL(file);
  });
}

export default function WriteReviewClient({
  product,
  orderItemId,
}: {
  product: ProductInfo;
  orderItemId?: string;
}) {
  const router = useRouter();
  const { user, profile, isAuthenticated, loading: authLoading } = useAuth();
  const supabase = useMemo(() => createSupabaseBrowserClient(), []);

  const [rating, setRating] = useState(0);
  const [title, setTitle] = useState('');
  const [review, setReview] = useState('');
  const [photos, setPhotos] = useState<File[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [keyboardOffset, setKeyboardOffset] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Dynamic mobile keyboard awareness via Visual Viewport API
  useEffect(() => {
    if (typeof window === 'undefined' || !window.visualViewport) return;

    const handleViewportChange = () => {
      const vv = window.visualViewport;
      if (!vv) return;
      const offset = Math.max(0, window.innerHeight - vv.height - vv.offsetTop);
      setKeyboardOffset(offset);
    };

    window.visualViewport.addEventListener('resize', handleViewportChange);
    window.visualViewport.addEventListener('scroll', handleViewportChange);

    return () => {
      window.visualViewport?.removeEventListener('resize', handleViewportChange);
      window.visualViewport?.removeEventListener('scroll', handleViewportChange);
    };
  }, []);

  // Restore review draft from sessionStorage on mount / refresh
  useEffect(() => {
    if (typeof window === 'undefined' || !product.id) return;
    try {
      const savedDraft = sessionStorage.getItem(`gemostone_review_draft_${product.id}`);
      if (savedDraft) {
        const parsed = JSON.parse(savedDraft);
        if (parsed.rating) setRating(Number(parsed.rating) || 0);
        if (parsed.title) setTitle(String(parsed.title));
        if (parsed.review) setReview(String(parsed.review));
      }
    } catch (e) {
      console.warn('[WriteReviewClient] Failed to load review draft:', e);
    }
  }, [product.id]);

  // Auto-save review draft to sessionStorage as user types
  useEffect(() => {
    if (typeof window === 'undefined' || !product.id) return;
    if (rating > 0 || title.trim() || review.trim()) {
      try {
        sessionStorage.setItem(
          `gemostone_review_draft_${product.id}`,
          JSON.stringify({ rating, title, review })
        );
      } catch (e) {}
    }
  }, [rating, title, review, product.id]);

  const handleInputFocus = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setTimeout(() => {
      e.target.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 250);
  };

  // Require login, purchase, and unreviewed status
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      toast.info('Login Required 🔒', 'Please log in to write a review.', { duration: 3000 });
      router.replace(`/login?redirectTo=${encodeURIComponent(`/product/${product.slug}/write-review`)}`);
      return;
    }

    if (isAuthenticated && user?.id && product.id) {
      checkCanUserReviewProduct(supabase, product.id, user.id).then((res) => {
        if (!res.eligible) {
          if (res.reason === 'NOT_PURCHASED') {
            toast.error('Purchase Required 🛍️', 'Please purchase the item before you give a review.', { duration: 3000 });
          } else if (res.reason === 'ALREADY_REVIEWED') {
            toast.error('Already Reviewed 📝', 'You have already submitted a review for this product.', { duration: 3000 });
          }
          router.replace(`/product/${product.slug}`);
        }
      }).catch(() => {});
    }
  }, [authLoading, isAuthenticated, user?.id, product.id, product.slug, router, supabase]);

  // Pre-fetch the product detail page on mount so back navigation is instantaneous
  useEffect(() => {
    if (product.slug) {
      router.prefetch(`/product/${product.slug}`);
    }
  }, [product.slug, router]);

  // Pre-compress photos on selection so handleSubmit has zero image encoding delay
  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      const compressed = await Promise.all(newFiles.map(f => compressReviewImage(f, 800, 0.7)));
      setPhotos((prev) => [...prev, ...compressed]);
    }
  };

  const removePhoto = (indexToRemove: number) => {
    setPhotos((prev) => prev.filter((_, index) => index !== indexToRemove));
  };

  const handleSubmit = async () => {
    if (isSubmitting) return;

    if (rating === 0) {
      toast.error('Rating Required', 'Please select a star rating for your review.');
      return;
    }
    if (!review.trim()) {
      toast.error('Review Required', 'Please enter your review text.');
      return;
    }

    setIsSubmitting(true);

    try {
      const formData = new FormData();
      formData.append('product_id', product.id);
      formData.append('rating', rating.toString());
      formData.append('heading', title.trim() || 'Review');
      formData.append('comment', review.trim());

      if (user?.id) {
        formData.append('user_id', user.id);
      }
      const effectiveName =
        profile?.fullName ||
        user?.user_metadata?.full_name ||
        user?.user_metadata?.name ||
        'Verified Customer';
      formData.append('user_name', effectiveName);

      if (orderItemId && orderItemId !== '00000000-0000-0000-0000-000000000000') {
        formData.append('order_id', orderItemId);
      }

      // Upload photos to Supabase Storage "media" bucket and return image URLs to backend
      const uploadedImageUrls: string[] = [];
      if (photos.length > 0) {
        for (let i = 0; i < photos.length; i++) {
          const photo = photos[i];
          const ext = photo.name.split('.').pop() || 'jpg';
          const filePath = `reviews/${effectiveUserId || 'guest'}/${Date.now()}_${i}.${ext}`;
          try {
            const { error: uploadError } = await supabase.storage
              .from('media')
              .upload(filePath, photo, { upsert: true });

            if (!uploadError) {
              const { data } = supabase.storage.from('media').getPublicUrl(filePath);
              if (data?.publicUrl) {
                uploadedImageUrls.push(data.publicUrl);
              }
            } else {
              console.warn('[WriteReviewClient] Failed to upload image to media bucket:', uploadError);
            }
          } catch (storageErr) {
            console.warn('[WriteReviewClient] Storage upload error:', storageErr);
          }
        }
      }

      // Return image URLs to backend
      uploadedImageUrls.forEach((url) => {
        formData.append('image_urls', url);
      });
      if (uploadedImageUrls.length > 0) {
        formData.append('image_urls_json', JSON.stringify(uploadedImageUrls));
      }

      photos.forEach((photo) => {
        formData.append('images', photo);
      });

      const res = await submitReviewAction(formData, product.slug);
      if (!res.success) {
        throw new Error(res.error || 'Failed to submit review.');
      }

      // 3. Instant UI reset & 0ms instant redirect to PDP
      setRating(0);
      setTitle('');
      setReview('');
      setPhotos([]);

      if (typeof window !== 'undefined' && product.id) {
        try {
          sessionStorage.removeItem(`gemostone_review_draft_${product.id}`);
        } catch (e) {}
      }

      toast.success(
        'Review Submitted ⭐',
        'Thank you! Your review has been submitted successfully.'
      );

      // Instant 0ms transition with data refresh
      router.refresh();
      router.replace(`/product/${product.slug}`);
    } catch (err: any) {
      toast.error('Submission Failed', err.message || 'An unexpected error occurred.');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col w-full justify-between -mb-16 lg:-mb-10">
      {/* Header */}
      <header className="sticky top-0 z-30 flex h-[56px] md:h-[64px] items-center px-4 md:px-8 border-b border-border-strong bg-white shrink-0">
        <div className="max-w-xl mx-auto w-full flex items-center">
          <BackButton
            className="w-[28px] h-[28px] md:w-[36px] md:h-[36px] shrink-0"
            onClick={() => {
              if (typeof window !== 'undefined' && window.history.length > 1) {
                router.back();
              } else {
                router.push(`/product/${product.slug}`);
              }
            }}
          />
          <h1 className="ml-3 font-bold text-[18px] md:text-[20px] text-text-primary">
            Write a Review
          </h1>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 w-full max-w-xl mx-auto px-4 pt-3.5 pb-4 flex flex-col gap-4">
        {/* Product Card */}
        <div className="bg-surface-subtle border border-border-strong rounded-[12px] p-3 flex items-center gap-3 shadow-2xs shrink-0">
          <div className="w-[56px] h-[56px] rounded-[8px] overflow-hidden relative border border-border-strong bg-surface-neutral shrink-0">
            {product.imageUrl ? (
              <Image
                src={product.imageUrl}
                unoptimized
                alt={product.title}
                fill
                className="object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-[10px] text-text-muted">
                No Image
              </div>
            )}
          </div>
          <div className="flex flex-col gap-0.5 min-w-0 flex-1">
            <p className="text-[13px] font-medium text-text-primary leading-tight line-clamp-2">
              {product.title}
            </p>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-[14px] font-bold text-primary-orange">
                ₹{product.price}
              </span>
              {product.compareAtPrice && product.compareAtPrice > product.price && (
                <span className="text-[12px] font-normal text-text-muted line-through">
                  ₹{product.compareAtPrice}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Rating Section */}
        <div className="flex flex-col gap-1.5 shrink-0">
          <label className="text-[13px] font-semibold text-text-primary">
            Your Rating
          </label>
          <div className="flex items-center gap-2">
            {[1, 2, 3, 4, 5].map((star) => {
              const isFilled = star <= rating;
              return (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(rating === star ? 0 : star)}
                  className="p-1 transition-transform duration-200 hover:scale-110 active:scale-95 rounded-full outline-none cursor-pointer"
                  aria-label={`Rate ${star} star${star > 1 ? 's' : ''}`}
                >
                  {isFilled ? (
                    <IconStarFilled className="size-[28px] md:size-[32px] text-primary-orange" />
                  ) : (
                    <IconStarOutline className="size-[28px] md:size-[32px] text-[#cbd5e1] hover:text-[#94a3b8] transition-colors" />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Review Title */}
        <div className="flex flex-col gap-1.5 shrink-0">
          <label className="text-[13px] font-semibold text-text-primary">
            Review Title
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onFocus={handleInputFocus}
            placeholder="Summarize your experience..."
            className="h-[44px] px-3.5 border border-border-strong rounded-[10px] w-full text-[13px] outline-none focus:border-primary-orange transition-all bg-white text-text-primary placeholder:text-text-muted shadow-2xs"
          />
        </div>

        {/* Your Review */}
        <div className="flex flex-col gap-1.5 shrink-0">
          <label className="text-[13px] font-semibold text-text-primary">
            Your Review
          </label>
          <textarea
            value={review}
            onChange={(e) => setReview(e.target.value)}
            onFocus={handleInputFocus}
            placeholder="Tell others what you think about this product..."
            className="h-[110px] p-3 border border-border-strong rounded-[10px] w-full text-[13px] resize-none outline-none focus:border-primary-orange transition-all bg-white text-text-primary placeholder:text-text-muted shadow-2xs leading-relaxed"
          />
        </div>

        {/* Add Photos */}
        <div className="flex flex-col gap-1.5 shrink-0">
          <label className="text-[13px] font-semibold text-text-primary">
            Add Photos (optional)
          </label>
          <div className="flex items-center gap-3 flex-wrap">
            {/* Upload Button */}
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="w-[60px] h-[60px] rounded-[10px] border border-dashed border-border-strong hover:border-primary-orange flex flex-col items-center justify-center gap-0.5 text-text-secondary hover:text-primary-orange hover:bg-orange-50/50 transition-all cursor-pointer bg-white shrink-0"
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <line x1="12" y1="5" x2="12" y2="19"></line>
                <line x1="5" y1="12" x2="19" y2="12"></line>
              </svg>
              <span className="text-[10px] font-medium">Add Photo</span>
            </button>
            <input
              type="file"
              multiple
              accept="image/*"
              ref={fileInputRef}
              onChange={handlePhotoUpload}
              className="hidden"
            />

            {/* Uploaded Thumbnails */}
            {photos.map((photo, index) => (
              <div
                key={index}
                className="relative w-[60px] h-[60px] rounded-[10px] overflow-hidden border border-border-strong shrink-0 group"
              >
                <Image
                  src={URL.createObjectURL(photo)}
                  alt={`Review Photo ${index + 1}`}
                  fill
                  className="object-cover"
                />
                <button
                  type="button"
                  onClick={() => removePhoto(index)}
                  className="absolute top-1 right-1 bg-black/75 hover:bg-primary-orange size-[18px] rounded-full flex items-center justify-center text-white transition-all z-10"
                >
                  <svg
                    width="10"
                    height="10"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <line x1="18" y1="6" x2="6" y2="18"></line>
                    <line x1="6" y1="6" x2="18" y2="18"></line>
                  </svg>
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Subtext */}
        <p className="text-[11px] text-text-muted leading-relaxed shrink-0">
          Your review will be visible to other shoppers. Please keep it respectful and relevant.
        </p>
      </main>

      {/* Sticky Bottom Bar with Submit Review Button */}
      <footer 
        className="sticky z-40 bg-white border-t border-border-strong px-4 pt-3 pb-3 md:pt-4 md:pb-6 shadow-md transition-all duration-150 ease-out"
        style={{
          bottom: keyboardOffset > 0 ? `${keyboardOffset}px` : '0px',
          paddingBottom: keyboardOffset > 0 ? '12px' : 'max(1.25rem, env(safe-area-inset-bottom))',
        }}
      >
        <div className="max-w-xl mx-auto w-full">
          <button
            type="button"
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="flex items-center justify-center w-full h-[48px] md:h-[52px] bg-primary-orange hover:bg-primary-orange-hover active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed text-white rounded-full font-semibold text-[14px] md:text-[15px] shadow-sm transition-all"
          >
            {isSubmitting ? (
              <span className="flex items-center gap-2">
                <svg
                  className="animate-spin h-5 w-5 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                Submitting...
              </span>
            ) : (
              'Submit Review'
            )}
          </button>
        </div>
      </footer>
    </div>
  );
}
