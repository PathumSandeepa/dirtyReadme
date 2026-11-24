"use client";

import { useEffect, useState } from "react";
import {
  ChevronDown,
  FileText,
  Heading,
  Layers,
  LayoutTemplate,
  Link2,
  PanelLeftClose,
  PanelLeftOpen,
  Sparkles,
} from "lucide-react";
import { cn } from "cn";
import type { CreatureConfig } from "@/domain/creature/entities";
import {
  getCreatureMeta,
  getEvolutionStage,
  getSpriteAssetPath,
} from "@/domain/creature/services";
import type {
  CustomImageMemoryAsset,
  ReadmeConfig,
} from "@/domain/profile/entities";
import { PROFILE_EDITOR_TEMPLATES } from "@/domain/profile/markdownRichText";
import { extractHeaderFromMarkdown } from "@/domain/profile/headerSync";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { DynamicValuesList } from "./DynamicValuesList";
import { InsertPalette, type InsertBlockAction } from "./InsertPalette";
import { CUSTOMIZE_PARTS, type CustomizePartId } from "./customizeTypes";

const OPEN_SECTIONS_STORAGE_KEY = "dirtyreadme-left-sections-v1";

type CollapsibleSectionId = "add" | "dynamic";

interface ReadmeMapSidebarProps {
  activePart: CustomizePartId;
  collapsed: boolean;
  onToggleCollapsed: () => void;
  onSelectPart: (part: CustomizePartId) => void;
  creatureConfig: CreatureConfig;
  readmeConfig: ReadmeConfig;
  activeCustomBannerAsset?: CustomImageMemoryAsset | null;
  onInsertBlock: (action: InsertBlockAction) => void;
  onInsertEmoji: (emoji: string) => void;
  onInsertSnippet: (snippetId: "status" | "roadmap" | "visitors") => void;
  onOpenTemplates: () => void;
  onInsertToken: (token: string) => void;
}

function getPartIcon(id: CustomizePartId) {
  switch (id) {
    case "header":
      return Heading;
    case "about":
      return FileText;
    case "stack":
      return Layers;
    case "links":
      return Link2;
    case "creature":
      return Sparkles;
  }
}

function getPartStatuses(
  creatureConfig: CreatureConfig,
  readmeConfig: ReadmeConfig
): Record<CustomizePartId, string> {
  const headerState = extractHeaderFromMarkdown(
    readmeConfig.advancedProfileMarkdown
  );
  const alignWord =
    headerState.align === "center"
      ? "Centered"
      : headerState.align === "right"
        ? "Right aligned"
        : "Left aligned";

  const trimmedIntro = readmeConfig.advancedProfileMarkdown.trim();
  const wordCount = trimmedIntro ? trimmedIntro.split(/\s+/).length : 0;

  const badgeCount = readmeConfig.stackCards
    .filter((c) => c.visible !== false)
    .reduce((sum, c) => sum + c.badgeIds.length, 0);

  const linkCount = readmeConfig.actionLinks.filter((l) => l.enabled).length;

  let creatureStatus: string;
  if (readmeConfig.bannerSource === "custom-image") {
    creatureStatus = readmeConfig.customBannerImagePath
      ? "Custom WebP banner"
      : "Choose custom image";
  } else {
    const meta = getCreatureMeta(creatureConfig.creature);
    const shortName = meta.id === "jellyfish" ? "Jellyfish" : "Tulkun";
    if (creatureConfig.windowMode === "all-time") {
      creatureStatus = `${shortName}, all time`;
    } else {
      const stage = getEvolutionStage(creatureConfig.commits);
      creatureStatus = `${shortName}, stage ${stage.stage}`;
    }
  }

  return {
    header: headerState.title ? alignWord : "Add a title",
    about: `${wordCount} words`,
    stack: `${badgeCount} badges`,
    links:
      readmeConfig.showLinksRow === false
        ? "Hidden"
        : `${linkCount} links`,
    creature:
      readmeConfig.showCreatureBanner === false ? "Hidden" : creatureStatus,
  };
}

