"use client";

import React from "react";
import { Clock } from "lucide-react";
import {
  CAMERA_VIEWS,
  STAGE_DEFINITIONS,
  type CameraView,
  type CreatureConfig,
} from "@/domain/creature/entities";
import { getCreatureMeta } from "@/domain/creature/services";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { CreatureAnimatedView } from "./CreatureAnimatedView";

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
  const meta = getCreatureMeta(baseConfig.creature);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Clock className="size-4 text-primary" />
          <CardTitle className="font-mono">
            All 5 Evolution Stages{meta.supportsViewSelection ? " & Views" : ""}
          </CardTitle>
        </div>
        <CardDescription>
          Click any stage{meta.supportsViewSelection ? " or camera angle" : ""} to apply
          it to your creature.
        </CardDescription>
      </CardHeader>

      <CardContent className="flex flex-col gap-6">
        {meta.supportsViewSelection && (
          <div className="flex flex-col gap-3">
            <h3 className="font-mono text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Camera Perspectives
            </h3>
            <div className="grid gap-4 md:grid-cols-2">
              {CAMERA_VIEWS.map((view) => {
                const active = baseConfig.view === view.id;
                return (
                  <button
                    key={view.id}
                    type="button"
                    onClick={() => onSelectView(view.id)}
                    className={`overflow-hidden rounded-lg border text-left transition ${
                      active
                        ? "border-primary ring-2 ring-primary/20"
                        : "hover:border-foreground/40"
                    }`}
                  >
                    <div className="bg-[#0d1117] p-2">
                      <CreatureAnimatedView
                        config={{ ...baseConfig, view: view.id }}
                        className="w-full"
                      />
                    </div>
                    <div className="flex flex-col gap-1 bg-muted/40 p-3">
                      <span className="font-mono text-sm font-semibold text-foreground">
                        {view.name}
                      </span>
                      <span className="text-xs text-muted-foreground">
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
          <h3 className="font-mono text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Evolution Tiers (Commits → Anatomy Growth)
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
                  className={`overflow-hidden rounded-lg border text-left transition ${
                    active
                      ? "border-primary ring-2 ring-primary/20"
                      : "hover:border-foreground/40"
                  }`}
                >
                  <div className="bg-[#0d1117] p-2">
                    <CreatureAnimatedView
                      config={{
                        ...baseConfig,
                        commits: stage.sampleCommits,
                      }}
                      className="w-full"
                    />
                  </div>
                  <div className="flex items-center justify-between gap-2 bg-muted/40 p-3">
                    <div className="flex flex-col gap-0.5">
                      <span className="font-mono text-sm font-semibold text-foreground">
                        Stage {stage.stage}: {stage.rank}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {stage.unlocks}
                      </span>
                    </div>
                    <Badge variant="outline" className="shrink-0 font-mono">
                      {stage.rangeLabel}
                    </Badge>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
