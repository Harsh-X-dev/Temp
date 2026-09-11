import BannerSlider from "@/components/home/banners/BannerSlider";
import { getHomeBanners } from "@/services/banner.service";
import type { Banner } from "@/types/banner.types";

/**
 * BannerCarousel — Server Component.
 *
 * Responsibilities:
 *  - Own the data layer.
 *  - Pass the banner array down to BannerSlider.
 *  - Zero client-side logic — no useState, no useEffect, no timers.
 *
 * Data source: Supabase `banners` table (placement = homepage_hero,
 * is_active = true), fetched server-side on every request.
 *
 * If the database returns an empty array or an error occurs, BannerSlider
 * handles the empty state gracefully (renders null).
 */
export default async function BannerCarousel() {
  // ── Data layer ─────────────────────────────────────────────────────────────
  const banners: Banner[] = await getHomeBanners();

  // ── Render ─────────────────────────────────────────────────────────────────
  return <BannerSlider banners={banners} />;
}


