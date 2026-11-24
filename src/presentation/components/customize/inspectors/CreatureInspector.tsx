"use client";

import {
  AlignCenter,
  AlignLeft,
  AlignRight,
  Calendar,
  Check,
  Copy,
  Download,
  History,
  Image as ImageIcon,
  RotateCcw,
  Trash2,
  Upload,
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
import {
  type BannerSource,
  type CustomImageMemoryAsset,
  type ReadmeConfig,
} from "@/domain/profile/entities";
import { formatFileBytes } from "@/infrastructure/browser/imageStudioEngine";
import type { GitHubProfileSnapshot } from "@/infrastructure/github/githubClient";
import { StudioButton } from "../../../studio/ui/StudioButton";
import {
  StudioChipColorPopover,
  StudioColorSwatch,
} from "../../../studio/ui/StudioColorSwatch";
import { StudioField, StudioInput } from "../../../studio/ui/StudioInput";
import { StudioSegmentedControl } from "../../../studio/ui/StudioSegmentedControl";
import { StudioSliderField } from "../../../studio/ui/StudioSliderField";
import { StudioSwitchRow } from "../../../studio/ui/StudioSwitchRow";

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

interface CreatureInspectorProps {
  creatureConfig: CreatureConfig;
  readmeConfig: ReadmeConfig;
  customBgHex: string;
  snapshot: GitHubProfileSnapshot | null;
  activeCustomBannerAsset?: CustomImageMemoryAsset | null;
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
  onUpdateCreatureConfig: (
    updater: (prev: CreatureConfig) => CreatureConfig
  ) => void;
  onUpdateReadmeField: <K extends keyof ReadmeConfig>(
    key: K,
    value: ReadmeConfig[K]
  ) => void;
  onOpenBannerImageStudio: (initialStep?: "input" | "crop") => void;
  onRemoveBannerImage: () => void;
  onUpdateBannerAlt: (alt: string) => void;
  onExportWebP?: () => void;
  onExportGif?: () => void;
  onCopyCreatureImage?: () => void;
  webpBusy?: boolean;
  gifBusy?: boolean;
  creatureCopied?: boolean;
}

export function CreatureInspector({
  creatureConfig,
  readmeConfig,
  customBgHex,
  snapshot,
  activeCustomBannerAsset,
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
  onUpdateCreatureConfig,
  onUpdateReadmeField,
  onOpenBannerImageStudio,
  onRemoveBannerImage,
  onUpdateBannerAlt,
  onExportWebP,
  onExportGif,
  onCopyCreatureImage,
  webpBusy = false,
  gifBusy = false,
  creatureCopied = false,
}: CreatureInspectorProps) {
  const meta = getCreatureMeta(creatureConfig.creature);
  const evolution = getEvolutionStage(creatureConfig.commits);
  const nextStageDef = STAGE_DEFINITIONS.find(
    (s) => s.stage === evolution.stage + 1
  );
  const visibleLanguages = getVisibleLanguages(creatureConfig);
  const waterMode = resolveWaterMode(creatureConfig);
  const isOriginalMode = creatureConfig.colorMode === "canonical";

  const derived = derivePalette(creatureConfig);
  const defaultContrastHudColor =
    waterMode !== "water" &&
      creatureConfig.backgroundMode === "custom" &&
      getLuminance(derived.background) > 0.55
      ? "#0F172A"
      : "#D8F3FF";
  const currentHudColor = resolveHudFontColor(creatureConfig);

  const commitsCount = Math.max(0, Math.floor(creatureConfig.commits || 0));
  const commitsText = commitsCount.toLocaleString("en-US");
  const activeSpeedPreset =
    SPEED_PRESETS.find(
      (p) => Math.abs(creatureConfig.animationSpeed - p.numeric) < 0.08
    )?.value ?? "custom";

  const hudSampleTitle = creatureConfig.customTitle.trim()
    ? creatureConfig.customTitle.trim().toUpperCase()
    : `${evolution.rank} ${meta.name.toUpperCase()}`;

  const hudSampleFontCss =
    creatureConfig.hudFontFamily === "pixel" ||
      creatureConfig.hudFontFamily === "mono"
      ? "var(--studio-font-mono)"
      : creatureConfig.hudFontFamily === "serif"
        ? 'Georgia, "Times New Roman", serif'
        : "var(--studio-font-sans)";

  const hudSampleWeight =
    creatureConfig.hudFontWeight === "normal"
      ? 400
      : creatureConfig.hudFontWeight === "semibold"
        ? 600
        : 700;

  return (
    <div className="flex flex-col gap-5">
      <StudioSwitchRow
        id="inspector-banner-visible"
        checked={readmeConfig.showCreatureBanner !== false}
        onCheckedChange={(checked) =>
          onUpdateReadmeField("showCreatureBanner", checked)
        }
        label="Show creature in README"
        description="Includes an optional animated creature or custom image at the bottom of your README."
      />

      {readmeConfig.showCreatureBanner !== false && (
        <>
          {/* Top Source Switch */}
          <StudioField label="Source">
            <StudioSegmentedControl<BannerSource>
              ariaLabel="Banner source"
              value={readmeConfig.bannerSource}
              onChange={(source) => {
                onUpdateReadmeField("bannerSource", source);
                if (source === "custom-image" && !activeCustomBannerAsset) {
                  onOpenBannerImageStudio("input");
                }
              }}
              options={[
                { value: "creature", label: "Built in creature" },
                { value: "custom-image", label: "Custom image" },
              ]}
            />
          </StudioField>

          {readmeConfig.bannerSource === "custom-image" ? (
            /* CUSTOM IMAGE BANNER CONTROLS */
            <div className="flex flex-col gap-5">
              <div className="flex flex-col gap-3 rounded-[12px] bg-[var(--surface-2)] p-3.5">
                {activeCustomBannerAsset ? (
                  <>
                    <div className="overflow-hidden rounded-[8px] bg-[#0D1117] p-2">
                      <img
                        src={activeCustomBannerAsset.previewUrl}
                        alt={activeCustomBannerAsset.alt}
                        className="mx-auto max-h-40 w-auto rounded-[4px] object-contain"
                      />
                    </div>
                    <div className="flex items-center justify-between gap-2 text-[12px] text-[var(--text-2)]">
                      <span className="studio-mono truncate">
                        {activeCustomBannerAsset.repoPath}
                      </span>
                      <span className="studio-mono shrink-0 tabular-nums">
                        {activeCustomBannerAsset.width} by{" "}
                        {activeCustomBannerAsset.height},{" "}
                        {formatFileBytes(activeCustomBannerAsset.webpSizeBytes)}
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      <StudioButton
                        variant="secondary"
                        size="sm"
                        onClick={() => onOpenBannerImageStudio("crop")}
                      >
                        Re-crop
                      </StudioButton>
                      <StudioButton
                        variant="secondary"
                        size="sm"
                        onClick={() => onOpenBannerImageStudio("input")}
                      >
                        Replace image
                      </StudioButton>
                      <StudioButton
                        variant="danger"
                        size="sm"
                        onClick={onRemoveBannerImage}
                      >
                        <Trash2 />
                        <span>Remove</span>
                      </StudioButton>
                    </div>
                  </>
                ) : (
                  <div className="flex flex-col items-center gap-3 py-4 text-center">
                    <div className="flex size-10 items-center justify-center rounded-[10px] bg-[var(--surface)] text-[var(--text)]">
                      <ImageIcon className="size-5" />
                    </div>
                    <div className="flex flex-col gap-0.5">
                      <span className="text-[14px] font-medium text-[var(--text)]">
                        Upload a custom WebP banner
                      </span>
                      <span className="text-[12px] text-[var(--text-2)]">
                        Cropped and converted locally in your browser.
                      </span>
                    </div>
                    <StudioButton
                      variant="primary"
                      size="sm"
                      onClick={() => onOpenBannerImageStudio("input")}
                    >
                      <Upload />
                      <span>Choose or drop image</span>
                    </StudioButton>
                  </div>
                )}
              </div>

              {activeCustomBannerAsset && (
                <StudioField
                  label="Alt text"
                  htmlFor="banner-custom-alt"
                  helper="Shown when images fail to load and read by screen readers."
                >
                  <StudioInput
                    id="banner-custom-alt"
                    value={readmeConfig.customBannerAlt}
                    onChange={(e) => onUpdateBannerAlt(e.target.value)}
                    placeholder="Profile banner"
                  />
                </StudioField>
              )}

              <StudioField label="Banner alignment">
                <StudioSegmentedControl<"left" | "center" | "right">
                  ariaLabel="Custom banner alignment"
                  value={readmeConfig.customBannerAlign}
                  onChange={(align) =>
                    onUpdateReadmeField("customBannerAlign", align)
                  }
                  options={[
                    { value: "left", label: "Left", icon: <AlignLeft /> },
                    { value: "center", label: "Center", icon: <AlignCenter /> },
                    { value: "right", label: "Right", icon: <AlignRight /> },
                  ]}
                />
              </StudioField>

              <StudioSliderField
                label="Banner width"
                value={readmeConfig.customBannerWidth}
                min={320}
                max={848}
                step={16}
                unit="px"
                onChange={(next) => onUpdateReadmeField("customBannerWidth", next)}
                presetSlot={
                  <StudioSegmentedControl<string>
                    ariaLabel="Custom banner width presets"
                    size="sm"
                    value={
                      [480, 640, 760, 848].includes(readmeConfig.customBannerWidth)
                        ? String(readmeConfig.customBannerWidth)
                        : "custom"
                    }
                    onChange={(val) => {
                      const n = Number(val);
                      if (Number.isFinite(n)) {
                        onUpdateReadmeField("customBannerWidth", n);
                      }
                    }}
                    options={[
                      { value: "480", label: "480" },
                      { value: "640", label: "640" },
                      { value: "760", label: "760" },
                      { value: "848", label: "848" },
                    ]}
                  />
                }
              />
            </div>
          ) : (
            /* BUILT-IN CREATURE CONTROLS */
            <div className="flex flex-col gap-5">
              {/* Creature Picker */}
              <div className="flex flex-col gap-3">
                <span className="text-[13px] font-medium text-[var(--text)]">
                  Creature
                </span>
                <div className="grid grid-cols-2 gap-2.5">
                  {CREATURE_CATALOG.map((item) => {
                    const selected = creatureConfig.creature === item.id;
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
                          "flex cursor-pointer flex-col gap-2.5 rounded-[12px] p-3 text-left transition-colors duration-150",
                          selected
                            ? "bg-[var(--surface-3)]"
                            : "bg-[var(--surface-2)] hover:bg-[var(--surface-3)]"
                        )}
                      >
                        <div className="flex h-14 items-center justify-center overflow-hidden rounded-[8px] bg-[#0D1117] px-2 py-1.5">
                          <img
                            src={thumbPath}
                            alt={item.name}
                            style={{ imageRendering: "pixelated" }}
                            className="max-h-full w-auto object-contain"
                          />
                        </div>
                        <div className="flex items-center justify-between gap-1.5">
                          <span className="truncate text-[13px] font-semibold text-[var(--text)]">
                            {item.name}
                          </span>
                          {selected && (
                            <span className="flex size-4 shrink-0 items-center justify-center rounded-full bg-[var(--ember)] text-[var(--on-primary)]">
                              <Check className="size-2.5 stroke-[3]" />
                            </span>
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>

                <StudioField
                  label="Camera view"
                  helper={
                    meta.supportsViewSelection
                      ? undefined
                      : "Pelagic side view applies to Pixel Jellyfish."
                  }
                >
                  <StudioSegmentedControl<CameraView>
                    ariaLabel="Camera view"
                    value={meta.supportsViewSelection ? creatureConfig.view : "side"}
                    onChange={onSelectView}
                    options={CAMERA_VIEWS.map((v) => ({
                      value: v.id,
                      label: v.id === "side" ? "Side view" : "Top view",
                      disabled: v.id === "top" && !meta.supportsViewSelection,
                    }))}
                  />
                </StudioField>
              </div>

              {/* Colors */}
              <div className="flex flex-col gap-3 rounded-[12px] bg-[var(--surface-2)] p-3.5">
                <StudioField label="Creature colors">
                  <StudioSegmentedControl<"canonical" | "languages">
                    ariaLabel="Creature color mode"
                    size="sm"
                    value={isOriginalMode ? "canonical" : "languages"}
                    onChange={(mode) => {
                      if (mode === "canonical") onApplyOriginalColors();
                      else onApplyAutoLanguageColors();
                    }}
                    options={[
                      { value: "canonical", label: "Original colors" },
                      { value: "languages", label: "Auto from languages" },
                    ]}
                  />
                </StudioField>

                <StudioField
                  label="Language chips"
                  trailing={
                    !isOriginalMode ? (
                      <StudioButton
                        variant="ghost"
                        size="sm"
                        onClick={onResetLanguageColors}
                      >
                        <RotateCcw />
                        <span>Reset</span>
                      </StudioButton>
                    ) : null
                  }
                  helper={
                    isOriginalMode
                      ? "Switch to Auto to customize language colors."
                      : "Click any chip to rename or pick a color."
                  }
                >
                  <div className="flex flex-col gap-2.5">
                    <StudioSegmentedControl<`${LanguageCount}`>
                      ariaLabel="Language chip count"
                      size="sm"
                      value={`${creatureConfig.languageCount}` as `${LanguageCount}`}
                      onChange={(val) =>
                        onSetLanguageCount(Number(val) as LanguageCount)
                      }
                      options={LANGUAGE_COUNTS.map((count) => ({
                        value: `${count}` as `${LanguageCount}`,
                        label: `${count}`,
                      }))}
                    />

                    <div className="flex flex-wrap gap-1.5">
                      {visibleLanguages.map((lang, idx) =>
                        isOriginalMode ? (
                          <div
                            key={`${idx}-${lang.name}`}
                            className="inline-flex min-h-[32px] items-center gap-1.5 rounded-[8px] bg-[var(--surface)] px-2.5 py-1 text-[12px] font-medium text-[var(--text)]"
                          >
                            <span
                              className="size-2.5 shrink-0 rounded-full"
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
              </div>

              {/* Water and background */}
              <div className="flex flex-col gap-3 rounded-[12px] bg-[var(--surface-2)] p-3.5">
                <StudioField label="Water">
                  <StudioSegmentedControl<WaterMode>
                    ariaLabel="Water atmosphere"
                    size="sm"
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
                  <div className="flex flex-col gap-2.5">
                    <StudioSegmentedControl<BackgroundMode>
                      ariaLabel="Canvas background"
                      size="sm"
                      value={creatureConfig.backgroundMode}
                      onChange={onSetBackgroundMode}
                      options={[
                        { value: "transparent", label: "Transparent" },
                        { value: "custom", label: "Custom color" },
                      ]}
                    />

                    {creatureConfig.backgroundMode === "custom" && (
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
              </div>

              {/* Evolution */}
              <div className="flex flex-col gap-3 rounded-[12px] bg-[var(--surface-2)] p-3.5">
                <StudioField label="Commit count source">
                  <StudioSegmentedControl<ContributionWindow>
                    ariaLabel="Commit count source"
                    size="sm"
                    value={creatureConfig.windowMode}
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

                {creatureConfig.windowMode === "annual" ? (
                  <div
                    data-evolution-mode="annual"
                    className="flex flex-col gap-2.5"
                  >
                    <div
                      data-testid="evolution-stage-track"
                      className="grid grid-cols-5 gap-1"
                    >
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
                              "flex flex-col items-center gap-0.5 rounded-[8px] px-1 py-1.5 text-center",
                              isCurrent
                                ? "bg-[var(--ember-soft)] text-[var(--ember)]"
                                : isPassed
                                  ? "bg-[var(--surface-3)] text-[var(--text)]"
                                  : "bg-[var(--surface)] text-[var(--text-3)]"
                            )}
                          >
                            <span className="studio-mono text-[11px] font-semibold">
                              S{stageDef.stage}
                            </span>
                            <span className="w-full truncate text-[11px] font-medium">
                              {label}
                            </span>
                          </div>
                        );
                      })}
                    </div>

                    <p
                      data-testid="evolution-next-stage-text"
                      className="text-[13px] leading-5 text-[var(--text-2)] tabular-nums"
                    >
                      <span className="font-semibold text-[var(--ember)]">
                        {commitsText} commits.
                      </span>{" "}
                      {nextStageDef
                        ? `${Math.max(0, nextStageDef.minCommits - commitsCount).toLocaleString("en-US")} more commits to reach the next stage.`
                        : "Highest growth stage reached."}
                    </p>
                  </div>
                ) : (
                  <p
                    data-evolution-mode="all-time"
                    data-testid="evolution-all-time-text"
                    className="text-[13px] leading-5 font-medium text-[var(--ember)] tabular-nums"
                  >
                    {commitsText} commits, all time.
                  </p>
                )}
              </div>

              {/* Animation speed */}
              <div className="rounded-[12px] bg-[var(--surface-2)] p-3.5">
                <StudioSliderField
                  label="Swimming speed"
                  value={creatureConfig.animationSpeed}
                  min={0.4}
                  max={2.5}
                  step={0.1}
                  unit="x"
                  formatValue={(v) => v.toFixed(1)}
                  onChange={(next) =>
                    onUpdateCreatureConfig((prev) => ({
                      ...prev,
                      animationSpeed: next,
                    }))
                  }
                  presetSlot={
                    <StudioSegmentedControl<string>
                      ariaLabel="Swimming speed preset"
                      size="sm"
                      value={activeSpeedPreset}
                      onChange={(val) => {
                        const preset = SPEED_PRESETS.find((p) => p.value === val);
                        if (preset) {
                          onUpdateCreatureConfig((prev) => ({
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
              </div>

              {/* Stats overlay */}
              <div className="flex flex-col gap-3 rounded-[12px] bg-[var(--surface-2)] p-3.5">
                <StudioSwitchRow
                  id="inspector-hud-toggle"
                  checked={creatureConfig.showHud}
                  onCheckedChange={(checked) =>
                    onUpdateCreatureConfig((prev) => ({
                      ...prev,
                      showHud: checked,
                    }))
                  }
                  label="Stats overlay"
                  description="Shows rank, commits and top languages along the bottom edge."
                  className="bg-[var(--surface)]"
                />

                {creatureConfig.showHud && (
                  <div className="flex flex-col gap-3.5 pt-1">
                    <div
                      className="rounded-[8px] px-3 py-2.5"
                      style={{
                        backgroundColor:
                          creatureConfig.backgroundMode === "custom"
                            ? derived.background
                            : "#0D1117",
                        textAlign: creatureConfig.hudAlign,
                      }}
                    >
                      <div
                        style={{
                          color: currentHudColor,
                          fontFamily: hudSampleFontCss,
                          fontWeight: hudSampleWeight,
                          fontSize: `${Math.min(16, Math.max(12, creatureConfig.hudFontSize))}px`,
                        }}
                      >
                        STAGE {evolution.stage} {hudSampleTitle}
                      </div>
                      <div
                        style={{
                          color: currentHudColor,
                          fontFamily: hudSampleFontCss,
                          fontWeight: hudSampleWeight,
                          fontSize: `${Math.max(11, Math.min(14, creatureConfig.hudFontSize - 1))}px`,
                          opacity: 0.9,
                        }}
                      >
                        COMMITS {commitsText}
                      </div>
                    </div>

                    <StudioField label="Custom label" htmlFor="hud-custom-label">
                      <StudioInput
                        id="hud-custom-label"
                        maxLength={32}
                        placeholder={`${evolution.rank} ${meta.name.toUpperCase()}`}
                        value={creatureConfig.customTitle}
                        onChange={(e) =>
                          onUpdateCreatureConfig((prev) => ({
                            ...prev,
                            customTitle: e.target.value,
                          }))
                        }
                        className="bg-[var(--surface)]"
                      />
                    </StudioField>

                    <StudioField label="Position">
                      <StudioSegmentedControl<HudAlign>
                        ariaLabel="HUD overlay position"
                        size="sm"
                        value={creatureConfig.hudAlign}
                        onChange={(align) =>
                          onUpdateCreatureConfig((prev) => ({
                            ...prev,
                            hudAlign: align,
                          }))
                        }
                        options={[
                          { value: "left", label: "Left", icon: <AlignLeft /> },
                          {
                            value: "center",
                            label: "Center",
                            icon: <AlignCenter />,
                          },
                          { value: "right", label: "Right", icon: <AlignRight /> },
                        ]}
                      />
                    </StudioField>

                    <StudioField label="Font family">
                      <StudioSegmentedControl<HudFontFamily>
                        ariaLabel="HUD font family"
                        size="sm"
                        value={creatureConfig.hudFontFamily}
                        onChange={(family) =>
                          onUpdateCreatureConfig((prev) => ({
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
                        size="sm"
                        value={creatureConfig.hudFontWeight}
                        onChange={(weight) =>
                          onUpdateCreatureConfig((prev) => ({
                            ...prev,
                            hudFontWeight: weight,
                          }))
                        }
                        options={HUD_FONT_WEIGHTS}
                      />
                    </StudioField>

                    <StudioSliderField
                      label="Font size"
                      value={creatureConfig.hudFontSize}
                      min={12}
                      max={22}
                      step={1}
                      unit="px"
                      onChange={(next) =>
                        onUpdateCreatureConfig((prev) => ({
                          ...prev,
                          hudFontSize: next,
                        }))
                      }
                    />

                    <StudioField label="Font color">
                      <div className="flex flex-wrap items-center gap-2">
                        <StudioColorSwatch
                          label="HUD font color"
                          value={currentHudColor}
                          onChange={(hex) =>
                            onUpdateCreatureConfig((prev) => ({
                              ...prev,
                              hudFontColor: hex,
                            }))
                          }
                        />
                        <StudioButton
                          variant="secondary"
                          size="sm"
                          onClick={() =>
                            onUpdateCreatureConfig((prev) => ({
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
              </div>

              {/* Creature image export */}
              <div className="flex flex-col gap-2.5 rounded-[12px] bg-[var(--surface-2)] p-3.5">
                <span className="text-[13px] font-medium text-[var(--text)]">
                  Creature image export
                </span>
                <div className="flex flex-col gap-2">
                  <StudioButton
                    variant="secondary"
                    size="sm"
                    className="w-full justify-start"
                    disabled={webpBusy}
                    onClick={onExportWebP}
                  >
                    <Download />
                    <span>{webpBusy ? "Encoding WebP..." : "Download WebP"}</span>
                  </StudioButton>
                  <StudioButton
                    variant="secondary"
                    size="sm"
                    className="w-full justify-start"
                    disabled={gifBusy}
                    onClick={onExportGif}
                  >
                    <Download />
                    <span>{gifBusy ? "Encoding GIF..." : "Download GIF"}</span>
                  </StudioButton>
                  <StudioButton
                    variant="secondary"
                    size="sm"
                    className="w-full justify-start"
                    onClick={onCopyCreatureImage}
                  >
                    {creatureCopied ? <Check /> : <Copy />}
                    <span>{creatureCopied ? "Copied image" : "Copy image"}</span>
                  </StudioButton>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
