"use client";

import React, { useState } from "react";
import {
  Building2,
  Check,
  Clock,
  Copy,
  Download,
  Edit3,
  Eye,
  Layers,
  Link2,
  MapPin,
  Share2,
  Users,
} from "lucide-react";
import type { CameraView, CreatureConfig } from "@/domain/creature/entities";
import {
  getCreatureMeta,
  getEvolutionStage,
  getSpriteKey,
  getViewDisplayLabel,
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
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ComparatorPanel } from "./ComparatorPanel";
import { CreatureAnimatedView } from "./CreatureAnimatedView";
import { EvolutionPanel } from "./EvolutionPanel";
import { ShareCardCanvasView } from "./ShareCardCanvasView";

type PreviewTab = "profile" | "share-card" | "compare" | "stages";
type CodeSubTab = "visual" | "markdown";

interface PreviewWorkspaceProps {
  creatureConfig: CreatureConfig;
  readmeConfig: ReadmeConfig;
  readmeMarkdown: string;
  snapshot: GitHubProfileSnapshot | null;
  onEditReadme: () => void;
  onOpenAutoEvolve: () => void;
  onSelectView: (view: CameraView) => void;
  onApplyCommits: (commits: number) => void;
}

export function PreviewWorkspace({
  creatureConfig,
  readmeConfig,
  readmeMarkdown,
  snapshot,
  onEditReadme,
  onOpenAutoEvolve,
  onSelectView,
  onApplyCommits,
}: PreviewWorkspaceProps) {
  const [activeTab, setActiveTab] = useState<PreviewTab>("profile");
  const [codeSubTab, setCodeSubTab] = useState<CodeSubTab>("visual");
  const [githubTheme, setGithubTheme] = useState<"dark" | "light">("dark");
  const [showSidebar, setShowSidebar] = useState(true);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [webpBusy, setWebpBusy] = useState(false);
  const [gifBusy, setGifBusy] = useState(false);
  const [shareBusy, setShareBusy] = useState(false);

  const stage = getEvolutionStage(creatureConfig.commits);
  const meta = getCreatureMeta(creatureConfig.creature);
  const viewLabel = getViewDisplayLabel(
    creatureConfig.creature,
    creatureConfig.view
  );
  const username = creatureConfig.username.trim() || "your-username";
  const badgeById = new Map(readmeConfig.badges.map((b) => [b.id, b]));
  const enabledLinks = readmeConfig.actionLinks.filter(
    (l) => l.enabled && l.label.trim()
  );

  const displayName =
    readmeConfig.profileDisplayName.trim() || snapshot?.displayName || username;
  const statusBio =
    readmeConfig.profileStatusBio.trim() || snapshot?.bio || "";
  const location =
    readmeConfig.profileLocation.trim() || snapshot?.location || "";
  const company =
    readmeConfig.profileCompany.trim() || snapshot?.company || "";
  const website =
    readmeConfig.profileWebsite.trim() || snapshot?.website || "";

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
  const isTelemetry = readmeConfig.templateId === "telemetry-stats";
  const isAlignedLeft = readmeConfig.align === "left";

  return (
    <div className="flex flex-col gap-5">
      <Card>
        <CardHeader className="flex flex-row flex-wrap items-center justify-between gap-3 border-b pb-4">
          <div className="flex items-center gap-2.5">
            <div className="flex size-8 items-center justify-center rounded-lg border bg-muted text-foreground">
              <Layers className="size-4" />
            </div>
            <div className="flex flex-col">
              <CardTitle className="font-mono text-sm">
                Live Creature Canvas — {meta.name}
              </CardTitle>
              <CardDescription className="font-mono text-xs">
                Stage {stage.stage} ({stage.rank}) · View: {viewLabel}
              </CardDescription>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={webpBusy}
              onClick={handleExportWebP}
            >
              <Download data-icon="inline-start" />
              {webpBusy ? "Encoding WebP..." : "Animated WebP"}
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={gifBusy}
              onClick={handleExportGif}
            >
              <Download data-icon="inline-start" />
              {gifBusy ? "Encoding GIF..." : "Animated GIF"}
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => handleCopy("readme", readmeMarkdown)}
            >
              {copiedId === "readme" ? (
                <Check data-icon="inline-start" />
              ) : (
                <Copy data-icon="inline-start" />
              )}
              {copiedId === "readme" ? "Copied" : "Copy README"}
            </Button>
            <Button type="button" size="sm" onClick={onOpenAutoEvolve}>
              <Clock data-icon="inline-start" />
              12:00 AM Action
            </Button>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          <div
            className={
              creatureConfig.backgroundMode === "transparent"
                ? "transparency-grid p-4"
                : "p-4"
            }
          >
            <div className="mx-auto max-w-2xl">
              <CreatureAnimatedView config={creatureConfig} className="w-full" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs
        value={activeTab}
        onValueChange={(val) => setActiveTab(val as PreviewTab)}
      >
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="profile" className="gap-1.5 font-mono text-xs">
            <Eye className="size-3.5" />
            README
          </TabsTrigger>
          <TabsTrigger value="share-card" className="gap-1.5 font-mono text-xs">
            <Share2 className="size-3.5" />
            Social Card
          </TabsTrigger>
          <TabsTrigger value="compare" className="gap-1.5 font-mono text-xs">
            <Users className="size-3.5" />
            Compare
          </TabsTrigger>
          <TabsTrigger value="stages" className="gap-1.5 font-mono text-xs">
            <Clock className="size-3.5" />
            Stages
          </TabsTrigger>
        </TabsList>
      </Tabs>

      {activeTab === "profile" && (
        <Card>
          <CardHeader className="flex flex-row flex-wrap items-center justify-between gap-3">
            <Tabs
              value={codeSubTab}
              onValueChange={(val) => setCodeSubTab(val as CodeSubTab)}
            >
              <TabsList>
                <TabsTrigger value="visual" className="text-xs">
                  Visual Preview
                </TabsTrigger>
                <TabsTrigger value="markdown" className="text-xs">
                  README.md
                </TabsTrigger>
              </TabsList>
            </Tabs>

            {codeSubTab === "visual" && (
              <div className="flex flex-wrap items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setShowSidebar((prev) => !prev)}
                >
                  {showSidebar ? "Hide Sidebar" : "Show Sidebar"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    setGithubTheme((prev) =>
                      prev === "dark" ? "light" : "dark"
                    )
                  }
                >
                  Canvas: {githubTheme === "dark" ? "Dark" : "Light"}
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={onEditReadme}
                >
                  <Edit3 data-icon="inline-start" />
                  Edit Text &amp; Stack
                </Button>
              </div>
            )}
          </CardHeader>

          <CardContent>
            {codeSubTab === "visual" && (
              <div
                className={`rounded-xl border p-5 transition ${
                  githubTheme === "dark"
                    ? "border-[#30363d] bg-[#0d1117] text-[#e6edf3]"
                    : "border-[#d0d7de] bg-white text-[#1f2328]"
                }`}
              >
                <div
                  className={`grid gap-6 ${
                    showSidebar ? "lg:grid-cols-[190px_1fr]" : "grid-cols-1"
                  }`}
                >
                  {showSidebar && (
                    <aside className="flex flex-col gap-3">
                      {snapshot?.avatarUrl ? (
                        <img
                          src={snapshot.avatarUrl}
                          alt={displayName}
                          className={`size-20 rounded-full border object-cover ${
                            githubTheme === "dark"
                              ? "border-[#30363d]"
                              : "border-[#d0d7de]"
                          }`}
                        />
                      ) : (
                        <div
                          className={`flex size-20 items-center justify-center rounded-full border font-mono text-lg font-bold ${
                            githubTheme === "dark"
                              ? "border-[#30363d] bg-[#161b22] text-[#e6edf3]"
                              : "border-[#d0d7de] bg-[#f6f8fa] text-[#1f2328]"
                          }`}
                        >
                          {displayName.slice(0, 2).toUpperCase()}
                        </div>
                      )}

                      <div>
                        <div className="text-base font-semibold leading-tight">
                          {displayName}
                        </div>
                        <div
                          className={`text-xs ${
                            githubTheme === "dark"
                              ? "text-[#8b949e]"
                              : "text-[#656d76]"
                          }`}
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
                        className={`flex flex-col gap-1.5 text-xs ${
                          githubTheme === "dark"
                            ? "text-[#8b949e]"
                            : "text-[#656d76]"
                        }`}
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

                  <div
                    className={`rounded-xl border p-5 ${
                      githubTheme === "dark"
                        ? "border-[#30363d] bg-[#0d1117]"
                        : "border-[#d0d7de] bg-white"
                    }`}
                  >
                    <div
                      className={`mb-4 flex items-center justify-between border-b pb-3 text-xs ${
                        githubTheme === "dark"
                          ? "border-[#30363d] text-[#8b949e]"
                          : "border-[#d0d7de] text-[#656d76]"
                      }`}
                    >
                      <span className="font-mono">
                        {username} / README.md
                      </span>
                      <span className="font-mono">
                        {meta.name} · Stage {stage.stage}
                      </span>
                    </div>

                    {readmeConfig.rawOverride !== null ? (
                      <pre
                        className={`max-h-[420px] overflow-auto rounded-lg border p-4 font-mono text-xs leading-relaxed ${
                          githubTheme === "dark"
                            ? "border-[#30363d] bg-[#161b22] text-[#e6edf3]"
                            : "border-[#d0d7de] bg-[#f6f8fa] text-[#1f2328]"
                        }`}
                      >
                        {readmeConfig.rawOverride}
                      </pre>
                    ) : (
                      <div
                        className={`flex flex-col gap-4 ${
                          isAlignedLeft ? "text-left" : "text-center"
                        }`}
                      >
                        {!isMarkerOnly && (
                          <>
                            {readmeConfig.headline.trim() && (
                              <h2
                                className={`border-b pb-2.5 text-xl font-semibold ${
                                  githubTheme === "dark"
                                    ? "border-[#30363d]"
                                    : "border-[#d0d7de]"
                                }`}
                              >
                                {resolveDynamicTokens(
                                  readmeConfig.headline,
                                  creatureConfig
                                )}
                              </h2>
                            )}

                            {!isMinimal && readmeConfig.subtitleTags.length > 0 && (
                              <p
                                className={`text-xs font-semibold uppercase tracking-wide ${
                                  githubTheme === "dark"
                                    ? "text-[#8b949e]"
                                    : "text-[#656d76]"
                                }`}
                              >
                                {readmeConfig.subtitleTags.join(" | ")}
                              </p>
                            )}

                            {readmeConfig.bio.trim() && (
                              <p className="text-sm leading-relaxed opacity-90">
                                {resolveDynamicTokens(
                                  readmeConfig.bio,
                                  creatureConfig
                                )}
                              </p>
                            )}

                            {!isMinimal && readmeConfig.ctaLine.trim() && (
                              <p className="text-sm font-medium opacity-95">
                                {resolveDynamicTokens(
                                  readmeConfig.ctaLine,
                                  creatureConfig
                                )}
                              </p>
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
                                    <div key={card.id} className="flex flex-col gap-1.5">
                                      {card.title.trim() && (
                                        <h4 className="text-xs font-semibold uppercase tracking-wide opacity-80">
                                          {card.title}
                                        </h4>
                                      )}
                                      <div
                                        className={`flex flex-wrap gap-1.5 ${
                                          isAlignedLeft
                                            ? "justify-start"
                                            : "justify-center"
                                        }`}
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
                                className={`flex flex-wrap gap-2 ${
                                  isAlignedLeft ? "justify-start" : "justify-center"
                                }`}
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

                        <div
                          className={`flex ${
                            isAlignedLeft ? "justify-start" : "justify-center"
                          }`}
                        >
                          <div
                            className="w-full"
                            style={{
                              maxWidth: `${Math.min(
                                920,
                                Math.max(360, readmeConfig.imageWidth)
                              )}px`,
                            }}
                          >
                            <CreatureAnimatedView
                              config={creatureConfig}
                              className="w-full"
                            />
                          </div>
                        </div>

                        {readmeConfig.includeTelemetryCaption &&
                          readmeConfig.telemetryCaptionTemplate.trim() && (
                            <p
                              className={`text-xs italic ${
                                githubTheme === "dark"
                                  ? "text-[#8b949e]"
                                  : "text-[#656d76]"
                              }`}
                            >
                              {resolveDynamicTokens(
                                readmeConfig.telemetryCaptionTemplate,
                                creatureConfig
                              )}
                            </p>
                          )}

                        {!isMarkerOnly &&
                          (isTelemetry || readmeConfig.includeStatsTable) && (
                            <div className="pt-2 text-left">
                              <h3 className="mb-2 text-sm font-semibold">
                                {resolveDynamicTokens(
                                  readmeConfig.statsTableTitle ||
                                    "Telemetry Snapshot",
                                  creatureConfig
                                )}
                              </h3>
                              <div
                                className={`overflow-hidden rounded-lg border text-xs ${
                                  githubTheme === "dark"
                                    ? "border-[#30363d]"
                                    : "border-[#d0d7de]"
                                }`}
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
                                    className={`divide-y ${
                                      githubTheme === "dark"
                                        ? "divide-[#30363d]"
                                        : "divide-[#d0d7de]"
                                    }`}
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
                                        Stage {stage.stage} — {stage.rank}
                                      </td>
                                    </tr>
                                    <tr>
                                      <td className="px-3 py-1.5 opacity-80">
                                        Contributions
                                      </td>
                                      <td className="px-3 py-1.5 font-mono">
                                        {creatureConfig.commits.toLocaleString("en-US")}
                                      </td>
                                    </tr>
                                    <tr>
                                      <td className="px-3 py-1.5 opacity-80">
                                        Top Stack
                                      </td>
                                      <td className="px-3 py-1.5">
                                        {creatureConfig.languages
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
                          (isTelemetry || readmeConfig.includeShareCard) && (
                            <div
                              className={`overflow-hidden rounded-lg border ${
                                isAlignedLeft ? "" : "mx-auto"
                              } max-w-md ${
                                githubTheme === "dark"
                                  ? "border-[#30363d]"
                                  : "border-[#d0d7de]"
                              }`}
                            >
                              <ShareCardCanvasView
                                config={creatureConfig}
                                className="w-full"
                              />
                            </div>
                          )}

                        {!isMarkerOnly &&
                          readmeConfig.customFooterMarkdown.trim() && (
                            <div
                              className={`rounded-lg border p-3 text-left text-xs ${
                                githubTheme === "dark"
                                  ? "border-[#30363d] bg-[#161b22]"
                                  : "border-[#d0d7de] bg-[#f6f8fa]"
                              }`}
                            >
                              {readmeConfig.customSectionTitle.trim() && (
                                <div className="mb-1.5 font-semibold">
                                  {resolveDynamicTokens(
                                    readmeConfig.customSectionTitle,
                                    creatureConfig
                                  )}
                                </div>
                              )}
                              <pre className="whitespace-pre-wrap font-sans leading-relaxed">
                                {resolveDynamicTokens(
                                  readmeConfig.customFooterMarkdown,
                                  creatureConfig
                                )}
                              </pre>
                            </div>
                          )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {codeSubTab === "markdown" && (
              <div className="flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs text-muted-foreground">
                    {username}/{username}/README.md
                  </span>
                  <Button
                    type="button"
                    variant="outline"
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
                <pre className="max-h-[500px] overflow-auto rounded-lg border bg-muted/40 p-4 font-mono text-xs leading-relaxed text-foreground">
                  {readmeMarkdown}
                </pre>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {activeTab === "share-card" && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div className="flex flex-col gap-0.5">
              <CardTitle className="font-mono">
                Social Share Banner (1280×640)
              </CardTitle>
              <CardDescription>
                Optional PNG banner synced with your active creature palette.
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

      {activeTab === "compare" && (
        <ComparatorPanel baseConfig={creatureConfig} />
      )}

      {activeTab === "stages" && (
        <EvolutionPanel
          baseConfig={creatureConfig}
          onSelectView={onSelectView}
          onApplyCommits={onApplyCommits}
        />
      )}
    </div>
  );
}
