import { createClient } from "@supabase/supabase-js";
import { config } from "@/lib/constants/config";

export interface Testimonial {
  id: string;
  authorName: string;
  isVerified: boolean;
  rating: number; // e.g. 5
  title: string;
  body: string;
  imageUrl: string;
}

export async function getHomeTestimonials(): Promise<Testimonial[]> {
  try {
    // Service role key is deliberately read directly, not from lib/constants/config.ts —
    // that file is imported by client-safe code, and this key must never end up there.
    const supabase = createClient(
      config.supabaseUrl,
      process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!
    );

    // Fetch approved reviews from the reviews table
    const { data: reviews, error } = await supabase
      .from('reviews')
      .select('id, user_name, review_content, image_urls, created_at, is_approved')
      .eq('is_approved', true)
      .order('created_at', { ascending: false })
      .limit(5);

    if (error) {
      console.warn("Could not fetch testimonials. Using mock data.", error);
      return MOCK_TESTIMONIALS;
    }
    if (!reviews || reviews.length === 0) {
      return MOCK_TESTIMONIALS;
    }

    // Only include reviews that have a 5-star rating AND have at least one attached image
    const mapped: Testimonial[] = [];

    for (const review of (reviews as any[])) {
      const rating = Number(review.review_content?.rating ?? review.rating ?? 0);

      // Extract and validate attached images
      let images: string[] = [];
      if (Array.isArray(review.image_urls)) {
        images = review.image_urls.filter((url: any) => typeof url === 'string' && url.trim().length > 0);
      } else if (typeof review.image_urls === 'string' && review.image_urls.trim().length > 0) {
        try {
          const parsed = JSON.parse(review.image_urls);
          if (Array.isArray(parsed)) {
            images = parsed.filter((url: any) => typeof url === 'string' && url.trim().length > 0);
          } else if (typeof parsed === 'string' && parsed.trim().length > 0) {
            images = [parsed.trim()];
          }
        } catch {
          images = [review.image_urls.trim()];
        }
      }

      // Strict condition: Reviewer MUST have attached an image AND given 5 star rating
      if (rating === 5 && images.length > 0) {
        mapped.push({
          id: review.id,
          authorName: review.user_name || "Verified Customer",
          isVerified: true,
          rating: 5,
          title: review.review_content?.heading ? `${review.review_content.heading.toUpperCase()}` : "BEAUTIFUL PRODUCT",
          body: review.review_content?.comment || "A wonderful purchase that exceeded my expectations.",
          imageUrl: images[0],
        });
      }

      if (mapped.length >= 10) break;
    }

    return mapped.length > 0 ? mapped : MOCK_TESTIMONIALS;

  } catch (error) {
    console.warn("Testimonials API failed, using mock data.", error);
    return MOCK_TESTIMONIALS;
  }
}

const MOCK_TESTIMONIALS: Testimonial[] = [
  {
    id: "1",
    authorName: "Priya S.",
    isVerified: true,
    rating: 5,
    title: "AUTHENTIC AND BEAUTIFULLY MADE",
    body: "The beads are heavy and ice-cool to touch. Certified authenticity really gives confidence. Recommended to everyone!",
    imageUrl: "/assets/testimonial-1.jpg", 
  },
  {
    id: "2",
    authorName: "Rahul M.",
    isVerified: true,
    rating: 5,
    title: "FEEL THE POSITIVE ENERGY",
    body: "I have been wearing the Navratna mala for a month now and the difference in my focus is incredible. Beautiful packaging too.",
    imageUrl: "/assets/testimonial-2.jpg", 
  },
];
