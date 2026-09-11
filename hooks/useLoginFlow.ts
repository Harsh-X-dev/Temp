"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { isValidPhone } from "@/lib/validators";
import { isValidOtp } from "@/lib/validators";
import { sendOtp, verifyOtp } from "@/services/auth.service";
import { ApiError } from "@/services/http";
import { OTP_LENGTH, RESEND_SECONDS } from "@/lib/constants/auth";
import { createSupabaseBrowserClient } from "@/services/supabase/client";
import { useAuthStore } from "@/store/auth.store";
import { fetchProfileWithAddresses } from "@/services/profile.service";
import type { LoginStep } from "@/types/auth.types";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function emptyOtp(): string[] {
  return Array.from({ length: OTP_LENGTH }, () => "");
}

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

/**
 * Single hook that owns the entire phone → OTP → success login flow.
 *
 * State shape (flat):
 *   step, phone, otp, verificationId, countdown, loading, error
 *
 * One loading/error pair shared across all steps — only one step is active at
 * a time, so there is no ambiguity about which operation is in-flight.
 *
 * Flow:
 *   1. User enters phone → handlePhoneSubmit → sendOtp → step "otp"
 *   2. User enters OTP  → handleOtpSubmit  → verifyOtp → setSession
 *                       → fetchProfileWithAddresses → populate store
 *                       → existing user (has address) → router.push(redirectTo)
 *                       → new user (no address)       → step "success"
 *   3. Resend           → handleResend → sendOtp → refresh verificationId + countdown
 */
export function useLoginFlow() {
  const router = useRouter();
  const searchParams = useSearchParams();

  /** Destination after successful login — falls back to home. */
  const redirectTo = searchParams.get("redirectTo") || "/";

  // ── Shared state ──────────────────────────────────────────────────────────
  const [step, setStep] = useState<LoginStep>("phone");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // ── Phone step state ──────────────────────────────────────────────────────
  const [phone, setPhone] = useState("");

  // ── OTP step state ────────────────────────────────────────────────────────
  const [otp, setOtp] = useState<string[]>(emptyOtp);
  const [verificationId, setVerificationId] = useState("");
  const [countdown, setCountdown] = useState<number>(RESEND_SECONDS);

  // ── Auth store ────────────────────────────────────────────────────────────
  const { setAuth, setProfile, setAddresses, setLoading: setStoreLoading, setInitialized } =
    useAuthStore();

  // ── Countdown timer — decrements every second until zero ─────────────────
  useEffect(() => {
    if (countdown <= 0) return;
    const id = setTimeout(() => setCountdown((c) => c - 1), 1000);
    return () => clearTimeout(id);
  }, [countdown]);

  // ── Phone step handlers ───────────────────────────────────────────────────

  function handlePhoneChange(value: string) {
    setPhone(value);
    if (error) setError(null);
  }

  async function handlePhoneSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!isValidPhone(phone)) {
      setError("Please enter a valid 10-digit phone number.");
      return;
    }

    setLoading(true);
    try {
      const response = await sendOtp(phone);

      if (response.success === false || !response.verificationId || response.responseCode >= 400) {
        setError(response.message || "Could not initiate OTP session. Please try again.");
        return;
      }

      // Advance to OTP step
      setVerificationId(response.verificationId);
      setOtp(emptyOtp());
      setCountdown(RESEND_SECONDS);
      setStep("otp");
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.message ||
        (err instanceof ApiError ? err.message : null) ||
        err.message ||
        "Something went wrong. Please try again.";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }

  // ── OTP step handlers ─────────────────────────────────────────────────────

  function handleOtpChange(value: string[]) {
    setOtp(value);
    if (error) setError(null);
  }

  async function handleOtpSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!isValidOtp(otp)) {
      setError("Please enter all 6 digits.");
      return;
    }

    if (!verificationId) {
      setError("Session expired. Please go back and request a new OTP.");
      return;
    }

    setLoading(true);
    try {
      // ── Step 1: Verify OTP with backend ──────────────────────────────────
      const response = await verifyOtp(phone, otp.join(""), verificationId);

      if (
        response.verificationStatus !== "VERIFICATION_COMPLETED" ||
        !response.session
      ) {
        setError(
          response.message ||
            "OTP verification failed. Please check the code and try again.",
        );
        return;
      }

      // ── Step 2: Establish Supabase session ───────────────────────────────
      const supabase = createSupabaseBrowserClient();
      const { data: sessionData, error: sessionError } =
        await supabase.auth.setSession({
          access_token: response.session.access_token,
          refresh_token: response.session.refresh_token,
        });

      if (sessionError || !sessionData.session || !sessionData.user) {
        setError("Failed to establish session. Please try again.");
        return;
      }

      // ── Step 3: Populate auth store ──────────────────────────────────────
      setAuth(sessionData.user, sessionData.session);

      // ── Step 4: Check if profile exists in Supabase ──────────────────────
      setStoreLoading(true);
      const { profile, addresses } = await fetchProfileWithAddresses(supabase);

      const isProfileComplete =
        profile &&
        profile.fullName?.trim() &&
        profile.phone &&
        addresses.length > 0;

      if (isProfileComplete) {
        console.log("Complete profile exists");

        setProfile(profile);
        setAddresses(addresses);
        setStoreLoading(false);
        setInitialized(true);

        console.log("Redirecting to", redirectTo);
        router.push(redirectTo);
      } else {
        console.log("Profile exists but is incomplete");

        setProfile(profile ?? null);
        setAddresses(addresses);
        setStoreLoading(false);
        setInitialized(true);
        setStep("create_profile");
      }

    } catch (err: any) {
      const serverMessage = err.response?.data?.message;
      if (serverMessage) {
        setError(serverMessage);
      } else {
        const apiError = ApiError.from(err);
        if (apiError.status === 400 || apiError.status === 401) {
          setError("Invalid or expired OTP. Please try again.");
        } else if (apiError.status === 0) {
          setError("Network error. Please check your connection and try again.");
        } else {
          setError(apiError.message || "Something went wrong. Please try again.");
        }
      }
    } finally {
      setLoading(false);
    }
  }

  /** Resends OTP and refreshes the verificationId and countdown. */
  const handleResend = useCallback(async () => {
    setError(null);
    setOtp(emptyOtp());
    setCountdown(RESEND_SECONDS);
    try {
      const response = await sendOtp(phone);

      if (response.success === false || !response.verificationId || response.responseCode >= 400) {
        setError(response.message || "Could not resend OTP. Please try again.");
        return;
      }

      setVerificationId(response.verificationId);
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.message ||
        (err instanceof ApiError ? err.message : null) ||
        err.message ||
        "Failed to resend OTP. Please try again.";
      setError(errorMessage);
    }
  }, [phone]);

  // ── Public API ────────────────────────────────────────────────────────────

  return {
    // Navigation
    step,

    // Phone step
    phone,
    handlePhoneChange,
    handlePhoneSubmit,

    // OTP step
    otp,
    countdown,
    handleOtpChange,
    handleOtpSubmit,
    handleResend,

    // Shared loading/error (one pair for the whole flow)
    isLoading: loading,
    error,

    // Post-auth navigation target (exposed so LoginFlow.tsx can pass it to VerificationSuccessScreen)
    redirectTo,
  };
}
