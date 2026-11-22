import {
  DEFAULT_LANGUAGES,
  ORIGINAL_CREATURE_PALETTES,
  type BackgroundMode,
  type CameraView,
  type ColorMode,
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
  applyLanguageColors,
  ensureLanguageSlots,
  normalizeHex,
} from "@/domain/creature/services";
import {
  TECH_STACK_CATALOG,
  type ProfileTextMode,
  type ReadmeActionLink,
  type ReadmeBadge,
  type ReadmeConfig,
  type ReadmeTemplateId,
  type TechStackCard,
} from "@/domain/profile/entities";
import {
  DEFAULT_PLATFORM_ICON_ID,
  PLATFORM_ICON_CATALOG,
  detectPlatformFromUrl,
} from "@/domain/profile/platformIcons";
import type { GitHubProfileSnapshot } from "@/infrastructure/github/githubClient";

export function isDynamicCreatureReadme(markdown: string | null): boolean {
  if (!markdown) return false;
  return (
    markdown.includes("<!-- CYBER-CREATURE:START -->") ||
    markdown.includes("<!-- CYBER-CREATURE-STATS:START -->")
  );
}

function unescapeShieldsSegment(seg: string): string {
  try {
    return decodeURIComponent(seg)
      .replace(/--/g, "-")
      .replace(/__/g, "_");
  } catch {
    return seg.replace(/--/g, "-").replace(/__/g, "_");
  }
}

function parseBadgeFromShieldUrl(urlStr: string, altText: string): {
  label: string;
  valueText?: string;
  color: string;
  logo?: string;
  logoColor?: string;
} {
  let color = "1F242D";
  let logo: string | undefined;
  let logoColor: string | undefined;
  let label = altText.trim() || "SKILL";
  let valueText: string | undefined;

  try {
    const u = new URL(urlStr);
    logo = u.searchParams.get("logo") || undefined;
    logoColor = u.searchParams.get("logoColor") || undefined;

    if (logo && logo.startsWith("data:image/svg+xml")) {
      const matched = PLATFORM_ICON_CATALOG.find(
        (p) => p.customLogoDataUri === logo
      );
      if (matched) logo = matched.id;
    }

    const match = u.pathname.match(/^\/badge\/(.+)$/);
    if (match?.[1]) {
      const parts = match[1].split(/(?<!-)-(?!-)/);
      if (parts.length >= 3) {
        label = unescapeShieldsSegment(parts[0]);
        valueText = unescapeShieldsSegment(parts.slice(1, -1).join("-"));
        color = parts[parts.length - 1].replace(/[^0-9a-fA-F]/g, "") || color;
      } else if (parts.length === 2) {
        label = unescapeShieldsSegment(parts[0]);
        color = parts[1].replace(/[^0-9a-fA-F]/g, "") || color;
      }
    }
  } catch {
    // Keep defaults from altText
  }

  return { label, valueText, color, logo, logoColor };
}

