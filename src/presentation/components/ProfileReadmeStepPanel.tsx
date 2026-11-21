"use client";

import { useMemo, useRef, useState } from "react";
import {
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  ArrowUp,
  Check,
  ChevronLeft,
  ChevronRight,
  FileText,
  GripVertical,
  Layers,
  LayoutGrid,
  Link2,
  Plus,
  RefreshCw,
  RotateCcw,
  Tag,
  Trash2,
  Undo2,
  User,
} from "lucide-react";
import type { CreatureConfig } from "@/domain/creature/entities";
import {
  CTA_LOGO_PRESETS,
  CTA_QUICK_TEMPLATES,
  DEFAULT_DUMMY_INTRO,
  DYNAMIC_TOKENS,
  README_TEMPLATES,
  TECH_CATEGORIES_ORDER,
  TECH_CATEGORY_LABELS,
  type ReadmeBadge,
  type ReadmeConfig,
  type ReadmeTemplateId,
  type TechCategory,
} from "@/domain/profile/entities";
import {
  buildGeneratedReadmeMarkdown,
  reorderItems,
} from "@/domain/profile/readmeService";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ColorPalettePopoverButton } from "./ColorPalettePicker";

interface ProfileReadmeStepPanelProps {
  creatureConfig: CreatureConfig;
  readmeConfig: ReadmeConfig;
  onUpdateField: <K extends keyof ReadmeConfig>(
    key: K,
    value: ReadmeConfig[K]
  ) => void;
  onSelectTemplate: (templateId: ReadmeTemplateId) => void;
  onChangeRawMarkdown: (raw: string | null) => void;
  onAddBadgeToCard: (
    cardId: string,
    badgeId: string,
    beforeBadgeId?: string
  ) => void;
  onRemoveBadgeFromCard: (cardId: string, badgeId: string) => void;
  onMoveBadgeAcrossCards: (
    badgeId: string,
    fromCardId: string,
    toCardId: string,
    targetBadgeId?: string
  ) => void;
  onAddStackCard: (title?: string) => string;
  onRenameStackCard: (cardId: string, title: string) => void;
  onDeleteStackCard: (cardId: string) => void;
  onReorderStackCards: (fromIdx: number, toIdx: number) => void;
  onCombineStackCards: () => void;
  onUndoCombineStackCards: () => void;
  onAddCustomBadgeToCard: (
    cardId: string,
    badge: Omit<ReadmeBadge, "enabled">
  ) => void;
  onReorderTags: (fromIdx: number, toIdx: number) => void;
  onPrevStep: () => void;
  onNextStep: () => void;
}

type CategoryFilter = "all" | TechCategory;

interface DragPayload {
  badgeId: string;
  fromCardId: string | null;
}

function normalizeActionUrl(raw: string): string {
  const trimmed = raw.trim();
  if (!trimmed) return "";
  if (
    /^https?:\/\//i.test(trimmed) ||
    /^mailto:/i.test(trimmed) ||
    trimmed.startsWith("#") ||
    trimmed.startsWith("/")
  ) {
    return trimmed;
  }
  return `https://${trimmed}`;
}

