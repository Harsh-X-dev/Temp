"use client";

import { createPortal } from "react-dom";
import { useEffect } from "react";
import { useHasMounted } from "@/hooks/useHasMounted";
import ClientLink from "@/components/ui/navigation/ClientLink";
import { usePathname, useRouter } from "next/navigation";
import { navItems } from "@/lib/navigation";
import { NavIcon } from "./NavIcon";
import { useWishlistStore } from "@/store/wishlist.store";

/**
 * Returns true when the given nav href is "active" for the current pathname.
 */
function isNavActive(href: string, pathname: string): boolean {
  if (href === "/") return pathname === "/";
  if (href === "/collection/all") return pathname.startsWith("/collection") || pathname.startsWith("/search");
  return pathname === href || pathname.startsWith(href + "/");
}

export default function BottomNav() {
  const pathname = usePathname();
  const router = useRouter();
  const mounted = useHasMounted();
  const wishlistIds = useWishlistStore((state) => state.wishlistIds);

  useEffect(() => {
    if (!mounted) return;
    navItems.forEach((item) => {
      try {
        router.prefetch(item.href);
      } catch {}
    });
  }, [mounted, router]);

  const wishlistCount = mounted ? wishlistIds.length : 0;


  if (!mounted) return null;

  if (
    pathname === '/' ||
    pathname === '/profile' ||
    pathname === '/wishlist' ||
    pathname?.startsWith('/collection')
  ) {
    return createPortal(
      <nav
        aria-label="Bottom navigation"
        className="fixed inset-x-0 bottom-0 z-[100] w-full bg-white border-t border-[#e5e0da] lg:hidden"
        style={{
          bottom: 0,
          paddingBottom: "max(env(safe-area-inset-bottom, 0px), 0px)",
          boxShadow: "0 -2px 10px rgba(0,0,0,0.05), 0 50px 0 50px #ffffff",
        }}
      >
        {/* Continuous solid downward shield starting from top of nav extending 160px down */}
        <div className="absolute inset-x-0 top-0 -bottom-40 bg-white -z-10 pointer-events-none" aria-hidden="true" />

        {/* Inner Nav Content Container matching Figma node 865:3865 */}
        <div className="relative mx-auto flex max-w-lg items-center justify-between px-6 pt-2.5 pb-1">
          {navItems.map((item) => {
            const active = isNavActive(item.href, pathname);
            return (
              <ClientLink
                key={item.id}
                href={item.href}
                aria-label={item.label}
                aria-current={active ? "page" : undefined}
                className={`flex flex-col items-center justify-center gap-1 min-w-[64px] transition-colors cursor-pointer ${
                  active ? "text-[#ff5400] font-medium" : "text-[#211e1a] font-medium hover:text-[#ff5400]"
                }`}
              >
                <div className="relative flex items-center justify-center">
                  <NavIcon id={item.id} className="size-[20px]" />
                  {item.id === "wishlist" && wishlistCount > 0 && (
                    <span className="absolute -top-1.5 -right-2 flex h-4 w-4 items-center justify-center rounded-full bg-[#ff5400] text-[10px] font-bold text-white shadow-sm">
                      {wishlistCount}
                    </span>
                  )}
                </div>
                <span className="text-[11px] leading-normal">{item.label}</span>
              </ClientLink>
            );
          })}
        </div>
      </nav>,
      document.body
    );
  }

  return null;
}


