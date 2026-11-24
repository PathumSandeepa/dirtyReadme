"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { CheckCircle2, Layers, Sliders, Undo2, X } from "lucide-react";
import type { UndoToastState } from "@/application/useDraftHistory";
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
import type { GitHubProfileSnapshot } from "@/infrastructure/github/githubClient";
import { copyToClipboard } from "@/infrastructure/browser/downloadAdapter";
import { StudioButton } from "../studio/ui/StudioButton";
import { StudioBottomSheet } from "../studio/ui/StudioDialog";
import { ImageStudioDialog } from "./ImageStudioDialog";
import { FormatPanel, type FormatPanelState } from "./customize/FormatPanel";
import {
  getNextPartId,
  InspectorPanel,
  RightSidebarContent,
  type RightSidebarTab,
} from "./customize/InspectorPanel";
import {
  LiveProfileCanvas,
  type LiveProfileCanvasHandle,
} from "./customize/LiveProfileCanvas";
import { PagePanel } from "./customize/PagePanel";
import {
  LeftSidebarContent,
  ReadmeMapSidebar,
} from "./customize/ReadmeMapSidebar";
import type { CustomizePartId } from "./customize/customizeTypes";
import { AboutInspector } from "./customize/inspectors/AboutInspector";
import { CreatureInspector } from "./customize/inspectors/CreatureInspector";
import { HeaderInspector } from "./customize/inspectors/HeaderInspector";
import { LinksInspector } from "./customize/inspectors/LinksInspector";
import { TechStackInspector } from "./customize/inspectors/TechStackInspector";

const LEFT_COLLAPSED_KEY = "dirtyreadme-left-collapsed-v1";
const RIGHT_COLLAPSED_KEY = "dirtyreadme-right-collapsed-v1";

