"use client";

import { ChevronDown, Eye, Moon, Sun } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Switch } from "@/components/ui/switch";
import type { ReadmeZoomMode } from "../../studio/ui/ScaledReadmeViewport";
import { StudioButton } from "../../studio/ui/StudioButton";
import { StudioSegmentedControl } from "../../studio/ui/StudioSegmentedControl";

export type CanvasWidthMode = "github-848" | "fit-pane";

interface ViewOptionsPopoverProps {
  githubTheme: "light" | "dark";
  onGithubThemeChange: (theme: "light" | "dark") => void;
  zoomMode: ReadmeZoomMode;
  onZoomModeChange: (zoom: ReadmeZoomMode) => void;
  zoomPct: number;
  widthMode: CanvasWidthMode;
  onWidthModeChange: (width: CanvasWidthMode) => void;
  showSidebar: boolean;
  onShowSidebarChange: (show: boolean) => void;
}

export function ViewOptionsPopover({
  githubTheme,
  onGithubThemeChange,
  zoomMode,
  onZoomModeChange,
  zoomPct,
  widthMode,
  onWidthModeChange,
  showSidebar,
  onShowSidebarChange,
}: ViewOptionsPopoverProps) {
  return (
    <Popover>
      <PopoverTrigger
        render={
          <StudioButton
            variant="secondary"
            size="sm"
            className="h-8 gap-1.5 px-2.5 text-[12px]"
            aria-label="View options"
          />
        }
      >
        <Eye className="size-3.5" />
        <span>View</span>
        <ChevronDown className="size-3 text-[var(--text-2)]" />
      </PopoverTrigger>

      <PopoverContent
        data-app="studio"
        align="end"
        className="w-72 rounded-[12px] border-0 bg-[var(--surface)] p-4 text-[var(--text)] ring-0 shadow-[var(--shadow-float)]"
      >
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <span className="text-[12px] font-medium text-[var(--text-2)]">
              Preview theme
            </span>
            <StudioSegmentedControl<"light" | "dark">
              ariaLabel="Preview theme"
              size="sm"
              value={githubTheme}
              onChange={onGithubThemeChange}
              options={[
                { value: "light", label: "Light", icon: <Sun /> },
                { value: "dark", label: "Dark", icon: <Moon /> },
              ]}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <span className="text-[12px] font-medium text-[var(--text-2)]">
              Zoom
            </span>
            <StudioSegmentedControl<ReadmeZoomMode>
              ariaLabel="Canvas zoom"
              size="sm"
              value={zoomMode}
              onChange={onZoomModeChange}
              options={[
                { value: "fit", label: `Fit ${zoomPct}%` },
                { value: "100", label: "100%" },
              ]}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <span className="text-[12px] font-medium text-[var(--text-2)]">
              Width
            </span>
            <StudioSegmentedControl<CanvasWidthMode>
              ariaLabel="Canvas width"
              size="sm"
              value={widthMode}
              onChange={onWidthModeChange}
              options={[
                { value: "github-848", label: "GitHub 848px" },
                { value: "fit-pane", label: "Fluid" },
              ]}
            />
          </div>

          <div className="flex items-center justify-between gap-3 rounded-[8px] bg-[var(--surface-2)] px-3 py-2">
            <label
              htmlFor="view-opt-profile-sidebar"
              className="cursor-pointer text-[13px] font-medium text-[var(--text)]"
            >
              Profile sidebar
            </label>
            <Switch
              id="view-opt-profile-sidebar"
              size="sm"
              checked={showSidebar}
              onCheckedChange={onShowSidebarChange}
            />
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
