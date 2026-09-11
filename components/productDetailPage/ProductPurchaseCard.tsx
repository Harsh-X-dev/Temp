'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { ProductVariant, ProductOption } from '@/types/product.types';
import { useCartStore } from '@/store/cart.store';
import { useCheckoutStore } from '@/store/checkout.store';
import { toast } from '@/lib/toast';
import VariantSelectionModal from '@/components/ui/overlays/VariantSelectionModal';
import type { Product } from '@/types/shared.types';

interface ProductPurchaseCardProps {
  productId: string;
  productSlug?: string;
  productTitle: string;
  productImage: string;
  variants: ProductVariant[];
  options: ProductOption[];
  sku: string;
  isEnergized: boolean;
  energizationAddonPrice: number | null;
}

export default function ProductPurchaseCard({
  productId,
  productSlug,
  productTitle,
  productImage,
  variants,
  options,
  sku,
  isEnergized,
  energizationAddonPrice
}: ProductPurchaseCardProps) {
  // Start with no options pre-selected (all white background with border)
  const [selectedOptions, setSelectedOptions] = useState<Record<string, string>>({});
  
  const [isVariantModalOpen, setIsVariantModalOpen] = useState(false);
  const [modalAction, setModalAction] = useState<'cart' | 'buyNow'>('cart');
  const [addEnergization, setAddEnergization] = useState(false);
  const addToCart = useCartStore((state) => state.addToCart);
  const items = useCartStore((state) => state.items);
  const updateQuantity = useCartStore((state) => state.updateQuantity);
  const removeItem = useCartStore((state) => state.removeItem);
  const startBuyNow = useCheckoutStore((state) => state.startBuyNow);
  const router = useRouter();

  const handleOptionSelect = (optionName: string, value: string) => {
    setSelectedOptions(prev => ({ ...prev, [optionName]: value }));
  };

  const isAllOptionsSelected = useMemo(() => {
    const multiValueOptions = (options || []).filter((opt) => opt.values && opt.values.length > 1);
    if (multiValueOptions.length === 0) return true;
    return multiValueOptions.every((opt) => Boolean(selectedOptions[opt.name]));
  }, [options, selectedOptions]);

  const selectedVariant = variants.find(v => {
    const opt1Name = options?.[0]?.name || "Size";
    const opt2Name = options?.[1]?.name || "Material";
    const opt3Name = options?.[2]?.name || "Quality";
    
    return (!v.option1Value || v.option1Value === selectedOptions[opt1Name]) &&
           (!v.option2Value || v.option2Value === selectedOptions[opt2Name]) &&
           (!v.option3Value || v.option3Value === selectedOptions[opt3Name]);
  }) || variants[0];
  const currentAddonPrice = (addEnergization && isEnergized && energizationAddonPrice) ? energizationAddonPrice : 0;
  
  const finalPrice = selectedVariant.price + currentAddonPrice;
  const finalCompareAtPrice = selectedVariant.compareAtPrice ? selectedVariant.compareAtPrice + currentAddonPrice : null;

  const variantIdToUse = currentAddonPrice > 0 ? `${selectedVariant?.id}-energized` : (selectedVariant?.id || "");
  const optionValues = [selectedVariant.option1Value, selectedVariant.option2Value, selectedVariant.option3Value].filter(Boolean);
  const baseLabel = optionValues.length > 0 ? optionValues.join(', ') : 'One size';
  const variantLabelToUse = currentAddonPrice > 0 ? `${baseLabel} (Energized)` : baseLabel;

  const cartKey = `${productId}::${variantIdToUse}`;
  const cartItem = items.find(item => item.key === cartKey);
  const quantityInCart = cartItem?.quantity || 0;

  const discountPercent = finalCompareAtPrice
    ? Math.round(((finalCompareAtPrice - finalPrice) / finalCompareAtPrice) * 100)
    : 0;

  const handleAddToCart = () => {
    if (!isAllOptionsSelected && variants.length > 1) {
      setModalAction('cart');
      setIsVariantModalOpen(true);
      return;
    }

    addToCart({
      productId,
      title: productTitle,
      price: finalPrice,
      compareAtPrice: finalCompareAtPrice,
      imageUrl: productImage,
      variantId: variantIdToUse,
      variantSku: selectedVariant.sku,
      variantLabel: variantLabelToUse,
    });

    toast.success("Added to Cart 🛒", `${productTitle} has been added to your cart.`);
  };

  const handleVariantSelectFromModal = (selectedVar: any) => {
    const chosenVariant = variants.find((v) => v.id === selectedVar.id) || selectedVariant;
    const currentAddon = (addEnergization && isEnergized && energizationAddonPrice) ? energizationAddonPrice : 0;
    const priceToUse = (selectedVar.price || chosenVariant.price) + currentAddon;
    const compareAtToUse = (selectedVar.compareAtPrice || chosenVariant.compareAtPrice) 
      ? (selectedVar.compareAtPrice || chosenVariant.compareAtPrice) + currentAddon 
      : null;
    const varId = currentAddon > 0 ? `${chosenVariant.id}-energized` : chosenVariant.id;
    const optVals = [chosenVariant.option1Value, chosenVariant.option2Value, chosenVariant.option3Value].filter(Boolean);
    const lbl = optVals.length > 0 ? optVals.join(', ') : 'Standard';
    const finalLbl = currentAddon > 0 ? `${lbl} (Energized)` : lbl;

    // Sync selected options back to PDP page so it reflects the user's choice
    if (chosenVariant.option1Value && options?.[0]?.name) {
      setSelectedOptions((prev) => ({ ...prev, [options[0].name]: chosenVariant.option1Value! }));
    }
    if (chosenVariant.option2Value && options?.[1]?.name) {
      setSelectedOptions((prev) => ({ ...prev, [options[1].name]: chosenVariant.option2Value! }));
    }
    if (chosenVariant.option3Value && options?.[2]?.name) {
      setSelectedOptions((prev) => ({ ...prev, [options[2].name]: chosenVariant.option3Value! }));
    }

    setIsVariantModalOpen(false);

    if (modalAction === 'buyNow') {
      startBuyNow({
        productId,
        variantId: varId,
        title: productTitle,
        price: priceToUse,
        compareAtPrice: compareAtToUse,
        imageUrl: productImage,
        variantLabel: finalLbl,
        quantity: 1,
      });

      const slugToUse = productSlug || productId;
      const variantQuery = chosenVariant?.id ? `&variant=${encodeURIComponent(chosenVariant.id)}` : '';
      const energizedQuery = currentAddon > 0 ? '&energized=1' : '';
      router.push(`/cart?product=${encodeURIComponent(slugToUse)}${variantQuery}&qty=1${energizedQuery}`);
    } else {
      addToCart({
        productId,
        title: productTitle,
        price: priceToUse,
        compareAtPrice: compareAtToUse,
        imageUrl: productImage,
        variantId: varId,
        variantSku: chosenVariant.sku,
        variantLabel: finalLbl,
      });
      toast.success("Added to Cart 🛒", `${productTitle} has been added to your cart.`);
    }
  };

  const productForModal: Product = {
    id: productId,
    name: productTitle,
    price: `₹${finalPrice.toLocaleString('en-IN')}`,
    mrp: finalCompareAtPrice ? `₹${finalCompareAtPrice.toLocaleString('en-IN')}` : undefined,
    imageUrl: productImage,
    category: '',
    variants: variants.map((v) => ({
      id: v.id,
      sku: v.sku,
      label: [v.option1Value, v.option2Value, v.option3Value].filter(Boolean).join(" / ") || "Standard",
      price: v.price,
      compareAtPrice: v.compareAtPrice,
      inventoryQuantity: v.inventoryQuantity,
      isActive: v.isActive,
      option1Value: v.option1Value,
      option2Value: v.option2Value,
      option3Value: v.option3Value,
      option1_value: v.option1Value,
      option2_value: v.option2Value,
      option3_value: v.option3Value,
    })),
    options: options,
  };

  const handleIncrement = () => {
    updateQuantity(cartKey, quantityInCart + 1);
  };

  const handleDecrement = () => {
    if (quantityInCart > 1) {
      updateQuantity(cartKey, quantityInCart - 1);
    } else {
      removeItem(cartKey);
      toast.info("Removed from Cart 🗑️", `${productTitle} was removed from your cart.`);
    }
  };

  const handleBuyNow = () => {
    if (!isAllOptionsSelected && variants.length > 1) {
      setModalAction('buyNow');
      setIsVariantModalOpen(true);
      return;
    }

    startBuyNow({
      productId,
      variantId: variantIdToUse,
      title: productTitle,
      price: finalPrice,
      compareAtPrice: finalCompareAtPrice,
      imageUrl: productImage,
      variantLabel: variantLabelToUse,
      quantity: 1,
    });

    const slugToUse = productSlug || productId;
    const variantQuery = selectedVariant?.id ? `&variant=${encodeURIComponent(selectedVariant.id)}` : '';
    const energizedQuery = currentAddonPrice > 0 ? '&energized=1' : '';
    router.push(`/cart?product=${encodeURIComponent(slugToUse)}${variantQuery}&qty=1${energizedQuery}`);
  };

  return (
    <div className="w-full">
      <div className="bg-white border border-border-strong border-solid flex flex-col gap-[12px] items-start p-[16px] relative rounded-[12px] w-full">
        {/* Price Block */}
        <div className="flex gap-[10px] items-baseline w-full">
          <p className="font-semibold leading-[28px] text-primary-orange text-[22px]">
            ₹{finalPrice.toLocaleString('en-IN')}
          </p>
          {finalCompareAtPrice && (
            <p className="decoration-solid font-normal leading-[20px] line-through text-text-muted text-[14px]">
              ₹{finalCompareAtPrice.toLocaleString('en-IN')}
            </p>
          )}
          {discountPercent > 0 && (
            <div className="bg-primary-orange flex items-start px-[8px] py-[4px] rounded-[999px]">
              <p className="font-semibold leading-[16px] text-[12px] text-white">
                {discountPercent}% OFF
              </p>
            </div>
          )}
        </div>

        {/* SKU */}
        <p className="font-normal leading-[16px] text-text-secondary text-[12px]">
          SKU: {selectedVariant.sku || sku}
        </p>

        {/* Extra Attributes (Option 2 & 3) */}
        {/* {(selectedVariant.option2Value || selectedVariant.option3Value) && (
          <div className="flex gap-[8px] items-center w-full">
            {selectedVariant.option2Value && (
              <span className="bg-[#fff4eb] px-[10px] py-[4px] rounded-[6px] text-[12px] text-primary-orange font-medium border border-primary-orange">
                {selectedVariant.option2Value}
              </span>
            )}
            {selectedVariant.option3Value && (
              <span className="bg-[#fff4eb] px-[10px] py-[4px] rounded-[6px] text-[12px] text-primary-orange font-medium border border-primary-orange">
                {selectedVariant.option3Value}
              </span>
            )}
          </div>
        )} */}

        {/* Variant Selectors dynamically rendered */}
        {options && options.map((option, optIdx) => (
          <div key={option.id || optIdx} className="flex flex-col gap-[8px] w-full">
            <p className="text-[13px] text-text-secondary font-normal">{option.name}</p>
            {option.values.length === 1 ? (
              <p className="text-[14px] font-semibold text-text-primary">{option.values[0]}</p>
            ) : (
              <div className="flex gap-[8px] items-start flex-wrap w-full">
                {option.values.map(val => {
                  const isSelected = selectedOptions[option.name] === val;
                  return (
                    <button
                      key={val}
                      onClick={() => handleOptionSelect(option.name, val)}
                      className={`flex items-start px-[14px] py-[8px] rounded-[999px] border-solid transition-colors ${isSelected
                          ? 'bg-primary-orange text-white border border-primary-orange'
                          : 'bg-white border border-border-strong text-text-primary hover:bg-[#fafafa]'
                        }`}
                    >
                      <p className={`font-semibold leading-[16px] text-[13px] ${isSelected ? 'text-white' : 'text-text-primary'}`}>
                        {val}
                      </p>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        ))}

        {/* Stock Status */}
        <div className="flex gap-[6px] items-center w-full">
          <div className="flex items-center justify-center">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M22 11.08V12A10 10 0 1 1 16.07 2.86" stroke="#ff5400" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M22 4L12 14.01L9 11.01" stroke="#ff5400" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <p className="font-bold leading-[16px] text-primary-orange text-[13px]">
            In Stock
          </p>
        </div>

        {/* Energization Addon */}
        {isEnergized && energizationAddonPrice !== null && (
          <label className="flex gap-[8px] items-center w-full cursor-pointer" onClick={() => setAddEnergization(!addEnergization)}>
            <div className={`flex items-center justify-center rounded-full min-w-[20px] h-[20px] border transition-colors ${addEnergization ? 'bg-primary-orange border-primary-orange' : 'bg-white border-[#bbaea0]'
              }`}>
              {addEnergization && (
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M20 6L9 17l-5-5" stroke="white" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              )}
            </div>
            <p className="flex-1 font-normal leading-[18px] text-text-primary text-[13px] select-none">
              Add energization ritual (+₹{energizationAddonPrice})
            </p>
          </label>
        )}

      </div>

      <div
        className="fixed bottom-0 left-0 w-full z-50 bg-white border-t border-border-strong shadow-[0_-4px_16px_rgba(0,0,0,0.05)] flex justify-center"
        style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
      >
        <div className="flex gap-[12px] items-center w-full max-w-[600px] p-[16px]">
          {quantityInCart === 0 ? (
            <button
              onClick={handleAddToCart}
              className="bg-white border-primary-orange border-[1.5px] border-solid flex flex-1 h-[48px] items-center justify-center rounded-[999px] hover:bg-[#fff5f0] transition-colors cursor-pointer"
            >
              <span className="font-semibold leading-[20px] text-primary-orange text-[14px]">
                Add to cart
              </span>
            </button>
          ) : (
            <div className="bg-white border-primary-orange border-[1.5px] border-solid flex flex-1 h-[48px] items-center justify-between px-4 rounded-[999px] transition-colors">
              <button onClick={handleDecrement} className="text-primary-orange text-[20px] font-bold w-8 h-8 flex items-center justify-center hover:bg-primary-orange/10 rounded-full transition-colors cursor-pointer select-none pb-1">
                -
              </button>
              <span className="font-semibold text-primary-orange text-[16px] select-none">
                {quantityInCart}
              </span>
              <button onClick={handleIncrement} className="text-primary-orange text-[20px] font-bold w-8 h-8 flex items-center justify-center hover:bg-primary-orange/10 rounded-full transition-colors cursor-pointer select-none pb-1">
                +
              </button>
            </div>
          )}
          <button 
            onClick={handleBuyNow} 
            className="bg-primary-orange flex flex-1 h-[48px] items-center justify-center rounded-[999px] hover:bg-[#e64a00] transition-colors cursor-pointer"
          >
            <span className="font-semibold leading-[20px] text-white text-[14px]">
              Buy now
            </span>
          </button>
        </div>
      </div>

      <VariantSelectionModal
        isOpen={isVariantModalOpen}
        onClose={() => setIsVariantModalOpen(false)}
        product={productForModal}
        onSelectVariant={handleVariantSelectFromModal}
        actionTitle="Select Options"
        ctaText={modalAction === 'buyNow' ? 'Buy Now' : 'Add to Cart'}
      />
    </div>
  );
}
