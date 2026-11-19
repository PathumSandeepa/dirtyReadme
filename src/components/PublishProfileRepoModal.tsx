"use client";

import { useState } from "react";
import {
  AlertCircle,
  CheckCircle2,
  ExternalLink,
  GitBranch,
  KeyRound,
  Loader2,
  UploadCloud,
  X,
} from "lucide-react";
import {
  type GitHubProfileSnapshot,
  publishFilesToProfileRepo,
} from "@/lib/githubApi";

interface PublishProfileRepoModalProps {
  open: boolean;
  onClose: () => void;
  username: string;
  snapshot: GitHubProfileSnapshot | null;
  creatureSvg: string;
  shareCardSvg: string;
  readmeMarkdown: string;
}

export function PublishProfileRepoModal({
  open,
  onClose,
  username,
  snapshot,
  creatureSvg,
  shareCardSvg,
  readmeMarkdown,
}: PublishProfileRepoModalProps) {
  const [token, setToken] = useState("");
  const [branch, setBranch] = useState(
    snapshot?.profileRepoBranch || "main"
  );
  const [syncSvg, setSyncSvg] = useState(true);
  const [syncReadme, setSyncReadme] = useState(true);
  const [syncShareCard, setSyncShareCard] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successInfo, setSuccessInfo] = useState<{
    paths: string[];
    repoUrl: string;
  } | null>(null);

  if (!open) return null;

  const cleanUser = username.trim() || "PathumSandeepa";
  const targetRepo = cleanUser;
  const targetBranch = branch.trim() || snapshot?.profileRepoBranch || "main";

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
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="publish-repo-title"
    >
      <div className="flex max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden rounded-xl border border-[#30363d] bg-[#0d1117] shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#30363d] bg-[#161b22] px-5 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-[#FF6B00]/40 bg-[#FF6B00]/10 text-[#FF6B00]">
              <UploadCloud className="h-5 w-5" />
            </div>
            <div>
              <h2
                id="publish-repo-title"
                className="text-base font-semibold text-[#e6edf3]"
              >
                Push Directly to {cleanUser}/{targetRepo}
              </h2>
              <p className="text-xs text-[#8b949e]">
                Sync <code className="text-[#c9d1d9]">creature.svg</code> &amp;{" "}
                <code className="text-[#c9d1d9]">README.md</code> directly via
                GitHub API (works even without GitHub Actions).
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close modal"
            className="rounded-lg p-1.5 text-[#8b949e] transition hover:bg-[#30363d]/60 hover:text-white"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Body */}
        <div className="space-y-4 overflow-y-auto p-5">
          {/* Repo Detection Status */}
          <div
            className={`flex items-center justify-between rounded-lg border px-3.5 py-2.5 text-xs ${
              snapshot?.profileRepoExists
                ? "border-[#00E676]/40 bg-[#00E676]/10 text-[#00E676]"
                : "border-[#FF6B00]/40 bg-[#FF6B00]/10 text-[#FF6B00]"
            }`}
          >
            <span>
              {snapshot?.profileRepoExists
                ? `Profile repository detected: ${cleanUser}/${targetRepo} (${snapshot.profileRepoBranch})`
                : `Click "Sync" in the Studio or verify https://github.com/${cleanUser}/${targetRepo} exists.`}
            </span>
            <a
              href={`https://github.com/${encodeURIComponent(cleanUser)}/${encodeURIComponent(targetRepo)}`}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1 font-semibold underline"
            >
              Open Repo
              <ExternalLink className="h-3 w-3" />
            </a>
          </div>

          <form onSubmit={handlePublish} className="space-y-4">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              <div className="sm:col-span-2">
                <label
                  htmlFor="gh-pat-input"
                  className="mb-1 flex items-center gap-1.5 text-xs font-medium text-[#e6edf3]"
                >
                  <KeyRound className="h-3.5 w-3.5 text-[#FF6B00]" />
                  Fine-Grained GitHub Token (In-Memory Only)
                </label>
                <input
                  id="gh-pat-input"
                  type="password"
                  value={token}
                  onChange={(e) => setToken(e.target.value)}
                  placeholder="github_pat_... (Contents: Read & Write)"
                  className="w-full rounded-lg border border-[#30363d] bg-[#161b22] px-3 py-2 font-mono text-xs text-white placeholder-[#6e7681] focus:border-[#00E676] focus:outline-none"
                />
              </div>

              <div>
                <label
                  htmlFor="gh-branch-input"
                  className="mb-1 flex items-center gap-1.5 text-xs font-medium text-[#e6edf3]"
                >
                  <GitBranch className="h-3.5 w-3.5 text-[#00E676]" />
                  Target Branch
                </label>
                <input
                  id="gh-branch-input"
                  type="text"
                  value={targetBranch}
                  onChange={(e) => setBranch(e.target.value)}
                  className="w-full rounded-lg border border-[#30363d] bg-[#161b22] px-3 py-2 font-mono text-xs text-white focus:border-[#00E676] focus:outline-none"
                />
              </div>
            </div>

            <p className="text-[11px] leading-relaxed text-[#8b949e]">
              Your token is never saved to storage and only sent directly from
              your browser to{" "}
              <code className="text-[#c9d1d9]">api.github.com</code>.{" "}
              <a
                href="https://github.com/settings/personal-access-tokens/new"
                target="_blank"
                rel="noreferrer"
                className="text-[#58a6ff] hover:underline"
              >
                Create a fine-grained token →
              </a>{" "}
              (select repository <code>{cleanUser}/{targetRepo}</code> with{" "}
              <strong>Contents: Read and write</strong>).
            </p>

            {/* File Checkboxes */}
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
              <label className="flex cursor-pointer items-center gap-2 rounded-lg border border-[#30363d] bg-[#161b22] px-3 py-2 text-xs text-[#e6edf3]">
                <input
                  type="checkbox"
                  checked={syncSvg}
                  onChange={(e) => setSyncSvg(e.target.checked)}
                  className="accent-[#00E676]"
                />
                <span className="font-mono">creature.svg</span>
              </label>

              <label className="flex cursor-pointer items-center gap-2 rounded-lg border border-[#30363d] bg-[#161b22] px-3 py-2 text-xs text-[#e6edf3]">
                <input
                  type="checkbox"
                  checked={syncReadme}
                  onChange={(e) => setSyncReadme(e.target.checked)}
                  className="accent-[#00E676]"
                />
                <span className="font-mono">README.md</span>
              </label>

              <label className="flex cursor-pointer items-center gap-2 rounded-lg border border-[#30363d] bg-[#161b22] px-3 py-2 text-xs text-[#e6edf3]">
                <input
                  type="checkbox"
                  checked={syncShareCard}
                  onChange={(e) => setSyncShareCard(e.target.checked)}
                  className="accent-[#00E676]"
                />
                <span className="font-mono">share-card.svg</span>
              </label>
            </div>

            {error && (
              <div className="flex items-start gap-2 rounded-lg border border-red-500/40 bg-red-500/10 p-3 text-xs text-red-300">
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {successInfo && (
              <div className="flex items-start justify-between gap-2 rounded-lg border border-[#00E676]/40 bg-[#00E676]/10 p-3 text-xs text-[#00E676]">
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
                  <div>
                    <div className="font-semibold">
                      Synced {successInfo.paths.join(", ")} to {cleanUser}/
                      {targetRepo}!
                    </div>
                    <a
                      href={`https://github.com/${encodeURIComponent(cleanUser)}`}
                      target="_blank"
                      rel="noreferrer"
                      className="mt-1 inline-flex items-center gap-1 underline"
                    >
                      View your updated GitHub Profile →
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  </div>
                </div>
              </div>
            )}

            <div className="flex flex-wrap items-center justify-between gap-2 border-t border-[#21262d] pt-3">
              <div className="flex flex-wrap gap-3 text-xs">
                <a
                  href={`https://github.com/${encodeURIComponent(cleanUser)}/${encodeURIComponent(targetRepo)}/upload/${encodeURIComponent(targetBranch)}`}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 text-[#58a6ff] hover:underline"
                >
                  Manual Upload Page
                  <ExternalLink className="h-3 w-3" />
                </a>
                <a
                  href={`https://github.com/${encodeURIComponent(cleanUser)}/${encodeURIComponent(targetRepo)}/edit/${encodeURIComponent(targetBranch)}/README.md`}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 text-[#58a6ff] hover:underline"
                >
                  Manual Edit README
                  <ExternalLink className="h-3 w-3" />
                </a>
              </div>

              <button
                type="submit"
                disabled={publishing}
                className="inline-flex items-center gap-2 rounded-lg bg-[#FF6B00] px-4 py-2 text-xs font-semibold text-white transition hover:bg-[#ff7f24] disabled:opacity-50"
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
