"use client";

import { useState } from "react";
import { ArrowLeft, ArrowRight, CheckCircle2, Cpu, FileText, X } from "lucide-react";
import type {
  BackgroundMode,
  CameraView,
  ContributionWindow,
  CreatureConfig,
  CreatureId,
  LanguageCount,
  WaterMode,
} from "@/domain/creature/entities";
import type {
  ReadmeBadge,
  ReadmeConfig,
  ReadmeTemplateId,
} from "@/domain/profile/entities";
import {
  buildStructuredProfileMarkdown,
} from "@/domain/profile/readmeService";
import type { GitHubProfileSnapshot } from "@/infrastructure/github/githubClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AdvancedMarkdownEditor } from "./AdvancedMarkdownEditor";
import { CreatureStepPanel } from "./CreatureStepPanel";
import { PreviewWorkspace, type PreviewTab } from "./PreviewWorkspace";
import { ProfileReadmeStepPanel } from "./ProfileReadmeStepPanel";

type CustomizeTab = "creature" | "readme";

interface CustomizeWorkspaceProps {
  creatureConfig: CreatureConfig;
  readmeConfig: ReadmeConfig;
  customBgHex: string;
  snapshot: GitHubProfileSnapshot | null;
  readmeMarkdown: string;
  restoredNotice?: string | null;
  onDismissRestoredNotice?: () => void;
  onSelectCreature: (creature: CreatureId) => void;
  onSelectView: (view: CameraView) => void;
  onSelectWindow: (windowMode: ContributionWindow) => void;
  onApplyOriginalColors: () => void;
  onApplyAutoLanguageColors: () => void;
  onSetLanguageCount: (count: LanguageCount) => void;
  onUpdateLanguageColor: (index: number, hex: string) => void;
  onUpdateLanguageName: (index: number, name: string) => void;
  onResetLanguageColors: () => void;
  onSetWaterMode: (mode: WaterMode) => void;
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
  restoredNotice,
  onDismissRestoredNotice,
  onSelectCreature,
  onSelectView,
  onSelectWindow,
  onApplyOriginalColors,
  onApplyAutoLanguageColors,
  onSetLanguageCount,
  onUpdateLanguageColor,
  onUpdateLanguageName,
  onResetLanguageColors,
  onSetWaterMode,
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
  onOpenAutoEvolve,
  onBackToRepoGuide,
  onNextToPublish,
}: CustomizeWorkspaceProps) {
  const [activeTab, setActiveTab] = useState<CustomizeTab>("creature");
  const [previewTab, setPreviewTab] = useState<PreviewTab>("profile");

  const handleSwitchEditorTab = (tab: CustomizeTab) => {
    setActiveTab(tab);
    if (tab === "readme") {
      setPreviewTab("profile");
    }
  };

  return (
    <div className="flex flex-col gap-6">
      {restoredNotice && (
        <div className="flex items-center justify-between gap-3 rounded-xl border border-emerald-500/40 bg-emerald-500/10 px-4 py-2.5 text-xs text-foreground">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="size-4 shrink-0 text-emerald-500" />
            <span>{restoredNotice}</span>
          </div>
          {onDismissRestoredNotice && (
            <button
              type="button"
              onClick={onDismissRestoredNotice}
              aria-label="Dismiss restored notice"
              className="rounded p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
            >
              <X className="size-3.5" />
            </button>
          )}
        </div>
      )}

      <Card>
        <CardContent className="flex flex-wrap items-center justify-between gap-4 p-4">
          <Tabs
            value={activeTab}
            onValueChange={(val) => handleSwitchEditorTab(val as CustomizeTab)}
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

      {activeTab === "readme" && (
        <AdvancedMarkdownEditor
          value={readmeConfig.advancedProfileMarkdown}
          onChange={(next) =>
            onUpdateReadmeField("advancedProfileMarkdown", next)
          }
          creatureConfig={creatureConfig}
          onSyncFromForm={() =>
            onUpdateReadmeField(
              "advancedProfileMarkdown",
              buildStructuredProfileMarkdown(creatureConfig, readmeConfig)
            )
          }
        />
      )}

      <div className="grid items-start gap-6 lg:grid-cols-12">
        <div className="lg:col-span-5">
          {activeTab === "creature" ? (
            <CreatureStepPanel
              config={creatureConfig}
              customBgHex={customBgHex}
              snapshot={snapshot}
              onSelectCreature={onSelectCreature}
              onSelectView={onSelectView}
              onSelectWindow={onSelectWindow}
              onApplyOriginalColors={onApplyOriginalColors}
              onApplyAutoLanguageColors={onApplyAutoLanguageColors}
              onSetLanguageCount={onSetLanguageCount}
              onUpdateLanguageColor={onUpdateLanguageColor}
              onUpdateLanguageName={onUpdateLanguageName}
              onResetLanguageColors={onResetLanguageColors}
              onSetWaterMode={onSetWaterMode}
              onSetBackgroundMode={onSetBackgroundMode}
              onUpdateCustomBg={onUpdateCustomBg}
              onUpdateConfig={onUpdateCreatureConfig}
              onNextStep={() => handleSwitchEditorTab("readme")}
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
              onPrevStep={() => handleSwitchEditorTab("creature")}
              onNextStep={onNextToPublish}
            />
          )}
        </div>

        <div className="lg:sticky lg:top-20 lg:col-span-7 lg:max-h-[calc(100vh-6rem)] lg:overflow-y-auto lg:pr-1">
          <PreviewWorkspace
            editorTab={activeTab}
            previewTab={previewTab}
            onPreviewTabChange={setPreviewTab}
            creatureConfig={creatureConfig}
            readmeConfig={readmeConfig}
            readmeMarkdown={readmeMarkdown}
            snapshot={snapshot}
            onEditReadme={() => handleSwitchEditorTab("readme")}
            onOpenAutoEvolve={onOpenAutoEvolve}
            onSelectView={onSelectView}
          />
        </div>
      </div>
    </div>
  );
}
