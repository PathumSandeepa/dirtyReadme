"use client";

import { useState } from "react";
import {
  Check,
  Code2,
  Copy,
  Download,
  ExternalLink,
  FileText,
  FolderGit2,
  Link2,
  Plus,
  RefreshCw,
  Tag,
  Trash2,
  UserCircle2,
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

type EditorSection = "identity" | "badges" | "links" | "layout";
type BadgeCategoryFilter =
  | "all"
  | "languages"
  | "frontend"
  | "backend"
  | "devops"
  | "design";

export function ReadmeEditorPanel({
  creatureConfig,
  readmeConfig,
  onChange,
}: ReadmeEditorPanelProps) {
  const [section, setSection] = useState<EditorSection>("identity");
  const [badgeCategory, setBadgeCategory] =
    useState<BadgeCategoryFilter>("all");
  const [newTagInput, setNewTagInput] = useState("");
  const [newBadgeLabel, setNewBadgeLabel] = useState("");
  const [newBadgeColor, setNewBadgeColor] = useState("#00E676");
  const [newLinkLabel, setNewLinkLabel] = useState("");
  const [newLinkText, setNewLinkText] = useState("");
  const [newLinkUrl, setNewLinkUrl] = useState("https://");
  const [newLinkColor, setNewLinkColor] = useState("#FF6B00");
  const [newProjName, setNewProjName] = useState("");
  const [newProjDesc, setNewProjDesc] = useState("");
  const [newProjLang, setNewProjLang] = useState("TypeScript");
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

  function handleAddSubtitleTag(e: React.FormEvent) {
    e.preventDefault();
    const cleaned = newTagInput.trim().toUpperCase();
    if (!cleaned) return;
    updateField("subtitleTags", [...readmeConfig.subtitleTags, cleaned]);
    setNewTagInput("");
  }

  function handleRemoveSubtitleTag(idx: number) {
    updateField(
      "subtitleTags",
      readmeConfig.subtitleTags.filter((_, i) => i !== idx)
    );
  }

  function handleAddBadge(e: React.FormEvent) {
    e.preventDefault();
    const label = newBadgeLabel.trim();
    if (!label) return;
    updateField("badges", [
      ...readmeConfig.badges,
      {
        id: `custom-${Date.now()}`,
        label,
        color: newBadgeColor.replace("#", ""),
        category: "devops",
        enabled: true,
      },
    ]);
    setNewBadgeLabel("");
  }

  function handleToggleBadge(id: string) {
    updateField(
      "badges",
      readmeConfig.badges.map((b) =>
        b.id === id ? { ...b, enabled: !b.enabled } : b
      )
    );
  }

  function handleDeleteBadge(id: string) {
    updateField(
      "badges",
      readmeConfig.badges.filter((b) => b.id !== id)
    );
  }

  function handleSyncTopLanguagesToBadges() {
    const langNames = new Set(
      creatureConfig.languages.map((l) => l.name.toLowerCase())
    );
    updateField(
      "badges",
      readmeConfig.badges.map((b) =>
        langNames.has(b.label.toLowerCase()) ? { ...b, enabled: true } : b
      )
    );
  }

  function handleAddActionLink(e: React.FormEvent) {
    e.preventDefault();
    if (!newLinkLabel.trim() || !newLinkUrl.trim()) return;
    updateField("actionLinks", [
      ...readmeConfig.actionLinks,
      {
        id: `link-${Date.now()}`,
        label: newLinkLabel.trim().toUpperCase(),
        valueText: (newLinkText.trim() || "OPEN").toUpperCase(),
        url: newLinkUrl.trim(),
        color: newLinkColor.replace("#", ""),
        enabled: true,
      },
    ]);
    setNewLinkLabel("");
    setNewLinkText("");
    setNewLinkUrl("https://");
  }

  function handleAddProject(e: React.FormEvent) {
    e.preventDefault();
    if (!newProjName.trim()) return;
    updateField("projects", [
      ...readmeConfig.projects,
      {
        id: `proj-${Date.now()}`,
        name: newProjName.trim(),
        description:
          newProjDesc.trim() || "Open-source project built with clean craft.",
        url: `https://github.com/${safeUser}/${newProjName.trim()}`,
        language: newProjLang.trim() || "TypeScript",
        enabled: true,
      },
    ]);
    setNewProjName("");
    setNewProjDesc("");
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

  const filteredBadges = readmeConfig.badges.filter(
    (b) => badgeCategory === "all" || b.category === badgeCategory
  );

  return (
    <div className="space-y-4 p-4 sm:p-5">
      {/* Top Action Bar */}
      <div className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-[#30363d] bg-[#161b22] px-3.5 py-2.5">
        <div className="flex items-center gap-2">
          <FileText className="h-4 w-4 text-[#00E676]" />
          <span className="text-xs font-semibold text-white">
            Customizable GitHub Profile README.md Builder
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
            Open on GitHub
            <ExternalLink className="h-3 w-3" />
          </a>
        </div>
      </div>

      {/* Layout: Form Controls + Raw Markdown Editor */}
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-12">
        {/* Form Controls */}
        <div className="space-y-3 xl:col-span-6">
          {/* Sub-section Tabs */}
          <div className="grid grid-cols-4 gap-1 rounded-lg border border-[#30363d] bg-[#0d1117] p-1 text-[11px]">
            {(
              [
                { id: "identity", label: "Identity", icon: UserCircle2 },
                { id: "badges", label: "Tech Stack", icon: Tag },
                { id: "links", label: "Links & Repos", icon: Link2 },
                { id: "layout", label: "Layout", icon: FolderGit2 },
              ] as const
            ).map((item) => {
              const Icon = item.icon;
              const active = section === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setSection(item.id)}
                  className={`inline-flex items-center justify-center gap-1 rounded-md px-2 py-1.5 font-medium transition ${
                    active
                      ? "bg-[#21262d] text-white"
                      : "text-[#8b949e] hover:text-white"
                  }`}
                >
                  <Icon className="h-3 w-3 text-[#FF6B00]" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>

          {section === "identity" && (
            <div className="space-y-3 rounded-lg border border-[#30363d] bg-[#161b22]/50 p-3">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="mb-1 block text-[11px] font-medium text-[#c9d1d9]">
                    Display Name (Sidebar)
                  </label>
                  <input
                    type="text"
                    value={readmeConfig.profileDisplayName}
                    onChange={(e) =>
                      updateField("profileDisplayName", e.target.value)
                    }
                    className="w-full rounded-md border border-[#30363d] bg-[#0d1117] px-2.5 py-1.5 text-xs text-white focus:border-[#00E676] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-[11px] font-medium text-[#c9d1d9]">
                    Location
                  </label>
                  <input
                    type="text"
                    value={readmeConfig.profileLocation}
                    onChange={(e) =>
                      updateField("profileLocation", e.target.value)
                    }
                    className="w-full rounded-md border border-[#30363d] bg-[#0d1117] px-2.5 py-1.5 text-xs text-white focus:border-[#00E676] focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="mb-1 block text-[11px] font-medium text-[#c9d1d9]">
                  README Main Headline
                </label>
                <input
                  type="text"
                  value={readmeConfig.headline}
                  onChange={(e) => updateField("headline", e.target.value)}
                  className="w-full rounded-md border border-[#30363d] bg-[#0d1117] px-2.5 py-1.5 font-mono text-xs text-white focus:border-[#00E676] focus:outline-none"
                />
              </div>

              {/* Uppercase Pipe-Separated Specialty Tags */}
              <div>
                <label className="mb-1 block text-[11px] font-medium text-[#c9d1d9]">
                  Specialty Tagline Chips (Pipe-separated)
                </label>
                <div className="mb-2 flex flex-wrap gap-1.5">
                  {readmeConfig.subtitleTags.map((tag, idx) => (
                    <span
                      key={`${tag}-${idx}`}
                      className="inline-flex items-center gap-1 rounded border border-[#30363d] bg-[#0d1117] px-2 py-0.5 font-mono text-[10px] text-[#e6edf3]"
                    >
                      {tag}
                      <button
                        type="button"
                        onClick={() => handleRemoveSubtitleTag(idx)}
                        className="text-[#8b949e] hover:text-red-400"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
                <form onSubmit={handleAddSubtitleTag} className="flex gap-1.5">
                  <input
                    type="text"
                    value={newTagInput}
                    onChange={(e) => setNewTagInput(e.target.value)}
                    placeholder="Add specialty (e.g. AI SYSTEMS)"
                    className="flex-1 rounded-md border border-[#30363d] bg-[#0d1117] px-2.5 py-1 text-xs text-white placeholder-[#6e7681] focus:border-[#00E676] focus:outline-none"
                  />
                  <button
                    type="submit"
                    className="rounded-md bg-[#21262d] px-2.5 py-1 text-xs font-medium text-white hover:bg-[#30363d]"
                  >
                    Add
                  </button>
                </form>
              </div>

              <div>
                <label className="mb-1 block text-[11px] font-medium text-[#c9d1d9]">
                  Bio / Story Paragraph
                </label>
                <textarea
                  rows={3}
                  value={readmeConfig.bio}
                  onChange={(e) => updateField("bio", e.target.value)}
                  className="w-full rounded-md border border-[#30363d] bg-[#0d1117] px-2.5 py-1.5 text-xs text-white focus:border-[#00E676] focus:outline-none"
                />
              </div>

              <div>
                <label className="mb-1 block text-[11px] font-medium text-[#c9d1d9]">
                  Call-To-Action Line
                </label>
                <input
                  type="text"
                  value={readmeConfig.ctaLine}
                  onChange={(e) => updateField("ctaLine", e.target.value)}
                  className="w-full rounded-md border border-[#30363d] bg-[#0d1117] px-2.5 py-1.5 text-xs text-white focus:border-[#00E676] focus:outline-none"
                />
              </div>
            </div>
          )}

          {section === "badges" && (
            <div className="space-y-3 rounded-lg border border-[#30363d] bg-[#161b22]/50 p-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex flex-wrap gap-1">
                  {(
                    [
                      "all",
                      "languages",
                      "frontend",
                      "backend",
                      "devops",
                      "design",
                    ] as const
                  ).map((cat) => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setBadgeCategory(cat)}
                      className={`rounded px-2 py-0.5 text-[10px] font-semibold uppercase transition ${
                        badgeCategory === cat
                          ? "bg-[#FF6B00] text-white"
                          : "bg-[#0d1117] text-[#8b949e] hover:text-white"
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
                <button
                  type="button"
                  onClick={handleSyncTopLanguagesToBadges}
                  className="font-mono text-[10px] font-semibold text-[#00E676] hover:underline"
                >
                  Enable GitHub Top Langs
                </button>
              </div>

              <div className="flex max-h-52 flex-wrap gap-1.5 overflow-y-auto pr-1">
                {filteredBadges.map((badge) => (
                  <div
                    key={badge.id}
                    className={`inline-flex items-center gap-1.5 rounded border px-2 py-1 text-[11px] transition ${
                      badge.enabled
                        ? "border-[#00E676]/50 bg-[#0d1117] text-white"
                        : "border-[#21262d] bg-[#0d1117]/40 text-[#6e7681]"
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
                    {badge.id.startsWith("custom-") && (
                      <button
                        type="button"
                        onClick={() => handleDeleteBadge(badge.id)}
                        className="text-[#8b949e] hover:text-red-400"
                      >
                        <Trash2 className="h-3 w-3" />
                      </button>
                    )}
                  </div>
                ))}
              </div>

              <form onSubmit={handleAddBadge} className="flex gap-2 pt-1">
                <input
                  type="text"
                  value={newBadgeLabel}
                  onChange={(e) => setNewBadgeLabel(e.target.value)}
                  placeholder="Custom tech badge (e.g. GraphQL)"
                  className="flex-1 rounded-md border border-[#30363d] bg-[#0d1117] px-2.5 py-1 text-xs text-white placeholder-[#6e7681] focus:border-[#00E676] focus:outline-none"
                />
                <input
                  type="color"
                  value={newBadgeColor}
                  onChange={(e) => setNewBadgeColor(e.target.value)}
                  aria-label="Custom badge color"
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
          )}

          {section === "links" && (
            <div className="space-y-3 rounded-lg border border-[#30363d] bg-[#161b22]/50 p-3">
              <div>
                <div className="mb-1.5 text-[11px] font-semibold uppercase tracking-wider text-[#8b949e]">
                  CTA &amp; Social Pills (Above Creature)
                </div>
                <div className="space-y-1.5">
                  {readmeConfig.actionLinks.map((link) => (
                    <div
                      key={link.id}
                      className="flex items-center justify-between gap-2 rounded border border-[#30363d] bg-[#0d1117] px-2.5 py-1.5 text-xs"
                    >
                      <label className="flex cursor-pointer items-center gap-2 truncate">
                        <input
                          type="checkbox"
                          checked={link.enabled}
                          onChange={() =>
                            updateField(
                              "actionLinks",
                              readmeConfig.actionLinks.map((l) =>
                                l.id === link.id
                                  ? { ...l, enabled: !l.enabled }
                                  : l
                              )
                            )
                          }
                          className="accent-[#00E676]"
                        />
                        <span className="font-mono font-bold text-[#e6edf3]">
                          {link.label}
                        </span>
                        <span className="truncate text-[11px] text-[#8b949e]">
                          {link.valueText}
                        </span>
                      </label>
                      <button
                        type="button"
                        onClick={() =>
                          updateField(
                            "actionLinks",
                            readmeConfig.actionLinks.filter(
                              (l) => l.id !== link.id
                            )
                          )
                        }
                        className="text-[#8b949e] hover:text-red-400"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
                <form
                  onSubmit={handleAddActionLink}
                  className="mt-2 grid grid-cols-2 gap-1.5"
                >
                  <input
                    type="text"
                    value={newLinkLabel}
                    onChange={(e) => setNewLinkLabel(e.target.value)}
                    placeholder="Label (PORTFOLIO)"
                    className="rounded border border-[#30363d] bg-[#0d1117] px-2 py-1 text-xs text-white"
                  />
                  <input
                    type="text"
                    value={newLinkText}
                    onChange={(e) => setNewLinkText(e.target.value)}
                    placeholder="Display text (VISIT)"
                    className="rounded border border-[#30363d] bg-[#0d1117] px-2 py-1 text-xs text-white"
                  />
                  <input
                    type="url"
                    value={newLinkUrl}
                    onChange={(e) => setNewLinkUrl(e.target.value)}
                    placeholder="https://..."
                    className="rounded border border-[#30363d] bg-[#0d1117] px-2 py-1 text-xs text-white"
                  />
                  <div className="flex gap-1.5">
                    <input
                      type="color"
                      value={newLinkColor}
                      onChange={(e) => setNewLinkColor(e.target.value)}
                      className="h-7 w-9 rounded border border-[#30363d] bg-transparent"
                    />
                    <button
                      type="submit"
                      className="flex-1 rounded bg-[#21262d] px-2 py-1 text-xs font-medium text-white hover:bg-[#30363d]"
                    >
                      + Add Link
                    </button>
                  </div>
                </form>
              </div>

              <div className="border-t border-[#21262d] pt-3">
                <div className="mb-1.5 text-[11px] font-semibold uppercase tracking-wider text-[#8b949e]">
                  Featured Projects
                </div>
                <div className="space-y-1.5">
                  {readmeConfig.projects.map((proj) => (
                    <div
                      key={proj.id}
                      className="flex items-center justify-between gap-2 rounded border border-[#30363d] bg-[#0d1117] px-2.5 py-1.5 text-xs"
                    >
                      <label className="flex cursor-pointer items-center gap-2 truncate">
                        <input
                          type="checkbox"
                          checked={proj.enabled}
                          onChange={() =>
                            updateField(
                              "projects",
                              readmeConfig.projects.map((p) =>
                                p.id === proj.id
                                  ? { ...p, enabled: !p.enabled }
                                  : p
                              )
                            )
                          }
                          className="accent-[#00E676]"
                        />
                        <span className="font-mono font-semibold text-[#58a6ff]">
                          {proj.name}
                        </span>
                        <span className="text-[10px] text-[#8b949e]">
                          ({proj.language})
                        </span>
                      </label>
                      <button
                        type="button"
                        onClick={() =>
                          updateField(
                            "projects",
                            readmeConfig.projects.filter(
                              (p) => p.id !== proj.id
                            )
                          )
                        }
                        className="text-[#8b949e] hover:text-red-400"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
                <form
                  onSubmit={handleAddProject}
                  className="mt-2 grid grid-cols-3 gap-1.5"
                >
                  <input
                    type="text"
                    value={newProjName}
                    onChange={(e) => setNewProjName(e.target.value)}
                    placeholder="Repo name"
                    className="rounded border border-[#30363d] bg-[#0d1117] px-2 py-1 text-xs text-white"
                  />
                  <input
                    type="text"
                    value={newProjDesc}
                    onChange={(e) => setNewProjDesc(e.target.value)}
                    placeholder="Short description"
                    className="rounded border border-[#30363d] bg-[#0d1117] px-2 py-1 text-xs text-white"
                  />
                  <div className="flex gap-1">
                    <input
                      type="text"
                      value={newProjLang}
                      onChange={(e) => setNewProjLang(e.target.value)}
                      placeholder="Stack"
                      className="w-16 rounded border border-[#30363d] bg-[#0d1117] px-1.5 py-1 text-xs text-white"
                    />
                    <button
                      type="submit"
                      className="flex-1 rounded bg-[#21262d] px-2 py-1 text-xs font-medium text-white hover:bg-[#30363d]"
                    >
                      +
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {section === "layout" && (
            <div className="space-y-3 rounded-lg border border-[#30363d] bg-[#161b22]/50 p-3">
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

              <div className="flex items-center justify-between gap-3">
                <span className="text-xs font-medium text-[#e6edf3]">
                  Creature Width ({readmeConfig.imageWidth}px)
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
                  className="rounded-md border border-[#30363d] bg-[#0d1117] px-2.5 py-1.5 text-left text-[#c9d1d9]"
                >
                  Badges Align:{" "}
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
                  className="rounded-md border border-[#30363d] bg-[#0d1117] px-2.5 py-1.5 text-left text-[#c9d1d9]"
                >
                  Src:{" "}
                  <span className="font-mono font-semibold text-[#00E676]">
                    {readmeConfig.useOutputBranchUrl
                      ? "output branch"
                      : "./creature.svg"}
                  </span>
                </button>
              </div>

              <div className="grid grid-cols-2 gap-2 text-[11px]">
                {(
                  [
                    { key: "includeMarkers", label: "Auto-Update Markers" },
                    {
                      key: "includeTelemetryCaption",
                      label: "Telemetry Caption",
                    },
                    { key: "includeStatsTable", label: "Stats Table" },
                    { key: "includeProjects", label: "Featured Projects" },
                    { key: "includeShareCard", label: "Include Share Card" },
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

              <div>
                <label className="mb-1 block text-xs font-medium text-[#e6edf3]">
                  Custom Footer Markdown (Optional)
                </label>
                <textarea
                  rows={2}
                  value={readmeConfig.customFooterMarkdown}
                  onChange={(e) =>
                    updateField("customFooterMarkdown", e.target.value)
                  }
                  placeholder="Add custom sections or contact links..."
                  className="w-full rounded-md border border-[#30363d] bg-[#0d1117] px-2.5 py-1.5 font-mono text-xs text-white placeholder-[#6e7681]"
                />
              </div>
            </div>
          )}
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
                onClick={() => onChange({ ...readmeConfig, rawOverride: null })}
                className="inline-flex items-center gap-1 rounded border border-[#30363d] bg-[#0d1117] px-2 py-0.5 text-[10px] font-medium text-[#00E676] hover:border-[#00E676]"
              >
                <RefreshCw className="h-3 w-3" />
                Resync from Form
              </button>
            )}
          </div>

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
