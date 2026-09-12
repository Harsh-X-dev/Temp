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
import SearchLoading from "./loading";
import type { FilterMetadata } from "@/services/product.service";
import { matchesTypeFilter, matchesMukhiFilter, matchesOriginFilter } from "@/lib/productFilters";
import { assets } from "@/lib/assets";
import { navItems } from "@/lib/navigation";
import { NavIcon } from "@/components/layout/NavIcon";
import CartButton from "@/components/ui/buttons/CartButton";
import { useWishlistStore } from "@/store/wishlist.store";

interface SearchClientProps {
  initialCategories?: CategoryConfig[];
  initialFilterMetadata?: FilterMetadata;
  initialTrending?: string[];
}

export default function SearchClient({
  initialCategories = [],
  initialFilterMetadata,
  initialTrending = [
    "Siddh Energized Rudraksha Bracelet",
    "Emerald Pendant in Panchdhatu Setting",
    "Pyrite Bracelet",
    "Ganesha Pendant",
    "5 Mukhi Rudraksha Mala",
  ],
}: SearchClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialUrlQuery = searchParams.get("q") || "";

  const [isMounted, setIsMounted] = useState(false);
  const [query, setQuery] = useState(initialUrlQuery);
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(Boolean(initialUrlQuery));

  const [categories, setCategories] = useState<CategoryConfig[]>(initialCategories);
  const [isCategoriesLoading, setIsCategoriesLoading] = useState(initialCategories.length === 0);
  const [filterMetadata, setFilterMetadata] = useState<FilterMetadata | undefined>(initialFilterMetadata);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [trendingSearches, setTrendingSearches] = useState<string[]>(initialTrending);
  const [isTrendingLoading, setIsTrendingLoading] = useState(initialTrending.length === 0);

  const [suggestions, setSuggestions] = useState<Product[]>([]);
  const [isFetchingSuggestions, setIsFetchingSuggestions] = useState(false);

  const [results, setResults] = useState<Product[]>([]);
  const [isFetchingResults, setIsFetchingResults] = useState(Boolean(initialUrlQuery));

  const [sortBy, setSortBy] = useState("relevance");
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isSortOpen, setIsSortOpen] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);
  const cacheRef = useRef<Record<string, Product[]>>({});
  const suggestionsCacheRef = useRef<Record<string, Product[]>>({});

  useEffect(() => {
    if (initialCategories.length === 0) {
      fetchCategoriesAction().then((data) => {
        setCategories(data);
        setIsCategoriesLoading(false);
      });
    }
    if (!initialFilterMetadata) {
      fetchFilterMetadataAction().then(setFilterMetadata);
    }
  }, [initialCategories.length, initialFilterMetadata]);

  useEffect(() => {
    setIsMounted(true);
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

    if (initialTrending.length === 0) {
      fetchTrendingSearches().then((data) => {
        if (data && data.length > 0) {
          setTrendingSearches(data.slice(0, 5));
        }
        setIsTrendingLoading(false);
      });
    }
  }, [initialTrending.length]);

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
      handleClearInput();
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

  if (!isMounted && !initialUrlQuery) {
    return <SearchLoading />;
  }

  return (
    <div className="flex flex-col flex-1 w-full bg-white">
      {/* ========================================================================= */}
      {/* STATE 3: SEARCH RESULTS (Matches Figma Node 738:293 & 1482:1254)         */}
      {/* ========================================================================= */}
      {isState3 ? (
        <div className="flex flex-col flex-1 w-full bg-white pb-24 lg:pb-12">
          {/* LogoHeader Navbar directly inside State 3 */}
          <SearchLogoHeader onSearchClick={() => inputRef.current?.focus()} />

          <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
            {/* Search Input Field */}
            <div className="pt-3 pb-3 w-full">
              <form onSubmit={handleSearchSubmit} className="w-full relative">
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
                  className="w-full h-[44px] pl-4 pr-11 rounded-[24px] border-[1.5px] border-[#e5e0da] bg-[#fbf8f4] text-[13px] font-medium text-[#211e1a] placeholder:text-[#a89a85] focus:outline-none focus:border-[#d1c9bf] transition-colors"
                />
                <button
                  type="button"
                  onClick={handleClearInput}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-[#6b6459] hover:text-[#211e1a] transition-colors cursor-pointer"
                  aria-label="Clear search"
                >
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
                    <circle cx="12" cy="12" r="10" />
                    <path d="m15 9-6 6M9 9l6 6" />
                  </svg>
                </button>
              </form>
            </div>

            {/* Results Count Line */}
            <div className="mb-2">
              {isFetchingResults ? (
                <div className="h-4 w-[160px] sm:w-[200px] rounded-[4px] animate-shimmer" />
              ) : (
                <p className="text-[13px] font-medium text-[#211e1a]">
                  {displayedResults.length} {displayedResults.length === 1 ? "result" : "results"} for &quot;{query}&quot;
                </p>
              )}
            </div>

            {/* Filter and Sort Toolbar */}
            <div className="flex items-center justify-between mb-4 w-full">
              {isFetchingResults ? (
                <>
                  <div className="h-[31px] w-[91px] rounded-[20px] animate-shimmer" />
                  <div className="h-[14px] w-[100px] rounded-[4px] animate-shimmer" />
                </>
              ) : (
                <>
                  <button
                    type="button"
                    onClick={() => setIsFilterOpen(true)}
                    aria-expanded={isFilterOpen}
                    aria-haspopup="dialog"
                    className={`border flex items-center gap-1.5 px-4 py-1.5 sm:py-2 rounded-[20px] text-[12px] font-semibold transition-colors cursor-pointer ${
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
                      className={`size-3.5 ${isFilterOpen ? "text-primary-orange" : "text-[#6b6459]"}`}
                      aria-hidden="true"
                    >
                      <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
                    </svg>
                    <span>Filters</span>
                  </button>

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
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                </>
              )}
            </div>

            {/* Results Grid / Loading Shimmer Skeleton (Matching Figma Node 1482:1254) */}
            {isFetchingResults ? (
              <div className="grid grid-cols-2 gap-x-3.5 gap-y-6 sm:gap-x-4 sm:gap-y-7 md:grid-cols-3 lg:grid-cols-4">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="flex flex-col gap-2 w-full">
                    <div className="w-full aspect-square rounded-[12px] animate-shimmer" />
                    <div className="h-3.5 w-[85%] rounded-[6px] animate-shimmer mt-1" />
                    <div className="h-2.5 w-[50%] rounded-[4px] animate-shimmer" />
                    <div className="h-3.5 w-[45%] rounded-[6px] animate-shimmer mt-0.5" />
                  </div>
                ))}
              </div>
            ) : displayedResults.length > 0 ? (
              <div className="grid grid-cols-2 gap-x-3.5 gap-y-6 sm:gap-x-4 sm:gap-y-7 md:grid-cols-3 lg:grid-cols-4">
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

          {/* BottomNav shown in State 3 */}
          <SearchBottomNav />
        </div>
      ) : (
        /* ========================================================================= */
        /* STATES 1 & 2: DISCOVERY / SUGGESTIONS (Matches Figma Node 738:193 & 738:255) */
        /* ========================================================================= */
        <div className="flex flex-col flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 md:px-8 bg-white pt-2 pb-4">
          {/* Top Search Input Bar with Back Arrow */}
          <div className="w-full max-w-2xl mx-auto pt-1 mb-3">
            <div className="flex items-center gap-2.5 w-full">
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
          </div>

          <div className="w-full">
            {/* State 1: Default Discovery Screen */}
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

                {/* Trending Searches Section */}
                <section>
                  <h2 className="text-[14px] font-medium text-text-secondary mb-3">
                    Trending searches
                  </h2>
                  {isTrendingLoading ? (
                    <div className="flex flex-wrap gap-2">
                      {[150, 120, 140, 110, 135].map((w, i) => (
                        <div
                          key={i}
                          style={{ width: `${w}px` }}
                          className="h-[34px] rounded-full animate-shimmer"
                        />
                      ))}
                    </div>
                  ) : trendingSearches.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {trendingSearches.slice(0, 5).map((term) => (
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
                  ) : null}
                </section>

                {/* Shop by Category Section */}
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
                    {isCategoriesLoading ? (
                      <div className="-mx-4 sm:-mx-6 md:-mx-8 pl-4 sm:pl-6 md:pl-8 flex items-center gap-3 overflow-hidden py-1">
                        {[1, 2, 3, 4, 5, 6].map((i) => (
                          <div
                            key={i}
                            className="flex flex-col items-center justify-start p-2.5 pt-3 gap-2 shrink-0 bg-[#f5f1ea] rounded-[14px] min-w-[94px] max-w-[104px] h-[108px]"
                          >
                            <div className="size-[44px] rounded-full animate-shimmer shrink-0" />
                            <div className="w-[60px] h-[10px] rounded animate-shimmer mt-0.5" />
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="-mx-4 sm:-mx-6 md:-mx-8 pl-4 sm:pl-6 md:pl-8 pr-0 flex items-center gap-3 overflow-x-auto no-scrollbar scroll-smooth py-1">
                        {categories
                          .filter((cat) => cat.id !== "all")
                          .map((cat) => (
                            <SearchCategoryCard key={cat.id} cat={cat} />
                          ))}
                        <div className="w-1 shrink-0 h-1" aria-hidden="true" />
                      </div>
                    )}
                  </div>
                </section>
              </div>
            )}

            {/* State 2: Live Search Suggestions (Matches Figma Node 738:255) */}
            {isState2 && (
              <div className="max-w-2xl mx-auto py-1">
                {isFetchingSuggestions && suggestions.length === 0 ? (
                  <div className="rounded-2xl bg-white border border-[#e7e2d8] shadow-sm overflow-hidden divide-y divide-[#f5f1ea]">
                    {[1, 2, 3, 4].map((i) => (
                      <div key={i} className="flex items-center gap-3.5 px-4 py-3">
                        <div className="w-12 h-12 rounded-xl animate-shimmer shrink-0" />
                        <div className="flex-1 flex flex-col gap-2">
                          <div className="h-3.5 w-3/4 rounded animate-shimmer" />
                          <div className="h-3 w-1/3 rounded animate-shimmer" />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : suggestions.length > 0 ? (
                  <div className="rounded-2xl bg-white border border-[#e7e2d8] shadow-sm overflow-hidden divide-y divide-[#f5f1ea]">
                    {suggestions.map((item) => (
                      <SuggestionItemCard key={item.id} item={item} />
                    ))}
                  </div>
                ) : debouncedQuery ? (
                  <div className="py-8 text-center text-text-muted text-sm">No suggestions found</div>
                ) : null}
              </div>
            )}
          </div>
        </div>
      )}

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

/**
 * Top LogoHeader component for Search Results (Matching Figma Node 738:296)
 */
function SearchLogoHeader({ onSearchClick }: { onSearchClick?: () => void }) {
  return (
    <header className="sticky top-0 z-50 w-full bg-white border-b border-[#e5e0da]/60">
      <div className="relative flex items-center justify-between px-4 sm:px-6 md:px-8 h-[56px] lg:h-[72px] max-w-7xl mx-auto w-full">
        {/* Logo — Centered on mobile, left-aligned on desktop */}
        <div className="absolute left-1/2 -translate-x-1/2 flex items-center justify-center lg:static lg:translate-x-0">
          <ClientLink href="/" className="flex shrink-0 items-center">
            <Image
              src={assets.logo}
              alt="GemoStone logo"
              width={162}
              height={41}
              className="h-[34px] w-auto object-contain md:h-9 lg:h-10"
              priority
              unoptimized
            />
          </ClientLink>
        </div>

        {/* Desktop Nav Items */}
        <nav
          aria-label="Main navigation"
          className="hidden flex-1 items-center justify-center gap-8 lg:flex xl:gap-12"
        >
          {navItems.map((item) => (
            <ClientLink
              key={item.id}
              href={item.href}
              className={`flex flex-col items-center justify-center gap-1.5 transition-colors ${
                item.id === "shop" ? "text-primary-orange" : "text-text-primary hover:text-primary-orange"
              }`}
            >
              <div className="relative flex items-center justify-center">
                <NavIcon id={item.id} className="h-6 w-6 xl:h-[26px] xl:w-[26px]" />
              </div>
              <span className="text-[12px] font-semibold leading-none">{item.label}</span>
            </ClientLink>
          ))}
        </nav>

        {/* Right Actions */}
        <div className="ml-auto flex items-center gap-4 md:gap-6 relative">
          <button
            type="button"
            onClick={onSearchClick}
            aria-label="Search"
            className="text-text-primary transition-colors hover:text-primary-orange cursor-pointer"
          >
            <NavIcon id="search" className="h-[22px] w-[22px] md:h-6 md:w-6 xl:h-[26px] xl:w-[26px]" />
          </button>

          <CartButton iconClassName="h-[22px] w-[22px] md:h-6 md:w-6 xl:h-[26px] xl:w-[26px]" />
        </div>
      </div>
    </header>
  );
}

/**
 * Bottom Navigation for Search Results (Matching Figma Node 1261:10915)
 */
function SearchBottomNav() {
  const wishlistIds = useWishlistStore((state) => state.wishlistIds);
  const wishlistCount = wishlistIds.length;

  return (
    <nav
      aria-label="Bottom navigation"
      className="fixed inset-x-0 bottom-0 z-[100] w-full bg-white border-t border-[#e5e0da] lg:hidden"
      style={{
        bottom: 0,
        paddingBottom: "max(env(safe-area-inset-bottom, 0px), 0px)",
        boxShadow: "0 -2px 10px rgba(0,0,0,0.05), 0 50px 0 50px #ffffff",
      }}
    >
      <div className="absolute inset-x-0 top-0 -bottom-40 bg-white -z-10 pointer-events-none" aria-hidden="true" />
      <div className="relative mx-auto flex max-w-lg items-center justify-between px-6 pt-2.5 pb-1">
        {navItems.map((item) => {
          const active = item.id === "shop";
          return (
            <ClientLink
              key={item.id}
              href={item.href}
              aria-label={item.label}
              aria-current={active ? "page" : undefined}
              className={`flex flex-col items-center justify-center gap-1 min-w-[64px] transition-colors cursor-pointer ${
                active ? "text-[#ff5400] font-medium" : "text-[#211e1a] font-medium hover:text-[#ff5400]"
              }`}
            >
              <div className="relative flex items-center justify-center">
                <NavIcon id={item.id} className="size-[20px]" />
                {item.id === "wishlist" && wishlistCount > 0 && (
                  <span className="absolute -top-1.5 -right-2 flex h-4 w-4 items-center justify-center rounded-full bg-[#ff5400] text-[10px] font-bold text-white shadow-sm">
                    {wishlistCount}
                  </span>
                )}
              </div>
              <span className="text-[11px] leading-normal">{item.label}</span>
            </ClientLink>
          );
        })}
      </div>
    </nav>
  );
}

/**
 * Shop By Category Card with shimmer image and text animation
 */
function SearchCategoryCard({ cat }: { cat: CategoryConfig }) {
  const [imageLoaded, setImageLoaded] = useState(false);

  return (
    <ClientLink
      href={`/collection/${cat.id}`}
      className="flex flex-col items-center justify-start p-2.5 pt-3 gap-2 shrink-0 group bg-[#f5f1ea] rounded-[14px] min-w-[94px] max-w-[104px] h-[108px] border border-transparent hover:border-primary-orange hover:shadow-xs transition-all duration-200"
    >
      <div className="relative size-[44px] rounded-full overflow-hidden shadow-xs flex items-center justify-center bg-[#ede8e1] shrink-0">
        {!imageLoaded && cat.icon && (
          <div className="absolute inset-0 size-full animate-shimmer rounded-full z-0" />
        )}
        {cat.icon ? (
          <Image
            src={cat.icon}
            alt={cat.label}
            width={44}
            height={44}
            className={`w-full h-full object-cover relative z-10 transition-opacity duration-300 ${
              imageLoaded ? "opacity-100" : "opacity-0"
            }`}
            onLoad={() => setImageLoaded(true)}
            unoptimized
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-[#f87171] to-[#fb923c] opacity-80" />
        )}
      </div>
      <span className="text-[11px] sm:text-[12px] font-medium text-[#211e1a] group-hover:text-primary-orange transition-colors text-center leading-[14px] line-clamp-2 w-full break-words">
        {cat.label}
      </span>
    </ClientLink>
  );
}

/**
 * Search Suggestion Item with shimmer image animation
 */
function SuggestionItemCard({ item }: { item: Product }) {
  const [imageLoaded, setImageLoaded] = useState(false);

  return (
    <ClientLink
      href={`/product/${item.slug}`}
      className="flex items-center gap-3.5 px-4 py-3 hover:bg-surface-subtle transition-colors group cursor-pointer"
    >
      <div className="w-12 h-12 rounded-xl overflow-hidden bg-[#ede8e1] shrink-0 relative border border-border-strong/50">
        {!imageLoaded && item.imageUrl && (
          <div className="absolute inset-0 size-full animate-shimmer rounded-xl z-0" />
        )}
        {item.imageUrl ? (
          <Image
            src={item.imageUrl}
            alt={item.name}
            fill
            className={`object-cover relative z-10 transition-opacity duration-300 ${
              imageLoaded ? "opacity-100" : "opacity-0"
            }`}
            onLoad={() => setImageLoaded(true)}
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
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M5 12h14M12 5l7 7-7 7" />
        </svg>
      </div>
    </ClientLink>
  );
}

