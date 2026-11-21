"use client";

import { useState } from "react";
import { ArrowLeft, ArrowRight, Cpu, FileText } from "lucide-react";
import type {
  BackgroundMode,
  CameraView,
  CreatureConfig,
  CreatureId,
  LanguageCount,
} from "@/domain/creature/entities";
import type {
  ReadmeBadge,
  ReadmeConfig,
  ReadmeTemplateId,
} from "@/domain/profile/entities";
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
  readmeMarkdown: string;
  onSelectCreature: (creature: CreatureId) => void;
  onSelectView: (view: CameraView) => void;
  onApplyOriginalColors: () => void;
  onApplyAutoLanguageColors: () => void;
  onSetLanguageCount: (count: LanguageCount) => void;
  onUpdateLanguageColor: (index: number, hex: string) => void;
  onUpdateLanguageName: (index: number, name: string) => void;
  onResetLanguageColors: () => void;
  onSetInWater: (inWater: boolean) => void;
  onSetBackgroundMode: (mode: BackgroundMode) => void;
  onUpdateCustomBg: (hex: string) => void;
  onUpdateCreatureConfig: (
    updater: (prev: CreatureConfig) => CreatureConfig
  ) => void;
  onUpdateReadmeField: <K extends keyof ReadmeConfig>(
    key: K,
    value: ReadmeConfig[K]
  ) => void;
  onSelectTemplate: (templateId: ReadmeTemplateId) => void;
  onChangeRawMarkdown: (raw: string | null) => void;
  onAddBadgeToCard: (
    cardId: string,
    badgeId: string,
    beforeBadgeId?: string
  ) => void;
  onRemoveBadgeFromCard: (cardId: string, badgeId: string) => void;
  onMoveBadgeAcrossCards: (
    badgeId: string,
    fromCardId: string,
    toCardId: string,
    targetBadgeId?: string
  ) => void;
  onAddStackCard: (title?: string) => string;
  onRenameStackCard: (cardId: string, title: string) => void;
  onDeleteStackCard: (cardId: string) => void;
  onReorderStackCards: (fromIdx: number, toIdx: number) => void;
  onCombineStackCards: () => void;
  onUndoCombineStackCards: () => void;
  onAddCustomBadgeToCard: (
    cardId: string,
    badge: Omit<ReadmeBadge, "enabled">
  ) => void;
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
  readmeMarkdown,
  onSelectCreature,
  onSelectView,
  onApplyOriginalColors,
  onApplyAutoLanguageColors,
  onSetLanguageCount,
  onUpdateLanguageColor,
  onUpdateLanguageName,
  onResetLanguageColors,
  onSetInWater,
  onSetBackgroundMode,
  onUpdateCustomBg,
  onUpdateCreatureConfig,
  onUpdateReadmeField,
  onSelectTemplate,
  onChangeRawMarkdown,
  onAddBadgeToCard,
  onRemoveBadgeFromCard,
  onMoveBadgeAcrossCards,
  onAddStackCard,
  onRenameStackCard,
  onDeleteStackCard,
  onReorderStackCards,
  onCombineStackCards,
  onUndoCombineStackCards,
  onAddCustomBadgeToCard,
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
              onApplyOriginalColors={onApplyOriginalColors}
              onApplyAutoLanguageColors={onApplyAutoLanguageColors}
              onSetLanguageCount={onSetLanguageCount}
              onUpdateLanguageColor={onUpdateLanguageColor}
              onUpdateLanguageName={onUpdateLanguageName}
              onResetLanguageColors={onResetLanguageColors}
              onSetInWater={onSetInWater}
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
              onSelectTemplate={onSelectTemplate}
              onChangeRawMarkdown={onChangeRawMarkdown}
              onAddBadgeToCard={onAddBadgeToCard}
              onRemoveBadgeFromCard={onRemoveBadgeFromCard}
              onMoveBadgeAcrossCards={onMoveBadgeAcrossCards}
              onAddStackCard={onAddStackCard}
              onRenameStackCard={onRenameStackCard}
              onDeleteStackCard={onDeleteStackCard}
              onReorderStackCards={onReorderStackCards}
              onCombineStackCards={onCombineStackCards}
              onUndoCombineStackCards={onUndoCombineStackCards}
              onAddCustomBadgeToCard={onAddCustomBadgeToCard}
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
