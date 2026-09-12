import React, { Suspense, cache } from 'react';
import { unstable_cache } from 'next/cache';
import { notFound } from 'next/navigation';
import { createSupabaseServerClient } from '@/services/supabase/server';
import { getAllProductSlugs } from '@/services/product.service';
import { fetchProductReviews } from '@/services/reviews.service';
import TopNavigation from '@/components/productDetailPage/TopNavigation';
import ProductGallery from '@/components/productDetailPage/ProductGallery';
import ProductHeader from '@/components/productDetailPage/ProductHeader';
import ProductPurchaseCard from '@/components/productDetailPage/ProductPurchaseCard';
import SectionTabs from '@/components/productDetailPage/SectionTabs';
import ProductDescription from '@/components/productDetailPage/sections/ProductDescription';
import ProductDetails from '@/components/productDetailPage/ProductDetails';
import SpecificationsTable from '@/components/productDetailPage/cards/SpecificationsTable';
import CertificationBlock from '@/components/productDetailPage/sections/CertificationBlock';
import ReviewsSection from '@/components/productDetailPage/sections/ReviewsSection';
import CrossSell from '@/components/productDetailPage/sections/CrossSell';

export const revalidate = 60;
export const dynamicParams = true;

const getCachedProductDetail = unstable_cache(
  async (slug: string) => {
    const supabase = createSupabaseServerClient();
    const { data: product, error } = await supabase
      .from('products')
      .select(`
        id,
        title,
        slug,
        description,
        short_description,
        best_for,
        is_energized,
        energization_addon_price,
        tags,
        options,
        materials!products_material_id_fkey ( name ),
        product_materials ( materials ( name ) ),
        origins ( name ),
        mukhi_types ( special_name, mukhi_count, mythology, benefits, planets ( name ) ),
        product_purposes ( purposes ( title, slug ) ),
        product_moolanks ( moolank_number ),
        product_planets ( planets ( name ) ),
        product_temples ( temples ( name, city, state, description ) ),
        product_variants (
          id,
          sku,
          option1_value,
          option2_value,
          option3_value,
          price,
          compare_at_price,
          inventory_quantity,
          low_stock_threshold,
          weight_grams,
          is_active
        ),
        product_images (
          id,
          url,
          alt_text,
          position
        ),
        product_certifications (
          id,
          lab_name,
          certificate_number,
          file_url,
          issued_at
        ),
        product_specifications (
          id,
          spec_key,
          spec_value,
          position
        ),
        reviews (
          id,
          is_approved,
          review_content
        )
      `)
      .eq('slug', slug)
      .eq('status', 'active')
      .maybeSingle();

    if (error || !product) {
      if (error) console.error('Error fetching product:', error.message || error);
      return null;
    }

    let resolvedMukhi = (product as any).mukhi_types;
    if (!resolvedMukhi) {
      const mukhiAttr = (product as any).attributes?.mukhi;
      const match = (mukhiAttr || (product as any).title || (product as any).slug)?.match(/(\d+)\s*Mukhi/i);
      const mukhiCount = match ? parseInt(match[1], 10) : ((product as any).slug?.includes('rudraksha') ? 5 : null);
      if (mukhiCount) {
        const { data: mData } = await supabase
          .from('mukhi_types')
          .select('special_name, mukhi_count, mythology, benefits, planets ( name )')
          .eq('mukhi_count', mukhiCount)
          .maybeSingle();
        if (mData) {
          resolvedMukhi = mData;
        }
      }
    }

    return {
      ...product,
      resolved_mukhi_type: resolvedMukhi,
    };
  },
  ['pdp-product-detail-data'],
  { revalidate: 60, tags: ['products'] }
);


const getCachedCrossSells = unstable_cache(
  async (currentProductId: string) => {
    const supabase = createSupabaseServerClient();
    const { data: crossSellsData, error } = await supabase
      .from('products')
      .select(`
        id, title, slug, short_description, is_energized, energization_addon_price, tags,
        product_images ( id, url, alt_text, position ),
        product_variants ( id, sku, price, compare_at_price, inventory_quantity, low_stock_threshold, weight_grams, is_active )
      `)
      .eq('status', 'active')
      .neq('id', currentProductId)
      .limit(4);

    if (error || !crossSellsData) return [];
    return crossSellsData;
  },
  ['pdp-cross-sells-data'],
  { revalidate: 60, tags: ['products'] }
);

