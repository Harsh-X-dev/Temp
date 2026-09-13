/**
 * Profile service — fetches profile and address data via Supabase (source of truth for reads)
 * and mutates addresses and creates initial profiles via backend REST APIs.
 *
 * Architecture:
 *  - Reads: Supabase (public.profiles table with embedded address_info JSONB)
 *  - Mutations: Backend REST API (/profiles/*)
 *  - Profile update: Supabase for now (clean extension point for future REST API)
 *
 * Layering: hooks/components → profile.service → Supabase client / REST API
 */
import type { SupabaseClient } from "@supabase/supabase-js";
import type { UserProfile, Address, AddressType } from "@/components/account/types";
import type { CreateProfileInput } from "@/types/checkout.types";
import { createSupabaseBrowserClient } from "@/services/supabase/client";
import { api } from "@/services/http";
import axios from "axios";

/**
 * Helper to safely extract error message from unknown errors.
 */
function getErrorMessage(error: unknown, fallback: string): string {
  if (axios.isAxiosError(error)) {
    return error.response?.data?.message ?? error.message ?? fallback;
  }
  if (error instanceof Error) {
    return error.message;
  }
  return fallback;
}

// ---------------------------------------------------------------------------
// Profile Reads & Updates
// ---------------------------------------------------------------------------

/**
 * Helper to format date string to YYYY-MM-DD for backend API.
 * Supports DD/MM/YYYY, DD-MM-YYYY, and YYYY-MM-DD.
 */
function formatToIsoDate(dob?: string | null): string | null {
  if (!dob) return null;
  const trimmed = dob.trim();
  if (!trimmed) return null;

  // Already YYYY-MM-DD
  if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
    return trimmed;
  }

  // DD/MM/YYYY
  if (/^\d{2}\/\d{2}\/\d{4}$/.test(trimmed)) {
    const [d, m, y] = trimmed.split("/");
    return `${y}-${m}-${d}`;
  }

  // DD-MM-YYYY
  if (/^\d{2}-\d{2}-\d{4}$/.test(trimmed)) {
    const [d, m, y] = trimmed.split("-");
    return `${y}-${m}-${d}`;
  }

  return trimmed;
}

/**
 * Normalise gender value to match backend convention (lowercase).
 */
function normalizeGender(gender?: string | null): string | null {
  if (!gender) return null;
  const g = gender.trim().toLowerCase();
  if (g === "prefer not to say" || g === "prefer_not_to_say") return "prefer_not_to_say";
  return g;
}

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

/**
 * Resolve avatar URL from profile_image (can be a string or JSON object with url).
 */
function resolveAvatarUrl(profileImage: unknown): string | null {
  if (!profileImage) return null;
  if (typeof profileImage === "string") {
    const trimmed = profileImage.trim();
    return trimmed.length > 0 ? trimmed : null;
  }
  if (typeof profileImage === "object" && "url" in (profileImage as object)) {
    const url = (profileImage as { url: string }).url;
    return typeof url === "string" && url.trim().length > 0 ? url.trim() : null;
  }
  return null;
}

/**
 * Map a raw `profiles` DB row → UserProfile.
 */
function mapRowToProfile(
  data: Record<string, unknown>,
  fallbackEmail?: string | null,
): UserProfile {
  return {
    id: data.id as string,
    fullName: (data.full_name as string | null) ?? null,
    phone: (data.phone as string | null) ?? null,
    avatarUrl: resolveAvatarUrl(data.profile_image),
    email: (data.email_id as string | null) ?? fallbackEmail ?? null,
    dob: (data.birth_date as string | null) ?? null,
    gender: (data.gender as string | null) ?? null,
    role: null,
    createdAt: data.created_at as string | null,
    updatedAt: data.updated_at as string | null,
  };
}

/**
 * Map a raw `address_info` JSONB array → Address[].
 */
function mapRowToAddresses(addressInfo: unknown): Address[] {
  if (!Array.isArray(addressInfo)) return [];
  return (addressInfo as Array<Record<string, unknown>>).map((item) => ({
    id: (item.id || item.address_id) as string,
    fullName: ((item.full_name || item.fullName || item.name) as string | null) ?? null,
    phone: ((item.phone || item.phone_number || item.phoneNumber) as string | null) ?? null,
    email: ((item.email || item.email_id || item.emailId) as string | null) ?? null,
    line1: (item.line1 as string) || "",
    line2: (item.line2 as string | null) ?? null,
    city: (item.city as string) || "",
    state: (item.state as string) || "",
    pincode: (item.pincode as string) || "",
    country: (item.country as string) || "India",
    addressType: (item.address_type as AddressType) || "home",
    isDefault: Boolean(item.is_default),
  }));
}

