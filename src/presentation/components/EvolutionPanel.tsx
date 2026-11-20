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
    <div className="space-y-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-[#363d4a] dark:bg-[#1e222a]">
      <div>
        <div className="flex items-center gap-2 text-base font-semibold text-slate-900 dark:text-slate-100">
          <Clock className="h-5 w-5 text-indigo-600 dark:text-indigo-300" />
          <h2>All 5 Evolution Stages &amp; Camera Perspectives</h2>
        </div>
        <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
          Click any stage or camera perspective below to apply it directly to your creature.
        </p>
      </div>

      <div>
        <h3 className="mb-3 text-sm font-semibold text-slate-800 dark:text-slate-200">
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
                    ? "border-indigo-600 ring-2 ring-indigo-600/20 dark:border-indigo-400"
                    : "border-slate-200 hover:border-slate-400 dark:border-[#363d4a] dark:hover:border-slate-500"
                }`}
              >
                <div className="bg-[#0d1117] p-2">
                  <CreatureSvgView
                    config={{ ...baseConfig, view: view.id }}
                    className="w-full"
                  />
                </div>
                <div className="p-3 dark:bg-[#272c36]">
                  <div className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                    {view.name}
                  </div>
                  <div className="text-xs text-slate-500 dark:text-slate-400">
                    {view.description}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      <div>
        <h3 className="mb-3 text-sm font-semibold text-slate-800 dark:text-slate-200">
          Evolution Progression (Commits → Armor &amp; Feather Growth)
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
                    ? "border-indigo-600 ring-2 ring-indigo-600/20 dark:border-indigo-400"
                    : "border-slate-200 hover:border-slate-400 dark:border-[#363d4a] dark:hover:border-slate-500"
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
                <div className="flex items-center justify-between p-3 dark:bg-[#272c36]">
                  <div>
                    <div className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                      Stage {stage.stage}: {stage.rank}
                    </div>
                    <div className="text-xs text-slate-500 dark:text-slate-400">
                      {stage.unlocks}
                    </div>
                  </div>
                  <span className="rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-700 dark:bg-[#1e222a] dark:text-slate-200">
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
