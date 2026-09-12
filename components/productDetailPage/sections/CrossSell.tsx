import ClientLink from '@/components/ui/navigation/ClientLink';
import Image from 'next/image';
import { Product } from '@/types/product.types';

interface CrossSellProps {
  products: Partial<Product>[];
}

export default function CrossSell({ products }: CrossSellProps) {
  if (!products || products.length === 0) return null;

  return (
    <section
      aria-labelledby="cross-sell-heading"
      className="w-full bg-[#fbf8f4] pt-2.5 pb-2"
    >
      {/* Section Header - matches whole page grid (px-4 md:px-8) */}
      <div className="mb-3 px-4 md:px-8">
        <h2
          id="cross-sell-heading"
          className="text-[18px] font-bold text-[#1C1917] leading-[24px]"
        >
          You may also like
        </h2>
      </div>

      {/* Horizontal Scroll Area matching page padding (16px mobile / 32px desktop) */}
      <div className="w-full">
        <div className="no-scrollbar flex items-start overflow-x-auto pb-1 snap-x snap-mandatory scroll-pl-4 md:scroll-pl-8">
          {/* Left Spacer - exactly matches 16px on mobile / 32px on desktop */}
          <div className="shrink-0 w-4 md:w-8" aria-hidden="true" />

          {products.map((product) => {
            const defaultVariant = product.variants?.[0];
            const price = defaultVariant?.price || 0;
            const originalPrice = defaultVariant?.compareAtPrice;
            const imageUrl = product.images?.[0]?.url || '/placeholder.png';

            return (
              <div key={product.id} className="snap-start shrink-0 pr-3">
                <ClientLink
                  href={`/product/${product.slug}`}
                  prefetch={true}
                  className="flex flex-col gap-1.5 w-[160px] group cursor-pointer"
                >
                  {/* 160x160 Product Image with Neutral Surface */}
                  <div className="relative w-[160px] h-[160px] rounded-[12px] bg-[#f5f1ea] overflow-hidden">
                    <Image
                      src={imageUrl}
                      alt={product.title || 'Product'}
                      fill
                      sizes="160px"
                      className="object-cover group-hover:scale-105 transition-transform duration-300 rounded-[12px]"
                    />
                  </div>

                  {/* Product Title */}
                  <p className="text-[12px] font-normal leading-[16px] text-[#211e1a] line-clamp-2 h-[32px]">
                    {product.title}
                  </p>


                  {/* Price (Orange #ff5400) & Strikethrough Original Price */}
                  <div className="flex items-baseline gap-1.5 whitespace-nowrap">
                    <span className="text-[12px] font-semibold text-[#ff5400]">
                      ₹{price.toLocaleString('en-IN')}
                    </span>
                    {originalPrice && originalPrice > price && (
                      <span className="text-[11px] font-normal line-through text-[#a89a85]">
                        ₹{originalPrice.toLocaleString('en-IN')}
                      </span>
                    )}
                  </div>
                </ClientLink>
              </div>

            );
          })}

          {/* Right Spacer - completes 16px (12px pr-3 + 4px w-1) on mobile / 32px (12px pr-3 + 20px w-5) on desktop */}
          <div className="shrink-0 w-1 md:w-5" aria-hidden="true" />
        </div>
      </div>
    </section>
  );
}



