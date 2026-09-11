'use client';

import { useEffect, useState, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { useHasMounted } from '@/hooks/useHasMounted';
import type { Coupon } from '@/types/checkout.types';
import CouponCard from '@/components/checkout/cards/CouponCard';
import BackButton from '@/components/ui/buttons/BackButton';
import Input from '@/components/ui/inputs/Input';

import { validateCouponApi } from '@/services/coupon.service';

interface CouponSheetProps {
  isOpen: boolean;
  onClose: () => void;
  coupons: Coupon[];
  selectedCoupon: Coupon | null;
  onApply: (coupon: Coupon) => void;
  onRemove: () => void;
  isLoading: boolean;
  subtotal: number;
  items?: Array<{
    productId: string;
    variantId?: string;
    quantity: number;
    price: number;
  }>;
  customerId?: string;
}

/**
 * Slide-up sheet listing available coupons and offering a code search / apply input bar.
 * Matches the Figma design with reusable BackButton and Input components.
 */
export default function CouponSheet({
  isOpen,
  onClose,
  coupons,
  selectedCoupon,
  onApply,
  onRemove,
  isLoading,
  subtotal,
  items,
  customerId,
}: CouponSheetProps) {
  const [searchCode, setSearchCode] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isValidating, setIsValidating] = useState(false);

  // Reset state when opened
  useEffect(() => {
    if (isOpen) {
      setSearchCode('');
      setErrorMessage(null);
      setIsValidating(false);
    }
  }, [isOpen]);

  // Close on Escape
  useEffect(() => {
    if (!isOpen) return;
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [isOpen, onClose]);

  // Prevent body scroll
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  const handleApply = (coupon: Coupon) => {
    if (selectedCoupon?.id === coupon.id) {
      onRemove();
      onClose();
      return;
    }

    if (coupon.minOrderAmount !== null && coupon.minOrderAmount !== undefined && subtotal < coupon.minOrderAmount) {
      setErrorMessage(`Min. order amount for ${coupon.code} is ₹${coupon.minOrderAmount.toLocaleString('en-IN')}`);
      return;
    }

    // 0ms instant optimistic apply!
    onApply(coupon);
    onClose();

    // Verify with backend in background
    validateCouponApi({
      couponCode: coupon.code,
      subtotal,
      items,
      customerId,
    }).then((result) => {
      if (result.valid && result.coupon) {
        onApply(result.coupon);
      }
    });
  };

  const handleApplyCode = async () => {
    const trimmed = searchCode.trim().toUpperCase();
    if (!trimmed) return;

    // Check if code matches any listed coupon for instant 0ms apply
    let matchedCoupon = coupons.find((c) => c.code.toUpperCase() === trimmed);
    if (!matchedCoupon && trimmed === 'WELCOME10') {
      matchedCoupon = {
        id: 'welcome10',
        code: 'WELCOME10',
        description: '10% off on your first order up to ₹500',
        discountType: 'percentage',
        discountValue: 10,
        maxDiscountAmount: 500,
        minOrderAmount: 0,
      };
    } else if (!matchedCoupon && trimmed === 'GEM500') {
      matchedCoupon = {
        id: 'gem500',
        code: 'GEM500',
        description: 'Flat ₹500 off on orders above ₹4,999',
        discountType: 'fixed',
        discountValue: 500,
        maxDiscountAmount: null,
        minOrderAmount: 4999,
      };
    } else if (!matchedCoupon && trimmed === 'DIVINE15') {
      matchedCoupon = {
        id: 'divine15',
        code: 'DIVINE15',
        description: '15% off on orders above ₹9,999 up to ₹1,500',
        discountType: 'percentage',
        discountValue: 15,
        maxDiscountAmount: 1500,
        minOrderAmount: 9999,
      };
    }

    if (matchedCoupon) {
      handleApply(matchedCoupon);
      return;
    }

    setIsValidating(true);
    setErrorMessage(null);

    const result = await validateCouponApi({
      couponCode: trimmed,
      subtotal,
      items,
      customerId,
    });

    setIsValidating(false);

    if (result.valid && result.coupon) {
      onApply(result.coupon);
      onClose();
    } else {
      setErrorMessage(result.message || `Coupon "${trimmed}" is invalid or ineligible.`);
    }
  };

  const filteredCoupons = useMemo(() => {
    const q = searchCode.trim().toLowerCase();
    if (!q) return coupons;
    return coupons.filter(
      (coupon) =>
        coupon.code.toLowerCase().includes(q) ||
        (coupon.description && coupon.description.toLowerCase().includes(q))
    );
  }, [coupons, searchCode]);

  const mounted = useHasMounted();

  if (!isOpen || !mounted) return null;

  return createPortal(
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-[100] bg-black/40 transition-opacity duration-300 w-full max-w-full overflow-x-hidden"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Sheet */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Offers for you"
        className={`fixed inset-0 z-[110] bg-surface-neutral transition-transform duration-300 ease-out flex flex-col w-full max-w-full overflow-x-hidden ${
          isOpen ? 'translate-y-0' : 'translate-y-full'
        }`}
      >
        {/* Header */}
        <div className="bg-white border-b border-border-strong flex h-[56px] items-center gap-[12px] px-[20px] md:px-[24px] shrink-0 w-full max-w-full">
          <BackButton
            onClick={onClose}
            className="size-[28px] shrink-0"
          />
          <h2 className="font-['Montserrat'] font-bold text-[18px] text-text-primary tracking-tight">
            Offers for you
          </h2>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden px-[20px] md:px-[24px] py-[16px] flex flex-col gap-[16px] w-full max-w-full no-scrollbar">
          {/* Search / Coupon Code Input Bar */}
          <div className="flex flex-col gap-[6px]">
            <div className="flex gap-[12px] h-[44px] items-center w-full">
              <div className="border border-border-strong bg-white flex flex-1 h-[44px] items-center px-[14px] rounded-[12px] focus-within:border-primary-orange transition-colors">
                <Input
                  type="text"
                  placeholder="Enter coupon code"
                  value={searchCode}
                  onChange={(e) => {
                    setSearchCode(e.target.value);
                    setErrorMessage(null);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleApplyCode();
                    }
                  }}
                  className="text-[12px] text-text-primary placeholder:text-text-muted font-['Montserrat'] uppercase placeholder:normal-case font-normal"
                />
                {searchCode && (
                  <button
                    type="button"
                    onClick={() => {
                      setSearchCode('');
                      setErrorMessage(null);
                    }}
                    className="text-text-muted hover:text-text-primary p-1 cursor-pointer transition-colors"
                    aria-label="Clear search input"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M18 6L6 18M6 6l12 12" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </button>
                )}
              </div>
              <button
                type="button"
                onClick={handleApplyCode}
                disabled={!searchCode.trim() || isValidating}
                className="bg-primary-orange hover:bg-[#e04a00] active:scale-95 text-white font-['Montserrat'] font-normal text-[12px] h-[44px] px-[16px] rounded-[12px] shrink-0 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center min-w-[70px]"
              >
                {isValidating ? (
                  <div className="size-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  'Apply'
                )}
              </button>
            </div>
            {errorMessage && (
              <p className="font-['Montserrat'] text-[12px] text-[#dc2626] px-1">
                {errorMessage}
              </p>
            )}
          </div>

          {/* Coupons list */}
          {isLoading ? (
            <div className="flex flex-col gap-[12px] animate-pulse">
              {[1, 2, 3].map((i) => (
                <div key={i} className="rounded-[12px] bg-white border border-border-strong h-[100px] w-full" />
              ))}
            </div>
          ) : coupons.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-[32px] text-center">
              <div className="w-[60px] h-[60px] bg-white rounded-full flex items-center justify-center mb-4 border border-border-strong">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M19.5 12.5c0-1.46.97-2.73 2.36-3.12.36-.1.64-.42.64-.8V7c0-.55-.45-1-1-1H2.5c-.55 0-1 .45-1 1v1.58c0 .38.28.7.64.8 1.39.39 2.36 1.66 2.36 3.12s-.97 2.73-2.36 3.12c-.36.1-.64.42-.64.8V18c0 .55.45 1 1 1h19c.55 0 1-.45 1-1v-1.58c0-.38-.28-.7-.64-.8-1.39-.39-2.36-1.66-2.36-3.12z" stroke="#a89a85" strokeWidth="1.5" />
                </svg>
              </div>
              <p className="font-['Montserrat'] font-semibold text-[15px] text-text-primary mb-1">
                No offers available
              </p>
              <p className="font-['Montserrat'] text-[13px] text-text-secondary">
                Check back later for exclusive deals
              </p>
            </div>
          ) : filteredCoupons.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-[32px] text-center">
              <p className="font-['Montserrat'] font-semibold text-[15px] text-text-primary mb-1">
                No offers found
              </p>
              <p className="font-['Montserrat'] text-[13px] text-text-secondary">
                No coupons match &ldquo;{searchCode}&rdquo;. Try another code.
              </p>
            </div>
          ) : (
            <div className="flex flex-col gap-[12px]">
              {filteredCoupons.map((coupon) => (
                <CouponCard
                  key={coupon.id}
                  coupon={coupon}
                  onApply={handleApply}
                  isApplied={selectedCoupon?.id === coupon.id}
                  subtotal={subtotal}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </>,
    document.body
  );
}
