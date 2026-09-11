import Image from "next/image";
import WishlistToggleButton from "./WishlistToggleButton";
import { BaseProductComponentProps } from "@/types/product.types";

export default function ProductImage({ product, variant }: BaseProductComponentProps) {
  const isWishlistVariant = variant === "wishlist";

  // Primary badge tag (e.g. "BESTSELLER", "NEW", "TRENDING")
  const rawTag = product.tags && product.tags.length > 0 ? product.tags[0] : null;
  const primaryTag = rawTag ? (rawTag.replace(/\s+/g, "").toUpperCase() === "BESTSELLER" ? "BESTSELLER" : rawTag) : null;

  return (
    <div 
      className="relative aspect-square w-full overflow-hidden bg-[#f5f2ed] rounded-[12px] isolate transform-gpu"
      style={{ borderRadius: "12px", overflow: "hidden", WebkitMaskImage: "-webkit-radial-gradient(white, black)" }}
    >
      <Image
        src={product.imageUrl}
        alt={product.name}
        fill
        className="object-cover rounded-[12px] transition-transform duration-300 group-hover:scale-105"
        style={{ borderRadius: "12px" }}
        sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
        quality={85}
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
