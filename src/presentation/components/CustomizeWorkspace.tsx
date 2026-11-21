"use client";

import { useState } from "react";
import { ArrowLeft, ArrowRight, Cpu, FileText } from "lucide-react";
import type {
  BackgroundMode,
  CameraView,
  CreatureConfig,
  CreatureId,
  THEME_PRESETS,
} from "@/domain/creature/entities";
import type { ReadmeConfig } from "@/domain/profile/entities";
import type { GitHubProfileSnapshot } from "@/infrastructure/github/githubClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CreatureStepPanel } from "./CreatureStepPanel";
import { PreviewWorkspace } from "./PreviewWorkspace";
import { ProfileReadmeStepPanel } from "./ProfileReadmeStepPanel";

type CustomizeTab = "creature" | "readme";

interface CustomizeWorkspaceProps {
  creatureConfig: CreatureConfig;
  readmeConfig: ReadmeConfig;
  customBgHex: string;
  snapshot: GitHubProfileSnapshot | null;
  creatureSvg: string;
  shareCardSvg: string;
  readmeMarkdown: string;
  onSelectCreature: (creature: CreatureId) => void;
  onSelectView: (view: CameraView) => void;
  onApplyPreset: (id: (typeof THEME_PRESETS)[number]["id"]) => void;
  onUpdateColor: (key: "primary" | "accent" | "energy", hex: string) => void;
  onSetBackgroundMode: (mode: BackgroundMode) => void;
  onUpdateCustomBg: (hex: string) => void;
  onUpdateCreatureConfig: (
    updater: (prev: CreatureConfig) => CreatureConfig
  ) => void;
  onUpdateReadmeField: <K extends keyof ReadmeConfig>(
    key: K,
    value: ReadmeConfig[K]
  ) => void;
  onChangeRawMarkdown: (raw: string | null) => void;
  onReorderBadges: (draggedId: string, targetId: string) => void;
  onMoveBadge: (badgeId: string, direction: -1 | 1) => void;
  onReorderTags: (fromIdx: number, toIdx: number) => void;
  onOpenAutoEvolve: () => void;
  onBackToRepoGuide: () => void;
  onNextToPublish: () => void;
}

export function CustomizeWorkspace({
  creatureConfig,
  readmeConfig,
  customBgHex,
  snapshot,
  creatureSvg,
  shareCardSvg,
  readmeMarkdown,
  onSelectCreature,
  onSelectView,
  onApplyPreset,
  onUpdateColor,
  onSetBackgroundMode,
  onUpdateCustomBg,
  onUpdateCreatureConfig,
  onUpdateReadmeField,
  onChangeRawMarkdown,
  onReorderBadges,
  onMoveBadge,
  onReorderTags,
  onOpenAutoEvolve,
  onBackToRepoGuide,
  onNextToPublish,
}: CustomizeWorkspaceProps) {
  const [activeTab, setActiveTab] = useState<CustomizeTab>("creature");

  return (
    <div className="flex flex-col gap-6">
      <Card>
        <CardContent className="flex flex-wrap items-center justify-between gap-4 p-4">
          <Tabs
            value={activeTab}
            onValueChange={(val) => setActiveTab(val as CustomizeTab)}
          >
            <TabsList>
              <TabsTrigger value="creature" className="gap-2 font-mono text-xs">
                <Cpu className="size-3.5" />
                1. Creature &amp; Style
              </TabsTrigger>
              <TabsTrigger value="readme" className="gap-2 font-mono text-xs">
                <FileText className="size-3.5" />
                2. README Text &amp; Stack
              </TabsTrigger>
            </TabsList>
          </Tabs>

          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onBackToRepoGuide}
            >
              <ArrowLeft data-icon="inline-start" />
              Repo Guide
            </Button>
            <Button type="button" size="sm" onClick={onNextToPublish}>
              Next: Token &amp; Push
              <ArrowRight data-icon="inline-end" />
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="grid items-start gap-6 lg:grid-cols-12">
        <div className="lg:col-span-5">
          {activeTab === "creature" ? (
            <CreatureStepPanel
              config={creatureConfig}
              customBgHex={customBgHex}
              onSelectCreature={onSelectCreature}
              onSelectView={onSelectView}
              onApplyPreset={onApplyPreset}
              onUpdateColor={onUpdateColor}
              onSetBackgroundMode={onSetBackgroundMode}
              onUpdateCustomBg={onUpdateCustomBg}
              onUpdateConfig={onUpdateCreatureConfig}
              onNextStep={() => setActiveTab("readme")}
            />
          ) : (
            <ProfileReadmeStepPanel
              creatureConfig={creatureConfig}
              readmeConfig={readmeConfig}
              onUpdateField={onUpdateReadmeField}
              onChangeRawMarkdown={onChangeRawMarkdown}
              onReorderBadges={onReorderBadges}
              onMoveBadge={onMoveBadge}
              onReorderTags={onReorderTags}
              onPrevStep={() => setActiveTab("creature")}
              onNextStep={onNextToPublish}
            />
          )}
        </div>

        <div className="lg:sticky lg:top-20 lg:col-span-7">
          <PreviewWorkspace
            creatureConfig={creatureConfig}
            readmeConfig={readmeConfig}
            creatureSvg={creatureSvg}
            shareCardSvg={shareCardSvg}
            readmeMarkdown={readmeMarkdown}
            snapshot={snapshot}
            onEditReadme={() => setActiveTab("readme")}
            onOpenAutoEvolve={onOpenAutoEvolve}
            onSelectView={onSelectView}
            onApplyCommits={(commits) =>
              onUpdateCreatureConfig((prev) => ({ ...prev, commits }))
            }
          />
        </div>
      </div>
    </div>
  );
}
