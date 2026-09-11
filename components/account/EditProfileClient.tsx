"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "@/lib/toast";
import { updateProfile } from "@/services/profile.service";
import { createSupabaseBrowserClient } from "@/services/supabase/client";
import { useAuthStore } from "@/store/auth.store";
import DatePickerDropdown from "@/components/ui/inputs/DatePickerDropdown";
import GenderDropdown from "@/components/ui/inputs/GenderDropdown";

interface EditProfileClientProps {
  initialProfile: {
    full_name?: string;
    email?: string;
    phone?: string;
    dob?: string;
    gender?: string;
    avatar_url?: string;
  };
}

/** Helper to format ISO date (YYYY-MM-DD) to DD/MM/YYYY for input display */
function formatInitialDob(val?: string): string {
  if (!val) return "";
  if (/^\d{4}-\d{2}-\d{2}$/.test(val)) {
    const [y, m, d] = val.split("-");
    return `${d}/${m}/${y}`;
  }
  return val;
}

/** Helper to normalise gender string to option value */
function formatInitialGender(val?: string): string {
  if (!val) return "";
  const lower = val.toLowerCase().trim();
  if (lower === "female") return "Female";
  if (lower === "male") return "Male";
  if (lower === "other") return "Other";
  if (lower === "prefer not to say" || lower === "prefer_not_to_say") return "Prefer not to say";
  return val;
}