// ---------------------------------------------------------------------------
// Profile + Address — single-query fetch (preferred)
// ---------------------------------------------------------------------------

/**
 * Fetch the authenticated user's profile AND addresses in a **single** Supabase
 * round-trip by reading all columns from `public.profiles` at once.
 *
 * This is the preferred function to use wherever both pieces of data are needed
 * (e.g. AuthProvider, useLoginFlow, LoginFlow, checkout orders).
 *
 * Returns `{ profile: null, addresses: [] }` when the user is not authenticated
 * or no row exists.
 */
export async function fetchProfileWithAddresses(
  supabase: SupabaseClient,
): Promise<{ profile: UserProfile | null; addresses: Address[] }> {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { profile: null, addresses: [] };

  const { data, error } = await supabase
    .from("profiles")
    .select(
      "id, full_name, phone, email_id, address_info, profile_image, created_at, updated_at, birth_date, gender",
    )
    .eq("id", user.id)
    .maybeSingle();

  if (error || !data) return { profile: null, addresses: [] };

  return {
    profile: mapRowToProfile(data as Record<string, unknown>, user.email),
    addresses: mapRowToAddresses(data.address_info),
  };
}

// ---------------------------------------------------------------------------
// Legacy single-entity reads (delegate to fetchProfileWithAddresses)
// ---------------------------------------------------------------------------

/**
 * Fetch the authenticated user's profile from public.profiles.
 *
 * @deprecated Prefer `fetchProfileWithAddresses` when you also need addresses —
 * it avoids a second round-trip to Supabase.
 */
export async function fetchProfile(
  supabase: SupabaseClient,
): Promise<UserProfile | null> {
  const { profile } = await fetchProfileWithAddresses(supabase);
  return profile;
}

/**
 * Create initial profile and first delivery address via POST /profiles/create-profile.
 *
 * The backend's create-profile endpoint does a Supabase UPDATE internally,
 * so the profiles row must exist before calling it. We upsert the row first
 * using the service-aware supabase client, then delegate to the backend to
 * also persist the address_info update in one go.
 */
export async function createProfile(
  supabase: SupabaseClient,
  input: CreateProfileInput,
): Promise<{ success: boolean; addressId: string }> {
  try {
    // ── Step 1: Ensure the profiles row exists ────────────────────────────
    // The backend POST /profiles/create-profile does a Supabase UPDATE, which
    // silently fails (500 "Cannot coerce the result to a single JSON object")
    // if the row doesn't exist yet. We upsert it first so the backend always
    // finds an existing row to mutate.
    const upsertPayload: Record<string, unknown> = {
      id: input.userId,
      full_name: input.fullName || "",
      phone: input.phone || "",
      address_info: [],
    };
    if (input.emailId) upsertPayload.email_id = input.emailId;

    const { error: upsertError } = await supabase
      .from("profiles")
      .upsert(upsertPayload, { onConflict: "id", ignoreDuplicates: false });

    if (upsertError) {
      // Log but don't throw — the backend might still succeed if the row was
      // created by a trigger between our check and the upsert.
      console.warn("[createProfile] Supabase upsert warning:", upsertError.message);
    }

    // ── Step 2: Call backend to persist profile fields + first address ────
    const payload = {
      user_id: input.userId,
      full_name: input.fullName,
      phone: input.phone,
      email_id: input.emailId || undefined,
      gender: input.gender || undefined,
      birth_date: input.birthDate || undefined,
      line1: input.line1,
      line2: input.line2 || null,
      city: input.city,
      state: input.state,
      pincode: input.pincode,
      country: input.country || "India",
      address_type: input.addressType || "home",
      is_default: input.isDefault ?? true,
    };

    const response = await api.post("/profiles/create-profile", payload);

    if (!response.data || !response.data.success) {
      throw new Error(response.data?.message || "Failed to create profile.");
    }

    return {
      success: true,
      addressId: response.data.address_id,
    };
  } catch (error: unknown) {
    throw new Error(getErrorMessage(error, "Failed to create profile."));
  }
}

export interface UpdateProfileInput {
  fullName: string;
  birthDate?: string | null;
  dob?: string | null;
  gender?: string | null;
  phone?: string;
  email?: string;
  avatarUrl?: string | null;
}

/**
 * Update the authenticated user's profile via PUT /profiles/:userId.
 * Supported fields: full_name, birth_date (YYYY-MM-DD), gender, profile_image (string URL).
 */
