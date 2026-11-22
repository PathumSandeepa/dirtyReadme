"use client";

import {
  AlignCenter,
  AlignLeft,
  AlignRight,
  Calendar,
  Check,
  History,
  RotateCcw,
} from "lucide-react";
import { cn } from "cn";
import {
  CAMERA_VIEWS,
  CREATURE_CATALOG,
  LANGUAGE_COUNTS,
  STAGE_DEFINITIONS,
  type BackgroundMode,
  type CameraView,
  type ContributionWindow,
  type CreatureConfig,
  type CreatureId,
  type HudAlign,
  type HudFontFamily,
  type HudFontWeight,
  type LanguageCount,
  type WaterMode,
} from "@/domain/creature/entities";
import {
  derivePalette,
  getCreatureMeta,
  getEvolutionStage,
  getLuminance,
  getSpriteAssetPath,
  getVisibleLanguages,
  resolveHudFontColor,
  resolveWaterMode,
} from "@/domain/creature/services";
import type { GitHubProfileSnapshot } from "@/infrastructure/github/githubClient";
import { StudioButton } from "../studio/ui/StudioButton";
import {
  StudioChipColorPopover,
  StudioColorSwatch,
} from "../studio/ui/StudioColorSwatch";
import { StudioField, StudioInput } from "../studio/ui/StudioInput";
import { StudioSectionCard } from "../studio/ui/StudioSectionCard";
import { StudioSegmentedControl } from "../studio/ui/StudioSegmentedControl";
import { StudioSliderField } from "../studio/ui/StudioSliderField";
import { StudioSwitchRow } from "../studio/ui/StudioSwitchRow";

const SPEED_PRESETS = [
  { label: "Slow", value: "0.6", numeric: 0.6 },
  { label: "Normal", value: "1.0", numeric: 1.0 },
  { label: "Fast", value: "1.8", numeric: 1.8 },
] as const;

const HUD_FONT_FAMILIES: { value: HudFontFamily; label: string }[] = [
  { value: "pixel", label: "Pixel" },
  { value: "mono", label: "Mono" },
  { value: "sans", label: "Sans" },
  { value: "serif", label: "Serif" },
];

const HUD_FONT_WEIGHTS: { value: HudFontWeight; label: string }[] = [
  { value: "normal", label: "Normal" },
  { value: "semibold", label: "Medium" },
  { value: "bold", label: "Bold" },
];

const STAGE_SENTENCE_LABELS: Record<number, string> = {
  1: "Calf",
  2: "Young",
  3: "Sub-adult",
  4: "Mature",
  5: "Elder",
};

interface CreatureStepPanelProps {
  config: CreatureConfig;
  customBgHex: string;
  snapshot: GitHubProfileSnapshot | null;
  onSelectCreature: (creature: CreatureId) => void;
  onSelectView: (view: CameraView) => void;
  onSelectWindow: (windowMode: ContributionWindow) => void;
  onApplyOriginalColors: () => void;
  onApplyAutoLanguageColors: () => void;
  onSetLanguageCount: (count: LanguageCount) => void;
  onUpdateLanguageColor: (index: number, hex: string) => void;
  onUpdateLanguageName: (index: number, name: string) => void;
  onResetLanguageColors: () => void;
  onSetWaterMode: (mode: WaterMode) => void;
  onSetBackgroundMode: (mode: BackgroundMode) => void;
  onUpdateCustomBg: (hex: string) => void;
  onUpdateConfig: (updater: (prev: CreatureConfig) => CreatureConfig) => void;
}

