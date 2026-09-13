"use client";

import { useState } from "react";
import Image from "next/image";
import WishlistToggleButton from "./WishlistToggleButton";
import { BaseProductComponentProps } from "@/types/product.types";

// Module-level cache for images loaded during this browser session
const loadedProductImageUrls = new Set<string>();

export interface ProductImageProps extends BaseProductComponentProps {
  priority?: boolean;
}

export default function ProductImage({ product, variant, priority = false }: ProductImageProps) {
  const [imageLoaded, setImageLoaded] = useState(() => {
    return !product.imageUrl || loadedProductImageUrls.has(product.imageUrl);
  });
  const isWishlistVariant = variant === "wishlist";

  // Primary badge tag (e.g. "BESTSELLER", "NEW", "TRENDING")
  const rawTag = product.tags && product.tags.length > 0 ? product.tags[0] : null;
  const primaryTag = rawTag ? (rawTag.replace(/\s+/g, "").toUpperCase() === "BESTSELLER" ? "BESTSELLER" : rawTag) : null;

  return (
    <div 
      className="relative aspect-square w-full overflow-hidden bg-[#f5f2ed] rounded-[12px] isolate transform-gpu"
      style={{ borderRadius: "12px", overflow: "hidden", WebkitMaskImage: "-webkit-radial-gradient(white, black)" }}
    >
      {!imageLoaded && product.imageUrl && (
        <div className="absolute inset-0 size-full animate-shimmer rounded-[12px] z-0" />
      )}
      <Image
        src={product.imageUrl}
        alt={product.name}
        fill
        priority={priority}
        className={`object-cover rounded-[12px] transition-all duration-300 group-hover:scale-105 ${
          imageLoaded ? "opacity-100" : "opacity-0"
        }`}
        style={{ borderRadius: "12px" }}
        sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
        quality={85}
        onLoad={() => {
          if (product.imageUrl) loadedProductImageUrls.add(product.imageUrl);
          setImageLoaded(true);
        }}
      />

      {/* Unified Badge Style Matching Figma node 1201:9476 */}
      {primaryTag && variant === "shopping" && (
        <div className="absolute left-[10px] top-[10px] z-10 pointer-events-none">
          <span className="inline-flex items-center rounded-[12px] bg-[#ff5400] px-2 py-0.5 text-[11px] font-bold uppercase tracking-wider text-white shadow-xs">
            {primaryTag}
          </span>
        </div>
      )}

      {/* Stock badge overlay if out of stock */}
      {product.inStock === false && (
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-black/40 backdrop-blur-[2px]">
          <span className="rounded-md bg-white px-3 py-1 text-xs font-bold uppercase tracking-wider text-text-primary">
            Out of Stock
          </span>
        </div>
      )}

      <WishlistToggleButton
        productId={product.id}
        productName={product.name}
        isWishlistVariant={isWishlistVariant}
      />
    </div>
  );
}
