"use client";

import { useState } from "react";
import {
  Check,
  Copy,
  Maximize2,
  Minimize2,
  Redo2,
  Trash2,
  Undo2,
} from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import type { ReadmeZoomMode } from "../../studio/ui/ScaledReadmeViewport";
import { StudioButton } from "../../studio/ui/StudioButton";
import { StudioConfirmDialog } from "../../studio/ui/StudioDialog";
import { StudioSegmentedControl } from "../../studio/ui/StudioSegmentedControl";
import {
  ViewOptionsPopover,
  type CanvasWidthMode,
} from "./ViewOptionsPopover";

interface EditorTopBarProps {
  canUndo: boolean;
  canRedo: boolean;
  onUndo: () => void;
  onRedo: () => void;
  onClearAll: () => void;
  viewMode: "visual" | "markdown";
  onViewModeChange: (mode: "visual" | "markdown") => void;
  githubTheme: "light" | "dark";
  onGithubThemeChange: (theme: "light" | "dark") => void;
  zoomMode: ReadmeZoomMode;
  onZoomModeChange: (zoom: ReadmeZoomMode) => void;
  zoomPct: number;
  widthMode: CanvasWidthMode;
  onWidthModeChange: (width: CanvasWidthMode) => void;
  showSidebar: boolean;
  onShowSidebarChange: (show: boolean) => void;
  copied: boolean;
  onCopyMarkdown: () => void;
  fullscreen: boolean;
  onToggleFullscreen: () => void;
}

export function EditorTopBar({
  canUndo,
  canRedo,
  onUndo,
  onRedo,
  onClearAll,
  viewMode,
  onViewModeChange,
  githubTheme,
  onGithubThemeChange,
  zoomMode,
  onZoomModeChange,
  zoomPct,
  widthMode,
  onWidthModeChange,
  showSidebar,
  onShowSidebarChange,
  copied,
  onCopyMarkdown,
  fullscreen,
  onToggleFullscreen,
}: EditorTopBarProps) {
  const [confirmClearOpen, setConfirmClearOpen] = useState(false);

  return (
    <>
      <div className="flex h-11 shrink-0 items-center justify-between gap-2 bg-[var(--surface)] px-3">
        {/* Left: Undo, Redo, Clear all */}
        <div className="flex items-center gap-1">
          <Tooltip>
            <TooltipTrigger
              render={
                <StudioButton
                  variant="ghost"
                  size="icon"
                  disabled={!canUndo}
                  aria-label="Undo"
                  onClick={onUndo}
                  className="size-8"
                />
              }
            >
              <Undo2 />
            </TooltipTrigger>
            <TooltipContent
              data-app="studio"
              className="border-0 bg-[var(--text)] text-[var(--bg)] shadow-[var(--shadow-float)]"
            >
              Undo (Ctrl Z)
            </TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger
              render={
                <StudioButton
                  variant="ghost"
                  size="icon"
                  disabled={!canRedo}
                  aria-label="Redo"
                  onClick={onRedo}
                  className="size-8"
                />
              }
            >
              <Redo2 />
            </TooltipTrigger>
            <TooltipContent
              data-app="studio"
              className="border-0 bg-[var(--text)] text-[var(--bg)] shadow-[var(--shadow-float)]"
            >
              Redo (Ctrl Y)
            </TooltipContent>
          </Tooltip>

          <StudioButton
            variant="ghost"
            size="sm"
            onClick={() => setConfirmClearOpen(true)}
            className="ml-1.5 h-8 gap-1.5 px-2.5 text-[12px] text-[var(--text-2)] hover:text-[var(--text)]"
          >
            <Trash2 className="size-3.5" />
            <span className="hidden sm:inline">Clear all</span>
          </StudioButton>
        </div>

        {/* Center: Visual and Markdown toggle */}
        <div className="shrink-0">
          <StudioSegmentedControl<"visual" | "markdown">
            ariaLabel="Editor view mode"
            size="sm"
            layout="auto"
            value={viewMode}
            onChange={onViewModeChange}
            options={[
              { value: "visual", label: "Visual" },
              { value: "markdown", label: "Markdown" },
            ]}
          />
        </div>

        {/* Right: View popover, Copy markdown, Fullscreen */}
        <div className="flex items-center gap-1">
          <ViewOptionsPopover
            githubTheme={githubTheme}
            onGithubThemeChange={onGithubThemeChange}
            zoomMode={zoomMode}
            onZoomModeChange={onZoomModeChange}
            zoomPct={zoomPct}
            widthMode={widthMode}
            onWidthModeChange={onWidthModeChange}
            showSidebar={showSidebar}
            onShowSidebarChange={onShowSidebarChange}
          />

          <Tooltip>
            <TooltipTrigger
              render={
                <StudioButton
                  variant="ghost"
                  size="icon"
                  aria-label="Copy markdown"
                  onClick={onCopyMarkdown}
                  className="size-8"
                />
              }
            >
              {copied ? <Check className="text-[var(--tide)]" /> : <Copy />}
            </TooltipTrigger>
            <TooltipContent
              data-app="studio"
              className="border-0 bg-[var(--text)] text-[var(--bg)] shadow-[var(--shadow-float)]"
            >
              Copy markdown
            </TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger
              render={
                <StudioButton
                  variant="ghost"
                  size="icon"
                  active={fullscreen}
                  aria-label={fullscreen ? "Exit fullscreen" : "Fullscreen"}
                  onClick={onToggleFullscreen}
                  className="size-8"
                />
              }
            >
              {fullscreen ? <Minimize2 /> : <Maximize2 />}
            </TooltipTrigger>
            <TooltipContent
              data-app="studio"
              className="border-0 bg-[var(--text)] text-[var(--bg)] shadow-[var(--shadow-float)]"
            >
              {fullscreen ? "Exit fullscreen" : "Fullscreen"}
            </TooltipContent>
          </Tooltip>
        </div>
      </div>

      <StudioConfirmDialog
        open={confirmClearOpen}
        onOpenChange={setConfirmClearOpen}
        title="Clear all content?"
        description="This removes all text, badges and links. You can undo this."
        confirmLabel="Clear all"
        cancelLabel="Cancel"
        destructive
        onConfirm={onClearAll}
      />
    </>
  );
}
