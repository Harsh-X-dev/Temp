/**
 * Product service — the only module that queries the `products` table.
 *
 * Maps DB rows (with embedded images and variants) to the `Product`
 * interface used throughout the UI layer.
 *
 * Architecture note: this module is server-only. Never import it from
 * a Client Component.
 */
import { cache } from "react";
import { unstable_cache } from "next/cache";
import { createSupabaseServerClient } from "@/services/supabase/server";
import { getCollectionIdBySlug } from "@/services/collection.service";
import type { Product } from "@/types/shared.types";


// ---------------------------------------------------------------------------
// DB row shapes — only the columns we SELECT
// ---------------------------------------------------------------------------

interface ProductImageRow {
  url: string;
  position: number;
}

interface ProductVariantRow {
  id: string;
  sku: string;
  option1_value: string | null;
  option2_value?: string | null;
  option3_value?: string | null;
  price: number;
  compare_at_price: number | null;
  is_active: boolean;
}

interface ProductRow {
  id: string;
  title: string;
  slug: string;
  is_energized: boolean;
  tags: string[] | null;
  options?: any[] | null;
  attributes?: Record<string, any> | null;
  product_images: ProductImageRow[];
  product_variants: ProductVariantRow[];
  reviews?: { is_approved?: boolean; review_content?: { rating: number } }[];
  product_collections?: { collections?: { id: string; title: string; slug: string } | null }[] | null;
}

// ---------------------------------------------------------------------------
// Shared select string
// ---------------------------------------------------------------------------

const PRODUCT_SELECT = `
  id,
  title,
  slug,
  is_energized,
  tags,
  options,
  attributes,
  product_images ( url, position ),
  product_variants ( id, sku, option1_value, option2_value, option3_value, price, compare_at_price, is_active ),
  reviews ( is_approved, review_content ),
  product_collections ( collections ( id, title, slug ) )
`.trim();

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Format a raw numeric price from the DB into an Indian-locale string.
 * e.g. 1499 → "₹1,499"
 */
function formatPrice(price: number): string {
  return `₹${price.toLocaleString("en-IN")}`;
}

/**
 * Map a raw product row (with embedded relations) to the `Product` UI type.
 *
 * Image:   first image sorted by position ascending.
 * Price:   cheapest active variant.
 * Certified: mapped from is_energized (products with lab certs are energized).
 */
