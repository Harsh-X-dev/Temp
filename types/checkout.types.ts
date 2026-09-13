/**
 * Checkout types — shared across the checkout store, service, and UI components.
 *
 * These types are checkout-specific. For addresses, we reuse the existing
 * `Address` interface from `@/components/account/types`.
 */

/** Identifies where the checkout session originated. */
export type CheckoutSource = "buy-now" | "cart";

/** A product line-item within a checkout session. */
export interface CheckoutItem {
  productId: string;
  variantId: string;
  title: string;
  price: number;
  compareAtPrice: number | null;
  imageUrl: string;
  variantLabel: string;
  quantity: number;
}

export interface Coupon {
  id: string;
  code: string;
  description: string | null;
  discountType: "percentage" | "fixed" | "fixed_amount" | "free_shipping";
  discountValue: number;
  maxDiscountAmount: number | null;
  minOrderAmount: number | null;
  requiresPrepaid?: boolean;
  startsAt?: string | null;
  endsAt?: string | null;
  appliedDiscountAmount?: number;
  isFreeShipping?: boolean;
}

export interface ValidateCouponPayload {
  coupon_code: string;
  subtotal?: number;
  items?: Array<{
    product_id: string;
    variant_id?: string;
    quantity: number;
    price: number;
  }>;
  customer_id?: string;
  payment_method?: "prepaid" | "cod";
}

export interface ValidateCouponResponse {
  success: boolean;
  valid: boolean;
  message?: string;
  coupon?: {
    id: string;
    code: string;
    discount_type: "percentage" | "fixed_amount" | "fixed" | "free_shipping";
    discount_value: number;
    min_order_amount?: number | null;
    max_discount_amount?: number | null;
    is_free_shipping?: boolean;
    description?: string | null;
  };
  discount_amount?: number;
  is_free_shipping?: boolean;
}

export interface CalculateCheckoutPayload {
  items: Array<{
    variant_id: string;
    quantity: number;
    is_energization_addon?: boolean;
  }>;
  coupon_code?: string | null;
  shipping_address?: {
    pincode?: string;
    city?: string;
    state?: string;
  } | null;
  payment_method?: "prepaid" | "cod";
  customer_id?: string | null;
}

export interface CalculateCheckoutItemData {
  product_id: string;
  variant_id: string;
  title: string;
  variant_title?: string;
  sku?: string;
  quantity: number;
  unit_price: number;
  compare_at_price?: number;
  is_energization_addon?: boolean;
  energization_price?: number;
  line_subtotal: number;
  line_savings: number;
  image_url?: string;
  in_stock: boolean;
  available_quantity: number;
}

export interface CalculateCheckoutResponse {
  success: boolean;
  message?: string;
  data?: {
    items: CalculateCheckoutItemData[];
    subtotal: number;
    discount_amount: number;
    coupon_applied?: {
      id: string;
      code: string;
      discount_type: string;
      discount_value: number;
      is_free_shipping: boolean;
    } | null;
    coupon_message?: string | null;
    shipping_amount: number;
    is_free_shipping: boolean;
    tax_amount: number;
    total: number;
    total_savings: number;
    total_weight_grams?: number;
    currency: string;
  };
}

import type { AddressType } from "@/components/account/types";

/** Computed bill breakdown for display in BillSummary. */
export interface BillBreakdown {
  subtotal: number;
  productDiscount: number;
  couponDiscount: number;
  deliveryCharges: number;
  taxes: number;
  grandTotal: number;
}

/** Form data for adding or editing an address. */
export interface AddressFormData {
  fullName?: string;
  phone?: string;
  email?: string;
  line1: string;
  line2?: string;
  city: string;
  state: string;
  pincode: string;
  country?: string;
  addressType: AddressType;
  isDefault?: boolean;
}

/** Payload for initial profile + address creation (POST /profiles/create-profile). */
export interface CreateProfileInput {
  userId: string;
  fullName: string;
  phone: string;
  emailId: string;
  gender?: string;
  birthDate?: string;
  line1: string;
  line2?: string;
  city: string;
  state: string;
  pincode: string;
  country?: string;
  addressType: AddressType;
  isDefault?: boolean;
}
