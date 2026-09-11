'use client';

import { useAuth } from '@/hooks/useAuth';
import type { Address } from '@/components/account/types';

interface AddressSectionProps {
  address: Address | null;
  onChangeAddress: () => void;
}

export default function AddressSection({
  address,
  onChangeAddress,
}: AddressSectionProps) {
  const { profile } = useAuth();

  if (!address) {
    return (
      <button
        type="button"
        onClick={onChangeAddress}
        className="bg-white border border-[#e5e0da] hover:border-[#ff5400]/40 rounded-[12px] p-[16px] flex gap-[12px] items-center justify-between w-full transition-colors cursor-pointer text-left"
      >
        <div className="flex items-center gap-[12px] min-w-0 flex-1">
          <div className="size-[32px] rounded-[16px] bg-[#f5f1ea] flex items-center justify-center shrink-0">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path
                d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"
                fill="#ff5400"
              />
            </svg>
          </div>
          <div className="flex flex-col gap-[2px] min-w-0 flex-1 font-['Montserrat']">
            <p className="font-medium text-[13px] text-[#211e1a] leading-[20px]">
              Select delivery address
            </p>
            <p className="text-[12px] text-[#6b6459] leading-[16px]">
              Choose where to deliver
            </p>
          </div>
        </div>
        <div className="size-[18px] text-[#6b6459] flex items-center justify-center shrink-0">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="9 18 15 12 9 6" />
          </svg>
        </div>
      </button>
    );
  }

  const fullAddress = [address.line1, address.line2, address.city, address.state, address.pincode]
    .filter(Boolean)
    .join(', ');

  const displayName = address.fullName || profile?.fullName || (address.addressType ? `${address.addressType.charAt(0).toUpperCase() + address.addressType.slice(1)} Address` : 'Delivery Address');
  const displayPhone = address.phone || profile?.phone;

  return (
    <div className="bg-white border border-[#e5e0da] rounded-[12px] p-[16px] flex flex-col gap-[10px] items-start w-full font-['Montserrat']">
      {/* Header Row matching Figma node 544:133 */}
      <div className="flex items-center justify-between w-full">
        <div className="flex items-center gap-[8px]">
          <div className="bg-white border border-[#e5e0da] rounded-[10px] size-[20px] flex items-center justify-center shrink-0">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path
                d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"
                fill="#ff5400"
              />
            </svg>
          </div>
          <span className="font-['Montserrat'] font-semibold text-[15px] text-[#211e1a] leading-[24px] whitespace-nowrap">
            Deliver to
          </span>
        </div>
        <button
          type="button"
          onClick={onChangeAddress}
          className="font-['Montserrat'] font-medium text-[13px] text-[#ff5400] hover:underline cursor-pointer leading-[18px] transition-opacity whitespace-nowrap"
        >
          Change
        </button>
      </div>

      {/* Recipient Details matching Figma node 544:136-138 */}
      <p className="font-normal text-[13px] text-[#211e1a] leading-[20px] w-full">
        {displayName}
      </p>
      <p className="font-normal text-[12px] text-[#6b6459] leading-[16px] w-full">
        {fullAddress}
      </p>
      {displayPhone && (
        <p className="font-normal text-[12px] text-[#6b6459] leading-[16px] w-full">
          {displayPhone}
        </p>
      )}
    </div>
  );
}
