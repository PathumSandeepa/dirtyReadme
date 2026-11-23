import {
  CREATURE_CATALOG,
  DEFAULT_CREATURE_CONFIG,
  DEFAULT_LANGUAGES,
  STAGE_DEFINITIONS,
} from "@/domain/creature/entities";
import {
  DEFAULT_TECH_STACK_CARDS,
  README_TEMPLATES,
  TECH_CATEGORIES_ORDER,
  TECH_STACK_CATALOG,
} from "@/domain/profile/entities";
import { PROFILE_EDITOR_TEMPLATES } from "@/domain/profile/markdownRichText";
import { PLATFORM_ICON_CATALOG } from "@/domain/profile/platformIcons";
import { generateEvolveWorkflowYaml } from "@/domain/automation/workflowService";
import pkg from "../../../../package.json";

export const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH || "";

export function showcaseAsset(filename: string): string {
  return `${BASE_PATH}/showcase/${filename}`;
}

export function homeAsset(filename: string): string {
  return `${BASE_PATH}/home/${filename}`;
}

export const LICENSE_NAME = "MIT License";

export const HOME_FACTS = {
  templateCount: PROFILE_EDITOR_TEMPLATES.length,
  layoutPresetCount: README_TEMPLATES.length,
  creatureCount: CREATURE_CATALOG.length,
  stageCount: STAGE_DEFINITIONS.length,
  serverCount: 0,
  techBadgeCount: TECH_STACK_CATALOG.length,
  techCategoryCount: TECH_CATEGORIES_ORDER.length,
  platformIconCount: PLATFORM_ICON_CATALOG.length,
  appVersion: pkg.version,
  sampleCommits: DEFAULT_CREATURE_CONFIG.commits,
  sampleLanguages: DEFAULT_LANGUAGES.slice(0, 3),
} as const;

export const HERO_SAMPLE_BADGES = (() => {
  const map = new Map(TECH_STACK_CATALOG.map((item) => [item.id, item]));
  return DEFAULT_TECH_STACK_CARDS.flatMap((card) =>
    card.badgeIds
      .map((id) => map.get(id))
      .filter((item): item is NonNullable<typeof item> => Boolean(item))
  ).slice(0, 6);
})();

export const STACK_DEMO_BADGES = (() => {
  const ids = [
    "typescript",
    "javascript",
    "react",
    "nextjs",
    "tailwindcss",
    "nodejs",
    "python",
    "rust",
    "go",
    "postgresql",
    "docker",
    "figma",
  ];
  return ids
    .map((id) => TECH_STACK_CATALOG.find((item) => item.id === id))
    .filter((item): item is NonNullable<typeof item> => Boolean(item));
})();

export const STACK_DEMO_PLATFORMS = (() => {
  const ids = ["github", "x", "medium", "linkedin", "youtube", "discord"];
  return ids
    .map((id) => PLATFORM_ICON_CATALOG.find((item) => item.id === id))
    .filter((item): item is NonNullable<typeof item> => Boolean(item));
})();

export const WORKFLOW_SNIPPET = (() => {
  const full = generateEvolveWorkflowYaml(DEFAULT_CREATURE_CONFIG, "0 0 * * *");
  const lines = full.split("\n");
  if (lines.length <= 36) return full;
  return [
    ...lines.slice(0, 34),
    "      # Commits updated creature.webp, creature-config.json and README.md",
  ].join("\n");
})();

export const STAGE_DISPLAY_NAMES: Record<number, string> = {
  1: "Calf",
  2: "Young",
  3: "Sub-adult",
  4: "Mature",
  5: "Elder",
};

/**
 * Strips emoji, HTML tags, markdown syntax, and forbidden copy separators
 * so rendered home UI previews strictly obey every copy rule.
 */
export function sanitizePreviewLine(raw: string): string {
  return raw
    .replace(/<[^>]+>/g, " ")
    .replace(/```[a-z]*|```/g, "")
    .replace(/^#{1,6}\s+/, "")
    .replace(/^>\s+/, "")
    .replace(/^[-*]\s+\[[ xX]\]\s+/, "")
    .replace(/^[-*]\s+/, "")
    .replace(/^\d+\.\s+/, "")
    .replace(/[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}\u{FE00}-\u{FE0F}]/gu, "")
    .replaceAll("{{USERNAME}}", "octocat")
    .replaceAll("{{CREATURE}}", "Pixel Tulkun")
    .replaceAll("{{STAGE}}", "4")
    .replaceAll("{{RANK}}", "Mature")
    .replaceAll("{{COMMITS}}", "1,990")
    .replaceAll("{{VIEW}}", "Side")
    .replaceAll("{{LANGUAGES}}", "TypeScript, JavaScript, Python")
    .replaceAll("::", " ")
    .replaceAll("**", "")
    .replaceAll("`", "")
    .replace(/\s*[|·•—–;]\s*/g, ", ")
    .replace(/\s+\/\s+/g, " and ")
    .replace(/,\s*,+/g, ",")
    .replace(/^[\s,|]+/, "")
    .replace(/\s+/g, " ")
    .trim();
}

export function extractTemplatePreviewLines(markdown: string): string[] {
  const rawLines = markdown.split("\n");
  const clean: string[] = [];
  for (const line of rawLines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed === "---" || /^\|[-\s|]+\|$/.test(trimmed)) {
      continue;
    }
    const sanitized = sanitizePreviewLine(trimmed);
    if (!sanitized || sanitized === "profile = {" || sanitized === "}") {
      continue;
    }
    clean.push(sanitized);
    if (clean.length >= 3) break;
  }
  return clean;
}

export function normalizeCategoryLabel(category: string): string {
  if (category === "AI / ML") return "AI and ML";
  return category;
}

export function normalizeHex(hex: string): string {
  const clean = hex.replace(/^#/, "").trim();
  if (/^[0-9a-fA-F]{6}$/.test(clean)) return `#${clean}`;
  return "#171B1E";
}

export function getContrastingInk(hex: string): string {
  const clean = hex.replace(/^#/, "");
  if (!/^[0-9a-fA-F]{6}$/.test(clean)) return "#FFFFFF";
  const r = parseInt(clean.slice(0, 2), 16);
  const g = parseInt(clean.slice(2, 4), 16);
  const b = parseInt(clean.slice(4, 6), 16);
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.62 ? "#14181A" : "#FFFFFF";
}
