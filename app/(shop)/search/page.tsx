import { Suspense } from "react";
import SearchClient from "./SearchClient";
import SearchLoading from "./loading";
import { getActiveCollections } from "@/services/collection.service";
import { getFilterMetadata } from "@/services/product.service";
import { DEFAULT_TRENDING_SEARCHES } from "@/services/search.client.service";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Search - GemoStone",
  description: "Search for products across GemoStone.",
};

export const revalidate = 60;

export default async function SearchPage() {
  const [categories, filterMetadata] = await Promise.all([
    getActiveCollections(),
    getFilterMetadata(),
  ]);

  return (
    <div className="w-full min-h-[100dvh] flex-1 flex flex-col bg-white pb-20 lg:pb-10">
      <Suspense fallback={<SearchLoading />}>
        <SearchClient
          initialCategories={categories}
          initialFilterMetadata={filterMetadata}
          initialTrending={DEFAULT_TRENDING_SEARCHES}
        />
      </Suspense>
    </div>
  );
}
