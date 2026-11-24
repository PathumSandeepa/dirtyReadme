"use client";

import { memo, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Dialog as DialogPrimitive } from "@base-ui/react/dialog";
import { Search, X } from "lucide-react";
import { cn } from "cn";
import type { CreatureConfig } from "@/domain/creature/entities";
import {
  PROFILE_EDITOR_TEMPLATES,
  type EditorTemplateItem,
} from "@/domain/profile/markdownRichText";
import { resolveDynamicTokens } from "@/domain/profile/readmeService";
import { StudioButton } from "../../studio/ui/StudioButton";
import { StudioInput } from "../../studio/ui/StudioInput";
import { AdvancedMarkdownPreview } from "../MarkdownPreviewRenderer";

interface TemplateGalleryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  creatureConfig: CreatureConfig;
  githubTheme: "light" | "dark";
  currentMarkdown: string;
  onApplyTemplate: (markdown: string, mode: "replace" | "append") => void;
}

interface TemplateCardProps {
  template: EditorTemplateItem;
  resolvedMarkdown: string;
  githubTheme: "light" | "dark";
  isSelected: boolean;
  onSelect: (template: EditorTemplateItem) => void;
  onKeyDown: (event: React.KeyboardEvent<HTMLButtonElement>) => void;
  buttonRef: (node: HTMLButtonElement | null) => void;
}

/** Memoized template card that lazily mounts its scaled preview when visible. */
const TemplatePreviewCard = memo(function TemplatePreviewCard({
  template,
  resolvedMarkdown,
  githubTheme,
  isSelected,
  onSelect,
  onKeyDown,
  buttonRef,
}: TemplateCardProps) {
  const containerRef = useRef<HTMLButtonElement | null>(null);
  const [hasEnteredView, setHasEnteredView] = useState(
    () => typeof IntersectionObserver === "undefined"
  );

  const setRefs = useCallback(
    (node: HTMLButtonElement | null) => {
      containerRef.current = node;
      buttonRef(node);
    },
    [buttonRef]
  );

  useEffect(() => {
    const node = containerRef.current;
    if (!node || hasEnteredView) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          setHasEnteredView(true);
          observer.disconnect();
        }
      },
      { rootMargin: "160px" }
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [hasEnteredView]);

  return (
    <button
      ref={setRefs}
      type="button"
      onClick={() => onSelect(template)}
      onKeyDown={onKeyDown}
      aria-pressed={isSelected}
      className={cn(
        "group flex cursor-pointer flex-col overflow-hidden rounded-[12px] p-3 text-left transition-[transform,background-color] duration-150 outline-none hover:-translate-y-0.5 hover:bg-[var(--surface-3)]",
        isSelected ? "bg-[var(--surface-3)]" : "bg-[var(--surface-2)]"
      )}
    >
      <div
        data-gh-theme={githubTheme}
        className="h-32 w-full overflow-hidden rounded-[8px] bg-[var(--gh-bg)] p-2.5"
      >
        {hasEnteredView ? (
          <div
            style={{
              width: "848px",
              zoom: 0.34,
              pointerEvents: "none",
            }}
          >
            <AdvancedMarkdownPreview
              markdown={resolvedMarkdown}
              isDark={githubTheme === "dark"}
            />
          </div>
        ) : (
          <div className="flex h-full flex-col gap-2 p-2">
            <div className="h-3 w-1/2 rounded-[4px] bg-[var(--surface-2)] opacity-50" />
            <div className="h-2.5 w-4/5 rounded-[4px] bg-[var(--surface-2)] opacity-35" />
            <div className="h-2.5 w-2/3 rounded-[4px] bg-[var(--surface-2)] opacity-35" />
          </div>
        )}
      </div>

      <div className="mt-3 flex flex-col gap-1">
        <div className="flex items-center justify-between gap-2">
          <span className="truncate text-[13px] font-semibold text-[var(--text)]">
            {template.name}
          </span>
          <span className="shrink-0 rounded-[6px] bg-[var(--surface)] px-2 py-0.5 text-[11px] font-medium text-[var(--text-2)]">
            {template.category}
          </span>
        </div>
        <p className="line-clamp-2 text-[12px] leading-4 text-[var(--text-2)]">
          {template.description}
        </p>
      </div>
    </button>
  );
});

