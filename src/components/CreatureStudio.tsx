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
  ExternalLink,
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

type CustomizeGroup = "github" | "chassis" | "palette" | "motion";

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
    <div className="flex items-center justify-between gap-3 rounded-md border border-zinc-800 bg-zinc-900/50 px-3 py-2">
      <div className="min-w-0">
        <div className="text-xs font-medium text-zinc-100">{label}</div>
        <div className="truncate text-[11px] text-zinc-400">{sublabel}</div>
      </div>
      <div className="flex shrink-0 items-center gap-2">
        <span className="font-mono text-[11px] uppercase text-zinc-400">
          {value}
        </span>
        <label className="relative flex h-7 w-7 cursor-pointer items-center justify-center overflow-hidden rounded-md border border-zinc-700 shadow-inner">
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
  const [customizeTab, setCustomizeTab] = useState<CustomizeGroup>("chassis");
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
                color: "27272A",
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
                color: "09090B",
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
    <div className="min-h-screen bg-zinc-950 text-zinc-50">
      {/* Top Command Header (shadcn monochrome dark) */}
      <header className="sticky top-0 z-30 border-b border-zinc-800 bg-zinc-950/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-[1440px] flex-wrap items-center justify-between gap-3 px-4 py-3 sm:px-6">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-md border border-zinc-800 bg-zinc-900 text-zinc-50">
              <Cpu className="h-4 w-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-sm font-semibold tracking-tight text-zinc-50 sm:text-base">
                  dynamic-readme-creature
                </h1>
                <span className="hidden rounded-md border border-zinc-800 bg-zinc-900 px-2 py-0.5 font-mono text-[10px] font-medium text-zinc-300 sm:inline-block">
                  PURE CSS SVG
                </span>
              </div>
              <p className="text-xs text-zinc-400">
                Cybernetic creature &amp; GitHub Profile README generator · by{" "}
                <span className="font-mono text-zinc-200">@PathumSandeepa</span>
              </p>
            </div>
          </div>

          <nav
            aria-label="Studio workspace views"
            className="flex flex-wrap items-center gap-1 rounded-md border border-zinc-800 bg-zinc-900 p-1"
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
                  className={`inline-flex items-center gap-1.5 rounded px-2.5 py-1.5 text-xs font-medium transition sm:px-3 ${
                    active
                      ? "bg-zinc-950 text-zinc-50 shadow-sm"
                      : "text-zinc-400 hover:text-zinc-100"
                  }`}
                >
                  <Icon className="h-3.5 w-3.5" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleReset}
              className="inline-flex items-center gap-1.5 rounded-md border border-zinc-800 bg-zinc-900 px-3 py-1.5 text-xs font-medium text-zinc-200 transition hover:bg-zinc-800"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              Reset
            </button>
            <button
              type="button"
              onClick={() => setPublishModalOpen(true)}
              className="inline-flex items-center gap-1.5 rounded-md bg-zinc-50 px-3.5 py-1.5 text-xs font-semibold text-zinc-950 transition hover:bg-zinc-200"
            >
              <UploadCloud className="h-3.5 w-3.5" />
              Connect &amp; Push
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
            <div className="overflow-hidden rounded-lg border border-zinc-800 bg-zinc-950">
              <ReadmeEditorPanel
                creatureConfig={config}
                readmeConfig={readmeConfig}
                onChange={setReadmeConfig}
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs font-semibold text-zinc-200">
                  Live GitHub Profile Page Preview (@{safeUser})
                </span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setPublishModalOpen(true)}
                    className="inline-flex items-center gap-1.5 rounded-md border border-zinc-800 bg-zinc-900 px-3 py-1.5 text-xs font-medium text-zinc-100 hover:bg-zinc-800"
                  >
                    <UploadCloud className="h-3.5 w-3.5" />
                    Push to {safeUser}
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      triggerFileDownload(
                        "README.md",
                        fullReadmeMarkdown,
                        "text/markdown;charset=utf-8"
                      )
                    }
                    className="inline-flex items-center gap-1.5 rounded-md bg-zinc-50 px-3 py-1.5 text-xs font-semibold text-zinc-950 hover:bg-zinc-200"
                  >
                    <Download className="h-3.5 w-3.5" />
                    Download README.md
                  </button>
                </div>
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
            <div className="flex flex-wrap items-center justify-between gap-4 rounded-lg border border-zinc-800 bg-zinc-950 p-5">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-md border border-zinc-800 bg-zinc-900 text-zinc-100">
                  <ImageIcon className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="text-base font-semibold text-zinc-50">
                    Shareable Telemetry Card (1280×640)
                  </h2>
                  <p className="text-xs text-zinc-400">
                    Ready to post on X, LinkedIn, Discord, or embed in your
                    GitHub Profile README.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() =>
                  triggerFileDownload("share-card.svg", shareCardSvgSource)
                }
                className="inline-flex items-center gap-2 rounded-md bg-zinc-50 px-4 py-2 text-xs font-semibold text-zinc-950 transition hover:bg-zinc-200"
              >
                <Download className="h-4 w-4" />
                Download share-card.svg
              </button>
            </div>

            <div className="overflow-hidden rounded-lg border border-zinc-800 bg-[#070b12] p-4">
              <ShareCardSvg
                config={config}
                className="mx-auto block h-auto w-full max-w-[1100px]"
              />
            </div>
          </div>
        )}

        {activeTab === "studio" && (
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
            {/* LEFT PANEL — CLEAN SHADCN CUSTOMIZER */}
            <aside className="space-y-4 lg:col-span-4 xl:col-span-4">
              {/* Quick GitHub Account Sync Card */}
              <section className="rounded-lg border border-zinc-800 bg-zinc-950 p-4">
                <div className="mb-2.5 flex items-center justify-between">
                  <h2 className="flex items-center gap-2 text-xs font-semibold tracking-wide text-zinc-100">
                    <Terminal className="h-3.5 w-3.5 text-zinc-400" />
                    GitHub Account Sync
                  </h2>
                  <div className="flex rounded-md border border-zinc-800 bg-zinc-900 p-0.5 text-[10px]">
                    {(["annual", "rolling"] as const).map((win) => (
                      <button
                        key={win}
                        type="button"
                        onClick={() => selectWindow(win)}
                        className={`rounded px-2 py-0.5 font-mono uppercase transition ${
                          config.windowMode === win
                            ? "bg-zinc-50 font-semibold text-zinc-950"
                            : "text-zinc-400 hover:text-zinc-100"
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
                    placeholder="Enter any GitHub username"
                    aria-label="GitHub username"
                    className="flex-1 rounded-md border border-zinc-800 bg-zinc-900 px-3 py-1.5 font-mono text-xs text-zinc-50 placeholder-zinc-500 focus:border-zinc-500 focus:outline-none"
                  />
                  <button
                    type="submit"
                    disabled={ghLoading}
                    className="inline-flex items-center gap-1.5 rounded-md border border-zinc-800 bg-zinc-900 px-3 py-1.5 text-xs font-medium text-zinc-100 transition hover:bg-zinc-800 disabled:opacity-50"
                  >
                    {ghLoading ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <RefreshCw className="h-3.5 w-3.5" />
                    )}
                    Fetch
                  </button>
                </form>

                {ghError && (
                  <p className="mt-2 rounded-md border border-red-900 bg-red-950/50 px-2.5 py-1.5 text-[11px] text-red-200">
                    {ghError}
                  </p>
                )}

                <div className="mt-2.5 flex flex-wrap items-center justify-between gap-2">
                  <div className="flex flex-wrap gap-1.5">
                    {config.languages.map((lang) => (
                      <span
                        key={lang.name}
                        className="inline-flex items-center gap-1 rounded border border-zinc-800 bg-zinc-900 px-2 py-0.5 font-mono text-[10px] text-zinc-300"
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
                    className="font-mono text-[10px] font-medium text-zinc-300 underline underline-offset-2 hover:text-white"
                  >
                    Sync Lang Colors
                  </button>
                </div>

                {ghSnapshot && (
                  <div className="mt-3 space-y-2 border-t border-zinc-800 pt-2.5">
                    <div className="flex items-center justify-between text-[11px] text-zinc-400">
                      <span>
                        @{ghSnapshot.username} · {ghSnapshot.publicRepos} repos ·{" "}
                        {config.windowMode === "rolling"
                          ? `${ghSnapshot.rollingCommits} (365d)`
                          : `${ghSnapshot.annualCommits} (${new Date().getUTCFullYear()})`}
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center justify-between gap-2">
                      {ghSnapshot.profileRepoExists ? (
                        <span className="inline-flex items-center gap-1 rounded border border-zinc-700 bg-zinc-900 px-2 py-0.5 font-mono text-[10px] text-zinc-200">
                          <CheckCircle2 className="h-3 w-3" />
                          {ghSnapshot.username}/{ghSnapshot.username} ready
                        </span>
                      ) : (
                        <a
                          href={`https://github.com/new?name=${encodeURIComponent(ghSnapshot.username)}&description=My+GitHub+Profile+README`}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 rounded border border-zinc-700 bg-zinc-900 px-2 py-0.5 font-mono text-[10px] text-zinc-200 hover:bg-zinc-800"
                        >
                          Create {ghSnapshot.username}/{ghSnapshot.username}
                          <ExternalLink className="h-2.5 w-2.5" />
                        </a>
                      )}

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
                            className="rounded border border-zinc-800 bg-zinc-900 px-2 py-0.5 font-mono text-[10px] text-zinc-300 hover:bg-zinc-800"
                          >
                            Import README
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => setPublishModalOpen(true)}
                          className="inline-flex items-center gap-1 rounded bg-zinc-50 px-2.5 py-0.5 font-mono text-[10px] font-semibold text-zinc-950 hover:bg-zinc-200"
                        >
                          <UploadCloud className="h-3 w-3" />
                          Push PAT
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </section>

              {/* Clean Segmented Customizer Card */}
              <section className="rounded-lg border border-zinc-800 bg-zinc-950">
                <div className="border-b border-zinc-800 p-2">
                  <div className="grid grid-cols-3 gap-1 rounded-md bg-zinc-900 p-1 text-[11px]">
                    {(
                      [
                        { id: "chassis", label: "Creature", icon: Sparkles },
                        { id: "palette", label: "Colors", icon: Palette },
                        { id: "motion", label: "Motion & HUD", icon: Sliders },
                      ] as const
                    ).map((grp) => {
                      const Icon = grp.icon;
                      const active = customizeTab === grp.id;
                      return (
                        <button
                          key={grp.id}
                          type="button"
                          onClick={() => setCustomizeTab(grp.id)}
                          className={`inline-flex items-center justify-center gap-1.5 rounded px-2 py-1.5 font-medium transition ${
                            active
                              ? "bg-zinc-950 text-zinc-50 shadow-sm"
                              : "text-zinc-400 hover:text-zinc-100"
                          }`}
                        >
                          <Icon className="h-3 w-3" />
                          <span>{grp.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="p-4">
                  {customizeTab === "chassis" && (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-medium text-zinc-200">
                          Select Cyber-Animal
                        </span>
                        <span className="font-mono text-[10px] text-zinc-400">
                          {meta.designation}
                        </span>
                      </div>

                      <div className="space-y-2">
                        {CREATURE_CATALOG.map((item) => {
                          const selected = config.creature === item.id;
                          return (
                            <button
                              key={item.id}
                              type="button"
                              onClick={() => selectCreature(item.id)}
                              className={`flex w-full flex-col items-start rounded-md border p-3 text-left transition ${
                                selected
                                  ? "border-zinc-50 bg-zinc-900"
                                  : "border-zinc-800 bg-zinc-950 hover:border-zinc-700"
                              }`}
                            >
                              <div className="flex w-full items-center justify-between">
                                <div>
                                  <span className="text-xs font-semibold text-zinc-50">
                                    {item.name}
                                  </span>
                                  <span className="ml-1.5 text-[11px] text-zinc-400">
                                    · {item.subtitle}
                                  </span>
                                </div>
                                <span
                                  className={`h-2 w-2 rounded-full ${
                                    selected ? "bg-zinc-50" : "bg-zinc-700"
                                  }`}
                                />
                              </div>
                              <p className="mt-1 text-[11px] leading-snug text-zinc-400">
                                {item.description}
                              </p>
                            </button>
                          );
                        })}
                      </div>

                      <div className="border-t border-zinc-800 pt-3">
                        <div className="mb-2 flex items-center justify-between">
                          <span className="flex items-center gap-1.5 text-xs font-medium text-zinc-200">
                            <Camera className="h-3.5 w-3.5 text-zinc-400" />
                            Camera Angle
                          </span>
                          <span className="font-mono text-[10px] uppercase text-zinc-400">
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
                                  ? "border-zinc-50 bg-zinc-50 font-semibold text-zinc-950"
                                  : "border-zinc-800 bg-zinc-900 text-zinc-400 hover:text-zinc-100"
                              }`}
                            >
                              {v.shortLabel}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {customizeTab === "palette" && (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-medium text-zinc-200">
                          Theme Presets
                        </span>
                        <span className="font-mono text-[10px] uppercase text-zinc-400">
                          {config.colorMode}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        {THEME_PRESETS.map((preset) => {
                          const active =
                            config.colorMode === "canonical" &&
                            config.themeId === preset.id;
                          return (
                            <button
                              key={preset.id}
                              type="button"
                              onClick={() => applyThemePreset(preset.id)}
                              className={`flex flex-col rounded-md border p-2.5 text-left transition ${
                                active
                                  ? "border-zinc-50 bg-zinc-900"
                                  : "border-zinc-800 bg-zinc-950 hover:border-zinc-700"
                              }`}
                            >
                              <div className="flex items-center gap-1.5">
                                <span
                                  className="h-3 w-3 rounded-full border border-white/20"
                                  style={{
                                    backgroundColor: preset.colors.primary,
                                  }}
                                />
                                <span
                                  className="h-3 w-3 rounded-full border border-white/20"
                                  style={{
                                    backgroundColor: preset.colors.accent,
                                  }}
                                />
                                <span
                                  className="h-3 w-3 rounded-full border border-white/20"
                                  style={{
                                    backgroundColor: preset.colors.energy,
                                  }}
                                />
                              </div>
                              <div className="mt-1.5 text-[11px] font-semibold text-zinc-100">
                                {preset.name}
                              </div>
                            </button>
                          );
                        })}
                      </div>

                      <div className="space-y-2 pt-1">
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

                      <div className="rounded-md border border-zinc-800 bg-zinc-900/50 p-2.5">
                        <div className="mb-1.5 flex items-center justify-between">
                          <span className="text-xs font-medium text-zinc-200">
                            SVG Canvas Background
                          </span>
                          <span className="font-mono text-[10px] text-zinc-400">
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
                              className={`rounded border px-1.5 py-1 text-[11px] font-medium transition ${
                                config.backgroundMode === bg.id
                                  ? "border-zinc-50 bg-zinc-50 text-zinc-950"
                                  : "border-zinc-800 bg-zinc-950 text-zinc-400 hover:text-zinc-100"
                              }`}
                            >
                              {bg.label}
                            </button>
                          ))}
                        </div>
                        {config.backgroundMode === "custom" && (
                          <div className="mt-2 flex items-center justify-between border-t border-zinc-800 pt-2">
                            <span className="text-[11px] text-zinc-400">
                              Custom background hex
                            </span>
                            <input
                              type="color"
                              value={customBgHex}
                              onChange={(e) =>
                                handleCustomBgChange(e.target.value)
                              }
                              aria-label="Custom SVG background color"
                              className="h-7 w-12 cursor-pointer rounded border border-zinc-700 bg-transparent"
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {customizeTab === "motion" && (
                    <div className="space-y-3">
                      <div className="rounded-md border border-zinc-800 bg-zinc-900/50 p-3">
                        <div className="mb-2 flex items-center justify-between text-xs">
                          <span className="font-medium text-zinc-200">
                            Evolution Stage
                          </span>
                          <span className="font-mono text-[10px] text-zinc-300">
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
                                  ? "border-zinc-50 bg-zinc-50 text-zinc-950"
                                  : "border-zinc-800 bg-zinc-950 text-zinc-400 hover:text-zinc-100"
                              }`}
                            >
                              S{st.stage}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="rounded-md border border-zinc-800 bg-zinc-900/50 p-3">
                        <div className="mb-1.5 flex items-center justify-between">
                          <label
                            htmlFor="speed-slider"
                            className="flex items-center gap-1.5 text-xs font-medium text-zinc-200"
                          >
                            <Activity className="h-3.5 w-3.5 text-zinc-400" />
                            Animation Speed
                          </label>
                          <span className="rounded border border-zinc-800 bg-zinc-950 px-2 py-0.5 font-mono text-xs font-semibold text-zinc-100">
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
                          className="w-full cursor-pointer accent-zinc-100"
                        />
                      </div>

                      <div className="flex items-center justify-between rounded-md border border-zinc-800 bg-zinc-900/50 px-3 py-2.5">
                        <div>
                          <div className="text-xs font-medium text-zinc-100">
                            Bottom HUD Telemetry Bar
                          </div>
                          <div className="text-[11px] text-zinc-400">
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
                              ? "border-zinc-50 bg-zinc-50"
                              : "border-zinc-700 bg-zinc-800"
                          }`}
                        >
                          <span
                            className={`inline-block h-4 w-4 transform rounded-full transition ${
                              config.showHud
                                ? "translate-x-5.5 bg-zinc-950"
                                : "translate-x-1 bg-zinc-400"
                            }`}
                          />
                        </button>
                      </div>

                      <div className="space-y-2.5 rounded-md border border-zinc-800 bg-zinc-900/50 p-3">
                        <div>
                          <label
                            htmlFor="custom-title"
                            className="mb-1 block text-xs font-medium text-zinc-200"
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
                            className="w-full rounded-md border border-zinc-800 bg-zinc-950 px-3 py-1.5 font-mono text-xs text-zinc-50 placeholder-zinc-500 focus:border-zinc-500 focus:outline-none"
                          />
                        </div>
                        <div>
                          <div className="mb-1 flex items-center justify-between">
                            <label
                              htmlFor="commits-input"
                              className="flex items-center gap-1.5 text-xs font-medium text-zinc-200"
                            >
                              <GitCommitHorizontal className="h-3.5 w-3.5 text-zinc-400" />
                              Simulated Commits
                            </label>
                            <span className="font-mono text-[10px] text-zinc-400">
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
                            className="w-full rounded-md border border-zinc-800 bg-zinc-950 px-3 py-1.5 font-mono text-xs text-zinc-50 focus:border-zinc-500 focus:outline-none"
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </section>
            </aside>

            {/* CENTER / RIGHT PANEL — LIVE GITHUB PROFILE PREVIEW, EDITOR & EXPORT */}
            <section className="flex flex-col gap-4 lg:col-span-8 xl:col-span-8">
              <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 xl:grid-cols-4">
                <button
                  type="button"
                  onClick={() =>
                    triggerFileDownload("creature.svg", rawSvgSource)
                  }
                  className="flex items-center justify-center gap-2 rounded-md bg-zinc-50 px-3.5 py-2.5 text-xs font-semibold text-zinc-950 transition hover:bg-zinc-200"
                >
                  <Download className="h-4 w-4 shrink-0" />
                  Download SVG
                </button>

                <button
                  type="button"
                  onClick={() => void handleCopy("readme")}
                  className="flex items-center justify-center gap-2 rounded-md border border-zinc-800 bg-zinc-900 px-3.5 py-2.5 text-xs font-medium text-zinc-100 transition hover:bg-zinc-800"
                >
                  {copiedSnippet === "readme" ? (
                    <>
                      <Check className="h-4 w-4 shrink-0" />
                      Copied README!
                    </>
                  ) : (
                    <>
                      <FileText className="h-4 w-4 shrink-0 text-zinc-400" />
                      Copy README.md
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => setPublishModalOpen(true)}
                  className="flex items-center justify-center gap-2 rounded-md border border-zinc-700 bg-zinc-900 px-3.5 py-2.5 text-xs font-semibold text-zinc-50 transition hover:bg-zinc-800"
                >
                  <UploadCloud className="h-4 w-4 shrink-0" />
                  Push to {safeUser}
                </button>

                <button
                  type="button"
                  onClick={() => setEvolveModalOpen(true)}
                  className="flex items-center justify-center gap-2 rounded-md border border-zinc-800 bg-zinc-950 px-3.5 py-2.5 text-xs font-medium text-zinc-200 transition hover:bg-zinc-900"
                >
                  <Zap className="h-4 w-4 shrink-0 text-zinc-400" />
                  12AM Auto-Evolve
                </button>
              </div>

              {/* Preview Mode Toolbar */}
              <div className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-zinc-800 bg-zinc-950 px-4 py-2">
                <div className="flex overflow-hidden rounded-md border border-zinc-800 bg-zinc-900 p-0.5 text-xs">
                  <button
                    type="button"
                    onClick={() => setPreviewMode("preview")}
                    className={`rounded px-3 py-1 font-medium transition ${
                      previewMode === "preview"
                        ? "bg-zinc-950 text-zinc-50 shadow-sm"
                        : "text-zinc-400 hover:text-zinc-100"
                    }`}
                  >
                    GitHub Preview
                  </button>
                  <button
                    type="button"
                    onClick={() => setPreviewMode("edit")}
                    className={`inline-flex items-center gap-1 rounded px-3 py-1 font-medium transition ${
                      previewMode === "edit"
                        ? "bg-zinc-950 text-zinc-50 shadow-sm"
                        : "text-zinc-400 hover:text-zinc-100"
                    }`}
                  >
                    <Edit3 className="h-3 w-3" />
                    Edit Profile README
                  </button>
                  <button
                    type="button"
                    onClick={() => setPreviewMode("code")}
                    className={`rounded px-3 py-1 font-medium transition ${
                      previewMode === "code"
                        ? "bg-zinc-950 text-zinc-50 shadow-sm"
                        : "text-zinc-400 hover:text-zinc-100"
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
                        ? "border-zinc-600 bg-zinc-900 text-zinc-100"
                        : "border-zinc-800 bg-zinc-950 text-zinc-400 hover:text-zinc-100"
                    }`}
                  >
                    <UserSquare2 className="h-3 w-3" />
                    {showProfileSidebar ? "Sidebar: ON" : "Sidebar: OFF"}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowGridBackdrop((v) => !v)}
                    className={`inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1 text-[11px] font-medium transition ${
                      showGridBackdrop
                        ? "border-zinc-600 bg-zinc-900 text-zinc-100"
                        : "border-zinc-800 bg-zinc-950 text-zinc-400 hover:text-zinc-100"
                    }`}
                  >
                    <Eye className="h-3 w-3" />
                    {showGridBackdrop ? "Alpha Grid" : "#0d1117"}
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab("share-card")}
                    className="inline-flex items-center gap-1.5 rounded-md border border-zinc-800 bg-zinc-950 px-2.5 py-1 text-[11px] font-medium text-zinc-300 transition hover:bg-zinc-900 hover:text-zinc-100"
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
                <div className="overflow-hidden rounded-lg border border-zinc-800 bg-zinc-950">
                  <ReadmeEditorPanel
                    creatureConfig={config}
                    readmeConfig={readmeConfig}
                    onChange={setReadmeConfig}
                  />
                </div>
              )}

              {previewMode === "code" && (
                <div className="overflow-hidden rounded-lg border border-zinc-800 bg-black">
                  <div className="flex items-center justify-between border-b border-zinc-800 bg-zinc-950 px-4 py-2 text-xs">
                    <span className="font-mono text-zinc-400">
                      creature.svg ({rawSvgSource.length.toLocaleString()} bytes)
                    </span>
                    <button
                      type="button"
                      onClick={() => void handleCopy("svg")}
                      className="inline-flex items-center gap-1 rounded border border-zinc-800 bg-zinc-900 px-2.5 py-1 text-[11px] text-zinc-100 hover:bg-zinc-800"
                    >
                      {copiedSnippet === "svg" ? (
                        <>
                          <Check className="h-3 w-3" />
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
                    <pre className="font-mono text-[11px] leading-relaxed text-zinc-300">
                      <code>{rawSvgSource}</code>
                    </pre>
                  </div>
                </div>
              )}

              {/* Bottom Snippets */}
              <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
                <div className="rounded-lg border border-zinc-800 bg-zinc-950 p-4">
                  <div className="mb-2 flex items-center justify-between">
                    <span className="flex items-center gap-2 text-xs font-semibold text-zinc-100">
                      <Code2 className="h-4 w-4 text-zinc-400" />
                      Simple Markdown Embed
                    </span>
                    <button
                      type="button"
                      onClick={() => void handleCopy("md")}
                      className="inline-flex items-center gap-1 rounded-md border border-zinc-800 bg-zinc-900 px-2.5 py-1 text-[11px] font-medium text-zinc-100 hover:bg-zinc-800"
                    >
                      {copiedSnippet === "md" ? (
                        <>
                          <Check className="h-3 w-3" />
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
                  <code className="block overflow-x-auto rounded-md border border-zinc-800 bg-black px-3 py-2.5 font-mono text-xs text-zinc-300">
                    {markdownSnippet}
                  </code>
                </div>

                <div className="rounded-lg border border-zinc-800 bg-zinc-950 p-4">
                  <div className="mb-2 flex items-center justify-between">
                    <span className="flex items-center gap-2 text-xs font-semibold text-zinc-100">
                      <Terminal className="h-4 w-4 text-zinc-400" />
                      Auto-Update Marker Block
                    </span>
                    <button
                      type="button"
                      onClick={() => void handleCopy("html")}
                      className="inline-flex items-center gap-1 rounded-md border border-zinc-800 bg-zinc-900 px-2.5 py-1 text-[11px] font-medium text-zinc-100 hover:bg-zinc-800"
                    >
                      {copiedSnippet === "html" ? (
                        <>
                          <Check className="h-3 w-3" />
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
                  <pre className="max-h-24 overflow-auto rounded-md border border-zinc-800 bg-black px-3 py-2 font-mono text-[11px] leading-relaxed text-zinc-300">
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
        creatureConfig={config}
        creatureSvg={rawSvgSource}
        shareCardSvg={shareCardSvgSource}
        readmeMarkdown={fullReadmeMarkdown}
      />
    </div>
  );
}
