/**
 * Checkout service — client-side Supabase queries for the checkout flow.
 *
 * Uses the browser Supabase client (`createSupabaseBrowserClient`) since the
 * checkout page is a client component.
 *
 * Architecture: This module is the ONLY place checkout-related Supabase
 * queries live. Components never call Supabase directly.
 */
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Address } from "@/components/account/types";
import type {
  Coupon,
  AddressFormData,
  CheckoutItem,
  CalculateCheckoutPayload,
  CalculateCheckoutResponse,
} from "@/types/checkout.types";
import { api, ApiError } from "@/services/http";

import { fetchProfileWithAddresses, saveAddress } from "./profile.service";
import { isSyntheticEmail } from "@/lib/validators";

/**
 * Calculate Cart & Checkout prices via backend single-source-of-truth API:
 * POST /api/v1/checkout/calculate
 */
export async function calculateCheckoutPricesApi(
  payload: CalculateCheckoutPayload
): Promise<CalculateCheckoutResponse> {
  try {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    const cleanItems = (payload.items || [])
      .map((item) => {
        const cleanId = item.variant_id ? item.variant_id.replace("-energized", "").trim() : "";
        return {
          variant_id: cleanId,
          quantity: Math.max(1, Number(item.quantity) || 1),
          ...(item.is_energization_addon ? { is_energization_addon: true } : {}),
        };
      })
      .filter((item) => uuidRegex.test(item.variant_id));

    if (cleanItems.length === 0) {
      return {
        success: false,
        message: "No valid items found for checkout calculation",
      };
    }

    const cleanPayload: Record<string, any> = {
      items: cleanItems,
      payment_method: payload.payment_method || "prepaid",
    };

    if (payload.coupon_code && typeof payload.coupon_code === "string" && payload.coupon_code.trim()) {
      cleanPayload.coupon_code = payload.coupon_code.trim();
    }

    if (payload.customer_id && typeof payload.customer_id === "string" && uuidRegex.test(payload.customer_id.trim())) {
      cleanPayload.customer_id = payload.customer_id.trim();
    }

    if (payload.shipping_address && typeof payload.shipping_address === "object") {
      const addr: Record<string, string> = {};
      if (payload.shipping_address.pincode) addr.pincode = String(payload.shipping_address.pincode).trim();
      if (payload.shipping_address.city) addr.city = String(payload.shipping_address.city).trim();
      if (payload.shipping_address.state) addr.state = String(payload.shipping_address.state).trim();
      if (Object.keys(addr).length > 0) {
        cleanPayload.shipping_address = addr;
      }
    }

    const { data } = await api.post<CalculateCheckoutResponse>("/checkout/calculate", cleanPayload);
    return data;
  } catch (error) {
    const apiErr = ApiError.from(error);
    return {
      success: false,
      message: apiErr.message || "Failed to calculate checkout prices",
    };
  }
}

// ---------------------------------------------------------------------------
// Address queries
// ---------------------------------------------------------------------------

/**
 * Fetch all saved addresses for the authenticated user.
 * Returns [] if unauthenticated or on error.
 */
export async function fetchAddresses(
  supabase: SupabaseClient,
): Promise<Address[]> {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    if (typeof window !== 'undefined') {
      try {
        const local = localStorage.getItem('guest_addresses');
        if (local) return JSON.parse(local);
      } catch (e) {
        console.error('[CheckoutService] Failed to parse local addresses', e);
      }
    }
    return [];
  }

  try {
    const serverAddresses = await fetchProfileWithAddresses(supabase).then((r) => r.addresses);
    if (serverAddresses.length > 0) return serverAddresses;

    // Fallback to local storage if user just logged in or guest addresses exist
    if (typeof window !== 'undefined') {
      try {
        const local = localStorage.getItem('guest_addresses');
        if (local) return JSON.parse(local);
      } catch (e) {
        // ignore
      }
    }
    return [];
  } catch (error: any) {
    console.error("[CheckoutService] Failed to fetch addresses:", error?.message || error);
    if (typeof window !== 'undefined') {
      try {
        const local = localStorage.getItem('guest_addresses');
        if (local) return JSON.parse(local);
      } catch (e) {
        // ignore
      }
    }
    return [];
  }
}