export function ProfileReadmeStepPanel({
  creatureConfig,
  readmeConfig,
  onUpdateField,
  onSelectTemplate,
  onChangeRawMarkdown,
  onAddBadgeToCard,
  onRemoveBadgeFromCard,
  onMoveBadgeAcrossCards,
  onAddStackCard,
  onRenameStackCard,
  onDeleteStackCard,
  onReorderStackCards,
  onCombineStackCards,
  onUndoCombineStackCards,
  onAddCustomBadgeToCard,
  onReorderTags,
  onPrevStep,
  onNextStep,
}: ProfileReadmeStepPanelProps) {
  const nextIdRef = useRef(1);
  const [badgeCategory, setBadgeCategory] = useState<CategoryFilter>("all");
  const [badgeSearch, setBadgeSearch] = useState("");
  const [selectedCardId, setSelectedCardId] = useState<string>(
    readmeConfig.stackCards[0]?.id ?? ""
  );
  const [dragPayload, setDragPayload] = useState<DragPayload | null>(null);
  const [dropCardId, setDropCardId] = useState<string | null>(null);
  const [dragOverChip, setDragOverChip] = useState<{
    cardId: string;
    badgeId: string;
  } | null>(null);
  const [draggedTagIdx, setDraggedTagIdx] = useState<number | null>(null);

  const [newTagInput, setNewTagInput] = useState("");
  const [newBadgeLabel, setNewBadgeLabel] = useState("");
  const [newBadgeLogo, setNewBadgeLogo] = useState("");
  const [newBadgeColor, setNewBadgeColor] = useState("#2563EB");

  const [newLinkLabel, setNewLinkLabel] = useState("");
  const [newLinkText, setNewLinkText] = useState("");
  const [newLinkUrl, setNewLinkUrl] = useState("");
  const [newLinkLogo, setNewLinkLogo] = useState("googlechrome");
  const [newLinkColor, setNewLinkColor] = useState("#4F46E5");
  const [showRawEditor, setShowRawEditor] = useState(false);

  const activeCardId = readmeConfig.stackCards.some(
    (c) => c.id === selectedCardId
  )
    ? selectedCardId
    : (readmeConfig.stackCards[0]?.id ?? "");

  const badgeById = useMemo(
    () => new Map(readmeConfig.badges.map((b) => [b.id, b])),
    [readmeConfig.badges]
  );

  const activeCardBadgeSet = useMemo(() => {
    const activeCard = readmeConfig.stackCards.find(
      (c) => c.id === activeCardId
    );
    return new Set(activeCard?.badgeIds ?? []);
  }, [readmeConfig.stackCards, activeCardId]);

  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = { all: readmeConfig.badges.length };
    for (const b of readmeConfig.badges) {
      const cat = b.category ?? "skills";
      counts[cat] = (counts[cat] ?? 0) + 1;
    }
    return counts;
  }, [readmeConfig.badges]);

  const filteredBadges = useMemo(() => {
    const query = badgeSearch.trim().toLowerCase();
    return readmeConfig.badges.filter((b) => {
      const matchesCat =
        badgeCategory === "all" || b.category === badgeCategory;
      const matchesQuery =
        !query ||
        b.label.toLowerCase().includes(query) ||
        (b.category &&
          TECH_CATEGORY_LABELS[b.category].toLowerCase().includes(query));
      return matchesCat && matchesQuery;
    });
  }, [readmeConfig.badges, badgeCategory, badgeSearch]);

  const generatedMarkdown = buildGeneratedReadmeMarkdown(
    creatureConfig,
    readmeConfig
  );
  const currentRawText =
    readmeConfig.rawOverride !== null
      ? readmeConfig.rawOverride
      : generatedMarkdown;

  function readPayloadFromEvent(e: React.DragEvent): DragPayload | null {
    const raw = e.dataTransfer?.getData("application/json");
    if (raw) {
      try {
        return JSON.parse(raw) as DragPayload;
      } catch {
        // Fallback to React state payload
      }
    }
    return dragPayload;
  }

  function handleDropOnCard(e: React.DragEvent, targetCardId: string) {
    e.preventDefault();
    const payload = readPayloadFromEvent(e);
    if (!payload) return;
    if (payload.fromCardId) {
      onMoveBadgeAcrossCards(payload.badgeId, payload.fromCardId, targetCardId);
    } else {
      onAddBadgeToCard(targetCardId, payload.badgeId);
    }
    setSelectedCardId(targetCardId);
    setDragPayload(null);
    setDropCardId(null);
    setDragOverChip(null);
  }

  function handleDropOnChip(
    e: React.DragEvent,
    targetCardId: string,
    targetBadgeId: string
  ) {
    e.preventDefault();
    e.stopPropagation();
    const payload = readPayloadFromEvent(e);
    if (!payload) return;
    if (payload.fromCardId) {
      onMoveBadgeAcrossCards(
        payload.badgeId,
        payload.fromCardId,
        targetCardId,
        targetBadgeId
      );
    } else {
      onAddBadgeToCard(targetCardId, payload.badgeId, targetBadgeId);
    }
    setSelectedCardId(targetCardId);
    setDragPayload(null);
    setDropCardId(null);
    setDragOverChip(null);
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
    if (!label || !activeCardId) return;
    const logoSlug = newBadgeLogo.trim().toLowerCase().replace(/\s+/g, "");
    const seq = nextIdRef.current++;
    onAddCustomBadgeToCard(activeCardId, {
      id: `custom-${seq}`,
      label,
      color: newBadgeColor.replace("#", ""),
      ...(logoSlug ? { logo: logoSlug, logoColor: "white" } : {}),
      category: "skills",
    });
    setNewBadgeLabel("");
    setNewBadgeLogo("");
  }

  function handleAddActionLink(e: React.FormEvent) {
    e.preventDefault();
    const normalizedUrl = normalizeActionUrl(newLinkUrl);
    if (!newLinkLabel.trim() || !normalizedUrl) return;
    const seq = nextIdRef.current++;
    onUpdateField("actionLinks", [
      ...readmeConfig.actionLinks,
      {
        id: `link-${seq}`,
        label: newLinkLabel.trim().toUpperCase(),
        valueText: (newLinkText.trim() || "OPEN").toUpperCase(),
        url: normalizedUrl,
        color: newLinkColor.replace("#", ""),
        ...(newLinkLogo && newLinkLogo !== "none" ? { logo: newLinkLogo } : {}),
        enabled: true,
      },
    ]);
    setNewLinkLabel("");
    setNewLinkText("");
    setNewLinkUrl("");
  }

  function handleQuickAddCta(tpl: (typeof CTA_QUICK_TEMPLATES)[number]) {
    const seq = nextIdRef.current++;
    onUpdateField("actionLinks", [
      ...readmeConfig.actionLinks,
      {
        id: `link-${seq}-${tpl.label.toLowerCase()}`,
        ...tpl,
        enabled: true,
      },
    ]);
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
      <div className="rounded-2xl border bg-card p-6 text-card-foreground shadow-sm">
        <div className="mb-4 flex items-center gap-2.5">
          <User className="h-5 w-5 text-foreground/85" />
          <div>
            <h2 className="text-base font-semibold text-foreground">
              Customize Every Text on Your Profile
            </h2>
            <p className="text-sm text-muted-foreground">
              Edit headings, intro paragraph, tags, sidebar details, and captions freely.
            </p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-xs font-medium text-foreground/85">
                Display Name
              </label>
              <input
                type="text"
                value={readmeConfig.profileDisplayName}
                onChange={(e) =>
                  onUpdateField("profileDisplayName", e.target.value)
                }
                className="w-full rounded-xl border bg-muted/50 px-3.5 py-2 text-sm text-foreground focus:border-primary focus:bg-background focus:outline-none"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-medium text-foreground/85">
                Location
              </label>
              <input
                type="text"
                value={readmeConfig.profileLocation}
                onChange={(e) =>
                  onUpdateField("profileLocation", e.target.value)
                }
                className="w-full rounded-xl border bg-muted/50 px-3.5 py-2 text-sm text-foreground focus:border-primary focus:bg-background focus:outline-none"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-medium text-foreground/85">
                Role / Organization
              </label>
              <input
                type="text"
                value={readmeConfig.profileCompany}
                onChange={(e) =>
                  onUpdateField("profileCompany", e.target.value)
                }
                className="w-full rounded-xl border bg-muted/50 px-3.5 py-2 text-sm text-foreground focus:border-primary focus:bg-background focus:outline-none"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-medium text-foreground/85">
                Website URL
              </label>
              <input
                type="text"
                value={readmeConfig.profileWebsite}
                onChange={(e) =>
                  onUpdateField("profileWebsite", e.target.value)
                }
                className="w-full rounded-xl border bg-muted/50 px-3.5 py-2 text-sm text-foreground focus:border-primary focus:bg-background focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-medium text-foreground/85">
              Sidebar Status Bio
            </label>
            <input
              type="text"
              value={readmeConfig.profileStatusBio}
              onChange={(e) =>
                onUpdateField("profileStatusBio", e.target.value)
              }
              className="w-full rounded-xl border bg-muted/50 px-3.5 py-2 text-sm text-foreground focus:border-primary focus:bg-background focus:outline-none"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-medium text-foreground/85">
              README Main Headline
            </label>
            <input
              type="text"
              value={readmeConfig.headline}
              onChange={(e) => onUpdateField("headline", e.target.value)}
              className="w-full rounded-xl border bg-muted/50 px-3.5 py-2 text-sm font-medium text-foreground focus:border-primary focus:bg-background focus:outline-none"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-medium text-foreground/85">
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
                  className="inline-flex cursor-grab items-center gap-1.5 rounded-lg border bg-muted/50 px-2.5 py-1 text-xs font-medium text-foreground active:cursor-grabbing"
                >
                  <GripVertical className="h-3.5 w-3.5 text-muted-foreground" />
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
                      onUpdateField(
                        "subtitleTags",
                        readmeConfig.subtitleTags.filter((_, i) => i !== idx)
                      )
                    }
                    className="text-muted-foreground hover:text-destructive"
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
                className="flex-1 rounded-xl border bg-muted/50 px-3.5 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:bg-background focus:outline-none"
              />
              <button
                type="submit"
                className="rounded-xl border bg-card px-4 py-2 text-sm font-medium text-foreground/85 hover:bg-muted/50"
              >
                Add Tag
              </button>
            </form>
          </div>

          <div>
            <div className="mb-1.5 flex items-center justify-between gap-2">
              <label className="text-xs font-medium text-foreground/85">
                About / Intro Paragraph
              </label>
              <button
                type="button"
                onClick={() => onUpdateField("bio", DEFAULT_DUMMY_INTRO)}
                className="inline-flex items-center gap-1 rounded-md border bg-muted/50 px-2 py-0.5 font-mono text-[11px] text-muted-foreground transition hover:bg-muted hover:text-foreground"
              >
                <RotateCcw className="size-3" />
                Use Sample Intro
              </button>
            </div>
            <textarea
              rows={3}
              value={readmeConfig.bio}
              placeholder={DEFAULT_DUMMY_INTRO}
              onChange={(e) => onUpdateField("bio", e.target.value)}
              className="w-full rounded-xl border bg-muted/50 px-3.5 py-2.5 text-sm leading-relaxed text-foreground placeholder:text-muted-foreground focus:border-primary focus:bg-background focus:outline-none"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-medium text-foreground/85">
              Call To Action Line
            </label>
            <input
              type="text"
              value={readmeConfig.ctaLine}
              onChange={(e) => onUpdateField("ctaLine", e.target.value)}
              className="w-full rounded-xl border bg-muted/50 px-3.5 py-2 text-sm text-foreground focus:border-primary focus:bg-background focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-xs font-medium text-foreground/85">
                Extra Section Heading (Optional)
              </label>
              <input
                type="text"
                value={readmeConfig.customSectionTitle}
                onChange={(e) =>
                  onUpdateField("customSectionTitle", e.target.value)
                }
                placeholder="e.g. Current Focus"
                className="w-full rounded-xl border bg-muted/50 px-3.5 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:bg-background focus:outline-none"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-medium text-foreground/85">
                Telemetry Table Title
              </label>
              <input
                type="text"
                value={readmeConfig.statsTableTitle}
                onChange={(e) =>
                  onUpdateField("statsTableTitle", e.target.value)
                }
                className="w-full rounded-xl border bg-muted/50 px-3.5 py-2 text-sm text-foreground focus:border-primary focus:bg-background focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-medium text-foreground/85">
              Extra Custom Markdown Block (Optional)
            </label>
            <textarea
              rows={2}
              value={readmeConfig.customFooterMarkdown}
              onChange={(e) =>
                onUpdateField("customFooterMarkdown", e.target.value)
              }
              placeholder="Write any extra Markdown lines or links..."
              className="w-full rounded-xl border bg-muted/50 px-3.5 py-2 font-mono text-xs text-foreground placeholder:text-muted-foreground focus:border-primary focus:bg-background focus:outline-none"
            />
          </div>
        </div>
      </div>

      {/* Drag & Drop Multi-Card Tech Stack Builder */}
      <div className="rounded-2xl border bg-card p-6 text-card-foreground shadow-sm">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <Tag className="h-5 w-5 text-foreground/85" />
            <div>
              <h2 className="text-base font-semibold text-foreground">
                Drag &amp; Drop Tech Stack Builder
              </h2>
              <p className="text-sm text-muted-foreground">
                3 default cards ready. Drag skills across cards, reorder chips, or
                click from {readmeConfig.badges.length}+ techs &amp; skills below.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {readmeConfig.savedOrganizedCards !== null && (
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={onUndoCombineStackCards}
              >
                <Undo2 data-icon="inline-start" />
                Undo Combine ({readmeConfig.savedOrganizedCards.length} Cards)
              </Button>
            )}
            {readmeConfig.stackCards.length > 1 && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={onCombineStackCards}
              >
                <LayoutGrid data-icon="inline-start" />
                Combine All
              </Button>
            )}
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => {
                const id = onAddStackCard(
                  `Stack Group ${readmeConfig.stackCards.length + 1}`
                );
                setSelectedCardId(id);
              }}
            >
              <Plus data-icon="inline-start" />
              Add Card
            </Button>
          </div>
        </div>

        <div className="space-y-3">
          {readmeConfig.stackCards.map((card, cardIdx) => {
            const isSelected = card.id === activeCardId;
            const isDropping = dropCardId === card.id;
            const resolvedBadges = card.badgeIds
              .map((id) => badgeById.get(id))
              .filter((b): b is ReadmeBadge => Boolean(b));

            return (
              <div
                key={card.id}
                onClick={() => setSelectedCardId(card.id)}
                onDragOver={(e) => {
                  e.preventDefault();
                  setDropCardId(card.id);
                }}
                onDragLeave={() => {
                  if (dropCardId === card.id) setDropCardId(null);
                }}
                onDrop={(e) => handleDropOnCard(e, card.id)}
                className={`rounded-xl border-2 p-3.5 transition ${
                  isDropping
                    ? "border-dashed border-primary bg-accent/70"
                    : isSelected
                      ? "border-primary/75 bg-muted/40 ring-1 ring-primary/25"
                      : "border-border bg-muted/25 hover:border-foreground/30"
                }`}
              >
                <div className="mb-2.5 flex flex-wrap items-center justify-between gap-2">
                  <div className="flex min-w-0 flex-1 items-center gap-2">
                    <Layers className="size-3.5 shrink-0 text-primary" />
                    <input
                      type="text"
                      value={card.title}
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedCardId(card.id);
                      }}
                      onChange={(e) =>
                        onRenameStackCard(card.id, e.target.value)
                      }
                      placeholder={
                        readmeConfig.stackCards.length === 1 && !card.title
                          ? "Combined Tech Stack (no heading)"
                          : "Card heading..."
                      }
                      className="min-w-0 flex-1 rounded-md border border-transparent bg-transparent px-1.5 py-0.5 font-mono text-xs font-semibold text-foreground focus:border-border focus:bg-background focus:outline-none"
                    />
                    <Badge variant="secondary" className="font-mono text-[10px]">
                      {resolvedBadges.length}
                    </Badge>
                    {isSelected && (
                      <Badge className="font-mono text-[10px]">Active</Badge>
                    )}
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      disabled={cardIdx === 0}
                      onClick={(e) => {
                        e.stopPropagation();
                        onReorderStackCards(cardIdx, cardIdx - 1);
                      }}
                      aria-label="Move card up"
                      className="rounded p-1 text-muted-foreground hover:bg-muted hover:text-foreground disabled:opacity-30"
                    >
                      <ArrowUp className="size-3.5" />
                    </button>
                    <button
                      type="button"
                      disabled={cardIdx === readmeConfig.stackCards.length - 1}
                      onClick={(e) => {
                        e.stopPropagation();
                        onReorderStackCards(cardIdx, cardIdx + 1);
                      }}
                      aria-label="Move card down"
                      className="rounded p-1 text-muted-foreground hover:bg-muted hover:text-foreground disabled:opacity-30"
                    >
                      <ArrowDown className="size-3.5" />
                    </button>
                    <button
                      type="button"
                      disabled={readmeConfig.stackCards.length <= 1}
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeleteStackCard(card.id);
                      }}
                      aria-label="Delete card"
                      className="rounded p-1 text-muted-foreground hover:bg-destructive/15 hover:text-destructive disabled:opacity-30"
                    >
                      <Trash2 className="size-3.5" />
                    </button>
                  </div>
                </div>

                {resolvedBadges.length === 0 ? (
                  <p className="rounded-lg border border-dashed py-3 text-center text-xs text-muted-foreground">
                    Drop skills here or click any badge below to add to this card.
                  </p>
                ) : (
                  <div className="flex flex-wrap gap-1.5">
                    {resolvedBadges.map((badge, idx) => (
                      <div
                        key={`${card.id}-${badge.id}`}
                        draggable
                        onDragStart={(e) => {
                          e.stopPropagation();
                          const payload: DragPayload = {
                            badgeId: badge.id,
                            fromCardId: card.id,
                          };
                          setDragPayload(payload);
                          e.dataTransfer.setData(
                            "application/json",
                            JSON.stringify(payload)
                          );
                        }}
                        onDragEnd={() => {
                          setDragPayload(null);
                          setDropCardId(null);
                          setDragOverChip(null);
                        }}
                        onDragOver={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          setDragOverChip({ cardId: card.id, badgeId: badge.id });
                        }}
                        onDrop={(e) => handleDropOnChip(e, card.id, badge.id)}
                        className={`inline-flex cursor-grab items-center gap-1.5 rounded-lg border bg-card px-2 py-1 text-xs font-medium text-card-foreground shadow-xs transition active:cursor-grabbing ${
                          dragOverChip?.cardId === card.id &&
                          dragOverChip?.badgeId === badge.id
                            ? "border-primary ring-2 ring-primary/30"
                            : "border-border"
                        }`}
                      >
                        <GripVertical className="h-3 w-3 text-muted-foreground" />
                        <span
                          className="h-2.5 w-2.5 shrink-0 rounded-full"
                          style={{ backgroundColor: `#${badge.color}` }}
                        />
                        <span>{badge.label}</span>
                        <div className="ml-0.5 flex items-center gap-0.5 border-l border-border pl-1">
                          <button
                            type="button"
                            disabled={idx === 0}
                            onClick={(e) => {
                              e.stopPropagation();
                              onMoveBadgeAcrossCards(
                                badge.id,
                                card.id,
                                card.id,
                                resolvedBadges[idx - 1]?.id
                              );
                            }}
                            aria-label={`Move ${badge.label} left`}
                            className="rounded p-0.5 text-muted-foreground hover:bg-muted hover:text-foreground disabled:opacity-30"
                          >
                            <ChevronLeft className="h-3 w-3" />
                          </button>
                          <button
                            type="button"
                            disabled={idx === resolvedBadges.length - 1}
                            onClick={(e) => {
                              e.stopPropagation();
                              const nextItem = resolvedBadges[idx + 1];
                              if (nextItem) {
                                onMoveBadgeAcrossCards(
                                  nextItem.id,
                                  card.id,
                                  card.id,
                                  badge.id
                                );
                              }
                            }}
                            aria-label={`Move ${badge.label} right`}
                            className="rounded p-0.5 text-muted-foreground hover:bg-muted hover:text-foreground disabled:opacity-30"
                          >
                            <ChevronRight className="h-3 w-3" />
                          </button>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              onRemoveBadgeFromCard(card.id, badge.id);
                            }}
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
            );
          })}
        </div>

        {/* Massive Searchable Skills & Tech Library */}
        <div className="mt-5 flex flex-col gap-3 border-t border-border pt-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="font-mono text-xs font-medium text-foreground">
              Tech Stack &amp; Skills Library ({filteredBadges.length} shown)
            </span>
            <input
              type="text"
              value={badgeSearch}
              onChange={(e) => setBadgeSearch(e.target.value)}
              placeholder="Search React, Rust, Docker, System Design..."
              className="w-full rounded-lg border border-border bg-muted/50 px-3 py-1.5 text-xs text-foreground placeholder:text-muted-foreground focus:border-primary focus:bg-background focus:outline-none sm:w-64"
            />
          </div>

          <div className="flex flex-wrap gap-1.5">
            <button
              type="button"
              onClick={() => setBadgeCategory("all")}
              className={`rounded-lg px-2.5 py-1 text-xs font-medium transition ${
                badgeCategory === "all"
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground hover:bg-accent hover:text-accent-foreground"
              }`}
            >
              All ({categoryCounts.all ?? 0})
            </button>
            {TECH_CATEGORIES_ORDER.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setBadgeCategory(cat)}
                className={`rounded-lg px-2.5 py-1 text-xs font-medium transition ${
                  badgeCategory === cat
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                }`}
              >
                {TECH_CATEGORY_LABELS[cat]} ({categoryCounts[cat] ?? 0})
              </button>
            ))}
          </div>

          <div className="flex max-h-52 flex-wrap gap-1.5 overflow-y-auto rounded-xl border border-border bg-muted/40 p-3">
            {filteredBadges.length === 0 ? (
              <p className="w-full py-4 text-center text-xs text-muted-foreground">
                No matching skills found. Create a custom badge below!
              </p>
            ) : (
              filteredBadges.map((badge) => {
                const inActiveCard = activeCardBadgeSet.has(badge.id);
                return (
                  <button
                    key={badge.id}
                    type="button"
                    draggable
                    onDragStart={(e) => {
                      const payload: DragPayload = {
                        badgeId: badge.id,
                        fromCardId: null,
                      };
                      setDragPayload(payload);
                      e.dataTransfer.setData(
                        "application/json",
                        JSON.stringify(payload)
                      );
                    }}
                    onDragEnd={() => {
                      setDragPayload(null);
                      setDropCardId(null);
                    }}
                    onClick={() => {
                      if (!activeCardId) return;
                      if (inActiveCard) {
                        onRemoveBadgeFromCard(activeCardId, badge.id);
                      } else {
                        onAddBadgeToCard(activeCardId, badge.id);
                      }
                    }}
                    className={`inline-flex cursor-grab items-center gap-1.5 rounded-lg border px-2.5 py-1 text-xs font-medium transition active:cursor-grabbing ${
                      inActiveCard
                        ? "border-primary bg-primary/15 text-foreground"
                        : "border-border bg-card text-card-foreground hover:border-primary/60 hover:bg-accent/50"
                    }`}
                  >
                    {inActiveCard ? (
                      <Check className="h-3 w-3 text-primary" />
                    ) : (
                      <Plus className="h-3 w-3 text-muted-foreground" />
                    )}
                    <span
                      className="h-2.5 w-2.5 shrink-0 rounded-full"
                      style={{ backgroundColor: `#${badge.color}` }}
                    />
                    <span>{badge.label}</span>
                  </button>
                );
              })
            )}
          </div>

          <form
            onSubmit={handleAddCustomBadge}
            className="grid grid-cols-1 gap-2 sm:grid-cols-12"
          >
            <input
              type="text"
              value={newBadgeLabel}
              onChange={(e) => setNewBadgeLabel(e.target.value)}
              placeholder="Custom badge label (e.g. Zig, WebGPU)"
              className="rounded-xl border bg-muted/50 px-3 py-2 text-xs text-foreground placeholder:text-muted-foreground focus:border-primary focus:bg-background focus:outline-none sm:col-span-5"
            />
            <input
              type="text"
              value={newBadgeLogo}
              onChange={(e) => setNewBadgeLogo(e.target.value)}
              placeholder="Optional icon slug (e.g. python)"
              className="rounded-xl border bg-muted/50 px-3 py-2 font-mono text-xs text-foreground placeholder:text-muted-foreground focus:border-primary focus:bg-background focus:outline-none sm:col-span-4"
            />
            <div className="flex gap-1.5 sm:col-span-3">
              <ColorPalettePopoverButton
                value={newBadgeColor}
                onChange={setNewBadgeColor}
                label="Custom Badge Color"
                compact
                className="h-9 rounded-xl px-2.5"
              />
              <button
                type="submit"
                className="flex-1 rounded-xl border bg-card px-3 py-2 text-xs font-medium text-foreground hover:bg-muted/50"
              >
                Add
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* CTA Buttons & Layout Options */}
      <div className="rounded-2xl border bg-card p-6 text-card-foreground shadow-sm">
        <div className="mb-4 flex items-center gap-2.5">
          <Link2 className="h-5 w-5 text-foreground/85" />
          <div>
            <h2 className="text-base font-semibold text-foreground">
              CTA Buttons &amp; Layout Options
            </h2>
            <p className="text-sm text-muted-foreground">
              Configure clickable profile buttons, banner alignment, sizing, and README
              sections.
            </p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            {readmeConfig.actionLinks.map((link, idx) => (
              <div
                key={link.id}
                className="flex flex-col gap-2 rounded-xl border bg-muted/40 p-3"
              >
                <div className="grid grid-cols-1 gap-2 sm:grid-cols-12">
                  <div className="flex items-center gap-2 sm:col-span-3">
                    <input
                      type="checkbox"
                      checked={link.enabled}
                      onChange={(e) => {
                        const updated = [...readmeConfig.actionLinks];
                        updated[idx] = { ...link, enabled: e.target.checked };
                        onUpdateField("actionLinks", updated);
                      }}
                      aria-label={`Toggle ${link.label}`}
                      className="size-4 accent-primary"
                    />
                    <input
                      type="text"
                      value={link.label}
                      onChange={(e) => {
                        const updated = [...readmeConfig.actionLinks];
                        updated[idx] = { ...link, label: e.target.value };
                        onUpdateField("actionLinks", updated);
                      }}
                      placeholder="Label"
                      className="w-full rounded-lg border bg-card px-2.5 py-1.5 text-xs font-semibold text-foreground"
                    />
                  </div>
                  <input
                    type="text"
                    value={link.valueText}
                    onChange={(e) => {
                      const updated = [...readmeConfig.actionLinks];
                      updated[idx] = { ...link, valueText: e.target.value };
                      onUpdateField("actionLinks", updated);
                    }}
                    placeholder="Text"
                    className="rounded-lg border bg-card px-2.5 py-1.5 text-xs text-foreground sm:col-span-3"
                  />
                  <input
                    type="text"
                    value={link.url}
                    onChange={(e) => {
                      const updated = [...readmeConfig.actionLinks];
                      updated[idx] = { ...link, url: e.target.value };
                      onUpdateField("actionLinks", updated);
                    }}
                    placeholder="https://... or {{USERNAME}}"
                    className="rounded-lg border bg-card px-2.5 py-1.5 text-xs text-foreground/85 sm:col-span-6"
                  />
                </div>

                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <select
                      value={link.logo || "none"}
                      onChange={(e) => {
                        const val = e.target.value;
                        const updated = [...readmeConfig.actionLinks];
                        updated[idx] = {
                          ...link,
                          logo: val === "none" ? undefined : val,
                        };
                        onUpdateField("actionLinks", updated);
                      }}
                      className="rounded-lg border bg-card px-2 py-1 text-xs text-foreground"
                    >
                      {CTA_LOGO_PRESETS.map((preset) => (
                        <option key={preset.id} value={preset.id}>
                          Icon: {preset.label}
                        </option>
                      ))}
                    </select>
                    <ColorPalettePopoverButton
                      value={`#${link.color.replace("#", "").padEnd(6, "0").slice(0, 6)}`}
                      onChange={(hex) => {
                        const updated = [...readmeConfig.actionLinks];
                        updated[idx] = {
                          ...link,
                          color: hex.replace("#", "").toUpperCase(),
                        };
                        onUpdateField("actionLinks", updated);
                      }}
                      label={`Color for ${link.label || "CTA"}`}
                    />
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      disabled={idx === 0}
                      onClick={() =>
                        onUpdateField(
                          "actionLinks",
                          reorderItems(readmeConfig.actionLinks, idx, idx - 1)
                        )
                      }
                      aria-label="Move CTA button up"
                      className="rounded border bg-card p-1 text-muted-foreground hover:text-foreground disabled:opacity-30"
                    >
                      <ArrowUp className="h-3.5 w-3.5" />
                    </button>
                    <button
                      type="button"
                      disabled={idx === readmeConfig.actionLinks.length - 1}
                      onClick={() =>
                        onUpdateField(
                          "actionLinks",
                          reorderItems(readmeConfig.actionLinks, idx, idx + 1)
                        )
                      }
                      aria-label="Move CTA button down"
                      className="rounded border bg-card p-1 text-muted-foreground hover:text-foreground disabled:opacity-30"
                    >
                      <ArrowDown className="h-3.5 w-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        onUpdateField(
                          "actionLinks",
                          readmeConfig.actionLinks.filter((l) => l.id !== link.id)
                        )
                      }
                      aria-label="Delete link"
                      className="rounded border bg-card p-1 text-muted-foreground hover:text-destructive"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Quick-Add CTA Presets */}
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="font-mono text-[11px] text-muted-foreground">
              Quick add:
            </span>
            {CTA_QUICK_TEMPLATES.map((tpl) => (
              <button
                key={tpl.label}
                type="button"
                onClick={() => handleQuickAddCta(tpl)}
                className="inline-flex items-center gap-1 rounded-md border bg-muted/50 px-2 py-1 font-mono text-[11px] text-foreground transition hover:bg-muted"
              >
                <Plus className="size-3" />
                {tpl.label}
              </button>
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
              className="rounded-xl border bg-muted/50 px-3 py-2 text-xs text-foreground sm:col-span-3"
            />
            <input
              type="text"
              value={newLinkText}
              onChange={(e) => setNewLinkText(e.target.value)}
              placeholder="Text (VISIT)"
              className="rounded-xl border bg-muted/50 px-3 py-2 text-xs text-foreground sm:col-span-3"
            />
            <input
              type="text"
              value={newLinkUrl}
              onChange={(e) => setNewLinkUrl(e.target.value)}
              placeholder="https://... or domain.com"
              className="rounded-xl border bg-muted/50 px-3 py-2 text-xs text-foreground sm:col-span-6"
            />
            <select
              value={newLinkLogo}
              onChange={(e) => setNewLinkLogo(e.target.value)}
              className="rounded-xl border bg-muted/50 px-3 py-2 text-xs text-foreground sm:col-span-6"
            >
              {CTA_LOGO_PRESETS.map((preset) => (
                <option key={preset.id} value={preset.id}>
                  Icon: {preset.label}
                </option>
              ))}
            </select>
            <div className="flex gap-1.5 sm:col-span-6">
              <ColorPalettePopoverButton
                value={newLinkColor}
                onChange={setNewLinkColor}
                label="New CTA Badge Color"
                compact
                className="h-9 rounded-lg px-2.5"
              />
              <button
                type="submit"
                className="flex-1 rounded-xl border bg-card px-3 text-xs font-medium text-foreground hover:bg-muted/50"
              >
                Add CTA Button
              </button>
            </div>
          </form>

          {/* Layout Options: Alignment & Banner Width */}
          <div className="grid grid-cols-1 gap-4 border-t border-border pt-4 sm:grid-cols-2">
            <div className="flex flex-col gap-2">
              <span className="font-mono text-xs font-medium text-foreground">
                Content Alignment
              </span>
              <div className="grid grid-cols-2 gap-2">
                {(["left", "center"] as const).map((alignVal) => {
                  const active = readmeConfig.align === alignVal;
                  return (
                    <button
                      key={alignVal}
                      type="button"
                      onClick={() => onUpdateField("align", alignVal)}
                      className={`rounded-lg border px-3 py-2 font-mono text-xs font-semibold capitalize transition ${
                        active
                          ? "border-primary bg-primary text-primary-foreground"
                          : "bg-muted/40 text-foreground hover:bg-muted"
                      }`}
                    >
                      {alignVal}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between font-mono text-xs">
                <span className="font-medium text-foreground">
                  Creature Banner Width
                </span>
                <span className="font-semibold text-foreground">
                  {readmeConfig.imageWidth}px
                </span>
              </div>
              <input
                type="range"
                aria-label="Creature Banner Width"
                min={480}
                max={920}
                step={20}
                value={readmeConfig.imageWidth}
                onChange={(e) => {
                  const next = parseInt(e.target.value, 10);
                  if (Number.isFinite(next)) {
                    onUpdateField("imageWidth", next);
                  }
                }}
                className="h-2 w-full cursor-pointer accent-primary"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2.5 border-t border-border pt-4">
            {README_TEMPLATES.map((tpl) => (
              <button
                key={tpl.id}
                type="button"
                onClick={() => onSelectTemplate(tpl.id)}
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

          <div className="grid grid-cols-1 gap-2.5 text-xs sm:grid-cols-3">
            {(
              [
                { key: "includeMarkers", label: "Auto Update Markers" },
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

          <div className="border-t border-border pt-3">
            <button
              type="button"
              onClick={() => setShowRawEditor((v) => !v)}
              className="inline-flex items-center gap-2 text-xs font-semibold text-foreground/85 underline underline-offset-4 hover:text-foreground"
            >
              <FileText className="h-3.5 w-3.5" />
              {showRawEditor
                ? "Hide Advanced Raw Markdown Editor"
                : "Open Advanced Raw Markdown Editor"}
            </button>

            {showRawEditor && (
              <div className="mt-3 overflow-hidden rounded-xl border border-border bg-slate-950">
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
          className="inline-flex items-center justify-center gap-2 rounded-xl border bg-card px-5 py-3.5 text-sm font-semibold text-foreground/85 transition hover:bg-muted/50"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </button>
        <button
          type="button"
          onClick={onNextStep}
          className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-primary px-5 py-3.5 text-sm font-semibold text-primary-foreground shadow-sm transition hover:bg-primary/90"
        >
          Next: Enter Token &amp; Push
          <ArrowRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
