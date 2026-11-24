"use client";

import { ArrowRight, PanelRightClose, PanelRightOpen } from "lucide-react";
import { cn } from "cn";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { StudioButton } from "../../studio/ui/StudioButton";
import { StudioSegmentedControl } from "../../studio/ui/StudioSegmentedControl";
import { CUSTOMIZE_PARTS, type CustomizePartId } from "./customizeTypes";

export type RightSidebarTab = "part" | "format" | "page";

export function getNextPartId(current: CustomizePartId): CustomizePartId | null {
  const idx = CUSTOMIZE_PARTS.findIndex((p) => p.id === current);
  if (idx === -1 || idx >= CUSTOMIZE_PARTS.length - 1) return null;
  return CUSTOMIZE_PARTS[idx + 1].id;
}

export function getPartMeta(id: CustomizePartId) {
  return CUSTOMIZE_PARTS.find((p) => p.id === id) ?? CUSTOMIZE_PARTS[0];
}

interface RightSidebarContentProps {
  activeTab: RightSidebarTab;
  onTabChange: (tab: RightSidebarTab) => void;
  activePart: CustomizePartId;
  onAdvancePart: () => void;
  partContent: React.ReactNode;
  formatContent: React.ReactNode;
  pageContent: React.ReactNode;
}

export function RightSidebarContent({
  activeTab,
  onTabChange,
  activePart,
  onAdvancePart,
  partContent,
  formatContent,
  pageContent,
}: RightSidebarContentProps) {
  const meta = getPartMeta(activePart);

  return (
    <div className="flex h-full min-h-0 flex-col overflow-hidden rounded-[12px] bg-[var(--surface)]">
      <div className="shrink-0 p-6 pb-3">
        <StudioSegmentedControl<RightSidebarTab>
          ariaLabel="Settings panel tab"
          size="sm"
          value={activeTab}
          onChange={onTabChange}
          options={[
            { value: "part", label: "Part" },
            { value: "format", label: "Format" },
            { value: "page", label: "Page" },
          ]}
        />
      </div>

      {activeTab === "part" && (
        <div className="shrink-0 px-6 pt-2 pb-4">
          <h2 className="text-[16px] leading-6 font-semibold tracking-[-0.02em] text-[var(--text)]">
            {meta.label}
          </h2>
          <p className="mt-0.5 text-[12px] leading-5 text-[var(--text-2)]">
            {meta.description}
          </p>
        </div>
      )}

      <div className="min-h-0 flex-1 overflow-y-auto px-6 pb-6">
        {activeTab === "part" && partContent}
        {activeTab === "format" && formatContent}
        {activeTab === "page" && pageContent}
      </div>

      {activeTab === "part" && (
        <div className="shrink-0 bg-[var(--surface-2)] px-6 py-4">
          <StudioButton
            variant="primary"
            className="w-full justify-between"
            onClick={onAdvancePart}
          >
            <span>{meta.nextLabel}</span>
            <ArrowRight />
          </StudioButton>
        </div>
      )}
    </div>
  );
}

interface InspectorPanelProps extends RightSidebarContentProps {
  collapsed: boolean;
  onToggleCollapsed: () => void;
}

/** Collapsible 352px right sidebar on desktop viewports (1280px and wider, shortcut "]"). */
export function InspectorPanel({
  collapsed,
  onToggleCollapsed,
  ...rest
}: InspectorPanelProps) {
  return (
    <TooltipProvider delay={120}>
      <aside
        aria-label="Settings"
        className={cn(
          "hidden h-full shrink-0 flex-col gap-2.5 transition-[width] duration-150 min-[1280px]:flex",
          collapsed ? "w-[44px]" : "w-[352px]"
        )}
      >
        <div className="flex items-center justify-between gap-2 px-1">
          <Tooltip>
            <TooltipTrigger
              render={
                <button
                  type="button"
                  onClick={onToggleCollapsed}
                  aria-label={
                    collapsed ? "Expand right sidebar" : "Collapse right sidebar"
                  }
                  className="flex size-8 cursor-pointer items-center justify-center rounded-[8px] bg-[var(--surface)] text-[var(--text-2)] transition-colors duration-150 hover:bg-[var(--surface-2)] hover:text-[var(--text)]"
                />
              }
            >
              {collapsed ? (
                <PanelRightOpen className="size-4" />
              ) : (
                <PanelRightClose className="size-4" />
              )}
            </TooltipTrigger>
            <TooltipContent
              data-app="studio"
              className="border-0 bg-[var(--text)] text-[var(--bg)] shadow-[var(--shadow-float)]"
            >
              {collapsed ? "Expand settings (])" : "Collapse settings (])"}
            </TooltipContent>
          </Tooltip>
          {!collapsed && (
            <span className="text-[12px] font-semibold tracking-[-0.01em] text-[var(--text-2)]">
              Settings
            </span>
          )}
        </div>

        {!collapsed && (
          <div className="min-h-0 flex-1">
            <RightSidebarContent {...rest} />
          </div>
        )}
      </aside>
    </TooltipProvider>
  );
}
