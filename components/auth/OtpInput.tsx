"use client";

import { useRef, type ClipboardEvent, type KeyboardEvent } from "react";
import { OTP_LENGTH } from "@/lib/constants/auth";

interface OtpInputProps {
  value: string[];
  onChange: (value: string[]) => void;
}

/**
 * Controlled 6-box OTP input.
 * Each box: 48×52px, border-radius=8px.
 * Filled/focused box: border #ff5400 1px (primary-orange).
 * Empty box: border #e5e0da 1.5px (border-strong).
 * Features: auto-advance on digit, backspace-to-previous, full-paste support.
 * Pixel-matched to Figma node 187:376.
 */
export default function OtpInput({ value, onChange }: OtpInputProps) {
  const refs = useRef<(HTMLInputElement | null)[]>([]);

  function focusAt(index: number) {
    refs.current[index]?.focus();
  }

  function handleChange(index: number, raw: string) {
    const digit = raw.replace(/\D/g, "").slice(-1); // keep only last digit
    const next = [...value];
    next[index] = digit;
    onChange(next as string[]);

    if (digit && index < OTP_LENGTH - 1) {
      focusAt(index + 1);
    }
  }

  function handleKeyDown(index: number, e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Backspace") {
      if (value[index]) {
        // Clear current box first
        const next = [...value];
        next[index] = "";
        onChange(next);
      } else if (index > 0) {
        // Already empty — go back and clear previous
        const next = [...value];
        next[index - 1] = "";
        onChange(next);
        focusAt(index - 1);
      }
    } else if (e.key === "ArrowLeft" && index > 0) {
      focusAt(index - 1);
    } else if (e.key === "ArrowRight" && index < OTP_LENGTH - 1) {
      focusAt(index + 1);
    }
  }

  function handlePaste(e: ClipboardEvent<HTMLInputElement>) {
    e.preventDefault();
    const pasted = e.clipboardData
      .getData("text")
      .replace(/\D/g, "")
      .slice(0, OTP_LENGTH);

    if (!pasted) return;

    const next = Array.from({ length: OTP_LENGTH }, (_, i) => pasted[i] ?? "");
    onChange(next);

    // Focus the box after the last pasted digit
    const lastFilledIndex = Math.min(pasted.length, OTP_LENGTH - 1);
    focusAt(lastFilledIndex);
  }

  return (
    <div className="flex gap-1.5 xs:gap-2 sm:gap-2.5 items-center justify-between w-full" role="group" aria-label="One-time password">
      {Array.from({ length: OTP_LENGTH }).map((_, i) => {
        const isFilled = Boolean(value[i]);
        return (
          <input
            key={i}
            ref={(el) => { refs.current[i] = el; }}
            id={`otp-box-${i}`}
            type="text"
            inputMode="numeric"
            maxLength={1}
            size={1}
            value={value[i] ?? ""}
            onChange={(e) => handleChange(i, e.target.value)}
            onKeyDown={(e) => handleKeyDown(i, e)}
            onPaste={handlePaste}
            autoComplete={i === 0 ? "one-time-code" : "off"}
            aria-label={`OTP digit ${i + 1}`}
            className={[
              "min-w-0 flex-1 w-full max-w-[48px] h-12 sm:h-[52px] text-center text-[18px] leading-[24px] font-bold text-text-primary",
              "bg-white rounded-[8px] outline-none transition-colors p-0",
              "focus:border-primary-orange focus:border",
              isFilled
                ? "border border-primary-orange"
                : "border-[1.5px] border-border-strong",
            ].join(" ")}
          />
        );
      })}
    </div>
  );
}
