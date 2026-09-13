import CartPage from "@/components/cart/CartPage";
import CartSkeleton from "@/components/cart/CartSkeleton";
import { Suspense } from "react";

export const metadata = {
  title: "Your Cart | Gemostone",
  description: "Review your items and proceed to checkout.",
};

export default function Page() {
  return (
    <Suspense fallback={<CartSkeleton isBuyNow={true} />}>
      <CartPage />
    </Suspense>
  );
}