/**
 * Insert a new address for the authenticated user or guest.
 * Returns the inserted address.
 */
export async function insertAddress(
  supabase: SupabaseClient,
  form: AddressFormData,
): Promise<Address | null> {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const fallbackAddr: Address = {
    id: typeof crypto !== 'undefined' && crypto.randomUUID ? `addr_${crypto.randomUUID()}` : `addr_${Date.now()}`,
    fullName: form.fullName || null,
    phone: form.phone || null,
    email: form.email || null,
    line1: form.line1,
    line2: form.line2 || null,
    city: form.city,
    state: form.state,
    pincode: form.pincode,
    country: form.country || 'India',
    addressType: form.addressType || 'home',
    isDefault: form.isDefault ?? false,
  };

  if (!user) {
    if (typeof window !== 'undefined') {
      try {
        const local = localStorage.getItem('guest_addresses');
        const addresses: Address[] = local ? JSON.parse(local) : [];
        if (addresses.length === 0 || fallbackAddr.isDefault) {
          addresses.forEach((a) => (a.isDefault = false));
          fallbackAddr.isDefault = true;
        }
        addresses.unshift(fallbackAddr);
        localStorage.setItem('guest_addresses', JSON.stringify(addresses));
      } catch (e) {
        console.error('[CheckoutService] Failed to save to localStorage', e);
      }
    }
    return fallbackAddr;
  }

  try {
    const saved = await saveAddress(supabase, {
      fullName: form.fullName,
      phone: form.phone,
      email: form.email,
      line1: form.line1,
      line2: form.line2 || undefined,
      city: form.city,
      state: form.state,
      pincode: form.pincode,
      country: form.country || "India",
      addressType: form.addressType || "home",
      isDefault: form.isDefault ?? false,
    });
    return saved;
  } catch (error: any) {
    console.error("[CheckoutService] saveAddress failed, returning fallback address:", error?.message || error);
    if (typeof window !== 'undefined') {
      try {
        const local = localStorage.getItem('guest_addresses');
        const addresses: Address[] = local ? JSON.parse(local) : [];
        if (addresses.length === 0 || fallbackAddr.isDefault) {
          addresses.forEach((a) => (a.isDefault = false));
          fallbackAddr.isDefault = true;
        }
        addresses.unshift(fallbackAddr);
        localStorage.setItem('guest_addresses', JSON.stringify(addresses));
      } catch (e) {
        // ignore
      }
    }
    return fallbackAddr;
  }
}

// ---------------------------------------------------------------------------
// Coupon queries
// ---------------------------------------------------------------------------

/**
 * Fetch all currently active and valid coupons.
 * Filters: is_active = true, within date range (if set).
 */
export const DEFAULT_FALLBACK_COUPONS: Coupon[] = [
  {
    id: "welcome10",
    code: "WELCOME10",
    description: "10% off on your first order up to ₹500",
    discountType: "percentage",
    discountValue: 10,
    maxDiscountAmount: 500,
    minOrderAmount: 0,
  },
  {
    id: "gem500",
    code: "GEM500",
    description: "Flat ₹500 off on orders above ₹4,999",
    discountType: "fixed",
    discountValue: 500,
    maxDiscountAmount: null,
    minOrderAmount: 4999,
  },
  {
    id: "divine15",
    code: "DIVINE15",
    description: "15% off on orders above ₹9,999 up to ₹1,500",
    discountType: "percentage",
    discountValue: 15,
    maxDiscountAmount: 1500,
    minOrderAmount: 9999,
  },
];

export async function fetchCoupons(
  supabase: SupabaseClient,
): Promise<Coupon[]> {
  const now = new Date().toISOString();

  const { data, error } = await supabase
    .from("coupons")
    .select("*")
    .eq("is_active", true)
    .or(`starts_at.is.null,starts_at.lte.${now}`)
    .or(`ends_at.is.null,ends_at.gte.${now}`)
    .order("created_at", { ascending: false });

  if (error || !data || data.length === 0) {
    if (error) {
      console.warn("[CheckoutService] Coupons table query note:", error.message);
    }
    return DEFAULT_FALLBACK_COUPONS;
  }

  return data.map((row) => ({
    id: row.id,
    code: row.code,
    description: row.description,
    discountType: row.discount_type as "percentage" | "fixed",
    discountValue: row.discount_value,
    maxDiscountAmount: row.max_discount_amount,
    minOrderAmount: row.min_order_amount,
    requiresPrepaid: row.requires_prepaid,
    startsAt: row.starts_at,
    endsAt: row.ends_at,
  }));
}

