import { getCreatureMeta, getEvolutionStage } from "@/lib/themes";
import type {
  CreatureConfig,
  ReadmeConfig,
  ReadmeTemplateId,
} from "@/types/creature";

export const README_TEMPLATES: {
  id: ReadmeTemplateId;
  name: string;
  description: string;
}[] = [
  {
    id: "cyber-guardian",
    name: "Cyber Guardian Profile",
    description: "Hero creature banner + caption + bio + badges + stats table",
  },
  {
    id: "minimal-header",
    name: "Minimalist Header",
    description: "Clean centered creature banner with headline & tagline",
  },
  {
    id: "auto-evolve-block",
    name: "Auto-Evolve Marker Block",
    description: "Drop-in START/END marker block updated daily by GitHub Actions",
  },
  {
    id: "telemetry-stats",
    name: "Telemetry & Share Card",
    description: "Creature + live stage progression table + 1280x640 social card",
  },
];

export const DYNAMIC_TOKENS = [
  { token: "{{USERNAME}}", description: "GitHub handle" },
  { token: "{{CREATURE}}", description: "Creature name" },
  { token: "{{STAGE}}", description: "Evolution stage (1-5)" },
  { token: "{{RANK}}", description: "Stage rank" },
  { token: "{{COMMITS}}", description: "Formatted commit count" },
  { token: "{{VIEW}}", description: "Camera view" },
  { token: "{{LANGUAGES}}", description: "Top languages" },
];

export const DEFAULT_README_CONFIG: ReadmeConfig = {
  templateId: "cyber-guardian",
  headline: "Hi, I'm @{{USERNAME}}",
  bio: "Systems & creative engineer building modular developer tools, generative SVG engines, and high-craft web interfaces. My cybernetic profile guardian evolves automatically with every commit.",
  align: "center",
  imageWidth: 760,
  useOutputBranchUrl: false,
  includeMarkers: true,
  includeTelemetryCaption: true,
  includeShareCard: false,
  includeStatsTable: true,
  customFooterMarkdown: "",
  badges: [
    { id: "nextjs", label: "Next.js 16", color: "000000", enabled: true },
    { id: "ts", label: "TypeScript", color: "3178C6", enabled: true },
    { id: "svg", label: "Pure CSS SVG", color: "FF6B00", enabled: true },
    { id: "actions", label: "Auto-Evolve", color: "00E676", enabled: true },
  ],
  rawOverride: null,
};

export function resolveDynamicTokens(
  text: string,
  creature: CreatureConfig
): string {
  const safeUser = creature.username.trim() || "PathumSandeepa";
  const meta = getCreatureMeta(creature.creature);
  const stage = getEvolutionStage(creature.commits);
  const commitsText = Math.max(0, Math.floor(creature.commits || 0)).toLocaleString(
    "en-US"
  );
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

export function buildMarkerSection(
  creature: CreatureConfig,
  readme: ReadmeConfig
): string {
  const safeUser = creature.username.trim() || "PathumSandeepa";
  const meta = getCreatureMeta(creature.creature);
  const stage = getEvolutionStage(creature.commits);
  const commitsText = Math.max(0, Math.floor(creature.commits || 0)).toLocaleString(
    "en-US"
  );
  const imgSrc = getCreatureImageSrc(creature, readme, "creature.svg");
  const alignAttr = readme.align === "center" ? ' align="center"' : "";

  const lines: string[] = [];
  if (readme.includeMarkers) {
    lines.push("<!-- CYBER-CREATURE:START -->");
  }

  lines.push(`<p${alignAttr}>`);
  lines.push(
    `  <a href="https://github.com/PathumSandeepa/dynamic-readme-creature">`
  );
  lines.push(
    `    <img src="${imgSrc}" width="${readme.imageWidth}" alt="${meta.name} - Stage ${stage.stage} ${stage.rank}" />`
  );
  lines.push(`  </a>`);
  lines.push(`</p>`);

  if (readme.includeTelemetryCaption) {
    lines.push("");
    lines.push(
      `<p${alignAttr}><sub>Live <code>dynamic-readme-creature</code> for <strong>@${safeUser}</strong> — <strong>Stage ${stage.stage}: ${stage.rank} ${meta.name}</strong> · <code>${commitsText} commits</code> · View: <code>${creature.view}</code></sub></p>`
    );
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
  const commitsText = Math.max(0, Math.floor(creature.commits || 0)).toLocaleString(
    "en-US"
  );

  const markerBlock = buildMarkerSection(creature, readme);
  if (readme.templateId === "auto-evolve-block") {
    return markerBlock;
  }

  const parts: string[] = [markerBlock];
  const resolvedHeadline = resolveDynamicTokens(readme.headline, creature).trim();
  const resolvedBio = resolveDynamicTokens(readme.bio, creature).trim();

  if (resolvedHeadline) {
    parts.push(`## ${resolvedHeadline}`);
  }
  if (resolvedBio) {
    parts.push(resolvedBio);
  }

  const activeBadges = readme.badges.filter((b) => b.enabled && b.label.trim());
  if (activeBadges.length > 0 && readme.templateId !== "minimal-header") {
    const badgeLine = activeBadges
      .map((b) => {
        const encoded = encodeURIComponent(b.label.trim().replace(/-/g, "--"));
        const colorHex = b.color.replace("#", "") || "1F242D";
        return `  <img src="https://img.shields.io/badge/${encoded}-${colorHex}?style=for-the-badge" alt="${b.label.trim()}" />`;
      })
      .join("\n");
    parts.push(`<p align="${readme.align}">\n${badgeLine}\n</p>`);
  }

  if (readme.includeStatsTable && readme.templateId !== "minimal-header") {
    const langList = creature.languages
      .map((l) => `\`${l.name}\``)
      .join(" · ");
    parts.push(
      [
        `### Cybernetic Telemetry`,
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
        `<p align="${readme.align}">`,
        `  <img src="${shareSrc}" width="${readme.imageWidth}" alt="@${safeUser} Cyber Creature Share Card" />`,
        `</p>`,
      ].join("\n")
    );
  }

  if (readme.customFooterMarkdown.trim()) {
    parts.push(resolveDynamicTokens(readme.customFooterMarkdown.trim(), creature));
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
