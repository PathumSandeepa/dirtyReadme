"use client";

import { useMemo, useState } from "react";
import {
  AlertCircle,
  ArrowLeft,
  CheckCircle2,
  Download,
  ExternalLink,
  KeyRound,
  Lock,
  RefreshCw,
  ShieldCheck,
  Trash2,
  User,
  Zap,
} from "lucide-react";
import {
  generateEvolveScriptMjs,
  generateEvolveWorkflowYaml,
  getMidnightCronForTimezone,
} from "@/domain/automation/workflowService";
import type {
  ContributionWindow,
  CreatureConfig,
} from "@/domain/creature/entities";
import { downloadTextFile } from "@/infrastructure/browser/downloadAdapter";
import {
  type GitHubProfileSnapshot,
  publishFilesToProfileRepo,
} from "@/infrastructure/github/githubClient";

interface PublishStepPanelProps {
  creatureConfig: CreatureConfig;
  creatureSvg: string;
  shareCardSvg: string;
  readmeMarkdown: string;
  snapshot: GitHubProfileSnapshot | null;
  syncLoading: boolean;
  syncError: string | null;
  onSyncFromGitHub: (
    username: string,
    token?: string
  ) => Promise<GitHubProfileSnapshot | null>;
  onSelectWindow: (windowMode: ContributionWindow) => void;
  onOpenAutoEvolveModal: () => void;
  onPrevStep: () => void;
}

