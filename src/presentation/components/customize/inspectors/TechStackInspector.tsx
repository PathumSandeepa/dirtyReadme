"use client";

import { useMemo, useRef, useState } from "react";
import {
  ArrowDown,
  ArrowUp,
  Check,
  ChevronLeft,
  ChevronRight,
  GripVertical,
  LayoutGrid,
  Plus,
  Search,
  Trash2,
  Undo2,
  X,
} from "lucide-react";
import { cn } from "cn";
import {
  TECH_CATEGORIES_ORDER,
  TECH_CATEGORY_LABELS,
  type ReadmeBadge,
  type ReadmeConfig,
  type TechCategory,
} from "@/domain/profile/entities";
import { buildShieldBadgeUrl } from "@/domain/profile/readmeService";
import { Switch } from "@/components/ui/switch";
import { StudioButton } from "../../../studio/ui/StudioButton";
import { StudioColorSwatch } from "../../../studio/ui/StudioColorSwatch";
import {
  StudioField,
  StudioInput,
  StudioSelect,
} from "../../../studio/ui/StudioInput";

interface TechStackInspectorProps {
  readmeConfig: ReadmeConfig;
  selectedCardId: string;
  onSelectCardId: (cardId: string) => void;
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
  onToggleStackCardVisibility: (cardId: string, visible: boolean) => void;
  onDeleteStackCard: (cardId: string) => void;
  onReorderStackCards: (fromIdx: number, toIdx: number) => void;
  onCombineStackCards: () => void;
  onUndoCombineStackCards: () => void;
  onAddCustomBadgeToCard: (
    cardId: string,
    badge: Omit<ReadmeBadge, "enabled">
  ) => void;
}

type CategoryFilter = "all" | TechCategory;

interface DragPayload {
  badgeId: string;
  fromCardId: string | null;
}

