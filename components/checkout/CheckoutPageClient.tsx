'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { createSupabaseBrowserClient } from '@/services/supabase/client';
import { useCheckoutStore } from '@/store/checkout.store';
import {
  fetchAddresses,
  insertAddress,
  fetchCoupons,
  calculateCouponDiscount,
  calculateCheckoutPricesApi,
} from '@/services/checkout.service';
import { deleteAddress } from '@/services/profile.service';
import type { Address } from '@/components/account/types';
import type { Coupon, BillBreakdown } from '@/types/checkout.types';
import {
  CheckoutHeader,
  CheckoutItems,
  AddressSection,
  AddressSheet,
  AddressFormSheet,
  CouponSection,
  CouponSheet,
  BillSummary,
  PaymentFooter,
} from '@/components/checkout';
import { useAuth } from '@/hooks/useAuth';
import { useAuthStore } from '@/store/auth.store';
import { useAddressForm } from '@/hooks/useAddressForm';
import { toast } from '@/lib/toast';

/**
 * Checkout page — the single unified checkout experience.
 *
 * Both "Buy Now" and "Proceed to Checkout from Cart" lead here.
 * The checkout store determines what products to display.
 * Addresses and coupons are fetched from Supabase on mount.
 */
export default function CheckoutPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = useMemo(() => createSupabaseBrowserClient(), []);

  // ── Checkout store ──────────────────────────────────────────────────
  const source = useCheckoutStore((s) => s.source);
  const items = useCheckoutStore((s) => s.items);
  const selectedAddressId = useCheckoutStore((s) => s.selectedAddressId);
  const selectedCoupon = useCheckoutStore((s) => s.selectedCoupon);
  const setSelectedAddress = useCheckoutStore((s) => s.setSelectedAddress);
  const setCoupon = useCheckoutStore((s) => s.setCoupon);

  // ── Auth state ──────────────────────────────────────────────────────
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const storeAddresses = useAuthStore((s) => s.addresses);
  const setStoreAddresses = useAuthStore((s) => s.setAddresses);

  // ── Local UI state ──────────────────────────────────────────────────
  const [mounted, setMounted] = useState(false);
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [isLoadingAddresses, setIsLoadingAddresses] = useState(true);
  const [isLoadingCoupons, setIsLoadingCoupons] = useState(true);
  const [isAddressSheetOpen, setIsAddressSheetOpen] = useState(false);
  const [isCouponSheetOpen, setIsCouponSheetOpen] = useState(false);

  const addrForm = useAddressForm({
    createFn: insertAddress,
    onSaved: (address) => {
      // Refresh list in-place and auto-select the saved address
      setStoreAddresses((prev) => {
        const list = Array.isArray(prev) ? prev : [];
        let updated = list;
        if (address.isDefault) {
          updated = updated.map((a) => ({ ...a, isDefault: false }));
        }
        const exists = updated.find((a) => a.id === address.id);
        return exists
          ? updated.map((a) => (a.id === address.id ? address : a))
          : [address, ...updated];
      });
      setSelectedAddress(address.id);
      setIsAddressSheetOpen(false);
    },
  });

  // ── Mount guard (SSR hydration safety) ──────────────────────────────
  useEffect(() => {
    setMounted(true);
  }, []);

  // ── Auth guard — only logged in users can checkout ─────────────────
  useEffect(() => {
    if (mounted && !authLoading && !isAuthenticated) {
      toast.info('Login Required 🔒', 'Please log in to complete your purchase.');
      router.replace('/login?redirectTo=/checkout');
    }
  }, [mounted, authLoading, isAuthenticated, router]);

  // ── Redirect if no checkout session ─────────────────────────────────
  useEffect(() => {
    if (mounted && (!source || items.length === 0)) {
      const queryStr = searchParams.toString();
      router.replace(queryStr ? `/cart?${queryStr}` : '/cart');
    }
  }, [mounted, source, items.length, router, searchParams]);

  // ── Fetch addresses ─────────────────────────────────────────────────
  const loadAddresses = useCallback(async () => {
    setIsLoadingAddresses(true);
    const result = await fetchAddresses(supabase);
    const sorted = [...result].sort((a, b) => (b.isDefault ? 1 : 0) - (a.isDefault ? 1 : 0));
    setStoreAddresses(sorted);
    setIsLoadingAddresses(false);

    // Preserve existing selection if valid; otherwise select default address
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
  }, [supabase, setStoreAddresses, setSelectedAddress]);

  useEffect(() => {
    if (mounted) loadAddresses();
  }, [mounted, loadAddresses]);

  // ── Fetch coupons ───────────────────────────────────────────────────
  useEffect(() => {
    if (!mounted) return;
    (async () => {
      setIsLoadingCoupons(true);
      const result = await fetchCoupons(supabase);
      setCoupons(result);
      setIsLoadingCoupons(false);
    })();
  }, [mounted, supabase]);

  // ── Selected address object ─────────────────────────────────────────
  const handleAddressSelect = useCallback(
    (addressId: string) => {
      setSelectedAddress(addressId);
      setIsAddressSheetOpen(false);
      toast.success("Address Selected", "Delivery address updated.");
    },
    [setSelectedAddress]
  );

  const selectedAddress = useMemo(
    () => (Array.isArray(storeAddresses) ? storeAddresses.find((a) => a.id === selectedAddressId) : null) ?? null,
    [storeAddresses, selectedAddressId],
  );

  const setCalculationData = useCheckoutStore((s) => s.setCalculationData);
  const calculationData = useCheckoutStore((s) => s.calculationData);

  // ── Calculate prices with Server Checkout Engine ─────────────────────
  useEffect(() => {
    if (!mounted || items.length === 0) return;

    let isSubscribed = true;
    calculateCheckoutPricesApi({
      items: items.map((i) => ({
        variant_id: i.variantId ? i.variantId.replace('-energized', '') : i.variantId,
        quantity: i.quantity,
        is_energization_addon: Boolean((i as any).isEnergized || i.variantId?.includes?.('-energized')),
      })),
      coupon_code: selectedCoupon?.code || null,
      shipping_address: selectedAddress
        ? {
            pincode: selectedAddress.pincode,
            city: selectedAddress.city,
            state: selectedAddress.state,
          }
        : null,
      payment_method: 'prepaid',
      customer_id: user?.id,
    }).then((res) => {
      if (isSubscribed && res.success && res.data) {
        setCalculationData(res.data);
      }
    });

    return () => {
      isSubscribed = false;
    };
  }, [mounted, items, selectedCoupon, selectedAddress, user?.id, setCalculationData]);

  // ── Authoritative Bill breakdown directly from API ──────────────────
  const bill = useMemo<BillBreakdown>(() => {
    const isServerCalcSynced = Boolean(
      calculationData &&
      (calculationData.coupon_applied?.code || null) === (selectedCoupon?.code || null)
    );

    // If backend calculation matches current coupon selection, use exact backend numbers
    if (isServerCalcSynced && calculationData) {
      const serverProductDiscount = Math.max(0, (calculationData.total_savings || 0) - (calculationData.discount_amount || 0));
      return {
        subtotal: calculationData.subtotal + serverProductDiscount,
        productDiscount: serverProductDiscount,
        couponDiscount: calculationData.discount_amount || 0,
        deliveryCharges: calculationData.shipping_amount || 0,
        taxes: calculationData.tax_amount || 0,
        grandTotal: calculationData.total,
      };
    }

    const rawSubtotal = items.reduce(
      (sum, item) => sum + (item.compareAtPrice ?? item.price) * item.quantity,
      0,
    );

    const productDiscount = items.reduce((sum, item) => {
      if (item.compareAtPrice && item.compareAtPrice > item.price) {
        return sum + (item.compareAtPrice - item.price) * item.quantity;
      }
      return sum;
    }, 0);

    const afterProductDiscount = rawSubtotal - productDiscount;
    const couponDiscount = calculateCouponDiscount(selectedCoupon, afterProductDiscount);
    const deliveryCharges = calculationData?.shipping_amount || 0;
    const taxableAmount = Math.max(0, afterProductDiscount - couponDiscount);
    const taxes = calculationData?.tax_amount || 0;
    const grandTotal = Math.max(0, taxableAmount + deliveryCharges + taxes);

    return {
      subtotal: rawSubtotal,
      productDiscount,
      couponDiscount,
      deliveryCharges,
      taxes,
      grandTotal,
    };
  }, [calculationData, items, selectedCoupon]);

  // ── Handlers ────────────────────────────────────────────────────────

  const handleDeleteAddress = useCallback(
    async (address: Address) => {
      await deleteAddress(supabase, address.id);
      const updated = storeAddresses.filter((a) => a.id !== address.id);
      setStoreAddresses(updated);
      if (selectedAddressId === address.id) {
        const nextDefault = updated.find((a) => a.isDefault) || updated[0] || null;
        setSelectedAddress(nextDefault ? nextDefault.id : null);
      }
    },
    [supabase, storeAddresses, selectedAddressId, setSelectedAddress, setStoreAddresses]
  );

  const handleApplyCoupon = useCallback(
    (coupon: Coupon) => {
      setCoupon(coupon);
      setIsCouponSheetOpen(false);
      toast.success('Coupon Applied 🎉', `${coupon.code} has been applied!`);
    },
    [setCoupon],
  );

  const handleRemoveCoupon = useCallback(() => {
    setCoupon(null);
    toast.info('Coupon Removed', 'Coupon has been removed.');
  }, [setCoupon]);

  /**
   * Proceed To Payment — placeholder function.
   *
   * TODO: Replace this with Razorpay integration.
   *   1. Create order via backend API
   *   2. Open Razorpay checkout with order details
   *   3. On success: verify payment and redirect to order confirmation
   *   4. On failure: show error and allow retry
   */
  const handleProceedToPayment = useCallback(() => {
    router.push('/checkout/payment');
  }, [router]);

  // ── Render guards ───────────────────────────────────────────────────
  if (!mounted || authLoading) {
    return (
      <div className="min-h-screen bg-[#fbf8f4] flex flex-col items-center w-full font-['Montserrat']">
        <div className="w-full max-w-full md:max-w-[480px] mx-auto min-h-screen flex flex-col bg-[#fbf8f4] relative md:border-x md:border-[#e5e0da]">
          <header className="sticky top-0 z-50 flex h-[56px] items-center justify-between border-b border-[#e5e0da] bg-white px-4">
            <div className="flex items-center gap-3">
              <div className="size-8 rounded-full animate-shimmer" />
              <div className="h-5 w-24 rounded-[6px] animate-shimmer" />
            </div>
          </header>
          <main className="w-full px-[16px] pt-[16px] pb-24 flex flex-col gap-[16px] flex-1">
            <div className="h-[90px] w-full rounded-[16px] border border-[#e5e0da] bg-white p-4 animate-shimmer" />
            <div className="h-[100px] w-full rounded-[16px] border border-[#e5e0da] bg-white p-4 animate-shimmer" />
            <div className="h-[64px] w-full rounded-[16px] border border-[#e5e0da] bg-white p-4 animate-shimmer" />
            <div className="h-[200px] w-full rounded-[16px] border border-[#e5e0da] bg-white p-4 animate-shimmer" />
          </main>
        </div>
      </div>
    );
  }
  if (!isAuthenticated) return null;
  if (!source || items.length === 0) return null;

  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);
  const isPaymentDisabled = !selectedAddressId;

  return (
    <div className="min-h-[100dvh] bg-[#fbf8f4] flex flex-col items-center w-full font-['Montserrat']">
      <div className="w-full max-w-full md:max-w-[480px] mx-auto min-h-[100dvh] flex flex-col bg-[#fbf8f4] relative md:border-x md:border-[#e5e0da] shadow-sm">
        {/* Header - Pure White matching Figma node 544:110 */}
        <CheckoutHeader itemCount={itemCount} />

        {/* Main Content matching Figma node 544:116 */}
        <main className="w-full px-[16px] pt-[16px] pb-[140px] md:pb-[150px] flex flex-col gap-[16px] flex-1">

          {/* 1. Items List matching Figma node 544:117 */}
          <CheckoutItems items={items} />

          {/* 2. Deliver to Address Card matching Figma node 544:132 */}
          <AddressSection
            address={selectedAddress}
            onChangeAddress={() => setIsAddressSheetOpen(true)}
          />

          {/* 3. Coupon Card matching Figma node 544:139 */}
          <CouponSection
            selectedCoupon={selectedCoupon}
            couponDiscount={bill.couponDiscount}
            onViewOffers={() => setIsCouponSheetOpen(true)}
            onRemoveCoupon={handleRemoveCoupon}
          />

          {/* 4. Bill Summary Breakdown matching Figma node 544:148 */}
          <BillSummary bill={bill} couponCode={selectedCoupon?.code} />
        </main>

        {/* Sticky Payment Footer matching Figma node 544:166 */}
        <PaymentFooter
          grandTotal={bill.grandTotal}
          isDisabled={isPaymentDisabled}
          onProceed={handleProceedToPayment}
        />
      </div>

      {/* ── Sheets / Modals ──────────────────────────────────────────── */}

      {/* Address Selection Sheet */}
      <AddressSheet
        isOpen={isAddressSheetOpen}
        onClose={() => setIsAddressSheetOpen(false)}
        addresses={storeAddresses}
        selectedAddressId={selectedAddressId}
        onSelectAddress={handleAddressSelect}
        onAddNew={addrForm.openCreate}
        onEditAddress={addrForm.openEdit}
        onDeleteAddress={handleDeleteAddress}
        isLoading={isLoadingAddresses}
      />

      {/* Add / Edit Address Form Sheet */}
      <AddressFormSheet
        isOpen={addrForm.isOpen}
        onClose={addrForm.close}
        onSubmit={addrForm.submit}
        isSubmitting={addrForm.isSubmitting}
        mode={addrForm.mode}
        initialAddress={addrForm.editingAddress}
      />

      {/* Coupon Selection Sheet */}
      <CouponSheet
        isOpen={isCouponSheetOpen}
        onClose={() => setIsCouponSheetOpen(false)}
        coupons={coupons}
        selectedCoupon={selectedCoupon}
        onApply={handleApplyCoupon}
        onRemove={handleRemoveCoupon}
        isLoading={isLoadingCoupons}
        subtotal={bill.subtotal - bill.productDiscount}
        items={items.map((item) => ({
          productId: item.productId,
          variantId: item.variantId,
          quantity: item.quantity,
          price: item.price,
        }))}
        customerId={user?.id}
      />
    </div>
  );
}
