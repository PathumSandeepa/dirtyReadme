"use client";

import { useCallback, useEffect, useRef, useSyncExternalStore } from "react";

interface UseTilt3DOptions {
  maxDegrees?: number;
  disabled?: boolean;
}

function subscribeFinePointer(onStoreChange: () => void): () => void {
  if (typeof window === "undefined" || !window.matchMedia) {
    return () => {};
  }
  const query = window.matchMedia("(pointer: fine)");
  query.addEventListener("change", onStoreChange);
  return () => query.removeEventListener("change", onStoreChange);
}

function getFinePointerSnapshot(): boolean {
  if (typeof window === "undefined" || !window.matchMedia) {
    return false;
  }
  return window.matchMedia("(pointer: fine)").matches;
}

function getServerPointerSnapshot(): boolean {
  return false;
}

/** Subtle 3D pointer tilt (max 3 deg) with moving glare highlight, disabled on touch and reduced motion. */
export function useTilt3D({
  maxDegrees = 3,
  disabled = false,
}: UseTilt3DOptions = {}) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const rafRef = useRef<number | null>(null);
  const finePointer = useSyncExternalStore(
    subscribeFinePointer,
    getFinePointerSnapshot,
    getServerPointerSnapshot
  );

  const enabled = finePointer && !disabled;

  const onPointerMove = useCallback(
    (event: React.PointerEvent<HTMLDivElement>) => {
      if (!enabled || event.pointerType === "touch") return;
      const node = containerRef.current;
      if (!node) return;
      const clientX = event.clientX;
      const clientY = event.clientY;

      if (rafRef.current !== null) {
        window.cancelAnimationFrame(rafRef.current);
      }

      rafRef.current = window.requestAnimationFrame(() => {
        rafRef.current = null;
        const rect = node.getBoundingClientRect();
        if (rect.width <= 0 || rect.height <= 0) return;
        const px = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
        const py = Math.max(0, Math.min(1, (clientY - rect.top) / rect.height));
        const rotateY = (px - 0.5) * 2 * maxDegrees;
        const rotateX = (0.5 - py) * 2 * maxDegrees;
        node.style.transform = `perspective(1200px) rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(2)}deg)`;
        node.style.setProperty("--glare-x", `${(px * 100).toFixed(1)}%`);
        node.style.setProperty("--glare-y", `${(py * 100).toFixed(1)}%`);
        node.style.setProperty("--glare-opacity", "1");
      });
    },
    [enabled, maxDegrees]
  );

  const onPointerLeave = useCallback(() => {
    const node = containerRef.current;
    if (!node) return;
    if (rafRef.current !== null) {
      window.cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
    node.style.transform = "perspective(1200px) rotateX(0deg) rotateY(0deg)";
    node.style.setProperty("--glare-opacity", "0");
  }, []);

  useEffect(() => {
    return () => {
      if (rafRef.current !== null) {
        window.cancelAnimationFrame(rafRef.current);
      }
    };
  }, []);

  return { containerRef, onPointerMove, onPointerLeave };
}
