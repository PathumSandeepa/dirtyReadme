"use client";

import * as React from "react";
import { useEffect, useRef, useState } from "react";
import { cn } from "cn";

export type ReadmeZoomMode = "fit" | "100";

interface ScaledReadmeViewportProps {
  intrinsicWidth: number;
  zoomMode: ReadmeZoomMode;
  overrideFitZoom?: number;
  onFitZoomChange?: (zoom: number) => void;
  className?: string;
  children: React.ReactNode;
}

/**
 * Renders fixed-width GitHub README surfaces (880px or 1200px with sidebar)
 * without reflowing text or badges. Scales uniformly with CSS zoom in Fit mode
 * or enables horizontal scrolling inside the pane at 100%.
 */
export function ScaledReadmeViewport({
  intrinsicWidth,
  zoomMode,
  overrideFitZoom,
  onFitZoomChange,
  className,
  children,
}: ScaledReadmeViewportProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [containerWidth, setContainerWidth] = useState<number>(intrinsicWidth);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const measure = () => {
      const next = el.clientWidth;
      if (next > 0) {
        setContainerWidth(next);
      }
    };

    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const measuredFitZoom =
    containerWidth > 0
      ? Math.max(0.25, Math.min(1, containerWidth / intrinsicWidth))
      : 1;

  useEffect(() => {
    onFitZoomChange?.(measuredFitZoom);
  }, [measuredFitZoom, onFitZoomChange]);

  const effectiveZoom =
    zoomMode === "100"
      ? 1
      : overrideFitZoom !== undefined
        ? Math.max(0.25, Math.min(1, overrideFitZoom))
        : measuredFitZoom;

  return (
    <div
      ref={containerRef}
      className={cn(
        "w-full",
        zoomMode === "100" && effectiveZoom === 1
          ? "overflow-x-auto"
          : "overflow-x-hidden",
        className
      )}
    >
      <div
        className="mx-auto"
        style={{
          width: `${intrinsicWidth}px`,
          zoom: effectiveZoom,
        }}
      >
        {children}
      </div>
    </div>
  );
}
