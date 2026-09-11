"use client";

import { useCallback, useEffect, useState } from "react";
import useEmblaCarousel from "embla-carousel-react";
import Autoplay from "embla-carousel-autoplay";
import BannerSlide from "@/components/home/banners/BannerSlide";
import type { Banner } from "@/types/banner.types";

interface BannerSliderProps {
  banners: Banner[];
}

/**
 * BannerSlider — client component that owns ALL carousel interactivity.
 *
 * Responsibilities:
 *  - Embla carousel initialisation with infinite loop
 *  - Autoplay (pauses on mouse enter / drag, resumes on mouse leave)
 *  - Previous / Next navigation buttons (desktop only)
 *  - Pagination dots with active-slide tracking
 *  - Mobile swipe / touch / mouse-drag
 *
 * This component NEVER fetches data. It simply receives Banner[] and renders.
 */
export default function BannerSlider({ banners }: BannerSliderProps) {
  const [emblaRef, emblaApi] = useEmblaCarousel(
    { loop: true, align: "center" },
    [
      Autoplay({
        delay: 4000,
        /** false → autoplay resumes after a drag instead of stopping permanently */
        stopOnInteraction: false,
        /** Pause while the mouse hovers over the carousel */
        stopOnMouseEnter: true,
      }),
    ],
  );

  const [selectedIndex, setSelectedIndex] = useState(0);
  const [scrollSnaps, setScrollSnaps] = useState<number[]>([]);

  // ── Navigation handlers ────────────────────────────────────────────────────

  const scrollPrev = useCallback(() => emblaApi?.scrollPrev(), [emblaApi]);
  const scrollNext = useCallback(() => emblaApi?.scrollNext(), [emblaApi]);
  const scrollTo = useCallback(
    (index: number) => emblaApi?.scrollTo(index),
    [emblaApi],
  );

  // ── Sync active index with Embla ───────────────────────────────────────────

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setSelectedIndex(emblaApi.selectedScrollSnap());
  }, [emblaApi]);

  const onInit = useCallback(() => {
    if (!emblaApi) return;
    setScrollSnaps(emblaApi.scrollSnapList());
    setSelectedIndex(emblaApi.selectedScrollSnap());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;

    const timer = window.setTimeout(() => onInit(), 0);
    emblaApi.on("reInit", onInit);
    emblaApi.on("select", onSelect);

    return () => {
      window.clearTimeout(timer);
      emblaApi.off("reInit", onInit);
      emblaApi.off("select", onSelect);
    };
  }, [emblaApi, onInit, onSelect]);

  useEffect(() => {
    if (!emblaApi) return;

    emblaApi.on("reInit", onInit);
    emblaApi.on("select", onSelect);

    return () => {
      emblaApi.off("reInit", onInit);
      emblaApi.off("select", onSelect);
    };
  }, [emblaApi, onInit, onSelect]);

  // ── Early return for edge case: no banners ─────────────────────────────────

  if (banners.length === 0) return null;

  // ── Single banner — render without carousel chrome ─────────────────────────

  if (banners.length === 1) {
    return <BannerSlide banner={banners[0]} isPriority />;
  }

  // ── Full carousel ──────────────────────────────────────────────────────────

  return (
    <div
      className="relative w-full max-w-full overflow-hidden"
      role="region"
      aria-label="Banner carousel"
      aria-roledescription="carousel"
    >
      {/* Viewport — Embla clips overflow here */}
      <div className="overflow-hidden" ref={emblaRef}>
        <div className="flex touch-pan-y">
          {banners.map((banner, index) => (
            <div
              key={banner.id}
              className="min-w-0 flex-[0_0_100%]"
              style={{ transform: "translate3d(0, 0, 0)", backfaceVisibility: "hidden", WebkitBackfaceVisibility: "hidden" }}
              role="group"
              aria-roledescription="slide"
              aria-label={`Slide ${index + 1} of ${banners.length}`}
            >
              <BannerSlide banner={banner} isPriority={index === 0} />
            </div>
          ))}
        </div>
      </div>

      {/* ── Previous / Next buttons (desktop only) ─────────────────────────── */}
      <button
        type="button"
        onClick={scrollPrev}
        aria-label="Previous banner"
        className="absolute left-4 md:left-6 lg:left-8 top-1/2 -translate-y-1/2 hidden md:flex size-8 sm:size-10 items-center justify-center rounded-full border border-border-strong bg-white text-text-primary shadow-md transition-all hover:border-primary-orange hover:text-primary-orange active:scale-95 z-20"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="18" height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="M15 18l-6-6 6-6" />
        </svg>
      </button>

      <button
        type="button"
        onClick={scrollNext}
        aria-label="Next banner"
        className="absolute right-4 md:right-6 lg:right-8 top-1/2 -translate-y-1/2 hidden md:flex size-8 sm:size-10 items-center justify-center rounded-full border border-border-strong bg-white text-text-primary shadow-md transition-all hover:border-primary-orange hover:text-primary-orange active:scale-95 z-20"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="18" height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="M9 18l6-6-6-6" />
        </svg>
      </button>

      {/* ── Pagination dots ────────────────────────────────────────────────── */}
      <div
        className="absolute bottom-6 left-0 right-0 flex items-center justify-center gap-2"
        role="tablist"
        aria-label="Slide indicators"
      >
        {scrollSnaps.map((_, index) => (
          <button
            key={index}
            type="button"
            role="tab"
            aria-selected={index === selectedIndex}
            aria-label={`Go to slide ${index + 1}`}
            onClick={() => scrollTo(index)}
            className={`h-2 rounded-full transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 ${
              index === selectedIndex
                ? "w-6 bg-white"
                : "w-2 bg-white/50 hover:bg-white/80"
            }`}
          />
        ))}
      </div>
    </div>
  );
}
