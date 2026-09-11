"use client";

import Button from "@/components/ui/buttons/Button";
import OtpInput from "@/components/auth/OtpInput";
import { PHONE_PREFIX } from "@/lib/constants/auth";

interface OtpStepProps {
  phone: string;
  otp: string[];
  countdown: number;
  isLoading: boolean;
  error: string | null;
  onOtpChange: (value: string[]) => void;
  onSubmit: (e: React.FormEvent) => void;
  onResend: () => void;
}

/** Format seconds as MM:SS — e.g. 28 → "00:28" */
function formatCountdown(seconds: number): string {
  const mm = String(Math.floor(seconds / 60)).padStart(2, "0");
  const ss = String(seconds % 60).padStart(2, "0");
  return `${mm}:${ss}`;
}

/** Mask phone: "9876543210" → "98765 43210" */
function formatPhone(phone: string): string {
  return phone.replace(/(\d{5})(\d{5})/, "$1 $2");
}

/**
 * Presentational step for OTP verification.
 * All state and handlers come from useOtpStep via LoginFlow.
 * Pixel-matched to Figma node 187-325.
 */
export default function OtpStep({
  phone,
  otp,
  countdown,
  isLoading,
  error,
  onOtpChange,
  onSubmit,
  onResend,
}: OtpStepProps) {
  const isComplete = otp.every((d) => /^\d$/.test(d));

  return (
    <form onSubmit={onSubmit} noValidate className="flex flex-col gap-6 w-full">
      <div className="flex flex-col gap-2">
        <h1 className="text-xl font-bold text-text-primary">
          Verify your number
        </h1>
        <p className="text-sm text-text-secondary">
          Enter the 6-digit code sent to {PHONE_PREFIX} {formatPhone(phone)}
        </p>
      </div>

      <div className="flex flex-col gap-4">
        <OtpInput value={otp} onChange={onOtpChange} />

        <p className="text-xs text-text-muted">
          {countdown > 0 ? (
            <>
              Resend OTP in{" "}
              <span className="text-primary-orange font-medium" aria-live="polite">
                {formatCountdown(countdown)}
              </span>
            </>
          ) : (
            <>
              Didn&apos;t receive?{" "}
              <button
                type="button"
                onClick={onResend}
                className="text-primary-orange font-semibold underline underline-offset-2 focus-visible:outline-none focus-visible: focus-visible:-primary-orange rounded"
              >
                Resend OTP
              </button>
            </>
          )}
        </p>
        
        {error && (
          <p role="alert" className="text-xs text-red-500 -mt-2">
            {error}
          </p>
        )}
      </div>

      <Button
        type="submit"
        variant="filled"
        size="lg"
        disabled={isLoading || !isComplete}
        className="w-full h-14 rounded-xl text-base font-semibold"
      >
        {isLoading ? "Verifying…" : "Verify & continue"}
      </Button>
    </form>
  );
}
