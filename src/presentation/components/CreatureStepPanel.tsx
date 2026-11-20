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

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-[#363d4a] dark:bg-[#1e222a]">
        <div className="mb-4 flex items-center gap-2.5">
          <Sparkles className="h-5 w-5 text-slate-700 dark:text-slate-300" />
          <div>
            <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">
              Choose Your Cyber Creature
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Pick the animated guardian that will appear on your GitHub profile.
            </p>
          </div>
        </div>

        <div className="space-y-3">
          {CREATURE_CATALOG.map((item) => {
            const selected = config.creature === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onSelectCreature(item.id)}
                className={`flex w-full items-start justify-between gap-4 rounded-xl border p-4 text-left transition ${
                  selected
                    ? "border-indigo-600 bg-indigo-50/70 ring-1 ring-indigo-600 dark:border-indigo-400 dark:bg-[#272c36] dark:ring-indigo-400"
                    : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/50 dark:border-[#363d4a] dark:bg-[#272c36] dark:hover:border-slate-500"
                }`}
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                      {item.name}
                    </span>
                    <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-600 dark:bg-[#313744] dark:text-slate-300">
                      {item.subtitle}
                    </span>
                  </div>
                  <p className="mt-1.5 text-sm leading-relaxed text-slate-500 dark:text-slate-400">
                    {item.description}
                  </p>
                </div>
                <span
                  className={`mt-1 h-4 w-4 shrink-0 rounded-full border-2 ${
                    selected
                      ? "border-indigo-600 bg-indigo-600 dark:border-indigo-400 dark:bg-indigo-400"
                      : "border-slate-300 dark:border-[#454e5e]"
                  }`}
                />
              </button>
            );
          })}
        </div>

        <div className="mt-6 border-t border-slate-100 pt-5 dark:border-[#363d4a]">
          <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-900 dark:text-slate-100">
            <Camera className="h-4 w-4 text-slate-500" />
            Camera Perspective
          </div>
          <div className="grid grid-cols-3 gap-2.5">
            {CAMERA_VIEWS.map((v) => (
              <button
                key={v.id}
                type="button"
                onClick={() => onSelectView(v.id)}
                className={`rounded-xl border px-4 py-2.5 text-sm font-medium transition ${
                  config.view === v.id
                    ? "border-indigo-600 bg-indigo-600 text-white dark:border-indigo-400 dark:bg-indigo-500 dark:text-white"
                    : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50 dark:border-[#363d4a] dark:bg-[#272c36] dark:text-slate-300"
                }`}
              >
                {v.shortLabel}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-[#363d4a] dark:bg-[#1e222a]">
        <div className="mb-4 flex items-center gap-2.5">
          <Palette className="h-5 w-5 text-slate-700 dark:text-slate-300" />
          <div>
            <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">
              Colors &amp; Canvas Background
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Start with a preset or customize each armor and glow color.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {THEME_PRESETS.map((preset) => {
            const active =
              config.colorMode === "canonical" && config.themeId === preset.id;
            return (
              <button
                key={preset.id}
                type="button"
                onClick={() => onApplyPreset(preset.id)}
                className={`flex flex-col rounded-xl border p-3.5 text-left transition ${
                  active
                    ? "border-indigo-600 bg-indigo-50/70 ring-1 ring-indigo-600 dark:border-indigo-400 dark:bg-[#272c36] dark:ring-indigo-400"
                    : "border-slate-200 bg-white hover:border-slate-300 dark:border-[#363d4a] dark:bg-[#1e222a]"
                }`}
              >
                <div className="flex items-center gap-2">
                  <span
                    className="h-4 w-4 rounded-full border border-slate-300"
                    style={{ backgroundColor: preset.colors.primary }}
                  />
                  <span
                    className="h-4 w-4 rounded-full border border-slate-300"
                    style={{ backgroundColor: preset.colors.accent }}
                  />
                  <span
                    className="h-4 w-4 rounded-full border border-slate-300"
                    style={{ backgroundColor: preset.colors.energy }}
                  />
                </div>
                <span className="mt-2 text-sm font-semibold text-slate-900 dark:text-slate-100">
                  {preset.name}
                </span>
              </button>
            );
          })}
        </div>

        <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
          {(
            [
              { key: "primary", label: "Primary Armor" },
              { key: "accent", label: "Wing & Tip Accent" },
              { key: "energy", label: "Energy Glow" },
            ] as const
          ).map((item) => (
            <label
              key={item.key}
              className="flex cursor-pointer items-center justify-between rounded-xl border border-slate-200 bg-slate-50/70 px-3.5 py-2.5 dark:border-[#363d4a] dark:bg-[#272c36]"
            >
              <div>
                <div className="text-xs font-medium text-slate-700 dark:text-slate-200">
                  {item.label}
                </div>
                <div className="font-mono text-xs text-slate-500 dark:text-slate-400">
                  {config.colors[item.key]}
                </div>
              </div>
              <input
                type="color"
                value={normalizeHex(config.colors[item.key])}
                onChange={(e) => onUpdateColor(item.key, e.target.value)}
                className="h-8 w-8 cursor-pointer rounded-md border border-slate-300 bg-transparent"
              />
            </label>
          ))}
        </div>

        <div className="mt-4">
          <div className="mb-2 text-xs font-medium text-slate-600 dark:text-slate-400">
            SVG Background
          </div>
          <div className="grid grid-cols-4 gap-2">
            {(
              [
                { id: "transparent", label: "Transparent" },
                { id: "black", label: "Black" },
                { id: "github-dark", label: "GitHub Dark" },
                { id: "custom", label: "Custom" },
              ] as const
            ).map((bg) => (
              <button
                key={bg.id}
                type="button"
                onClick={() => onSetBackgroundMode(bg.id)}
                className={`rounded-lg border px-2 py-2 text-xs font-medium transition ${
                  config.backgroundMode === bg.id
                    ? "border-indigo-600 bg-indigo-600 text-white dark:border-indigo-400 dark:bg-indigo-500 dark:text-white"
                    : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50 dark:border-[#363d4a] dark:bg-[#272c36] dark:text-slate-300"
                }`}
              >
                {bg.label}
              </button>
            ))}
          </div>
          {config.backgroundMode === "custom" && (
            <div className="mt-3 flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2 dark:border-[#363d4a] dark:bg-[#272c36]">
              <span className="text-xs font-medium text-slate-600 dark:text-slate-300">
                Custom Background Hex
              </span>
              <input
                type="color"
                value={customBgHex}
                onChange={(e) => onUpdateCustomBg(e.target.value)}
                className="h-7 w-10 cursor-pointer rounded border border-slate-300 bg-transparent"
              />
            </div>
          )}
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-[#363d4a] dark:bg-[#1e222a]">
        <div className="mb-4 flex items-center gap-2.5">
          <Sliders className="h-5 w-5 text-slate-700 dark:text-slate-300" />
          <div>
            <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">
              Evolution Stage, Motion &amp; HUD
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Preview growth stages, swim speed, and bottom telemetry text.
            </p>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <div className="mb-2 flex items-center justify-between text-xs font-medium text-slate-700 dark:text-slate-300">
              <span>Evolution Stage Preview</span>
              <span className="font-mono text-slate-500">
                Stage {evolution.stage}: {evolution.rank} ({evolution.rangeLabel})
              </span>
            </div>
            <div className="grid grid-cols-5 gap-2">
              {STAGE_DEFINITIONS.map((st) => (
                <button
                  key={st.stage}
                  type="button"
                  onClick={() =>
                    onUpdateConfig((prev) => ({
                      ...prev,
                      commits: st.sampleCommits,
                    }))
                  }
                  className={`rounded-lg border py-2 text-xs font-semibold transition ${
                    evolution.stage === st.stage
                      ? "border-indigo-600 bg-indigo-600 text-white dark:border-indigo-400 dark:bg-indigo-500 dark:text-white"
                      : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50 dark:border-[#363d4a] dark:bg-[#272c36] dark:text-slate-300"
                  }`}
                >
                  Stage {st.stage}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <div className="mb-1.5 flex items-center justify-between text-xs font-medium text-slate-700 dark:text-slate-300">
                <label htmlFor="speed-input">Animation Speed</label>
                <span className="font-mono">{config.animationSpeed.toFixed(1)}x</span>
              </div>
              <input
                id="speed-input"
                type="range"
                min={0.5}
                max={2.5}
                step={0.1}
                value={config.animationSpeed}
                onChange={(e) =>
                  onUpdateConfig((prev) => ({
                    ...prev,
                    animationSpeed: parseFloat(e.target.value),
                  }))
                }
                className="w-full cursor-pointer accent-slate-900 dark:accent-indigo-400"
              />
            </div>

            <div>
              <label
                htmlFor="commits-preview-input"
                className="mb-1.5 block text-xs font-medium text-slate-700 dark:text-slate-300"
              >
                Commits Counter Preview
              </label>
              <input
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
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900 focus:border-slate-900 focus:bg-white focus:outline-none dark:border-[#363d4a] dark:bg-[#272c36] dark:text-slate-100"
              />
            </div>
          </div>

          <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 dark:border-[#363d4a] dark:bg-[#272c36]">
            <div>
              <div className="text-sm font-medium text-slate-900 dark:text-slate-100">
                Show Bottom HUD Bar
              </div>
              <div className="text-xs text-slate-500 dark:text-slate-400">
                Displays stage, custom title, and commit count inside the SVG
              </div>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={config.showHud}
              onClick={() =>
                onUpdateConfig((prev) => ({ ...prev, showHud: !prev.showHud }))
              }
              className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full transition ${
                config.showHud
                  ? "bg-indigo-600 dark:bg-indigo-500"
                  : "bg-slate-300 dark:bg-[#454e5e]"
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
                  config.showHud ? "translate-x-6" : "translate-x-1"
                }`}
              />
            </button>
          </div>

          {config.showHud && (
            <div>
              <label
                htmlFor="hud-title-input"
                className="mb-1.5 block text-xs font-medium text-slate-700 dark:text-slate-300"
              >
                Custom SVG HUD Title
              </label>
              <input
                id="hud-title-input"
                type="text"
                maxLength={42}
                placeholder={`${evolution.rank} ${meta.name.toUpperCase()}`}
                value={config.customTitle}
                onChange={(e) =>
                  onUpdateConfig((prev) => ({
                    ...prev,
                    customTitle: e.target.value,
                  }))
                }
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:border-slate-900 focus:bg-white focus:outline-none dark:border-[#363d4a] dark:bg-[#272c36] dark:text-slate-100"
              />
            </div>
          )}
        </div>
      </div>

      <button
        type="button"
        onClick={onNextStep}
        className="flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 py-3.5 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700 dark:bg-indigo-500 dark:text-white dark:hover:bg-indigo-400"
      >
        Next: Customize Profile README
        <ArrowRight className="h-4 w-4" />
      </button>
    </div>
  );
}
