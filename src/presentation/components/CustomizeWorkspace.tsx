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
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-white px-5 py-4 shadow-sm dark:border-[#363d4a] dark:bg-[#1e222a]">
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setActiveTab("creature")}
            className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold transition ${
              activeTab === "creature"
                ? "bg-indigo-600 text-white shadow-sm dark:bg-indigo-500"
                : "border border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100 dark:border-[#363d4a] dark:bg-[#272c36] dark:text-slate-200 dark:hover:bg-[#2f3642]"
            }`}
          >
            <Cpu className="h-4 w-4" />
            <span>1. Creature &amp; Style</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("readme")}
            className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold transition ${
              activeTab === "readme"
                ? "bg-indigo-600 text-white shadow-sm dark:bg-indigo-500"
                : "border border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100 dark:border-[#363d4a] dark:bg-[#272c36] dark:text-slate-200 dark:hover:bg-[#2f3642]"
            }`}
          >
            <FileText className="h-4 w-4" />
            <span>2. README Text &amp; Stack</span>
          </button>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={onBackToRepoGuide}
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-300 bg-white px-4 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-50 dark:border-[#363d4a] dark:bg-[#272c36] dark:text-slate-200 dark:hover:bg-[#2f3642]"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Repo Instructions
          </button>
          <button
            type="button"
            onClick={onNextToPublish}
            className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-400"
          >
            <span>Next: Connect Token &amp; Push</span>
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="grid items-start gap-7 lg:grid-cols-12">
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

        <div className="lg:sticky lg:top-24 lg:col-span-7">
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
