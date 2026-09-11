"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import ClientLink from "@/components/ui/navigation/ClientLink";
import {
  fetchLiveSuggestions,
  fetchSearchResults,
  fetchTrendingSearches,
} from "@/services/search.client.service";
import type { Product, CategoryConfig } from "@/types/shared.types";
import ProductCard from "@/components/product/ProductCard";
import FilterModal from "@/components/home/FilterModal";
import SortFilterSheet, { SORT_OPTIONS } from "@/components/home/sheets/SortFilterSheet";
import { fetchCategoriesAction, fetchFilterMetadataAction } from "./actions";
import type { FilterMetadata } from "@/services/product.service";
import { matchesTypeFilter, matchesMukhiFilter, matchesOriginFilter } from "@/lib/productFilters";

export default function SearchClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialUrlQuery = searchParams.get("q") || "";

  const [query, setQuery] = useState(initialUrlQuery);
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(Boolean(initialUrlQuery));

  const [categories, setCategories] = useState<CategoryConfig[]>([]);
  const [filterMetadata, setFilterMetadata] = useState<FilterMetadata | undefined>(undefined);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [trendingSearches, setTrendingSearches] = useState<string[]>([]);

  const [suggestions, setSuggestions] = useState<Product[]>([]);
  const [isFetchingSuggestions, setIsFetchingSuggestions] = useState(false);

  const [results, setResults] = useState<Product[]>([]);
  const [isFetchingResults, setIsFetchingResults] = useState(false);

  const [sortBy, setSortBy] = useState("relevance");
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isSortOpen, setIsSortOpen] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);
  const cacheRef = useRef<Record<string, Product[]>>({});
  const suggestionsCacheRef = useRef<Record<string, Product[]>>({});

  useEffect(() => {
    fetchCategoriesAction().then(setCategories);
    fetchFilterMetadataAction().then(setFilterMetadata);
  }, []);

  // Initialize recent searches from localStorage
  useEffect(() => {
    const saved = localStorage.getItem("recentSearches");
    if (saved) {
      try {
        setRecentSearches(JSON.parse(saved).slice(0, 5));
      } catch (e) {
        // ignore
      }
    }

    // Fetch trending
    fetchTrendingSearches().then(setTrendingSearches);
  }, []);

  // Sync initial query from URL
  useEffect(() => {
    if (initialUrlQuery) {
      setQuery(initialUrlQuery);
      setIsSubmitted(true);
    }
  }, [initialUrlQuery]);

  // Debounce query for live suggestions
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(query);
    }, 200);
    return () => clearTimeout(timer);
  }, [query]);

  // Fetch live suggestions when user is typing (State 2)
  useEffect(() => {
    const trimmed = debouncedQuery.trim();
    if (!isSubmitted && trimmed.length >= 2) {
      if (suggestionsCacheRef.current[trimmed]) {
        setSuggestions(suggestionsCacheRef.current[trimmed]);
        setIsFetchingSuggestions(false);
        return;
      }

      setIsFetchingSuggestions(true);
      fetchLiveSuggestions(trimmed).then((data) => {
        suggestionsCacheRef.current[trimmed] = data;
        setSuggestions(data);
        setIsFetchingSuggestions(false);
      });
    } else {
      setSuggestions([]);
    }
  }, [debouncedQuery, isSubmitted]);

  // Fetch results when submitted (State 3)
  useEffect(() => {
    const trimmed = query.trim();
    if (isSubmitted && trimmed.length > 0) {
      const cacheKey = `${trimmed.toLowerCase()}_${sortBy}`;
      if (cacheRef.current[cacheKey]) {
        setResults(cacheRef.current[cacheKey]);
        setIsFetchingResults(false);
        return;
      }

      setIsFetchingResults(true);
      fetchSearchResults(trimmed, sortBy).then((data) => {
        cacheRef.current[cacheKey] = data;
        setResults(data);
        setIsFetchingResults(false);
      });
    }
  }, [isSubmitted, query, sortBy]);

  const handleSearchSubmit = (e?: React.FormEvent, term?: string) => {
    if (e) e.preventDefault();
    const searchTerm = (term !== undefined ? term : query).trim();

    if (!searchTerm) return;

    if (term !== undefined) setQuery(term);
    setIsSubmitted(true);
    inputRef.current?.blur();

    // Update URL
    const newUrl = `/search?q=${encodeURIComponent(searchTerm)}`;
    router.replace(newUrl, { scroll: false });

    // Save to recent
    const updatedRecent = [
      searchTerm,
      ...recentSearches.filter((s) => s.toLowerCase() !== searchTerm.toLowerCase()),
    ].slice(0, 5);
    setRecentSearches(updatedRecent);
    localStorage.setItem("recentSearches", JSON.stringify(updatedRecent));
  };

  const handleClearInput = () => {
    setQuery("");
    setIsSubmitted(false);
    setResults([]);
    router.replace("/search", { scroll: false });
    if (inputRef.current) inputRef.current.focus();
  };

  const handleClearRecent = () => {
    setRecentSearches([]);
    localStorage.removeItem("recentSearches");
  };

  const handleBack = () => {
    if (isSubmitted) {
      setIsSubmitted(false);
    } else {
      router.back();
    }
  };

  const getSortLabel = () => {
    const option = SORT_OPTIONS.find((opt) => opt.value === sortBy);
    return option ? `Sort: ${option.label}` : "Sort: Relevance";
  };

  const isState1 = query.length === 0;
  const isState2 = query.length > 0 && !isSubmitted;
  const isState3 = isSubmitted;

  // Filter search results based on active URL search params
  const minPriceParam = searchParams.get("minPrice");
  const maxPriceParam = searchParams.get("maxPrice");
  const typesParam = searchParams.get("types");
  const mukhiParam = searchParams.get("mukhi");
  const originParam = searchParams.get("origin");
  const ratingParam = searchParams.get("rating");
  const inStockParam = searchParams.get("inStock");

  let displayedResults = results;

  if (minPriceParam) {
    const minVal = parseInt(minPriceParam, 10);
    if (!isNaN(minVal)) {
      displayedResults = displayedResults.filter((p) => {
        const mainPrice = parseInt(p.price.replace(/[^\d]/g, ""), 10) || 0;
        const variantPrices = (p.variants && p.variants.length > 0)
          ? p.variants.filter((v) => v.isActive).map((v) => v.price)
          : [mainPrice];
        return variantPrices.some((price) => price >= minVal);
      });
    }
  }

  if (maxPriceParam) {
    const maxVal = parseInt(maxPriceParam, 10);
    if (!isNaN(maxVal)) {
      displayedResults = displayedResults.filter((p) => {
        const mainPrice = parseInt(p.price.replace(/[^\d]/g, ""), 10) || 0;
        const variantPrices = (p.variants && p.variants.length > 0)
          ? p.variants.filter((v) => v.isActive).map((v) => v.price)
          : [mainPrice];
        return variantPrices.some((price) => price <= maxVal);
      });
    }
  }

  if (typesParam) {
    const typeList = typesParam.split(",").map((t) => t.trim()).filter(Boolean);
    displayedResults = displayedResults.filter((p) => matchesTypeFilter(typeList, p));
  }

  if (mukhiParam) {
    const mukhiList = mukhiParam.split(",").map((m) => m.trim()).filter(Boolean);
    displayedResults = displayedResults.filter((p) => matchesMukhiFilter(mukhiList, p));
  }

  if (originParam) {
    const originList = originParam.split(",").map((o) => o.trim()).filter(Boolean);
    displayedResults = displayedResults.filter((p) => matchesOriginFilter(originList, p));
  }

  if (ratingParam) {
    const ratingVal = parseFloat(ratingParam);
    if (!isNaN(ratingVal)) {
      displayedResults = displayedResults.filter((p) => (p.rating || 0) >= ratingVal);
    }
  }

  if (inStockParam === "true") {
    displayedResults = displayedResults.filter((p) => p.variants && p.variants.some((v) => v.isActive));
  }

  return (
    <div className={`flex flex-col flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 md:px-8 bg-white min-h-full ${isState3 ? "pt-1 pb-8" : "pt-3 pb-8"}`}>
      {/* Sticky Search & Filter Toolbar Header (Matches Figma Node 738:193 & 738:293) */}
      <div className={`w-full ${isState3 ? "sticky top-[46px] lg:top-[64px] z-40 bg-white pt-1 pb-2 mb-1.5" : "max-w-2xl mx-auto pt-1 mb-3"}`}>
        <div className="flex items-center gap-2.5 w-full">
          {/* Back button shown on initial search overlay */}
          {!isState3 && (
            <button
              type="button"
              onClick={handleBack}
              className="flex size-9 items-center justify-center rounded-full text-text-primary hover:bg-[#eae4d9] transition-colors cursor-pointer shrink-0"
              aria-label="Back"
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M19 12H5M12 19l-7-7 7-7" />
              </svg>
            </button>
          )}

          {/* Search Input Form */}
          <form onSubmit={handleSearchSubmit} className="flex-1 relative">
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setIsSubmitted(false);
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handleSearchSubmit(e);
                }
              }}
              placeholder="Search rudraksha, pyrite..."
              className="w-full h-[44px] pl-4 pr-10 rounded-[24px] border-[1.5px] border-[#e5e0da] bg-[#fbf8f4] text-[13px] font-medium text-[#211e1a] placeholder:text-[#a89a85] focus:outline-none focus:border-[#d1c9bf] transition-colors"
            />
            {query.length > 0 ? (
              <button
                type="button"
                onClick={handleClearInput}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-[#6b6459] hover:text-[#211e1a] transition-colors cursor-pointer"
                aria-label="Clear search"
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <circle cx="12" cy="12" r="10" />
                  <path d="m15 9-6 6M9 9l6 6" />
                </svg>
              </button>
            ) : (
              <div className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-[#6b6459]">
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <circle cx="11" cy="11" r="8" />
                  <path d="m21 21-4.35-4.35" />
                </svg>
              </div>
            )}
          </form>
        </div>

        {/* Filter and Sort Toolbar directly below Search bar in State 3 */}
        {isState3 && (
          <div className="flex items-center justify-between mt-3 w-full">
            {/* Filter Button */}
            <button
              type="button"
              onClick={() => setIsFilterOpen(true)}
              aria-expanded={isFilterOpen}
              aria-haspopup="dialog"
              className={`border flex items-center gap-1.5 px-4 py-2 rounded-[20px] text-[12px] font-semibold transition-colors cursor-pointer ${
                isFilterOpen
                  ? "border-primary-orange bg-[#fff5ee] text-primary-orange"
                  : "bg-white border-[#e5e0da] text-[#6b6459] hover:text-[#211e1a] hover:border-[#211e1a]"
              }`}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
                className={`size-3.5 ${
                  isFilterOpen ? "text-primary-orange" : "text-[#6b6459]"
                }`}
                aria-hidden="true"
              >
                <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
              </svg>
              <span>Filters</span>
            </button>

            {/* Sort Dropdown Anchor */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setIsSortOpen(true)}
                aria-expanded={isSortOpen}
                aria-haspopup="dialog"
                className={`flex items-center gap-1 text-[12px] font-medium transition-colors cursor-pointer ${
                  isSortOpen || sortBy !== "relevance"
                    ? "text-primary-orange font-semibold"
                    : "text-[#6b6459] hover:text-[#211e1a]"
                }`}
              >
                <span>{getSortLabel()}</span>
                <svg
                  className={`size-3.5 transition-transform duration-200 ${
                    isSortOpen
                      ? "rotate-180 text-primary-orange"
                      : sortBy !== "relevance"
                      ? "text-primary-orange"
                      : "text-[#6b6459]"
                  }`}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="w-full">
        {/* State 1: Default / Initial Screen */}
        {isState1 && (
          <div className="max-w-2xl mx-auto py-2 space-y-6 w-full">
            {recentSearches.length > 0 && (
              <section>
                <div className="flex items-center justify-between mb-3">
                  <h2 className="text-[14px] font-medium text-text-secondary">Recent searches</h2>
                  <button
                    type="button"
                    onClick={handleClearRecent}
                    className="text-[13px] font-semibold text-primary-orange hover:text-[#e04d00] transition-colors cursor-pointer"
                  >
                    Clear all
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {recentSearches.map((term) => (
                    <div
                      key={term}
                      className="flex items-center gap-1 rounded-full border border-border-strong pl-3.5 pr-2 py-1.5 bg-white"
                    >
                      <button
                        type="button"
                        onClick={() => handleSearchSubmit(undefined, term)}
                        className="text-[13px] font-medium text-text-primary hover:text-primary-orange transition-colors cursor-pointer"
                      >
                        {term}
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          const newRecent = recentSearches.filter((s) => s !== term);
                          setRecentSearches(newRecent);
                          localStorage.setItem("recentSearches", JSON.stringify(newRecent));
                        }}
                        className="text-text-muted hover:text-primary-orange transition-colors p-0.5 cursor-pointer"
                        aria-label={`Remove ${term}`}
                      >
                        <svg
                          width="14"
                          height="14"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <line x1="18" y1="6" x2="6" y2="18" />
                          <line x1="6" y1="6" x2="18" y2="18" />
                        </svg>
                      </button>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {trendingSearches.length > 0 && (
              <section>
                <h2 className="text-[14px] font-medium text-text-secondary mb-3">
                  Trending searches
                </h2>
                <div className="flex flex-wrap gap-2">
                  {trendingSearches.map((term) => (
                    <button
                      key={term}
                      type="button"
                      onClick={() => handleSearchSubmit(undefined, term)}
                      className="rounded-full border border-border-strong px-3.5 py-1.5 bg-white text-[13px] font-medium text-text-primary hover:border-primary-orange hover:text-primary-orange transition-colors cursor-pointer"
                    >
                      {term}
                    </button>
                  ))}
                </div>
              </section>
            )}

            <section className="w-full">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-[14px] font-medium text-text-secondary">Shop by category</h2>
                <ClientLink href="/collection/all" className="flex items-center gap-1 group">
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
                    className="h-3.5 w-3.5 text-primary-orange"
                    aria-hidden="true"
                  >
                    <path d="M9 18l6-6-6-6" />
                  </svg>
                </ClientLink>
              </div>
              <div className="w-full">
                <div className="-mx-4 sm:-mx-6 md:-mx-8 pl-4 sm:pl-6 md:pl-8 pr-0 flex items-center gap-3 overflow-x-auto no-scrollbar scroll-smooth py-1">
                  {categories
                    .filter((cat) => cat.id !== "all")
                    .map((cat) => (
                      <ClientLink
                        key={cat.id}
                        href={`/collection/${cat.id}`}
                        className="flex flex-col items-center justify-center p-2.5 gap-2 shrink-0 group bg-[#f5f1ea] rounded-[12px] w-[80px] h-[96px] border border-transparent hover:border-primary-orange transition-colors"
                      >
                        <div className="w-[40px] h-[40px] rounded-full overflow-hidden shadow-xs flex items-center justify-center bg-white">
                          {cat.icon ? (
                            <Image
                              src={cat.icon}
                              alt={cat.label}
                              width={40}
                              height={40}
                              className="w-full h-full object-cover"
                              unoptimized
                            />
                          ) : (
                            <span className="text-[9px] text-text-muted">No img</span>
                          )}
                        </div>
                        <span className="text-[11px] font-medium text-[#211e1a] group-hover:text-primary-orange transition-colors text-center leading-[14px] line-clamp-1">
                          {cat.label}
                        </span>
                      </ClientLink>
                    ))}
                  {/* Trailing spacer: gap-3 (12px) + w-1 (4px) = 16px right margin (matches View all / Clear all) */}
                  <div className="w-1 shrink-0 h-1" aria-hidden="true" />
                </div>
              </div>
            </section>
          </div>
        )}

        {/* State 2: Live Search Suggestions (Matches Figma Node 738:255) */}
        {isState2 && (
          <div className="max-w-2xl mx-auto py-1">
            {isFetchingSuggestions && suggestions.length === 0 ? (
              <div className="py-8 text-center text-text-muted text-sm">Searching...</div>
            ) : suggestions.length > 0 ? (
              <div className="rounded-2xl bg-white border border-[#e7e2d8] shadow-sm overflow-hidden divide-y divide-[#f5f1ea]">
                {suggestions.map((item) => (
                  <ClientLink
                    key={item.id}
                    href={`/product/${item.slug}`}
                    className="flex items-center gap-3.5 px-4 py-3 hover:bg-surface-subtle transition-colors group cursor-pointer"
                  >
                    <div className="w-12 h-12 rounded-xl overflow-hidden bg-surface-subtle shrink-0 relative border border-border-strong/50">
                      {item.imageUrl ? (
                        <Image
                          src={item.imageUrl}
                          alt={item.name}
                          fill
                          className="object-cover"
                          sizes="48px"
                          unoptimized
                        />
                      ) : (
                        <div className="size-full bg-surface-subtle" />
                      )}
                    </div>
                    <span className="flex-1 text-[14px] font-medium text-text-primary group-hover:text-primary-orange transition-colors line-clamp-1">
                      {item.name}
                    </span>
                    <div className="text-[#a89f91] group-hover:text-primary-orange transition-colors shrink-0">
                      <svg
                        width="18"
                        height="18"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M5 12h14M12 5l7 7-7 7" />
                      </svg>
                    </div>
                  </ClientLink>
                ))}
              </div>
            ) : debouncedQuery ? (
              <div className="py-8 text-center text-text-muted text-sm">No suggestions found</div>
            ) : null}
          </div>
        )}

        {/* State 3: Search Results Grid (Matches Figma Node 738:293) */}
        {isState3 && (
          <div className="w-full flex-1 flex flex-col pt-4 bg-white">
            {/* Results Grid (2 cols mobile, 3 cols tablet, 4 cols desktop) */}
            {isFetchingResults ? (
              <div className="grid grid-cols-2 gap-x-4 gap-y-6 sm:gap-x-5 sm:gap-y-6 md:grid-cols-3 lg:grid-cols-4">
                {[...Array(4)].map((_, i) => (
                  <div
                    key={i}
                    className="animate-pulse flex flex-col gap-2 w-full"
                  >
                    <div className="bg-[#f5f2ed] w-full aspect-square rounded-[12px]" />
                    <div className="bg-[#f5f2ed] h-3.5 w-3/4 rounded mt-1" />
                    <div className="bg-[#f5f2ed] h-3 w-1/2 rounded" />
                    <div className="bg-[#f5f2ed] h-4 w-1/3 rounded mt-0.5" />
                  </div>
                ))}
              </div>
            ) : displayedResults.length > 0 ? (
              <div className="grid grid-cols-2 gap-x-4 gap-y-6 sm:gap-x-5 sm:gap-y-6 md:grid-cols-3 lg:grid-cols-4">
                {displayedResults.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={{
                      id: product.id,
                      href: `/product/${product.slug || product.id}`,
                      name: product.name,
                      imageUrl: product.imageUrl,
                      currentPrice: product.price,
                      originalPrice: product.mrp,
                      category: product.category,
                      isCertified: product.certified,
                      tags: product.tags,
                      rating: product.rating,
                      reviewCount: product.reviewCount,
                    }}
                    variant="shopping"
                  />
                ))}
              </div>
            ) : (
              <div className="flex-1 flex items-center justify-center text-center py-24 text-text-muted text-sm bg-white">
                No products found for &quot;{query}&quot;.
              </div>
            )}
          </div>
        )}
      </div>

      {/* Filter Modal */}
      <FilterModal
        isOpen={isFilterOpen}
        onClose={() => setIsFilterOpen(false)}
        categories={categories}
        filterMetadata={filterMetadata}
      />

      {/* Sort Sheet */}
      <SortFilterSheet
        isOpen={isSortOpen}
        onClose={() => setIsSortOpen(false)}
        currentSort={sortBy}
        onApply={(value) => {
          setSortBy(value);
          setIsSortOpen(false);
        }}
      />
    </div>
  );
}
