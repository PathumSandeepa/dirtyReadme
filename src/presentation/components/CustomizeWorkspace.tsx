"use client";

import { useState } from "react";
import { CheckCircle2, Eye, Sliders, X } from "lucide-react";
import { cn } from "cn";
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
import type { GitHubProfileSnapshot } from "@/infrastructure/github/githubClient";
import type { CustomizeSubTab } from "../studio/layout/StudioStepper";
import { type ReadmeZoomMode } from "../studio/ui/ScaledReadmeViewport";
import { StudioButton } from "../studio/ui/StudioButton";
import { StudioDrawer } from "../studio/ui/StudioDialog";
import { StudioSegmentedControl } from "../studio/ui/StudioSegmentedControl";
import { CreatureStepPanel } from "./CreatureStepPanel";
import {
  PreviewWorkspace,
  type PreviewRegion,
  type PreviewScrollRequest,
  type PreviewTab,
} from "./PreviewWorkspace";
import { ProfileReadmeStepPanel } from "./ProfileReadmeStepPanel";

interface CustomizeWorkspaceProps {
  activeTab: CustomizeSubTab;
  onChangeTab: (tab: CustomizeSubTab) => void;
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
  onToggleStackCardVisibility: (cardId: string, visible: boolean) => void;
  onDeleteStackCard: (cardId: string) => void;
  onReorderStackCards: (fromIdx: number, toIdx: number) => void;
  onCombineStackCards: () => void;
  onUndoCombineStackCards: () => void;
  onAddCustomBadgeToCard: (
    cardId: string,
    badge: Omit<ReadmeBadge, "enabled">
  ) => void;
  onOpenAutoEvolve: () => void;
}

