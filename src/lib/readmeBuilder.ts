import { getCreatureMeta, getEvolutionStage } from "@/lib/themes";
import type {
  CreatureConfig,
  ReadmeActionLink,
  ReadmeBadge,
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
    name: "Full Developer Profile",
    description:
      "Title + specialty tags + bio + multi-row badges + CTA links + animated creature",
  },
  {
    id: "minimal-header",
    name: "Minimalist Header",
    description: "Clean centered creature banner with headline & tagline",
  },
  {
    id: "auto-evolve-block",
    name: "Auto-Evolve Marker Block",
    description:
      "Drop-in START/END marker block updated daily by GitHub Actions",
  },
  {
    id: "telemetry-stats",
    name: "Telemetry & Share Card",
    description:
      "Creature + live evolution telemetry table + 1280x640 social card",
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

export const TECH_STACK_CATALOG: Omit<ReadmeBadge, "enabled">[] = [
  // Design & Creative
  { id: "figma", label: "Figma", color: "F24E1E", logo: "figma", logoColor: "white", category: "design" },
  { id: "photoshop", label: "Photoshop", color: "31A8FF", logo: "adobephotoshop", logoColor: "white", category: "design" },
  { id: "illustrator", label: "Illustrator", color: "FF9A00", logo: "adobeillustrator", logoColor: "white", category: "design" },
  { id: "aftereffects", label: "After Effects", color: "9999FF", logo: "adobeaftereffects", logoColor: "white", category: "design" },
  { id: "blender", label: "Blender", color: "F5792A", logo: "blender", logoColor: "white", category: "design" },

  // Frontend & Runtime
  { id: "react", label: "React", color: "20232A", logo: "react", logoColor: "61DAFB", category: "frontend" },
  { id: "nextjs", label: "Next.js", color: "000000", logo: "nextdotjs", logoColor: "white", category: "frontend" },
  { id: "tailwindcss", label: "Tailwind CSS", color: "06B6D4", logo: "tailwindcss", logoColor: "white", category: "frontend" },
  { id: "nodejs", label: "Node.js", color: "339933", logo: "nodedotjs", logoColor: "white", category: "frontend" },
  { id: "vue", label: "Vue.js", color: "4FC08D", logo: "vuedotjs", logoColor: "white", category: "frontend" },
  { id: "svelte", label: "Svelte", color: "FF3E00", logo: "svelte", logoColor: "white", category: "frontend" },
  { id: "html5", label: "HTML5", color: "E34F26", logo: "html5", logoColor: "white", category: "frontend" },
  { id: "css3", label: "CSS3", color: "1572B6", logo: "css3", logoColor: "white", category: "frontend" },

  // Languages
  { id: "typescript", label: "TypeScript", color: "3178C6", logo: "typescript", logoColor: "white", category: "languages" },
  { id: "javascript", label: "JavaScript", color: "323330", logo: "javascript", logoColor: "F7DF1E", category: "languages" },
  { id: "python", label: "Python", color: "3776AB", logo: "python", logoColor: "white", category: "languages" },
  { id: "rust", label: "Rust", color: "000000", logo: "rust", logoColor: "white", category: "languages" },
  { id: "go", label: "Go", color: "00ADD8", logo: "go", logoColor: "white", category: "languages" },
  { id: "java", label: "Java", color: "ED8B00", logo: "openjdk", logoColor: "white", category: "languages" },
  { id: "kotlin", label: "Kotlin", color: "7F52FF", logo: "kotlin", logoColor: "white", category: "languages" },
  { id: "csharp", label: "C#", color: "239120", logo: "sharp", logoColor: "white", category: "languages" },
  { id: "cpp", label: "C++", color: "00599C", logo: "cplusplus", logoColor: "white", category: "languages" },
  { id: "shell", label: "Shell Script", color: "121011", logo: "gnubash", logoColor: "white", category: "languages" },

  // Backend & Databases
  { id: "postgres", label: "PostgreSQL", color: "316192", logo: "postgresql", logoColor: "white", category: "backend" },
  { id: "mongodb", label: "MongoDB", color: "47A248", logo: "mongodb", logoColor: "white", category: "backend" },
  { id: "redis", label: "Redis", color: "DC382D", logo: "redis", logoColor: "white", category: "backend" },
  { id: "prisma", label: "Prisma", color: "2D3748", logo: "prisma", logoColor: "white", category: "backend" },
  { id: "graphql", label: "GraphQL", color: "E10098", logo: "graphql", logoColor: "white", category: "backend" },

  // DevOps & Tools
  { id: "docker", label: "Docker", color: "2496ED", logo: "docker", logoColor: "white", category: "devops" },
  { id: "git", label: "Git", color: "F05032", logo: "git", logoColor: "white", category: "devops" },
  { id: "actions", label: "GitHub Actions", color: "2088FF", logo: "githubactions", logoColor: "white", category: "devops" },
  { id: "vscode", label: "VS Code", color: "007ACC", logo: "visualstudiocode", logoColor: "white", category: "devops" },
  { id: "pnpm", label: "pnpm", color: "F69220", logo: "pnpm", logoColor: "white", category: "devops" },
  { id: "linux", label: "Linux", color: "FCC624", logo: "linux", logoColor: "black", category: "devops" },
];

const INITIAL_ENABLED_IDS = new Set([
  "figma",
  "react",
  "nextjs",
  "tailwindcss",
  "nodejs",
  "html5",
  "css3",
  "typescript",
  "javascript",
  "python",
  "rust",
  "postgres",
  "docker",
  "actions",
  "vscode",
]);

export const DEFAULT_README_CONFIG: ReadmeConfig = {
  templateId: "cyber-guardian",
  headline: "Pathum Sandeepa | Creative Builder",
  subtitleTags: [
    "FULL-STACK PLATFORMS",
    "CREATIVE CODING",
    "SCALABLE SYSTEMS",
    "UI/UX DESIGN",
  ],
  bio: "I'm @{{USERNAME}}, a software engineer and creative builder sitting at the intersection of systems engineering and visual craft. You'll usually find me shipping open-source developer tools, generative SVG engines, and high-performance full-stack applications.",
  ctaLine:
    "Curious to see what I've been up to? Check out my live cybernetic profile guardian below 👇",
  align: "left",
  imageWidth: 760,
  useOutputBranchUrl: false,
  includeMarkers: true,
  includeTelemetryCaption: true,
  includeShareCard: false,
  includeStatsTable: false,
  customFooterMarkdown: "",
  badges: TECH_STACK_CATALOG.map((b) => ({
    ...b,
    enabled: INITIAL_ENABLED_IDS.has(b.id),
  })),
  actionLinks: [
    {
      id: "github",
      label: "GITHUB",
      valueText: "@PathumSandeepa",
      url: "https://github.com/PathumSandeepa",
      color: "181717",
      logo: "github",
      enabled: true,
    },
    {
      id: "studio",
      label: "STUDIO",
      valueText: "CREATURE GENERATOR",
      url: "https://pathumsandeepa.github.io/dynamic-readme-creature/",
      color: "FF6B00",
      logo: "vercel",
      enabled: true,
    },
    {
      id: "sponsor",
      label: "SUPPORT",
      valueText: "STAR THIS PROJECT",
      url: "https://github.com/PathumSandeepa/dynamic-readme-creature",
      color: "00E676",
      logo: "githubsponsors",
      enabled: true,
    },
  ],
  profileDisplayName: "Pathum Sandeepa",
  profileLocation: "Sri Lanka",
  profileCompany: "Open Source Builder",
  profileWebsite: "https://pathumsandeepa.github.io/dynamic-readme-creature/",
  rawOverride: null,
};

export function buildShieldBadgeUrl(badge: ReadmeBadge): string {
  const label = encodeURIComponent(badge.label.trim().replace(/-/g, "--"));
  const color = badge.color.replace("#", "") || "1F242D";
  const params = new URLSearchParams({ style: "for-the-badge" });
  if (badge.logo) params.set("logo", badge.logo);
  if (badge.logoColor) params.set("logoColor", badge.logoColor);
  return `https://img.shields.io/badge/${label}-${color}?${params.toString()}`;
}

export function buildActionLinkBadgeUrl(link: ReadmeActionLink): string {
  const left = encodeURIComponent(link.label.trim().replace(/-/g, "--") || "LINK");
  const right = encodeURIComponent(
    link.valueText.trim().replace(/-/g, "--") || "OPEN"
  );
  const color = link.color.replace("#", "") || "FF6B00";
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

export function buildMarkerSection(
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
    lines.push("");
    lines.push(
      `<p align="center"><sub>Live <code>dynamic-readme-creature</code> for <strong>@${safeUser}</strong> — <strong>Stage ${stage.stage}: ${stage.rank} ${meta.name}</strong> · <code>${commitsText} commits</code> · View: <code>${creature.view}</code></sub></p>`
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
      .map((t) => t.trim().toUpperCase())
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

  // Tech Stack Badges
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

  // Action / Social Links
  const activeLinks = readme.actionLinks.filter(
    (l) => l.enabled && l.label.trim()
  );
  if (activeLinks.length > 0 && readme.templateId !== "minimal-header") {
    const linkImages = activeLinks
      .map((l) => {
        const href = resolveDynamicTokens(l.url, creature);
        return `  <a href="${href}"><img src="${buildActionLinkBadgeUrl(l)}" alt="${l.label}" /></a>`;
      })
      .join("\n");
    parts.push(`<p align="${readme.align}">\n${linkImages}\n</p>`);
  }

  // Creature Centerpiece
  parts.push(markerBlock);

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
        `<p align="center">`,
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
