"use client";

import * as React from "react";
import { cn } from "cn";

interface StudioFieldProps {
  label: string;
  htmlFor?: string;
  helper?: string;
  error?: string | null;
  trailing?: React.ReactNode;
  className?: string;
  children: React.ReactNode;
}

/** Labeled field container with optional right slot, helper text, and inline danger validation. */
export function StudioField({
  label,
  htmlFor,
  helper,
  error,
  trailing,
  className,
  children,
}: StudioFieldProps) {
  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      <div className="flex items-center justify-between gap-2">
        <label
          htmlFor={htmlFor}
          className="text-[14px] leading-5 font-medium text-[var(--text)]"
        >
          {label}
        </label>
        {trailing}
      </div>
      {children}
      {error ? (
        <p role="alert" className="text-[13px] leading-5 text-[var(--danger)]">
          {error}
        </p>
      ) : helper ? (
        <p className="text-[13px] leading-5 text-[var(--text-muted)]">
          {helper}
        </p>
      ) : null}
    </div>
  );
}

export interface StudioInputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  invalid?: boolean;
  monospace?: boolean;
  inputSize?: "default" | "lg";
}

/** Hairline 36px/40px input (44px touch target on mobile) using scoped studio tokens. */
export const StudioInput = React.forwardRef<HTMLInputElement, StudioInputProps>(
  function StudioInput(
    {
      className,
      invalid = false,
      monospace = false,
      inputSize = "default",
      ...props
    },
    ref
  ) {
    return (
      <input
        ref={ref}
        aria-invalid={invalid || undefined}
        className={cn(
          "h-11 w-full min-w-0 rounded-[6px] border bg-[var(--surface)] px-3 text-[14px] text-[var(--text)] transition-[color,background-color,border-color] duration-150 placeholder:text-[var(--text-faint)] disabled:cursor-not-allowed disabled:opacity-50",
          inputSize === "lg" ? "sm:h-10" : "sm:h-9",
          invalid
            ? "border-[var(--danger)]"
            : "border-[var(--border)] hover:border-[var(--border-strong)] focus:border-[var(--accent)]",
          monospace && "studio-mono text-[13px]",
          className
        )}
        {...props}
      />
    );
  }
);

export interface StudioTextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  invalid?: boolean;
  monospace?: boolean;
}

/** Hairline textarea using scoped studio tokens. */
export const StudioTextarea = React.forwardRef<
  HTMLTextAreaElement,
  StudioTextareaProps
>(function StudioTextarea(
  { className, invalid = false, monospace = false, ...props },
  ref
) {
  return (
    <textarea
      ref={ref}
      aria-invalid={invalid || undefined}
      className={cn(
        "w-full min-w-0 rounded-[6px] border bg-[var(--surface)] px-3 py-2 text-[14px] text-[var(--text)] transition-[color,background-color,border-color] duration-150 placeholder:text-[var(--text-faint)] disabled:cursor-not-allowed disabled:opacity-50",
        invalid
          ? "border-[var(--danger)]"
          : "border-[var(--border)] hover:border-[var(--border-strong)] focus:border-[var(--accent)]",
        monospace && "studio-mono text-[13px]",
        className
      )}
      {...props}
    />
  );
});

export interface StudioSelectProps
  extends React.SelectHTMLAttributes<HTMLSelectElement> {
  invalid?: boolean;
}

/** Native accessible select styled to match 36px studio controls. */
export const StudioSelect = React.forwardRef<
  HTMLSelectElement,
  StudioSelectProps
>(function StudioSelect({ className, invalid = false, children, ...props }, ref) {
  return (
    <select
      ref={ref}
      aria-invalid={invalid || undefined}
      className={cn(
        "h-11 w-full min-w-0 cursor-pointer rounded-[6px] border bg-[var(--surface)] px-3 text-[14px] text-[var(--text)] transition-[color,background-color,border-color] duration-150 disabled:cursor-not-allowed disabled:opacity-50 sm:h-9",
        invalid
          ? "border-[var(--danger)]"
          : "border-[var(--border)] hover:border-[var(--border-strong)] focus:border-[var(--accent)]",
        className
      )}
      {...props}
    >
      {children}
    </select>
  );
});
