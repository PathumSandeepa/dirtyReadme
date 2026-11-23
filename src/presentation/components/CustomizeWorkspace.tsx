"use client";

import { useRef, useState } from "react";
import { ArrowRight, CheckCircle2, X } from "lucide-react";
import type {
  BackgroundMode,
  CameraView,
  ContributionWindow,
  CreatureConfig,
  CreatureId,
  LanguageCount,
  WaterMode,
} from "@/domain/creature/entities";
import {
  type CustomImageMemoryAsset,
  type ReadmeBadge,
  type ReadmeConfig,
  type ReadmeTemplateId,
} from "@/domain/profile/entities";
import { PROFILE_EDITOR_TEMPLATES } from "@/domain/profile/markdownRichText";
import type { GitHubProfileSnapshot } from "@/infrastructure/github/githubClient";
import { StudioButton } from "../studio/ui/StudioButton";
import { StudioBottomSheet } from "../studio/ui/StudioDialog";
import { ImageStudioDialog } from "./ImageStudioDialog";
import {
  getNextPartId,
  getPartMeta,
  InspectorPanel,
} from "./customize/InspectorPanel";
import {
  LiveProfileCanvas,
  type LiveProfileCanvasHandle,
} from "./customize/LiveProfileCanvas";
import {
  ReadmeMapSidebar,
  ReadmeMapTopStrip,
} from "./customize/ReadmeMapSidebar";
import type { CustomizePartId } from "./customize/customizeTypes";
import { AboutInspector } from "./customize/inspectors/AboutInspector";
import { CreatureInspector } from "./customize/inspectors/CreatureInspector";
import { HeaderInspector } from "./customize/inspectors/HeaderInspector";
import { LinksInspector } from "./customize/inspectors/LinksInspector";
import { TechStackInspector } from "./customize/inspectors/TechStackInspector";

interface CustomizeWorkspaceProps {
  activePart: CustomizePartId;
  onChangePart: (part: CustomizePartId) => void;
  onContinueToPublish: () => void;
  creatureConfig: CreatureConfig;
  readmeConfig: ReadmeConfig;
  customBgHex: string;
  snapshot: GitHubProfileSnapshot | null;
  readmeMarkdown: string;
  customImages: Record<string, CustomImageMemoryAsset>;
  imageUrlMap: Record<string, string>;
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
  onRegisterCustomImage: (asset: CustomImageMemoryAsset) => void;
  onSetCustomBannerImage: (asset: CustomImageMemoryAsset) => void;
  onClearCustomBannerImage: () => void;
  onUpdateBannerAlt: (alt: string) => void;
  onSyncFromForm: () => void;
  onOpenAutoEvolve: () => void;
}

