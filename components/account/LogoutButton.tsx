"use client";

import { useAuth } from "@/hooks/useAuth";

interface LogoutButtonProps {
  className?: string;
}

/**
 * Logout button — uses useAuth().logout() which clears the auth store
 * synchronously before calling Supabase signOut, so the UI reacts instantly.
 */
export default function LogoutButton({ className = "" }: LogoutButtonProps) {
  const { logout, loading } = useAuth();

  return (
    <button
      type="button"
      onClick={logout}
      disabled={loading}
      id="logout-button"
      className={`inline-flex w-full h-[48px] items-center justify-center rounded-[24px] bg-primary-orange text-[14px] font-semibold text-white transition-all hover:bg-primary-orange-hover active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer ${className}`}
    >
      Log Out
    </button>
  );
}
