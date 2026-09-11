import type { ButtonHTMLAttributes, ReactNode } from "react";


type ButtonVariant = "primary" | "outline" | "ghost" | "text" | "filled";

type ButtonSize = "sm" | "md" | "lg";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: ButtonVariant;
  size?: ButtonSize;
}

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    "bg-white text-primary-orange hover:bg-surface-subtle focus-visible:ring-[var(--color-primary-orange)]",

  /** Orange background with white text — matches Figma auth CTAs (Send OTP, Verify & continue). */
  filled:
    "bg-primary-orange text-white hover:bg-primary-orange-hover active:scale-[0.98] focus-visible:ring-[var(--color-primary-orange)]",

  outline:
    "border border-primary-orange bg-white text-primary-orange hover:bg-surface-subtle focus-visible:ring-[var(--color-primary-orange)]",
  ghost:
    "bg-transparent text-text-secondary hover:text-text-primary focus-visible:ring-[var(--color-text-secondary)]",
  text: "bg-transparent text-primary-orange hover:opacity-80 focus-visible:ring-[var(--color-primary-orange)]",
};

const sizeClasses: Record<ButtonSize, string> = {
  sm: "px-3 py-1.5 text-xs leading-4 rounded-[14px]",
  md: "px-4 py-2 text-xs leading-4 rounded-[20px]",
  lg: "px-6 py-3 text-sm leading-5 rounded-[24px]",
};

export default function Button({
  children,
  variant = "primary",
  size = "md",
  className = "",
  type = "button",
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      className={`inline-flex cursor-pointer items-center justify-center font-normal transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
