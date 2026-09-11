import { createClient, SupabaseClient } from "@supabase/supabase-js";
import type { Review, PendingReview } from "@/components/account/types";
import { api } from "@/services/http";
import { config } from "@/lib/constants/config";

import { createSupabaseBrowserClient } from "@/services/supabase/client";

export interface ReviewEligibility {
  eligible: boolean;
  reason: 'ELIGIBLE' | 'NOT_PURCHASED' | 'ALREADY_REVIEWED';
  orderId?: string;
}

export interface SubmitReviewResponse {
  success: boolean;
  message: string;
  review_id?: string;
  image_urls?: string[];
}

/**
 * 1. Submit Product Review (POST /api/v1/reviews)
 * Supports multipart/form-data for image attachments or json.
 */
export async function submitReview(formData: FormData, authToken?: string): Promise<SubmitReviewResponse> {
  // config.apiBaseUrl is already normalised to always end with /api/v1.
  const endpoint = `${config.apiBaseUrl}/reviews`;

  let token = authToken;
  if (!token && typeof window !== 'undefined') {
    try {
      const supabase = createSupabaseBrowserClient();
      const { data: { session } } = await supabase.auth.getSession();
      token = session?.access_token;
    } catch {}
  }

  const headers: Record<string, string> = {};
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(endpoint, {
    method: "POST",
    headers,
    body: formData,
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok || !data.success) {
    throw new Error(data.message || "Failed to submit review.");
  }

  return data;
}

/**
 * 2. Update Helpful Count (POST /api/v1/reviews/:id/helpful)
 * Action: 'increment' (+1) or 'decrement' (-1)
 */
export async function markReviewHelpful(
  reviewId: string,
  action: 'increment' | 'decrement' = 'increment'
): Promise<{ success: boolean; helpful_count?: number }> {
  try {
    const { data } = await api.post<{ success: boolean; helpful_count: number }>(
      `/reviews/${reviewId}/helpful`,
      { action }
    );
    return { success: data.success, helpful_count: data.helpful_count };
  } catch (err) {
    console.error(`[ReviewsService] markReviewHelpful failed for ${reviewId}:`, err);
    return { success: false };
  }
}

/**
 * 3. Fetch Product Reviews (GET /api/v1/reviews/product/:productId)
 */
export async function fetchProductReviews(
  productId: string,
  supabaseClient?: SupabaseClient,
): Promise<import("@/types/product.types").Review[]> {
  /*
  try {
    const { data } = await api.get<{ success: boolean; count: number; reviews: any[] }>(
      `/reviews/product/${productId}`
    );

    return (data.reviews || [])
      .filter((r: any) => r.is_approved === true)
      .map((r: any): import("@/types/product.types").Review => ({
        id: r.id,
        rating: r.review_content?.rating ?? r.rating ?? 5,
        title: r.review_content?.heading ?? r.heading ?? r.title ?? null,
        body: r.review_content?.comment ?? r.comment ?? r.body ?? "",
        customerName: r.user_name || "Verified Customer",
        isVerifiedPurchase: Boolean(r.is_verified_buyer || r.order_id),
        createdAt: r.created_at,
        images: Array.isArray(r.image_urls) ? r.image_urls : [],
        helpfulCount: r.helpful_count ?? 0,
      }));
  } catch (err) {
    console.error("[ReviewsService] fetchProductReviews failed:", err);
    return [];
  }
  */

  // Fetch product reviews directly from Supabase for PDP display
  try {
    const client = supabaseClient || createClient(config.supabaseUrl, config.supabaseAnonKey);
    const { data, error } = await client
      .from("reviews")
      .select("*")
      .eq("product_id", productId)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("[ReviewsService] fetchProductReviews Supabase error:", error);
      return [];
    }

    return (data || []).map((r: any): import("@/types/product.types").Review => ({
      id: r.id,
      rating: r.review_content?.rating ?? r.rating ?? 5,
      title: r.review_content?.heading ?? r.heading ?? r.title ?? null,
      body: r.review_content?.comment ?? r.comment ?? r.body ?? "",
      customerName: r.user_name || "Verified Customer",
      isVerifiedPurchase: Boolean(r.is_verified_buyer || r.order_id),
      createdAt: r.created_at,
      images: Array.isArray(r.image_urls) ? r.image_urls : [],
      helpfulCount: r.helpful_count ?? 0,
    }));
  } catch (err) {
    console.error("[ReviewsService] fetchProductReviews failed:", err);
    return [];
  }
}

