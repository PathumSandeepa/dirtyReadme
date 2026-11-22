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
} from "lucide-react";
import { copyToClipboard } from "@/infrastructure/browser/downloadAdapter";
import { StudioButton } from "../studio/ui/StudioButton";

interface RepoSetupScreenProps {
  username: string;
  profileRepoExists: boolean;
  onBack: () => void;
  onNext: () => void;
}

export function RepoSetupScreen({
  username,
  profileRepoExists,
  onBack,
  onNext,
}: RepoSetupScreenProps) {
  const safeUsername = username.trim() || "your-username";
  const [copied, setCopied] = useState(false);

  const handleCopyRepoName = async () => {
    await copyToClipboard(safeUsername);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="mx-auto flex w-full max-w-[720px] flex-col gap-6 px-4 py-8 sm:px-6 sm:py-10">
      <div className="flex flex-col gap-2">
        <h1 className="text-[24px] leading-8 font-semibold tracking-tight text-[var(--text)]">
          Create your public profile repository
        </h1>
        <p className="text-[14px] leading-6 text-[var(--text-muted)]">
          GitHub shows a profile README when a public repository has exactly the
          same name as your username.
        </p>
      </div>

      {/* Status banner */}
      {profileRepoExists ? (
        <div
          role="status"
          className="flex items-start gap-3 rounded-[8px] border border-[var(--success)]/35 bg-[var(--success-soft)] px-4 py-3.5 text-[14px] leading-5 text-[var(--text)]"
        >
          <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-[var(--success)]" />
          <span>
            Repository{" "}
            <code className="studio-mono font-medium">
              {safeUsername}/{safeUsername}
            </code>{" "}
            found. Make sure its visibility is Public, then continue.
          </span>
        </div>
      ) : (
        <div
          role="status"
          className="flex items-start gap-3 rounded-[8px] border border-[var(--warning)]/35 bg-[var(--warning-soft)] px-4 py-3.5 text-[14px] leading-5 text-[var(--text)]"
        >
          <AlertTriangle className="mt-0.5 size-4 shrink-0 text-[var(--warning)]" />
          <span>
            Repository{" "}
            <code className="studio-mono font-medium">
              {safeUsername}/{safeUsername}
            </code>{" "}
            was not detected yet. Follow the three steps below to create it on
            GitHub, then continue.
          </span>
        </div>
      )}

      {/* 3 numbered steps with continuous vertical connecting line */}
      <div className="rounded-[8px] border border-[var(--border)] bg-[var(--surface)] p-6 sm:p-8">
        <ol className="relative flex flex-col gap-7">
          <span
            aria-hidden="true"
            className="absolute top-7 bottom-7 left-[13px] w-px bg-[var(--border)]"
          />

          {/* Step 1 */}
          <li className="relative flex items-start gap-4">
            <span className="relative z-10 flex size-7 shrink-0 items-center justify-center rounded-full border border-[var(--border)] bg-[var(--surface-2)] text-[13px] font-semibold text-[var(--text)]">
              1
            </span>
            <div className="flex min-w-0 flex-1 flex-wrap items-start justify-between gap-4">
              <div className="flex min-w-[200px] flex-1 flex-col gap-1">
                <h2 className="text-[16px] leading-6 font-semibold text-[var(--text)]">
                  Open GitHub&apos;s new repository page
                </h2>
                <p className="text-[13px] leading-5 text-[var(--text-muted)]">
                  Make sure you are signed in as{" "}
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
                className="inline-flex h-11 shrink-0 items-center justify-center gap-2 rounded-[6px] border border-[var(--border)] bg-[var(--surface)] px-3.5 text-[14px] font-medium whitespace-nowrap text-[var(--text)] transition-[color,background-color,border-color] duration-150 hover:border-[var(--border-strong)] hover:bg-[var(--surface-2)] sm:h-9"
              >
                <span>Open GitHub new repo</span>
                <ExternalLink className="size-4 text-[var(--text-muted)]" />
              </a>
            </div>
          </li>

          {/* Step 2 */}
          <li className="relative flex items-start gap-4">
            <span className="relative z-10 flex size-7 shrink-0 items-center justify-center rounded-full border border-[var(--border)] bg-[var(--surface-2)] text-[13px] font-semibold text-[var(--text)]">
              2
            </span>
            <div className="flex min-w-0 flex-1 flex-col gap-2.5">
              <h2 className="text-[16px] leading-6 font-semibold text-[var(--text)]">
                Name the repository exactly like your username
              </h2>

              <div className="flex flex-wrap items-center gap-2">
                <div className="studio-mono inline-flex min-h-[40px] items-center rounded-[6px] border border-[var(--border)] bg-[var(--surface-2)] px-3.5 py-1.5 text-[14px]">
                  <span className="text-[var(--text-muted)]">
                    {safeUsername} /{" "}
                  </span>
                  <strong className="ml-1 font-semibold text-[var(--text)]">
                    {safeUsername}
                  </strong>
                </div>

                <StudioButton
                  variant="secondary"
                  onClick={handleCopyRepoName}
                  aria-label="Copy repository name"
                >
                  {copied ? (
                    <>
                      <Check className="text-[var(--success)]" />
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

              <p className="text-[13px] leading-5 text-[var(--text-muted)]">
                GitHub shows a special banner confirming this repository powers
                your profile README.
              </p>
            </div>
          </li>

          {/* Step 3 */}
          <li className="relative flex items-start gap-4">
            <span className="relative z-10 flex size-7 shrink-0 items-center justify-center rounded-full border border-[var(--border)] bg-[var(--surface-2)] text-[13px] font-semibold text-[var(--text)]">
              3
            </span>
            <div className="flex min-w-0 flex-1 flex-col gap-2.5">
              <h2 className="text-[16px] leading-6 font-semibold text-[var(--text)]">
                Set it to Public and add a README file
              </h2>

              <div className="flex flex-wrap items-center gap-3">
                <div className="inline-flex items-center gap-2 rounded-[6px] border border-[var(--border)] bg-[var(--surface-2)] px-3 py-1.5 text-[13px] font-medium text-[var(--text)]">
                  <CheckSquare className="size-4 text-[var(--accent)]" />
                  <span>Public</span>
                </div>
                <div className="inline-flex items-center gap-2 rounded-[6px] border border-[var(--border)] bg-[var(--surface-2)] px-3 py-1.5 text-[13px] font-medium text-[var(--text)]">
                  <CheckSquare className="size-4 text-[var(--accent)]" />
                  <span>Add a README file</span>
                </div>
              </div>

              <p className="text-[13px] leading-5 text-[var(--text-muted)]">
                Then come back here and continue.
              </p>
            </div>
          </li>
        </ol>
      </div>

      {/* Navigation row */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <StudioButton type="button" variant="ghost" onClick={onBack}>
          <ArrowLeft />
          <span>Back</span>
        </StudioButton>

        <StudioButton type="button" variant="primary" size="lg" onClick={onNext}>
          <span>Customize creature &amp; README</span>
          <ArrowRight />
        </StudioButton>
      </div>
    </div>
  );
}
