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
  DEFAULT_DUMMY_INTRO,
  DEFAULT_README_CONFIG,
  type ReadmeBadge,
  type ReadmeConfig,
  type ReadmeTemplateId,
} from "@/domain/profile/entities";
import {
  addBadgeToStackCard,
  buildMarkerSection,
  getEffectiveReadmeMarkdown,
  moveBadgeBetweenStackCards,
  removeBadgeFromStackCard,
  reorderItems,
  reorderStackCards,
} from "@/domain/profile/readmeService";
import {
  type GitHubProfileSnapshot,
  fetchGitHubProfileSnapshot,
  parseGitHubUsername,
} from "@/infrastructure/github/githubClient";

export function useStudioController() {
  const [creatureConfig, setCreatureConfig] = useState<CreatureConfig>(
    DEFAULT_CREATURE_CONFIG
  );
  const [readmeConfig, setReadmeConfig] = useState<ReadmeConfig>(
    DEFAULT_README_CONFIG
  );
  const [customBgHex, setCustomBgHex] = useState("#0D1117");
  const [snapshot, setSnapshot] = useState<GitHubProfileSnapshot | null>(null);
  const [syncLoading, setSyncLoading] = useState(false);
  const [syncError, setSyncError] = useState<string | null>(null);

  const markerBlock = useMemo(
    () => buildMarkerSection(creatureConfig, readmeConfig),
    [creatureConfig, readmeConfig]
  );

  const fullReadmeMarkdown = useMemo(
    () => getEffectiveReadmeMarkdown(creatureConfig, readmeConfig),
    [creatureConfig, readmeConfig]
  );

  function selectCreature(creature: CreatureId) {
    setCreatureConfig((prev) => {
      const nextView: CameraView = creature === "jellyfish" ? "side" : prev.view;
      if (creature === "jellyfish" && prev.themeId === "ocean-slate") {
        const preset = THEME_PRESETS[1];
        return {
          ...prev,
          creature,
          view: nextView,
          colorMode: "canonical",
          themeId: preset.id,
          colors: {
            ...preset.colors,
            background: prev.colors.background,
          },
        };
      }
      if (creature === "tulkun" && prev.themeId === "biolume-azure") {
        const preset = THEME_PRESETS[0];
        return {
          ...prev,
          creature,
          view: nextView,
          colorMode: "canonical",
          themeId: preset.id,
          colors: {
            ...preset.colors,
            background: prev.colors.background,
          },
        };
      }
      return { ...prev, creature, view: nextView };
    });
  }

  function selectView(view: CameraView) {
    setCreatureConfig((prev) => {
      if (prev.creature === "jellyfish") {
        return { ...prev, view: "side" };
      }
      return { ...prev, view };
    });
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

  function selectReadmeTemplate(templateId: ReadmeTemplateId) {
    setReadmeConfig((prev) => ({
      ...prev,
      templateId,
      rawOverride: null,
      ...(templateId === "telemetry-stats"
        ? { includeStatsTable: true, includeShareCard: true }
        : {}),
    }));
  }

  function addBadgeToCard(
    cardId: string,
    badgeId: string,
    beforeBadgeId?: string
  ) {
    setReadmeConfig((prev) => ({
      ...prev,
      rawOverride: null,
      stackCards: addBadgeToStackCard(
        prev.stackCards,
        cardId,
        badgeId,
        beforeBadgeId
      ),
    }));
  }

  function removeBadgeFromCard(cardId: string, badgeId: string) {
    setReadmeConfig((prev) => ({
      ...prev,
      rawOverride: null,
      stackCards: removeBadgeFromStackCard(prev.stackCards, cardId, badgeId),
    }));
  }

  function moveBadgeAcrossCards(
    badgeId: string,
    fromCardId: string,
    toCardId: string,
    targetBadgeId?: string
  ) {
    setReadmeConfig((prev) => ({
      ...prev,
      rawOverride: null,
      stackCards: moveBadgeBetweenStackCards(
        prev.stackCards,
        badgeId,
        fromCardId,
        toCardId,
        targetBadgeId
      ),
    }));
  }

  function addStackCard(title = "New Skill Group") {
    const newId = `card-${Date.now()}`;
    setReadmeConfig((prev) => ({
      ...prev,
      rawOverride: null,
      stackCards: [...prev.stackCards, { id: newId, title, badgeIds: [] }],
    }));
    return newId;
  }

  function renameStackCard(cardId: string, title: string) {
    setReadmeConfig((prev) => ({
      ...prev,
      rawOverride: null,
      stackCards: prev.stackCards.map((c) =>
        c.id === cardId ? { ...c, title } : c
      ),
    }));
  }

  function deleteStackCard(cardId: string) {
    setReadmeConfig((prev) => {
      if (prev.stackCards.length <= 1) return prev;
      return {
        ...prev,
        rawOverride: null,
        stackCards: prev.stackCards.filter((c) => c.id !== cardId),
      };
    });
  }

  function reorderCards(fromIdx: number, toIdx: number) {
    setReadmeConfig((prev) => ({
      ...prev,
      rawOverride: null,
      stackCards: reorderStackCards(prev.stackCards, fromIdx, toIdx),
    }));
  }

  function addCustomBadgeToCard(
    cardId: string,
    badge: Omit<ReadmeBadge, "enabled">
  ) {
    setReadmeConfig((prev) => ({
      ...prev,
      rawOverride: null,
      badges: [...prev.badges, { ...badge, enabled: true }],
      stackCards: addBadgeToStackCard(prev.stackCards, cardId, badge.id),
    }));
  }

  function reorderSubtitleTags(fromIdx: number, toIdx: number) {
    setReadmeConfig((prev) => ({
      ...prev,
      rawOverride: null,
      subtitleTags: reorderItems(prev.subtitleTags, fromIdx, toIdx),
    }));
  }

  async function syncFromGitHub(targetUsername: string, authToken?: string) {
    const parsedUsername = parseGitHubUsername(targetUsername);
    if (!parsedUsername) {
      setSyncError("Please enter a valid GitHub username or profile URL.");
      return null;
    }

    setCreatureConfig((prev) => ({ ...prev, username: parsedUsername }));
    setSyncLoading(true);
    setSyncError(null);
    try {
      const snap = await fetchGitHubProfileSnapshot(parsedUsername, authToken);
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
        const matchedBadgeIds = prev.badges
          .filter((b) => langSet.has(b.label.toLowerCase()))
          .map((b) => b.id);

        const alreadyInCards = new Set(
          prev.stackCards.flatMap((c) => c.badgeIds)
        );
        const newLangIds = matchedBadgeIds.filter((id) => !alreadyInCards.has(id));
        const nextCards =
          newLangIds.length > 0 && prev.stackCards.length > 0
            ? prev.stackCards.map((card, idx) =>
                idx === 0
                  ? { ...card, badgeIds: [...newLangIds, ...card.badgeIds] }
                  : card
              )
            : prev.stackCards;

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
                  color: "4F46E5",
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
          profileStatusBio: snap.bio || prev.profileStatusBio,
          profileLocation: snap.location || prev.profileLocation,
          profileCompany: snap.company || prev.profileCompany,
          profileWebsite: snap.website || `https://github.com/${snap.username}`,
          headline: `${snap.displayName} | Software Engineer`,
          bio: snap.bio || DEFAULT_DUMMY_INTRO,
          actionLinks: nextLinks,
          stackCards: nextCards,
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
    setCustomBgHex("#0D1117");
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
    selectReadmeTemplate,
    addBadgeToCard,
    removeBadgeFromCard,
    moveBadgeAcrossCards,
    addStackCard,
    renameStackCard,
    deleteStackCard,
    reorderCards,
    addCustomBadgeToCard,
    reorderSubtitleTags,
    syncFromGitHub,
    resetAll,
  };
}
