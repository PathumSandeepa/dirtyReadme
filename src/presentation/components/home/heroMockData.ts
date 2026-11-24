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

const NEUTRAL_BANNER_SVG = `<svg xmlns="http://www.w3.org/2000/svg" width="848" height="160" viewBox="0 0 848 160">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#18181B" />
      <stop offset="50%" stop-color="#27272A" />
      <stop offset="100%" stop-color="#1F2937" />
    </linearGradient>
    <radialGradient id="glow" cx="75%" cy="35%" r="55%">
      <stop offset="0%" stop-color="#F59E0B" stop-opacity="0.22" />
      <stop offset="100%" stop-color="#18181B" stop-opacity="0" />
    </radialGradient>
  </defs>
  <rect width="848" height="160" rx="12" fill="url(#bg)" />
  <rect width="848" height="160" rx="12" fill="url(#glow)" />
  <text x="36" y="76" fill="#F4F4F5" font-family="system-ui, -apple-system, sans-serif" font-size="26" font-weight="700" letter-spacing="-0.6">Open source developer</text>
  <text x="36" y="108" fill="#A1A1AA" font-family="ui-monospace, Menlo, monospace" font-size="14">Building clean web tools and libraries</text>
</svg>`;

export const HERO_BANNER_IMAGE_MAP: Record<string, string> = {
  [HERO_BANNER_IMAGE_PATH]: `data:image/svg+xml;utf8,${encodeURIComponent(NEUTRAL_BANNER_SVG)}`,
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
    id: "minimal-builder",
    label: "Builder",
    username: "octocat",
    headline: "Hi, I am The Octocat",
    subtitleTags: ["Open source", "TypeScript", "Web tools"],
    bio: "Building fast developer tools, clean interfaces, and open source libraries in TypeScript and Go.",
    badgeIds: ["typescript", "react", "nextjs", "tailwindcss", "nodejs"],
    links: [
      makeLink("gh", "GITHUB", "@octocat", "https://github.com/octocat", "181717", "github"),
      makeLink("web", "WEBSITE", "octocat.dev", "https://github.com/octocat", "0EA5E9", "website"),
      makeLink("x", "X", "@octocat", "https://x.com", "111827", "x"),
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
