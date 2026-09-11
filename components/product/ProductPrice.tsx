import { BaseProductComponentProps } from "@/types/product.types";

export default function ProductPrice({ product }: BaseProductComponentProps) {
  const parsePrice = (price?: string | number | null): number => {
    if (!price) return 0;
    if (typeof price === "number") return price;
    return parseFloat(String(price).replace(/[^\d.-]/g, '')) || 0;
  };

  const currentNum = parsePrice(product.currentPrice);
  const originalNum = product.originalPrice ? parsePrice(product.originalPrice) : null;

  const formattedPrice = typeof product.currentPrice === "number" 
    ? `₹${product.currentPrice.toLocaleString("en-IN")}`
    : product.currentPrice;

  const formattedOriginal = typeof product.originalPrice === "number"
    ? `₹${product.originalPrice.toLocaleString("en-IN")}`
    : product.originalPrice || null;

  const hasDiscount = originalNum && originalNum > currentNum;

  return (
    <div className="flex items-baseline gap-1.5 mt-0.5 whitespace-nowrap">
      <span className="text-[14px] leading-[20px] font-bold text-[#211e1a]">
        {formattedPrice}
      </span>
      
      {hasDiscount && formattedOriginal && (
        <span className="text-[11px] font-normal text-[#a89a85] line-through leading-normal">
          {formattedOriginal}
        </span>
      )}
    </div>
  );
}
