import { cache } from "react";
import { createSupabaseServerClient } from "@/services/supabase/server";
import type { Product } from "@/types/shared.types";

export interface PurposeSummary {
  id: string;
  title: string;
  subtitle: string;
  slug: string;
  imageUrl?: string;
  isActive: boolean;
}

export interface PurposeDetail {
  id: string;
  name: string;
  slug: string;
  headline: string;
  description: string;
  bannerImage: string;
}

const DEFAULT_PURPOSES: Record<string, Omit<PurposeDetail, "id" | "slug">> = {
  wealth: {
    name: "Wealth",
    headline: "Rudraksha for Abundance",
    description:
      "Unlock financial pathways and welcome stable opportunities. Specially selected combinations align your inner energy center to invite material growth, prosperity, and sharp decision-making.",
    bannerImage: "/assets/images/hero_section_new_arrival.png",
  },
  health: {
    name: "Health",
    headline: "Rudraksha for Health & Vitality",
    description:
      "Experience natural holistic recovery. Authentic Rudraksha beads are known to calm the central nervous system, regulate blood circulation, and introduce profound energetic stability.",
    bannerImage: "/assets/images/hero_section_new_arrival.png",
  },
  career: {
    name: "Career",
    headline: "Rudraksha for Ambition",
    description:
      "Elevate your professional path with absolute mental clarity, confidence, and leadership. Clear away workspace hesitation and sustain steady, purposeful progress.",
    bannerImage: "/assets/images/hero_section_new_arrival.png",
  },
  relationship: {
    name: "Relationships",
    headline: "Rudraksha for Harmony",
    description:
      "Foster deep empathy, understanding, and peaceful communication. Heal past blockages to open up clean spaces of compassion, trust, and mutual respect in your close bonds.",
    bannerImage: "/assets/images/hero_section_new_arrival.png",
  },
  relationships: {
    name: "Relationships",
    headline: "Rudraksha for Harmony",
    description:
      "Foster deep empathy, understanding, and peaceful communication. Heal past blockages to open up clean spaces of compassion, trust, and mutual respect in your close bonds.",
    bannerImage: "/assets/images/hero_section_new_arrival.png",
  },
  protection: {
    name: "Protection",
    headline: "Rudraksha for Shielding",
    description:
      "Create a powerful energetic shield around yourself. Ward off negative influences, dispel ambient stress, and maintain a quiet, untouchable field of peace wherever your journey takes you.",
    bannerImage: "/assets/images/hero_section_new_arrival.png",
  },
  peace: {
    name: "Peace",
    headline: "Rudraksha for Tranquility",
    description:
      "Quiet the incessant chatter of a busy mind. Regulate your nervous system, sleep with profound restfulness, and master the art of calm, mindful living in the present moment.",
    bannerImage: "/assets/images/hero_section_new_arrival.png",
  },
  love: {
    name: "Love",
    headline: "Rudraksha for Connection",
    description:
      "Radiate and attract high-vibrational love. Align your heart chakra to experience profound self-worth, invite pure romantic partnerships, and live with an open heart.",
    bannerImage: "/assets/images/hero_section_new_arrival.png",
  },
  success: {
    name: "Success",
    headline: "Rudraksha for Triumph",
    description:
      "Manifest your highest vision of personal achievement. Break free from self-doubt, supercharge your energetic willpower, and stride boldly toward victory in all your ventures.",
    bannerImage: "/assets/images/hero_section_new_arrival.png",
  },
  wisdom: {
    name: "Wisdom",
    headline: "Rudraksha for Intellect & Learning",
    description:
      "Awaken sacred knowledge, sharpen memory retention, and cultivate deep intellectual prowess with consecrated multi-mukhi Rudraksha beads.",
    bannerImage: "/assets/images/hero_section_new_arrival.png",
  },
  focus: {
    name: "Focus",
    headline: "Rudraksha for Concentration & Dhyana",
    description:
      "Enhance mental clarity, eliminate daily distractions, and channel intense single-pointed focus for study, meditation, and high-performance work.",
    bannerImage: "/assets/images/hero_section_new_arrival.png",
  },
  confidence: {
    name: "Confidence",
    headline: "Rudraksha for Self-Belief & Charisma",
    description:
      "Ignite your inner solar power, dissolve self-doubt, and radiate charismatic authority with energized Agni and Sun-ruled Rudraksha beads.",
    bannerImage: "/assets/images/hero_section_new_arrival.png",
  },
  courage: {
    name: "Courage",
    headline: "Rudraksha for Fearlessness & Strength",
    description:
      "Overcome deep-seated fears and challenges. Instill unwavering valor, emotional resilience, and fearless determination in the face of life obstacles.",
    bannerImage: "/assets/images/hero_section_new_arrival.png",
  },
  balance: {
    name: "Balance",
    headline: "Rudraksha for Energy Alignment & Harmony",
    description:
      "Harmonize your chakras and subtle bio-energies. Restore inner equilibrium, emotional stability, and grounded centeredness in your daily life.",
    bannerImage: "/assets/images/hero_section_new_arrival.png",
  },
  clarity: {
    name: "Clarity",
    headline: "Rudraksha for Mindful Perspective",
    description:
      "Dissolve mental fog, confusion, and indecision. Gain acute perceptual clarity, intuitive insights, and confident decision-making ability.",
    bannerImage: "/assets/images/hero_section_new_arrival.png",
  },
  abundance: {
    name: "Abundance",
    headline: "Rudraksha for Overflowing Prosperity",
    description:
      "Attune your consciousness to infinite universal abundance. Attract lucrative opportunities, thriving ventures, and holistic material richness.",
    bannerImage: "/assets/images/hero_section_new_arrival.png",
  },
  luck: {
    name: "Luck",
    headline: "Rudraksha for Auspicious Fortune",
    description:
      "Align with favorable cosmic timings and positive synchronicities. Magnetize good fortune, sudden auspicious blessings, and rewarding breakthroughs.",
    bannerImage: "/assets/images/hero_section_new_arrival.png",
  },
  meditation: {
    name: "Meditation",
    headline: "Tranquility, Mindfulness & Dhyana Focus",
    description:
      "Settle the restless chatter of the mind, deepen breathwork, and elevate inner spiritual awareness with pure 5 Mukhi Himalayan japa malas.",
    bannerImage: "/assets/images/hero_section_new_arrival.png",
  },
  education: {
    name: "Education",
    headline: "Sharpen Memory, Intellect & Learning",
    description:
      "Harness the intellect-boosting power of 4 Mukhi Brahma Rudraksha and Emerald to enhance memory retention, concentration, and scholastic success.",
    bannerImage: "/assets/images/hero_section_new_arrival.png",
  },
  prosperity: {
    name: "Prosperity",
    headline: "Continuous Success, Growth & Expansion",
    description:
      "Align with universal abundance to manifest thriving endeavors, joyful expansion, and sustained material and spiritual well-being.",
    bannerImage: "/assets/images/hero_section_new_arrival.png",
  },
  spiritual: {
    name: "Spiritual",
    headline: "Higher Consciousness & Sacred Awakening",
    description:
      "Attune your soul to transcendental vibrations, chakra alignment, and profound spiritual enlightenment with high-mukhi energized rudraksha.",
    bannerImage: "/assets/images/hero_section_new_arrival.png",
  },
};

