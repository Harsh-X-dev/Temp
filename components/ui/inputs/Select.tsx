"use client";

import {
  useCallback,
  useEffect,
  useId,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { createPortal } from "react-dom";

export type SelectOption = { value: string; label: string };

interface SelectProps {
  /** Accepts plain strings or `{ value, label }` objects. */
  options: readonly (string | SelectOption)[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  /** Id applied to the trigger so a <label htmlFor> points at it. */
  id?: string;
  /** When set, a hidden input mirrors the value for native FormData reads. */
  name?: string;
  disabled?: boolean;
  invalid?: boolean;
  /** Shows a filter box inside the menu. Recommended for long lists. */
  searchable?: boolean;
  searchPlaceholder?: string;
  emptyMessage?: string;
  className?: string;
  "aria-label"?: string;
  "aria-describedby"?: string;
}

const GAP = 6;
const MAX_MENU_HEIGHT = 220;
const MIN_MENU_HEIGHT = 100;
/** Narrow triggers (a half-width field) would otherwise truncate long labels. */
const MIN_MENU_WIDTH = 240;
/** Keeps the menu clear of the viewport edges. */
const VIEWPORT_MARGIN = 8;
const VIEWPORT_MARGIN_BOTTOM = 24;

type Position = {
  left: number;
  width: number;
  maxHeight: number;
  top: number;
};

/**
 * Accessible listbox that replaces the native <select>.
 *
 * A native <select> renders its popup through the operating system, so it
 * ignores every app style and paints an opaque grey sheet over the form. This
 * renders the menu itself — into a portal, so it is never clipped by a parent
 * `overflow-y-auto` or `transform` (both of which our bottom sheets use).
 *
 * When `searchable` is true the trigger itself becomes a combobox input —
 * typing filters the list in-place without a separate search box inside the
 * dropdown.
 *
 * Keyboard: Enter/Space/Arrows open, Arrows move, Enter selects, Escape closes,
 * Home/End jump, Tab closes. Escape is captured at the document so it closes
 * this menu without also closing the sheet behind it.
 */
export default function Select({
  options,
  value,
  onChange,
  placeholder = "Select",
  id,
  name,
  disabled = false,
  invalid = false,
  searchable = false,
  searchPlaceholder = "Search...",
  emptyMessage = "No matches found",
  className = "",
  "aria-label": ariaLabel,
  "aria-describedby": ariaDescribedBy,
}: SelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const [query, setQuery] = useState("");
  const [position, setPosition] = useState<Position | null>(null);

  const triggerRef = useRef<HTMLButtonElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  // Ref for the combobox input (used when searchable=true)
  const comboRef = useRef<HTMLInputElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLUListElement>(null);

  const reactId = useId();
  const listboxId = `${reactId}-listbox`;
  const optionId = (index: number) => `${reactId}-option-${index}`;

  const normalized = useMemo<SelectOption[]>(
    () =>
      options.map((option) =>
        typeof option === "string" ? { value: option, label: option } : option,
      ),
    [options],
  );

  const selected = useMemo(
    () => normalized.find((option) => option.value === value) ?? null,
    [normalized, value],
  );

  const filtered = useMemo(() => {
    if (!searchable) return normalized;
    const needle = query.trim().toLowerCase();
    if (!needle) return normalized;
    return normalized.filter((option) =>
      option.label.toLowerCase().includes(needle),
    );
  }, [normalized, query, searchable]);

  // --- positioning ---------------------------------------------------------

  const updatePosition = useCallback(() => {
    const trigger = searchable ? containerRef.current || comboRef.current : triggerRef.current;
    if (!trigger) return;

    const rect = trigger.getBoundingClientRect();
    const vv = typeof window !== "undefined" ? window.visualViewport : null;
    const viewportHeight = vv ? vv.height : window.innerHeight;
    const viewportWidth = vv ? vv.width : document.documentElement.clientWidth;
    const viewportTop = vv ? vv.offsetTop : 0;
    const viewportLeft = vv ? vv.offsetLeft : 0;

    // Trigger coordinates relative to visible viewport
    const triggerTop = rect.top - viewportTop;
    const triggerBottom = rect.bottom - viewportTop;
    const triggerLeft = rect.left - viewportLeft;

    // Available space above and below the trigger
    const spaceBelow = viewportHeight - triggerBottom - GAP - VIEWPORT_MARGIN_BOTTOM;
    const spaceAbove = triggerTop - GAP - VIEWPORT_MARGIN;

    // Drop up if space below cannot fit full menu and there is more space above,
    // or if space below is smaller than MIN_MENU_HEIGHT
    const dropUp = (spaceBelow < MAX_MENU_HEIGHT && spaceAbove > spaceBelow) || spaceBelow < MIN_MENU_HEIGHT;
    const available = Math.max(dropUp ? spaceAbove : spaceBelow, MIN_MENU_HEIGHT);
    const maxHeight = Math.min(MAX_MENU_HEIGHT, Math.max(MIN_MENU_HEIGHT, available));

    // Constrain width so it never spills past viewport margins
    const targetWidth = Math.max(rect.width, Math.min(MIN_MENU_WIDTH, viewportWidth - VIEWPORT_MARGIN * 2));
    const width = Math.min(targetWidth, viewportWidth - VIEWPORT_MARGIN * 2);

    // Constrain horizontal position within viewport
    const left = Math.max(
      VIEWPORT_MARGIN + viewportLeft,
      Math.min(triggerLeft + viewportLeft, viewportWidth + viewportLeft - width - VIEWPORT_MARGIN),
    );

    // Calculate vertical top position ensuring it stays fully within the visible screen
    let top: number;
    if (dropUp) {
      top = Math.max(VIEWPORT_MARGIN + viewportTop, triggerTop + viewportTop - maxHeight - GAP);
    } else {
      top = triggerBottom + viewportTop + GAP;
    }

    setPosition({
      left,
      width,
      top,
      maxHeight,
    });
  }, [searchable]);

  useLayoutEffect(() => {
    if (isOpen) {
      updatePosition();
      const trigger = searchable ? containerRef.current || comboRef.current : triggerRef.current;
      trigger?.scrollIntoView({ block: "nearest", behavior: "smooth" });
    }
  }, [isOpen, updatePosition, searchable]);

  // Follow the trigger while any ancestor scrolls or the viewport resizes.
  useEffect(() => {
    if (!isOpen) return;
    const handle = () => updatePosition();
    window.addEventListener("scroll", handle, true);
    window.addEventListener("resize", handle);
    const vv = window.visualViewport;
    if (vv) {
      vv.addEventListener("resize", handle);
      vv.addEventListener("scroll", handle);
    }
    return () => {
      window.removeEventListener("scroll", handle, true);
      window.removeEventListener("resize", handle);
      if (vv) {
        vv.removeEventListener("resize", handle);
        vv.removeEventListener("scroll", handle);
      }
    };
  }, [isOpen, updatePosition]);

  // --- open / close --------------------------------------------------------

  const openMenu = useCallback(() => {
    if (disabled) return;
    const index = normalized.findIndex((option) => option.value === value);
    setQuery("");
    setActiveIndex(index >= 0 ? index : 0);
    setIsOpen(true);
  }, [disabled, normalized, value]);

  const closeMenu = useCallback((refocus = true) => {
    setIsOpen(false);
    setQuery("");
    if (refocus) {
      if (searchable) comboRef.current?.blur();
      else triggerRef.current?.focus();
    }
  }, [searchable]);

  const commit = useCallback(
    (next: string) => {
      onChange(next);
      closeMenu();
    },
    [onChange, closeMenu],
  );

  // Close when a pointer lands outside both the trigger and the menu.
  useEffect(() => {
    if (!isOpen) return;
    const handle = (event: PointerEvent) => {
      const target = event.target as Node | null;
      if (!target) return;
      if (triggerRef.current?.contains(target)) return;
      if (comboRef.current?.contains(target)) return;
      if (menuRef.current?.contains(target)) return;
      closeMenu(false);
    };
    document.addEventListener("pointerdown", handle, true);
    return () => document.removeEventListener("pointerdown", handle, true);
  }, [isOpen, closeMenu]);

  // Capture Escape at the document so the surrounding sheet/modal does not also
  // close. Capture runs before any window-level bubble listener.
  useEffect(() => {
    if (!isOpen) return;
    const handle = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      event.preventDefault();
      event.stopPropagation();
      closeMenu();
    };
    document.addEventListener("keydown", handle, true);
    return () => document.removeEventListener("keydown", handle, true);
  }, [isOpen, closeMenu]);

  // For non-searchable: move focus into the list when it opens.
  useEffect(() => {
    if (!isOpen || searchable) return;
    listRef.current?.focus();
  }, [isOpen, searchable]);

  // Keep the highlighted row visible.
  useEffect(() => {
    if (!isOpen) return;
    menuRef.current
      ?.querySelector<HTMLElement>('[data-active="true"]')
      ?.scrollIntoView({ block: "nearest" });
  }, [isOpen, activeIndex, query]);

  // --- keyboard ------------------------------------------------------------

  const moveActive = useCallback(
    (delta: number) => {
      setActiveIndex((prev) => {
        if (filtered.length === 0) return 0;
        const next = prev + delta;
        if (next < 0) return filtered.length - 1;
        if (next >= filtered.length) return 0;
        return next;
      });
    },
    [filtered.length],
  );

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (disabled) return;

    if (!isOpen) {
      if (
        event.key === "ArrowDown" ||
        event.key === "ArrowUp" ||
        event.key === "Enter" ||
        event.key === " "
      ) {
        event.preventDefault();
        openMenu();
      }
      return;
    }

    switch (event.key) {
      case "ArrowDown":
        event.preventDefault();
        moveActive(1);
        break;
      case "ArrowUp":
        event.preventDefault();
        moveActive(-1);
        break;
      case "Home":
        event.preventDefault();
        setActiveIndex(0);
        break;
      case "End":
        event.preventDefault();
        setActiveIndex(Math.max(filtered.length - 1, 0));
        break;
      case "Enter": {
        event.preventDefault();
        const option = filtered[activeIndex];
        if (option) commit(option.value);
        break;
      }
      case " ": {
        // While searching, Space must type a space instead of selecting.
        if (searchable) break;
        event.preventDefault();
        const option = filtered[activeIndex];
        if (option) commit(option.value);
        break;
      }
      case "Tab":
        closeMenu(false);
        break;
    }
  };

  // --- shared classes ------------------------------------------------------

  const sharedTriggerClasses = [
    "flex w-full items-center justify-between gap-[8px] rounded-[12px] border bg-white",
    "px-[16px] py-[14px] text-left text-[16px] md:text-[14px] font-['Montserrat'] transition-colors",
    "outline-none cursor-pointer",
    "focus-visible:border-primary-orange focus-visible:ring-2 focus-visible:ring-[var(--color-primary-orange)]/25",
    invalid ? "border-red-400" : "border-border-strong",
    isOpen && !invalid ? "border-primary-orange ring-1 ring-[var(--color-primary-orange)]/20" : "",
    disabled ? "cursor-not-allowed opacity-60" : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  // --- render --------------------------------------------------------------

  const menu =
    isOpen && position ? (
      <div
        ref={menuRef}
        style={{
          position: "fixed",
          left: position.left,
          width: position.width,
          top: position.top,
          maxHeight: position.maxHeight,
        }}
        className="z-[99999] flex flex-col overflow-hidden rounded-[12px] border border-border-strong bg-white shadow-[0_12px_32px_rgba(33,30,26,0.16)] font-['Montserrat']"
      >
        <ul
          ref={listRef}
          id={listboxId}
          role="listbox"
          aria-label={ariaLabel ?? placeholder}
          aria-activedescendant={
            filtered[activeIndex] ? optionId(activeIndex) : undefined
          }
          tabIndex={searchable ? -1 : 0}
          onKeyDown={searchable ? undefined : handleKeyDown}
          className="flex-1 overflow-y-auto overscroll-contain py-[4px] outline-none"
          style={{ WebkitOverflowScrolling: "touch" }}
        >
          {filtered.length === 0 ? (
            <li className="px-[16px] py-[12px] text-[13px] text-text-muted">
              {emptyMessage}
            </li>
          ) : (
            filtered.map((option, index) => {
              const isSelected = option.value === value;
              const isActive = index === activeIndex;
              return (
                <li
                  key={option.value}
                  id={optionId(index)}
                  role="option"
                  aria-selected={isSelected}
                  data-active={isActive}
                  onMouseEnter={() => setActiveIndex(index)}
                  onClick={() => commit(option.value)}
                  className={`flex cursor-pointer items-center justify-between gap-[8px] px-[16px] py-[11px] text-[14px] transition-colors ${
                    isActive ? "bg-[#fff1e9]" : "bg-transparent"
                  } ${
                    isSelected
                      ? "font-semibold text-primary-orange"
                      : "font-normal text-text-primary"
                  }`}
                >
                  <span className="truncate">{option.label}</span>
                  {isSelected && (
                    <svg
                      className="size-[16px] shrink-0"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth={2.5}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      aria-hidden="true"
                    >
                      <path d="M20 6L9 17l-5-5" />
                    </svg>
                  )}
                </li>
              );
            })
          )}
        </ul>
      </div>
    ) : null;

  // Combobox-style trigger: the input field itself is the search box.
  if (searchable) {
    return (
      <>
        <div
          ref={containerRef}
          className={`relative ${sharedTriggerClasses} cursor-text`}
          onClick={() => { if (!isOpen) openMenu(); comboRef.current?.focus(); }}
        >
          <input
            ref={comboRef}
            id={id}
            type="text"
            role="combobox"
            aria-haspopup="listbox"
            aria-expanded={isOpen}
            aria-controls={isOpen ? listboxId : undefined}
            aria-label={ariaLabel}
            aria-describedby={ariaDescribedBy}
            aria-activedescendant={
              isOpen && filtered[activeIndex] ? optionId(activeIndex) : undefined
            }
            disabled={disabled}
            placeholder={isOpen ? searchPlaceholder : placeholder}
            value={isOpen ? query : (selected?.label ?? "")}
            onChange={(e) => {
              if (!isOpen) openMenu();
              setQuery(e.target.value);
              setActiveIndex(0);
            }}
            onFocus={() => { if (!isOpen) openMenu(); }}
            onKeyDown={handleKeyDown}
            className="min-w-0 flex-1 bg-transparent text-[16px] md:text-[14px] text-text-primary outline-none placeholder:text-text-muted"
            autoComplete="off"
          />
          <svg
            onClick={(e) => { e.stopPropagation(); isOpen ? closeMenu() : openMenu(); }}
            className={`size-[18px] shrink-0 cursor-pointer text-text-secondary transition-transform duration-200 ${
              isOpen ? "rotate-180" : ""
            }`}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M19 9l-7 7-7-7" />
          </svg>
        </div>

        {name && <input type="hidden" name={name} value={value} />}
        {menu ? createPortal(menu, document.body) : null}
      </>
    );
  }

  // Standard non-searchable trigger button.
  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        id={id}
        disabled={disabled}
        onClick={() => (isOpen ? closeMenu() : openMenu())}
        onKeyDown={handleKeyDown}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-controls={isOpen ? listboxId : undefined}
        aria-label={ariaLabel}
        aria-describedby={ariaDescribedBy}
        className={sharedTriggerClasses}
      >
        <span
          className={`truncate ${selected ? "text-text-primary" : "text-text-muted"}`}
        >
          {selected?.label ?? placeholder}
        </span>
        <svg
          className={`size-[18px] shrink-0 text-text-secondary transition-transform duration-200 ${
            isOpen ? "rotate-180" : ""
          }`}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {name && <input type="hidden" name={name} value={value} />}
      {menu ? createPortal(menu, document.body) : null}
    </>
  );
}
