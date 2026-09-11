import { createSupabaseBrowserClient } from '@/services/supabase/client';
import { config } from '@/lib/constants/config';
import type { Product } from '@/types/shared.types';

// Use same row shape and mapper as server product service for consistency
interface ProductImageRow {
  url: string;
  position: number;
}

interface ProductVariantRow {
  price: number;
  compare_at_price: number | null;
  is_active: boolean;
}

interface ProductRow {
  id: string;
  title: string;
  slug: string;
  is_energized: boolean;
  tags?: string[] | null;
  short_description?: string | null;
  product_images: ProductImageRow[];
  product_variants: ProductVariantRow[];
  reviews?: { is_approved?: boolean; review_content?: { rating: number } }[];
}

const PRODUCT_SELECT = `
  id,
  title,
  slug,
  is_energized,
  tags,
  short_description,
  product_images ( url, position ),
  product_variants ( price, compare_at_price, is_active ),
  reviews ( is_approved, review_content )
`.trim();

function formatPrice(price: number): string {
  return `₹${price.toLocaleString('en-IN')}`;
}

function mapRowToProduct(row: ProductRow): Product {
  const sortedImages = [...(row.product_images ?? [])].sort((a, b) => a.position - b.position);
  const imageUrl = sortedImages[0]?.url ?? '';

  const activeVariants = (row.product_variants ?? []).filter((v) => v.is_active);
  const cheapestVariant = activeVariants.sort((a, b) => a.price - b.price)[0];

  const price = cheapestVariant ? formatPrice(cheapestVariant.price) : '';
  const mrp = cheapestVariant?.compare_at_price != null ? formatPrice(cheapestVariant.compare_at_price) : undefined;

  const approvedReviews = (row.reviews ?? []).filter((r) => r.is_approved !== false);
  const reviewCount = approvedReviews.length;
  const rating = reviewCount > 0
    ? approvedReviews.reduce((sum, r) => sum + (r.review_content?.rating || 0), 0) / reviewCount
    : 0;

  return {
    id: row.id,
    name: row.title,
    price,
    mrp,
    imageUrl,
    certified: row.is_energized,
    category: row.slug,
    slug: row.slug,
    tags: row.tags ?? [],
    rating,
    reviewCount,
  };
}

/**
 * Logs a product card click or view to the engagement backend engine.
 * Uses `keepalive: true` to guarantee delivery during page navigation.
 */
export function logProductEngagementClick(productId: string, productTitle: string): void {
  if (!productId || !productTitle) return;
  try {
    fetch(`${config.apiBaseUrl}/count/click`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        product_id: productId,
        product_title: productTitle,
      }),
      keepalive: true,
    }).catch(() => {
      // Non-blocking fire-and-forget
    });
  } catch {
    // Ignore error
  }
}

export async function fetchLiveSuggestions(query: string): Promise<Product[]> {
  if (!query || query.trim() === '') return [];
  const supabase = createSupabaseBrowserClient();
  const { data, error } = await supabase
    .from('products')
    .select(PRODUCT_SELECT)
    .eq('status', 'active')
    .ilike('title', `%${query.trim()}%`)
    .limit(5)
    .returns<ProductRow[]>();

  if (error) {
    console.error('[SearchClientService] Failed to fetch live suggestions:', error.message);
    return [];
  }
  return (data ?? []).map(mapRowToProduct);
}

export async function fetchSearchResults(query: string, sortBy: string = 'relevance'): Promise<Product[]> {
  const trimmed = query.trim();
  if (!trimmed) return [];
  const supabase = createSupabaseBrowserClient();
  
  // 1. Primary multi-field search (title, slug, short_description)
  const { data, error } = await supabase
    .from('products')
    .select(PRODUCT_SELECT)
    .eq('status', 'active')
    .or(`title.ilike.%${trimmed}%,slug.ilike.%${trimmed}%,short_description.ilike.%${trimmed}%`)
    .limit(40)
    .returns<ProductRow[]>();

  if (error) {
    console.error('[SearchClientService] Failed to fetch search results:', error.message);
    return [];
  }
  
  let products = (data ?? []).map(mapRowToProduct);

  // 2. Tokenized fallback if exact phrase yielded 0 results and multiple words exist
  if (products.length === 0 && trimmed.includes(' ')) {
    const words = trimmed.split(/\s+/).filter((w) => w.length > 2);
    if (words.length > 0) {
      const orFilter = words.map((w) => `title.ilike.%${w}%,slug.ilike.%${w}%`).join(',');
      const { data: fallbackData } = await supabase
        .from('products')
        .select(PRODUCT_SELECT)
        .eq('status', 'active')
        .or(orFilter)
        .limit(40)
        .returns<ProductRow[]>();

      if (fallbackData && fallbackData.length > 0) {
        products = fallbackData.map(mapRowToProduct);
      }
    }
  }
  
  if (sortBy === 'price_asc') {
    products.sort((a, b) => {
      const pA = parseInt(a.price.replace(/[^\d]/g, ''), 10) || 0;
      const pB = parseInt(b.price.replace(/[^\d]/g, ''), 10) || 0;
      return pA - pB;
    });
  } else if (sortBy === 'price_desc') {
    products.sort((a, b) => {
      const pA = parseInt(a.price.replace(/[^\d]/g, ''), 10) || 0;
      const pB = parseInt(b.price.replace(/[^\d]/g, ''), 10) || 0;
      return pB - pA;
    });
  } else if (sortBy === 'rating_desc' || sortBy === 'rating') {
    products.sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0));
  }

  return products;
}

/**
 * Fetches top trending searches directly from the Product Engagement API.
 * Follows the spec defined in ENGAGEMENT_API_GUIDE.md.
 */
export async function fetchTrendingSearches(): Promise<string[]> {
  try {
    const res = await fetch(`${config.apiBaseUrl}/count/trending?limit=8`, {
      method: 'GET',
      headers: { Accept: 'application/json' },
    });

    if (res.ok) {
      const json = await res.json();
      if (json.success && Array.isArray(json.data) && json.data.length > 0) {
        const titles: string[] = json.data
          .map((item: { product_title?: string; productTitle?: string }) => item.product_title || item.productTitle)
          .filter((t: unknown): t is string => Boolean(t && typeof t === 'string' && t.trim().length > 0));

        const uniqueTitles = Array.from(new Set(titles));
        if (uniqueTitles.length >= 4) {
          return uniqueTitles.slice(0, 8);
        }

        const curated = [
          'Rudraksha Bracelet',
          'Yellow Sapphire',
          'Emerald Pendant',
          'Pyrite Bracelet',
          'Ganesha Pendant',
          '7 Mukhi Rudraksha',
        ];
        return Array.from(new Set([...uniqueTitles, ...curated])).slice(0, 8);
      }
    }
  } catch (err) {
    console.warn('[SearchClientService] Failed to fetch live trending searches, using fallback:', err);
  }

  return [
    'Rudraksha Bracelet',
    'Yellow Sapphire',
    'Emerald Pendant',
    'Pyrite Bracelet',
    'Ganesha Pendant',
    '7 Mukhi Rudraksha',
  ];
}

