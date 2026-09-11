/**
 * Payment types — all Razorpay-related TypeScript definitions live here.
 *
 * Covers:
 *  - Hono backend API request/response shapes
 *  - Razorpay Checkout SDK types (declared globally on window)
 *  - Payment flow state machine
 *  - Typed error class for payment failures
 */

// ---------------------------------------------------------------------------
// Payment flow state machine
// ---------------------------------------------------------------------------

export type PaymentFlowState =
  | 'idle'
  | 'creating_order'
  | 'opening_checkout'
  | 'verifying_payment'
  | 'success'
  | 'failed'
  | 'cancelled';

// ---------------------------------------------------------------------------
// Hono backend — create-order
// ---------------------------------------------------------------------------

export interface CreateRazorpayOrderRequest {
  /** Final checkout amount in RUPEES (e.g. 1999.50 for ₹1,999.50). */
  amount: number;
  /** ISO-4217 currency code. Always "INR" for GemOstone. */
  currency: 'INR';
  /** Product ID from products table. */
  product_id: string;
}

export interface CreateRazorpayOrderResponse {
  success: boolean;
  /** Razorpay order ID (e.g. "order_xxxxx"). Present when success === true. */
  order_id?: string;
  /** Razorpay public key ID. Present when success === true. */
  key_id?: string;
  /** Amount in PAISE as confirmed by Razorpay. Present when success === true. */
  amount?: number;
  currency?: string;
  /** Error description. Present when success === false. */
  message?: string;
}

// ---------------------------------------------------------------------------
// Hono backend — verify-payment
// ---------------------------------------------------------------------------

export interface VerifyRazorpayPaymentRequest {
  order_id: string; // Database Order UUID
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
}

export interface VerifyRazorpayPaymentResponse {
  success: boolean;
  message: string;
  order?: {
    id: string;
    order_number: string;
  };
}

// ---------------------------------------------------------------------------
// Hono backend — payment-failed
// ---------------------------------------------------------------------------

export interface MarkPaymentFailedRequest {
  order_id: string; // Database Order UUID
  razorpay_order_id?: string;
  razorpay_payment_id?: string;
  error_code: string;
  error_description: string;
}

export interface MarkPaymentFailedResponse {
  success: boolean;
  message: string;
  order?: {
    id: string;
    order_number: string;
    payment_status: string;
  };
}

// ---------------------------------------------------------------------------
// Hono backend — cancel-order
// ---------------------------------------------------------------------------

export interface CancelOrderRequest {
  order_id: string; // Database Order UUID or order_number string
  reason: string;
}

export interface CancelOrderResponse {
  success: boolean;
  message: string;
  order?: {
    id: string;
    order_number: string;
    status: string;
  };
}

// ---------------------------------------------------------------------------
// Razorpay SDK — window.Razorpay types
// ---------------------------------------------------------------------------

/** Options passed to `new window.Razorpay(options)` */
export interface RazorpayOptions {
  /** Razorpay public key ID (never the secret). */
  key: string;
  /** Amount in PAISE. */
  amount: number;
  currency: string;
  name: string;
  description?: string;
  /** Razorpay order ID returned by create-order. */
  order_id: string;
  /** Called when payment is successfully authorised by Razorpay. */
  handler: (response: RazorpaySuccessResponse) => void;
  prefill?: {
    name?: string;
    email?: string;
    contact?: string;
  };
  theme?: {
    color?: string;
  };
  retry?: {
    enabled?: boolean;
    max_count?: number;
  };
  modal?: {
    ondismiss?: () => void;
    escape?: boolean;
    confirm_close?: boolean;
    animation?: boolean;
  };
  notes?: Record<string, string>;
}

/** Response from Razorpay after successful payment authorisation. */
export interface RazorpaySuccessResponse {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
}

/** Error object passed to the `payment.failed` event listener. */
export interface RazorpayError {
  code: string;
  description: string;
  source: string;
  step: string;
  reason: string;
  metadata: {
    order_id: string;
    payment_id?: string;
  };
}

/** The Razorpay Checkout instance returned by `new window.Razorpay(options)`. */
export interface RazorpayInstance {
  open(): void;
  close(): void;
  on(event: 'payment.failed', handler: (response: { error: RazorpayError }) => void): void;
}

/** Constructor for the Razorpay Checkout SDK. */
export interface RazorpayConstructor {
  new (options: RazorpayOptions): RazorpayInstance;
}

// ---------------------------------------------------------------------------
// Global window augmentation — makes window.Razorpay properly typed
// ---------------------------------------------------------------------------

declare global {
  interface Window {
    /** Razorpay Checkout SDK — loaded via https://checkout.razorpay.com/v1/checkout.js */
    Razorpay?: RazorpayConstructor;
  }
}

// ---------------------------------------------------------------------------
// Typed payment error
// ---------------------------------------------------------------------------

export type PaymentErrorCode =
  | 'BACKEND_UNAVAILABLE'
  | 'CREATE_ORDER_FAILED'
  | 'INVALID_CREATE_ORDER_RESPONSE'
  | 'AMOUNT_MISMATCH'
  | 'SDK_LOAD_FAILED'
  | 'SDK_NOT_READY'
  | 'PAYMENT_CANCELLED'
  | 'PAYMENT_FAILED'
  | 'VERIFY_PAYMENT_FAILED'
  | 'VERIFY_NETWORK_ERROR'
  | 'ORDER_UPDATE_FAILED'
  | 'CANCEL_FAILED'
  | 'INVALID_CHECKOUT_DATA';

export class PaymentError extends Error {
  constructor(
    public readonly code: PaymentErrorCode,
    message: string,
    public readonly cause?: unknown,
  ) {
    super(message);
    this.name = 'PaymentError';
  }
}
