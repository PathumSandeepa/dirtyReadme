import fs from "node:fs";
import path from "node:path";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const si = require("simple-icons");

const bySlug = new Map();
for (const key of Object.keys(si)) {
  const icon = si[key];
  if (icon && icon.slug && icon.path) {
    bySlug.set(icon.slug, icon);
  }
}

const PLATFORMS = [
  // General default (first in catalog for easy reference)
  {
    id: "homepage",
    label: "Website / Portfolio",
    category: "general",
    hex: "4F46E5",
    domains: [],
  },
  {
    id: "googlechrome",
    label: "Browser / Web App",
    category: "general",
    hex: "4285F4",
    domains: ["chromewebstore.google.com"],
  },
  {
    id: "rss",
    label: "RSS Feed",
    category: "blogging",
    hex: "FFA500",
    domains: ["rss.com"],
  },

  // Blogging & Writing Platforms
  {
    id: "medium",
    label: "Medium",
    category: "blogging",
    hex: "000000",
    domains: ["medium.com"],
  },
  {
    id: "hashnode",
    label: "Hashnode",
    category: "blogging",
    hex: "2962FF",
    domains: ["hashnode.com", "hashnode.dev"],
  },
  {
    id: "substack",
    label: "Substack",
    category: "blogging",
    hex: "FF6719",
    domains: ["substack.com"],
  },
  {
    id: "devdotto",
    label: "DEV.to",
    category: "blogging",
    hex: "0A0A0A",
    domains: ["dev.to"],
  },
  {
    id: "blogger",
    label: "Blogger",
    category: "blogging",
    hex: "FF5722",
    domains: ["blogger.com", "blogspot.com"],
  },
  {
    id: "wordpress",
    label: "WordPress",
    category: "blogging",
    hex: "21759B",
    domains: ["wordpress.com", "wordpress.org"],
  },
  {
    id: "ghost",
    label: "Ghost",
    category: "blogging",
    hex: "15171A",
    domains: ["ghost.org", "ghost.io"],
  },
  {
    id: "tumblr",
    label: "Tumblr",
    category: "blogging",
    hex: "36465D",
    domains: ["tumblr.com"],
  },
  {
    id: "quora",
    label: "Quora",
    category: "blogging",
    hex: "B92B27",
    domains: ["quora.com"],
  },
  {
    id: "notion",
    label: "Notion",
    category: "general",
    hex: "000000",
    domains: ["notion.so", "notion.site"],
  },
  {
    id: "obsidian",
    label: "Obsidian Publish",
    category: "blogging",
    hex: "7C3AED",
    domains: ["obsidian.md", "publish.obsidian.md"],
  },

  // Developer Platforms & Coding Profiles
  {
    id: "githubsponsors",
    label: "GitHub Sponsors",
    category: "funding",
    hex: "EA4AAA",
    domains: ["github.com/sponsors"],
  },
  {
    id: "github",
    label: "GitHub",
    category: "developer",
    hex: "181717",
    domains: ["github.com"],
  },
  {
    id: "gitlab",
    label: "GitLab",
    category: "developer",
    hex: "FC6D26",
    domains: ["gitlab.com"],
  },
  {
    id: "bitbucket",
    label: "Bitbucket",
    category: "developer",
    hex: "0052CC",
    domains: ["bitbucket.org"],
  },
  {
    id: "codeberg",
    label: "Codeberg",
    category: "developer",
    hex: "2185D0",
    domains: ["codeberg.org"],
  },
  {
    id: "stackoverflow",
    label: "Stack Overflow",
    category: "developer",
    hex: "F58025",
    domains: ["stackoverflow.com"],
  },
  {
    id: "stackexchange",
    label: "Stack Exchange",
    category: "developer",
    hex: "1E5397",
    domains: ["stackexchange.com"],
  },
  {
    id: "leetcode",
    label: "LeetCode",
    category: "developer",
    hex: "FFA116",
    domains: ["leetcode.com"],
  },
  {
    id: "hackerrank",
    label: "HackerRank",
    category: "developer",
    hex: "00EA64",
    domains: ["hackerrank.com"],
  },
  {
    id: "codeforces",
    label: "Codeforces",
    category: "developer",
    hex: "1F8ACB",
    domains: ["codeforces.com"],
  },
  {
    id: "codewars",
    label: "Codewars",
    category: "developer",
    hex: "B1361E",
    domains: ["codewars.com"],
  },
  {
    id: "exercism",
    label: "Exercism",
    category: "developer",
    hex: "604FCD",
    domains: ["exercism.org"],
  },
  {
    id: "kaggle",
    label: "Kaggle",
    category: "developer",
    hex: "20BEFF",
    domains: ["kaggle.com"],
  },
  {
    id: "huggingface",
    label: "Hugging Face",
    category: "developer",
    hex: "FFD21E",
    domains: ["huggingface.co"],
  },
  {
    id: "codesandbox",
    label: "CodeSandbox",
    category: "developer",
    hex: "151515",
    domains: ["codesandbox.io"],
  },
  {
    id: "replit",
    label: "Replit",
    category: "developer",
    hex: "F26207",
    domains: ["replit.com", "repl.it"],
  },
  {
    id: "stackblitz",
    label: "StackBlitz",
    category: "developer",
    hex: "1269D3",
    domains: ["stackblitz.com"],
  },
  {
    id: "npm",
    label: "npm",
    category: "developer",
    hex: "CB3837",
    domains: ["npmjs.com", "npmjs.org"],
  },
  {
    id: "pypi",
    label: "PyPI",
    category: "developer",
    hex: "3775A9",
    domains: ["pypi.org"],
  },
  {
    id: "docker",
    label: "Docker Hub",
    category: "developer",
    hex: "2496ED",
    domains: ["hub.docker.com", "docker.com"],
  },

  // Social & Professional Networks
  {
    id: "linkedin",
    label: "LinkedIn",
    category: "social",
    hex: "0A66C2",
    domains: ["linkedin.com", "lnkd.in"],
    customSvgPath:
      "M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z",
  },
  {
    id: "x",
    label: "X / Twitter",
    category: "social",
    hex: "09090B",
    domains: ["x.com", "twitter.com"],
  },
  {
    id: "bluesky",
    label: "Bluesky",
    category: "social",
    hex: "0285FF",
    domains: ["bsky.app", "bsky.social"],
  },
  {
    id: "mastodon",
    label: "Mastodon",
    category: "social",
    hex: "6364FF",
    domains: ["mastodon.social", "mastodon.online", "fosstodon.org"],
  },
  {
    id: "threads",
    label: "Threads",
    category: "social",
    hex: "000000",
    domains: ["threads.net", "threads.com"],
  },
  {
    id: "instagram",
    label: "Instagram",
    category: "social",
    hex: "E4405F",
    domains: ["instagram.com", "instagr.am"],
  },
  {
    id: "facebook",
    label: "Facebook",
    category: "social",
    hex: "0866FF",
    domains: ["facebook.com", "fb.com"],
  },
  {
    id: "tiktok",
    label: "TikTok",
    category: "social",
    hex: "000000",
    domains: ["tiktok.com"],
  },
  {
    id: "reddit",
    label: "Reddit",
    category: "social",
    hex: "FF4500",
    domains: ["reddit.com", "redd.it"],
  },
  {
    id: "pinterest",
    label: "Pinterest",
    category: "social",
    hex: "BD081C",
    domains: ["pinterest.com", "pin.it"],
  },
  {
    id: "snapchat",
    label: "Snapchat",
    category: "social",
    hex: "FFFC00",
    domains: ["snapchat.com"],
  },
  {
    id: "linktree",
    label: "Linktree",
    category: "social",
    hex: "43E55E",
    domains: ["linktr.ee", "linktree.com"],
  },
  {
    id: "producthunt",
    label: "Product Hunt",
    category: "social",
    hex: "DA552F",
    domains: ["producthunt.com"],
  },

  // Video, Audio & Gaming
  {
    id: "youtube",
    label: "YouTube",
    category: "video",
    hex: "FF0000",
    domains: ["youtube.com", "youtu.be"],
  },
  {
    id: "twitch",
    label: "Twitch",
    category: "video",
    hex: "9146FF",
    domains: ["twitch.tv"],
  },
  {
    id: "vimeo",
    label: "Vimeo",
    category: "video",
    hex: "1AB7EA",
    domains: ["vimeo.com"],
  },
  {
    id: "spotify",
    label: "Spotify",
    category: "video",
    hex: "1ED760",
    domains: ["open.spotify.com", "spotify.com"],
  },
  {
    id: "soundcloud",
    label: "SoundCloud",
    category: "video",
    hex: "FF5500",
    domains: ["soundcloud.com"],
  },
  {
    id: "bandcamp",
    label: "Bandcamp",
    category: "video",
    hex: "1DA0C3",
    domains: ["bandcamp.com"],
  },
  {
    id: "steam",
    label: "Steam",
    category: "video",
    hex: "000000",
    domains: ["steamcommunity.com", "store.steampowered.com"],
  },

  // Chat, Community & Contact
  {
    id: "discord",
    label: "Discord",
    category: "chat",
    hex: "5865F2",
    domains: ["discord.gg", "discord.com", "discordapp.com"],
  },
  {
    id: "telegram",
    label: "Telegram",
    category: "chat",
    hex: "26A5E4",
    domains: ["t.me", "telegram.me", "telegram.org"],
  },
  {
    id: "whatsapp",
    label: "WhatsApp",
    category: "chat",
    hex: "25D366",
    domains: ["wa.me", "whatsapp.com", "api.whatsapp.com"],
  },
  {
    id: "signal",
    label: "Signal",
    category: "chat",
    hex: "3A76F0",
    domains: ["signal.org", "signal.me"],
  },
  {
    id: "gmail",
    label: "Email / Gmail",
    category: "chat",
    hex: "EA4335",
    domains: ["gmail.com", "mail.google.com"],
  },
  {
    id: "protonmail",
    label: "Proton Mail",
    category: "chat",
    hex: "6D4AFF",
    domains: ["proton.me", "protonmail.com"],
  },
  {
    id: "calendly",
    label: "Calendly",
    category: "chat",
    hex: "006BFF",
    domains: ["calendly.com"],
  },

  // Design & Portfolio
  {
    id: "dribbble",
    label: "Dribbble",
    category: "design",
    hex: "EA4C89",
    domains: ["dribbble.com"],
  },
  {
    id: "behance",
    label: "Behance",
    category: "design",
    hex: "1769FF",
    domains: ["behance.net"],
  },
  {
    id: "figma",
    label: "Figma",
    category: "design",
    hex: "F24E1E",
    domains: ["figma.com"],
  },
  {
    id: "artstation",
    label: "ArtStation",
    category: "design",
    hex: "13AFF0",
    domains: ["artstation.com"],
  },
  {
    id: "unsplash",
    label: "Unsplash",
    category: "design",
    hex: "000000",
    domains: ["unsplash.com"],
  },

  // Sponsoring, Freelance & Research
  {
    id: "buymeacoffee",
    label: "Buy Me a Coffee",
    category: "funding",
    hex: "FFDD00",
    domains: ["buymeacoffee.com"],
  },
  {
    id: "kofi",
    label: "Ko-fi",
    category: "funding",
    hex: "FF5E5B",
    domains: ["ko-fi.com"],
  },
  {
    id: "patreon",
    label: "Patreon",
    category: "funding",
    hex: "000000",
    domains: ["patreon.com"],
  },
  {
    id: "opencollective",
    label: "Open Collective",
    category: "funding",
    hex: "7FADF2",
    domains: ["opencollective.com"],
  },
  {
    id: "gumroad",
    label: "Gumroad",
    category: "funding",
    hex: "FF90E8",
    domains: ["gumroad.com"],
  },
  {
    id: "upwork",
    label: "Upwork",
    category: "funding",
    hex: "6FDA44",
    domains: ["upwork.com"],
  },
  {
    id: "fiverr",
    label: "Fiverr",
    category: "funding",
    hex: "1DBF73",
    domains: ["fiverr.com"],
  },
  {
    id: "googlescholar",
    label: "Google Scholar",
    category: "blogging",
    hex: "4285F4",
    domains: ["scholar.google.com"],
  },
  {
    id: "orcid",
    label: "ORCID",
    category: "blogging",
    hex: "A6CE39",
    domains: ["orcid.org"],
  },
  {
    id: "researchgate",
    label: "ResearchGate",
    category: "blogging",
    hex: "00CCBB",
    domains: ["researchgate.net"],
  },
  {
    id: "goodreads",
    label: "Goodreads",
    category: "blogging",
    hex: "372213",
    domains: ["goodreads.com"],
  },
];

