"use client";

import Link from "next/link";
import Button from "@/components/ui/buttons/Button";
import PhoneInput from "@/components/auth/PhoneInput";

interface PhoneStepProps {
  phone: string;
  isLoading: boolean;
  error: string | null;
  onPhoneChange: (value: string) => void;
  onSubmit: (e: React.FormEvent) => void;
}

/**
 * Presentational step for phone number entry.
 * All state and handlers come from usePhoneStep via LoginFlow.
 * Pixel-matched to Figma node 72-51.
 */
export default function PhoneStep({
  phone,
  isLoading,
  error,
  onPhoneChange,
  onSubmit,
}: PhoneStepProps) {
  return (
    <form onSubmit={onSubmit} noValidate className="flex flex-col gap-6 w-full">
      <div className="flex flex-col gap-2">
        <h1 className="text-xl font-bold text-text-primary">
          Welcome back
        </h1>
        <p className="text-sm text-text-secondary">
          Enter your phone number to continue
        </p>
      </div>

      <div className="flex flex-col gap-2">
        <label
          htmlFor="phone"
          className="text-xs font-medium text-text-secondary uppercase tracking-wide"
        >
          Phone Number
        </label>
        <PhoneInput id="phone" value={phone} onChange={onPhoneChange} />
        {error && (
          <p role="alert" className="text-xs text-red-500">
            {error}
          </p>
        )}
      </div>

      <div className="flex flex-col gap-4">
        <Button
          type="submit"
          variant="filled"
          size="lg"
          disabled={isLoading || phone.length < 10}
          className="w-full h-14 rounded-xl text-base font-semibold"
        >
          {isLoading ? "Sending…" : "Send OTP"}
        </Button>

        <p className="text-xs text-text-muted text-center">
          By continuing you agree to our{" "}
          <Link
            href="/terms-and-conditions"
            className="text-text-primary underline underline-offset-2 hover:text-primary-orange transition-colors font-medium"
          >
            Terms &amp; Conditions
          </Link>{" "}
          and{" "}
          <Link
            href="/privacy-policy"
            className="text-text-primary underline underline-offset-2 hover:text-primary-orange transition-colors font-medium"
          >
            Privacy Policy
          </Link>
        </p>
      </div>
    </form>
  );
}
