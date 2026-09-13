"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from 'next/link';
import Image from 'next/image';
import BackButton from '@/components/ui/buttons/BackButton';
import CartButton from '@/components/ui/buttons/CartButton';
import WishlistButton from '@/components/ui/buttons/WishlistButton';
import { assets } from '@/lib/assets';

export default function TopNavigation() {
  const router = useRouter();

  // Instant prefetch of the shop collection page for 0ms transitions
  useEffect(() => {
    router.prefetch('/collection/all');
  }, [router]);
  return (
    <>
      <header className="fixed top-0 inset-x-0 z-50 w-full bg-white/95 backdrop-blur-md border-b border-border-strong shadow-xs">
        <div className="flex h-[56px] md:h-[64px] items-center justify-between px-4 sm:px-6 md:px-8 w-full max-w-7xl mx-auto relative">
          {/* Left: Back Button to Shop page */}
          <div className="flex items-center z-10">
            <BackButton href="/collection/all" className="size-8 md:size-9" />
          </div>

          {/* Center: Logo */}
          <div className="absolute left-1/2 -translate-x-1/2 flex items-center justify-center">
            <Link href="/" className="flex shrink-0 items-center transition-opacity hover:opacity-90 active:scale-98">
              <Image
                src={assets.logo}
                alt="GemoStone"
                width={140}
                height={36}
                className="h-[30px] sm:h-[34px] md:h-9 w-auto object-contain"
                priority
                unoptimized
              />
            </Link>
          </div>

          {/* Right: Wishlist & Cart */}
          <div className="flex items-center gap-1.5 sm:gap-2.5 z-10">
            <WishlistButton
              className="w-9 h-9 flex items-center justify-center relative text-text-primary hover:text-primary-orange transition-colors rounded-full hover:bg-surface-neutral"
              iconClassName="w-[22px] h-[22px] md:w-6 md:h-6"
            />
            <CartButton
              className="w-9 h-9 flex items-center justify-center relative text-text-primary hover:text-primary-orange transition-colors rounded-full hover:bg-surface-neutral"
              iconClassName="w-[22px] h-[22px] md:w-6 md:h-6"
            />
          </div>
        </div>
      </header>
      {/* Spacer so page content does not jump under fixed header */}
      <div className="h-[56px] md:h-[64px] w-full shrink-0" aria-hidden="true" />
    </>
  );
}
