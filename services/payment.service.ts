/**
 * Payment service — HTTP communication with the GemOstone backend for payments.
 *
 * Architecture rules:
 *  - Uses the shared api axios instance from lib/api.ts (never creates its own).
 *  - Never exposes RAZORPAY_KEY_SECRET or RAZORPAY_WEBHOOK_SECRET.
 *  - Never calls the /payment/webhook endpoint (Razorpay calls it directly).
 *  - Never performs HMAC signature verification in the browser.
 *
 * Endpoints consumed:
 *  POST /api/v1/orders/create-payment
 *  POST /api/v1/orders/verify-payment
 *  POST /api/v1/orders/payment-failed
 */

import { api } from '@/services/http';
import type {
  CreateRazorpayOrderRequest,
  CreateRazorpayOrderResponse,
  VerifyRazorpayPaymentRequest,
  VerifyRazorpayPaymentResponse,
  MarkPaymentFailedRequest,
  MarkPaymentFailedResponse,
  CancelOrderRequest,
  CancelOrderResponse,
} from '@/types/payment.types';
import { PaymentError } from '@/types/payment.types';

// ---------------------------------------------------------------------------
// createRazorpayOrder
// ---------------------------------------------------------------------------

/**
 * Creates a Razorpay payment order via the backend.
 *
 * @param params.amount   - Final checkout amount in RUPEES. Do NOT convert to paise.
 * @param params.currency - Always "INR".
 * @param params.product_id - Internal GemOstone order number/reference.
 *
 * @returns The full backend response, typed as CreateRazorpayOrderResponse.
 * @throws  PaymentError with an appropriate code on any failure.
 */
export async function createRazorpayOrder(
  params: CreateRazorpayOrderRequest,
): Promise<CreateRazorpayOrderResponse> {
  let response;
  try {
    response = await api.post<CreateRazorpayOrderResponse>('/api/v1/orders/create-payment', params);
  } catch (err: any) {
    if (err.response) {
      response = err.response;
    } else {
      throw new PaymentError(
        'BACKEND_UNAVAILABLE',
        'Unable to connect to the payment server. Please check your connection and try again.',
        err,
      );
    }
  }

  const data = response.data;

  if (!data || data.success === false) {
    throw new PaymentError(
      'CREATE_ORDER_FAILED',
      data?.message || 'Unable to initialise payment. Please try again.',
    );
  }

  // Validate required fields in the success response
  if (!data.order_id || !data.key_id || data.amount == null || !data.currency) {
    throw new PaymentError(
      'INVALID_CREATE_ORDER_RESPONSE',
      'Received an incomplete response from the payment server. Please try again.',
    );
  }

  return data;
}

// ---------------------------------------------------------------------------
// verifyRazorpayPayment
// ---------------------------------------------------------------------------

/**
 * Sends the Razorpay callback values & DB Order ID to the backend for HMAC
 * signature verification and order confirmation.
 *
 * The frontend MUST NOT perform signature verification itself.
 * The frontend MUST NOT expose RAZORPAY_KEY_SECRET.
 *
 * @throws PaymentError on network failure or failed verification.
 */
export async function verifyRazorpayPayment(
  params: VerifyRazorpayPaymentRequest,
): Promise<VerifyRazorpayPaymentResponse> {
  let response;
  try {
    response = await api.post<VerifyRazorpayPaymentResponse>('/orders/verify-payment', params);
  } catch (err: any) {
    if (err.response) {
      response = err.response;
    } else {
      // Network failure AFTER payment is a special case — the payment may have
      // gone through even if this request fails. Surface a distinct error code.
      throw new PaymentError(
        'VERIFY_NETWORK_ERROR',
        "We couldn't confirm the payment right now. Please check your order status before trying again.",
        err,
      );
    }
  }

  const data = response.data;

  if (!data || data.success === false) {
    throw new PaymentError(
      'VERIFY_PAYMENT_FAILED',
      data?.message || 'We could not verify your payment. Please contact support if the amount was debited.',
    );
  }

  return data;
}

// ---------------------------------------------------------------------------
// markPaymentFailed
// ---------------------------------------------------------------------------

/**
 * Informs the backend that a payment flow was cancelled by the user or
 * declined by the bank, marking the DB order as 'failed'.
 */
export async function markPaymentFailed(
  params: MarkPaymentFailedRequest,
): Promise<MarkPaymentFailedResponse> {
  let response;
  try {
    response = await api.post<MarkPaymentFailedResponse>('/orders/payment-failed', params);
  } catch (err: any) {
    if (err.response) {
      response = err.response;
    } else {
      throw new PaymentError(
        'ORDER_UPDATE_FAILED',
        "Network error while updating order status.",
        err,
      );
    }
  }

  const data = response.data;

  if (!data || data.success === false) {
    throw new PaymentError(
      'ORDER_UPDATE_FAILED',
      data?.message || 'Failed to update order status.',
    );
  }

  return data;
}

// ---------------------------------------------------------------------------
// cancelOrderApi
// ---------------------------------------------------------------------------

/**
 * Cancels an order before shipment.
 * Endpoint: POST /api/v1/orders/cancel
 */
export async function cancelOrderApi(
  params: CancelOrderRequest,
): Promise<CancelOrderResponse> {
  let response;
  try {
    response = await api.post<CancelOrderResponse>('/orders/cancel', params);
  } catch (err: any) {
    if (err.response) {
      response = err.response;
    } else {
      throw new PaymentError(
        'CANCEL_FAILED',
        'Network error while cancelling order.',
        err,
      );
    }
  }

  const data = response.data;

  if (!data || data.success === false) {
    throw new PaymentError(
      'CANCEL_FAILED',
      data?.message || 'Failed to cancel order.',
    );
  }

  return data;
}