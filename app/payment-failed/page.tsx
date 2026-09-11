import { Suspense } from 'react';
import PaymentFailedClient from '@/components/checkout/PaymentFailedClient';

export default function PaymentFailedPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#fbf9f5]" />}>
      <PaymentFailedClient />
    </Suspense>
  );
}
