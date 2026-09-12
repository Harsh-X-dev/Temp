"use client";

import FilterBar from "@/components/home/FilterBar";
import ProductGrid from "@/components/ui/data-display/ProductGrid";
import type { CategoryConfig, Product } from "@/types/shared.types";
import type { FilterMetadata } from "@/services/product.service";

interface CollectionClientProps {
  heading: string;
  slug: string;
  sort?: string;
  categories: CategoryConfig[];
  filterMetadata?: FilterMetadata;
  products: Product[];
}

export default function CollectionClient({
  heading,
  slug,
  sort,
  categories,
  filterMetadata,
  products,
}: CollectionClientProps) {
  return (
    <div className="w-full">
      {/* Page heading */}
      <h1 className="mb-4 text-lg leading-6 font-bold text-text-primary md:mb-5 md:text-xl md:leading-7 lg:mb-6 lg:text-2xl lg:leading-8">
        {heading}
      </h1>

      {/* Filter / sort bar */}
      <div className="mb-5 md:mb-6">
        <FilterBar
          productCount={products.length}
          categories={categories}
          currentSlug={slug}
          currentSort={sort}
          filterMetadata={filterMetadata}
        />
      </div>

      {/* Product grid */}
      <ProductGrid products={products} />
    </div>
  );
}