const DEFAULT_FORMAT_STATE: FormatPanelState = {
  hasEditor: false,
  headingLabel: "Normal",
  hasHeadingUnderline: false,
  bold: false,
  italic: false,
  underline: false,
  strike: false,
  code: false,
  alignLeft: false,
  alignCenter: false,
  alignRight: false,
  bulletList: false,
  orderedList: false,
  taskList: false,
  blockquote: false,
  codeBlock: false,
  inTable: false,
  hasLink: false,
  currentLinkHref: "",
};

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
  canUndo: boolean;
  canRedo: boolean;
  undoToast: UndoToastState | null;
  onUndo: () => void;
  onRedo: () => void;
  onClearAll: () => void;
  onShowUndoToast: (message: string) => void;
  onDismissUndoToast: () => void;
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
  canUndo,
  canRedo,
  undoToast,
  onUndo,
  onRedo,
  onClearAll,
  onShowUndoToast,
  onDismissUndoToast,
}: CustomizeWorkspaceProps) {
  const canvasRef = useRef<LiveProfileCanvasHandle | null>(null);
  const [leftCollapsed, setLeftCollapsed] = useState(false);
  const [rightCollapsed, setRightCollapsed] = useState(false);
  const [rightTab, setRightTab] = useState<RightSidebarTab>("part");
  const [githubTheme, setGithubTheme] = useState<"light" | "dark">("dark");
  const [selectedStackCardId, setSelectedStackCardId] = useState<string>(
    readmeConfig.stackCards[0]?.id ?? ""
  );
  const [leftDrawerOpen, setLeftDrawerOpen] = useState(false);
  const [rightDrawerOpen, setRightDrawerOpen] = useState(false);
  const [formatState, setFormatState] =
    useState<FormatPanelState>(DEFAULT_FORMAT_STATE);
  const [exportBusy, setExportBusy] = useState({ webp: false, gif: false });
  const [creatureCopied, setCreatureCopied] = useState(false);

  const [bannerDialogOpen, setBannerDialogOpen] = useState(false);
  const [bannerDialogStep, setBannerDialogStep] = useState<"input" | "crop">(
    "input"
  );

  // Restore sidebar collapse preferences from localStorage
  useEffect(() => {
    try {
      if (window.localStorage.getItem(LEFT_COLLAPSED_KEY) === "true") {
        queueMicrotask(() => setLeftCollapsed(true));
      }
      if (window.localStorage.getItem(RIGHT_COLLAPSED_KEY) === "true") {
        queueMicrotask(() => setRightCollapsed(true));
      }
    } catch {
      // Ignore storage errors
    }
  }, []);

  const toggleLeftCollapsed = useCallback(() => {
    setLeftCollapsed((prev) => {
      const next = !prev;
      try {
        window.localStorage.setItem(LEFT_COLLAPSED_KEY, String(next));
      } catch {
        // Ignore storage errors
      }
      return next;
    });
  }, []);

  const toggleRightCollapsed = useCallback(() => {
    setRightCollapsed((prev) => {
      const next = !prev;
      try {
        window.localStorage.setItem(RIGHT_COLLAPSED_KEY, String(next));
      } catch {
        // Ignore storage errors
      }
      return next;
    });
  }, []);

  // Keyboard shortcuts "[", "]" for sidebars and Ctrl/Cmd+Z, Ctrl/Cmd+Shift+Z, Ctrl+Y for unified history
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      const isPlainTextInput = Boolean(
        target &&
          (target.tagName === "INPUT" ||
            target.tagName === "TEXTAREA" ||
            target.tagName === "SELECT")
      );

      if ((event.metaKey || event.ctrlKey) && !isPlainTextInput) {
        const key = event.key.toLowerCase();
        if (key === "z" && !event.shiftKey) {
          event.preventDefault();
          onUndo();
          return;
        }
        if ((key === "z" && event.shiftKey) || (key === "y" && !event.shiftKey)) {
          event.preventDefault();
          onRedo();
          return;
        }
      }

      if (isPlainTextInput || target?.isContentEditable) {
        return;
      }
      if (event.key === "[") {
        event.preventDefault();
        toggleLeftCollapsed();
      } else if (event.key === "]") {
        event.preventDefault();
        toggleRightCollapsed();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onRedo, onUndo, toggleLeftCollapsed, toggleRightCollapsed]);

  // Auto-dismiss undo toast after 6 seconds
  useEffect(() => {
    if (!undoToast) return;
    const timer = window.setTimeout(() => {
      onDismissUndoToast();
    }, 6000);
    return () => window.clearTimeout(timer);
  }, [onDismissUndoToast, undoToast]);

  // Auto-dismiss restored notice after 5 seconds
  useEffect(() => {
    if (!restoredNotice || !onDismissRestoredNotice) return;
    const timer = window.setTimeout(() => {
      onDismissRestoredNotice();
    }, 5000);
    return () => window.clearTimeout(timer);
  }, [restoredNotice, onDismissRestoredNotice]);

  const activeCustomBannerAsset =
    readmeConfig.customBannerImagePath &&
    customImages[readmeConfig.customBannerImagePath]
      ? customImages[readmeConfig.customBannerImagePath]
      : null;

  const handleSelectPart = useCallback(
    (part: CustomizePartId, stackCardId?: string) => {
      onChangePart(part);
      setRightTab("part");
      if (stackCardId) {
        setSelectedStackCardId(stackCardId);
      }
      canvasRef.current?.scrollToPart(part);
    },
    [onChangePart]
  );

  const handleAdvancePart = () => {
    const next = getNextPartId(activePart);
    if (next) {
      handleSelectPart(next);
    } else {
      setRightDrawerOpen(false);
      onContinueToPublish();
    }
  };

  const handleOpenBannerDialog = (step: "input" | "crop" = "input") => {
    setBannerDialogStep(step);
    setBannerDialogOpen(true);
  };

  const handleCopyCreatureMarkdown = async () => {
    const safeUser = creatureConfig.username.trim() || "your-username";
    const src = readmeConfig.useOutputBranchUrl
      ? `https://raw.githubusercontent.com/${safeUser}/${safeUser}/output/creature.webp`
      : "./creature.webp";
    await copyToClipboard(
      `<img src="${src}" width="${readmeConfig.imageWidth}" alt="${creatureConfig.creature}" />`
    );
    setCreatureCopied(true);
    window.setTimeout(() => setCreatureCopied(false), 1600);
  };

  const partContent = (
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
          markdown={readmeConfig.advancedProfileMarkdown}
          onChangeMarkdown={(next) =>
            onUpdateReadmeField("advancedProfileMarkdown", next)
          }
          onInsertSnippet={(snippet) =>
            canvasRef.current?.insertSnippet(snippet)
          }
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
          onOpenBannerImageStudio={handleOpenBannerDialog}
          onRemoveBannerImage={onClearCustomBannerImage}
          onUpdateBannerAlt={onUpdateBannerAlt}
          onExportWebP={() => void canvasRef.current?.exportWebP()}
          onExportGif={() => void canvasRef.current?.exportGif()}
          onCopyCreatureImage={() => void handleCopyCreatureMarkdown()}
          webpBusy={exportBusy.webp}
          gifBusy={exportBusy.gif}
          creatureCopied={creatureCopied}
        />
      )}
    </>
  );

  const formatActions = {
    setParagraph: () => canvasRef.current?.getFormatActions().setParagraph(),
    toggleHeading: (level: 1 | 2 | 3 | 4) =>
      canvasRef.current?.getFormatActions().toggleHeading(level),
    toggleHeadingUnderline: () =>
      canvasRef.current?.getFormatActions().toggleHeadingUnderline(),
    toggleBold: () => canvasRef.current?.getFormatActions().toggleBold(),
    toggleItalic: () => canvasRef.current?.getFormatActions().toggleItalic(),
    toggleUnderline: () =>
      canvasRef.current?.getFormatActions().toggleUnderline(),
    toggleStrike: () => canvasRef.current?.getFormatActions().toggleStrike(),
    toggleCode: () => canvasRef.current?.getFormatActions().toggleCode(),
    clearFormatting: () =>
      canvasRef.current?.getFormatActions().clearFormatting(),
    setAlign: (align: "left" | "center" | "right") =>
      canvasRef.current?.getFormatActions().setAlign(align),
    toggleBulletList: () =>
      canvasRef.current?.getFormatActions().toggleBulletList(),
    toggleOrderedList: () =>
      canvasRef.current?.getFormatActions().toggleOrderedList(),
    toggleTaskList: () => canvasRef.current?.getFormatActions().toggleTaskList(),
    toggleBlockquote: () =>
      canvasRef.current?.getFormatActions().toggleBlockquote(),
    toggleCodeBlock: () =>
      canvasRef.current?.getFormatActions().toggleCodeBlock(),
    applyLink: (url: string) =>
      canvasRef.current?.getFormatActions().applyLink(url),
    removeLink: () => canvasRef.current?.getFormatActions().removeLink(),
    addTableRow: () => canvasRef.current?.getFormatActions().addTableRow(),
    deleteTableRow: () =>
      canvasRef.current?.getFormatActions().deleteTableRow(),
    addTableColumn: () =>
      canvasRef.current?.getFormatActions().addTableColumn(),
    deleteTableColumn: () =>
      canvasRef.current?.getFormatActions().deleteTableColumn(),
    deleteTable: () => canvasRef.current?.getFormatActions().deleteTable(),
  };

  const formatContent = (
    <FormatPanel state={formatState} actions={formatActions} />
  );

  const pageContent = (
    <PagePanel
      readmeConfig={readmeConfig}
      onUpdateReadmeField={onUpdateReadmeField}
      onSelectTemplate={onSelectTemplate}
    />
  );

  return (
    <div className="relative mx-auto flex w-full flex-col px-2 py-2 sm:px-3 min-[1280px]:h-[calc(100dvh-152px)] min-[1280px]:overflow-hidden">
      {/* Restore Toast (5s auto-dismiss) */}
      {restoredNotice && (
        <div
          role="status"
          aria-live="polite"
          className="fixed top-16 right-4 z-50 flex max-w-md items-center justify-between gap-3 rounded-[12px] bg-[var(--surface-2)] px-4 py-3 text-[13px] text-[var(--text)] shadow-[var(--shadow-float)]"
        >
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
              className="size-7 shrink-0"
            >
              <X />
            </StudioButton>
          )}
        </div>
      )}

      {/* Tablet (900px to 1279px) Top Drawer Triggers */}
      <div className="mb-3 hidden items-center justify-between gap-2 min-[900px]:flex min-[1280px]:hidden">
        <StudioButton
          variant="secondary"
          size="sm"
          onClick={() => setLeftDrawerOpen(true)}
        >
          <Layers />
          <span>Parts and blocks</span>
        </StudioButton>
        <StudioButton
          variant="secondary"
          size="sm"
          onClick={() => setRightDrawerOpen(true)}
        >
          <Sliders />
          <span>Settings</span>
        </StudioButton>
      </div>

      {/* Three-Column Workspace */}
      <div className="flex min-h-0 min-w-0 flex-1 items-stretch gap-2.5">
        <ReadmeMapSidebar
          activePart={activePart}
          collapsed={leftCollapsed}
          onToggleCollapsed={toggleLeftCollapsed}
          onSelectPart={(part) => handleSelectPart(part)}
          creatureConfig={creatureConfig}
          readmeConfig={readmeConfig}
          activeCustomBannerAsset={activeCustomBannerAsset}
          onInsertBlock={(action) => canvasRef.current?.insertBlock(action)}
          onInsertEmoji={(emoji) => canvasRef.current?.insertEmoji(emoji)}
          onInsertSnippet={(id) => canvasRef.current?.insertSnippetById(id)}
          onOpenTemplates={() => canvasRef.current?.openTemplates()}
          onInsertToken={(token) => canvasRef.current?.insertToken(token)}
        />

        <LiveProfileCanvas
          ref={canvasRef}
          activePart={activePart}
          selectedStackCardId={selectedStackCardId}
          onSelectPart={handleSelectPart}
          onEditorFocus={() => setRightTab("format")}
          onFormatStateChange={setFormatState}
          onExportBusyChange={setExportBusy}
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
          onDeleteStackCard={onDeleteStackCard}
          onReorderStackCards={onReorderStackCards}
          onAddBadgeToCard={onAddBadgeToCard}
          onRemoveBadgeFromCard={onRemoveBadgeFromCard}
          onMoveBadgeAcrossCards={onMoveBadgeAcrossCards}
          onAddCustomBadgeToCard={onAddCustomBadgeToCard}
          onSyncFromForm={onSyncFromForm}
          onRegisterCustomImage={onRegisterCustomImage}
          onSelectView={onSelectView}
          canUndo={canUndo}
          canRedo={canRedo}
          onUndo={onUndo}
          onRedo={onRedo}
          onClearAll={onClearAll}
          onShowUndoToast={onShowUndoToast}
          onFocusAddToReadme={() => {
            if (window.innerWidth < 1280) {
              setLeftDrawerOpen(true);
            } else {
              setLeftCollapsed(false);
              window.setTimeout(() => {
                document
                  .querySelector<HTMLElement>('[data-add-to-readme="true"]')
                  ?.focus();
              }, 50);
            }
          }}
        />

        <InspectorPanel
          collapsed={rightCollapsed}
          onToggleCollapsed={toggleRightCollapsed}
          activeTab={rightTab}
          onTabChange={setRightTab}
          activePart={activePart}
          onAdvancePart={handleAdvancePart}
          partContent={partContent}
          formatContent={formatContent}
          pageContent={pageContent}
        />
      </div>

      {/* Mobile (<900px) Bottom Bar for Drawers */}
      <div className="mt-3 flex items-center justify-between gap-2 rounded-[12px] bg-[var(--surface)] p-2 min-[900px]:hidden">
        <StudioButton
          variant="secondary"
          size="sm"
          className="flex-1"
          onClick={() => setLeftDrawerOpen(true)}
        >
          <Layers />
          <span>Parts and blocks</span>
        </StudioButton>
        <StudioButton
          variant="secondary"
          size="sm"
          className="flex-1"
          onClick={() => setRightDrawerOpen(true)}
        >
          <Sliders />
          <span>Settings</span>
        </StudioButton>
      </div>

      {/* Destructive Action Undo Toast (6s auto-dismiss) */}
      {undoToast && (
        <div
          role="status"
          aria-live="polite"
          className="fixed bottom-18 left-1/2 z-50 flex -translate-x-1/2 items-center gap-3 rounded-[12px] bg-[var(--surface-2)] px-4 py-2.5 text-[13px] text-[var(--text)] shadow-[var(--shadow-float)]"
        >
          <span>{undoToast.message}</span>
          <StudioButton
            variant="secondary"
            size="sm"
            onClick={onUndo}
            className="h-7 gap-1 px-2.5 text-[12px]"
          >
            <Undo2 className="size-3" />
            <span>Undo</span>
          </StudioButton>
          <StudioButton
            variant="ghost"
            size="icon"
            onClick={onDismissUndoToast}
            aria-label="Dismiss undo notice"
            className="size-7"
          >
            <X />
          </StudioButton>
        </div>
      )}

      {/* Left Drawer (<1280px) */}
      <StudioBottomSheet
        open={leftDrawerOpen}
        onOpenChange={setLeftDrawerOpen}
        title="Parts and blocks"
        description="Jump to a section, insert blocks, or browse templates."
      >
        <LeftSidebarContent
          activePart={activePart}
          onSelectPart={(part) => {
            handleSelectPart(part);
            setLeftDrawerOpen(false);
          }}
          creatureConfig={creatureConfig}
          readmeConfig={readmeConfig}
          activeCustomBannerAsset={activeCustomBannerAsset}
          onInsertBlock={(action) => {
            canvasRef.current?.insertBlock(action);
            setLeftDrawerOpen(false);
          }}
          onInsertEmoji={(emoji) => {
            canvasRef.current?.insertEmoji(emoji);
            setLeftDrawerOpen(false);
          }}
          onInsertSnippet={(id) => {
            canvasRef.current?.insertSnippetById(id);
            setLeftDrawerOpen(false);
          }}
          onOpenTemplates={() => {
            setLeftDrawerOpen(false);
            canvasRef.current?.openTemplates();
          }}
          onInsertToken={(token) => {
            canvasRef.current?.insertToken(token);
            setLeftDrawerOpen(false);
          }}
        />
      </StudioBottomSheet>

      {/* Right Drawer (<1280px) */}
      <StudioBottomSheet
        open={rightDrawerOpen}
        onOpenChange={setRightDrawerOpen}
        title="Settings"
        description="Edit part settings, text formatting, or page layout."
      >
        <RightSidebarContent
          activeTab={rightTab}
          onTabChange={setRightTab}
          activePart={activePart}
          onAdvancePart={handleAdvancePart}
          partContent={partContent}
          formatContent={formatContent}
          pageContent={pageContent}
        />
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
