import Image from "next/image";
import ClientLink from "@/components/ui/navigation/ClientLink";
import type { Banner } from "@/types/banner.types";

interface BannerSlideProps {
  banner: Banner;
  /** Whether this slide is the currently active one (used for priority loading). */
  isPriority?: boolean;
}

/**
 * BannerSlide — renders the hero banner with instant eager priority image loading.
 */
export default function BannerSlide({ banner, isPriority = false }: BannerSlideProps) {
  return (
    <section
      aria-label={banner.title}
      className="relative flex h-[440px] sm:h-[500px] w-full flex-col items-center justify-center overflow-hidden bg-[#ede8e1] md:h-[600px] lg:h-[700px]"
      style={{ transform: "translate3d(0, 0, 0)", backfaceVisibility: "hidden", WebkitBackfaceVisibility: "hidden" }}
    >
      {/* Background Image — rendered immediately with high priority */}
      {banner.image ? (
        <Image
          src={banner.image}
          alt={banner.imageAlt || banner.title || "Banner"}
          fill
          className="object-cover"
          priority={isPriority}
          loading={isPriority ? "eager" : "lazy"}
          sizes="100vw"
          quality={85}
        />
      ) : null}

      {/* Dark Overlay (45% opacity per Figma) */}
      <div className="absolute inset-0 bg-black/45" />

      {/* Content centered */}
      <div className="relative z-10 flex w-full flex-col items-center justify-center gap-3 sm:gap-4 px-4 sm:px-6 md:gap-5">
        {banner.subtitle ? (
          <p className="text-center text-[10px] sm:text-[11px] font-semibold uppercase tracking-widest text-white md:text-xs lg:text-sm drop-shadow-sm">
            {banner.subtitle}
          </p>
        ) : null}
        <h2 className="text-center text-[26px] sm:text-[32px] md:text-5xl lg:text-6xl font-bold leading-tight text-white max-w-2xl px-2 drop-shadow-sm">
          {banner.title}
        </h2>
        {banner.buttonText ? (
          <ClientLink href={banner.buttonHref || "/collection/all"} tabIndex={-1} className="mt-1 sm:mt-2 lg:mt-4">
            <div className="flex items-center justify-center rounded-full bg-white px-5 sm:px-6 py-2.5 sm:py-3 transition-transform hover:scale-105 active:scale-95 shadow-sm">
              <span className="text-[13px] sm:text-[14px] font-bold text-text-primary md:text-base">
                {banner.buttonText}
              </span>
            </div>
          </ClientLink>
        ) : null}
      </div>
    </section>
  );
}
