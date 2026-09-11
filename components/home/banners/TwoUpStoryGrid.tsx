import Image from "next/image";
import ClientLink from "@/components/ui/navigation/ClientLink";
import { getBannersByPlacement } from "@/services/banner.service";

export default async function TwoUpStoryGrid() {
  const banners = await getBannersByPlacement("two_up_story_grid");
  const leftBanner = banners[0];
  const rightBanner = banners[1];

  return (
    <section aria-label="Featured Collections" className="w-full">
      <div className="flex w-full gap-[12px] px-[16px] pb-[24px] md:gap-4 md:px-6 lg:px-8 max-w-[1920px] mx-auto">
        {/* Left Card */}
        <ClientLink
          href={leftBanner?.buttonHref || "/collection/all"}
          className="group relative flex h-[180px] sm:h-[200px] md:h-[240px] flex-1 min-w-0 flex-col justify-between overflow-hidden rounded-[12px] p-[16px] transition-transform hover:scale-[1.02] active:scale-[0.98]"
        >
          {/* Background image & overlay */}
          <div className="absolute inset-0 z-0">
            <Image
              src={leftBanner?.image || "/assets/images/placeholder.png"}
              alt={leftBanner?.title || "Mukhi Series"}
              fill
              className="object-cover transition-transform duration-700 group-hover:scale-105"
              sizes="(max-width: 768px) 50vw, 50vw"
            />
            <div className="absolute inset-0 bg-black/55 transition-colors group-hover:bg-black/45" />
          </div>

          <h3 className="relative z-10 text-[15px] sm:text-[16px] md:text-[18px] font-bold uppercase text-white leading-normal line-clamp-2">
            {leftBanner?.title || "MUKHI SERIES"}
          </h3>
          <div className="relative z-10 flex items-center gap-[4px]">
            <span className="text-[12px] sm:text-[13px] font-semibold text-white leading-normal whitespace-nowrap">
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
              className="h-[12px] w-[12px] text-white transition-transform group-hover:translate-x-1"
            >
              <line x1="5" y1="12" x2="19" y2="12" />
              <polyline points="12 5 19 12 12 19" />
            </svg>
          </div>
        </ClientLink>

        {/* Right Card */}
        <ClientLink
          href={rightBanner?.buttonHref || "/collection/all"}
          className="group relative flex h-[180px] sm:h-[200px] md:h-[240px] flex-1 min-w-0 flex-col justify-between overflow-hidden rounded-[12px] p-[16px] transition-transform hover:scale-[1.02] active:scale-[0.98]"
        >
          <div className="absolute inset-0 z-0">
            <Image
              src={rightBanner?.image || "/assets/images/placeholder.png"}
              alt={rightBanner?.title || "Navratna"}
              fill
              className="object-cover transition-transform duration-700 group-hover:scale-105"
              sizes="(max-width: 768px) 50vw, 50vw"
            />
            <div className="absolute inset-0 bg-black/55 transition-colors group-hover:bg-black/45" />
          </div>

          <h3 className="relative z-10 text-[15px] sm:text-[16px] md:text-[18px] font-bold uppercase text-white leading-normal line-clamp-2">
            {rightBanner?.title || "NAVRATNA"}
          </h3>
          <div className="relative z-10 flex items-center gap-[4px]">
            <span className="text-[12px] sm:text-[13px] font-semibold text-white leading-normal whitespace-nowrap">
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
              className="h-[12px] w-[12px] text-white transition-transform group-hover:translate-x-1"
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
