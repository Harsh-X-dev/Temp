"use client";

import { useRef, useEffect, useCallback, useState } from "react";

interface UseBottomSheetDragOptions {
  isOpen: boolean;
  onClose: () => void;
  thresholdFraction?: number;
  minThresholdPx?: number;
}

/**
 * Hook providing smooth touch/mouse drag-to-dismiss functionality for bottom sheets.
 * When the user drags the handle bar down past the threshold (or flicks downwards),
 * the sheet smoothly slides out and triggers onClose.
 */
export function useBottomSheetDrag({
  isOpen,
  onClose,
  thresholdFraction = 0.35,
  minThresholdPx = 80,
}: UseBottomSheetDragOptions) {
  const sheetRef = useRef<HTMLDivElement | null>(null);
  const isDraggingRef = useRef(false);
  const startYRef = useRef(0);
  const currentYRef = useRef(0);
  const startTimeRef = useRef(0);
  const [isClosing, setIsClosing] = useState(false);

  // Reset transform and transition whenever sheet opens
  useEffect(() => {
    if (isOpen && sheetRef.current) {
      setIsClosing(false);
      sheetRef.current.style.transform = "translateY(0px)";
      sheetRef.current.style.transition = "";
    }
  }, [isOpen]);

  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    if (!sheetRef.current) return;
    if (e.button !== 0) return; // Only respond to primary button / touch

    isDraggingRef.current = true;
    startYRef.current = e.clientY;
    currentYRef.current = e.clientY;
    startTimeRef.current = Date.now();

    sheetRef.current.style.transition = "none";
    try {
      (e.target as HTMLElement).setPointerCapture(e.pointerId);
    } catch {
      // Ignore if pointer capture is not supported
    }
  }, []);

  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    if (!isDraggingRef.current || !sheetRef.current) return;

    currentYRef.current = e.clientY;
    const deltaY = currentYRef.current - startYRef.current;

    if (deltaY > 0) {
      sheetRef.current.style.transform = `translateY(${deltaY}px)`;
    } else {
      // Slight elastic resistance upwards
      sheetRef.current.style.transform = `translateY(${deltaY * 0.15}px)`;
    }
  }, []);

  const handlePointerUp = useCallback((e: React.PointerEvent) => {
    if (!isDraggingRef.current || !sheetRef.current) return;
    isDraggingRef.current = false;

    try {
      (e.target as HTMLElement).releasePointerCapture(e.pointerId);
    } catch {
      // Ignore
    }

    const deltaY = currentYRef.current - startYRef.current;
    const duration = Math.max(1, Date.now() - startTimeRef.current);
    const velocity = deltaY / duration; // px per ms

    const sheetHeight = sheetRef.current.offsetHeight || 400;
    const threshold = Math.max(minThresholdPx, sheetHeight * thresholdFraction);

    // Close if dragged past threshold or swiped down quickly
    const shouldClose = deltaY > threshold || (deltaY > 40 && velocity > 0.4);

    if (shouldClose) {
      setIsClosing(true);
      sheetRef.current.style.transition = "transform 220ms cubic-bezier(0.32, 0.72, 0, 1)";
      sheetRef.current.style.transform = `translateY(${sheetHeight + 50}px)`;
      setTimeout(() => {
        onClose();
      }, 200);
    } else {
      // Snap smoothly back to top position
      sheetRef.current.style.transition = "transform 220ms cubic-bezier(0.32, 0.72, 0, 1)";
      sheetRef.current.style.transform = "translateY(0px)";
    }
  }, [minThresholdPx, onClose, thresholdFraction]);

  return {
    sheetRef,
    dragHandleProps: {
      onPointerDown: handlePointerDown,
      onPointerMove: handlePointerMove,
      onPointerUp: handlePointerUp,
      onPointerCancel: handlePointerUp,
      style: { touchAction: "none" as const, cursor: "grab" },
    },
    isClosing,
  };
}