export function CreatureStepPanel({
  config,
  customBgHex,
  snapshot,
  onSelectCreature,
  onSelectView,
  onSelectWindow,
  onApplyOriginalColors,
  onApplyAutoLanguageColors,
  onSetLanguageCount,
  onUpdateLanguageColor,
  onUpdateLanguageName,
  onResetLanguageColors,
  onSetWaterMode,
  onSetBackgroundMode,
  onUpdateCustomBg,
  onUpdateConfig,
}: CreatureStepPanelProps) {
  const meta = getCreatureMeta(config.creature);
  const evolution = getEvolutionStage(config.commits);
  const nextStageDef = STAGE_DEFINITIONS.find(
    (s) => s.stage === evolution.stage + 1
  );
  const visibleLanguages = getVisibleLanguages(config);
  const waterMode = resolveWaterMode(config);
  const isOriginalMode = config.colorMode === "canonical";

  const derived = derivePalette(config);
  const defaultContrastHudColor =
    waterMode !== "water" &&
    config.backgroundMode === "custom" &&
    getLuminance(derived.background) > 0.55
      ? "#0F172A"
      : "#D8F3FF";
  const currentHudColor = resolveHudFontColor(config);

  const commitsCount = Math.max(0, Math.floor(config.commits || 0));
  const commitsText = commitsCount.toLocaleString("en-US");
  const activeSpeedPreset =
    SPEED_PRESETS.find(
      (p) => Math.abs(config.animationSpeed - p.numeric) < 0.08
    )?.value ?? "custom";

  const hudSampleTitle = config.customTitle.trim()
    ? config.customTitle.trim().toUpperCase()
    : `${evolution.rank} ${meta.name.toUpperCase()}`;

  const hudSampleFontCss =
    config.hudFontFamily === "pixel" || config.hudFontFamily === "mono"
      ? "var(--studio-font-mono)"
      : config.hudFontFamily === "serif"
        ? 'Georgia, "Times New Roman", serif'
        : "var(--studio-font-sans)";

  const hudSampleWeight =
    config.hudFontWeight === "normal"
      ? 400
      : config.hudFontWeight === "semibold"
        ? 600
        : 700;

  return (
    <div className="flex flex-col gap-6">
      {/* 1. Creature */}
      <StudioSectionCard
        number={1}
        title="Creature"
        description="Choose an animated marine creature and camera angle."
      >
        <div className="grid gap-3 sm:grid-cols-2">
          {CREATURE_CATALOG.map((item) => {
            const selected = config.creature === item.id;
            const thumbPath = getSpriteAssetPath(
              item.id === "jellyfish" ? "jellyfish" : "tulkun-side"
            );
            return (
              <button
                key={item.id}
                type="button"
                aria-pressed={selected}
                onClick={() => onSelectCreature(item.id)}
                className={cn(
                  "flex cursor-pointer flex-col gap-3 rounded-[8px] border p-3.5 text-left transition-[color,background-color,border-color] duration-150",
                  selected
                    ? "border-[var(--accent)] bg-[var(--accent-soft)]"
                    : "border-[var(--border)] bg-[var(--surface)] hover:border-[var(--border-strong)] hover:bg-[var(--surface-2)]"
                )}
              >
                <div className="flex h-20 items-center justify-center overflow-hidden rounded-[6px] border border-[var(--border)] bg-[#0d1117] px-3 py-2">
                  <img
                    src={thumbPath}
                    alt={item.name}
                    style={{ imageRendering: "pixelated" }}
                    className="max-h-full w-auto object-contain"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[14px] font-semibold text-[var(--text)]">
                      {item.name}
                    </span>
                    {selected && (
                      <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-[var(--accent)] text-[var(--on-accent)]">
                        <Check className="size-3 stroke-[2.5]" />
                      </span>
                    )}
                  </div>
                  <span className="text-[13px] font-medium text-[var(--text-muted)]">
                    {item.subtitle}
                  </span>
                  <p className="mt-0.5 line-clamp-2 text-[13px] leading-5 text-[var(--text-muted)]">
                    {item.description}
                  </p>
                </div>
              </button>
            );
          })}
        </div>

        <StudioField
          label="Camera perspective"
          helper={
            meta.supportsViewSelection
              ? undefined
              : "Pelagic side view applies to Pixel Jellyfish."
          }
        >
          <StudioSegmentedControl<CameraView>
            ariaLabel="Camera perspective"
            value={meta.supportsViewSelection ? config.view : "side"}
            onChange={onSelectView}
            options={CAMERA_VIEWS.map((v) => ({
              value: v.id,
              label: v.id === "side" ? "Side view" : "Top view",
              disabled: v.id === "top" && !meta.supportsViewSelection,
            }))}
          />
        </StudioField>
      </StudioSectionCard>

      {/* 2. Colors */}
      <StudioSectionCard
        number={2}
        title="Colors"
        description="Keep canonical creature armor colors or tint from your top languages."
      >
        <StudioField label="Creature color mode">
          <StudioSegmentedControl<"canonical" | "languages">
            ariaLabel="Creature color mode"
            value={isOriginalMode ? "canonical" : "languages"}
            onChange={(mode) => {
              if (mode === "canonical") onApplyOriginalColors();
              else onApplyAutoLanguageColors();
            }}
            options={[
              { value: "canonical", label: "Original colors" },
              { value: "languages", label: "Auto (from languages)" },
            ]}
          />
        </StudioField>

        <StudioField
          label="Stats languages"
          trailing={
            !isOriginalMode ? (
              <StudioButton
                variant="ghost"
                size="sm"
                onClick={onResetLanguageColors}
              >
                <RotateCcw />
                <span>Reset colors</span>
              </StudioButton>
            ) : null
          }
          helper={
            isOriginalMode
              ? "Original palette maps your top languages automatically. Switch to Auto to edit colors."
              : "Click any language chip to edit its label or color."
          }
        >
          <div className="flex flex-col gap-3">
            <StudioSegmentedControl<`${LanguageCount}`>
              ariaLabel="Stats languages count"
              value={`${config.languageCount}` as `${LanguageCount}`}
              onChange={(val) =>
                onSetLanguageCount(Number(val) as LanguageCount)
              }
              options={LANGUAGE_COUNTS.map((count) => ({
                value: `${count}` as `${LanguageCount}`,
                label: `${count}`,
              }))}
            />

            <div className="flex flex-wrap gap-2">
              {visibleLanguages.map((lang, idx) =>
                isOriginalMode ? (
                  <div
                    key={`${idx}-${lang.name}`}
                    className="inline-flex min-h-[36px] items-center gap-2 rounded-[6px] border border-[var(--border)] bg-[var(--surface-2)] px-2.5 py-1.5 text-[13px] font-medium text-[var(--text)]"
                  >
                    <span
                      className="size-3 shrink-0 rounded-full border border-black/15"
                      style={{ backgroundColor: lang.color }}
                    />
                    <span>{lang.name || `Language ${idx + 1}`}</span>
                  </div>
                ) : (
                  <StudioChipColorPopover
                    key={`${idx}-editable`}
                    index={idx}
                    name={lang.name}
                    color={lang.color}
                    onChangeName={(nextName) =>
                      onUpdateLanguageName(idx, nextName)
                    }
                    onChangeColor={(nextHex) =>
                      onUpdateLanguageColor(idx, nextHex)
                    }
                  />
                )
              )}
            </div>
          </div>
        </StudioField>
      </StudioSectionCard>

      {/* 3. Water and background */}
      <StudioSectionCard
        number={3}
        title="Water and background"
        description="Control ambient underwater atmosphere and canvas fill."
      >
        <StudioField
          label="Water"
          helper={
            waterMode === "water"
              ? "Animated ocean glow, light rays, rising bubbles, and wake motes."
              : waterMode === "no-water"
                ? "Removes underwater glow and light rays while keeping subtle wake motes."
                : "Clean creature canvas with all water rays, glow, and particles removed."
          }
        >
          <StudioSegmentedControl<WaterMode>
            ariaLabel="Water environment"
            value={waterMode}
            onChange={onSetWaterMode}
            options={[
              { value: "water", label: "In water" },
              { value: "no-water", label: "No water" },
              { value: "clear", label: "Clear" },
            ]}
          />
        </StudioField>

        <StudioField label="Canvas background">
          <div className="flex flex-col gap-3">
            <StudioSegmentedControl<BackgroundMode>
              ariaLabel="Canvas background"
              value={config.backgroundMode}
              onChange={onSetBackgroundMode}
              options={[
                { value: "transparent", label: "Transparent" },
                { value: "custom", label: "Custom color" },
              ]}
            />

            {config.backgroundMode === "custom" && (
              <StudioField label="Background color">
                <StudioColorSwatch
                  label="Background color"
                  value={customBgHex}
                  onChange={onUpdateCustomBg}
                />
              </StudioField>
            )}
          </div>
        </StudioField>
      </StudioSectionCard>

      {/* 4. Evolution stage */}
      <StudioSectionCard
        number={4}
        title="Evolution stage"
        description="Creature size and wake intensity scale with your GitHub commit count."
      >
        <div className="flex flex-col gap-3">
          <div className="grid grid-cols-5 gap-1.5">
            {STAGE_DEFINITIONS.map((stageDef) => {
              const isCurrent = stageDef.stage === evolution.stage;
              const isPassed = stageDef.stage < evolution.stage;
              const label =
                STAGE_SENTENCE_LABELS[stageDef.stage] ?? stageDef.rank;

              return (
                <div
                  key={stageDef.stage}
                  aria-current={isCurrent ? "step" : undefined}
                  className={cn(
                    "flex flex-col items-center gap-1 rounded-[6px] border px-1.5 py-2 text-center",
                    isCurrent
                      ? "border-[var(--warm)] bg-[var(--warm-soft)] text-[var(--warm)]"
                      : isPassed
                        ? "border-[var(--border)] bg-[var(--surface-2)] text-[var(--text)]"
                        : "border-[var(--border)] bg-[var(--surface)] text-[var(--text-faint)]"
                  )}
                >
                  <span className="studio-mono text-[11px] font-semibold">
                    S{stageDef.stage}
                  </span>
                  <span className="truncate text-[12px] font-medium">
                    {label}
                  </span>
                  <span className="hidden text-[11px] opacity-80 sm:inline">
                    {stageDef.minCommits.toLocaleString("en-US")}+
                  </span>
                </div>
              );
            })}
          </div>

          <p className="text-[13px] leading-5 text-[var(--text-muted)]">
            <span className="font-semibold text-[var(--warm)]">
              {commitsText} commits.
            </span>{" "}
            {nextStageDef
              ? `${Math.max(0, nextStageDef.minCommits - commitsCount).toLocaleString("en-US")} more to reach Stage ${nextStageDef.stage} (${STAGE_SENTENCE_LABELS[nextStageDef.stage] ?? nextStageDef.rank}).`
              : "Stage 5 (Elder) maximum tier reached."}
          </p>
        </div>

        <StudioField label="Commit count source">
          <StudioSegmentedControl<ContributionWindow>
            ariaLabel="Commit count source"
            value={config.windowMode}
            onChange={onSelectWindow}
            options={[
              {
                value: "annual",
                label: snapshot
                  ? `Current year (${snapshot.annualCommits.toLocaleString("en-US")})`
                  : "Current year",
                icon: <Calendar />,
              },
              {
                value: "all-time",
                label: snapshot
                  ? `All time (${snapshot.allTimeCommits.toLocaleString("en-US")})`
                  : "All time",
                icon: <History />,
              },
            ]}
          />
        </StudioField>
      </StudioSectionCard>

      {/* 5. Animation */}
      <StudioSectionCard
        number={5}
        title="Animation"
        description="Adjust swimming cadence for the live canvas and WebP/GIF exports."
      >
        <StudioSliderField
          label="Swimming speed"
          value={config.animationSpeed}
          min={0.4}
          max={2.5}
          step={0.1}
          unit="x"
          formatValue={(v) => v.toFixed(1)}
          onChange={(next) =>
            onUpdateConfig((prev) => ({ ...prev, animationSpeed: next }))
          }
          presetSlot={
            <StudioSegmentedControl<string>
              ariaLabel="Swimming speed preset"
              size="sm"
              value={activeSpeedPreset}
              onChange={(val) => {
                const preset = SPEED_PRESETS.find((p) => p.value === val);
                if (preset) {
                  onUpdateConfig((prev) => ({
                    ...prev,
                    animationSpeed: preset.numeric,
                  }));
                }
              }}
              options={SPEED_PRESETS.map((p) => ({
                value: p.value,
                label: p.label,
              }))}
            />
          }
        />
      </StudioSectionCard>

      {/* 6. Stats overlay (HUD) */}
      <StudioSectionCard
        number={6}
        title="Stats overlay (HUD)"
        description="Display evolution rank, commits, and top languages along the bottom edge."
      >
        <StudioSwitchRow
          id="hud-toggle"
          checked={config.showHud}
          onCheckedChange={(checked) =>
            onUpdateConfig((prev) => ({ ...prev, showHud: checked }))
          }
          label="Show pixel HUD overlay"
          description="Stage, commits and top languages shown on the image."
        />

        {config.showHud && (
          <div className="flex flex-col gap-5 rounded-[6px] border border-[var(--border)] bg-[var(--surface-2)] p-4">
            <div className="flex flex-col gap-2">
              <span className="text-[13px] font-medium text-[var(--text-muted)]">
                Overlay style preview
              </span>
              <div
                className="rounded-[6px] border border-[var(--border)] px-3.5 py-3"
                style={{
                  backgroundColor:
                    config.backgroundMode === "custom"
                      ? derived.background
                      : "#0D1117",
                  textAlign: config.hudAlign,
                }}
              >
                <div
                  style={{
                    color: currentHudColor,
                    fontFamily: hudSampleFontCss,
                    fontWeight: hudSampleWeight,
                    fontSize: `${Math.min(18, Math.max(12, config.hudFontSize))}px`,
                    letterSpacing:
                      config.hudFontFamily === "pixel" ? "0.04em" : undefined,
                  }}
                >
                  STAGE {evolution.stage}: {hudSampleTitle}
                </div>
                <div
                  style={{
                    color: currentHudColor,
                    fontFamily: hudSampleFontCss,
                    fontWeight: hudSampleWeight,
                    fontSize: `${Math.max(11, Math.min(16, config.hudFontSize - 1))}px`,
                    opacity: 0.9,
                  }}
                >
                  CONTRIBUTIONS: {commitsText}
                </div>
              </div>
            </div>

            <StudioField label="Custom label" htmlFor="hud-title-input">
              <StudioInput
                id="hud-title-input"
                maxLength={32}
                placeholder={`${evolution.rank} ${meta.name.toUpperCase()}`}
                value={config.customTitle}
                onChange={(e) =>
                  onUpdateConfig((prev) => ({
                    ...prev,
                    customTitle: e.target.value,
                  }))
                }
              />
            </StudioField>

            <StudioField label="Position">
              <StudioSegmentedControl<HudAlign>
                ariaLabel="HUD position"
                value={config.hudAlign}
                onChange={(align) =>
                  onUpdateConfig((prev) => ({ ...prev, hudAlign: align }))
                }
                options={[
                  { value: "left", label: "Left", icon: <AlignLeft /> },
                  { value: "center", label: "Center", icon: <AlignCenter /> },
                  { value: "right", label: "Right", icon: <AlignRight /> },
                ]}
              />
            </StudioField>

            <StudioField label="Font family">
              <StudioSegmentedControl<HudFontFamily>
                ariaLabel="HUD font family"
                value={config.hudFontFamily}
                onChange={(family) =>
                  onUpdateConfig((prev) => ({
                    ...prev,
                    hudFontFamily: family,
                  }))
                }
                options={HUD_FONT_FAMILIES}
              />
            </StudioField>

            <StudioField label="Font weight">
              <StudioSegmentedControl<HudFontWeight>
                ariaLabel="HUD font weight"
                value={config.hudFontWeight}
                onChange={(weight) =>
                  onUpdateConfig((prev) => ({
                    ...prev,
                    hudFontWeight: weight,
                  }))
                }
                options={HUD_FONT_WEIGHTS}
              />
            </StudioField>

            <StudioSliderField
              label="Font size"
              value={config.hudFontSize}
              min={12}
              max={22}
              step={1}
              unit="px"
              onChange={(next) =>
                onUpdateConfig((prev) => ({ ...prev, hudFontSize: next }))
              }
            />

            <StudioField label="Font color">
              <div className="flex flex-wrap items-center gap-2">
                <StudioColorSwatch
                  label="HUD font color"
                  value={currentHudColor}
                  onChange={(hex) =>
                    onUpdateConfig((prev) => ({
                      ...prev,
                      hudFontColor: hex,
                    }))
                  }
                />
                <StudioButton
                  variant="secondary"
                  size="sm"
                  onClick={() =>
                    onUpdateConfig((prev) => ({
                      ...prev,
                      hudFontColor: defaultContrastHudColor,
                    }))
                  }
                >
                  <RotateCcw />
                  <span>Auto</span>
                </StudioButton>
              </div>
            </StudioField>
          </div>
        )}
      </StudioSectionCard>
    </div>
  );
}
