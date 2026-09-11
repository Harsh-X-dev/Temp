import { BaseProductComponentProps } from "@/types/product.types";
import RatingStars from "@/components/reviews/RatingStars";

export default function Rating({ product, variant }: BaseProductComponentProps) {
  if (variant === "compact") return null;

  const ratingValue = product.rating ?? 0;
  const reviewCount = product.reviewCount ?? 0;

  return (
    <div className="flex items-center gap-1 mt-0.5">
      <RatingStars rating={Math.round(ratingValue)} iconClassName="size-[11px]" />
      <span className="text-[11px] font-medium text-[#6b6459]">
        ({reviewCount})
      </span>
    </div>
  );
}
