"use client";

import * as React from "react";
import { cn } from "cn";

export type StudioButtonVariant = "primary" | "secondary" | "ghost" | "danger";
export type StudioButtonSize = "default" | "sm" | "lg" | "icon";

export interface StudioButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: StudioButtonVariant;
  size?: StudioButtonSize;
  active?: boolean;
}

const VARIANT_CLASSES: Record<StudioButtonVariant, string> = {
  primary:
    "border-transparent bg-[var(--accent)] text-[var(--on-accent)] hover:bg-[var(--accent-hover)]",
  secondary:
    "border-[var(--border)] bg-[var(--surface)] text-[var(--text)] hover:border-[var(--border-strong)] hover:bg-[var(--surface-2)]",
  ghost:
    "border-transparent bg-transparent text-[var(--text-muted)] hover:bg-[var(--surface-2)] hover:text-[var(--text)]",
  danger:
    "border-[var(--border)] bg-[var(--surface)] text-[var(--danger)] hover:border-[var(--danger)] hover:bg-[color-mix(in_srgb,var(--danger)_8%,transparent)]",
};

const SIZE_CLASSES: Record<StudioButtonSize, string> = {
  default: "min-h-[44px] sm:min-h-0 h-9 px-3.5 text-[14px] gap-2",
  sm: "min-h-[40px] sm:min-h-0 h-8 px-3 text-[13px] gap-1.5",
  lg: "min-h-[44px] sm:min-h-0 sm:h-10 px-4 text-[14px] gap-2",
  icon: "min-h-[44px] min-w-[44px] sm:min-h-0 sm:min-w-0 size-9 p-0",
};

/** Flat developer-tool button bound to scoped studio CSS tokens. */
export const StudioButton = React.forwardRef<HTMLButtonElement, StudioButtonProps>(
  function StudioButton(
    {
      className,
      variant = "secondary",
      size = "default",
      active = false,
      type = "button",
      ...props
    },
    ref
  ) {
    return (
      <button
        ref={ref}
        type={type}
        aria-pressed={active ? true : undefined}
        className={cn(
          "inline-flex shrink-0 cursor-pointer items-center justify-center rounded-[6px] border font-medium whitespace-nowrap transition-[color,background-color,border-color] duration-150 select-none disabled:cursor-not-allowed disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
          VARIANT_CLASSES[variant],
          active &&
            variant !== "primary" &&
            "border-[var(--accent)] bg-[var(--accent-soft)] text-[var(--accent)] hover:border-[var(--accent)] hover:bg-[var(--accent-soft)] hover:text-[var(--accent)]",
          SIZE_CLASSES[size],
          className
        )}
        {...props}
      />
    );
  }
);