// ---------------------------------------------------------------------------
// Inline Streaming Skeletons & Server Components (Zero Extra Files)
// ---------------------------------------------------------------------------

function ReviewsSkeleton() {
  return (
    <div className="flex flex-col gap-[16px] items-start w-full animate-pulse">
      <div className="h-6 w-44 bg-surface-subtle rounded-md" />
      <div className="bg-surface-subtle border border-border-strong rounded-[12px] w-full p-4 flex flex-col gap-4">
        <div className="h-8 w-32 bg-white rounded-md" />
        <div className="space-y-2">
          <div className="h-4 w-full bg-white rounded-md" />
          <div className="h-4 w-3/4 bg-white rounded-md" />
        </div>
      </div>
    </div>
  );
}

async function AsyncReviewsSection({
  productId,
  productSlug,
  initialRating = 0,
  initialReviewCount = 0,
}: {
  productId: string;
  productSlug: string;
  initialRating?: number;
  initialReviewCount?: number;
}) {
  const supabase = createSupabaseServerClient();
  const reviewsList = await fetchProductReviews(productId, supabase);
  const safeReviewsList = reviewsList || [];
  const reviewCount = safeReviewsList.length || initialReviewCount;
  const rating =
    safeReviewsList.length > 0
      ? safeReviewsList.reduce((sum, r) => sum + r.rating, 0) / safeReviewsList.length
      : initialRating;

  return (
    <ReviewsSection
      rating={rating}
      reviewCount={reviewCount}
      reviews={safeReviewsList}
      productSlug={productSlug}
      productId={productId}
    />
  );
}

function CrossSellSkeleton() {
  return (
    <div className="w-full animate-pulse pt-2.5 pb-2 bg-[#fbf8f4]">
      <div className="h-5 w-36 bg-[#e5e0da] rounded-md mb-2.5 mx-4 md:mx-8" />
      <div className="flex overflow-hidden">
        <div className="shrink-0 w-4 md:w-8" />
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="w-[160px] flex flex-col gap-1.5 shrink-0 pr-3">
            <div className="w-[160px] h-[160px] bg-[#e5e0da] rounded-[12px]" />
            <div className="h-4 w-28 bg-[#e5e0da] rounded" />
            <div className="h-3.5 w-16 bg-[#e5e0da] rounded" />
          </div>
        ))}
      </div>
    </div>
  );
}

async function AsyncCrossSell({ currentProductId }: { currentProductId: string }) {
  const crossSellsData = await getCachedCrossSells(currentProductId);

  if (!crossSellsData || crossSellsData.length === 0) {
    return null;
  }

  const crossSellProducts = crossSellsData.map((cs: any) => {
    const img = (cs.product_images || []).sort(
      (a: any, b: any) => (a.position ?? 0) - (b.position ?? 0)
    )[0];
    const mappedVariants = (cs.product_variants || []).map((v: any) => ({
      id: v.id || v.sku,
      sku: v.sku,
      option1Value: 'Default',
      price: v.price,
      compareAtPrice: v.compare_at_price,
      inventoryQuantity: v.inventory_quantity,
      lowStockThreshold: v.low_stock_threshold,
      weightGrams: v.weight_grams,
      isActive: v.is_active,
      imageId: img ? img.id : undefined,
    }));

    return {
      id: cs.id,
      title: cs.title,
      slug: cs.slug,
      shortDescription: cs.short_description,
      isEnergized: cs.is_energized,
      energizationAddonPrice: cs.energization_addon_price,
      tags: cs.tags,
      images: img
        ? [
            {
              id: img.id,
              url: img.url,
              altText: img.alt_text,
              position: img.position,
            },
          ]
        : [],
      options: [],
      variants: mappedVariants,
      rating: 5.0,
      reviewCount: 0,
    };
  });

  return <CrossSell products={crossSellProducts} />;
}

