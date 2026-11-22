"use client";

import { useState } from "react";
import {
  AlignCenter,
  AlignLeft,
  AlignRight,
  ArrowRight,
  Calendar,
  EyeOff,
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
  getVisibleLanguages,
  normalizeHex,
  resolveHudFontColor,
  resolveWaterMode,
} from "@/domain/creature/services";
import type { GitHubProfileSnapshot } from "@/infrastructure/github/githubClient";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldDescription,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import {
  ColorPalettePicker,
  ColorPalettePopoverButton,
} from "./ColorPalettePicker";

const SPEED_PRESETS = [
  { label: "Slow", value: 0.6 },
  { label: "Normal", value: 1.0 },
  { label: "Fast", value: 1.8 },
] as const;

const HUD_FONT_FAMILIES: { id: HudFontFamily; label: string }[] = [
  { id: "pixel", label: "Pixel" },
  { id: "mono", label: "Mono" },
  { id: "sans", label: "Sans" },
  { id: "serif", label: "Serif" },
];

const HUD_FONT_WEIGHTS: { id: HudFontWeight; label: string }[] = [
  { id: "normal", label: "Normal" },
  { id: "semibold", label: "Medium" },
  { id: "bold", label: "Bold" },
];

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
  onNextStep: () => void;
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
  onNextStep,
}: CreatureStepPanelProps) {
  const [selectedLangIdx, setSelectedLangIdx] = useState(0);

  const meta = getCreatureMeta(config.creature);
  const evolution = getEvolutionStage(config.commits);
  const nextStageDef = STAGE_DEFINITIONS.find(
    (s) => s.stage === evolution.stage + 1
  );
  const visibleLanguages = getVisibleLanguages(config);
  const safeLangIdx =
    selectedLangIdx < visibleLanguages.length ? selectedLangIdx : 0;
  const activeLang = visibleLanguages[safeLangIdx];
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

  return (
    <div className="flex flex-col gap-7 rounded-xl border bg-card p-5 text-card-foreground sm:p-6">
      {/* Section 1: Creature & Camera */}
      <section className="flex flex-col gap-4">
        <div className="flex flex-col gap-1">
          <h2 className="font-mono text-sm font-semibold text-foreground">
            Creature &amp; Perspective
          </h2>
          <p className="text-xs text-muted-foreground">
            Choose your animated guardian. Export cleanly to Animated WebP or GIF.
          </p>
        </div>

        <div className="grid gap-2.5 sm:grid-cols-2">
          {CREATURE_CATALOG.map((item) => {
            const selected = config.creature === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onSelectCreature(item.id)}
                className={cn(
                  "flex flex-col gap-1.5 rounded-xl p-3.5 text-left transition",
                  selected
                    ? "bg-accent ring-1 ring-primary"
                    : "bg-muted/45 hover:bg-muted/75"
                )}
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="font-mono text-sm font-semibold text-foreground">
                    {item.name}
                  </span>
                  <Badge variant="secondary" className="font-mono text-[10px]">
                    {item.subtitle}
                  </Badge>
                </div>
                <p className="text-xs leading-relaxed text-muted-foreground">
                  {item.description}
                </p>
              </button>
            );
          })}
        </div>

        <div className="flex flex-col gap-2">
          <span className="font-mono text-xs font-medium text-foreground">
            Camera Perspective
          </span>

          {meta.supportsViewSelection ? (
            <div className="grid grid-cols-2 rounded-lg bg-muted/70 p-1">
              {CAMERA_VIEWS.map((v) => {
                const active = config.view === v.id;
                return (
                  <button
                    key={v.id}
                    type="button"
                    onClick={() => onSelectView(v.id)}
                    className={cn(
                      "rounded-md px-3 py-1.5 font-mono text-xs font-medium transition",
                      active
                        ? "bg-background text-foreground shadow-xs"
                        : "text-muted-foreground hover:text-foreground"
                    )}
                  >
                    {v.name}
                  </button>
                );
              })}
            </div>
          ) : (
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <EyeOff className="size-3.5 shrink-0" />
              <span>
                Pelagic view locked — camera angles apply to Pixel Tulkun only.
              </span>
            </div>
          )}
        </div>
      </section>

      <Separator />

      {/* Section 2: Colors, Languages & Environment */}
      <section className="flex flex-col gap-5">
        <div className="flex flex-col gap-1">
          <h2 className="font-mono text-sm font-semibold text-foreground">
            Colors &amp; Canvas Backdrop
          </h2>
          <p className="text-xs text-muted-foreground">
            Keep canonical artwork colors or tint the creature directly from your
            top languages.
          </p>
        </div>

        <div className="flex flex-col gap-2">
          <span className="font-mono text-xs font-medium text-foreground">
            Creature Color Mode
          </span>
          <div className="grid grid-cols-2 rounded-lg bg-muted/70 p-1">
            <button
              type="button"
              onClick={onApplyOriginalColors}
              className={cn(
                "rounded-md px-3 py-1.5 font-mono text-xs font-medium transition",
                config.colorMode === "canonical"
                  ? "bg-background text-foreground shadow-xs"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              Original Colors
            </button>
            <button
              type="button"
              onClick={onApplyAutoLanguageColors}
              className={cn(
                "rounded-md px-3 py-1.5 font-mono text-xs font-medium transition",
                config.colorMode !== "canonical"
                  ? "bg-background text-foreground shadow-xs"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              Auto (Languages)
            </button>
          </div>
        </div>

        <div className="flex flex-col gap-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="font-mono text-xs font-medium text-foreground">
              HUD Languages ({config.languageCount})
            </span>
            <div className="flex items-center gap-2">
              {!isOriginalMode && (
                <Button
                  type="button"
                  variant="ghost"
                  size="xs"
                  onClick={onResetLanguageColors}
                  title="Reset official GitHub language colors"
                >
                  <RotateCcw data-icon="inline-start" />
                  Reset
                </Button>
              )}
              <div className="inline-flex rounded-lg bg-muted/70 p-0.5">
                {LANGUAGE_COUNTS.map((count) => {
                  const active = config.languageCount === count;
                  return (
                    <button
                      key={count}
                      type="button"
                      onClick={() => onSetLanguageCount(count)}
                      className={cn(
                        "rounded-md px-2.5 py-1 font-mono text-xs font-medium transition",
                        active
                          ? "bg-background text-foreground shadow-xs"
                          : "text-muted-foreground hover:text-foreground"
                      )}
                    >
                      {count}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {isOriginalMode ? (
            <div className="flex flex-col gap-2">
              <div className="flex flex-wrap gap-1.5">
                {visibleLanguages.map((lang, idx) => (
                  <div
                    key={`${idx}-${lang.name}`}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-muted/60 px-2.5 py-1.5"
                  >
                    <span
                      className="size-2.5 shrink-0 rounded-full"
                      style={{ backgroundColor: lang.color }}
                    />
                    <span className="font-mono text-xs font-medium text-foreground">
                      {lang.name || `Lang ${idx + 1}`}
                    </span>
                  </div>
                ))}
              </div>
              <p className="text-[11px] text-muted-foreground">
                Original palette automatically maps your top{" "}
                {config.languageCount} HUD languages. Switch to Auto to edit
                colors individually.
              </p>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              <div className="flex flex-wrap gap-1.5">
                {visibleLanguages.map((lang, idx) => {
                  const selected = safeLangIdx === idx;
                  const hex = normalizeHex(lang.color, "#3178C6");
                  return (
                    <button
                      key={`${idx}-${lang.name}`}
                      type="button"
                      onClick={() => setSelectedLangIdx(idx)}
                      className={cn(
                        "inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-left transition",
                        selected
                          ? "bg-accent text-foreground ring-1 ring-primary"
                          : "bg-muted/55 text-muted-foreground hover:bg-muted hover:text-foreground"
                      )}
                    >
                      <span
                        className="size-3 shrink-0 rounded-full"
                        style={{ backgroundColor: hex }}
                      />
                      <span className="font-mono text-xs font-medium">
                        {lang.name || `Lang ${idx + 1}`}
                      </span>
                    </button>
                  );
                })}
              </div>

              {activeLang && (
                <div className="flex flex-col gap-2.5">
                  <div className="flex items-center justify-between gap-2">
                    <Input
                      type="text"
                      maxLength={18}
                      value={activeLang.name}
                      onChange={(e) =>
                        onUpdateLanguageName(safeLangIdx, e.target.value)
                      }
                      aria-label="Selected language name"
                      className="h-8 flex-1 font-mono text-xs"
                    />
                    <span className="font-mono text-xs text-muted-foreground">
                      {normalizeHex(activeLang.color, "#3178C6")}
                    </span>
                  </div>

                  <ColorPalettePicker
                    value={activeLang.color}
                    onChange={(hex) => onUpdateLanguageColor(safeLangIdx, hex)}
                    height={120}
                  />
                </div>
              )}
            </div>
          )}
        </div>

        <div className="flex flex-col gap-2">
          <span className="font-mono text-xs font-medium text-foreground">
            Water Environment
          </span>
          <div className="grid grid-cols-3 rounded-lg bg-muted/70 p-1">
            {(
              [
                { id: "water", label: "In Water" },
                { id: "no-water", label: "No Water" },
                { id: "clear", label: "Clear" },
              ] as const
            ).map((opt) => {
              const active = waterMode === opt.id;
              return (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => onSetWaterMode(opt.id)}
                  className={cn(
                    "rounded-md px-2 py-1.5 font-mono text-xs font-medium transition",
                    active
                      ? "bg-background text-foreground shadow-xs"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  {opt.label}
                </button>
              );
            })}
          </div>
          <p className="text-[11px] text-muted-foreground">
            {waterMode === "water"
              ? "Animated ocean glow, light rays, rising bubbles, and wake motes."
              : waterMode === "no-water"
                ? "Removes underwater glow & rays while keeping subtle wake motes."
                : "Pure clean creature canvas with all water particles removed."}
          </p>
        </div>

        <div className="flex flex-col gap-2.5">
          <span className="font-mono text-xs font-medium text-foreground">
            Canvas Background
          </span>
          <div className="grid grid-cols-2 rounded-lg bg-muted/70 p-1">
            {(
              [
                { id: "transparent", label: "Transparent" },
                { id: "custom", label: "Custom Color" },
              ] as const
            ).map((mode) => {
              const active = config.backgroundMode === mode.id;
              return (
                <button
                  key={mode.id}
                  type="button"
                  onClick={() => onSetBackgroundMode(mode.id)}
                  className={cn(
                    "rounded-md px-3 py-1.5 font-mono text-xs font-medium transition",
                    active
                      ? "bg-background text-foreground shadow-xs"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  {mode.label}
                </button>
              );
            })}
          </div>

          {config.backgroundMode === "custom" && (
            <div className="flex flex-col gap-2 pt-1">
              <div className="flex items-center justify-between text-xs">
                <span className="font-mono text-muted-foreground">
                  Background Hex
                </span>
                <span className="font-mono font-semibold text-foreground">
                  {normalizeHex(customBgHex, "#0D1117")}
                </span>
              </div>
              <ColorPalettePicker
                value={customBgHex}
                onChange={onUpdateCustomBg}
                height={115}
              />
            </div>
          )}
        </div>
      </section>

      <Separator />

      {/* Section 3: Stage, Speed & Pixel HUD */}
      <section className="flex flex-col gap-5">
        <div className="flex flex-col gap-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <h2 className="font-mono text-sm font-semibold text-foreground">
                Evolution Stage
              </h2>
              <Badge variant="secondary" className="font-mono text-[11px]">
                Stage {evolution.stage}: {evolution.rank}
              </Badge>
            </div>
            <span className="font-mono text-xs font-semibold text-foreground">
              {Math.max(0, Math.floor(config.commits || 0)).toLocaleString(
                "en-US"
              )}{" "}
              commits
            </span>
          </div>

          <p className="text-xs text-muted-foreground">
            {nextStageDef
              ? `${Math.max(0, nextStageDef.minCommits - config.commits).toLocaleString("en-US")} more commits to reach Stage ${nextStageDef.stage} (${nextStageDef.rank}).`
              : "Maximum Elder evolution stage unlocked."}
          </p>

          <div className="flex flex-col gap-1.5">
            <span className="font-mono text-[11px] font-medium text-muted-foreground">
              Commit Count Source
            </span>
            <div className="grid grid-cols-2 rounded-lg bg-muted/70 p-1">
              <button
                type="button"
                onClick={() => onSelectWindow("annual")}
                className={cn(
                  "flex items-center justify-center gap-1.5 rounded-md px-2.5 py-1.5 font-mono text-xs font-medium transition",
                  config.windowMode === "annual"
                    ? "bg-background text-foreground shadow-xs"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                <Calendar className="size-3.5" />
                <span>
                  Current Year
                  {snapshot
                    ? ` (${snapshot.annualCommits.toLocaleString("en-US")})`
                    : ""}
                </span>
              </button>
              <button
                type="button"
                onClick={() => onSelectWindow("all-time")}
                className={cn(
                  "flex items-center justify-center gap-1.5 rounded-md px-2.5 py-1.5 font-mono text-xs font-medium transition",
                  config.windowMode === "all-time"
                    ? "bg-background text-foreground shadow-xs"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                <History className="size-3.5" />
                <span>
                  All Time
                  {snapshot
                    ? ` (${snapshot.allTimeCommits.toLocaleString("en-US")})`
                    : ""}
                </span>
              </button>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="font-mono text-xs font-medium text-foreground">
              Swimming Speed
            </span>
            <div className="flex items-center gap-2">
              <div className="inline-flex rounded-lg bg-muted/70 p-0.5">
                {SPEED_PRESETS.map((preset) => {
                  const active =
                    Math.abs(config.animationSpeed - preset.value) < 0.08;
                  return (
                    <button
                      key={preset.label}
                      type="button"
                      onClick={() =>
                        onUpdateConfig((prev) => ({
                          ...prev,
                          animationSpeed: preset.value,
                        }))
                      }
                      className={cn(
                        "rounded-md px-2 py-0.5 font-mono text-[11px] font-medium transition",
                        active
                          ? "bg-background text-foreground shadow-xs"
                          : "text-muted-foreground hover:text-foreground"
                      )}
                    >
                      {preset.label}
                    </button>
                  );
                })}
              </div>
              <span className="min-w-10 text-right font-mono text-xs font-semibold text-foreground">
                {config.animationSpeed.toFixed(1)}x
              </span>
            </div>
          </div>

          <Slider
            aria-label="Swimming Speed"
            min={0.4}
            max={2.5}
            step={0.1}
            value={[config.animationSpeed]}
            onValueChange={(val) => {
              const next = Array.isArray(val) ? val[0] : val;
              if (typeof next === "number" && Number.isFinite(next)) {
                onUpdateConfig((prev) => ({ ...prev, animationSpeed: next }));
              }
            }}
          />
        </div>

        <div className="flex flex-col gap-4">
          <Field orientation="horizontal">
            <Switch
              id="hud-toggle"
              checked={config.showHud}
              onCheckedChange={(checked) =>
                onUpdateConfig((prev) => ({
                  ...prev,
                  showHud: Boolean(checked),
                }))
              }
            />
            <div className="flex flex-col gap-0.5">
              <FieldLabel
                htmlFor="hud-toggle"
                className="font-mono text-xs font-semibold"
              >
                Show Pixel HUD Overlay
              </FieldLabel>
              <FieldDescription className="text-xs">
                Stage, commits &amp; {config.languageCount} languages along
                bottom ({config.hudAlign}).
              </FieldDescription>
            </div>
          </Field>

          {config.showHud && (
            <div className="flex flex-col gap-4 border-l-2 border-muted pl-4">
              <Field>
                <FieldLabel
                  htmlFor="hud-title-input"
                  className="font-mono text-[11px]"
                >
                  Custom HUD Label
                </FieldLabel>
                <Input
                  id="hud-title-input"
                  maxLength={32}
                  placeholder={`${evolution.rank} ${meta.id.toUpperCase()}`}
                  value={config.customTitle}
                  onChange={(e) =>
                    onUpdateConfig((prev) => ({
                      ...prev,
                      customTitle: e.target.value,
                    }))
                  }
                  className="font-mono text-xs"
                />
              </Field>

              <div className="flex flex-col gap-1.5">
                <span className="font-mono text-[11px] font-medium text-foreground">
                  HUD Position
                </span>
                <div className="grid grid-cols-3 rounded-lg bg-muted/70 p-1">
                  {(
                    [
                      { id: "left", label: "Left", Icon: AlignLeft },
                      { id: "center", label: "Center", Icon: AlignCenter },
                      { id: "right", label: "Right", Icon: AlignRight },
                    ] as { id: HudAlign; label: string; Icon: typeof AlignLeft }[]
                  ).map(({ id, label, Icon }) => {
                    const active = config.hudAlign === id;
                    return (
                      <button
                        key={id}
                        type="button"
                        onClick={() =>
                          onUpdateConfig((prev) => ({ ...prev, hudAlign: id }))
                        }
                        className={cn(
                          "flex items-center justify-center gap-1.5 rounded-md py-1.5 font-mono text-xs font-medium transition",
                          active
                            ? "bg-background text-foreground shadow-xs"
                            : "text-muted-foreground hover:text-foreground"
                        )}
                      >
                        <Icon className="size-3.5" />
                        {label}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <span className="font-mono text-[11px] font-medium text-foreground">
                  HUD Font Family
                </span>
                <div className="grid grid-cols-4 rounded-lg bg-muted/70 p-1">
                  {HUD_FONT_FAMILIES.map((f) => {
                    const active = config.hudFontFamily === f.id;
                    return (
                      <button
                        key={f.id}
                        type="button"
                        onClick={() =>
                          onUpdateConfig((prev) => ({
                            ...prev,
                            hudFontFamily: f.id,
                          }))
                        }
                        className={cn(
                          "rounded-md py-1.5 font-mono text-xs font-medium transition",
                          active
                            ? "bg-background text-foreground shadow-xs"
                            : "text-muted-foreground hover:text-foreground"
                        )}
                      >
                        {f.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="flex flex-col gap-1.5">
                  <span className="font-mono text-[11px] font-medium text-foreground">
                    Font Weight
                  </span>
                  <div className="grid grid-cols-3 rounded-lg bg-muted/70 p-1">
                    {HUD_FONT_WEIGHTS.map((w) => {
                      const active = config.hudFontWeight === w.id;
                      return (
                        <button
                          key={w.id}
                          type="button"
                          onClick={() =>
                            onUpdateConfig((prev) => ({
                              ...prev,
                              hudFontWeight: w.id,
                            }))
                          }
                          className={cn(
                            "rounded-md py-1 font-mono text-[11px] font-medium transition",
                            active
                              ? "bg-background text-foreground shadow-xs"
                              : "text-muted-foreground hover:text-foreground"
                          )}
                        >
                          {w.label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="flex flex-col gap-1.5">
                  <div className="flex items-center justify-between font-mono text-[11px]">
                    <span className="font-medium text-foreground">
                      Font Size
                    </span>
                    <span className="font-semibold text-foreground">
                      {config.hudFontSize}px
                    </span>
                  </div>
                  <Slider
                    aria-label="HUD Font Size"
                    min={12}
                    max={22}
                    step={1}
                    value={[config.hudFontSize]}
                    onValueChange={(val) => {
                      const next = Array.isArray(val) ? val[0] : val;
                      if (typeof next === "number" && Number.isFinite(next)) {
                        onUpdateConfig((prev) => ({
                          ...prev,
                          hudFontSize: next,
                        }));
                      }
                    }}
                  />
                </div>
              </div>

              <div className="flex items-center justify-between gap-2 pt-1">
                <span className="font-mono text-[11px] font-medium text-foreground">
                  HUD Font Color
                </span>
                <div className="flex items-center gap-1.5">
                  <ColorPalettePopoverButton
                    value={currentHudColor}
                    onChange={(hex) =>
                      onUpdateConfig((prev) => ({
                        ...prev,
                        hudFontColor: hex,
                      }))
                    }
                    label="HUD Font Color"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="xs"
                    onClick={() =>
                      onUpdateConfig((prev) => ({
                        ...prev,
                        hudFontColor: defaultContrastHudColor,
                      }))
                    }
                    title="Reset HUD text contrast color"
                  >
                    <RotateCcw data-icon="inline-start" />
                    Auto
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      <Button type="button" size="lg" onClick={onNextStep} className="w-full">
        Next: Customize Profile README
        <ArrowRight data-icon="inline-end" />
      </Button>
    </div>
  );
}
