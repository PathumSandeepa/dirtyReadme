"use client";

import * as React from "react";
import { cn } from "cn";

interface StudioSectionCardProps {
  number?: number;
  title: string;
  description?: string;
  headerAction?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}

/** Borderless 12px-radius section card separated by surface depth instead of outlines. */
export function StudioSectionCard({
  number,
  title,
  description,
  headerAction,
  children,
  className,
}: StudioSectionCardProps) {
  return (
    <section
      className={cn(
        "flex flex-col gap-5 rounded-[12px] border-0 bg-[var(--surface)] p-6 sm:p-8",
        className
      )}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h2 className="text-[18px] leading-6 font-semibold tracking-[-0.02em] text-[var(--text)]">
            {number !== undefined ? `${number}. ${title}` : title}
          </h2>
          {description && (
            <p className="text-[13px] leading-5 text-[var(--text-2)]">
              {description}
            </p>
          )}
        </div>
        {headerAction}
      </div>

      <div className="flex flex-col gap-5">{children}</div>
    </section>
  );
}
