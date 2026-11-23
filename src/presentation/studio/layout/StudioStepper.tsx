"use client";

import { Check, ChevronRight } from "lucide-react";
import { cn } from "cn";

export type StudioMainStep = "connect" | "repository" | "customize" | "publish";

interface StudioStepperProps {
  currentStep: StudioMainStep;
  onNavigateStep: (step: StudioMainStep) => void;
}

const MAIN_STEPS: { id: StudioMainStep; label: string; order: number }[] = [
  { id: "connect", label: "Connect", order: 1 },
  { id: "repository", label: "Repository", order: 2 },
  { id: "customize", label: "Customize", order: 3 },
  { id: "publish", label: "Publish", order: 4 },
];

/** Sticky 48px workflow stepper separating workflow stages using surface elevation instead of borders. */
export function StudioStepper({
  currentStep,
  onNavigateStep,
}: StudioStepperProps) {
  const currentOrder =
    MAIN_STEPS.find((s) => s.id === currentStep)?.order ?? 1;

  return (
    <nav
      aria-label="Studio progress"
      className="sticky top-14 z-20 min-h-12 bg-[var(--surface)]"
    >
      <div className="studio-no-scrollbar mx-auto flex h-12 max-w-[1784px] items-center justify-between gap-4 overflow-x-auto px-4 sm:px-6">
        <ol className="flex items-center gap-1 sm:gap-2">
          {MAIN_STEPS.map((step, idx) => {
            const isCompleted = step.order < currentOrder;
            const isCurrent = step.id === currentStep;

            return (
              <li key={step.id} className="flex items-center gap-1 sm:gap-2">
                {idx > 0 && (
                  <span className="flex items-center">
                    <ChevronRight className="size-3.5 shrink-0 text-[var(--text-3)]" />
                  </span>
                )}

                {isCompleted ? (
                  <button
                    type="button"
                    onClick={() => onNavigateStep(step.id)}
                    className="inline-flex h-8 cursor-pointer items-center gap-1.5 rounded-[8px] px-2.5 text-[13px] font-medium whitespace-nowrap text-[var(--text-2)] transition-[color,background-color] duration-150 hover:bg-[var(--surface-2)] hover:text-[var(--text)]"
                  >
                    <span className="flex size-4 items-center justify-center rounded-full bg-[var(--tide-soft)] text-[var(--tide)]">
                      <Check className="size-3 stroke-[2.5]" />
                    </span>
                    <span>{step.label}</span>
                  </button>
                ) : (
                  <span
                    aria-current={isCurrent ? "step" : undefined}
                    className={cn(
                      "inline-flex h-8 items-center gap-1.5 rounded-[8px] px-2.5 text-[13px] whitespace-nowrap",
                      isCurrent
                        ? "bg-[var(--surface-3)] font-semibold text-[var(--text)]"
                        : "font-medium text-[var(--text-3)]"
                    )}
                  >
                    <span
                      className={cn(
                        "studio-mono flex size-4 items-center justify-center rounded-full text-[11px] font-semibold tabular-nums",
                        isCurrent
                          ? "bg-[var(--primary)] text-[var(--on-primary)]"
                          : "bg-[var(--surface-2)] text-[var(--text-3)]"
                      )}
                    >
                      {step.order}
                    </span>
                    <span>{step.label}</span>
                  </span>
                )}
              </li>
            );
          })}
        </ol>
      </div>
    </nav>
  );
}
