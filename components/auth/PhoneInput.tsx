"use client";

import Input from "@/components/ui/inputs/Input";
import { PHONE_LENGTH, PHONE_PREFIX } from "@/lib/constants/auth";

interface PhoneInputProps {
  id?: string;
  value: string;
  onChange: (value: string) => void;
}

/**
 * Controlled phone-number input.
 * Renders the +91 prefix + 1px divider + digit-only text field.
 * Pixel-matched to Figma node 187:393:
 *   h=44px, px=14px, py=12px, gap=10px, border-radius=8px, border=#e5e0da
 *   Focus : border +  in #ff5400.
 */
export default function PhoneInput({ id = "phone", value, onChange }: PhoneInputProps) {
  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    // Strip non-digits, cap at PHONE_LENGTH
    const digits = e.target.value.replace(/\D/g, "").slice(0, PHONE_LENGTH);
    onChange(digits);
  }

  return (
    <div className="flex items-center h-14 border border-border-strong rounded-xl px-4 py-3 gap-3 bg-white focus-within:border-primary-orange focus-within: focus-within:-primary-orange transition-all w-full">
      {/* Country code prefix */}
      <span className="text-base font-normal text-text-primary shrink-0">
        {PHONE_PREFIX}
      </span>

      {/* 1px vertical divider */}
      <div className="w-px h-6 bg-border-strong shrink-0" aria-hidden="true" />

      <Input
        id={id}
        type="tel"
        inputMode="numeric"
        placeholder="98765 43210"
        maxLength={PHONE_LENGTH}
        value={value}
        onChange={handleChange}
        autoComplete="tel-national"
        aria-label="Phone number"
        className="text-base w-full"
      />
    </div>
  );
}
