"use client";

import { useState } from "react";
import {
  ArrowLeftRight,
  GitCommitHorizontal,
  Loader2,
  Palette,
  RefreshCw,
  Users,
} from "lucide-react";
import { CyberCreatureSvg } from "@/components/CyberCreatureSvg";
import {
  type GitHubProfileSnapshot,
  fetchGitHubProfileSnapshot,
} from "@/lib/githubApi";
import {
  CREATURE_CATALOG,
  DEFAULT_CONFIG,
  applyLanguageColors,
  getEvolutionStage,
} from "@/lib/themes";
import type { CreatureConfig, CreatureId } from "@/types/creature";

interface ComparatorSideState {
  inputUsername: string;
  creature: CreatureId;
  useLanguageColors: boolean;
  loading: boolean;
  error: string | null;
  snapshot: GitHubProfileSnapshot | null;
  commitsOverride: number;
}

function buildConfigForSide(
  base: CreatureConfig,
  side: ComparatorSideState
): CreatureConfig {
  const languages = side.snapshot?.languages ?? base.languages;
  const commits = side.commitsOverride;
  const username = side.snapshot?.username ?? side.inputUsername;

  const next: CreatureConfig = {
    ...base,
    creature: side.creature,
    commits,
    username,
    languages,
    customTitle: "",
  };

  return side.useLanguageColors ? applyLanguageColors(next, languages) : next;
}

interface CreatureComparatorProps {
  baseConfig: CreatureConfig;
}

