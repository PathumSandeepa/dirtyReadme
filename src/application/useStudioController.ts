"use client";

import { useEffect, useMemo, useRef, useState } from "react";
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
  type CustomImageMemoryAsset,
  type ReadmeBadge,
  type ReadmeConfig,
  type ReadmeTemplateId,
} from "@/domain/profile/entities";
import { detectPlatformFromUrl } from "@/domain/profile/platformIcons";
import {
  hydrateFromCreatureConfigJson,
  isDynamicCreatureReadme,
  parseExistingDynamicReadme,
} from "@/domain/profile/readmeParser";
import {
  addBadgeToStackCard,
  buildMarkerSection,
  buildStructuredProfileMarkdown,
  combineAllStackCards,
  getEffectiveReadmeMarkdown,
  moveBadgeBetweenStackCards,
  removeBadgeFromStackCard,
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
import { useDraftHistory, type DraftSnapshot } from "./useDraftHistory";

const STUDIO_STORAGE_KEY = "dynamic-creature-studio-v1";

interface PersistedStudioState {
  creatureConfig?: CreatureConfig;
  readmeConfig?: ReadmeConfig;
  customBgHex?: string;
  snapshot?: GitHubProfileSnapshot | null;
}

export function useStudioController() {
  const [creatureConfig, setCreatureConfig] = useState<CreatureConfig>(
    DEFAULT_CREATURE_CONFIG
  );
  const [readmeConfig, setReadmeConfig] = useState<ReadmeConfig>(
    DEFAULT_README_CONFIG
  );
  const [customBgHex, setCustomBgHex] = useState("#0D1117");
  const [snapshot, setSnapshot] = useState<GitHubProfileSnapshot | null>(null);
  const [customImages, setCustomImages] = useState<
    Record<string, CustomImageMemoryAsset>
  >({});
  const [syncLoading, setSyncLoading] = useState(false);
  const [syncError, setSyncError] = useState<string | null>(null);
  const [restoredNotice, setRestoredNotice] = useState<string | null>(null);
  const storageReadyRef = useRef(false);
  const customImagesRef = useRef(customImages);
  const history = useDraftHistory();

  function getCurrentDraftSnapshot(): DraftSnapshot {
    return { creatureConfig, readmeConfig, customBgHex };
  }

  function applyDraftSnapshot(next: DraftSnapshot) {
    setCreatureConfig(next.creatureConfig);
    setReadmeConfig(next.readmeConfig);
    setCustomBgHex(next.customBgHex);
  }

  function undoDraft() {
    const restored = history.undo(getCurrentDraftSnapshot());
    if (restored) {
      applyDraftSnapshot(restored);
    }
  }

  function redoDraft() {
    const restored = history.redo(getCurrentDraftSnapshot());
    if (restored) {
      applyDraftSnapshot(restored);
    }
  }

  function clearAllContent() {
    history.recordBefore(getCurrentDraftSnapshot());
    setReadmeConfig((prev) => ({
      ...prev,
      advancedProfileMarkdown: "",
      headline: "",
      bio: "",
      ctaLine: "",
      subtitleTags: [],
      stackCards: [],
      actionLinks: [],
      customBannerImagePath: null,
      showCreatureBanner: false,
      includeStatsTable: false,
      rawOverride: null,
    }));
    setCustomImages((prev) => {
      Object.values(prev).forEach((asset) => {
        URL.revokeObjectURL(asset.previewUrl);
      });
      return {};
    });
    history.showUndoToast("Cleared all content");
  }

  function setCreatureConfigWithHistory(
    updater: (prev: CreatureConfig) => CreatureConfig
  ) {
    history.recordBefore(getCurrentDraftSnapshot(), {
      coalesceKey: "inspector:creature",
      coalesceMs: 800,
    });
    setCreatureConfig(updater);
  }

  useEffect(() => {
    customImagesRef.current = customImages;
  }, [customImages]);

  useEffect(() => {
    return () => {
      Object.values(customImagesRef.current).forEach((asset) => {
        URL.revokeObjectURL(asset.previewUrl);
      });
    };
  }, []);

  useEffect(() => {
    let cancelled = false;
    queueMicrotask(() => {
      if (cancelled) return;
      try {
        const raw = window.sessionStorage.getItem(STUDIO_STORAGE_KEY);
        if (raw) {
          const parsed = JSON.parse(raw) as PersistedStudioState;
          if (
            parsed.creatureConfig &&
            typeof parsed.creatureConfig === "object"
          ) {
            setCreatureConfig((prev) => ({
              ...prev,
              ...parsed.creatureConfig,
            }));
          }
          if (parsed.readmeConfig && typeof parsed.readmeConfig === "object") {
            setReadmeConfig((prev) => ({
              ...prev,
              ...parsed.readmeConfig,
              badges: Array.isArray(parsed.readmeConfig?.badges)
                ? parsed.readmeConfig.badges
                : prev.badges,
              stackCards: Array.isArray(parsed.readmeConfig?.stackCards)
                ? parsed.readmeConfig.stackCards
                : prev.stackCards,
              actionLinks: Array.isArray(parsed.readmeConfig?.actionLinks)
                ? parsed.readmeConfig.actionLinks
                : prev.actionLinks,
            }));
          }
          if (typeof parsed.customBgHex === "string" && parsed.customBgHex) {
            setCustomBgHex(parsed.customBgHex);
          }
          if (parsed.snapshot && typeof parsed.snapshot === "object") {
            setSnapshot(parsed.snapshot);
          }
        }
      } catch {
        // Ignore malformed or restricted sessionStorage
      } finally {
        storageReadyRef.current = true;
      }
    });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!storageReadyRef.current) return;
    try {
      const payload: PersistedStudioState = {
        creatureConfig,
        readmeConfig,
        customBgHex,
        snapshot,
      };
      window.sessionStorage.setItem(STUDIO_STORAGE_KEY, JSON.stringify(payload));
    } catch {
      // Ignore quota or privacy mode errors
    }
  }, [creatureConfig, readmeConfig, customBgHex, snapshot]);

  const markerBlock = useMemo(
    () => buildMarkerSection(creatureConfig, readmeConfig),
    [creatureConfig, readmeConfig]
  );

  const fullReadmeMarkdown = useMemo(
    () => getEffectiveReadmeMarkdown(creatureConfig, readmeConfig),
    [creatureConfig, readmeConfig]
  );

  const imageUrlMap = useMemo(() => {
    const map: Record<string, string> = {};
    for (const asset of Object.values(customImages)) {
      map[asset.repoPath] = asset.previewUrl;
      map[`./${asset.repoPath}`] = asset.previewUrl;
    }
    return map;
  }, [customImages]);

  const referencedCustomImages = useMemo(() => {
    return Object.values(customImages).filter(
      (asset) =>
        fullReadmeMarkdown.includes(asset.repoPath) ||
        (readmeConfig.bannerSource === "custom-image" &&
          readmeConfig.customBannerImagePath === asset.repoPath)
    );
  }, [
    customImages,
    fullReadmeMarkdown,
    readmeConfig.bannerSource,
    readmeConfig.customBannerImagePath,
  ]);

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
    history.recordBefore(getCurrentDraftSnapshot());
    setCreatureConfig((prev) => {
      if (prev.creature === "jellyfish") {
        return { ...prev, view: "side" };
      }
      return { ...prev, view };
    });
  }

  function selectWindow(windowMode: ContributionWindow) {
    history.recordBefore(getCurrentDraftSnapshot());
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
    history.recordBefore(getCurrentDraftSnapshot());
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
    history.recordBefore(getCurrentDraftSnapshot());
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
    history.recordBefore(getCurrentDraftSnapshot());
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
    history.recordBefore(getCurrentDraftSnapshot(), {
      coalesceKey: `inspector:langColor:${index}`,
      coalesceMs: 800,
    });
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
    history.recordBefore(getCurrentDraftSnapshot(), {
      coalesceKey: `inspector:langName:${index}`,
      coalesceMs: 800,
    });
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
    history.recordBefore(getCurrentDraftSnapshot());
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
    history.recordBefore(getCurrentDraftSnapshot());
    setCreatureConfig((prev) => ({ ...prev, waterMode }));
  }

  function setBackgroundMode(mode: BackgroundMode) {
    history.recordBefore(getCurrentDraftSnapshot());
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
    history.recordBefore(getCurrentDraftSnapshot(), {
      coalesceKey: "inspector:customBg",
      coalesceMs: 800,
    });
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
    if (key === "advancedProfileMarkdown") {
      history.recordBefore(getCurrentDraftSnapshot(), {
        coalesceKey: "typing",
        coalesceMs: 800,
      });
    } else if (
      key === "imageWidth" ||
      key === "customBannerWidth" ||
      key === "statsTableTitle" ||
      key === "customBannerAlt"
    ) {
      history.recordBefore(getCurrentDraftSnapshot(), {
        coalesceKey: `inspector:${String(key)}`,
        coalesceMs: 800,
      });
    } else {
      history.recordBefore(getCurrentDraftSnapshot());
    }
    if (key === "showCreatureBanner" && value === false) {
      history.showUndoToast("Creature hidden");
    }
    setReadmeConfig((prev) => ({
      ...prev,
      [key]: value,
      rawOverride: null,
    }));
  }

  function selectReadmeTemplate(templateId: ReadmeTemplateId) {
    history.recordBefore(getCurrentDraftSnapshot());
    setReadmeConfig((prev) => ({
      ...prev,
      templateId,
      rawOverride: null,
      includeStatsTable: templateId === "telemetry-stats",
      includeShareCard: false,
    }));
  }

  function addBadgeToCard(
    cardId: string,
    badgeId: string,
    beforeBadgeId?: string
  ) {
    history.recordBefore(getCurrentDraftSnapshot());
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
    history.recordBefore(getCurrentDraftSnapshot());
    setReadmeConfig((prev) => ({
      ...prev,
      rawOverride: null,
      stackCards: removeBadgeFromStackCard(prev.stackCards, cardId, badgeId),
    }));
    history.showUndoToast("Badge removed");
  }

  function moveBadgeAcrossCards(
    badgeId: string,
    fromCardId: string,
    toCardId: string,
    targetBadgeId?: string
  ) {
    history.recordBefore(getCurrentDraftSnapshot());
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
    history.recordBefore(getCurrentDraftSnapshot());
    const newId = `card-${Date.now()}`;
    setReadmeConfig((prev) => ({
      ...prev,
      rawOverride: null,
      stackCards: [
        ...prev.stackCards,
        { id: newId, title, badgeIds: [], visible: true },
      ],
    }));
    return newId;
  }

  function toggleStackCardVisibility(cardId: string, visible: boolean) {
    history.recordBefore(getCurrentDraftSnapshot());
    setReadmeConfig((prev) => ({
      ...prev,
      rawOverride: null,
      stackCards: prev.stackCards.map((c) =>
        c.id === cardId ? { ...c, visible } : c
      ),
    }));
  }

  function renameStackCard(cardId: string, title: string) {
    history.recordBefore(getCurrentDraftSnapshot(), {
      coalesceKey: `inspector:renameCard:${cardId}`,
      coalesceMs: 800,
    });
    setReadmeConfig((prev) => ({
      ...prev,
      rawOverride: null,
      stackCards: prev.stackCards.map((c) =>
        c.id === cardId ? { ...c, title } : c
      ),
    }));
  }

  function deleteStackCard(cardId: string) {
    history.recordBefore(getCurrentDraftSnapshot());
    setReadmeConfig((prev) => ({
      ...prev,
      rawOverride: null,
      stackCards: prev.stackCards.filter((c) => c.id !== cardId),
    }));
    history.showUndoToast("Group deleted");
  }

  function reorderCards(fromIdx: number, toIdx: number) {
    history.recordBefore(getCurrentDraftSnapshot());
    setReadmeConfig((prev) => ({
      ...prev,
      rawOverride: null,
      stackCards: reorderStackCards(prev.stackCards, fromIdx, toIdx),
    }));
  }

  function combineStackCards() {
    history.recordBefore(getCurrentDraftSnapshot());
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
    history.recordBefore(getCurrentDraftSnapshot());
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
    history.recordBefore(getCurrentDraftSnapshot());
    setReadmeConfig((prev) => ({
      ...prev,
      rawOverride: null,
      badges: [...prev.badges, { ...badge, enabled: true }],
      stackCards: addBadgeToStackCard(prev.stackCards, cardId, badge.id),
    }));
  }

  function registerCustomImage(asset: CustomImageMemoryAsset) {
    setCustomImages((prev) => {
      const existing = prev[asset.repoPath];
      if (existing && existing.previewUrl !== asset.previewUrl) {
        URL.revokeObjectURL(existing.previewUrl);
      }
      return {
        ...prev,
        [asset.repoPath]: asset,
      };
    });
  }

  function setCustomBannerImage(asset: CustomImageMemoryAsset) {
    history.recordBefore(getCurrentDraftSnapshot());
    registerCustomImage(asset);
    setReadmeConfig((prev) => ({
      ...prev,
      rawOverride: null,
      bannerSource: "custom-image",
      customBannerImagePath: asset.repoPath,
      customBannerAlt: asset.alt,
      showCreatureBanner: true,
    }));
  }

  function clearCustomBannerImage() {
    history.recordBefore(getCurrentDraftSnapshot());
    setReadmeConfig((prev) => ({
      ...prev,
      rawOverride: null,
      bannerSource: "creature",
      customBannerImagePath: null,
    }));
  }

  function updateCustomBannerAlt(alt: string) {
    const activePath = readmeConfig.customBannerImagePath;
    setReadmeConfig((prev) => ({
      ...prev,
      rawOverride: null,
      customBannerAlt: alt,
    }));
    if (activePath) {
      setCustomImages((prev) => {
        const existing = prev[activePath];
        if (!existing) return prev;
        return {
          ...prev,
          [activePath]: { ...existing, alt },
        };
      });
    }
  }

  function removeCustomImage(repoPath: string) {
    const clean = repoPath.replace(/^\.\//, "");
    setCustomImages((prev) => {
      const target = prev[clean];
      if (target) {
        URL.revokeObjectURL(target.previewUrl);
      }
      const next = { ...prev };
      delete next[clean];
      return next;
    });
    setReadmeConfig((prev) =>
      prev.customBannerImagePath === clean
        ? {
            ...prev,
            rawOverride: null,
            bannerSource: "creature",
            customBannerImagePath: null,
          }
        : prev
    );
  }

  async function syncFromGitHub(
    targetUsername: string,
    authToken?: string,
    preloadedSnapshot?: GitHubProfileSnapshot | null
  ) {
    const parsedUsername = parseGitHubUsername(targetUsername);
    if (!parsedUsername) {
      setSyncError("Please enter a valid GitHub username or profile URL.");
      return null;
    }

    setCreatureConfig((prev) => ({ ...prev, username: parsedUsername }));
    setSyncError(null);
    setRestoredNotice(null);

    const reusePreloaded =
      preloadedSnapshot &&
      preloadedSnapshot.username.toLowerCase() === parsedUsername.toLowerCase();

    if (!reusePreloaded) {
      setSyncLoading(true);
    }

    try {
      const snap = reusePreloaded
        ? preloadedSnapshot
        : await fetchGitHubProfileSnapshot(parsedUsername, authToken);
      setSnapshot(snap);

      if (snap.existingCreatureConfig) {
        const hydrated = hydrateFromCreatureConfigJson(
          snap.existingCreatureConfig,
          snap,
          DEFAULT_CREATURE_CONFIG,
          DEFAULT_README_CONFIG
        );
        const restoredMarkdown =
          hydrated.readmeConfig.advancedProfileMarkdown.trim() ||
          buildStructuredProfileMarkdown(
            hydrated.creatureConfig,
            hydrated.readmeConfig
          );
        setCreatureConfig(hydrated.creatureConfig);
        setReadmeConfig({
          ...hydrated.readmeConfig,
          profileTextMode: "advanced",
          advancedProfileMarkdown: restoredMarkdown,
        });
        setCustomBgHex(hydrated.customBgHex);
        setRestoredNotice(
          `Restored your saved README from ${snap.username}/${snap.username}.`
        );
        return snap;
      }

      if (isDynamicCreatureReadme(snap.existingProfileReadme)) {
        const parsed = parseExistingDynamicReadme(
          snap.existingProfileReadme!,
          DEFAULT_CREATURE_CONFIG,
          DEFAULT_README_CONFIG
        );
        const mergedCreatureSnapshot: CreatureConfig = {
          ...creatureConfig,
          ...parsed.creaturePatch,
          username: snap.username,
          commits:
            creatureConfig.windowMode === "all-time"
              ? snap.allTimeCommits
              : snap.annualCommits,
          languages: ensureLanguageSlots(
            snap.languages,
            creatureConfig.languageCount
          ),
        };
        const parsedMarkdown =
          parsed.readmeConfig.advancedProfileMarkdown.trim() ||
          (parsed.readmeConfig.templateId === "auto-evolve-block"
            ? ""
            : buildStructuredProfileMarkdown(
              mergedCreatureSnapshot,
              parsed.readmeConfig
            ));
        setCreatureConfig((prev) => {
          const mergedCreature: CreatureConfig = {
            ...prev,
            ...parsed.creaturePatch,
            username: snap.username,
            commits:
              prev.windowMode === "all-time"
                ? snap.allTimeCommits
                : snap.annualCommits,
            languages: ensureLanguageSlots(snap.languages, prev.languageCount),
          };
          return mergedCreature.colorMode === "languages"
            ? applyLanguageColors(mergedCreature, mergedCreature.languages)
            : mergedCreature;
        });
        setReadmeConfig({
          ...parsed.readmeConfig,
          profileTextMode: "advanced",
          advancedProfileMarkdown: parsedMarkdown,
        });
        setRestoredNotice(
          `Loaded your previous README customizations from ${snap.username}/${snap.username}.`
        );
        return snap;
      }

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

        const syncedHeadline = `${snap.displayName}, Software developer`;
        const syncedBio = DEFAULT_DUMMY_INTRO.replaceAll(
          "{{USERNAME}}",
          snap.username
        );
        const syncedBase: ReadmeConfig = {
          ...prev,
          headline: syncedHeadline,
          bio: syncedBio,
        };
        const syncedCreature: CreatureConfig = {
          ...creatureConfig,
          username: snap.username,
        };
        return {
          ...syncedBase,
          profileDisplayName: snap.displayName,
          profileStatusBio: snap.bio || prev.profileStatusBio,
          profileLocation: snap.location || prev.profileLocation,
          profileCompany: snap.company || prev.profileCompany,
          profileWebsite: snap.website || `https://github.com/${snap.username}`,
          profileTextMode: "advanced",
          advancedProfileMarkdown: buildStructuredProfileMarkdown(
            syncedCreature,
            syncedBase
          ),
          actionLinks: nextLinks,
          stackCards: nextCards,
        };
      });
      return snap;
    } catch (err) {
      const msg =
        err instanceof TypeError
          ? "Network error while contacting GitHub. Check your connection and try again."
          : err instanceof Error
            ? err.message
            : "Failed to load GitHub data.";
      setSyncError(msg);
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
    setCustomImages((prev) => {
      Object.values(prev).forEach((asset) => {
        URL.revokeObjectURL(asset.previewUrl);
      });
      return {};
    });
    setSyncError(null);
    setRestoredNotice(null);
    try {
      window.sessionStorage.removeItem(STUDIO_STORAGE_KEY);
    } catch {
      // Ignore storage access errors
    }
  }

  return {
    creatureConfig,
    setCreatureConfig: setCreatureConfigWithHistory,
    readmeConfig,
    setReadmeConfig,
    customBgHex,
    snapshot,
    customImages,
    imageUrlMap,
    referencedCustomImages,
    syncLoading,
    syncError,
    clearSyncError: () => setSyncError(null),
    restoredNotice,
    dismissRestoredNotice: () => setRestoredNotice(null),
    canUndo: history.canUndo,
    canRedo: history.canRedo,
    undoToast: history.undoToast,
    undoDraft,
    redoDraft,
    clearAllContent,
    showUndoToast: history.showUndoToast,
    dismissUndoToast: history.dismissUndoToast,
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
    toggleStackCardVisibility,
    deleteStackCard,
    reorderCards,
    combineStackCards,
    undoCombineStackCards,
    addCustomBadgeToCard,
    registerCustomImage,
    setCustomBannerImage,
    clearCustomBannerImage,
    updateCustomBannerAlt,
    removeCustomImage,
    syncFromGitHub,
    resetAll,
  };
}
