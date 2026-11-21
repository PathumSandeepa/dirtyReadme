import type { CreatureConfig } from "@/domain/creature/entities";
import {
  getCreatureMeta,
  getEvolutionStage,
  getViewDisplayLabel,
} from "@/domain/creature/services";
import type {
  ReadmeActionLink,
  ReadmeBadge,
  ReadmeConfig,
  TechStackCard,
} from "@/domain/profile/entities";

function escapeShieldsSegment(text: string): string {
  return encodeURIComponent(
    text.trim().replace(/-/g, "--").replace(/_/g, "__")
  );
}

export function buildShieldBadgeUrl(badge: ReadmeBadge): string {
  const label = escapeShieldsSegment(badge.label || "SKILL");
  const color = badge.color.replace("#", "") || "1F242D";
  const params = new URLSearchParams({ style: "for-the-badge" });
  if (badge.logo) params.set("logo", badge.logo);
  if (badge.logoColor) params.set("logoColor", badge.logoColor);
  return `https://img.shields.io/badge/${label}-${color}?${params.toString()}`;
}

export function buildActionLinkBadgeUrl(
  link: ReadmeActionLink,
  creature: CreatureConfig
): string {
  const left = escapeShieldsSegment(
    resolveDynamicTokens(link.label, creature) || "LINK"
  );
  const right = escapeShieldsSegment(
    resolveDynamicTokens(link.valueText, creature) || "OPEN"
  );
  const color = link.color.replace("#", "") || "18181B";
  const params = new URLSearchParams({
    style: "for-the-badge",
    labelColor: "1F242D",
  });
  if (link.logo) params.set("logo", link.logo);
  params.set("logoColor", "white");
  return `https://img.shields.io/badge/${left}-${right}-${color}?${params.toString()}`;
}

export function resolveDynamicTokens(
  text: string,
  creature: CreatureConfig
): string {
  const safeUser = creature.username.trim() || "your-username";
  const meta = getCreatureMeta(creature.creature);
  const stage = getEvolutionStage(creature.commits);
  const commitsText = Math.max(
    0,
    Math.floor(creature.commits || 0)
  ).toLocaleString("en-US");
  const langsText = creature.languages.map((l) => l.name).join(" · ");
  const viewText = getViewDisplayLabel(creature.creature, creature.view);

  return text
    .replaceAll("{{USERNAME}}", safeUser)
    .replaceAll("{{CREATURE}}", meta.name)
    .replaceAll("{{STAGE}}", String(stage.stage))
    .replaceAll("{{RANK}}", stage.rank)
    .replaceAll("{{COMMITS}}", commitsText)
    .replaceAll("{{VIEW}}", viewText)
    .replaceAll("{{LANGUAGES}}", langsText);
}

export function getCreatureImageSrc(
  creature: CreatureConfig,
  readme: ReadmeConfig,
  filename = "creature.webp"
): string {
  const safeUser = creature.username.trim() || "your-username";
  return readme.useOutputBranchUrl
    ? `https://raw.githubusercontent.com/${safeUser}/${safeUser}/output/${filename}`
    : `./${filename}`;
}

export function reorderItems<T>(
  items: T[],
  fromIndex: number,
  toIndex: number
): T[] {
  if (
    fromIndex < 0 ||
    toIndex < 0 ||
    fromIndex >= items.length ||
    toIndex >= items.length ||
    fromIndex === toIndex
  ) {
    return items;
  }
  const copy = [...items];
  const [moved] = copy.splice(fromIndex, 1);
  copy.splice(toIndex, 0, moved);
  return copy;
}

export function addBadgeToStackCard(
  cards: TechStackCard[],
  cardId: string,
  badgeId: string,
  beforeBadgeId?: string
): TechStackCard[] {
  return cards.map((card) => {
    if (card.id !== cardId) return card;
    const without = card.badgeIds.filter((id) => id !== badgeId);
    if (!beforeBadgeId) {
      return { ...card, badgeIds: [...without, badgeId] };
    }
    const targetIdx = without.indexOf(beforeBadgeId);
    if (targetIdx === -1) {
      return { ...card, badgeIds: [...without, badgeId] };
    }
    const next = [...without];
    next.splice(targetIdx, 0, badgeId);
    return { ...card, badgeIds: next };
  });
}

