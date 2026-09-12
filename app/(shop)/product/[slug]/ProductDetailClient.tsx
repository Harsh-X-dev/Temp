"use client";

import { useEffect, useState } from "react";
import ProductDetailLoading from "./loading";

interface ProductDetailClientProps {
  children: React.ReactNode;
  slug: string;
}

export default function ProductDetailClient({
  children,
  slug,
}: ProductDetailClientProps) {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(true);
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 280);
    return () => clearTimeout(timer);
  }, [slug]);

  if (isLoading) {
    return <ProductDetailLoading />;
  }

  return <>{children}</>;
}
