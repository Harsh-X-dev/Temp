import type { OrderDeliveryAddress } from "@/components/account/types";

interface DeliveryAddressCardProps {
  address: OrderDeliveryAddress | null;
}

export default function DeliveryAddressCard({ address }: DeliveryAddressCardProps) {
  return (
    <div className="rounded-xl border border-[#E5E0DA] bg-white p-5 lg:mx-0">
      <div className="flex items-center gap-2 mb-4">
        <svg className="size-5 text-[#FF6B00]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
        <h2 className="text-[15px] font-bold text-[#211E1A]">Delivery Address</h2>
      </div>

      {address ? (
        <div className="flex flex-col">
          <p className="text-[13px] font-bold text-[#211E1A]">{address.fullName}</p>
          <p className="mt-1 text-[13px] text-[#6B6459] whitespace-pre-line leading-relaxed">
            {address.fullAddress}
          </p>
        </div>
      ) : (
        <div className="flex items-center gap-2 rounded-lg bg-[#F8F6F0] p-4">
          <svg className="size-5 text-[#8C8477]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="text-[13px] text-[#8C8477] italic">Delivery address unavailable</p>
        </div>
      )}
    </div>
  );
}
