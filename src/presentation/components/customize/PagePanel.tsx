"use client";

import { Check } from "lucide-react";
import { cn } from "cn";
import {
  README_TEMPLATES,
  type ReadmeConfig,
  type ReadmeTemplateId,
} from "@/domain/profile/entities";
import { StudioField, StudioInput } from "../../studio/ui/StudioInput";
import { StudioSegmentedControl } from "../../studio/ui/StudioSegmentedControl";
import { StudioSliderField } from "../../studio/ui/StudioSliderField";
import { StudioSwitchRow } from "../../studio/ui/StudioSwitchRow";

interface PagePanelProps {
  readmeConfig: ReadmeConfig;
  onUpdateReadmeField: <K extends keyof ReadmeConfig>(
    key: K,
    value: ReadmeConfig[K]
  ) => void;
  onSelectTemplate: (templateId: ReadmeTemplateId) => void;
}

function StructurePresetWireframe({ id }: { id: ReadmeTemplateId }) {
  if (id === "minimal-header") {
    return (
      <div className="flex h-12 w-16 shrink-0 flex-col justify-center gap-1 rounded-[6px] bg-[var(--surface)] p-1.5">
        <div className="h-1.5 w-8 rounded-[2px] bg-[var(--text-3)]" />
        <div className="h-1 w-full rounded-[2px] bg-[var(--surface-3)]" />
        <div className="mt-0.5 h-3.5 w-full rounded-[2px] bg-[var(--ember-soft)]" />
      </div>
    );
  }
  if (id === "auto-evolve-block") {
    return (
      <div className="flex h-12 w-16 shrink-0 flex-col items-center justify-center gap-1 rounded-[6px] bg-[var(--surface)] p-1.5">
        <div className="h-1 w-10 rounded-[2px] bg-[var(--surface-3)]" />
        <div className="h-5 w-full rounded-[2px] bg-[var(--ember-soft)]" />
        <div className="h-1 w-10 rounded-[2px] bg-[var(--surface-3)]" />
      </div>
    );
  }
  if (id === "telemetry-stats") {
    return (
      <div className="flex h-12 w-16 shrink-0 flex-col justify-between rounded-[6px] bg-[var(--surface)] p-1.5">
        <div className="h-1 w-7 rounded-[2px] bg-[var(--text-3)]" />
        <div className="h-3 w-full rounded-[2px] bg-[var(--ember-soft)]" />
        <div className="grid grid-cols-2 gap-1">
          <div className="h-2 rounded-[2px] bg-[var(--surface-3)]" />
          <div className="h-2 rounded-[2px] bg-[var(--surface-3)]" />
        </div>
      </div>
    );
  }
  return (
    <div className="flex h-12 w-16 shrink-0 flex-col justify-between rounded-[6px] bg-[var(--surface)] p-1.5">
      <div className="flex flex-col gap-0.5">
        <div className="h-1 w-8 rounded-[2px] bg-[var(--text-3)]" />
        <div className="h-1 w-full rounded-[2px] bg-[var(--surface-3)]" />
      </div>
      <div className="flex gap-1">
        <div className="h-1 w-3 rounded-[2px] bg-[var(--text-3)]" />
        <div className="h-1 w-3 rounded-[2px] bg-[var(--text-3)]" />
      </div>
      <div className="h-3 w-full rounded-[2px] bg-[var(--ember-soft)]" />
    </div>
  );
}

