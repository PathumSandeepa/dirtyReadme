"use client";

import { useEffect, useRef, useState } from "react";
import {
  Building2,
  Check,
  Clock,
  Copy,
  Download,
  Edit3,
  Link2,
  MapPin,
  Moon,
  PanelLeft,
  Sun,
} from "lucide-react";
import { cn } from "cn";
import type { CameraView, CreatureConfig } from "@/domain/creature/entities";
import {
  derivePalette,
  getCreatureMeta,
  getEvolutionStage,
  getSpriteKey,
  getViewDisplayLabel,
  getVisibleLanguages,
  resolveWaterMode,
} from "@/domain/creature/services";
import type { ReadmeBadge, ReadmeConfig } from "@/domain/profile/entities";
import {
  buildActionLinkBadgeUrl,
  buildShieldBadgeUrl,
  resolveDynamicTokens,
} from "@/domain/profile/readmeService";
import {
  copyToClipboard,
  downloadBlobFile,
} from "@/infrastructure/browser/downloadAdapter";
import { loadCreatureSprite } from "@/infrastructure/browser/spriteLoader";
import {
  encodeAnimatedGifFromCreature,
  encodeAnimatedWebPFromCreature,
  exportShareCardPngBlob,
} from "@/infrastructure/browser/webpEncoder";
import type { GitHubProfileSnapshot } from "@/infrastructure/github/githubClient";
import { Switch } from "@/components/ui/switch";
import { useDebouncedValue } from "../studio/hooks/useDebouncedValue";
import {
  ScaledReadmeViewport,
  type ReadmeZoomMode,
} from "../studio/ui/ScaledReadmeViewport";
import { StudioButton } from "../studio/ui/StudioButton";
import { StudioSegmentedControl } from "../studio/ui/StudioSegmentedControl";
import { CreatureAnimatedView } from "./CreatureAnimatedView";
import { EvolutionPanel } from "./EvolutionPanel";
import { AdvancedMarkdownPreview } from "./MarkdownPreviewRenderer";
import { ShareCardCanvasView } from "./ShareCardCanvasView";

export type PreviewTab = "creature" | "profile" | "share-card" | "stages";
export type PreviewRegion =
  | "header"
  | "stack"
  | "links"
  | "creature"
  | "telemetry"
  | "share-card"
  | "raw";

type CodeSubTab = "visual" | "markdown";

export interface PreviewScrollRequest {
  region: PreviewRegion;
  seq: number;
  forceScroll?: boolean;
}

interface PreviewWorkspaceProps {
  editorTab: "creature" | "readme";
  previewTab: PreviewTab;
  onPreviewTabChange: (tab: PreviewTab) => void;
  creatureConfig: CreatureConfig;
  readmeConfig: ReadmeConfig;
  readmeMarkdown: string;
  snapshot: GitHubProfileSnapshot | null;
  githubTheme: "light" | "dark";
  onGithubThemeChange: (theme: "light" | "dark") => void;
  zoomMode: ReadmeZoomMode;
  onZoomModeChange: (mode: ReadmeZoomMode) => void;
  sharedFitZoom?: number;
  onMeasureFitZoom?: (zoom: number) => void;
  followEdits?: boolean;
  onFollowEditsChange?: (follow: boolean) => void;
  scrollRequest?: PreviewScrollRequest | null;
  onEditReadme: () => void;
  onOpenAutoEvolve: () => void;
  onSelectView: (view: CameraView) => void;
}

