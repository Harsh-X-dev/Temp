"use client";

import { useWishlistStore } from "@/store/wishlist.store";
import { useCallback } from "react";
import { toast } from "@/lib/toast";
import { useHasMounted } from "@/hooks/useHasMounted";

function HeartIcon({
  filled,
  color = "currentColor",
  className = "",
}: {
  filled: boolean;
  color?: string;
  className?: string;
}) {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      tabIndex={-1}
      style={{ outline: 'none' }}
      className={className}
      fill={filled ? color : "none"}
      stroke={filled ? "none" : color}
      strokeWidth={filled ? 0 : 1.8}
    >
      <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.27 2 8.5 2 5.41 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.08C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.41 22 8.5c0 3.77-3.4 6.86-8.55 11.53L12 21.35z" />
    </svg>
  );
}

interface WishlistToggleButtonProps {
  productId: string;
  productName: string;
  isWishlistVariant?: boolean;
}

/**
 * Toggles a specific product in/out of the wishlist — the heart button
 * overlaid on a product card/gallery image. Not to be confused with
 * components/ui/WishlistButton, which is a nav link to the /wishlist page
 * with a count badge; the two were both named "WishlistButton" in different
 * folders, which made it easy to import the wrong one by mistake.
 */
export default function WishlistToggleButton({
  productId,
  productName,
  isWishlistVariant = false,
}: WishlistToggleButtonProps) {
  const { toggleWishlist, removeFromWishlist, isInWishlist } = useWishlistStore();
  const mounted = useHasMounted();

  // Only consider it in the wishlist after mounting to prevent SSR hydration mismatch
  const inWishlist = mounted && !isWishlistVariant && isInWishlist(productId);

  const handleHeartClick = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      if (isWishlistVariant) {
        removeFromWishlist(productId);
        toast.info("Removed from Wishlist 🗑️", `${productName} has been removed from your wishlist.`);
      } else {
        toggleWishlist(productId);
        if (inWishlist) {
          toast.info("Removed from Wishlist 🗑️", `${productName} has been removed from your wishlist.`);
        } else {
          toast.success("Added to Wishlist ❤️", `${productName} has been added to your wishlist.`);
        }
      }
    },
    [isWishlistVariant, productId, productName, removeFromWishlist, toggleWishlist, inWishlist]
  );

  return (
    <button
      type="button"
      onClick={handleHeartClick}
      aria-label={
        isWishlistVariant
          ? `Remove ${productName} from wishlist`
          : inWishlist
            ? `Remove ${productName} from wishlist`
            : `Add ${productName} to wishlist`
      }
      aria-pressed={!isWishlistVariant ? inWishlist : undefined}
      className="absolute right-[10px] bottom-[10px] z-10 flex size-[36px] cursor-pointer items-center justify-center rounded-full bg-white shadow-md transition-transform duration-200 hover:scale-110 active:scale-90 outline-none focus:outline-none focus-visible:outline-none [-webkit-tap-highlight-color:transparent]"
      style={{ outline: 'none', WebkitTapHighlightColor: 'transparent' }}
    >
      {isWishlistVariant ? (
        // Wishlist page — always filled red
        <HeartIcon
          filled
          color="#ef4444"
          className="size-[20px]"
        />
      ) : inWishlist ? (
        // Default card — in wishlist, filled orange
        <HeartIcon
          filled
          color="#ff5400"
          className="size-[20px]"
        />
      ) : (
        // Default card — not in wishlist, outline
        <HeartIcon
          filled={false}
          color="#4b463d"
          className="size-[20px]"
        />
      )}
    </button>
  );
}