/**
 * 4. Fetch Reviews by User (GET /api/v1/reviews/user/:userId)
 * Enriches each review with product title, slug, and image from Supabase.
 */
export async function fetchCustomerReviews(
  supabase: SupabaseClient,
  userId?: string,
): Promise<Review[]> {
  let targetUserId = userId;
  if (!targetUserId) {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    targetUserId = user?.id;
  }

  if (!targetUserId) {
    throw new Error("Must be authenticated to fetch reviews.");
  }

  // Fetch reviews directly from Supabase
  const { data: reviewsData, error: reviewsError } = await supabase
    .from("reviews")
    .select("*")
    .eq("user_id", targetUserId)
    .order("created_at", { ascending: false });

  if (reviewsError) {
    console.error("[ReviewsService] fetchCustomerReviews Supabase error:", reviewsError);
    throw reviewsError;
  }

  const reviews = reviewsData || [];

  if (reviews.length === 0) return [];

  // Enrich with product details from Supabase
  const productIds = [...new Set(reviews.map((r: any) => r.product_id).filter(Boolean))];

  let productMap = new Map<string, { title: string; slug: string; imageUrl: string | null }>();
  if (productIds.length > 0) {
    const { data: products } = await supabase
      .from("products")
      .select("id, title, slug, product_images(url)")
      .in("id", productIds);

    for (const p of products || []) {
      const images = (p as any).product_images;
      productMap.set(p.id, {
        title: p.title,
        slug: (p as any).slug ?? "",
        imageUrl: Array.isArray(images) && images.length > 0 ? images[0].url : null,
      });
    }
  }

  return reviews.map((r: any) => {
    const product = productMap.get(r.product_id);
    return {
      id: r.id,
      productId: r.product_id,
      productSlug: product?.slug ?? "",
      productTitle: product?.title ?? "Gemstone Product",
      productImageUrl: product?.imageUrl ?? (Array.isArray(r.image_urls) && r.image_urls.length > 0 ? r.image_urls[0] : null),
      rating: r.review_content?.rating ?? r.rating ?? 5,
      title: r.review_content?.heading ?? r.heading ?? r.title ?? null,
      body: r.review_content?.comment ?? r.comment ?? r.body ?? null,
      isVerifiedPurchase: Boolean(r.is_verified_buyer || r.order_id),
      createdAt: r.created_at,
    };
  });
}

/**
 * 5. Fetch Pending Reviews
 * Finds items from delivered orders where the user hasn't submitted a review yet.
 */