export async function generateStaticParams() {
  const slugs = await getAllProductSlugs();
  return slugs.map((slug) => ({ slug }));
}

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const product = await getCachedProductDetail(slug);

  if (!product) {
    notFound();
  }

  const pData = product as any;


  // 1. Variants mapping
  const rawVariants = (pData.product_variants || []).filter((v: any) => v.is_active);
  const variants = rawVariants
    .sort((a: any, b: any) => (a.price ?? 0) - (b.price ?? 0))
    .map((v: any) => ({
      id: v.id,
      sku: v.sku,
      option1Value: v.option1_value,
      option2Value: v.option2_value,
      option3Value: v.option3_value,
      price: v.price,
      compareAtPrice: v.compare_at_price,
      inventoryQuantity: v.inventory_quantity,
      lowStockThreshold: v.low_stock_threshold,
      weightGrams: v.weight_grams,
      imageId: v.image_id,
      isActive: v.is_active,
    }));

  // 2. Options dynamically constructed
  let options = product.options || [];
  if (!options || options.length === 0) {
    const o1Values = Array.from(new Set(variants.map((v: any) => v.option1Value).filter(Boolean)));
    const o2Values = Array.from(new Set(variants.map((v: any) => v.option2Value).filter(Boolean)));
    const o3Values = Array.from(new Set(variants.map((v: any) => v.option3Value).filter(Boolean)));

    if (o1Values.length > 0) options.push({ id: 'opt_1', name: 'Size', position: 1, values: o1Values as string[] });
    if (o2Values.length > 0) options.push({ id: 'opt_2', name: 'Material', position: 2, values: o2Values as string[] });
    if (o3Values.length > 0) options.push({ id: 'opt_3', name: 'Quality', position: 3, values: o3Values as string[] });
  } else {
    options = options.map((opt: any, index: number) => {
      const optionKey = `option${index + 1}Value` as keyof (typeof variants)[0];
      const uniqueVals = Array.from(new Set(variants.map((v: any) => v[optionKey]).filter(Boolean))) as string[];
      return {
        ...opt,
        values: opt.values && opt.values.length > 0 ? opt.values : uniqueVals,
      };
    });
  }

  // 3. Images sorted by position
  const images = (pData.product_images || [])
    .sort((a: any, b: any) => (a.position ?? 0) - (b.position ?? 0))
    .map((img: any) => ({
      id: img.id,
      url: img.url,
      altText: img.alt_text,
      position: img.position,
    }));

  // 4. Certifications
  const certifications = (pData.product_certifications || []).map((c: any) => ({
    id: c.id,
    labName: c.lab_name,
    certificateNumber: c.certificate_number,
    fileUrl: c.file_url,
    issueAt: c.issued_at,
  }));

  // 5. Specifications
  const specifications = (pData.product_specifications || [])
    .sort((a: any, b: any) => (a.position ?? 0) - (b.position ?? 0))
    .map((s: any) => ({
      id: s.id,
      specKey: s.spec_key,
      specValue: s.spec_value,
      position: s.position,
    }));

  // 6. Rating summary from pre-fetched reviews
  const approvedReviews = (pData.reviews || []).filter((r: any) => r.is_approved !== false);
  const reviewCount = approvedReviews.length;
  const rating =
    reviewCount > 0
      ? approvedReviews.reduce(
          (sum: number, r: any) => sum + (r.review_content?.rating ?? r.rating ?? 5),
          0
        ) / reviewCount
      : 0;

  // 7. Details mapping
  const junctionMaterials = (pData.product_materials || []).map((m: any) => m.materials?.name).filter(Boolean);
  const directMaterial = pData.materials?.name;
  const resolvedMaterial = junctionMaterials.length > 0 ? junctionMaterials.join(', ') : directMaterial;

  // Fallback for mukhi_types from pre-cached data
  const resolvedMukhiType = pData.resolved_mukhi_type || pData.mukhi_types;


  const mukhiTypeName =
    resolvedMukhiType?.special_name ||
    (resolvedMukhiType?.mukhi_count ? `${resolvedMukhiType.mukhi_count} Mukhi` : undefined);

  const isMukhi = Boolean(mukhiTypeName);

  const details = {
    material: resolvedMaterial || undefined,
    origin: pData.origins?.name || undefined,
    mukhiType: mukhiTypeName,
    purpose: (pData.product_purposes || []).map((p: any) => p.purposes?.title || p.purposes?.name).filter(Boolean).join(', ') || undefined,
    bestFor: pData.best_for || undefined,
    rulingPlanet:
      (pData.product_planets || []).map((p: any) => p.planets?.name).filter(Boolean).join(', ') ||
      resolvedMukhiType?.planets?.name ||
      undefined,
    moolank: (pData.product_moolanks || []).map((m: any) => m.moolank_number).filter(Boolean).join(', ') || undefined,
    energizedAt: (pData.product_temples || [])[0]?.temples?.name || undefined,
    about: isMukhi
      ? (resolvedMukhiType?.benefits || undefined)
      : (pData.short_description || undefined),
  };

  const templeData = (pData.product_temples || [])[0]?.temples;
  const temple = templeData
    ? {
        templeName: String(templeData.name),
        location: `${templeData.city || ''}, ${templeData.state || ''}`.replace(/^, | ,$/, '').trim() || undefined,
        description: String(templeData.description || ''),
      }
    : undefined;

  return (
    <div className="bg-white flex flex-col items-center relative size-full min-h-screen">
      <TopNavigation />
      <div className="w-full max-w-7xl mx-auto flex flex-col bg-white md:px-8 pb-0">
        {/* Main Product Section */}
        <div className="flex flex-col md:flex-row gap-[16px] md:gap-[48px] items-start px-[16px] pt-[16px] pb-2 md:p-0 md:pt-[32px] md:pb-2 w-full">
          {/* Left Column: Gallery */}
          <div className="w-full md:w-1/2 md:sticky md:top-[80px]">
            <ProductGallery images={images} productId={product.id} productName={product.title} />
          </div>

          {/* Right Column: Info & Actions */}
          <div className="flex flex-col gap-[16px] w-full md:w-1/2">
            <ProductHeader
              title={product.title}
              rating={rating}
              reviewCount={reviewCount}
              tags={product.tags}
            />

            <ProductPurchaseCard
              productId={product.id}
              productSlug={product.slug}
              productTitle={product.title}
              productImage={images.length > 0 ? images[0].url : ''}
              variants={variants}
              options={options}
              sku={variants[0]?.sku || ''}
              isEnergized={product.is_energized}
              energizationAddonPrice={product.energization_addon_price}
            />

            <div className="w-full flex flex-col gap-[20px]">
              <SectionTabs hasCertificates={Boolean(certifications && certifications.length > 0)} />

              <div id="description" className="scroll-mt-[135px] md:scroll-mt-[150px] pt-1">
                <ProductDescription description={product.description || product.short_description || ''} />
              </div>

              <div id="details" className="scroll-mt-[135px] md:scroll-mt-[150px] pt-1">
                <ProductDetails details={details} temple={temple} />
              </div>

              <div id="specifications" className="scroll-mt-[135px] md:scroll-mt-[150px] pt-1">
                <SpecificationsTable specifications={specifications} />
              </div>

              {certifications && certifications.length > 0 && (
                <div id="certification" className="scroll-mt-[135px] md:scroll-mt-[150px] pt-1">
                  <CertificationBlock certifications={certifications} />
                </div>
              )}

              {/* Streaming Reviews via React Suspense */}
              <div id="reviews" className="scroll-mt-[135px] md:scroll-mt-[150px] pt-1">
                <Suspense fallback={<ReviewsSkeleton />}>
                  <AsyncReviewsSection
                    productId={product.id}
                    productSlug={slug}
                    initialRating={rating}
                    initialReviewCount={reviewCount}
                  />
                </Suspense>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Full-bleed edge-to-edge "You may also like" Section */}
      <div className="w-full bg-[#fbf8f4] flex flex-col items-center pb-[104px] md:pb-8 border-t border-[#f0ece5]">
        <div className="w-full max-w-7xl mx-auto">
          <Suspense fallback={<CrossSellSkeleton />}>
            <AsyncCrossSell currentProductId={product.id} />
          </Suspense>
        </div>
      </div>
    </div>
  );
}