export function TechStackInspector({
  readmeConfig,
  selectedCardId,
  onSelectCardId,
  onAddBadgeToCard,
  onRemoveBadgeFromCard,
  onMoveBadgeAcrossCards,
  onAddStackCard,
  onRenameStackCard,
  onToggleStackCardVisibility,
  onDeleteStackCard,
  onReorderStackCards,
  onCombineStackCards,
  onUndoCombineStackCards,
  onAddCustomBadgeToCard,
}: TechStackInspectorProps) {
  const customSeqRef = useRef(1);
  const [badgeCategory, setBadgeCategory] = useState<CategoryFilter>("all");
  const [badgeSearch, setBadgeSearch] = useState("");
  const [dragPayload, setDragPayload] = useState<DragPayload | null>(null);
  const [dropCardId, setDropCardId] = useState<string | null>(null);

  const [newBadgeLabel, setNewBadgeLabel] = useState("");
  const [newBadgeLogo, setNewBadgeLogo] = useState("");
  const [newBadgeColor, setNewBadgeColor] = useState("#58D6B0");
  const [newBadgeError, setNewBadgeError] = useState<string | null>(null);

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

  const readPayloadFromEvent = (e: React.DragEvent): DragPayload | null => {
    const raw = e.dataTransfer?.getData("application/json");
    if (raw) {
      try {
        return JSON.parse(raw) as DragPayload;
      } catch {
        // Fallback to React state payload
      }
    }
    return dragPayload;
  };

  const handleDropOnCard = (e: React.DragEvent, targetCardId: string) => {
    e.preventDefault();
    const payload = readPayloadFromEvent(e);
    if (!payload) return;
    if (payload.fromCardId) {
      onMoveBadgeAcrossCards(payload.badgeId, payload.fromCardId, targetCardId);
    } else {
      onAddBadgeToCard(targetCardId, payload.badgeId);
    }
    onSelectCardId(targetCardId);
    setDragPayload(null);
    setDropCardId(null);
  };

  const handleDropOnChip = (
    e: React.DragEvent,
    targetCardId: string,
    targetBadgeId: string
  ) => {
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
    onSelectCardId(targetCardId);
    setDragPayload(null);
    setDropCardId(null);
  };

  const handleAddCustomBadge = (e: React.FormEvent) => {
    e.preventDefault();
    const label = newBadgeLabel.trim();
    if (!label) {
      setNewBadgeError("Enter a badge name such as Zig or WebGPU.");
      return;
    }
    if (!activeCardId) return;
    const logoSlug = newBadgeLogo.trim().toLowerCase().replace(/\s+/g, "");
    const seq = customSeqRef.current++;
    onAddCustomBadgeToCard(activeCardId, {
      id: `custom-${seq}`,
      label,
      color: newBadgeColor.replace("#", ""),
      ...(logoSlug ? { logo: logoSlug, logoColor: "white" } : {}),
      category: "skills",
    });
    setNewBadgeLabel("");
    setNewBadgeLogo("");
    setNewBadgeError(null);
  };

  const customBadgePreview: ReadmeBadge = {
    id: "preview",
    label: newBadgeLabel.trim() || "Custom",
    color: newBadgeColor.replace("#", "") || "58D6B0",
    logo: newBadgeLogo.trim().toLowerCase().replace(/\s+/g, "") || undefined,
    logoColor: "white",
    enabled: true,
  };

  return (
    <div className="flex flex-col gap-5">
      {/* Actions row */}
      <div className="flex flex-wrap items-center gap-2">
        <StudioButton
          variant="secondary"
          size="sm"
          onClick={() => {
            const id = onAddStackCard(
              `Stack group ${readmeConfig.stackCards.length + 1}`
            );
            onSelectCardId(id);
          }}
        >
          <Plus />
          <span>Add card</span>
        </StudioButton>

        {readmeConfig.stackCards.length > 1 && (
          <StudioButton
            variant="ghost"
            size="sm"
            onClick={onCombineStackCards}
          >
            <LayoutGrid />
            <span>Combine all</span>
          </StudioButton>
        )}

        {readmeConfig.savedOrganizedCards !== null && (
          <StudioButton
            variant="secondary"
            size="sm"
            onClick={onUndoCombineStackCards}
          >
            <Undo2 />
            <span>
              Undo combine ({readmeConfig.savedOrganizedCards.length})
            </span>
          </StudioButton>
        )}
      </div>

      {/* Stack Cards List */}
      <div className="flex flex-col gap-3">
        {readmeConfig.stackCards.map((card, cardIdx) => {
          const isSelected = card.id === activeCardId;
          const isDropping = dropCardId === card.id;
          const isVisible = card.visible !== false;
          const resolvedBadges = card.badgeIds
            .map((id) => badgeById.get(id))
            .filter((b): b is ReadmeBadge => Boolean(b));

          return (
            <div
              key={card.id}
              onClick={() => onSelectCardId(card.id)}
              onDragOver={(e) => {
                e.preventDefault();
                setDropCardId(card.id);
              }}
              onDragLeave={() => {
                if (dropCardId === card.id) setDropCardId(null);
              }}
              onDrop={(e) => handleDropOnCard(e, card.id)}
              className={cn(
                "flex flex-col gap-3 rounded-[12px] p-3.5 transition-colors duration-150",
                isDropping || isSelected
                  ? "bg-[var(--surface-3)]"
                  : "bg-[var(--surface-2)]",
                !isVisible && "opacity-70"
              )}
            >
              <StudioField
                label="Heading"
                htmlFor={`stack-card-title-${card.id}`}
                trailing={
                  <span className="studio-mono text-[12px] text-[var(--text-2)] tabular-nums">
                    {resolvedBadges.length}
                  </span>
                }
              >
                <StudioInput
                  id={`stack-card-title-${card.id}`}
                  value={card.title}
                  onFocus={() => onSelectCardId(card.id)}
                  onChange={(e) => onRenameStackCard(card.id, e.target.value)}
                  placeholder="Languages and frontend"
                  className="bg-[var(--surface)]"
                />
              </StudioField>

              <div
                className="flex flex-wrap items-center justify-between gap-2"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex items-center gap-2">
                  <Switch
                    id={`stack-visible-${card.id}`}
                    size="sm"
                    checked={isVisible}
                    onCheckedChange={(checked) =>
                      onToggleStackCardVisibility(card.id, Boolean(checked))
                    }
                  />
                  <label
                    htmlFor={`stack-visible-${card.id}`}
                    className="cursor-pointer text-[13px] font-medium text-[var(--text)]"
                  >
                    Show in README
                  </label>
                </div>

                <div className="flex items-center gap-1">
                  <StudioButton
                    variant="ghost"
                    size="icon"
                    disabled={cardIdx === 0}
                    onClick={() => onReorderStackCards(cardIdx, cardIdx - 1)}
                    aria-label="Move card up"
                    title="Move up"
                  >
                    <ArrowUp />
                  </StudioButton>
                  <StudioButton
                    variant="ghost"
                    size="icon"
                    disabled={cardIdx === readmeConfig.stackCards.length - 1}
                    onClick={() => onReorderStackCards(cardIdx, cardIdx + 1)}
                    aria-label="Move card down"
                    title="Move down"
                  >
                    <ArrowDown />
                  </StudioButton>
                  <StudioButton
                    variant="ghost"
                    size="icon"
                    disabled={readmeConfig.stackCards.length <= 1}
                    onClick={() => onDeleteStackCard(card.id)}
                    aria-label="Delete card"
                    title="Delete card"
                    className="hover:text-[var(--danger)]"
                  >
                    <Trash2 />
                  </StudioButton>
                </div>
              </div>

              {resolvedBadges.length === 0 ? (
                <p className="rounded-[8px] bg-[var(--surface)] py-3 text-center text-[12px] text-[var(--text-2)]">
                  Drop badges here or choose skills below.
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
                      }}
                      onDragOver={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                      }}
                      onDrop={(e) => handleDropOnChip(e, card.id, badge.id)}
                      className="inline-flex min-h-[30px] cursor-grab items-center gap-1 rounded-[8px] bg-[var(--surface)] px-2 py-1 text-[12px] font-medium text-[var(--text)] active:cursor-grabbing"
                    >
                      <GripVertical className="size-3 shrink-0 text-[var(--text-3)]" />
                      <span
                        className="size-2 shrink-0 rounded-full"
                        style={{ backgroundColor: `#${badge.color}` }}
                      />
                      <span className="max-w-[110px] truncate">
                        {badge.label}
                      </span>

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
                        title="Move left"
                        className="flex size-5 cursor-pointer items-center justify-center rounded-[4px] text-[var(--text-2)] hover:bg-[var(--surface-2)] hover:text-[var(--text)] disabled:cursor-not-allowed disabled:opacity-30"
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
                        title="Move right"
                        className="flex size-5 cursor-pointer items-center justify-center rounded-[4px] text-[var(--text-2)] hover:bg-[var(--surface-2)] hover:text-[var(--text)] disabled:cursor-not-allowed disabled:opacity-30"
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
                        title="Remove badge"
                        className="flex size-5 cursor-pointer items-center justify-center rounded-[4px] text-[var(--text-2)] hover:bg-[var(--surface-2)] hover:text-[var(--danger)]"
                      >
                        <X className="size-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Two-Column Skills Library */}
      <div className="flex flex-col gap-3 rounded-[12px] bg-[var(--surface-2)] p-3.5">
        <div className="flex items-center justify-between gap-2">
          <span className="text-[14px] font-semibold text-[var(--text)]">
            Skills library
          </span>
          <span className="studio-mono text-[12px] text-[var(--text-2)] tabular-nums">
            {readmeConfig.badges.length} skills
          </span>
        </div>

        <StudioField label="Adding to" htmlFor="adding-to-card-select">
          <StudioSelect
            id="adding-to-card-select"
            value={activeCardId}
            onChange={(e) => onSelectCardId(e.target.value)}
            className="bg-[var(--surface)]"
          >
            {readmeConfig.stackCards.map((c, idx) => (
              <option key={c.id} value={c.id}>
                {c.title.trim() || `Card ${idx + 1}`}
              </option>
            ))}
          </StudioSelect>
        </StudioField>

        <div className="grid grid-cols-[112px_1fr] gap-2">
          {/* Categories Left */}
          <div className="flex max-h-60 flex-col gap-0.5 overflow-y-auto rounded-[8px] bg-[var(--surface)] p-1.5">
            <button
              type="button"
              onClick={() => setBadgeCategory("all")}
              className={cn(
                "flex cursor-pointer items-center justify-between gap-1 rounded-[6px] px-2 py-1.5 text-left text-[12px] font-medium transition-colors duration-150",
                badgeCategory === "all"
                  ? "bg-[var(--surface-3)] text-[var(--text)]"
                  : "text-[var(--text-2)] hover:text-[var(--text)]"
              )}
            >
              <span>All</span>
              <span className="studio-mono text-[11px] tabular-nums opacity-80">
                {categoryCounts.all ?? 0}
              </span>
            </button>

            {TECH_CATEGORIES_ORDER.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setBadgeCategory(cat)}
                className={cn(
                  "flex cursor-pointer items-center justify-between gap-1 rounded-[6px] px-2 py-1.5 text-left text-[12px] font-medium transition-colors duration-150",
                  badgeCategory === cat
                    ? "bg-[var(--surface-3)] text-[var(--text)]"
                    : "text-[var(--text-2)] hover:text-[var(--text)]"
                )}
              >
                <span className="truncate">{TECH_CATEGORY_LABELS[cat]}</span>
                <span className="studio-mono text-[11px] tabular-nums opacity-80">
                  {categoryCounts[cat] ?? 0}
                </span>
              </button>
            ))}
          </div>

          {/* Search + Chips Right */}
          <div className="flex min-w-0 flex-col gap-2">
            <div className="relative">
              <Search className="pointer-events-none absolute top-1/2 left-2.5 size-3.5 -translate-y-1/2 text-[var(--text-2)]" />
              <StudioInput
                aria-label="Search skills"
                value={badgeSearch}
                onChange={(e) => setBadgeSearch(e.target.value)}
                placeholder="Search skills"
                className="h-8 bg-[var(--surface)] pl-8 text-[12px] sm:h-8"
              />
            </div>

            <div className="flex max-h-52 flex-wrap content-start gap-1.5 overflow-y-auto rounded-[8px] bg-[var(--surface)] p-2">
              {filteredBadges.length === 0 ? (
                <p className="w-full py-5 text-center text-[12px] text-[var(--text-2)]">
                  No skills matched.
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
                        "inline-flex cursor-pointer items-center gap-1 rounded-[6px] px-2 py-1 text-[12px] font-medium transition-colors duration-150",
                        inActiveCard
                          ? "bg-[var(--surface-3)] text-[var(--text)]"
                          : "bg-[var(--surface-2)] text-[var(--text-2)] hover:text-[var(--text)]"
                      )}
                    >
                      {inActiveCard ? (
                        <Check className="size-3 shrink-0 text-[var(--tide)]" />
                      ) : (
                        <Plus className="size-3 shrink-0" />
                      )}
                      <span className="truncate">{badge.label}</span>
                    </button>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Custom Badge Form */}
      <form
        onSubmit={handleAddCustomBadge}
        className="flex flex-col gap-3 rounded-[12px] bg-[var(--surface-2)] p-3.5"
      >
        <div className="flex flex-wrap items-center justify-between gap-2">
          <span className="text-[14px] font-semibold text-[var(--text)]">
            Custom badge
          </span>
          <img
            src={buildShieldBadgeUrl(customBadgePreview)}
            alt={customBadgePreview.label}
            className="h-5 w-auto"
          />
        </div>

        <StudioField
          label="Name"
          htmlFor="custom-badge-name"
          error={newBadgeError}
        >
          <StudioInput
            id="custom-badge-name"
            value={newBadgeLabel}
            invalid={Boolean(newBadgeError)}
            onChange={(e) => {
              setNewBadgeLabel(e.target.value);
              if (newBadgeError) setNewBadgeError(null);
            }}
            placeholder="Zig"
            className="bg-[var(--surface)]"
          />
        </StudioField>

        <StudioField
          label="Icon slug"
          htmlFor="custom-badge-slug"
          helper="Optional simple-icons slug."
        >
          <StudioInput
            id="custom-badge-slug"
            monospace
            value={newBadgeLogo}
            onChange={(e) => setNewBadgeLogo(e.target.value)}
            placeholder="zig"
            className="bg-[var(--surface)]"
          />
        </StudioField>

        <StudioField label="Color">
          <div className="flex items-center justify-between gap-2">
            <StudioColorSwatch
              label="Badge color"
              value={newBadgeColor}
              onChange={setNewBadgeColor}
              hideInput
            />
            <StudioButton type="submit" variant="primary" size="sm">
              Add badge
            </StudioButton>
          </div>
        </StudioField>
      </form>
    </div>
  );
}
