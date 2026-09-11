"use client";

import ClientLink from "@/components/ui/navigation/ClientLink";
import ProductImage from "./ProductImage";
import ProductInfo from "./ProductInfo";
import ProductPrice from "./ProductPrice";
import ProductFooter from "./ProductFooter";
import { logProductEngagementClick } from "@/services/search.client.service";
import { BaseProductComponentProps } from "@/types/product.types";

export default function ProductCard({ product, variant = "shopping" }: BaseProductComponentProps) {
  return (
    <div className="group flex min-w-0 flex-1 flex-col w-full">
      <ClientLink 
        href={product.href} 
        prefetch={true} 
        onClick={() => logProductEngagementClick(product.id, product.name)}
        className="flex min-w-0 flex-1 flex-col focus-visible:outline-none"
      >
        <ProductImage product={product} variant={variant} />
        
        <div className="flex flex-col mt-2.5 gap-1 w-full">
          <ProductInfo product={product} variant={variant} />
          <ProductPrice product={product} variant={variant} />
        </div>
      </ClientLink>

      
      {variant === "wishlist" && (
        <div className="pt-2">
          <ProductFooter product={product} variant={variant} />
        </div>
      )}
    </div>
  );
}
