"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useCartStore } from "@/store/cart.store";
import { useWishlistStore } from "@/store/wishlist.store";
import { useCheckoutStore } from "@/store/checkout.store";
import { toast } from "@/lib/toast";
import VariantSelectionModal from "@/components/ui/overlays/VariantSelectionModal";
import { BaseProductComponentProps } from "@/types/product.types";
import { ProductVariant } from "@/types/shared.types";

export default function ProductFooter({ product, variant }: BaseProductComponentProps) {
  const router = useRouter();
  const addToCart = useCartStore((state) => state.addToCart);
  const items = useCartStore((state) => state.items);
  const updateQuantity = useCartStore((state) => state.updateQuantity);
  const removeItem = useCartStore((state) => state.removeItem);
  const startBuyNow = useCheckoutStore((state) => state.startBuyNow);
  const { removeFromWishlist } = useWishlistStore();
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalAction, setModalAction] = useState<"cart" | "buyNow">("cart");

  if (variant !== "wishlist") return null;

  const parsePrice = (price: string | number | null | undefined): number | null => {
    if (price == null) return null;
    if (typeof price === 'number') return price;
    const parsed = parseInt(price.replace(/[^0-9]/g, ''), 10);
    return isNaN(parsed) ? 0 : parsed;
  };

  const executeAction = (
    actionType: "cart" | "buyNow", 
    variantIdToUse: string, 
    variantSkuToUse: string, 
    variantLabelToUse: string, 
    priceToUse: number, 
    compareAtPriceToUse: number | null
  ) => {
    if (actionType === "cart") {
      addToCart({
        productId: product.id,
        title: product.name,
        price: priceToUse,
        compareAtPrice: compareAtPriceToUse,
        imageUrl: product.imageUrl,
        variantId: variantIdToUse,
        variantSku: variantSkuToUse,
        variantLabel: variantLabelToUse,
        quantity: 1,
      });
      toast.success("Added to Cart 🛒", `${product.name} has been added to your cart.`);
    } else {
      startBuyNow({
        productId: product.id,
        title: product.name,
        price: priceToUse,
        compareAtPrice: compareAtPriceToUse,
        imageUrl: product.imageUrl,
        variantId: variantIdToUse,
        variantLabel: variantLabelToUse,
        quantity: 1,
      });
      const slug = product.category || (product.href ? product.href.replace('/product/', '').replace(/^\//, '') : product.id);
      router.push(`/cart?product=${encodeURIComponent(slug)}&variant=${encodeURIComponent(variantIdToUse)}&qty=1`);
    }
  };

  const handleAction = (e: React.MouseEvent, actionType: "cart" | "buyNow") => {
    e.preventDefault();
    e.stopPropagation();

    const activeVariants = product.variants?.filter(v => v.isActive) || [];
    const hasRealVariants = activeVariants.length > 1 || (activeVariants.length === 1 && activeVariants[0].label !== 'One size');
    
    if (hasRealVariants) {
      setModalAction(actionType);
      setIsModalOpen(true);
      return;
    }

    executeAction(
      actionType,
      product.defaultVariantId || "",
      product.defaultVariantSku || "default-sku",
      product.defaultVariantLabel || "Standard",
      parsePrice(product.currentPrice) || 0,
      parsePrice(product.originalPrice)
    );
  };

  const handleVariantSelect = (selectedVariant: ProductVariant) => {
    setIsModalOpen(false);
    executeAction(
      modalAction,
      selectedVariant.id,
      selectedVariant.sku,
      selectedVariant.label,
      selectedVariant.price,
      selectedVariant.compareAtPrice
    );
  };

  const handleRemove = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    removeFromWishlist(product.id);
    toast.info("Removed from Wishlist", `${product.name} has been removed from your wishlist.`);
  };

  const cartItemsForProduct = items.filter((item) => item.productId === product.id);
  const totalQuantity = cartItemsForProduct.reduce((sum, item) => sum + item.quantity, 0);

  const handleIncrement = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    const activeVariants = product.variants?.filter(v => v.isActive) || [];
    const hasRealVariants = activeVariants.length > 1 || (activeVariants.length === 1 && activeVariants[0].label !== 'One size');
    
    if (hasRealVariants) {
      setModalAction("cart");
      setIsModalOpen(true);
    } else {
      if (cartItemsForProduct.length > 0) {
        const item = cartItemsForProduct[0];
        updateQuantity(item.key, item.quantity + 1);
      }
    }
  };

  const handleDecrement = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (cartItemsForProduct.length > 0) {
      const item = cartItemsForProduct[0];
      if (item.quantity > 1) {
        updateQuantity(item.key, item.quantity - 1);
      } else {
        removeItem(item.key);
        toast.info("Removed from Cart 🗑️", `${product.name} was removed from your cart.`);
      }
    }
  };

  const renderCartButton = (className: string) => {
    if (totalQuantity === 0) {
      return (
        <button
          type="button"
          onClick={(e) => handleAction(e, "cart")}
          disabled={product.inStock === false}
          className={className}
        >
          Add to Cart
        </button>
      );
    }

    return (
      <div className="bg-white border-primary-orange border-[1.5px] border-solid flex w-full h-[32px] md:h-[38px] items-center justify-between px-3 md:px-4 rounded-full transition-colors z-20 pointer-events-auto">
        <button type="button" onClick={handleDecrement} className="text-primary-orange text-[16px] md:text-[20px] font-bold w-6 h-6 md:w-7 md:h-7 flex items-center justify-center hover:bg-primary-orange/10 rounded-full transition-colors cursor-pointer select-none pb-0.5 md:pb-1">
          -
        </button>
        <span className="font-semibold text-primary-orange text-[13px] md:text-[15px] select-none">
          {totalQuantity}
        </span>
        <button type="button" onClick={handleIncrement} className="text-primary-orange text-[16px] md:text-[20px] font-bold w-6 h-6 md:w-7 md:h-7 flex items-center justify-center hover:bg-primary-orange/10 rounded-full transition-colors cursor-pointer select-none pb-0.5 md:pb-1">
          +
        </button>
      </div>
    );
  };

  if (variant === "wishlist") {
    return (
      <div className="mt-3 flex flex-col gap-2 relative z-10">
        {renderCartButton("w-full rounded-full bg-primary-orange py-2 text-xs font-semibold text-white transition-all hover:bg-primary-orange-hover active:scale-[0.98] md:py-2.5 md:text-sm disabled:opacity-50 disabled:cursor-not-allowed")}
        <button
          type="button"
          onClick={handleRemove}
          className="w-full rounded-full border border-border-strong bg-white py-2 text-xs font-medium text-text-secondary transition-colors hover:border-text-primary hover:text-text-primary active:scale-[0.98] md:text-sm"
        >
          Remove
        </button>
        <VariantSelectionModal 
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          product={product as any}
          onSelectVariant={handleVariantSelect}
          actionTitle="Select Options"
          ctaText={modalAction === "cart" ? "Add to Cart" : "Buy Now"}
        />
      </div>
    );
  }

  // Shopping / Default variant
  return (
    <>
      <div className="mt-3 flex flex-col gap-2 relative z-10 opacity-100 lg:opacity-0 lg:translate-y-2 lg:group-hover:opacity-100 lg:group-hover:translate-y-0 transition-all duration-300">
        {renderCartButton("w-full rounded-full py-2 text-xs font-semibold transition-all active:scale-[0.98] md:py-2.5 md:text-sm disabled:opacity-50 disabled:cursor-not-allowed bg-primary-orange text-white hover:bg-primary-orange-hover")}
        <button
          type="button"
          onClick={(e) => handleAction(e, "buyNow")}
          disabled={product.inStock === false}
          className="w-full rounded-full border border-primary-orange bg-white py-1.5 text-xs font-semibold text-primary-orange transition-colors hover:bg-[#fff5f0] hover:text-primary-orange active:scale-[0.98] md:py-2 md:text-sm disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
        >
          Buy Now
        </button>
      </div>
      <VariantSelectionModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        product={product as any}
        onSelectVariant={handleVariantSelect}
        actionTitle="Select Options"
        ctaText={modalAction === "cart" ? "Add to Cart" : "Buy Now"}
      />
    </>
  );
}
