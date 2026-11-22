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
  Plus,
  RefreshCw,
  Trash2,
  Undo2,
} from "lucide-react";
import { cn } from "cn";
import type { CreatureConfig } from "@/domain/creature/entities";
import {
  CTA_QUICK_TEMPLATES,
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
  DEFAULT_PLATFORM_ICON_ID,
  detectPlatformFromUrl,
} from "@/domain/profile/platformIcons";
import {
  buildGeneratedReadmeMarkdown,
  reorderItems,
} from "@/domain/profile/readmeService";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Field,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSet,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Slider } from "@/components/ui/slider";
import { Textarea } from "@/components/ui/textarea";
import { ColorPalettePopoverButton } from "./ColorPalettePicker";
import { PlatformIconPickerButton } from "./PlatformIconPickerButton";

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

  const [newBadgeLabel, setNewBadgeLabel] = useState("");
  const [newBadgeLogo, setNewBadgeLogo] = useState("");
  const [newBadgeColor, setNewBadgeColor] = useState("#2563EB");

  const [newLinkLabel, setNewLinkLabel] = useState("");
  const [newLinkText, setNewLinkText] = useState("");
  const [newLinkUrl, setNewLinkUrl] = useState("");
  const [newLinkLogo, setNewLinkLogo] = useState(DEFAULT_PLATFORM_ICON_ID);
  const [newLinkColor, setNewLinkColor] = useState("#4F46E5");
  const [manualNewLinkLogo, setManualNewLinkLogo] = useState(false);
  const [manualNewLinkColor, setManualNewLinkColor] = useState(false);
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
    const resolvedLogo = manualNewLinkLogo
      ? newLinkLogo
      : detectPlatformFromUrl(normalizedUrl).id;
    onUpdateField("actionLinks", [
      ...readmeConfig.actionLinks,
      {
        id: `link-${seq}`,
        label: newLinkLabel.trim().toUpperCase(),
        valueText: (newLinkText.trim() || "OPEN").toUpperCase(),
        url: normalizedUrl,
        color: newLinkColor.replace("#", ""),
        logo: resolvedLogo || DEFAULT_PLATFORM_ICON_ID,
        enabled: true,
      },
    ]);
    setNewLinkLabel("");
    setNewLinkText("");
    setNewLinkUrl("");
    setNewLinkLogo(DEFAULT_PLATFORM_ICON_ID);
    setNewLinkColor("#4F46E5");
    setManualNewLinkLogo(false);
    setManualNewLinkColor(false);
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
    <div className="flex flex-col gap-7 rounded-xl border bg-card p-5 text-card-foreground sm:p-6">
      {/* Section 1: Drag & Drop Multi-Card Tech Stack Builder */}
      <section className="flex flex-col gap-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-col gap-0.5">
            <h2 className="font-mono text-sm font-semibold text-foreground">
              Tech Stack Cards
            </h2>
            <p className="text-xs text-muted-foreground">
              Drag badges between cards, reorder chips, or pick from{" "}
              {readmeConfig.badges.length}+ skills below.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-1.5">
            {readmeConfig.savedOrganizedCards !== null && (
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={onUndoCombineStackCards}
              >
                <Undo2 data-icon="inline-start" />
                Undo Combine ({readmeConfig.savedOrganizedCards.length})
              </Button>
            )}
            {readmeConfig.stackCards.length > 1 && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={onCombineStackCards}
              >
                <LayoutGrid data-icon="inline-start" />
                Combine All
              </Button>
            )}
            <Button
              type="button"
              variant="secondary"
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

        <div className="flex flex-col gap-3">
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
                className={cn(
                  "rounded-xl p-3.5 transition",
                  isDropping
                    ? "bg-accent/70 ring-2 ring-dashed ring-primary"
                    : isSelected
                      ? "bg-muted/50 ring-1 ring-primary/70"
                      : "bg-muted/30 hover:bg-muted/45"
                )}
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
                      className="min-w-0 flex-1 rounded-md bg-transparent px-1.5 py-0.5 font-mono text-xs font-semibold text-foreground focus:bg-background focus:outline-none"
                    />
                    <Badge variant="secondary" className="font-mono text-[10px]">
                      {resolvedBadges.length}
                    </Badge>
                    {isSelected && (
                      <Badge className="font-mono text-[10px]">Active</Badge>
                    )}
                  </div>

                  <div className="flex items-center gap-0.5">
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon-xs"
                      disabled={cardIdx === 0}
                      onClick={(e) => {
                        e.stopPropagation();
                        onReorderStackCards(cardIdx, cardIdx - 1);
                      }}
                      aria-label="Move card up"
                    >
                      <ArrowUp />
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon-xs"
                      disabled={cardIdx === readmeConfig.stackCards.length - 1}
                      onClick={(e) => {
                        e.stopPropagation();
                        onReorderStackCards(cardIdx, cardIdx + 1);
                      }}
                      aria-label="Move card down"
                    >
                      <ArrowDown />
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon-xs"
                      disabled={readmeConfig.stackCards.length <= 1}
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeleteStackCard(card.id);
                      }}
                      aria-label="Delete card"
                      className="hover:text-destructive"
                    >
                      <Trash2 />
                    </Button>
                  </div>
                </div>

                {resolvedBadges.length === 0 ? (
                  <p className="py-3 text-center text-xs text-muted-foreground">
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
                        className={cn(
                          "inline-flex cursor-grab items-center gap-1.5 rounded-md bg-background px-2 py-1 text-xs font-medium text-foreground shadow-xs transition active:cursor-grabbing",
                          dragOverChip?.cardId === card.id &&
                            dragOverChip?.badgeId === badge.id &&
                            "ring-2 ring-primary"
                        )}
                      >
                        <GripVertical className="size-3 text-muted-foreground" />
                        <span
                          className="size-2 shrink-0 rounded-full"
                          style={{ backgroundColor: `#${badge.color}` }}
                        />
                        <span>{badge.label}</span>
                        <div className="ml-0.5 flex items-center gap-0.5 pl-1">
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
                            <ChevronLeft className="size-3" />
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
                            <ChevronRight className="size-3" />
                          </button>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              onRemoveBadgeFromCard(card.id, badge.id);
                            }}
                            aria-label={`Remove ${badge.label}`}
                            className="rounded px-0.5 text-muted-foreground hover:text-destructive"
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

        {/* Searchable Skills & Tech Library */}
        <div className="flex flex-col gap-3 pt-2">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="font-mono text-xs font-medium text-foreground">
              Skills Library ({filteredBadges.length} shown)
            </span>
            <Input
              type="text"
              value={badgeSearch}
              onChange={(e) => setBadgeSearch(e.target.value)}
              placeholder="Search React, Rust, Docker..."
              className="h-8 w-full text-xs sm:w-56"
            />
          </div>

          <div className="flex gap-1 overflow-x-auto pb-1">
            <button
              type="button"
              onClick={() => setBadgeCategory("all")}
              className={cn(
                "shrink-0 rounded-md px-2.5 py-1 text-xs font-medium transition",
                badgeCategory === "all"
                  ? "bg-secondary text-secondary-foreground"
                  : "text-muted-foreground hover:bg-muted/60 hover:text-foreground"
              )}
            >
              All ({categoryCounts.all ?? 0})
            </button>
            {TECH_CATEGORIES_ORDER.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setBadgeCategory(cat)}
                className={cn(
                  "shrink-0 rounded-md px-2.5 py-1 text-xs font-medium transition",
                  badgeCategory === cat
                    ? "bg-secondary text-secondary-foreground"
                    : "text-muted-foreground hover:bg-muted/60 hover:text-foreground"
                )}
              >
                {TECH_CATEGORY_LABELS[cat]} ({categoryCounts[cat] ?? 0})
              </button>
            ))}
          </div>

          <div className="flex max-h-52 flex-wrap gap-1.5 overflow-y-auto rounded-xl bg-muted/25 p-3">
            {filteredBadges.length === 0 ? (
              <p className="w-full py-4 text-center text-xs text-muted-foreground">
                No matching skills found. Create a custom badge below.
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
                    className={cn(
                      "inline-flex cursor-grab items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-medium transition active:cursor-grabbing",
                      inActiveCard
                        ? "bg-primary/15 text-foreground ring-1 ring-primary/50"
                        : "bg-background/80 text-foreground hover:bg-background"
                    )}
                  >
                    {inActiveCard ? (
                      <Check className="size-3 text-primary" />
                    ) : (
                      <Plus className="size-3 text-muted-foreground" />
                    )}
                    <span
                      className="size-2 shrink-0 rounded-full"
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
            <Input
              type="text"
              value={newBadgeLabel}
              onChange={(e) => setNewBadgeLabel(e.target.value)}
              placeholder="Custom badge (e.g. Zig, WebGPU)"
              className="h-8 text-xs sm:col-span-5"
            />
            <Input
              type="text"
              value={newBadgeLogo}
              onChange={(e) => setNewBadgeLogo(e.target.value)}
              placeholder="Icon slug (e.g. python)"
              className="h-8 font-mono text-xs sm:col-span-4"
            />
            <div className="flex items-center gap-1.5 sm:col-span-3">
              <ColorPalettePopoverButton
                value={newBadgeColor}
                onChange={setNewBadgeColor}
                label="Custom Badge Color"
                compact
                className="h-8 px-2"
              />
              <Button type="submit" variant="secondary" size="sm" className="flex-1">
                Add
              </Button>
            </div>
          </form>
        </div>
      </section>

      <Separator />

      {/* Section 2: CTA Links & Quick Presets */}
      <section className="flex flex-col gap-4">
        <div className="flex flex-col gap-0.5">
          <h2 className="font-mono text-sm font-semibold text-foreground">
            CTA Buttons &amp; Links
          </h2>
          <p className="text-xs text-muted-foreground">
            Add clickable social, portfolio, or blog links. Platform icons update
            automatically from URLs.
          </p>
        </div>

        <div className="flex flex-col divide-y divide-border/70">
          {readmeConfig.actionLinks.map((link, idx) => (
            <div key={link.id} className="flex flex-col gap-2.5 py-3 first:pt-0">
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-12">
                <div className="flex items-center gap-2 sm:col-span-3">
                  <Checkbox
                    checked={link.enabled}
                    onCheckedChange={(checked) => {
                      const updated = [...readmeConfig.actionLinks];
                      updated[idx] = { ...link, enabled: Boolean(checked) };
                      onUpdateField("actionLinks", updated);
                    }}
                    aria-label={`Toggle ${link.label}`}
                  />
                  <Input
                    type="text"
                    value={link.label}
                    onChange={(e) => {
                      const updated = [...readmeConfig.actionLinks];
                      updated[idx] = { ...link, label: e.target.value };
                      onUpdateField("actionLinks", updated);
                    }}
                    placeholder="Label"
                    className="h-8 text-xs font-semibold"
                  />
                </div>
                <Input
                  type="text"
                  value={link.valueText}
                  onChange={(e) => {
                    const updated = [...readmeConfig.actionLinks];
                    updated[idx] = { ...link, valueText: e.target.value };
                    onUpdateField("actionLinks", updated);
                  }}
                  placeholder="Button text"
                  className="h-8 text-xs sm:col-span-3"
                />
                <Input
                  type="text"
                  value={link.url}
                  onChange={(e) => {
                    const nextUrl = e.target.value;
                    const detected = detectPlatformFromUrl(nextUrl);
                    const updated = [...readmeConfig.actionLinks];
                    updated[idx] = {
                      ...link,
                      url: nextUrl,
                      logo: detected.id,
                    };
                    onUpdateField("actionLinks", updated);
                  }}
                  placeholder="https://medium.com/@... or link"
                  className="h-8 text-xs sm:col-span-6"
                />
              </div>

              <div className="flex flex-wrap items-center justify-between gap-2 pl-6">
                <div className="flex items-center gap-1.5">
                  <PlatformIconPickerButton
                    value={link.logo ?? DEFAULT_PLATFORM_ICON_ID}
                    onChange={(iconId) => {
                      const updated = [...readmeConfig.actionLinks];
                      updated[idx] = { ...link, logo: iconId };
                      onUpdateField("actionLinks", updated);
                    }}
                  />
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

                <div className="flex items-center gap-0.5">
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-xs"
                    disabled={idx === 0}
                    onClick={() =>
                      onUpdateField(
                        "actionLinks",
                        reorderItems(readmeConfig.actionLinks, idx, idx - 1)
                      )
                    }
                    aria-label="Move CTA button up"
                  >
                    <ArrowUp />
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-xs"
                    disabled={idx === readmeConfig.actionLinks.length - 1}
                    onClick={() =>
                      onUpdateField(
                        "actionLinks",
                        reorderItems(readmeConfig.actionLinks, idx, idx + 1)
                      )
                    }
                    aria-label="Move CTA button down"
                  >
                    <ArrowDown />
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-xs"
                    onClick={() =>
                      onUpdateField(
                        "actionLinks",
                        readmeConfig.actionLinks.filter((l) => l.id !== link.id)
                      )
                    }
                    aria-label="Delete link"
                    className="hover:text-destructive"
                  >
                    <Trash2 />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="flex flex-wrap items-center gap-1">
          <span className="mr-1 font-mono text-[11px] text-muted-foreground">
            Quick add:
          </span>
          {CTA_QUICK_TEMPLATES.map((tpl) => (
            <Button
              key={tpl.label}
              type="button"
              variant="ghost"
              size="xs"
              onClick={() => handleQuickAddCta(tpl)}
              className="font-mono"
            >
              <Plus data-icon="inline-start" />
              {tpl.label}
            </Button>
          ))}
        </div>

        <form
          onSubmit={handleAddActionLink}
          className="grid grid-cols-1 gap-2 rounded-xl bg-muted/30 p-3 sm:grid-cols-12"
        >
          <Input
            type="text"
            value={newLinkLabel}
            onChange={(e) => setNewLinkLabel(e.target.value)}
            placeholder="Label (PORTFOLIO)"
            className="h-8 text-xs sm:col-span-3"
          />
          <Input
            type="text"
            value={newLinkText}
            onChange={(e) => setNewLinkText(e.target.value)}
            placeholder="Text (VISIT)"
            className="h-8 text-xs sm:col-span-3"
          />
          <Input
            type="text"
            value={newLinkUrl}
            onChange={(e) => {
              const nextUrl = e.target.value;
              setNewLinkUrl(nextUrl);
              const detected = detectPlatformFromUrl(nextUrl);
              if (!manualNewLinkLogo) {
                setNewLinkLogo(detected.id);
              }
              if (!manualNewLinkColor) {
                setNewLinkColor(`#${detected.hex}`);
              }
            }}
            placeholder="https://medium.com/@... or domain.com"
            className="h-8 text-xs sm:col-span-6"
          />
          <div className="flex items-center gap-1.5 sm:col-span-6">
            <PlatformIconPickerButton
              value={newLinkLogo}
              onChange={(iconId) => {
                setManualNewLinkLogo(true);
                setNewLinkLogo(iconId);
              }}
              className="h-8 flex-1 justify-between px-3"
            />
          </div>
          <div className="flex items-center gap-1.5 sm:col-span-6">
            <ColorPalettePopoverButton
              value={newLinkColor}
              onChange={(hex) => {
                setManualNewLinkColor(true);
                setNewLinkColor(hex);
              }}
              label="New CTA Badge Color"
              compact
              className="h-8 px-2"
            />
            <Button type="submit" variant="secondary" size="sm" className="flex-1">
              Add CTA Button
            </Button>
          </div>
        </form>
      </section>

      <Separator />

      {/* Section 3: Layout, Templates & Sections */}
      <section className="flex flex-col gap-5">
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <div className="flex flex-col gap-2">
            <span className="font-mono text-xs font-medium text-foreground">
              Badges &amp; CTA Alignment
            </span>
            <div className="grid grid-cols-2 rounded-lg bg-muted/70 p-1">
              {(["left", "center"] as const).map((alignVal) => {
                const active = readmeConfig.align === alignVal;
                return (
                  <button
                    key={alignVal}
                    type="button"
                    onClick={() => onUpdateField("align", alignVal)}
                    className={cn(
                      "rounded-md px-3 py-1.5 font-mono text-xs font-medium capitalize transition",
                      active
                        ? "bg-background text-foreground shadow-xs"
                        : "text-muted-foreground hover:text-foreground"
                    )}
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
            <Slider
              aria-label="Creature Banner Width"
              min={320}
              max={920}
              step={20}
              value={[readmeConfig.imageWidth]}
              onValueChange={(val) => {
                const next = Array.isArray(val) ? val[0] : val;
                if (typeof next === "number" && Number.isFinite(next)) {
                  onUpdateField("imageWidth", next);
                }
              }}
            />
            <div className="grid grid-cols-4 rounded-lg bg-muted/70 p-0.5">
              {[480, 640, 760, 920].map((presetW) => {
                const active = readmeConfig.imageWidth === presetW;
                return (
                  <button
                    key={presetW}
                    type="button"
                    onClick={() => onUpdateField("imageWidth", presetW)}
                    className={cn(
                      "rounded-md py-1 font-mono text-[11px] font-medium transition",
                      active
                        ? "bg-background text-foreground shadow-xs"
                        : "text-muted-foreground hover:text-foreground"
                    )}
                  >
                    {presetW}px
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <span className="font-mono text-xs font-medium text-foreground">
            README Structure Preset
          </span>
          <div className="grid gap-2 sm:grid-cols-2">
            {README_TEMPLATES.map((tpl) => {
              const active = readmeConfig.templateId === tpl.id;
              return (
                <button
                  key={tpl.id}
                  type="button"
                  onClick={() => onSelectTemplate(tpl.id)}
                  className={cn(
                    "rounded-xl p-3 text-left transition",
                    active
                      ? "bg-accent ring-1 ring-primary"
                      : "bg-muted/40 hover:bg-muted/70"
                  )}
                >
                  <div className="text-xs font-semibold text-foreground">
                    {tpl.name}
                  </div>
                  <div className="mt-0.5 text-[11px] text-muted-foreground">
                    {tpl.description}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        <FieldSet>
          <FieldLegend variant="label" className="font-mono text-xs">
            Optional README Sections
          </FieldLegend>
          <FieldGroup className="flex-row flex-wrap gap-x-6 gap-y-2.5">
            {(
              [
                { key: "includeMarkers", label: "Auto Update Markers" },
                { key: "includeStatsTable", label: "Telemetry Table" },
                { key: "includeShareCard", label: "1280x640 Share Card" },
              ] as const
            ).map((opt) => (
              <Field key={opt.key} orientation="horizontal" className="w-auto">
                <Checkbox
                  id={`opt-${opt.key}`}
                  checked={readmeConfig[opt.key]}
                  onCheckedChange={(checked) =>
                    onUpdateField(opt.key, Boolean(checked))
                  }
                />
                <FieldLabel
                  htmlFor={`opt-${opt.key}`}
                  className="text-xs font-normal"
                >
                  {opt.label}
                </FieldLabel>
              </Field>
            ))}
          </FieldGroup>
        </FieldSet>

        {readmeConfig.includeStatsTable && (
          <Field>
            <FieldLabel
              htmlFor="telemetry-title-input"
              className="font-mono text-xs"
            >
              Telemetry Table Title
            </FieldLabel>
            <Input
              id="telemetry-title-input"
              type="text"
              value={readmeConfig.statsTableTitle}
              onChange={(e) =>
                onUpdateField("statsTableTitle", e.target.value)
              }
            />
          </Field>
        )}

        <div className="flex flex-col gap-2">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => setShowRawEditor((v) => !v)}
            className="w-fit px-0 font-mono text-xs text-muted-foreground hover:bg-transparent hover:text-foreground"
          >
            <FileText data-icon="inline-start" />
            {showRawEditor
              ? "Hide Full Raw README Override"
              : "Inspect / Override Full Raw README.md"}
          </Button>

          {showRawEditor && (
            <div className="overflow-hidden rounded-xl border border-slate-300 bg-white text-slate-900 shadow-sm">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 bg-slate-50 px-3 py-2">
                <div className="flex flex-wrap gap-1.5">
                  {DYNAMIC_TOKENS.map((t) => (
                    <button
                      key={t.token}
                      type="button"
                      onClick={() => insertToken(t.token)}
                      className="rounded border border-slate-200 bg-white px-2 py-0.5 font-mono text-[10px] text-slate-800 hover:bg-slate-100"
                    >
                      {t.token}
                    </button>
                  ))}
                </div>
                {readmeConfig.rawOverride !== null && (
                  <button
                    type="button"
                    onClick={() => onChangeRawMarkdown(null)}
                    className="inline-flex items-center gap-1 rounded border border-slate-300 bg-white px-2 py-0.5 text-[10px] text-slate-800 hover:bg-slate-100"
                  >
                    <RefreshCw className="size-3" />
                    Resync Editor
                  </button>
                )}
              </div>
              <Textarea
                rows={10}
                value={currentRawText}
                onChange={(e) => onChangeRawMarkdown(e.target.value)}
                spellCheck={false}
                className="w-full rounded-none border-0 bg-white p-3.5 font-mono text-xs leading-relaxed text-slate-900 focus-visible:ring-0"
              />
            </div>
          )}
        </div>
      </section>

      <Separator />

      <div className="flex flex-wrap items-center justify-between gap-3">
        <Button type="button" variant="ghost" onClick={onPrevStep}>
          <ArrowLeft data-icon="inline-start" />
          Creature &amp; Style
        </Button>
        <Button type="button" onClick={onNextStep}>
          Next: Enter Token &amp; Push
          <ArrowRight data-icon="inline-end" />
        </Button>
      </div>
    </div>
  );
}
