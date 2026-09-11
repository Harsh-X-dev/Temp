"use client";

import { useState, useRef, useEffect } from "react";

/* ─── Constants ───────────────────────────────────────────────────────────── */
export const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];
export const DAYS = Array.from({ length: 31 }, (_, i) => String(i + 1));
const _CY = new Date().getFullYear();
export const YEARS = Array.from({ length: 100 }, (_, i) => String(_CY - i));
const ITEM_H = 42; // px — height of each drum row

/** Single scrollable drum column */
function ScrollColumn({
  items,
  selectedIndex,
  onIndexChange,
}: {
  items: string[];
  selectedIndex: number;
  onIndexChange: (i: number) => void;
}) {
  const colRef = useRef<HTMLDivElement>(null);
  const debRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  // Snap to initial position on mount
  useEffect(() => {
    const timer = setTimeout(() => {
      if (colRef.current) {
        colRef.current.scrollTop = selectedIndex * ITEM_H;
      }
    }, 20);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleScroll = () => {
    if (debRef.current) clearTimeout(debRef.current);
    debRef.current = setTimeout(() => {
      if (!colRef.current) return;
      const raw = Math.round(colRef.current.scrollTop / ITEM_H);
      const clamped = Math.max(0, Math.min(raw, items.length - 1));
      colRef.current.scrollTo({ top: clamped * ITEM_H, behavior: "smooth" });
      onIndexChange(clamped);
    }, 60);
  };

  return (
    <div
      ref={colRef}
      onScroll={handleScroll}
      className="relative z-10 scrollbar-none"
      style={{
        height: ITEM_H * 5,
        overflowY: "scroll",
        scrollSnapType: "y mandatory",
        scrollbarWidth: "none",
        // @ts-ignore
        msOverflowStyle: "none",
      }}
    >
      {/* Top padding so first item can center */}
      <div style={{ height: ITEM_H * 2, flexShrink: 0 }} />
      {items.map((item, i) => {
        const dist = Math.abs(i - selectedIndex);
        let textClass = "text-[#d1d5db] font-normal text-[14px]";
        if (dist === 0) {
          textClass = "text-primary-orange font-bold text-[15px]";
        } else if (dist === 1) {
          textClass = "text-[#8e8e93] font-medium text-[14px]";
        }

        return (
          <div
            key={i}
            style={{ height: ITEM_H, scrollSnapAlign: "center" }}
            onClick={() => {
              colRef.current?.scrollTo({ top: i * ITEM_H, behavior: "smooth" });
              onIndexChange(i);
            }}
            className={`flex items-center justify-center cursor-pointer select-none transition-all duration-150 ${textClass}`}
          >
            {item}
          </div>
        );
      })}
      {/* Bottom padding */}
      <div style={{ height: ITEM_H * 2, flexShrink: 0 }} />
    </div>
  );
}

/** Custom iOS-style drum-roll date picker matching target design */
export default function DatePickerDropdown({
  value,
  onChange,
}: {
  value: string;
  onChange: (val: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  const parseValue = (val: string) => {
    if (val) {
      let d = 12, m = 10, y = 1998;
      if (/^\d{1,2}\/\d{1,2}\/\d{4}$/.test(val)) {
        const parts = val.split("/");
        d = parseInt(parts[0], 10);
        m = parseInt(parts[1], 10);
        y = parseInt(parts[2], 10);
      } else if (/^\d{4}-\d{2}-\d{2}$/.test(val)) {
        const parts = val.split("-");
        y = parseInt(parts[0], 10);
        m = parseInt(parts[1], 10);
        d = parseInt(parts[2], 10);
      }
      const dayIdx = Math.max(0, Math.min(30, d - 1));
      const monthIdx = Math.max(0, Math.min(11, m - 1));
      const yearIdx = YEARS.indexOf(String(y));
      return { dayIdx, monthIdx, yearIdx: yearIdx >= 0 ? yearIdx : 28 };
    }
    const defaultYearIdx = YEARS.indexOf("1998") >= 0 ? YEARS.indexOf("1998") : 28;
    return { dayIdx: 11, monthIdx: 9, yearIdx: defaultYearIdx }; // default 12 Oct 1998
  };

  const [sel, setSel] = useState(() => parseValue(value));

  const handleOpen = () => {
    setSel(parseValue(value));
    setOpen(true);
  };

  const handleDone = () => {
    const day = String(sel.dayIdx + 1).padStart(2, "0");
    const month = String(sel.monthIdx + 1).padStart(2, "0");
    const year = YEARS[sel.yearIdx];
    onChange(`${day}/${month}/${year}`);
    setOpen(false);
  };

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        panelRef.current &&
        !panelRef.current.contains(e.target as Node) &&
        triggerRef.current &&
        !triggerRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    }
    if (open) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [open]);

  // Format display value with spaces around slashes if present
  const displayVal = value
    ? value.includes("/")
      ? value.split("/").join(" / ")
      : value
    : "";

  return (
    <>
      <div className="flex flex-col gap-2 flex-1 min-w-0">
        <label htmlFor="dob" className="font-semibold text-[12px] text-text-secondary tracking-[0.5px] uppercase truncate">
          Date of Birth
        </label>

        {/* Trigger */}
        <button
          ref={triggerRef}
          type="button"
          id="dob"
          onClick={open ? () => setOpen(false) : handleOpen}
          className={`flex items-center px-3 md:px-4 h-[48px] w-full bg-white border rounded-[12px] drop-shadow-[0px_2px_4px_rgba(0,0,0,0.04)] transition-all text-left ${
            open
              ? "border-primary-orange ring-1 ring-primary-orange"
              : "border-border-strong"
          }`}
        >
          <span className={`flex-1 font-medium text-[13px] ${!displayVal ? "text-text-muted" : "text-text-primary"}`}>
            {displayVal || "DD / MM / YYYY"}
          </span>
          <svg
            className={`w-[18px] h-[18px] ml-2 shrink-0 transition-colors ${
              open ? "text-primary-orange" : "text-text-muted"
            }`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={1.5}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        </button>
      </div>

      {/* Full-width Picker panel spanning across the entire split row */}
      {open && (
        <div
          ref={panelRef}
          className="absolute top-full left-0 right-0 z-50 mt-2 w-full bg-white rounded-[16px] shadow-[0px_10px_30px_rgba(0,0,0,0.08)] border border-[#f0eee9] overflow-hidden animate-in fade-in slide-in-from-top-1 duration-150"
        >
          {/* Header */}
          <div className="flex items-center justify-center px-5 pt-3.5 pb-3 border-b border-[#f4f2ee]">
            <span className="text-[13px] font-semibold text-text-secondary text-center">
              Date of Birth
            </span>
          </div>

          {/* 3 Drum Columns */}
          <div className="relative flex px-3 py-1">
            {/* Day Column */}
            <div className="relative flex-[0.8] min-w-0">
              <div
                className="absolute inset-x-1.5 pointer-events-none rounded-[8px] bg-[#fff0ea]"
                style={{ top: ITEM_H * 2, height: ITEM_H }}
              />
              <ScrollColumn
                key="day-col"
                items={DAYS}
                selectedIndex={sel.dayIdx}
                onIndexChange={(i) => setSel((s) => ({ ...s, dayIdx: i }))}
              />
            </div>

            {/* Month Column */}
            <div className="relative flex-[1.4] min-w-0">
              <div
                className="absolute inset-x-1.5 pointer-events-none rounded-[8px] bg-[#fff0ea]"
                style={{ top: ITEM_H * 2, height: ITEM_H }}
              />
              <ScrollColumn
                key="month-col"
                items={MONTHS}
                selectedIndex={sel.monthIdx}
                onIndexChange={(i) => setSel((s) => ({ ...s, monthIdx: i }))}
              />
            </div>

            {/* Year Column */}
            <div className="relative flex-[1.0] min-w-0">
              <div
                className="absolute inset-x-1.5 pointer-events-none rounded-[8px] bg-[#fff0ea]"
                style={{ top: ITEM_H * 2, height: ITEM_H }}
              />
              <ScrollColumn
                key="year-col"
                items={YEARS}
                selectedIndex={sel.yearIdx}
                onIndexChange={(i) => setSel((s) => ({ ...s, yearIdx: i }))}
              />
            </div>
          </div>

          {/* Footer with orange pill Done button */}
          <div className="flex items-center justify-end px-5 py-3 border-t border-[#f4f2ee]">
            <button
              type="button"
              onClick={handleDone}
              className="px-7 py-2 bg-primary-orange hover:bg-primary-orange-hover text-white text-[14px] font-bold rounded-full shadow-[0px_4px_10px_rgba(234,88,12,0.25)] active:scale-95 transition-all cursor-pointer"
            >
              Done
            </button>
          </div>
        </div>
      )}
    </>
  );
}
