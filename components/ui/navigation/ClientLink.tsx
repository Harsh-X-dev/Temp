"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ComponentProps, useCallback } from "react";

export default function ClientLink(props: ComponentProps<typeof Link>) {
  const { onClick, onMouseEnter, onTouchStart, prefetch = true, href, ...rest } = props;
  const router = useRouter();

  const handleWarmup = useCallback(() => {
    try {
      if (typeof href === "string") {
        router.prefetch(href);
      } else if (href && typeof href === "object" && "pathname" in href && href.pathname) {
        router.prefetch(href.pathname);
      }
    } catch {
      // Best-effort prefetch
    }
  }, [href, router]);

  return (
    <Link
      href={href}
      prefetch={prefetch}
      onMouseEnter={(e) => {
        handleWarmup();
        if (onMouseEnter) onMouseEnter(e);
      }}
      onTouchStart={(e) => {
        handleWarmup();
        if (onTouchStart) onTouchStart(e);
      }}
      onClick={(e) => {
        if (onClick) onClick(e);
      }}
      {...rest}
    />
  );
}
