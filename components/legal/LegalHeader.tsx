"use client";

import BackButton from "@/components/ui/buttons/BackButton";

interface LegalHeaderProps {
  title: string;
  backHref?: string;
}

export default function LegalHeader({ title, backHref }: LegalHeaderProps) {
  return (
    <header className="sticky top-0 z-30 bg-white border-b border-border-strong/40 flex h-[56px] items-center px-[16px] shrink-0 w-full">
      <div className="flex items-center gap-[16px] max-w-4xl w-full mx-auto">
        {/* Plain arrow variant matches Figma legal page header — no circle/border */}
        <BackButton href={backHref} variant="plain" aria-label="Go back" />
        <h1 className="font-sans font-bold text-text-primary text-[16px] tracking-[-0.16px] whitespace-nowrap">
          {title}
        </h1>
      </div>
    </header>
  );
}
