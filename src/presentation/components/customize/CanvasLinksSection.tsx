"use client";

import { useEffect, useRef, useState } from "react";
import { ArrowDown, ArrowUp, Edit3, EyeOff, Plus, X } from "lucide-react";
import { cn } from "cn";
import type { CreatureConfig } from "@/domain/creature/entities";
import {
  CTA_QUICK_TEMPLATES,
  type ReadmeActionLink,
  type ReadmeConfig,
} from "@/domain/profile/entities";
import {
  buildActionLinkBadgeUrl,
  reorderItems,
  resolveDynamicTokens,
} from "@/domain/profile/readmeService";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface CanvasLinksSectionProps {
  creatureConfig: CreatureConfig;
  readmeConfig: ReadmeConfig;
  activePart: string;
  isAlignedLeft: boolean;
  onSelectLinks: () => void;
  onUpdateLinks: (nextLinks: ReadmeActionLink[]) => void;
  onHideLinks: () => void;
  onShowUndoToast: (message: string) => void;
}

interface LinkDragState {
  linkId: string;
  label: string;
  src: string;
  fromIndex: number;
  x: number;
  y: number;
  targetIndex: number;
}

export function CanvasLinksSection({
  creatureConfig,
  readmeConfig,
  activePart,
  isAlignedLeft,
  onSelectLinks,
  onUpdateLinks,
  onHideLinks,
  onShowUndoToast,
}: CanvasLinksSectionProps) {
  const enabledLinks = readmeConfig.actionLinks.filter(
    (l) => l.enabled && l.label.trim()
  );

  const [dragState, setDragState] = useState<LinkDragState | null>(null);
  const dragStateRef = useRef<LinkDragState | null>(null);
  const ghostRef = useRef<HTMLDivElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const dragPendingRef = useRef<{
    linkId: string;
    label: string;
    src: string;
    fromIndex: number;
    startX: number;
    startY: number;
  } | null>(null);
  const [kbPickedId, setKbPickedId] = useState<{
    id: string;
    originalIndex: number;
  } | null>(null);
  const [liveAnnouncement, setLiveAnnouncement] = useState("");
  const [addOpen, setAddOpen] = useState(false);

  const reorderEnabledLinks = (fromIdx: number, toIdx: number) => {
    const reorderedEnabled = reorderItems(enabledLinks, fromIdx, toIdx);
    const disabledLinks = readmeConfig.actionLinks.filter(
      (l) => !l.enabled || !l.label.trim()
    );
    onUpdateLinks([...reorderedEnabled, ...disabledLinks]);
  };

  const removeLink = (linkId: string) => {
    onUpdateLinks(
      readmeConfig.actionLinks.filter((l) => l.id !== linkId)
    );
    onShowUndoToast("Link removed");
  };

  const latestCallbacksRef = useRef({ reorderEnabledLinks, enabledLinksLength: enabledLinks.length });
  useEffect(() => {
    latestCallbacksRef.current = { reorderEnabledLinks, enabledLinksLength: enabledLinks.length };
  });

  useEffect(() => {
    const handlePointerMove = (event: PointerEvent) => {
      const pending = dragPendingRef.current;
      const currentDrag = dragStateRef.current;
      if (pending && !currentDrag) {
        if (
          Math.hypot(
            event.clientX - pending.startX,
            event.clientY - pending.startY
          ) < 4
        ) {
          return;
        }
        const initial: LinkDragState = {
          linkId: pending.linkId,
          label: pending.label,
          src: pending.src,
          fromIndex: pending.fromIndex,
          x: event.clientX,
          y: event.clientY,
          targetIndex: pending.fromIndex,
        };
        dragStateRef.current = initial;
        setDragState(initial);
        return;
      }

      if (!currentDrag) return;
      if (ghostRef.current) {
        ghostRef.current.style.transform = `translate3d(${event.clientX + 12}px, ${event.clientY + 12}px, 0)`;
      }

      const nodes = containerRef.current?.querySelectorAll<HTMLElement>("[data-link-drop='true']");
      if (!nodes || nodes.length === 0) return;

      let bestIdx = currentDrag.targetIndex;
      let bestDist = Infinity;
      let isAfter = false;

      nodes.forEach((node) => {
        const idx = Number(node.dataset.linkIndex);
        if (Number.isNaN(idx)) return;
        const rect = node.getBoundingClientRect();
        const cx = rect.left + rect.width / 2;
        const cy = rect.top + rect.height / 2;
        const dist = Math.hypot(event.clientX - cx, (event.clientY - cy) * 1.5);
        if (dist < bestDist) {
          bestDist = dist;
          bestIdx = idx;
          isAfter = event.clientX > cx;
        }
      });

      const rawSlot = isAfter ? bestIdx + 1 : bestIdx;
      const maxIdx = Math.max(0, latestCallbacksRef.current.enabledLinksLength - 1);
      const nextTarget = Math.max(
        0,
        Math.min(maxIdx, rawSlot > currentDrag.fromIndex ? rawSlot - 1 : rawSlot)
      );

      if (nextTarget !== currentDrag.targetIndex) {
        const updated = { ...currentDrag, targetIndex: nextTarget };
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
      if (currentDrag.targetIndex !== currentDrag.fromIndex) {
        latestCallbacksRef.current.reorderEnabledLinks(
          currentDrag.fromIndex,
          currentDrag.targetIndex
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

  if (enabledLinks.length === 0) return null;

  return (
    <div
      ref={containerRef}
      data-canvas-section="links"
      onClick={onSelectLinks}
      className={cn(
        "group relative flex cursor-pointer flex-wrap items-center gap-2 rounded-[8px] px-3 py-2.5 transition-colors duration-150",
        isAlignedLeft ? "justify-start" : "justify-center",
        activePart === "links"
          ? "bg-[var(--surface-3)]/35"
          : "hover:bg-[var(--surface-2)]/30"
      )}
    >
      <div aria-live="polite" className="sr-only">
        {liveAnnouncement}
      </div>

      {/* Floating group handle */}
      <div
        onClick={(e) => e.stopPropagation()}
        className="pointer-events-none absolute -top-3 right-2 z-10 flex items-center gap-0.5 rounded-[8px] bg-[var(--surface)] p-1 text-[var(--text)] opacity-0 shadow-[var(--shadow-float)] transition-opacity duration-150 group-hover:pointer-events-auto group-hover:opacity-100 group-focus-within:pointer-events-auto group-focus-within:opacity-100"
      >
        <button
          type="button"
          onClick={onSelectLinks}
          className="inline-flex h-7 cursor-pointer items-center gap-1 rounded-[6px] px-2 text-[12px] font-medium text-[var(--text)] hover:bg-[var(--surface-2)]"
        >
          <Edit3 className="size-3" />
          <span>Edit</span>
        </button>
        <button
          type="button"
          disabled
          title="Order follows your tech stack"
          aria-label="Move links up"
          className="flex size-7 items-center justify-center rounded-[6px] text-[var(--text-3)] opacity-40"
        >
          <ArrowUp className="size-3.5" />
        </button>
        <button
          type="button"
          disabled
          title="Order sits above the banner"
          aria-label="Move links down"
          className="flex size-7 items-center justify-center rounded-[6px] text-[var(--text-3)] opacity-40"
        >
          <ArrowDown className="size-3.5" />
        </button>
        <button
          type="button"
          onClick={onHideLinks}
          aria-label="Hide links row"
          className="inline-flex h-7 cursor-pointer items-center gap-1 rounded-[6px] px-2 text-[12px] text-[var(--text-2)] hover:bg-[var(--surface-2)] hover:text-[var(--text)]"
        >
          <EyeOff className="size-3" />
          <span>Hide</span>
        </button>
      </div>

      {enabledLinks.map((link, idx) => {
        const src = buildActionLinkBadgeUrl(link, creatureConfig);
        const href = resolveDynamicTokens(link.url, creatureConfig);
        const isBeingDragged = dragState?.linkId === link.id;
        const isDropBefore =
          dragState &&
          dragState.linkId !== link.id &&
          dragState.targetIndex === idx;
        const isKbPicked = kbPickedId?.id === link.id;

        return (
          <div
            key={link.id}
            data-link-drop="true"
            data-link-index={idx}
            className="group/link relative inline-flex items-center"
          >
            {isDropBefore && (
              <span
                aria-hidden="true"
                className="mr-1 h-7 w-[2px] rounded-full bg-[var(--ember)]"
              />
            )}

            <a
              href={href}
              draggable={false}
              aria-label={`${link.label} link`}
              onPointerDown={(e) => {
                if (
                  (e.target as HTMLElement).closest("[data-remove-link]")
                ) {
                  return;
                }
                e.preventDefault();
                dragPendingRef.current = {
                  linkId: link.id,
                  label: link.label,
                  src,
                  fromIndex: idx,
                  startX: e.clientX,
                  startY: e.clientY,
                };
              }}
              onClick={(e) => {
                e.preventDefault();
                onSelectLinks();
              }}
              onKeyDown={(e) => {
                if (e.key === "Delete" || e.key === "Backspace") {
                  e.preventDefault();
                  e.stopPropagation();
                  removeLink(link.id);
                  return;
                }
                if (e.altKey && e.key === "ArrowLeft" && idx > 0) {
                  e.preventDefault();
                  e.stopPropagation();
                  reorderEnabledLinks(idx, idx - 1);
                  setLiveAnnouncement(
                    `Moved ${link.label} to position ${idx} of ${enabledLinks.length}`
                  );
                  return;
                }
                if (
                  e.altKey &&
                  e.key === "ArrowRight" &&
                  idx < enabledLinks.length - 1
                ) {
                  e.preventDefault();
                  e.stopPropagation();
                  reorderEnabledLinks(idx, idx + 1);
                  setLiveAnnouncement(
                    `Moved ${link.label} to position ${idx + 2} of ${enabledLinks.length}`
                  );
                  return;
                }
                if (e.key === " ") {
                  e.preventDefault();
                  e.stopPropagation();
                  if (isKbPicked) {
                    setKbPickedId(null);
                    setLiveAnnouncement(`Dropped ${link.label}`);
                  } else {
                    setKbPickedId({ id: link.id, originalIndex: idx });
                    setLiveAnnouncement(
                      `Picked up ${link.label}. Use Left and Right arrows to move, Space to drop, Escape to cancel.`
                    );
                  }
                  return;
                }
                if (isKbPicked) {
                  if (e.key === "Escape") {
                    e.preventDefault();
                    e.stopPropagation();
                    reorderEnabledLinks(idx, kbPickedId.originalIndex);
                    setKbPickedId(null);
                    setLiveAnnouncement("Cancelled move");
                  } else if (e.key === "ArrowLeft" && idx > 0) {
                    e.preventDefault();
                    e.stopPropagation();
                    reorderEnabledLinks(idx, idx - 1);
                    setLiveAnnouncement(
                      `Moved ${link.label} to position ${idx} of ${enabledLinks.length}`
                    );
                  } else if (
                    e.key === "ArrowRight" &&
                    idx < enabledLinks.length - 1
                  ) {
                    e.preventDefault();
                    e.stopPropagation();
                    reorderEnabledLinks(idx, idx + 1);
                    setLiveAnnouncement(
                      `Moved ${link.label} to position ${idx + 2} of ${enabledLinks.length}`
                    );
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
                alt={link.label}
                draggable={false}
                className="pointer-events-none h-7 w-auto transition-opacity duration-150 hover:opacity-85"
              />
            </a>

            <button
              type="button"
              data-remove-link="true"
              title="Remove"
              aria-label={`Remove ${link.label}`}
              onClick={(e) => {
                e.stopPropagation();
                removeLink(link.id);
              }}
              className="absolute -top-2 -right-2 flex size-6 cursor-pointer items-center justify-center rounded-full bg-[var(--surface)] text-[var(--text)] opacity-0 shadow-[var(--shadow-float)] transition-opacity duration-150 group-hover/link:opacity-100 group-focus-within/link:opacity-100 hover:text-[var(--danger)]"
            >
              <X className="size-3" />
            </button>
          </div>
        );
      })}

      {/* Add link popover */}
      <Popover open={addOpen} onOpenChange={setAddOpen}>
        <PopoverTrigger
          render={
            <button
              type="button"
              onClick={(e) => e.stopPropagation()}
              aria-label="Add link"
              className="inline-flex h-7 cursor-pointer items-center gap-1 rounded-[6px] bg-[var(--gh-surface)] px-2 text-[11px] font-medium text-[var(--gh-muted)] transition-colors hover:text-[var(--gh-text)]"
            />
          }
        >
          <Plus className="size-3.5" />
          <span>Add link</span>
        </PopoverTrigger>
        <PopoverContent
          data-app="studio"
          onClick={(e) => e.stopPropagation()}
          className="w-72 rounded-[12px] border-0 bg-[var(--surface)] p-3 text-[var(--text)] ring-0 shadow-[var(--shadow-float)]"
        >
          <div className="mb-2 text-[12px] font-semibold text-[var(--text)]">
            Add platform link
          </div>
          <div className="grid grid-cols-2 gap-1.5">
            {CTA_QUICK_TEMPLATES.map((tpl) => (
              <button
                key={tpl.label}
                type="button"
                onClick={() => {
                  onUpdateLinks([
                    ...readmeConfig.actionLinks,
                    {
                      id: `link-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
                      label: tpl.label,
                      valueText: tpl.valueText,
                      url: tpl.url,
                      color: tpl.color,
                      logo: tpl.logo,
                      enabled: true,
                    },
                  ]);
                  setAddOpen(false);
                }}
                className="flex cursor-pointer items-center gap-2 rounded-[6px] bg-[var(--surface-2)] px-2.5 py-1.5 text-left text-[12px] font-medium text-[var(--text)] hover:bg-[var(--surface-3)]"
              >
                <span
                  className="size-2 shrink-0 rounded-full"
                  style={{ backgroundColor: `#${tpl.color}` }}
                />
                <span className="truncate">{tpl.label}</span>
              </button>
            ))}
          </div>
        </PopoverContent>
      </Popover>

      {/* Floating ghost */}
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
