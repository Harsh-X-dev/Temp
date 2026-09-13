import type { ReactNode } from "react";

interface FormFieldProps {
  label: string;
  /** Id of the control this label points at. Required for click-to-focus. */
  htmlFor: string;
  error?: string;
  /** Id given to the error text so the control can aria-describedby it. */
  errorId?: string;
  className?: string;
  children: ReactNode;
}

/**
 * Label + control + error message, wired together for accessibility.
 *
 * Every field in a form shares this shell, so label typography, spacing and
 * error styling are defined once instead of being retyped per input.
 */
export default function FormField({
  label,
  htmlFor,
  error,
  errorId,
  className = "",
  children,
}: FormFieldProps) {
  return (
    <div className={`flex flex-col gap-[8px] ${className}`}>
      <label
        htmlFor={htmlFor}
        className="font-['Montserrat'] text-[13px] font-medium text-text-secondary"
      >
        {label}
      </label>
      {children}
      {error && (
        <p
          id={errorId}
          role="alert"
          className="ml-[4px] mt-[4px] text-[11px] text-red-500"
        >
          {error}
        </p>
      )}
    </div>
  );
}

/**
 * Shared text-input styling. Kept next to FormField so inputs and the Select
 * trigger stay pixel-identical — they previously drifted because each form
 * re-declared its own `inputClass` helper.
 */
export function fieldInputClasses(invalid = false): string {
  return [
    "w-full rounded-[12px] border bg-white px-[16px] py-[14px]",
    "font-['Montserrat'] text-[16px] md:text-[14px] text-text-primary placeholder:text-text-muted",
    "outline-none transition-colors",
    "focus:border-primary-orange focus:ring-1 focus:ring-[var(--color-primary-orange)]/20",
    "focus-visible:ring-2 focus-visible:ring-[var(--color-primary-orange)]/25",
    invalid ? "border-red-400" : "border-border-strong",
  ].join(" ");
}
