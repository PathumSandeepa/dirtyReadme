"use client";

import { useId } from "react";
import type * as React from "react";
import { cn } from "cn";

export interface BrandLockupProps {
  size?: "sm" | "md" | "lg";
  variant?: "landing" | "studio";
  showMark?: boolean;
  href?: string;
  onClick?: React.MouseEventHandler<HTMLAnchorElement>;
  className?: string;
}

const SIZE_CONFIG = {
  sm: {
    markSize: 22,
    gapClass: "gap-2",
    textClass: "text-[14px]",
  },
  md: {
    markSize: 28,
    gapClass: "gap-2.5",
    textClass: "text-[16px]",
  },
  lg: {
    markSize: 34,
    gapClass: "gap-3",
    textClass: "text-[20px]",
  },
} as const;

/** Brand mark and two-style DirtyReadme wordmark link with hover/focus caret. */
export function BrandLockup({
  size = "md",
  variant = "studio",
  showMark = true,
  href = "#top",
  onClick,
  className,
}: BrandLockupProps) {
  const gradientId = useId();
  const { markSize, gapClass, textClass } = SIZE_CONFIG[size];
  const isLanding = variant === "landing";

  return (
    <a
      href={href}
      onClick={onClick}
      aria-label="DirtyReadme home"
      className={cn(
        "brand-lockup inline-flex shrink-0 items-center rounded-[8px] py-1 pr-1.5 no-underline transition-opacity duration-150 hover:opacity-95",
        gapClass,
        className
      )}
    >
      {showMark && (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 28 28"
          width={markSize}
          height={markSize}
          aria-hidden="true"
          className="shrink-0"
        >
          {isLanding && (
            <defs>
              <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#FFB84A" />
                <stop offset="100%" stopColor="#F07A0F" />
              </linearGradient>
            </defs>
          )}
          <rect
            width="28"
            height="28"
            rx="8"
            fill={isLanding ? `url(#${gradientId})` : "var(--primary)"}
          />
          <g fill={isLanding ? "#1A0D00" : "var(--on-primary)"}>
            <rect x="9.5" y="6.5" width="2.8" height="15" rx="1" />
            <rect x="15.7" y="6.5" width="2.8" height="15" rx="1" />
            <rect x="6.5" y="10" width="15" height="2.6" rx="1" />
            <rect x="6.5" y="15.4" width="15" height="2.6" rx="1" />
          </g>
        </svg>
      )}

      <span
        className={cn(
          "inline-flex items-baseline leading-none select-none",
          textClass
        )}
      >
        <span
          className={
            isLanding
              ? "font-[family-name:var(--font-plus-jakarta-sans),var(--font-geist-sans),system-ui,sans-serif] font-extrabold tracking-[-0.04em] text-white"
              : "font-sans font-bold tracking-[-0.025em] text-[var(--text)]"
          }
        >
          Dirty
        </span>
        <span
          className={
            isLanding
              ? "font-mono font-semibold text-[#FFA033]"
              : "font-mono font-semibold text-[var(--ember)]"
          }
        >
          Readme
        </span>
        <span
          aria-hidden="true"
          className={cn(
            "brand-lockup-caret ml-[2px] inline-block h-[0.9em] w-[2px] self-center rounded-[1px]",
            isLanding ? "bg-[#FFA033]" : "bg-[var(--ember)]"
          )}
        />
      </span>
    </a>
  );
}
