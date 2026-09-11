import OrderSuccessfulClient from '@/components/checkout/OrderSuccessfulClient';

interface Props {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function OrderSuccessfulPage({ searchParams }: Props) {
  const resolved = await searchParams;
  const orderId = typeof resolved.orderId === 'string' ? resolved.orderId : '#GEM-2025-7842';
  const items = typeof resolved.items === 'string' ? resolved.items : '1';
  const rawTotal = typeof resolved.total === 'string' ? resolved.total : '1349';
  const total = !isNaN(Number(rawTotal)) ? Number(rawTotal).toLocaleString('en-IN') : rawTotal;

  return (
    <OrderSuccessfulClient
      initialOrderId={orderId}
      initialItems={items}
      initialTotal={total}
    />
  );
}
