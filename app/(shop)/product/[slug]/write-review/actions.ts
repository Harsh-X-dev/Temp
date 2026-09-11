'use server';

import { revalidatePath } from 'next/cache';
import { createSupabaseServerAuthClient } from "@/services/supabase/server";
import { submitReview } from "@/services/reviews.service";

export async function submitReviewAction(formData: FormData, productSlug?: string) {
  const supabase = await createSupabaseServerAuthClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "Must be logged in to submit a review." };
  }

  const productId = formData.get("product_id") as string;
  if (!productId) {
    return { success: false, error: "Product ID is required." };
  }

  // 1. Check if user already reviewed this product
  const { data: existingReview } = await supabase
    .from("reviews")
    .select("id")
    .eq("user_id", user.id)
    .eq("product_id", productId)
    .maybeSingle();

  if (existingReview) {
    return { success: false, error: "You have already submitted a review for this product." };
  }

  // 2. Check if user purchased the product
  const { data: userOrders } = await supabase
    .from("orders")
    .select("id, status, product_info")
    .eq("user_id", user.id)
    .neq("status", "cancelled");

  let matchingOrderId: string | undefined = undefined;
  if (userOrders) {
    for (const order of userOrders) {
      const items = typeof order.product_info === 'string'
        ? JSON.parse(order.product_info)
        : (order.product_info || []);

      const hasItem = items.some((item: any) => item.product_id === productId || item.id === productId);
      if (hasItem) {
        matchingOrderId = order.id;
        break;
      }
    }
  }

  if (!matchingOrderId) {
    return { success: false, error: "Please purchase the item before you give a review." };
  }

  formData.set("order_id", matchingOrderId);
  formData.set("order_item_id", matchingOrderId);

  // Ensure user_id is attached
  if (!formData.get("user_id")) {
    formData.set("user_id", user.id);
  }

  // Ensure user_name is attached if missing
  let userName = formData.get("user_name") as string;
  if (!userName || /^\+?[0-9]{7,15}$/.test(userName.trim())) {
    userName = user.user_metadata?.full_name || user.user_metadata?.name;
    
    if (!userName) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("full_name")
        .eq("id", user.id)
        .maybeSingle();
      userName = profile?.full_name;
    }

    formData.set("user_name", userName || "Verified Customer");
  }

  try {
    const { data: { session } } = await supabase.auth.getSession();
    const token = session?.access_token;
    const res = await submitReview(formData, token);

    if (productSlug) {
      revalidatePath(`/product/${productSlug}`);
    }

    return { success: true, data: res };
  } catch (error: any) {
    console.error('[submitReviewAction] Error submitting review:', error);
    return { success: false, error: error.message || "Failed to submit review." };
  }
}
