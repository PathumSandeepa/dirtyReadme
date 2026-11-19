"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Activity,
  Camera,
  Check,
  CheckCircle2,
  Code2,
  Copy,
  Cpu,
  Download,
  Edit3,
  Eye,
  FileText,
  GitCommitHorizontal,
  Image as ImageIcon,
  Layers,
  Loader2,
  Palette,
  RefreshCw,
  RotateCcw,
  Share2,
  Sliders,
  Sparkles,
  Terminal,
  UploadCloud,
  UserSquare2,
  Users,
  Zap,
} from "lucide-react";
import { AutoEvolveModal } from "@/components/AutoEvolveModal";
import { CreatureComparator } from "@/components/CreatureComparator";
import { EvolutionMatrix } from "@/components/EvolutionMatrix";
import { GitHubProfilePreview } from "@/components/GitHubProfilePreview";
import { PublishProfileRepoModal } from "@/components/PublishProfileRepoModal";
import { ReadmeEditorPanel } from "@/components/ReadmeEditorPanel";
import { ShareCardSvg } from "@/components/ShareCardSvg";
import { generateShareCardSvgString } from "@/lib/generateShareCardSvg";
import { generateSvgString } from "@/lib/generateSvgString";
import {
  type GitHubProfileSnapshot,
  fetchGitHubProfileSnapshot,
} from "@/lib/githubApi";
import {
  DEFAULT_README_CONFIG,
  buildMarkerSection,
  getEffectiveReadmeMarkdown,
} from "@/lib/readmeBuilder";
import {
  CAMERA_VIEWS,
  CREATURE_CATALOG,
  DEFAULT_CONFIG,
  STAGE_DEFINITIONS,
  THEME_PRESETS,
  applyLanguageColors,
  getCreatureMeta,
  getEvolutionStage,
  normalizeHex,
  resolveBackgroundHex,
} from "@/lib/themes";
import type {
  BackgroundMode,
  CameraView,
  ContributionWindow,
  CreatureConfig,
  CreatureId,
  ReadmeConfig,
} from "@/types/creature";

type WorkspaceTab =
  | "studio"
  | "readme-editor"
  | "share-card"
  | "comparator"
  | "evolution";

interface ColorControlProps {
  label: string;
  sublabel: string;
  value: string;
  onChange: (hex: string) => void;
}

function ColorControl({
  label,
  sublabel,
  value,
  onChange,
}: ColorControlProps) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-lg border border-[#30363d]/80 bg-[#0d1117] px-3 py-2">
      <div className="min-w-0">
        <div className="text-xs font-medium text-[#e6edf3]">{label}</div>
        <div className="truncate text-[11px] text-[#8b949e]">{sublabel}</div>
      </div>
      <div className="flex shrink-0 items-center gap-2">
        <span className="font-mono text-[11px] uppercase text-[#8b949e]">
          {value}
        </span>
        <label className="relative flex h-7 w-7 cursor-pointer items-center justify-center overflow-hidden rounded-md border border-[#30363d] shadow-inner">
          <input
            type="color"
            value={normalizeHex(value)}
            onChange={(e) => onChange(e.target.value.toUpperCase())}
            aria-label={label}
            className="absolute -inset-2 h-12 w-12 cursor-pointer border-0 bg-transparent p-0"
          />
        </label>
      </div>
    </div>
  );
}

function triggerFileDownload(
  filename: string,
  content: string,
  mimeType = "image/svg+xml;charset=utf-8"
) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}

