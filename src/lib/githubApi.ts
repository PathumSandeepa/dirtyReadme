import type { LanguageStat } from "@/types/creature";

export const GITHUB_LANGUAGE_COLORS: Record<string, string> = {
  TypeScript: "#3178C6",
  JavaScript: "#F1E05A",
  Python: "#3572A5",
  Rust: "#DEA584",
  Go: "#00ADD8",
  Java: "#B07219",
  "C++": "#F34B7D",
  C: "#555555",
  "C#": "#178600",
  PHP: "#4F5D95",
  Ruby: "#701516",
  Swift: "#F05138",
  Kotlin: "#A97BFF",
  Dart: "#00B4AB",
  HTML: "#E34C26",
  CSS: "#563D7C",
  SCSS: "#C6538C",
  Shell: "#89E051",
  Vue: "#41B883",
  Svelte: "#FF3E00",
  Lua: "#000080",
  Scala: "#C22D40",
  Elixir: "#6E4A7E",
  Haskell: "#5E5086",
  Solidity: "#AA6746",
  Astro: "#FF5A03",
};

export interface GitHubProfileSnapshot {
  username: string;
  displayName: string;
  avatarUrl: string;
  bio: string;
  location: string;
  company: string;
  website: string;
  twitterUsername: string;
  publicRepos: number;
  followers: number;
  totalStars: number;
  annualCommits: number;
  rollingCommits: number;
  estimatedCommits: number;
  languages: LanguageStat[];
  profileRepoExists: boolean;
  profileRepoBranch: string;
  existingProfileReadme: string | null;
  sourceNote: string;
}

interface GitHubUserResponse {
  login: string;
  name: string | null;
  avatar_url: string;
  bio: string | null;
  location: string | null;
  company: string | null;
  blog: string | null;
  twitter_username: string | null;
  public_repos: number;
  followers: number;
}

interface GitHubRepoResponse {
  name: string;
  description: string | null;
  html_url: string;
  language: string | null;
  stargazers_count: number;
  fork: boolean;
  size: number;
  updated_at: string;
}

export function getLanguageColor(language: string): string {
  return GITHUB_LANGUAGE_COLORS[language] ?? "#8B949E";
}

function normalizeWebsiteUrl(raw: string | null): string {
  if (!raw) return "";
  const trimmed = raw.trim();
  if (!trimmed) return "";
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  return `https://${trimmed}`;
}

