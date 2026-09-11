import type { ReactNode } from "react";
import BackButton from "@/components/ui/buttons/BackButton";

interface PageHeaderProps {
  title: string;
  backHref?: string;
  onBack?: () => void;
  /** Rendered on the right side of the header. Defaults to an invisible spacer that keeps the title centered. */
  rightSlot?: ReactNode;
  /** Centers the title with the back button and rightSlot pinned to the edges — for headers where a right action must not push the title off-center. */
  centered?: boolean;
  className?: string;
}

/**
 * Sticky page header: circular back button + title + optional right-side
 * slot. Extracted from ProfilePageHeader, OrdersPageHeader, CancelOrderHeader
 * and ReviewsPageHeader, which shared this exact className verbatim with
 * only the title and right slot differing.
 *
 * `centered` covers the OrderDetailPageHeader shape, where the title must
 * stay centered regardless of what's in rightSlot.
 */
export default function PageHeader({
  title,
  backHref,
  onBack,
  rightSlot,
  centered = false,
  className = "",
}: PageHeaderProps) {
  return (
    <header
      className={`sticky top-0 z-50 flex h-[58px] w-full items-center justify-between border-b border-border-strong bg-white px-4 lg:static lg:mx-auto lg:mb-2 lg:h-auto lg:max-w-3xl lg:border-none lg:px-0 lg:pt-8 ${className}`}
    >
      {centered ? (
        <div className="flex w-full items-center gap-4">
          <BackButton href={backHref} onClick={onBack} className="size-9 shrink-0" />
          <h1 className="flex-1 pr-2 text-center text-[17px] font-bold text-text-primary">
            {title}
          </h1>
          <div className="absolute right-4 lg:right-0">{rightSlot}</div>
        </div>
      ) : (
        <>
          <div className="flex items-center gap-3 lg:gap-4">
            <BackButton href={backHref} onClick={onBack} className="size-10 shrink-0 lg:size-12" />
            <h1 className="text-lg font-bold text-text-primary lg:text-3xl">{title}</h1>
          </div>
          <div className="flex items-center justify-end">
            {rightSlot ?? <div className="size-10" aria-hidden="true" />}
          </div>
        </>
      )}
    </header>
  );
}
