import { Suspense } from 'react';
import CheckoutPage from '@/components/checkout/CheckoutPageClient';

export const metadata = {
  title: 'Checkout | Gemostone',
  description: 'Complete your purchase — review items, select address, apply coupons, and proceed to payment.',
};

export default function Page() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-surface-neutral" />}>
      <CheckoutPage />
    </Suspense>
  );
}