const DEFAULT_ACTIVE_PURPOSES: PurposeSummary[] = [
  { id: "health", title: "Health", subtitle: "Immunity & Physical Balance", slug: "health", isActive: true },
  { id: "wealth", title: "Wealth", subtitle: "Attract Prosperity", slug: "wealth", isActive: true },
  { id: "career", title: "Career", subtitle: "Growth & Opportunities", slug: "career", isActive: true },
  { id: "relationship", title: "Relationships", subtitle: "Love & Harmonious Bonds", slug: "relationship", isActive: true },
  { id: "protection", title: "Protection", subtitle: "Guard Against Negative Energies", slug: "protection", isActive: true },
  { id: "peace", title: "Peace", subtitle: "Stress Relief & Calm Mind", slug: "peace", isActive: true },
  { id: "love", title: "Love", subtitle: "Rudraksha for Connection", slug: "love", isActive: true },
  { id: "success", title: "Success", subtitle: "Rudraksha for Triumph", slug: "success", isActive: true },
  { id: "wisdom", title: "Wisdom", subtitle: "Rudraksha for Intellect & Learning", slug: "wisdom", isActive: true },
  { id: "focus", title: "Focus", subtitle: "Rudraksha for Concentration & Dhyana", slug: "focus", isActive: true },
  { id: "confidence", title: "Confidence", subtitle: "Rudraksha for Self-Belief & Charisma", slug: "confidence", isActive: true },
  { id: "courage", title: "Courage", subtitle: "Rudraksha for Fearlessness & Strength", slug: "courage", isActive: true },
  { id: "balance", title: "Balance", subtitle: "Rudraksha for Energy Alignment & Harmony", slug: "balance", isActive: true },
  { id: "clarity", title: "Clarity", subtitle: "Rudraksha for Mindful Perspective", slug: "clarity", isActive: true },
  { id: "abundance", title: "Abundance", subtitle: "Rudraksha for Overflowing Prosperity", slug: "abundance", isActive: true },
  { id: "luck", title: "Luck", subtitle: "Rudraksha for Auspicious Fortune", slug: "luck", isActive: true },
];