export function PreviewWorkspace({
  editorTab,
  previewTab,
  onPreviewTabChange,
  creatureConfig,
  readmeConfig,
  readmeMarkdown,
  snapshot,
  githubTheme,
  onGithubThemeChange,
  zoomMode,
  onZoomModeChange,
  sharedFitZoom,
  onMeasureFitZoom,
  followEdits = true,
  onFollowEditsChange,
  scrollRequest,
  onEditReadme,
  onOpenAutoEvolve,
  onSelectView,
}: PreviewWorkspaceProps) {
  const [codeSubTab, setCodeSubTab] = useState<CodeSubTab>("visual");
  const [showSidebar, setShowSidebar] = useState(false);
  const [localFitZoom, setLocalFitZoom] = useState(1);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [webpBusy, setWebpBusy] = useState(false);
  const [gifBusy, setGifBusy] = useState(false);
  const [shareBusy, setShareBusy] = useState(false);
  const [flashedRegion, setFlashedRegion] = useState<PreviewRegion | null>(
    null
  );

  const previewSurfaceRef = useRef<HTMLDivElement | null>(null);

  const debouncedMarkdown = useDebouncedValue(readmeMarkdown, 100);
  const debouncedIntroMarkdown = useDebouncedValue(
    readmeConfig.advancedProfileMarkdown,
    100
  );
  const debouncedRawOverride = useDebouncedValue(
    readmeConfig.rawOverride,
    100
  );

  const activePreviewTab: PreviewTab =
    editorTab === "readme" ? "profile" : previewTab;

  useEffect(() => {
    if (!scrollRequest) return;
    if (!scrollRequest.forceScroll && !followEdits) return;
    const container = previewSurfaceRef.current;
    if (!container) return;

    const targetRegion: PreviewRegion =
      container.querySelector<HTMLElement>(
        `[data-preview-section="${scrollRequest.region}"]`
      )
        ? scrollRequest.region
        : "creature";

    const target = container.querySelector<HTMLElement>(
      `[data-preview-section="${targetRegion}"]`
    );
    if (!target) return;

    target.scrollIntoView({ behavior: "smooth", block: "nearest" });
    setFlashedRegion(targetRegion);
    const timer = window.setTimeout(() => {
      setFlashedRegion((curr) => (curr === targetRegion ? null : curr));
    }, 600);

    return () => window.clearTimeout(timer);
  }, [scrollRequest, followEdits]);

  const stage = getEvolutionStage(creatureConfig.commits);
  const meta = getCreatureMeta(creatureConfig.creature);
  const viewLabel = getViewDisplayLabel(
    creatureConfig.creature,
    creatureConfig.view
  );
  const viewShort =
    creatureConfig.creature === "jellyfish"
      ? "Pelagic"
      : creatureConfig.view === "top"
        ? "Top"
        : "Side";
  const waterMode = resolveWaterMode(creatureConfig);
  const waterStatusLabel =
    waterMode === "water"
      ? "In water"
      : waterMode === "no-water"
        ? "No water"
        : "Clear background";
  const visibleLanguages = getVisibleLanguages(creatureConfig);
  const username = creatureConfig.username.trim() || "your-username";
  const badgeById = new Map(readmeConfig.badges.map((b) => [b.id, b]));
  const enabledLinks = readmeConfig.actionLinks.filter(
    (l) => l.enabled && l.label.trim()
  );

  const derived = derivePalette(creatureConfig);
  const displayName = snapshot?.displayName || username;
  const statusBio = snapshot?.bio || "";
  const location = snapshot?.location || "";
  const company = snapshot?.company || "";
  const website = snapshot?.website || "";

  const handleCopy = async (id: string, content: string) => {
    await copyToClipboard(content);
    setCopiedId(id);
    window.setTimeout(() => {
      setCopiedId((curr) => (curr === id ? null : curr));
    }, 1800);
  };

  const handleExportWebP = async () => {
    setWebpBusy(true);
    try {
      const sprite = await loadCreatureSprite(
        getSpriteKey(creatureConfig.creature, creatureConfig.view)
      );
      const blob = await encodeAnimatedWebPFromCreature(creatureConfig, sprite);
      downloadBlobFile("creature.webp", blob);
    } finally {
      setWebpBusy(false);
    }
  };

  const handleExportGif = async () => {
    setGifBusy(true);
    try {
      const sprite = await loadCreatureSprite(
        getSpriteKey(creatureConfig.creature, creatureConfig.view)
      );
      const blob = await encodeAnimatedGifFromCreature(creatureConfig, sprite);
      downloadBlobFile("creature.gif", blob);
    } finally {
      setGifBusy(false);
    }
  };

  const handleExportShareCardPng = async () => {
    setShareBusy(true);
    try {
      const sprite = await loadCreatureSprite(
        getSpriteKey(creatureConfig.creature, creatureConfig.view)
      );
      const blob = await exportShareCardPngBlob(creatureConfig, sprite);
      downloadBlobFile("share-card.png", blob);
    } finally {
      setShareBusy(false);
    }
  };

  const isMinimal = readmeConfig.templateId === "minimal-header";
  const isMarkerOnly = readmeConfig.templateId === "auto-evolve-block";
  const isAlignedLeft = readmeConfig.align === "left";
  const bannerWidthPx = Math.min(
    848,
    Math.max(320, readmeConfig.imageWidth || 760)
  );
  const intrinsicWidth = showSidebar ? 1200 : 880;
  const effectiveFitZoom =
    !showSidebar && editorTab === "readme" && sharedFitZoom !== undefined
      ? sharedFitZoom
      : localFitZoom;
  const zoomPct = Math.round(effectiveFitZoom * 100);

  return (
    <div
      className={cn(
        "flex flex-col gap-4 rounded-[8px] border border-[var(--border)] bg-[var(--surface)]",
        editorTab === "readme"
          ? "p-4 sm:p-5 min-[1800px]:px-0 min-[1800px]:pb-0"
          : "p-4 sm:p-5"
      )}
    >
      {/* Row 1: Preview Title + Export Actions */}
      <div
        className={cn(
          "flex flex-wrap items-center justify-between gap-3 border-b border-[var(--border)] pb-4",
          editorTab === "readme" && "min-[1800px]:px-5"
        )}
      >
        <div className="flex flex-col gap-0.5">
          <h2 className="text-[16px] leading-6 font-semibold text-[var(--text)]">
            Live preview
          </h2>
          <p className="text-[13px] leading-5 text-[var(--text-muted)]">
            {meta.name} · Stage {stage.stage} · {viewShort} ·{" "}
            {waterStatusLabel}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <StudioButton
            variant="secondary"
            size="sm"
            disabled={webpBusy}
            onClick={handleExportWebP}
          >
            <Download />
            <span>{webpBusy ? "Exporting WebP..." : "Download WebP"}</span>
          </StudioButton>

          <StudioButton
            variant="secondary"
            size="sm"
            disabled={gifBusy}
            onClick={handleExportGif}
          >
            <Download />
            <span>{gifBusy ? "Exporting GIF..." : "Download GIF"}</span>
          </StudioButton>

          <StudioButton
            variant="secondary"
            size="sm"
            onClick={() => handleCopy("readme", readmeMarkdown)}
          >
            {copiedId === "readme" ? <Check /> : <Copy />}
            <span>{copiedId === "readme" ? "Copied" : "Copy"}</span>
          </StudioButton>

          <StudioButton
            variant="secondary"
            size="sm"
            onClick={onOpenAutoEvolve}
          >
            <Clock />
            <span>12 AM Action</span>
          </StudioButton>
        </div>
      </div>

      {/* Row 2: Tabs / README Toolbar */}
      <div
        className={cn(
          "flex flex-wrap items-center justify-between gap-2.5",
          editorTab === "readme" && "min-[1800px]:px-5"
        )}
      >
        {editorTab === "creature" ? (
          <div className="w-full sm:w-auto sm:min-w-[340px]">
            <StudioSegmentedControl<PreviewTab>
              ariaLabel="Preview mode"
              size="sm"
              value={activePreviewTab}
              onChange={onPreviewTabChange}
              options={[
                { value: "creature", label: "Creature" },
                { value: "profile", label: "README" },
                { value: "share-card", label: "Social card" },
                { value: "stages", label: "Stages" },
              ]}
            />
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <Switch
              id="follow-edits-switch"
              size="sm"
              checked={followEdits}
              onCheckedChange={(checked) =>
                onFollowEditsChange?.(Boolean(checked))
              }
            />
            <label
              htmlFor="follow-edits-switch"
              className="cursor-pointer text-[13px] font-medium text-[var(--text)]"
            >
              Follow my edits
            </label>
          </div>
        )}

        {activePreviewTab === "profile" && (
          <div className="flex flex-wrap items-center gap-2">
            <div className="w-40">
              <StudioSegmentedControl<CodeSubTab>
                ariaLabel="README view format"
                size="sm"
                value={codeSubTab}
                onChange={setCodeSubTab}
                options={[
                  { value: "visual", label: "Visual" },
                  { value: "markdown", label: "Markdown" },
                ]}
              />
            </div>

            {codeSubTab === "visual" && (
              <>
                <StudioButton
                  variant="secondary"
                  size="sm"
                  active={showSidebar}
                  onClick={() => setShowSidebar((prev) => !prev)}
                >
                  <PanelLeft />
                  <span>Sidebar</span>
                </StudioButton>

                <div className="w-36">
                  <StudioSegmentedControl<"light" | "dark">
                    ariaLabel="GitHub preview theme"
                    size="sm"
                    value={githubTheme}
                    onChange={onGithubThemeChange}
                    options={[
                      { value: "light", label: "Light", icon: <Sun /> },
                      { value: "dark", label: "Dark", icon: <Moon /> },
                    ]}
                  />
                </div>

                {(effectiveFitZoom < 0.99 || zoomMode === "100") && (
                  <div className="flex items-center gap-1.5">
                    {showSidebar && (
                      <span className="text-[12px] text-[var(--text-muted)]">
                        Profile view, scaled {zoomMode === "100" ? 100 : zoomPct}%
                      </span>
                    )}
                    <div className="w-36">
                      <StudioSegmentedControl<ReadmeZoomMode>
                        ariaLabel="README preview zoom"
                        size="sm"
                        value={zoomMode}
                        onChange={onZoomModeChange}
                        options={[
                          { value: "fit", label: `Fit ${zoomPct}%` },
                          { value: "100", label: "100%" },
                        ]}
                      />
                    </div>
                  </div>
                )}

                {editorTab === "creature" && (
                  <StudioButton
                    variant="secondary"
                    size="sm"
                    onClick={onEditReadme}
                  >
                    <Edit3 />
                    <span>Edit README</span>
                  </StudioButton>
                )}
              </>
            )}
          </div>
        )}
      </div>

      {/* Tab Content: Creature */}
      {activePreviewTab === "creature" && (
        <div
          className={cn(
            "flex items-center justify-center rounded-[8px] border border-[var(--border)] p-4 sm:p-6",
            creatureConfig.backgroundMode === "transparent" &&
              "transparency-grid"
          )}
          style={
            creatureConfig.backgroundMode === "custom"
              ? { backgroundColor: derived.background }
              : undefined
          }
        >
          <div className="w-full max-w-3xl">
            <CreatureAnimatedView config={creatureConfig} className="w-full" />
          </div>
        </div>
      )}

      {/* Tab Content: README Visual */}
      {activePreviewTab === "profile" && codeSubTab === "visual" && (
        <div ref={previewSurfaceRef}>
          <ScaledReadmeViewport
            intrinsicWidth={intrinsicWidth}
            zoomMode={zoomMode}
            overrideFitZoom={
              !showSidebar && editorTab === "readme" ? sharedFitZoom : undefined
            }
            onFitZoomChange={(z) => {
              setLocalFitZoom(z);
              if (!showSidebar) {
                onMeasureFitZoom?.(z);
              }
            }}
          >
            <div
              data-gh-theme={githubTheme}
              className={cn(
                "grid items-start",
                showSidebar
                  ? "w-[1200px] grid-cols-[296px_880px] gap-6"
                  : "w-[880px] grid-cols-1"
              )}
            >
              {showSidebar && (
                <aside className="flex w-[296px] flex-col gap-4 rounded-[6px] border border-[var(--gh-border)] bg-[var(--gh-bg)] p-4 text-[var(--gh-text)]">
                  {snapshot?.avatarUrl ? (
                    <img
                      src={snapshot.avatarUrl}
                      alt={displayName}
                      className="size-64 max-w-full rounded-full border border-[var(--gh-border)] object-cover"
                    />
                  ) : (
                    <div className="studio-mono flex size-24 items-center justify-center rounded-full border border-[var(--gh-border)] bg-[var(--gh-surface)] text-xl font-semibold text-[var(--gh-text)]">
                      {displayName.slice(0, 2).toUpperCase()}
                    </div>
                  )}

                  <div className="flex flex-col">
                    <div className="text-[20px] leading-snug font-semibold text-[var(--gh-text)]">
                      {displayName}
                    </div>
                    <div className="text-[16px] font-light text-[var(--gh-muted)]">
                      {username}
                    </div>
                  </div>

                  {statusBio && (
                    <p className="text-[14px] leading-5 text-[var(--gh-text)]">
                      {resolveDynamicTokens(statusBio, creatureConfig)}
                    </p>
                  )}

                  <div className="flex flex-col gap-1.5 text-[13px] text-[var(--gh-muted)]">
                    {company && (
                      <div className="flex items-center gap-2">
                        <Building2 className="size-4 shrink-0" />
                        <span className="truncate">{company}</span>
                      </div>
                    )}
                    {location && (
                      <div className="flex items-center gap-2">
                        <MapPin className="size-4 shrink-0" />
                        <span className="truncate">{location}</span>
                      </div>
                    )}
                    {website && (
                      <div className="flex items-center gap-2">
                        <Link2 className="size-4 shrink-0" />
                        <span
                          className="truncate"
                          style={{ color: "var(--gh-link)" }}
                        >
                          {website.replace(/^https?:\/\//, "")}
                        </span>
                      </div>
                    )}
                  </div>
                </aside>
              )}

              {/* Real 848px GitHub README Box (880px = 848px content + 16px horizontal padding each side) */}
              <div
                className={cn(
                  "w-[880px] border border-[var(--gh-border)] bg-[var(--gh-bg)] text-[var(--gh-text)]",
                  editorTab === "readme" && !showSidebar
                    ? "rounded-[6px] min-[1800px]:rounded-none min-[1800px]:rounded-b-[7px] min-[1800px]:border-x-0 min-[1800px]:border-b-0"
                    : "rounded-[6px]"
                )}
              >
                <div className="flex items-center justify-between border-b border-[var(--gh-border)] bg-[var(--gh-surface)] px-4 py-2.5 text-[12px] text-[var(--gh-muted)]">
                  <span className="studio-mono font-medium text-[var(--gh-text)]">
                    {username} / README.md
                  </span>
                  <span>
                    {meta.name} · Stage {stage.stage}
                  </span>
                </div>

                <div className="px-4 py-6">
                  {debouncedRawOverride !== null ? (
                    <div
                      data-preview-section="raw"
                      className={cn(
                        "w-[848px]",
                        flashedRegion === "raw" && "studio-preview-flash"
                      )}
                    >
                      <pre className="studio-mono max-h-[600px] overflow-auto rounded-[6px] border border-[var(--gh-border)] bg-[var(--gh-surface)] p-4 text-[13px] leading-relaxed text-[var(--gh-text)]">
                        {resolveDynamicTokens(
                          debouncedRawOverride,
                          creatureConfig
                        )}
                      </pre>
                    </div>
                  ) : (
                    <div className="flex w-[848px] flex-col gap-5">
                      {!isMarkerOnly && (
                        <>
                          {debouncedIntroMarkdown.trim() && (
                            <div
                              data-preview-section="header"
                              className={cn(
                                flashedRegion === "header" &&
                                  "studio-preview-flash"
                              )}
                            >
                              <AdvancedMarkdownPreview
                                markdown={resolveDynamicTokens(
                                  debouncedIntroMarkdown,
                                  creatureConfig
                                )}
                                isDark={githubTheme === "dark"}
                              />
                            </div>
                          )}

                          {!isMinimal && (
                            <div
                              data-preview-section="stack"
                              className={cn(
                                "flex flex-col gap-4",
                                flashedRegion === "stack" &&
                                  "studio-preview-flash"
                              )}
                            >
                              {readmeConfig.stackCards.map((card) => {
                                if (card.visible === false) return null;
                                const cardBadges = card.badgeIds
                                  .map((id) => badgeById.get(id))
                                  .filter((b): b is ReadmeBadge =>
                                    Boolean(b && b.label.trim())
                                  );
                                if (cardBadges.length === 0) return null;
                                return (
                                  <div
                                    key={card.id}
                                    className="flex flex-col gap-2"
                                  >
                                    {card.title.trim() && (
                                      <h4
                                        className={cn(
                                          "text-[16px] leading-tight font-semibold text-[var(--gh-text)]",
                                          isAlignedLeft
                                            ? "text-left"
                                            : "text-center"
                                        )}
                                      >
                                        {card.title}
                                      </h4>
                                    )}
                                    <div
                                      className={cn(
                                        "flex flex-wrap gap-1.5",
                                        isAlignedLeft
                                          ? "justify-start"
                                          : "justify-center"
                                      )}
                                    >
                                      {cardBadges.map((badge) => (
                                        <img
                                          key={`${card.id}-${badge.id}`}
                                          src={buildShieldBadgeUrl(badge)}
                                          alt={badge.label}
                                          className="h-7 w-auto"
                                        />
                                      ))}
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          )}

                          {!isMinimal && enabledLinks.length > 0 && (
                            <div
                              data-preview-section="links"
                              className={cn(
                                "flex flex-wrap gap-2",
                                isAlignedLeft ? "justify-start" : "justify-center",
                                flashedRegion === "links" &&
                                  "studio-preview-flash"
                              )}
                            >
                              {enabledLinks.map((link) => {
                                const href = resolveDynamicTokens(
                                  link.url,
                                  creatureConfig
                                );
                                return (
                                  <a
                                    key={link.id}
                                    href={href}
                                    target="_blank"
                                    rel="noreferrer"
                                  >
                                    <img
                                      src={buildActionLinkBadgeUrl(
                                        link,
                                        creatureConfig
                                      )}
                                      alt={link.label}
                                      className="h-7 w-auto transition-opacity duration-150 hover:opacity-85"
                                    />
                                  </a>
                                );
                              })}
                            </div>
                          )}
                        </>
                      )}

                      <div
                        data-preview-section="creature"
                        className={cn(
                          "flex justify-center",
                          flashedRegion === "creature" && "studio-preview-flash"
                        )}
                      >
                        <div style={{ width: `${bannerWidthPx}px` }}>
                          <CreatureAnimatedView
                            config={creatureConfig}
                            className="w-full"
                          />
                        </div>
                      </div>

                      {!isMarkerOnly &&
                        !isMinimal &&
                        readmeConfig.includeStatsTable && (
                          <div
                            data-preview-section="telemetry"
                            className={cn(
                              "gh-markdown-body",
                              flashedRegion === "telemetry" &&
                                "studio-preview-flash"
                            )}
                          >
                            <h3>
                              {resolveDynamicTokens(
                                readmeConfig.statsTableTitle ||
                                  "Telemetry Snapshot",
                                creatureConfig
                              )}
                            </h3>
                            <table>
                              <thead>
                                <tr>
                                  <th>Metric</th>
                                  <th>Active Value</th>
                                </tr>
                              </thead>
                              <tbody>
                                <tr>
                                  <td>Guardian Model</td>
                                  <td>
                                    {meta.name} ({viewLabel})
                                  </td>
                                </tr>
                                <tr>
                                  <td>Evolution Stage</td>
                                  <td>
                                    Stage {stage.stage} / 5 ({stage.rank})
                                  </td>
                                </tr>
                                <tr>
                                  <td>Contributions</td>
                                  <td>
                                    <code>
                                      {creatureConfig.commits.toLocaleString(
                                        "en-US"
                                      )}
                                    </code>{" "}
                                    commits
                                  </td>
                                </tr>
                                <tr>
                                  <td>Top Languages ({visibleLanguages.length})</td>
                                  <td>
                                    {visibleLanguages
                                      .map((l) => l.name)
                                      .join(" · ")}
                                  </td>
                                </tr>
                              </tbody>
                            </table>
                          </div>
                        )}

                      {!isMarkerOnly &&
                        !isMinimal &&
                        readmeConfig.includeShareCard && (
                          <div
                            data-preview-section="share-card"
                            className={cn(
                              "flex justify-center",
                              flashedRegion === "share-card" &&
                                "studio-preview-flash"
                            )}
                          >
                            <div
                              style={{ width: `${bannerWidthPx}px` }}
                              className="overflow-hidden rounded-[6px] border border-[var(--gh-border)]"
                            >
                              <ShareCardCanvasView
                                config={creatureConfig}
                                className="w-full"
                              />
                            </div>
                          </div>
                        )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </ScaledReadmeViewport>
        </div>
      )}

      {/* Tab Content: README Raw Markdown */}
      {activePreviewTab === "profile" && codeSubTab === "markdown" && (
        <div
          className={cn(
            "flex flex-col gap-3",
            editorTab === "readme" && "min-[1800px]:px-5 min-[1800px]:pb-5"
          )}
        >
          <div className="flex items-center justify-between gap-2">
            <span className="studio-mono text-[13px] text-[var(--text-muted)]">
              {username}/{username}/README.md
            </span>
            <StudioButton
              variant="secondary"
              size="sm"
              onClick={() => handleCopy("md-tab", readmeMarkdown)}
            >
              {copiedId === "md-tab" ? <Check /> : <Copy />}
              <span>
                {copiedId === "md-tab" ? "Copied" : "Copy markdown"}
              </span>
            </StudioButton>
          </div>
          <pre className="studio-mono max-h-[540px] overflow-auto rounded-[6px] border border-[var(--border)] bg-[var(--surface-2)] p-4 text-[13px] leading-relaxed text-[var(--text)]">
            {debouncedMarkdown}
          </pre>
        </div>
      )}

      {/* Tab Content: Social Card */}
      {activePreviewTab === "share-card" && (
        <div className="flex flex-col gap-4 rounded-[8px] border border-[var(--border)] bg-[var(--surface-2)] p-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-col gap-0.5">
              <h3 className="text-[14px] font-semibold text-[var(--text)]">
                Social share card (1280×640)
              </h3>
              <p className="text-[13px] text-[var(--text-muted)]">
                Static PNG banner synced with your creature palette and evolution
                tier.
              </p>
            </div>
            <StudioButton
              variant="secondary"
              size="sm"
              disabled={shareBusy}
              onClick={handleExportShareCardPng}
            >
              <Download />
              <span>{shareBusy ? "Exporting..." : "Download PNG"}</span>
            </StudioButton>
          </div>
          <div className="overflow-hidden rounded-[6px] border border-[var(--border)]">
            <ShareCardCanvasView config={creatureConfig} className="w-full" />
          </div>
        </div>
      )}

      {/* Tab Content: Stages */}
      {activePreviewTab === "stages" && (
        <EvolutionPanel
          baseConfig={creatureConfig}
          onSelectView={onSelectView}
        />
      )}
    </div>
  );
}
