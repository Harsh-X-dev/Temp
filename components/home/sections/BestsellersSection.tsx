import { getFeaturedProducts } from "@/services/product.service";
import BestsellerCard from "@/components/home/BestsellerCard";
import ClientLink from "@/components/ui/navigation/ClientLink";

export default async function BestsellersSection() {
  const products = await getFeaturedProducts();

  if (!products || products.length === 0) return null;

  return (
    <section aria-labelledby="bestsellers-heading" className="w-full">
      {/* Section Header */}
      <div className="flex items-center justify-between pb-4 pt-2 px-4 md:px-6 lg:px-8">
        <h2 id="bestsellers-heading" className="text-[20px] font-bold leading-[26px] text-text-primary">
          Bestsellers
        </h2>
        <ClientLink href="/collection/all" className="flex items-center gap-1 group">
          <span className="text-[13px] font-semibold text-primary-orange group-hover:underline">
            View all
          </span>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
            className="h-3.5 w-3.5 text-primary-orange"
            aria-hidden="true"
          >
            <path d="M9 18l6-6-6-6" />
          </svg>
        </ClientLink>
      </div>

      {/* Horizontal Scroll Area */}
      <div className="w-full">
        <div className="no-scrollbar flex items-start overflow-x-auto pb-8 snap-x snap-mandatory scroll-pl-4 md:scroll-pl-6 lg:scroll-pl-8">
          {/* Left Spacer */}
          <div className="shrink-0 w-4 md:w-6 lg:w-8" aria-hidden="true" />
          
          {products.map((product) => (
            <div 
              key={product.id} 
              className="snap-start shrink-0 pr-4"
            >
              <BestsellerCard product={product} />
            </div>
          ))}
          
          {/* Right Spacer (pr-4 on cards gives 16px, so we just add the difference for larger screens) */}
          <div className="shrink-0 w-0 md:w-2 lg:w-4" aria-hidden="true" />
        </div>
      </div>
    </section>
  );
}