const entries = PLATFORMS.map((p) => {
  if (p.customSvgPath) {
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="white"><path d="${p.customSvgPath}"/></svg>`;
    const customLogoDataUri = `data:image/svg+xml;base64,${Buffer.from(svg).toString("base64")}`;
    return {
      id: p.id,
      label: p.label,
      category: p.category,
      hex: p.hex,
      svgPath: p.customSvgPath,
      domains: p.domains,
      customLogoDataUri,
    };
  }

  const found = bySlug.get(p.id);
  if (!found) {
    throw new Error(`Missing simple-icons slug: ${p.id}`);
  }
  return {
    id: p.id,
    label: p.label,
    category: p.category,
    hex: p.hex || found.hex,
    svgPath: found.path,
    domains: p.domains,
  };
});

const outPath = path.resolve("src/domain/profile/platformIcons.ts");
const content = `// Auto-generated by scripts/generate-platform-icons.mjs from simple-icons. Do not edit manually.

export type PlatformIconCategory =
  | "general"
  | "blogging"
  | "developer"
  | "social"
  | "video"
  | "chat"
  | "design"
  | "funding";

export const PLATFORM_CATEGORY_LABELS: Record<PlatformIconCategory, string> = {
  general: "General & Web",
  blogging: "Blogging & Writing",
  developer: "Developer",
  social: "Social",
  video: "Video & Audio",
  chat: "Chat & Contact",
  design: "Design",
  funding: "Funding & Work",
};

export interface PlatformIconMeta {
  id: string;
  label: string;
  category: PlatformIconCategory;
  hex: string;
  svgPath: string;
  domains: string[];
  customLogoDataUri?: string;
}

export const DEFAULT_PLATFORM_ICON_ID = "homepage";

export const PLATFORM_ICON_CATALOG: PlatformIconMeta[] = ${JSON.stringify(entries, null, 2)};

const PLATFORM_BY_ID = new Map<string, PlatformIconMeta>(
  PLATFORM_ICON_CATALOG.map((item) => [item.id, item])
);

export const DEFAULT_PLATFORM_ICON: PlatformIconMeta =
  PLATFORM_BY_ID.get(DEFAULT_PLATFORM_ICON_ID) ?? PLATFORM_ICON_CATALOG[0];

export function findPlatformIconById(id?: string): PlatformIconMeta | null {
  if (!id || id === "none") return null;
  return PLATFORM_BY_ID.get(id) ?? null;
}

export function getPlatformIconById(id?: string): PlatformIconMeta {
  if (!id) return DEFAULT_PLATFORM_ICON;
  return PLATFORM_BY_ID.get(id) ?? DEFAULT_PLATFORM_ICON;
}

export function detectPlatformFromUrl(rawUrl: string): PlatformIconMeta {
  const trimmed = rawUrl.trim().toLowerCase();
  if (!trimmed) return DEFAULT_PLATFORM_ICON;

  if (
    trimmed.startsWith("mailto:") ||
    /^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/.test(trimmed)
  ) {
    return getPlatformIconById("gmail");
  }

  let parsedHost = "";
  let parsedPath = "";
  try {
    const withProto = /^https?:\\/\\//i.test(trimmed)
      ? trimmed
      : \`https://\${trimmed}\`;
    const u = new URL(withProto);
    parsedHost = u.hostname.replace(/^www\\./, "");
    parsedPath = u.pathname.replace(/\\/+$/, "");
  } catch {
    return DEFAULT_PLATFORM_ICON;
  }

  if (!parsedHost) return DEFAULT_PLATFORM_ICON;

  const hostAndPath = \`\${parsedHost}\${parsedPath}\`;

  for (const item of PLATFORM_ICON_CATALOG) {
    for (const domain of item.domains) {
      if (domain.includes("/")) {
        if (hostAndPath === domain || hostAndPath.startsWith(\`\${domain}/\`)) {
          return item;
        }
      } else if (parsedHost === domain || parsedHost.endsWith(\`.\${domain}\`)) {
        return item;
      }
    }
  }

  return DEFAULT_PLATFORM_ICON;
}
`;

fs.writeFileSync(outPath, content, "utf8");
console.log(`Generated ${outPath} with ${entries.length} platform icons.`);
