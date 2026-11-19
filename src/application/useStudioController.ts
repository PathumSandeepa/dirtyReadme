"use client";

import { useMemo, useState } from "react";
import {
  DEFAULT_CREATURE_CONFIG,
  THEME_PRESETS,
  type BackgroundMode,
  type CameraView,
  type ContributionWindow,
  type CreatureConfig,
  type CreatureId,
} from "@/domain/creature/entities";
import {
  applyLanguageColors,
  resolveBackgroundHex,
} from "@/domain/creature/services";
import {
  generateCreatureSvgDocument,
  generateShareCardSvgDocument,
} from "@/domain/creature/svgRenderer";
import {
  DEFAULT_README_CONFIG,
  type ReadmeConfig,
} from "@/domain/profile/entities";
import {
  buildMarkerSection,
  getEffectiveReadmeMarkdown,
  reorderEnabledBadges,
  reorderItems,
} from "@/domain/profile/readmeService";
import {
  type GitHubProfileSnapshot,
  fetchGitHubProfileSnapshot,
} from "@/infrastructure/github/githubClient";

export function useStudioController() {
  const [creatureConfig, setCreatureConfig] = useState<CreatureConfig>(
    DEFAULT_CREATURE_CONFIG
  );
  const [readmeConfig, setReadmeConfig] = useState<ReadmeConfig>(
    DEFAULT_README_CONFIG
  );
  const [customBgHex, setCustomBgHex] = useState("#0B1020");
  const [snapshot, setSnapshot] = useState<GitHubProfileSnapshot | null>(null);
  const [syncLoading, setSyncLoading] = useState(false);
  const [syncError, setSyncError] = useState<string | null>(null);

  const creatureSvg = useMemo(
    () => generateCreatureSvgDocument(creatureConfig),
    [creatureConfig]
  );

  const shareCardSvg = useMemo(
    () => generateShareCardSvgDocument(creatureConfig),
    [creatureConfig]
  );

  const markerBlock = useMemo(
    () => buildMarkerSection(creatureConfig, readmeConfig),
    [creatureConfig, readmeConfig]
  );

  const fullReadmeMarkdown = useMemo(
    () => getEffectiveReadmeMarkdown(creatureConfig, readmeConfig),
    [creatureConfig, readmeConfig]
  );

  function selectCreature(creature: CreatureId) {
    setCreatureConfig((prev) => ({ ...prev, creature }));
  }

  function selectView(view: CameraView) {
    setCreatureConfig((prev) => ({ ...prev, view }));
  }

  function selectWindow(windowMode: ContributionWindow) {
    setCreatureConfig((prev) => ({
      ...prev,
      windowMode,
      commits: snapshot
        ? windowMode === "rolling"
          ? snapshot.rollingCommits
          : snapshot.annualCommits
        : prev.commits,
    }));
  }

  function applyThemePreset(presetId: (typeof THEME_PRESETS)[number]["id"]) {
    const preset = THEME_PRESETS.find((t) => t.id === presetId);
    if (!preset) return;
    setCreatureConfig((prev) => ({
      ...prev,
      colorMode: "canonical",
      themeId: preset.id,
      colors: {
        ...preset.colors,
        background: prev.colors.background,
      },
    }));
  }

  function syncLanguageColors() {
    setCreatureConfig((prev) => applyLanguageColors(prev, prev.languages));
  }

  function updateCreatureColor(
    key: "primary" | "accent" | "energy",
    hex: string
  ) {
    setCreatureConfig((prev) => ({
      ...prev,
      colorMode: "custom",
      themeId: "custom",
      colors: {
        ...prev.colors,
        [key]: hex.toUpperCase(),
      },
    }));
  }

  function setBackgroundMode(mode: BackgroundMode) {
    setCreatureConfig((prev) => ({
      ...prev,
      backgroundMode: mode,
      colors: {
        ...prev.colors,
        background: resolveBackgroundHex(mode, customBgHex),
      },
    }));
  }

  function updateCustomBackground(hex: string) {
    const normalized = hex.toUpperCase();
    setCustomBgHex(normalized);
    setCreatureConfig((prev) => ({
      ...prev,
      backgroundMode: "custom",
      colors: {
        ...prev.colors,
        background: normalized,
      },
    }));
  }

  function updateReadmeField<K extends keyof ReadmeConfig>(
    key: K,
    value: ReadmeConfig[K]
  ) {
    setReadmeConfig((prev) => ({
      ...prev,
      [key]: value,
      rawOverride: null,
    }));
  }

  function reorderBadges(draggedId: string, targetId: string) {
    setReadmeConfig((prev) => ({
      ...prev,
      rawOverride: null,
      badges: reorderEnabledBadges(prev.badges, draggedId, targetId),
    }));
  }

  function moveBadgeByStep(badgeId: string, direction: -1 | 1) {
    setReadmeConfig((prev) => {
      const enabled = prev.badges.filter((b) => b.enabled);
      const idx = enabled.findIndex((b) => b.id === badgeId);
      const nextIdx = idx + direction;
      if (idx === -1 || nextIdx < 0 || nextIdx >= enabled.length) {
        return prev;
      }
      const targetId = enabled[nextIdx].id;
      return {
        ...prev,
        rawOverride: null,
        badges: reorderEnabledBadges(prev.badges, badgeId, targetId),
      };
    });
  }

  function reorderSubtitleTags(fromIdx: number, toIdx: number) {
    setReadmeConfig((prev) => ({
      ...prev,
      rawOverride: null,
      subtitleTags: reorderItems(prev.subtitleTags, fromIdx, toIdx),
    }));
  }

  async function syncFromGitHub(targetUsername: string, authToken?: string) {
    setSyncLoading(true);
    setSyncError(null);
    try {
      const snap = await fetchGitHubProfileSnapshot(targetUsername, authToken);
      setSnapshot(snap);
      setCreatureConfig((prev) => {
        const nextCommits =
          prev.windowMode === "rolling"
            ? snap.rollingCommits
            : snap.annualCommits;
        const updated: CreatureConfig = {
          ...prev,
          username: snap.username,
          commits: nextCommits,
          languages: snap.languages,
        };
        return prev.colorMode === "languages"
          ? applyLanguageColors(updated, snap.languages)
          : updated;
      });

      setReadmeConfig((prev) => {
        const langSet = new Set(snap.languages.map((l) => l.name.toLowerCase()));
        const nextLinks = [
          {
            id: "github",
            label: "GITHUB",
            valueText: `@${snap.username}`,
            url: `https://github.com/${snap.username}`,
            color: "181717",
            logo: "github",
            enabled: true,
          },
          ...(snap.website
            ? [
                {
                  id: "website",
                  label: "WEBSITE",
                  valueText: snap.website
                    .replace(/^https?:\/\//i, "")
                    .replace(/\/$/, "")
                    .toUpperCase(),
                  url: snap.website,
                  color: "27272A",
                  logo: "googlechrome",
                  enabled: true,
                },
              ]
            : []),
          ...(snap.twitterUsername
            ? [
                {
                  id: "x",
                  label: "X",
                  valueText: `@${snap.twitterUsername}`,
                  url: `https://x.com/${snap.twitterUsername}`,
                  color: "09090B",
                  logo: "x",
                  enabled: true,
                },
              ]
            : []),
        ];

        return {
          ...prev,
          profileDisplayName: snap.displayName,
          profileStatusBio: snap.bio,
          profileLocation: snap.location || prev.profileLocation,
          profileCompany: snap.company || prev.profileCompany,
          profileWebsite: snap.website || prev.profileWebsite,
          headline: `${snap.displayName} | Developer Profile`,
          bio: snap.bio,
          actionLinks: nextLinks,
          badges: prev.badges.map((b) =>
            langSet.has(b.label.toLowerCase()) ? { ...b, enabled: true } : b
          ),
        };
      });
      return snap;
    } catch (err) {
      setSyncError(
        err instanceof Error ? err.message : "Failed to load GitHub data."
      );
      return null;
    } finally {
      setSyncLoading(false);
    }
  }

  function resetAll() {
    setCreatureConfig(DEFAULT_CREATURE_CONFIG);
    setReadmeConfig(DEFAULT_README_CONFIG);
    setCustomBgHex("#0B1020");
    setSnapshot(null);
    setSyncError(null);
  }

  return {
    creatureConfig,
    setCreatureConfig,
    readmeConfig,
    setReadmeConfig,
    customBgHex,
    snapshot,
    syncLoading,
    syncError,
    creatureSvg,
    shareCardSvg,
    markerBlock,
    fullReadmeMarkdown,
    selectCreature,
    selectView,
    selectWindow,
    applyThemePreset,
    syncLanguageColors,
    updateCreatureColor,
    setBackgroundMode,
    updateCustomBackground,
    updateReadmeField,
    reorderBadges,
    moveBadgeByStep,
    reorderSubtitleTags,
    syncFromGitHub,
    resetAll,
  };
}
