"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ComponentProps } from "react";

interface BackButtonProps extends ComponentProps<"button"> {
  href?: string;
  /** 'default' = circular bordered button (default). 'plain' = just the arrow icon, no circle. */
  variant?: "default" | "plain";
}

/**
 * Universal circular Back Button that matches the Figma design.
 * Hovering turns the border and arrow orange.
 *
 * Behaviour:
 *  - `href` prop    → renders as a Next.js <Link> navigating to that URL.
 *  - `onClick` prop → calls the provided handler (e.g. to close a sheet).
 *  - Neither        → router.back() if history exists, otherwise falls back to "/".
 *
 * Variants:
 *  - `default` → circular bordered button (used in most page headers).
 *  - `plain`   → bare arrow icon only, no circle or border (used in legal pages per Figma).
 */
export default function BackButton({ href, className, onClick, variant = "default", ...props }: BackButtonProps) {
  const router = useRouter();

  const baseClasses =
    variant === "plain"
      ? `flex items-center justify-center text-primary-orange transition-transform active:scale-95 cursor-pointer ${className || "size-[24px]"}`
      : `flex items-center justify-center rounded-full border border-border-strong bg-white text-text-primary transition-all hover:border-primary-orange hover:text-primary-orange active:border-primary-orange active:text-primary-orange active:scale-95 cursor-pointer ${className || "size-8 md:size-10"}`;

  const icon = (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={variant === "plain" ? "2.5" : "2"}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={variant === "plain" ? "size-[16px]" : "size-4 md:size-5"}
    >
      <path d="M19 12H5M12 19l-7-7 7-7" />
    </svg>
  );

  if (href) {
    return (
      <Link href={href} className={baseClasses} aria-label="Go back">
        {icon}
      </Link>
    );
  }

  const handleClick = onClick ?? (() => {
    router.back();
  });

  return (
    <button
      type="button"
      onClick={handleClick}
      className={baseClasses}
      aria-label="Go back"
      {...props}
    >
      {icon}
    </button>
  );
}