export async function fetchPendingReviews(
  supabase: SupabaseClient,
  userId?: string,
): Promise<PendingReview[]> {
  let targetUserId = userId;
  if (!targetUserId) {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    targetUserId = user?.id;
  }

  if (!targetUserId) {
    throw new Error("Must be authenticated to fetch pending reviews.");
  }

  // 1. Fetch delivered orders for this user
  const { data: ordersData, error: ordersError } = await supabase
    .from("orders")
    .select(`
      id,
      placed_at,
      product_info,
      payment_info
    `)
    .eq("user_id", targetUserId)
    .eq("status", "delivered");

  if (ordersError) {
    console.error("[ReviewsService] fetchPendingReviews orders error:", ordersError);
    return [];
  }

  // 2. Fetch existing reviews to exclude already reviewed products (Commented out API GET request)
  /*
  let reviewedProductIds: Set<string> = new Set();
  try {
    const { data: reviewJson } = await api.get<{ reviews: any[] }>(`/api/v1/reviews/user/${user.id}`);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    reviewedProductIds = new Set((reviewJson.reviews ?? []).map((r: any) => r.product_id as string));
  } catch {
    // If review fetch fails, proceed with empty set
  }
  */

  // Direct Supabase query to get reviewed product IDs
  let reviewedProductIds: Set<string> = new Set();
  const { data: userReviews, error: userReviewsError } = await supabase
    .from("reviews")
    .select("product_id")
    .eq("user_id", targetUserId);

  if (userReviewsError) {
    console.error("[ReviewsService] fetchPendingReviews user reviews Supabase error:", userReviewsError);
  } else if (userReviews) {
    reviewedProductIds = new Set(userReviews.map((r: any) => r.product_id as string).filter(Boolean));
  }

  // 3. Extract unreviewed products from delivered orders
  const pendingReviews: PendingReview[] = [];
  const processedProductIds = new Set<string>();

  for (const order of ordersData || []) {
    const rawProducts = typeof order.product_info === "string"
      ? JSON.parse(order.product_info)
      : (order.product_info || []);

    const paymentInfo = typeof order.payment_info === "string"
      ? JSON.parse(order.payment_info)
      : (order.payment_info || {});

    const subtotal = parseFloat(paymentInfo.subtotal || "0");
    const totalQty = rawProducts.reduce((sum: number, it: any) => sum + (it.quantity || 1), 0);
    const fallbackPrice = totalQty > 0 ? subtotal / totalQty : 0;

    for (const item of rawProducts) {
      const productId = item.product_id;
      if (productId && !reviewedProductIds.has(productId) && !processedProductIds.has(productId)) {
        processedProductIds.add(productId);

        const price = item.unit_price ? parseFloat(item.unit_price) : fallbackPrice;

        pendingReviews.push({
          id: item.id || `pending_${order.id}_${productId}`,
          orderId: order.id,
          productId: productId,
          productSlug: item.product_slug || "",
          productTitle: item.product_title || "Purchased Item",
          productImageUrl: item.image_url || null,
          price: price,
          purchasedAt: order.placed_at,
          isVerifiedPurchase: true,
        });
      }
    }
  }

  // If any pending review has missing slug, enrich from products table
  const missingSlugIds = pendingReviews.filter(p => !p.productSlug).map(p => p.productId);
  if (missingSlugIds.length > 0) {
    const { data: prods } = await supabase
      .from("products")
      .select("id, slug, title, product_images(url)")
      .in("id", missingSlugIds);

    const map = new Map<string, { slug: string; title: string; imageUrl: string | null }>();
    for (const p of prods || []) {
      const images = (p as any).product_images;
      map.set(p.id, {
        slug: p.slug,
        title: p.title,
        imageUrl: Array.isArray(images) && images.length > 0 ? images[0].url : null,
      });
    }

    for (const item of pendingReviews) {
      const enriched = map.get(item.productId);
      if (enriched) {
        item.productSlug = enriched.slug;
        if (!item.productTitle || item.productTitle === "Purchased Item") item.productTitle = enriched.title;
        if (!item.productImageUrl) item.productImageUrl = enriched.imageUrl;
      }
    }
  }

  return pendingReviews.sort(
    (a, b) => new Date(b.purchasedAt).getTime() - new Date(a.purchasedAt).getTime(),
  );
}

/**
 * 6. Check if User is Eligible to Review a Product
 */
export async function checkCanUserReviewProduct(
  supabase: SupabaseClient,
  productId: string,
  userId: string
): Promise<ReviewEligibility> {
  // 1. Check delivered orders for this user
  const { data: ordersData, error: ordersError } = await supabase
    .from("orders")
    .select("id, status, product_info")
    .eq("user_id", userId)
    .eq("status", "delivered");

  if (ordersError || !ordersData || ordersData.length === 0) {
    return { eligible: false, reason: 'NOT_PURCHASED' };
  }

  let matchingOrderId: string | undefined = undefined;

  for (const order of ordersData) {
    const items = typeof order.product_info === 'string'
      ? JSON.parse(order.product_info)
      : (order.product_info || []);

    const hasItem = items.some((item: any) => item.product_id === productId);
    if (hasItem) {
      matchingOrderId = order.id;
      break;
    }
  }

  if (!matchingOrderId) {
    return { eligible: false, reason: 'NOT_PURCHASED' };
  }

  // 2. Check if user already reviewed this product (Commented out API GET request)
  /*
  try {
    const { data: reviewJson } = await api.get<{ reviews: any[] }>(`/api/v1/reviews/user/${userId}`);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const alreadyReviewed = (reviewJson.reviews ?? []).some((r: any) => r.product_id === productId);

    if (alreadyReviewed) {
      return { eligible: false, reason: 'ALREADY_REVIEWED', orderId: matchingOrderId };
    }
  } catch (err) {
    console.error("[ReviewsService] checkCanUserReviewProduct review check failed:", err);
  }
  */

  // Direct Supabase query to check if user already reviewed this product
  try {
    const { data: existingReview, error: existingReviewError } = await supabase
      .from("reviews")
      .select("id")
      .eq("user_id", userId)
      .eq("product_id", productId)
      .maybeSingle();

    if (existingReviewError) {
      console.error("[ReviewsService] checkCanUserReviewProduct Supabase error:", existingReviewError);
    } else if (existingReview) {
      return { eligible: false, reason: 'ALREADY_REVIEWED', orderId: matchingOrderId };
    }
  } catch (err) {
    console.error("[ReviewsService] checkCanUserReviewProduct review check failed:", err);
  }

  return { eligible: true, reason: 'ELIGIBLE' };
}