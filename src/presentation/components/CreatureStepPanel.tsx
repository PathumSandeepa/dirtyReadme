"use client";

import { useState } from "react";
import {
  AlignCenter,
  AlignLeft,
  AlignRight,
  ArrowRight,
  Calendar,
  Camera,
  Droplets,
  EyeOff,
  Gauge,
  History,
  Palette,
  RotateCcw,
  Sliders,
  Sparkles,
  Type,
  Wand2,
} from "lucide-react";
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
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
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
    <div className="flex flex-col gap-5">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Sparkles className="size-4 text-primary" />
            <CardTitle className="font-mono">Choose Pixel Creature</CardTitle>
          </div>
          <CardDescription>
            Select your marine guardian. Smooth S-curve motion exports cleanly to
            Animated WebP &amp; GIF.
          </CardDescription>
        </CardHeader>

        <CardContent className="flex flex-col gap-4">
          <div className="flex flex-col gap-2.5">
            {CREATURE_CATALOG.map((item) => {
              const selected = config.creature === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => onSelectCreature(item.id)}
                  className={`flex flex-col gap-1.5 rounded-lg border p-3.5 text-left transition ${
                    selected
                      ? "border-primary bg-accent/60 ring-1 ring-primary"
                      : "bg-muted/40 hover:bg-muted"
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-mono text-sm font-semibold text-foreground">
                      {item.name}
                    </span>
                    <Badge variant="outline" className="font-mono text-[10px]">
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

          <Separator />

          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-1.5 font-mono text-xs font-medium text-foreground">
              <Camera className="size-3.5 text-muted-foreground" />
              Camera Perspective
            </div>

            {meta.supportsViewSelection ? (
              <div className="grid grid-cols-2 gap-2">
                {CAMERA_VIEWS.map((v) => {
                  const active = config.view === v.id;
                  return (
                    <button
                      key={v.id}
                      type="button"
                      onClick={() => onSelectView(v.id)}
                      className={`rounded-lg border px-3 py-2 font-mono text-xs font-semibold transition ${
                        active
                          ? "border-primary bg-primary text-primary-foreground"
                          : "bg-muted/40 text-foreground hover:bg-muted"
                      }`}
                    >
                      {v.name}
                    </button>
                  );
                })}
              </div>
            ) : (
              <div className="flex items-center gap-2 rounded-lg border border-dashed bg-muted/30 px-3 py-2.5 text-xs text-muted-foreground">
                <EyeOff className="size-3.5 shrink-0" />
                <span>
                  Pelagic view locked. Camera angles are available for Pixel Tulkun
                  only.
                </span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Palette className="size-4 text-primary" />
            <CardTitle className="font-mono">
              Colors &amp; Canvas Background
            </CardTitle>
          </div>
          <CardDescription>
            Keep the original pixel artwork colors or tint the creature directly
            from your customized top languages.
          </CardDescription>
        </CardHeader>

        <CardContent className="flex flex-col gap-4">
          {/* 1. Original vs Auto Language Creature Colors */}
          <div className="flex flex-col gap-2">
            <span className="font-mono text-xs font-medium text-foreground">
              Creature Color Mode
            </span>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={onApplyOriginalColors}
                className={`flex items-center justify-center gap-1.5 rounded-lg border px-3 py-2 font-mono text-xs font-semibold transition ${
                  config.colorMode === "canonical"
                    ? "border-primary bg-primary text-primary-foreground"
                    : "bg-muted/40 text-foreground hover:bg-muted"
                }`}
              >
                <Sparkles className="size-3.5" />
                Original Colors
              </button>
              <button
                type="button"
                onClick={onApplyAutoLanguageColors}
                className={`flex items-center justify-center gap-1.5 rounded-lg border px-3 py-2 font-mono text-xs font-semibold transition ${
                  config.colorMode !== "canonical"
                    ? "border-primary bg-primary text-primary-foreground"
                    : "bg-muted/40 text-foreground hover:bg-muted"
                }`}
              >
                <Wand2 className="size-3.5" />
                Auto (Languages)
              </button>
            </div>
          </div>

          <Separator />

          {/* 2. Top Languages Count (3 / 5 / 7) & Auto vs Original Swatches */}
          <div className="flex flex-col gap-3 rounded-xl border bg-muted/25 p-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="font-mono text-xs font-medium text-foreground">
                HUD Languages ({config.languageCount})
              </span>
              <div className="flex items-center gap-1.5">
                {LANGUAGE_COUNTS.map((count) => {
                  const active = config.languageCount === count;
                  return (
                    <button
                      key={count}
                      type="button"
                      onClick={() => onSetLanguageCount(count)}
                      className={`rounded-md border px-2.5 py-1 font-mono text-xs font-semibold transition ${
                        active
                          ? "border-primary bg-primary text-primary-foreground"
                          : "bg-card text-foreground hover:bg-muted"
                      }`}
                    >
                      {count}
                    </button>
                  );
                })}
                {!isOriginalMode && (
                  <button
                    type="button"
                    onClick={onResetLanguageColors}
                    title="Reset official GitHub language colors"
                    className="inline-flex items-center gap-1 rounded-md border bg-card px-2 py-1 font-mono text-[11px] text-muted-foreground transition hover:text-foreground"
                  >
                    <RotateCcw className="size-3" />
                    Reset
                  </button>
                )}
              </div>
            </div>

            {isOriginalMode ? (
              <div className="flex flex-col gap-2">
                <div className="flex flex-wrap gap-1.5">
                  {visibleLanguages.map((lang, idx) => (
                    <div
                      key={`${idx}-${lang.name}`}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-card/70 px-2.5 py-1.5"
                    >
                      <span
                        className="size-3 shrink-0 rounded-full border border-border"
                        style={{ backgroundColor: lang.color }}
                      />
                      <span className="font-mono text-xs font-medium text-foreground">
                        {lang.name || `Lang ${idx + 1}`}
                      </span>
                    </div>
                  ))}
                </div>
                <p className="text-[11px] text-muted-foreground">
                  Original creature colors are automatically matched to your top{" "}
                  {config.languageCount} HUD languages. Switch to Auto (Languages) to
                  customize each color.
                </p>
              </div>
            ) : (
              <>
                <div className="flex flex-wrap gap-1.5">
                  {visibleLanguages.map((lang, idx) => {
                    const selected = safeLangIdx === idx;
                    const hex = normalizeHex(lang.color, "#3178C6");
                    return (
                      <button
                        key={`${idx}-${lang.name}`}
                        type="button"
                        onClick={() => setSelectedLangIdx(idx)}
                        className={`inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-left transition ${
                          selected
                            ? "border-primary bg-card ring-1 ring-primary"
                            : "bg-card/60 hover:bg-card"
                        }`}
                      >
                        <span
                          className="size-3.5 shrink-0 rounded-full border border-border"
                          style={{ backgroundColor: hex }}
                        />
                        <span className="font-mono text-xs font-medium text-foreground">
                          {lang.name || `Lang ${idx + 1}`}
                        </span>
                      </button>
                    );
                  })}
                </div>

                {activeLang && (
                  <div className="flex flex-col gap-2.5 border-t border-border/70 pt-2.5">
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
                      <span className="font-mono text-xs font-semibold text-muted-foreground">
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
              </>
            )}
          </div>

          <Separator />

          {/* 3. Water Environment: In Water / Without Water / Clear */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-1.5 font-mono text-xs font-medium text-foreground">
              <Droplets className="size-3.5 text-muted-foreground" />
              Water Environment
            </div>
            <div className="grid grid-cols-3 gap-2">
              {(
                [
                  { id: "water", label: "In Water" },
                  { id: "no-water", label: "Without Water" },
                  { id: "clear", label: "Clear" },
                ] as const
              ).map((opt) => {
                const active = waterMode === opt.id;
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => onSetWaterMode(opt.id)}
                    className={`rounded-lg border px-2.5 py-2 font-mono text-xs font-semibold transition ${
                      active
                        ? "border-primary bg-primary text-primary-foreground"
                        : "bg-muted/40 text-foreground hover:bg-muted"
                    }`}
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
                  : "Pure clean creature canvas with all water effects and moving white dots removed."}
            </p>
          </div>

          <Separator />

          {/* 4. Canvas Background (Transparent vs Custom Color) */}
          <div className="flex flex-col gap-2.5">
            <span className="font-mono text-xs font-medium text-foreground">
              Canvas Background
            </span>
            <div className="grid grid-cols-2 gap-2">
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
                    className={`rounded-lg border px-3 py-2 font-mono text-xs font-semibold transition ${
                      active
                        ? "border-primary bg-primary text-primary-foreground"
                        : "bg-muted/40 text-foreground hover:bg-muted"
                    }`}
                  >
                    {mode.label}
                  </button>
                );
              })}
            </div>

            {config.backgroundMode === "custom" && (
              <div className="flex flex-col gap-2 rounded-xl border bg-muted/25 p-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-mono text-muted-foreground">
                    Background Color
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
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Sliders className="size-4 text-primary" />
            <CardTitle className="font-mono">Stage, Speed &amp; HUD</CardTitle>
          </div>
          <CardDescription>
            Stage is calculated automatically from your GitHub commit count.
          </CardDescription>
        </CardHeader>

        <CardContent className="flex flex-col gap-5">
          {/* Read-only Commit-Driven Stage + Current Year / All Time Selector */}
          <div className="flex flex-col gap-3 rounded-xl border bg-muted/25 p-3.5">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs font-medium text-foreground">
                  Evolution Stage
                </span>
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

            <p className="text-[11px] text-muted-foreground">
              {nextStageDef
                ? `${Math.max(0, nextStageDef.minCommits - config.commits).toLocaleString("en-US")} more commits to reach Stage ${nextStageDef.stage} (${nextStageDef.rank}).`
                : "Maximum Elder stage unlocked."}
            </p>

            <div className="flex flex-col gap-1.5 pt-1">
              <span className="font-mono text-[11px] font-medium text-foreground">
                Commit Count Source
              </span>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => onSelectWindow("annual")}
                  className={`flex items-center justify-center gap-1.5 rounded-lg border px-2.5 py-2 font-mono text-xs font-semibold transition ${
                    config.windowMode === "annual"
                      ? "border-primary bg-primary text-primary-foreground"
                      : "bg-card text-foreground hover:bg-muted"
                  }`}
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
                  className={`flex items-center justify-center gap-1.5 rounded-lg border px-2.5 py-2 font-mono text-xs font-semibold transition ${
                    config.windowMode === "all-time"
                      ? "border-primary bg-primary text-primary-foreground"
                      : "bg-card text-foreground hover:bg-muted"
                  }`}
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

          <Separator />

          <div className="flex flex-col gap-2.5">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-1.5 font-mono text-xs font-medium text-foreground">
                <Gauge className="size-3.5 text-muted-foreground" />
                Swimming Speed
              </div>
              <div className="flex items-center gap-1">
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
                      className={`rounded-md border px-2 py-0.5 font-mono text-[11px] transition ${
                        active
                          ? "border-primary bg-primary text-primary-foreground"
                          : "bg-muted/40 text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      {preset.label}
                    </button>
                  );
                })}
                <span className="ml-1 min-w-10 text-right font-mono text-xs font-semibold text-foreground">
                  {config.animationSpeed.toFixed(1)}x
                </span>
              </div>
            </div>

            <input
              type="range"
              aria-label="Swimming Speed"
              min={0.4}
              max={2.5}
              step={0.1}
              value={config.animationSpeed}
              onChange={(e) => {
                const next = parseFloat(e.target.value);
                if (Number.isFinite(next)) {
                  onUpdateConfig((prev) => ({
                    ...prev,
                    animationSpeed: next,
                  }));
                }
              }}
              className="h-2 w-full cursor-pointer accent-primary"
            />
          </div>

          <Separator />

          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between rounded-lg border bg-muted/40 px-3.5 py-2.5">
              <div className="flex flex-col gap-0.5">
                <label
                  htmlFor="hud-toggle"
                  className="cursor-pointer font-mono text-xs font-medium text-foreground"
                >
                  Show Pixel HUD
                </label>
                <span className="text-xs text-muted-foreground">
                  Stage, commit count &amp; {config.languageCount} languages at
                  bottom ({config.hudAlign})
                </span>
              </div>
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
            </div>

            {config.showHud && (
              <div className="flex flex-col gap-3.5 rounded-xl border bg-muted/25 p-3.5">
                <Input
                  id="hud-title-input"
                  maxLength={32}
                  placeholder={`Custom HUD label (${evolution.rank} ${meta.id.toUpperCase()})`}
                  value={config.customTitle}
                  onChange={(e) =>
                    onUpdateConfig((prev) => ({
                      ...prev,
                      customTitle: e.target.value,
                    }))
                  }
                  className="font-mono text-xs"
                />

                {/* HUD Position / Alignment */}
                <div className="flex flex-col gap-1.5">
                  <span className="font-mono text-[11px] font-medium text-foreground">
                    HUD Position
                  </span>
                  <div className="grid grid-cols-3 gap-1.5">
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
                          className={`flex items-center justify-center gap-1.5 rounded-lg border py-1.5 font-mono text-xs font-semibold transition ${
                            active
                              ? "border-primary bg-primary text-primary-foreground"
                              : "bg-card text-foreground hover:bg-muted"
                          }`}
                        >
                          <Icon className="size-3.5" />
                          {label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* HUD Font Family */}
                <div className="flex flex-col gap-1.5">
                  <div className="flex items-center gap-1.5 font-mono text-[11px] font-medium text-foreground">
                    <Type className="size-3 text-muted-foreground" />
                    HUD Font Family
                  </div>
                  <div className="grid grid-cols-4 gap-1.5">
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
                          className={`rounded-lg border py-1.5 font-mono text-xs font-semibold transition ${
                            active
                              ? "border-primary bg-primary text-primary-foreground"
                              : "bg-card text-foreground hover:bg-muted"
                          }`}
                        >
                          {f.label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* HUD Font Weight & Font Size */}
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="flex flex-col gap-1.5">
                    <span className="font-mono text-[11px] font-medium text-foreground">
                      Font Weight
                    </span>
                    <div className="grid grid-cols-3 gap-1">
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
                            className={`rounded-md border py-1 font-mono text-[11px] font-semibold transition ${
                              active
                                ? "border-primary bg-primary text-primary-foreground"
                                : "bg-card text-foreground hover:bg-muted"
                            }`}
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
                    <input
                      type="range"
                      aria-label="HUD Font Size"
                      min={12}
                      max={22}
                      step={1}
                      value={config.hudFontSize}
                      onChange={(e) => {
                        const next = parseInt(e.target.value, 10);
                        if (Number.isFinite(next)) {
                          onUpdateConfig((prev) => ({
                            ...prev,
                            hudFontSize: next,
                          }));
                        }
                      }}
                      className="my-auto h-2 w-full cursor-pointer accent-primary"
                    />
                  </div>
                </div>

                {/* HUD Font Color */}
                <div className="flex items-center justify-between gap-2 border-t border-border/70 pt-2.5">
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
                    <button
                      type="button"
                      onClick={() =>
                        onUpdateConfig((prev) => ({
                          ...prev,
                          hudFontColor: defaultContrastHudColor,
                        }))
                      }
                      title="Reset HUD text contrast color"
                      className="inline-flex items-center gap-1 rounded-md border bg-card px-2 py-1.5 font-mono text-[11px] text-muted-foreground transition hover:text-foreground"
                    >
                      <RotateCcw className="size-3" />
                      Auto
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <Button type="button" size="lg" onClick={onNextStep} className="w-full">
        Next: Customize Profile README
        <ArrowRight data-icon="inline-end" />
      </Button>
    </div>
  );
}
