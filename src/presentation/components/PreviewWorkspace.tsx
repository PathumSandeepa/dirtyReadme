"use client";

import { useState } from "react";
import {
  Building2,
  Check,
  Clock,
  Copy,
  Download,
  Edit3,
  Eye,
  Link2,
  MapPin,
  PanelLeft,
  Share2,
  Sun,
} from "lucide-react";
import { cn } from "cn";
import type { CameraView, CreatureConfig } from "@/domain/creature/entities";
import {
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
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CreatureAnimatedView } from "./CreatureAnimatedView";
import { EvolutionPanel } from "./EvolutionPanel";
import { AdvancedMarkdownPreview } from "./MarkdownPreviewRenderer";
import { ShareCardCanvasView } from "./ShareCardCanvasView";

export type PreviewTab = "profile" | "share-card" | "stages";
type CodeSubTab = "visual" | "markdown";

interface PreviewWorkspaceProps {
  editorTab: "creature" | "readme";
  previewTab: PreviewTab;
  onPreviewTabChange: (tab: PreviewTab) => void;
  creatureConfig: CreatureConfig;
  readmeConfig: ReadmeConfig;
  readmeMarkdown: string;
  snapshot: GitHubProfileSnapshot | null;
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
  onEditReadme,
  onOpenAutoEvolve,
  onSelectView,
}: PreviewWorkspaceProps) {
  const [codeSubTab, setCodeSubTab] = useState<CodeSubTab>("visual");
  const [githubTheme, setGithubTheme] = useState<"dark" | "light">("dark");
  const [sidebarOverride, setSidebarOverride] = useState<boolean | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [webpBusy, setWebpBusy] = useState(false);
  const [gifBusy, setGifBusy] = useState(false);
  const [shareBusy, setShareBusy] = useState(false);

  const showSidebar =
    sidebarOverride !== null ? sidebarOverride : editorTab === "creature";

  const stage = getEvolutionStage(creatureConfig.commits);
  const meta = getCreatureMeta(creatureConfig.creature);
  const viewLabel = getViewDisplayLabel(
    creatureConfig.creature,
    creatureConfig.view
  );
  const waterMode = resolveWaterMode(creatureConfig);
  const waterStatusLabel =
    waterMode === "water"
      ? "In Water"
      : waterMode === "no-water"
        ? "No Water"
        : "Clear BG";
  const visibleLanguages = getVisibleLanguages(creatureConfig);
  const username = creatureConfig.username.trim() || "your-username";
  const badgeById = new Map(readmeConfig.badges.map((b) => [b.id, b]));
  const enabledLinks = readmeConfig.actionLinks.filter(
    (l) => l.enabled && l.label.trim()
  );

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

  return (
    <div className="flex flex-col gap-4 rounded-xl border bg-card p-4 text-card-foreground sm:p-5">
      {/* Unified Action Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b pb-3.5">
        <div className="flex flex-col">
          <h2 className="font-mono text-sm font-semibold text-foreground">
            {editorTab === "readme"
              ? `Live README Preview · ${meta.name}`
              : `Live Creature Canvas · ${meta.name}`}
          </h2>
          <p className="font-mono text-[11px] text-muted-foreground">
            Stage {stage.stage} ({stage.rank}) · {viewLabel} ·{" "}
            {waterStatusLabel}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-1">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            disabled={webpBusy}
            onClick={handleExportWebP}
          >
            <Download data-icon="inline-start" />
            {webpBusy ? "WebP..." : "WebP"}
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            disabled={gifBusy}
            onClick={handleExportGif}
          >
            <Download data-icon="inline-start" />
            {gifBusy ? "GIF..." : "GIF"}
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => handleCopy("readme", readmeMarkdown)}
          >
            {copiedId === "readme" ? (
              <Check data-icon="inline-start" />
            ) : (
              <Copy data-icon="inline-start" />
            )}
            {copiedId === "readme" ? "Copied" : "Copy"}
          </Button>
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={onOpenAutoEvolve}
          >
            <Clock data-icon="inline-start" />
            12AM Action
          </Button>
        </div>
      </div>

      {/* Interactive Creature Stage (Tab 1) */}
      {editorTab === "creature" && (
        <div
          className={cn(
            "overflow-hidden rounded-lg p-3 sm:p-4",
            creatureConfig.backgroundMode === "transparent"
              ? "transparency-grid"
              : "bg-muted/20"
          )}
        >
          <div className="mx-auto max-w-2xl">
            <CreatureAnimatedView config={creatureConfig} className="w-full" />
          </div>
        </div>
      )}

      {/* Preview Mode Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <Tabs
          value={previewTab}
          onValueChange={(val) => onPreviewTabChange(val as PreviewTab)}
        >
          <TabsList>
            <TabsTrigger value="profile" className="gap-1.5 font-mono text-xs">
              <Eye className="size-3.5" />
              README
            </TabsTrigger>
            <TabsTrigger
              value="share-card"
              className="gap-1.5 font-mono text-xs"
            >
              <Share2 className="size-3.5" />
              Social Card
            </TabsTrigger>
            <TabsTrigger value="stages" className="gap-1.5 font-mono text-xs">
              <Clock className="size-3.5" />
              Stages
            </TabsTrigger>
          </TabsList>
        </Tabs>

        {previewTab === "profile" && (
          <div className="flex flex-wrap items-center gap-1">
            <div className="inline-flex rounded-lg bg-muted/70 p-0.5">
              <button
                type="button"
                onClick={() => setCodeSubTab("visual")}
                className={cn(
                  "rounded-md px-2.5 py-1 text-xs font-medium transition",
                  codeSubTab === "visual"
                    ? "bg-background text-foreground shadow-xs"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                Visual
              </button>
              <button
                type="button"
                onClick={() => setCodeSubTab("markdown")}
                className={cn(
                  "rounded-md px-2.5 py-1 text-xs font-medium transition",
                  codeSubTab === "markdown"
                    ? "bg-background text-foreground shadow-xs"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                Markdown
              </button>
            </div>

            {codeSubTab === "visual" && (
              <>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setSidebarOverride(!showSidebar)}
                  title="Toggle GitHub profile sidebar"
                >
                  <PanelLeft data-icon="inline-start" />
                  Sidebar
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() =>
                    setGithubTheme((prev) =>
                      prev === "dark" ? "light" : "dark"
                    )
                  }
                >
                  <Sun data-icon="inline-start" />
                  {githubTheme === "dark" ? "Dark" : "Light"}
                </Button>
                {editorTab === "creature" && (
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    onClick={onEditReadme}
                  >
                    <Edit3 data-icon="inline-start" />
                    Edit README
                  </Button>
                )}
              </>
            )}
          </div>
        )}
      </div>

      {/* Live GitHub Profile Preview */}
      {previewTab === "profile" && codeSubTab === "visual" && (
        <div
          className={cn(
            "rounded-xl border p-4 transition sm:p-5",
            githubTheme === "dark"
              ? "border-[#30363d] bg-[#0d1117] text-[#e6edf3]"
              : "border-[#d0d7de] bg-white text-[#1f2328]"
          )}
        >
          <div
            className={cn(
              "grid gap-6",
              showSidebar ? "lg:grid-cols-[180px_1fr]" : "grid-cols-1"
            )}
          >
            {showSidebar && (
              <aside className="flex flex-col gap-3">
                {snapshot?.avatarUrl ? (
                  <img
                    src={snapshot.avatarUrl}
                    alt={displayName}
                    className={cn(
                      "size-20 rounded-full border object-cover",
                      githubTheme === "dark"
                        ? "border-[#30363d]"
                        : "border-[#d0d7de]"
                    )}
                  />
                ) : (
                  <div
                    className={cn(
                      "flex size-20 items-center justify-center rounded-full border font-mono text-lg font-bold",
                      githubTheme === "dark"
                        ? "border-[#30363d] bg-[#161b22] text-[#e6edf3]"
                        : "border-[#d0d7de] bg-[#f6f8fa] text-[#1f2328]"
                    )}
                  >
                    {displayName.slice(0, 2).toUpperCase()}
                  </div>
                )}

                <div>
                  <div className="text-base font-semibold leading-tight">
                    {displayName}
                  </div>
                  <div
                    className={cn(
                      "text-xs",
                      githubTheme === "dark"
                        ? "text-[#8b949e]"
                        : "text-[#656d76]"
                    )}
                  >
                    @{username}
                  </div>
                </div>

                {statusBio && (
                  <p className="text-xs leading-relaxed opacity-90">
                    {resolveDynamicTokens(statusBio, creatureConfig)}
                  </p>
                )}

                <div
                  className={cn(
                    "flex flex-col gap-1.5 text-xs",
                    githubTheme === "dark"
                      ? "text-[#8b949e]"
                      : "text-[#656d76]"
                  )}
                >
                  {company && (
                    <div className="flex items-center gap-2">
                      <Building2 className="size-3.5 shrink-0" />
                      <span className="truncate">{company}</span>
                    </div>
                  )}
                  {location && (
                    <div className="flex items-center gap-2">
                      <MapPin className="size-3.5 shrink-0" />
                      <span className="truncate">{location}</span>
                    </div>
                  )}
                  {website && (
                    <div className="flex items-center gap-2">
                      <Link2 className="size-3.5 shrink-0" />
                      <span className="truncate text-[#2f81f7]">
                        {website.replace(/^https?:\/\//, "")}
                      </span>
                    </div>
                  )}
                </div>
              </aside>
            )}

            <div className="min-w-0">
              <div
                className={cn(
                  "mb-4 flex items-center justify-between border-b pb-2.5 text-xs",
                  githubTheme === "dark"
                    ? "border-[#30363d] text-[#8b949e]"
                    : "border-[#d0d7de] text-[#656d76]"
                )}
              >
                <span className="font-mono">{username} / README.md</span>
                <span className="font-mono">
                  {meta.name} · Stage {stage.stage}
                </span>
              </div>

              {readmeConfig.rawOverride !== null ? (
                <pre
                  className={cn(
                    "max-h-[420px] overflow-auto rounded-lg border p-4 font-mono text-xs leading-relaxed",
                    githubTheme === "dark"
                      ? "border-[#30363d] bg-[#161b22] text-[#e6edf3]"
                      : "border-[#d0d7de] bg-[#f6f8fa] text-[#1f2328]"
                  )}
                >
                  {readmeConfig.rawOverride}
                </pre>
              ) : (
                <div className="flex flex-col gap-4">
                  {!isMarkerOnly && (
                    <>
                      {readmeConfig.advancedProfileMarkdown.trim() && (
                        <AdvancedMarkdownPreview
                          markdown={resolveDynamicTokens(
                            readmeConfig.advancedProfileMarkdown,
                            creatureConfig
                          )}
                          isDark={githubTheme === "dark"}
                        />
                      )}

                      {!isMinimal && (
                        <div className="flex flex-col gap-3">
                          {readmeConfig.stackCards.map((card) => {
                            const cardBadges = card.badgeIds
                              .map((id) => badgeById.get(id))
                              .filter((b): b is ReadmeBadge =>
                                Boolean(b && b.label.trim())
                              );
                            if (cardBadges.length === 0) return null;
                            return (
                              <div
                                key={card.id}
                                className="flex flex-col gap-1.5"
                              >
                                {card.title.trim() && (
                                  <h4
                                    className={cn(
                                      "text-xs font-semibold uppercase tracking-wide opacity-80",
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
                                      className="h-6 rounded"
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
                          className={cn(
                            "flex flex-wrap gap-2",
                            isAlignedLeft ? "justify-start" : "justify-center"
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
                                  className="h-6 rounded transition hover:opacity-85"
                                />
                              </a>
                            );
                          })}
                        </div>
                      )}
                    </>
                  )}

                  {(() => {
                    const bannerWidthPercent = Math.min(
                      100,
                      Math.max(35, (readmeConfig.imageWidth / 920) * 100)
                    );
                    return (
                      <>
                        <div className="flex justify-center">
                          <div style={{ width: `${bannerWidthPercent}%` }}>
                            <CreatureAnimatedView
                              config={creatureConfig}
                              className="w-full"
                            />
                          </div>
                        </div>

                        {!isMarkerOnly &&
                          !isMinimal &&
                          readmeConfig.includeStatsTable && (
                            <div className="pt-2 text-left">
                              <h3 className="mb-2 text-sm font-semibold">
                                {resolveDynamicTokens(
                                  readmeConfig.statsTableTitle ||
                                    "Telemetry Snapshot",
                                  creatureConfig
                                )}
                              </h3>
                              <div
                                className={cn(
                                  "overflow-hidden rounded-lg border text-xs",
                                  githubTheme === "dark"
                                    ? "border-[#30363d]"
                                    : "border-[#d0d7de]"
                                )}
                              >
                                <table className="w-full border-collapse">
                                  <thead>
                                    <tr
                                      className={
                                        githubTheme === "dark"
                                          ? "bg-[#161b22]"
                                          : "bg-[#f6f8fa]"
                                      }
                                    >
                                      <th className="px-3 py-2 text-left font-medium">
                                        Metric
                                      </th>
                                      <th className="px-3 py-2 text-left font-medium">
                                        Value
                                      </th>
                                    </tr>
                                  </thead>
                                  <tbody
                                    className={cn(
                                      "divide-y",
                                      githubTheme === "dark"
                                        ? "divide-[#30363d]"
                                        : "divide-[#d0d7de]"
                                    )}
                                  >
                                    <tr>
                                      <td className="px-3 py-1.5 opacity-80">
                                        Creature Model
                                      </td>
                                      <td className="px-3 py-1.5 font-medium">
                                        {meta.name} ({viewLabel})
                                      </td>
                                    </tr>
                                    <tr>
                                      <td className="px-3 py-1.5 opacity-80">
                                        Evolution Stage
                                      </td>
                                      <td className="px-3 py-1.5 font-medium">
                                        Stage {stage.stage}: {stage.rank}
                                      </td>
                                    </tr>
                                    <tr>
                                      <td className="px-3 py-1.5 opacity-80">
                                        Contributions
                                      </td>
                                      <td className="px-3 py-1.5 font-mono">
                                        {creatureConfig.commits.toLocaleString(
                                          "en-US"
                                        )}
                                      </td>
                                    </tr>
                                    <tr>
                                      <td className="px-3 py-1.5 opacity-80">
                                        Top Stack ({visibleLanguages.length})
                                      </td>
                                      <td className="px-3 py-1.5">
                                        {visibleLanguages
                                          .map((l) => l.name)
                                          .join(" · ")}
                                      </td>
                                    </tr>
                                  </tbody>
                                </table>
                              </div>
                            </div>
                          )}

                        {!isMarkerOnly &&
                          !isMinimal &&
                          readmeConfig.includeShareCard && (
                            <div className="flex justify-center">
                              <div
                                style={{ width: `${bannerWidthPercent}%` }}
                                className={cn(
                                  "overflow-hidden rounded-lg border",
                                  githubTheme === "dark"
                                    ? "border-[#30363d]"
                                    : "border-[#d0d7de]"
                                )}
                              >
                                <ShareCardCanvasView
                                  config={creatureConfig}
                                  className="w-full"
                                />
                              </div>
                            </div>
                          )}
                      </>
                    );
                  })()}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {previewTab === "profile" && codeSubTab === "markdown" && (
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <span className="font-mono text-xs text-muted-foreground">
              {username}/{username}/README.md
            </span>
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => handleCopy("md-tab", readmeMarkdown)}
            >
              {copiedId === "md-tab" ? (
                <Check data-icon="inline-start" />
              ) : (
                <Copy data-icon="inline-start" />
              )}
              {copiedId === "md-tab" ? "Copied" : "Copy Markdown"}
            </Button>
          </div>
          <pre className="max-h-[520px] overflow-auto rounded-lg bg-muted/40 p-4 font-mono text-xs leading-relaxed text-foreground">
            {readmeMarkdown}
          </pre>
        </div>
      )}

      {previewTab === "share-card" && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div className="flex flex-col gap-0.5">
              <CardTitle className="font-mono">
                Social Share Banner (1280×640)
              </CardTitle>
              <CardDescription>
                Optional PNG banner synced with your creature palette.
              </CardDescription>
            </div>
            <Button
              type="button"
              size="sm"
              disabled={shareBusy}
              onClick={handleExportShareCardPng}
            >
              <Download data-icon="inline-start" />
              {shareBusy ? "Exporting..." : "Download PNG"}
            </Button>
          </CardHeader>
          <CardContent>
            <div className="overflow-hidden rounded-lg border">
              <ShareCardCanvasView config={creatureConfig} className="w-full" />
            </div>
          </CardContent>
        </Card>
      )}

      {previewTab === "stages" && (
        <EvolutionPanel
          baseConfig={creatureConfig}
          onSelectView={onSelectView}
        />
      )}
    </div>
  );
}
