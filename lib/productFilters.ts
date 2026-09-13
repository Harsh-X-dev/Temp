import type { Product } from "@/types/shared.types";

/**
 * Extracts word stems and common variations (singular/plural forms) for robust search & filter matching.
 * e.g. "pendants" -> ["pendants", "pendant"]
 *      "rings" -> ["rings", "ring"]
 *      "gemstones" -> ["gemstones", "gemstone"]
 *      "accessories" -> ["accessories", "accessory"]
 */
export function getWordStems(word: string): string[] {
  const clean = word.toLowerCase().replace(/[^a-z0-9]/g, "");
  if (!clean || clean.length < 2) return [];
  const stems = [clean];

  if (clean.endsWith("ies") && clean.length > 4) {
    stems.push(clean.slice(0, -3) + "y");
  } else if (clean.endsWith("es") && clean.length > 3) {
    stems.push(clean.slice(0, -2));
  } else if (clean.endsWith("s") && clean.length > 2) {
    stems.push(clean.slice(0, -1));
  }

  return stems;
}

/**
 * Checks if a product matches any of the selected type/category filters (e.g. "Rings & Pendants", "Emerald", "Rudraksha").
 */
export function matchesTypeFilter(typeFilters: string[], product: Product): boolean {
  if (!typeFilters || typeFilters.length === 0) return true;

  const attrGem = String(product.attributes?.gemstone || product.attributes?.gemstone_type || "").toLowerCase().trim();
  const attrCat = String(product.attributes?.category || product.attributes?.product_type || "").toLowerCase().trim();

  const productCollectionStrings = (product.collections || []).map((c) => c.toLowerCase().trim()).filter(Boolean);
  const productTags = (product.tags || []).map((t) => t.toLowerCase().trim());
  const variantLabels = (product.variants || [])
    .map((v) => `${v.option1Value || ""} ${v.option2Value || ""} ${v.label || ""}`)
    .join(" ")
    .toLowerCase();

  const allProductText = [
    product.name,
    product.slug,
    ...productTags,
    ...productCollectionStrings,
    variantLabels,
    attrGem,
    attrCat,
  ].join(" ").toLowerCase();

  const productWords = allProductText
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter((w) => w.length >= 2);
  const productStems = new Set(productWords.flatMap(getWordStems));

  return typeFilters.some((rawType) => {
    const type = rawType.toLowerCase().trim();
    if (!type) return false;

    // 1. Direct collection check (exact collection or singular/plural match only)
    if (productCollectionStrings.some((c) => {
      const cleanC = c.toLowerCase().trim();
      return cleanC === type || cleanC === type.replace(/s$/, "") || type === cleanC.replace(/s$/, "");
    })) {
      return true;
    }

    // 2. Direct attribute check
    if (attrGem && (attrGem === type || attrGem === type.replace(/s$/, "") || type === attrGem.replace(/s$/, ""))) return true;
    if (attrCat && (attrCat === type || attrCat === type.replace(/s$/, "") || type === attrCat.replace(/s$/, ""))) return true;

    // 3. Match by word stems (e.g. "Rudraksha Bracelet" -> must have both "rudraksha" and "bracelet" stems)
    const filterWords = type
      .replace(/[&/\\(),+]/g, " ")
      .split(/\s+/)
      .filter((w) => w.length >= 2 && w !== "and" && w !== "the" && w !== "for");

    if (filterWords.length === 0) return false;

    // For multi-word type filters like "Rudraksha Bracelet" or "Rudraksha Mala", each word must match
    return filterWords.every((word) => {
      const stems = getWordStems(word);
      return stems.some((stem) => productStems.has(stem));
    });
  });
}

/**
 * Checks if a product matches any of the selected Mukhi filters (e.g. "5 Mukhi", "7 Mukhi", "Gauri Shankar").
 */
export function matchesMukhiFilter(mukhiFilters: string[], product: Product): boolean {
  if (!mukhiFilters || mukhiFilters.length === 0) return true;

  const attrMukhi = String(product.attributes?.mukhi || "").toLowerCase();
  const textToMatch = `${product.name} ${product.slug} ${(product.tags || []).join(" ")}`.toLowerCase();
  const variantValues = (product.variants || [])
    .map((v) => `${v.option1Value || ""} ${v.option2Value || ""} ${v.option3Value || ""} ${v.label || ""}`)
    .join(" ")
    .toLowerCase();

  // If filter is general "all_mukhi" or "mukhi_series"
  if (
    mukhiFilters.some(
      (m) =>
        m.toLowerCase() === "all_mukhi" ||
        m.toLowerCase() === "all" ||
        m.toLowerCase() === "mukhi" ||
        m.toLowerCase() === "mukhi-series" ||
        m.toLowerCase() === "mukhi_series"
    )
  ) {
    return Boolean(
      attrMukhi ||
      textToMatch.includes("mukhi") ||
      variantValues.includes("mukhi")
    );
  }

  return mukhiFilters.some((rawMukhi) => {
    const m = rawMukhi.toLowerCase().trim();
    if (!m) return false;

    if (attrMukhi && (attrMukhi.includes(m) || m.includes(attrMukhi))) return true;
    if (textToMatch.includes(m)) return true;
    if (variantValues.includes(m)) return true;

    // Also match the number if formatted like "5 Mukhi"
    const numMatch = m.match(/\d+/);
    if (numMatch) {
      const numPattern = new RegExp(`\\b${numMatch[0]}\\s*mukhi\\b`, "i");
      if (numPattern.test(attrMukhi) || numPattern.test(textToMatch) || numPattern.test(variantValues)) {
        return true;
      }
    }

    return false;
  });
}

/**
 * Checks if a product matches any of the selected Origin filters (e.g. "Nepal", "Indonesia", "India").
 */
export function matchesOriginFilter(originFilters: string[], product: Product): boolean {
  if (!originFilters || originFilters.length === 0) return true;

  const attrOrigin = String(product.attributes?.origin || "").toLowerCase();
  const textToMatch = `${product.name} ${product.slug} ${(product.tags || []).join(" ")}`.toLowerCase();
  const variantValues = (product.variants || [])
    .map((v) => `${v.option1Value || ""} ${v.option2Value || ""} ${v.option3Value || ""} ${v.label || ""}`)
    .join(" ")
    .toLowerCase();

  return originFilters.some((rawOrigin) => {
    const o = rawOrigin.toLowerCase().trim();
    if (!o) return false;

    if (attrOrigin && (attrOrigin.includes(o) || o.includes(attrOrigin))) return true;
    if (textToMatch.includes(o)) return true;
    if (variantValues.includes(o)) return true;

    return false;
  });
}
