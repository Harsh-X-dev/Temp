"use client";

import { useHasMounted } from "@/hooks/useHasMounted";
import Image from "next/image";
import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { assets } from "@/lib/assets";
import { navItems } from "@/lib/navigation";
import Container from "./Container";
import { NavIcon } from "./NavIcon";
import { useAuth } from "@/hooks/useAuth";
import ClientLink from "@/components/ui/navigation/ClientLink";
import CartButton from "@/components/ui/buttons/CartButton";
import { useWishlistStore } from "@/store/wishlist.store";

import AnnouncementBar from "@/components/home/banners/AnnouncementBar";

function isNavActive(href: string, pathname: string): boolean {
  if (href === "/") return pathname === "/";
  if (href === "/collection/all") return pathname.startsWith("/collection");
  return pathname === href || pathname.startsWith(href + "/");
}

/**
 * Auth-aware action area in the top-right of the Navbar.
 * Shows a login button for guests or an account icon for authenticated users.
 */
function NavAuthActions() {
  const { isAuthenticated, initialized, logout } = useAuth();
  const pathname = usePathname();

  if (!initialized) {
    // Skeleton to prevent layout shift while session initialises
    return (
      <div className="hidden lg:flex items-center gap-3">
        <div className="h-8 w-16 rounded-full bg-surface-neutral animate-pulse" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="hidden lg:flex items-center gap-3">
        <ClientLink
          href="/login"
          id="nav-login-button"
          className="rounded-full bg-primary-orange px-4 py-1.5 text-sm font-semibold text-white transition-all hover:bg-primary-orange-hover hover: active:scale-[0.98]"
        >
          Sign in
        </ClientLink>
      </div>
    );
  }

  return (
    <div className="hidden lg:flex items-center gap-2">
      <ClientLink
        href="/profile"
        id="nav-account-link"
        aria-label="My Account"
        className={`flex flex-col items-center gap-0.5 transition-opacity hover:opacity-80 ${isNavActive("/profile", pathname) ? "opacity-100" : "opacity-70"
          }`}
      >
      </ClientLink>
      <button
        type="button"
        onClick={logout}
        id="nav-logout-button"
        className="rounded-full border border-border-strong px-3 py-1.5 text-xs font-semibold text-text-secondary transition-all hover:border-red-300 hover:text-red-600 active:scale-[0.98]"
      >
        Sign out
      </button>
    </div>
  );
}

export default function Navbar() {
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
    try {
      router.prefetch("/search");
      router.prefetch("/cart");
    } catch {}
  }, [mounted, router]);

  const wishlistCount = mounted ? wishlistIds.length : 0;
  const isSearchPage = pathname?.startsWith('/search');
  const isHomePage = pathname === '/';

  if (
    pathname?.startsWith('/product/') ||
    pathname?.startsWith('/support') ||
    pathname === '/cart' ||
    pathname === '/profile/reviews' ||
    pathname === '/profile/edit' ||
    pathname?.startsWith('/checkout') ||
    pathname === '/search'
  ) return null;

  const isMobileHiddenRoute = pathname?.startsWith('/orders');
  const isWishlistPage = pathname === '/wishlist';

  return (
    <>
      <header className={`sticky top-0 z-50 w-full max-w-full overflow-hidden ${isMobileHiddenRoute ? 'hidden lg:block' : ''}`}>
        {isHomePage && (
          <div className="w-full max-w-full bg-primary-orange">
            <AnnouncementBar />
          </div>
        )}
        <div className={`w-full max-w-full bg-white ${isSearchPage || isWishlistPage ? 'border-b-0 shadow-none' : 'border-b border-border-strong shadow-xs'}`}>
          <Container className={`relative flex items-center justify-between gap-3 md:gap-4 ${isSearchPage ? 'h-[46px] lg:h-[64px]' : 'h-[56px] lg:h-[72px]'}`}>
            {/* Logo — Centered on mobile, left-aligned on desktop */}
            <div className="absolute left-1/2 -translate-x-1/2 flex items-center justify-center lg:static lg:translate-x-0">
              <ClientLink href="/" className="flex shrink-0 items-center">
                <Image
                  src={assets.logo}
                  alt="GemoStone logo"
                  width={162}
                  height={41}
                  className="h-[34px] w-auto object-contain md:h-9 lg:h-10"
                  priority
                  unoptimized
                />
              </ClientLink>
            </div>


            {/* Desktop nav links - centered */}
            <nav
              aria-label="Main navigation"
              className="hidden flex-1 items-center justify-center gap-8 lg:flex xl:gap-12"
            >
              {navItems.map((item) => {
                const active = isNavActive(item.href, pathname);
                return (
                  <ClientLink
                    key={item.id}
                    href={item.href}
                    className={`flex flex-col items-center justify-center gap-1.5 transition-colors ${active ? "text-primary-orange" : "text-text-primary hover:text-primary-orange"
                      }`}
                  >
                    <div className="relative flex items-center justify-center">
                      <NavIcon id={item.id} className="h-6 w-6 xl:h-[26px] xl:w-[26px]" />
                      {item.id === "wishlist" && mounted && wishlistCount > 0 && (
                        <span className="absolute -top-1.5 -right-2 flex h-4 w-4 items-center justify-center rounded-full bg-primary-orange text-[10px] font-bold text-white shadow-sm">
                          {wishlistCount}
                        </span>
                      )}
                    </div>
                    <span className="text-[12px] font-semibold leading-none">{item.label}</span>
                  </ClientLink>
                );
              })}
            </nav>

            {/* Right Actions: Search, Cart, Auth */}
            <div className="ml-auto flex items-center gap-4 md:gap-6 relative">
              <ClientLink
                href="/search"
                aria-label="Search"
                className="text-text-primary transition-colors hover:text-primary-orange cursor-pointer"
              >
                <NavIcon id="search" className="h-[22px] w-[22px] md:h-6 md:w-6 xl:h-[26px] xl:w-[26px]" />
              </ClientLink>

              <CartButton
                iconClassName="h-[22px] w-[22px] md:h-6 md:w-6 xl:h-[26px] xl:w-[26px]"
              />

              {/* Auth actions — desktop only */}
              <NavAuthActions />
            </div>
          </Container>
        </div>
      </header>
    </>
  );
}
