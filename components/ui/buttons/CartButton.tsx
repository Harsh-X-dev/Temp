"use client";

import Link from "next/link";
import { NavIcon } from "@/components/layout/NavIcon";
import { useCartStore } from "@/store/cart.store";
import { useHasMounted } from "@/hooks/useHasMounted";

interface CartButtonProps {
  /** Additional classes applied to the outer <Link> wrapper. */
  className?: string;
  /** Classes applied to the NavIcon itself — controls the icon size. */
  iconClassName?: string;
  /** aria-label for accessibility. Defaults to "Cart". */
  ariaLabel?: string;
}

/**
 * Reusable cart link button.
 *
 * Renders the canonical cart icon (from NavIcon) inside a Next.js <Link>
 * pointing to /cart, with a reactive count badge that updates whenever the
 * cart changes. Handles SSR/hydration safely via a mounted guard.
 *
 * The outer wrapper and icon size are fully customisable via className /
 * iconClassName so the component fits every context (Navbar, PDP header,
 * page headers, etc.) without visual regressions.
 */
export default function CartButton({
  className = "relative text-text-primary transition-colors hover:text-primary-orange flex items-center justify-center",
  iconClassName = "h-[22px] w-[22px]",
  ariaLabel = "Cart",
}: CartButtonProps) {
  const mounted = useHasMounted();
  const items = useCartStore((state) => state.items);

  const cartCount = mounted
    ? items.reduce((total, item) => total + item.quantity, 0)
    : 0;

  return (
    <Link href="/cart" aria-label={ariaLabel} className={className}>
      <NavIcon id="cart" className={iconClassName} />
      {mounted && cartCount > 0 && (
        <span className="absolute -top-1.5 -right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-primary-orange text-[10px] font-bold text-white shadow-sm">
          {cartCount}
        </span>
      )}
    </Link>
  );
}
