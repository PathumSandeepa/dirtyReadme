"use client";

import { ArrowLeft, ArrowRight } from "lucide-react";
import { StudioButton } from "../ui/StudioButton";

interface StudioActionBarProps {
  backLabel?: string;
  nextLabel: string;
  onBack: () => void;
  onNext: () => void;
}

/** Sticky bottom action bar with back navigation and a single primary continuation action. */
export function StudioActionBar({
  backLabel = "Back",
  nextLabel,
  onBack,
  onNext,
}: StudioActionBarProps) {
  return (
    <div className="sticky bottom-0 z-30 h-[60px] bg-[var(--surface)]/92 backdrop-blur-md shadow-[var(--shadow-float)]">
      <div className="mx-auto flex h-full max-w-[1784px] items-center justify-between gap-3 px-4 sm:px-6">
        <StudioButton variant="secondary" onClick={onBack}>
          <ArrowLeft />
          <span>{backLabel}</span>
        </StudioButton>

        <StudioButton variant="primary" onClick={onNext}>
          <span>{nextLabel}</span>
          <ArrowRight />
        </StudioButton>
      </div>
    </div>
  );
}
