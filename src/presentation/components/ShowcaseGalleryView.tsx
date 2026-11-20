"use client";

import { useState } from "react";
import { ArrowRight, Clock, Layers, ShieldCheck, Sparkles } from "lucide-react";
import {
  CREATURE_CATALOG,
  STAGE_DEFINITIONS,
  THEME_PRESETS,
  type CreatureConfig,
} from "@/domain/creature/entities";
import { README_TEMPLATES, type ReadmeConfig } from "@/domain/profile/entities";
import {
  buildActionLinkBadgeUrl,
  buildShieldBadgeUrl,
  resolveDynamicTokens,
} from "@/domain/profile/readmeService";
import { CreatureSvgView } from "./CreatureSvgView";
import { ShareCardSvgView } from "./ShareCardSvgView";

interface ShowcaseGalleryViewProps {
  creatureConfig: CreatureConfig;
  readmeConfig: ReadmeConfig;
  onStartCustomize: () => void;
}

export function ShowcaseGalleryView({
  creatureConfig,
  readmeConfig,
  onStartCustomize,
}: ShowcaseGalleryViewProps) {
  const [previewCreature, setPreviewCreature] = useState(creatureConfig.creature);
  const [previewThemeId, setPreviewThemeId] = useState(creatureConfig.themeId);
  const [previewStage, setPreviewStage] = useState<number>(4);

  const selectedTheme =
    THEME_PRESETS.find((t) => t.id === previewThemeId) ?? THEME_PRESETS[0];
  const stageObj =
    STAGE_DEFINITIONS.find((s) => s.stage === previewStage) ??
    STAGE_DEFINITIONS[3];

  const showcaseConfig: CreatureConfig = {
    ...creatureConfig,
    creature: previewCreature,
    themeId: selectedTheme.id,
    colorMode: "canonical",
    commits: stageObj.sampleCommits,
    username: "your-username",
    colors: {
      ...selectedTheme.colors,
      background: "transparent",
    },
  };

  const sampleBadges = readmeConfig.badges.filter((b) => b.enabled).slice(0, 10);
  const sampleLinks = readmeConfig.actionLinks.filter((l) => l.enabled);

  return (
    <div className="mx-auto max-w-6xl space-y-12 py-4">
      <section className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm dark:border-[#363d4a] dark:bg-[#1e222a] sm:p-10">
        <div className="flex flex-col items-start justify-between gap-6 md:flex-row md:items-center">
          <div className="max-w-2xl space-y-3">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-700 dark:bg-indigo-500/15 dark:text-indigo-300">
              <Sparkles className="h-3.5 w-3.5" />
              Pure CSS Animated SVG + Profile Template Studio
            </span>
            <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100 sm:text-3xl">
              Explore Cybernetic Creatures &amp; Profile README Designs
            </h2>
            <p className="text-base leading-relaxed text-slate-600 dark:text-slate-300">
              Browse the animated creatures, color palettes, evolution stages, and
              customizable README template below. Click{" "}
              <strong className="font-semibold text-slate-900 dark:text-slate-100">
                Add Profile
              </strong>{" "}
              when you are ready to customize with your own GitHub username.
            </p>
          </div>

          <button
            type="button"
            onClick={onStartCustomize}
            className="inline-flex shrink-0 items-center gap-2 rounded-xl bg-indigo-600 px-6 py-3.5 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-400"
          >
            <span>Add / Customize Profile</span>
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </section>

      <section className="grid items-start gap-8 lg:grid-cols-12">
        <div className="space-y-4 lg:col-span-5">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-[#363d4a] dark:bg-[#1e222a]">
            <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100">
              Available Cyber Creatures
            </h3>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              Preview each animated SVG model in real time.
            </p>
            <div className="mt-4 space-y-2.5">
              {CREATURE_CATALOG.map((item) => {
                const active = previewCreature === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setPreviewCreature(item.id)}
                    className={`w-full rounded-xl border p-4 text-left transition ${
                      active
                        ? "border-indigo-600 bg-indigo-50/70 ring-1 ring-indigo-600 dark:border-indigo-400 dark:bg-[#272c36] dark:ring-indigo-400"
                        : "border-slate-200 bg-slate-50/60 hover:border-slate-300 dark:border-[#363d4a] dark:bg-[#272c36]/60 dark:hover:border-slate-500"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                        {item.name}
                      </span>
                      <span className="rounded-full bg-white px-2.5 py-0.5 text-xs font-medium text-slate-600 dark:bg-[#1e222a] dark:text-slate-300">
                        {item.subtitle}
                      </span>
                    </div>
                    <p className="mt-1.5 text-xs leading-relaxed text-slate-600 dark:text-slate-400">
                      {item.description}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-[#363d4a] dark:bg-[#1e222a]">
            <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100">
              Available Color Themes &amp; Evolution Stages
            </h3>
            <div className="mt-4 grid grid-cols-2 gap-2.5">
              {THEME_PRESETS.map((theme) => {
                const active = previewThemeId === theme.id;
                return (
                  <button
                    key={theme.id}
                    type="button"
                    onClick={() => setPreviewThemeId(theme.id)}
                    className={`rounded-xl border p-3 text-left transition ${
                      active
                        ? "border-indigo-600 bg-indigo-50/60 dark:border-indigo-400 dark:bg-[#272c36]"
                        : "border-slate-200 bg-slate-50/50 hover:border-slate-300 dark:border-[#363d4a] dark:bg-[#272c36]/50"
                    }`}
                  >
                    <div className="flex items-center gap-1.5">
                      <span
                        className="h-3.5 w-3.5 rounded-full border border-slate-300 dark:border-slate-500"
                        style={{ backgroundColor: theme.colors.primary }}
                      />
                      <span
                        className="h-3.5 w-3.5 rounded-full border border-slate-300 dark:border-slate-500"
                        style={{ backgroundColor: theme.colors.accent }}
                      />
                      <span
                        className="h-3.5 w-3.5 rounded-full border border-slate-300 dark:border-slate-500"
                        style={{ backgroundColor: theme.colors.energy }}
                      />
                    </div>
                    <div className="mt-2 text-xs font-semibold text-slate-900 dark:text-slate-100">
                      {theme.name}
                    </div>
                  </button>
                );
              })}
            </div>

            <div className="mt-4 grid grid-cols-5 gap-2">
              {STAGE_DEFINITIONS.map((st) => (
                <button
                  key={st.stage}
                  type="button"
                  onClick={() => setPreviewStage(st.stage)}
                  className={`rounded-lg border py-2 text-xs font-semibold transition ${
                    previewStage === st.stage
                      ? "border-indigo-600 bg-indigo-600 text-white dark:border-indigo-500 dark:bg-indigo-500"
                      : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50 dark:border-[#363d4a] dark:bg-[#272c36] dark:text-slate-200 dark:hover:bg-[#2f3642]"
                  }`}
                >
                  S{st.stage}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-6 lg:col-span-7">
          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-[#363d4a] dark:bg-[#1e222a]">
            <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4 dark:border-[#363d4a]">
              <div>
                <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                  Live Animated SVG Showcase
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Stage {stageObj.stage}: {stageObj.rank} · Works inside any GitHub README without JavaScript
                </p>
              </div>
              <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700 dark:bg-[#272c36] dark:text-slate-200">
                Read-Only Preview
              </span>
            </div>
            <div className="bg-[#0d1117] p-5">
              <CreatureSvgView config={showcaseConfig} className="w-full" />
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-[#363d4a] dark:bg-[#1e222a]">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100">
                  Sample Profile README Template
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Every heading, bio, tech badge, link button, and footer becomes editable once you add your username
                </p>
              </div>
            </div>

            <div className="space-y-4 rounded-xl border border-slate-200 bg-slate-50 p-5 dark:border-[#363d4a] dark:bg-[#272c36]">
              <h4 className="border-b border-slate-200 pb-2 text-lg font-semibold text-slate-900 dark:border-[#363d4a] dark:text-slate-100">
                Your Name | Software Engineer
              </h4>
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                {readmeConfig.subtitleTags.join(" | ")}
              </p>
              <p className="text-sm leading-relaxed text-slate-700 dark:text-slate-300">
                {resolveDynamicTokens(readmeConfig.bio, showcaseConfig)}
              </p>
              <div className="flex flex-wrap gap-1.5">
                {sampleBadges.map((b) => (
                  <img
                    key={b.id}
                    src={buildShieldBadgeUrl(b)}
                    alt={b.label}
                    className="h-6 rounded"
                  />
                ))}
              </div>
              <div className="flex flex-wrap gap-2">
                {sampleLinks.map((l) => (
                  <img
                    key={l.id}
                    src={buildActionLinkBadgeUrl(l, showcaseConfig)}
                    alt={l.label}
                    className="h-6 rounded"
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-6 md:grid-cols-3">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-[#363d4a] dark:bg-[#1e222a]">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 dark:bg-indigo-500/15 dark:text-indigo-300">
            <Layers className="h-5 w-5" />
          </div>
          <h3 className="mt-4 text-base font-semibold text-slate-900 dark:text-slate-100">
            {README_TEMPLATES.length} Layout Templates &amp; Drag-Drop Stack
          </h3>
          <p className="mt-1.5 text-sm leading-relaxed text-slate-600 dark:text-slate-300">
            Arrange your language &amp; tool shields by dragging them into order, customize
            every paragraph, or add an optional 1280×640 Social Card.
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-[#363d4a] dark:bg-[#1e222a]">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 dark:bg-indigo-500/15 dark:text-indigo-300">
            <Clock className="h-5 w-5" />
          </div>
          <h3 className="mt-4 text-base font-semibold text-slate-900 dark:text-slate-100">
            12:00 AM Daily Auto-Evolve Option
          </h3>
          <p className="mt-1.5 text-sm leading-relaxed text-slate-600 dark:text-slate-300">
            Keep your creature growing across all 5 anatomical stages automatically every
            midnight based on your public commit activity.
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-[#363d4a] dark:bg-[#1e222a]">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 dark:bg-indigo-500/15 dark:text-indigo-300">
            <ShieldCheck className="h-5 w-5" />
          </div>
          <h3 className="mt-4 text-base font-semibold text-slate-900 dark:text-slate-100">
            Private In-Browser GitHub Push
          </h3>
          <p className="mt-1.5 text-sm leading-relaxed text-slate-600 dark:text-slate-300">
            Your Personal Access Token stays only in browser memory for the push request
            and is never stored or logged anywhere.
          </p>
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-[#363d4a] dark:bg-[#1e222a]">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100">
              1280×640 Shareable Social Banner Preview
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Optional exportable banner included alongside your animated README creature
            </p>
          </div>
        </div>
        <div className="overflow-hidden rounded-xl border border-slate-200 dark:border-[#363d4a]">
          <ShareCardSvgView config={showcaseConfig} className="w-full" />
        </div>
      </section>
    </div>
  );
}
