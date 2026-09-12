"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import ProfileIdentityCard from "@/components/account/ProfileIdentityCard";
import SavedAddressesCard from "@/components/account/SavedAddressesCard";
import ProfileMenu from "@/components/account/ProfileMenu";
import PoliciesCard from "@/components/account/PoliciesCard";
import ProfilePageSkeleton from "@/components/account/ProfilePageSkeleton";
import LogoutButton from "@/components/account/LogoutButton";
import type { UserProfile } from "@/components/account/types";

export default function ProfilePage() {
  const router = useRouter();
  const { user, profile, addresses, isAuthenticated, loading, initialized } = useAuth();

  useEffect(() => {
    if (initialized && !loading && !isAuthenticated && !user) {
      router.replace("/login?redirectTo=/profile");
    }
  }, [initialized, loading, isAuthenticated, user, router]);

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
      (user?.phone ? `User ${user.phone.slice(-4)}` : "Valued Customer"),
    email: user?.email || null,
    phone: user?.phone || user?.user_metadata?.phone || null,
    avatarUrl: user?.user_metadata?.avatar_url || null,
    dob: null,
    gender: null,
  };

  // ── Authenticated ────────────────────────────────────────────────────────
  return (
    <div className="bg-surface-subtle flex-1 flex flex-col">
      <div className="flex-1 flex flex-col pt-4 pb-20 md:pb-6 md:p-6 lg:p-8">
        <div className="mx-auto flex flex-1 w-full max-w-xl flex-col gap-[16px] px-4 md:px-0">
          <ProfileIdentityCard profile={effectiveProfile} />

          <SavedAddressesCard addresses={addresses} />

          <ProfileMenu />

          <PoliciesCard />

          <div className="pt-1 pb-2">
            <LogoutButton />
          </div>
        </div>
      </div>
    </div>
  );
}
