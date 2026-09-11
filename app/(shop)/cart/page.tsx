import CartPage from '@/components/cart/CartPage';
import { Suspense } from 'react';

export const metadata = {
  title: 'Your Cart | Gemostone',
  description: 'Review your items and proceed to checkout.',
};

export default function Page() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#f9f9f9]" />}>
      <CartPage />
    </Suspense>
  );
}
