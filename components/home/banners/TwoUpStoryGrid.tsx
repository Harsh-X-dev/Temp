import Image from "next/image";
import ClientLink from "@/components/ui/navigation/ClientLink";
import { getBannersByPlacement } from "@/services/banner.service";

export default async function TwoUpStoryGrid() {
  const banners = await getBannersByPlacement("two_up_story_grid");
  const banner = banners[0];

  return (
    <section aria-label="Featured Collection" className="w-full">
      <div className="w-full px-4 md:px-6 lg:px-8 pb-1 max-w-[1920px] mx-auto">
        <ClientLink
          href={banner?.buttonHref || "/collection/all?mukhi=all_mukhi"}
          className="group relative flex h-[180px] sm:h-[200px] md:h-[240px] w-full flex-col justify-between overflow-hidden rounded-[16px] bg-[#e5e0da] p-5 transition-transform duration-300 hover:scale-[1.005] active:scale-[0.99] shadow-sm"
        >
          {/* Background image & overlay */}
          <div className="absolute inset-0 z-0">
            <div className="absolute inset-0 animate-shimmer" />
            <Image
              src={banner?.image || "/assets/mukhi-series.jpg"}
              alt={banner?.title || "Mukhi Series"}
              fill
              className="object-cover transition-transform duration-700 group-hover:scale-105"
              sizes="100vw"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/35 to-black/50 transition-opacity group-hover:opacity-90" />
          </div>

          {/* Top-left Title */}
          <h3 className="relative z-10 text-[16px] sm:text-[18px] md:text-[20px] font-bold uppercase tracking-wider text-white">
            {banner?.title || "MUKHI SERIES"}
          </h3>

          {/* Bottom-left Shop Now */}
          <div className="relative z-10 flex items-center gap-1.5 text-white">
            <span className="text-[13px] sm:text-[14px] font-semibold text-white tracking-tight">
              Shop Now
            </span>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2.5}
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-3.5 w-3.5 text-white transition-transform duration-200 group-hover:translate-x-1"
              aria-hidden="true"
            >
              <line x1="5" y1="12" x2="19" y2="12" />
              <polyline points="12 5 19 12 12 19" />
            </svg>
          </div>
        </ClientLink>
      </div>
    </section>
  );
}


