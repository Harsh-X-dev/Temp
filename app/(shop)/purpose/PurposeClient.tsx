"use client";

import React from "react";
import { useRouter } from "next/navigation";
import ClientLink from "@/components/ui/navigation/ClientLink";
import PurposeIcon from "@/components/purpose/PurposeIcon";
import type { PurposeSummary } from "@/services/purpose.service";

interface PurposeClientProps {
  purposes: PurposeSummary[];
}

export default function PurposeClient({ purposes }: PurposeClientProps) {
  const router = useRouter();

  return (
    <div className="w-full flex flex-col bg-surface-subtle pb-6 sm:pb-8">
      {/* Top Header Bar */}
      <div className="sticky top-0 z-30 flex h-14 items-center justify-between bg-white px-4 md:px-6 lg:px-8">
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
            Shop by Purpose
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

      {/* Main Content List */}
      <div className="mx-auto w-full max-w-3xl px-4 pt-4 md:px-6">
        {/* Eyebrow / Subtitle */}
        <p className="pb-3 text-[11px] sm:text-[12px] font-bold uppercase tracking-wider text-[#8C847E]">
          Filter Jewelry by Intention
        </p>

        {/* Purpose Cards List */}
        <div className="flex flex-col gap-2.5 sm:gap-3">
          {purposes
            .filter((item) => item.isActive !== false)
            .map((item) => (
              <ClientLink
                key={item.id}
                href={`/purpose/${item.slug}`}
                className="group flex items-center justify-between rounded-[16px] border border-[#EFEAE2] bg-white p-3.5 sm:p-4 shadow-[0_2px_6px_rgba(0,0,0,0.02)] transition-all duration-200 hover:border-[#FED7AA] hover:shadow-[0_4px_16px_rgba(224,90,27,0.08)] active:scale-[0.99]"
              >
                {/* Left Info: Icon & Labels */}
                <div className="flex items-center gap-3.5 sm:gap-4">
                  <div className="flex h-[46px] w-[46px] sm:h-[48px] sm:w-[48px] shrink-0 items-center justify-center rounded-[14px] bg-[#FFF5ED] border border-[#FDE5D4]/80 transition-transform duration-200 group-hover:scale-105">
                    <PurposeIcon slug={item.slug} className="h-5 w-5 text-primary-orange" />
                  </div>
                  <div className="flex flex-col">
                    <h2 className="text-[15px] sm:text-[16px] font-bold text-text-primary leading-tight">
                      {item.title}
                    </h2>
                    <span className="mt-0.5 text-[12px] sm:text-[13px] font-medium text-primary-orange leading-tight">
                      {item.subtitle}
                    </span>
                  </div>
                </div>

                {/* Right Chevron */}
                <div className="flex items-center pl-2 text-[#A8A29E] transition-all duration-200 group-hover:translate-x-1 group-hover:text-primary-orange">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="h-4 w-4"
                  >
                    <path d="M9 18l6-6-6-6" />
                  </svg>
                </div>
              </ClientLink>
            ))}

          {purposes.filter((item) => item.isActive !== false).length === 0 && (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <p className="text-sm text-text-secondary">No active purposes available at the moment.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
