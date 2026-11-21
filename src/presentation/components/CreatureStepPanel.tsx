"use client";

import { ArrowRight, Camera, Palette, Sliders, Sparkles } from "lucide-react";
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
import { Field, FieldDescription, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";

interface CreatureStepPanelProps {
  config: CreatureConfig;
  customBgHex: string;
  onSelectCreature: (creature: CreatureId) => void;
  onSelectView: (view: CameraView) => void;
  onApplyPreset: (id: (typeof THEME_PRESETS)[number]["id"]) => void;
  onUpdateColor: (key: "primary" | "accent" | "energy", hex: string) => void;
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
  const meta = getCreatureMeta(config.creature);
  const evolution = getEvolutionStage(config.commits);

  const handleCreaturePick = (id: CreatureId) => {
    onSelectCreature(id);
    if (id === "jellyfish" && config.themeId === "ocean-slate") {
      onApplyPreset("biolume-azure");
    } else if (id === "tulkun" && config.themeId === "biolume-azure") {
      onApplyPreset("ocean-slate");
    }
  };

  return (
    <div className="flex flex-col gap-5">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Sparkles className="size-4 text-primary" />
            <CardTitle className="font-mono">Choose Pixel Creature</CardTitle>
          </div>
          <CardDescription>
            Pick either left-facing animated marine guardian. Changes stream live on the
            right canvas.
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
                  onClick={() => handleCreaturePick(item.id)}
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
            <ToggleGroup
              value={[config.view]}
              onValueChange={(vals) => {
                const v = vals[0] as CameraView | undefined;
                if (v) onSelectView(v);
              }}
              variant="outline"
              className="grid w-full grid-cols-3"
            >
              {CAMERA_VIEWS.map((v) => (
                <ToggleGroupItem key={v.id} value={v.id} className="font-mono text-xs">
                  {v.shortLabel}
                </ToggleGroupItem>
              ))}
            </ToggleGroup>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Palette className="size-4 text-primary" />
            <CardTitle className="font-mono">Colors &amp; Canvas Background</CardTitle>
          </div>
          <CardDescription>
            Choose a curated pixel palette or customize individual channels.
          </CardDescription>
        </CardHeader>

        <CardContent className="flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-2.5">
            {THEME_PRESETS.map((preset) => {
              const active =
                config.colorMode === "canonical" && config.themeId === preset.id;
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

          <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-3">
            {(
              [
                { key: "primary", label: "Body Armor" },
                { key: "accent", label: "Crest Accent" },
                { key: "energy", label: "Glow Stripe" },
              ] as const
            ).map((item) => (
              <label
                key={item.key}
                className="flex cursor-pointer items-center justify-between rounded-lg border bg-muted/40 px-3 py-2"
              >
                <div className="flex flex-col">
                  <span className="text-xs font-medium text-foreground">
                    {item.label}
                  </span>
                  <span className="font-mono text-[11px] text-muted-foreground">
                    {config.colors[item.key]}
                  </span>
                </div>
                <input
                  type="color"
                  value={normalizeHex(config.colors[item.key])}
                  onChange={(e) => onUpdateColor(item.key, e.target.value)}
                  className="size-7 cursor-pointer rounded border bg-transparent"
                />
              </label>
            ))}
          </div>

          <div className="flex flex-col gap-2">
            <span className="font-mono text-xs font-medium text-muted-foreground">
              Canvas Background
            </span>
            <ToggleGroup
              value={[config.backgroundMode]}
              onValueChange={(vals) => {
                const mode = vals[0] as BackgroundMode | undefined;
                if (mode) onSetBackgroundMode(mode);
              }}
              variant="outline"
              className="grid w-full grid-cols-4"
            >
              <ToggleGroupItem value="transparent" className="text-xs">
                Transparent
              </ToggleGroupItem>
              <ToggleGroupItem value="black" className="text-xs">
                Black
              </ToggleGroupItem>
              <ToggleGroupItem value="github-dark" className="text-xs">
                GitHub
              </ToggleGroupItem>
              <ToggleGroupItem value="custom" className="text-xs">
                Custom
              </ToggleGroupItem>
            </ToggleGroup>

            {config.backgroundMode === "custom" && (
              <div className="flex items-center justify-between rounded-lg border bg-muted/40 px-3 py-2">
                <span className="font-mono text-xs text-muted-foreground">
                  Custom Background Hex
                </span>
                <input
                  type="color"
                  value={customBgHex}
                  onChange={(e) => onUpdateCustomBg(e.target.value)}
                  className="h-7 w-10 cursor-pointer rounded border bg-transparent"
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
            <CardTitle className="font-mono">
              Stage, Swimming Speed &amp; HUD
            </CardTitle>
          </div>
          <CardDescription>
            Preview anatomical growth and adjust swim tempo.
          </CardDescription>
        </CardHeader>

        <CardContent className="flex flex-col gap-5">
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between font-mono text-xs">
              <span className="font-medium text-foreground">Evolution Stage</span>
              <span className="text-muted-foreground">
                Stage {evolution.stage}: {evolution.rank} ({evolution.rangeLabel})
              </span>
            </div>
            <ToggleGroup
              value={[String(evolution.stage)]}
              onValueChange={(vals) => {
                const v = Number(vals[0]);
                const target = STAGE_DEFINITIONS.find((s) => s.stage === v);
                if (target) {
                  onUpdateConfig((prev) => ({
                    ...prev,
                    commits: target.sampleCommits,
                  }));
                }
              }}
              variant="outline"
              className="grid w-full grid-cols-5"
            >
              {STAGE_DEFINITIONS.map((st) => (
                <ToggleGroupItem
                  key={st.stage}
                  value={String(st.stage)}
                  className="font-mono text-xs"
                >
                  S{st.stage}
                </ToggleGroupItem>
              ))}
            </ToggleGroup>
          </div>

          <FieldGroup>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Field>
                <div className="flex items-center justify-between font-mono text-xs">
                  <FieldLabel>Swim Tempo</FieldLabel>
                  <span>{config.animationSpeed.toFixed(1)}x</span>
                </div>
                <Slider
                  min={0.5}
                  max={2.5}
                  step={0.1}
                  value={[config.animationSpeed]}
                  onValueChange={(vals) => {
                    const nextVal = Array.isArray(vals) ? vals[0] : vals;
                    onUpdateConfig((prev) => ({
                      ...prev,
                      animationSpeed: Number(nextVal ?? 1),
                    }));
                  }}
                />
              </Field>

              <Field>
                <FieldLabel htmlFor="commits-preview-input" className="font-mono text-xs">
                  Commits Preview
                </FieldLabel>
                <Input
                  id="commits-preview-input"
                  type="number"
                  min={0}
                  max={999999}
                  value={config.commits}
                  onChange={(e) =>
                    onUpdateConfig((prev) => ({
                      ...prev,
                      commits: Math.max(0, parseInt(e.target.value || "0", 10)),
                    }))
                  }
                  className="font-mono"
                />
              </Field>
            </div>

            <Field
              orientation="horizontal"
              className="justify-between rounded-lg border bg-muted/40 p-3.5"
            >
              <div className="flex flex-col gap-0.5">
                <FieldLabel htmlFor="hud-toggle" className="font-mono text-xs">
                  Pixel Telemetry HUD
                </FieldLabel>
                <FieldDescription className="text-xs">
                  Renders pixel bitmap stage, commits &amp; languages at bottom left
                </FieldDescription>
              </div>
              <Switch
                id="hud-toggle"
                checked={config.showHud}
                onCheckedChange={(checked) =>
                  onUpdateConfig((prev) => ({ ...prev, showHud: Boolean(checked) }))
                }
              />
            </Field>

            {config.showHud && (
              <Field>
                <FieldLabel htmlFor="hud-title-input" className="font-mono text-xs">
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
                  className="font-mono"
                />
              </Field>
            )}
          </FieldGroup>
        </CardContent>
      </Card>

      <Button type="button" size="lg" onClick={onNextStep} className="w-full">
        Next: Customize Profile README
        <ArrowRight data-icon="inline-end" />
      </Button>
    </div>
  );
}
