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
import { getCreatureMeta, getEvolutionStage } from "@/domain/creature/services";
import type { ReadmeConfig } from "@/domain/profile/entities";
import {
  buildActionLinkBadgeUrl,
  buildShieldBadgeUrl,
  resolveDynamicTokens,
} from "@/domain/profile/readmeService";
import {
  copyToClipboard,
  downloadTextFile,
} from "@/infrastructure/browser/downloadAdapter";
import type { GitHubProfileSnapshot } from "@/infrastructure/github/githubClient";
import { ComparatorPanel } from "./ComparatorPanel";
import { CreatureSvgView } from "./CreatureSvgView";
import { EvolutionPanel } from "./EvolutionPanel";
import { ShareCardSvgView } from "./ShareCardSvgView";

type PreviewTab = "profile" | "share-card" | "compare" | "stages";
type CodeSubTab = "visual" | "markdown" | "svg";

interface PreviewWorkspaceProps {
  creatureConfig: CreatureConfig;
  readmeConfig: ReadmeConfig;
  creatureSvg: string;
  shareCardSvg: string;
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
  creatureSvg,
  shareCardSvg,
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

  const stage = getEvolutionStage(creatureConfig.commits);
  const meta = getCreatureMeta(creatureConfig.creature);
  const username = creatureConfig.username.trim() || "your-username";
  const enabledBadges = readmeConfig.badges.filter((b) => b.enabled);
  const enabledLinks = readmeConfig.actionLinks.filter((l) => l.enabled);

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

  const tabs: { id: PreviewTab; label: string; icon: React.ReactNode }[] = [
    { id: "profile", label: "README Profile", icon: <Eye className="h-4 w-4" /> },
    { id: "share-card", label: "Social Card", icon: <Share2 className="h-4 w-4" /> },
    { id: "compare", label: "Compare Users", icon: <Users className="h-4 w-4" /> },
    { id: "stages", label: "All Stages", icon: <Clock className="h-4 w-4" /> },
  ];

  const isMinimal = readmeConfig.templateId === "minimal-header";
  const isMarkerOnly = readmeConfig.templateId === "auto-evolve-block";
  const isTelemetry = readmeConfig.templateId === "telemetry-stats";
  const isAlignedLeft = readmeConfig.align === "left";

