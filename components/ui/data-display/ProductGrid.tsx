import ProductCard from "@/components/product/ProductCard";
import { ProductCardProduct } from "@/types/product.types";
import type { Product } from "@/types/shared.types";

interface ProductGridProps {
  products: Product[];
  className?: string;
  emptyMessage?: string;
  emptyClassName?: string;
}

/**
 * Reusable responsive product grid.
 * Used on the home page (FeaturedProducts) and every /collection/[slug] page.
 */
export default function ProductGrid({
  products,
  className = "",
  emptyMessage = "No products found in this category yet.",
  emptyClassName = "py-12 text-center text-sm text-text-muted",
}: ProductGridProps) {
  if (products.length === 0) {
    return (
      <p className={emptyClassName}>
        {emptyMessage}
      </p>
    );
  }

  return (
    <div
      className={`grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 md:gap-5 lg:grid-cols-4 lg:gap-6 ${className}`}
    >
      {products.map((product, index) => {
        const cardProduct: ProductCardProduct = {
          id: product.id,
          href: `/product/${product.slug || product.id}`,
          name: product.name,
          imageUrl: product.imageUrl,
          currentPrice: product.price,
          originalPrice: product.mrp,
          category: product.category,
          isCertified: product.certified,
          tags: product.tags,
          rating: product.rating,
          reviewCount: product.reviewCount,
          defaultVariantId: (product as any).defaultVariantId,
          defaultVariantSku: (product as any).defaultVariantSku,
          defaultVariantLabel: (product as any).defaultVariantLabel,
          options: (product as any).options,
          variants: (product as any).variants,
        };

        return <ProductCard key={product.id} product={cardProduct} variant="shopping" priority={index < 4} />;
      })}
    </div>
  );
}
