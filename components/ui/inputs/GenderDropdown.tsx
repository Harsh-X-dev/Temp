"use client";

import { useState, useRef, useEffect } from "react";

const GENDER_OPTIONS = ["Female", "Male", "Other", "Prefer not to say"] as const;

export default function GenderDropdown({
  value,
  onChange,
}: {
  value: string;
  onChange: (val: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="flex flex-col gap-2 flex-1 min-w-0 relative" ref={ref}>
      <label className="font-semibold text-[12px] text-text-secondary tracking-[0.5px] uppercase truncate">
        Gender
      </label>
      {/* Trigger */}
      <button
        type="button"
        id="gender"
        onClick={() => setOpen((o) => !o)}
        className={`flex items-center px-3 md:px-4 h-[48px] w-full bg-white border rounded-[12px] drop-shadow-[0px_2px_4px_rgba(0,0,0,0.04)] transition-all text-left ${
          open
            ? "border-primary-orange ring-1 ring-primary-orange"
            : "border-border-strong"
        }`}
      >
        <span className={`flex-1 font-medium text-[13px] ${!value ? "text-text-muted" : "text-text-primary"}`}>
          {value || "Select Gender"}
        </span>
        {/* Chevron — rotates when open */}
        <svg
          className={`w-[18px] h-[18px] text-text-muted ml-2 shrink-0 transition-transform duration-200 ${open ? "rotate-180 text-primary-orange" : ""}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Dropdown panel */}
      {open && (
        <div
          className="absolute top-full left-0 z-50 mt-1 min-w-[160px] bg-white rounded-[14px] shadow-[0px_8px_24px_rgba(0,0,0,0.12)] border border-border-light overflow-hidden animate-in fade-in slide-in-from-top-1 duration-150"
          style={{ width: ref.current?.offsetWidth }}
        >
          {GENDER_OPTIONS.map((option) => {
            const selected = value === option;
            return (
              <button
                key={option}
                type="button"
                onClick={() => {
                  onChange(option);
                  setOpen(false);
                }}
                className={`w-full flex items-center justify-between px-4 py-3 text-[14px] font-medium transition-colors cursor-pointer ${
                  selected
                    ? "bg-primary-orange text-white"
                    : "text-text-primary hover:bg-gray-50"
                }`}
              >
                {option}
                {selected && (
                  <svg className="w-[16px] h-[16px] shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
