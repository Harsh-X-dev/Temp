"use client";

import { useState } from "react";
import { createSupabaseBrowserClient } from "@/services/supabase/client";
import { saveAddress, updateAddress } from "@/services/profile.service";
import type { Address } from "@/components/account/types";
import type { AddressFormData } from "@/types/checkout.types";
import { toast } from "@/lib/toast";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type AddressFormMode = "create" | "edit";

/**
 * Options accepted by useAddressForm.
 *
 * @param onSaved   - Called after a successful create **or** edit with the
 *                    resulting address. Each call site uses this to update its
 *                    own local state (address list, auth store, navigation, …).
 * @param createFn  - Optional override for the create path. Defaults to
 *                    `saveAddress` from profile.service. Pass `insertAddress`
 *                    from checkout.service on pages that need guest/localStorage
 *                    support (CartPage, CheckoutPageClient).
 */
interface UseAddressFormOptions {
  onSaved: (address: Address) => void;
  createFn?: (
    supabase: ReturnType<typeof createSupabaseBrowserClient>,
    data: AddressFormData,
  ) => Promise<Address | null>;
}

interface UseAddressFormReturn {
  // State
  isOpen: boolean;
  mode: AddressFormMode;
  editingAddress: Address | null;
  isSubmitting: boolean;

  // Actions
  openCreate: () => void;
  openEdit: (address: Address) => void;
  close: () => void;
  submit: (formData: AddressFormData) => Promise<void>;
}

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

/**
 * Manages the open/close, mode, and submit lifecycle of AddressFormSheet.
 *
 * Encapsulates the repeated state block that was hand-rolled in every call
 * site (LoginFlow, SavedAddressesCard, CheckoutPageClient, CartPage).
 *
 * Usage:
 *   const addrForm = useAddressForm({ onSaved: (addr) => { ... } });
 *
 *   <AddressFormSheet
 *     isOpen={addrForm.isOpen}
 *     onClose={addrForm.close}
 *     mode={addrForm.mode}
 *     initialAddress={addrForm.editingAddress}
 *     onSubmit={addrForm.submit}
 *     isSubmitting={addrForm.isSubmitting}
 *   />
 */
export function useAddressForm({
  onSaved,
  createFn,
}: UseAddressFormOptions): UseAddressFormReturn {
  const [isOpen, setIsOpen] = useState(false);
  const [mode, setMode] = useState<AddressFormMode>("create");
  const [editingAddress, setEditingAddress] = useState<Address | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  function openCreate() {
    setMode("create");
    setEditingAddress(null);
    setIsOpen(true);
  }

  function openEdit(address: Address) {
    setMode("edit");
    setEditingAddress(address);
    setIsOpen(true);
  }

  function close() {
    setIsOpen(false);
  }

  async function submit(formData: AddressFormData): Promise<void> {
    // 1. Construct optimistic address immediately (0ms delay)
    const optimisticAddress: Address = {
      id:
        mode === "edit" && editingAddress
          ? editingAddress.id
          : `addr_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      fullName: formData.fullName?.trim() || editingAddress?.fullName || "Customer",
      phone: formData.phone?.trim() || editingAddress?.phone || "",
      email: formData.email?.trim() || editingAddress?.email,
      line1: formData.line1.trim(),
      line2: formData.line2?.trim(),
      city: formData.city.trim(),
      state: formData.state.trim(),
      pincode: formData.pincode.trim(),
      country: formData.country?.trim() || "India",
      addressType: formData.addressType,
      isDefault: formData.isDefault ?? (mode === "create" ? true : false),
    };

    // 2. Immediately close sheet, apply optimistic address, and show toast
    setIsOpen(false);
    onSaved(optimisticAddress);
    toast.success(
      "Address Saved",
      mode === "edit"
        ? "Address updated successfully."
        : "Delivery address added successfully."
    );

    // 3. Persist in the background asynchronously
    setIsSubmitting(true);
    (async () => {
      try {
        const supabase = createSupabaseBrowserClient();

        if (mode === "create") {
          const fn = createFn ?? defaultCreate;
          const saved = await fn(supabase, formData);
          if (saved) {
            onSaved(saved);
          }
        } else if (mode === "edit" && editingAddress) {
          const saved = await updateAddress(supabase, editingAddress.id, {
            fullName: formData.fullName || undefined,
            phone: formData.phone || undefined,
            email: formData.email || undefined,
            line1: formData.line1,
            line2: formData.line2 || undefined,
            city: formData.city,
            state: formData.state,
            pincode: formData.pincode,
            addressType: formData.addressType,
            country: formData.country || "India",
            isDefault: formData.isDefault,
          });
          if (saved) {
            onSaved(saved);
          }
        }
      } catch (err: any) {
        console.error("[useAddressForm] background save error:", err);
      } finally {
        setIsSubmitting(false);
      }
    })();
  }

  return { isOpen, mode, editingAddress, isSubmitting, openCreate, openEdit, close, submit };
}

// ---------------------------------------------------------------------------
// Default create implementation (profile.service.saveAddress)
// ---------------------------------------------------------------------------

async function defaultCreate(
  supabase: ReturnType<typeof createSupabaseBrowserClient>,
  data: AddressFormData,
): Promise<Address> {
  return saveAddress(supabase, {
    fullName: data.fullName || undefined,
    phone: data.phone || undefined,
    email: data.email || undefined,
    line1: data.line1,
    line2: data.line2 || undefined,
    city: data.city,
    state: data.state,
    pincode: data.pincode,
    country: data.country || "India",
    addressType: data.addressType,
    isDefault: data.isDefault ?? false,
  });
}
