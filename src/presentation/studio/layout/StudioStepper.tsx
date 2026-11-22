"use client";

import { Check, ChevronRight } from "lucide-react";
import { cn } from "cn";

export type StudioMainStep = "connect" | "repository" | "customize" | "publish";
export type CustomizeSubTab = "creature" | "readme";

interface StudioStepperProps {
  currentStep: StudioMainStep;
  customizeSubTab: CustomizeSubTab;
  onNavigateStep: (step: StudioMainStep) => void;
  onChangeCustomizeSubTab: (tab: CustomizeSubTab) => void;
}

const MAIN_STEPS: { id: StudioMainStep; label: string; order: number }[] = [
  { id: "connect", label: "Connect", order: 1 },
  { id: "repository", label: "Repository", order: 2 },
  { id: "customize", label: "Customize", order: 3 },
  { id: "publish", label: "Publish", order: 4 },
];

/**
 * Sticky 48px slim progress stepper showing 1 Connect -> 2 Repository -> 3 Customize -> 4 Publish,
 * with clickable completed steps, accent underline on the active step, and inline Customize sub-tabs.
 */
export function StudioStepper({
  currentStep,
  customizeSubTab,
  onNavigateStep,
  onChangeCustomizeSubTab,
}: StudioStepperProps) {
  const currentOrder =
    MAIN_STEPS.find((s) => s.id === currentStep)?.order ?? 1;

  return (
    <nav
      aria-label="Studio progress"
      className="sticky top-14 z-20 min-h-12 border-b border-[var(--border)] bg-[var(--surface)]"
    >
      <div className="studio-no-scrollbar mx-auto flex min-h-12 max-w-[1784px] flex-wrap items-center justify-between gap-x-4 gap-y-2 overflow-x-auto px-4 sm:flex-nowrap sm:px-6">
        <ol className="flex h-12 items-stretch gap-1.5 sm:gap-2">
          {MAIN_STEPS.map((step, idx) => {
            const isCompleted = step.order < currentOrder;
            const isCurrent = step.id === currentStep;

            return (
              <li
                key={step.id}
                className="flex items-stretch gap-1.5 sm:gap-2"
              >
                {idx > 0 && (
                  <span className="flex items-center">
                    <ChevronRight className="size-3.5 shrink-0 text-[var(--text-faint)]" />
                  </span>
                )}

                {isCompleted ? (
                  <button
                    type="button"
                    onClick={() => onNavigateStep(step.id)}
                    className="inline-flex cursor-pointer items-center gap-1.5 border-b-2 border-transparent px-2 text-[13px] font-medium whitespace-nowrap text-[var(--text-muted)] transition-[color,background-color] duration-150 hover:bg-[var(--surface-2)] hover:text-[var(--text)]"
                  >
                    <span className="flex size-4 items-center justify-center rounded-full bg-[var(--accent-soft)] text-[var(--accent)]">
                      <Check className="size-3 stroke-[2.5]" />
                    </span>
                    <span>{step.label}</span>
                  </button>
                ) : (
                  <span
                    aria-current={isCurrent ? "step" : undefined}
                    className={cn(
                      "inline-flex items-center gap-1.5 border-b-2 px-2 text-[13px] whitespace-nowrap",
                      isCurrent
                        ? "border-[var(--accent)] font-semibold text-[var(--text)]"
                        : "border-transparent font-medium text-[var(--text-faint)]"
                    )}
                  >
                    <span
                      className={cn(
                        "flex size-4 items-center justify-center rounded-full text-[11px] font-semibold",
                        isCurrent
                          ? "bg-[var(--accent)] text-[var(--on-accent)]"
                          : "border border-[var(--border)] text-[var(--text-faint)]"
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

        {currentStep === "customize" && (
          <div
            role="tablist"
            aria-label="Customize sections"
            className="mb-1.5 flex items-center gap-1 rounded-[6px] border border-[var(--border)] bg-[var(--surface-2)] p-0.5 sm:mb-0"
          >
            {(
              [
                { id: "creature", num: "1", label: "Creature & Style" },
                { id: "readme", num: "2", label: "README Text & Stack" },
              ] as const
            ).map((tab) => {
              const selected = customizeSubTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  role="tab"
                  aria-selected={selected}
                  onClick={() => onChangeCustomizeSubTab(tab.id)}
                  className={cn(
                    "inline-flex h-8 cursor-pointer items-center gap-1.5 rounded-[5px] border px-2.5 text-[13px] font-medium whitespace-nowrap transition-[color,background-color,border-color] duration-150 sm:h-7",
                    selected
                      ? "border-[var(--border)] bg-[var(--surface)] text-[var(--accent)]"
                      : "border-transparent text-[var(--text-muted)] hover:text-[var(--text)]"
                  )}
                >
                  <span
                    className={cn(
                      "inline-flex size-4 items-center justify-center rounded-full text-[11px] font-semibold",
                      selected
                        ? "bg-[var(--accent-soft)] text-[var(--accent)]"
                        : "bg-[var(--border)]/60 text-[var(--text-muted)]"
                    )}
                  >
                    {tab.num}
                  </span>
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </nav>
  );
}