export function PagePanel({
  readmeConfig,
  onUpdateReadmeField,
  onSelectTemplate,
}: PagePanelProps) {
  return (
    <div className="flex flex-col gap-5">
      {/* README structure preset */}
      <div className="flex flex-col gap-3 rounded-[12px] bg-[var(--surface-2)] p-3.5">
        <span className="text-[13px] font-medium text-[var(--text)]">
          README structure preset
        </span>
        <div className="flex flex-col gap-2">
          {README_TEMPLATES.map((tpl) => {
            const active = readmeConfig.templateId === tpl.id;
            return (
              <button
                key={tpl.id}
                type="button"
                aria-pressed={active}
                onClick={() => onSelectTemplate(tpl.id)}
                className={cn(
                  "flex cursor-pointer items-center gap-3 rounded-[8px] p-2.5 text-left transition-colors duration-150",
                  active
                    ? "bg-[var(--surface-3)]"
                    : "bg-[var(--surface)] hover:bg-[var(--surface-3)]"
                )}
              >
                <StructurePresetWireframe id={tpl.id} />
                <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                  <div className="flex items-center justify-between gap-2">
                    <span className="truncate text-[13px] font-semibold text-[var(--text)]">
                      {tpl.name}
                    </span>
                    {active && (
                      <Check className="size-3.5 shrink-0 text-[var(--tide)]" />
                    )}
                  </div>
                  <span className="line-clamp-2 text-[12px] leading-4 text-[var(--text-2)]">
                    {tpl.description}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Badges and links alignment */}
      <div className="flex flex-col gap-2 rounded-[12px] bg-[var(--surface-2)] p-3.5">
        <span className="text-[13px] font-medium text-[var(--text)]">
          Badges and links alignment
        </span>
        <StudioSegmentedControl<"left" | "center">
          ariaLabel="Badges and links alignment"
          size="sm"
          value={readmeConfig.align}
          onChange={(val) => onUpdateReadmeField("align", val)}
          options={[
            { value: "left", label: "Left" },
            { value: "center", label: "Center" },
          ]}
        />
      </div>

      {/* Creature banner width (shown only when a creature or custom banner is visible) */}
      {readmeConfig.showCreatureBanner !== false && (
        <div className="rounded-[12px] bg-[var(--surface-2)] p-3.5">
          <StudioSliderField
            label="Creature banner width"
            value={readmeConfig.imageWidth}
            min={320}
            max={920}
            step={20}
            unit="px"
            onChange={(next) => onUpdateReadmeField("imageWidth", next)}
            presetSlot={
              <StudioSegmentedControl<string>
                ariaLabel="Creature banner width presets"
                size="sm"
                value={
                  [480, 640, 760, 920].includes(readmeConfig.imageWidth)
                    ? String(readmeConfig.imageWidth)
                    : "custom"
                }
                onChange={(val) => {
                  const n = Number(val);
                  if (Number.isFinite(n)) {
                    onUpdateReadmeField("imageWidth", n);
                  }
                }}
                options={[
                  { value: "480", label: "480" },
                  { value: "640", label: "640" },
                  { value: "760", label: "760" },
                  { value: "920", label: "920" },
                ]}
              />
            }
          />
        </div>
      )}

      {/* Optional sections */}
      <div className="flex flex-col gap-2.5">
        <span className="text-[13px] font-medium text-[var(--text)]">
          Optional sections
        </span>

        {readmeConfig.bannerSource === "creature" && (
          <StudioSwitchRow
            id="page-opt-markers"
            checked={readmeConfig.includeMarkers}
            onCheckedChange={(checked) =>
              onUpdateReadmeField("includeMarkers", checked)
            }
            label="Auto update markers"
            description="Needed for scheduled daily updates in your README."
          />
        )}

        <StudioSwitchRow
          id="page-opt-stats"
          checked={readmeConfig.includeStatsTable}
          onCheckedChange={(checked) =>
            onUpdateReadmeField("includeStatsTable", checked)
          }
          label="Telemetry table"
          description="Adds a stats table with stage, commits and top languages."
        />

        {readmeConfig.includeStatsTable && (
          <StudioField
            label="Telemetry table title"
            htmlFor="page-telemetry-title"
          >
            <StudioInput
              id="page-telemetry-title"
              value={readmeConfig.statsTableTitle}
              onChange={(e) =>
                onUpdateReadmeField("statsTableTitle", e.target.value)
              }
            />
          </StudioField>
        )}
      </div>
    </div>
  );
}
