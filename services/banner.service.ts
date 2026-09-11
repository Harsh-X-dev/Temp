/**
 * Banner service — the only module that queries the `banners` table.
 *
 * Architecture note:
 *  - This module runs exclusively on the server (imported by Server Components).
 *  - It maps the raw database row shape to the Banner interface consumed by
 *    the carousel components, insulating the UI from schema changes.
 */
import { createSupabaseServerClient } from "@/services/supabase/server";
import type { Banner } from "@/types/banner.types";

/**
 * Raw row shape returned from the `banners` table.
 * Only the columns we SELECT are listed here — avoids using `*`.
 */
interface BannerRow {
  id: string;
  title: string | null;
  image_url: string;
  link_url: string | null;
  sort_order: number;
}

/**
 * Fetch all active homepage hero banners, ordered by sort_order ascending.
 *
 * Filters:
 *  - is_active = true   (respected by RLS policy "public can read active banners")
 *  - placement = 'homepage_hero'
 *
 * Returns an empty array on error so the carousel degrades gracefully.
 */
export async function getHomeBanners(): Promise<Banner[]> {
  const supabase = createSupabaseServerClient();

  const { data, error } = await supabase
    .from("banners")
    .select("id, title, image_url, link_url, sort_order")
    .eq("is_active", true)
    .eq("placement", "homepage_hero")
    .order("sort_order", { ascending: true })
    .returns<BannerRow[]>();

  if (error) {
    // Log the error server-side for observability; return empty array so
    // the UI doesn't crash. The carousel handles [] with a null render.
    console.error("[BannerService] Failed to fetch banners:", error.message);
    return [];
  }

  if (!data || data.length === 0) {
    return [];
  }

  return data.map(mapRowToBanner);
}

/**
 * Maps a raw database row to the Banner interface the carousel expects.
 *
 * The `banners` table does not have subtitle, buttonText, or imageAlt columns.
 * The carousel's BannerSlide component handles these gracefully when empty.
 */
function mapRowToBanner(row: BannerRow): Banner {
  return {
    id: row.id,
    title: row.title ?? "",
    subtitle: "",
    buttonText: "Shop now",
    // buttonHref: row.link_url ?? "/shop",
    buttonHref: "/collection/all",
    image: row.image_url,
    imageAlt: row.title ?? "Banner",
  };
}

/**
 * Fetch banners by a specific placement value.
 */
export async function getBannersByPlacement(placement: string): Promise<Banner[]> {
  const supabase = createSupabaseServerClient();

  const { data, error } = await supabase
    .from("banners")
    .select("id, title, image_url, link_url, sort_order")
    .eq("is_active", true)
    .eq("placement", placement)
    .order("sort_order", { ascending: true })
    .returns<BannerRow[]>();

  if (error) {
    console.error(`[BannerService] Failed to fetch banners for placement: ${placement}:`, error.message);
    return [];
  }

  if (!data || data.length === 0) {
    return [];
  }

  return data.map(mapRowToBanner);
}