export function LeftSidebarContent({
  activePart,
  collapsed = false,
  onSelectPart,
  creatureConfig,
  readmeConfig,
  activeCustomBannerAsset,
  onInsertBlock,
  onInsertEmoji,
  onInsertSnippet,
  onOpenTemplates,
  onInsertToken,
}: Omit<ReadmeMapSidebarProps, "collapsed" | "onToggleCollapsed"> & {
  collapsed?: boolean;
}) {
  const [openSections, setOpenSections] = useState<
    Record<CollapsibleSectionId, boolean>
  >({
    add: true,
    dynamic: false,
  });

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(OPEN_SECTIONS_STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as Partial<
          Record<CollapsibleSectionId, boolean>
        >;
        queueMicrotask(() => {
          setOpenSections((prev) => ({ ...prev, ...parsed }));
        });
      }
    } catch {
      // Ignore storage errors
    }
  }, []);

  const toggleSection = (id: CollapsibleSectionId) => {
    setOpenSections((prev) => {
      const next = { ...prev, [id]: !prev[id] };
      try {
        window.localStorage.setItem(
          OPEN_SECTIONS_STORAGE_KEY,
          JSON.stringify(next)
        );
      } catch {
        // Ignore storage errors
      }
      return next;
    });
  };

  const statuses = getPartStatuses(creatureConfig, readmeConfig);
  const textParts = CUSTOMIZE_PARTS.filter((p) => p.group === "text-stack");
  const creatureParts = CUSTOMIZE_PARTS.filter((p) => p.group === "creature");

  const thumbUrl =
    readmeConfig.bannerSource === "custom-image" && activeCustomBannerAsset
      ? activeCustomBannerAsset.previewUrl
      : getSpriteAssetPath(
          creatureConfig.creature === "jellyfish" ? "jellyfish" : "tulkun-side"
        );

  if (collapsed) {
    return (
      <div className="flex flex-col gap-1.5 rounded-[12px] bg-[var(--surface)] p-1.5">
        {CUSTOMIZE_PARTS.map((part) => {
          const Icon = getPartIcon(part.id);
          const selected = activePart === part.id;
          return (
            <Tooltip key={part.id}>
              <TooltipTrigger
                render={
                  <button
                    type="button"
                    aria-label={part.label}
                    aria-current={selected ? "location" : undefined}
                    onClick={() => onSelectPart(part.id)}
                    className={cn(
                      "flex size-10 w-full cursor-pointer items-center justify-center rounded-[8px] transition-colors duration-150",
                      selected
                        ? "bg-[var(--surface-3)] text-[var(--text)]"
                        : "text-[var(--text-2)] hover:bg-[var(--surface-2)] hover:text-[var(--text)]"
                    )}
                  />
                }
              >
                <Icon className="size-4" />
              </TooltipTrigger>
              <TooltipContent
                data-app="studio"
                side="right"
                className="border-0 bg-[var(--text)] text-[var(--bg)] shadow-[var(--shadow-float)]"
              >
                {part.label} ({statuses[part.id]})
              </TooltipContent>
            </Tooltip>
          );
        })}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {/* 1. README parts (always open) */}
      <div className="flex flex-col gap-2 rounded-[12px] bg-[var(--surface)] p-2.5">
        <div className="px-1.5 py-1 text-[12px] font-semibold text-[var(--text)]">
          README parts
        </div>

        <div className="flex flex-col gap-1">
          <div className="px-1.5 pt-0.5 text-[11px] font-medium text-[var(--text-3)]">
            Text and stack
          </div>
          {textParts.map((part) => {
            const Icon = getPartIcon(part.id);
            const selected = activePart === part.id;
            return (
              <button
                key={part.id}
                type="button"
                aria-current={selected ? "location" : undefined}
                onClick={() => onSelectPart(part.id)}
                className={cn(
                  "flex w-full cursor-pointer items-center gap-2.5 rounded-[8px] px-2.5 py-2 text-left transition-colors duration-150",
                  selected
                    ? "bg-[var(--surface-3)] text-[var(--text)]"
                    : "text-[var(--text-2)] hover:bg-[var(--surface-2)] hover:text-[var(--text)]"
                )}
              >
                <Icon className="size-4 shrink-0" />
                <div className="flex min-w-0 flex-1 flex-col">
                  <span className="truncate text-[13px] font-medium">
                    {part.label}
                  </span>
                  <span className="truncate text-[11px] text-[var(--text-2)] tabular-nums">
                    {statuses[part.id]}
                  </span>
                </div>
              </button>
            );
          })}
        </div>

        <div className="flex flex-col gap-1">
          <div className="px-1.5 pt-0.5 text-[11px] font-medium text-[var(--text-3)]">
            Creature
          </div>
          {creatureParts.map((part) => {
            const selected = activePart === part.id;
            return (
              <button
                key={part.id}
                type="button"
                aria-current={selected ? "location" : undefined}
                onClick={() => onSelectPart(part.id)}
                className={cn(
                  "flex w-full cursor-pointer items-center gap-2.5 rounded-[8px] px-2.5 py-2 text-left transition-colors duration-150",
                  selected
                    ? "bg-[var(--surface-3)] text-[var(--text)]"
                    : "text-[var(--text-2)] hover:bg-[var(--surface-2)] hover:text-[var(--text)]"
                )}
              >
                <span className="flex size-7 shrink-0 items-center justify-center overflow-hidden rounded-[6px] bg-[#0D1117]">
                  <img
                    src={thumbUrl}
                    alt=""
                    className={cn(
                      "size-full object-contain",
                      readmeConfig.bannerSource === "custom-image" &&
                        activeCustomBannerAsset
                        ? "object-cover"
                        : "p-0.5"
                    )}
                    style={{
                      imageRendering:
                        readmeConfig.bannerSource === "custom-image"
                          ? "auto"
                          : "pixelated",
                    }}
                  />
                </span>
                <div className="flex min-w-0 flex-1 flex-col">
                  <span className="truncate text-[13px] font-medium">
                    {part.label}
                  </span>
                  <span className="truncate text-[11px] text-[var(--text-2)] tabular-nums">
                    {statuses[part.id]}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. Add to README (collapsible) */}
      <div className="overflow-hidden rounded-[12px] bg-[var(--surface)]">
        <button
          type="button"
          data-add-to-readme="true"
          aria-expanded={openSections.add}
          onClick={() => toggleSection("add")}
          className="flex w-full cursor-pointer items-center justify-between bg-[var(--surface-2)] px-3.5 py-2.5 text-left text-[12px] font-semibold text-[var(--text)] transition-colors hover:bg-[var(--surface-3)]"
        >
          <span>Add to README</span>
          <ChevronDown
            className={cn(
              "size-4 text-[var(--text-2)] transition-transform duration-150",
              openSections.add && "rotate-180"
            )}
          />
        </button>
        {openSections.add && (
          <div className="p-3">
            <InsertPalette
              onInsertBlock={onInsertBlock}
              onInsertEmoji={onInsertEmoji}
              onInsertSnippet={onInsertSnippet}
            />
          </div>
        )}
      </div>

      {/* 3. Templates (direct button opening modal) */}
      <button
        type="button"
        onClick={onOpenTemplates}
        className="flex w-full cursor-pointer items-center justify-between rounded-[12px] bg-[var(--surface)] px-3.5 py-2.5 text-left text-[12px] font-semibold text-[var(--text)] transition-colors hover:bg-[var(--surface-2)]"
      >
        <span className="flex items-center gap-2">
          <LayoutTemplate className="size-4 text-[var(--text-2)]" />
          <span>Templates</span>
        </span>
        <span className="rounded-[6px] bg-[var(--surface-2)] px-2 py-0.5 text-[11px] font-medium text-[var(--text-2)]">
          {PROFILE_EDITOR_TEMPLATES.length}
        </span>
      </button>

      {/* 4. Dynamic values (collapsible) */}
      <div className="overflow-hidden rounded-[12px] bg-[var(--surface)]">
        <button
          type="button"
          aria-expanded={openSections.dynamic}
          onClick={() => toggleSection("dynamic")}
          className="flex w-full cursor-pointer items-center justify-between bg-[var(--surface-2)] px-3.5 py-2.5 text-left text-[12px] font-semibold text-[var(--text)] transition-colors hover:bg-[var(--surface-3)]"
        >
          <span>Dynamic values</span>
          <ChevronDown
            className={cn(
              "size-4 text-[var(--text-2)] transition-transform duration-150",
              openSections.dynamic && "rotate-180"
            )}
          />
        </button>
        {openSections.dynamic && (
          <div className="p-3">
            <DynamicValuesList
              creatureConfig={creatureConfig}
              onInsertToken={onInsertToken}
            />
          </div>
        )}
      </div>
    </div>
  );
}

/** Collapsible 288px desktop left sidebar (56px icon rail when collapsed, shortcut "["). */
export function ReadmeMapSidebar({
  collapsed,
  onToggleCollapsed,
  ...rest
}: ReadmeMapSidebarProps) {
  return (
    <TooltipProvider delay={120}>
      <aside
        aria-label="Parts and blocks"
        className={cn(
          "studio-no-scrollbar hidden h-full shrink-0 flex-col gap-2.5 overflow-y-auto transition-[width] duration-150 min-[1280px]:flex",
          collapsed
            ? "w-[56px]"
            : "w-[330px] min-[1536px]:w-[390px] min-[1760px]:w-[440px]"
        )}
      >
        <div className="flex items-center justify-between gap-2 px-1">
          {!collapsed && (
            <span className="text-[12px] font-semibold tracking-[-0.01em] text-[var(--text-2)]">
              Parts and blocks
            </span>
          )}
          <Tooltip>
            <TooltipTrigger
              render={
                <button
                  type="button"
                  onClick={onToggleCollapsed}
                  aria-label={
                    collapsed ? "Expand left sidebar" : "Collapse left sidebar"
                  }
                  className="ml-auto flex size-8 cursor-pointer items-center justify-center rounded-[8px] bg-[var(--surface)] text-[var(--text-2)] transition-colors duration-150 hover:bg-[var(--surface-2)] hover:text-[var(--text)]"
                />
              }
            >
              {collapsed ? (
                <PanelLeftOpen className="size-4" />
              ) : (
                <PanelLeftClose className="size-4" />
              )}
            </TooltipTrigger>
            <TooltipContent
              data-app="studio"
              className="border-0 bg-[var(--text)] text-[var(--bg)] shadow-[var(--shadow-float)]"
            >
              {collapsed ? "Expand sidebar ([)" : "Collapse sidebar ([)"}
            </TooltipContent>
          </Tooltip>
        </div>

        <LeftSidebarContent collapsed={collapsed} {...rest} />
      </aside>
    </TooltipProvider>
  );
}