// ---------------------------------------------------------------------------
// Bill calculation helpers
export { validateCouponApi } from "@/services/coupon.service";
export { cancelOrderApi, verifyRazorpayPayment, markPaymentFailed } from "@/services/payment.service";

/**
 * Calculate the discount amount for a given coupon and subtotal.
 * Handles appliedDiscountAmount from API, percentage, fixed, and free_shipping.
 */
export function calculateCouponDiscount(
  coupon: Coupon | null,
  subtotal: number,
): number {
  if (!coupon) return 0;
  if (coupon.minOrderAmount && subtotal < coupon.minOrderAmount) return 0;
  if (coupon.discountType === "free_shipping" || coupon.isFreeShipping) return 0;

  if (coupon.appliedDiscountAmount !== undefined && coupon.appliedDiscountAmount !== null) {
    return Math.min(coupon.appliedDiscountAmount, subtotal);
  }

  let discount = 0;

  if (coupon.discountType === "percentage") {
    discount = (subtotal * coupon.discountValue) / 100;
    if (coupon.maxDiscountAmount) {
      discount = Math.min(discount, coupon.maxDiscountAmount);
    }
  } else {
    // Fixed or fixed_amount discount
    discount = coupon.discountValue;
  }

  // Discount cannot exceed subtotal
  return Math.min(discount, subtotal);
}

// ---------------------------------------------------------------------------
// Order creation
// ---------------------------------------------------------------------------

/**
 * Create a Cash on Delivery (COD) order directly using the Supabase client.
 * Relies on RLS for security.
 */
/**
 * Helper to build the unified order payload for both COD and Prepaid orders.
 */
function buildOrderPayload(
  user: any,
  profile: any,
  selectedAddress: any,
  params: any,
  paymentMethod: "cod" | "prepaid"
) {
  const customerName = profile?.fullName || user.user_metadata?.full_name || "Customer";
  const customerPhone = profile?.phone || user.phone || "";
  const customerEmail =
    profile?.email && !isSyntheticEmail(profile.email)
      ? profile.email
      : "";

  return {
    user_id: user.id,
    customer_name: customerName,
    customer_phone: customerPhone,
    customer_email: customerEmail,
    payment_method: paymentMethod,
    payment_status: "pending",
    payment_info: {
      subtotal: params.bill.subtotal,
      discount_amount: params.bill.productDiscount + params.bill.couponDiscount,
      coupon_code: params.coupon?.code || null,
      shipping_amount: params.bill.deliveryCharges,
      tax_amount: params.bill.taxes,
      total: params.bill.grandTotal,
      cashback_amount: 0,
      currency: "INR",
      payment_method: paymentMethod,
    },
    shipping_address: {
      id: selectedAddress.id,
      full_name: selectedAddress.fullName || customerName,
      phone: selectedAddress.phone || customerPhone,
      email: selectedAddress.email || customerEmail,
      address_type: selectedAddress.addressType || "home",
      line1: selectedAddress.line1,
      line2: selectedAddress.line2 || "",
      city: selectedAddress.city,
      state: selectedAddress.state,
      pincode: selectedAddress.pincode,
      country: selectedAddress.country || "India",
    },
    billing_address: {
      id: selectedAddress.id,
      full_name: selectedAddress.fullName || customerName,
      phone: selectedAddress.phone || customerPhone,
      email: selectedAddress.email || customerEmail,
      address_type: selectedAddress.addressType || "home",
      line1: selectedAddress.line1,
      line2: selectedAddress.line2 || "",
      city: selectedAddress.city,
      state: selectedAddress.state,
      pincode: selectedAddress.pincode,
      country: selectedAddress.country || "India",
    },
    product_info: params.items.map((item: any) => {
      const rawVariantId = item.variantId || null;
      const dbVariantId = rawVariantId ? rawVariantId.replace("-energized", "") : null;
      const isEnergizationAddon = rawVariantId ? rawVariantId.includes("-energized") : false;

      return {
        id: item.id || `item_${Math.random().toString(36).substr(2, 9)}`,
        product_id: item.productId || item.id,
        variant_id: dbVariantId,
        product_title: item.title,
        variant_title: item.variantLabel || null,
        quantity: item.quantity,
        unit_price: item.price,
        total_price: item.price * item.quantity,
        is_energization_addon: isEnergizationAddon,
        image_url: item.imageUrl || "",
      };
    }),
    notes: paymentMethod === "cod" ? "Cash on Delivery" : "Prepaid Order",
  };
}

