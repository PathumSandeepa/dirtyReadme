"use client";

import { useState } from "react";
import {
  Check,
  Code2,
  Copy,
  Download,
  ExternalLink,
  FileText,
  Plus,
  RefreshCw,
  Trash2,
} from "lucide-react";
import {
  DYNAMIC_TOKENS,
  README_TEMPLATES,
  buildGeneratedReadmeMarkdown,
  buildMarkerSection,
  getEffectiveReadmeMarkdown,
} from "@/lib/readmeBuilder";
import type { CreatureConfig, ReadmeConfig } from "@/types/creature";

interface ReadmeEditorPanelProps {
  creatureConfig: CreatureConfig;
  readmeConfig: ReadmeConfig;
  onChange: (next: ReadmeConfig) => void;
}

export function ReadmeEditorPanel({
  creatureConfig,
  readmeConfig,
  onChange,
}: ReadmeEditorPanelProps) {
  const [newBadgeLabel, setNewBadgeLabel] = useState("");
  const [newBadgeColor, setNewBadgeColor] = useState("#00E676");
  const [copiedTarget, setCopiedTarget] = useState<"full" | "marker" | null>(
    null
  );

  const safeUser = creatureConfig.username.trim() || "PathumSandeepa";
  const generatedMarkdown = buildGeneratedReadmeMarkdown(
    creatureConfig,
    readmeConfig
  );
  const currentEditorText =
    readmeConfig.rawOverride !== null
      ? readmeConfig.rawOverride
      : generatedMarkdown;
  const resolvedMarkdown = getEffectiveReadmeMarkdown(
    creatureConfig,
    readmeConfig
  );

  function updateField<K extends keyof ReadmeConfig>(
    key: K,
    value: ReadmeConfig[K]
  ) {
    onChange({
      ...readmeConfig,
      [key]: value,
      rawOverride: null,
    });
  }

  function handleAddBadge(e: React.FormEvent) {
    e.preventDefault();
    const label = newBadgeLabel.trim();
    if (!label) return;
    onChange({
      ...readmeConfig,
      rawOverride: null,
      badges: [
        ...readmeConfig.badges,
        {
          id: `${Date.now()}`,
          label,
          color: newBadgeColor.replace("#", ""),
          enabled: true,
        },
      ],
    });
    setNewBadgeLabel("");
  }

  function handleToggleBadge(id: string) {
    onChange({
      ...readmeConfig,
      rawOverride: null,
      badges: readmeConfig.badges.map((b) =>
        b.id === id ? { ...b, enabled: !b.enabled } : b
      ),
    });
  }

  function handleDeleteBadge(id: string) {
    onChange({
      ...readmeConfig,
      rawOverride: null,
      badges: readmeConfig.badges.filter((b) => b.id !== id),
    });
  }

  function insertToken(token: string) {
    const base =
      readmeConfig.rawOverride !== null
        ? readmeConfig.rawOverride
        : generatedMarkdown;
    onChange({
      ...readmeConfig,
      rawOverride: `${base}\n${token}`,
    });
  }

  async function copyMarkdown(target: "full" | "marker") {
    const content =
      target === "full"
        ? resolvedMarkdown
        : buildMarkerSection(creatureConfig, readmeConfig);
    await navigator.clipboard.writeText(content);
    setCopiedTarget(target);
    setTimeout(() => setCopiedTarget(null), 2000);
  }

  function downloadReadme() {
    const blob = new Blob([resolvedMarkdown], {
      type: "text/markdown;charset=utf-8",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "README.md";
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="space-y-4 p-4 sm:p-5">
      {/* Top Action Bar */}
      <div className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-[#30363d] bg-[#161b22] px-3.5 py-2.5">
        <div className="flex items-center gap-2">
          <FileText className="h-4 w-4 text-[#00E676]" />
          <span className="text-xs font-semibold text-white">
            Dynamic Profile README.md Builder
          </span>
          {readmeConfig.rawOverride !== null && (
            <span className="rounded-full border border-[#FF6B00]/50 bg-[#FF6B00]/15 px-2 py-0.5 font-mono text-[10px] text-[#FF6B00]">
              CUSTOM RAW MODE
            </span>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => void copyMarkdown("marker")}
            className="inline-flex items-center gap-1.5 rounded-md border border-[#30363d] bg-[#0d1117] px-2.5 py-1.5 text-[11px] font-medium text-[#e6edf3] transition hover:border-[#8b949e]"
          >
            {copiedTarget === "marker" ? (
              <>
                <Check className="h-3 w-3 text-[#00E676]" />
                Copied Marker Block
              </>
            ) : (
              <>
                <Code2 className="h-3 w-3 text-[#FF6B00]" />
                Copy Marker Block
              </>
            )}
          </button>

          <button
            type="button"
            onClick={() => void copyMarkdown("full")}
            className="inline-flex items-center gap-1.5 rounded-md border border-[#30363d] bg-[#21262d] px-2.5 py-1.5 text-[11px] font-semibold text-white transition hover:bg-[#30363d]"
          >
            {copiedTarget === "full" ? (
              <>
                <Check className="h-3 w-3 text-[#00E676]" />
                Copied README.md
              </>
            ) : (
              <>
                <Copy className="h-3 w-3" />
                Copy README.md
              </>
            )}
          </button>

          <button
            type="button"
            onClick={downloadReadme}
            className="inline-flex items-center gap-1.5 rounded-md bg-[#FF6B00] px-3 py-1.5 text-[11px] font-semibold text-white transition hover:bg-[#ff7f24]"
          >
            <Download className="h-3 w-3" />
            Download README.md
          </button>

          <a
            href={`https://github.com/${encodeURIComponent(safeUser)}/${encodeURIComponent(safeUser)}/edit/main/README.md`}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1 rounded-md border border-[#00E676]/40 bg-[#00E676]/10 px-2.5 py-1.5 text-[11px] font-medium text-[#00E676] transition hover:bg-[#00E676]/20"
          >
            Edit on GitHub
            <ExternalLink className="h-3 w-3" />
          </a>
        </div>
      </div>

      {/* Layout: Form Controls + Raw Markdown Editor */}
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-12">
        {/* Form Controls */}
        <div className="space-y-3 xl:col-span-6">
          {/* Template Presets */}
          <div className="rounded-lg border border-[#30363d] bg-[#161b22]/50 p-3">
            <div className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-[#8b949e]">
              README Layout Template
            </div>
            <div className="grid grid-cols-2 gap-2">
              {README_TEMPLATES.map((tpl) => {
                const active = readmeConfig.templateId === tpl.id;
                return (
                  <button
                    key={tpl.id}
                    type="button"
                    onClick={() => updateField("templateId", tpl.id)}
                    className={`rounded-md border p-2 text-left transition ${
                      active
                        ? "border-[#FF6B00] bg-[#FF6B00]/10"
                        : "border-[#30363d] bg-[#0d1117] hover:border-[#484f58]"
                    }`}
                  >
                    <div className="text-xs font-semibold text-white">
                      {tpl.name}
                    </div>
                    <div className="mt-0.5 text-[10px] text-[#8b949e]">
                      {tpl.description}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Headline & Bio */}
          <div className="space-y-2.5 rounded-lg border border-[#30363d] bg-[#161b22]/50 p-3">
            <div>
              <label
                htmlFor="readme-headline"
                className="mb-1 block text-xs font-medium text-[#e6edf3]"
              >
                Profile Headline
              </label>
              <input
                id="readme-headline"
                type="text"
                value={readmeConfig.headline}
                onChange={(e) => updateField("headline", e.target.value)}
                className="w-full rounded-md border border-[#30363d] bg-[#0d1117] px-3 py-1.5 font-mono text-xs text-white focus:border-[#00E676] focus:outline-none"
              />
            </div>

            <div>
              <label
                htmlFor="readme-bio"
                className="mb-1 block text-xs font-medium text-[#e6edf3]"
              >
                Profile Bio / Intro
              </label>
              <textarea
                id="readme-bio"
                rows={3}
                value={readmeConfig.bio}
                onChange={(e) => updateField("bio", e.target.value)}
                className="w-full rounded-md border border-[#30363d] bg-[#0d1117] px-3 py-1.5 text-xs text-white focus:border-[#00E676] focus:outline-none"
              />
            </div>

            <div>
              <label
                htmlFor="readme-footer"
                className="mb-1 block text-xs font-medium text-[#e6edf3]"
              >
                Custom Footer / Extra Markdown (Optional)
              </label>
              <textarea
                id="readme-footer"
                rows={2}
                placeholder="e.g. - Reach me at ... or ### Featured Projects"
                value={readmeConfig.customFooterMarkdown}
                onChange={(e) =>
                  updateField("customFooterMarkdown", e.target.value)
                }
                className="w-full rounded-md border border-[#30363d] bg-[#0d1117] px-3 py-1.5 font-mono text-xs text-white placeholder-[#6e7681] focus:border-[#00E676] focus:outline-none"
              />
            </div>
          </div>

          {/* Display Options */}
          <div className="space-y-2.5 rounded-lg border border-[#30363d] bg-[#161b22]/50 p-3">
            <div className="flex items-center justify-between gap-3">
              <span className="text-xs font-medium text-[#e6edf3]">
                Creature Image Width ({readmeConfig.imageWidth}px)
              </span>
              <input
                type="range"
                min={480}
                max={920}
                step={20}
                value={readmeConfig.imageWidth}
                onChange={(e) =>
                  updateField("imageWidth", parseInt(e.target.value, 10))
                }
                aria-label="Creature image width"
                className="w-40 cursor-pointer accent-[#FF6B00]"
              />
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <button
                type="button"
                onClick={() =>
                  updateField(
                    "align",
                    readmeConfig.align === "center" ? "left" : "center"
                  )
                }
                className="rounded-md border border-[#30363d] bg-[#0d1117] px-2.5 py-1.5 text-left text-[#c9d1d9] hover:border-[#8b949e]"
              >
                Align:{" "}
                <span className="font-mono font-semibold text-[#FF6B00]">
                  {readmeConfig.align}
                </span>
              </button>

              <button
                type="button"
                onClick={() =>
                  updateField(
                    "useOutputBranchUrl",
                    !readmeConfig.useOutputBranchUrl
                  )
                }
                className="rounded-md border border-[#30363d] bg-[#0d1117] px-2.5 py-1.5 text-left text-[#c9d1d9] hover:border-[#8b949e]"
              >
                Source:{" "}
                <span className="font-mono font-semibold text-[#00E676]">
                  {readmeConfig.useOutputBranchUrl
                    ? "output branch"
                    : "./creature.svg"}
                </span>
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-1 text-[11px]">
              {(
                [
                  {
                    key: "includeMarkers",
                    label: "Auto-Update Markers",
                  },
                  {
                    key: "includeTelemetryCaption",
                    label: "Telemetry Caption",
                  },
                  {
                    key: "includeStatsTable",
                    label: "Stats Table",
                  },
                  {
                    key: "includeShareCard",
                    label: "Include Share Card",
                  },
                ] as const
              ).map((opt) => (
                <label
                  key={opt.key}
                  className="flex cursor-pointer items-center gap-2 rounded-md border border-[#30363d] bg-[#0d1117] px-2.5 py-1.5 text-[#c9d1d9]"
                >
                  <input
                    type="checkbox"
                    checked={readmeConfig[opt.key]}
                    onChange={(e) => updateField(opt.key, e.target.checked)}
                    className="accent-[#00E676]"
                  />
                  <span>{opt.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Badges Manager */}
          <div className="rounded-lg border border-[#30363d] bg-[#161b22]/50 p-3">
            <div className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-[#8b949e]">
              Profile Tech Badges
            </div>
            <div className="mb-2.5 flex flex-wrap gap-1.5">
              {readmeConfig.badges.map((badge) => (
                <div
                  key={badge.id}
                  className={`inline-flex items-center gap-1.5 rounded-md border px-2 py-1 text-[11px] ${
                    badge.enabled
                      ? "border-[#30363d] bg-[#0d1117] text-white"
                      : "border-[#21262d] bg-[#0d1117]/40 text-[#6e7681] line-through"
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => handleToggleBadge(badge.id)}
                    className="flex items-center gap-1.5"
                  >
                    <span
                      className="h-2.5 w-2.5 rounded-full"
                      style={{ backgroundColor: `#${badge.color}` }}
                    />
                    <span>{badge.label}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDeleteBadge(badge.id)}
                    aria-label={`Remove ${badge.label}`}
                    className="text-[#8b949e] hover:text-red-400"
                  >
                    <Trash2 className="h-3 w-3" />
                  </button>
                </div>
              ))}
            </div>

            <form onSubmit={handleAddBadge} className="flex gap-2">
              <input
                type="text"
                value={newBadgeLabel}
                onChange={(e) => setNewBadgeLabel(e.target.value)}
                placeholder="Add badge (e.g. Rust, Docker)"
                className="flex-1 rounded-md border border-[#30363d] bg-[#0d1117] px-2.5 py-1 text-xs text-white placeholder-[#6e7681] focus:border-[#00E676] focus:outline-none"
              />
              <input
                type="color"
                value={newBadgeColor}
                onChange={(e) => setNewBadgeColor(e.target.value)}
                aria-label="New badge color"
                className="h-7 w-9 cursor-pointer rounded border border-[#30363d] bg-transparent"
              />
              <button
                type="submit"
                className="inline-flex items-center gap-1 rounded-md bg-[#21262d] px-2.5 py-1 text-xs font-medium text-white hover:bg-[#30363d]"
              >
                <Plus className="h-3.5 w-3.5" />
                Add
              </button>
            </form>
          </div>
        </div>

        {/* Live Raw Markdown Editor */}
        <div className="flex flex-col rounded-lg border border-[#30363d] bg-[#090c10] xl:col-span-6">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#21262d] bg-[#161b22] px-3 py-2">
            <span className="font-mono text-[11px] font-semibold text-[#e6edf3]">
              README.md (Dynamic Tokens + Live Markdown)
            </span>
            {readmeConfig.rawOverride !== null && (
              <button
                type="button"
                onClick={() =>
                  onChange({ ...readmeConfig, rawOverride: null })
                }
                className="inline-flex items-center gap-1 rounded border border-[#30363d] bg-[#0d1117] px-2 py-0.5 text-[10px] font-medium text-[#00E676] hover:border-[#00E676]"
              >
                <RefreshCw className="h-3 w-3" />
                Resync from Form
              </button>
            )}
          </div>

          {/* Clickable Token Chips */}
          <div className="flex flex-wrap items-center gap-1.5 border-b border-[#21262d] bg-[#0d1117] px-3 py-2">
            <span className="text-[10px] font-semibold uppercase text-[#8b949e]">
              Insert token:
            </span>
            {DYNAMIC_TOKENS.map((t) => (
              <button
                key={t.token}
                type="button"
                title={t.description}
                onClick={() => insertToken(t.token)}
                className="rounded border border-[#30363d] bg-[#161b22] px-1.5 py-0.5 font-mono text-[10px] text-[#79c0ff] transition hover:border-[#58a6ff]"
              >
                {t.token}
              </button>
            ))}
          </div>

          <textarea
            value={currentEditorText}
            onChange={(e) =>
              onChange({ ...readmeConfig, rawOverride: e.target.value })
            }
            aria-label="Raw README Markdown editor"
            spellCheck={false}
            className="min-h-[380px] flex-1 resize-y bg-[#090c10] p-3 font-mono text-xs leading-relaxed text-[#c9d1d9] focus:outline-none"
          />
        </div>
      </div>
    </div>
  );
}
