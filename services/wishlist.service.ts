import type { SupabaseClient } from "@supabase/supabase-js";

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function isUUID(id: string): boolean {
  return UUID_RE.test(id);
}

/**
 * Fetch all product IDs in a user's wishlist from Supabase.
 */
export async function fetchWishlistProductIds(
  supabase: SupabaseClient,
  customerId: string,
): Promise<string[]> {
  if (!customerId || !isUUID(customerId)) return [];

  try {
    const { data, error } = await supabase
      .from("wishlists")
      .select("product_id")
      .eq("customer_id", customerId)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("[WishlistService] fetchWishlistProductIds error:", error.message);
      return [];
    }

    return (data ?? [])
      .map((row: { product_id: string }) => row.product_id)
      .filter(isUUID);
  } catch (err) {
    console.error("[WishlistService] Unexpected error fetching wishlist:", err);
    return [];
  }
}

/**
 * Add a product to the user's wishlist in Supabase.
 */
export async function addToWishlistDb(
  supabase: SupabaseClient,
  customerId: string,
  productId: string,
): Promise<void> {
  if (!customerId || !productId || !isUUID(customerId) || !isUUID(productId)) return;

  try {
    const { error } = await supabase.from("wishlists").upsert(
      {
        customer_id: customerId,
        product_id: productId,
      },
      { onConflict: "customer_id,product_id" },
    );

    if (error) {
      console.error("[WishlistService] addToWishlistDb error:", error.message);
    }
  } catch (err) {
    console.error("[WishlistService] Unexpected error adding to wishlist DB:", err);
  }
}

/**
 * Remove a product from the user's wishlist in Supabase.
 */
export async function removeFromWishlistDb(
  supabase: SupabaseClient,
  customerId: string,
  productId: string,
): Promise<void> {
  if (!customerId || !productId || !isUUID(customerId) || !isUUID(productId)) return;

  try {
    const { error } = await supabase
      .from("wishlists")
      .delete()
      .eq("customer_id", customerId)
      .eq("product_id", productId);

    if (error) {
      console.error("[WishlistService] removeFromWishlistDb error:", error.message);
    }
  } catch (err) {
    console.error("[WishlistService] Unexpected error removing from wishlist DB:", err);
  }
}

/**
 * Clear all wishlist items for a user in Supabase.
 */
export async function clearWishlistDb(
  supabase: SupabaseClient,
  customerId: string,
): Promise<void> {
  if (!customerId || !isUUID(customerId)) return;

  try {
    const { error } = await supabase
      .from("wishlists")
      .delete()
      .eq("customer_id", customerId);

    if (error) {
      console.error("[WishlistService] clearWishlistDb error:", error.message);
    }
  } catch (err) {
    console.error("[WishlistService] Unexpected error clearing wishlist DB:", err);
  }
}

/**
 * Merge guest wishlist product IDs with the user's DB wishlist upon login.
 * Inserts any guest items into Supabase and returns the complete updated list of product IDs.
 */
export async function syncGuestWishlistToDb(
  supabase: SupabaseClient,
  customerId: string,
  guestProductIds: string[],
): Promise<string[]> {
  if (!customerId || !isUUID(customerId)) return [];

  const validGuestIds = (guestProductIds || []).filter(isUUID);

  try {
    // 1. If guest has items, upsert them into DB
    if (validGuestIds.length > 0) {
      const rowsToInsert = validGuestIds.map((productId) => ({
        customer_id: customerId,
        product_id: productId,
      }));

      const { error: upsertError } = await supabase
        .from("wishlists")
        .upsert(rowsToInsert, { onConflict: "customer_id,product_id" });

      if (upsertError) {
        console.error("[WishlistService] syncGuestWishlistToDb upsert error:", upsertError.message);
      }
    }

    // 2. Fetch the consolidated wishlist from DB
    return await fetchWishlistProductIds(supabase, customerId);
  } catch (err) {
    console.error("[WishlistService] syncGuestWishlistToDb unexpected error:", err);
    return await fetchWishlistProductIds(supabase, customerId);
  }
}