export function parseExistingDynamicReadme(
  markdown: string,
  defaultCreature: CreatureConfig,
  defaultReadme: ReadmeConfig
): { creaturePatch: Partial<CreatureConfig>; readmeConfig: ReadmeConfig } {
  const creaturePatch: Partial<CreatureConfig> = {};

  const markerMatch = markdown.match(
    /<!--\s*CYBER-CREATURE:START\s*-->([\s\S]*?)<!--\s*CYBER-CREATURE:END\s*-->/
  );
  const markerStartIdx = markdown.indexOf("<!-- CYBER-CREATURE:START -->");
  const markerEndIdx = markdown.indexOf("<!-- CYBER-CREATURE:END -->");

  let align: "left" | "center" = defaultReadme.align;
  let imageWidth = defaultReadme.imageWidth;
  let useOutputBranchUrl = defaultReadme.useOutputBranchUrl;

  if (markerMatch?.[1]) {
    const block = markerMatch[1];
    const alignMatch = block.match(/align=["'](left|center)["']/i);
    if (alignMatch?.[1]) {
      align = alignMatch[1].toLowerCase() === "left" ? "left" : "center";
    }
    const widthMatch = block.match(/width=["'](\d+)["']/i);
    if (widthMatch?.[1]) {
      const parsedW = parseInt(widthMatch[1], 10);
      if (Number.isFinite(parsedW)) {
        imageWidth = Math.min(920, Math.max(320, parsedW));
      }
    }
    if (/\/output\/creature\.(?:webp|gif|svg)/i.test(block)) {
      useOutputBranchUrl = true;
    }
    const altMatch = block.match(/alt=["']([^"']+)["']/i);
    if (altMatch?.[1]) {
      if (/jellyfish/i.test(altMatch[1])) {
        creaturePatch.creature = "jellyfish";
        creaturePatch.view = "side";
      } else if (/tulkun/i.test(altMatch[1])) {
        creaturePatch.creature = "tulkun";
      }
    }
  }

  const statsMatch = markdown.match(
    /<!--\s*CYBER-CREATURE-STATS:START\s*-->([\s\S]*?)<!--\s*CYBER-CREATURE-STATS:END\s*-->/
  );
  const includeStatsTable = Boolean(statsMatch);
  let statsTableTitle = defaultReadme.statsTableTitle;
  if (statsMatch?.[1]) {
    const titleMatch = statsMatch[1].match(/^###\s+(.+)$/m);
    if (titleMatch?.[1]) statsTableTitle = titleMatch[1].trim();
  }

  const shareMatch = markdown.match(
    /(?:###\s+Annual Share Card\s*\n+)?<p\b[^>]*>\s*<img\b[^>]*src=["'][^"']*share-card\.png["'][^>]*\/?>\s*<\/p>/i
  );
  const includeShareCard = Boolean(shareMatch);

  const beforeMarker =
    markerStartIdx !== -1 ? markdown.slice(0, markerStartIdx).trim() : markdown;

  let afterTailStart =
    markerEndIdx !== -1
      ? markerEndIdx + "<!-- CYBER-CREATURE:END -->".length
      : markdown.length;

  const statsEndToken = "<!-- CYBER-CREATURE-STATS:END -->";
  const statsEndIdx = markdown.indexOf(statsEndToken);
  if (statsEndIdx !== -1) {
    afterTailStart = Math.max(afterTailStart, statsEndIdx + statsEndToken.length);
  }
  if (shareMatch && shareMatch.index !== undefined) {
    afterTailStart = Math.max(
      afterTailStart,
      shareMatch.index + shareMatch[0].length
    );
  }

  const tailRaw = markdown.slice(afterTailStart).trim();
  let customSectionTitle = "";
  let customFooterMarkdown = "";
  if (tailRaw) {
    const tailHeading = tailRaw.match(/^###\s+([^\r\n]+)\r?\n+([\s\S]*)$/);
    if (tailHeading) {
      customSectionTitle = tailHeading[1].trim();
      customFooterMarkdown = tailHeading[2].trim();
    } else {
      customFooterMarkdown = tailRaw;
    }
  }

  // Parse Stack Cards and CTA Action Links from beforeMarker
  const catalogByLabel = new Map(
    TECH_STACK_CATALOG.map((b) => [b.label.toLowerCase(), b])
  );
  const catalogById = new Map(
    TECH_STACK_CATALOG.map((b) => [b.id.toLowerCase(), b])
  );
  const extraBadges: ReadmeBadge[] = [];
  const addedExtraIds = new Set<string>();
  const stackCards: TechStackCard[] = [];
  const actionLinks: ReadmeActionLink[] = [];

  const htmlBlockRegex =
    /(?:^####\s+([^\r\n]+)\r?\n+)?<p\s+align=["'](?:left|center|right)["']>\s*([\s\S]*?)<\/p>/gim;
  const consumedRanges: [number, number][] = [];
  let blockMatch: RegExpExecArray | null;
  let cardSeq = 1;
  let linkSeq = 1;
  let detectedContentAlign: "left" | "center" | null = null;

  while ((blockMatch = htmlBlockRegex.exec(beforeMarker)) !== null) {
    const pAlignMatch = blockMatch[0].match(
      /<p\s+align=["'](left|center|right)["']/i
    );
    if (pAlignMatch?.[1] && !detectedContentAlign) {
      detectedContentAlign =
        pAlignMatch[1].toLowerCase() === "left" ? "left" : "center";
    }
    const title = blockMatch[1]?.trim() || "";
    const inner = blockMatch[2] || "";
    const hasLinkBadges = /<a\s+href=/i.test(inner);
    const hasPlainImgs = !hasLinkBadges && /<img\s+src=/i.test(inner);

    if (hasLinkBadges) {
      consumedRanges.push([
        blockMatch.index,
        blockMatch.index + blockMatch[0].length,
      ]);
      const aRegex =
        /<a\s+href=["']([^"']+)["'][^>]*>\s*<img\s+src=["']([^"']+)["'][^>]*?(?:alt=["']([^"']*)["'])?[^>]*\/?>\s*<\/a>/gi;
      let aMatch: RegExpExecArray | null;
      while ((aMatch = aRegex.exec(inner)) !== null) {
        const href = aMatch[1];
        const imgSrc = aMatch[2];
        const altText = aMatch[3] || "";
        const parsed = parseBadgeFromShieldUrl(imgSrc, altText);
        const detectedLogo = detectPlatformFromUrl(href).id;
        actionLinks.push({
          id: `restored-link-${linkSeq++}`,
          label: parsed.label,
          valueText: parsed.valueText || "OPEN",
          url: href,
          color: parsed.color,
          logo: parsed.logo || detectedLogo || DEFAULT_PLATFORM_ICON_ID,
          enabled: true,
        });
      }
    } else if (hasPlainImgs) {
      consumedRanges.push([
        blockMatch.index,
        blockMatch.index + blockMatch[0].length,
      ]);
      const imgRegex =
        /<img\s+[^>]*src=["']([^"']+)["'][^>]*?(?:alt=["']([^"']*)["'])?[^>]*\/?>/gi;
      const badgeIds: string[] = [];
      let imgMatch: RegExpExecArray | null;
      while ((imgMatch = imgRegex.exec(inner)) !== null) {
        const imgSrc = imgMatch[1];
        const altText = imgMatch[2] || "";
        const parsed = parseBadgeFromShieldUrl(imgSrc, altText);
        const byLabel = catalogByLabel.get(parsed.label.toLowerCase());
        const normalizedSlug = parsed.label
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "");
        const byId = catalogById.get(normalizedSlug);
        const matched = byLabel || byId;
        if (matched) {
          if (!badgeIds.includes(matched.id)) {
            badgeIds.push(matched.id);
          }
        } else {
          const customId = `restored-${normalizedSlug || extraBadges.length + 1}`;
          if (!addedExtraIds.has(customId)) {
            addedExtraIds.add(customId);
            extraBadges.push({
              id: customId,
              label: parsed.label,
              color: parsed.color,
              ...(parsed.logo ? { logo: parsed.logo } : {}),
              ...(parsed.logoColor ? { logoColor: parsed.logoColor } : {}),
              category: "skills",
              enabled: true,
            });
          }
          if (!badgeIds.includes(customId)) {
            badgeIds.push(customId);
          }
        }
      }
      if (badgeIds.length > 0) {
        stackCards.push({
          id: `restored-card-${cardSeq++}`,
          title,
          badgeIds,
        });
      }
    }
  }

  if (detectedContentAlign) {
    align = detectedContentAlign;
  }

  // Reconstruct leftover top text above consumed stack/CTA blocks
  let topText = "";
  let cursor = 0;
  for (const [start, end] of consumedRanges) {
    if (start > cursor) {
      topText += beforeMarker.slice(cursor, start);
    }
    cursor = Math.max(cursor, end);
  }
  if (cursor < beforeMarker.length) {
    topText += beforeMarker.slice(cursor);
  }
  topText = topText.replace(/\n{3,}/g, "\n\n").trim();

  const profileTextMode: ProfileTextMode = "advanced";
  let advancedProfileMarkdown = "";
  let headline = "";
  let subtitleTags: string[] = [];
  let bio = "";
  let ctaLine = "";

  if (markerStartIdx !== -1 && topText) {
    advancedProfileMarkdown = topText;
    const blocks = topText
      .split(/\r?\n\s*\r?\n/)
      .map((b) => b.trim())
      .filter(Boolean);

    let idx = 0;
    if (/^#{1,4}\s+/.test(blocks[idx] || "")) {
      headline = blocks[idx].replace(/^#{1,4}\s+/, "").trim();
      idx++;
    }
    if (
      blocks[idx] &&
      blocks[idx].startsWith("**") &&
      blocks[idx].endsWith("**") &&
      blocks[idx].includes("|")
    ) {
      subtitleTags = blocks[idx]
        .slice(2, -2)
        .split("|")
        .map((t) => t.trim())
        .filter(Boolean);
      idx++;
    }
    if (blocks[idx]) {
      bio = blocks[idx];
      idx++;
    }
    if (blocks[idx]) {
      ctaLine = blocks[idx];
    }
  } else if (beforeMarker === "" && markerMatch) {
    // Auto-evolve marker-only template
  } else {
    headline = defaultReadme.headline;
    subtitleTags = [...defaultReadme.subtitleTags];
    bio = defaultReadme.bio;
    ctaLine = defaultReadme.ctaLine;
    advancedProfileMarkdown = defaultReadme.advancedProfileMarkdown;
  }

  let templateId: ReadmeTemplateId = "cyber-guardian";
  if (topText === "" && stackCards.length === 0 && actionLinks.length === 0) {
    templateId = "auto-evolve-block";
  } else if (
    subtitleTags.length === 0 &&
    stackCards.length === 0 &&
    actionLinks.length === 0 &&
    !includeStatsTable &&
    !includeShareCard
  ) {
    templateId = "minimal-header";
  } else if (includeStatsTable && includeShareCard) {
    templateId = "telemetry-stats";
  }

  const restoredBadgeIds = new Set(stackCards.flatMap((c) => c.badgeIds));
  const mergedBadges: ReadmeBadge[] = [
    ...TECH_STACK_CATALOG.map((b) => ({
      ...b,
      enabled: restoredBadgeIds.has(b.id),
    })),
    ...extraBadges,
  ];

  const readmeConfig: ReadmeConfig = {
    ...defaultReadme,
    templateId,
    profileTextMode,
    advancedProfileMarkdown,
    headline,
    subtitleTags,
    bio,
    ctaLine,
    statsTableTitle,
    align,
    imageWidth,
    useOutputBranchUrl,
    includeMarkers: Boolean(markerMatch),
    includeTelemetryCaption: false,
    includeShareCard,
    includeStatsTable,
    customSectionTitle,
    customFooterMarkdown,
    badges: mergedBadges,
    stackCards:
      stackCards.length > 0
        ? stackCards
        : templateId === "auto-evolve-block"
          ? defaultReadme.stackCards
          : [],
    savedOrganizedCards: null,
    actionLinks,
    rawOverride: null,
  };

  return { creaturePatch, readmeConfig };
}

export function hydrateFromCreatureConfigJson(
  rawConfig: Record<string, unknown>,
  liveSnapshot: GitHubProfileSnapshot,
  defaultCreature: CreatureConfig,
  defaultReadme: ReadmeConfig
): { creatureConfig: CreatureConfig; readmeConfig: ReadmeConfig; customBgHex: string } {
  const creature: CreatureId =
    rawConfig.creature === "jellyfish" ? "jellyfish" : "tulkun";
  const view: CameraView =
    creature === "jellyfish"
      ? "side"
      : rawConfig.view === "top"
        ? "top"
        : "side";
  const windowMode: ContributionWindow =
    rawConfig.windowMode === "all-time" ? "all-time" : "annual";
  const colorMode: ColorMode =
    rawConfig.colorMode === "languages"
      ? "languages"
      : rawConfig.colorMode === "custom"
        ? "custom"
        : "canonical";
  const backgroundMode: BackgroundMode =
    rawConfig.backgroundMode === "custom" ? "custom" : "transparent";

  let waterMode: WaterMode = "water";
  if (
    rawConfig.waterMode === "water" ||
    rawConfig.waterMode === "no-water" ||
    rawConfig.waterMode === "clear"
  ) {
    waterMode = rawConfig.waterMode;
  } else if (rawConfig.inWater === false) {
    waterMode = "no-water";
  }

  const languageCount: LanguageCount =
    rawConfig.languageCount === 7 || rawConfig.languageCount === 5
      ? rawConfig.languageCount
      : 3;
  const animationSpeed =
    typeof rawConfig.animationSpeed === "number" &&
    Number.isFinite(rawConfig.animationSpeed)
      ? Math.min(2.5, Math.max(0.4, rawConfig.animationSpeed))
      : defaultCreature.animationSpeed;
  const showHud =
    typeof rawConfig.showHud === "boolean"
      ? rawConfig.showHud
      : defaultCreature.showHud;
  const customTitle =
    typeof rawConfig.customTitle === "string" ? rawConfig.customTitle : "";

  const hudFontSize =
    typeof rawConfig.hudFontSize === "number" &&
    Number.isFinite(rawConfig.hudFontSize)
      ? Math.min(22, Math.max(12, Math.round(rawConfig.hudFontSize)))
      : defaultCreature.hudFontSize;
  const hudFontFamily: HudFontFamily =
    rawConfig.hudFontFamily === "mono" ||
    rawConfig.hudFontFamily === "sans" ||
    rawConfig.hudFontFamily === "serif"
      ? rawConfig.hudFontFamily
      : "pixel";
  const hudFontWeight: HudFontWeight =
    rawConfig.hudFontWeight === "normal" ||
    rawConfig.hudFontWeight === "semibold"
      ? rawConfig.hudFontWeight
      : "bold";
  const hudFontColor =
    typeof rawConfig.hudFontColor === "string" && rawConfig.hudFontColor.trim()
      ? normalizeHex(rawConfig.hudFontColor, defaultCreature.hudFontColor)
      : defaultCreature.hudFontColor;
  const hudAlign: HudAlign =
    rawConfig.hudAlign === "center" || rawConfig.hudAlign === "right"
      ? rawConfig.hudAlign
      : "left";

  const rawColors =
    rawConfig.colors && typeof rawConfig.colors === "object"
      ? (rawConfig.colors as Record<string, unknown>)
      : {};
  const orig = ORIGINAL_CREATURE_PALETTES[creature];
  const bgHex =
    backgroundMode === "custom" && typeof rawColors.background === "string"
      ? normalizeHex(rawColors.background, "#0D1117")
      : "#0D1117";

  const savedLangs = Array.isArray(rawConfig.languages)
    ? (rawConfig.languages as { name?: unknown; color?: unknown; share?: unknown }[])
        .filter((l) => l && typeof l.name === "string" && l.name.trim())
        .map((l, idx) => ({
          name: String(l.name),
          color:
            typeof l.color === "string"
              ? normalizeHex(l.color, DEFAULT_LANGUAGES[idx % 7].color)
              : DEFAULT_LANGUAGES[idx % 7].color,
          ...(typeof l.share === "number" ? { share: l.share } : {}),
        }))
    : [];

  const mergedLangs = ensureLanguageSlots(
    savedLangs.length > 0 ? savedLangs : liveSnapshot.languages,
    languageCount
  );

  const commits =
    windowMode === "all-time"
      ? liveSnapshot.allTimeCommits
      : liveSnapshot.annualCommits;

  let creatureConfig: CreatureConfig = {
    creature,
    view,
    windowMode,
    colorMode,
    colors: {
      primary:
        typeof rawColors.primary === "string"
          ? normalizeHex(rawColors.primary, orig.primary)
          : orig.primary,
      accent:
        typeof rawColors.accent === "string"
          ? normalizeHex(rawColors.accent, orig.accent)
          : orig.accent,
      energy:
        typeof rawColors.energy === "string"
          ? normalizeHex(rawColors.energy, orig.energy)
          : orig.energy,
      frame:
        typeof rawColors.frame === "string"
          ? normalizeHex(rawColors.frame, orig.frame)
          : orig.frame,
      background: backgroundMode === "transparent" ? "transparent" : bgHex,
    },
    backgroundMode,
    waterMode,
    languageCount,
    animationSpeed,
    showHud,
    customTitle,
    hudFontSize,
    hudFontFamily,
    hudFontWeight,
    hudFontColor,
    hudAlign,
    commits,
    username: liveSnapshot.username,
    languages: mergedLangs,
  };

  if (colorMode === "languages") {
    creatureConfig = applyLanguageColors(creatureConfig, mergedLangs);
  }

  // Hydrate README state: prefer rich saved rawConfig.readme, fallback to parsing existing README.md
  const rawRm =
    rawConfig.readme && typeof rawConfig.readme === "object"
      ? (rawConfig.readme as Record<string, unknown>)
      : {};
  const fallbackParsed = isDynamicCreatureReadme(liveSnapshot.existingProfileReadme)
    ? parseExistingDynamicReadme(
        liveSnapshot.existingProfileReadme!,
        creatureConfig,
        defaultReadme
      ).readmeConfig
    : defaultReadme;

  const customBadgesRaw = Array.isArray(rawRm.customBadges)
    ? (rawRm.customBadges as ReadmeBadge[])
    : [];
  const customBadgeIds = new Set(customBadgesRaw.map((b) => b.id));
  const mergedBadges: ReadmeBadge[] = [
    ...fallbackParsed.badges.filter((b) => !customBadgeIds.has(b.id)),
    ...customBadgesRaw,
  ];

  const readmeConfig: ReadmeConfig = {
    ...fallbackParsed,
    templateId:
      rawRm.templateId === "minimal-header" ||
      rawRm.templateId === "auto-evolve-block" ||
      rawRm.templateId === "telemetry-stats" ||
      rawRm.templateId === "cyber-guardian"
        ? rawRm.templateId
        : fallbackParsed.templateId,
    profileTextMode:
      rawRm.profileTextMode === "advanced" ||
      rawRm.profileTextMode === "structured"
        ? rawRm.profileTextMode
        : fallbackParsed.profileTextMode,
    advancedProfileMarkdown:
      typeof rawRm.advancedProfileMarkdown === "string"
        ? rawRm.advancedProfileMarkdown
        : fallbackParsed.advancedProfileMarkdown,
    headline:
      typeof rawRm.headline === "string"
        ? rawRm.headline
        : fallbackParsed.headline,
    subtitleTags: Array.isArray(rawRm.subtitleTags)
      ? rawRm.subtitleTags.map(String)
      : fallbackParsed.subtitleTags,
    bio: typeof rawRm.bio === "string" ? rawRm.bio : fallbackParsed.bio,
    ctaLine:
      typeof rawRm.ctaLine === "string"
        ? rawRm.ctaLine
        : fallbackParsed.ctaLine,
    statsTableTitle:
      typeof rawRm.statsTableTitle === "string"
        ? rawRm.statsTableTitle
        : fallbackParsed.statsTableTitle,
    align:
      rawRm.align === "left" || rawRm.align === "center"
        ? rawRm.align
        : fallbackParsed.align,
    imageWidth:
      typeof rawRm.imageWidth === "number" && Number.isFinite(rawRm.imageWidth)
        ? Math.min(920, Math.max(320, rawRm.imageWidth))
        : fallbackParsed.imageWidth,
    useOutputBranchUrl:
      typeof rawRm.useOutputBranchUrl === "boolean"
        ? rawRm.useOutputBranchUrl
        : fallbackParsed.useOutputBranchUrl,
    includeMarkers:
      typeof rawRm.includeMarkers === "boolean"
        ? rawRm.includeMarkers
        : fallbackParsed.includeMarkers,
    includeShareCard:
      typeof rawRm.includeShareCard === "boolean"
        ? rawRm.includeShareCard
        : fallbackParsed.includeShareCard,
    includeStatsTable:
      typeof rawRm.includeStatsTable === "boolean"
        ? rawRm.includeStatsTable
        : fallbackParsed.includeStatsTable,
    customSectionTitle:
      typeof rawRm.customSectionTitle === "string"
        ? rawRm.customSectionTitle
        : fallbackParsed.customSectionTitle,
    customFooterMarkdown:
      typeof rawRm.customFooterMarkdown === "string"
        ? rawRm.customFooterMarkdown
        : fallbackParsed.customFooterMarkdown,
    badges: mergedBadges,
    stackCards: Array.isArray(rawRm.stackCards)
      ? (rawRm.stackCards as TechStackCard[])
      : fallbackParsed.stackCards,
    savedOrganizedCards:
      Array.isArray(rawRm.savedOrganizedCards) ||
      rawRm.savedOrganizedCards === null
        ? (rawRm.savedOrganizedCards as TechStackCard[] | null)
        : null,
    actionLinks: Array.isArray(rawRm.actionLinks)
      ? (rawRm.actionLinks as ReadmeActionLink[])
      : fallbackParsed.actionLinks,
    rawOverride:
      typeof rawRm.rawOverride === "string" || rawRm.rawOverride === null
        ? rawRm.rawOverride
        : null,
  };

  return { creatureConfig, readmeConfig, customBgHex: bgHex };
}