/**
 * Keyword mapper for fallback queries when join table is not populated yet.
 * Only returns products with matching purpose keywords.
 */
const PURPOSE_KEYWORDS: Record<string, string[]> = {
  wealth: ["wealth", "pyrite", "pukhraj", "yellow sapphire", "citrine", "laxmi", "lakshmi", "7 mukhi", "money"],
  abundance: ["abundance", "wealth", "prosperity", "pyrite", "kuber", "laxmi"],
  health: ["health", "vitality", "immunity", "5 mukhi", "healing"],
  career: ["career", "success", "emerald", "leadership", "panna", "ruby", "sun"],
  relationship: ["relationship", "love", "gauri shankar", "rose quartz", "harmony", "2 mukhi"],
  relationships: ["relationship", "love", "gauri shankar", "rose quartz", "harmony", "2 mukhi"],
  love: ["love", "heart", "rose quartz", "gauri shankar", "compassion"],
  protection: ["protection", "shield", "tourmaline", "tiger eye", "black obsidian", "evil eye", "10 mukhi"],
  peace: ["peace", "calm", "pearl", "moti", "moonstone", "stress", "tranquility"],
  success: ["success", "triumph", "victory", "ruby", "12 mukhi", "sun"],
  wisdom: ["wisdom", "knowledge", "4 mukhi", "emerald", "saraswati", "intellect"],
  focus: ["focus", "concentration", "dhyana", "quartz", "sphatik", "mala"],
  confidence: ["confidence", "courage", "3 mukhi", "carnelian", "power", "sun"],
  courage: ["courage", "fearless", "strength", "tiger eye", "red jasper", "3 mukhi"],
  balance: ["balance", "harmony", "chakra", "7 chakra", "align"],
  clarity: ["clarity", "clear quartz", "sphatik", "perspective", "intuition"],
  luck: ["luck", "fortune", "auspicious", "green aventurine", "citrine"],
  meditation: ["meditation", "focus", "mala", "quartz", "dhyana", "shiva"],
  education: ["education", "memory", "intellect", "4 mukhi", "emerald", "study"],
  prosperity: ["prosperity", "abundance", "pyrite", "kuber", "growth"],
  spiritual: ["spiritual", "rudraksha", "mala", "om", "awakening", "divine"],
};

/**
 * Formats a raw price into an Indian-locale currency string.
 */
function formatPrice(price: number): string {
  return `₹${price.toLocaleString("en-IN")}`;
}

/**
 * Fetches all active purposes from Supabase database (`is_active = true` / `active = true`).
 * Non-active purposes are strictly filtered out.
 */
