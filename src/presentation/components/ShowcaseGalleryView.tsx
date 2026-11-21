"use client";

import { useState } from "react";
import { ArrowRight, Clock, Cpu, Layers, ShieldCheck, Sparkles } from "lucide-react";
import {
  CAMERA_VIEWS,
  CREATURE_CATALOG,
  STAGE_DEFINITIONS,
  THEME_PRESETS,
  type CameraView,
  type CreatureConfig,
} from "@/domain/creature/entities";
import { getCreatureMeta } from "@/domain/creature/services";
import type { ReadmeBadge, ReadmeConfig } from "@/domain/profile/entities";
import {
  buildActionLinkBadgeUrl,
  buildShieldBadgeUrl,
  resolveDynamicTokens,
} from "@/domain/profile/readmeService";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { CreatureAnimatedView } from "./CreatureAnimatedView";
import { ShareCardCanvasView } from "./ShareCardCanvasView";

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
  const [previewView, setPreviewView] = useState<CameraView>(creatureConfig.view);
  const [previewThemeId, setPreviewThemeId] = useState(creatureConfig.themeId);
  const [previewStage, setPreviewStage] = useState<number>(4);

  const selectedTheme =
    THEME_PRESETS.find((t) => t.id === previewThemeId) ?? THEME_PRESETS[0];
  const stageObj =
    STAGE_DEFINITIONS.find((s) => s.stage === previewStage) ??
    STAGE_DEFINITIONS[3];
  const meta = getCreatureMeta(previewCreature);

  const showcaseConfig: CreatureConfig = {
    ...creatureConfig,
    creature: previewCreature,
    view: meta.supportsViewSelection ? previewView : "side",
    themeId: selectedTheme.id,
    colorMode: "canonical",
    commits: stageObj.sampleCommits,
    username: "your-username",
    colors: {
      ...selectedTheme.colors,
      background: "transparent",
    },
    backgroundMode: "transparent",
  };

  const badgeById = new Map(readmeConfig.badges.map((b) => [b.id, b]));
  const sampleBadges = readmeConfig.stackCards
    .flatMap((card) =>
      card.badgeIds
        .map((id) => badgeById.get(id))
        .filter((b): b is ReadmeBadge => Boolean(b))
    )
    .slice(0, 10);
  const sampleLinks = readmeConfig.actionLinks.filter((l) => l.enabled);

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-6 py-2">
      <Card>
        <CardContent className="flex flex-col items-start justify-between gap-6 p-6 md:flex-row md:items-center">
          <div className="flex flex-col gap-2.5">
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="font-mono">
                <Sparkles data-icon="inline-start" />
                ANIMATED WEBP + GIF
              </Badge>
              <Badge variant="outline" className="font-mono">
                GITHUB PROFILE STUDIO
              </Badge>
            </div>
            <h1 className="font-mono text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
              Pixel-Art Marine Creatures for GitHub READMEs
            </h1>
            <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground">
              Preview the S-curve swimming Tulkun (Top &amp; Side views) and pulsing
              Bioluminescent Jellyfish below. Click{" "}
              <strong className="text-foreground">Add Profile</strong> to customize
              everything with your GitHub username.
            </p>
          </div>

          <Button type="button" size="lg" onClick={onStartCustomize}>
            Add Profile
            <ArrowRight data-icon="inline-end" />
          </Button>
        </CardContent>
      </Card>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div
          className="flex flex-col justify-between gap-3 rounded-xl border p-4"
          style={{
            backgroundColor: "var(--tile-coral)",
            color: "var(--tile-coral-ink)",
          }}
        >
          <div className="flex items-center justify-between font-mono text-xs font-medium opacity-85">
            <span>Pixel Creatures</span>
            <Cpu className="size-4" />
          </div>
          <div className="font-mono text-3xl font-bold tracking-tight">02</div>
          <div className="font-mono text-xs opacity-80">
            Tulkun (Top/Side) &amp; Jellyfish
          </div>
        </div>

        <div
          className="flex flex-col justify-between gap-3 rounded-xl border p-4"
          style={{
            backgroundColor: "var(--tile-violet)",
            color: "var(--tile-violet-ink)",
          }}
        >
          <div className="flex items-center justify-between font-mono text-xs font-medium opacity-85">
            <span>Growth Stages</span>
            <Layers className="size-4" />
          </div>
          <div className="font-mono text-3xl font-bold tracking-tight">05</div>
          <div className="font-mono text-xs opacity-80">
            Scales dynamically with commits
          </div>
        </div>

        <div
          className="flex flex-col justify-between gap-3 rounded-xl border p-4"
          style={{
            backgroundColor: "var(--tile-mint)",
            color: "var(--tile-mint-ink)",
          }}
        >
          <div className="flex items-center justify-between font-mono text-xs font-medium opacity-85">
            <span>Auto-Evolve</span>
            <Clock className="size-4" />
          </div>
          <div className="font-mono text-3xl font-bold tracking-tight">12 AM</div>
          <div className="font-mono text-xs opacity-80">
            Scheduled midnight GitHub Action
          </div>
        </div>

        <div
          className="flex flex-col justify-between gap-3 rounded-xl border p-4"
          style={{
            backgroundColor: "var(--tile-indigo)",
            color: "var(--tile-indigo-ink)",
          }}
        >
          <div className="flex items-center justify-between font-mono text-xs font-medium opacity-85">
            <span>Token Storage</span>
            <ShieldCheck className="size-4" />
          </div>
          <div className="font-mono text-3xl font-bold tracking-tight">RAM</div>
          <div className="font-mono text-xs opacity-80">
            Zero persistence, wiped after push
          </div>
        </div>
      </div>

      <div className="grid items-start gap-6 lg:grid-cols-12">
        <div className="flex flex-col gap-4 lg:col-span-5">
          <Card>
            <CardHeader>
              <CardTitle className="font-mono">Available Creatures</CardTitle>
              <CardDescription>
                Select either sprite-animated creature to inspect live swimming motion.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-3">
              {CREATURE_CATALOG.map((item) => {
                const active = previewCreature === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => {
                      setPreviewCreature(item.id);
                      if (!item.supportsViewSelection) {
                        setPreviewView("side");
                      }
                      if (item.id === "jellyfish" && previewThemeId === "ocean-slate") {
                        setPreviewThemeId("biolume-azure");
                      } else if (item.id === "tulkun" && previewThemeId === "biolume-azure") {
                        setPreviewThemeId("ocean-slate");
                      }
                    }}
                    className={`flex flex-col gap-1.5 rounded-lg border p-3.5 text-left transition ${
                      active
                        ? "border-primary bg-accent/60 ring-1 ring-primary"
                        : "bg-muted/40 hover:bg-muted"
                    }`}
                  >
                    <div className="flex items-center justify-between">
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

              {meta.supportsViewSelection && (
                <div className="grid grid-cols-2 gap-2 pt-1">
                  {CAMERA_VIEWS.map((view) => {
                    const active = previewView === view.id;
                    return (
                      <button
                        key={view.id}
                        type="button"
                        onClick={() => setPreviewView(view.id)}
                        className={`rounded-lg border px-3 py-1.5 font-mono text-xs font-semibold transition ${
                          active
                            ? "border-primary bg-primary text-primary-foreground"
                            : "bg-muted/40 text-foreground hover:bg-muted"
                        }`}
                      >
                        {view.name}
                      </button>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="font-mono">Palettes &amp; Stages</CardTitle>
              <CardDescription>
                Colors and anatomical growth tiers included in WebP &amp; GIF export.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              <div className="grid grid-cols-2 gap-2">
                {THEME_PRESETS.map((theme) => {
                  const active = previewThemeId === theme.id;
                  return (
                    <button
                      key={theme.id}
                      type="button"
                      onClick={() => setPreviewThemeId(theme.id)}
                      className={`flex flex-col gap-2 rounded-lg border p-2.5 text-left transition ${
                        active
                          ? "border-primary bg-accent/60"
                          : "bg-muted/40 hover:bg-muted"
                      }`}
                    >
                      <div className="flex items-center gap-1.5">
                        <span
                          className="size-3.5 rounded-full border"
                          style={{ backgroundColor: theme.colors.primary }}
                        />
                        <span
                          className="size-3.5 rounded-full border"
                          style={{ backgroundColor: theme.colors.accent }}
                        />
                        <span
                          className="size-3.5 rounded-full border"
                          style={{ backgroundColor: theme.colors.energy }}
                        />
                      </div>
                      <span className="font-mono text-xs font-medium text-foreground">
                        {theme.name}
                      </span>
                    </button>
                  );
                })}
              </div>

              <div className="grid grid-cols-5 gap-1.5">
                {STAGE_DEFINITIONS.map((st) => {
                  const active = previewStage === st.stage;
                  return (
                    <button
                      key={st.stage}
                      type="button"
                      onClick={() => setPreviewStage(st.stage)}
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
            </CardContent>
          </Card>
        </div>

        <div className="flex flex-col gap-6 lg:col-span-7">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between border-b pb-4">
              <div className="flex flex-col gap-0.5">
                <CardTitle className="font-mono">
                  Live Pixel Animation Preview
                </CardTitle>
                <CardDescription className="font-mono text-xs">
                  Stage {stageObj.stage}: {stageObj.rank} · Transparent Canvas
                </CardDescription>
              </div>
              <Badge variant="outline" className="font-mono">
                Read-Only
              </Badge>
            </CardHeader>
            <CardContent className="p-0">
              <div className="transparency-grid p-4">
                <CreatureAnimatedView config={showcaseConfig} className="w-full" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="font-mono">Profile README Template</CardTitle>
              <CardDescription>
                Customize every heading, intro paragraph, 3+ drag-and-drop tech cards,
                and CTA links after adding your profile.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col gap-4 rounded-lg border bg-muted/40 p-5">
                <div className="border-b pb-2 font-mono text-base font-semibold text-foreground">
                  Your Name | Software Engineer
                </div>
                <p className="font-mono text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  {readmeConfig.subtitleTags.join(" | ")}
                </p>
                <p className="text-sm leading-relaxed text-muted-foreground">
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
            </CardContent>
          </Card>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="font-mono">Social Share Card (1280×640)</CardTitle>
          <CardDescription>
            Exportable PNG banner synchronized with your creature and commit stage.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-hidden rounded-lg border">
            <ShareCardCanvasView config={showcaseConfig} className="w-full" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
