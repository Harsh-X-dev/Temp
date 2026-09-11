"use client";

import { useEffect } from "react";

/**
 * Calls `onEscape` when Escape is pressed while `active` is true. Listens in
 * the bubble phase, matching the sheets that already used this pattern — a
 * nested menu that needs to swallow Escape before it reaches the sheet
 * should stop propagation in the capture phase itself (see
 * components/ui/Select.tsx, which closes its own menu first for exactly
 * this reason).
 */
export function useEscapeKey(active: boolean, onEscape: () => void): void {
  useEffect(() => {
    if (!active) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onEscape();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [active, onEscape]);
}
