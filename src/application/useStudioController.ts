"use client";

import { useMemo, useState } from "react";
import {
  DEFAULT_CREATURE_CONFIG,
  DEFAULT_LANGUAGES,
  ORIGINAL_CREATURE_PALETTES,
  type BackgroundMode,
  type CameraView,
  type ContributionWindow,
  type CreatureConfig,
  type CreatureId,
  type LanguageCount,
  type LanguageStat,
  type WaterMode,
} from "@/domain/creature/entities";
import {
  applyLanguageColors,
  applyOriginalColors as restoreOriginalCreatureColors,
  ensureLanguageSlots,
  resolveBackgroundHex,
} from "@/domain/creature/services";
import {
  DEFAULT_DUMMY_INTRO,
  DEFAULT_README_CONFIG,
  type ReadmeBadge,
  type ReadmeConfig,
  type ReadmeTemplateId,
} from "@/domain/profile/entities";
import { detectPlatformFromUrl } from "@/domain/profile/platformIcons";
import {
  addBadgeToStackCard,
  buildMarkerSection,
  combineAllStackCards,
  getEffectiveReadmeMarkdown,
  moveBadgeBetweenStackCards,
  removeBadgeFromStackCard,
  reorderItems,
  reorderStackCards,
  restoreOrganizedStackCards,
} from "@/domain/profile/readmeService";
import {
  GITHUB_LANGUAGE_COLORS,
  type GitHubProfileSnapshot,
  fetchGitHubProfileSnapshot,
  getLanguageColor,
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
      if (prev.colorMode === "canonical") {
        return {
          ...prev,
          creature,
          view: nextView,
          colors: {
            ...ORIGINAL_CREATURE_PALETTES[creature],
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
        ? windowMode === "all-time"
          ? snapshot.allTimeCommits
          : snapshot.annualCommits
        : prev.commits,
    }));
  }

  function applyOriginalColors() {
    setCreatureConfig((prev) => restoreOriginalCreatureColors(prev));
  }

  function deriveStackLanguages(): LanguageStat[] | null {
    const badgeById = new Map(readmeConfig.badges.map((b) => [b.id, b]));
    const derived: LanguageStat[] = [];
    const seen = new Set<string>();
    for (const card of readmeConfig.stackCards) {
      for (const id of card.badgeIds) {
        const b = badgeById.get(id);
        if (!b || !b.label.trim()) continue;
        const key = b.label.trim().toLowerCase();
        if (seen.has(key)) continue;
        const officialColor = GITHUB_LANGUAGE_COLORS[b.label.trim()];
        if (b.category === "languages" || officialColor) {
          seen.add(key);
          derived.push({
            name: b.label.trim(),
            color: officialColor ?? `#${b.color.replace("#", "").slice(0, 6)}`,
          });
        }
      }
    }
    return derived.length > 0 ? derived : null;
  }

  function applyAutoLanguageColors() {
    setCreatureConfig((prev) => {
      if (!snapshot) {
        const stackLangs = deriveStackLanguages();
        if (stackLangs) {
          return applyLanguageColors(
            prev,
            ensureLanguageSlots(stackLangs, prev.languageCount)
          );
        }
      }
      return applyLanguageColors(prev);
    });
  }

  function setLanguageCount(count: LanguageCount) {
    setCreatureConfig((prev) => {
      const nextLangs = ensureLanguageSlots(prev.languages, count);
      const updated: CreatureConfig = {
        ...prev,
        languageCount: count,
        languages: nextLangs,
      };
      return prev.colorMode === "languages"
        ? applyLanguageColors(updated, nextLangs)
        : updated;
    });
  }

  function updateLanguageColor(index: number, hex: string) {
    setCreatureConfig((prev) => {
      const padded = ensureLanguageSlots(prev.languages, prev.languageCount);
      if (index < 0 || index >= padded.length) return prev;
      const nextLangs = padded.map((lang, i) =>
        i === index ? { ...lang, color: hex.toUpperCase() } : lang
      );
      return applyLanguageColors(prev, nextLangs);
    });
  }

  function updateLanguageName(index: number, name: string) {
    setCreatureConfig((prev) => {
      const padded = ensureLanguageSlots(prev.languages, prev.languageCount);
      if (index < 0 || index >= padded.length) return prev;
      const nextLangs = padded.map((lang, i) =>
        i === index ? { ...lang, name } : lang
      );
      return { ...prev, languages: nextLangs };
    });
  }

  function resetLanguageColors() {
    setCreatureConfig((prev) => {
      const base = ensureLanguageSlots(prev.languages, prev.languageCount);
      const reset = base.map((lang, idx) => {
        const defaultMatch = DEFAULT_LANGUAGES.find(
          (d) => d.name.toLowerCase() === lang.name.toLowerCase()
        );
        return {
          ...lang,
          color:
            defaultMatch?.color ??
            getLanguageColor(lang.name) ??
            DEFAULT_LANGUAGES[idx % DEFAULT_LANGUAGES.length].color,
        };
      });
      return prev.colorMode === "languages"
        ? applyLanguageColors(prev, reset)
        : { ...prev, languages: reset };
    });
  }

  function setWaterMode(waterMode: WaterMode) {
    setCreatureConfig((prev) => ({ ...prev, waterMode }));
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

  function combineStackCards() {
    setReadmeConfig((prev) => {
      if (prev.stackCards.length <= 1) return prev;
      const { cards, snapshot: saved } = combineAllStackCards(prev.stackCards);
      return {
        ...prev,
        rawOverride: null,
        stackCards: cards,
        savedOrganizedCards: saved,
      };
    });
  }

  function undoCombineStackCards() {
    setReadmeConfig((prev) => {
      if (!prev.savedOrganizedCards) return prev;
      return {
        ...prev,
        rawOverride: null,
        stackCards: restoreOrganizedStackCards(
          prev.savedOrganizedCards,
          prev.stackCards
        ),
        savedOrganizedCards: null,
      };
    });
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
          prev.windowMode === "all-time"
            ? snap.allTimeCommits
            : snap.annualCommits;
        const nextLanguages = ensureLanguageSlots(
          snap.languages,
          prev.languageCount
        );
        const updated: CreatureConfig = {
          ...prev,
          username: snap.username,
          commits: nextCommits,
          languages: nextLanguages,
        };
        return prev.colorMode === "languages"
          ? applyLanguageColors(updated, nextLanguages)
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
                  logo: detectPlatformFromUrl(snap.website).id,
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
          profileTextMode: "structured",
          advancedProfileMarkdown: "",
          headline: `${snap.displayName} | <Occupation here>`,
          bio: DEFAULT_DUMMY_INTRO.replaceAll("{{USERNAME}}", snap.username),
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
    applyOriginalColors,
    applyAutoLanguageColors,
    setLanguageCount,
    updateLanguageColor,
    updateLanguageName,
    resetLanguageColors,
    setWaterMode,
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
    combineStackCards,
    undoCombineStackCards,
    addCustomBadgeToCard,
    reorderSubtitleTags,
    syncFromGitHub,
    resetAll,
  };
}
