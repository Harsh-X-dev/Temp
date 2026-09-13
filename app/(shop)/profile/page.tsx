"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import ProfileIdentityCard from "@/components/account/ProfileIdentityCard";
import SavedAddressesCard from "@/components/account/SavedAddressesCard";
import ProfileMenu from "@/components/account/ProfileMenu";
import PoliciesCard from "@/components/account/PoliciesCard";
import ProfilePageSkeleton from "@/components/account/ProfilePageSkeleton";
import LogoutButton from "@/components/account/LogoutButton";
import InitialProfileCreationSheet from "@/components/auth/InitialProfileCreationSheet";
import { createProfile } from "@/services/profile.service";
import { createSupabaseBrowserClient } from "@/services/supabase/client";
import { toast } from "@/lib/toast";
import type { UserProfile } from "@/components/account/types";
import type { CreateProfileInput } from "@/types/checkout.types";

export default function ProfilePage() {
  const router = useRouter();
  const { user, profile, addresses, isAuthenticated, loading, initialized, refreshProfile } = useAuth();
  const hasRedirectedRef = useRef(false);

  const [isCreateProfileOpen, setIsCreateProfileOpen] = useState(false);
  const [isSubmittingProfile, setIsSubmittingProfile] = useState(false);

  useEffect(() => {
    if (initialized && !loading && !isAuthenticated && !user) {
      if (!hasRedirectedRef.current) {
        hasRedirectedRef.current = true;
        if (typeof window !== "undefined") {
          window.location.replace("/login?redirectTo=/profile");
        } else {
          router.replace("/login?redirectTo=/profile");
        }
      }
    }
  }, [initialized, loading, isAuthenticated, user, router]);

  const handleCreateProfileSubmit = async (input: CreateProfileInput) => {
    setIsSubmittingProfile(true);
    try {
      const supabase = createSupabaseBrowserClient();
      await createProfile(supabase, input);
      await refreshProfile();
      setIsCreateProfileOpen(false);
      toast.success("Profile created", "Your profile has been created successfully!");
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to create profile. Please try again.";
      toast.error("Error", message);
    } finally {
      setIsSubmittingProfile(false);
    }
  };

  // ── Loading / Redirecting ────────────────────────────────────────────────
  if (!initialized || loading || (!isAuthenticated && !user)) {
    return (
      <div className="bg-surface-subtle min-h-full flex flex-col flex-1">
        <div className="flex-1 p-4 md:p-6 lg:p-8">
          <ProfilePageSkeleton />
        </div>
      </div>
    );
  }

  // ── Fallback profile for authenticated users without DB row ─────────────
  const effectiveProfile: UserProfile = profile || {
    id: user?.id || "",
    fullName:
      user?.user_metadata?.full_name ||
      user?.user_metadata?.name ||
      "Valued Customer",
    email: null,
    phone: user?.phone || user?.user_metadata?.phone || null,
    avatarUrl: user?.user_metadata?.avatar_url || null,
    dob: null,
    gender: null,
  };

  const rawPhone = user?.phone || effectiveProfile.phone || "";
  const phoneWithoutCode = rawPhone.replace(/\D/g, "").slice(-10);

  // ── Authenticated ────────────────────────────────────────────────────────
  return (
    <div className="bg-surface-subtle flex-1 flex flex-col">
      <div className="flex-1 flex flex-col pt-4 pb-20 md:pb-6 md:p-6 lg:p-8">
        <div className="mx-auto flex flex-1 w-full max-w-xl flex-col gap-[16px] px-4 md:px-0">
          <ProfileIdentityCard
            profile={effectiveProfile}
            onCreateProfile={() => setIsCreateProfileOpen(true)}
          />

          <SavedAddressesCard addresses={addresses} />

          <ProfileMenu />

          <PoliciesCard />

          <div className="pt-1 pb-2">
            <LogoutButton />
          </div>
        </div>
      </div>

      {user && (
        <InitialProfileCreationSheet
          isOpen={isCreateProfileOpen}
          onClose={() => setIsCreateProfileOpen(false)}
          userId={user.id}
          phone={phoneWithoutCode}
          initialFullName=""
          onSubmit={handleCreateProfileSubmit}
          isSubmitting={isSubmittingProfile}
        />
      )}
    </div>
  );
}
