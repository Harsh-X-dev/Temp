'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import BackButton from '@/components/ui/buttons/BackButton';
import { NavIcon } from '@/components/layout/NavIcon';

export default function EmptyCartState() {
  const router = useRouter();

  return (
    <div className="bg-white flex flex-col w-full flex-1 h-full overflow-hidden">
      {/* Header */}
      <div className="bg-white border-b border-border-strong flex h-[56px] shrink-0 items-center justify-between px-6 sticky top-0 z-10 w-full">
        <BackButton className="size-8 md:size-10 shrink-0 -ml-3" />
        <h1 className="font-bold text-text-primary text-[18px]">My Cart</h1>
        <Link 
          href="/search" 
          aria-label="Search"
          className="flex items-center justify-center p-2 -mr-4 text-text-primary hover:text-primary-orange transition-colors active:scale-95"
        >
          <NavIcon id="search" className="h-[22px] w-[22px]" />
        </Link>
      </div>

      {/* Centered Content Area */}
      <div className="flex flex-col items-center justify-center flex-1 px-6 w-full py-10">
        
        {/* Illustration */}
        <div className="bg-surface-neutral rounded-full w-[160px] h-[160px] flex items-center justify-center shrink-0 mb-[28px]">
          <div className="relative w-[100px] h-[100px]">
            <Image 
              src="/assets/images/empty_cart.png"
              alt="Empty Cart"
              fill
              className="object-contain"
              style={{ mixBlendMode: 'multiply', filter: 'contrast(1.2) brightness(1.1)' }}
              unoptimized
            />
          </div>
        </div>
        
        {/* Text */}
        <h2 className="font-bold text-[20px] text-text-primary mb-[12px] text-center">Your Cart is Empty</h2>
        <p className="text-[14px] leading-[22px] text-text-secondary text-center max-w-[280px] mb-[24px]">
          Looks like you haven't added any gemstones yet. Start exploring our collection!
        </p>

        {/* Action Buttons */}
        <div className="flex gap-3 w-full max-w-sm mb-[16px]">
          <Link 
            href="/wishlist"
            className="flex-1 bg-primary-orange text-white font-semibold text-[15px] h-[50px] rounded-[24px] flex items-center justify-center hover:bg-primary-orange-hover active:scale-[0.98] transition-all"
          >
            Wishlist
          </Link>
          <Link 
            href="/collection/all"
            className="flex-1 bg-primary-orange text-white font-semibold text-[15px] h-[50px] rounded-[24px] flex items-center justify-center hover:bg-primary-orange-hover active:scale-[0.98] transition-all"
          >
            Shop Now
          </Link>
        </div>
        
        {/* Footer Text */}
        <p className="text-[12px] text-text-muted text-center w-full">
          Secure Checkout • Free Shipping Nationwide
        </p>
      </div>
    </div>
  );
}
