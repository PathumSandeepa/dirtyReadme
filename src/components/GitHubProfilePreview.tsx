"use client";

import {
  BookOpen,
  Building2,
  Edit3,
  Link2,
  MapPin,
  Users,
} from "lucide-react";
import { CyberCreatureSvg } from "@/components/CyberCreatureSvg";
import { ShareCardSvg } from "@/components/ShareCardSvg";
import type { GitHubProfileSnapshot } from "@/lib/githubApi";
import { resolveDynamicTokens } from "@/lib/readmeBuilder";
import { getCreatureMeta, getEvolutionStage } from "@/lib/themes";
import type { CreatureConfig, ReadmeConfig } from "@/types/creature";

interface GitHubProfilePreviewProps {
  creatureConfig: CreatureConfig;
  readmeConfig: ReadmeConfig;
  ghSnapshot: GitHubProfileSnapshot | null;
  showProfileSidebar?: boolean;
  showGridBackdrop?: boolean;
  onEditClick?: () => void;
}

export function GitHubProfilePreview({
  creatureConfig,
  readmeConfig,
  ghSnapshot,
  showProfileSidebar = true,
  showGridBackdrop = false,
  onEditClick,
}: GitHubProfilePreviewProps) {
  const safeUser = creatureConfig.username.trim() || "PathumSandeepa";
  const meta = getCreatureMeta(creatureConfig.creature);
  const evolution = getEvolutionStage(creatureConfig.commits);

  const resolvedHeadline = resolveDynamicTokens(
    readmeConfig.headline,
    creatureConfig
  );
  const resolvedBio = resolveDynamicTokens(readmeConfig.bio, creatureConfig);
  const resolvedCta = resolveDynamicTokens(
    readmeConfig.ctaLine,
    creatureConfig
  );
  const resolvedFooter = resolveDynamicTokens(
    readmeConfig.customFooterMarkdown,
    creatureConfig
  );

  const displayName =
    ghSnapshot?.displayName ||
    readmeConfig.profileDisplayName ||
    safeUser;
  const displayAvatar = ghSnapshot?.avatarUrl;

  const readmeBody = (
    <div className="overflow-hidden rounded-xl border border-[#30363d] bg-[#0d1117]">
      {/* GitHub README File Header */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#30363d] bg-[#161b22] px-4 py-2 text-xs">
        <div className="flex items-center gap-2 font-mono">
          <BookOpen className="h-3.5 w-3.5 text-[#8b949e]" />
          <span className="font-semibold text-[#e6edf3]">{safeUser}</span>
          <span className="text-[#8b949e]">/</span>
          <span className="font-semibold text-[#e6edf3]">README.md</span>
        </div>
        {onEditClick && (
          <button
            type="button"
            onClick={onEditClick}
            className="inline-flex items-center gap-1 rounded-md border border-[#30363d] bg-[#0d1117] px-2.5 py-1 text-[11px] font-medium text-[#8b949e] transition hover:border-[#00E676] hover:text-[#00E676]"
          >
            <Edit3 className="h-3 w-3" />
            Customize README
          </button>
        )}
      </div>

      <div className="space-y-4 p-5 sm:p-6">
        {readmeConfig.templateId !== "auto-evolve-block" && (
          <>
            {/* Headline */}
            {resolvedHeadline && (
              <h2 className="border-b border-[#21262d] pb-2 text-xl font-bold text-[#e6edf3]">
                {resolvedHeadline}
              </h2>
            )}

            {/* Pipe-separated Uppercase Subtitle Tags */}
            {readmeConfig.subtitleTags.length > 0 &&
              readmeConfig.templateId !== "minimal-header" && (
                <p className="font-mono text-[11px] font-bold tracking-wider text-[#c9d1d9]">
                  {readmeConfig.subtitleTags
                    .map((t) => t.trim().toUpperCase())
                    .filter(Boolean)
                    .join(" | ")}
                </p>
              )}

            {/* Intro Paragraph */}
            {resolvedBio && (
              <p className="text-sm leading-relaxed text-[#c9d1d9]">
                {resolvedBio}
              </p>
            )}

            {/* CTA Line */}
            {resolvedCta && readmeConfig.templateId !== "minimal-header" && (
              <p className="text-sm text-[#c9d1d9]">{resolvedCta}</p>
            )}

            {/* Colorful for-the-badge Tech Stack Pills */}
            {readmeConfig.templateId !== "minimal-header" &&
              readmeConfig.badges.some((b) => b.enabled) && (
                <div
                  className={`flex flex-wrap gap-1.5 pt-1 ${
                    readmeConfig.align === "center"
                      ? "justify-center"
                      : "justify-start"
                  }`}
                >
                  {readmeConfig.badges
                    .filter((b) => b.enabled)
                    .map((badge) => (
                      <span
                        key={badge.id}
                        className="inline-flex items-center gap-1.5 rounded-[3px] px-2.5 py-1 font-mono text-[10px] font-bold uppercase tracking-wider text-white shadow-sm"
                        style={{
                          backgroundColor: `#${badge.color.replace("#", "")}`,
                          color:
                            badge.color.toUpperCase() === "FCC624"
                              ? "#111111"
                              : "#FFFFFF",
                        }}
                      >
                        {badge.label}
                      </span>
                    ))}
                </div>
              )}

            {/* Social / Action Link Pills */}
            {readmeConfig.templateId !== "minimal-header" &&
              readmeConfig.actionLinks.some((l) => l.enabled) && (
                <div
                  className={`flex flex-wrap gap-2 pt-1 ${
                    readmeConfig.align === "center"
                      ? "justify-center"
                      : "justify-start"
                  }`}
                >
                  {readmeConfig.actionLinks
                    .filter((l) => l.enabled)
                    .map((link) => (
                      <a
                        key={link.id}
                        href={resolveDynamicTokens(link.url, creatureConfig)}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex overflow-hidden rounded-[3px] border border-[#30363d]/60 font-mono text-[10px] font-bold uppercase tracking-wider transition hover:opacity-90"
                      >
                        <span className="bg-[#1F242D] px-2.5 py-1 text-[#e6edf3]">
                          {link.label}
                        </span>
                        <span
                          className="px-2.5 py-1 text-white"
                          style={{
                            backgroundColor: `#${link.color.replace("#", "")}`,
                          }}
                        >
                          {link.valueText}
                        </span>
                      </a>
                    ))}
                </div>
              )}
          </>
        )}

        {/* Animated Cybernetic Creature Centerpiece */}
        <div
          className={`relative overflow-hidden rounded-lg border border-[#21262d] p-2 sm:p-3 ${
            showGridBackdrop ? "transparency-grid" : "bg-[#0d1117]"
          }`}
        >
          <div
            className="mx-auto"
            style={{ maxWidth: `${readmeConfig.imageWidth}px` }}
          >
            <CyberCreatureSvg
              config={creatureConfig}
              className="block h-auto w-full"
            />
          </div>
        </div>

        {/* Dynamic Telemetry Caption */}
        {readmeConfig.includeTelemetryCaption && (
          <p className="text-center text-xs italic text-[#8b949e]">
            Live{" "}
            <code className="rounded bg-[#161b22] px-1.5 py-0.5 not-italic text-[#c9d1d9]">
              dynamic-readme-creature
            </code>{" "}
            for{" "}
            <span className="not-italic text-[#58a6ff]">@{safeUser}</span> —{" "}
            <strong className="not-italic text-[#e6edf3]">
              Stage {evolution.stage}: {evolution.rank} {meta.name}
            </strong>{" "}
            ·{" "}
            <code className="not-italic">
              {creatureConfig.commits.toLocaleString("en-US")} commits
            </code>{" "}
            · View: <code className="not-italic">{creatureConfig.view}</code>
          </p>
        )}

        {/* Optional Cybernetic Telemetry Table */}
        {readmeConfig.includeStatsTable &&
          readmeConfig.templateId !== "minimal-header" &&
          readmeConfig.templateId !== "auto-evolve-block" && (
            <div className="overflow-hidden rounded-lg border border-[#30363d] text-xs">
              <table className="w-full text-left">
                <thead className="border-b border-[#30363d] bg-[#161b22] text-[#8b949e]">
                  <tr>
                    <th className="px-3 py-2 font-medium">Metric</th>
                    <th className="px-3 py-2 font-medium">Active Value</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#21262d]">
                  <tr>
                    <td className="px-3 py-2 font-medium text-[#c9d1d9]">
                      Guardian Chassis
                    </td>
                    <td className="px-3 py-2 font-mono text-[#e6edf3]">
                      {meta.name} ({meta.designation})
                    </td>
                  </tr>
                  <tr>
                    <td className="px-3 py-2 font-medium text-[#c9d1d9]">
                      Evolution Stage
                    </td>
                    <td className="px-3 py-2 font-mono text-[#00E676]">
                      Stage {evolution.stage} / 5 — {evolution.rank}
                    </td>
                  </tr>
                  <tr>
                    <td className="px-3 py-2 font-medium text-[#c9d1d9]">
                      Contributions ({creatureConfig.windowMode})
                    </td>
                    <td className="px-3 py-2 font-mono text-[#e6edf3]">
                      {creatureConfig.commits.toLocaleString("en-US")} commits
                    </td>
                  </tr>
                  <tr>
                    <td className="px-3 py-2 font-medium text-[#c9d1d9]">
                      Top Languages
                    </td>
                    <td className="px-3 py-2 font-mono text-[#e6edf3]">
                      {creatureConfig.languages.map((l) => l.name).join(" · ")}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          )}

        {/* Optional Annual Share Card */}
        {readmeConfig.includeShareCard && (
          <div className="rounded-lg border border-[#21262d] bg-[#070b12] p-2">
            <ShareCardSvg
              config={creatureConfig}
              className="mx-auto block h-auto w-full"
            />
          </div>
        )}

        {/* Custom Footer */}
        {resolvedFooter && (
          <pre className="whitespace-pre-wrap rounded-lg border border-[#21262d] bg-[#161b22]/50 p-3 font-mono text-xs text-[#c9d1d9]">
            {resolvedFooter}
          </pre>
        )}
      </div>
    </div>
  );

  if (!showProfileSidebar) {
    return readmeBody;
  }

  return (
    <div className="grid grid-cols-1 gap-5 rounded-xl border border-[#21262d] bg-[#010409] p-4 md:grid-cols-12">
      {/* Realistic GitHub Profile Left Sidebar */}
      <aside className="space-y-3 md:col-span-4 xl:col-span-3">
        <div className="flex items-center gap-3 md:flex-col md:items-start">
          {displayAvatar ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={displayAvatar}
              alt={displayName}
              className="h-16 w-16 rounded-full border-2 border-[#30363d] object-cover md:h-28 md:w-28"
            />
          ) : (
            <div className="flex h-16 w-16 items-center justify-center rounded-full border-2 border-[#30363d] bg-gradient-to-br from-[#161b22] to-[#0d1117] font-mono text-xl font-bold text-[#FF6B00] md:h-28 md:w-28 md:text-3xl">
              {safeUser.slice(0, 2).toUpperCase()}
            </div>
          )}

          <div>
            <div className="text-base font-bold text-white">{displayName}</div>
            <div className="font-mono text-xs text-[#8b949e]">@{safeUser}</div>
          </div>
        </div>

        <div className="rounded-md border border-[#30363d] bg-[#21262d] py-1.5 text-center text-xs font-medium text-[#c9d1d9]">
          Edit profile
        </div>

        <p className="text-xs leading-relaxed text-[#c9d1d9]">
          {ghSnapshot?.bio ||
            "Systems & creative developer building animated README ecosystems."}
        </p>

        <div className="space-y-1.5 text-[11px] text-[#8b949e]">
          <div className="flex items-center gap-1.5">
            <Users className="h-3.5 w-3.5" />
            <span>
              <strong className="text-[#e6edf3]">
                {ghSnapshot?.followers ?? 42}
              </strong>{" "}
              followers ·{" "}
              <strong className="text-[#e6edf3]">
                {ghSnapshot?.publicRepos ?? 24}
              </strong>{" "}
              repos
            </span>
          </div>
          {readmeConfig.profileCompany && (
            <div className="flex items-center gap-1.5">
              <Building2 className="h-3.5 w-3.5" />
              <span>{readmeConfig.profileCompany}</span>
            </div>
          )}
          {readmeConfig.profileLocation && (
            <div className="flex items-center gap-1.5">
              <MapPin className="h-3.5 w-3.5" />
              <span>{readmeConfig.profileLocation}</span>
            </div>
          )}
          {readmeConfig.profileWebsite && (
            <div className="flex items-center gap-1.5 truncate">
              <Link2 className="h-3.5 w-3.5 shrink-0" />
              <span className="truncate text-[#58a6ff]">
                {readmeConfig.profileWebsite}
              </span>
            </div>
          )}
        </div>
      </aside>

      {/* Main GitHub Profile README Column */}
      <div className="md:col-span-8 xl:col-span-9">{readmeBody}</div>
    </div>
  );
}
