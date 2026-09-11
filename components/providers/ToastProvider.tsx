"use client";

import { Toaster } from "sonner";
import { useEffect, useState } from "react";

/**
 * Global Toast Provider wrapping the Sonner Toaster component.
 * Configured with Gemostone UI branding requirements.
 */
export default function ToastProvider() {
  const [position, setPosition] = useState<"top-center" | "top-right">("top-center");

  useEffect(() => {
    const mediaQuery = window.matchMedia("(min-width: 768px)");
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setPosition(mediaQuery.matches ? "top-right" : "top-center");

    const handler = (e: MediaQueryListEvent) => {
      setPosition(e.matches ? "top-right" : "top-center");
    };

    mediaQuery.addEventListener("change", handler);
    return () => mediaQuery.removeEventListener("change", handler);
  }, []);

  return (
    <Toaster
      position={position}
      theme="light"
      richColors={false}
      closeButton={false}
      expand={true}
      visibleToasts={2}
      duration={2500}
      toastOptions={{
        className: "bg-white rounded-xl md:rounded-2xl border border-border-strong p-4 shadow-lg",
        classNames: {
          toast: "bg-white rounded-xl md:rounded-2xl border border-border-strong p-4 items-start gap-3 w-full shadow-lg",
          title: "text-[14px] font-semibold text-text-primary",
          description: "text-[13px] font-normal text-text-secondary mt-1",
          icon: "mt-0.5 text-primary-orange", // Use Gemostone orange for the icon
        },
      }}
    />
  );
}
