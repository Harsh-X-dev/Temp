import Image from "next/image";
import ClientLink from "@/components/ui/navigation/ClientLink";
import { assets } from "@/lib/assets";
import { getBannersByPlacement } from "@/services/banner.service";

export default async function SplitStoryBanner() {
  const banners = await getBannersByPlacement("split_story_banner");
  const banner = banners[0];

  return (
    <section aria-label="Split Story Banner" className="w-full max-w-full overflow-hidden">
      <div className="relative flex h-[280px] sm:h-[320px] md:h-[380px] lg:h-[420px] w-full flex-col justify-between overflow-hidden bg-[#e5e0da] p-[24px] sm:p-8 md:p-10 lg:p-12">
        {/* Warm shimmer base */}
        <div className="absolute inset-0 animate-shimmer" />

        {/* Background image */}
        <Image
          src={banner?.image || "/assets/images/placeholder.png"}
          alt={banner?.title || "Split story banner"}
          fill
          className="object-cover"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-black/40" />

        {/* Top Text Content */}
        <div className="relative z-10 flex flex-col gap-[8px] text-white">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-white">
            NATURALLY SOURCED
          </p>
          <h2 className="text-[28px] sm:text-[32px] md:text-[38px] font-bold leading-tight drop-shadow-sm text-white">
            {banner?.title || "Nepal Origin"}
          </h2>
        </div>

        {/* Bottom Buttons - Perfectly aligned across container with 12px gap */}
        <div className="relative z-10 flex w-full max-w-full sm:max-w-md items-center gap-[12px]">
          <ClientLink
            href="/collection/rudraksha"
            className="flex flex-1 min-w-0 items-center justify-center rounded-[20px] bg-white px-[18px] py-[10px] shadow-sm transition-transform hover:scale-[1.02] active:scale-[0.98]"
          >
            <span className="truncate text-[12px] font-bold leading-normal text-[#211e1a] text-center whitespace-nowrap">
              Shop Rudraksha
            </span>
          </ClientLink>
          <ClientLink
            href="/collection/pyrite"
            className="flex flex-1 min-w-0 items-center justify-center rounded-[20px] bg-white px-[18px] py-[10px] shadow-sm transition-transform hover:scale-[1.02] active:scale-[0.98]"
          >
            <span className="truncate text-[12px] font-bold leading-normal text-[#211e1a] text-center whitespace-nowrap">
              Shop Pyrite
            </span>
          </ClientLink>
        </div>
      </div>
    </section>
  );
}
