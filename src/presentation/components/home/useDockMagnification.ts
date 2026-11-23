"use client";

import { useCallback, useEffect, useRef } from "react";

interface UseDockMagnificationOptions {
  maxScale?: number;
  radius?: number;
  lift?: number;
  disabled?: boolean;
}

/**
 * Smooth pointer-distance dock magnification driven via requestAnimationFrame
 * and direct CSS transforms on registered item refs.
 */
export function useDockMagnification({
  maxScale = 1.42,
  radius = 120,
  lift = 10,
  disabled = false,
}: UseDockMagnificationOptions = {}) {
  const itemRefs = useRef<(HTMLElement | null)[]>([]);
  const rafRef = useRef<number | null>(null);
  const pointerXRef = useRef<number | null>(null);

  const registerItem = useCallback(
    (index: number) => (el: HTMLElement | null) => {
      itemRefs.current[index] = el;
    },
    []
  );

  const applyFrame = useCallback(() => {
    rafRef.current = null;
    const cursorX = pointerXRef.current;

    for (const el of itemRefs.current) {
      if (!el) continue;
      if (disabled || cursorX === null) {
        el.style.transform = "translate3d(0, 0, 0) scale(1)";
        continue;
      }
      const rect = el.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const distance = Math.abs(cursorX - centerX);
      if (distance >= radius) {
        el.style.transform = "translate3d(0, 0, 0) scale(1)";
        continue;
      }
      const influence = Math.cos((distance / radius) * (Math.PI / 2));
      const scale = 1 + (maxScale - 1) * influence;
      const liftY = lift * influence;
      el.style.transform = `translate3d(0, -${liftY.toFixed(2)}px, 0) scale(${scale.toFixed(3)})`;
    }
  }, [disabled, lift, maxScale, radius]);

  const schedule = useCallback(() => {
    if (rafRef.current === null) {
      rafRef.current = window.requestAnimationFrame(applyFrame);
    }
  }, [applyFrame]);

  const onPointerMove = useCallback(
    (event: React.PointerEvent<HTMLElement>) => {
      if (disabled || event.pointerType === "touch") return;
      pointerXRef.current = event.clientX;
      schedule();
    },
    [disabled, schedule]
  );

  const onPointerLeave = useCallback(() => {
    pointerXRef.current = null;
    schedule();
  }, [schedule]);

  useEffect(() => {
    return () => {
      if (rafRef.current !== null) {
        window.cancelAnimationFrame(rafRef.current);
      }
    };
  }, []);

  return { registerItem, onPointerMove, onPointerLeave };
}
