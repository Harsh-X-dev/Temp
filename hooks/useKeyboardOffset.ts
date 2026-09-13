"use client";

import { useEffect, useState } from "react";

export interface ViewportOffset {
  keyboardOffset: number;
  topOffset: number;
  isKeyboardOpen: boolean;
}

/**
 * Tracks the visible viewport height above the software keyboard on mobile devices.
 * Works across iOS Safari, Android Chrome, and hybrid WebViews.
 */
export function useKeyboardOffset(active: boolean = true): ViewportOffset {
  const [offset, setOffset] = useState<ViewportOffset>({
    keyboardOffset: 0,
    topOffset: 0,
    isKeyboardOpen: false,
  });

  useEffect(() => {
    if (!active || typeof window === "undefined") {
      setOffset({ keyboardOffset: 0, topOffset: 0, isKeyboardOpen: false });
      return;
    }

    const vv = window.visualViewport;
    if (!vv) return;

    const update = () => {
      const layoutHeight = window.innerHeight;
      const visualHeight = vv.height;
      const topOffset = vv.offsetTop;

      // Distance from bottom of layout viewport to bottom of visible viewport
      const bottomDiff = Math.max(0, layoutHeight - (topOffset + visualHeight));

      // Only treat as virtual keyboard if difference is > 80px to ignore minor URL bar shifts
      const isKeyboardOpen = bottomDiff > 80;

      setOffset({
        keyboardOffset: isKeyboardOpen ? Math.round(bottomDiff) : 0,
        topOffset: isKeyboardOpen ? Math.round(topOffset) : 0,
        isKeyboardOpen,
      });
    };

    vv.addEventListener("resize", update);
    vv.addEventListener("scroll", update);
    update();

    return () => {
      vv.removeEventListener("resize", update);
      vv.removeEventListener("scroll", update);
    };
  }, [active]);

  return offset;
}
