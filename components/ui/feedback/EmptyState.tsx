import type { ReactNode } from "react";
import Link from "next/link";

interface EmptyStateAction {
  label: string;
  href: string;
}

interface EmptyStateProps {
  icon: ReactNode;
  title: string;
  description?: string;
  actions?: EmptyStateAction[];
  className?: string;
}

/**
 * Centered icon badge + title + description + up to two full-width CTAs.
 * Consolidates EmptyCartState, OrdersEmptyState and ReviewsEmptyState, which
 * each hand-wrote the same circular icon badge and the same
 * `flex-1 bg-primary-orange ... rounded-[24px]` button pair.
 */
export default function EmptyState({
  icon,
  title,
  description,
  actions,
  className = "",
}: EmptyStateProps) {
  return (
    <div className={`flex flex-col items-center justify-center px-6 py-12 text-center ${className}`}>
      <div className="mb-6 flex size-[160px] items-center justify-center rounded-full bg-surface-subtle">
        {icon}
      </div>
      <h3 className="mb-2 text-[18px] font-bold text-text-primary">{title}</h3>
      {description && (
        <p className="mb-8 max-w-[280px] text-[14px] leading-relaxed text-text-secondary md:max-w-sm">
          {description}
        </p>
      )}
      {actions && actions.length > 0 && (
        <div className="flex w-full max-w-[364px] gap-4">
          {actions.map((action, index) => (
            <Link
              key={index}
              href={action.href}
              className="flex h-[50px] flex-1 items-center justify-center rounded-[24px] bg-primary-orange text-[15px] font-semibold text-white transition-all hover:bg-primary-orange-hover active:scale-[0.98]"
            >
              {action.label}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
