"use client";

import * as React from "react";
import { cn } from "cn";
import { Slider } from "@/components/ui/slider";

interface StudioSliderFieldProps {
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  unit?: string;
  formatValue?: (val: number) => string;
  onChange: (next: number) => void;
  helper?: string;
  presetSlot?: React.ReactNode;
  className?: string;
}

/** Range slider paired with visible label and right-aligned monospace numeric value + unit. */
export function StudioSliderField({
  label,
  value,
  min,
  max,
  step = 1,
  unit = "",
  formatValue,
  onChange,
  helper,
  presetSlot,
  className,
}: StudioSliderFieldProps) {
  const displayValue = formatValue ? formatValue(value) : String(value);

  return (
    <div className={cn("flex flex-col gap-2.5", className)}>
      <div className="flex items-center justify-between gap-3">
        <span className="text-[14px] leading-5 font-medium text-[var(--text)]">
          {label}
        </span>
        <span className="studio-mono text-[13px] font-medium text-[var(--text)] tabular-nums">
          {displayValue}
          {unit}
        </span>
      </div>

      {presetSlot}

      <Slider
        aria-label={label}
        min={min}
        max={max}
        step={step}
        value={[value]}
        onValueChange={(val) => {
          const next = Array.isArray(val) ? val[0] : val;
          if (typeof next === "number" && Number.isFinite(next)) {
            onChange(next);
          }
        }}
      />

      {helper && (
        <p className="text-[13px] leading-5 text-[var(--text-2)]">
          {helper}
        </p>
      )}
    </div>
  );
}
