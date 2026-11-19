import type { CreatureConfig } from "@/domain/creature/entities";
import { getCreatureMeta, getEvolutionStage } from "@/domain/creature/services";
import type {
  ReadmeActionLink,
  ReadmeBadge,
  ReadmeConfig,
} from "@/domain/profile/entities";

export function buildShieldBadgeUrl(badge: ReadmeBadge): string {
  const label = encodeURIComponent(badge.label.trim().replace(/-/g, "--"));
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
  const left = encodeURIComponent(
    resolveDynamicTokens(link.label, creature).trim().replace(/-/g, "--") ||
      "LINK"
  );
  const right = encodeURIComponent(
    resolveDynamicTokens(link.valueText, creature).trim().replace(/-/g, "--") ||
      "OPEN"
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
  const safeUser = creature.username.trim() || "PathumSandeepa";
  const meta = getCreatureMeta(creature.creature);
  const stage = getEvolutionStage(creature.commits);
  const commitsText = Math.max(
    0,
    Math.floor(creature.commits || 0)
  ).toLocaleString("en-US");
  const langsText = creature.languages.map((l) => l.name).join(" · ");

  return text
    .replaceAll("{{USERNAME}}", safeUser)
    .replaceAll("{{CREATURE}}", meta.name)
    .replaceAll("{{STAGE}}", String(stage.stage))
    .replaceAll("{{RANK}}", stage.rank)
    .replaceAll("{{COMMITS}}", commitsText)
    .replaceAll("{{VIEW}}", creature.view.toUpperCase())
    .replaceAll("{{LANGUAGES}}", langsText);
}

export function getCreatureImageSrc(
  creature: CreatureConfig,
  readme: ReadmeConfig,
  filename = "creature.svg"
): string {
  const safeUser = creature.username.trim() || "PathumSandeepa";
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

export function reorderEnabledBadges(
  badges: ReadmeBadge[],
  draggedId: string,
  targetId: string
): ReadmeBadge[] {
  if (draggedId === targetId) return badges;
  const fromIndex = badges.findIndex((b) => b.id === draggedId);
  const toIndex = badges.findIndex((b) => b.id === targetId);
  return reorderItems(badges, fromIndex, toIndex);
}

export function buildMarkerSection(
  creature: CreatureConfig,
  readme: ReadmeConfig
): string {
  const meta = getCreatureMeta(creature.creature);
  const stage = getEvolutionStage(creature.commits);
  const imgSrc = getCreatureImageSrc(creature, readme, "creature.svg");

  const lines: string[] = [];
  if (readme.includeMarkers) {
    lines.push("<!-- CYBER-CREATURE:START -->");
  }

  lines.push(`<p align="center">`);
  lines.push(
    `  <a href="https://github.com/PathumSandeepa/dynamic-readme-creature">`
  );
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
      lines.push(`<p align="center"><sub>${resolvedCaption}</sub></p>`);
    }
  }

  if (readme.includeMarkers) {
    lines.push("<!-- CYBER-CREATURE:END -->");
  }

  return lines.join("\n");
}

export function buildGeneratedReadmeMarkdown(
  creature: CreatureConfig,
  readme: ReadmeConfig
): string {
  const safeUser = creature.username.trim() || "PathumSandeepa";
  const meta = getCreatureMeta(creature.creature);
  const stage = getEvolutionStage(creature.commits);
  const commitsText = Math.max(
    0,
    Math.floor(creature.commits || 0)
  ).toLocaleString("en-US");

  const markerBlock = buildMarkerSection(creature, readme);
  if (readme.templateId === "auto-evolve-block") {
    return markerBlock;
  }

  const parts: string[] = [];
  const resolvedHeadline = resolveDynamicTokens(readme.headline, creature).trim();
  const resolvedBio = resolveDynamicTokens(readme.bio, creature).trim();
  const resolvedCta = resolveDynamicTokens(readme.ctaLine, creature).trim();

  if (resolvedHeadline) {
    parts.push(`## ${resolvedHeadline}`);
  }

  if (
    readme.subtitleTags.length > 0 &&
    readme.templateId !== "minimal-header"
  ) {
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

  if (resolvedCta && readme.templateId !== "minimal-header") {
    parts.push(resolvedCta);
  }

  const activeBadges = readme.badges.filter((b) => b.enabled && b.label.trim());
  if (activeBadges.length > 0 && readme.templateId !== "minimal-header") {
    const badgeImages = activeBadges
      .map(
        (b) =>
          `  <img src="${buildShieldBadgeUrl(b)}" alt="${b.label.trim()}" />`
      )
      .join("\n");
    parts.push(`<p align="${readme.align}">\n${badgeImages}\n</p>`);
  }

  const activeLinks = readme.actionLinks.filter(
    (l) => l.enabled && l.label.trim()
  );
  if (activeLinks.length > 0 && readme.templateId !== "minimal-header") {
    const linkImages = activeLinks
      .map((l) => {
        const href = resolveDynamicTokens(l.url, creature);
        return `  <a href="${href}"><img src="${buildActionLinkBadgeUrl(l, creature)}" alt="${l.label}" /></a>`;
      })
      .join("\n");
    parts.push(`<p align="${readme.align}">\n${linkImages}\n</p>`);
  }

  parts.push(markerBlock);

  if (readme.includeStatsTable && readme.templateId !== "minimal-header") {
    const langList = creature.languages
      .map((l) => `\`${l.name}\``)
      .join(" · ");
    const tableHeading =
      resolveDynamicTokens(readme.statsTableTitle, creature).trim() ||
      "Cybernetic Telemetry";
    parts.push(
      [
        `### ${tableHeading}`,
        ``,
        `| Metric | Active Value |`,
        `| --- | --- |`,
        `| **Guardian Chassis** | ${meta.name} (\`${meta.designation}\`) |`,
        `| **Evolution Stage** | Stage ${stage.stage} / 5 — **${stage.rank}** |`,
        `| **Contributions (${creature.windowMode})** | \`${commitsText}\` commits |`,
        `| **Camera Angle** | \`${creature.view}\` |`,
        `| **Top Languages** | ${langList} |`,
      ].join("\n")
    );
  }

  if (readme.includeShareCard) {
    const shareSrc = getCreatureImageSrc(creature, readme, "share-card.svg");
    parts.push(
      [
        `### Annual Share Card`,
        ``,
        `<p align="center">`,
        `  <img src="${shareSrc}" width="${readme.imageWidth}" alt="@${safeUser} Cyber Creature Share Card" />`,
        `</p>`,
      ].join("\n")
    );
  }

  if (readme.customFooterMarkdown.trim()) {
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
