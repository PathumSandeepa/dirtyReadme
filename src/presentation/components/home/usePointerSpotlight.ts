"use client";

import { useCallback } from "react";

/** Updates CSS spotlight coordinates directly on a card without triggering React re-renders. */
export function usePointerSpotlight(disabled = false) {
  const onPointerMove = useCallback(
    (event: React.PointerEvent<HTMLElement>) => {
      if (disabled) return;
      const target = event.currentTarget;
      const rect = target.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;
      target.style.setProperty("--spot-x", `${x}px`);
      target.style.setProperty("--spot-y", `${y}px`);
      target.style.setProperty("--spot-opacity", "1");
    },
    [disabled]
  );

  const onPointerLeave = useCallback(
    (event: React.PointerEvent<HTMLElement>) => {
      event.currentTarget.style.setProperty("--spot-opacity", "0");
    },
    []
  );

  return { onPointerMove, onPointerLeave };
}