/**
 * Create a Cash on Delivery (COD) order.
 */
export async function createCodOrder(
  supabase: SupabaseClient,
  params: {
    address_id: string;
    items: any[];
    coupon: Coupon | null;
    bill: {
      subtotal: number;
      productDiscount: number;
      couponDiscount: number;
      deliveryCharges: number;
      taxes: number;
      grandTotal: number;
    };
    user?: any;
    profile?: any;
    address?: any;
  },
): Promise<{ orderId: string }> {
  let user = params.user;
  if (!user) {
    const { data: sessionData } = await supabase.auth.getSession();
    user = sessionData?.session?.user;
  }

  if (!user) {
    throw new Error("Unauthorized");
  }

  let profile = params.profile;
  let selectedAddress = params.address;

  if (!profile || !selectedAddress) {
    const { profile: fetchedProfile, addresses } = await fetchProfileWithAddresses(supabase);
    if (!profile) profile = fetchedProfile;
    if (!selectedAddress) {
      selectedAddress = addresses.find((a) => a.id === params.address_id) || null;
      if (!selectedAddress && addresses.length > 0) {
        selectedAddress = addresses[0];
      }
    }
  }

  if (!selectedAddress && typeof window !== 'undefined') {
    try {
      const local = localStorage.getItem('guest_addresses');
      if (local) {
        const parsed = JSON.parse(local);
        selectedAddress = parsed.find((a: any) => a.id === params.address_id) || parsed[0];
      }
    } catch {}
  }

  if (!selectedAddress) {
    throw new Error("Selected address not found");
  }

  const payload = buildOrderPayload(user, profile, selectedAddress, params, "cod");

  try {
    const response = await api.post("/orders/cod", payload);
    if (!response.data.success) {
      throw new Error(response.data.message || "Failed to create order");
    }
    return { orderId: response.data.order.order_number };
  } catch (error: any) {
    throw new Error(error.response?.data?.message ?? error.message ?? "Checkout failed.");
  }
}

export interface PrepaidOrderResponse {
  internalId: string;
  orderNumber: string;
  razorpayOrderId: string;
  keyId: string;
  amount: number;
  currency: string;
}

/**
 * Create a Prepaid order. Inserts order in DB (pending) & generates Razorpay Order ID.
 */
export async function createPrepaidOrder(
  supabase: SupabaseClient,
  params: {
    address_id: string;
    items: any[];
    coupon: Coupon | null;
    bill: {
      subtotal: number;
      productDiscount: number;
      couponDiscount: number;
      deliveryCharges: number;
      taxes: number;
      grandTotal: number;
    };
    user?: any;
    profile?: any;
    address?: any;
  },
): Promise<PrepaidOrderResponse> {
  let user = params.user;
  if (!user) {
    const { data: sessionData } = await supabase.auth.getSession();
    user = sessionData?.session?.user;
  }

  if (!user) {
    throw new Error("Unauthorized");
  }

  let profile = params.profile;
  let selectedAddress = params.address;

  if (!profile || !selectedAddress) {
    const { profile: fetchedProfile, addresses } = await fetchProfileWithAddresses(supabase);
    if (!profile) profile = fetchedProfile;
    if (!selectedAddress) {
      selectedAddress = addresses.find((a) => a.id === params.address_id) || null;
      if (!selectedAddress && addresses.length > 0) {
        selectedAddress = addresses[0];
      }
    }
  }

  if (!selectedAddress && typeof window !== 'undefined') {
    try {
      const local = localStorage.getItem('guest_addresses');
      if (local) {
        const parsed = JSON.parse(local);
        selectedAddress = parsed.find((a: any) => a.id === params.address_id) || parsed[0];
      }
    } catch {}
  }

  if (!selectedAddress) {
    throw new Error("Selected address not found");
  }

  const payload = buildOrderPayload(user, profile, selectedAddress, params, "prepaid");

  try {
    const response = await api.post("/orders/create-order", payload);
    const data = response.data;

    if (!data.success) {
      throw new Error(data.message || "Failed to create prepaid order");
    }

    if (!data.order_id || !data.key_id || data.amount == null || !data.currency || !data.order) {
      throw new Error("Received an incomplete response from the payment server.");
    }

    return {
      internalId: data.order.id, // DB Order UUID
      orderNumber: data.order.order_number,
      razorpayOrderId: data.order_id,
      keyId: data.key_id,
      amount: data.amount,
      currency: data.currency,
    };
  } catch (error: any) {
    throw new Error(error.response?.data?.message ?? error.message ?? "Checkout failed.");
  }
}

