import { notFound } from "next/navigation";
import type { Metadata } from "next";
import {
  getActiveCollections,
  getCollectionBySlug,
} from "@/services/collection.service";
import { getProductsByCollectionSlug, getFilterMetadata } from "@/services/product.service";
import FilterBar from "@/components/home/FilterBar";
import ProductGrid from "@/components/ui/data-display/ProductGrid";
import { matchesTypeFilter, matchesMukhiFilter, matchesOriginFilter } from "@/lib/productFilters";

export const revalidate = 60;
export const dynamicParams = true;

// ---------------------------------------------------------------------------
// Static pre-rendering — build pages for all active collection slugs
// ---------------------------------------------------------------------------
export async function generateStaticParams() {
  try {
    const collections = await getActiveCollections();
    const slugs = collections.map((cat) => ({ slug: cat.id }));
    if (!slugs.some((s) => s.slug === "all")) {
      slugs.unshift({ slug: "all" });
    }
    return slugs;
  } catch {
    // If the DB is unreachable at build time, fall back to on-demand rendering
    return [{ slug: "all" }];
  }
}

// ---------------------------------------------------------------------------
// Per-page metadata
// ---------------------------------------------------------------------------
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const cat = await getCollectionBySlug(slug);

  if (!cat) {
    return { title: "Category not found - GemoStone" };
  }

  const title =
    cat.id === "all"
      ? "All Products - GemoStone"
      : `${cat.label} - GemoStone`;

  const description =
    cat.id === "all"
      ? "Browse our full collection of certified Rudraksha, gemstones, and spiritual jewellery."
      : `Shop certified ${cat.label} - authentic, blessed, and delivered with care.`;

  return { title, description };
}

import CollectionClient from "./CollectionClient";

// ---------------------------------------------------------------------------
// Page component
// ---------------------------------------------------------------------------
export default async function CollectionPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams?: Promise<{
    sort?: string;
    minPrice?: string;
    maxPrice?: string;
    types?: string;
    mukhi?: string;
    origin?: string;
    rating?: string;
    inStock?: string;
  }>;
}) {
  const { slug } = await params;
  const sp = (await searchParams) ?? {};
  const { sort, minPrice, maxPrice, types, mukhi, origin, rating, inStock } = sp;

  // Fetch active categories and filter metadata concurrently
  const [category, categories, filterMetadata, initialProducts] = await Promise.all([
    getCollectionBySlug(slug),
    getActiveCollections(),
    getFilterMetadata(slug),
    getProductsByCollectionSlug(slug, sort),
  ]);

  if (!category) notFound();

  let products = initialProducts;

  // Apply filters
  if (minPrice) {
    const minVal = parseInt(minPrice, 10);
    if (!isNaN(minVal)) {
      products = products.filter((p) => {
        const numPrice = parseInt(p.price.replace(/[^\d]/g, ""), 10) || 0;
        return numPrice >= minVal;
      });
    }
  }

  if (maxPrice) {
    const maxVal = parseInt(maxPrice, 10);
    if (!isNaN(maxVal)) {
      products = products.filter((p) => {
        const numPrice = parseInt(p.price.replace(/[^\d]/g, ""), 10) || 0;
        return numPrice <= maxVal;
      });
    }
  }

  if (types) {
    const typeList = types.split(",").map((t) => t.trim()).filter(Boolean);
    products = products.filter((p) => matchesTypeFilter(typeList, p));
  }

  if (mukhi) {
    const mukhiList = mukhi.split(",").map((m) => m.trim()).filter(Boolean);
    products = products.filter((p) => matchesMukhiFilter(mukhiList, p));
  }

  if (origin) {
    const originList = origin.split(",").map((o) => o.trim()).filter(Boolean);
    products = products.filter((p) => matchesOriginFilter(originList, p));
  }

  if (rating) {
    const ratingVal = parseFloat(rating);
    if (!isNaN(ratingVal)) {
      products = products.filter((p) => (p.rating || 0) >= ratingVal);
    }
  }

  if (inStock === "true") {
    products = products.filter((p) => p.variants && p.variants.some((v) => v.isActive));
  }

  const heading = category.id === "all" ? "All Products" : category.label;

  return (
    <CollectionClient
      heading={heading}
      slug={slug}
      sort={sort}
      categories={categories}
      filterMetadata={filterMetadata}
      products={products}
    />
  );
}
