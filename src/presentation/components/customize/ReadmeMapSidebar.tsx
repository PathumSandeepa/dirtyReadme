"use client";

import {
  FileText,
  Heading,
  Layers,
  Link2,
  PanelLeftClose,
  PanelLeftOpen,
  Sliders,
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
import { extractHeaderFromMarkdown } from "@/domain/profile/headerSync";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { CUSTOMIZE_PARTS, type CustomizePartId } from "./customizeTypes";

interface ReadmeMapSidebarProps {
  activePart: CustomizePartId;
  collapsed: boolean;
  onToggleCollapsed: () => void;
  onSelectPart: (part: CustomizePartId) => void;
  creatureConfig: CreatureConfig;
  readmeConfig: ReadmeConfig;
  activeCustomBannerAsset?: CustomImageMemoryAsset | null;
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

function WireframeMiniMap({
  activePart,
  onSelectPart,
}: {
  activePart: CustomizePartId;
  onSelectPart: (part: CustomizePartId) => void;
}) {
  const bar = (part: CustomizePartId, heightClass: string, title: string) => {
    const active = activePart === part;
    return (
      <button
        type="button"
        onClick={() => onSelectPart(part)}
        title={`Jump to ${title}`}
        aria-label={`Select ${title} in wireframe`}
        className={cn(
          "w-full cursor-pointer rounded-[4px] transition-colors duration-150",
          heightClass,
          active
            ? "bg-[var(--surface-3)]"
            : "bg-[var(--surface-2)] hover:bg-[var(--surface-3)]/70"
        )}
      />
    );
  };

  return (
    <div className="flex flex-col gap-1.5 rounded-[12px] bg-[var(--surface)] p-3">
      <div className="text-[11px] font-medium text-[var(--text-3)]">
        Page order
      </div>
      <div className="flex flex-col gap-1.5">
        {bar("header", "h-2.5", "Header")}
        {bar("about", "h-4", "About")}
        {bar("stack", "h-3", "Tech stack")}
        {bar("links", "h-2", "Links")}
        {bar("creature", "h-6", "Creature")}
      </div>
    </div>
  );
}

/** Collapsible 240px desktop outline mapping the exact top to bottom order of the README. */
export function ReadmeMapSidebar({
  activePart,
  collapsed,
  onToggleCollapsed,
  onSelectPart,
  creatureConfig,
  readmeConfig,
  activeCustomBannerAsset,
}: ReadmeMapSidebarProps) {
  const statuses = getPartStatuses(creatureConfig, readmeConfig);
  const textParts = CUSTOMIZE_PARTS.filter((p) => p.group === "text-stack");
  const creatureParts = CUSTOMIZE_PARTS.filter((p) => p.group === "creature");

  const thumbUrl =
    readmeConfig.bannerSource === "custom-image" && activeCustomBannerAsset
      ? activeCustomBannerAsset.previewUrl
      : getSpriteAssetPath(
          creatureConfig.creature === "jellyfish" ? "jellyfish" : "tulkun-side"
        );

  return (
    <TooltipProvider delay={120}>
      <aside
        aria-label="README map"
        className={cn(
          "studio-no-scrollbar hidden shrink-0 transition-[width] duration-150 min-[1200px]:sticky min-[1200px]:top-[116px] min-[1200px]:flex min-[1200px]:max-h-[calc(100vh-188px)] min-[1200px]:flex-col min-[1200px]:gap-3 min-[1200px]:self-start min-[1200px]:overflow-y-auto",
          collapsed ? "w-[64px]" : "w-[240px]"
        )}
      >
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between gap-2 px-1">
            {!collapsed && (
              <span className="text-[13px] font-semibold tracking-[-0.01em] text-[var(--text)]">
                README map
              </span>
            )}
            <Tooltip>
              <TooltipTrigger
                render={
                  <button
                    type="button"
                    onClick={onToggleCollapsed}
                    aria-label={
                      collapsed ? "Expand README map" : "Collapse README map"
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
                {collapsed ? "Expand README map" : "Collapse README map"}
              </TooltipContent>
            </Tooltip>
          </div>

          {!collapsed && (
            <WireframeMiniMap
              activePart={activePart}
              onSelectPart={onSelectPart}
            />
          )}

          <div className="flex flex-col gap-3 rounded-[12px] bg-[var(--surface)] p-2">
            <div className="flex flex-col gap-1">
              {!collapsed && (
                <div className="px-2 pt-1 pb-0.5 text-[11px] font-medium text-[var(--text-3)]">
                  Text and stack
                </div>
              )}

              {textParts.map((part) => {
                const Icon = getPartIcon(part.id);
                const selected = activePart === part.id;
                const button = (
                  <button
                    key={part.id}
                    type="button"
                    aria-current={selected ? "location" : undefined}
                    onClick={() => onSelectPart(part.id)}
                    className={cn(
                      "flex w-full cursor-pointer items-center gap-2.5 rounded-[8px] px-2.5 py-2 text-left transition-colors duration-150",
                      collapsed && "justify-center px-0",
                      selected
                        ? "bg-[var(--surface-3)] text-[var(--text)]"
                        : "text-[var(--text-2)] hover:bg-[var(--surface-2)] hover:text-[var(--text)]"
                    )}
                  >
                    <Icon className="size-4 shrink-0" />
                    {!collapsed && (
                      <div className="flex min-w-0 flex-1 flex-col">
                        <span className="truncate text-[13px] font-medium">
                          {part.label}
                        </span>
                        <span className="truncate text-[12px] text-[var(--text-2)] tabular-nums">
                          {statuses[part.id]}
                        </span>
                      </div>
                    )}
                  </button>
                );

                if (!collapsed) return button;
                return (
                  <Tooltip key={part.id}>
                    <TooltipTrigger render={button} />
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

            <div className="flex flex-col gap-1">
              {!collapsed && (
                <div className="px-2 pt-1 pb-0.5 text-[11px] font-medium text-[var(--text-3)]">
                  Creature
                </div>
              )}

              {creatureParts.map((part) => {
                const selected = activePart === part.id;
                const button = (
                  <button
                    key={part.id}
                    type="button"
                    aria-current={selected ? "location" : undefined}
                    onClick={() => onSelectPart(part.id)}
                    className={cn(
                      "flex w-full cursor-pointer items-center gap-2.5 rounded-[8px] px-2.5 py-2 text-left transition-colors duration-150",
                      collapsed && "justify-center px-0",
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
                    {!collapsed && (
                      <div className="flex min-w-0 flex-1 flex-col">
                        <span className="truncate text-[13px] font-medium">
                          {part.label}
                        </span>
                        <span className="truncate text-[12px] text-[var(--text-2)] tabular-nums">
                          {statuses[part.id]}
                        </span>
                      </div>
                    )}
                  </button>
                );

                if (!collapsed) return button;
                return (
                  <Tooltip key={part.id}>
                    <TooltipTrigger render={button} />
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
          </div>
        </div>
      </aside>
    </TooltipProvider>
  );
}

/** Compact top selector strip shown below 1200px to pick sections and open the bottom sheet inspector. */
export function ReadmeMapTopStrip({
  activePart,
  onSelectPart,
  onOpenInspectorSheet,
}: {
  activePart: CustomizePartId;
  onSelectPart: (part: CustomizePartId) => void;
  onOpenInspectorSheet: () => void;
}) {
  return (
    <div className="mb-4 flex items-center justify-between gap-2 min-[1200px]:hidden">
      <div
        role="tablist"
        aria-label="README map"
        className="studio-no-scrollbar flex min-w-0 flex-1 items-center gap-1 overflow-x-auto rounded-[8px] bg-[var(--surface)] p-1"
      >
        {CUSTOMIZE_PARTS.map((part) => {
          const Icon = getPartIcon(part.id);
          const selected = activePart === part.id;
          return (
            <button
              key={part.id}
              type="button"
              role="tab"
              aria-selected={selected}
              onClick={() => onSelectPart(part.id)}
              className={cn(
                "inline-flex h-8 shrink-0 cursor-pointer items-center gap-1.5 rounded-[6px] px-2.5 text-[13px] font-medium whitespace-nowrap transition-colors duration-150",
                selected
                  ? "bg-[var(--surface-3)] text-[var(--text)]"
                  : "text-[var(--text-2)] hover:text-[var(--text)]"
              )}
            >
              <Icon className="size-3.5 shrink-0" />
              <span>{part.label}</span>
            </button>
          );
        })}
      </div>

      <button
        type="button"
        onClick={onOpenInspectorSheet}
        className="inline-flex h-10 shrink-0 cursor-pointer items-center gap-1.5 rounded-[8px] bg-[var(--primary)] px-3 text-[13px] font-medium text-[var(--on-primary)] transition-colors duration-150 hover:bg-[var(--primary-hover)]"
      >
        <Sliders className="size-3.5" />
        <span>Inspector</span>
      </button>
    </div>
  );
}
