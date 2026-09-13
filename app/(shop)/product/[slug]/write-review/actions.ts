'use server';

import { revalidatePath } from 'next/cache';
import { createSupabaseServerAuthClient, createSupabaseAdmin } from "@/services/supabase/server";

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
    const admin = createSupabaseAdmin();
    const uploadedImageUrls: string[] = [];
    const imageFiles = formData.getAll("images") as (File | string)[];

    for (const file of imageFiles) {
      if (typeof file === "object" && file.size > 0 && "arrayBuffer" in file) {
        try {
          const buffer = Buffer.from(await file.arrayBuffer());
          const ext = file.name ? file.name.split(".").pop() || "jpg" : "jpg";
          const fileName = `customer/${user.id}/${Date.now()}_${Math.random().toString(36).substring(2, 8)}.${ext}`;

          const { error: uploadError } = await admin.storage
            .from("reviews")
            .upload(fileName, buffer, {
              contentType: file.type || "image/jpeg",
              upsert: true,
            });

          if (!uploadError) {
            const { data: publicUrlData } = admin.storage
              .from("reviews")
              .getPublicUrl(fileName);
            if (publicUrlData?.publicUrl) {
              uploadedImageUrls.push(publicUrlData.publicUrl);
            }
          }
        } catch (uploadErr) {
          console.warn("[submitReviewAction] Failed to upload an image:", uploadErr);
        }
      }
    }

    const ratingNum = parseFloat(formData.get("rating") as string) || 5;
    const headingText = (formData.get("heading") as string) || (formData.get("title") as string) || "Review";
    const commentText = (formData.get("comment") as string) || (formData.get("body") as string) || "";

    const { data: insertedReview, error: insertError } = await admin
      .from("reviews")
      .insert({
        product_id: productId,
        user_id: user.id,
        user_name: userName || "Verified Customer",
        order_id: matchingOrderId || null,
        is_approved: true,
        helpful_count: 0,
        image_urls: uploadedImageUrls,
        review_content: {
          rating: ratingNum,
          heading: headingText,
          comment: commentText,
        },
      })
      .select()
      .single();

    if (insertError) {
      console.error("[submitReviewAction] Supabase insert error:", insertError);
      return { success: false, error: insertError.message || "Failed to save review." };
    }

    if (productSlug) {
      revalidatePath(`/product/${productSlug}`);
      revalidatePath(`/product/${productSlug}`, 'page');
    }

    return {
      success: true,
      data: {
        success: true,
        message: "Review submitted successfully.",
        review_id: insertedReview.id,
        image_urls: uploadedImageUrls,
      },
    };
  } catch (error: any) {
    console.error('[submitReviewAction] Error submitting review:', error);
    return { success: false, error: error.message || "Failed to submit review." };
  }
}

export async function markReviewHelpfulAction(
  reviewId: string,
  action: 'increment' | 'decrement' = 'increment'
): Promise<{ success: boolean; helpful_count?: number }> {
  try {
    const admin = createSupabaseAdmin();
    const { data: review, error: fetchError } = await admin
      .from('reviews')
      .select('helpful_count')
      .eq('id', reviewId)
      .single();

    if (fetchError || !review) {
      return { success: false };
    }

    const currentCount = review.helpful_count ?? 0;
    const newCount = action === 'decrement' ? Math.max(0, currentCount - 1) : currentCount + 1;

    const { error: updateError } = await admin
      .from('reviews')
      .update({ helpful_count: newCount })
      .eq('id', reviewId);

    if (updateError) {
      console.error('[markReviewHelpfulAction] update error:', updateError);
      return { success: false };
    }

    return { success: true, helpful_count: newCount };
  } catch (err) {
    console.error('[markReviewHelpfulAction] failed:', err);
    return { success: false };
  }
}
