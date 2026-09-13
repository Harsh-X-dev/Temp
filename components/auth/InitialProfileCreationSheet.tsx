"use client";

import { useEffect, useId, useRef, useState } from "react";
import Sheet from "@/components/ui/overlays/Sheet";
// import BackButton from "@/components/ui/buttons/BackButton";
import Button from "@/components/ui/buttons/Button";
import FormField, { fieldInputClasses } from "@/components/ui/inputs/FormField";
import DatePickerDropdown from "@/components/ui/inputs/DatePickerDropdown";
import Select from "@/components/ui/inputs/Select";
import GenderDropdown from "@/components/ui/inputs/GenderDropdown";
import { INDIAN_STATES } from "@/lib/constants/india";
import {
  isValidFullName,
  isValidPhone,
  isValidEmail,
  isValidPincode,
  isValidState,
} from "@/lib/validators";
import { useKeyboardOffset } from "@/hooks/useKeyboardOffset";
import type { AddressType } from "@/components/account/types";
import type { CreateProfileInput } from "@/types/checkout.types";

interface InitialProfileCreationSheetProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
  phone: string;
  initialFullName?: string;
  onSubmit: (input: CreateProfileInput) => Promise<void>;
  isSubmitting: boolean;
}


const ADDRESS_TYPES = ["home", "work", "other"] as const;

type Errors = Partial<Record<"fullName" | "phone" | "email" | "pincode" | "line1" | "city" | "state", string>>;