export default function EditProfileClient({ initialProfile }: EditProfileClientProps) {
  const setProfile = useAuthStore((state) => state.setProfile);
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    full_name: initialProfile?.full_name || "",
    email: initialProfile?.email || "",
    phone: initialProfile?.phone || "",
    dob: formatInitialDob(initialProfile?.dob),
    gender: formatInitialGender(initialProfile?.gender),
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleDobChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value;
    // @ts-ignore - nativeEvent exists on ChangeEvent but TS might not infer inputType
    const isDeleting = e.nativeEvent?.inputType === "deleteContentBackward";

    if (!isDeleting) {
      val = val.replace(/\D/g, ""); // strip non-digits
      if (val.length > 2 && val.length <= 4) {
        val = `${val.slice(0, 2)}/${val.slice(2)}`;
      } else if (val.length > 4) {
        val = `${val.slice(0, 2)}/${val.slice(2, 4)}/${val.slice(4, 8)}`;
      } else if (val.length === 2) {
        val = `${val}/`;
      }
    }

    setFormData((prev) => ({ ...prev, dob: val }));
  };

  const handleNativeDateSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value; // YYYY-MM-DD format
    if (val) {
      const [y, m, d] = val.split("-");
      setFormData((prev) => ({ ...prev, dob: `${d}/${m}/${y}` }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const supabase = createSupabaseBrowserClient();
      const result = await updateProfile(supabase, {
        fullName: formData.full_name,
        dob: formData.dob,
        gender: formData.gender,
      });
      
      
      // Update the global auth store so the rest of the app (like the Profile page) sees the changes immediately
      const currentProfile = useAuthStore.getState().profile;
      if (currentProfile) {
        setProfile({
          ...currentProfile,
          fullName: formData.full_name,
          dob: formData.dob,
          gender: formData.gender,
          updatedAt: new Date().toISOString(),
        });
      }
      toast.success("Profile updated", result.message || "Profile updated successfully");
      router.push("/profile");
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "An unexpected error occurred";
      toast.error("Error", message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6 lg:gap-8 w-full pb-8">
      {/* Profile Photo Container */}
      <div className="flex flex-col items-center w-full">
        <div className="relative w-[100px] h-[100px]">
          <div className="w-[100px] h-[100px] rounded-full overflow-hidden border border-border-strong">
            {/* Fallback avatar image or Initials */}
            {initialProfile?.avatar_url ? (
              <img
                src={initialProfile.avatar_url}
                alt="User Avatar"
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-surface-neutral flex items-center justify-center text-primary-orange text-[36px] font-bold font-['Montserrat'] uppercase">
                {initialProfile?.full_name?.charAt(0) || initialProfile?.email?.charAt(0) || "U"}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Fields Stack */}
      <div className="flex flex-col gap-4 w-full">
        {/* Full Name */}
        <div className="flex flex-col gap-2 w-full">
          <label htmlFor="full_name" className="font-semibold text-[12px] text-text-secondary tracking-[0.5px] uppercase">
            Full Name
          </label>
          <div className="flex items-center px-4 h-[48px] w-full bg-white border border-border-strong rounded-[12px] drop-shadow-[0px_2px_4px_rgba(0,0,0,0.04)] focus-within:border-primary-orange focus-within:ring-1 focus-within:ring-primary-orange transition-colors">
            <input
              id="full_name"
              name="full_name"
              type="text"
              placeholder="Enter your Name"
              value={formData.full_name}
              onChange={handleChange}
              className="flex-1 font-medium text-[13px] text-text-primary bg-transparent outline-none w-full placeholder:text-text-muted"
              required
            />
          </div>
        </div>

        {/* Email Address - Read Only / Disabled */}
        <div className="flex flex-col gap-2 w-full">
          <div className="flex items-center justify-between">
            <label htmlFor="email" className="font-semibold text-[12px] text-text-secondary tracking-[0.5px] uppercase">
              Email Address
            </label>
            <span className="text-[11px] text-text-muted font-medium">Non-editable</span>
          </div>
          <div className="flex items-center px-4 h-[48px] w-full bg-[#f6f5f3] border border-border-strong/50 rounded-[12px] cursor-not-allowed">
            <input
              id="email"
              name="email"
              type="email"
              placeholder="No email provided"
              value={formData.email}
              readOnly
              disabled
              className="flex-1 font-medium text-[13px] text-text-secondary bg-transparent outline-none w-full placeholder:text-text-muted cursor-not-allowed"
            />
          </div>
        </div>

        {/* Phone Number - Read Only / Disabled */}
        <div className="flex flex-col gap-2 w-full">
          <div className="flex items-center justify-between">
            <label htmlFor="phone" className="font-semibold text-[12px] text-text-secondary tracking-[0.5px] uppercase">
              Phone Number
            </label>
            <span className="text-[11px] text-text-muted font-medium">Non-editable</span>
          </div>
          <div className="flex items-center px-4 h-[48px] w-full bg-[#f6f5f3] border border-border-strong/50 rounded-[12px] cursor-not-allowed">
            <input
              id="phone"
              name="phone"
              type="tel"
              placeholder="No phone provided"
              value={formData.phone}
              readOnly
              disabled
              className="flex-1 font-medium text-[13px] text-text-secondary bg-transparent outline-none w-full placeholder:text-text-muted cursor-not-allowed"
            />
          </div>
        </div>

        {/* Split Row */}
        <div className="flex gap-4 w-full items-start relative">
          {/* Date of Birth */}
          <DatePickerDropdown
            value={formData.dob}
            onChange={(val) => setFormData((prev) => ({ ...prev, dob: val }))}
          />

          {/* Gender */}
          <GenderDropdown
            value={formData.gender}
            onChange={(val) => setFormData((prev) => ({ ...prev, gender: val }))}
          />
        </div>
      </div>

      {/* CTA Wrapper */}
      <div className="pt-3 w-full">
        <button
          type="submit"
          disabled={loading}
          className="flex items-center justify-center w-full h-[52px] bg-primary-orange text-white font-bold text-[15px] rounded-[24px] drop-shadow-[0px_6px_8px_rgba(0,0,0,0.08)] transition-all hover:bg-primary-orange-hover hover:drop-shadow-[0px_4px_6px_rgba(0,0,0,0.12)] active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed"
        >
          {loading ? "Saving..." : "Save Changes"}
        </button>
      </div>
    </form>
  );
}
