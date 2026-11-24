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
    "bg-[var(--primary)] text-[var(--on-primary)] hover:bg-[var(--primary-hover)]",
  secondary:
    "bg-[var(--surface-2)] text-[var(--text)] hover:bg-[var(--surface-3)]",
  ghost:
    "bg-transparent text-[var(--text-2)] hover:bg-[var(--surface-2)] hover:text-[var(--text)]",
  danger:
    "bg-[var(--danger-soft)] text-[var(--danger)] hover:opacity-90",
};

const SIZE_CLASSES: Record<StudioButtonSize, string> = {
  default: "min-h-11 h-11 sm:min-h-0 sm:h-9 px-3.5 text-[14px] gap-2",
  sm: "min-h-11 h-11 sm:min-h-0 sm:h-8 px-3 text-[13px] gap-1.5",
  lg: "min-h-11 h-11 sm:min-h-0 sm:h-10 px-4 text-[14px] gap-2",
  icon: "size-11 sm:size-9 p-0",
};

/** Borderless surface-step button bound to Abyss and Paper tokens. */
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
          "inline-flex shrink-0 cursor-pointer items-center justify-center rounded-[8px] border-0 font-medium whitespace-nowrap transition-[color,background-color,opacity] duration-150 outline-none select-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--text-2)] disabled:cursor-not-allowed disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
          VARIANT_CLASSES[variant],
          active &&
            variant !== "primary" &&
            "bg-[var(--surface-3)] text-[var(--text)] hover:bg-[var(--surface-3)]",
          SIZE_CLASSES[size],
          className
        )}
        {...props}
      />
    );
  }
);
