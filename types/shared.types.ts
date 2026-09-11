export interface ProductOption {
  id?: string;
  name: string;
  position?: number;
  values: string[];
}

export interface ProductVariant {
  id: string;
  sku: string;
  label: string;
  option1Value?: string | null;
  option2Value?: string | null;
  option3Value?: string | null;
  price: number;
  compareAtPrice: number | null;
  isActive: boolean;
}

export interface Product {
  id: string;
  name: string;
  price: string;
  /** Optional MRP for strikethrough discount display */
  mrp?: string;
  imageUrl: string;
  certified?: boolean;
  /** Category slug this product belongs to (matches CATEGORIES slug) */
  category?: string;
  /** Product slug for PDP URL routing */
  slug?: string;
  /** Array of tags like 'BESTSELLER', 'NEW' */
  tags?: string[];
  /** Array of collection titles or slugs this product belongs to */
  collections?: string[];
  rating?: number;
  reviewCount?: number;
  defaultVariantId?: string;
  defaultVariantSku?: string;
  defaultVariantLabel?: string;
  options?: ProductOption[];
  variants?: ProductVariant[];
  attributes?: Record<string, any>;
}

export interface NavItem {
  id: string;
  label: string;
  imageUrl: string;
  imageWidth: number;
  imageHeight: number;
  /** Destination href — used by BottomNav and Navbar for Link routing */
  href: string;
  active?: boolean;
}

export interface Category {
  id: string;
  label: string;
  /** Absolute URL or local path for the category icon image */
  icon?: string;
}

export interface CategoryConfig extends Category {
  /** Supabase storage URL for the circular icon image. */
  icon: string;
}

