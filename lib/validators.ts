import { OTP_LENGTH, PHONE_LENGTH } from "@/lib/constants/auth";
import { INDIAN_STATES, PINCODE_PATTERN } from "@/lib/constants/india";
import type { AddressFormData } from "@/types/checkout.types";

/**
 * Returns true if `phone` is exactly 10 digits (digits only, no spaces, hyphens, country code).
 * Pure function — no side effects.
 */
export function isValidPhone(phone: string): boolean {
  return /^\d{10}$/.test(phone.trim());
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

/**
 * Returns true if `name` contains only letters and spaces (no numbers, symbols, or special characters).
 * Does not impose any character length limit.
 */
export function isValidFullName(name: string): boolean {
  const trimmed = name.trim();
  if (!trimmed) return false;
  return /^[\p{L}\s]+$/u.test(trimmed) && /\p{L}/u.test(trimmed);
}

/**
 * Validates email address syntax.
 * Optional field: empty or whitespace-only values are treated as valid.
 * When provided, verifies standard format without spaces or consecutive dots.
 */
export function isValidEmail(email?: string | null): boolean {
  if (!email) return true;
  const trimmed = email.trim();
  if (!trimmed) return true;

  if (trimmed.includes("..") || /\s/.test(trimmed)) {
    return false;
  }

  return /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*\.[a-zA-Z]{2,}$/.test(
    trimmed
  );
}

/**
 * Returns true if `pincode` is exactly 6 digits.
 */
export function isValidPincode(pincode: string): boolean {
  return PINCODE_PATTERN.test(pincode.trim());
}

/**
 * Returns true if `state` matches one of the predefined states in `INDIAN_STATES`.
 */
export function isValidState(state: string): boolean {
  return (INDIAN_STATES as readonly string[]).includes(state.trim());
}

export type AddressFormErrors = Partial<Record<keyof AddressFormData, string>>;

/**
 * Centralized validator for AddressFormSheet.
 * Preserves existing empty-only behavior for Line 1 and City without adding new validation.
 */
export function validateAddressForm(form: AddressFormData): {
  isValid: boolean;
  errors: AddressFormErrors;
} {
  const errors: AddressFormErrors = {};

  // 1. Full Name: required, letters and spaces only, no numbers, no special characters
  const fullName = form.fullName?.trim() || "";
  if (!fullName) {
    errors.fullName = "Full Name is required";
  } else if (!isValidFullName(fullName)) {
    errors.fullName = "Enter a valid name";
  }

  // 2. Phone Number: required, exactly 10 digits
  const phone = form.phone?.trim() || "";
  if (!phone) {
    errors.phone = "Phone Number is required";
  } else if (!isValidPhone(phone)) {
    errors.phone = "Enter a valid 10-digit phone number";
  }

  // 3. Email: optional, must be valid email syntax if entered
  const email = form.email?.trim() || "";
  if (email && !isValidEmail(email)) {
    errors.email = "Enter a valid email address";
  }

  // 4. Pincode: required, exactly 6 digits
  const pincode = form.pincode ? form.pincode.trim() : "";
  if (!pincode) {
    errors.pincode = "Pincode is required";
  } else if (!isValidPincode(pincode)) {
    errors.pincode = "Enter a valid 6-digit pincode";
  }

  // 5. Line 1: preserve existing empty-only check
  if (!form.line1 || !form.line1.trim()) {
    errors.line1 = "House / Flat / Floor is required";
  }

  // 6. Line 2: optional, NO validation needed

  // 7. City: preserve existing empty-only check
  if (!form.city || !form.city.trim()) {
    errors.city = "City is required";
  }

  // 8. State: required and must belong to INDIAN_STATES
  const state = form.state?.trim() || "";
  if (!state) {
    errors.state = "State is required";
  } else if (!isValidState(state)) {
    errors.state = "Select a valid state";
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}