function mapRowToProduct(row: ProductRow): Product {
  // Pick the image with the lowest position value
  const sortedImages = [...(row.product_images ?? [])].sort(
    (a, b) => a.position - b.position,
  );
  const imageUrl = sortedImages[0]?.url ?? "";

  // Pick the cheapest active variant for the displayed price (without mutating activeVariants array)
  const activeVariants = (row.product_variants ?? []).filter((v) => v.is_active);
  const cheapestVariant = [...activeVariants].sort((a, b) => a.price - b.price)[0];

  const price = cheapestVariant ? formatPrice(cheapestVariant.price) : "";
  const mrp =
    cheapestVariant?.compare_at_price != null
      ? formatPrice(cheapestVariant.compare_at_price)
      : undefined;

  const approvedReviews = (row.reviews ?? []).filter((r) => r.is_approved !== false);
  const reviewCount = approvedReviews.length;
  const rating = reviewCount > 0
    ? approvedReviews.reduce((sum, r) => sum + (r.review_content?.rating || 0), 0) / reviewCount
    : 0;

  const mappedVariants = activeVariants.map((v) => {
    const parts = [v.option1_value, v.option2_value, v.option3_value].filter(
      (val): val is string => Boolean(val && val !== 'Default')
    );
    const label = parts.length > 0 ? parts.join(', ') : 'One size';

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

  // Construct options directly from database row.options (or derive from variants)
  let options = row.options || [];
  if (!options || options.length === 0) {
    const o1Values = Array.from(new Set(mappedVariants.map(v => v.option1Value).filter((v): v is string => Boolean(v && v !== 'Default'))));
    const o2Values = Array.from(new Set(mappedVariants.map(v => v.option2Value).filter((v): v is string => Boolean(v && v !== 'Default'))));
    const o3Values = Array.from(new Set(mappedVariants.map(v => v.option3Value).filter((v): v is string => Boolean(v && v !== 'Default'))));

    options = [];
    if (o1Values.length > 0) options.push({ id: 'opt_1', name: 'Size', position: 1, values: o1Values });
    if (o2Values.length > 0) options.push({ id: 'opt_2', name: 'Quality', position: 2, values: o2Values });
    if (o3Values.length > 0) options.push({ id: 'opt_3', name: 'Material', position: 3, values: o3Values });
  } else {
    options = options
      .map((opt: any, index: number) => {
        const optionKey = `option${index + 1}Value` as keyof typeof mappedVariants[0];
        const uniqueVals = Array.from(
          new Set(
            mappedVariants
              .map((v) => v[optionKey])
              .filter((v): v is string => Boolean(v && v !== "Default"))
          )
        );
        return {
          id: opt.id || `opt_${index + 1}`,
          name: opt.name || `Option ${index + 1}`,
          position: opt.position || index + 1,
          values: opt.values && opt.values.length > 0 ? opt.values : uniqueVals,
        };
      })
      .filter((opt: any) => opt.values && opt.values.length > 0);
  }

  let defaultVariantLabel = "One size";
  if (cheapestVariant) {
    if (cheapestVariant.option1_value && cheapestVariant.option1_value !== 'Default') {
      defaultVariantLabel = cheapestVariant.option1_value;
    } else if (row.is_energized) {
      defaultVariantLabel = "Energized";
    }
  }

  const collections: string[] = (row.product_collections ?? [])
    .flatMap((pc: any) => [pc.collections?.title, pc.collections?.slug])
    .filter((val): val is string => Boolean(val));

  return {
    id: row.id,
    name: row.title,
    price,
    mrp,
    imageUrl,
    certified: row.is_energized,
    category: row.slug,
    slug: row.slug,
    tags: parseTags(row.tags),
    collections,
    rating,
    reviewCount,
    defaultVariantId: cheapestVariant?.id || "",
    defaultVariantSku: cheapestVariant?.sku || "",
    defaultVariantLabel,
    options,
    variants: mappedVariants,
    attributes: row.attributes || {},
  };
}

function parseTags(rawTags: any): string[] {
  if (!rawTags) return [];
  if (Array.isArray(rawTags)) {
    return rawTags.map((t) => String(t).trim()).filter(Boolean);
  }
  if (typeof rawTags === "string") {
    const cleaned = rawTags.replace(/^\{|\}$|^\[|\]$/g, "");
    return cleaned
      .split(",")
      .map((t) => t.trim().replace(/^["']|["']$/g, ""))
      .filter(Boolean);
  }
  return [];
}

/**
 * Enterprise Multi-Tier Ranking Engine (Amazon & Flipkart style):
 *  1. Tag priority: 'bestseller' (1) -> 'trending' (2) -> 'featured' (3) -> 'new' / 'recently added' (4) -> other tags (5) -> no tags (6)
 *  2. Review count descending (social proof from reviews table)
 *  3. Average rating score descending (customer satisfaction)
 *  4. Energized / Certified items first (spiritual authenticity)
 *  5. Deterministic fallback ID stability
 */
export function rankProductsDefault(products: Product[]): Product[] {
  return [...products].sort((a, b) => {
    // 1. Tag Tier Comparison
    const getTagTier = (tags?: string[] | null): number => {
      const parsed = parseTags(tags);
      if (parsed.length === 0) return 6;
      const normalized = parsed.map((t) =>
        t.toLowerCase().replace(/[\s_\-]/g, "")
      );
      if (normalized.some((t) => t.includes("bestseller") || t.includes("topseller"))) return 1;
      if (normalized.some((t) => t.includes("trending") || t.includes("popular") || t.includes("hot"))) return 2;
      if (normalized.some((t) => t.includes("featured") || t.includes("exclusive"))) return 3;
      if (normalized.some((t) => t.includes("new") || t.includes("recentlyadded") || t.includes("latest"))) return 4;
      return 5;
    };

    const tierA = getTagTier(a.tags);
    const tierB = getTagTier(b.tags);
    if (tierA !== tierB) return tierA - tierB;

    // 2. Review count (social proof)
    const revCountA = a.reviewCount ?? 0;
    const revCountB = b.reviewCount ?? 0;
    if (revCountA !== revCountB) return revCountB - revCountA;

    // 3. Average Rating
    const ratingA = a.rating ?? 0;
    const ratingB = b.rating ?? 0;
    if (ratingA !== ratingB) return ratingB - ratingA;

    // 4. Certified / Energized
    const certA = a.certified ? 1 : 0;
    const certB = b.certified ? 1 : 0;
    if (certA !== certB) return certB - certA;

    // 5. Fallback ID stability
    return a.id.localeCompare(b.id);
  });
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Fetch the top 8 products for the homepage Bestsellers section.
 *
 * First queries the database view `homepage_bestsellers_view` for optimal
 * mathematical ranking and category diversity. If unavailable, falls back
 * gracefully to in-memory `rankProductsDefault`.
 */
export const getFeaturedProducts = cache(async function getFeaturedProducts(): Promise<Product[]> {
  const supabase = createSupabaseServerClient();

  try {
    // 1. Try querying the database view for the top ranked product IDs
    const { data: viewData, error: viewError } = await supabase
      .from("homepage_bestsellers_view")
      .select("id")
      .limit(8);

    if (!viewError && viewData && viewData.length > 0) {
      const rankedIds = viewData.map((row: { id: string }) => row.id);

      // Fetch full product details (images, variants, reviews) for the ranked IDs
      const { data: productRows, error: productError } = await supabase
        .from("products")
        .select(PRODUCT_SELECT)
        .in("id", rankedIds)
        .returns<ProductRow[]>();

      if (!productError && productRows && productRows.length > 0) {
        const mappedMap = new Map<string, Product>();
        for (const row of productRows) {
          mappedMap.set(row.id, mapRowToProduct(row));
        }

        // Return strictly in the order computed by homepage_bestsellers_view
        const ordered = rankedIds
          .map((id) => mappedMap.get(id))
          .filter((p): p is Product => Boolean(p));

        if (ordered.length > 0) {
          return ordered;
        }
      }
    }
  } catch (err) {
    console.warn("[ProductService] homepage_bestsellers_view query failed, falling back:", err);
  }

  // 2. Fallback: Query active products directly and apply default ranking
  const { data, error } = await supabase
    .from("products")
    .select(PRODUCT_SELECT)
    .eq("status", "active")
    .limit(60)
    .returns<ProductRow[]>();

  if (error) {
    console.error("[ProductService] Failed to fetch fallback featured products:", error.message);
    return [];
  }

  const allMapped = rankProductsDefault((data ?? []).map(mapRowToProduct));
  return allMapped.slice(0, 8);
});

/**
 * Fetch all active product slugs for static route generation.
 * Used by the product detail route so known products render quickly.
 */
export const getAllProductSlugs = cache(async function getAllProductSlugs(): Promise<string[]> {
  const supabase = createSupabaseServerClient();

  const { data, error } = await supabase
    .from("products")
    .select("slug")
    .eq("status", "active")
    .returns<{ slug: string | null }[]>();

  if (error) {
    console.error("[ProductService] Failed to fetch product slugs:", error.message);
    return [];
  }

  return (data ?? [])
    .map((row) => row.slug)
    .filter((slug): slug is string => Boolean(slug));
});

const getCachedProductsByCollection = unstable_cache(
  async (slug: string): Promise<ProductRow[]> => {
    const supabase = createSupabaseServerClient();

    if (slug === "all") {
      const { data, error } = await supabase
        .from("products")
        .select(PRODUCT_SELECT)
        .eq("status", "active")
        .limit(60)
        .returns<ProductRow[]>();

      if (error || !data) {
        if (error) console.error("[ProductService] Failed to fetch all products:", error.message);
        return [];
      }
      return data;
    }

    // Resolve the collection's internal UUID from the URL slug
    const collectionId = await getCollectionIdBySlug(slug);
    if (!collectionId) {
      return [];
    }

    // Fetch product IDs that belong to this collection
    const { data: junctionRows, error: junctionError } = await supabase
      .from("product_collections")
      .select("product_id")
      .eq("collection_id", collectionId);

    if (junctionError || !junctionRows || junctionRows.length === 0) {
      return [];
    }

    const productIds = junctionRows.map((r) => r.product_id as string);

    // Fetch the matching products with their images and variants
    const { data, error } = await supabase
      .from("products")
      .select(PRODUCT_SELECT)
      .eq("status", "active")
      .in("id", productIds)
      .limit(60)
      .returns<ProductRow[]>();

    if (error || !data) {
      if (error) console.error("[ProductService] Failed to fetch products by collection:", error.message);
      return [];
    }

    return data;
  },
  ["products-by-collection-slug"],
  { revalidate: 60, tags: ["products"] }
);

/**
 * Fetch active products, optionally filtered to a specific collection slug.
 *
 * - slug = "all"    → returns all active products (up to 40)
 * - slug = anything → resolves the collection UUID, then returns only products
 *                     belonging to that collection via the product_collections
 *                     junction table.
 *
 * Returns [] on error or when the collection is not found.
 */
export const getProductsByCollectionSlug = cache(async function getProductsByCollectionSlug(
  slug: string,
  sort?: string,
): Promise<Product[]> {
  const rows = await getCachedProductsByCollection(slug);
  let products = rows.map(mapRowToProduct);


  // Handle URL sort parameters
  if (sort === "price_asc") {
    return [...products].sort((a, b) => {
      const pA = parseInt(a.price.replace(/[^\d]/g, ""), 10) || 0;
      const pB = parseInt(b.price.replace(/[^\d]/g, ""), 10) || 0;
      return pA - pB;
    });
  }

  if (sort === "price_desc") {
    return [...products].sort((a, b) => {
      const pA = parseInt(a.price.replace(/[^\d]/g, ""), 10) || 0;
      const pB = parseInt(b.price.replace(/[^\d]/g, ""), 10) || 0;
      return pB - pA;
    });
  }

  if (sort === "rating_desc" || sort === "rating") {
    return [...products].sort((a, b) => {
      const rA = a.rating ?? 0;
      const rB = b.rating ?? 0;
      if (rA !== rB) return rB - rA;
      return (b.reviewCount ?? 0) - (a.reviewCount ?? 0);
    });
  }

  if (sort === "newest") {
    return [...products];
  }

  // Default: Amazon & Flipkart Multi-Tier Bestseller / Relevance Ranking
  return rankProductsDefault(products);
});

/**
 * Fetch products matching a list of product IDs.
 * Used by wishlist and cart features to resolve stored IDs into product objects.
 */
export const getProductsByIds = cache(async function getProductsByIds(ids: string[]): Promise<Product[]> {
  if (!ids || ids.length === 0) return [];

  const supabase = createSupabaseServerClient();

  const { data, error } = await supabase
    .from("products")
    .select(PRODUCT_SELECT)
    .in("id", ids)
    .returns<ProductRow[]>();

  if (error) {
    console.error("[ProductService] Failed to fetch products by IDs:", error.message);
    return [];
  }

  return rankProductsDefault((data ?? []).map(mapRowToProduct));
});

/**
 * Fetch products matching a search query.
 * Searches the 'title' column for matches (case-insensitive).
 */
export const searchProducts = cache(async function searchProducts(query: string): Promise<Product[]> {
  if (!query || query.trim() === "") return [];

  const supabase = createSupabaseServerClient();

  const { data, error } = await supabase
    .from("products")
    .select(PRODUCT_SELECT)
    .eq("status", "active")
    .ilike("title", `%${query}%`)
    .limit(40)
    .returns<ProductRow[]>();

  if (error) {
    console.error("[ProductService] Failed to search products:", error.message);
    return [];
  }

  return rankProductsDefault((data ?? []).map(mapRowToProduct));
});

/** Backward compatibility alias */
export const sortTaggedFirst = rankProductsDefault;

export interface FilterMetadata {
  gemstoneTypes: string[];
  mukhiTypes: string[];
  origins: string[];
  minPrice: number;
  maxPrice: number;
}

const getCachedFilterMetadata = unstable_cache(
  async (collectionSlug?: string): Promise<FilterMetadata> => {
    const supabase = createSupabaseServerClient();

    let productQuery = supabase
      .from("products")
      .select("title, slug, tags, options, attributes, product_variants(option1_value, option2_value, option3_value, price, is_active)")
      .eq("status", "active");

    // If scoped to a specific collection, filter to products in that collection
    if (collectionSlug && collectionSlug !== "all") {
      const collectionId = await getCollectionIdBySlug(collectionSlug);
      if (collectionId) {
        const { data: junctionRows } = await supabase
          .from("product_collections")
          .select("product_id")
          .eq("collection_id", collectionId);

        const productIds = (junctionRows || []).map((r) => r.product_id as string);
        if (productIds.length > 0) {
          productQuery = productQuery.in("id", productIds);
        } else {
          return {
            gemstoneTypes: [],
            mukhiTypes: [],
            origins: [],
            minPrice: 0,
            maxPrice: 0,
          };
        }
      }
    }

    const [{ data: products }, { data: collections }] = await Promise.all([
      productQuery,
      supabase
        .from("collections")
        .select("title, slug")
        .eq("is_active", true)
        .order("sort_order", { ascending: true }),
    ]);

    const gemstoneTypesSet = new Set<string>();
    const mukhiTypesSet = new Set<string>();
    const originsSet = new Set<string>();
    let minPrice = Infinity;
    let maxPrice = 0;

    // Add categories from collections table (excluding 'all' and gift hampers)
    (collections || []).forEach((c) => {
      if (c.title && c.slug !== "all" && c.slug !== "gift-hampers") {
        gemstoneTypesSet.add(c.title);
      }
    });

    const knownOrigins = ["Nepal", "Indonesia", "India", "Burma", "Ceylon", "Sri Lanka", "Brazil", "Russia", "Peru", "Zambia", "Colombia"];
    const knownGemstones = [
      "Emerald (Panna)",
      "Yellow Sapphire (Pukhraj)",
      "Blue Sapphire (Neelam)",
      "Ruby (Manik)",
      "Red Coral (Moonga)",
      "Pyrite",
      "Sphatik (Crystal)",
      "Red Jasper",
      "Amethyst",
      "Tiger Eye",
      "Cat's Eye (Lehsuniya)",
      "Hessonite (Gomed)",
      "Pearl (Moti)",
    ];

    (products || []).forEach((p: any) => {
      // 1. First priority: Check structured JSONB `attributes`
      const attr = p.attributes;
      if (attr && typeof attr === "object") {
        if (attr.gemstone) gemstoneTypesSet.add(attr.gemstone);
        if (attr.mukhi) mukhiTypesSet.add(attr.mukhi);
        if (attr.origin) originsSet.add(attr.origin);
      }

      // 2. Scan tags
      (p.tags || []).forEach((t: string) => {
        const tagUpper = t.toUpperCase();
        if (tagUpper.includes("MUKHI")) {
          const num = tagUpper.match(/\d+/);
          if (num) mukhiTypesSet.add(`${num[0]} Mukhi`);
        }
        knownOrigins.forEach((orig) => {
          if (tagUpper.includes(orig.toUpperCase())) {
            originsSet.add(orig);
          }
        });
      });

      // 3. Scan product title
      const title = p.title || "";
      const mukhiMatch = title.match(/(\d+)\s*Mukhi/i);
      if (mukhiMatch) {
        mukhiTypesSet.add(`${mukhiMatch[1]} Mukhi`);
      }

      knownOrigins.forEach((orig) => {
        if (title.toLowerCase().includes(orig.toLowerCase())) {
          originsSet.add(orig);
        }
      });

      knownGemstones.forEach((gem) => {
        const coreName = gem.split(" ")[0].toLowerCase();
        if (title.toLowerCase().includes(coreName)) {
          gemstoneTypesSet.add(gem);
        }
      });

      // 4. Scan variants for prices & options
      (p.product_variants || []).forEach((v: any) => {
        if (v.is_active) {
          if (typeof v.price === "number") {
            if (v.price < minPrice) minPrice = v.price;
            if (v.price > maxPrice) maxPrice = v.price;
          }

          [v.option1_value, v.option2_value, v.option3_value].forEach((val) => {
            if (val && typeof val === "string") {
              const mMatch = val.match(/(\d+)\s*Mukhi/i);
              if (mMatch) mukhiTypesSet.add(`${mMatch[1]} Mukhi`);

              knownOrigins.forEach((orig) => {
                if (val.toLowerCase().includes(orig.toLowerCase())) {
                  originsSet.add(orig);
                }
              });
            }
          });
        }
      });
    });

    const sortedMukhi = Array.from(mukhiTypesSet).sort((a, b) => {
      const numA = parseInt(a, 10) || 0;
      const numB = parseInt(b, 10) || 0;
      return numA - numB;
    });

    return {
      gemstoneTypes: Array.from(gemstoneTypesSet),
      mukhiTypes: sortedMukhi,
      origins: Array.from(originsSet),
      minPrice: minPrice === Infinity ? 0 : Math.floor(minPrice / 100) * 100,
      maxPrice: maxPrice === 0 ? 5000 : Math.ceil(maxPrice / 100) * 100,
    };
  },
  ["filter-metadata-cache"],
  { revalidate: 60, tags: ["products", "collections"] }
);

/**
 * Fetch dynamic filter metadata (available gemstone types,
 * mukhi types, origins, and min/max prices) directly from active database rows.
 * If collectionSlug is specified (and !== "all"), only products in that collection
 * via product_collections are analyzed.
 */
export const getFilterMetadata = cache(async function getFilterMetadata(collectionSlug?: string): Promise<FilterMetadata> {
  return getCachedFilterMetadata(collectionSlug);
});



