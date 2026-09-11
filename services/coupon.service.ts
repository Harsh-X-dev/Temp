/**
 * Coupon validation and management service.
 * Connects to the Promo Coupons Backend API (/api/v1/coupons/validate).
 */

import { api, ApiError } from "@/services/http";
import type { Coupon, ValidateCouponPayload, ValidateCouponResponse } from "@/types/checkout.types";

export interface ValidateCouponParams {
  couponCode: string;
  subtotal: number;
  items?: Array<{
    productId: string;
    variantId?: string;
    quantity: number;
    price: number;
  }>;
  customerId?: string;
  paymentMethod?: "prepaid" | "cod";
}

export interface CouponValidationResult {
  success: boolean;
  valid: boolean;
  message: string;
  coupon?: Coupon;
  discountAmount: number;
  isFreeShipping?: boolean;
}

/**
 * Validate a promo coupon code against cart contents, minimum order requirements,
 * customer purchase history, and global/user limits via POST /api/v1/coupons/validate.
 */
export async function validateCouponApi(
  params: ValidateCouponParams
): Promise<CouponValidationResult> {
  const cleanCode = params.couponCode.trim().toUpperCase();
  if (!cleanCode) {
    return {
      success: false,
      valid: false,
      message: "Please enter a valid coupon code",
      discountAmount: 0,
      isFreeShipping: false,
    };
  }

  try {
    const payload: ValidateCouponPayload = {
      coupon_code: cleanCode,
      subtotal: params.subtotal,
      items: params.items?.map((item) => ({
        product_id: item.productId,
        variant_id: item.variantId,
        quantity: item.quantity,
        price: item.price,
      })),
      customer_id: params.customerId,
      payment_method: params.paymentMethod || "prepaid",
    };

    const response = await api.post<ValidateCouponResponse>("/coupons/validate", payload);
    const data = response.data;

    if (data && (data.valid || data.success) && data.coupon) {
      const c = data.coupon;
      const discountType: Coupon["discountType"] =
        c.discount_type === "percentage"
          ? "percentage"
          : c.discount_type === "free_shipping"
          ? "free_shipping"
          : "fixed";

      const mappedCoupon: Coupon = {
        id: c.id || c.code,
        code: c.code,
        description: c.description || data.message || null,
        discountType,
        discountValue: Number(c.discount_value) || 0,
        maxDiscountAmount: c.max_discount_amount ? Number(c.max_discount_amount) : null,
        minOrderAmount: c.min_order_amount ? Number(c.min_order_amount) : null,
        appliedDiscountAmount: data.discount_amount !== undefined ? Number(data.discount_amount) : undefined,
        isFreeShipping: !!data.is_free_shipping,
      };

      return {
        success: true,
        valid: true,
        message: data.message || `Coupon "${c.code}" applied!`,
        coupon: mappedCoupon,
        discountAmount: Number(data.discount_amount) || 0,
        isFreeShipping: !!data.is_free_shipping,
      };
    }

    return {
      success: true,
      valid: false,
      message: data?.message || `Coupon "${cleanCode}" is not applicable.`,
      discountAmount: 0,
      isFreeShipping: false,
    };
  } catch (error) {
    const apiErr = ApiError.from(error);
    return {
      success: false,
      valid: false,
      message: apiErr.message || "Failed to validate coupon.",
      discountAmount: 0,
      isFreeShipping: false,
    };
  }
}
