'use client';

import { useState, useCallback, useEffect } from 'react';
import Image from 'next/image';
import useEmblaCarousel from 'embla-carousel-react';
import { ProductImage } from '@/types/product.types';
import WishlistToggleButton from '@/components/product/WishlistToggleButton';

interface ProductGalleryProps {
  images: ProductImage[];
  productId: string;
  productName: string;
}

export default function ProductGallery({ images, productId, productName }: ProductGalleryProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: false });

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setActiveIndex(emblaApi.selectedScrollSnap());
  }, [emblaApi, setActiveIndex]);

  useEffect(() => {
    if (!emblaApi) return;
    emblaApi.on('select', onSelect);
    emblaApi.on('reInit', onSelect);
  }, [emblaApi, onSelect]);

  const scrollTo = useCallback((index: number) => {
    if (emblaApi) emblaApi.scrollTo(index);
  }, [emblaApi]);

  if (!images || images.length === 0) return null;

  return (
    <div className="flex flex-col md:flex-row-reverse gap-[12px] items-start w-full relative shrink-0">
      {/* Main Image (Carousel Wrapper) */}
      <div className="h-[392px] md:h-[600px] relative shrink-0 w-full md:flex-1">
        <WishlistToggleButton productId={productId} productName={productName} />
        
        {/* Embla Viewport */}
        <div className="h-full w-full rounded-[12px] overflow-hidden bg-surface-neutral" ref={emblaRef}>
          <div className="flex h-full touch-pan-y">
            {images.map((img, index) => (
              <div key={img.id} className="relative h-full flex-[0_0_100%] min-w-0">
                <Image
                  src={img.url}
                  alt={img.altText || `Product image ${index + 1}`}
                  fill
                  className="object-cover"
                  priority={index === 0}
                  sizes="(max-width: 768px) 100vw, 50vw"
                />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Thumbnails */}
      <div className="flex md:flex-col gap-[10px] items-start overflow-x-auto md:overflow-y-auto no-scrollbar w-full md:w-[100px] md:max-h-[600px] relative shrink-0">
        {images.map((img, index) => {
          const isActive = activeIndex === index;
          return (
            <button
              key={img.id}
              onClick={() => scrollTo(index)}
              className={`relative shrink-0 size-[84px] md:size-[100px] rounded-[10px] overflow-hidden bg-surface-neutral transition-all border-solid ${
                isActive ? 'border-[1.5px] border-primary-orange' : 'border border-border-strong'
              }`}
            >
              <Image
                src={img.url}
                alt={img.altText || `Thumbnail ${index + 1}`}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 84px, 100px"
              />
            </button>
          );
        })}
      </div>
    </div>
  );
}