export default function InitialProfileCreationSheet({
  isOpen,
  onClose,
  userId,
  phone,
  initialFullName = "",
  onSubmit,
  isSubmitting,
}: InitialProfileCreationSheetProps) {
  const [fullName, setFullName] = useState(initialFullName);
  // Email is never auto-filled; user must explicitly enter their real email
  const [email, setEmail] = useState("");
  const [gender, setGender] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [pincode, setPincode] = useState("");
  const [line1, setLine1] = useState("");
  const [line2, setLine2] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [addressType, setAddressType] = useState<AddressType>("home");

  useEffect(() => {
    if (initialFullName && !fullName) setFullName(initialFullName);
  }, [initialFullName]);

  const [errors, setErrors] = useState<Errors>({});
  const firstInputRef = useRef<HTMLInputElement>(null);
  const { isKeyboardOpen } = useKeyboardOffset(isOpen);

  const uid = useId();
  const fieldId = (field: string) => `${uid}-${field}`;
  const errorId = (field: string) => `${uid}-${field}-error`;

  useEffect(() => {
    if (!isOpen) return;
    const timer = window.setTimeout(() => firstInputRef.current?.focus(), 350);
    return () => window.clearTimeout(timer);
  }, [isOpen]);

  function clearError(field: keyof Errors) {
    setErrors((prev) => (prev[field] ? { ...prev, [field]: undefined } : prev));
  }

  const validate = (): boolean => {
    const errs: Errors = {};
    const trimmedName = fullName.trim();
    if (!trimmedName) {
      errs.fullName = "Full name is required";
    } else if (!isValidFullName(trimmedName)) {
      errs.fullName = "Enter a valid name";
    }

    if (phone && !isValidPhone(phone)) {
      errs.phone = "Enter a valid 10-digit phone number";
    }

    // Email is strictly mandatory and validated before submission
    const trimmedEmail = email.trim();
    if (!trimmedEmail) {
      errs.email = "Email is required";
    } else if (!trimmedEmail.includes("@") || !isValidEmail(trimmedEmail)) {
      errs.email = "Enter a valid email address";
    }

    const trimmedPincode = pincode.trim();
    if (!trimmedPincode) {
      errs.pincode = "Pincode is required";
    } else if (!isValidPincode(trimmedPincode)) {
      errs.pincode = "Enter a valid 6-digit pincode";
    }

    if (!line1.trim()) errs.line1 = "House / Flat / Floor is required";
    if (!city.trim()) errs.city = "City is required";

    const trimmedState = state.trim();
    if (!trimmedState) {
      errs.state = "State is required";
    } else if (!isValidState(trimmedState)) {
      errs.state = "Select a valid state";
    }

    setErrors(errs);

    const hasErrors = Object.keys(errs).length > 0;
    if (hasErrors) {
      const firstInvalidField = Object.keys(errs)[0];
      if (firstInvalidField) {
        setTimeout(() => {
          const el = document.getElementById(fieldId(firstInvalidField));
          el?.focus();
          el?.scrollIntoView({ behavior: "smooth", block: "center" });
        }, 50);
      }
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;
    if (!validate()) return;

    await onSubmit({
      userId,
      fullName: fullName.trim(),
      phone: phone.trim(),
      emailId: email.trim(),
      gender: gender || undefined,
      birthDate: birthDate || undefined,
      line1: line1.trim(),
      line2: line2.trim() || undefined,
      city: city.trim(),
      state: state.trim(),
      pincode: pincode.trim(),
      country: "India",
      addressType,
      isDefault: true,
    });
  };

  return (
    <Sheet
      isOpen={isOpen}
      onClose={onClose}
      aria-label="Create account and add address"
      className="bg-surface-subtle"
    >
      {/* Header */}
      <div className="sticky top-0 z-10 flex shrink-0 items-center border-b border-[#f0ebe4] bg-white px-4 sm:px-[24px] py-[16px]">
        <div className="mx-auto flex w-full max-w-xl items-center justify-center">
          <h2 className="font-['Montserrat'] text-[18px] font-semibold text-text-primary text-center">
            Create Profile
          </h2>
        </div>
      </div>

      {/* Form Content */}
      <form onSubmit={handleSubmit} className="flex min-h-0 flex-1 flex-col bg-surface-subtle w-full max-w-full" noValidate>
        <div className="flex-1 overflow-y-auto overflow-x-hidden px-4 sm:px-[24px] py-[16px] pb-[60px] scroll-pb-[80px] w-full max-w-full no-scrollbar">
          <div className="mx-auto flex max-w-xl flex-col gap-[16px]">
            <FormField
              label="Full Name"
              htmlFor={fieldId("fullName")}
              error={errors.fullName}
              errorId={errorId("fullName")}
            >
              <input
                ref={firstInputRef}
                id={fieldId("fullName")}
                name="fullName"
                type="text"
                autoComplete="name"
                placeholder="Enter full name"
                value={fullName}
                onChange={(e) => {
                  setFullName(e.target.value);
                  clearError("fullName");
                }}
                aria-invalid={errors.fullName ? true : undefined}
                aria-describedby={errors.fullName ? errorId("fullName") : undefined}
                className={fieldInputClasses(Boolean(errors.fullName))}
              />
            </FormField>

            {/* Phone Number — prefilled from OTP verification, not editable here */}
            <div className="flex flex-col gap-[8px]">
              <span className="font-['Montserrat'] text-[13px] font-medium text-text-secondary">
                Phone Number
              </span>
              <div className="flex items-center rounded-[12px] border border-border-strong bg-surface-neutral px-[16px] py-[12px]">
                <span className="font-['Montserrat'] text-[13px] font-normal text-text-primary">
                  +91 {phone.replace(/^(\d{5})(\d{5})$/, "$1 $2") || phone}
                </span>
              </div>
            </div>

            <FormField
              label="Email"
              htmlFor={fieldId("email")}
              error={errors.email}
              errorId={errorId("email")}
            >
              <input
                id={fieldId("email")}
                name="email"
                type="email"
                required
                autoComplete="email"
                placeholder="Enter email address"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  clearError("email");
                }}
                onBlur={() => {
                  const trimmed = email.trim();
                  if (!trimmed) {
                    setErrors((prev) => ({ ...prev, email: "Email is required" }));
                  } else if (!trimmed.includes("@") || !isValidEmail(trimmed)) {
                    setErrors((prev) => ({ ...prev, email: "Enter a valid email address" }));
                  }
                }}
                aria-invalid={errors.email ? true : undefined}
                aria-describedby={errors.email ? errorId("email") : undefined}
                className={fieldInputClasses(Boolean(errors.email))}
              />
            </FormField>

            <div className="flex gap-[12px] w-full items-start relative">
              <GenderDropdown
                value={gender}
                onChange={setGender}
              />

              <DatePickerDropdown
                value={birthDate}
                onChange={setBirthDate}
              />
            </div>

            <FormField
              label="Pincode"
              htmlFor={fieldId("pincode")}
              error={errors.pincode}
              errorId={errorId("pincode")}
            >
              <input
                id={fieldId("pincode")}
                name="pincode"
                type="text"
                inputMode="numeric"
                autoComplete="postal-code"
                placeholder="Enter 6-digit pincode"
                value={pincode}
                maxLength={6}
                pattern="[0-9]{6}"
                onChange={(e) => {
                  const cleaned = e.target.value.replace(/\D/g, "").slice(0, 6);
                  setPincode(cleaned);
                  clearError("pincode");
                }}
                aria-invalid={errors.pincode ? true : undefined}
                aria-describedby={errors.pincode ? errorId("pincode") : undefined}
                className={fieldInputClasses(Boolean(errors.pincode))}
              />
            </FormField>

            <FormField
              label="House / Flat / Floor"
              htmlFor={fieldId("line1")}
              error={errors.line1}
              errorId={errorId("line1")}
            >
              <input
                id={fieldId("line1")}
                name="line1"
                type="text"
                autoComplete="address-line1"
                placeholder="House no., building, floor"
                value={line1}
                onChange={(e) => {
                  setLine1(e.target.value);
                  clearError("line1");
                }}
                aria-invalid={errors.line1 ? true : undefined}
                aria-describedby={errors.line1 ? errorId("line1") : undefined}
                className={fieldInputClasses(Boolean(errors.line1))}
              />
            </FormField>

            <FormField label="Street / Area / Locality" htmlFor={fieldId("line2")}>
              <input
                id={fieldId("line2")}
                name="line2"
                type="text"
                autoComplete="address-line2"
                placeholder="Street, area, landmark"
                value={line2}
                onChange={(e) => setLine2(e.target.value)}
                className={fieldInputClasses(false)}
              />
            </FormField>

            <FormField
              label="City"
              htmlFor={fieldId("city")}
              error={errors.city}
              errorId={errorId("city")}
            >
              <input
                id={fieldId("city")}
                name="city"
                type="text"
                autoComplete="address-level2"
                placeholder="City"
                value={city}
                onChange={(e) => {
                  setCity(e.target.value);
                  clearError("city");
                }}
                aria-invalid={errors.city ? true : undefined}
                aria-describedby={errors.city ? errorId("city") : undefined}
                className={fieldInputClasses(Boolean(errors.city))}
              />
            </FormField>

            <FormField
              label="State"
              htmlFor={fieldId("state")}
              error={errors.state}
              errorId={errorId("state")}
            >
              <Select
                key={isOpen ? "open" : "closed"}
                id={fieldId("state")}
                name="state"
                options={INDIAN_STATES}
                value={state}
                onChange={(next) => {
                  setState(next);
                  clearError("state");
                }}
                placeholder="Select state"
                searchable
                searchPlaceholder="Search state..."
                emptyMessage="No state found"
                invalid={Boolean(errors.state)}
                aria-label="State"
                aria-describedby={errors.state ? errorId("state") : undefined}
              />
            </FormField>

            <div className="flex flex-col gap-[8px]">
              <span
                id={fieldId("addressType-label")}
                className="font-['Montserrat'] text-[13px] font-medium text-text-secondary"
              >
                Address Type
              </span>
              <div
                role="group"
                aria-labelledby={fieldId("addressType-label")}
                className="flex flex-wrap items-start gap-[8px]"
              >
                {ADDRESS_TYPES.map((type) => {
                  const isSelected = addressType === type;
                  return (
                    <button
                      key={type}
                      type="button"
                      onClick={() => setAddressType(type)}
                      aria-pressed={isSelected}
                      className={`flex h-[36px] min-w-[76px] px-3.5 cursor-pointer items-center justify-center rounded-[18px] font-['Montserrat'] text-[13px] transition-colors outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[var(--color-primary-orange)] ${
                        isSelected
                          ? "bg-primary-orange font-medium text-white shadow-xs"
                          : "border border-border-strong bg-white font-medium text-text-primary hover:border-primary-orange/40"
                      }`}
                    >
                      {type.charAt(0).toUpperCase() + type.slice(1)}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Sticky Bottom Bar */}
        <div className={`z-20 shrink-0 border-t border-[#f0ebe4] bg-white px-4 sm:px-[24px] shadow-[0_-4px_16px_rgba(0,0,0,0.06)] ${
          isKeyboardOpen
            ? "py-[12px] pb-[12px]"
            : "p-[16px] pb-[calc(20px+env(safe-area-inset-bottom,0px))]"
        }`}>
          <div className="mx-auto w-full max-w-xl">
            <Button
              type="submit"
              variant="filled"
              size="lg"
              disabled={isSubmitting}
              aria-busy={isSubmitting}
              className="h-[50px] w-full rounded-[24px] font-['Montserrat'] text-[14px] font-semibold"
            >
              {isSubmitting ? "Creating Account..." : "Create Account"}
            </Button>
          </div>
        </div>
      </form>
    </Sheet>
  );
}
