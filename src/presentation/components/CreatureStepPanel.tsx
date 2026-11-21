"use client";

import { useState } from "react";
import {
  ArrowRight,
  Camera,
  EyeOff,
  Gauge,
  Palette,
  Sliders,
  Sparkles,
} from "lucide-react";
import {
  CAMERA_VIEWS,
  CREATURE_CATALOG,
  STAGE_DEFINITIONS,
  THEME_PRESETS,
  type BackgroundMode,
  type CameraView,
  type CreatureConfig,
  type CreatureId,
} from "@/domain/creature/entities";
import {
  getCreatureMeta,
  getEvolutionStage,
  normalizeHex,
} from "@/domain/creature/services";
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
import { ColorPalettePicker } from "./ColorPalettePicker";

type ColorChannel = "primary" | "accent" | "energy";

const SPEED_PRESETS = [
  { label: "Slow", value: 0.6 },
  { label: "Normal", value: 1.0 },
  { label: "Fast", value: 1.8 },
] as const;

interface CreatureStepPanelProps {
  config: CreatureConfig;
  customBgHex: string;
  onSelectCreature: (creature: CreatureId) => void;
  onSelectView: (view: CameraView) => void;
  onApplyPreset: (id: (typeof THEME_PRESETS)[number]["id"]) => void;
  onUpdateColor: (key: ColorChannel, hex: string) => void;
  onSetBackgroundMode: (mode: BackgroundMode) => void;
  onUpdateCustomBg: (hex: string) => void;
  onUpdateConfig: (updater: (prev: CreatureConfig) => CreatureConfig) => void;
  onNextStep: () => void;
}

export function CreatureStepPanel({
  config,
  customBgHex,
  onSelectCreature,
  onSelectView,
  onApplyPreset,
  onUpdateColor,
  onSetBackgroundMode,
  onUpdateCustomBg,
  onUpdateConfig,
  onNextStep,
}: CreatureStepPanelProps) {
  const [activeChannel, setActiveChannel] = useState<ColorChannel>("primary");

  const meta = getCreatureMeta(config.creature);
  const evolution = getEvolutionStage(config.commits);

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
                  Pelagic view locked — camera angles are available for Pixel Tulkun
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
            Pick a curated palette or fine-tune any channel with the color picker.
          </CardDescription>
        </CardHeader>

        <CardContent className="flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-2.5">
            {THEME_PRESETS.map((preset) => {
              const active =
                config.colorMode === "canonical" &&
                config.themeId === preset.id;
              return (
                <button
                  key={preset.id}
                  type="button"
                  onClick={() => onApplyPreset(preset.id)}
                  className={`flex flex-col gap-2 rounded-lg border p-3 text-left transition ${
                    active
                      ? "border-primary bg-accent/60 ring-1 ring-primary"
                      : "bg-muted/40 hover:bg-muted"
                  }`}
                >
                  <div className="flex items-center gap-1.5">
                    <span
                      className="size-3.5 rounded-full border"
                      style={{ backgroundColor: preset.colors.primary }}
                    />
                    <span
                      className="size-3.5 rounded-full border"
                      style={{ backgroundColor: preset.colors.accent }}
                    />
                    <span
                      className="size-3.5 rounded-full border"
                      style={{ backgroundColor: preset.colors.energy }}
                    />
                  </div>
                  <span className="font-mono text-xs font-semibold text-foreground">
                    {preset.name}
                  </span>
                </button>
              );
            })}
          </div>

          <div className="flex flex-col gap-3 rounded-xl border bg-muted/25 p-3">
            <div className="grid grid-cols-3 gap-2">
              {(
                [
                  { key: "primary", label: "Body" },
                  { key: "accent", label: "Crest" },
                  { key: "energy", label: "Glow" },
                ] as const
              ).map((item) => {
                const selected = activeChannel === item.key;
                const hex = normalizeHex(config.colors[item.key]);
                return (
                  <button
                    key={item.key}
                    type="button"
                    onClick={() => setActiveChannel(item.key)}
                    className={`flex items-center gap-2 rounded-lg border px-2.5 py-2 text-left transition ${
                      selected
                        ? "border-primary bg-card ring-1 ring-primary"
                        : "bg-card/50 hover:bg-card"
                    }`}
                  >
                    <span
                      className="size-4 shrink-0 rounded-full border"
                      style={{ backgroundColor: hex }}
                    />
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-xs font-medium text-foreground">
                        {item.label}
                      </div>
                      <div className="truncate font-mono text-[10px] text-muted-foreground">
                        {hex}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>

            <ColorPalettePicker
              value={config.colors[activeChannel]}
              onChange={(hex) => onUpdateColor(activeChannel, hex)}
              height={125}
            />
          </div>

          <Separator />

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
            Clean controls for growth tier, swim speed, and bottom telemetry.
          </CardDescription>
        </CardHeader>

        <CardContent className="flex flex-col gap-5">
          {/* 1. Evolution Stage + Commits */}
          <div className="flex flex-col gap-2.5">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs font-medium text-foreground">
                  Stage
                </span>
                <Badge variant="secondary" className="font-mono text-[11px]">
                  Stage {evolution.stage} · {evolution.rank}
                </Badge>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="font-mono text-[11px] text-muted-foreground">
                  Commits
                </span>
                <Input
                  id="commits-preview-input"
                  type="number"
                  min={0}
                  max={999999}
                  value={config.commits}
                  onChange={(e) => {
                    const parsed = parseInt(e.target.value, 10);
                    onUpdateConfig((prev) => ({
                      ...prev,
                      commits: Number.isFinite(parsed) ? Math.max(0, parsed) : 0,
                    }));
                  }}
                  className="h-7 w-24 font-mono text-xs"
                />
              </div>
            </div>

            <div className="grid grid-cols-5 gap-1.5">
              {STAGE_DEFINITIONS.map((st) => {
                const active = evolution.stage === st.stage;
                return (
                  <button
                    key={st.stage}
                    type="button"
                    onClick={() =>
                      onUpdateConfig((prev) => ({
                        ...prev,
                        commits: st.sampleCommits,
                      }))
                    }
                    className={`rounded-lg border py-1.5 font-mono text-xs font-semibold transition ${
                      active
                        ? "border-primary bg-primary text-primary-foreground"
                        : "bg-muted/40 text-foreground hover:bg-muted"
                    }`}
                  >
                    S{st.stage}
                  </button>
                );
              })}
            </div>
          </div>

          <Separator />

          {/* 2. Swimming Speed */}
          <div className="flex flex-col gap-2.5">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-1.5 font-mono text-xs font-medium text-foreground">
                <Gauge className="size-3.5 text-muted-foreground" />
                Swimming Speed
              </div>
              <div className="flex items-center gap-1">
                {SPEED_PRESETS.map((preset) => {
                  const active = Math.abs(config.animationSpeed - preset.value) < 0.08;
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

          {/* 3. HUD Toggle */}
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
                  Stage, commit count &amp; top languages at bottom left
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
