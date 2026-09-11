"use client";

import Link from "next/link";
import type { ButtonHTMLAttributes, ReactNode } from "react";

type IconButtonSize = "sm" | "md" | "lg";
type IconButtonVariant = "neutral" | "accent";

interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  /** Renders as a Next.js <Link> instead of a <button> when provided. */
  href?: string;
  size?: IconButtonSize;
  variant?: IconButtonVariant;
  "aria-label": string;
}

const sizeClasses: Record<IconButtonSize, string> = {
  sm: "size-8",
  md: "size-9 lg:size-10",
  lg: "size-10 lg:size-12",
};

const variantClasses: Record<IconButtonVariant, string> = {
  neutral: "border-border-strong bg-white text-text-primary hover:bg-surface-neutral",
  accent:
    "border-border-strong bg-white text-text-primary hover:border-primary-orange hover:text-primary-orange",
};

const baseClasses =
  "inline-flex shrink-0 cursor-pointer items-center justify-center rounded-full border transition-all active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[var(--color-primary-orange)] disabled:cursor-not-allowed disabled:opacity-50";

/**
 * Circular icon-only button — the border + hover recipe repeated by hand in
 * OrderDetailPageHeader's share button, ReviewsPageHeader's wishlist/cart
 * buttons, EmptyCartState's search link, and VariantSelectionModal's close
 * button. Always requires aria-label since there is no visible text.
 */
export default function IconButton({
  children,
  href,
  size = "md",
  variant = "neutral",
  className = "",
  type = "button",
  ...props
}: IconButtonProps) {
  const classes = `${baseClasses} ${sizeClasses[size]} ${variantClasses[variant]} ${className}`;

  if (href) {
    return (
      <Link href={href} className={classes} aria-label={props["aria-label"]}>
        {children}
      </Link>
    );
  }

  return (
    <button type={type} className={classes} {...props}>
      {children}
    </button>
  );
}
