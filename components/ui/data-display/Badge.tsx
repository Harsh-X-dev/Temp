import type { ReactNode } from "react";

interface BadgeProps {
  children: ReactNode;
  className?: string;
}

export default function Badge({ children, className = "" }: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center rounded-[10px] bg-white px-2 py-1 text-xs leading-4 font-normal text-primary-orange whitespace-nowrap ${className}`}
    >
      {children}
    </span>
  );
}
