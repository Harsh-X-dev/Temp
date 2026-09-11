import Link from "next/link";
import React from "react";
import BackButton from "@/components/ui/buttons/BackButton";

interface ProfilePageHeaderProps {
  title: string;
  backHref?: string;
  rightAction?: React.ReactNode;
}

export default function ProfilePageHeader({
  title,
  backHref = "/profile",
  rightAction,
}: ProfilePageHeaderProps) {
  return (
    <header className="sticky top-0 z-40 flex h-[58px] lg:h-auto items-center justify-between border-b border-border-strong lg:border-none bg-surface-subtle md:bg-white px-4 lg:px-0 lg:pt-6 lg:pb-2 lg:mt-2 lg:max-w-3xl mx-auto w-full lg:relative lg:top-auto">
      <div className="flex gap-3 lg:gap-4 items-center relative">
        <BackButton href={backHref} className="size-10 lg:size-12 shrink-0" />
        <h1 className="text-lg lg:text-3xl font-bold text-text-primary">{title}</h1>
      </div>
      <div className="w-10 flex justify-end">
        {rightAction}
      </div>
    </header>
  );
}
