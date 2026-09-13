"use client";

import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";

interface LogoutButtonProps {
  className?: string;
}

/**
 * Logout button — invokes useAuth().logout() and tracks logout progress.
 */
export default function LogoutButton({ className = "" }: LogoutButtonProps) {
  const { logout, loading } = useAuth();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    if (isLoggingOut) return;
    setIsLoggingOut(true);
    try {
      await logout();
    } catch {
      setIsLoggingOut(false);
    }
  };

  return (
    <button
      type="button"
      onClick={handleLogout}
      disabled={loading || isLoggingOut}
      id="logout-button"
      className={`inline-flex w-full h-[48px] items-center justify-center rounded-[24px] bg-primary-orange text-[14px] font-semibold text-white transition-all hover:bg-primary-orange-hover active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer ${className}`}
    >
      {isLoggingOut ? "Logging out..." : "Log Out"}
    </button>
  );
}
