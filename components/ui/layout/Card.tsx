import type { HTMLAttributes, ReactNode } from "react";

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  className?: string;
}

/**
 * Generic white surface card with rounded corners and a .
 * Intentionally content-agnostic — describe it without saying "OTP" or "login".
 */
export default function Card({ children, className = "", ...props }: CardProps) {
  return (
    <div
      className={`bg-white rounded-[8px] overflow-clip ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}
