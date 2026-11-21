"use client";

import { useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  FileText,
  GripVertical,
  Link2,
  Plus,
  RefreshCw,
  Tag,
  Trash2,
  User,
} from "lucide-react";
import type { CreatureConfig } from "@/domain/creature/entities";
import {
  DYNAMIC_TOKENS,
  README_TEMPLATES,
  type ReadmeConfig,
  type TechCategory,
} from "@/domain/profile/entities";
import { buildGeneratedReadmeMarkdown } from "@/domain/profile/readmeService";

interface ProfileReadmeStepPanelProps {
  creatureConfig: CreatureConfig;
  readmeConfig: ReadmeConfig;
  onUpdateField: <K extends keyof ReadmeConfig>(
    key: K,
    value: ReadmeConfig[K]
  ) => void;
  onChangeRawMarkdown: (raw: string | null) => void;
  onReorderBadges: (draggedId: string, targetId: string) => void;
  onMoveBadge: (badgeId: string, direction: -1 | 1) => void;
  onReorderTags: (fromIdx: number, toIdx: number) => void;
  onPrevStep: () => void;
  onNextStep: () => void;
}

type CategoryFilter = "all" | TechCategory;

export function ProfileReadmeStepPanel({
  creatureConfig,
  readmeConfig,
  onUpdateField,
  onChangeRawMarkdown,
  onReorderBadges,
  onMoveBadge,
  onReorderTags,
  onPrevStep,
  onNextStep,
}: ProfileReadmeStepPanelProps) {
  const [badgeCategory, setBadgeCategory] = useState<CategoryFilter>("all");
  const [badgeSearch, setBadgeSearch] = useState("");
  const [draggedBadgeId, setDraggedBadgeId] = useState<string | null>(null);
  const [dragOverBadgeId, setDragOverBadgeId] = useState<string | null>(null);
  const [dropZoneActive, setDropZoneActive] = useState(false);
  const [draggedTagIdx, setDraggedTagIdx] = useState<number | null>(null);

  const [newTagInput, setNewTagInput] = useState("");
  const [newBadgeLabel, setNewBadgeLabel] = useState("");
  const [newBadgeColor, setNewBadgeColor] = useState("#0F172A");
  const [newLinkLabel, setNewLinkLabel] = useState("");
  const [newLinkText, setNewLinkText] = useState("");
  const [newLinkUrl, setNewLinkUrl] = useState("https://");
  const [newLinkColor, setNewLinkColor] = useState("#0F172A");
  const [showRawEditor, setShowRawEditor] = useState(false);

  const activeBadges = readmeConfig.badges.filter((b) => b.enabled);
  const availableBadges = readmeConfig.badges.filter((b) => {
    if (b.enabled) return false;
    const matchesCat =
      badgeCategory === "all" || b.category === badgeCategory;
    const matchesQuery = b.label
      .toLowerCase()
      .includes(badgeSearch.trim().toLowerCase());
    return matchesCat && matchesQuery;
  });

  const generatedMarkdown = buildGeneratedReadmeMarkdown(
    creatureConfig,
    readmeConfig
  );
  const currentRawText =
    readmeConfig.rawOverride !== null
      ? readmeConfig.rawOverride
      : generatedMarkdown;

  function toggleBadge(id: string, enabled: boolean) {
    onUpdateField( "badges",
      readmeConfig.badges.map((b) => (b.id === id ? { ...b, enabled } : b))
    );
  }

  function handleDropOnBadge(targetId: string) {
    if (!draggedBadgeId) return;
    const dragged = readmeConfig.badges.find((b) => b.id === draggedBadgeId);
    if (dragged && !dragged.enabled) {
      onUpdateField( "badges",
        readmeConfig.badges.map((b) =>
          b.id === draggedBadgeId ? { ...b, enabled: true } : b
        )
      );
    }
    onReorderBadges(draggedBadgeId, targetId);
    setDraggedBadgeId(null);
    setDragOverBadgeId(null);
    setDropZoneActive(false);
  }

  function handleDropInSelectedZone() {
    if (!draggedBadgeId) return;
    const dragged = readmeConfig.badges.find((b) => b.id === draggedBadgeId);
    if (dragged && !dragged.enabled) {
      toggleBadge(draggedBadgeId, true);
    }
    setDraggedBadgeId(null);
    setDragOverBadgeId(null);
    setDropZoneActive(false);
  }

  function handleAddTag(e: React.FormEvent) {
    e.preventDefault();
    const cleaned = newTagInput.trim().toUpperCase();
    if (!cleaned) return;
    onUpdateField("subtitleTags", [...readmeConfig.subtitleTags, cleaned]);
    setNewTagInput("");
  }

  function handleAddCustomBadge(e: React.FormEvent) {
    e.preventDefault();
    const label = newBadgeLabel.trim();
    if (!label) return;
    onUpdateField("badges", [
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

  function handleAddActionLink(e: React.FormEvent) {
    e.preventDefault();
    if (!newLinkLabel.trim() || !newLinkUrl.trim()) return;
    onUpdateField("actionLinks", [
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

  function insertToken(token: string) {
    const base =
      readmeConfig.rawOverride !== null
        ? readmeConfig.rawOverride
        : generatedMarkdown;
    onChangeRawMarkdown(`${base}\n${token}`);
  }

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border bg-card p-6 text-card-foreground shadow-sm ">
        <div className="mb-4 flex items-center gap-2.5">
          <User className="h-5 w-5 text-foreground/85 " />
          <div>
            <h2 className="text-base font-semibold text-foreground ">
              Customize Every Text on Your Profile
            </h2>
            <p className="text-sm text-muted-foreground ">
              Edit headings, bio, tags, sidebar details, and captions freely.
            </p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-xs font-medium text-foreground/85 ">
                Display Name
              </label>
              <input
                type="text"
                value={readmeConfig.profileDisplayName}
                onChange={(e) =>
                  onUpdateField("profileDisplayName", e.target.value)
                }
                className="w-full rounded-xl border bg-muted/50 px-3.5 py-2 text-sm text-foreground focus:border-primary focus:bg-background focus:outline-none "
              />
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-medium text-foreground/85 ">
                Location
              </label>
              <input
                type="text"
                value={readmeConfig.profileLocation}
                onChange={(e) =>
                  onUpdateField("profileLocation", e.target.value)
                }
                className="w-full rounded-xl border bg-muted/50 px-3.5 py-2 text-sm text-foreground focus:border-primary focus:bg-background focus:outline-none "
              />
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-medium text-foreground/85 ">
                Role / Organization
              </label>
              <input
                type="text"
                value={readmeConfig.profileCompany}
                onChange={(e) =>
                  onUpdateField("profileCompany", e.target.value)
                }
                className="w-full rounded-xl border bg-muted/50 px-3.5 py-2 text-sm text-foreground focus:border-primary focus:bg-background focus:outline-none "
              />
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-medium text-foreground/85 ">
                Website URL
              </label>
              <input
                type="text"
                value={readmeConfig.profileWebsite}
                onChange={(e) =>
                  onUpdateField("profileWebsite", e.target.value)
                }
                className="w-full rounded-xl border bg-muted/50 px-3.5 py-2 text-sm text-foreground focus:border-primary focus:bg-background focus:outline-none "
              />
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-medium text-foreground/85 ">
              Sidebar Status Bio
            </label>
            <input
              type="text"
              value={readmeConfig.profileStatusBio}
              onChange={(e) =>
                onUpdateField("profileStatusBio", e.target.value)
              }
              className="w-full rounded-xl border bg-muted/50 px-3.5 py-2 text-sm text-foreground focus:border-primary focus:bg-background focus:outline-none "
            />
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-medium text-foreground/85 ">
              README Main Headline
            </label>
            <input
              type="text"
              value={readmeConfig.headline}
              onChange={(e) => onUpdateField("headline", e.target.value)}
              className="w-full rounded-xl border bg-muted/50 px-3.5 py-2 text-sm font-medium text-foreground focus:border-primary focus:bg-background focus:outline-none "
            />
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-medium text-foreground/85 ">
              Role Tagline Chips (Drag to reorder)
            </label>
            <div className="mb-2.5 flex flex-wrap gap-2">
              {readmeConfig.subtitleTags.map((tag, idx) => (
                <div
                  key={`${tag}-${idx}`}
                  draggable
                  onDragStart={() => setDraggedTagIdx(idx)}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={() => {
                    if (draggedTagIdx !== null) {
                      onReorderTags(draggedTagIdx, idx);
                    }
                    setDraggedTagIdx(null);
                  }}
                  className="inline-flex cursor-grab items-center gap-1.5 rounded-lg border bg-muted/50 px-2.5 py-1 text-xs font-medium text-foreground active:cursor-grabbing "
                >
                  <GripVertical className="h-3.5 w-3.5 text-slate-400" />
                  <input
                    type="text"
                    value={tag}
                    onChange={(e) => {
                      const updated = [...readmeConfig.subtitleTags];
                      updated[idx] = e.target.value;
                      onUpdateField("subtitleTags", updated);
                    }}
                    className="w-32 bg-transparent font-mono text-xs focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() =>
                      onUpdateField( "subtitleTags",
                        readmeConfig.subtitleTags.filter((_, i) => i !== idx)
                      )
                    }
                    className="text-slate-400 hover:text-red-600"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
            <form onSubmit={handleAddTag} className="flex gap-2">
              <input
                type="text"
                value={newTagInput}
                onChange={(e) => setNewTagInput(e.target.value)}
                placeholder="Add role tag (e.g. CLOUD ARCHITECT)"
                className="flex-1 rounded-xl border bg-muted/50 px-3.5 py-2 text-sm text-foreground placeholder-slate-400 focus:border-primary focus:bg-background focus:outline-none "
              />
              <button
                type="submit"
                className="rounded-xl border bg-card px-4 py-2 text-sm font-medium text-foreground/85 hover:bg-muted/50 "
              >
                Add Tag
              </button>
            </form>
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-medium text-foreground/85 ">
              About / Intro Paragraph
            </label>
            <textarea
              rows={3}
              value={readmeConfig.bio}
              onChange={(e) => onUpdateField("bio", e.target.value)}
              className="w-full rounded-xl border bg-muted/50 px-3.5 py-2.5 text-sm leading-relaxed text-foreground focus:border-primary focus:bg-background focus:outline-none "
            />
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-medium text-foreground/85 ">
              Call-To-Action Line
            </label>
            <input
              type="text"
              value={readmeConfig.ctaLine}
              onChange={(e) => onUpdateField("ctaLine", e.target.value)}
              className="w-full rounded-xl border bg-muted/50 px-3.5 py-2 text-sm text-foreground focus:border-primary focus:bg-background focus:outline-none "
            />
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-medium text-foreground/85 ">
              Creature Caption Text (supports {"{{CREATURE}}"}, {"{{STAGE}}"}, {"{{COMMITS}}"})
            </label>
            <input
              type="text"
              value={readmeConfig.telemetryCaptionTemplate}
              onChange={(e) =>
                onUpdateField("telemetryCaptionTemplate", e.target.value)
              }
              className="w-full rounded-xl border bg-muted/50 px-3.5 py-2 text-sm text-foreground focus:border-primary focus:bg-background focus:outline-none "
            />
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-xs font-medium text-foreground/85 ">
                Extra Section Heading (Optional)
              </label>
              <input
                type="text"
                value={readmeConfig.customSectionTitle}
                onChange={(e) =>
                  onUpdateField("customSectionTitle", e.target.value)
                }
                placeholder="e.g. Current Focus"
                className="w-full rounded-xl border bg-muted/50 px-3.5 py-2 text-sm text-foreground placeholder-slate-400 focus:border-primary focus:bg-background focus:outline-none "
              />
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-medium text-foreground/85 ">
                Telemetry Table Title
              </label>
              <input
                type="text"
                value={readmeConfig.statsTableTitle}
                onChange={(e) =>
                  onUpdateField("statsTableTitle", e.target.value)
                }
                className="w-full rounded-xl border bg-muted/50 px-3.5 py-2 text-sm text-foreground focus:border-primary focus:bg-background focus:outline-none "
              />
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-medium text-foreground/85 ">
              Extra Custom Markdown Block (Optional)
            </label>
            <textarea
              rows={2}
              value={readmeConfig.customFooterMarkdown}
              onChange={(e) =>
                onUpdateField("customFooterMarkdown", e.target.value)
              }
              placeholder="Write any extra Markdown lines or links..."
              className="w-full rounded-xl border bg-muted/50 px-3.5 py-2 font-mono text-xs text-foreground placeholder-slate-400 focus:border-primary focus:bg-background focus:outline-none "
            />
          </div>
        </div>
      </div>

      <div className="rounded-2xl border bg-card p-6 text-card-foreground shadow-sm ">
        <div className="mb-4 flex items-center gap-2.5">
          <Tag className="h-5 w-5 text-foreground/85 " />
          <div>
            <h2 className="text-base font-semibold text-foreground ">
              Drag &amp; Drop Tech Stack Builder
            </h2>
            <p className="text-sm text-muted-foreground ">
              Drag badges to reorder them, or drag any skill from the library into your active stack.
            </p>
          </div>
        </div>

        <div
          onDragOver={(e) => {
            e.preventDefault();
            setDropZoneActive(true);
          }}
          onDragLeave={() => setDropZoneActive(false)}
          onDrop={(e) => {
            e.preventDefault();
            handleDropInSelectedZone();
          }}
          className={`rounded-xl border-2 border-dashed p-4 transition ${
            dropZoneActive
              ? "border-primary bg-accent/60"
              : "bg-muted/40"
          }`}
        >
          <div className="mb-2.5 flex items-center justify-between text-xs font-semibold text-muted-foreground">
            <span>Active Tech Stack ({activeBadges.length}) — Drag to Reorder</span>
            <span className="font-normal text-muted-foreground">
              Drop skills here
            </span>
          </div>

          {activeBadges.length === 0 ? (
            <p className="py-4 text-center text-sm text-muted-foreground">
              Drag or click skills below to add them to your README.
            </p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {activeBadges.map((badge, idx) => (
                <div
                  key={badge.id}
                  draggable
                  onDragStart={() => setDraggedBadgeId(badge.id)}
                  onDragEnd={() => {
                    setDraggedBadgeId(null);
                    setDragOverBadgeId(null);
                  }}
                  onDragOver={(e) => {
                    e.preventDefault();
                    setDragOverBadgeId(badge.id);
                  }}
                  onDrop={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    handleDropOnBadge(badge.id);
                  }}
                  className={`inline-flex cursor-grab items-center gap-1.5 rounded-lg border bg-card px-2.5 py-1.5 text-xs font-medium text-card-foreground shadow-xs transition active:cursor-grabbing ${
                    dragOverBadgeId === badge.id
                      ? "border-primary ring-2 ring-primary/25"
                      : "border-border"
                  }`}
                >
                  <GripVertical className="h-3.5 w-3.5 text-muted-foreground" />
                  <span
                    className="h-2.5 w-2.5 rounded-full"
                    style={{ backgroundColor: `#${badge.color}` }}
                  />
                  <span>{badge.label}</span>
                  <div className="ml-1 flex items-center gap-0.5 border-l border-border pl-1">
                    <button
                      type="button"
                      disabled={idx === 0}
                      onClick={() => onMoveBadge(badge.id, -1)}
                      aria-label={`Move ${badge.label} left`}
                      className="rounded p-0.5 text-muted-foreground hover:bg-muted hover:text-foreground disabled:opacity-30"
                    >
                      <ChevronLeft className="h-3 w-3" />
                    </button>
                    <button
                      type="button"
                      disabled={idx === activeBadges.length - 1}
                      onClick={() => onMoveBadge(badge.id, 1)}
                      aria-label={`Move ${badge.label} right`}
                      className="rounded p-0.5 text-muted-foreground hover:bg-muted hover:text-foreground disabled:opacity-30"
                    >
                      <ChevronRight className="h-3 w-3" />
                    </button>
                    <button
                      type="button"
                      onClick={() => toggleBadge(badge.id, false)}
                      aria-label={`Remove ${badge.label}`}
                      className="rounded p-0.5 text-muted-foreground hover:bg-destructive/15 hover:text-destructive"
                    >
                      ×
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="mt-4 flex flex-col gap-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex flex-wrap gap-1">
              {(
                [ "all", "languages", "frontend", "backend", "devops", "design",
                ] as const
              ).map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setBadgeCategory(cat)}
                  className={`rounded-lg px-2.5 py-1 text-xs font-medium capitalize transition ${
                    badgeCategory === cat
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
            <input
              type="text"
              value={badgeSearch}
              onChange={(e) => setBadgeSearch(e.target.value)}
              placeholder="Search skills..."
              className="rounded-lg border border-border bg-muted/50 px-3 py-1 text-xs text-foreground placeholder:text-muted-foreground focus:border-primary focus:bg-background focus:outline-none"
            />
          </div>

          <div className="flex max-h-40 flex-wrap gap-2 overflow-y-auto rounded-xl border border-border bg-muted/40 p-3">
            {availableBadges.map((badge) => (
              <button
                key={badge.id}
                type="button"
                draggable
                onDragStart={() => setDraggedBadgeId(badge.id)}
                onDragEnd={() => setDraggedBadgeId(null)}
                onClick={() => toggleBadge(badge.id, true)}
                className="inline-flex cursor-grab items-center gap-1.5 rounded-lg border border-border bg-card px-2.5 py-1 text-xs font-medium text-card-foreground transition hover:border-primary/60 hover:bg-accent/50 active:cursor-grabbing"
              >
                <Plus className="h-3 w-3 text-muted-foreground" />
                <span
                  className="h-2.5 w-2.5 rounded-full"
                  style={{ backgroundColor: `#${badge.color}` }}
                />
                <span>{badge.label}</span>
              </button>
            ))}
          </div>

          <form onSubmit={handleAddCustomBadge} className="flex gap-2">
            <input
              type="text"
              value={newBadgeLabel}
              onChange={(e) => setNewBadgeLabel(e.target.value)}
              placeholder="Create custom badge (e.g. TensorFlow)"
              className="flex-1 rounded-xl border bg-muted/50 px-3.5 py-2 text-sm text-foreground placeholder-slate-400 focus:border-primary focus:bg-background focus:outline-none "
            />
            <input
              type="color"
              value={newBadgeColor}
              onChange={(e) => setNewBadgeColor(e.target.value)}
              aria-label="Custom badge color"
              className="h-10 w-11 cursor-pointer rounded-xl border border-border bg-transparent"
            />
            <button
              type="submit"
              className="rounded-xl border bg-card px-4 py-2 text-sm font-medium text-foreground hover:bg-muted/50 "
            >
              Add
            </button>
          </form>
        </div>
      </div>

      <div className="rounded-2xl border bg-card p-6 text-card-foreground shadow-sm ">
        <div className="mb-4 flex items-center gap-2.5">
          <Link2 className="h-5 w-5 text-foreground/85 " />
          <div>
            <h2 className="text-base font-semibold text-foreground ">
              CTA Buttons &amp; Layout Options
            </h2>
            <p className="text-sm text-muted-foreground ">
              Customize your profile links, layout template, and optional Markdown blocks.
            </p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            {readmeConfig.actionLinks.map((link, idx) => (
              <div
                key={link.id}
                className="grid grid-cols-1 gap-2 rounded-xl border bg-muted/40 p-3  sm:grid-cols-12"
              >
                <input
                  type="text"
                  value={link.label}
                  onChange={(e) => {
                    const updated = [...readmeConfig.actionLinks];
                    updated[idx] = { ...link, label: e.target.value };
                    onUpdateField("actionLinks", updated);
                  }}
                  placeholder="Label"
                  className="rounded-lg border bg-card px-2.5 py-1.5 text-xs font-semibold text-foreground   sm:col-span-3"
                />
                <input
                  type="text"
                  value={link.valueText}
                  onChange={(e) => {
                    const updated = [...readmeConfig.actionLinks];
                    updated[idx] = { ...link, valueText: e.target.value };
                    onUpdateField("actionLinks", updated);
                  }}
                  placeholder="Text"
                  className="rounded-lg border bg-card px-2.5 py-1.5 text-xs text-foreground   sm:col-span-3"
                />
                <input
                  type="text"
                  value={link.url}
                  onChange={(e) => {
                    const updated = [...readmeConfig.actionLinks];
                    updated[idx] = { ...link, url: e.target.value };
                    onUpdateField("actionLinks", updated);
                  }}
                  placeholder="https://..."
                  className="rounded-lg border bg-card px-2.5 py-1.5 text-xs text-foreground/85   sm:col-span-5"
                />
                <button
                  type="button"
                  onClick={() =>
                    onUpdateField( "actionLinks",
                      readmeConfig.actionLinks.filter((l) => l.id !== link.id)
                    )
                  }
                  aria-label="Delete link"
                  className="flex items-center justify-center rounded-lg border bg-card p-1.5 text-slate-400 hover:text-red-600 "
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>

          <form
            onSubmit={handleAddActionLink}
            className="grid grid-cols-1 gap-2 sm:grid-cols-12"
          >
            <input
              type="text"
              value={newLinkLabel}
              onChange={(e) => setNewLinkLabel(e.target.value)}
              placeholder="Label (PORTFOLIO)"
              className="rounded-xl border bg-muted/50 px-3 py-2 text-xs text-foreground   sm:col-span-3"
            />
            <input
              type="text"
              value={newLinkText}
              onChange={(e) => setNewLinkText(e.target.value)}
              placeholder="Text (VISIT)"
              className="rounded-xl border bg-muted/50 px-3 py-2 text-xs text-foreground   sm:col-span-3"
            />
            <input
              type="url"
              value={newLinkUrl}
              onChange={(e) => setNewLinkUrl(e.target.value)}
              placeholder="https://..."
              className="rounded-xl border bg-muted/50 px-3 py-2 text-xs text-foreground   sm:col-span-4"
            />
            <div className="flex gap-1.5 sm:col-span-2">
              <input
                type="color"
                value={newLinkColor}
                onChange={(e) => setNewLinkColor(e.target.value)}
                className="h-9 w-9 rounded-lg border border-border bg-transparent"
              />
              <button
                type="submit"
                className="flex-1 rounded-xl border bg-card px-2 text-xs font-medium text-foreground hover:bg-muted/50 "
              >
                Add
              </button>
            </div>
          </form>

          <div className="grid grid-cols-2 gap-2.5 border-t border-border pt-4 ">
            {README_TEMPLATES.map((tpl) => (
              <button
                key={tpl.id}
                type="button"
                onClick={() => onUpdateField("templateId", tpl.id)}
                className={`rounded-xl border p-3 text-left transition ${
                  readmeConfig.templateId === tpl.id
                    ? "border-primary bg-accent/60 ring-1 ring-primary"
                    : "border-border bg-card hover:bg-muted/50"
                }`}
              >
                <div className="text-xs font-semibold text-foreground">
                  {tpl.name}
                </div>
                <div className="mt-0.5 text-[11px] text-muted-foreground">
                  {tpl.description}
                </div>
              </button>
            ))}
          </div>

          <div className="grid grid-cols-2 gap-2.5 text-xs">
            {(
              [
                { key: "includeMarkers", label: "Auto-Update Markers" },
                { key: "includeTelemetryCaption", label: "Creature Caption" },
                { key: "includeStatsTable", label: "Telemetry Table" },
                { key: "includeShareCard", label: "1280x640 Share Card" },
              ] as const
            ).map((opt) => (
              <label
                key={opt.key}
                className="flex cursor-pointer items-center gap-2 rounded-xl border border-border bg-muted/50 px-3 py-2.5 text-foreground"
              >
                <input
                  type="checkbox"
                  checked={readmeConfig[opt.key]}
                  onChange={(e) => onUpdateField(opt.key, e.target.checked)}
                  className="accent-primary"
                />
                <span>{opt.label}</span>
              </label>
            ))}
          </div>

          <div className="border-t border-border pt-3 ">
            <button
              type="button"
              onClick={() => setShowRawEditor((v) => !v)}
              className="inline-flex items-center gap-2 text-xs font-semibold text-foreground/85 underline underline-offset-4 hover:text-foreground "
            >
              <FileText className="h-3.5 w-3.5" />
              {showRawEditor
                ? "Hide Advanced Raw Markdown Editor"
                : "Open Advanced Raw Markdown Editor"}
            </button>

            {showRawEditor && (
              <div className="mt-3 overflow-hidden rounded-xl border border-border bg-slate-950 ">
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 px-3 py-2">
                  <div className="flex flex-wrap gap-1.5">
                    {DYNAMIC_TOKENS.map((t) => (
                      <button
                        key={t.token}
                        type="button"
                        onClick={() => insertToken(t.token)}
                        className="rounded bg-slate-800 px-2 py-0.5 font-mono text-[10px] text-slate-200 hover:bg-slate-700"
                      >
                        {t.token}
                      </button>
                    ))}
                  </div>
                  {readmeConfig.rawOverride !== null && (
                    <button
                      type="button"
                      onClick={() => onChangeRawMarkdown(null)}
                      className="inline-flex items-center gap-1 rounded bg-slate-800 px-2 py-0.5 text-[10px] text-white"
                    >
                      <RefreshCw className="h-3 w-3" />
                      Resync Form
                    </button>
                  )}
                </div>
                <textarea
                  rows={10}
                  value={currentRawText}
                  onChange={(e) => onChangeRawMarkdown(e.target.value)}
                  spellCheck={false}
                  className="w-full bg-slate-950 p-3 font-mono text-xs leading-relaxed text-slate-200 focus:outline-none"
                />
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="flex gap-3">
        <button
          type="button"
          onClick={onPrevStep}
          className="inline-flex items-center justify-center gap-2 rounded-xl border bg-card px-5 py-3.5 text-sm font-semibold text-foreground/85 transition hover:bg-muted/50 "
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </button>
        <button
          type="button"
          onClick={onNextStep}
          className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-primary px-5 py-3.5 text-sm font-semibold text-primary-foreground shadow-sm transition hover:bg-primary/90 "
        >
          Next: Enter Token &amp; Push
          <ArrowRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
