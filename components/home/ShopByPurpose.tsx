import React from "react";
import ClientLink from "@/components/ui/navigation/ClientLink";
import PurposeIcon from "@/components/purpose/PurposeIcon";
import { getActivePurposes, type PurposeSummary } from "@/services/purpose.service";

interface ShopByPurposeProps {
  purposes?: PurposeSummary[];
}

export default async function ShopByPurpose({ purposes }: ShopByPurposeProps) {
  const allPurposes = purposes || (await getActivePurposes());
  const activePurposes = (allPurposes || []).filter((p) => p.isActive !== false);

  if (activePurposes.length === 0) {
    return null;
  }

  // Strictly display only active purposes limited to 6
  const displayPurposes = activePurposes.slice(0, 6);

  return (
    <section aria-label="Shop by Purpose" className="w-full">
      {/* Section Header */}
      <div className="flex items-center justify-between px-4 pb-3 pt-2 md:px-6 lg:px-8">
        <h2 className="text-[18px] sm:text-[20px] font-bold text-text-primary tracking-tight">
          Shop by Purpose
        </h2>
        <ClientLink href="/purpose" className="flex items-center gap-1 group">
          <span className="text-[13px] font-semibold text-primary-orange group-hover:underline">
            View all
          </span>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
            className="h-3.5 w-3.5 text-primary-orange transition-transform group-hover:translate-x-0.5"
            aria-hidden="true"
          >
            <path d="M9 18l6-6-6-6" />
          </svg>
        </ClientLink>
      </div>

      {/* Horizontal Purpose Items List with edge-to-edge scroll behavior */}
      <div className="w-full">
        <div className="no-scrollbar flex items-center overflow-x-auto py-2 scroll-smooth">
          {/* 1. Left Spacer (Initially only left padding) */}
          <div className="shrink-0 w-4 md:w-6 lg:w-8" aria-hidden="true" />

          <div className="flex items-center gap-4 sm:gap-6">
            {displayPurposes.map((purpose) => (
              <ClientLink
                key={purpose.id}
                href={`/purpose/${purpose.slug}`}
                className="group flex flex-col items-center flex-shrink-0 cursor-pointer text-center"
              >
                {/* Peach / Soft Orange Squircle Icon Box */}
                <div className="flex h-[64px] w-[64px] sm:h-[68px] sm:w-[68px] items-center justify-center rounded-[18px] bg-[#FFF5ED] border border-[#FDE5D4]/80 shadow-[0_2px_6px_rgba(224,90,27,0.04)] transition-all duration-200 group-hover:scale-105 group-hover:bg-[#FFEEDE] group-hover:border-[#FDBA74] group-hover:shadow-[0_4px_12px_rgba(224,90,27,0.12)] group-active:scale-95">
                  <PurposeIcon slug={purpose.slug} className="h-6 w-6 text-primary-orange" />
                </div>

                {/* Label */}
                <span className="mt-2 text-[12px] sm:text-[13px] font-medium text-text-primary tracking-tight transition-colors group-hover:text-primary-orange">
                  {purpose.title}
                </span>
              </ClientLink>
            ))}
          </div>

          {/* 3. Right Spacer (At the end only right padding) */}
          <div className="shrink-0 w-4 md:w-6 lg:w-8" aria-hidden="true" />
        </div>
      </div>
    </section>
  );
}
