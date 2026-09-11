/**
 * PaymentStatus — presentational component for payment state feedback.
 *
 * Renders:
 *  - A labelled button text based on the current payment state
 *  - An inline status/error banner below the pay button
 *
 * Kept purely presentational — no business logic.
 */
'use client';

import type { PaymentFlowState } from '@/types/payment.types';

// ---------------------------------------------------------------------------
// Button label helper
// ---------------------------------------------------------------------------

export function getPayButtonLabel(state: PaymentFlowState, grandTotal: number): string {
  switch (state) {
    case 'creating_order':
      return 'Creating secure payment…';
    case 'opening_checkout':
      return 'Opening Razorpay…';
    case 'verifying_payment':
      return 'Verifying payment…';
    case 'success':
      return 'Payment successful!';
    default:
      return `Pay ₹${grandTotal.toLocaleString('en-IN')}`;
  }
}

export function isBusy(state: PaymentFlowState): boolean {
  return ['creating_order', 'opening_checkout', 'verifying_payment', 'success'].includes(state);
}

// ---------------------------------------------------------------------------
// Inline status banner
// ---------------------------------------------------------------------------

interface PaymentStatusBannerProps {
  state: PaymentFlowState;
  errorMessage: string | null;
}

/**
 * Renders a coloured banner below the Pay button for non-idle states.
 * Returns null when state is 'idle' or 'opening_checkout' (Razorpay handles its own UI).
 */
export default function PaymentStatusBanner({ state, errorMessage }: PaymentStatusBannerProps) {
  if (state === 'idle' || state === 'opening_checkout' || state === 'creating_order') {
    return null;
  }

  if (state === 'cancelled') {
    return (
      <div className="flex items-center gap-2 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 mt-3 w-full">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#d97706" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <circle cx="12" cy="12" r="10" />
          <line x1="12" y1="8" x2="12" y2="12" />
          <line x1="12" y1="16" x2="12.01" y2="16" />
        </svg>
        <p className="font-['Montserrat'] text-[13px] text-amber-700">
          Payment was cancelled. You can try again.
        </p>
      </div>
    );
  }

  if (state === 'failed') {
    return (
      <div className="flex items-start gap-2 bg-red-50 border border-red-200 rounded-xl px-4 py-3 mt-3 w-full">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#dc2626" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0 mt-0.5" aria-hidden="true">
          <circle cx="12" cy="12" r="10" />
          <line x1="15" y1="9" x2="9" y2="15" />
          <line x1="9" y1="9" x2="15" y2="15" />
        </svg>
        <p className="font-['Montserrat'] text-[13px] text-red-700">
          {errorMessage || "We couldn't process your payment. Please try again."}
        </p>
      </div>
    );
  }

  if (state === 'verifying_payment') {
    return (
      <div className="flex items-center gap-2 bg-blue-50 border border-blue-200 rounded-xl px-4 py-3 mt-3 w-full">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="animate-spin" aria-hidden="true">
          <path d="M21 12a9 9 0 1 1-6.219-8.56" />
        </svg>
        <p className="font-['Montserrat'] text-[13px] text-blue-700">
          Verifying your payment with our server…
        </p>
      </div>
    );
  }

  return null;
}
