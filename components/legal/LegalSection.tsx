import { ReactNode } from "react";

interface LegalSectionProps {
  title: string;
  children: ReactNode;
  className?: string;
}

export default function LegalSection({
  title,
  children,
  className = "",
}: LegalSectionProps) {
  return (
    <div className={`flex flex-col gap-[6px] items-start w-full ${className}`}>
      <h2 className="font-sans font-bold leading-[1.4] text-text-primary text-[14px] w-full">
        {title}
      </h2>
      <div className="font-sans font-normal leading-[1.6] text-text-secondary text-[13px] w-full">
        {children}
      </div>
    </div>
  );
}