  return (
    <div className="space-y-5">
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-[#363d4a] dark:bg-[#1e222a]">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 px-5 py-3.5 dark:border-[#363d4a]">
          <div className="flex items-center gap-2.5">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600 dark:bg-indigo-500/15 dark:text-indigo-300">
              <Layers className="h-4 w-4" />
            </span>
            <div>
              <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                Live Creature Canvas — {meta.name}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Stage {stage.stage} ({stage.rank}) · View: {creatureConfig.view.toUpperCase()}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() =>
                downloadTextFile("creature.svg", creatureSvg, "image/svg+xml")
              }
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 transition hover:bg-slate-50 dark:border-[#363d4a] dark:bg-[#272c36] dark:text-slate-200 dark:hover:bg-[#2f3642]"
            >
              <Download className="h-3.5 w-3.5" />
              Download SVG
            </button>
            <button
              type="button"
              onClick={() => handleCopy("readme", readmeMarkdown)}
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 transition hover:bg-slate-50 dark:border-[#363d4a] dark:bg-[#272c36] dark:text-slate-200 dark:hover:bg-[#2f3642]"
            >
              {copiedId === "readme" ? (
                <Check className="h-3.5 w-3.5 text-emerald-500" />
              ) : (
                <Copy className="h-3.5 w-3.5" />
              )}
              {copiedId === "readme" ? "Copied" : "Copy README"}
            </button>
            <button
              type="button"
              onClick={onOpenAutoEvolve}
              className="inline-flex items-center gap-1.5 rounded-xl bg-indigo-600 px-3 py-1.5 text-xs font-medium text-white transition hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-400"
            >
              <Clock className="h-3.5 w-3.5" />
              12:00 AM Action
            </button>
          </div>
        </div>

        <div
          className={`p-4 ${
            creatureConfig.backgroundMode === "transparent"
              ? "transparency-grid"
              : "bg-[#0d1117]"
          }`}
        >
          <div className="mx-auto max-w-2xl">
            <CreatureSvgView config={creatureConfig} className="w-full" />
          </div>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-1.5 rounded-2xl border border-slate-200 bg-white p-3 shadow-sm dark:border-[#363d4a] dark:bg-[#1e222a]">
        {tabs.map((tab) => {
          const active = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`inline-flex items-center gap-2 rounded-xl px-3.5 py-2 text-xs font-medium transition ${
                active
                  ? "bg-indigo-600 text-white shadow-sm dark:bg-indigo-500"
                  : "text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-[#272c36] dark:hover:text-slate-100"
              }`}
            >
              {tab.icon}
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {activeTab === "profile" && (
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-[#363d4a] dark:bg-[#1e222a]">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <div className="inline-flex rounded-xl border border-slate-200 bg-slate-50 p-1 dark:border-[#363d4a] dark:bg-[#272c36]">
              {(
                [
                  { id: "visual", label: "Visual Preview" },
                  { id: "markdown", label: "README.md Source" },
                  { id: "svg", label: "SVG Markup" },
                ] as { id: CodeSubTab; label: string }[]
              ).map((sub) => (
                <button
                  key={sub.id}
                  type="button"
                  onClick={() => setCodeSubTab(sub.id)}
                  className={`rounded-lg px-3 py-1.5 text-xs font-medium transition ${
                    codeSubTab === sub.id
                      ? "bg-white text-slate-900 shadow-sm dark:bg-[#1e222a] dark:text-slate-100"
                      : "text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-slate-100"
                  }`}
                >
                  {sub.label}
                </button>
              ))}
            </div>

            {codeSubTab === "visual" && (
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowSidebar((prev) => !prev)}
                  className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-700 transition hover:bg-slate-50 dark:border-[#363d4a] dark:bg-[#272c36] dark:text-slate-200 dark:hover:bg-[#2f3642]"
                >
                  {showSidebar ? "Hide Profile Sidebar" : "Show Profile Sidebar"}
                </button>
                <button
                  type="button"
                  onClick={() =>
                    setGithubTheme((prev) =>
                      prev === "dark" ? "light" : "dark"
                    )
                  }
                  className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-700 transition hover:bg-slate-50 dark:border-[#363d4a] dark:bg-[#272c36] dark:text-slate-200 dark:hover:bg-[#2f3642]"
                >
                  GitHub Canvas: {githubTheme === "dark" ? "Dark" : "Light"}
                </button>
                <button
                  type="button"
                  onClick={onEditReadme}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-indigo-200 bg-indigo-50 px-3 py-1.5 text-xs font-medium text-indigo-700 transition hover:bg-indigo-100 dark:border-indigo-500/40 dark:bg-indigo-500/15 dark:text-indigo-300"
                >
                  <Edit3 className="h-3.5 w-3.5" />
                  Edit README Text &amp; Stack
                </button>
              </div>
            )}
          </div>

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
                  showSidebar ? "lg:grid-cols-[200px_1fr]" : "grid-cols-1"
                }`}
              >
                {showSidebar && (
                  <aside className="space-y-3">
                    {snapshot?.avatarUrl ? (
                      <img
                        src={snapshot.avatarUrl}
                        alt={displayName}
                        className={`h-20 w-20 rounded-full border object-cover ${
                          githubTheme === "dark"
                            ? "border-[#30363d]"
                            : "border-[#d0d7de]"
                        }`}
                      />
                    ) : (
                      <div
                        className={`flex h-20 w-20 items-center justify-center rounded-full border text-xl font-bold ${
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
                      className={`space-y-1.5 text-xs ${
                        githubTheme === "dark"
                          ? "text-[#8b949e]"
                          : "text-[#656d76]"
                      }`}
                    >
                      {company && (
                        <div className="flex items-center gap-2">
                          <Building2 className="h-3.5 w-3.5 shrink-0" />
                          <span className="truncate">{company}</span>
                        </div>
                      )}
                      {location && (
                        <div className="flex items-center gap-2">
                          <MapPin className="h-3.5 w-3.5 shrink-0" />
                          <span className="truncate">{location}</span>
                        </div>
                      )}
                      {website && (
                        <div className="flex items-center gap-2">
                          <Link2 className="h-3.5 w-3.5 shrink-0" />
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
                    <span>
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
                      className={`space-y-4 ${
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

                          {!isMinimal && enabledBadges.length > 0 && (
                            <div
                              className={`flex flex-wrap gap-1.5 ${
                                isAlignedLeft ? "justify-start" : "justify-center"
                              }`}
                            >
                              {enabledBadges.map((badge) => (
                                <img
                                  key={badge.id}
                                  src={buildShieldBadgeUrl(badge)}
                                  alt={badge.label}
                                  className="h-6 rounded"
                                />
                              ))}
                            </div>
                          )}

                          {!isMinimal && enabledLinks.length > 0 && (
                            <div
                              className={`flex flex-wrap gap-2 ${
                                isAlignedLeft ? "justify-start" : "justify-center"
                              }`}
                            >
                              {enabledLinks.map((link) => (
                                <img
                                  key={link.id}
                                  src={buildActionLinkBadgeUrl(
                                    link,
                                    creatureConfig
                                  )}
                                  alt={link.label}
                                  className="h-6 rounded"
                                />
                              ))}
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
                              780,
                              Math.max(360, readmeConfig.imageWidth)
                            )}px`,
                          }}
                        >
                          <CreatureSvgView
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

                      {readmeConfig.includeShareCard && (
                        <div
                          className={`mx-auto max-w-md overflow-hidden rounded-lg border ${
                            githubTheme === "dark"
                              ? "border-[#30363d]"
                              : "border-[#d0d7de]"
                          }`}
                        >
                          <ShareCardSvgView
                            config={creatureConfig}
                            className="w-full"
                          />
                        </div>
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
                                      Guardian Model
                                    </td>
                                    <td className="px-3 py-1.5 font-medium">
                                      {meta.name} ({creatureConfig.view.toUpperCase()})
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
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-500 dark:text-slate-400">
                  Markdown to be published to{" "}
                  <code>{username}/{username}/README.md</code>
                </span>
                <button
                  type="button"
                  onClick={() => handleCopy("md-tab", readmeMarkdown)}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 dark:border-[#363d4a] dark:bg-[#272c36] dark:text-slate-200"
                >
                  {copiedId === "md-tab" ? (
                    <Check className="h-3.5 w-3.5 text-emerald-500" />
                  ) : (
                    <Copy className="h-3.5 w-3.5" />
                  )}
                  {copiedId === "md-tab" ? "Copied" : "Copy Markdown"}
                </button>
              </div>
              <pre className="max-h-[500px] overflow-auto rounded-xl border border-slate-200 bg-slate-50 p-4 font-mono text-xs leading-relaxed text-slate-800 dark:border-[#363d4a] dark:bg-[#272c36] dark:text-slate-200">
                {readmeMarkdown}
              </pre>
            </div>
          )}

          {codeSubTab === "svg" && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-500 dark:text-slate-400">
                  Self-contained pure CSS animated SVG (
                  {creatureSvg.length.toLocaleString("en-US")} bytes)
                </span>
                <button
                  type="button"
                  onClick={() => handleCopy("svg-tab", creatureSvg)}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 dark:border-[#363d4a] dark:bg-[#272c36] dark:text-slate-200"
                >
                  {copiedId === "svg-tab" ? (
                    <Check className="h-3.5 w-3.5 text-emerald-500" />
                  ) : (
                    <Copy className="h-3.5 w-3.5" />
                  )}
                  {copiedId === "svg-tab" ? "Copied" : "Copy SVG XML"}
                </button>
              </div>
              <pre className="max-h-[500px] overflow-auto rounded-xl border border-slate-200 bg-slate-50 p-4 font-mono text-xs leading-relaxed text-slate-800 dark:border-[#363d4a] dark:bg-[#272c36] dark:text-slate-200">
                {creatureSvg}
              </pre>
            </div>
          )}
        </div>
      )}

      {activeTab === "share-card" && (
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-[#363d4a] dark:bg-[#1e222a]">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
            <div>
              <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100">
                Social &amp; Repository Banner (1280×640)
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Optional exportable banner synced with your creature colors
              </p>
            </div>
            <button
              type="button"
              onClick={() =>
                downloadTextFile("share-card.svg", shareCardSvg, "image/svg+xml")
              }
              className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-400"
            >
              <Download className="h-4 w-4" />
              Download share-card.svg
            </button>
          </div>
          <div className="overflow-hidden rounded-xl border border-slate-200 dark:border-[#363d4a]">
            <ShareCardSvgView config={creatureConfig} className="w-full" />
          </div>
        </div>
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