export function CustomizeWorkspace({
  activePart,
  onChangePart,
  onContinueToPublish,
  creatureConfig,
  readmeConfig,
  customBgHex,
  snapshot,
  readmeMarkdown,
  customImages,
  imageUrlMap,
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
  onRegisterCustomImage,
  onSetCustomBannerImage,
  onClearCustomBannerImage,
  onUpdateBannerAlt,
  onSyncFromForm,
  onOpenAutoEvolve,
}: CustomizeWorkspaceProps) {
  const canvasRef = useRef<LiveProfileCanvasHandle | null>(null);
  const [mapCollapsed, setMapCollapsed] = useState(false);
  const [githubTheme, setGithubTheme] = useState<"light" | "dark">("dark");
  const [selectedStackCardId, setSelectedStackCardId] = useState<string>(
    readmeConfig.stackCards[0]?.id ?? ""
  );
  const [mobileSheetOpen, setMobileSheetOpen] = useState(false);

  const [bannerDialogOpen, setBannerDialogOpen] = useState(false);
  const [bannerDialogStep, setBannerDialogStep] = useState<"input" | "crop">(
    "input"
  );

  const activeCustomBannerAsset =
    readmeConfig.customBannerImagePath &&
    customImages[readmeConfig.customBannerImagePath]
      ? customImages[readmeConfig.customBannerImagePath]
      : null;

  const handleSelectPart = (
    part: CustomizePartId,
    stackCardId?: string
  ) => {
    onChangePart(part);
    if (stackCardId) {
      setSelectedStackCardId(stackCardId);
    }
    canvasRef.current?.scrollToPart(part);
  };

  const handleAdvancePart = () => {
    const next = getNextPartId(activePart);
    if (next) {
      handleSelectPart(next);
    } else {
      setMobileSheetOpen(false);
      onContinueToPublish();
    }
  };

  const handleOpenBannerDialog = (step: "input" | "crop" = "input") => {
    setBannerDialogStep(step);
    setBannerDialogOpen(true);
  };

  const activeMeta = getPartMeta(activePart);

  const inspectorBody = (
    <>
      {activePart === "header" && (
        <HeaderInspector
          markdown={readmeConfig.advancedProfileMarkdown}
          onChangeMarkdown={(next) =>
            onUpdateReadmeField("advancedProfileMarkdown", next)
          }
          onSyncFromForm={onSyncFromForm}
        />
      )}

      {activePart === "about" && (
        <AboutInspector
          creatureConfig={creatureConfig}
          markdown={readmeConfig.advancedProfileMarkdown}
          templateCount={PROFILE_EDITOR_TEMPLATES.length}
          onInsertToken={(token) => canvasRef.current?.insertToken(token)}
          onInsertSnippet={(snippet) =>
            canvasRef.current?.insertSnippet(snippet)
          }
          onOpenTemplates={() => {
            setMobileSheetOpen(false);
            canvasRef.current?.openTemplates();
          }}
          onOpenImageStudio={() => {
            setMobileSheetOpen(false);
            canvasRef.current?.openEditorImageStudio();
          }}
          onClearIntro={() => onUpdateReadmeField("advancedProfileMarkdown", "")}
        />
      )}

      {activePart === "stack" && (
        <TechStackInspector
          readmeConfig={readmeConfig}
          selectedCardId={selectedStackCardId}
          onSelectCardId={setSelectedStackCardId}
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
      )}

      {activePart === "links" && (
        <LinksInspector
          creatureConfig={creatureConfig}
          readmeConfig={readmeConfig}
          onUpdateField={onUpdateReadmeField}
        />
      )}

      {activePart === "creature" && (
        <CreatureInspector
          creatureConfig={creatureConfig}
          readmeConfig={readmeConfig}
          customBgHex={customBgHex}
          snapshot={snapshot}
          activeCustomBannerAsset={activeCustomBannerAsset}
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
          onUpdateCreatureConfig={onUpdateCreatureConfig}
          onUpdateReadmeField={onUpdateReadmeField}
          onSelectTemplate={onSelectTemplate}
          onOpenBannerImageStudio={handleOpenBannerDialog}
          onRemoveBannerImage={onClearCustomBannerImage}
          onUpdateBannerAlt={onUpdateBannerAlt}
        />
      )}
    </>
  );

  return (
    <div className="mx-auto w-full max-w-[1860px] px-4 py-5 sm:px-6">
      {restoredNotice && (
        <div className="mb-4 flex items-center justify-between gap-3 rounded-[12px] bg-[var(--surface)] px-4 py-3 text-[13px] text-[var(--text)]">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="size-4 shrink-0 text-[var(--tide)]" />
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

      {/* Responsive (<1200px) Top Map Bar */}
      <ReadmeMapTopStrip
        activePart={activePart}
        onSelectPart={(part) => handleSelectPart(part)}
        onOpenInspectorSheet={() => setMobileSheetOpen(true)}
      />

      {/* Desktop Three-Zone Spatial Workspace */}
      <div className="flex min-w-0 items-start gap-5">
        <ReadmeMapSidebar
          activePart={activePart}
          collapsed={mapCollapsed}
          onToggleCollapsed={() => setMapCollapsed((c) => !c)}
          onSelectPart={(part) => handleSelectPart(part)}
          creatureConfig={creatureConfig}
          readmeConfig={readmeConfig}
          activeCustomBannerAsset={activeCustomBannerAsset}
        />

        <LiveProfileCanvas
          ref={canvasRef}
          activePart={activePart}
          selectedStackCardId={selectedStackCardId}
          onSelectPart={handleSelectPart}
          creatureConfig={creatureConfig}
          readmeConfig={readmeConfig}
          readmeMarkdown={readmeMarkdown}
          snapshot={snapshot}
          imageUrlMap={imageUrlMap}
          activeCustomBannerAsset={activeCustomBannerAsset}
          githubTheme={githubTheme}
          onGithubThemeChange={setGithubTheme}
          onUpdateReadmeField={onUpdateReadmeField}
          onChangeRawMarkdown={onChangeRawMarkdown}
          onAddStackCard={onAddStackCard}
          onToggleStackCardVisibility={onToggleStackCardVisibility}
          onReorderStackCards={onReorderStackCards}
          onSyncFromForm={onSyncFromForm}
          onRegisterCustomImage={onRegisterCustomImage}
          onSelectView={onSelectView}
          onOpenAutoEvolve={onOpenAutoEvolve}
        />

        <InspectorPanel
          activePart={activePart}
          onAdvancePart={handleAdvancePart}
        >
          {inspectorBody}
        </InspectorPanel>
      </div>

      {/* Responsive (<1200px) Bottom Sheet Inspector */}
      <StudioBottomSheet
        open={mobileSheetOpen}
        onOpenChange={setMobileSheetOpen}
        title={activeMeta.label}
        description={activeMeta.description}
        footer={
          <StudioButton
            variant="primary"
            className="w-full justify-between"
            onClick={handleAdvancePart}
          >
            <span>{activeMeta.nextLabel}</span>
            <ArrowRight />
          </StudioButton>
        }
      >
        {inspectorBody}
      </StudioBottomSheet>

      {/* Shared Custom Banner Image Studio Dialog */}
      <ImageStudioDialog
        open={bannerDialogOpen}
        onOpenChange={setBannerDialogOpen}
        mode="banner"
        username={creatureConfig.username}
        githubTheme={githubTheme}
        initialAsset={
          bannerDialogStep === "crop" ? activeCustomBannerAsset : null
        }
        initialStep={bannerDialogStep}
        onConfirmAsset={(asset) => {
          onSetCustomBannerImage(asset);
        }}
        onRemoveExisting={
          activeCustomBannerAsset
            ? () => {
                onClearCustomBannerImage();
              }
            : undefined
        }
      />
    </div>
  );
}
