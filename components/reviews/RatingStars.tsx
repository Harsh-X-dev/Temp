import { IconStarFilled, IconStarOutline } from '@/components/productDetailPage/Icons';

interface RatingStarsProps {
  rating: number;
  max?: number;
  /** Applied to each star icon — override to resize (default matches ReviewHistoryCard). */
  iconClassName?: string;
  className?: string;
}

/**
 * A row of filled/outline star icons for a numeric rating. The single
 * source of star-rendering in the app — components/product/Rating.tsx
 * wraps this instead of re-implementing stars with text glyphs, which
 * previously made the same rating render differently in different places.
 */
export default function RatingStars({
  rating,
  max = 5,
  iconClassName = "size-[14px] md:size-4",
  className = "",
}: RatingStarsProps) {
  return (
    <div className={`flex gap-[2px] items-center ${className}`}>
      {[...Array(max)].map((_, i) => (
        i < rating
          ? <IconStarFilled key={i} className={`${iconClassName} text-primary-orange`} />
          : <IconStarOutline key={i} className={`${iconClassName} text-[#d1c9bf]`} />
      ))}
    </div>
  );
}
