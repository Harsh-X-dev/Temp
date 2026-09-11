"use client";

import Link from "next/link";
import { NavIcon } from "@/components/layout/NavIcon";
import { useWishlistStore } from "@/store/wishlist.store";
import { useHasMounted } from "@/hooks/useHasMounted";

interface WishlistButtonProps {
  /** Additional classes applied to the outer <Link> wrapper. */
  className?: string;
  /** Classes applied to the NavIcon itself — controls the icon size. */
  iconClassName?: string;
  /** aria-label for accessibility. Defaults to "Wishlist". */
  ariaLabel?: string;
  /** Whether to show count badge when items exist in wishlist. Defaults to true. */
  showCount?: boolean;
}

/**
 * Reusable wishlist link button.
 *
 * Renders the canonical wishlist icon (from NavIcon) inside a Next.js <Link>
 * pointing to /wishlist, with a reactive count badge that updates whenever the
 * wishlist changes. Handles SSR/hydration safely via a mounted guard.
 *
 * The outer wrapper and icon size are fully customisable via className /
 * iconClassName so the component fits every context (PDP header,
 * page headers, etc.) without visual regressions.
 */
export default function WishlistButton({
  className = "relative text-text-primary transition-colors hover:text-primary-orange flex items-center justify-center",
  iconClassName = "h-[22px] w-[22px]",
  ariaLabel = "Wishlist",
  showCount = true,
}: WishlistButtonProps) {
  const mounted = useHasMounted();
  const wishlistIds = useWishlistStore((state) => state.wishlistIds);

  const wishlistCount = mounted ? wishlistIds.length : 0;

  return (
    <Link href="/wishlist" aria-label={ariaLabel} className={className}>
      <NavIcon id="wishlist" className={iconClassName} />
      {showCount && mounted && wishlistCount > 0 && (
        <span className="absolute -top-1.5 -right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-primary-orange text-[10px] font-bold text-white shadow-sm">
          {wishlistCount}
        </span>
      )}
    </Link>
  );
}
