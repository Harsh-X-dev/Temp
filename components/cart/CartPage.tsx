'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { createSupabaseBrowserClient } from '@/services/supabase/client';
import {
  fetchAddresses,
  insertAddress,
  fetchCoupons,
  calculateCouponDiscount,
  fetchBuyNowItem,
  calculateCheckoutPricesApi,
} from '@/services/checkout.service';
import { deleteAddress } from '@/services/profile.service';
import type { Address } from '@/components/account/types';
import type { Coupon } from '@/types/checkout.types';
import {
  AddressSheet,
  AddressFormSheet,
  CouponSheet,
} from '@/components/checkout';
import { useAddressForm } from '@/hooks/useAddressForm';
import { useCartStore } from '@/store/cart.store';
import { useCheckoutStore } from '@/store/checkout.store';
import { useAuthStore } from '@/store/auth.store';
import { useAuth } from '@/hooks/useAuth';
import { validateCouponApi } from '@/services/coupon.service';
import CartItemRow from './CartItemRow';
import EmptyCartState from './EmptyCartState';
import BackButton from '@/components/ui/buttons/BackButton';
import { toast } from '@/lib/toast';

export default function CartPage() {
  const [mounted, setMounted] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const productSlug = searchParams.get('product');
  const isBuyNow = Boolean(productSlug);
  const [isReconstructing, setIsReconstructing] = useState(false);

  const cartItems = useCartStore((state) => state.items);
  const cartSubtotal = useCartStore((state) => state.cartSubtotal);

  const checkoutItems = useCheckoutStore((state) => state.items);
  const selectedAddressId = useCheckoutStore((s) => s.selectedAddressId);
  const selectedCoupon = useCheckoutStore((s) => s.selectedCoupon);
  const setSelectedAddress = useCheckoutStore((s) => s.setSelectedAddress);
  const setCoupon = useCheckoutStore((s) => s.setCoupon);
  const startCartCheckout = useCheckoutStore((state) => state.startCartCheckout);

  const supabase = useMemo(() => createSupabaseBrowserClient(), []);

  const { user, isAuthenticated, loading: authLoading } = useAuth();

  const [addresses, setAddresses] = useState<Address[]>([]);
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [isLoadingAddresses, setIsLoadingAddresses] = useState(true);
  const [isLoadingCoupons, setIsLoadingCoupons] = useState(true);

  const [couponCodeInput, setCouponCodeInput] = useState('');
  const [isValidatingCoupon, setIsValidatingCoupon] = useState(false);
  const [isAddressSheetOpen, setIsAddressSheetOpen] = useState(false);
  const [isCouponSheetOpen, setIsCouponSheetOpen] = useState(false);

  // ── Buy Now item reconstruction on refresh or cold entry ──────────────
  useEffect(() => {
    if (!mounted) return;
    if (!isBuyNow || !productSlug) return;

    const currentItems = useCheckoutStore.getState().items;
    if (currentItems.length > 0) return;

    const variantId = searchParams.get('variant');
    const qty = parseInt(searchParams.get('qty') || '1', 10) || 1;
    const isEnergized = searchParams.get('energized') === '1';

    let isSubscribed = true;
    setIsReconstructing(true);

    fetchBuyNowItem(supabase, productSlug, variantId, qty, isEnergized)
      .then((item) => {
        if (isSubscribed && item) {
          useCheckoutStore.getState().startBuyNow(item);
        }
      })
      .finally(() => {
        if (isSubscribed) {
          setIsReconstructing(false);
        }
      });

    return () => {
      isSubscribed = false;
    };
  }, [mounted, isBuyNow, productSlug, searchParams, supabase]);

  const handleConfirmAddressFromCart = useCallback(
    (addressId: string) => {
      setSelectedAddress(addressId);
      setIsAddressSheetOpen(false);

      if (!isBuyNow) {
        const checkoutMappedItems = cartItems.map((item) => ({
          productId: item.productId,
          variantId: item.variantId,
          title: item.title,
          price: item.price,
          compareAtPrice: item.compareAtPrice,
          imageUrl: item.imageUrl,
          variantLabel: item.variantLabel,
          quantity: item.quantity,
        }));

        const { selectedCoupon, setCoupon } = useCheckoutStore.getState();
        startCartCheckout(checkoutMappedItems);

        setSelectedAddress(addressId);
        if (selectedCoupon) setCoupon(selectedCoupon);

        router.push('/checkout');
      } else {
        const params = new URLSearchParams(searchParams.toString());
        if (checkoutItems[0]?.quantity) {
          params.set('qty', String(checkoutItems[0].quantity));
        }
        const queryString = params.toString();
        router.push(queryString ? `/checkout?${queryString}` : '/checkout');
      }
    },
    [cartItems, checkoutItems, isBuyNow, router, searchParams, setSelectedAddress, startCartCheckout]
  );

  const handleAddressSelect = useCallback(
    (addressId: string) => {
      setSelectedAddress(addressId);
      setIsAddressSheetOpen(false);
      toast.success("Address Selected", "Delivery address updated.");
    },
    [setSelectedAddress]
  );

  const addrForm = useAddressForm({
    createFn: insertAddress,
    onSaved: (address) => {
      setAddresses((prev) => {
        let updated = prev;
        if (address.isDefault) {
          updated = updated.map((a) => ({ ...a, isDefault: false }));
        }
        const exists = updated.find((a) => a.id === address.id);
        return exists
          ? updated.map((a) => (a.id === address.id ? address : a))
          : [address, ...updated];
      });

      // Also sync to auth store if addresses are cached there
      const currentAuthAddresses = useAuthStore.getState().addresses;
      if (currentAuthAddresses.length > 0 || address.isDefault) {
        useAuthStore.getState().setAddresses(
          currentAuthAddresses.find((a) => a.id === address.id)
            ? currentAuthAddresses.map((a) => (a.id === address.id ? address : a))
            : [address, ...currentAuthAddresses]
        );
      }

      setSelectedAddress(address.id);
      setIsAddressSheetOpen(false);
    },
  });

  const loadAddresses = useCallback(async () => {
    setIsLoadingAddresses(true);
    const result = await fetchAddresses(supabase);
    const sorted = [...result].sort((a, b) => (b.isDefault ? 1 : 0) - (a.isDefault ? 1 : 0));
    setAddresses(sorted);
    setIsLoadingAddresses(false);

    if (sorted.length > 0) {
      const currentSelected = useCheckoutStore.getState().selectedAddressId;
      const currentExists = currentSelected && sorted.some((a) => a.id === currentSelected);
      if (!currentExists) {
        const defaultAddr = sorted.find((a) => a.isDefault);
        setSelectedAddress(defaultAddr ? defaultAddr.id : null);
      }
    } else {
      setSelectedAddress(null);
    }
  }, [supabase, setSelectedAddress]);

  useEffect(() => {
    if (mounted) {
      loadAddresses();
    }
  }, [mounted, loadAddresses]);

  useEffect(() => {
    if (selectedCoupon?.code && !couponCodeInput) {
      setCouponCodeInput(selectedCoupon.code);
    }
  }, [selectedCoupon, couponCodeInput]);

  useEffect(() => {
    if (!mounted) return;
    (async () => {
      setIsLoadingCoupons(true);
      const result = await fetchCoupons(supabase);
      setCoupons(result);
      setIsLoadingCoupons(false);
    })();
  }, [mounted, supabase]);

  const selectedAddress = useMemo(
    () => addresses.find((a) => a.id === selectedAddressId) ?? null,
    [addresses, selectedAddressId]
  );

  const handleDeleteAddress = useCallback(
    async (address: Address) => {
      await deleteAddress(supabase, address.id);
      const updated = addresses.filter((a) => a.id !== address.id);
      setAddresses(updated);
      if (selectedAddressId === address.id) {
        const nextDefault = updated.find((a) => a.isDefault) || updated[0] || null;
        setSelectedAddress(nextDefault ? nextDefault.id : null);
      }
    },
    [supabase, addresses, selectedAddressId, setSelectedAddress]
  );

  const items = isBuyNow
    ? checkoutItems.map((item) => ({
      ...item,
      key: `${item.productId}::${item.variantId}`,
      variantSku: 'N/A',
    }))
    : cartItems;

  const calculationData = useCheckoutStore((s) => s.calculationData);
  const setCalculationData = useCheckoutStore((s) => s.setCalculationData);

  // ── Calculate prices using Server Backend Price Calculation API (CHECKOUT_API_GUIDE) ──
  useEffect(() => {
    if (!mounted || items.length === 0) {
      setCalculationData(null);
      return;
    }

    let isSubscribed = true;
    calculateCheckoutPricesApi({
      items: items.map((i) => ({
        variant_id: i.variantId ? i.variantId.replace('-energized', '') : i.variantId,
        quantity: i.quantity,
        is_energization_addon: Boolean((i as any).isEnergized || i.variantId?.includes?.('-energized')),
      })),
      coupon_code: selectedCoupon?.code || null,
      customer_id: user?.id,
      payment_method: 'prepaid',
    }).then((res) => {
      if (isSubscribed && res.success && res.data) {
        setCalculationData(res.data);
      }
    });

    return () => {
      isSubscribed = false;
    };
  }, [mounted, items, selectedCoupon, user?.id, setCalculationData]);

  // ── Synchronous Instant (0ms) calculations ────────────────────────────
  const clientSubtotal = useMemo(() => {
    return items.reduce((acc, item) => acc + (Number(item.price) || 0) * (Number(item.quantity) || 1), 0);
  }, [items]);

  const isServerCalcSynced = Boolean(
    calculationData &&
    (calculationData.coupon_applied?.code || null) === (selectedCoupon?.code || null)
  );

  const subtotal = isServerCalcSynced && calculationData ? calculationData.subtotal : clientSubtotal;
  const couponDiscount = isServerCalcSynced && calculationData
    ? calculationData.discount_amount
    : (selectedCoupon ? calculateCouponDiscount(selectedCoupon, subtotal) : 0);
  const shippingAmount = calculationData?.shipping_amount ?? 0;
  const gst = calculationData?.tax_amount ?? 0;
  const grandTotal = isServerCalcSynced && calculationData
    ? calculationData.total
    : Math.max(0, subtotal - couponDiscount + shippingAmount + gst);

  const handleApplyCoupon = useCallback(
    (coupon: Coupon) => {
      setCoupon(coupon);
      setCouponCodeInput(coupon.code);
      setIsCouponSheetOpen(false);
      toast.success('Coupon Applied 🎉', `${coupon.code} has been applied to your cart.`);
    },
    [setCoupon]
  );

  const handleRemoveCoupon = useCallback(() => {
    setCoupon(null);
    setCouponCodeInput('');
    toast.info('Coupon Removed', 'Coupon has been removed.');
  }, [setCoupon]);

  const handleManualCouponApply = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanCode = couponCodeInput.trim().toUpperCase();
    if (!cleanCode) {
      toast.error('Code Required', 'Please enter a coupon code.');
      return;
    }

    // 1. Instant 0ms optimistic apply if matched in pre-fetched coupons or well-known codes
    let localMatch = coupons.find((c) => c.code.toUpperCase() === cleanCode);
    if (!localMatch && cleanCode === 'WELCOME10') {
      localMatch = {
        id: 'welcome10',
        code: 'WELCOME10',
        description: '10% off on your first order',
        discountType: 'percentage',
        discountValue: 10,
        maxDiscountAmount: 500,
        minOrderAmount: 0,
      };
    }

    if (localMatch) {
      if (localMatch.minOrderAmount !== null && localMatch.minOrderAmount !== undefined && subtotal < localMatch.minOrderAmount) {
        toast.error('Coupon Ineligible', `Minimum order of ₹${localMatch.minOrderAmount.toLocaleString('en-IN')} required.`);
        return;
      }

      // Apply instantly with 0ms delay!
      setCoupon(localMatch);
      toast.success('Coupon Applied 🎉', `${localMatch.code} has been applied!`);

      // Verify in background to refresh server calculations without blocking UI
      validateCouponApi({
        couponCode: cleanCode,
        subtotal,
        items: items.map((item) => ({
          productId: item.productId,
          variantId: item.variantId,
          quantity: item.quantity,
          price: item.price,
        })),
        customerId: user?.id,
        paymentMethod: 'prepaid',
      }).then((result) => {
        if (result.valid && result.coupon) {
          setCoupon(result.coupon);
        } else if (!result.valid && result.message) {
          setCoupon(null);
          setCouponCodeInput('');
          toast.error('Coupon Ineligible', result.message);
        }
      });
      return;
    }

    // 2. Unlisted/Secret coupon validation
    setIsValidatingCoupon(true);
    const result = await validateCouponApi({
      couponCode: cleanCode,
      subtotal,
      items: items.map((item) => ({
        productId: item.productId,
        variantId: item.variantId,
        quantity: item.quantity,
        price: item.price,
      })),
      customerId: user?.id,
      paymentMethod: 'prepaid',
    });
    setIsValidatingCoupon(false);

    if (result.valid && result.coupon) {
      setCoupon(result.coupon);
      setCouponCodeInput(result.coupon.code);
      toast.success('Coupon Applied 🎉', result.message || `${result.coupon.code} has been applied!`);
    } else {
      toast.error('Coupon Ineligible', result.message || `Coupon "${cleanCode}" is invalid or expired.`);
    }
  };

  const handleProceedToCheckout = useCallback(() => {
    if (!authLoading && !isAuthenticated) {
      toast.info('Login Required 🔒', 'Please log in to proceed to checkout.');
      router.push('/login?redirectTo=/checkout');
      return;
    }

    if (!selectedAddressId) {
      if (addresses.length === 0) {
        addrForm.openCreate();
      } else {
        setIsAddressSheetOpen(true);
      }
      return;
    }
    handleConfirmAddressFromCart(selectedAddressId);
  }, [authLoading, isAuthenticated, router, selectedAddressId, addresses.length, addrForm, handleConfirmAddressFromCart]);

  useEffect(() => {
    const timer = window.setTimeout(() => setMounted(true), 0);
    return () => window.clearTimeout(timer);
  }, []);

  // ── Render guards ───────────────────────────────────────────────────
  if (!mounted) {
    return (
      <div className="min-h-screen bg-[#fbf8f4] flex flex-col items-center w-full font-['Montserrat']">
        <div className="w-full max-w-full md:max-w-[480px] mx-auto min-h-screen flex flex-col bg-[#fbf8f4] relative md:border-x md:border-[#e5e0da]">
          <header className="sticky top-0 z-20 w-full bg-white border-b border-[#e5e0da] h-[56px] px-[16px] flex items-center justify-between shrink-0">
            <div className="flex items-center gap-[12px]">
              <div className="size-[28px] rounded-full animate-shimmer" />
              <div className="h-5 w-24 rounded animate-shimmer" />
            </div>
          </header>
          <div className="p-4 flex flex-col gap-4">
            <div className="h-[76px] w-full rounded-[16px] border border-[#e5e0da] bg-white p-4 animate-shimmer" />
            <div className="flex gap-3 rounded-[16px] border border-[#e5e0da] bg-white p-4">
              <div className="size-[72px] rounded-[12px] animate-shimmer shrink-0" />
              <div className="flex-1 flex flex-col gap-2">
                <div className="h-4 w-3/4 rounded animate-shimmer" />
                <div className="h-3 w-1/2 rounded animate-shimmer" />
                <div className="h-5 w-20 rounded animate-shimmer mt-2" />
              </div>
            </div>
            <div className="h-[180px] w-full rounded-[16px] border border-[#e5e0da] bg-white p-4 animate-shimmer" />
          </div>
        </div>
      </div>
    );
  }

  if (isBuyNow && isReconstructing && items.length === 0) {
    return (
      <div className="flex flex-col w-full max-w-lg mx-auto min-h-[60vh] items-center justify-center bg-white">
        <div className="animate-pulse flex flex-col items-center gap-3">
          <div className="h-6 w-40 bg-surface-neutral rounded-full" />
          <div className="h-4 w-28 bg-surface-neutral rounded-full" />
        </div>
      </div>
    );
  }

  const itemCount = items.reduce((total, item) => total + item.quantity, 0);

  if (items.length === 0) {
    return (
      <div className="flex flex-col flex-1 h-full w-full max-w-lg mx-auto bg-white">
        <EmptyCartState />
      </div>
    );
  }

  return (
    <div className="min-h-[100dvh] bg-[#fbf8f4] flex flex-col items-center w-full font-['Montserrat']">
      <div className="w-full max-w-full md:max-w-[480px] mx-auto min-h-[100dvh] flex flex-col bg-[#fbf8f4] relative md:border-x md:border-[#e5e0da] shadow-sm">
        {/* Header matching Figma node 536:52 */}
        <header className="sticky top-0 z-20 w-full bg-white border-b border-[#e5e0da] h-[56px] px-[16px] flex items-center justify-between shrink-0">
          <div className="flex items-center gap-[12px]">
            <BackButton href="/" className="size-[28px] rounded-[14px]" />
            <h1 className="font-['Montserrat'] font-bold text-[18px] text-[#211e1a] leading-[24px] whitespace-nowrap">
              {isBuyNow ? 'Buy Now' : 'Your cart'}
            </h1>
          </div>
          <div className="bg-[#f5f1ea] px-[10px] py-[4px] rounded-[24px] shrink-0">
            <span className="font-['Montserrat'] font-semibold text-[12px] text-[#6b6459] leading-[16px] whitespace-nowrap">
              {itemCount} {itemCount === 1 ? 'item' : 'items'}
            </span>
          </div>
        </header>

        {/* Main Scrollable Content matching Figma node 536:59 */}
        <main className="flex-1 w-full px-[24px] pt-[16px] pb-[140px] md:pb-[150px] flex flex-col gap-[16px]">

          {/* 1. Cart Items List matching Figma node 187:84 */}
          <div className="flex flex-col gap-[16px] w-full">
            {items.map((item) => (
              <CartItemRow key={item.key} item={item} isBuyNow={isBuyNow} />
            ))}
          </div>

          {/* 2. Select Delivery Address Card matching Figma node 542:103 */}
          <div
            onClick={() => {
              if (addresses.length === 0) {
                addrForm.openCreate();
              } else {
                setIsAddressSheetOpen(true);
              }
            }}
            className="bg-white border border-[#e5e0da] hover:border-[#ff5400]/40 rounded-[12px] p-[16px] flex gap-[12px] items-center cursor-pointer w-full transition-colors"
          >
            <div className="bg-[#f5f1ea] size-[32px] rounded-[16px] flex items-center justify-center shrink-0">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path
                  d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"
                  fill="#ff5400"
                />
              </svg>
            </div>

            <div className="flex flex-1 flex-col gap-[2px] min-w-0">
              {selectedAddress ? (
                <>
                  <div className="flex items-center gap-2">
                    <p className="font-['Montserrat'] font-medium text-[13px] leading-[20px] text-[#211e1a] truncate">
                      Deliver to: {selectedAddress.fullName || (selectedAddress.addressType ? `${selectedAddress.addressType.charAt(0).toUpperCase() + selectedAddress.addressType.slice(1)} Address` : selectedAddress.line1)}
                    </p>
                    {selectedAddress.isDefault && (
                      <span className="bg-[#ff5400] text-white text-[10px] font-semibold px-1.5 py-0.5 rounded-full shrink-0">
                        Default
                      </span>
                    )}
                  </div>
                  <p className="font-['Montserrat'] font-normal text-[12px] leading-[16px] text-[#6b6459] truncate">
                    {[selectedAddress.line1, selectedAddress.city, selectedAddress.pincode].filter(Boolean).join(', ')}
                  </p>
                </>
              ) : (
                <>
                  <p className="font-['Montserrat'] font-medium text-[13px] leading-[20px] text-[#211e1a] whitespace-nowrap">
                    Select delivery address
                  </p>
                  <p className="font-['Montserrat'] font-normal text-[12px] leading-[16px] text-[#6b6459] truncate">
                    Choose where to deliver
                  </p>
                </>
              )}
            </div>

            <div className="size-[18px] shrink-0 text-[#6b6459] flex items-center justify-center">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </div>
          </div>

          {/* 3. Coupon Code Input & Offers matching Figma node 536:60 */}
          <div className="flex flex-col gap-[8px] w-full">
            {selectedCoupon ? (
              <div className="bg-[#f0fdf4] border border-[#bbf7d0] rounded-[12px] p-[12px] flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="bg-[#dcfce7] rounded-md p-1 text-[#166534]">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M20 6L9 17l-5-5" />
                    </svg>
                  </div>
                  <div>
                    <p className="font-['Montserrat'] font-bold text-[12px] text-[#166534] uppercase">
                      {selectedCoupon.code} applied!
                    </p>
                    <p className="font-['Montserrat'] font-normal text-[11px] text-[#16a34a]">
                      You save ₹{couponDiscount.toLocaleString('en-IN')}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleRemoveCoupon}
                  className="font-['Montserrat'] font-semibold text-[12px] text-[#dc2626] hover:underline cursor-pointer"
                >
                  Remove
                </button>
              </div>
            ) : (
              <form onSubmit={handleManualCouponApply} className="flex gap-[12px] h-[44px] items-center w-full">
                <input
                  type="text"
                  value={couponCodeInput}
                  onChange={(e) => setCouponCodeInput(e.target.value)}
                  placeholder="Enter coupon code"
                  className="bg-[#f5f1ea] border border-[#e5e0da] focus:border-[#ff5400] focus:bg-white rounded-[12px] h-[44px] px-[14px] flex-1 font-['Montserrat'] font-normal text-[12px] text-[#211e1a] placeholder:text-[#a89a85] outline-none transition-colors"
                />
                <button
                  type="submit"
                  disabled={isValidatingCoupon || !couponCodeInput.trim()}
                  className="bg-[#ff5400] hover:bg-[#e04a00] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-[12px] h-[44px] px-[16px] font-['Montserrat'] font-normal text-[12px] flex items-center justify-center cursor-pointer transition-colors shrink-0 min-w-[65px]"
                >
                  {isValidatingCoupon ? (
                    <div className="size-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    'Apply'
                  )}
                </button>
              </form>
            )}

            {!selectedCoupon && (
              <button
                type="button"
                onClick={() => setIsCouponSheetOpen(true)}
                className="flex gap-[8px] items-center py-[4px] cursor-pointer text-[#ff5400] font-['Montserrat'] font-medium text-[13px] leading-[18px] hover:opacity-80 transition-opacity w-fit"
              >
                <span>View all offers</span>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="9 18 15 12 9 6" />
                </svg>
              </button>
            )}
          </div>

          {/* 4. Free Delivery Banner matching Figma node 536:65 */}
          <div className="bg-[#f5f1ea] rounded-[12px] p-[16px] flex gap-[10px] items-center w-full">
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#211e1a"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="shrink-0"
            >
              <rect x="1" y="3" width="15" height="13" />
              <polygon points="16 8 20 8 23 11 23 16 16 16 8" />
              <circle cx="5.5" cy="18.5" r="2.5" />
              <circle cx="18.5" cy="18.5" r="2.5" />
            </svg>
            <p className="font-['Montserrat'] font-normal text-[13px] leading-[18px] text-[#6b6459]">
              {shippingAmount === 0 ? 'Free delivery by Aug 5-7' : 'Standard delivery (₹99) by Aug 5-7'}
            </p>
          </div>

          {/* 5. Divider matching Figma node 187:109 */}
          <div className="bg-[#f0ebe4] h-px w-full shrink-0 my-[4px]" />

          {/* 6. Bill Summary Breakdown matching Figma node 187:110 */}
          <div className="flex flex-col gap-[8px] w-full font-['Montserrat'] font-normal text-[13px] leading-[20px] whitespace-nowrap">
            <div className="flex items-start justify-between w-full">
              <span className="text-[#6b6459]">Subtotal</span>
              <span className="text-[#211e1a]">₹{subtotal.toLocaleString('en-IN')}</span>
            </div>

            <div className="flex items-start justify-between w-full">
              <span className="text-[#6b6459]">Shipping</span>
              <span className="text-[#211e1a]">
                {shippingAmount === 0 ? 'Free' : `₹${shippingAmount.toLocaleString('en-IN')}`}
              </span>
            </div>

            {couponDiscount > 0 && (
              <div className="flex items-start justify-between w-full">
                <span className="text-[#6b6459]">Discount</span>
                <span className="text-[#ff5400]">-₹{couponDiscount.toLocaleString('en-IN')}</span>
              </div>
            )}

            {gst > 0 && (
              <div className="flex items-start justify-between w-full">
                <span className="text-[#6b6459]">GST (3%)</span>
                <span className="text-[#211e1a]">₹{gst.toLocaleString('en-IN')}</span>
              </div>
            )}

            <div className="flex items-start justify-between w-full pt-[2px]">
              <span className="text-[#211e1a] text-[13px]">Total</span>
              <span className="font-['Montserrat'] font-semibold text-[15px] leading-[24px] text-[#ff5400]">
                ₹{grandTotal.toLocaleString('en-IN')}
              </span>
            </div>
          </div>
        </main>

        {/* 7. Bottom Action Bar fixed to extreme bottom matching BottomNav */}
        <footer
          className="fixed inset-x-0 bottom-0 z-40 w-full bg-white border-t border-[#e5e0da]"
          style={{
            bottom: 0,
            paddingBottom: "max(env(safe-area-inset-bottom, 0px), 0px)",
            boxShadow: "0 -2px 10px rgba(0,0,0,0.05), 0 50px 0 50px #ffffff",
          }}
        >
          {/* Continuous solid downward shield */}
          <div className="absolute inset-x-0 top-0 -bottom-40 bg-white -z-10 pointer-events-none" aria-hidden="true" />

          <div className="relative mx-auto w-full max-w-[480px] px-[24px] pt-2.5 pb-1 flex flex-col gap-[4px]">
            <button
              type="button"
              onClick={handleProceedToCheckout}
              className="h-[50px] w-full rounded-[24px] bg-[#ff5400] hover:bg-[#e04a00] active:scale-[0.99] font-['Montserrat'] font-semibold text-[15px] text-white flex items-center justify-center transition-all cursor-pointer shadow-xs"
            >
              Proceed to checkout
            </button>
            <p className="font-['Montserrat'] font-normal text-[12px] leading-[16px] text-[#a89a85] text-center w-full">
              Cash on Delivery available
            </p>
          </div>
        </footer>

        {/* ── Modals / Sheets ──────────────────────────────────────────── */}
        <AddressSheet
          isOpen={isAddressSheetOpen}
          onClose={() => setIsAddressSheetOpen(false)}
          addresses={addresses}
          selectedAddressId={selectedAddressId}
          onSelectAddress={handleAddressSelect}
          onConfirm={handleConfirmAddressFromCart}
          onAddNew={addrForm.openCreate}
          onEditAddress={addrForm.openEdit}
          onDeleteAddress={handleDeleteAddress}
          isLoading={isLoadingAddresses}
        />

        <AddressFormSheet
          isOpen={addrForm.isOpen}
          onClose={addrForm.close}
          onSubmit={addrForm.submit}
          isSubmitting={addrForm.isSubmitting}
          mode={addrForm.mode}
          initialAddress={addrForm.editingAddress}
        />

        <CouponSheet
          isOpen={isCouponSheetOpen}
          onClose={() => setIsCouponSheetOpen(false)}
          coupons={coupons}
          selectedCoupon={selectedCoupon}
          onApply={handleApplyCoupon}
          onRemove={handleRemoveCoupon}
          isLoading={isLoadingCoupons}
          subtotal={subtotal}
          items={items.map((item) => ({
            productId: item.productId,
            variantId: item.variantId,
            quantity: item.quantity,
            price: item.price,
          }))}
          customerId={user?.id}
        />
      </div>
    </div>
  );
}
