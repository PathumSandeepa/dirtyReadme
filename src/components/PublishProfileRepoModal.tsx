"use client";

import { useMemo, useState } from "react";
import {
  AlertCircle,
  CheckCircle2,
  ExternalLink,
  GitBranch,
  KeyRound,
  Loader2,
  ShieldCheck,
  Trash2,
  UploadCloud,
  User,
  X,
} from "lucide-react";
import {
  generateEvolveScriptMjs,
  generateEvolveWorkflowYaml,
  getMidnightCronForTimezone,
} from "@/lib/autoEvolveTemplates";
import {
  type GitHubProfileSnapshot,
  publishFilesToProfileRepo,
} from "@/lib/githubApi";
import type { CreatureConfig } from "@/types/creature";

interface PublishProfileRepoModalProps {
  open: boolean;
  onClose: () => void;
  username: string;
  snapshot: GitHubProfileSnapshot | null;
  creatureConfig: CreatureConfig;
  creatureSvg: string;
  shareCardSvg: string;
  readmeMarkdown: string;
}

export function PublishProfileRepoModal({
  open,
  onClose,
  username,
  snapshot,
  creatureConfig,
  creatureSvg,
  shareCardSvg,
  readmeMarkdown,
}: PublishProfileRepoModalProps) {
  const [targetUsername, setTargetUsername] = useState(username);
  const [token, setToken] = useState("");
  const [branch, setBranch] = useState(
    snapshot?.profileRepoBranch || "main"
  );
  const [syncSvg, setSyncSvg] = useState(true);
  const [syncReadme, setSyncReadme] = useState(true);
  const [syncShareCard, setSyncShareCard] = useState(false);
  const [installMidnightAction, setInstallMidnightAction] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successInfo, setSuccessInfo] = useState<{
    paths: string[];
    repoUrl: string;
  } | null>(null);

  const localCron = useMemo(() => {
    const offsetEast = -new Date().getTimezoneOffset();
    return getMidnightCronForTimezone(offsetEast);
  }, []);

  if (!open) return null;

  const cleanUser =
    targetUsername.trim().replace(/^@/, "") ||
    username.trim() ||
    "PathumSandeepa";
  const targetRepo = cleanUser;
  const targetBranch = branch.trim() || snapshot?.profileRepoBranch || "main";
  const isDefaultSyncedUser =
    snapshot?.username.toLowerCase() === cleanUser.toLowerCase();

  function handleSafeClose() {
    // Wipe sensitive PAT from memory immediately when modal closes
    setToken("");
    setError(null);
    onClose();
  }

  async function handlePublish(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccessInfo(null);

    const files = [];
    if (syncSvg) {
      files.push({
        path: "creature.svg",
        content: creatureSvg,
        message: "chore: update animated creature.svg via studio",
      });
    }
    if (syncReadme) {
      files.push({
        path: "README.md",
        content: readmeMarkdown,
        message: "docs: update profile README.md via studio",
      });
    }
    if (syncShareCard) {
      files.push({
        path: "share-card.svg",
        content: shareCardSvg,
        message: "chore: update 1280x640 share-card.svg via studio",
      });
    }
    if (installMidnightAction) {
      files.push({
        path: "scripts/evolve-creature.mjs",
        content: generateEvolveScriptMjs(creatureConfig),
        message: "chore: add 12AM daily creature & README updater script",
      });
      files.push({
        path: ".github/workflows/evolve-creature.yml",
        content: generateEvolveWorkflowYaml(creatureConfig, localCron),
        message: "ci: schedule 12AM daily profile & creature update",
      });
    }

    if (files.length === 0) {
      setError("Select at least one file to push.");
      return;
    }

    setPublishing(true);
    try {
      const result = await publishFilesToProfileRepo({
        token,
        owner: cleanUser,
        repo: targetRepo,
        branch: targetBranch,
        files,
      });
      // Immediately wipe token from memory after successful push
      setToken("");
      setSuccessInfo({
        paths: result.updatedPaths,
        repoUrl: result.repoUrl,
      });
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to publish files to GitHub."
      );
    } finally {
      setPublishing(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="publish-repo-title"
    >
      <div className="flex max-h-[92vh] w-full max-w-2xl flex-col overflow-hidden rounded-lg border border-zinc-800 bg-zinc-950 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-zinc-800 px-5 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-md border border-zinc-800 bg-zinc-900 text-zinc-100">
              <UploadCloud className="h-4 w-4" />
            </div>
            <div>
              <h2
                id="publish-repo-title"
                className="text-sm font-semibold text-zinc-50"
              >
                Connect &amp; Push to {cleanUser}/{targetRepo}
              </h2>
              <p className="text-xs text-zinc-400">
                Quickly deploy your animated creature &amp; custom README to any
                GitHub profile repository.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleSafeClose}
            aria-label="Close modal"
            className="rounded-md p-1.5 text-zinc-400 transition hover:bg-zinc-900 hover:text-zinc-50"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Body */}
        <div className="space-y-4 overflow-y-auto p-5">
          {/* Quick 3-Step Onboarding for Any Visitor */}
          <div className="rounded-md border border-zinc-800 bg-zinc-900/40 p-3.5 text-xs text-zinc-300">
            <div className="mb-2 font-semibold text-zinc-100">
              How any GitHub user can connect in 60 seconds:
            </div>
            <ol className="space-y-1.5 text-zinc-400">
              <li>
                <span className="font-mono font-semibold text-zinc-200">
                  1.
                </span>{" "}
                Create a public repo named exactly{" "}
                <code className="rounded bg-zinc-900 px-1 py-0.5 text-zinc-200">
                  {cleanUser}/{cleanUser}
                </code>{" "}
                —{" "}
                <a
                  href={`https://github.com/new?name=${encodeURIComponent(cleanUser)}&description=My+GitHub+Profile+README`}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-0.5 font-medium text-zinc-100 underline underline-offset-2 hover:text-white"
                >
                  Create {cleanUser} repo
                  <ExternalLink className="h-3 w-3" />
                </a>
              </li>
              <li>
                <span className="font-mono font-semibold text-zinc-200">
                  2.
                </span>{" "}
                Generate a fine-grained token at{" "}
                <a
                  href="https://github.com/settings/personal-access-tokens/new"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-0.5 font-medium text-zinc-100 underline underline-offset-2 hover:text-white"
                >
                  GitHub Token Settings
                  <ExternalLink className="h-3 w-3" />
                </a>{" "}
                scoped only to{" "}
                <code className="rounded bg-zinc-900 px-1 py-0.5 text-zinc-200">
                  {cleanUser}/{cleanUser}
                </code>{" "}
                with <strong>Contents: Read and write</strong>
                {installMidnightAction
                  ? " + Workflows: Read and write"
                  : ""}
                .
              </li>
              <li>
                <span className="font-mono font-semibold text-zinc-200">
                  3.
                </span>{" "}
                Paste your token below and click <strong>Push Now</strong>.
              </li>
            </ol>
          </div>

          {isDefaultSyncedUser && (
            <div className="flex items-center justify-between rounded-md border border-zinc-800 bg-zinc-900 px-3.5 py-2 text-xs text-zinc-200">
              <span>
                {snapshot?.profileRepoExists
                  ? `Detected profile repository: ${cleanUser}/${targetRepo} (${snapshot.profileRepoBranch})`
                  : `Profile repo ${cleanUser}/${targetRepo} not detected yet — create it in Step 1 above.`}
              </span>
              <a
                href={`https://github.com/${encodeURIComponent(cleanUser)}/${encodeURIComponent(targetRepo)}`}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 font-medium text-zinc-100 underline underline-offset-2"
              >
                Open
                <ExternalLink className="h-3 w-3" />
              </a>
            </div>
          )}

          <form onSubmit={handlePublish} className="space-y-4">
            {/* Username + Target Branch */}
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              <div className="sm:col-span-2">
                <label
                  htmlFor="publish-username-input"
                  className="mb-1.5 flex items-center gap-1.5 text-xs font-medium text-zinc-200"
                >
                  <User className="h-3.5 w-3.5 text-zinc-400" />
                  Your GitHub Username
                </label>
                <input
                  id="publish-username-input"
                  type="text"
                  value={targetUsername}
                  onChange={(e) => setTargetUsername(e.target.value)}
                  placeholder="Your GitHub username"
                  className="w-full rounded-md border border-zinc-800 bg-zinc-900 px-3 py-2 font-mono text-xs text-zinc-50 placeholder-zinc-500 focus:border-zinc-500 focus:outline-none"
                />
              </div>

              <div>
                <label
                  htmlFor="gh-branch-input"
                  className="mb-1.5 flex items-center gap-1.5 text-xs font-medium text-zinc-200"
                >
                  <GitBranch className="h-3.5 w-3.5 text-zinc-400" />
                  Branch
                </label>
                <input
                  id="gh-branch-input"
                  type="text"
                  value={targetBranch}
                  onChange={(e) => setBranch(e.target.value)}
                  className="w-full rounded-md border border-zinc-800 bg-zinc-900 px-3 py-2 font-mono text-xs text-zinc-50 focus:border-zinc-500 focus:outline-none"
                />
              </div>
            </div>

            {/* Hardened Personal Access Token Input */}
            <div>
              <div className="mb-1.5 flex items-center justify-between">
                <label
                  htmlFor="gh-pat-input"
                  className="flex items-center gap-1.5 text-xs font-medium text-zinc-200"
                >
                  <KeyRound className="h-3.5 w-3.5 text-zinc-400" />
                  GitHub Personal Access Token (Copy/Cut Disabled)
                </label>
                {token.length > 0 && (
                  <button
                    type="button"
                    onClick={() => setToken("")}
                    className="inline-flex items-center gap-1 text-[11px] text-zinc-400 hover:text-zinc-100"
                  >
                    <Trash2 className="h-3 w-3" />
                    Wipe Token
                  </button>
                )}
              </div>
              <input
                id="gh-pat-input"
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
                className="w-full select-none rounded-md border border-zinc-800 bg-zinc-900 px-3 py-2 font-mono text-xs text-zinc-50 placeholder-zinc-500 focus:border-zinc-500 focus:outline-none"
              />
              {token.length > 0 && (
                <p className="mt-1 font-mono text-[10px] text-zinc-400">
                  Token loaded securely in memory ({token.length} chars) —
                  copy/cut/reveal disabled and auto-wiped on push or close.
                </p>
              )}
            </div>

            {/* Security & GitHub Privacy Policy Notice */}
            <div className="flex items-start gap-2.5 rounded-md border border-zinc-800 bg-zinc-900/30 p-3 text-[11px] leading-relaxed text-zinc-400">
              <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-zinc-200" />
              <div>
                <span className="font-semibold text-zinc-200">
                  Token Security &amp; GitHub Privacy Policy:
                </span>{" "}
                This static site has no backend server. Your token stays
                strictly in ephemeral React memory, is never stored in cookies
                or <code className="text-zinc-300">localStorage</code>, cannot
                be copied once entered, and is transmitted directly over HTTPS
                to <code className="text-zinc-300">api.github.com</code> under
                the{" "}
                <a
                  href="https://docs.github.com/en/site-policy/privacy-policies/github-general-privacy-statement"
                  target="_blank"
                  rel="noreferrer"
                  className="text-zinc-200 underline underline-offset-2 hover:text-white"
                >
                  GitHub Privacy Statement
                </a>{" "}
                and{" "}
                <a
                  href="https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/managing-your-personal-access-tokens"
                  target="_blank"
                  rel="noreferrer"
                  className="text-zinc-200 underline underline-offset-2 hover:text-white"
                >
                  GitHub Token Security Guidelines
                </a>
                .
              </div>
            </div>

            {/* Files to Push */}
            <div className="space-y-2">
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
                <label className="flex cursor-pointer items-center gap-2 rounded-md border border-zinc-800 bg-zinc-900/60 px-3 py-2 text-xs text-zinc-200">
                  <input
                    type="checkbox"
                    checked={syncSvg}
                    onChange={(e) => setSyncSvg(e.target.checked)}
                    className="accent-zinc-100"
                  />
                  <span className="font-mono">creature.svg</span>
                </label>

                <label className="flex cursor-pointer items-center gap-2 rounded-md border border-zinc-800 bg-zinc-900/60 px-3 py-2 text-xs text-zinc-200">
                  <input
                    type="checkbox"
                    checked={syncReadme}
                    onChange={(e) => setSyncReadme(e.target.checked)}
                    className="accent-zinc-100"
                  />
                  <span className="font-mono">README.md</span>
                </label>

                <label className="flex cursor-pointer items-center gap-2 rounded-md border border-zinc-800 bg-zinc-900/60 px-3 py-2 text-xs text-zinc-200">
                  <input
                    type="checkbox"
                    checked={syncShareCard}
                    onChange={(e) => setSyncShareCard(e.target.checked)}
                    className="accent-zinc-100"
                  />
                  <span className="font-mono">share-card.svg</span>
                </label>
              </div>

              <label className="flex cursor-pointer items-start gap-2.5 rounded-md border border-zinc-800 bg-zinc-900/40 px-3 py-2.5 text-xs text-zinc-300">
                <input
                  type="checkbox"
                  checked={installMidnightAction}
                  onChange={(e) => setInstallMidnightAction(e.target.checked)}
                  className="mt-0.5 accent-zinc-100"
                />
                <div>
                  <span className="font-medium text-zinc-100">
                    Also install 12:00 AM daily Auto-Evolve Action
                  </span>
                  <div className="text-[11px] text-zinc-400">
                    Pushes <code>.github/workflows/evolve-creature.yml</code>{" "}
                    (cron <code>{localCron}</code> UTC) and{" "}
                    <code>scripts/evolve-creature.mjs</code> (requires{" "}
                    <strong>Workflows: Read &amp; write</strong> on token).
                  </div>
                </div>
              </label>
            </div>

            {error && (
              <div className="flex items-start gap-2 rounded-md border border-red-900 bg-red-950/50 p-3 text-xs text-red-200">
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {successInfo && (
              <div className="flex items-start justify-between gap-2 rounded-md border border-zinc-700 bg-zinc-900 p-3 text-xs text-zinc-100">
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-zinc-100" />
                  <div>
                    <div className="font-semibold">
                      Synced {successInfo.paths.join(", ")} to {cleanUser}/
                      {targetRepo} (token wiped from memory).
                    </div>
                    <a
                      href={`https://github.com/${encodeURIComponent(cleanUser)}`}
                      target="_blank"
                      rel="noreferrer"
                      className="mt-1 inline-flex items-center gap-1 text-zinc-300 underline underline-offset-2 hover:text-white"
                    >
                      View your updated GitHub Profile →
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  </div>
                </div>
              </div>
            )}

            <div className="flex flex-wrap items-center justify-between gap-2 border-t border-zinc-800 pt-3">
              <div className="flex flex-wrap gap-3 text-xs">
                <a
                  href={`https://github.com/${encodeURIComponent(cleanUser)}/${encodeURIComponent(targetRepo)}/upload/${encodeURIComponent(targetBranch)}`}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 text-zinc-400 hover:text-zinc-100"
                >
                  Manual Upload
                  <ExternalLink className="h-3 w-3" />
                </a>
                <a
                  href={`https://github.com/${encodeURIComponent(cleanUser)}/${encodeURIComponent(targetRepo)}/edit/${encodeURIComponent(targetBranch)}/README.md`}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 text-zinc-400 hover:text-zinc-100"
                >
                  Manual Edit README
                  <ExternalLink className="h-3 w-3" />
                </a>
              </div>

              <button
                type="submit"
                disabled={publishing}
                className="inline-flex items-center gap-2 rounded-md bg-zinc-50 px-4 py-2 text-xs font-semibold text-zinc-950 transition hover:bg-zinc-200 disabled:opacity-50"
              >
                {publishing ? (
                  <>
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    Pushing to GitHub...
                  </>
                ) : (
                  <>
                    <UploadCloud className="h-3.5 w-3.5" />
                    Push Now to {cleanUser}/{targetRepo}
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
