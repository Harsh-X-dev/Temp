// Shared types for the Account/Profile page system

export type OrderStatus =
  | "pending"
  | "confirmed"
  | "processing"
  | "shipped"
  | "out_for_delivery"
  | "delivered"
  | "cancelled"
  | "returned"
  | "refunded";

export type AddressType = "home" | "work" | "other";

export interface UserProfile {
  id: string;
  fullName: string | null;
  phone: string | null;
  avatarUrl: string | null;
  email: string | null;
  dob?: string | null;
  gender?: string | null;
  role?: string | null;
  createdAt?: string | null;
  updatedAt?: string | null;
}

export interface Address {
  id: string;
  fullName?: string | null;
  phone?: string | null;
  email?: string | null;
  line1: string;
  line2?: string | null;
  city: string;
  state: string;
  pincode: string;
  country: string;
  addressType: AddressType;
  isDefault: boolean;
}

export interface OrderItem {
  id: string;
  productId?: string; // added to cross-check reviews
  productSlug?: string | null; // used to build write-review links
  productTitle: string;
  variantTitle?: string | null;
  quantity: number;
  unitPrice: number;
  imageUrl?: string | null;
}

export interface Order {
  id: string;
  orderNumber: string;
  status: OrderStatus;
  total: number;
  placedAt: string;
  items: OrderItem[];
}

export interface OrderTrackingEvent {
  title: string;
  timestamp: string | null;
  status: "completed" | "current" | "pending";
  description?: string;
  trackingUrl?: string | null;
  trackingNumber?: string | null;
}

export interface OrderDeliveryAddress {
  fullName: string;
  fullAddress: string;
}

export interface OrderPaymentSummary {
  subtotal: number;
  shipping: number;
  discountApplied: number;
  gst: number;
  codFee?: number;
  paymentMethod?: string;
  totalPaid: number;
}

export interface OrderDetail extends Order {
  trackingEvents: OrderTrackingEvent[];
  deliveryAddress: OrderDeliveryAddress | null;
  paymentSummary: OrderPaymentSummary;
  trackingNumber?: string | null;
  trackingUrl?: string | null;
  confirmedAt?: string | null;
  shippedAt?: string | null;
  outForDeliveryAt?: string | null;
  deliveredAt?: string | null;
}

export interface Review {
  id: string;
  productId: string;
  productSlug: string;
  productTitle: string;
  productImageUrl?: string | null;
  rating: number;
  title?: string | null;
  body?: string | null;
  isVerifiedPurchase: boolean;
  createdAt: string;
}

export interface PendingReview {
  id: string;
  orderId?: string;
  productId: string;
  productSlug: string;
  productTitle: string;
  productImageUrl?: string | null;
  price: number;
  purchasedAt: string;
  isVerifiedPurchase: boolean;
}
