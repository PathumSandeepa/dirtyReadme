"use client";

import React, { useState } from "react";
import { AlertCircle, RefreshCw, Users } from "lucide-react";
import type { CreatureConfig } from "@/domain/creature/entities";
import { applyLanguageColors, getEvolutionStage } from "@/domain/creature/services";
import {
  fetchGitHubProfileSnapshot,
  type GitHubProfileSnapshot,
} from "@/infrastructure/github/githubClient";
import { CreatureSvgView } from "./CreatureSvgView";

interface ComparatorPanelProps {
  baseConfig: CreatureConfig;
}

export function ComparatorPanel({ baseConfig }: ComparatorPanelProps) {
  const [leftUser, setLeftUser] = useState(
    baseConfig.username && baseConfig.username !== "your-username"
      ? baseConfig.username
      : "octocat"
  );
  const [rightUser, setRightUser] = useState("torvalds");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [results, setResults] = useState<{
    left: GitHubProfileSnapshot;
    right: GitHubProfileSnapshot;
  } | null>(null);

  const handleCompare = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const [left, right] = await Promise.all([
        fetchGitHubProfileSnapshot(leftUser),
        fetchGitHubProfileSnapshot(rightUser),
      ]);
      setResults({ left, right });
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to compare profiles."
      );
    } finally {
      setLoading(false);
    }
  };

  const buildComparedConfig = (
    snap: GitHubProfileSnapshot
  ): CreatureConfig => {
    const commits =
      baseConfig.windowMode === "annual"
        ? snap.annualCommits
        : snap.rollingCommits;
    const nextBase =
      baseConfig.colorMode === "languages" && snap.languages.length > 0
        ? applyLanguageColors(baseConfig, snap.languages)
        : baseConfig;

    return {
      ...nextBase,
      username: snap.username,
      commits,
      languages:
        snap.languages.length > 0 ? snap.languages : nextBase.languages,
    };
  };

  return (
    <div className="space-y-5 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-[#363d4a] dark:bg-[#1e222a]">
      <div>
        <div className="flex items-center gap-2 text-base font-semibold text-slate-900 dark:text-slate-100">
          <Users className="h-5 w-5 text-indigo-600 dark:text-indigo-300" />
          <h2>Compare Two GitHub Profiles Side-by-Side</h2>
        </div>
        <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
          Preview how your current creature styling scales across any two GitHub accounts.
        </p>
      </div>

      <form
        onSubmit={handleCompare}
        className="grid gap-3 sm:grid-cols-[1fr_1fr_auto]"
      >
        <input
          type="text"
          value={leftUser}
          onChange={(e) => setLeftUser(e.target.value)}
          placeholder="First GitHub username"
          className="rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 outline-none focus:border-indigo-600 dark:border-[#363d4a] dark:bg-[#272c36] dark:text-slate-100"
        />
        <input
          type="text"
          value={rightUser}
          onChange={(e) => setRightUser(e.target.value)}
          placeholder="Second GitHub username"
          className="rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 outline-none focus:border-indigo-600 dark:border-[#363d4a] dark:bg-[#272c36] dark:text-slate-100"
        />
        <button
          type="submit"
          disabled={loading}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-700 disabled:opacity-60 dark:bg-indigo-500 dark:hover:bg-indigo-400"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          {loading ? "Comparing..." : "Compare"}
        </button>
      </form>

      {error && (
        <div className="flex items-center gap-2 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800 dark:border-rose-700/50 dark:bg-rose-950/30 dark:text-rose-200">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {results && (
        <div className="grid gap-4 md:grid-cols-2">
          {[results.left, results.right].map((snap) => {
            const cfg = buildComparedConfig(snap);
            const stage = getEvolutionStage(cfg.commits);
            return (
              <div
                key={snap.username}
                className="overflow-hidden rounded-xl border border-slate-200 bg-slate-50 dark:border-[#363d4a] dark:bg-[#272c36]"
              >
                <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3 dark:border-[#363d4a]">
                  <div>
                    <div className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                      @{snap.username}
                    </div>
                    <div className="text-xs text-slate-500 dark:text-slate-300">
                      {snap.publicRepos} public repos · {snap.totalStars} stars
                    </div>
                  </div>
                  <span className="rounded-full bg-indigo-600 px-2.5 py-1 text-xs font-medium text-white dark:bg-indigo-500">
                    Stage {stage.stage} · {stage.rank}
                  </span>
                </div>
                <div className="bg-[#0d1117] p-3">
                  <CreatureSvgView config={cfg} className="w-full" />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