export async function updateProfile(
  supabase: SupabaseClient,
  input: UpdateProfileInput,
): Promise<{ success: boolean; message?: string }> {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error("Must be authenticated to update profile.");

  try {
    const birthDate = formatToIsoDate(input.birthDate ?? input.dob);
    const gender = normalizeGender(input.gender);

    const payload: Record<string, unknown> = {
      full_name: input.fullName,
      birth_date: birthDate,
      gender: gender,
    };

    if (input.avatarUrl !== undefined) {
      payload.profile_image = input.avatarUrl || "";
      payload.avatar_url = input.avatarUrl || "";
    }

    const response = await api.put(`/profiles/${user.id}`, payload);

    if (response.data && response.data.success === false) {
      throw new Error(response.data.message || "Failed to update profile.");
    }

    // Also update Supabase profiles table directly for consistency
    if (input.avatarUrl !== undefined) {
      await supabase
        .from("profiles")
        .update({
          profile_image: input.avatarUrl || "",
          updated_at: new Date().toISOString(),
        })
        .eq("id", user.id);
    }

    return {
      success: true,
      message: response.data?.message || "Profile updated successfully",
    };
  } catch (error: unknown) {
    throw new Error(getErrorMessage(error, "Failed to update profile."));
  }
}

/**
 * Upload an avatar image to storage and return its public URL.
 * Does NOT call backend PUT or update database — that is only done when form is submitted.
 */
export async function uploadAvatar(
  supabase: SupabaseClient,
  file: File,
): Promise<string> {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error("Must be authenticated to upload an avatar.");

  const fileExt = file.name.split('.').pop() || "jpg";
  const filePath = `${user.id}/${Date.now()}.${fileExt}`;

  const { error: uploadError } = await supabase.storage
    .from("avatars")
    .upload(filePath, file, { upsert: true });

  if (uploadError) {
    throw new Error(uploadError.message ?? "Failed to upload avatar.");
  }

  const { data } = supabase.storage.from("avatars").getPublicUrl(filePath);
  return data.publicUrl;
}

/**
 * Remove an avatar file from storage.
 */
export async function deleteAvatar(
  supabase: SupabaseClient,
  filePath?: string,
): Promise<void> {
  if (!filePath) return;
  try {
    await supabase.storage.from("avatars").remove([filePath]);
  } catch {
    // Ignore storage deletion errors
  }
}

// ---------------------------------------------------------------------------
// Address Reads (via Supabase profiles.address_info JSONB)
// ---------------------------------------------------------------------------

/**
 * Fetch all addresses belonging to the authenticated user from public.profiles.address_info.
 * Returns an empty array if the user has none or is not authenticated.
 *
 * @deprecated Prefer `fetchProfileWithAddresses` when you also need the profile —
 * it avoids a second round-trip to Supabase.
 */
export async function fetchAddresses(
  supabase: SupabaseClient,
): Promise<Address[]> {
  const { addresses } = await fetchProfileWithAddresses(supabase);
  return addresses;
}

// ---------------------------------------------------------------------------
// Address Mutations (via Backend REST APIs)
// ---------------------------------------------------------------------------

export interface SaveAddressInput {
  fullName?: string;
  phone?: string;
  email?: string;
  line1: string;
  line2?: string;
  city: string;
  state: string;
  pincode: string;
  country?: string;
  addressType: AddressType;
  isDefault?: boolean;
}

/**
 * Insert a new address for the authenticated user via POST /profiles/:userId/addresses.
 * Returns the created Address on success.
 */
