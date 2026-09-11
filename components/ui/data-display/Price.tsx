import { formatPrice } from "@/lib/formatters/price";

interface PriceProps {
  value: number;
  compareAtValue?: number;
  className?: string;
  compareClassName?: string;
}

export { formatPrice };

/**
 * Price display with an optional struck-through compare-at price. Consolidates
 * the `₹...toLocaleString("en-IN")` pairing repeated in BillSummary,
 * CouponCard, CheckoutPaymentClient, OrderSummaryCard, VariantSelectionModal,
 * ProductPurchaseCard, ProductPrice and CheckoutItemCard — 42 hardcoded ₹
 * signs and 32 toLocaleString calls across 18 files.
 */
export default function Price({
  value,
  compareAtValue,
  className = "",
  compareClassName = "",
}: PriceProps) {
  const hasDiscount = typeof compareAtValue === "number" && compareAtValue > value;
  return (
    <span className="inline-flex items-baseline gap-2">
      <span className={className}>{formatPrice(value)}</span>
      {hasDiscount && (
        <span className={`text-text-tertiary line-through ${compareClassName}`}>
          {formatPrice(compareAtValue)}
        </span>
      )}
    </span>
  );
}
