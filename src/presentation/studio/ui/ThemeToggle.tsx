"use client";

import { Monitor, Moon, Sun } from "lucide-react";
import { cn } from "cn";
import type { ThemePreference } from "../hooks/useThemePreference";

interface ThemeToggleProps {
  value: ThemePreference;
  onChange: (next: ThemePreference) => void;
  className?: string;
}

const OPTIONS: {
  id: ThemePreference;
  label: string;
  Icon: typeof Monitor;
}[] = [
  { id: "system", label: "System theme", Icon: Monitor },
  { id: "light", label: "Light theme", Icon: Sun },
  { id: "dark", label: "Dark theme", Icon: Moon },
];

/** Borderless 3-way theme segmented toggle (System, Light, Dark). */
export function ThemeToggle({ value, onChange, className }: ThemeToggleProps) {
  return (
    <div
      role="radiogroup"
      aria-label="Theme preference"
      className={cn(
        "inline-flex items-center gap-0.5 rounded-[8px] bg-[var(--surface-2)] p-[3px]",
        className
      )}
    >
      {OPTIONS.map(({ id, label, Icon }) => {
        const selected = value === id;
        return (
          <button
            key={id}
            type="button"
            role="radio"
            aria-checked={selected}
            aria-label={label}
            title={label}
            onClick={() => onChange(id)}
            className={cn(
              "inline-flex h-[26px] w-7 cursor-pointer items-center justify-center rounded-[6px] border-0 transition-[background-color,color,box-shadow] duration-150 outline-none select-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--text-2)]",
              selected
                ? "bg-[var(--segment-active-bg)] text-[var(--text)] shadow-[var(--segment-active-shadow)]"
                : "text-[var(--text-2)] hover:text-[var(--text)]"
            )}
          >
            <Icon className="size-3.5" />
          </button>
        );
      })}
    </div>
  );
}