export function CreatureStudio() {
  const [activeTab, setActiveTab] = useState<WorkspaceTab>("studio");
  const [config, setConfig] = useState<CreatureConfig>(DEFAULT_CONFIG);
  const [readmeConfig, setReadmeConfig] = useState<ReadmeConfig>(
    DEFAULT_README_CONFIG
  );
  const [customBgHex, setCustomBgHex] = useState<string>("#0B1020");
  const [copiedSnippet, setCopiedSnippet] = useState<
    "md" | "html" | "readme" | "svg" | null
  >(null);
  const [previewMode, setPreviewMode] = useState<"preview" | "edit" | "code">(
    "preview"
  );
  const [showProfileSidebar, setShowProfileSidebar] = useState(true);
  const [showGridBackdrop, setShowGridBackdrop] = useState(false);
  const [evolveModalOpen, setEvolveModalOpen] = useState(false);
  const [publishModalOpen, setPublishModalOpen] = useState(false);

  const [ghInput, setGhInput] = useState(DEFAULT_CONFIG.username);
  const [ghLoading, setGhLoading] = useState(false);
  const [ghError, setGhError] = useState<string | null>(null);
  const [ghSnapshot, setGhSnapshot] = useState<GitHubProfileSnapshot | null>(
    null
  );

  const meta = getCreatureMeta(config.creature);
  const evolution = getEvolutionStage(config.commits);
  const safeUser = config.username.trim() || "PathumSandeepa";

  const markdownSnippet = `![Cyber Creature](./creature.svg)`;
  const markerSnippet = useMemo(
    () => buildMarkerSection(config, readmeConfig),
    [config, readmeConfig]
  );
  const fullReadmeMarkdown = useMemo(
    () => getEffectiveReadmeMarkdown(config, readmeConfig),
    [config, readmeConfig]
  );
  const rawSvgSource = useMemo(() => generateSvgString(config), [config]);
  const shareCardSvgSource = useMemo(
    () => generateShareCardSvgString(config),
    [config]
  );

  function applySnapshotToState(snap: GitHubProfileSnapshot) {
    setGhSnapshot(snap);
    setConfig((prev) => {
      const nextCommits =
        prev.windowMode === "rolling"
          ? snap.rollingCommits
          : snap.annualCommits;
      const updated: CreatureConfig = {
        ...prev,
        username: snap.username,
        commits: nextCommits,
        languages: snap.languages,
      };
      return prev.colorMode === "languages"
        ? applyLanguageColors(updated, snap.languages)
        : updated;
    });

    setReadmeConfig((prev) => {
      const langSet = new Set(snap.languages.map((l) => l.name.toLowerCase()));
      const nextLinks = [
        {
          id: "github",
          label: "GITHUB",
          valueText: `@${snap.username}`,
          url: `https://github.com/${snap.username}`,
          color: "181717",
          logo: "github",
          enabled: true,
        },
        ...(snap.website
          ? [
              {
                id: "website",
                label: "WEBSITE",
                valueText: snap.website
                  .replace(/^https?:\/\//i, "")
                  .replace(/\/$/, "")
                  .toUpperCase(),
                url: snap.website,
                color: "FF6B00",
                logo: "googlechrome",
                enabled: true,
              },
            ]
          : []),
        ...(snap.twitterUsername
          ? [
              {
                id: "x",
                label: "X",
                valueText: `@${snap.twitterUsername}`,
                url: `https://x.com/${snap.twitterUsername}`,
                color: "000000",
                logo: "x",
                enabled: true,
              },
            ]
          : []),
      ];

      return {
        ...prev,
        profileDisplayName: snap.displayName,
        profileLocation: snap.location || prev.profileLocation,
        profileCompany: snap.company || prev.profileCompany,
        profileWebsite: snap.website || prev.profileWebsite,
        headline: `${snap.displayName} | Developer Profile`,
        bio: snap.bio,
        actionLinks: nextLinks,
        projects:
          snap.featuredRepos.length > 0 ? snap.featuredRepos : prev.projects,
        badges: prev.badges.map((b) =>
          langSet.has(b.label.toLowerCase()) ? { ...b, enabled: true } : b
        ),
      };
    });
  }

  useEffect(() => {
    let cancelled = false;
    fetchGitHubProfileSnapshot(DEFAULT_CONFIG.username)
      .then((snap) => {
        if (!cancelled) applySnapshotToState(snap);
      })
      .catch(() => {
        // Silent fallback on initial mount if offline or rate-limited
      });
    return () => {
      cancelled = true;
    };
  }, []);

  async function handleSyncGitHub(e?: React.FormEvent) {
    if (e) e.preventDefault();
    setGhLoading(true);
    setGhError(null);
    try {
      const snap = await fetchGitHubProfileSnapshot(ghInput);
      applySnapshotToState(snap);
    } catch (err) {
      setGhError(
        err instanceof Error ? err.message : "Failed to load GitHub data."
      );
    } finally {
      setGhLoading(false);
    }
  }

  function selectCreature(creature: CreatureId) {
    setConfig((prev) => ({ ...prev, creature }));
  }

  function selectView(view: CameraView) {
    setConfig((prev) => ({ ...prev, view }));
  }

  function selectWindow(windowMode: ContributionWindow) {
    setConfig((prev) => ({
      ...prev,
      windowMode,
      commits: ghSnapshot
        ? windowMode === "rolling"
          ? ghSnapshot.rollingCommits
          : ghSnapshot.annualCommits
        : prev.commits,
    }));
  }

  function applyThemePreset(presetId: (typeof THEME_PRESETS)[number]["id"]) {
    const preset = THEME_PRESETS.find((t) => t.id === presetId);
    if (!preset) return;
    setConfig((prev) => ({
      ...prev,
      colorMode: "canonical",
      themeId: preset.id,
      colors: {
        ...preset.colors,
        background: prev.colors.background,
      },
    }));
  }

  function handleSyncLanguageColors() {
    setConfig((prev) => applyLanguageColors(prev, prev.languages));
  }

  function updateColor(key: "primary" | "accent" | "energy", hex: string) {
    setConfig((prev) => ({
      ...prev,
      colorMode: "custom",
      themeId: "custom",
      colors: {
        ...prev.colors,
        [key]: hex.toUpperCase(),
      },
    }));
  }

  function setBackgroundMode(mode: BackgroundMode) {
    setConfig((prev) => ({
      ...prev,
      backgroundMode: mode,
      colors: {
        ...prev.colors,
        background: resolveBackgroundHex(mode, customBgHex),
      },
    }));
  }

  function handleCustomBgChange(hex: string) {
    const normalized = hex.toUpperCase();
    setCustomBgHex(normalized);
    setConfig((prev) => ({
      ...prev,
      backgroundMode: "custom",
      colors: {
        ...prev.colors,
        background: normalized,
      },
    }));
  }

  async function handleCopy(target: "md" | "html" | "readme" | "svg") {
    const text =
      target === "md"
        ? markdownSnippet
        : target === "html"
          ? markerSnippet
          : target === "readme"
            ? fullReadmeMarkdown
            : rawSvgSource;
    await navigator.clipboard.writeText(text);
    setCopiedSnippet(target);
    setTimeout(() => setCopiedSnippet(null), 2000);
  }

  function handleReset() {
    setConfig(DEFAULT_CONFIG);
    setReadmeConfig(DEFAULT_README_CONFIG);
    setGhInput(DEFAULT_CONFIG.username);
    setGhSnapshot(null);
    setGhError(null);
    setCustomBgHex("#0B1020");
  }

  return (
    <div className="min-h-screen bg-[#07090d] text-[#e6edf3]">
      {/* Top Studio Command Bar */}
      <header className="sticky top-0 z-30 border-b border-[#21262d] bg-[#0d1117]/92 backdrop-blur-md">
        <div className="mx-auto flex max-w-[1440px] flex-wrap items-center justify-between gap-3 px-4 py-3 sm:px-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-[#FF6B00]/40 bg-gradient-to-br from-[#FF6B00]/20 to-[#00E676]/10">
              <Cpu className="h-5 w-5 text-[#FF6B00]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base font-bold tracking-tight text-white sm:text-lg">
                  dynamic-readme-creature
                </h1>
                <span className="hidden rounded-full border border-[#00E676]/40 bg-[#00E676]/10 px-2 py-0.5 font-mono text-[10px] font-semibold text-[#00E676] sm:inline-block">
                  PURE CSS SVG
                </span>
              </div>
              <p className="text-xs text-[#8b949e]">
                Cybernetic creature generator &amp; profile README studio ·{" "}
                <span className="font-mono text-[#c9d1d9]">@PathumSandeepa</span>
              </p>
            </div>
          </div>

          <nav
            aria-label="Studio workspace views"
            className="flex flex-wrap items-center gap-1 rounded-xl border border-[#21262d] bg-[#07090d] p-1"
          >
            {(
              [
                { id: "studio", label: "Studio", icon: Sliders },
                { id: "readme-editor", label: "Profile README", icon: FileText },
                { id: "share-card", label: "Social Card", icon: Share2 },
                { id: "comparator", label: "Compare Users", icon: Users },
                { id: "evolution", label: "Stages & Views", icon: Layers },
              ] as const
            ).map((tab) => {
              const Icon = tab.icon;
              const active = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={`inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium transition sm:px-3 ${
                    active
                      ? "bg-[#21262d] text-white shadow-sm"
                      : "text-[#8b949e] hover:text-[#e6edf3]"
                  }`}
                >
                  <Icon className="h-3.5 w-3.5 text-[#FF6B00]" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleReset}
              className="inline-flex items-center gap-1.5 rounded-lg border border-[#30363d] bg-[#161b22] px-3 py-1.5 text-xs font-medium text-[#c9d1d9] transition hover:border-[#8b949e] hover:text-white"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              Reset
            </button>
            <button
              type="button"
              onClick={() => triggerFileDownload("creature.svg", rawSvgSource)}
              className="inline-flex items-center gap-1.5 rounded-lg bg-[#FF6B00] px-3.5 py-1.5 text-xs font-semibold text-white shadow-sm transition hover:bg-[#ff7f24]"
            >
              <Download className="h-3.5 w-3.5" />
              Export SVG
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-[1440px] px-4 py-6 sm:px-6">
        {activeTab === "comparator" && <CreatureComparator baseConfig={config} />}

        {activeTab === "evolution" && (
          <EvolutionMatrix
            config={config}
            onSelectCommits={(commits) => {
              setConfig((prev) => ({ ...prev, commits }));
              setActiveTab("studio");
            }}
            onSelectView={(view) => {
              selectView(view);
              setActiveTab("studio");
            }}
          />
        )}

        {activeTab === "readme-editor" && (
          <div className="space-y-6">
            <div className="overflow-hidden rounded-xl border border-[#30363d] bg-[#0d1117]">
              <ReadmeEditorPanel
                creatureConfig={config}
                readmeConfig={readmeConfig}
                onChange={setReadmeConfig}
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs font-semibold text-[#e6edf3]">
                  Live GitHub Profile Page Preview (@{safeUser})
                </span>
                <button
                  type="button"
                  onClick={() =>
                    triggerFileDownload(
                      "README.md",
                      fullReadmeMarkdown,
                      "text/markdown;charset=utf-8"
                    )
                  }
                  className="inline-flex items-center gap-1.5 rounded-lg bg-[#FF6B00] px-3 py-1.5 text-xs font-semibold text-white hover:bg-[#ff7f24]"
                >
                  <Download className="h-3.5 w-3.5" />
                  Download README.md
                </button>
              </div>
              <GitHubProfilePreview
                creatureConfig={config}
                readmeConfig={readmeConfig}
                ghSnapshot={ghSnapshot}
                showProfileSidebar
                showGridBackdrop={showGridBackdrop}
              />
            </div>
          </div>
        )}

        {activeTab === "share-card" && (
          <div className="space-y-5">
            <div className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-[#21262d] bg-[#161b22]/75 p-5">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-[#1F6FEB]/50 bg-[#1F6FEB]/15 text-[#58a6ff]">
                  <ImageIcon className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-white">
                    Shareable Telemetry Card (1280×640)
                  </h2>
                  <p className="text-xs text-[#8b949e]">
                    Ready to post on X, LinkedIn, Discord, or embed in your
                    GitHub Profile README.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() =>
                  triggerFileDownload(
                    "share-card.svg",
                    generateShareCardSvgString(config)
                  )
                }
                className="inline-flex items-center gap-2 rounded-xl bg-[#FF6B00] px-4 py-2.5 text-xs font-semibold text-white transition hover:bg-[#ff7f24]"
              >
                <Download className="h-4 w-4" />
                Download share-card.svg
              </button>
            </div>

            <div className="overflow-hidden rounded-xl border border-[#30363d] bg-[#070b12] p-4 shadow-2xl">
              <ShareCardSvg
                config={config}
                className="mx-auto block h-auto w-full max-w-[1100px]"
              />
            </div>
          </div>
        )}

        {activeTab === "studio" && (
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
            {/* LEFT PANEL — CUSTOMIZATION CONTROLS */}
            <aside className="space-y-4 lg:col-span-4 xl:col-span-4">
              {/* 0. GitHub Profile Sync */}
              <section className="rounded-xl border border-[#21262d] bg-[#161b22]/75 p-4">
                <div className="mb-2.5 flex items-center justify-between">
                  <h2 className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#e6edf3]">
                    <Terminal className="h-4 w-4 text-[#00E676]" />
                    GitHub Profile Sync
                  </h2>
                  <div className="flex rounded-md border border-[#30363d] bg-[#0d1117] p-0.5 text-[10px]">
                    {(["annual", "rolling"] as const).map((win) => (
                      <button
                        key={win}
                        type="button"
                        onClick={() => selectWindow(win)}
                        className={`rounded px-2 py-0.5 font-mono uppercase transition ${
                          config.windowMode === win
                            ? "bg-[#21262d] text-white"
                            : "text-[#8b949e]"
                        }`}
                      >
                        {win}
                      </button>
                    ))}
                  </div>
                </div>

                <form onSubmit={handleSyncGitHub} className="flex gap-2">
                  <input
                    type="text"
                    value={ghInput}
                    onChange={(e) => {
                      setGhInput(e.target.value);
                      setConfig((prev) => ({
                        ...prev,
                        username: e.target.value,
                      }));
                    }}
                    placeholder="GitHub username (e.g. PathumSandeepa)"
                    aria-label="GitHub username"
                    className="flex-1 rounded-lg border border-[#30363d] bg-[#0d1117] px-3 py-2 font-mono text-xs text-white placeholder-[#6e7681] focus:border-[#00E676] focus:outline-none"
                  />
                  <button
                    type="submit"
                    disabled={ghLoading}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-[#30363d] bg-[#21262d] px-3 py-2 text-xs font-semibold text-[#e6edf3] transition hover:border-[#00E676] hover:text-white disabled:opacity-50"
                  >
                    {ghLoading ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <RefreshCw className="h-3.5 w-3.5" />
                    )}
                    Sync
                  </button>
                </form>

                {ghError && (
                  <p className="mt-2 rounded-md border border-red-500/40 bg-red-500/10 px-2.5 py-1.5 text-[11px] text-red-300">
                    {ghError}
                  </p>
                )}

                <div className="mt-2.5 flex flex-wrap items-center justify-between gap-2">
                  <div className="flex flex-wrap gap-1.5">
                    {config.languages.map((lang) => (
                      <span
                        key={lang.name}
                        className="inline-flex items-center gap-1 rounded border border-[#30363d] bg-[#0d1117] px-2 py-0.5 font-mono text-[10px] text-[#c9d1d9]"
                      >
                        <span
                          className="h-2 w-2 rounded-full"
                          style={{ backgroundColor: lang.color }}
                        />
                        {lang.name}
                      </span>
                    ))}
                  </div>
                  <button
                    type="button"
                    onClick={handleSyncLanguageColors}
                    className="font-mono text-[10px] font-semibold text-[#58a6ff] hover:underline"
                  >
                    Apply Lang Colors
                  </button>
                </div>

                {ghSnapshot && (
                  <div className="mt-2.5 space-y-2 border-t border-[#21262d] pt-2.5">
                    <p className="text-[10px] text-[#8b949e]">
                      Synced @{ghSnapshot.username}: {ghSnapshot.publicRepos}{" "}
                      repos · {ghSnapshot.totalStars} stars ·{" "}
                      {ghSnapshot.annualCommits} ({new Date().getUTCFullYear()}) /{" "}
                      {ghSnapshot.rollingCommits} (365d)
                    </p>

                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <span
                        className={`inline-flex items-center gap-1 rounded px-2 py-0.5 font-mono text-[10px] font-semibold ${
                          ghSnapshot.profileRepoExists
                            ? "border border-[#00E676]/40 bg-[#00E676]/10 text-[#00E676]"
                            : "border border-[#FF6B00]/40 bg-[#FF6B00]/10 text-[#FF6B00]"
                        }`}
                      >
                        <CheckCircle2 className="h-3 w-3" />
                        {ghSnapshot.profileRepoExists
                          ? `${ghSnapshot.username}/${ghSnapshot.username} ready`
                          : `Create ${ghSnapshot.username}/${ghSnapshot.username}`}
                      </span>

                      <div className="flex items-center gap-1.5">
                        {ghSnapshot.existingProfileReadme && (
                          <button
                            type="button"
                            onClick={() => {
                              setReadmeConfig((prev) => ({
                                ...prev,
                                rawOverride: `${markerSnippet}\n\n${ghSnapshot.existingProfileReadme}`,
                              }));
                              setPreviewMode("edit");
                            }}
                            className="rounded border border-[#30363d] bg-[#0d1117] px-2 py-0.5 font-mono text-[10px] text-[#c9d1d9] hover:border-[#8b949e] hover:text-white"
                          >
                            Import Current README
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => setPublishModalOpen(true)}
                          className="inline-flex items-center gap-1 rounded bg-[#FF6B00] px-2 py-0.5 font-mono text-[10px] font-semibold text-white hover:bg-[#ff7f24]"
                        >
                          <UploadCloud className="h-3 w-3" />
                          Push to Repo
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </section>

              {/* 1. Chassis & Camera Perspective */}
              <section className="rounded-xl border border-[#21262d] bg-[#161b22]/75 p-4">
                <div className="mb-3 flex items-center justify-between">
                  <h2 className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#e6edf3]">
                    <Sparkles className="h-4 w-4 text-[#FF6B00]" />
                    1. Chassis &amp; Perspective
                  </h2>
                  <span className="font-mono text-[11px] text-[#8b949e]">
                    {meta.designation}
                  </span>
                </div>

                <div className="grid grid-cols-1 gap-2">
                  {CREATURE_CATALOG.map((item) => {
                    const selected = config.creature === item.id;
                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => selectCreature(item.id)}
                        className={`group flex flex-col items-start rounded-lg border p-2.5 text-left transition ${
                          selected
                            ? "border-[#FF6B00] bg-[#FF6B00]/10 shadow-[0_0_0_1px_rgba(255,107,0,0.3)]"
                            : "border-[#30363d]/80 bg-[#0d1117] hover:border-[#484f58]"
                        }`}
                      >
                        <div className="flex w-full items-center justify-between">
                          <div>
                            <span className="text-xs font-semibold text-white">
                              {item.name}
                            </span>
                            <span className="ml-1.5 text-[11px] text-[#8b949e]">
                              · {item.subtitle}
                            </span>
                          </div>
                          <span
                            className={`h-2 w-2 rounded-full transition ${
                              selected
                                ? "bg-[#00E676] shadow-[0_0_8px_#00E676]"
                                : "bg-[#30363d] group-hover:bg-[#484f58]"
                            }`}
                          />
                        </div>
                        <p className="mt-1 text-[11px] leading-snug text-[#8b949e]">
                          {item.description}
                        </p>
                      </button>
                    );
                  })}
                </div>

                <div className="mt-3 border-t border-[#21262d] pt-3">
                  <div className="mb-2 flex items-center justify-between">
                    <span className="flex items-center gap-1.5 text-xs font-medium text-[#e6edf3]">
                      <Camera className="h-3.5 w-3.5 text-[#00E676]" />
                      Camera Angle (<code className="text-[#FF6B00]">view</code>)
                    </span>
                    <span className="font-mono text-[10px] uppercase text-[#8b949e]">
                      {config.view}
                    </span>
                  </div>
                  <div className="grid grid-cols-3 gap-1.5">
                    {CAMERA_VIEWS.map((v) => (
                      <button
                        key={v.id}
                        type="button"
                        onClick={() => selectView(v.id)}
                        className={`rounded-md border px-2 py-1.5 text-xs font-medium transition ${
                          config.view === v.id
                            ? "border-[#00E676] bg-[#00E676]/15 text-white"
                            : "border-[#30363d] bg-[#0d1117] text-[#8b949e] hover:text-white"
                        }`}
                      >
                        {v.shortLabel}
                      </button>
                    ))}
                  </div>
                </div>
              </section>

              {/* 2. Color Customizer */}
              <section className="rounded-xl border border-[#21262d] bg-[#161b22]/75 p-4">
                <div className="mb-3 flex items-center justify-between">
                  <h2 className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#e6edf3]">
                    <Palette className="h-4 w-4 text-[#00E676]" />
                    2. Armor &amp; Energy Palette
                  </h2>
                  <span className="font-mono text-[10px] uppercase text-[#00E676]">
                    {config.colorMode}
                  </span>
                </div>

                <div className="mb-3 grid grid-cols-2 gap-2">
                  {THEME_PRESETS.map((preset) => {
                    const active =
                      config.colorMode === "canonical" &&
                      config.themeId === preset.id;
                    return (
                      <button
                        key={preset.id}
                        type="button"
                        onClick={() => applyThemePreset(preset.id)}
                        className={`flex flex-col rounded-lg border p-2 text-left transition ${
                          active
                            ? "border-[#00E676] bg-[#00E676]/10"
                            : "border-[#30363d]/80 bg-[#0d1117] hover:border-[#484f58]"
                        }`}
                      >
                        <div className="flex items-center gap-1.5">
                          <span
                            className="h-3 w-3 rounded-full border border-white/20"
                            style={{ backgroundColor: preset.colors.primary }}
                          />
                          <span
                            className="h-3 w-3 rounded-full border border-white/20"
                            style={{ backgroundColor: preset.colors.accent }}
                          />
                          <span
                            className="h-3 w-3 rounded-full border border-white/20"
                            style={{ backgroundColor: preset.colors.energy }}
                          />
                        </div>
                        <div className="mt-1 text-[11px] font-semibold text-[#e6edf3]">
                          {preset.name}
                        </div>
                      </button>
                    );
                  })}
                </div>

                <div className="space-y-2">
                  <ColorControl
                    label="Primary Armor (75%)"
                    sublabel="Modular carapace & feather blades"
                    value={config.colors.primary}
                    onChange={(hex) => updateColor("primary", hex)}
                  />
                  <ColorControl
                    label="Accent 1 (Secondary)"
                    sublabel="Wing tips, rings & hazard stripes"
                    value={config.colors.accent}
                    onChange={(hex) => updateColor("accent", hex)}
                  />
                  <ColorControl
                    label="Energy Glow Core"
                    sublabel="Optic sensors, circuitry & cable tips"
                    value={config.colors.energy}
                    onChange={(hex) => updateColor("energy", hex)}
                  />
                </div>

                <div className="mt-3 rounded-lg border border-[#30363d]/80 bg-[#0d1117] p-2.5">
                  <div className="mb-1.5 flex items-center justify-between">
                    <span className="text-xs font-medium text-[#e6edf3]">
                      SVG Canvas Background
                    </span>
                    <span className="font-mono text-[10px] text-[#8b949e]">
                      {config.colors.background}
                    </span>
                  </div>
                  <div className="grid grid-cols-4 gap-1.5">
                    {(
                      [
                        { id: "transparent", label: "Transparent" },
                        { id: "black", label: "Black" },
                        { id: "github-dark", label: "GH Dark" },
                        { id: "custom", label: "Custom" },
                      ] as const
                    ).map((bg) => (
                      <button
                        key={bg.id}
                        type="button"
                        onClick={() => setBackgroundMode(bg.id)}
                        className={`rounded-md border px-1.5 py-1 text-[11px] font-medium transition ${
                          config.backgroundMode === bg.id
                            ? "border-[#FF6B00] bg-[#FF6B00]/15 text-white"
                            : "border-[#30363d] bg-[#161b22] text-[#8b949e] hover:text-[#e6edf3]"
                        }`}
                      >
                        {bg.label}
                      </button>
                    ))}
                  </div>
                  {config.backgroundMode === "custom" && (
                    <div className="mt-2 flex items-center justify-between border-t border-[#21262d] pt-2">
                      <span className="text-[11px] text-[#8b949e]">
                        Custom background hex
                      </span>
                      <input
                        type="color"
                        value={customBgHex}
                        onChange={(e) => handleCustomBgChange(e.target.value)}
                        aria-label="Custom SVG background color"
                        className="h-7 w-12 cursor-pointer rounded border border-[#30363d] bg-transparent"
                      />
                    </div>
                  )}
                </div>
              </section>

              {/* 3. Evolution Stage, Motion & HUD Controls */}
              <section className="rounded-xl border border-[#21262d] bg-[#161b22]/75 p-4">
                <div className="mb-3 flex items-center justify-between">
                  <h2 className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#e6edf3]">
                    <Sliders className="h-4 w-4 text-[#FF6B00]" />
                    3. Evolution, Motion &amp; HUD
                  </h2>
                  <span className="font-mono text-[11px] text-[#00E676]">
                    STAGE {evolution.stage}/5
                  </span>
                </div>

                <div className="mb-3 rounded-lg border border-[#30363d]/80 bg-[#0d1117] p-2.5">
                  <div className="mb-1.5 flex items-center justify-between text-xs">
                    <span className="font-medium text-[#e6edf3]">
                      Evolution Stage
                    </span>
                    <span className="font-mono text-[10px] text-[#FF6B00]">
                      {evolution.rank} ({evolution.rangeLabel})
                    </span>
                  </div>
                  <div className="grid grid-cols-5 gap-1">
                    {STAGE_DEFINITIONS.map((st) => (
                      <button
                        key={st.stage}
                        type="button"
                        onClick={() =>
                          setConfig((prev) => ({
                            ...prev,
                            commits: st.sampleCommits,
                          }))
                        }
                        className={`rounded border py-1 font-mono text-[10px] font-semibold transition ${
                          evolution.stage === st.stage
                            ? "border-[#00E676] bg-[#00E676]/20 text-[#00E676]"
                            : "border-[#30363d] bg-[#161b22] text-[#8b949e] hover:text-white"
                        }`}
                      >
                        S{st.stage}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="rounded-lg border border-[#30363d]/80 bg-[#0d1117] p-3">
                    <div className="mb-1.5 flex items-center justify-between">
                      <label
                        htmlFor="speed-slider"
                        className="flex items-center gap-1.5 text-xs font-medium text-[#e6edf3]"
                      >
                        <Activity className="h-3.5 w-3.5 text-[#00E676]" />
                        Animation Speed
                      </label>
                      <span className="rounded bg-[#161b22] px-2 py-0.5 font-mono text-xs font-semibold text-[#FF6B00]">
                        {config.animationSpeed.toFixed(1)}x
                      </span>
                    </div>
                    <input
                      id="speed-slider"
                      type="range"
                      min={0.5}
                      max={2.5}
                      step={0.1}
                      value={config.animationSpeed}
                      onChange={(e) =>
                        setConfig((prev) => ({
                          ...prev,
                          animationSpeed: parseFloat(e.target.value),
                        }))
                      }
                      className="w-full cursor-pointer accent-[#FF6B00]"
                    />
                  </div>

                  <div className="flex items-center justify-between rounded-lg border border-[#30363d]/80 bg-[#0d1117] px-3 py-2.5">
                    <div>
                      <div className="text-xs font-medium text-[#e6edf3]">
                        Bottom HUD Telemetry Bar
                      </div>
                      <div className="text-[11px] text-[#8b949e]">
                        Show stage, languages &amp; commit readout
                      </div>
                    </div>
                    <button
                      type="button"
                      role="switch"
                      aria-checked={config.showHud}
                      onClick={() =>
                        setConfig((prev) => ({
                          ...prev,
                          showHud: !prev.showHud,
                        }))
                      }
                      className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full border transition ${
                        config.showHud
                          ? "border-[#00E676] bg-[#00E676]/25"
                          : "border-[#30363d] bg-[#21262d]"
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full transition ${
                          config.showHud
                            ? "translate-x-5.5 bg-[#00E676]"
                            : "translate-x-1 bg-[#8b949e]"
                        }`}
                      />
                    </button>
                  </div>

                  <div className="space-y-2.5 rounded-lg border border-[#30363d]/80 bg-[#0d1117] p-3">
                    <div>
                      <label
                        htmlFor="custom-title"
                        className="mb-1 block text-xs font-medium text-[#e6edf3]"
                      >
                        Custom Title / Tag
                      </label>
                      <input
                        id="custom-title"
                        type="text"
                        maxLength={42}
                        placeholder={`${evolution.rank} ${meta.name.toUpperCase()}`}
                        value={config.customTitle}
                        onChange={(e) =>
                          setConfig((prev) => ({
                            ...prev,
                            customTitle: e.target.value,
                          }))
                        }
                        className="w-full rounded-md border border-[#30363d] bg-[#161b22] px-3 py-1.5 font-mono text-xs text-[#e6edf3] placeholder-[#6e7681] focus:border-[#FF6B00] focus:outline-none"
                      />
                    </div>
                    <div>
                      <div className="mb-1 flex items-center justify-between">
                        <label
                          htmlFor="commits-input"
                          className="flex items-center gap-1.5 text-xs font-medium text-[#e6edf3]"
                        >
                          <GitCommitHorizontal className="h-3.5 w-3.5 text-[#00E676]" />
                          Simulated Commits
                        </label>
                        <span className="font-mono text-[10px] text-[#8b949e]">
                          {evolution.rank} (S{evolution.stage})
                        </span>
                      </div>
                      <input
                        id="commits-input"
                        type="number"
                        min={0}
                        max={999999}
                        value={config.commits}
                        onChange={(e) =>
                          setConfig((prev) => ({
                            ...prev,
                            commits: Math.max(
                              0,
                              parseInt(e.target.value || "0", 10)
                            ),
                          }))
                        }
                        className="w-full rounded-md border border-[#30363d] bg-[#161b22] px-3 py-1.5 font-mono text-xs text-[#e6edf3] focus:border-[#00E676] focus:outline-none"
                      />
                    </div>
                  </div>
                </div>
              </section>
            </aside>

            {/* CENTER / RIGHT PANEL — LIVE GITHUB PROFILE PREVIEW, EDITOR & EXPORT */}
            <section className="flex flex-col gap-5 lg:col-span-8 xl:col-span-8">
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
                <button
                  type="button"
                  onClick={() =>
                    triggerFileDownload("creature.svg", rawSvgSource)
                  }
                  className="flex items-center justify-center gap-2 rounded-xl border border-[#FF6B00]/60 bg-[#FF6B00] px-3.5 py-3 text-xs font-semibold text-white shadow-lg shadow-[#FF6B00]/15 transition hover:bg-[#ff7f24] sm:text-sm"
                >
                  <Download className="h-4 w-4 shrink-0" />
                  Download SVG
                </button>

                <button
                  type="button"
                  onClick={() => void handleCopy("readme")}
                  className="flex items-center justify-center gap-2 rounded-xl border border-[#30363d] bg-[#161b22] px-3.5 py-3 text-xs font-semibold text-[#e6edf3] transition hover:border-[#8b949e] hover:bg-[#21262d] sm:text-sm"
                >
                  {copiedSnippet === "readme" ? (
                    <>
                      <Check className="h-4 w-4 shrink-0 text-[#00E676]" />
                      Copied README!
                    </>
                  ) : (
                    <>
                      <FileText className="h-4 w-4 shrink-0 text-[#8b949e]" />
                      Copy README.md
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => setPublishModalOpen(true)}
                  className="flex items-center justify-center gap-2 rounded-xl border border-[#58a6ff]/40 bg-[#58a6ff]/10 px-3.5 py-3 text-xs font-semibold text-[#58a6ff] transition hover:border-[#58a6ff] hover:bg-[#58a6ff]/20 sm:text-sm"
                >
                  <UploadCloud className="h-4 w-4 shrink-0" />
                  Push to {safeUser}
                </button>

                <button
                  type="button"
                  onClick={() => setEvolveModalOpen(true)}
                  className="flex items-center justify-center gap-2 rounded-xl border border-[#00E676]/40 bg-[#00E676]/10 px-3.5 py-3 text-xs font-semibold text-[#00E676] transition hover:border-[#00E676] hover:bg-[#00E676]/20 sm:text-sm"
                >
                  <Zap className="h-4 w-4 shrink-0" />
                  Auto-Evolve Action
                </button>
              </div>

              {/* Controls Bar for Preview / Edit README / SVG Code */}
              <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-[#30363d] bg-[#161b22] px-4 py-2.5">
                <div className="flex overflow-hidden rounded-md border border-[#30363d] bg-[#0d1117] text-xs">
                  <button
                    type="button"
                    onClick={() => setPreviewMode("preview")}
                    className={`px-3 py-1 font-medium transition ${
                      previewMode === "preview"
                        ? "bg-[#21262d] text-white"
                        : "text-[#8b949e] hover:text-white"
                    }`}
                  >
                    GitHub Preview
                  </button>
                  <button
                    type="button"
                    onClick={() => setPreviewMode("edit")}
                    className={`inline-flex items-center gap-1 border-l border-[#30363d] px-3 py-1 font-medium transition ${
                      previewMode === "edit"
                        ? "bg-[#21262d] text-[#00E676]"
                        : "text-[#8b949e] hover:text-white"
                    }`}
                  >
                    <Edit3 className="h-3 w-3" />
                    Edit Profile README
                  </button>
                  <button
                    type="button"
                    onClick={() => setPreviewMode("code")}
                    className={`border-l border-[#30363d] px-3 py-1 font-medium transition ${
                      previewMode === "code"
                        ? "bg-[#21262d] text-white"
                        : "text-[#8b949e] hover:text-white"
                    }`}
                  >
                    SVG XML
                  </button>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setShowProfileSidebar((v) => !v)}
                    className={`inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1 text-[11px] font-medium transition ${
                      showProfileSidebar
                        ? "border-[#00E676]/50 bg-[#00E676]/10 text-[#00E676]"
                        : "border-[#30363d] bg-[#0d1117] text-[#8b949e] hover:text-white"
                    }`}
                  >
                    <UserSquare2 className="h-3 w-3" />
                    {showProfileSidebar ? "Full Profile" : "README Only"}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowGridBackdrop((v) => !v)}
                    className={`inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1 text-[11px] font-medium transition ${
                      showGridBackdrop
                        ? "border-[#FF6B00]/60 bg-[#FF6B00]/15 text-[#FF6B00]"
                        : "border-[#30363d] bg-[#0d1117] text-[#8b949e] hover:text-[#e6edf3]"
                    }`}
                  >
                    <Eye className="h-3 w-3" />
                    {showGridBackdrop ? "Alpha Grid" : "#0d1117"}
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab("share-card")}
                    className="inline-flex items-center gap-1.5 rounded-md border border-[#30363d] bg-[#0d1117] px-2.5 py-1 text-[11px] font-medium text-[#58a6ff] transition hover:border-[#58a6ff]"
                  >
                    <Share2 className="h-3 w-3" />
                    1280×640 Card
                  </button>
                </div>
              </div>

              {previewMode === "preview" && (
                <GitHubProfilePreview
                  creatureConfig={config}
                  readmeConfig={readmeConfig}
                  ghSnapshot={ghSnapshot}
                  showProfileSidebar={showProfileSidebar}
                  showGridBackdrop={showGridBackdrop}
                  onEditClick={() => setPreviewMode("edit")}
                />
              )}

              {previewMode === "edit" && (
                <div className="overflow-hidden rounded-xl border border-[#30363d] bg-[#0d1117] shadow-2xl">
                  <ReadmeEditorPanel
                    creatureConfig={config}
                    readmeConfig={readmeConfig}
                    onChange={setReadmeConfig}
                  />
                </div>
              )}

              {previewMode === "code" && (
                <div className="overflow-hidden rounded-xl border border-[#30363d] bg-[#090c10] shadow-2xl">
                  <div className="flex items-center justify-between border-b border-[#21262d] bg-[#161b22] px-4 py-2 text-xs">
                    <span className="font-mono text-[#8b949e]">
                      creature.svg ({rawSvgSource.length.toLocaleString()} bytes)
                    </span>
                    <button
                      type="button"
                      onClick={() => void handleCopy("svg")}
                      className="inline-flex items-center gap-1 rounded border border-[#30363d] bg-[#0d1117] px-2.5 py-1 text-[11px] text-white hover:bg-[#21262d]"
                    >
                      {copiedSnippet === "svg" ? (
                        <>
                          <Check className="h-3 w-3 text-[#00E676]" />
                          Copied SVG
                        </>
                      ) : (
                        <>
                          <Copy className="h-3 w-3" />
                          Copy XML
                        </>
                      )}
                    </button>
                  </div>
                  <div className="max-h-[540px] overflow-auto p-4">
                    <pre className="font-mono text-[11px] leading-relaxed text-[#79c0ff]">
                      <code>{rawSvgSource}</code>
                    </pre>
                  </div>
                </div>
              )}

              {/* Bottom Quick Snippets */}
              <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
                <div className="rounded-xl border border-[#21262d] bg-[#161b22]/75 p-4">
                  <div className="mb-2 flex items-center justify-between">
                    <span className="flex items-center gap-2 text-xs font-semibold text-[#e6edf3]">
                      <Code2 className="h-4 w-4 text-[#00E676]" />
                      Simple Markdown Embed
                    </span>
                    <button
                      type="button"
                      onClick={() => void handleCopy("md")}
                      className="inline-flex items-center gap-1 rounded-md border border-[#30363d] bg-[#21262d] px-2.5 py-1 text-[11px] font-medium text-[#e6edf3] hover:bg-[#30363d]"
                    >
                      {copiedSnippet === "md" ? (
                        <>
                          <Check className="h-3 w-3 text-[#00E676]" />
                          Copied
                        </>
                      ) : (
                        <>
                          <Copy className="h-3 w-3" />
                          Copy
                        </>
                      )}
                    </button>
                  </div>
                  <code className="block overflow-x-auto rounded-lg border border-[#30363d] bg-[#0d1117] px-3 py-2.5 font-mono text-xs text-[#79c0ff]">
                    {markdownSnippet}
                  </code>
                </div>

                <div className="rounded-xl border border-[#21262d] bg-[#161b22]/75 p-4">
                  <div className="mb-2 flex items-center justify-between">
                    <span className="flex items-center gap-2 text-xs font-semibold text-[#e6edf3]">
                      <Terminal className="h-4 w-4 text-[#FF6B00]" />
                      Auto-Update Marker Block
                    </span>
                    <button
                      type="button"
                      onClick={() => void handleCopy("html")}
                      className="inline-flex items-center gap-1 rounded-md border border-[#30363d] bg-[#21262d] px-2.5 py-1 text-[11px] font-medium text-[#e6edf3] hover:bg-[#30363d]"
                    >
                      {copiedSnippet === "html" ? (
                        <>
                          <Check className="h-3 w-3 text-[#00E676]" />
                          Copied
                        </>
                      ) : (
                        <>
                          <Copy className="h-3 w-3" />
                          Copy Block
                        </>
                      )}
                    </button>
                  </div>
                  <pre className="max-h-24 overflow-auto rounded-lg border border-[#30363d] bg-[#0d1117] px-3 py-2 font-mono text-[11px] leading-relaxed text-[#79c0ff]">
                    <code>{markerSnippet}</code>
                  </pre>
                </div>
              </div>
            </section>
          </div>
        )}
      </main>

      <AutoEvolveModal
        open={evolveModalOpen}
        onClose={() => setEvolveModalOpen(false)}
        config={config}
      />

      <PublishProfileRepoModal
        open={publishModalOpen}
        onClose={() => setPublishModalOpen(false)}
        username={safeUser}
        snapshot={ghSnapshot}
        creatureSvg={rawSvgSource}
        shareCardSvg={shareCardSvgSource}
        readmeMarkdown={fullReadmeMarkdown}
      />
    </div>
  );
}
