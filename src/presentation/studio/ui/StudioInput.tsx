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

/** Labeled field container with optional trailing slot, helper text, and inline validation message. */
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
          className="text-[13px] leading-5 font-medium text-[var(--text)]"
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
        <p className="text-[13px] leading-5 text-[var(--text-2)]">
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

/** Borderless surface-stepped input without colored focus rings or outlines. */
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
          "h-10 w-full min-w-0 rounded-[8px] border-0 px-3 text-[14px] text-[var(--text)] transition-colors duration-150 placeholder:text-[var(--text-3)] focus:outline-none disabled:cursor-not-allowed disabled:opacity-50",
          inputSize === "lg" ? "sm:h-10" : "sm:h-9",
          invalid
            ? "bg-[var(--danger-soft)] text-[var(--text)]"
            : "bg-[var(--surface-2)] hover:bg-[var(--surface-3)] focus:bg-[var(--surface-3)]",
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

/** Borderless textarea using Abyss and Paper surface elevation. */
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
        "w-full min-w-0 rounded-[8px] border-0 px-3 py-2 text-[14px] text-[var(--text)] transition-colors duration-150 placeholder:text-[var(--text-3)] focus:outline-none disabled:cursor-not-allowed disabled:opacity-50",
        invalid
          ? "bg-[var(--danger-soft)] text-[var(--text)]"
          : "bg-[var(--surface-2)] hover:bg-[var(--surface-3)] focus:bg-[var(--surface-3)]",
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

/** Accessible native select styled as a borderless 36px surface control. */
export const StudioSelect = React.forwardRef<
  HTMLSelectElement,
  StudioSelectProps
>(function StudioSelect({ className, invalid = false, children, ...props }, ref) {
  return (
    <select
      ref={ref}
      aria-invalid={invalid || undefined}
      className={cn(
        "h-10 w-full min-w-0 cursor-pointer rounded-[8px] border-0 px-3 text-[14px] text-[var(--text)] transition-colors duration-150 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50 sm:h-9",
        invalid
          ? "bg-[var(--danger-soft)] text-[var(--text)]"
          : "bg-[var(--surface-2)] hover:bg-[var(--surface-3)] focus:bg-[var(--surface-3)]",
        className
      )}
      {...props}
    >
      {children}
    </select>
  );
});
