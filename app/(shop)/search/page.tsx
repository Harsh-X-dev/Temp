import { Suspense } from "react";
import SearchClient from "./SearchClient";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Search - GemoStone",
  description: "Search for products across GemoStone.",
};

export default function SearchPage() {
  return (
    <div className="w-full min-h-[100dvh] flex-1 flex flex-col bg-white pb-20 lg:pb-10">
      <Suspense fallback={<div className="w-full min-h-[100dvh] flex items-center justify-center text-text-muted text-sm bg-white">Loading search...</div>}>
        <SearchClient />
      </Suspense>
    </div>
  );
}
