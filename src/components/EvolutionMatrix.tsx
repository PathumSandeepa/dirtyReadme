"use client";

import { Camera, Layers } from "lucide-react";
import { CyberCreatureSvg } from "@/components/CyberCreatureSvg";
import {
  CAMERA_VIEWS,
  STAGE_DEFINITIONS,
  getCreatureMeta,
  getEvolutionStage,
} from "@/lib/themes";
import type { CameraView, CreatureConfig } from "@/types/creature";

interface EvolutionMatrixProps {
  config: CreatureConfig;
  onSelectCommits: (commits: number) => void;
  onSelectView: (view: CameraView) => void;
}

export function EvolutionMatrix({
  config,
  onSelectCommits,
  onSelectView,
}: EvolutionMatrixProps) {
  const currentStage = getEvolutionStage(config.commits);
  const meta = getCreatureMeta(config.creature);

  return (
    <div className="space-y-8">
      <section className="rounded-lg border border-zinc-800 bg-zinc-950 p-5">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
          <div>
            <h2 className="flex items-center gap-2 text-base font-semibold text-zinc-50">
              <Camera className="h-4 w-4 text-zinc-400" />
              Camera Perspectives ({meta.name})
            </h2>
            <p className="text-xs text-zinc-400">
              Click any perspective to apply it to your live Studio export.
            </p>
          </div>
          <span className="rounded-md border border-zinc-800 bg-zinc-900 px-3 py-1 font-mono text-[11px] text-zinc-200">
            ACTIVE: {config.view.toUpperCase()}
          </span>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {CAMERA_VIEWS.map((viewItem) => {
            const active = config.view === viewItem.id;
            return (
              <button
                key={viewItem.id}
                type="button"
                onClick={() => onSelectView(viewItem.id)}
                className={`flex flex-col rounded-lg border p-3.5 text-left transition ${
                  active
                    ? "border-zinc-50 bg-zinc-900"
                    : "border-zinc-800 bg-zinc-950 hover:border-zinc-700"
                }`}
              >
                <div className="mb-2 flex w-full items-center justify-between">
                  <span className="font-mono text-xs font-semibold text-zinc-50">
                    view: {viewItem.id}
                  </span>
                  <span className="text-[11px] text-zinc-400">
                    {viewItem.name}
                  </span>
                </div>
                <div className="w-full overflow-hidden rounded-md border border-zinc-800 bg-[#0d1117] p-1">
                  <CyberCreatureSvg
                    config={{ ...config, view: viewItem.id, showHud: false }}
                    className="h-auto w-full"
                  />
                </div>
                <p className="mt-2.5 text-xs leading-relaxed text-zinc-400">
                  {viewItem.description}
                </p>
              </button>
            );
          })}
        </div>
      </section>

      <section className="rounded-lg border border-zinc-800 bg-zinc-950 p-5">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
          <div>
            <h2 className="flex items-center gap-2 text-base font-semibold text-zinc-50">
              <Layers className="h-4 w-4 text-zinc-400" />
              Evolution Stages (0 → 2,500+ Contributions)
            </h2>
            <p className="text-xs text-zinc-400">
              Your cybernetic creature physically scales in wingspan, feather
              count, armor plating, and tail cables as your commits grow.
            </p>
          </div>
          <span className="rounded-md border border-zinc-800 bg-zinc-900 px-3 py-1 font-mono text-[11px] text-zinc-200">
            CURRENT: STAGE {currentStage.stage} ({currentStage.rank})
          </span>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {STAGE_DEFINITIONS.map((st) => {
            const active = currentStage.stage === st.stage;
            return (
              <button
                key={st.stage}
                type="button"
                onClick={() => onSelectCommits(st.sampleCommits)}
                className={`flex flex-col rounded-lg border p-3.5 text-left transition ${
                  active
                    ? "border-zinc-50 bg-zinc-900"
                    : "border-zinc-800 bg-zinc-950 hover:border-zinc-700"
                }`}
              >
                <div className="mb-2 flex w-full items-center justify-between">
                  <span className="font-mono text-xs font-semibold text-zinc-50">
                    Stage {st.stage}: {st.rank}
                  </span>
                  <span className="rounded border border-zinc-800 bg-zinc-900 px-2 py-0.5 font-mono text-[10px] text-zinc-400">
                    {st.rangeLabel} commits
                  </span>
                </div>
                <div className="w-full overflow-hidden rounded-md border border-zinc-800 bg-[#0d1117] p-1">
                  <CyberCreatureSvg
                    config={{
                      ...config,
                      commits: st.sampleCommits,
                      customTitle: "",
                      showHud: true,
                    }}
                    className="h-auto w-full"
                  />
                </div>
                <p className="mt-2.5 text-xs leading-relaxed text-zinc-400">
                  {st.unlocks}
                </p>
              </button>
            );
          })}
        </div>
      </section>
    </div>
  );
}