export function CustomizeWorkspace({
  activeTab,
  onChangeTab,
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
  onToggleStackCardVisibility,
  onDeleteStackCard,
  onReorderStackCards,
  onCombineStackCards,
  onUndoCombineStackCards,
  onAddCustomBadgeToCard,
  onOpenAutoEvolve,
}: CustomizeWorkspaceProps) {
  const [previewTab, setPreviewTab] = useState<PreviewTab>("profile");
  const [githubTheme, setGithubTheme] = useState<"light" | "dark">("dark");
  const [zoomMode, setZoomMode] = useState<ReadmeZoomMode>("fit");
  const [followEdits, setFollowEdits] = useState(true);
  const [mobilePane, setMobilePane] = useState<"edit" | "preview">("edit");
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);

  const [editorFitZoom, setEditorFitZoom] = useState(1);
  const [previewFitZoom, setPreviewFitZoom] = useState(1);
  const sharedFitZoom = Math.min(editorFitZoom, previewFitZoom);

  const [scrollRequest, setScrollRequest] =
    useState<PreviewScrollRequest | null>(null);

  const triggerPreviewScroll = (
    region: PreviewRegion,
    forceScroll: boolean
  ) => {
    setScrollRequest((prev) => ({
      region,
      seq: (prev?.seq ?? 0) + 1,
      forceScroll,
    }));
  };

  const handleEditReadme = () => {
    setMobilePane("edit");
    onChangeTab("readme");
  };

  const previewNode = (
    <PreviewWorkspace
      editorTab={activeTab}
      previewTab={previewTab}
      onPreviewTabChange={setPreviewTab}
      creatureConfig={creatureConfig}
      readmeConfig={readmeConfig}
      readmeMarkdown={readmeMarkdown}
      snapshot={snapshot}
      githubTheme={githubTheme}
      onGithubThemeChange={setGithubTheme}
      zoomMode={zoomMode}
      onZoomModeChange={setZoomMode}
      sharedFitZoom={activeTab === "readme" ? sharedFitZoom : undefined}
      onMeasureFitZoom={setPreviewFitZoom}
      followEdits={followEdits}
      onFollowEditsChange={setFollowEdits}
      scrollRequest={scrollRequest}
      onEditReadme={handleEditReadme}
      onOpenAutoEvolve={onOpenAutoEvolve}
      onSelectView={onSelectView}
    />
  );

  return (
    <div
      className={cn(
        "mx-auto w-full px-4 py-6 sm:px-6",
        activeTab === "readme"
          ? "max-w-[1784px] min-[1800px]:px-0"
          : "max-w-[1784px]"
      )}
    >
      {restoredNotice && (
        <div className="mb-5 flex items-center justify-between gap-3 rounded-[8px] border border-[var(--border)] bg-[var(--surface)] px-4 py-3 text-[13px] text-[var(--text)]">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="size-4 shrink-0 text-[var(--accent)]" />
            <span>{restoredNotice}</span>
          </div>
          {onDismissRestoredNotice && (
            <StudioButton
              variant="ghost"
              size="icon"
              onClick={onDismissRestoredNotice}
              aria-label="Dismiss notice"
            >
              <X />
            </StudioButton>
          )}
        </div>
      )}

      {/* Below 1200px: Edit | Live preview toggle */}
      <div className="mb-5 min-[1200px]:hidden">
        <StudioSegmentedControl<"edit" | "preview">
          ariaLabel="Mobile pane switch"
          value={mobilePane}
          onChange={setMobilePane}
          options={[
            { value: "edit", label: "Edit", icon: <Sliders /> },
            { value: "preview", label: "Live preview", icon: <Eye /> },
          ]}
        />
      </div>

      {/* Screen A: 1. Creature & Style */}
      {activeTab === "creature" ? (
        <div className="flex flex-col gap-6 min-[1200px]:flex-row min-[1200px]:items-start">
          <div
            className={cn(
              "min-w-0 min-[1200px]:w-[clamp(440px,36vw,560px)] min-[1200px]:shrink-0",
              mobilePane === "preview"
                ? "hidden min-[1200px]:block"
                : "block"
            )}
          >
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
            />
          </div>

          <div
            className={cn(
              "min-w-0 flex-1 min-[1200px]:sticky min-[1200px]:top-[120px] min-[1200px]:max-h-[calc(100vh-192px)] min-[1200px]:overflow-y-auto",
              mobilePane === "edit"
                ? "hidden min-[1200px]:block"
                : "block"
            )}
          >
            {previewNode}
          </div>
        </div>
      ) : (
        /* Screen B: 2. README Text & Stack */
        <div className="grid items-start gap-6 min-[1200px]:grid-cols-2 min-[1800px]:grid-cols-[882px_882px] min-[1800px]:justify-center">
          <div
            className={cn(
              "flex min-w-0 flex-col gap-2",
              mobilePane === "preview"
                ? "hidden min-[1200px]:flex"
                : "flex"
            )}
          >
            <span className="text-[13px] font-medium text-[var(--text-muted)]">
              Editing
            </span>
            <ProfileReadmeStepPanel
              creatureConfig={creatureConfig}
              readmeConfig={readmeConfig}
              githubTheme={githubTheme}
              zoomMode={zoomMode}
              sharedFitZoom={sharedFitZoom}
              onMeasureFitZoom={setEditorFitZoom}
              onSectionFocus={(region) => triggerPreviewScroll(region, true)}
              onFieldEdited={(region) => triggerPreviewScroll(region, false)}
              onUpdateField={onUpdateReadmeField}
              onSelectTemplate={onSelectTemplate}
              onChangeRawMarkdown={onChangeRawMarkdown}
              onAddBadgeToCard={onAddBadgeToCard}
              onRemoveBadgeFromCard={onRemoveBadgeFromCard}
              onMoveBadgeAcrossCards={onMoveBadgeAcrossCards}
              onAddStackCard={onAddStackCard}
              onRenameStackCard={onRenameStackCard}
              onToggleStackCardVisibility={onToggleStackCardVisibility}
              onDeleteStackCard={onDeleteStackCard}
              onReorderStackCards={onReorderStackCards}
              onCombineStackCards={onCombineStackCards}
              onUndoCombineStackCards={onUndoCombineStackCards}
              onAddCustomBadgeToCard={onAddCustomBadgeToCard}
            />
          </div>

          <div
            className={cn(
              "flex min-w-0 flex-col gap-2 min-[1200px]:sticky min-[1200px]:top-[120px] min-[1200px]:max-h-[calc(100vh-192px)] min-[1200px]:overflow-y-auto",
              mobilePane === "edit"
                ? "hidden min-[1200px]:flex"
                : "flex"
            )}
          >
            <span className="text-[13px] font-medium text-[var(--text-muted)]">
              Live preview (read-only)
            </span>
            {previewNode}
          </div>
        </div>
      )}

      {/* Below 1200px: Floating Live preview drawer button */}
      {mobilePane === "edit" && !mobileDrawerOpen && (
        <div className="fixed right-4 bottom-[76px] z-20 min-[1200px]:hidden">
          <StudioButton
            variant="primary"
            onClick={() => setMobileDrawerOpen(true)}
            className="shadow-[var(--studio-shadow-overlay)]"
          >
            <Eye />
            <span>Live preview</span>
          </StudioButton>
        </div>
      )}

      <StudioDrawer
        open={mobileDrawerOpen}
        onOpenChange={setMobileDrawerOpen}
        title="Live preview"
      >
        {previewNode}
      </StudioDrawer>
    </div>
  );
}
