"use client";

import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import ProfilePageHeader from "@/components/account/ProfilePageHeader";
import EditProfileClient from "@/components/account/EditProfileClient";
import ProfilePageSkeleton from "@/components/account/ProfilePageSkeleton";
import type { UserProfile } from "@/components/account/types";

export default function EditProfilePage() {
  const { user, profile, isAuthenticated, loading, initialized } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (initialized && !loading && !isAuthenticated) {
      router.replace("/login?redirectTo=/profile/edit");
    }
  }, [initialized, loading, isAuthenticated, router]);

  if (!initialized || loading || (!isAuthenticated && !user)) {
    return (
      <div className="bg-surface-subtle flex-1 h-full flex flex-col pb-20 lg:pb-10">
        <ProfilePageHeader title="Edit Profile" />
        <div className="flex-1 px-[16px] pt-6 md:p-6 lg:p-8 max-w-7xl mx-auto w-full md:px-8">
          <ProfilePageSkeleton />
        </div>
      </div>
    );
  }

  const effectiveProfile: UserProfile = profile || {
    id: user?.id || "",
    fullName: user?.user_metadata?.full_name || user?.user_metadata?.name || "",
    email: null,
    phone: user?.phone || user?.user_metadata?.phone || null,
    avatarUrl: user?.user_metadata?.avatar_url || null,
    dob: null,
    gender: null,
  };

  return (
    <div className="bg-surface-subtle flex-1 h-full flex flex-col pb-20 lg:pb-10">
      <ProfilePageHeader title="Edit Profile" />

      <div className="flex-1 px-[16px] pt-6 md:p-6 lg:py-8 lg:px-8 max-w-7xl mx-auto w-full">
        <div className="mx-auto w-full max-w-7xl px-[16px] md:px-8">
          <EditProfileClient
            initialProfile={{
              full_name: effectiveProfile.fullName || undefined,
              email: effectiveProfile.email || undefined,
              phone: effectiveProfile.phone || undefined,
              dob: effectiveProfile.dob || undefined,
              gender: effectiveProfile.gender || undefined,
              avatar_url: effectiveProfile.avatarUrl || undefined,
            }}
          />
        </div>
      </div>
    </div>
  );
}

