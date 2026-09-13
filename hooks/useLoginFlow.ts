"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { isValidPhone, isValidOtp, isProfileComplete } from "@/lib/validators";
import { sendOtp, verifyOtp } from "@/services/auth.service";
import { OTP_LENGTH, RESEND_SECONDS } from "@/lib/constants/auth";
import { createSupabaseBrowserClient } from "@/services/supabase/client";
import { useAuthStore } from "@/store/auth.store";
import { fetchProfileWithAddresses } from "@/services/profile.service";
import { classifyAuthError } from "@/lib/errors/auth.errors";
import { toast } from "@/lib/toast";
import type { LoginStep } from "@/types/auth.types";
import type { UserProfile, Address } from "@/components/account/types";

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
 *   step, phone, otp, verificationId, countdown, loading, isResending, error
 *
 * One loading/error pair shared across all steps — only one step is active at
 * a time, so there is no ambiguity about which operation is in-flight.
 *
 * Error handling:
 *   All API errors flow through classifyAuthError() in lib/errors/auth.errors.ts.
 *   Raw provider / backend strings are NEVER shown to users.
 *   Both an inline error and a Sonner toast are shown for every auth failure.
 *
 * Resend behaviour:
 *   1. User clicks Resend.
 *   2. isResending is set → button disabled, duplicate clicks prevented.
 *   3. API is called.
 *   4. On success: verificationId updated, OTP cleared, countdown started at RESEND_SECONDS.
 *   5. On 429: Retry-After header is used as countdown duration (not RESEND_SECONDS).
 *   6. On other error: inline error + toast shown, countdown NOT started.
 *
 * Flow:
 *   1. User enters phone → handlePhoneSubmit → sendOtp → step "otp"
 *   2. User enters OTP  → handleOtpSubmit  → verifyOtp → setSession
 *                       → fetchProfileWithAddresses → populate store
 *                       → existing user (has address) → router.push(redirectTo)
 *                       → new user (no address)       → step "create_profile"
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
  const [countdown, setCountdown] = useState<number>(0);
  /**
   * Ref-based in-flight guard for handleResend.
   * Using a ref (not useState) means the guard always reads the current value
   * without creating a stale closure in useCallback, and without adding
   * isResending to the dep array (which would recreate the callback on every
   * state flip and cause the alternating-send bug).
   */
  const isResendingRef = useRef(false);
  /** UI-only state — drives the disabled appearance of the resend button. */
  const [isResending, setIsResending] = useState(false);

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

      // Backend returns HTTP 200 on success; Axios only throws on 4xx/5xx.
      // The only way we reach here is a genuine success response.
      if (!response.verificationId || response.responseCode >= 400) {
        // Body-level failure (e.g. MC returned no verificationId) without an
        // HTTP error — treat as a provider send failure.
        setError("Could not initiate OTP session. Please try again.");
        toast.error("OTP send failed", "Could not initiate OTP session. Please try again.");
        return;
      }

      // Advance to OTP step.
      setVerificationId(response.verificationId);
      setOtp(emptyOtp());
      setCountdown(RESEND_SECONDS);
      setStep("otp");
    } catch (err: unknown) {
      const result = classifyAuthError(err, "send_otp");
      setError(result.inlineMessage);
      toast.error(result.toastTitle, result.toastDescription);
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

      // Success is HTTP 200 with responseCode 200.
      // Any non-success HTTP status throws in Axios and goes to catch below.
      // Check for body-level failure signals (no session / wrong status).
      if (
        response.verificationStatus !== "VERIFICATION_COMPLETED" ||
        !response.session
      ) {
        // Body says failure even though HTTP was 200 — rare edge case.
        // Treat it as a generic failure; do not expose the raw status string.
        setError("OTP verification failed. Please check the code and try again.");
        toast.error("Verification failed", "Please check the code and try again.");
        return;
      }

      // ── Step 2: Establish Supabase session ───────────────────────────────
      // Mark store loading to ensure AuthProvider's SIGNED_IN event does not race
      setStoreLoading(true);

      const supabase = createSupabaseBrowserClient();
      const { data: sessionData, error: sessionError } =
        await supabase.auth.setSession({
          access_token: response.session.access_token,
          refresh_token: response.session.refresh_token,
        });

      if (sessionError || !sessionData.session || !sessionData.user) {
        setStoreLoading(false);
        setError("Failed to establish session. Please try again.");
        toast.error("Session error", "Failed to establish session. Please try again.");
        return;
      }

      // ── Step 3: Immediately establish authenticated state in auth store ───
      setAuth(sessionData.user, sessionData.session);

      // ── Step 4: Resolve the profile ONCE from useLoginFlow ────────────────
      type ProfileResolution =
        | { status: "complete"; profile: UserProfile; addresses: Address[] }
        | { status: "incomplete"; profile: UserProfile; addresses: Address[] }
        | { status: "not_found" }
        | { status: "error"; error: unknown };

      let resolution: ProfileResolution;
      try {
        const { profile, addresses } = await fetchProfileWithAddresses(supabase);

        if (!profile) {
          resolution = { status: "not_found" };
        } else if (isProfileComplete(profile)) {
          resolution = { status: "complete", profile, addresses };
        } else {
          resolution = { status: "incomplete", profile, addresses };
        }
      } catch (profileErr: unknown) {
        resolution = { status: "error", error: profileErr };
      }

      // ── Step 5: Handle the result explicitly ──────────────────────────────
      switch (resolution.status) {
        case "complete": {
          setProfile(resolution.profile);
          setAddresses(resolution.addresses);
          setStoreLoading(false);
          setInitialized(true);
          router.push(redirectTo || "/");
          break;
        }

        case "incomplete": {
          setProfile(resolution.profile);
          setAddresses(resolution.addresses);
          setStoreLoading(false);
          setInitialized(true);
          setStep("create_profile");
          break;
        }

        case "not_found": {
          setProfile(null);
          setAddresses([]);
          setStoreLoading(false);
          setInitialized(true);
          setStep("create_profile");
          break;
        }

        case "error": {
          setStoreLoading(false);
          setError("Failed to load profile. Please try again.");
          toast.error("Profile Error", "Could not load user profile. Please try again.");
          break;
        }
      }

    } catch (err: unknown) {
      const result = classifyAuthError(err, "verify_otp");
      setError(result.inlineMessage);
      toast.error(result.toastTitle, result.toastDescription);
    } finally {
      setLoading(false);
    }
  }

  /**
   * Resends OTP and refreshes the verificationId and countdown.
   *
   * Correct sequence:
   *   1. Prevent duplicate clicks (isResending guard).
   *   2. Call API.
   *   3. On success: update verificationId, reset OTP, start RESEND_SECONDS countdown.
   *   4. On 429:     use Retry-After as countdown, show inline + toast error.
   *   5. On error:   show inline + toast error, do NOT start countdown.
   */
  const handleResend = useCallback(async () => {
    // Use the ref for the guard — it always reflects the current in-flight
    // state without being a stale closure value from the dep array.
    if (isResendingRef.current) return;

    isResendingRef.current = true;
    setError(null);
    setIsResending(true); // UI only

    try {
      const response = await sendOtp(phone);

      if (!response.verificationId || response.responseCode >= 400) {
        // Body-level failure without HTTP error.
        setError("Could not resend OTP. Please try again.");
        toast.error("Resend failed", "Could not resend OTP. Please try again.");
        return;
      }

      // Success — update verificationId, reset OTP, start standard cooldown.
      setVerificationId(response.verificationId);
      setOtp(emptyOtp());
      setCountdown(RESEND_SECONDS);
      toast.success("OTP resent", "A new OTP has been sent to your number.");
    } catch (err: unknown) {
      const result = classifyAuthError(err, "send_otp");

      // Show inline + toast for all error types.
      setError(result.inlineMessage);
      toast.error(result.toastTitle, result.toastDescription);

      // For rate-limit errors, use Retry-After as the countdown so the user
      // sees how long they actually have to wait — never fall back to the
      // hardcoded RESEND_SECONDS on a failed resend.
      if (result.retryAfterSeconds !== null) {
        setCountdown(result.retryAfterSeconds);
      }
      // For non-rate-limit errors, do NOT start a countdown — the resend did
      // not succeed, so there is nothing to count down from.
    } finally {
      isResendingRef.current = false;
      setIsResending(false); // UI only
    }
    // Dep array contains only phone — stable for the entire OTP step.
    // isResending is intentionally excluded; the ref handles the guard.
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
    isResending,
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