export async function saveAddress(
  supabase: SupabaseClient,
  input: SaveAddressInput,
): Promise<Address> {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error("Must be authenticated to save an address.");

  const fullNameVal = input.fullName?.trim() || "Customer";
  const rawPhone = input.phone?.trim() || "";
  const cleanPhone = rawPhone.replace(/\D/g, "");

  const newAddressId = `addr_${Date.now()}`;
  const addressToSave: Address = {
    id: newAddressId,
    fullName: fullNameVal,
    phone: cleanPhone || rawPhone || null,
    email: input.email?.trim() || null,
    line1: input.line1.trim(),
    line2: input.line2?.trim() || null,
    city: input.city.trim(),
    state: input.state.trim(),
    pincode: input.pincode.trim(),
    country: input.country || "India",
    addressType: input.addressType || "home",
    isDefault: input.isDefault ?? false,
  };

  try {
    const payload: Record<string, any> = {
      full_name: fullNameVal,
      fullName: fullNameVal,
      phone_number: cleanPhone || rawPhone,
      phone: cleanPhone || rawPhone,
      line1: input.line1.trim(),
      line2: input.line2?.trim() || "",
      city: input.city.trim(),
      state: input.state.trim(),
      pincode: input.pincode.trim(),
      country: input.country || "India",
      address_type: input.addressType || "home",
      is_default: input.isDefault ?? false,
    };
    if (input.email?.trim()) {
      payload.email = input.email.trim();
      payload.email_id = input.email.trim();
    }

    const response = await api.post(`/profiles/${user.id}/addresses`, payload);

    if (response.data && (response.data.success !== false)) {
      if (response.data.address_id) {
        addressToSave.id = response.data.address_id;
      }
      return addressToSave;
    }
  } catch (apiError: unknown) {
    console.warn("[profile.service] REST API /profiles/:userId/addresses failed, falling back to direct Supabase update:", apiError);
  }

  // Fallback: update Supabase profiles.address_info directly
  try {
    const { data: profileData } = await supabase
      .from("profiles")
      .select("id, address_info, full_name, phone")
      .eq("id", user.id)
      .maybeSingle();

    let existingAddresses: any[] = [];
    if (profileData && Array.isArray(profileData.address_info)) {
      existingAddresses = [...profileData.address_info];
    }

    if (input.isDefault) {
      existingAddresses = existingAddresses.map((a) => ({
        ...a,
        is_default: false,
        isDefault: false,
      }));
    } else if (existingAddresses.length === 0) {
      addressToSave.isDefault = true;
    }

    const rawAddressForDb = {
      id: addressToSave.id,
      address_id: addressToSave.id,
      full_name: addressToSave.fullName,
      fullName: addressToSave.fullName,
      phone: addressToSave.phone,
      phone_number: addressToSave.phone,
      email: addressToSave.email,
      email_id: addressToSave.email,
      line1: addressToSave.line1,
      line2: addressToSave.line2,
      city: addressToSave.city,
      state: addressToSave.state,
      pincode: addressToSave.pincode,
      country: addressToSave.country,
      address_type: addressToSave.addressType,
      is_default: addressToSave.isDefault,
    };

    existingAddresses.unshift(rawAddressForDb);

    if (!profileData) {
      await supabase.from("profiles").insert({
        id: user.id,
        full_name: fullNameVal,
        phone: cleanPhone || rawPhone || "",
        address_info: existingAddresses,
        email_id: user.email,
        updated_at: new Date().toISOString(),
      });
    } else {
      await supabase
        .from("profiles")
        .update({
          address_info: existingAddresses,
          updated_at: new Date().toISOString(),
        })
        .eq("id", user.id);
    }

    return addressToSave;
  } catch (dbError: unknown) {
    console.error("[profile.service] Supabase direct address save failed:", dbError);
    return addressToSave;
  }
}

/**
 * Update an existing address for the authenticated user via PUT /profiles/:userId/addresses.
 * Returns the updated Address on success.
 */
export async function updateAddress(
  supabase: SupabaseClient,
  id: string,
  input: SaveAddressInput,
): Promise<Address> {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error("Must be authenticated to update an address.");

  const fullNameVal = input.fullName?.trim() || "Customer";
  const rawPhone = input.phone?.trim() || "";
  const cleanPhone = rawPhone.replace(/\D/g, "");

  const updatedAddr: Address = {
    id,
    fullName: fullNameVal,
    phone: cleanPhone || rawPhone || null,
    email: input.email?.trim() || null,
    line1: input.line1.trim(),
    line2: input.line2?.trim() || null,
    city: input.city.trim(),
    state: input.state.trim(),
    pincode: input.pincode.trim(),
    country: input.country || "India",
    addressType: input.addressType || "home",
    isDefault: input.isDefault ?? false,
  };

  try {
    const payload: Record<string, any> = {
      address_id: id,
      full_name: fullNameVal,
      fullName: fullNameVal,
      phone_number: cleanPhone || rawPhone,
      phone: cleanPhone || rawPhone,
      line1: input.line1.trim(),
      line2: input.line2?.trim() || "",
      city: input.city.trim(),
      state: input.state.trim(),
      pincode: input.pincode.trim(),
      country: input.country || "India",
      address_type: input.addressType || "home",
      is_default: input.isDefault ?? false,
    };
    if (input.email?.trim()) {
      payload.email = input.email.trim();
      payload.email_id = input.email.trim();
    }

    const response = await api.put(`/profiles/${user.id}/addresses`, payload);

    if (response.data && (response.data.success !== false)) {
      return updatedAddr;
    }
  } catch (apiError: unknown) {
    console.warn("[profile.service] REST API PUT /profiles/:userId/addresses failed, falling back to direct Supabase update:", apiError);
  }

  // Fallback: update Supabase profiles.address_info directly
  try {
    const { data: profileData } = await supabase
      .from("profiles")
      .select("id, address_info")
      .eq("id", user.id)
      .maybeSingle();

    if (profileData && Array.isArray(profileData.address_info)) {
      const addresses = profileData.address_info.map((item: any) => {
        const match = item.id === id || item.address_id === id;
        if (!match) {
          return input.isDefault ? { ...item, is_default: false, isDefault: false } : item;
        }
        return {
          ...item,
          full_name: input.fullName || item.full_name,
          fullName: input.fullName || item.fullName,
          phone: input.phone || item.phone,
          phone_number: input.phone || item.phone_number,
          email: input.email || item.email,
          email_id: input.email || item.email_id,
          line1: input.line1,
          line2: input.line2 || null,
          city: input.city,
          state: input.state,
          pincode: input.pincode,
          country: input.country || "India",
          address_type: input.addressType || item.address_type || "home",
          is_default: input.isDefault ?? item.is_default ?? false,
        };
      });

      await supabase
        .from("profiles")
        .update({
          address_info: addresses,
          updated_at: new Date().toISOString(),
        })
        .eq("id", user.id);
    }
    return updatedAddr;
  } catch (dbError: unknown) {
    console.error("[profile.service] Supabase direct address update failed:", dbError);
    return updatedAddr;
  }
}

