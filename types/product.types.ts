export interface ProductImage {
  id: string;
  url: string;
  altText: string;
  position: number;
}

export interface ProductOption {
  id: string;
  name: string;
  position: number;
  values: string[]; // Added for convenience in rendering variant selectors
}

export interface ProductVariant {
  id: string;
  sku: string;
  option1Value: string | null;
  option2Value: string | null;
  option3Value: string | null;
  price: number;
  compareAtPrice: number | null;
  inventoryQuantity: number;
  lowStockThreshold: number;
  weightGrams: number | null;
  imageId: string | null;
  isActive: boolean;
}

export interface ProductSpecification {
  id: string;
  specKey: string;
  specValue: string;
  position: number;
}

export interface ProductCertification {
  id: string;
  labName: string;
  certificateNumber: string;
  fileUrl: string;
  issueAt?: string;
}

export interface Review {
  id: string;
  rating: number;
  title: string | null;
  body: string;
  customerName: string; // Denormalized for the mock
  isVerifiedPurchase: boolean;
  createdAt: string;
  images?: string[];
  helpfulCount?: number;
}

export interface Product {
  id: string;
  title: string;
  slug: string;
  shortDescription: string;
  description: string;
  status: 'draft' | 'active' | 'archived';
  isEnergized: boolean;
  energizationAddonPrice: number | null;
  tags?: string[];
  energizationDetails?: {
    templeName: string;
    description: string;
    location?: string;
  };
  deliveryDetails?: {
    estimatedDays: string;
    returnPolicy: string;
  };
  details?: {
    material: string;
    origin: string;
    mukhiType: string;
    purpose: string;
    bestFor: string;
    rulingPlanet: string;
    moolank: string;
    energizedAt: string;
    about: string;
  };

  images: ProductImage[];
  options: ProductOption[];
  variants: ProductVariant[];
  specifications: ProductSpecification[];
  certifications: ProductCertification[];
  
  reviewsList: Review[];
  rating: number;
  reviewCount: number;
  
  crossSellProducts: Partial<Product>[]; // simplified for mock
}

export type ProductCardVariant = "shopping" | "wishlist" | "compact";

export interface ProductCardProduct {
  id: string;
  href: string;
  name: string;
  imageUrl: string;
  currentPrice: string | number;
  originalPrice?: string | number | null;
  category?: string;
  rating?: number;
  reviewCount?: number;
  isCertified?: boolean;
  inStock?: boolean;
  tags?: string[];
  defaultVariantId?: string;
  defaultVariantSku?: string;
  defaultVariantLabel?: string;
  options?: ProductOption[];
  variants?: any[];
}

export interface BaseProductComponentProps {
  product: ProductCardProduct;
  variant?: ProductCardVariant;
}
