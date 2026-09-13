import { cache } from "react";
import { unstable_cache } from "next/cache";
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

const DEFAULT_HERO_BANNERS: Banner[] = [
  {
    id: "hero-default-1",
    title: "100% Lab-Certified Spiritual Gemstones",
    subtitle: "NATURALLY ENERGIZED",
    buttonText: "Shop Collection",
    buttonHref: "/collection/all",
    image: "/assets/images/hero_section_new_arrival.png",
    imageAlt: "100% Lab-Certified Spiritual Gemstones",
  },
];

const getCachedHomeBanners = unstable_cache(
  async (): Promise<Banner[]> => {
    try {
      const supabase = createSupabaseServerClient();

      const { data, error } = await supabase
        .from("banners")
        .select("id, title, image_url, link_url, sort_order")
        .eq("is_active", true)
        .eq("placement", "homepage_hero")
        .order("sort_order", { ascending: true })
        .returns<BannerRow[]>();

      if (error || !data || data.length === 0) {
        return DEFAULT_HERO_BANNERS;
      }

      return data.map(mapRowToBanner);
    } catch {
      return DEFAULT_HERO_BANNERS;
    }
  },
  ["homepage-hero-banners"],
  { revalidate: 60, tags: ["banners"] }
);

/**
 * Fetch all active homepage hero banners, ordered by sort_order ascending.
 */
export const getHomeBanners = cache(async function getHomeBanners(): Promise<Banner[]> {
  return getCachedHomeBanners();
});

/**
 * Maps a raw database row to the Banner interface the carousel expects.
 *
 * The `banners` table does not have subtitle, buttonText, or imageAlt columns.
 * The carousel's BannerSlide component handles these gracefully when empty.
 */
function mapRowToBanner(row: BannerRow): Banner {
  let buttonHref = row.link_url || "/collection/all";
  if (!row.link_url && row.title && row.title.toLowerCase().includes("mukhi")) {
    buttonHref = "/collection/all?mukhi=all_mukhi";
  }

  return {
    id: row.id,
    title: row.title ?? "",
    subtitle: "",
    buttonText: "Shop now",
    buttonHref,
    image: row.image_url,
    imageAlt: row.title ?? "Banner",
  };
}

const getCachedBannersByPlacement = unstable_cache(
  async (placement: string): Promise<Banner[]> => {
    try {
      const supabase = createSupabaseServerClient();

      const { data, error } = await supabase
        .from("banners")
        .select("id, title, image_url, link_url, sort_order")
        .eq("is_active", true)
        .eq("placement", placement)
        .order("sort_order", { ascending: true })
        .returns<BannerRow[]>();

      if (error || !data || data.length === 0) {
        return [];
      }

      return data.map(mapRowToBanner);
    } catch {
      return [];
    }
  },
  ["banners-by-placement"],
  { revalidate: 60, tags: ["banners"] }
);

/**
 * Fetch banners by a specific placement value.
 */
export const getBannersByPlacement = cache(async function getBannersByPlacement(placement: string): Promise<Banner[]> {
  return getCachedBannersByPlacement(placement);
});
