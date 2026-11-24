import {
  DEFAULT_CREATURE_CONFIG,
  type CreatureConfig,
} from "@/domain/creature/entities";
import {
  DEFAULT_README_CONFIG,
  TECH_STACK_CATALOG,
  type ReadmeActionLink,
  type ReadmeConfig,
} from "@/domain/profile/entities";
import { getPlatformIconById } from "@/domain/profile/platformIcons";
import { buildGeneratedReadmeMarkdown } from "@/domain/profile/readmeService";
import { showcaseAsset } from "./homeData";

export interface HeroMockProfile {
  id: string;
  label: string;
  username: string;
  headline: string;
  subtitleTags: string[];
  bio: string;
  badgeIds: string[];
  links: ReadmeActionLink[];
}

export const HERO_BANNER_IMAGE_PATH = "./hero-banner.svg";

export const HERO_BANNER_IMAGE_MAP: Record<string, string> = {
  [HERO_BANNER_IMAGE_PATH]: showcaseAsset("view-side.webp"),
  "./creature.webp": showcaseAsset("view-side.webp"),
};

function makeLink(
  id: string,
  label: string,
  valueText: string,
  url: string,
  color: string,
  platformId: string
): ReadmeActionLink {
  const icon = getPlatformIconById(platformId);
  return {
    id,
    label,
    valueText,
    url,
    color,
    logo: icon.id,
    enabled: true,
  };
}

export const HERO_MOCK_PROFILES: HeroMockProfile[] = [
  {
    id: "fullstack-template",
    label: "Full-Stack",
    username: "alexrivera",
    headline: "Alex Rivera, Full-Stack Developer",
    subtitleTags: [
      "Full-Stack Development",
      "Systems Architecture",
      "Open Source",
      "UI Engineering",
    ],
    bio: "Open source builder, Computer science enthusiast, Sharing coding adventures.\n\nExplore my tech stack and live profile projects below.",
    badgeIds: [
      "java",
      "php",
      "typescript",
      "javascript",
      "react",
      "nextjs",
      "tailwindcss",
      "nodejs",
      "python",
      "postgresql",
      "docker",
      "git",
      "linux",
      "figma",
      "sql",
      "html5",
      "css",
      "redux",
      "vite",
      "shadcnui",
      "mui",
      "nestjs",
      "express",
    ],
    links: [
      makeLink("gh", "GITHUB", "@alexrivera", "https://github.com/octocat", "181717", "github"),
      makeLink("x", "X", "@alexriveradev", "https://x.com", "111827", "x"),
      makeLink("blog", "MEDIUM", "Read articles", "https://medium.com", "181717", "medium"),
    ],
  },
  {
    id: "systems-engineer",
    label: "Systems",
    username: "alexdev",
    headline: "Alex Rivera, Systems Engineer",
    subtitleTags: ["Rust", "Distributed systems", "CLI tools"],
    bio: "Designing reliable storage engines, fast CLI utilities, and zero dependency developer workflows.",
    badgeIds: ["rust", "go", "docker", "postgresql", "linux"],
    links: [
      makeLink("gh", "GITHUB", "@alexdev", "https://github.com/alexdev", "181717", "github"),
      makeLink("li", "LINKEDIN", "alexdev", "https://linkedin.com", "0A66C2", "linkedin"),
      makeLink("blog", "BLOG", "notes", "https://medium.com", "10B981", "medium"),
    ],
  },
  {
    id: "design-engineer",
    label: "Design",
    username: "sarahcodes",
    headline: "Sarah Chen, Design Engineer",
    subtitleTags: ["Design systems", "React", "Motion"],
    bio: "Crafting accessible component libraries, interactive editors, and crisp typography for the web.",
    badgeIds: ["figma", "typescript", "react", "tailwindcss", "vite"],
    links: [
      makeLink("gh", "GITHUB", "@sarahcodes", "https://github.com/sarahcodes", "181717", "github"),
      makeLink("yt", "YOUTUBE", "demos", "https://youtube.com", "DC2626", "youtube"),
      makeLink("dc", "DISCORD", "community", "https://discord.com", "5865F2", "discord"),
    ],
  },
];

export const HERO_EXTRA_BADGE_POOL: string[] = [
  "python",
  "graphql",
  "prisma",
  "redis",
  "vercel",
  "vitest",
  "playwright",
  "eslint",
  "git",
  "kubernetes",
];

const BADGE_BY_ID = new Map(TECH_STACK_CATALOG.map((item) => [item.id, item]));

export function getHeroBadgeLabel(id: string): string {
  return BADGE_BY_ID.get(id)?.label ?? id;
}

export interface HeroMarkdownOptions {
  profile: HeroMockProfile;
  badgeIds: string[];
  linksAlign: "left" | "center";
  bannerVisible: boolean;
  headlineOverride?: string;
  showBio?: boolean;
  showBadges?: boolean;
  showLinks?: boolean;
}

export function buildHeroMockMarkdown({
  profile,
  badgeIds,
  linksAlign,
  bannerVisible,
  headlineOverride,
  showBio = true,
  showBadges = true,
  showLinks = true,
}: HeroMarkdownOptions): string {
  const creature: CreatureConfig = {
    ...DEFAULT_CREATURE_CONFIG,
    username: profile.username,
  };

  const readme: ReadmeConfig = {
    ...DEFAULT_README_CONFIG,
    templateId: "cyber-guardian",
    profileTextMode: "structured",
    advancedProfileMarkdown: "",
    headline: headlineOverride ?? profile.headline,
    subtitleTags: showBio ? profile.subtitleTags : [],
    bio: showBio ? profile.bio : "",
    ctaLine: "",
    align: linksAlign,
    stackCards: showBadges
      ? [
          {
            id: "hero-stack",
            title: "Tech stack",
            badgeIds,
            visible: true,
          },
        ]
      : [],
    actionLinks: showLinks ? profile.links : [],
    showLinksRow: showLinks,
    showCreatureBanner: bannerVisible,
    bannerSource: "custom-image",
    customBannerImagePath: bannerVisible ? HERO_BANNER_IMAGE_PATH : null,
    customBannerAlt: "Profile header banner",
    customBannerAlign: "center",
    customBannerWidth: 760,
    includeStatsTable: false,
    includeShareCard: false,
    customFooterMarkdown: "",
  };

  return buildGeneratedReadmeMarkdown(creature, readme);
}
