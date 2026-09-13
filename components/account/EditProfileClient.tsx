"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { toast } from "@/lib/toast";
import { useAuth } from "@/hooks/useAuth";
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

function CameraIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z" />
      <circle cx="12" cy="13" r="3" />
    </svg>
  );
}

export default function EditProfileClient({ initialProfile }: EditProfileClientProps) {
  const { updateProfile, uploadAvatar, removeAvatar } = useAuth();
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [loading, setLoading] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(
    initialProfile?.avatar_url || null
  );

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

  const handleAvatarSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Invalid file", "Please select an image file (PNG, JPG, WEBP).");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("File too large", "Image size must be less than 5MB.");
      return;
    }

    setUploadingAvatar(true);
    try {
      const publicUrl = await uploadAvatar(file);
      setAvatarUrl(publicUrl);
      toast.success("Photo selected", "Click 'Save Changes' to apply updates to your profile.");
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to upload photo";
      toast.error("Upload failed", message);
    } finally {
      setUploadingAvatar(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleRemoveAvatar = () => {
    setAvatarUrl(null);
    toast.info("Photo removed", "Click 'Save Changes' to apply updates to your profile.");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const result = await updateProfile({
        fullName: formData.full_name,
        dob: formData.dob,
        gender: formData.gender,
        avatarUrl: avatarUrl,
      });

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
          <div className="w-[100px] h-[100px] rounded-full overflow-hidden border-2 border-border-strong relative bg-surface-neutral shadow-sm">
            {avatarUrl ? (
              <img
                src={avatarUrl}
                alt="User Avatar"
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-primary-orange text-[36px] font-bold font-['Montserrat'] uppercase">
                {formData.full_name?.charAt(0) || initialProfile?.email?.charAt(0) || "U"}
              </div>
            )}

            {uploadingAvatar && (
              <div className="absolute inset-0 bg-black/50 flex items-center justify-center rounded-full">
                <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
              </div>
            )}
          </div>

          {/* Camera / Edit Badge Button */}
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploadingAvatar}
            className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-primary-orange text-white flex items-center justify-center shadow-md hover:brightness-110 active:scale-95 transition-all cursor-pointer border-2 border-white disabled:opacity-50"
            title={avatarUrl ? "Change photo" : "Add photo"}
            aria-label={avatarUrl ? "Change profile photo" : "Add profile photo"}
          >
            <CameraIcon className="w-4 h-4" />
          </button>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/png,image/jpeg,image/webp,image/gif"
            onChange={handleAvatarSelect}
            className="hidden"
          />
        </div>

        {/* Change / Remove Action Links */}
        <div className="flex items-center gap-3 mt-2.5 text-[12px] font-medium font-['Montserrat']">
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploadingAvatar}
            className="text-primary-orange hover:underline cursor-pointer disabled:opacity-50 font-semibold"
          >
            {avatarUrl ? "Change Photo" : "Add Photo"}
          </button>
          {avatarUrl && (
            <>
              <span className="text-text-muted select-none">•</span>
              <button
                type="button"
                onClick={handleRemoveAvatar}
                disabled={uploadingAvatar}
                className="text-red-500 hover:underline cursor-pointer disabled:opacity-50"
              >
                Remove
              </button>
            </>
          )}
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
