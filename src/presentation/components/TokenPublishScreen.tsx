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
  Zap,
} from "lucide-react";
import {
  generateEvolveScriptMjs,
  generateEvolveWorkflowYaml,
  getMidnightCronForTimezone,
} from "@/domain/automation/workflowService";
import type { CreatureConfig } from "@/domain/creature/entities";
import { downloadTextFile } from "@/infrastructure/browser/downloadAdapter";
import { publishFilesToProfileRepo } from "@/infrastructure/github/githubClient";

interface TokenPublishScreenProps {
  creatureConfig: CreatureConfig;
  creatureSvg: string;
  shareCardSvg: string;
  readmeMarkdown: string;
  includeShareCard: boolean;
  defaultBranch: string;
  onBack: () => void;
}

export function TokenPublishScreen({
  creatureConfig,
  creatureSvg,
  shareCardSvg,
  readmeMarkdown,
  includeShareCard,
  defaultBranch,
  onBack,
}: TokenPublishScreenProps) {
  const [tokenInput, setTokenInput] = useState("");
  const [includeWorkflowFiles, setIncludeWorkflowFiles] = useState(false);
  const [pushLoading, setPushLoading] = useState(false);
  const [pushError, setPushError] = useState<string | null>(null);
  const [publishResult, setPublishResult] = useState<{
    username: string;
    repoUrl: string;
    updatedPaths: string[];
  } | null>(null);

  const username = creatureConfig.username.trim() || "your-username";

  const localCron = useMemo(() => {
    const offsetMinutesEast = -new Date().getTimezoneOffset();
    return getMidnightCronForTimezone(offsetMinutesEast);
  }, []);

  const handlePush = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!tokenInput.trim()) {
      setPushError("Please paste your GitHub Personal Access Token first.");
      return;
    }

    setPushLoading(true);
    setPushError(null);
    setPublishResult(null);

    try {
      const files = [
        {
          path: "creature.svg",
          content: creatureSvg,
          message: "feat: update animated cyber creature SVG",
        },
        {
          path: "README.md",
          content: readmeMarkdown,
          message: "feat: update dynamic GitHub profile README",
        },
      ];

      if (includeShareCard) {
        files.push({
          path: "share-card.svg",
          content: shareCardSvg,
          message: "feat: update creature social banner SVG",
        });
      }

      if (includeWorkflowFiles) {
        files.push(
          {
            path: ".github/workflows/evolve-creature.yml",
            content: generateEvolveWorkflowYaml(creatureConfig, localCron),
            message: "ci: add 12:00 AM daily creature auto-evolve workflow",
          },
          {
            path: "scripts/evolve-creature.mjs",
            content: generateEvolveScriptMjs(creatureConfig),
            message: "ci: add daily creature evolution script",
          }
        );
      }

      const result = await publishFilesToProfileRepo({
        token: tokenInput,
        owner: username,
        repo: username,
        branch: defaultBranch || "main",
        files,
      });

      setTokenInput("");
      setPublishResult({
        username,
        repoUrl: result.repoUrl,
        updatedPaths: result.updatedPaths,
      });
    } catch (err) {
      setPushError(
        err instanceof Error
          ? err.message
          : "Failed to push changes to GitHub."
      );
    } finally {
      setPushLoading(false);
    }
  };

  return (
    <div className="flex min-h-[calc(100vh-140px)] items-center justify-center px-4 py-10">
      <div className="w-full max-w-xl rounded-3xl border border-slate-200 bg-white p-8 shadow-sm dark:border-[#363d4a] dark:bg-[#1e222a] sm:p-10">
        <div className="space-y-2 text-center">
          <span className="inline-block rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-700 dark:bg-indigo-500/15 dark:text-indigo-300">
            Step 4 of 4 · Secure Publish
          </span>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
            Enter Your Personal Access Token
          </h2>
          <p className="text-sm text-slate-600 dark:text-slate-300">
            Ready to push <code className="font-semibold">creature.svg</code> and{" "}
            <code className="font-semibold">README.md</code> to{" "}
            <code className="font-semibold text-indigo-600 dark:text-indigo-300">
              {username}/{username}
            </code>
          </p>
        </div>

        <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-[#363d4a] dark:bg-[#272c36]">
          <div className="flex items-start gap-3">
            <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600 dark:text-emerald-400" />
            <div className="space-y-1.5 text-xs leading-relaxed text-slate-600 dark:text-slate-300">
              <p className="font-semibold text-slate-900 dark:text-slate-100">
                Your token stays private and secure
              </p>
              <p>
                This app runs 100% statically in your browser. Your token is kept only in
                temporary memory, never saved to cookies or storage, and automatically
                cleared immediately after your push completes. Copy and right-click are
                blocked inside the token field.
              </p>
              <div className="flex flex-wrap gap-4 pt-1">
                <a
                  href="https://github.com/settings/personal-access-tokens/new"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 font-semibold text-indigo-600 underline dark:text-indigo-300"
                >
                  Create Fine-Grained Token (Contents: Read &amp; write)
                  <ExternalLink className="h-3 w-3" />
                </a>
                <a
                  href="https://docs.github.com/en/site-policy/privacy-policies/github-general-privacy-statement"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 font-medium text-slate-700 underline dark:text-slate-300"
                >
                  GitHub Privacy Statement
                  <ExternalLink className="h-3 w-3" />
                </a>
              </div>
            </div>
          </div>
        </div>

        <form onSubmit={handlePush} className="mt-6 space-y-5">
          <div>
            <div className="mb-2 flex items-center justify-between">
              <label
                htmlFor="pat-single-input"
                className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 dark:text-slate-200"
              >
                <KeyRound className="h-3.5 w-3.5" />
                GitHub Personal Access Token
              </label>
              <span className="inline-flex items-center gap-1 text-[11px] text-slate-500 dark:text-slate-400">
                <Lock className="h-3 w-3" />
                Copy disabled
              </span>
            </div>

            <div className="flex gap-2">
              <input
                id="pat-single-input"
                type="password"
                autoComplete="off"
                spellCheck={false}
                value={tokenInput}
                onChange={(e) => {
                  setTokenInput(e.target.value);
                  if (pushError) setPushError(null);
                }}
                onCopy={(e) => e.preventDefault()}
                onCut={(e) => e.preventDefault()}
                onDragStart={(e) => e.preventDefault()}
                onContextMenu={(e) => e.preventDefault()}
                placeholder="github_pat_... or ghp_..."
                className="w-full select-none rounded-xl border border-slate-300 bg-white px-4 py-3 font-mono text-sm text-slate-900 outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-600/15 dark:border-[#363d4a] dark:bg-[#272c36] dark:text-slate-100 dark:focus:border-indigo-400"
              />
              {tokenInput && (
                <button
                  type="button"
                  onClick={() => setTokenInput("")}
                  title="Clear token from memory"
                  className="rounded-xl border border-slate-300 bg-white px-3.5 text-slate-600 hover:bg-slate-50 dark:border-[#363d4a] dark:bg-[#272c36] dark:text-slate-300"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>

          <label className="flex cursor-pointer items-start gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-[#363d4a] dark:bg-[#272c36]">
            <input
              type="checkbox"
              checked={includeWorkflowFiles}
              onChange={(e) => setIncludeWorkflowFiles(e.target.checked)}
              className="mt-0.5 h-4 w-4 rounded border-slate-300 accent-indigo-600"
            />
            <div className="text-xs leading-relaxed">
              <span className="font-semibold text-slate-900 dark:text-slate-100">
                Also push 12:00 AM Daily Auto-Evolve GitHub Action
              </span>
              <p className="mt-0.5 text-slate-600 dark:text-slate-300">
                Requires the <code className="font-semibold">workflow</code> scope on your
                token. Leave unchecked to push only <code>creature.svg</code> and{" "}
                <code>README.md</code> cleanly.
              </p>
            </div>
          </label>

          {pushError && (
            <div className="flex items-start gap-2.5 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-xs text-rose-800 dark:border-rose-700/50 dark:bg-rose-950/30 dark:text-rose-200">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
              <span>{pushError}</span>
            </div>
          )}

          {publishResult && (
            <div className="space-y-3 rounded-2xl border border-emerald-200 bg-emerald-50 p-5 text-sm text-emerald-950 dark:border-emerald-700/50 dark:bg-emerald-950/30 dark:text-emerald-100">
              <div className="flex items-center gap-2 font-semibold">
                <CheckCircle2 className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                <span>
                  Published {publishResult.updatedPaths.join(", ")} to{" "}
                  {publishResult.username}/{publishResult.username}
                </span>
              </div>
              <div className="flex flex-wrap gap-3">
                <a
                  href={`https://github.com/${encodeURIComponent(publishResult.username)}`}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-700 px-4 py-2 text-xs font-semibold text-white hover:bg-emerald-800 dark:bg-emerald-600"
                >
                  View Live GitHub Profile
                  <ExternalLink className="h-3.5 w-3.5" />
                </a>
                <a
                  href={publishResult.repoUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 rounded-xl border border-emerald-300 bg-white px-4 py-2 text-xs font-semibold text-emerald-900 dark:border-emerald-700 dark:bg-[#1e222a] dark:text-emerald-200"
                >
                  Open Repository
                  <ExternalLink className="h-3.5 w-3.5" />
                </a>
              </div>
            </div>
          )}

          <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
            <button
              type="button"
              onClick={onBack}
              disabled={pushLoading}
              className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-5 py-3 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:opacity-50 dark:border-[#363d4a] dark:bg-[#272c36] dark:text-slate-200 dark:hover:bg-[#2f3642]"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Customize
            </button>

            <button
              type="submit"
              disabled={pushLoading || !tokenInput.trim()}
              className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-indigo-500 dark:hover:bg-indigo-400"
            >
              {pushLoading ? (
                <>
                  <RefreshCw className="h-4 w-4 animate-spin" />
                  Pushing Changes...
                </>
              ) : (
                <>
                  <Zap className="h-4 w-4" />
                  <span>Push Changes to README</span>
                </>
              )}
            </button>
          </div>
        </form>

        <div className="mt-6 flex items-center justify-between border-t border-slate-100 pt-4 text-xs text-slate-500 dark:border-[#363d4a] dark:text-slate-400">
          <span>Prefer manual upload?</span>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() =>
                downloadTextFile("creature.svg", creatureSvg, "image/svg+xml")
              }
              className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-2.5 py-1.5 font-medium text-slate-700 hover:bg-slate-50 dark:border-[#363d4a] dark:bg-[#272c36] dark:text-slate-200"
            >
              <Download className="h-3.5 w-3.5" />
              creature.svg
            </button>
            <button
              type="button"
              onClick={() =>
                downloadTextFile("README.md", readmeMarkdown, "text/markdown")
              }
              className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-2.5 py-1.5 font-medium text-slate-700 hover:bg-slate-50 dark:border-[#363d4a] dark:bg-[#272c36] dark:text-slate-200"
            >
              <Download className="h-3.5 w-3.5" />
              README.md
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
