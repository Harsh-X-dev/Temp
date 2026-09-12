/**
 * Collection service — the only module that queries the `collections` table.
 *
 * Maps DB rows to the `CategoryConfig` interface used by CategoryBar so
 * the UI layer is fully insulated from the schema.
 */
import { cache } from "react";
import { unstable_cache } from "next/cache";
import { createSupabaseServerClient } from "@/services/supabase/server";
import type { CategoryConfig } from "@/types/shared.types";

/** Raw row shape — only the columns we SELECT. */
interface CollectionRow {
  id: string; // uuid — kept internally, not exposed to UI
  title: string;
  slug: string;
  image_url: string | null;
  sort_order: number;
}

/**
 * The virtual "All" entry is never stored in the database.
 * It is always prepended to the list in application code.
 */
const ALL_CATEGORY: CategoryConfig = {
  id: "all",
  label: "All",
  icon: "", // CategoryBar renders a gradient fallback when icon is empty
};

const getCachedActiveCollections = unstable_cache(
  async (): Promise<CollectionRow[]> => {
    const supabase = createSupabaseServerClient();
    const { data, error } = await supabase
      .from("collections")
      .select("id, title, slug, image_url, sort_order")
      .eq("is_active", true)
      .order("sort_order", { ascending: true })
      .returns<CollectionRow[]>();

    if (error || !data) {
      if (error) console.error("[CollectionService] Failed to fetch collections:", error.message);
      return [];
    }
    return data;
  },
  ["active-collections-list"],
  { revalidate: 60, tags: ["collections"] }
);

/**
 * Fetch all active collections ordered by sort_order.
 * Prepends the virtual "All" entry.
 *
 * Returns [ALL_CATEGORY] on error so the category bar stays visible.
 */
export const getActiveCollections = cache(async function getActiveCollections(): Promise<CategoryConfig[]> {
  const data = await getCachedActiveCollections();

  if (!data || data.length === 0) {
    return [ALL_CATEGORY];
  }

  const categories: CategoryConfig[] = data.map((row) => ({
    id: row.slug,
    label: row.title,
    icon: row.image_url ?? "",
  }));

  return [ALL_CATEGORY, ...categories];
});

/**
 * Fetch a single collection by its URL slug.
 * Returns `undefined` for unknown or inactive slugs — callers should
 * invoke `notFound()` in that case.
 */
export const getCollectionBySlug = cache(async function getCollectionBySlug(
  slug: string,
): Promise<CategoryConfig | undefined> {
  const normalizedSlug = (slug || "").toLowerCase().trim();
  if (normalizedSlug === "all") {
    return ALL_CATEGORY;
  }

  const all = await getActiveCollections();
  return all.find((c) => (c.id || "").toLowerCase() === normalizedSlug);
});

/**
 * Fetch the internal UUID for a collection slug.
 * Used by the product service to filter products by collection.
 * Returns `null` for unknown or inactive slugs.
 */
export const getCollectionIdBySlug = cache(async function getCollectionIdBySlug(slug: string): Promise<string | null> {
  const rows = await getCachedActiveCollections();
  const match = rows.find((r) => r.slug === slug);
  return match ? match.id : null;
});
