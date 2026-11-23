"use client";

import { useMemo, useState } from "react";
import { ArrowLeft, Search } from "lucide-react";
import { cn } from "cn";
import type { CreatureConfig } from "@/domain/creature/entities";
import {
  PROFILE_EDITOR_TEMPLATES,
  type EditorTemplateItem,
} from "@/domain/profile/markdownRichText";
import { resolveDynamicTokens } from "@/domain/profile/readmeService";
import { StudioButton } from "../../studio/ui/StudioButton";
import { StudioDialog } from "../../studio/ui/StudioDialog";
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

export function TemplateGalleryDialog({
  open,
  onOpenChange,
  creatureConfig,
  githubTheme,
  currentMarkdown,
  onApplyTemplate,
}: TemplateGalleryDialogProps) {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [pendingTemplate, setPendingTemplate] =
    useState<EditorTemplateItem | null>(null);

  const categories = useMemo(() => {
    const seen = new Set<string>();
    for (const tpl of PROFILE_EDITOR_TEMPLATES) {
      seen.add(tpl.category);
    }
    return ["All", ...Array.from(seen)];
  }, []);

  const filteredTemplates = useMemo(() => {
    const q = search.trim().toLowerCase();
    return PROFILE_EDITOR_TEMPLATES.filter((tpl) => {
      const catOk = category === "All" || tpl.category === category;
      const queryOk =
        !q ||
        tpl.name.toLowerCase().includes(q) ||
        tpl.description.toLowerCase().includes(q) ||
        tpl.category.toLowerCase().includes(q);
      return catOk && queryOk;
    });
  }, [search, category]);

  const handleClose = (nextOpen: boolean) => {
    if (!nextOpen) {
      setPendingTemplate(null);
    }
    onOpenChange(nextOpen);
  };

  const handleSelectTemplateCard = (tpl: EditorTemplateItem) => {
    if (!currentMarkdown.trim()) {
      onApplyTemplate(tpl.markdown, "replace");
      handleClose(false);
      return;
    }
    setPendingTemplate(tpl);
  };

  return (
    <StudioDialog
      open={open}
      onOpenChange={handleClose}
      title={
        pendingTemplate
          ? `Apply ${pendingTemplate.name}`
          : `Starter README templates (${PROFILE_EDITOR_TEMPLATES.length})`
      }
      description={
        pendingTemplate
          ? "Your README already has content. Choose whether to replace it or add this template below."
          : "Pick a template to populate your profile text. Dynamic tokens adapt automatically to your GitHub stats."
      }
      maxWidthClass={pendingTemplate ? "sm:max-w-lg" : "sm:max-w-5xl"}
      footer={
        pendingTemplate ? (
          <div className="flex w-full flex-wrap items-center justify-between gap-2">
            <StudioButton
              variant="ghost"
              onClick={() => setPendingTemplate(null)}
            >
              <ArrowLeft />
              <span>Back to templates</span>
            </StudioButton>

            <div className="flex flex-wrap items-center gap-2">
              <StudioButton
                variant="secondary"
                onClick={() => {
                  onApplyTemplate(pendingTemplate.markdown, "append");
                  handleClose(false);
                }}
              >
                Insert below
              </StudioButton>
              <StudioButton
                variant="primary"
                onClick={() => {
                  onApplyTemplate(pendingTemplate.markdown, "replace");
                  handleClose(false);
                }}
              >
                Replace everything
              </StudioButton>
            </div>
          </div>
        ) : (
          <StudioButton variant="secondary" onClick={() => handleClose(false)}>
            Close
          </StudioButton>
        )
      }
    >
      {pendingTemplate ? (
        <div className="flex flex-col gap-3">
          <div className="text-[13px] text-[var(--text-2)]">
            {pendingTemplate.description}
          </div>
          <div
            data-gh-theme={githubTheme}
            className="max-h-60 overflow-hidden rounded-[8px] border border-[var(--gh-border)] bg-[var(--gh-bg)] p-4"
          >
            <div style={{ width: "848px", zoom: 0.5, pointerEvents: "none" }}>
              <AdvancedMarkdownPreview
                markdown={resolveDynamicTokens(
                  pendingTemplate.markdown,
                  creatureConfig
                )}
                isDark={githubTheme === "dark"}
              />
            </div>
          </div>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {/* Search & Category Chips */}
          <div className="flex flex-col gap-3">
            <div className="relative">
              <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-[var(--text-2)]" />
              <StudioInput
                aria-label="Search templates"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search templates by role, stack or topic"
                className="pl-9"
              />
            </div>

            <div className="flex flex-wrap gap-1.5">
              {categories.map((cat) => {
                const active = category === cat;
                return (
                  <button
                    key={cat}
                    type="button"
                    aria-pressed={active}
                    onClick={() => setCategory(cat)}
                    className={cn(
                      "h-8 cursor-pointer rounded-[8px] px-3 text-[13px] font-medium transition-colors duration-150",
                      active
                        ? "bg-[var(--surface-3)] text-[var(--text)]"
                        : "bg-[var(--surface-2)] text-[var(--text-2)] hover:text-[var(--text)]"
                    )}
                  >
                    {cat}
                  </button>
                );
              })}
            </div>
          </div>

          {filteredTemplates.length === 0 ? (
            <div className="rounded-[12px] bg-[var(--surface-2)] py-10 text-center text-[14px] text-[var(--text-2)]">
              No templates matched your search.
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {filteredTemplates.map((tpl) => {
                const resolvedPreview = resolveDynamicTokens(
                  tpl.markdown,
                  creatureConfig
                );
                return (
                  <button
                    key={tpl.id}
                    type="button"
                    onClick={() => handleSelectTemplateCard(tpl)}
                    className="group flex cursor-pointer flex-col overflow-hidden rounded-[12px] bg-[var(--surface-2)] p-3 text-left transition-[transform,background-color] duration-150 hover:-translate-y-0.5 hover:bg-[var(--surface-3)]"
                  >
                    <div
                      data-gh-theme={githubTheme}
                      className="h-32 w-full overflow-hidden rounded-[8px] border border-[var(--gh-border)] bg-[var(--gh-bg)] p-2.5"
                    >
                      <div
                        style={{
                          width: "848px",
                          zoom: 0.34,
                          pointerEvents: "none",
                        }}
                      >
                        <AdvancedMarkdownPreview
                          markdown={resolvedPreview}
                          isDark={githubTheme === "dark"}
                        />
                      </div>
                    </div>

                    <div className="mt-3 flex flex-col gap-1">
                      <div className="flex items-center justify-between gap-2">
                        <span className="truncate text-[14px] font-semibold text-[var(--text)]">
                          {tpl.name}
                        </span>
                        <span className="shrink-0 rounded-[6px] bg-[var(--surface)] px-2 py-0.5 text-[11px] font-medium text-[var(--text-2)]">
                          {tpl.category}
                        </span>
                      </div>
                      <p className="line-clamp-2 text-[12px] leading-4 text-[var(--text-2)]">
                        {tpl.description}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      )}
    </StudioDialog>
  );
}
