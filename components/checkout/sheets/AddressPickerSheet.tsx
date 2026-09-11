'use client';

import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { useHasMounted } from '@/hooks/useHasMounted';
import type { Address } from '@/components/account/types';
import { useAuth } from '@/hooks/useAuth';
import { createSupabaseBrowserClient } from '@/services/supabase/client';
import { deleteAddress } from '@/services/profile.service';
import { toast } from '@/lib/toast';
import DeleteAddressModal from '@/components/ui/overlays/DeleteAddressModal';
import BackButton from '@/components/ui/buttons/BackButton';

interface AddressSheetProps {
  isOpen: boolean;
  onClose: () => void;
  addresses: Address[];
  selectedAddressId: string | null;
  onSelectAddress: (addressId: string) => void;
  onConfirm?: (selectedAddressId: string) => void;
  onAddNew: () => void;
  onEditAddress?: (address: Address) => void;
  onDeleteAddress?: (address: Address) => Promise<void> | void;
  isLoading: boolean;
}

export default function AddressSheet({
  isOpen,
  onClose,
  addresses,
  selectedAddressId,
  onSelectAddress,
  onAddNew,
  onEditAddress,
  onDeleteAddress,
  isLoading,
}: AddressSheetProps) {
  const { profile } = useAuth();
  const sheetRef = useRef<HTMLDivElement>(null);
  const [addressToDelete, setAddressToDelete] = useState<Address | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Close on Escape key
  useEffect(() => {
    if (!isOpen || addressToDelete) return;
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [isOpen, onClose, addressToDelete]);

  // Prevent body scroll when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  const handleConfirmDelete = async () => {
    if (!addressToDelete) return;
    setIsDeleting(true);
    try {
      if (onDeleteAddress) {
        await onDeleteAddress(addressToDelete);
      } else {
        const supabase = createSupabaseBrowserClient();
        await deleteAddress(supabase, addressToDelete.id);
      }
      toast.success("Address deleted", "The address has been removed successfully.");
    } catch (err: any) {
      toast.error("Error", err?.message || "Failed to delete address");
    } finally {
      setIsDeleting(false);
      setAddressToDelete(null);
    }
  };

  const mounted = useHasMounted();

  if (!isOpen || !mounted) return null;

  return createPortal(
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-[100] bg-black/40 backdrop-blur-xs transition-opacity duration-300 w-full max-w-full overflow-x-hidden"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Sheet Container (Mobile full-screen / Desktop centered modal) */}
      <div
        ref={sheetRef}
        role="dialog"
        aria-modal="true"
        aria-label="Select Delivery Address"
        className={`fixed inset-0 z-[110] flex justify-center transition-transform duration-300 ease-out overflow-hidden pointer-events-none ${
          isOpen ? 'translate-y-0' : 'translate-y-full'
        }`}
      >
        <div className="w-full max-w-full md:max-w-[480px] h-full flex flex-col bg-[#fbf8f4] md:border-x md:border-[#e5e0da] shadow-2xl pointer-events-auto overflow-hidden">
          
          {/* Header matching Figma node 1346:37 */}
          <div className="sticky top-0 z-10 flex shrink-0 h-[56px] items-center justify-between border-b border-[#e5e0da] bg-white px-[16px] w-full max-w-full">
            <div className="flex items-center gap-[12px]">
              <BackButton onClick={onClose} className="size-[28px] rounded-[14px]" />
              <h2 className="font-['Montserrat'] text-[18px] font-bold text-[#211e1a] whitespace-nowrap leading-[24px]">
                Select Delivery Address
              </h2>
            </div>
            <div className="size-[28px] opacity-0" aria-hidden="true" />
          </div>

          {/* Main Scrollable Content matching Figma node 1348:136 */}
          <div className="flex-1 overflow-y-auto overflow-x-hidden px-[16px] pt-[20px] pb-[120px] w-full max-w-full no-scrollbar flex flex-col gap-[20px]">
            {isLoading ? (
              /* Loading Skeleton */
              <div className="flex flex-col gap-[16px] animate-pulse">
                {[1, 2].map((n) => (
                  <div key={n} className="h-[140px] rounded-[16px] bg-white border border-[#e5e0da] p-[18px]" />
                ))}
              </div>
            ) : addresses.length === 0 ? (
              /* Empty State */
              <div className="py-12 flex flex-col items-center justify-center text-center gap-3">
                <div className="size-[48px] rounded-full bg-[#fff0e6] text-[#ff5400] flex items-center justify-center">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
                  </svg>
                </div>
                <p className="font-['Montserrat'] text-[15px] font-semibold text-[#211e1a]">No saved addresses found</p>
                <p className="font-['Montserrat'] text-[13px] text-[#6b6459]">Add an address below to proceed with your delivery.</p>
              </div>
            ) : (
              /* Address Cards List matching Figma node 1348:141 & 1348:156 */
              addresses.map((address) => {
                const isSelected = address.id === selectedAddressId;
                const fullAddress = [
                  address.line1,
                  address.line2,
                  address.city,
                  address.state,
                  address.pincode,
                ]
                  .filter(Boolean)
                  .join(', ');

                const cardName =
                  address.fullName ||
                  profile?.fullName ||
                  (address.addressType
                    ? `${address.addressType.charAt(0).toUpperCase() + address.addressType.slice(1)} Address`
                    : 'Delivery Address');
                const cardPhone = address.phone || profile?.phone;

                return (
                  <div
                    key={address.id}
                    onClick={() => {
                      onSelectAddress(address.id);
                      onClose();
                    }}
                    className={`bg-white rounded-[16px] p-[18px] flex flex-col gap-[14px] cursor-pointer transition-all duration-200 ${
                      isSelected
                        ? 'border-2 border-[#ff5400] shadow-sm'
                        : 'border border-[#e5e0da] hover:border-[#ff5400]/40'
                    }`}
                  >
                    {/* Card Header matching Figma node 1348:142 */}
                    <div className="flex items-center justify-between w-full">
                      <div className="flex items-center gap-[8px] min-w-0">
                        {/* Radio Icon Container */}
                        <div className="flex items-center justify-center shrink-0 size-[20px]">
                          {isSelected ? (
                            <div className="size-[20px] rounded-full border-2 border-[#ff5400] flex items-center justify-center">
                              <div className="size-[10px] rounded-full bg-[#ff5400]" />
                            </div>
                          ) : (
                            <div className="size-[20px] rounded-full border-2 border-[#a89a85]" />
                          )}
                        </div>
                        <p className="font-['Montserrat'] font-bold text-[15px] text-[#211e1a] truncate leading-normal">
                          {cardName}
                        </p>
                      </div>

                      {/* Default Pill */}
                      {address.isDefault && (
                        <div className="bg-[#ff5400] px-[10px] py-[4px] rounded-[100px] shrink-0">
                          <span className="font-['Montserrat'] font-semibold text-[11px] text-white leading-normal whitespace-nowrap">
                            Default
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Address Details matching Figma node 1348:149 */}
                    <div className="flex flex-col gap-[6px] w-full font-['Montserrat'] font-normal">
                      <p className="text-[13px] leading-[20px] text-[#211e1a] [word-break:break-word]">
                        {fullAddress}
                      </p>
                      {cardPhone && (
                        <p className="text-[12px] leading-[16px] text-[#6b6459]">
                          Phone: {cardPhone}
                        </p>
                      )}
                    </div>

                    {/* Divider Line matching Figma node 1348:152 */}
                    <hr className="border-0 border-t border-[#e5e0da] w-full" />

                    {/* Actions Row matching Figma node 1348:153 */}
                    <div className="flex items-center justify-between w-full text-[13px] leading-normal whitespace-nowrap">
                      {onEditAddress ? (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onEditAddress(address);
                          }}
                          className="font-['Montserrat'] font-semibold text-[#ff5400] cursor-pointer hover:underline transition-opacity"
                        >
                          Edit
                        </button>
                      ) : (
                        <span />
                      )}

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setAddressToDelete(address);
                        }}
                        className="font-['Montserrat'] font-medium text-[#6b6459] cursor-pointer hover:text-red-500 transition-colors"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Sticky Bottom Bar matching Figma node 1348:169 & 1474:3 */}
          <div
            className="sticky bottom-0 z-10 shrink-0 bg-white border-t border-[#e5e0da] h-[96px] px-[16px] pt-[16px] pb-[24px] flex items-center justify-center w-full max-w-full"
            style={{ paddingBottom: "max(24px, env(safe-area-inset-bottom, 0px))" }}
          >
            <button
              type="button"
              onClick={onAddNew}
              className="h-[50px] w-full rounded-[24px] bg-[#ff5400] hover:bg-[#e04a00] active:scale-[0.99] font-['Montserrat'] font-semibold text-[14px] text-white flex items-center justify-center gap-[8px] transition-all cursor-pointer shadow-xs"
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="shrink-0"
              >
                <line x1="12" y1="5" x2="12" y2="19" />
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
              <span>Add new address</span>
            </button>
          </div>
        </div>
      </div>

      {/* Delete Address Confirmation Modal */}
      <DeleteAddressModal
        isOpen={!!addressToDelete}
        onClose={() => setAddressToDelete(null)}
        onConfirm={handleConfirmDelete}
        address={addressToDelete}
        isDeleting={isDeleting}
      />
    </>,
    document.body
  );
}
