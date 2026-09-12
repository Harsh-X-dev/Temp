"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import ClientLink from "@/components/ui/navigation/ClientLink";
import ProductGrid from "@/components/ui/data-display/ProductGrid";
import type { Product } from "@/types/shared.types";
import type { PurposeDetail } from "@/services/purpose.service";

interface PurposeDetailClientProps {
  purpose: PurposeDetail;
  products: Product[];
}

export default function PurposeDetailClient({
  purpose,
  products,
}: PurposeDetailClientProps) {
  const router = useRouter();
  const hasProducts = products.length > 0;

  return (
    <div className="w-full flex flex-col bg-surface-subtle pb-6 sm:pb-8">
      {/* Top Header Bar */}
      <div className="sticky top-0 z-30 flex h-14 items-center justify-between bg-white px-4 md:px-6 lg:px-8 shadow-2xs">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => router.back()}
            className="flex h-9 w-9 items-center justify-center rounded-full text-text-primary transition-colors hover:bg-surface-subtle active:scale-95"
            aria-label="Go back"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-5 w-5"
            >
              <line x1="19" y1="12" x2="5" y2="12" />
              <polyline points="12 19 5 12 12 5" />
            </svg>
          </button>
          <h1 className="text-[17px] sm:text-[19px] font-bold text-text-primary tracking-tight">
            {purpose.name}
          </h1>
        </div>

        {/* Right Search Action */}
        <ClientLink
          href="/search"
          className="flex h-9 w-9 items-center justify-center rounded-full text-text-primary transition-colors hover:bg-surface-subtle active:scale-95"
          aria-label="Search"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="h-5 w-5"
          >
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
        </ClientLink>
      </div>

      {/* Main Content Area */}
      <div className="mx-auto w-full max-w-5xl flex flex-col">
        {/* Hero Image Banner */}
        <div className="relative h-[200px] sm:h-[260px] md:h-[300px] w-full overflow-hidden">
          <Image
            src={purpose.bannerImage || "/assets/images/hero_section_new_arrival.png"}
            alt={purpose.name}
            fill
            priority
            className="object-cover"
            sizes="(max-width: 1024px) 100vw, 1200px"
          />
          {/* Subtle nature-dark gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/35 to-black/20" />

          {/* Banner Title at bottom left */}
          <div className="absolute bottom-4 left-4 sm:bottom-6 sm:left-6 z-10">
            <h2 className="text-[26px] sm:text-[32px] md:text-[36px] font-bold text-white tracking-tight drop-shadow-sm">
              {purpose.name}
            </h2>
          </div>
        </div>

        {/* Intro Description Card */}
        <div className="border-b border-[#EAE3D8] bg-white px-4 py-5 sm:px-6 sm:py-6">
          <h3 className="text-[17px] sm:text-[19px] font-bold text-[#211E1A] tracking-tight">
            {purpose.headline}
          </h3>
          <p className="mt-2 text-[13px] sm:text-[14px] leading-relaxed text-[#6B635B]">
            {purpose.description}
          </p>
        </div>

        {/* Products Grid Section */}
        <div className="flex flex-col px-4 pt-4 pb-2 sm:px-6">
          <h3 className="text-[17px] sm:text-[19px] font-bold text-[#211E1A] tracking-tight pb-3">
            Products for {purpose.name}
          </h3>

          <ProductGrid
            products={products}
            emptyMessage={`No products currently available for ${purpose.name}.`}
            emptyClassName="py-4 text-center text-[13.5px] text-text-muted"
          />
        </div>
      </div>
    </div>
  );
}
