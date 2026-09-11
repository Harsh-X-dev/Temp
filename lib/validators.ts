import { OTP_LENGTH, PHONE_LENGTH } from "@/lib/constants/auth";

/**
 * Returns true if `phone` is exactly PHONE_LENGTH digits (no spaces, dashes, or country code).
 * Pure function — no side effects.
 */
export function isValidPhone(phone: string): boolean {
  return /^\d+$/.test(phone) && phone.length === PHONE_LENGTH;
}

/**
 * Returns true if every slot in the OTP array contains exactly one digit.
 * Pure function — no side effects.
 */
export function isValidOtp(otp: string[]): boolean {
  return (
    otp.length === OTP_LENGTH &&
    otp.every((digit) => /^\d$/.test(digit))
  );
}
