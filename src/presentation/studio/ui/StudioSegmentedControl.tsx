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
  className?: string;
}

/** Equal-width segmented control for 2 to 4 exclusive options. */
export function StudioSegmentedControl<T extends string>({
  value,
  onChange,
  options,
  ariaLabel,
  size = "default",
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
        "grid w-full gap-0.5 rounded-[6px] border border-[var(--border)] bg-[var(--surface-2)] p-0.5",
        colsClass,
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
              "inline-flex cursor-pointer items-center justify-center gap-1.5 rounded-[5px] border px-2.5 font-medium whitespace-nowrap transition-[color,background-color,border-color] duration-150 select-none disabled:cursor-not-allowed disabled:opacity-45 [&_svg]:size-3.5 [&_svg]:shrink-0",
              size === "sm"
                ? "min-h-[36px] text-[13px] sm:min-h-0 sm:h-[26px]"
                : "min-h-[40px] text-[13px] sm:min-h-0 sm:h-[30px]",
              selected
                ? "border-[var(--border)] bg-[var(--surface)] text-[var(--accent)]"
                : "border-transparent bg-transparent text-[var(--text-muted)] hover:text-[var(--text)]"
            )}
          >
            {opt.icon}
            <span className="truncate">{opt.label}</span>
          </button>
        );
      })}
    </div>
  );
}
