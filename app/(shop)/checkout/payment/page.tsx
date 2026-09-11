import { Suspense } from 'react';
import CheckoutPaymentClient from "@/components/checkout/CheckoutPaymentClient";

export default function CheckoutPaymentPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-surface-subtle" />}>
      <CheckoutPaymentClient />
    </Suspense>
  );
}
