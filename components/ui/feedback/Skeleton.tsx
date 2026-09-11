interface SkeletonProps {
  className?: string;
  /** Fully rounded — use for avatar/thumbnail placeholders instead of a rectangular bar. */
  circle?: boolean;
}

/**
 * A single pulsing placeholder block, meant to be composed into whatever
 * layout a skeleton needs. Every skeleton in the app (OrderStates,
 * ReviewsStates, ProfilePageSkeleton, CouponSheet, CartPage,
 * AddressPickerSheet, Navbar, SearchClient, wishlist) currently hand-writes
 * `animate-pulse rounded bg-surface-neutral` bars individually — this is
 * that one primitive, factored out.
 */
export default function Skeleton({ className = "", circle = false }: SkeletonProps) {
  return (
    <div
      aria-hidden="true"
      className={`animate-shimmer ${circle ? "rounded-full" : "rounded-[12px]"} ${className}`}
    />
  );
}
