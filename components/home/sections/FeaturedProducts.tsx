/**
 * FeaturedProducts — Server Component.
 *
 * Fetches the first 8 active products from Supabase and renders them
 * in a ProductGrid. No client-side data fetching.
 */
import { getFeaturedProducts } from "@/services/product.service";
import ProductGrid from "@/components/ui/data-display/ProductGrid";
import SectionHeading from "@/components/ui/layout/SectionHeading";

export default async function FeaturedProducts() {
  const products = await getFeaturedProducts();

  return (
    <section aria-labelledby="featured-products-heading">
      <SectionHeading
        id="featured-products-heading"
        title="Featured products"
        actionLabel="View all"
        className="mb-[18px] md:mb-6 lg:mb-8"
      />

      <ProductGrid products={products} />
    </section>
  );
}
