import { BaseProductComponentProps } from "@/types/product.types";
import Rating from "./Rating";

export default function ProductInfo({ product, variant }: BaseProductComponentProps) {
  return (
    <div className="flex flex-col gap-0.5 w-full">
      <h3 className="line-clamp-1 break-words text-[13px] leading-[18px] font-medium text-[#211e1a] group-hover:text-primary-orange transition-colors">
        {product.name}
      </h3>

      <Rating product={product} variant={variant} />
    </div>
  );
}
