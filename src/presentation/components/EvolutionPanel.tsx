"use client";

import React from "react";
import { Clock } from "lucide-react";
import {
  CAMERA_VIEWS,
  STAGE_DEFINITIONS,
  type CameraView,
  type CreatureConfig,
} from "@/domain/creature/entities";
import { CreatureSvgView } from "./CreatureSvgView";

interface EvolutionPanelProps {
  baseConfig: CreatureConfig;
  onSelectView: (view: CameraView) => void;
  onApplyCommits: (commits: number) => void;
}

export function EvolutionPanel({
  baseConfig,
  onSelectView,
  onApplyCommits,
}: EvolutionPanelProps) {
  return (
    <div className="space-y-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
      <div>
        <div className="flex items-center gap-2 text-base font-semibold text-slate-900 dark:text-zinc-100">
          <Clock className="h-5 w-5" />
          <h2>All 5 Evolution Stages & Camera Perspectives</h2>
        </div>
        <p className="mt-1 text-sm text-slate-600 dark:text-zinc-400">
          Click any stage or camera perspective below to apply it directly to your creature.
        </p>
      </div>

      <div>
        <h3 className="mb-3 text-sm font-semibold text-slate-800 dark:text-zinc-200">
          Camera Angles
        </h3>
        <div className="grid gap-4 md:grid-cols-3">
          {CAMERA_VIEWS.map((view) => {
            const active = baseConfig.view === view.id;
            return (
              <button
                key={view.id}
                type="button"
                onClick={() => onSelectView(view.id)}
                className={`overflow-hidden rounded-xl border text-left transition ${
                  active
                    ? "border-slate-900 ring-2 ring-slate-900/10 dark:border-zinc-100 dark:ring-zinc-100/20"
                    : "border-slate-200 hover:border-slate-400 dark:border-zinc-800 dark:hover:border-zinc-600"
                }`}
              >
                <div className="bg-[#0d1117] p-2">
                  <CreatureSvgView
                    config={{ ...baseConfig, view: view.id }}
                    className="w-full"
                  />
                </div>
                <div className="p-3">
                  <div className="text-sm font-semibold text-slate-900 dark:text-zinc-100">
                    {view.name}
                  </div>
                  <div className="text-xs text-slate-500 dark:text-zinc-400">
                    {view.description}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      <div>
        <h3 className="mb-3 text-sm font-semibold text-slate-800 dark:text-zinc-200">
          Evolution Progression (Commits → Armor & Feather Growth)
        </h3>
        <div className="grid gap-4 md:grid-cols-2">
          {STAGE_DEFINITIONS.map((stage) => {
            const active =
              baseConfig.commits >= stage.minCommits &&
              (stage.stage === 5 ||
                baseConfig.commits <
                  STAGE_DEFINITIONS[stage.stage].minCommits);
            return (
              <button
                key={stage.stage}
                type="button"
                onClick={() => onApplyCommits(stage.sampleCommits)}
                className={`overflow-hidden rounded-xl border text-left transition ${
                  active
                    ? "border-slate-900 ring-2 ring-slate-900/10 dark:border-zinc-100 dark:ring-zinc-100/20"
                    : "border-slate-200 hover:border-slate-400 dark:border-zinc-800 dark:hover:border-zinc-600"
                }`}
              >
                <div className="bg-[#0d1117] p-2">
                  <CreatureSvgView
                    config={{
                      ...baseConfig,
                      commits: stage.sampleCommits,
                    }}
                    className="w-full"
                  />
                </div>
                <div className="flex items-center justify-between p-3">
                  <div>
                    <div className="text-sm font-semibold text-slate-900 dark:text-zinc-100">
                      Stage {stage.stage}: {stage.rank}
                    </div>
                    <div className="text-xs text-slate-500 dark:text-zinc-400">
                      {stage.unlocks}
                    </div>
                  </div>
                  <span className="rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-700 dark:bg-zinc-800 dark:text-zinc-300">
                    {stage.rangeLabel}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
