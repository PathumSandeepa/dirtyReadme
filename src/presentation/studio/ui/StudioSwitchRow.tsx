"use client";

import { useId } from "react";
import { cn } from "cn";
import { Switch } from "@/components/ui/switch";

interface StudioSwitchRowProps {
  id?: string;
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  label: string;
  description?: string;
  disabled?: boolean;
  className?: string;
}

/** Borderless on and off switch row with visible label and short description. */
export function StudioSwitchRow({
  id,
  checked,
  onCheckedChange,
  label,
  description,
  disabled = false,
  className,
}: StudioSwitchRowProps) {
  const generatedId = useId();
  const controlId = id ?? generatedId;

  return (
    <div
      className={cn(
        "flex items-start justify-between gap-4 rounded-[8px] border-0 bg-[var(--surface-2)] px-3.5 py-3 transition-colors duration-150",
        disabled && "opacity-55",
        className
      )}
    >
      <div className="flex min-w-0 flex-1 flex-col gap-0.5">
        <label
          htmlFor={controlId}
          className="cursor-pointer text-[14px] leading-5 font-medium text-[var(--text)]"
        >
          {label}
        </label>
        {description && (
          <p className="text-[13px] leading-5 text-[var(--text-2)]">
            {description}
          </p>
        )}
      </div>

      <Switch
        id={controlId}
        checked={checked}
        disabled={disabled}
        onCheckedChange={(next) => onCheckedChange(Boolean(next))}
        className="mt-0.5 shrink-0"
      />
    </div>
  );
}