/**
 * Delete an address for the authenticated user via DELETE /profiles/:userId/addresses.
 */
export async function deleteAddress(
  supabase: SupabaseClient,
  id: string,
): Promise<void> {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    if (typeof window !== "undefined") {
      try {
        const local = localStorage.getItem("guest_addresses");
        if (local) {
          const addresses: Address[] = JSON.parse(local);
          const filtered = addresses.filter((a) => a.id !== id);
          localStorage.setItem("guest_addresses", JSON.stringify(filtered));
        }
      } catch (e) {
        console.error("[profile.service] Failed to delete guest address:", e);
      }
    }
    return;
  }

  try {
    const response = await api.delete(`/profiles/${user.id}/addresses`, {
      data: { address_id: id },
    });

    if (response.data && response.data.success !== false) {
      return;
    }
  } catch (apiError: unknown) {
    console.warn("[profile.service] REST API DELETE /profiles/:userId/addresses failed, falling back to direct Supabase update:", apiError);
  }

  // Fallback: delete from Supabase profiles.address_info directly
  try {
    const { data: profileData } = await supabase
      .from("profiles")
      .select("id, address_info")
      .eq("id", user.id)
      .maybeSingle();

    if (profileData && Array.isArray(profileData.address_info)) {
      const addresses = profileData.address_info.filter(
        (item: any) => item.id !== id && item.address_id !== id
      );

      await supabase
        .from("profiles")
        .update({
          address_info: addresses,
          updated_at: new Date().toISOString(),
        })
        .eq("id", user.id);
    }
  } catch (dbError: unknown) {
    console.error("[profile.service] Supabase direct address delete failed:", dbError);
  }
}

/**
 * Set a specific address as default for the authenticated user via PUT /profiles/:userId/addresses.
 * Accepts userId directly — callers read it from the auth store to avoid an
 * extra supabase.auth.getUser() network round-trip.
 */
export async function setDefaultAddress(
  userId: string,
  id: string,
): Promise<void> {
  if (!userId) throw new Error("Must be authenticated to update default address.");

  try {
    const response = await api.put(`/profiles/${userId}/addresses`, {
      address_id: id,
      is_default: true,
    });

    if (response.data && response.data.success !== false) {
      return;
    }
  } catch (apiError: unknown) {
    console.warn("[profile.service] REST API setDefaultAddress failed, falling back to direct Supabase update:", apiError);
  }

  // Fallback: update default in Supabase profiles.address_info directly
  try {
    const supabase = createSupabaseBrowserClient();
    const { data: profileData } = await supabase
      .from("profiles")
      .select("id, address_info")
      .eq("id", userId)
      .maybeSingle();

    if (profileData && Array.isArray(profileData.address_info)) {
      const addresses = profileData.address_info.map((item: any) => {
        const isTarget = item.id === id || item.address_id === id;
        return {
          ...item,
          is_default: isTarget,
          isDefault: isTarget,
        };
      });

      await supabase
        .from("profiles")
        .update({
          address_info: addresses,
          updated_at: new Date().toISOString(),
        })
        .eq("id", userId);
    }
  } catch (dbError: unknown) {
    console.error("[profile.service] Supabase direct setDefaultAddress failed:", dbError);
  }
}