export function removeBadgeFromStackCard(
  cards: TechStackCard[],
  cardId: string,
  badgeId: string
): TechStackCard[] {
  return cards.map((card) =>
    card.id === cardId
      ? { ...card, badgeIds: card.badgeIds.filter((id) => id !== badgeId) }
      : card
  );
}

export function moveBadgeBetweenStackCards(
  cards: TechStackCard[],
  badgeId: string,
  fromCardId: string,
  toCardId: string,
  targetBadgeId?: string
): TechStackCard[] {
  if (fromCardId === toCardId) {
    return cards.map((card) => {
      if (card.id !== toCardId) return card;
      const fromIdx = card.badgeIds.indexOf(badgeId);
      if (fromIdx === -1) return card;
      if (!targetBadgeId) {
        return {
          ...card,
          badgeIds: reorderItems(card.badgeIds, fromIdx, card.badgeIds.length - 1),
        };
      }
      const toIdx = card.badgeIds.indexOf(targetBadgeId);
      if (toIdx === -1) return card;
      return {
        ...card,
        badgeIds: reorderItems(card.badgeIds, fromIdx, toIdx),
      };
    });
  }

  const removed = removeBadgeFromStackCard(cards, fromCardId, badgeId);
  return addBadgeToStackCard(removed, toCardId, badgeId, targetBadgeId);
}

export function reorderStackCards(
  cards: TechStackCard[],
  fromIdx: number,
  toIdx: number
): TechStackCard[] {
  return reorderItems(cards, fromIdx, toIdx);
}

export function buildMarkerSection(
  creature: CreatureConfig,
  readme: ReadmeConfig
): string {
  const meta = getCreatureMeta(creature.creature);
  const stage = getEvolutionStage(creature.commits);
  const safeUser = creature.username.trim() || "your-username";
  const imgSrc = getCreatureImageSrc(creature, readme, "creature.webp");

  const lines: string[] = [];
  if (readme.includeMarkers) {
    lines.push("<!-- CYBER-CREATURE:START -->");
  }

  lines.push(`<p align="${readme.align}">`);
  lines.push(`  <a href="https://github.com/${safeUser}/${safeUser}">`);
  lines.push(
    `    <img src="${imgSrc}" width="${readme.imageWidth}" alt="${meta.name} - Stage ${stage.stage} ${stage.rank}" />`
  );
  lines.push(`  </a>`);
  lines.push(`</p>`);

  if (readme.includeTelemetryCaption) {
    const resolvedCaption = resolveDynamicTokens(
      readme.telemetryCaptionTemplate,
      creature
    ).trim();
    if (resolvedCaption) {
      lines.push("");
      lines.push(`<p align="${readme.align}"><sub>${resolvedCaption}</sub></p>`);
    }
  }

  if (readme.includeMarkers) {
    lines.push("<!-- CYBER-CREATURE:END -->");
  }

  return lines.join("\n");
}

export function buildStatsTableSection(
  creature: CreatureConfig,
  readme: ReadmeConfig
): string {
  const meta = getCreatureMeta(creature.creature);
  const stage = getEvolutionStage(creature.commits);
  const commitsText = Math.max(
    0,
    Math.floor(creature.commits || 0)
  ).toLocaleString("en-US");
  const viewLabel = getViewDisplayLabel(creature.creature, creature.view);
  const langList = creature.languages.map((l) => `\`${l.name}\``).join(" · ");
  const tableHeading =
    resolveDynamicTokens(readme.statsTableTitle, creature).trim() ||
    "Cybernetic Telemetry";

  const rows = [
    `### ${tableHeading}`,
    ``,
    `| Metric | Active Value |`,
    `| --- | --- |`,
    `| **Guardian Chassis** | ${meta.name} (\`${meta.designation}\`) |`,
    `| **Evolution Stage** | Stage ${stage.stage} / 5 — **${stage.rank}** |`,
    `| **Contributions (${creature.windowMode})** | \`${commitsText}\` commits |`,
    `| **Camera Angle** | \`${viewLabel}\` |`,
    `| **Top Languages** | ${langList} |`,
  ];

  if (readme.includeMarkers) {
    return [
      "<!-- CYBER-CREATURE-STATS:START -->",
      ...rows,
      "<!-- CYBER-CREATURE-STATS:END -->",
    ].join("\n");
  }
  return rows.join("\n");
}

