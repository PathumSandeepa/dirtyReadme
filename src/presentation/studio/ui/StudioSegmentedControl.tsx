"use client";

import * as React from "react";
import { cn } from "cn";

export interface SegmentedOption<T extends string> {
  value: T;
  label: string;
  icon?: React.ReactNode;
  disabled?: boolean;
}

interface StudioSegmentedControlProps<T extends string> {
  value: T;
  onChange: (value: T) => void;
  options: readonly SegmentedOption<T>[];
  ariaLabel: string;
  size?: "default" | "sm";
  layout?: "equal" | "auto";
  className?: string;
}

/** Borderless segmented control where active state uses a filled surface without colored rings. */
export function StudioSegmentedControl<T extends string>({
  value,
  onChange,
  options,
  ariaLabel,
  size = "default",
  layout = "equal",
  className,
}: StudioSegmentedControlProps<T>) {
  const colsClass =
    options.length === 4
      ? "grid-cols-4"
      : options.length === 3
        ? "grid-cols-3"
        : "grid-cols-2";

  return (
    <div
      role="radiogroup"
      aria-label={ariaLabel}
      className={cn(
        "gap-1 rounded-[8px] border-0 bg-[var(--surface-2)] p-1",
        layout === "auto"
          ? "inline-flex flex-wrap items-center"
          : cn("grid w-full", colsClass),
        className
      )}
    >
      {options.map((opt) => {
        const selected = value === opt.value;
        return (
          <button
            key={opt.value}
            type="button"
            role="radio"
            aria-checked={selected}
            disabled={opt.disabled}
            onClick={() => onChange(opt.value)}
            className={cn(
              "inline-flex cursor-pointer items-center justify-center gap-1.5 rounded-[6px] border-0 font-medium whitespace-nowrap transition-[color,background-color] duration-150 select-none disabled:cursor-not-allowed disabled:opacity-45 [&_svg]:size-3.5 [&_svg]:shrink-0",
              size === "sm"
                ? "min-h-[34px] px-2 text-[12px] sm:min-h-0 sm:h-7 sm:px-2.5 sm:text-[13px]"
                : "min-h-[38px] px-2.5 text-[13px] sm:min-h-0 sm:h-8",
              selected
                ? "bg-[var(--segment-active-bg)] text-[var(--text)] shadow-[var(--segment-active-shadow)]"
                : "bg-transparent text-[var(--text-2)] hover:text-[var(--text)]"
            )}
          >
            {opt.icon}
            <span className={layout === "auto" ? undefined : "truncate"}>
              {opt.label}
            </span>
          </button>
        );
      })}
    </div>
  );
}