export const getActivePurposes = cache(async function getActivePurposes(): Promise<PurposeSummary[]> {
  try {
    const supabase = createSupabaseServerClient();
    const { data, error } = await supabase
      .from("purposes")
      .select("*");

    if (!error && data && data.length > 0) {
      return data
        .filter((row: any) => row.is_active !== false && row.active !== false && row.status !== "inactive")
        .map((row: any) => {
          const slug = String(row.slug || "").toLowerCase().trim();
          const fallbackConfig = DEFAULT_PURPOSES[slug];
          const title = row.title || row.name || fallbackConfig?.name || slug;
          const subtitle =
            row.subtitle ||
            row.description ||
            fallbackConfig?.headline ||
            `Rudraksha for ${title}`;
          const imageUrl = row.image_url || row.icon_url || fallbackConfig?.bannerImage || "";

          return {
            id: String(row.id || slug),
            title,
            subtitle,
            slug,
            imageUrl,
            isActive: true,
            sortOrder: typeof row.sort_order === "number" ? row.sort_order : 0,
          };
        })
        .sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0));
    }

    if (error) {
      console.warn("[PurposeService] Supabase purposes query returned error:", error.message);
    }
  } catch (err) {
    console.error("Error fetching active purposes from Supabase:", err);
  }

  return DEFAULT_ACTIVE_PURPOSES.filter((p) => p.isActive !== false);
});

/**
 * Fetches purpose metadata by slug from Supabase, matching purposes table schema.
 */
export const getPurposeDetails = cache(async function getPurposeDetails(
  slug: string
): Promise<PurposeDetail> {
  const normalizedSlug = slug.toLowerCase().trim();
  const supabase = createSupabaseServerClient();

  const { data: dbPurpose } = await supabase
    .from("purposes")
    .select("*")
    .ilike("slug", normalizedSlug)
    .single();

  const defaultConfig = DEFAULT_PURPOSES[normalizedSlug] || {
    name: slug.charAt(0).toUpperCase() + slug.slice(1),
    headline: `Rudraksha & Gemstones for ${slug.charAt(0).toUpperCase() + slug.slice(1)}`,
    description:
      "Authentic, lab-certified and energized Himalayan gemstones and sacred rudraksha beads curated specifically for your intention.",
    bannerImage: "/assets/images/hero_section_new_arrival.png",
  };

  const name =
    (dbPurpose as any)?.title ||
    (dbPurpose as any)?.name ||
    defaultConfig.name;

  const headline =
    (dbPurpose as any)?.subtitle ||
    (dbPurpose as any)?.headline ||
    defaultConfig.headline;

  const description =
    dbPurpose?.description ||
    defaultConfig.description;

  const bannerImage =
    (dbPurpose as any)?.image_url ||
    defaultConfig.bannerImage;

  return {
    id: dbPurpose?.id || normalizedSlug,
    name,
    slug: dbPurpose?.slug || normalizedSlug,
    headline,
    description,
    bannerImage,
  };
});

/**
 * Fetches products associated with a specific purpose from Supabase database.
 * Supports product_purposes and products_purposes join tables.
 * Only returns products strictly matching that purpose!
 */
