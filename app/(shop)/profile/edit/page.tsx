"use client";

import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import ProfilePageHeader from "@/components/account/ProfilePageHeader";
import EditProfileClient from "@/components/account/EditProfileClient";
import ProfilePageSkeleton from "@/components/account/ProfilePageSkeleton";

export default function EditProfilePage() {
  const { profile, isAuthenticated, loading, initialized } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (initialized && !loading && !isAuthenticated) {
      router.replace("/login?redirectTo=/profile/edit");
    }
  }, [initialized, loading, isAuthenticated, router]);

  if (!initialized || loading || !profile) {
    return (
      <div className="bg-surface-subtle flex-1 h-full flex flex-col pb-20 lg:pb-10">
        <ProfilePageHeader title="Edit Profile" />
        <div className="flex-1 px-[16px] pt-6 md:p-6 lg:p-8 max-w-7xl mx-auto w-full md:px-8">
          <ProfilePageSkeleton />
        </div>
      </div>
    );
  }

  return (
    <div className="bg-surface-subtle flex-1 h-full flex flex-col pb-20 lg:pb-10">
      <ProfilePageHeader title="Edit Profile" />

      <div className="flex-1 px-[16px] pt-6 md:p-6 lg:py-8 lg:px-8 max-w-7xl mx-auto w-full">
        <div className="mx-auto w-full max-w-7xl px-[16px] md:px-8">
          <EditProfileClient
            initialProfile={{
              full_name: profile.fullName || undefined,
              email: profile.email || undefined,
              phone: profile.phone || undefined,
              dob: profile.dob || undefined,
              gender: profile.gender || undefined,
              avatar_url: profile.avatarUrl || undefined,
            }}
          />
        </div>
      </div>
    </div>
  );
}

