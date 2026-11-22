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

/** Flat 1px-bordered section card with 24px padding and 20px control spacing. */
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
        "flex flex-col gap-5 rounded-[8px] border border-[var(--border)] bg-[var(--surface)] p-6",
        className
      )}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h2 className="text-[16px] leading-6 font-semibold text-[var(--text)]">
            {number !== undefined ? `${number}. ${title}` : title}
          </h2>
          {description && (
            <p className="text-[13px] leading-5 text-[var(--text-muted)]">
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
