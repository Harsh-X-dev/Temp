"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useWishlistStore } from "@/store/wishlist.store";
import { useCartStore } from "@/store/cart.store";
import { createSupabaseBrowserClient } from "@/services/supabase/client";
import { toast } from "@/lib/toast";
import VariantSelectionModal from "@/components/ui/overlays/VariantSelectionModal";
import { ProductVariant, Product } from "@/types/shared.types";
import { useHasMounted } from "@/hooks/useHasMounted";

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function isUUID(id: string) {
  return UUID_RE.test(id);
}

// Icons as basic SVGs
const ArrowLeftIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M19 12H5M12 19l-7-7 7-7" />
  </svg>
);

const TrashIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#a89a85" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2M10 11v6M14 11v6" />
  </svg>
);


function WishlistSkeleton() {
  return (
    <div className="flex flex-col w-full px-[16px] md:px-0 gap-6 pt-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="flex gap-3 w-full animate-pulse">
          <div className="w-[100px] h-[100px] bg-border-strong rounded-[12px] shrink-0" />
          <div className="flex flex-col flex-1 py-1 gap-2">
            <div className="h-4 bg-border-strong rounded w-3/4" />
            <div className="h-3 bg-border-strong rounded w-1/4 mt-auto" />
            <div className="flex items-center justify-between mt-auto">
              <div className="h-4 bg-border-strong rounded w-16" />
              <div className="h-7 bg-border-strong rounded-[20px] w-20" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function WishlistEmpty() {
  return (
    <div className="flex flex-col items-center justify-center flex-1 px-[16px] md:px-0 py-20 pb-32 text-center">
      <div className="w-16 h-16 mb-4 text-text-muted">
        <svg fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
        </svg>
      </div>
      <p className="text-[15px] font-semibold text-text-primary">Your wishlist is empty</p>
      <p className="mt-2 text-[13px] text-text-muted">Save items you love and come back to them anytime.</p>
      <Link href="/collection/all" className="mt-6 inline-flex items-center rounded-[20px] bg-primary-orange px-6 py-2.5 text-[13px] font-medium text-white transition-colors active:scale-[0.98]">
        Browse products
      </Link>
    </div>
  );
}

type Status = "pending" | "loading" | "done";

type WishlistImageRow = {
  url: string;
  position: number;
};

type WishlistVariantRow = {
  id: string;
  sku: string;
  option1_value: string | null;
  option2_value?: string | null;
  option3_value?: string | null;
  price: number;
  compare_at_price: number | null;
  is_active: boolean;
};

type WishlistProductRow = {
  id: string;
  title: string;
  slug: string;
  is_energized: boolean;
  options?: any[] | null;
  product_images?: WishlistImageRow[] | null;
  product_variants?: WishlistVariantRow[] | null;
};

type ProcessedProduct = {
  id: string;
  href: string;
  name: string;
  currentPrice: number;
  originalPrice: number | null;
  imageUrl: string;
  isCertified: boolean;
  category: string;
  variantId: string;
  variantSku: string;
  variantLabel: string;
  options?: any[];
  variants: ProductVariant[];
};

/**
 * Converts a raw Supabase products row into the display shape used by this page.
 * Extracted so it is reused between the initial-load path and the incremental-fetch
 * path (when a new product ID is added to the wishlist while already on this page).
 */
function processRow(row: WishlistProductRow): ProcessedProduct {
  const images = row.product_images ?? [];
  const variants = row.product_variants ?? [];
  const sortedImages = [...images].sort((a, b) => a.position - b.position);
  const activeVariants = variants.filter((v) => v.is_active);
  const cheapest = [...activeVariants].sort((a, b) => a.price - b.price)[0];

  const mappedVariants = activeVariants.map((v) => {
    const parts = [v.option1_value, v.option2_value, v.option3_value].filter(
      (val): val is string => Boolean(val && val !== "Default")
    );
    const label = parts.length > 0 ? parts.join(", ") : "One size";

    return {
      id: v.id,
      sku: v.sku,
      label,
      option1Value: v.option1_value,
      option2Value: v.option2_value || null,
      option3Value: v.option3_value || null,
      price: v.price,
      compareAtPrice: v.compare_at_price,
      isActive: v.is_active,
    };
  });

  // Construct options
  let options = row.options || [];
  if (!options || options.length === 0) {
    const o1Values = Array.from(new Set(mappedVariants.map((v) => v.option1Value).filter((v): v is string => Boolean(v && v !== "Default"))));
    const o2Values = Array.from(new Set(mappedVariants.map((v) => v.option2Value).filter((v): v is string => Boolean(v && v !== "Default"))));
    const o3Values = Array.from(new Set(mappedVariants.map((v) => v.option3Value).filter((v): v is string => Boolean(v && v !== "Default"))));

    options = [];
    if (o1Values.length > 0) options.push({ id: "opt_1", name: "Size", position: 1, values: o1Values });
    if (o2Values.length > 0) options.push({ id: "opt_2", name: "Quality", position: 2, values: o2Values });
    if (o3Values.length > 0) options.push({ id: "opt_3", name: "Material", position: 3, values: o3Values });
  } else {
    options = options.map((opt: any, index: number) => {
      const optionKey = `option${index + 1}Value` as keyof typeof mappedVariants[0];
      const uniqueVals = Array.from(new Set(mappedVariants.map((v) => v[optionKey]).filter((v): v is string => Boolean(v && v !== "Default"))));
      return {
        ...opt,
        values: opt.values && opt.values.length > 0 ? opt.values : uniqueVals,
      };
    });
  }

  return {
    id: row.id,
    href: `/product/${row.slug || row.id}`,
    name: row.title,
    currentPrice: cheapest ? cheapest.price : 0,
    originalPrice: cheapest?.compare_at_price || null,
    imageUrl: sortedImages[0]?.url ?? "",
    isCertified: row.is_energized,
    category: row.slug,
    variantId: cheapest?.id ?? "",
    variantSku: cheapest?.sku ?? "",
    variantLabel: cheapest?.option1_value ?? "",
    options,
    variants: mappedVariants,
  };
}

/**
 * Application-level product cache — lives for the entire JS session.
 *
 * Survives client-side navigation (the module is not re-evaluated between routes).
 * Resets on a full browser refresh (JS restarts, the module re-evaluates).
 *
 * Key:   product id (UUID)
 * Value: ProcessedProduct ready for the Wishlist UI
 *
 * Products are added here on first fetch and never removed from the cache,
 * because the cache represents "product info we have seen this session."
 * Wishlist membership is determined separately by wishlistIds in Zustand.
 */
const wishlistProductCache = new Map<string, ProcessedProduct>();

export default function WishlistPage() {
  const router = useRouter();
  // StoreRehydrator (root layout) is the single intentional hydration point.
  // It runs before this component because it's a sibling rendered earlier in
  // the tree, so wishlistIds are already populated by the time `hydrated`
  // flips true — this only gates on hydration, it does NOT re-trigger it.
  const hydrated = useHasMounted();
  const [status, setStatus] = useState<Status>("pending");
  const [wishlistProducts, setWishlistProducts] = useState<ProcessedProduct[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<ProcessedProduct | null>(null);
  const { wishlistIds, removeFromWishlist, clearWishlist } = useWishlistStore();
  const addToCart = useCartStore((state) => state.addToCart);

  const staleRef = useRef(false);


  useEffect(() => {
    if (!hydrated) return;

    staleRef.current = false;
    const validIds = wishlistIds.filter(isUUID);

    // ── Case 1: wishlist is now empty ──────────────────────────────────────
    if (validIds.length === 0) {
      setStatus("done");
      setWishlistProducts([]);
      return;
    }

    // ── Case 2: determine which IDs we don't have product data for yet ─────
    const missingIds = validIds.filter((id) => !wishlistProductCache.has(id));

    if (missingIds.length === 0) {
      // Every product is already in the cache (e.g. user just removed an item,
      // or is revisiting the page after navigating away).
      // Filter the display list in place — no Supabase request, no skeleton.
      setWishlistProducts(
        validIds
          .map((id) => wishlistProductCache.get(id))
          .filter((p): p is ProcessedProduct => p !== undefined),
      );
      setStatus("done");
      return;
    }

    // ── Case 3: fetch only the missing products ────────────────────────────
    // This covers the initial load (all IDs missing) and the addition case
    // (one new ID added while the rest are already cached).
    setStatus("loading");

    const fetchMissing = async () => {
      try {
        const { data, error } = await createSupabaseBrowserClient()
          .from("products")
          .select(
            `
            id,
            title,
            slug,
            is_energized,
            options,
            product_images ( url, position ),
            product_variants ( id, sku, option1_value, option2_value, option3_value, price, compare_at_price, is_active )
          `,
          )
          .in("id", missingIds); // Only the IDs we don't have yet

        if (staleRef.current) return;

        if (error) {
          console.error("[WishlistPage] Supabase error:", error.message);
        } else {
          // Populate the module-level cache with freshly fetched products.
          // This data survives navigation for the rest of the browser session.
          for (const row of (data ?? []) as WishlistProductRow[]) {
            wishlistProductCache.set(row.id, processRow(row));
          }
        }

        if (staleRef.current) return;

        // Build the display list from the module-level cache, preserving wishlist order.
        // Products absent from the catalog (deleted server-side) are simply omitted.
        setWishlistProducts(
          validIds
            .map((id) => wishlistProductCache.get(id))
            .filter((p): p is ProcessedProduct => p !== undefined),
        );
      } catch (err: unknown) {
        if (staleRef.current) return;
        console.error("[WishlistPage] Unexpected error:", err);
      } finally {
        if (!staleRef.current) setStatus("done");
      }
    };

    fetchMissing();

    return () => {
      staleRef.current = true;
    };
  }, [hydrated, wishlistIds]);

  const items = useCartStore((state) => state.items);
  const updateQuantity = useCartStore((state) => state.updateQuantity);
  const removeItem = useCartStore((state) => state.removeItem);

  const handleAddToCart = (product: ProcessedProduct) => {
    const activeVariants = product.variants?.filter((v) => v.isActive) || [];
    const hasRealVariants = activeVariants.length > 1 || (activeVariants.length === 1 && activeVariants[0].label !== "One size");

    if (hasRealVariants) {
      setSelectedProduct(product);
      return;
    }

    addVariantToCart(product, {
      id: product.variantId || "default",
      sku: product.variantSku || "default-sku",
      price: product.currentPrice,
      compareAtPrice: product.originalPrice,
      label: product.variantLabel || "Standard",
      isActive: true,
    });
  };

  const handleIncrement = (product: ProcessedProduct) => {
    const activeVariants = product.variants?.filter((v) => v.isActive) || [];
    const hasRealVariants = activeVariants.length > 1 || (activeVariants.length === 1 && activeVariants[0].label !== "One size");

    if (hasRealVariants) {
      setSelectedProduct(product);
    } else {
      const cartItem = items.find((i) => i.productId === product.id);
      if (cartItem) {
        updateQuantity(cartItem.key, cartItem.quantity + 1);
      }
    }
  };

  const handleDecrement = (product: ProcessedProduct) => {
    const cartItem = items.find((i) => i.productId === product.id);
    if (cartItem) {
      if (cartItem.quantity > 1) {
        updateQuantity(cartItem.key, cartItem.quantity - 1);
      } else {
        removeItem(cartItem.key);
        toast.info("Removed from Cart 🗑️", `${product.name} was removed from your cart.`);
      }
    }
  };

  const addVariantToCart = (product: ProcessedProduct, variant: ProductVariant) => {
    if (!variant.id) {
      toast.error("Product variant not found");
      return;
    }

    addToCart({
      productId: product.id,
      title: product.name,
      price: variant.price,
      compareAtPrice: variant.compareAtPrice,
      imageUrl: product.imageUrl,
      variantId: variant.id,
      variantSku: variant.sku,
      variantLabel: variant.label,
      quantity: 1,
    });

    setSelectedProduct(null);

    toast.success("Added to Cart 🛒", {
      description: `${product.name} has been added to your cart.`,
    });
  };

  const handleMoveAllToCart = () => {
    let addedCount = 0;
    wishlistProducts.forEach((product) => {
      const activeVariant =
        product.variants?.find((v) => v.isActive) ||
        product.variants?.[0] || {
          id: product.variantId || "default",
          sku: product.variantSku || "default-sku",
          price: product.currentPrice,
          compareAtPrice: product.originalPrice,
          label: product.variantLabel || "Standard",
        };

      if (activeVariant.id) {
        addToCart({
          productId: product.id,
          title: product.name,
          price: activeVariant.price,
          compareAtPrice: activeVariant.compareAtPrice,
          imageUrl: product.imageUrl,
          variantId: activeVariant.id,
          variantSku: activeVariant.sku,
          variantLabel: activeVariant.label,
          quantity: 1,
        });
        addedCount++;
      }
    });

    if (addedCount > 0) {
      clearWishlist();
      setWishlistProducts([]);
      toast.success("Moved all items to cart 🛒", {
        description: `Moved ${addedCount} ${addedCount === 1 ? "item" : "items"} to your cart.`,
      });
    }
  };

  const showSkeleton = status !== "done";
  const count = wishlistProducts.length;

  return (
    <div className="bg-[#fbf8f4] flex flex-col w-full max-w-7xl mx-auto md:px-8 flex-1 h-full pb-10">
      {/* Header Bar matching Figma node 737:53 */}
      <div className="bg-white border-b border-[#e5e0da] flex h-[56px] shrink-0 items-center justify-between px-6 md:px-0 w-full">
        <h1 className="font-bold text-[#211e1a] text-[18px]">Wishlist</h1>
      </div>

      {showSkeleton ? (
        <WishlistSkeleton />
      ) : count === 0 ? (
        <WishlistEmpty />
      ) : (
        <>
          {/* Move All Row matching Figma node 737:60 */}
          <div className="flex justify-end px-6 md:px-0 py-3 w-full shrink-0">
            <button
              onClick={handleMoveAllToCart}
              className="font-medium text-[#ff5400] text-[13px] hover:underline active:opacity-70 cursor-pointer"
            >
              Move all to cart
            </button>
          </div>

          {/* List items matching Figma node 737:62 */}
          <div className="flex flex-col w-full pb-6">
            {wishlistProducts.map((product, index) => (
              <div key={product.id} className="flex flex-col w-full bg-white md:bg-transparent">
                <div className="flex gap-3 px-6 md:px-0 py-3 w-full relative">
                  <Link href={product.href} className="relative rounded-[12px] shrink-0 size-[100px] overflow-hidden bg-[#f5f1ea]">
                    <Image
                      src={product.imageUrl || "/assets/images/placeholder.png"}
                      alt={product.name}
                      fill
                      className="object-cover rounded-[12px]"
                    />
                  </Link>
                  <div className="flex flex-col flex-1 min-w-0 justify-between py-0.5">
                    <div className="flex items-start justify-between w-full gap-2">
                      <Link href={product.href} className="font-medium text-[#211e1a] text-[13px] flex-1 leading-[20px] line-clamp-2">
                        {product.name}
                      </Link>
                      <button
                        onClick={() => {
                          removeFromWishlist(product.id);
                          toast.info("Removed from Wishlist 🗑️", `${product.name} has been removed from your wishlist.`);
                        }}
                        className="size-5 flex items-center justify-center shrink-0 -mt-0.5 -mr-1 text-[#a89a85] hover:text-red-500 transition-colors cursor-pointer"
                        aria-label="Remove item"
                      >
                        <TrashIcon />
                      </button>
                    </div>

                    <div className="flex items-center justify-between w-full mt-2">
                      <div className="flex gap-1.5 items-baseline whitespace-nowrap">
                        <span className="font-semibold text-[#211e1a] text-[15px]">
                          ₹{product.currentPrice.toLocaleString("en-IN")}
                        </span>
                        {product.originalPrice && product.originalPrice > product.currentPrice && (
                          <span className="font-normal text-[#a89a85] text-[12px] line-through">
                            ₹{product.originalPrice.toLocaleString("en-IN")}
                          </span>
                        )}
                      </div>

                      {(() => {
                        const cartItems = items.filter((i) => i.productId === product.id);
                        const totalQty = cartItems.reduce((sum, i) => sum + i.quantity, 0);

                        if (totalQty === 0) {
                          return (
                            <button
                              onClick={() => handleAddToCart(product)}
                              className="bg-[#ff5400] text-white px-3.5 py-1.5 rounded-full font-medium text-[12px] leading-none whitespace-nowrap hover:bg-[#e04d00] active:scale-[0.98] transition-all cursor-pointer"
                            >
                              Add to Cart
                            </button>
                          );
                        }

                        return (
                          <div className="bg-white border-[#ff5400] border-[1.5px] border-solid flex h-[30px] items-center justify-between px-2.5 rounded-full gap-2 transition-colors">
                            <button
                              type="button"
                              onClick={() => handleDecrement(product)}
                              className="text-[#ff5400] text-[16px] font-bold size-5 flex items-center justify-center hover:bg-[#ff5400]/10 rounded-full transition-colors cursor-pointer select-none pb-0.5"
                            >
                              -
                            </button>
                            <span className="font-semibold text-[#ff5400] text-[13px] select-none min-w-[12px] text-center">
                              {totalQty}
                            </span>
                            <button
                              type="button"
                              onClick={() => handleIncrement(product)}
                              className="text-[#ff5400] text-[16px] font-bold size-5 flex items-center justify-center hover:bg-[#ff5400]/10 rounded-full transition-colors cursor-pointer select-none pb-0.5"
                            >
                              +
                            </button>
                          </div>
                        );
                      })()}
                    </div>
                  </div>
                </div>
                {index < wishlistProducts.length - 1 && (
                  <div className="h-px bg-[#e5e0da] w-full" />
                )}
              </div>
            ))}
          </div>
        </>
      )}

      {/* Variant Selection Modal */}
      {selectedProduct && (
        <VariantSelectionModal
          isOpen={!!selectedProduct}
          onClose={() => setSelectedProduct(null)}
          product={
            {
              id: selectedProduct.id,
              name: selectedProduct.name,
              imageUrl: selectedProduct.imageUrl,
              price: `₹${selectedProduct.currentPrice.toLocaleString("en-IN")}`,
              mrp: selectedProduct.originalPrice ? `₹${selectedProduct.originalPrice.toLocaleString("en-IN")}` : undefined,
              options: selectedProduct.options,
              variants: selectedProduct.variants,
            } as Product
          }
          onSelectVariant={(variant) => addVariantToCart(selectedProduct, variant)}
          actionTitle="Select Options"
          ctaText="Add to Cart"
        />
      )}
    </div>
  );
}
