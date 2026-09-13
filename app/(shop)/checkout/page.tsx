import { Suspense } from "react";
import CheckoutPage from "@/components/checkout/CheckoutPageClient";
import CheckoutLoading from "./loading";

export const metadata = {
  title: "Checkout | Gemostone",
  description: "Complete your purchase — review items, select address, apply coupons, and proceed to payment.",
};

export default function Page() {
  return (
    <Suspense fallback={<CheckoutLoading />}>
      <CheckoutPage />
    </Suspense>
  );
}
