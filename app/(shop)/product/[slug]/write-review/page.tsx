import React, { Suspense } from 'react';
import { notFound } from 'next/navigation';
import { createSupabaseServerClient } from '@/services/supabase/server';
import WriteReviewClient from '@/components/productDetailPage/WriteReviewClient';
import WriteReviewSkeleton from '@/components/reviews/WriteReviewSkeleton';

export const revalidate = 60;
export const dynamicParams = true;

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return {
    title: 'Write a Review | Gemostone',
    description: `Share your experience and review products on Gemostone.`,
  };
}

export default async function WriteReviewPage({ 
  params, 
  searchParams 
}: { 
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ orderId?: string; orderItemId?: string }>;
}) {
  const { slug } = await params;
  const { orderId, orderItemId } = await searchParams;
  const supabase = createSupabaseServerClient();

  // Fetch product with variants and images in a single fast query
  const { data: product, error } = await supabase
    .from('products')
    .select(`
      id,
      title,
      slug,
      product_variants (
        id,
        price,
        compare_at_price,
        is_active
      ),
      product_images (
        url,
        position
      )
    `)
    .eq('slug', slug)
    .eq('status', 'active')
    .maybeSingle();

  if (error || !product) {
    if (error) console.error('Error fetching product for review:', error);
    notFound();
  }

  // Pick active variant and main image from the joined result
  const activeVariants = (product.product_variants || []).filter((v: any) => v.is_active);
  const mainVariant = activeVariants.length > 0 ? activeVariants[0] : product.product_variants?.[0];

  const sortedImages = (product.product_images || []).sort(
    (a: any, b: any) => (a.position ?? 0) - (b.position ?? 0)
  );
  const mainImage = sortedImages[0]?.url || '';

  const productInfo = {
    id: product.id,
    title: product.title,
    slug: product.slug,
    price: mainVariant?.price || 0,
    compareAtPrice: mainVariant?.compare_at_price || null,
    imageUrl: mainImage,
  };

  const resolvedOrderId = orderId || orderItemId;

  return (
    <Suspense fallback={<WriteReviewSkeleton />}>
      <WriteReviewClient product={productInfo} orderItemId={resolvedOrderId} />
    </Suspense>
  );
}