export async function fetchGitHubProfileSnapshot(
  rawUsername: string
): Promise<GitHubProfileSnapshot> {
  const username = rawUsername.trim().replace(/^@/, "");
  if (!username) {
    throw new Error("Please enter a valid GitHub username.");
  }

  const headers = {
    Accept: "application/vnd.github+json",
  };
  const currentYear = String(new Date().getUTCFullYear());

  const [userRes, reposRes, profileRepoRes, contribAllRes, contribLastRes] =
    await Promise.all([
      fetch(`https://api.github.com/users/${encodeURIComponent(username)}`, {
        headers,
      }),
      fetch(
        `https://api.github.com/users/${encodeURIComponent(username)}/repos?per_page=100&sort=updated`,
        { headers }
      ),
      fetch(
        `https://api.github.com/repos/${encodeURIComponent(username)}/${encodeURIComponent(username)}`,
        { headers }
      ).catch(() => null),
      fetch(
        `https://github-contributions-api.jogruber.de/v4/${encodeURIComponent(username)}`
      ).catch(() => null),
      fetch(
        `https://github-contributions-api.jogruber.de/v4/${encodeURIComponent(username)}?y=last`
      ).catch(() => null),
    ]);

  if (userRes.status === 404) {
    throw new Error(`GitHub user "@${username}" was not found.`);
  }
  if (userRes.status === 403) {
    throw new Error("GitHub API rate limit reached. Try again in a minute.");
  }
  if (!userRes.ok) {
    throw new Error(`Failed to fetch GitHub profile (${userRes.status}).`);
  }

  const user = (await userRes.json()) as GitHubUserResponse;
  const repos = reposRes.ok
    ? ((await reposRes.json()) as GitHubRepoResponse[])
    : [];

  const langCounts = new Map<string, number>();
  let totalStars = 0;

  for (const repo of repos) {
    totalStars += repo.stargazers_count ?? 0;
    if (!repo.language) continue;
    const weight = repo.fork
      ? 1
      : Math.max(2, Math.min(20, Math.round((repo.size ?? 10) / 100) + 2));
    langCounts.set(repo.language, (langCounts.get(repo.language) ?? 0) + weight);
  }

  const totalWeight = Array.from(langCounts.values()).reduce((a, b) => a + b, 0);
  const topLanguages: LanguageStat[] = Array.from(langCounts.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([name, weight]) => ({
      name,
      color: getLanguageColor(name),
      share:
        totalWeight > 0
          ? Math.max(1, Math.round((weight / totalWeight) * 100))
          : 33,
    }));

  // Check special profile repo (<username>/<username>)
  let profileRepoExists = false;
  let profileRepoBranch = "main";
  let existingProfileReadme: string | null = null;

  if (profileRepoRes && profileRepoRes.ok) {
    const repoInfo = (await profileRepoRes.json()) as {
      default_branch?: string;
    };
    profileRepoExists = true;
    profileRepoBranch = repoInfo.default_branch || "main";

    try {
      const readmeRes = await fetch(
        `https://raw.githubusercontent.com/${encodeURIComponent(user.login)}/${encodeURIComponent(user.login)}/${encodeURIComponent(profileRepoBranch)}/README.md`
      );
      if (readmeRes.ok) {
        existingProfileReadme = await readmeRes.text();
      }
    } catch {
      // Ignore if README.md doesn't exist yet
    }
  }

  // Parse public contribution calendar (Annual & Rolling 365d)
  let annualCommits = 0;
  let rollingCommits = 0;
  let sourceNote = "Public contributions via GitHub calendar";

  if (contribAllRes && contribAllRes.ok) {
    try {
      const data = (await contribAllRes.json()) as {
        total?: Record<string, number>;
      };
      if (data.total && typeof data.total[currentYear] === "number") {
        annualCommits = data.total[currentYear];
      }
    } catch {
      // Fallback below
    }
  }

  if (contribLastRes && contribLastRes.ok) {
    try {
      const data = (await contribLastRes.json()) as {
        total?: { lastYear?: number };
      };
      if (data.total && typeof data.total.lastYear === "number") {
        rollingCommits = data.total.lastYear;
      }
    } catch {
      // Fallback below
    }
  }

  if (annualCommits === 0 && rollingCommits === 0) {
    let commitFallback = Math.max(40, user.public_repos * 42 + totalStars * 15);
    sourceNote = "Estimated from public repositories & stars";
    try {
      const commitRes = await fetch(
        `https://api.github.com/search/commits?q=author:${encodeURIComponent(user.login)}&per_page=1`,
        { headers }
      );
      if (commitRes.ok) {
        const commitJson = (await commitRes.json()) as { total_count?: number };
        if (
          typeof commitJson.total_count === "number" &&
          commitJson.total_count > 0
        ) {
          commitFallback = commitJson.total_count;
          sourceNote = "All-time public commits via GitHub Search API";
        }
      }
    } catch {
      // Keep repo estimate
    }
    annualCommits = commitFallback;
    rollingCommits = commitFallback;
  } else {
    if (annualCommits === 0) annualCommits = rollingCommits;
    if (rollingCommits === 0) rollingCommits = annualCommits;
  }

  return {
    username: user.login,
    displayName: user.name || user.login,
    avatarUrl: user.avatar_url,
    bio: user.bio || "Open-source builder & cybernetic creature keeper.",
    location: user.location || "",
    company: user.company || "",
    website: normalizeWebsiteUrl(user.blog),
    twitterUsername: user.twitter_username || "",
    publicRepos: user.public_repos,
    followers: user.followers,
    totalStars,
    annualCommits,
    rollingCommits,
    estimatedCommits: annualCommits,
    languages:
      topLanguages.length > 0
        ? topLanguages
        : [{ name: "Markdown", color: "#083FA1", share: 100 }],
    profileRepoExists,
    profileRepoBranch,
    existingProfileReadme,
    sourceNote,
  };
}

function encodeBase64Utf8(str: string): string {
  const bytes = new TextEncoder().encode(str);
  let binary = "";
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

export interface PublishFileInput {
  path: string;
  content: string;
  message: string;
}

export async function publishFilesToProfileRepo(params: {
  token: string;
  owner: string;
  repo: string;
  branch: string;
  files: PublishFileInput[];
}): Promise<{ updatedPaths: string[]; repoUrl: string }> {
  const { token, owner, repo, branch, files } = params;
  const cleanToken = token.trim();
  if (!cleanToken) {
    throw new Error("Please enter a GitHub Personal Access Token.");
  }

  const headers = {
    Authorization: `Bearer ${cleanToken}`,
    Accept: "application/vnd.github+json",
    "Content-Type": "application/json",
  };

  const updatedPaths: string[] = [];

  for (const file of files) {
    const endpoint = `https://api.github.com/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}/contents/${file.path}`;
    let existingSha: string | undefined;

    const getRes = await fetch(
      `${endpoint}?ref=${encodeURIComponent(branch)}`,
      { headers }
    );
    if (getRes.ok) {
      const existing = (await getRes.json()) as { sha?: string };
      existingSha = existing.sha;
    } else if (getRes.status !== 404) {
      const errBody = await getRes.text();
      throw new Error(
        `Failed checking ${file.path} (${getRes.status}): ${errBody}`
      );
    }

    const putRes = await fetch(endpoint, {
      method: "PUT",
      headers,
      body: JSON.stringify({
        message: file.message,
        content: encodeBase64Utf8(file.content),
        branch,
        ...(existingSha ? { sha: existingSha } : {}),
      }),
    });

    if (!putRes.ok) {
      const errText = await putRes.text();
      throw new Error(
        `Failed pushing ${file.path} (${putRes.status}): ${errText}`
      );
    }

    updatedPaths.push(file.path);
  }

  return {
    updatedPaths,
    repoUrl: `https://github.com/${owner}/${repo}`,
  };
}