export function PublishStepPanel({
  creatureConfig,
  creatureSvg,
  shareCardSvg,
  readmeMarkdown,
  snapshot,
  syncLoading,
  syncError,
  onSyncFromGitHub,
  onSelectWindow,
  onOpenAutoEvolveModal,
  onPrevStep,
}: PublishStepPanelProps) {
  const [token, setToken] = useState("");
  const [repoProfileName, setRepoProfileName] = useState(
    creatureConfig.username || ""
  );
  const [targetBranch, setTargetBranch] = useState("main");
  const [includeShareCard, setIncludeShareCard] = useState(false);
  const [includeMidnightAction, setIncludeMidnightAction] = useState(true);
  const [publishing, setPublishing] = useState(false);
  const [publishError, setPublishError] = useState<string | null>(null);
  const [publishSuccess, setPublishSuccess] = useState<{
    paths: string[];
    repoUrl: string;
    username: string;
  } | null>(null);

  const localCron = useMemo(() => {
    const offsetEast = -new Date().getTimezoneOffset();
    return getMidnightCronForTimezone(offsetEast);
  }, []);

  const hasToken = token.trim().length > 0;
  const cleanRepoName = repoProfileName.trim().replace(/^@/, "");

  async function handlePublish(e: React.FormEvent) {
    e.preventDefault();
    setPublishError(null);
    setPublishSuccess(null);

    if (!hasToken) {
      setPublishError(
        "Please add your GitHub Personal Access Token first in Step 2."
      );
      return;
    }

    if (!cleanRepoName) {
      setPublishError(
        "Please enter your created profile repository name (your GitHub username)."
      );
      return;
    }

    const files = [
      {
        path: "creature.svg",
        content: creatureSvg,
        message: "chore: update animated cyber creature SVG",
      },
      {
        path: "README.md",
        content: readmeMarkdown,
        message: "docs: update GitHub profile README.md",
      },
    ];

    if (includeShareCard) {
      files.push({
        path: "share-card.svg",
        content: shareCardSvg,
        message: "chore: update 1280x640 share-card.svg",
      });
    }

    if (includeMidnightAction) {
      files.push({
        path: "scripts/evolve-creature.mjs",
        content: generateEvolveScriptMjs(creatureConfig),
        message: "chore: add 12AM daily profile & creature updater script",
      });
      files.push({
        path: ".github/workflows/evolve-creature.yml",
        content: generateEvolveWorkflowYaml(creatureConfig, localCron),
        message: "ci: run 12AM daily profile & creature update",
      });
    }

    setPublishing(true);
    try {
      const result = await publishFilesToProfileRepo({
        token,
        owner: cleanRepoName,
        repo: cleanRepoName,
        branch: targetBranch.trim() || "main",
        files,
      });
      setToken("");
      setPublishSuccess({
        paths: result.updatedPaths,
        repoUrl: result.repoUrl,
        username: cleanRepoName,
      });
    } catch (err) {
      setPublishError(
        err instanceof Error
          ? err.message
          : "Unable to publish to GitHub. Check your token permissions and repository name."
      );
    } finally {
      setPublishing(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
        <div className="mb-3 flex items-center justify-between">
          <span className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-800 dark:bg-zinc-900 dark:text-zinc-200">
            Step 1 of 3 · Required Preparation
          </span>
        </div>
        <h2 className="text-base font-semibold text-slate-900 dark:text-zinc-50">
          First, Create a New Public Repository Using Your GitHub Username
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-slate-600 dark:text-zinc-400">
          GitHub displays a profile README only when you have a{" "}
          <strong className="text-slate-900 dark:text-zinc-100">public</strong>{" "}
          repository whose name matches{" "}
          <strong className="text-slate-900 dark:text-zinc-100">
            your exact GitHub username
          </strong>{" "}
          (for example, <code>yourusername/yourusername</code>).
        </p>
        <div className="mt-4 flex flex-wrap gap-3">
          <a
            href={
              cleanRepoName
                ? `https://github.com/new?name=${encodeURIComponent(cleanRepoName)}&description=My+GitHub+Profile+README`
                : "https://github.com/new"
            }
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-800 transition hover:bg-slate-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
          >
            Create Public Profile Repo on GitHub
            <ExternalLink className="h-4 w-4" />
          </a>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
        <div className="mb-3 flex items-center justify-between">
          <span className="inline-flex items-center gap-2 rounded-full bg-slate-900 px-3 py-1 text-xs font-semibold text-white dark:bg-zinc-100 dark:text-zinc-950">
            Step 2 of 3 · Add Personal Access Token First
          </span>
          {token.length > 0 && (
            <button
              type="button"
              onClick={() => setToken("")}
              className="inline-flex items-center gap-1 text-xs font-medium text-slate-500 hover:text-red-600"
            >
              <Trash2 className="h-3.5 w-3.5" />
              Wipe Token
            </button>
          )}
        </div>

        <h2 className="text-base font-semibold text-slate-900 dark:text-zinc-50">
          Add Your GitHub Personal Access Token (PAT)
        </h2>
        <p className="mt-1.5 text-sm leading-relaxed text-slate-600 dark:text-zinc-400">
          You cannot add or publish this README into your GitHub profile until
          you add a Personal Access Token first. Once added, Step 3 unlocks so
          you can enter your created repository name and publish.
        </p>

        <div className="mt-4">
          <label
            htmlFor="step-pat-input"
            className="mb-1.5 flex items-center gap-2 text-xs font-semibold text-slate-700 dark:text-zinc-200"
          >
            <KeyRound className="h-4 w-4 text-slate-500" />
            Personal Access Token (Copy &amp; Cut Disabled)
          </label>
          <input
            id="step-pat-input"
            type="password"
            value={token}
            onChange={(e) => setToken(e.target.value)}
            onCopy={(e) => e.preventDefault()}
            onCut={(e) => e.preventDefault()}
            onContextMenu={(e) => e.preventDefault()}
            onDragStart={(e) => e.preventDefault()}
            autoComplete="off"
            spellCheck={false}
            data-lpignore="true"
            placeholder="Paste fine-grained PAT (github_pat_...)"
            className="w-full select-none rounded-xl border border-slate-300 bg-slate-50 px-4 py-3 font-mono text-sm text-slate-900 placeholder-slate-400 focus:border-slate-900 focus:bg-white focus:outline-none dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50"
          />
          {hasToken && (
            <p className="mt-1.5 text-xs font-medium text-emerald-700 dark:text-emerald-400">
              Token added securely in browser memory ({token.length} characters).
              Copy, cut, right-click, and reveal are blocked, and it wipes automatically after push.
            </p>
          )}
        </div>

        <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-4 text-xs leading-relaxed text-slate-600 dark:border-zinc-800 dark:bg-zinc-900/50 dark:text-zinc-300">
          <div className="mb-1.5 flex items-center gap-2 font-semibold text-slate-900 dark:text-zinc-100">
            <ShieldCheck className="h-4 w-4" />
            Token Security &amp; GitHub Privacy Policy
          </div>
          <p>
            This app runs 100% statically in your browser with zero backend
            servers. Your PAT is never saved to storage or cookies and is sent
            only over HTTPS to <code>api.github.com</code>. Scope your token to
            only your profile repo with{" "}
            <strong>Contents: Read and write</strong> (and{" "}
            <strong>Workflows: Read and write</strong> if installing the 12:00 AM
            auto-update workflow).
          </p>
          <div className="mt-2 flex flex-wrap gap-4 font-medium text-slate-800 dark:text-zinc-200">
            <a
              href="https://github.com/settings/personal-access-tokens/new"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1 underline underline-offset-2"
            >
              Create Fine-Grained Token
              <ExternalLink className="h-3 w-3" />
            </a>
            <a
              href="https://docs.github.com/en/site-policy/privacy-policies/github-general-privacy-statement"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1 underline underline-offset-2"
            >
              GitHub Privacy Statement
              <ExternalLink className="h-3 w-3" />
            </a>
            <a
              href="https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/managing-your-personal-access-tokens"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1 underline underline-offset-2"
            >
              Token Security Docs
              <ExternalLink className="h-3 w-3" />
            </a>
          </div>
        </div>
      </div>

      <form
        onSubmit={handlePublish}
        className={`rounded-2xl border p-6 shadow-sm transition ${
          hasToken
            ? "border-slate-200 bg-white dark:border-zinc-800 dark:bg-zinc-950"
            : "border-slate-200 bg-slate-100/80 opacity-75 dark:border-zinc-800 dark:bg-zinc-900/40"
        }`}
      >
        <div className="mb-3 flex items-center justify-between">
          <span className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-800 dark:bg-zinc-900 dark:text-zinc-200">
            Step 3 of 3 · Add Created Repo Name &amp; Publish
          </span>
          {!hasToken && (
            <span className="inline-flex items-center gap-1 text-xs font-semibold text-amber-700 dark:text-amber-400">
              <Lock className="h-3.5 w-3.5" />
              Add PAT in Step 2 to unlock
            </span>
          )}
        </div>

        <h2 className="text-base font-semibold text-slate-900 dark:text-zinc-50">
          Enter Your Created Repository Name (Profile Username)
        </h2>
        <p className="mt-1 text-sm text-slate-500 dark:text-zinc-400">
          After adding your Personal Access Token above, enter your GitHub
          username (which matches your new public repo name).
        </p>

        <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
          <div className="sm:col-span-2">
            <label
              htmlFor="created-repo-input"
              className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold text-slate-700 dark:text-zinc-300"
            >
              <User className="h-3.5 w-3.5" />
              Created Repo / GitHub Username
            </label>
            <div className="flex gap-2">
              <input
                id="created-repo-input"
                type="text"
                disabled={!hasToken}
                value={repoProfileName}
                onChange={(e) => setRepoProfileName(e.target.value)}
                placeholder="e.g. PathumSandeepa"
                className="flex-1 rounded-xl border border-slate-300 bg-slate-50 px-3.5 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:border-slate-900 focus:bg-white focus:outline-none disabled:cursor-not-allowed disabled:opacity-60 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50"
              />
              <button
                type="button"
                disabled={!hasToken || syncLoading || !cleanRepoName}
                onClick={() => void onSyncFromGitHub(cleanRepoName, token)}
                className="inline-flex items-center gap-1.5 rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-xs font-semibold text-slate-800 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
              >
                <RefreshCw
                  className={`h-3.5 w-3.5 ${syncLoading ? "animate-spin" : ""}`}
                />
                Sync Stats
              </button>
            </div>
          </div>

          <div>
            <label
              htmlFor="target-branch-input"
              className="mb-1.5 block text-xs font-semibold text-slate-700 dark:text-zinc-300"
            >
              Branch
            </label>
            <input
              id="target-branch-input"
              type="text"
              disabled={!hasToken}
              value={targetBranch}
              onChange={(e) => setTargetBranch(e.target.value)}
              className="w-full rounded-xl border border-slate-300 bg-slate-50 px-3.5 py-2.5 text-sm text-slate-900 focus:border-slate-900 focus:bg-white focus:outline-none disabled:cursor-not-allowed disabled:opacity-60 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50"
            />
          </div>
        </div>

        {syncError && (
          <p className="mt-3 rounded-xl border border-red-200 bg-red-50 px-3.5 py-2 text-xs text-red-700 dark:border-red-900 dark:bg-red-950/50 dark:text-red-200">
            {syncError}
          </p>
        )}

        {snapshot && (
          <div className="mt-3 flex flex-wrap items-center justify-between gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-xs dark:border-zinc-800 dark:bg-zinc-900">
            <span className="text-slate-700 dark:text-zinc-200">
              Synced <strong>@{snapshot.username}</strong>:{" "}
              {snapshot.publicRepos} repos ·{" "}
              {creatureConfig.windowMode === "rolling"
                ? `${snapshot.rollingCommits} rolling commits`
                : `${snapshot.annualCommits} annual commits`}
            </span>
            <div className="flex gap-1">
              {(["annual", "rolling"] as const).map((win) => (
                <button
                  key={win}
                  type="button"
                  onClick={() => onSelectWindow(win)}
                  className={`rounded-md px-2 py-0.5 text-[11px] font-medium uppercase ${
                    creatureConfig.windowMode === win
                      ? "bg-slate-900 text-white dark:bg-zinc-100 dark:text-zinc-950"
                      : "text-slate-500"
                  }`}
                >
                  {win}
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="mt-4 space-y-2.5">
          <label className="flex cursor-pointer items-start gap-2.5 rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs text-slate-700 dark:border-zinc-800 dark:bg-zinc-900/50 dark:text-zinc-200">
            <input
              type="checkbox"
              disabled={!hasToken}
              checked={includeMidnightAction}
              onChange={(e) => setIncludeMidnightAction(e.target.checked)}
              className="mt-0.5 accent-slate-900 dark:accent-zinc-100"
            />
            <div>
              <span className="font-semibold text-slate-900 dark:text-zinc-100">
                Auto-update profile details every 12:00 AM (GitHub Action)
              </span>
              <p className="mt-0.5 text-slate-500 dark:text-zinc-400">
                Adds <code>.github/workflows/evolve-creature.yml</code> (cron{" "}
                <code>{localCron}</code> UTC) and{" "}
                <code>scripts/evolve-creature.mjs</code> so your commit stage
                and top languages update automatically every midnight.
              </p>
            </div>
          </label>

          <label className="flex cursor-pointer items-center gap-2.5 rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs text-slate-700 dark:border-zinc-800 dark:bg-zinc-900/50 dark:text-zinc-200">
            <input
              type="checkbox"
              disabled={!hasToken}
              checked={includeShareCard}
              onChange={(e) => setIncludeShareCard(e.target.checked)}
              className="accent-slate-900 dark:accent-zinc-100"
            />
            <span>Also include 1280x640 <code>share-card.svg</code></span>
          </label>
        </div>

        {publishError && (
          <div className="mt-4 flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 p-3.5 text-xs text-red-700 dark:border-red-900 dark:bg-red-950/50 dark:text-red-200">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
            <span>{publishError}</span>
          </div>
        )}

        {publishSuccess && (
          <div className="mt-4 flex items-start gap-2.5 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-xs text-emerald-900 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-200">
            <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
            <div>
              <div className="font-semibold">
                Published {publishSuccess.paths.join(", ")} to{" "}
                {publishSuccess.username}/{publishSuccess.username} (token wiped
                from memory).
              </div>
              <a
                href={`https://github.com/${encodeURIComponent(publishSuccess.username)}`}
                target="_blank"
                rel="noreferrer"
                className="mt-1 inline-flex items-center gap-1 font-semibold underline"
              >
                Open Your GitHub Profile →
                <ExternalLink className="h-3 w-3" />
              </a>
            </div>
          </div>
        )}

        <div className="mt-5 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={onPrevStep}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-200"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </button>

          <button
            type="submit"
            disabled={!hasToken || publishing}
            className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-45 dark:bg-zinc-50 dark:text-zinc-950 dark:hover:bg-zinc-200"
          >
            {publishing
              ? "Publishing to GitHub..."
              : `Publish to ${cleanRepoName || "Profile Repo"}`}
          </button>
        </div>
      </form>

      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
        <div className="mb-3 text-xs font-semibold uppercase tracking-wider text-slate-500">
          Prefer Manual Upload? Download Files Instead
        </div>
        <div className="flex flex-wrap gap-2.5">
          <button
            type="button"
            onClick={() => downloadTextFile("creature.svg", creatureSvg)}
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2 text-xs font-semibold text-slate-800 hover:bg-slate-100 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-100"
          >
            <Download className="h-3.5 w-3.5" />
            Download creature.svg
          </button>
          <button
            type="button"
            onClick={() =>
              downloadTextFile(
                "README.md",
                readmeMarkdown,
                "text/markdown;charset=utf-8"
              )
            }
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2 text-xs font-semibold text-slate-800 hover:bg-slate-100 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-100"
          >
            <Download className="h-3.5 w-3.5" />
            Download README.md
          </button>
          <button
            type="button"
            onClick={onOpenAutoEvolveModal}
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2 text-xs font-semibold text-slate-800 hover:bg-slate-100 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-100"
          >
            <Zap className="h-3.5 w-3.5" />
            View 12AM Action Code
          </button>
        </div>
      </div>
    </div>
  );
}
