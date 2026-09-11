"use client";

import Image from "next/image";
import { IconStarFilled, IconStarOutline } from "@/components/productDetailPage/Icons";

export default function TestimonialCarousel({ testimonials }: { testimonials: any[] }) {
  const validTestimonials = (testimonials || []).filter(
    (item) =>
      item &&
      Number(item.rating) === 5 &&
      typeof item.imageUrl === "string" &&
      item.imageUrl.trim().length > 0
  );

  if (validTestimonials.length === 0) return null;

  return (
    <div className="w-full max-w-[1920px] mx-auto overflow-hidden">
      {/* Scrollable Testimonials Carousel */}
      <div className="no-scrollbar flex w-full snap-x snap-mandatory overflow-x-auto pb-4 scroll-pl-4 md:scroll-pl-6 lg:scroll-pl-8">
        {/* Left Spacer matching page padding (16px / px-4) */}
        <div className="shrink-0 w-4 md:w-6 lg:w-8" aria-hidden="true" />

        {validTestimonials.map((testimonial) => (
          <div
            key={testimonial.id}
            className="testimonial-card flex shrink-0 snap-start flex-col overflow-hidden w-[280px] sm:w-[300px] md:w-[320px] pr-4"
          >
            <div className="flex h-full w-full flex-col overflow-hidden rounded-[16px] border border-border-strong bg-white shadow-sm">
              {/* Top Image */}
              <div className="relative h-[180px] w-full bg-surface-subtle shrink-0">
                <Image
                  src={testimonial.imageUrl || "/assets/images/placeholder.png"}
                  alt="Review photo"
                  fill
                  className="object-cover"
                  sizes="(max-width: 640px) 100vw, 320px"
                  unoptimized
                />
              </div>

              {/* Content */}
              <div className="flex flex-col p-5 h-full">
                {/* Rating */}
                <div className="flex items-center gap-2 mb-3">
                  <div className="flex items-center gap-[2px]">
                    {[...Array(5)].map((_, i) => {
                      const isFilled = i < testimonial.rating;
                      return isFilled ? (
                        <IconStarFilled key={i} className="h-[14px] w-[14px] text-primary-orange" />
                      ) : (
                        <IconStarOutline key={i} className="h-[14px] w-[14px] text-[#e5e0da]" />
                      );
                    })}
                  </div>
                  <span className="text-[12px] font-medium text-text-secondary mt-[2px]">
                    ({testimonial.rating})
                  </span>
                </div>

                {/* Title */}
                <h3 className="text-[15px] font-bold uppercase leading-[20px] text-text-primary mb-3">
                  "{testimonial.title}"
                </h3>

                {/* Body */}
                <p className="text-[14px] leading-[22px] text-text-secondary mb-6 flex-grow">
                  {testimonial.body}
                </p>

                {/* Author */}
                <div className="flex items-center gap-1.5 mt-auto">
                  <span className="text-[14px] font-bold text-text-primary">
                    {testimonial.authorName}
                  </span>
                  {testimonial.isVerified && (
                    <div className="flex h-4 w-4 items-center justify-center rounded-full bg-primary-orange">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="white"
                        strokeWidth={4}
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="h-[10px] w-[10px]"
                      >
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}

        {/* Right Spacer matching page padding (16px on mobile via pr-4, extra gap for larger screens) */}
        <div className="shrink-0 w-0 md:w-2 lg:w-4" aria-hidden="true" />
      </div>
    </div>
  );
}
