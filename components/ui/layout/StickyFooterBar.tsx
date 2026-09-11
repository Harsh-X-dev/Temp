import type { ReactNode } from "react";

interface StickyFooterBarProps {
  children: ReactNode;
  className?: string;
}

/**
 * Sticky/fixed bottom bar that accounts for the iOS home-indicator safe
 * area, becoming a normal static block at the lg breakpoint. Matches
 * PaymentFooter, cart/CheckoutSummaryCard, ProductPurchaseCard and the
 * order-cancel page, which each rewrote the same
 * `fixed bottom-0 ... env(safe-area-inset-bottom)` pairing independently.
 */
export default function StickyFooterBar({ children, className = "" }: StickyFooterBarProps) {
  return (
    <div
      className={`fixed bottom-0 left-0 right-0 z-40 border-t border-border-strong bg-white px-4 pt-3 shadow-[0_-4px_16px_rgba(0,0,0,0.06)] lg:static lg:m-0 lg:border-0 lg:bg-transparent lg:p-0 lg:shadow-none ${className}`}
      style={{ paddingBottom: "calc(12px + env(safe-area-inset-bottom, 0px))" }}
    >
      {children}
    </div>
  );
}