// ---------------------------------------------------------------------------
// Buy Now item reconstruction
// ---------------------------------------------------------------------------

/**
 * Reconstruct a Buy Now item by fetching authoritative product and variant data.
 * Used when a user visits /cart?product=<slug> on cold load or after a checkout refresh.
 */
export async function fetchBuyNowItem(
  supabase: SupabaseClient,
  productSlug: string,
  variantId?: string | null,
  qty: number = 1,
  energized?: boolean,
): Promise<CheckoutItem | null> {
  if (!productSlug) return null;

  const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(productSlug);

  let query = supabase
    .from("products")
    .select(`
      id,
      title,
      slug,
      is_energized,
      energization_addon_price,
      product_images ( url, position ),
      product_variants ( id, sku, option1_value, option2_value, option3_value, price, compare_at_price, is_active )
    `)
    .eq("status", "active");

  if (isUuid) {
    query = query.eq("id", productSlug);
  } else {
    query = query.eq("slug", productSlug);
  }

  const { data: product, error } = await query.maybeSingle();

  if (error || !product) {
    console.error("[CheckoutService] Failed to reconstruct Buy Now product:", error?.message);
    return null;
  }

  // Pick lowest position image
  const sortedImages = [...(product.product_images ?? [])].sort(
    (a: any, b: any) => a.position - b.position,
  );
  const imageUrl = sortedImages[0]?.url ?? "";

  // Resolve variants
  const activeVariants = (product.product_variants ?? []).filter((v: any) => v.is_active);

  // Clean variantId (strip '-energized' if passed)
  const targetVariantId = variantId ? variantId.replace('-energized', '') : null;

  const selectedVariant = (targetVariantId ? activeVariants.find((v: any) => v.id === targetVariantId) : null) || activeVariants[0];

  if (!selectedVariant) {
    console.error("[CheckoutService] No active variant found for product:", product.title);
    return null;
  }

  const hasEnergizedAddon = Boolean(energized && product.is_energized && product.energization_addon_price);
  const currentAddonPrice = hasEnergizedAddon ? (product.energization_addon_price || 0) : 0;

  const finalPrice = selectedVariant.price + currentAddonPrice;
  const finalCompareAtPrice = selectedVariant.compare_at_price != null
    ? selectedVariant.compare_at_price + currentAddonPrice
    : null;

  const variantIdToUse = currentAddonPrice > 0 ? `${selectedVariant.id}-energized` : (selectedVariant.id || "");
  const optValues = [selectedVariant.option1_value, selectedVariant.option2_value, selectedVariant.option3_value].filter(
    (val): val is string => Boolean(val && val !== "Default")
  );
  const baseLabel = optValues.length > 0 ? optValues.join(", ") : "One size";
  const variantLabelToUse = currentAddonPrice > 0 ? `${baseLabel} (Energized)` : baseLabel;

  return {
    productId: product.id,
    variantId: variantIdToUse,
    title: product.title,
    price: finalPrice,
    compareAtPrice: finalCompareAtPrice,
    imageUrl,
    variantLabel: variantLabelToUse,
    quantity: Math.max(1, qty),
  };
}

