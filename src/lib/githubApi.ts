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
  publicRepos: number;
  followers: number;
  totalStars: number;
  estimatedCommits: number;
  languages: LanguageStat[];
  sourceNote: string;
}

interface GitHubUserResponse {
  login: string;
  name: string | null;
  avatar_url: string;
  bio: string | null;
  public_repos: number;
  followers: number;
}

interface GitHubRepoResponse {
  language: string | null;
  stargazers_count: number;
  fork: boolean;
  size: number;
}

export function getLanguageColor(language: string): string {
  return GITHUB_LANGUAGE_COLORS[language] ?? "#8B949E";
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

  const [userRes, reposRes] = await Promise.all([
    fetch(`https://api.github.com/users/${encodeURIComponent(username)}`, {
      headers,
    }),
    fetch(
      `https://api.github.com/users/${encodeURIComponent(username)}/repos?per_page=100&sort=updated`,
      { headers }
    ),
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
    const weight = repo.fork ? 1 : Math.max(2, Math.min(20, Math.round((repo.size ?? 10) / 100) + 2));
    langCounts.set(repo.language, (langCounts.get(repo.language) ?? 0) + weight);
  }

  const totalWeight = Array.from(langCounts.values()).reduce((a, b) => a + b, 0);
  const topLanguages: LanguageStat[] = Array.from(langCounts.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([name, weight]) => ({
      name,
      color: getLanguageColor(name),
      share: totalWeight > 0 ? Math.max(1, Math.round((weight / totalWeight) * 100)) : 33,
    }));

  // Optional public commit search count (works unauthenticated, gracefully falls back)
  let commitEstimate = Math.max(40, user.public_repos * 42 + totalStars * 15);
  let sourceNote = "Estimated from public repositories & stars";

  try {
    const commitRes = await fetch(
      `https://api.github.com/search/commits?q=author:${encodeURIComponent(user.login)}&per_page=1`,
      { headers }
    );
    if (commitRes.ok) {
      const commitJson = (await commitRes.json()) as { total_count?: number };
      if (typeof commitJson.total_count === "number" && commitJson.total_count > 0) {
        commitEstimate = commitJson.total_count;
        sourceNote = "Public commit count via GitHub Search API";
      }
    }
  } catch {
    // Keep repo-based fallback silently
  }

  return {
    username: user.login,
    displayName: user.name || user.login,
    avatarUrl: user.avatar_url,
    bio: user.bio || "Open-source builder & cybernetic creature keeper.",
    publicRepos: user.public_repos,
    followers: user.followers,
    totalStars,
    estimatedCommits: commitEstimate,
    languages:
      topLanguages.length > 0
        ? topLanguages
        : [{ name: "Markdown", color: "#083FA1", share: 100 }],
    sourceNote,
  };
}
