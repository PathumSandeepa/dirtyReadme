"use client";

import { useEffect, useState } from "react";

interface UseCountUpOptions {
  target: number;
  active: boolean;
  reducedMotion: boolean;
  durationMs?: number;
}

/** Counts from 0 to target once when active enters view, or shows target immediately under reduced motion. */
export function useCountUp({
  target,
  active,
  reducedMotion,
  durationMs = 850,
}: UseCountUpOptions): number {
  const [value, setValue] = useState(0);

  useEffect(() => {
    if (!active) return;
    if (reducedMotion || target <= 0) {
      const id = window.requestAnimationFrame(() => setValue(target));
      return () => window.cancelAnimationFrame(id);
    }

    let rafId = 0;
    const startTime = performance.now();

    const tick = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(1, elapsed / durationMs);
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(Math.round(target * eased));
      if (progress < 1) {
        rafId = window.requestAnimationFrame(tick);
      }
    };

    rafId = window.requestAnimationFrame(tick);
    return () => window.cancelAnimationFrame(rafId);
  }, [active, target, reducedMotion, durationMs]);

  if (reducedMotion) return target;
  return active ? value : 0;
}
