"use client";

import { useState } from "react";
import {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  Check,
  CheckCircle2,
  CheckSquare,
  Copy,
  ExternalLink,
  RefreshCw,
} from "lucide-react";
import { copyToClipboard } from "@/infrastructure/browser/downloadAdapter";
import { checkProfileRepoExists } from "@/infrastructure/github/githubClient";
import { StudioButton } from "../studio/ui/StudioButton";

interface RepoSetupScreenProps {
  username: string;
  profileRepoExists: boolean;
  onBack: () => void;
  onNext: () => void;
}

/**
 * Step 2 Repository screen with two-column layout, timeline steps, and GitHub profile visual.
 */
export function RepoSetupScreen({
  username,
  profileRepoExists,
  onBack,
  onNext,
}: RepoSetupScreenProps) {
  const safeUsername = username.trim() || "your-username";
  const [copied, setCopied] = useState(false);
  const [recheckedState, setRecheckedState] = useState<{
    username: string;
    exists: boolean;
  } | null>(null);
  const [checking, setChecking] = useState(false);

  const repoExists =
    recheckedState?.username === safeUsername
      ? recheckedState.exists
      : profileRepoExists;

  const handleCopyRepoName = async () => {
    await copyToClipboard(safeUsername);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 2000);
  };

  const handleCheckAgain = async () => {
    if (!username.trim() || username === "your-username") return;
    setChecking(true);
    try {
      const res = await checkProfileRepoExists(safeUsername);
      if (!res.rateLimited) {
        setRecheckedState({ username: safeUsername, exists: res.exists });
      }
    } finally {
      setChecking(false);
    }
  };

  return (
    <div className="mx-auto flex w-full max-w-[1200px] flex-col gap-6 px-4 py-10 sm:px-6 sm:py-12">
      <div className="flex flex-col gap-2">
        <h1 className="text-[28px] leading-[1.18] font-semibold tracking-[-0.025em] text-[var(--text)] sm:text-[32px]">
          Set up your profile repository
        </h1>
        <p className="text-[15px] leading-6 text-[var(--text-2)]">
          GitHub shows a profile README when a public repository has the same
          name as your username.
        </p>
      </div>

      <div className="grid items-start gap-8 lg:grid-cols-[minmax(0,1fr)_420px] lg:gap-10">
        {/* Left Column */}
        <div className="flex min-w-0 flex-col gap-6">
          {/* Status banner without borders */}
          {repoExists ? (
            <div
              role="status"
              className="flex flex-wrap items-center justify-between gap-4 rounded-[12px] bg-[var(--tide-soft)] px-5 py-4 text-[14px] leading-6 text-[var(--text)]"
            >
              <div className="flex min-w-0 flex-1 items-start gap-3">
                <CheckCircle2 className="mt-1 size-4 shrink-0 text-[var(--tide)]" />
                <span>
                  Repository for{" "}
                  <code className="studio-mono font-semibold">
                    {safeUsername}
                  </code>{" "}
                  was detected. Make sure its visibility is Public, then
                  continue.
                </span>
              </div>

              <StudioButton
                type="button"
                variant="secondary"
                size="sm"
                disabled={checking}
                onClick={handleCheckAgain}
              >
                <RefreshCw className={checking ? "animate-spin" : undefined} />
                <span>{checking ? "Checking" : "Check again"}</span>
              </StudioButton>
            </div>
          ) : (
            <div
              role="status"
              className="flex flex-wrap items-center justify-between gap-4 rounded-[12px] bg-[var(--warning-soft)] px-5 py-4 text-[14px] leading-6 text-[var(--text)]"
            >
              <div className="flex min-w-0 flex-1 items-start gap-3">
                <AlertTriangle className="mt-1 size-4 shrink-0 text-[var(--warning)]" />
                <span>
                  Repository for{" "}
                  <code className="studio-mono font-semibold">
                    {safeUsername}
                  </code>{" "}
                  was not detected yet. Follow the three steps below to create a
                  Public repository on GitHub, then continue.
                </span>
              </div>

              <StudioButton
                type="button"
                variant="secondary"
                size="sm"
                disabled={checking}
                onClick={handleCheckAgain}
              >
                <RefreshCw className={checking ? "animate-spin" : undefined} />
                <span>{checking ? "Checking" : "Check again"}</span>
              </StudioButton>
            </div>
          )}

          {/* Three steps as vertical timeline */}
          <ol className="relative flex flex-col gap-4">
            <span
              aria-hidden="true"
              className="absolute top-12 bottom-12 left-[37px] w-[2px] bg-[var(--surface-3)] sm:left-[45px]"
            />

            {/* Step 1 */}
            <li className="relative flex items-start gap-4 rounded-[12px] bg-[var(--surface)] p-6 sm:gap-5 sm:p-8">
              <span className="relative z-10 flex size-7 shrink-0 items-center justify-center rounded-full bg-[var(--surface-3)] text-[13px] font-semibold text-[var(--text)]">
                1
              </span>
              <div className="flex min-w-0 flex-1 flex-wrap items-center justify-between gap-4">
                <div className="flex min-w-[200px] flex-1 flex-col gap-1">
                  <h2 className="text-[16px] leading-6 font-semibold text-[var(--text)]">
                    Open GitHub
                  </h2>
                  <p className="text-[14px] leading-6 text-[var(--text-2)]">
                    Open the new repository page while signed in as{" "}
                    <span className="studio-mono text-[var(--text)]">
                      @{safeUsername}
                    </span>
                    .
                  </p>
                </div>

                <a
                  href="https://github.com/new"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex h-10 shrink-0 items-center justify-center gap-2 rounded-[8px] bg-[var(--surface-2)] px-4 text-[14px] font-medium whitespace-nowrap text-[var(--text)] transition-colors duration-150 hover:bg-[var(--surface-3)]"
                >
                  <span>Open GitHub</span>
                  <ExternalLink className="size-4 text-[var(--text-2)]" />
                </a>
              </div>
            </li>

            {/* Step 2 */}
            <li className="relative flex items-start gap-4 rounded-[12px] bg-[var(--surface)] p-6 sm:gap-5 sm:p-8">
              <span className="relative z-10 flex size-7 shrink-0 items-center justify-center rounded-full bg-[var(--surface-3)] text-[13px] font-semibold text-[var(--text)]">
                2
              </span>
              <div className="flex min-w-0 flex-1 flex-col gap-3">
                <h2 className="text-[16px] leading-6 font-semibold text-[var(--text)]">
                  Name it like your username
                </h2>

                <div className="flex flex-wrap items-center gap-2.5">
                  <div className="studio-mono inline-flex min-h-[40px] flex-wrap items-center gap-3 rounded-[8px] bg-[var(--surface-2)] px-4 py-2 text-[14px]">
                    <span className="inline-flex items-center gap-1.5">
                      <span className="text-[var(--text-3)]">Owner</span>
                      <span className="text-[var(--text-2)]">
                        {safeUsername}
                      </span>
                    </span>
                    <span className="inline-flex items-center gap-1.5">
                      <span className="text-[var(--text-3)]">Repository</span>
                      <strong className="font-semibold text-[var(--text)]">
                        {safeUsername}
                      </strong>
                    </span>
                  </div>

                  <StudioButton
                    type="button"
                    variant="secondary"
                    size="lg"
                    onClick={handleCopyRepoName}
                    aria-label="Copy repository name"
                  >
                    {copied ? (
                      <>
                        <Check className="text-[var(--tide)]" />
                        <span>Copied</span>
                      </>
                    ) : (
                      <>
                        <Copy />
                        <span>Copy</span>
                      </>
                    )}
                  </StudioButton>
                </div>

                <p className="text-[14px] leading-6 text-[var(--text-2)]">
                  GitHub shows a confirmation notice when the repository name
                  matches your username.
                </p>
              </div>
            </li>

            {/* Step 3 */}
            <li className="relative flex items-start gap-4 rounded-[12px] bg-[var(--surface)] p-6 sm:gap-5 sm:p-8">
              <span className="relative z-10 flex size-7 shrink-0 items-center justify-center rounded-full bg-[var(--surface-3)] text-[13px] font-semibold text-[var(--text)]">
                3
              </span>
              <div className="flex min-w-0 flex-1 flex-col gap-3">
                <h2 className="text-[16px] leading-6 font-semibold text-[var(--text)]">
                  Make it Public and add a README file
                </h2>

                <div className="flex flex-wrap items-center gap-3">
                  <div className="inline-flex items-center gap-2 rounded-[8px] bg-[var(--surface-2)] px-3.5 py-2 text-[13px] font-medium text-[var(--text)]">
                    <CheckSquare className="size-4 text-[var(--tide)]" />
                    <span>Public</span>
                  </div>
                  <div className="inline-flex items-center gap-2 rounded-[8px] bg-[var(--surface-2)] px-3.5 py-2 text-[13px] font-medium text-[var(--text)]">
                    <CheckSquare className="size-4 text-[var(--tide)]" />
                    <span>Add a README file</span>
                  </div>
                </div>

                <p className="text-[14px] leading-6 text-[var(--text-2)]">
                  Create the repository on GitHub, then return here to customize
                  your README.
                </p>
              </div>
            </li>
          </ol>

          {/* Navigation row */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
            <StudioButton type="button" variant="ghost" onClick={onBack}>
              <ArrowLeft />
              <span>Back</span>
            </StudioButton>

            <StudioButton
              type="button"
              variant="primary"
              size="lg"
              onClick={onNext}
            >
              <span>Customize README</span>
              <ArrowRight />
            </StudioButton>
          </div>
        </div>

        {/* Right Column: Visual of GitHub Profile Page Layout */}
        <aside className="lg:sticky lg:top-[116px] lg:self-start">
          <div className="studio-wallpaper rounded-[20px] p-5 sm:p-6">
            <div className="flex flex-col gap-5 rounded-[16px] bg-[var(--surface)]/80 p-6 shadow-[var(--shadow-float)] backdrop-blur-xl">
              <span className="text-[11px] font-semibold tracking-[0.04em] text-[var(--text-3)] uppercase">
                GitHub profile layout
              </span>

              <div className="flex items-start gap-4">
                <div className="flex flex-col items-center gap-2">
                  <div className="size-12 rounded-full bg-[var(--surface-2)]" />
                  <div className="h-2.5 w-14 rounded-[4px] bg-[var(--surface-2)]" />
                  <div className="h-2 w-10 rounded-[4px] bg-[var(--surface-2)]" />
                </div>

                <div className="flex min-w-0 flex-1 flex-col gap-3">
                  <div className="flex flex-col gap-2 rounded-[12px] bg-[var(--tide-soft)] p-4">
                    <span className="studio-mono truncate text-[12px] font-semibold text-[var(--tide)]">
                      {safeUsername}/{safeUsername}
                    </span>
                    <div className="h-3 w-3/4 rounded-[4px] bg-[var(--surface)]/80" />
                    <div className="h-2.5 w-full rounded-[4px] bg-[var(--surface)]/70" />
                    <div className="h-2.5 w-5/6 rounded-[4px] bg-[var(--surface)]/70" />
                    <span className="mt-1 text-[11px] font-medium text-[var(--text-2)]">
                      Shown at the top of your profile
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div className="h-12 rounded-[8px] bg-[var(--surface-2)]" />
                    <div className="h-12 rounded-[8px] bg-[var(--surface-2)]" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
