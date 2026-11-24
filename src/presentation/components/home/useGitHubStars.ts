"use client";

import { useEffect, useState } from "react";

const STAR_CACHE_KEY = "readmeforge-gh-stars-v2";
const STAR_CACHE_TTL_MS = 10 * 60 * 1000;

interface CachedStars {
  count: number;
  ts: number;
}

/** Fetches public GitHub repository stars once on the client and caches in sessionStorage for 10 minutes. */
export function useGitHubStars(): number | null {
  const [starCount, setStarCount] = useState<number | null>(null);

  useEffect(() => {
    let cancelled = false;

    try {
      const raw = window.sessionStorage.getItem(STAR_CACHE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as CachedStars;
        if (
          typeof parsed.count === "number" &&
          typeof parsed.ts === "number" &&
          Date.now() - parsed.ts < STAR_CACHE_TTL_MS
        ) {
          queueMicrotask(() => {
            if (!cancelled) setStarCount(parsed.count);
          });
          return () => {
            cancelled = true;
          };
        }
      }
    } catch {
      // Ignore storage access restrictions
    }

    fetch(
      "https://api.github.com/repos/PathumSandeepa/DirtyReadme",
      { headers: { Accept: "application/vnd.github+json" } }
    )
      .then((res) => (res.ok ? res.json() : null))
      .then((data: { stargazers_count?: number } | null) => {
        if (cancelled || !data || typeof data.stargazers_count !== "number") {
          return;
        }
        setStarCount(data.stargazers_count);
        try {
          window.sessionStorage.setItem(
            STAR_CACHE_KEY,
            JSON.stringify({ count: data.stargazers_count, ts: Date.now() })
          );
        } catch {
          // Ignore quota restrictions
        }
      })
      .catch(() => {
        // Leave star count hidden when offline or rate limited
      });

    return () => {
      cancelled = true;
    };
  }, []);

  return starCount;
}
