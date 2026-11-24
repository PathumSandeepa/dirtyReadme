"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowDown,
  ArrowUp,
  EyeOff,
  Plus,
  Search,
  Trash2,
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
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { StudioButton } from "../../studio/ui/StudioButton";
import { StudioColorSwatch } from "../../studio/ui/StudioColorSwatch";
import { StudioInput } from "../../studio/ui/StudioInput";

interface CanvasStackSectionProps {
  readmeConfig: ReadmeConfig;
  activePart: string;
  selectedStackCardId: string;
  isAlignedLeft: boolean;
  onSelectGroup: (cardId: string) => void;
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
  onToggleStackCardVisibility: (cardId: string, visible: boolean) => void;
  onDeleteStackCard: (cardId: string) => void;
  onReorderStackCards: (fromIdx: number, toIdx: number) => void;
  onAddCustomBadgeToCard: (
    cardId: string,
    badge: Omit<ReadmeBadge, "enabled">
  ) => void;
}

interface PointerDragState {
  badgeId: string;
  label: string;
  src: string;
  fromCardId: string;
  x: number;
  y: number;
  targetCardId: string | null;
  targetBeforeBadgeId: string | undefined;
  overNewGroup: boolean;
}

export function CanvasStackSection({
  readmeConfig,
  activePart,
  selectedStackCardId,
  isAlignedLeft,
  onSelectGroup,
  onAddBadgeToCard,
  onRemoveBadgeFromCard,
  onMoveBadgeAcrossCards,
  onAddStackCard,
  onToggleStackCardVisibility,
  onDeleteStackCard,
  onReorderStackCards,
  onAddCustomBadgeToCard,
}: CanvasStackSectionProps) {
  const badgeById = useMemo(
    () => new Map(readmeConfig.badges.map((b) => [b.id, b])),
    [readmeConfig.badges]
  );
  const visibleCards = useMemo(
    () => readmeConfig.stackCards.filter((c) => c.visible !== false),
    [readmeConfig.stackCards]
  );

  const [dragState, setDragState] = useState<PointerDragState | null>(null);
  const dragStateRef = useRef<PointerDragState | null>(null);
  const ghostRef = useRef<HTMLDivElement | null>(null);
  const dragPendingRef = useRef<{
    badgeId: string;
    label: string;
    src: string;
    fromCardId: string;
    startX: number;
    startY: number;
  } | null>(null);

  const [kbPicked, setKbPicked] = useState<{
    cardId: string;
    badgeId: string;
    originalCardId: string;
    originalIndex: number;
  } | null>(null);
  const [liveAnnouncement, setLiveAnnouncement] = useState("");

  // Add badge popover state per card
  const [openAddCardId, setOpenAddCardId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<"all" | TechCategory>(
    "all"
  );
  const [customName, setCustomName] = useState("");
  const [customSlug, setCustomSlug] = useState("");
  const [customColor, setCustomColor] = useState("#2563EB");

  const totalBadgeCount = useMemo(
    () => visibleCards.reduce((sum, c) => sum + c.badgeIds.length, 0),
    [visibleCards]
  );

  const filteredCatalog = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return readmeConfig.badges
      .filter((b) => {
        if (categoryFilter !== "all" && b.category !== categoryFilter) {
          return false;
        }
        if (!q) return true;
        return (
          b.label.toLowerCase().includes(q) ||
          (b.logo ?? "").toLowerCase().includes(q)
        );
      })
      .slice(0, 48);
  }, [categoryFilter, readmeConfig.badges, searchQuery]);

  const latestStackRefs = useRef({
    visibleCards,
    onAddStackCard,
    onMoveBadgeAcrossCards,
  });
  useEffect(() => {
    latestStackRefs.current = {
      visibleCards,
      onAddStackCard,
      onMoveBadgeAcrossCards,
    };
  });

  // Global pointer listeners for drag-and-drop
  useEffect(() => {
    const handlePointerMove = (event: PointerEvent) => {
      const pending = dragPendingRef.current;
      const currentDrag = dragStateRef.current;
      if (pending && !currentDrag) {
        const dx = event.clientX - pending.startX;
        const dy = event.clientY - pending.startY;
        if (Math.hypot(dx, dy) < 4) return;
        const initial: PointerDragState = {
          badgeId: pending.badgeId,
          label: pending.label,
          src: pending.src,
          fromCardId: pending.fromCardId,
          x: event.clientX,
          y: event.clientY,
          targetCardId: pending.fromCardId,
          targetBeforeBadgeId: undefined,
          overNewGroup: false,
        };
        dragStateRef.current = initial;
        setDragState(initial);
        return;
      }

      if (!currentDrag) return;
      if (ghostRef.current) {
        ghostRef.current.style.transform = `translate3d(${event.clientX + 12}px, ${event.clientY + 12}px, 0)`;
      }

      const el = document.elementFromPoint(event.clientX, event.clientY);
      const newGroupEl = el?.closest<HTMLElement>("[data-new-group-drop]");
      if (newGroupEl) {
        if (
          !currentDrag.overNewGroup ||
          currentDrag.targetCardId !== null
        ) {
          const updated: PointerDragState = {
            ...currentDrag,
            targetCardId: null,
            targetBeforeBadgeId: undefined,
            overNewGroup: true,
          };
          dragStateRef.current = updated;
          setDragState(updated);
        }
        return;
      }

      const groupEl = el?.closest<HTMLElement>("[data-group-drop]");
      if (!groupEl) return;

      const cardId = groupEl.dataset.groupDrop ?? null;
      const card = latestStackRefs.current.visibleCards.find(
        (c) => c.id === cardId
      );
      const badgeNodes = groupEl.querySelectorAll<HTMLElement>(
        "[data-badge-drop='true']"
      );

      let beforeId: string | undefined;
      if (badgeNodes.length > 0 && card) {
        let bestNode: HTMLElement | null = null;
        let bestDist = Infinity;
        badgeNodes.forEach((node) => {
          const rect = node.getBoundingClientRect();
          const cx = rect.left + rect.width / 2;
          const cy = rect.top + rect.height / 2;
          const dist = Math.hypot(
            event.clientX - cx,
            (event.clientY - cy) * 1.5
          );
          if (dist < bestDist) {
            bestDist = dist;
            bestNode = node;
          }
        });
        if (bestNode) {
          const chosen = bestNode as HTMLElement;
          const badgeId = chosen.dataset.badgeId;
          const rect = chosen.getBoundingClientRect();
          const isAfter = event.clientX > rect.left + rect.width / 2;
          beforeId = badgeId;
          if (badgeId && isAfter) {
            const idx = card.badgeIds.indexOf(badgeId);
            beforeId =
              idx >= 0 && idx + 1 < card.badgeIds.length
                ? card.badgeIds[idx + 1]
                : undefined;
          }
        }
      }

      if (
        currentDrag.targetCardId !== cardId ||
        currentDrag.targetBeforeBadgeId !== beforeId ||
        currentDrag.overNewGroup
      ) {
        const updated: PointerDragState = {
          ...currentDrag,
          targetCardId: cardId,
          targetBeforeBadgeId: beforeId,
          overNewGroup: false,
        };
        dragStateRef.current = updated;
        setDragState(updated);
      }
    };

    const handlePointerUp = () => {
      dragPendingRef.current = null;
      const currentDrag = dragStateRef.current;
      if (!currentDrag) return;
      dragStateRef.current = null;
      setDragState(null);
      if (currentDrag.overNewGroup) {
        const newId = latestStackRefs.current.onAddStackCard("Tech stack");
        latestStackRefs.current.onMoveBadgeAcrossCards(
          currentDrag.badgeId,
          currentDrag.fromCardId,
          newId
        );
      } else if (currentDrag.targetCardId) {
        latestStackRefs.current.onMoveBadgeAcrossCards(
          currentDrag.badgeId,
          currentDrag.fromCardId,
          currentDrag.targetCardId,
          currentDrag.targetBeforeBadgeId
        );
      }
    };

    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerup", handlePointerUp);
    window.addEventListener("pointercancel", handlePointerUp);
    return () => {
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerup", handlePointerUp);
      window.removeEventListener("pointercancel", handlePointerUp);
    };
  }, []);

  const moveBadgeByKeyboard = (
    cardId: string,
    badgeId: string,
    direction: "left" | "right" | "up" | "down"
  ) => {
    const cardIdx = visibleCards.findIndex((c) => c.id === cardId);
    if (cardIdx === -1) return;
    const card = visibleCards[cardIdx];
    const badgeIdx = card.badgeIds.indexOf(badgeId);
    if (badgeIdx === -1) return;

    const label = badgeById.get(badgeId)?.label ?? badgeId;

    if (direction === "left" && badgeIdx > 0) {
      const targetId = card.badgeIds[badgeIdx - 1];
      onMoveBadgeAcrossCards(badgeId, cardId, cardId, targetId);
      setLiveAnnouncement(
        `Moved ${label} to position ${badgeIdx} of ${totalBadgeCount}`
      );
      return;
    }

    if (direction === "right" && badgeIdx < card.badgeIds.length - 1) {
      const afterId = card.badgeIds[badgeIdx + 2];
      onMoveBadgeAcrossCards(badgeId, cardId, cardId, afterId);
      setLiveAnnouncement(
        `Moved ${label} to position ${badgeIdx + 2} of ${totalBadgeCount}`
      );
      return;
    }

    if (direction === "up" && cardIdx > 0) {
      const prevCard = visibleCards[cardIdx - 1];
      onMoveBadgeAcrossCards(badgeId, cardId, prevCard.id);
      setKbPicked((prev) =>
        prev ? { ...prev, cardId: prevCard.id } : null
      );
      setLiveAnnouncement(`Moved ${label} to ${prevCard.title}`);
      return;
    }

    if (direction === "down" && cardIdx < visibleCards.length - 1) {
      const nextCard = visibleCards[cardIdx + 1];
      onMoveBadgeAcrossCards(badgeId, cardId, nextCard.id);
      setKbPicked((prev) =>
        prev ? { ...prev, cardId: nextCard.id } : null
      );
      setLiveAnnouncement(`Moved ${label} to ${nextCard.title}`);
    }
  };

  if (visibleCards.length === 0) return null;

  return (
    <div data-canvas-section="stack" className="flex flex-col gap-3">
      {/* Screen reader live announcements for keyboard drag */}
      <div aria-live="polite" className="sr-only">
        {liveAnnouncement}
      </div>

      {readmeConfig.stackCards.map((card, cardIdx) => {
        if (card.visible === false) return null;
        const cardBadges = card.badgeIds
          .map((id) => badgeById.get(id))
          .filter((b): b is ReadmeBadge => Boolean(b && b.label.trim()));

        const selectedBlock =
          activePart === "stack" && selectedStackCardId === card.id;

        return (
          <div
            key={card.id}
            data-group-drop={card.id}
            onClick={() => onSelectGroup(card.id)}
            className={cn(
              "group relative flex cursor-pointer flex-col gap-2 rounded-[8px] px-3 py-2.5 transition-colors duration-150",
              selectedBlock
                ? "bg-[var(--surface-3)]/35"
                : "hover:bg-[var(--surface-2)]/30"
            )}
          >
            {/* Floating group handle */}
            <div
              onClick={(e) => e.stopPropagation()}
              className={cn(
                "absolute -top-3 right-2 z-10 flex items-center gap-0.5 rounded-[8px] bg-[var(--surface)] p-1 text-[var(--text)] shadow-[var(--shadow-float)] transition-opacity duration-150",
                selectedBlock
                  ? "pointer-events-auto opacity-100"
                  : "pointer-events-none opacity-0 group-hover:pointer-events-auto group-hover:opacity-100 group-focus-within:pointer-events-auto group-focus-within:opacity-100"
              )}
            >
              <button
                type="button"
                disabled={cardIdx === 0}
                onClick={() => onReorderStackCards(cardIdx, cardIdx - 1)}
                aria-label="Move group up"
                title="Move up"
                className="flex size-7 cursor-pointer items-center justify-center rounded-[6px] text-[var(--text-2)] hover:bg-[var(--surface-2)] hover:text-[var(--text)] disabled:opacity-35"
              >
                <ArrowUp className="size-3.5" />
              </button>
              <button
                type="button"
                disabled={cardIdx === readmeConfig.stackCards.length - 1}
                onClick={() => onReorderStackCards(cardIdx, cardIdx + 1)}
                aria-label="Move group down"
                title="Move down"
                className="flex size-7 cursor-pointer items-center justify-center rounded-[6px] text-[var(--text-2)] hover:bg-[var(--surface-2)] hover:text-[var(--text)] disabled:opacity-35"
              >
                <ArrowDown className="size-3.5" />
              </button>
              <button
                type="button"
                onClick={() => onToggleStackCardVisibility(card.id, false)}
                aria-label="Hide group"
                title="Hide"
                className="inline-flex h-7 cursor-pointer items-center gap-1 rounded-[6px] px-2 text-[12px] text-[var(--text-2)] hover:bg-[var(--surface-2)] hover:text-[var(--text)]"
              >
                <EyeOff className="size-3" />
                <span>Hide</span>
              </button>
              <button
                type="button"
                onClick={() => onDeleteStackCard(card.id)}
                aria-label="Delete group"
                title="Delete group"
                className="flex size-7 cursor-pointer items-center justify-center rounded-[6px] text-[var(--text-2)] hover:bg-[var(--surface-2)] hover:text-[var(--danger)]"
              >
                <Trash2 className="size-3.5" />
              </button>
            </div>

            {card.title.trim() && (
              <h4
                className={cn(
                  "text-[16px] leading-tight font-semibold text-[var(--gh-text)]",
                  isAlignedLeft ? "text-left" : "text-center"
                )}
              >
                {card.title}
              </h4>
            )}

            <div
              className={cn(
                "flex flex-wrap items-center gap-1.5",
                isAlignedLeft ? "justify-start" : "justify-center"
              )}
            >
              {cardBadges.map((badge, badgeIdx) => {
                const src = buildShieldBadgeUrl(badge);
                const isBeingDragged =
                  dragState?.badgeId === badge.id &&
                  dragState?.fromCardId === card.id;
                const isDropBefore =
                  dragState?.targetCardId === card.id &&
                  dragState?.targetBeforeBadgeId === badge.id;
                const isKbPicked =
                  kbPicked?.cardId === card.id &&
                  kbPicked?.badgeId === badge.id;

                return (
                  <div
                    key={`${card.id}-${badge.id}`}
                    data-badge-drop="true"
                    data-card-id={card.id}
                    data-badge-id={badge.id}
                    className="group/badge relative inline-flex items-center"
                  >
                    {isDropBefore && (
                      <span
                        aria-hidden="true"
                        className="mr-1 h-7 w-[2px] rounded-full bg-[var(--ember)]"
                      />
                    )}

                    <div
                      role="button"
                      tabIndex={0}
                      aria-label={`${badge.label} badge`}
                      aria-pressed={isKbPicked}
                      onPointerDown={(e) => {
                        if (
                          (e.target as HTMLElement).closest(
                            "[data-remove-badge]"
                          )
                        ) {
                          return;
                        }
                        e.preventDefault();
                        dragPendingRef.current = {
                          badgeId: badge.id,
                          label: badge.label,
                          src,
                          fromCardId: card.id,
                          startX: e.clientX,
                          startY: e.clientY,
                        };
                      }}
                      onKeyDown={(e) => {
                        if (e.key === "Delete" || e.key === "Backspace") {
                          e.preventDefault();
                          e.stopPropagation();
                          onRemoveBadgeFromCard(card.id, badge.id);
                          return;
                        }
                        if (e.altKey && e.key === "ArrowLeft") {
                          e.preventDefault();
                          e.stopPropagation();
                          moveBadgeByKeyboard(card.id, badge.id, "left");
                          return;
                        }
                        if (e.altKey && e.key === "ArrowRight") {
                          e.preventDefault();
                          e.stopPropagation();
                          moveBadgeByKeyboard(card.id, badge.id, "right");
                          return;
                        }
                        if (e.key === " ") {
                          e.preventDefault();
                          e.stopPropagation();
                          if (isKbPicked) {
                            setKbPicked(null);
                            setLiveAnnouncement(`Dropped ${badge.label}`);
                          } else {
                            setKbPicked({
                              cardId: card.id,
                              badgeId: badge.id,
                              originalCardId: card.id,
                              originalIndex: badgeIdx,
                            });
                            setLiveAnnouncement(
                              `Picked up ${badge.label}. Use arrow keys to move, Space to drop, Escape to cancel.`
                            );
                          }
                          return;
                        }
                        if (isKbPicked) {
                          if (e.key === "Escape") {
                            e.preventDefault();
                            e.stopPropagation();
                            const targetId =
                              card.badgeIds[kbPicked.originalIndex];
                            onMoveBadgeAcrossCards(
                              badge.id,
                              kbPicked.cardId,
                              kbPicked.originalCardId,
                              targetId
                            );
                            setKbPicked(null);
                            setLiveAnnouncement("Cancelled move");
                            return;
                          }
                          if (e.key === "ArrowLeft") {
                            e.preventDefault();
                            e.stopPropagation();
                            moveBadgeByKeyboard(card.id, badge.id, "left");
                          } else if (e.key === "ArrowRight") {
                            e.preventDefault();
                            e.stopPropagation();
                            moveBadgeByKeyboard(card.id, badge.id, "right");
                          } else if (e.key === "ArrowUp") {
                            e.preventDefault();
                            e.stopPropagation();
                            moveBadgeByKeyboard(card.id, badge.id, "up");
                          } else if (e.key === "ArrowDown") {
                            e.preventDefault();
                            e.stopPropagation();
                            moveBadgeByKeyboard(card.id, badge.id, "down");
                          }
                        }
                      }}
                      className={cn(
                        "relative inline-flex cursor-grab items-center rounded-[4px] select-none active:cursor-grabbing",
                        isBeingDragged && "opacity-35",
                        isKbPicked && "ring-2 ring-[var(--ember)]"
                      )}
                    >
                      <img
                        src={src}
                        alt={badge.label}
                        draggable={false}
                        className="pointer-events-none h-7 w-auto"
                      />

                      <button
                        type="button"
                        data-remove-badge="true"
                        title="Remove"
                        aria-label={`Remove ${badge.label}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          onRemoveBadgeFromCard(card.id, badge.id);
                        }}
                        className="absolute -top-2 -right-2 flex size-6 cursor-pointer items-center justify-center rounded-full bg-[var(--surface)] text-[var(--text)] opacity-0 shadow-[var(--shadow-float)] transition-opacity duration-150 group-hover/badge:opacity-100 group-focus-within/badge:opacity-100 hover:text-[var(--danger)]"
                      >
                        <X className="size-3" />
                      </button>
                    </div>
                  </div>
                );
              })}

              {/* Insertion bar at end of group */}
              {dragState &&
                dragState.targetCardId === card.id &&
                dragState.targetBeforeBadgeId === undefined && (
                  <span
                    aria-hidden="true"
                    className="h-7 w-[2px] rounded-full bg-[var(--ember)]"
                  />
                )}

              {/* "+" chip opening skills library + custom badge popover */}
              <Popover
                open={openAddCardId === card.id}
                onOpenChange={(open) => {
                  setOpenAddCardId(open ? card.id : null);
                  if (!open) setSearchQuery("");
                }}
              >
                <PopoverTrigger
                  render={
                    <button
                      type="button"
                      onClick={(e) => e.stopPropagation()}
                      aria-label={`Add badge to ${card.title || "group"}`}
                      className="inline-flex size-7 cursor-pointer items-center justify-center rounded-[6px] bg-[var(--gh-surface)] text-[var(--gh-muted)] transition-colors hover:text-[var(--gh-text)]"
                    />
                  }
                >
                  <Plus className="size-3.5" />
                </PopoverTrigger>
                <PopoverContent
                  data-app="studio"
                  onClick={(e) => e.stopPropagation()}
                  className="w-80 rounded-[12px] border-0 bg-[var(--surface)] p-3.5 text-[var(--text)] ring-0 shadow-[var(--shadow-float)]"
                >
                  <div className="flex flex-col gap-3">
                    <div className="relative">
                      <Search className="pointer-events-none absolute top-1/2 left-2.5 size-3.5 -translate-y-1/2 text-[var(--text-3)]" />
                      <StudioInput
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search skills..."
                        className="h-8 pl-8 text-[12px]"
                      />
                    </div>

                    <div className="studio-no-scrollbar flex gap-1 overflow-x-auto pb-1">
                      <button
                        type="button"
                        onClick={() => setCategoryFilter("all")}
                        className={cn(
                          "shrink-0 cursor-pointer rounded-full px-2.5 py-1 text-[11px] font-medium",
                          categoryFilter === "all"
                            ? "bg-[var(--primary)] text-[var(--on-primary)]"
                            : "bg-[var(--surface-2)] text-[var(--text-2)]"
                        )}
                      >
                        All
                      </button>
                      {TECH_CATEGORIES_ORDER.map((cat) => (
                        <button
                          key={cat}
                          type="button"
                          onClick={() => setCategoryFilter(cat)}
                          className={cn(
                            "shrink-0 cursor-pointer rounded-full px-2.5 py-1 text-[11px] font-medium whitespace-nowrap",
                            categoryFilter === cat
                              ? "bg-[var(--primary)] text-[var(--on-primary)]"
                              : "bg-[var(--surface-2)] text-[var(--text-2)]"
                          )}
                        >
                          {TECH_CATEGORY_LABELS[cat]}
                        </button>
                      ))}
                    </div>

                    <div className="max-h-40 space-y-1 overflow-y-auto">
                      {filteredCatalog.map((b) => (
                        <button
                          key={b.id}
                          type="button"
                          onClick={() => {
                            onAddBadgeToCard(card.id, b.id);
                            setOpenAddCardId(null);
                          }}
                          className="flex w-full cursor-pointer items-center justify-between rounded-[6px] px-2 py-1.5 text-left text-[12px] hover:bg-[var(--surface-2)]"
                        >
                          <span>{b.label}</span>
                          <span className="text-[11px] text-[var(--text-3)]">
                            {b.category
                              ? TECH_CATEGORY_LABELS[b.category]
                              : "Custom"}
                          </span>
                        </button>
                      ))}
                    </div>

                    {/* Custom badge row */}
                    <div className="flex flex-col gap-2 border-t border-[var(--line)] pt-2.5">
                      <span className="text-[11px] font-semibold text-[var(--text-2)]">
                        Custom badge
                      </span>
                      <div className="grid grid-cols-2 gap-1.5">
                        <StudioInput
                          value={customName}
                          onChange={(e) => setCustomName(e.target.value)}
                          placeholder="Name"
                          className="h-8 text-[12px]"
                        />
                        <StudioInput
                          value={customSlug}
                          onChange={(e) => setCustomSlug(e.target.value)}
                          placeholder="Icon slug"
                          className="h-8 text-[12px]"
                        />
                      </div>
                      <div className="flex items-center justify-between gap-2">
                        <StudioColorSwatch
                          label="Color"
                          value={customColor}
                          onChange={setCustomColor}
                        />
                        {customName.trim() && (
                          <img
                            src={buildShieldBadgeUrl({
                              id: "preview",
                              label: customName.trim(),
                              color: customColor.replace("#", ""),
                              logo: customSlug.trim() || undefined,
                              logoColor: "white",
                              enabled: true,
                            })}
                            alt={customName.trim()}
                            className="h-6 w-auto"
                          />
                        )}
                        <StudioButton
                          variant="primary"
                          size="sm"
                          disabled={!customName.trim()}
                          onClick={() => {
                            const label = customName.trim();
                            if (!label) return;
                            onAddCustomBadgeToCard(card.id, {
                              id: `custom-${Date.now()}`,
                              label,
                              color: customColor.replace("#", ""),
                              logo: customSlug.trim() || undefined,
                              logoColor: "white",
                              category: "tools",
                            });
                            setCustomName("");
                            setCustomSlug("");
                            setOpenAddCardId(null);
                          }}
                        >
                          Add
                        </StudioButton>
                      </div>
                    </div>
                  </div>
                </PopoverContent>
              </Popover>
            </div>
          </div>
        );
      })}

      {/* "New group" drop zone shown while dragging */}
      {dragState && (
        <div
          data-new-group-drop="true"
          className={cn(
            "flex items-center justify-center rounded-[8px] border border-dashed py-3 text-[12px] font-medium transition-colors",
            dragState.overNewGroup
              ? "border-[var(--ember)] bg-[var(--ember-soft)] text-[var(--text)]"
              : "border-[var(--gh-border)] text-[var(--gh-muted)]"
          )}
        >
          New group
        </div>
      )}

      {/* Lifted floating ghost */}
      {dragState && (
        <div
          ref={ghostRef}
          style={{
            left: 0,
            top: 0,
            transform: `translate3d(${dragState.x + 12}px, ${dragState.y + 12}px, 0)`,
          }}
          className="pointer-events-none fixed z-50 scale-105 opacity-95 shadow-[var(--shadow-float)] will-change-transform"
        >
          <img src={dragState.src} alt={dragState.label} className="h-7 w-auto" />
        </div>
      )}
    </div>
  );
}
