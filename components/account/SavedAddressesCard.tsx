"use client";

import { useState } from "react";
import { createSupabaseBrowserClient } from "@/services/supabase/client";
import { deleteAddress, setDefaultAddress, fetchAddresses } from "@/services/profile.service";
import { useAuthStore } from "@/store/auth.store";
import { useAddressForm } from "@/hooks/useAddressForm";
import { toast } from "@/lib/toast";
import type { Address } from "./types";
import ProfileAddressRow from "./ProfileAddressRow";
import AddressFormSheet from "@/components/checkout/sheets/AddressFormSheet";
import DeleteAddressModal from "@/components/ui/overlays/DeleteAddressModal";

interface SavedAddressesCardProps {
  /** Initial seed — component subscribes to the store and ignores this after mount. */
  addresses?: Address[];
}

export default function SavedAddressesCard(_props: SavedAddressesCardProps) {
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [addressToDelete, setAddressToDelete] = useState<Address | null>(null);

  const profile = useAuthStore((state) => state.profile);
  const user = useAuthStore((state) => state.user);
  const addresses = useAuthStore((state) => state.addresses);
  const setAddresses = useAuthStore((state) => state.setAddresses);

  const addrForm = useAddressForm({
    onSaved: async () => {
      // Re-fetch the full list after create or edit so the UI reflects the
      // server state (handles isDefault re-ordering, etc.)
      const supabase = createSupabaseBrowserClient();
      const updated = await fetchAddresses(supabase);
      setAddresses(updated);
    },
  });

  const handleSetDefault = async (id: string) => {
    // Optimistic update — flip isDefault in the store immediately so the UI
    // responds without waiting for the network round-trip.
    const previousAddresses = addresses;
    setAddresses(
      addresses.map((a) => ({ ...a, isDefault: a.id === id }))
    );
    toast.success("Default address updated", "Default delivery address updated.");
    setError(null);

    // Background sync
    try {
      if (user?.id) {
        await setDefaultAddress(user.id, id);
      }
    } catch (err: any) {
      // Revert on failure.
      setAddresses(previousAddresses);
      setError(err.message || "Failed to set default address");
      toast.error("Error", err.message || "Failed to set default address");
    }
  };

  const handleConfirmDelete = async () => {
    if (!addressToDelete) return;

    const supabase = createSupabaseBrowserClient();
    await deleteAddress(supabase, addressToDelete.id);
    const updated = await fetchAddresses(supabase);
    setAddresses(updated);
    toast.success("Address deleted", "The address has been removed successfully.");
  };

  return (
    <div className="rounded-[12px] border border-border-strong bg-white p-[16px] shadow-2xs">
      <div className="mb-[12px] flex items-center justify-between">
        <h2 className="text-[13px] font-bold text-text-primary">Saved Addresses</h2>
        <button
          type="button"
          onClick={addrForm.openCreate}
          className="text-[12px] font-semibold text-primary-orange transition-opacity hover:opacity-80 cursor-pointer"
        >
          + Add New
        </button>
      </div>

      {error && (
        <div className="mb-4 rounded-md bg-red-50 p-3 text-sm text-red-600">
          {error}
        </div>
      )}

      {addresses.length === 0 ? (
        <div className="py-6 text-center">
          <p className="text-sm text-text-secondary">No saved addresses yet.</p>
        </div>
      ) : (
        <div className="flex flex-col divide-y divide-[#e5e0da]">
          {addresses.map((address) => (
            <ProfileAddressRow
              key={address.id}
              address={address}
              fullName={profile?.fullName}
              isSaving={isSaving}
              onSetDefault={handleSetDefault}
              onEdit={(id) => {
                const found = addresses.find((a) => a.id === id);
                if (found) addrForm.openEdit(found);
              }}
              onDelete={(id) => {
                const found = addresses.find((a) => a.id === id);
                if (found) setAddressToDelete(found);
              }}
            />
          ))}
        </div>
      )}

      <AddressFormSheet
        isOpen={addrForm.isOpen}
        onClose={addrForm.close}
        mode={addrForm.mode}
        initialAddress={addrForm.editingAddress}
        onSubmit={addrForm.submit}
        isSubmitting={addrForm.isSubmitting}
      />

      {/* Delete Address Confirmation Modal */}
      <DeleteAddressModal
        isOpen={!!addressToDelete}
        onClose={() => setAddressToDelete(null)}
        onConfirm={handleConfirmDelete}
        address={addressToDelete}
      />
    </div>
  );
}