export const getProductsByPurposeSlug = cache(async function getProductsByPurposeSlug(
  slug: string
): Promise<Product[]> {
  const normalizedSlug = slug.toLowerCase().trim();
  const supabase = createSupabaseServerClient();

  // 1. Check if purpose exists in purposes table
  const { data: purposeRecord } = await supabase
    .from("purposes")
    .select("*")
    .ilike("slug", normalizedSlug)
    .single();

  if (purposeRecord && (purposeRecord.is_active === false || purposeRecord.active === false || purposeRecord.status === "inactive")) {
    return [];
  }

  if (purposeRecord?.id) {
    // Try product_purposes join table
    const { data: linkedRows1 } = await supabase
      .from("product_purposes")
      .select(`
        products (
          id,
          title,
          slug,
          is_energized,
          tags,
          options,
          attributes,
          product_images ( url, position ),
          product_variants ( id, sku, option1_value, option2_value, option3_value, price, compare_at_price, inventory_quantity, low_stock_threshold, is_active ),
          reviews ( is_approved, review_content )
        )
      `)
      .eq("purpose_id", purposeRecord.id);

    if (linkedRows1 && linkedRows1.length > 0) {
      const products = linkedRows1
        .map((r: any) => r.products)
        .filter(Boolean)
        .map(mapDbRowToProduct);

      if (products.length > 0) return products;
    }

    // Try products_purposes join table fallback
    const { data: linkedRows2 } = await supabase
      .from("products_purposes")
      .select(`
        products (
          id,
          title,
          slug,
          is_energized,
          tags,
          options,
          attributes,
          product_images ( url, position ),
          product_variants ( id, sku, option1_value, option2_value, option3_value, price, compare_at_price, inventory_quantity, low_stock_threshold, is_active ),
          reviews ( is_approved, review_content )
        )
      `)
      .eq("purpose_id", purposeRecord.id);

    if (linkedRows2 && linkedRows2.length > 0) {
      const products = linkedRows2
        .map((r: any) => r.products)
        .filter(Boolean)
        .map(mapDbRowToProduct);

      if (products.length > 0) return products;
    }
  }

  // 2. If join table has no rows for this purpose yet, query products matching tags or titles specifically
  const keywords = PURPOSE_KEYWORDS[normalizedSlug] || [normalizedSlug];
  const orFilters = keywords
    .map((k) => `tags.cs.{${k}},title.ilike.%${k}%,description.ilike.%${k}%`)
    .join(",");

  const { data: matchingProducts } = await supabase
    .from("products")
    .select(`
      id,
      title,
      slug,
      is_energized,
      tags,
      options,
      attributes,
      product_images ( url, position ),
      product_variants ( id, sku, option1_value, option2_value, option3_value, price, compare_at_price, inventory_quantity, low_stock_threshold, is_active ),
      reviews ( is_approved, review_content )
    `)
    .eq("status", "active")
    .or(orFilters)
    .limit(20);

  if (matchingProducts && matchingProducts.length > 0) {
    return matchingProducts.map(mapDbRowToProduct);
  }

  // Strictly return empty array if no matching products exist for this purpose
  return [];
});

function mapDbRowToProduct(row: any): Product {
  const sortedImages = [...(row.product_images ?? [])].sort(
    (a, b) => a.position - b.position
  );
  const imageUrl = sortedImages[0]?.url ?? "/assets/images/placeholder.png";

  const activeVariants = (row.product_variants ?? []).filter((v: any) => v.is_active);
  const cheapestVariant = [...activeVariants].sort((a, b) => a.price - b.price)[0];

  const price = cheapestVariant ? formatPrice(cheapestVariant.price) : "";
  const mrp =
    cheapestVariant?.compare_at_price != null
      ? formatPrice(cheapestVariant.compare_at_price)
      : undefined;

  const approvedReviews = (row.reviews ?? []).filter((r: any) => r.is_approved !== false);
  const reviewCount = approvedReviews.length;
  const rating =
    reviewCount > 0
      ? approvedReviews.reduce((sum: number, r: any) => sum + (r.review_content?.rating || 0), 0) /
        reviewCount
      : 0;

  const mappedVariants = activeVariants.map((v: any) => {
    const parts = [v.option1_value, v.option2_value, v.option3_value].filter(
      (val): val is string => Boolean(val && val !== "Default")
    );
    const label = parts.length > 0 ? parts.join(", ") : "One size";

    return {
      id: v.id,
      sku: v.sku,
      label,
      option1Value: v.option1_value,
      option2Value: v.option2_value || null,
      option3Value: v.option3_value || null,
      price: v.price,
      compareAtPrice: v.compare_at_price,
      isActive: v.is_active,
    };
  });

  return {
    id: row.id,
    slug: row.slug || row.id,
    name: row.title,
    price,
    mrp,
    rating,
    reviewCount,
    imageUrl,
    certified: row.is_energized,
    category: row.slug,
    tags: row.tags ?? [],
    variants: mappedVariants,
  };
}
