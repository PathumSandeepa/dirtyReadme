"use client";

import { Check } from "lucide-react";
import { cn } from "cn";
import {
  CAMERA_VIEWS,
  STAGE_DEFINITIONS,
  type CameraView,
  type CreatureConfig,
} from "@/domain/creature/entities";
import { getCreatureMeta, getEvolutionStage } from "@/domain/creature/services";
import { CreatureAnimatedView } from "./CreatureAnimatedView";

const STAGE_LABELS: Record<number, string> = {
  1: "Calf",
  2: "Young",
  3: "Sub-adult",
  4: "Mature",
  5: "Elder",
};

interface EvolutionPanelProps {
  baseConfig: CreatureConfig;
  onSelectView: (view: CameraView) => void;
}

export function EvolutionPanel({
  baseConfig,
  onSelectView,
}: EvolutionPanelProps) {
  const meta = getCreatureMeta(baseConfig.creature);
  const currentStage = getEvolutionStage(baseConfig.commits);

  return (
    <div className="flex flex-col gap-6 rounded-[8px] border border-[var(--border)] bg-[var(--surface)] p-5">
      <div className="flex flex-col gap-1">
        <h3 className="text-[16px] font-semibold text-[var(--text)]">
          Evolution stages{meta.supportsViewSelection ? " & camera views" : ""}
        </h3>
        <p className="text-[13px] text-[var(--text-muted)]">
          Growth tiers unlock automatically from your commit count.
          {meta.supportsViewSelection
            ? " Click a camera angle below to switch view."
            : ""}
        </p>
      </div>

      {meta.supportsViewSelection && (
        <div className="flex flex-col gap-3">
          <h4 className="text-[14px] font-medium text-[var(--text)]">
            Camera perspectives
          </h4>
          <div className="grid gap-4 md:grid-cols-2">
            {CAMERA_VIEWS.map((view) => {
              const active = baseConfig.view === view.id;
              return (
                <button
                  key={view.id}
                  type="button"
                  aria-pressed={active}
                  onClick={() => onSelectView(view.id)}
                  className={cn(
                    "cursor-pointer overflow-hidden rounded-[8px] border text-left transition-[color,background-color,border-color] duration-150",
                    active
                      ? "border-[var(--accent)] bg-[var(--accent-soft)]"
                      : "border-[var(--border)] bg-[var(--surface)] hover:border-[var(--border-strong)]"
                  )}
                >
                  <div className="border-b border-[var(--border)] bg-[#0d1117] p-2">
                    <CreatureAnimatedView
                      config={{ ...baseConfig, view: view.id }}
                      className="w-full"
                    />
                  </div>
                  <div className="flex flex-col gap-1 p-3.5">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[14px] font-semibold text-[var(--text)]">
                        {view.name}
                      </span>
                      {active && (
                        <span className="flex size-5 items-center justify-center rounded-full bg-[var(--accent)] text-[var(--on-accent)]">
                          <Check className="size-3 stroke-[2.5]" />
                        </span>
                      )}
                    </div>
                    <span className="text-[13px] leading-5 text-[var(--text-muted)]">
                      {view.description}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      <div className="flex flex-col gap-3">
        <h4 className="text-[14px] font-medium text-[var(--text)]">
          5 growth tiers
        </h4>
        <div className="grid gap-4 md:grid-cols-2">
          {STAGE_DEFINITIONS.map((stage) => {
            const isCurrent = currentStage.stage === stage.stage;
            const isUnlocked = stage.stage < currentStage.stage;
            const stageTitle = STAGE_LABELS[stage.stage] ?? stage.rank;

            return (
              <div
                key={stage.stage}
                className={cn(
                  "overflow-hidden rounded-[8px] border text-left",
                  isCurrent
                    ? "border-[var(--warm)] bg-[var(--warm-soft)]"
                    : "border-[var(--border)] bg-[var(--surface)]",
                  !isCurrent && !isUnlocked && "opacity-75"
                )}
              >
                <div className="border-b border-[var(--border)] bg-[#0d1117] p-2">
                  <CreatureAnimatedView
                    config={{
                      ...baseConfig,
                      commits: stage.sampleCommits,
                    }}
                    className="w-full"
                  />
                </div>
                <div className="flex items-start justify-between gap-3 p-3.5">
                  <div className="flex flex-col gap-0.5">
                    <span className="text-[14px] font-semibold text-[var(--text)]">
                      Stage {stage.stage}: {stageTitle}
                    </span>
                    <span className="text-[13px] leading-5 text-[var(--text-muted)]">
                      {stage.unlocks}
                    </span>
                  </div>
                  <div className="flex shrink-0 flex-col items-end gap-1">
                    <span
                      className={cn(
                        "inline-flex items-center rounded-full px-2 py-0.5 text-[12px] font-medium",
                        isCurrent
                          ? "bg-[var(--warm)] text-white"
                          : isUnlocked
                            ? "border border-[var(--border)] bg-[var(--surface-2)] text-[var(--text)]"
                            : "border border-[var(--border)] bg-[var(--surface)] text-[var(--text-muted)]"
                      )}
                    >
                      {isCurrent
                        ? "Current"
                        : isUnlocked
                          ? "Unlocked"
                          : "Locked"}
                    </span>
                    <span className="studio-mono text-[12px] text-[var(--text-muted)]">
                      {stage.rangeLabel}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
