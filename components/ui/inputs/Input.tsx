import type { InputHTMLAttributes } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  className?: string;
}

/**
 * Generic controlled text input primitive.
 * Intentionally content-agnostic — no auth-specific logic or styling.
 * Compose this inside domain-specific input components (e.g. PhoneInput).
 */
export default function Input({ className = "", ...props }: InputProps) {
  return (
    <input
      className={`w-full bg-transparent outline-none text-text-primary placeholder:text-text-muted text-[14px] leading-[20px] font-normal ${className}`}
      {...props}
    />
  );
}
