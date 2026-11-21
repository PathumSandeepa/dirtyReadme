import type { LanguageStat } from "@/domain/creature/entities";

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
  Dockerfile: "#384D54",
  YAML: "#CB171E",
  SQL: "#E38C00",
  "Jupyter Notebook": "#DA5B0B",
  PowerShell: "#012456",
  Makefile: "#427819",
  MDX: "#FCB32C",
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
  allTimeCommits: number;
  estimatedCommits: number;
  languages: LanguageStat[];
  profileRepoExists: boolean;
  profileRepoBranch: string;
  existingProfileReadme: string | null;
  existingCreatureConfig: Record<string, unknown> | null;
  hasLegacyWorkflow: boolean;
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
  language: string | null;
  stargazers_count: number;
  fork: boolean;
  size: number;
}

export interface PublishFileInput {
  path: string;
  content?: string;
  base64Content?: string;
  message: string;
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

function encodeBase64Utf8(str: string): string {
  const bytes = new TextEncoder().encode(str);
  let binary = "";
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

export function parseGitHubUsername(rawInput: string): string {
  const trimmed = rawInput.trim();
  if (!trimmed) return "";

  const urlMatch = trimmed.match(
    /^(?:https?:\/\/)?(?:www\.)?github\.com\/([A-Za-z0-9-]+)(?:\/|$|\?)/i
  );
  if (urlMatch?.[1]) {
    return urlMatch[1];
  }

  return trimmed.replace(/^@+/, "").split(/[/?#\s]/)[0] || "";
}

export async function checkProfileRepoExists(username: string): Promise<{
  exists: boolean;
  defaultBranch: string;
  rateLimited?: boolean;
}> {
  const clean = parseGitHubUsername(username);
  if (!clean || clean === "your-username") {
    return { exists: false, defaultBranch: "main" };
  }
  try {
    const res = await fetch(
      `https://api.github.com/repos/${encodeURIComponent(clean)}/${encodeURIComponent(clean)}`,
      {
        headers: { Accept: "application/vnd.github+json" },
        cache: "no-store",
      }
    );
    if (res.ok) {
      const info = (await res.json()) as { default_branch?: string };
      return {
        exists: true,
        defaultBranch: info.default_branch || "main",
      };
    }
    if (res.status === 404) {
      return { exists: false, defaultBranch: "main" };
    }
    return { exists: false, defaultBranch: "main", rateLimited: true };
  } catch {
    return { exists: false, defaultBranch: "main", rateLimited: true };
  }
}

export async function fetchGitHubProfileSnapshot(
  rawUsername: string,
  authToken?: string
): Promise<GitHubProfileSnapshot> {
  const username = parseGitHubUsername(rawUsername);
  if (!username) {
    throw new Error("Please enter a valid GitHub username or profile URL.");
  }

  const headers: Record<string, string> = {
    Accept: "application/vnd.github+json",
  };
  if (authToken && authToken.trim()) {
    headers.Authorization = `Bearer ${authToken.trim()}`;
  }
  const currentYear = String(new Date().getUTCFullYear());

  const [userRes, reposRes, profileRepoRes, contribAllRes] = await Promise.all([
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
    .slice(0, 7)
    .map(([name, weight]) => ({
      name,
      color: getLanguageColor(name),
      share:
        totalWeight > 0
          ? Math.max(1, Math.round((weight / totalWeight) * 100))
          : 33,
    }));

  let profileRepoExists = false;
  let profileRepoBranch = "main";
  let existingProfileReadme: string | null = null;
  let existingCreatureConfig: Record<string, unknown> | null = null;
  let hasLegacyWorkflow = false;

  if (profileRepoRes && profileRepoRes.ok) {
    const repoInfo = (await profileRepoRes.json()) as {
      default_branch?: string;
    };
    profileRepoExists = true;
    profileRepoBranch = repoInfo.default_branch || "main";

    const rawBase = `https://raw.githubusercontent.com/${encodeURIComponent(user.login)}/${encodeURIComponent(user.login)}/${encodeURIComponent(profileRepoBranch)}`;
    const [readmeRes, wfRes, cfgRes] = await Promise.all([
      fetch(`${rawBase}/README.md`, { cache: "no-store" }).catch(() => null),
      fetch(`${rawBase}/.github/workflows/evolve-creature.yml`, {
        cache: "no-store",
      }).catch(() => null),
      fetch(`${rawBase}/creature-config.json`, { cache: "no-store" }).catch(
        () => null
      ),
    ]);

    if (readmeRes && readmeRes.ok) {
      existingProfileReadme = await readmeRes.text();
    }
    if (wfRes && wfRes.ok) {
      const wfText = await wfRes.text();
      hasLegacyWorkflow =
        wfText.includes("creature.svg") ||
        (wfText.includes("branches:") && !wfText.includes("creature.webp"));
    }
    if (cfgRes && cfgRes.ok) {
      try {
        const parsed = (await cfgRes.json()) as unknown;
        if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
          existingCreatureConfig = parsed as Record<string, unknown>;
        }
      } catch {
        existingCreatureConfig = null;
      }
    }
  }

  let annualCommits = 0;
  let allTimeCommits = 0;
  let hasCalendarTotals = false;
  let sourceNote = "Public contributions via GitHub calendar";

  if (contribAllRes && contribAllRes.ok) {
    try {
      const data = (await contribAllRes.json()) as {
        total?: Record<string, number>;
      };
      if (data.total && typeof data.total === "object") {
        let sumAll = 0;
        let foundYear = false;
        for (const [key, val] of Object.entries(data.total)) {
          if (/^\d{4}$/.test(key) && typeof val === "number") {
            sumAll += val;
            foundYear = true;
          }
        }
        if (foundYear) {
          hasCalendarTotals = true;
          allTimeCommits = sumAll;
          annualCommits =
            typeof data.total[currentYear] === "number"
              ? data.total[currentYear]
              : 0;
        }
      }
    } catch {
      hasCalendarTotals = false;
    }
  }

  if (!hasCalendarTotals) {
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
      sourceNote = "Estimated from public repositories & stars";
    }
    annualCommits = commitFallback;
    allTimeCommits = commitFallback;
  }

  return {
    username: user.login,
    displayName: user.name || user.login,
    avatarUrl: user.avatar_url,
    bio: user.bio?.trim() || "",
    location: user.location || "",
    company: user.company || "",
    website: normalizeWebsiteUrl(user.blog),
    twitterUsername: user.twitter_username || "",
    publicRepos: user.public_repos,
    followers: user.followers,
    totalStars,
    annualCommits,
    allTimeCommits,
    estimatedCommits: annualCommits,
    languages:
      topLanguages.length > 0
        ? topLanguages
        : [{ name: "Markdown", color: "#083FA1", share: 100 }],
    profileRepoExists,
    profileRepoBranch,
    existingProfileReadme,
    existingCreatureConfig,
    hasLegacyWorkflow,
    sourceNote,
  };
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
    throw new Error("A Personal Access Token is required before pushing.");
  }

  const headers = {
    Authorization: `Bearer ${cleanToken}`,
    Accept: "application/vnd.github+json",
    "Content-Type": "application/json",
  };

  const repoInfoRes = await fetch(
    `https://api.github.com/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}`,
    { headers }
  );

  if (repoInfoRes.status === 404) {
    throw new Error(
      `Repository "${owner}/${repo}" was not found. Make sure you created a public repository named "${repo}" under your GitHub account.`
    );
  }
  if (repoInfoRes.status === 401 || repoInfoRes.status === 403) {
    throw new Error(
      "Authentication failed. Verify your Personal Access Token has Contents (Read and write) or classic 'repo' permissions."
    );
  }

  let targetBranch = branch;
  if (repoInfoRes.ok) {
    const repoMeta = (await repoInfoRes.json()) as { default_branch?: string };
    if (repoMeta.default_branch) {
      targetBranch = repoMeta.default_branch;
    }
  }

  const repoApiBase = `https://api.github.com/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}`;
  const refRes = await fetch(
    `${repoApiBase}/git/ref/heads/${encodeURIComponent(targetBranch)}`,
    { headers }
  );

  if (refRes.ok) {
    const refJson = (await refRes.json()) as { object?: { sha?: string } };
    const headCommitSha = refJson.object?.sha;
    if (headCommitSha) {
      const commitRes = await fetch(
        `${repoApiBase}/git/commits/${encodeURIComponent(headCommitSha)}`,
        { headers }
      );
      if (!commitRes.ok) {
        const errText = await commitRes.text();
        throw new Error(
          `Failed reading branch commit (${commitRes.status}): ${errText}`
        );
      }
      const commitJson = (await commitRes.json()) as { tree?: { sha?: string } };
      const baseTreeSha = commitJson.tree?.sha;
      if (!baseTreeSha) {
        throw new Error("Unable to locate base git tree SHA.");
      }

      const treeEntries: {
        path: string;
        mode: "100644";
        type: "blob";
        sha: string;
      }[] = [];

      for (const file of files) {
        const blobRes = await fetch(`${repoApiBase}/git/blobs`, {
          method: "POST",
          headers,
          body: JSON.stringify(
            file.base64Content !== undefined
              ? { content: file.base64Content, encoding: "base64" }
              : { content: file.content ?? "", encoding: "utf-8" }
          ),
        });
        if (!blobRes.ok) {
          const errText = await blobRes.text();
          throw new Error(
            `Failed uploading blob for ${file.path} (${blobRes.status}): ${errText}`
          );
        }
        const blobJson = (await blobRes.json()) as { sha: string };
        treeEntries.push({
          path: file.path,
          mode: "100644",
          type: "blob",
          sha: blobJson.sha,
        });
      }

      const treeRes = await fetch(`${repoApiBase}/git/trees`, {
        method: "POST",
        headers,
        body: JSON.stringify({
          base_tree: baseTreeSha,
          tree: treeEntries,
        }),
      });
      if (!treeRes.ok) {
        const errText = await treeRes.text();
        throw new Error(
          `Failed creating commit tree (${treeRes.status}): ${errText}`
        );
      }
      const treeJson = (await treeRes.json()) as { sha: string };

      const newCommitRes = await fetch(`${repoApiBase}/git/commits`, {
        method: "POST",
        headers,
        body: JSON.stringify({
          message: "feat: update animated pixel creature & profile README",
          tree: treeJson.sha,
          parents: [headCommitSha],
        }),
      });
      if (!newCommitRes.ok) {
        const errText = await newCommitRes.text();
        const hint = files.some((f) => f.path.startsWith(".github/workflows/"))
          ? " Make sure your PAT includes 'Workflows: Read and write' (or classic 'workflow') scope."
          : "";
        throw new Error(
          `Failed creating commit (${newCommitRes.status}): ${errText}.${hint}`
        );
      }
      const newCommitJson = (await newCommitRes.json()) as { sha: string };

      const patchRefRes = await fetch(
        `${repoApiBase}/git/refs/heads/${encodeURIComponent(targetBranch)}`,
        {
          method: "PATCH",
          headers,
          body: JSON.stringify({ sha: newCommitJson.sha }),
        }
      );
      if (!patchRefRes.ok) {
        const errText = await patchRefRes.text();
        const hint = files.some((f) => f.path.startsWith(".github/workflows/"))
          ? " Make sure your PAT includes 'Workflows: Read and write' (or classic 'workflow') scope."
          : "";
        throw new Error(
          `Failed updating branch ref (${patchRefRes.status}): ${errText}.${hint}`
        );
      }

      return {
        updatedPaths: files.map((f) => f.path),
        repoUrl: `https://github.com/${owner}/${repo}`,
      };
    }
  } else if (refRes.status !== 404 && refRes.status !== 409) {
    const errText = await refRes.text();
    throw new Error(
      `Failed inspecting branch ref (${refRes.status}): ${errText}`
    );
  }

  // Fallback for brand-new empty repositories with no initial commit yet
  const updatedPaths: string[] = [];

  for (const file of files) {
    const endpoint = `${repoApiBase}/contents/${file.path}`;
    let existingSha: string | undefined;

    const getRes = await fetch(
      `${endpoint}?ref=${encodeURIComponent(targetBranch)}`,
      { headers }
    );
    if (getRes.ok) {
      const existing = (await getRes.json()) as { sha?: string };
      existingSha = existing.sha;
    } else if (getRes.status === 404 || getRes.status === 409) {
      existingSha = undefined;
    } else {
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
        content: file.base64Content ?? encodeBase64Utf8(file.content ?? ""),
        branch: targetBranch,
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