/** Large browseable template gallery with category counts, lazy previews, and right-side detail pane. */
export function TemplateGalleryDialog({
  open,
  onOpenChange,
  creatureConfig,
  githubTheme,
  currentMarkdown,
  onApplyTemplate,
}: TemplateGalleryDialogProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(null);
  const gridRef = useRef<HTMLDivElement | null>(null);
  const cardRefs = useRef<Array<HTMLButtonElement | null>>([]);

  const categoryEntries = useMemo(() => {
    const counts = new Map<string, number>();
    for (const template of PROFILE_EDITOR_TEMPLATES) {
      counts.set(template.category, (counts.get(template.category) ?? 0) + 1);
    }
    return [
      { name: "All", count: PROFILE_EDITOR_TEMPLATES.length },
      ...Array.from(counts.entries()).map(([name, count]) => ({ name, count })),
    ];
  }, []);

  const filteredTemplates = useMemo(() => {
    const normalized = searchQuery.trim().toLowerCase();
    return PROFILE_EDITOR_TEMPLATES.filter((template) => {
      if (selectedCategory !== "All" && template.category !== selectedCategory) {
        return false;
      }
      if (!normalized) return true;
      return (
        template.name.toLowerCase().includes(normalized) ||
        template.category.toLowerCase().includes(normalized) ||
        template.description.toLowerCase().includes(normalized)
      );
    });
  }, [searchQuery, selectedCategory]);

  const resolvedMap = useMemo(() => {
    const entries = new Map<string, string>();
    for (const template of PROFILE_EDITOR_TEMPLATES) {
      entries.set(
        template.id,
        resolveDynamicTokens(template.markdown, creatureConfig)
      );
    }
    return entries;
  }, [creatureConfig]);

  const selectedTemplate = useMemo(
    () =>
      PROFILE_EDITOR_TEMPLATES.find(
        (template) => template.id === selectedTemplateId
      ) ?? null,
    [selectedTemplateId]
  );

  const selectedResolvedMarkdown = selectedTemplate
    ? resolvedMap.get(selectedTemplate.id) ??
      resolveDynamicTokens(selectedTemplate.markdown, creatureConfig)
    : "";

  const isReadmeEmpty = currentMarkdown.trim().length === 0;

  const handleOpenChange = (nextOpen: boolean) => {
    if (!nextOpen) {
      setSelectedTemplateId(null);
      setSearchQuery("");
      setSelectedCategory("All");
    }
    onOpenChange(nextOpen);
  };

  const handleApply = (mode: "replace" | "append") => {
    if (!selectedTemplate) return;
    onApplyTemplate(selectedTemplate.markdown, mode);
    handleOpenChange(false);
  };

  const handleClearFilters = () => {
    setSearchQuery("");
    setSelectedCategory("All");
  };

  const getColumnCount = () => {
    const grid = gridRef.current;
    if (!grid) return 1;
    const style = window.getComputedStyle(grid);
    const cols = style.gridTemplateColumns.split(" ").filter(Boolean).length;
    return Math.max(1, cols);
  };

  const handleCardKeyDown = (
    index: number,
    template: EditorTemplateItem,
    event: React.KeyboardEvent<HTMLButtonElement>
  ) => {
    const total = filteredTemplates.length;
    if (total === 0) return;

    if (event.key === "Enter") {
      event.preventDefault();
      setSelectedTemplateId(template.id);
      return;
    }

    let nextIndex = -1;
    if (event.key === "ArrowRight") {
      nextIndex = Math.min(total - 1, index + 1);
    } else if (event.key === "ArrowLeft") {
      nextIndex = Math.max(0, index - 1);
    } else if (event.key === "ArrowDown") {
      nextIndex = Math.min(total - 1, index + getColumnCount());
    } else if (event.key === "ArrowUp") {
      nextIndex = Math.max(0, index - getColumnCount());
    }

    if (nextIndex >= 0 && nextIndex !== index) {
      event.preventDefault();
      const target = cardRefs.current[nextIndex];
      target?.focus();
    }
  };

  return (
    <DialogPrimitive.Root open={open} onOpenChange={handleOpenChange}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Backdrop className="fixed inset-0 z-50 bg-black/50 backdrop-blur-[2px] transition-opacity duration-150 data-open:animate-in data-open:fade-in-0 data-closed:animate-out data-closed:fade-out-0" />
        <DialogPrimitive.Popup
          data-app="studio"
          className="fixed top-1/2 left-1/2 z-50 flex h-[80vh] w-[min(1040px,94vw)] -translate-x-1/2 -translate-y-1/2 flex-col overflow-hidden rounded-[16px] bg-[var(--surface)] text-[var(--text)] shadow-[var(--shadow-float)] outline-none"
        >
          {/* Header */}
          <div className="flex flex-wrap items-center justify-between gap-4 bg-[var(--surface)] px-6 py-4">
            <div className="flex items-center gap-2.5">
              <DialogPrimitive.Title className="text-[18px] leading-6 font-semibold tracking-[-0.02em] text-[var(--text)]">
                Templates
              </DialogPrimitive.Title>
              <span className="rounded-[6px] bg-[var(--surface-2)] px-2 py-0.5 text-[12px] font-medium text-[var(--text-2)]">
                {PROFILE_EDITOR_TEMPLATES.length}
              </span>
            </div>

            <div className="flex flex-1 items-center justify-end gap-3">
              <div className="relative w-full max-w-[300px]">
                <Search className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-[var(--text-3)]" />
                <StudioInput
                  value={searchQuery}
                  onChange={(event) => setSearchQuery(event.target.value)}
                  placeholder="Search templates..."
                  aria-label="Search templates"
                  className="pl-9 pr-8"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery("")}
                    aria-label="Clear search"
                    className="absolute top-1/2 right-2 flex h-5 w-5 -translate-y-1/2 cursor-pointer items-center justify-center rounded-[4px] text-[var(--text-3)] transition-colors hover:bg-[var(--surface-3)] hover:text-[var(--text)]"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>

              <DialogPrimitive.Close
                render={
                  <StudioButton
                    variant="ghost"
                    size="icon"
                    aria-label="Close templates"
                  />
                }
              >
                <X />
              </DialogPrimitive.Close>
            </div>
          </div>

          {/* Body: Left categories + Center grid + Optional right preview pane */}
          <div className="flex min-h-0 flex-1 overflow-hidden">
            {/* Left Category Column */}
            <aside
              aria-label="Template categories"
              className="hidden w-[200px] shrink-0 overflow-y-auto bg-[var(--surface-2)] p-3 md:flex md:flex-col md:gap-1"
            >
              {categoryEntries.map((entry) => {
                const isActive = selectedCategory === entry.name;
                return (
                  <button
                    key={entry.name}
                    type="button"
                    onClick={() => setSelectedCategory(entry.name)}
                    className={cn(
                      "flex cursor-pointer items-center justify-between rounded-[8px] px-3 py-2 text-left text-[13px] font-medium transition-colors outline-none",
                      isActive
                        ? "bg-[var(--surface-3)] text-[var(--text)]"
                        : "text-[var(--text-2)] hover:bg-[var(--surface)] hover:text-[var(--text)]"
                    )}
                  >
                    <span className="truncate">{entry.name}</span>
                    <span className="ml-2 shrink-0 text-[12px] text-[var(--text-3)]">
                      {entry.count}
                    </span>
                  </button>
                );
              })}
            </aside>

            {/* Center Grid */}
            <div className="flex min-w-0 flex-1 flex-col overflow-y-auto p-5">
              {/* Mobile category strip */}
              <div className="mb-4 flex gap-1.5 overflow-x-auto pb-1 md:hidden">
                {categoryEntries.map((entry) => {
                  const isActive = selectedCategory === entry.name;
                  return (
                    <button
                      key={entry.name}
                      type="button"
                      onClick={() => setSelectedCategory(entry.name)}
                      className={cn(
                        "shrink-0 cursor-pointer rounded-[8px] px-3 py-1.5 text-[12px] font-medium transition-colors outline-none",
                        isActive
                          ? "bg-[var(--surface-3)] text-[var(--text)]"
                          : "bg-[var(--surface-2)] text-[var(--text-2)] hover:bg-[var(--surface-3)]"
                      )}
                    >
                      {entry.name} ({entry.count})
                    </button>
                  );
                })}
              </div>

              {filteredTemplates.length === 0 ? (
                <div className="flex flex-1 flex-col items-center justify-center gap-3 rounded-[12px] bg-[var(--surface-2)] p-8 text-center">
                  <p className="text-[14px] font-medium text-[var(--text)]">
                    No templates match your search.
                  </p>
                  <p className="text-[13px] text-[var(--text-2)]">
                    Try another keyword or clear your filters.
                  </p>
                  <StudioButton
                    variant="secondary"
                    size="sm"
                    onClick={handleClearFilters}
                  >
                    Clear search
                  </StudioButton>
                </div>
              ) : (
                <div
                  ref={gridRef}
                  className={cn(
                    "grid gap-4",
                    selectedTemplate
                      ? "grid-cols-1 sm:grid-cols-2"
                      : "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
                  )}
                >
                  {filteredTemplates.map((template, index) => (
                    <TemplatePreviewCard
                      key={template.id}
                      template={template}
                      resolvedMarkdown={
                        resolvedMap.get(template.id) ?? template.markdown
                      }
                      githubTheme={githubTheme}
                      isSelected={selectedTemplateId === template.id}
                      onSelect={(item) => setSelectedTemplateId(item.id)}
                      onKeyDown={(event) =>
                        handleCardKeyDown(index, template, event)
                      }
                      buttonRef={(node) => {
                        cardRefs.current[index] = node;
                      }}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Right Preview Pane */}
            {selectedTemplate && (
              <aside
                aria-label="Template preview"
                className="flex w-full shrink-0 flex-col bg-[var(--surface-2)] md:w-[380px]"
              >
                <div className="flex items-start justify-between gap-3 px-5 pt-5 pb-3">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="truncate text-[15px] font-semibold text-[var(--text)]">
                        {selectedTemplate.name}
                      </h3>
                      <span className="shrink-0 rounded-[6px] bg-[var(--surface)] px-2 py-0.5 text-[11px] font-medium text-[var(--text-2)]">
                        {selectedTemplate.category}
                      </span>
                    </div>
                    <p className="mt-1 text-[12px] leading-4 text-[var(--text-2)]">
                      {selectedTemplate.description}
                    </p>
                  </div>
                  <StudioButton
                    variant="ghost"
                    size="icon"
                    aria-label="Close preview"
                    onClick={() => setSelectedTemplateId(null)}
                    className="-mt-1 -mr-2 shrink-0"
                  >
                    <X />
                  </StudioButton>
                </div>

                <div className="min-h-0 flex-1 overflow-y-auto px-5 py-2">
                  <div
                    data-gh-theme={githubTheme}
                    className="rounded-[12px] bg-[var(--gh-bg)] p-4"
                  >
                    <AdvancedMarkdownPreview
                      markdown={selectedResolvedMarkdown}
                      isDark={githubTheme === "dark"}
                    />
                  </div>
                </div>

                <div className="flex flex-wrap items-center justify-end gap-2 bg-[var(--surface-2)] px-5 py-4">
                  {isReadmeEmpty ? (
                    <StudioButton
                      variant="primary"
                      size="sm"
                      onClick={() => handleApply("replace")}
                    >
                      Use this template
                    </StudioButton>
                  ) : (
                    <>
                      <StudioButton
                        variant="secondary"
                        size="sm"
                        onClick={() => handleApply("append")}
                      >
                        Insert below
                      </StudioButton>
                      <StudioButton
                        variant="primary"
                        size="sm"
                        onClick={() => handleApply("replace")}
                      >
                        Replace everything
                      </StudioButton>
                    </>
                  )}
                </div>
              </aside>
            )}
          </div>
        </DialogPrimitive.Popup>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}
