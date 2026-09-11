"use client";

import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";
import ProfileIdentityCard from "@/components/account/ProfileIdentityCard";
import SavedAddressesCard from "@/components/account/SavedAddressesCard";
import ProfileMenu from "@/components/account/ProfileMenu";
import PoliciesCard from "@/components/account/PoliciesCard";
import ProfilePageSkeleton from "@/components/account/ProfilePageSkeleton";
import LogoutButton from "@/components/account/LogoutButton";

export default function ProfilePage() {
  const { profile, addresses, isAuthenticated, loading, initialized } = useAuth();

  // ── Loading: show skeleton while session initialises ────────────────────
  if (!initialized || loading) {
    return (
      <div className="bg-surface-subtle min-h-full flex flex-col flex-1">
        <div className="flex-1 p-4 md:p-6 lg:p-8">
          <ProfilePageSkeleton />
        </div>
      </div>
    );
  }

  // ── Unauthenticated ─────────────────────────────────────────────────────
  if (!isAuthenticated || !profile) {
    return (
      <div className="bg-surface-subtle min-h-full flex flex-col flex-1">
        <div className="flex flex-1 flex-col items-center justify-center gap-5 p-4 py-16 text-center max-w-xl mx-auto w-full">
          <div className="flex size-20 items-center justify-center rounded-full bg-white border border-border-strong shadow-2xs">
            <svg
              className="size-10 text-text-muted"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.5}
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
              />
            </svg>
          </div>
          <div>
            <h1 className="text-lg font-bold text-text-primary">Sign in to your account</h1>
            <p className="mt-1.5 text-sm text-text-secondary">
              Track orders, manage addresses, and more.
            </p>
          </div>
          <Link
            href="/login"
            className="inline-flex items-center rounded-full bg-primary-orange px-8 py-3 text-[13px] font-semibold text-white transition-all hover:bg-primary-orange-hover active:scale-[0.98] shadow-xs"
          >
            Sign in
          </Link>
        </div>
      </div>
    );
  }

  // ── Authenticated ────────────────────────────────────────────────────────
  return (
    <div className="bg-surface-subtle flex-1 flex flex-col">
      <div className="flex-1 flex flex-col pt-4 pb-20 md:pb-6 md:p-6 lg:p-8">
        <div className="mx-auto flex flex-1 w-full max-w-xl flex-col gap-[16px] px-4 md:px-0">
          <ProfileIdentityCard profile={profile} />

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
