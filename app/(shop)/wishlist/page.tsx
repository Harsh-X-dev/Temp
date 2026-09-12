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
    <div className="flex flex-col w-full flex-1 min-h-[50vh] items-center justify-center py-24">
      <div className="flex flex-col items-center justify-center gap-3">
        <div className="flex items-center gap-2">
          <span className="size-2 sm:size-2.5 rounded-full bg-[#D5CFC5] animate-bounce [animation-delay:-0.3s]" />
          <span className="size-2 sm:size-2.5 rounded-full bg-[#D5CFC5] animate-bounce [animation-delay:-0.15s]" />
          <span className="size-2 sm:size-2.5 rounded-full bg-[#D5CFC5] animate-bounce" />
        </div>
        <div className="h-2 w-14 sm:w-16 rounded-full bg-[#EAE3D8] animate-pulse" />
      </div>
    </div>
  );
}

function WishlistEmpty() {
  return (
    <div className="flex flex-col items-center justify-center flex-1 px-4 py-20 pb-32 text-center max-w-7xl mx-auto">
      <div className="w-16 h-16 mb-4 text-[#A8A29E]">
        <svg fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
        </svg>
      </div>
      <p className="text-[16px] font-bold text-[#211E1A]">Your wishlist is empty</p>
      <p className="mt-1.5 text-[13px] text-[#8C847E]">Save items you love and come back to them anytime.</p>
      <Link href="/collection/all" className="mt-6 inline-flex items-center rounded-full bg-primary-orange px-6 py-2.5 text-[13px] font-semibold text-white transition-all hover:bg-primary-orange-hover active:scale-[0.98] shadow-sm">
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
  inventory_quantity?: number | null;
  low_stock_threshold?: number | null;
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
  inventoryQuantity: number | null;
  lowStockThreshold: number | null;
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
      inventoryQuantity: v.inventory_quantity ?? 0,
      lowStockThreshold: v.low_stock_threshold ?? 5,
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
    inventoryQuantity: cheapest?.inventory_quantity ?? null,
    lowStockThreshold: cheapest?.low_stock_threshold ?? 5,
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
            product_variants ( id, sku, option1_value, option2_value, option3_value, price, compare_at_price, inventory_quantity, low_stock_threshold, is_active )
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
    <div className="bg-[#FAF5EF] flex flex-col w-full flex-1 min-h-[100dvh] pb-24">
      {/* Title & Move all to cart header row */}
      <div className="flex items-center justify-between px-4 sm:px-6 pt-3 pb-2 w-full max-w-7xl mx-auto">
        <h1 className="font-bold text-[#211E1A] text-[19px] sm:text-[20px] tracking-tight">Wishlist</h1>
        {count > 0 && !showSkeleton && (
          <button
            onClick={handleMoveAllToCart}
            className="font-semibold text-primary-orange text-[13px] hover:underline active:opacity-70 cursor-pointer"
          >
            Move all to cart
          </button>
        )}
      </div>

      {showSkeleton ? (
        <WishlistSkeleton />
      ) : count === 0 ? (
        <WishlistEmpty />
      ) : (
        <div className="flex flex-col w-full max-w-7xl mx-auto px-4 sm:px-6 divide-y divide-[#EAE3D8] pb-6">
          {wishlistProducts.map((product) => (
            <div key={product.id} className="py-3.5 flex gap-3.5 w-full">
              {/* Product Thumbnail */}
              <Link
                href={product.href}
                className="relative rounded-[14px] shrink-0 size-[84px] sm:size-[92px] overflow-hidden bg-[#F5EFEB] border border-[#EAE3D8]/60 shadow-xs"
              >
                <Image
                  src={product.imageUrl || "/assets/images/placeholder.png"}
                  alt={product.name}
                  fill
                  className="object-cover rounded-[14px]"
                />
              </Link>

              {/* Product Details */}
              <div className="flex flex-col flex-1 min-w-0 justify-between py-0.5">
                {/* Title & Trash Button */}
                <div className="flex items-start justify-between w-full gap-2">
                  <Link
                    href={product.href}
                    className="font-semibold text-[#211E1A] text-[13.5px] sm:text-[14px] flex-1 leading-snug line-clamp-1 hover:text-primary-orange transition-colors"
                  >
                    {product.name}
                  </Link>
                  <button
                    onClick={() => {
                      removeFromWishlist(product.id);
                      toast.info("Removed from Wishlist 🗑️", `${product.name} has been removed from your wishlist.`);
                    }}
                    className="size-6 flex items-center justify-center shrink-0 -mt-0.5 text-[#A8A29E] hover:text-red-500 transition-colors cursor-pointer"
                    aria-label="Remove item"
                  >
                    <TrashIcon />
                  </button>
                </div>

                {/* Stock Badge - position below title per Figma */}
                {product.inventoryQuantity !== null && product.inventoryQuantity > 0 && product.inventoryQuantity <= (product.lowStockThreshold ?? 5) && (
                  <div className="mt-0.5">
                    <span className="inline-flex items-center px-2 py-0.5 rounded-[6px] text-[10.5px] sm:text-[11px] font-semibold bg-[#FFF5ED] text-primary-orange border border-[#FED7AA]/70">
                      Only {product.inventoryQuantity} left
                    </span>
                  </div>
                )}

                {/* Price and Add to Cart Button */}
                <div className="flex items-center justify-between w-full mt-1.5 sm:mt-2">
                  <div className="flex gap-1.5 items-baseline whitespace-nowrap">
                    <span className="font-bold text-[#211E1A] text-[14.5px] sm:text-[15px]">
                      ₹{product.currentPrice.toLocaleString("en-IN")}
                    </span>
                    {product.originalPrice && product.originalPrice > product.currentPrice && (
                      <span className="font-normal text-[#A8A29E] text-[12px] line-through">
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
                          className="bg-primary-orange text-white px-3.5 py-1.5 rounded-full font-semibold text-[12px] leading-none whitespace-nowrap hover:bg-primary-orange-hover active:scale-[0.98] transition-all shadow-xs cursor-pointer"
                        >
                          Add to Cart
                        </button>
                      );
                    }

                    return (
                      <div className="bg-white border-primary-orange border-[1.5px] border-solid flex h-[28px] sm:h-[30px] items-center justify-between px-2.5 rounded-full gap-2 transition-colors">
                        <button
                          type="button"
                          onClick={() => handleDecrement(product)}
                          className="text-primary-orange text-[15px] font-bold size-5 flex items-center justify-center hover:bg-primary-orange/10 rounded-full transition-colors cursor-pointer select-none pb-0.5"
                        >
                          -
                        </button>
                        <span className="font-semibold text-primary-orange text-[12.5px] select-none min-w-[12px] text-center">
                          {totalQty}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleIncrement(product)}
                          className="text-primary-orange text-[15px] font-bold size-5 flex items-center justify-center hover:bg-primary-orange/10 rounded-full transition-colors cursor-pointer select-none pb-0.5"
                        >
                          +
                        </button>
                      </div>
                    );
                  })()}
                </div>
              </div>
            </div>
          ))}
        </div>
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