export function buildGeneratedReadmeMarkdown(
  creature: CreatureConfig,
  readme: ReadmeConfig
): string {
  const safeUser = creature.username.trim() || "your-username";
  const markerBlock = buildMarkerSection(creature, readme);
  if (readme.templateId === "auto-evolve-block") {
    return markerBlock;
  }

  const parts: string[] = [];
  const resolvedHeadline = resolveDynamicTokens(readme.headline, creature).trim();
  const resolvedBio = resolveDynamicTokens(readme.bio, creature).trim();
  const resolvedCta = resolveDynamicTokens(readme.ctaLine, creature).trim();
  const isMinimal = readme.templateId === "minimal-header";
  const isTelemetry = readme.templateId === "telemetry-stats";

  if (resolvedHeadline) {
    parts.push(`## ${resolvedHeadline}`);
  }

  if (readme.subtitleTags.length > 0 && !isMinimal) {
    const tagLine = readme.subtitleTags
      .map((t) => resolveDynamicTokens(t, creature).trim().toUpperCase())
      .filter(Boolean)
      .join(" | ");
    if (tagLine) {
      parts.push(`**${tagLine}**`);
    }
  }

  if (resolvedBio) {
    parts.push(resolvedBio);
  }

  if (resolvedCta && !isMinimal) {
    parts.push(resolvedCta);
  }

  if (!isMinimal) {
    const badgeById = new Map(readme.badges.map((b) => [b.id, b]));
    const cardSections = readme.stackCards
      .map((card) => {
        const badges = card.badgeIds
          .map((id) => badgeById.get(id))
          .filter((b): b is ReadmeBadge => Boolean(b && b.label.trim()));
        if (badges.length === 0) return null;
        const imgs = badges
          .map(
            (b) =>
              `  <img src="${buildShieldBadgeUrl(b)}" alt="${b.label.trim()}" />`
          )
          .join("\n");
        const title = card.title.trim();
        return title
          ? `#### ${title}\n\n<p align="${readme.align}">\n${imgs}\n</p>`
          : `<p align="${readme.align}">\n${imgs}\n</p>`;
      })
      .filter((s): s is string => Boolean(s));

    if (cardSections.length > 0) {
      parts.push(cardSections.join("\n\n"));
    }
  }

  const activeLinks = readme.actionLinks.filter(
    (l) => l.enabled && l.label.trim()
  );
  if (activeLinks.length > 0 && !isMinimal) {
    const linkImages = activeLinks
      .map((l) => {
        const href = resolveDynamicTokens(l.url, creature);
        return `  <a href="${href}"><img src="${buildActionLinkBadgeUrl(l, creature)}" alt="${l.label}" /></a>`;
      })
      .join("\n");
    parts.push(`<p align="${readme.align}">\n${linkImages}\n</p>`);
  }

  parts.push(markerBlock);

  if (!isMinimal && (isTelemetry || readme.includeStatsTable)) {
    parts.push(buildStatsTableSection(creature, readme));
  }

  if (!isMinimal && (isTelemetry || readme.includeShareCard)) {
    const shareSrc = getCreatureImageSrc(creature, readme, "share-card.png");
    parts.push(
      [
        `### Annual Share Card`,
        ``,
        `<p align="${readme.align}">`,
        `  <img src="${shareSrc}" width="${readme.imageWidth}" alt="@${safeUser} Cyber Creature Share Card" />`,
        `</p>`,
      ].join("\n")
    );
  }

  if (!isMinimal && readme.customFooterMarkdown.trim()) {
    const heading = resolveDynamicTokens(
      readme.customSectionTitle,
      creature
    ).trim();
    const body = resolveDynamicTokens(
      readme.customFooterMarkdown.trim(),
      creature
    );
    parts.push(heading ? `### ${heading}\n\n${body}` : body);
  }

  return parts.join("\n\n");
}

export function getEffectiveReadmeMarkdown(
  creature: CreatureConfig,
  readme: ReadmeConfig
): string {
  if (readme.rawOverride !== null) {
    return resolveDynamicTokens(readme.rawOverride, creature);
  }
  return buildGeneratedReadmeMarkdown(creature, readme);
}
