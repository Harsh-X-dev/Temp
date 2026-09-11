"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useCartStore } from "@/store/cart.store";
import { toast } from "@/lib/toast";
import { IconStarFilled, IconStarOutline } from "@/components/productDetailPage/Icons";
import VariantSelectionModal from "@/components/ui/overlays/VariantSelectionModal";
import { logProductEngagementClick } from "@/services/search.client.service";

import type { Product, ProductVariant } from "@/types/shared.types";

interface BestsellerCardProps {
  product: Product;
}

export default function BestsellerCard({ product }: BestsellerCardProps) {
  const addToCart = useCartStore((state) => state.addToCart);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const items = useCartStore((state) => state.items);
  const updateQuantity = useCartStore((state) => state.updateQuantity);
  const removeItem = useCartStore((state) => state.removeItem);

  const cartItemsForProduct = items.filter((item) => item.productId === product.id);
  const totalQuantity = cartItemsForProduct.reduce((sum, item) => sum + item.quantity, 0);

  const performAddToCart = (variantIdToUse: string, variantSkuToUse: string, variantLabelToUse: string, priceToUse: number, compareAtPriceToUse: number | null) => {
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
  };

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault(); // Prevent navigating to product page
    e.stopPropagation();

    const activeVariants = product.variants?.filter(v => v.isActive) || [];
    const hasRealVariants = activeVariants.length > 1 || (activeVariants.length === 1 && activeVariants[0].label !== 'One size');
    
    if (hasRealVariants) {
      setIsModalOpen(true);
      return;
    }

    // Single variant or no variant data fallback
    const priceNum = parseInt(product.price.replace(/[^\d]/g, ''), 10) || 0;
    const mrpNum = product.mrp ? parseInt(product.mrp.replace(/[^\d]/g, ''), 10) : null;
    
    performAddToCart(
      product.defaultVariantId || "", 
      product.defaultVariantSku || "default-sku", 
      product.defaultVariantLabel || "Standard", 
      priceNum, 
      mrpNum
    );
  };

  const handleIncrement = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const activeVariants = product.variants?.filter(v => v.isActive) || [];
    const hasRealVariants = activeVariants.length > 1 || (activeVariants.length === 1 && activeVariants[0].label !== 'One size');

    if (hasRealVariants) {
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

  const handleVariantSelect = (variant: ProductVariant) => {
    setIsModalOpen(false);
    performAddToCart(variant.id, variant.sku, variant.label, variant.price, variant.compareAtPrice);
  };

  const productUrl = `/product/${product.slug || product.id}`;

  return (
    <>
      <Link
        href={productUrl}
        prefetch={true}
        onClick={() => logProductEngagementClick(product.id, product.name)}
        className="flex w-[160px] shrink-0 flex-col gap-3 group focus-visible:outline-none"
      >
        {/* Product Image Container */}
        <div className="relative flex h-[180px] w-full flex-col items-end justify-end rounded-[12px] bg-[#f8f6f3] p-2.5 overflow-hidden">
          <Image
            src={product.imageUrl}
            alt={product.name}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            sizes="160px"
          />
        {/* Tag badges based on DB tags */}
        {product.tags && product.tags.length > 0 && (
          <div className="absolute left-2 top-2 z-10 flex flex-col gap-1 md:left-3 md:top-3">
            {product.tags.map((tag, idx) => (
              <span
                key={idx}
                className="w-fit rounded-full bg-[#FF5400] px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-white shadow-sm"
              >
                {tag}
              </span>
            ))}
          </div>
        )}
        {/* Add to Cart Bubble / Stepper */}
        {totalQuantity === 0 ? (
          <button
            onClick={handleAddToCart}
            className="relative z-10 flex h-8 w-8 items-center justify-center rounded-full bg-[#ff5400] text-white shadow-sm transition-transform hover:scale-110 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white cursor-pointer"
            aria-label={`Add ${product.name} to cart`}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2.5}
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-4 w-4"
            >
              <path d="M12 5v14M5 12h14" />
            </svg>
          </button>
        ) : (
          <div
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
            }}
            className="relative z-10 flex h-7 items-center justify-between gap-1.5 rounded-full bg-white border border-[#ff5400] px-2 shadow-sm text-[#ff5400]"
          >
            <button
              type="button"
              onClick={handleDecrement}
              className="w-5 h-5 flex items-center justify-center font-bold text-[14px] hover:bg-[#ff5400]/10 rounded-full select-none cursor-pointer"
            >
              -
            </button>
            <span className="text-[12px] font-bold select-none min-w-[12px] text-center">
              {totalQuantity}
            </span>
            <button
              type="button"
              onClick={handleIncrement}
              className="w-5 h-5 flex items-center justify-center font-bold text-[14px] hover:bg-[#ff5400]/10 rounded-full select-none cursor-pointer"
            >
              +
            </button>
          </div>
        )}
      </div>

      {/* Product Info */}
      <div className="flex w-full flex-col gap-1.5">
        <p className="overflow-hidden text-ellipsis whitespace-nowrap text-[14px] font-medium leading-[20px] text-text-primary">
          {product.name}
        </p>

        {/* Rating Line */}
        <div className="flex items-center gap-1">
          <div className="flex items-center gap-[2px]">
            {[1, 2, 3, 4, 5].map((star) => (
              star <= Math.floor(product.rating || 0)
                ? <IconStarFilled key={star} className="w-[12px] h-[12px] text-[#ffb800]" />
                : <IconStarOutline key={star} className="w-[12px] h-[12px] text-[#cbd5e1]" />
            ))}
          </div>
          <span className="text-[11px] font-medium leading-[14px] text-text-secondary">
            ({product.reviewCount || 0})
          </span>
        </div>

        {/* Price Row */}
        <div className="flex items-baseline gap-1.5 whitespace-nowrap">
          <span className="text-[14px] font-bold leading-[20px] text-text-primary">
            {product.price}
          </span>
          {product.mrp && (
            <span className="text-[12px] text-text-muted line-through decoration-from-font">
              {product.mrp}
            </span>
          )}
        </div>
      </div>
    </Link>
    <VariantSelectionModal 
      isOpen={isModalOpen}
      onClose={() => setIsModalOpen(false)}
      product={product}
      onSelectVariant={handleVariantSelect}
    />
    </>
  );
}