export function CreatureComparator({ baseConfig }: CreatureComparatorProps) {
  const [left, setLeft] = useState<ComparatorSideState>({
    inputUsername: baseConfig.username || "PathumSandeepa",
    creature: baseConfig.creature,
    useLanguageColors: true,
    loading: false,
    error: null,
    snapshot: null,
    commitsOverride: baseConfig.commits || 574,
  });

  const [right, setRight] = useState<ComparatorSideState>({
    inputUsername: "octocat",
    creature: "serpent",
    useLanguageColors: true,
    loading: false,
    error: null,
    snapshot: null,
    commitsOverride: 640,
  });

  async function fetchSide(which: "left" | "right") {
    const target = which === "left" ? left : right;
    const setter = which === "left" ? setLeft : setRight;

    setter((prev) => ({ ...prev, loading: true, error: null }));
    try {
      const snap = await fetchGitHubProfileSnapshot(target.inputUsername);
      setter((prev) => ({
        ...prev,
        loading: false,
        snapshot: snap,
        commitsOverride: snap.annualCommits,
      }));
    } catch (err) {
      setter((prev) => ({
        ...prev,
        loading: false,
        error: err instanceof Error ? err.message : "Failed to fetch profile.",
      }));
    }
  }

  const leftConfig = buildConfigForSide(DEFAULT_CONFIG, left);
  const rightConfig = buildConfigForSide(DEFAULT_CONFIG, right);
  const leftStage = getEvolutionStage(left.commitsOverride);
  const rightStage = getEvolutionStage(right.commitsOverride);

  function renderSideCard(
    which: "left" | "right",
    side: ComparatorSideState,
    setter: React.Dispatch<React.SetStateAction<ComparatorSideState>>,
    sideConfig: CreatureConfig
  ) {
    const stage = getEvolutionStage(side.commitsOverride);

    return (
      <div className="flex flex-col rounded-lg border border-zinc-800 bg-zinc-950 p-4">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            void fetchSide(which);
          }}
          className="flex gap-2"
        >
          <input
            type="text"
            value={side.inputUsername}
            onChange={(e) =>
              setter((prev) => ({ ...prev, inputUsername: e.target.value }))
            }
            placeholder="GitHub username"
            className="flex-1 rounded-md border border-zinc-800 bg-zinc-900 px-3 py-2 font-mono text-xs text-zinc-50 placeholder-zinc-500 focus:border-zinc-500 focus:outline-none"
          />
          <button
            type="submit"
            disabled={side.loading}
            className="inline-flex items-center gap-1.5 rounded-md border border-zinc-800 bg-zinc-900 px-3.5 py-2 text-xs font-medium text-zinc-100 transition hover:bg-zinc-800 disabled:opacity-50"
          >
            {side.loading ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <RefreshCw className="h-3.5 w-3.5" />
            )}
            Sync
          </button>
        </form>

        {side.error && (
          <p className="mt-2 rounded-md border border-red-900 bg-red-950/50 px-3 py-1.5 text-xs text-red-200">
            {side.error}
          </p>
        )}

        <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
          <div className="flex gap-1.5">
            {CREATURE_CATALOG.map((c) => (
              <button
                key={c.id}
                type="button"
                onClick={() =>
                  setter((prev) => ({ ...prev, creature: c.id }))
                }
                className={`rounded-md border px-2.5 py-1 text-[11px] font-medium transition ${
                  side.creature === c.id
                    ? "border-zinc-50 bg-zinc-50 text-zinc-950"
                    : "border-zinc-800 bg-zinc-900 text-zinc-400 hover:text-zinc-100"
                }`}
              >
                {c.name.replace("Cyber-", "")}
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={() =>
              setter((prev) => ({
                ...prev,
                useLanguageColors: !prev.useLanguageColors,
              }))
            }
            className={`inline-flex items-center gap-1 rounded-md border px-2.5 py-1 text-[11px] font-medium transition ${
              side.useLanguageColors
                ? "border-zinc-500 bg-zinc-900 text-zinc-100"
                : "border-zinc-800 bg-zinc-950 text-zinc-400"
            }`}
          >
            <Palette className="h-3 w-3" />
            {side.useLanguageColors ? "Lang Palette" : "Canonical"}
          </button>
        </div>

        <div className="mt-3 overflow-hidden rounded-md border border-zinc-800 bg-[#0d1117] p-2">
          <CyberCreatureSvg
            config={sideConfig}
            className="mx-auto block h-auto w-full"
          />
        </div>

        <div className="mt-3 grid grid-cols-3 gap-2 rounded-md border border-zinc-800 bg-zinc-900/40 p-3 text-center">
          <div>
            <div className="text-[10px] uppercase text-zinc-500">Stage</div>
            <div className="mt-0.5 font-mono text-xs font-bold text-zinc-100">
              {stage.stage} · {stage.rank}
            </div>
          </div>
          <div>
            <div className="text-[10px] uppercase text-zinc-500">Commits</div>
            <input
              type="number"
              min={0}
              value={side.commitsOverride}
              onChange={(e) =>
                setter((prev) => ({
                  ...prev,
                  commitsOverride: Math.max(
                    0,
                    parseInt(e.target.value || "0", 10)
                  ),
                }))
              }
              aria-label="Simulated commits"
              className="mt-0.5 w-full rounded border border-zinc-800 bg-zinc-950 px-1.5 py-0.5 text-center font-mono text-xs font-bold text-zinc-100 focus:border-zinc-500 focus:outline-none"
            />
          </div>
          <div>
            <div className="text-[10px] uppercase text-zinc-500">Repos</div>
            <div className="mt-0.5 font-mono text-xs font-bold text-zinc-100">
              {side.snapshot ? side.snapshot.publicRepos : "—"}
            </div>
          </div>
        </div>

        <div className="mt-3 flex flex-wrap items-center gap-2">
          {sideConfig.languages.map((lang) => (
            <span
              key={lang.name}
              className="inline-flex items-center gap-1.5 rounded-full border border-zinc-800 bg-zinc-900 px-2.5 py-0.5 font-mono text-[11px] text-zinc-300"
            >
              <span
                className="h-2.5 w-2.5 rounded-full"
                style={{ backgroundColor: lang.color }}
              />
              {lang.name}
            </span>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-lg border border-zinc-800 bg-zinc-950 p-5">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-md border border-zinc-800 bg-zinc-900 text-zinc-100">
            <Users className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-base font-semibold text-zinc-50">
              Side-by-Side GitHub Creature Comparator
            </h2>
            <p className="text-xs text-zinc-400">
              Fetch any two GitHub users to compare evolution stages, top
              language palettes, and chassis specs.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => {
            void fetchSide("left");
            void fetchSide("right");
          }}
          className="inline-flex items-center gap-2 rounded-md bg-zinc-50 px-4 py-2 text-xs font-semibold text-zinc-950 transition hover:bg-zinc-200"
        >
          <ArrowLeftRight className="h-3.5 w-3.5" />
          Sync Both Profiles
        </button>
      </div>

      <div className="grid grid-cols-1 items-center gap-3 rounded-lg border border-zinc-800 bg-zinc-950 px-5 py-3.5 sm:grid-cols-3">
        <div className="flex items-center gap-2 font-mono text-xs">
          <span className="font-bold text-zinc-50">
            @{leftConfig.username}
          </span>
          <span className="text-zinc-400">
            (Stage {leftStage.stage} {leftStage.rank})
          </span>
        </div>
        <div className="text-center font-mono text-[11px] text-zinc-400">
          <GitCommitHorizontal className="mr-1 inline h-3.5 w-3.5" />
          DELTA:{" "}
          {Math.abs(
            left.commitsOverride - right.commitsOverride
          ).toLocaleString("en-US")}{" "}
          COMMITS
        </div>
        <div className="flex items-center justify-end gap-2 font-mono text-xs">
          <span className="text-zinc-400">
            (Stage {rightStage.stage} {rightStage.rank})
          </span>
          <span className="font-bold text-zinc-50">
            @{rightConfig.username}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {renderSideCard("left", left, setLeft, leftConfig)}
        {renderSideCard("right", right, setRight, rightConfig)}
      </div>
    </div>
  );
}
