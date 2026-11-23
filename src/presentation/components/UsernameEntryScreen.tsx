"use client";

import { useEffect, useRef, useState } from "react";
import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  GitCommitHorizontal,
  Loader2,
  ShieldCheck,
} from "lucide-react";
import {
  fetchGitHubProfileSnapshot,
  parseGitHubUsername,
  type GitHubProfileSnapshot,
} from "@/infrastructure/github/githubClient";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { StudioButton } from "../studio/ui/StudioButton";
import { StudioField, StudioInput } from "../studio/ui/StudioInput";
import { HOME_FACTS, showcaseAsset } from "./home/homeData";

interface UsernameEntryScreenProps {
  initialInput: string;
  initialSnapshot?: GitHubProfileSnapshot | null;
  loading: boolean;
  syncError?: string | null;
  onClearError?: () => void;
  onBack: () => void;
  onNext: (
    rawInput: string,
    preloadedSnapshot?: GitHubProfileSnapshot | null
  ) => Promise<void>;
}

function GitHubMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      className={className}
      fill="currentColor"
    >
      <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
    </svg>
  );
}

/**
 * Step 1 Connect screen with two-column layout and debounced live GitHub profile card.
 */
export function UsernameEntryScreen({
  initialInput,
  initialSnapshot = null,
  loading,
  syncError,
  onClearError,
  onBack,
  onNext,
}: UsernameEntryScreenProps) {
  const [inputValue, setInputValue] = useState(
    initialInput === "your-username" ? "" : initialInput
  );
  const [validationError, setValidationError] = useState<string | null>(null);
  const [previewState, setPreviewState] = useState<{
    status: "idle" | "loading" | "found" | "error";
    snapshot: GitHubProfileSnapshot | null;
    error: string | null;
  }>(() => {
    const startUser = parseGitHubUsername(
      initialInput === "your-username" ? "" : initialInput
    );
    if (
      startUser &&
      initialSnapshot &&
      initialSnapshot.username.toLowerCase() === startUser.toLowerCase()
    ) {
      return { status: "found", snapshot: initialSnapshot, error: null };
    }
    return { status: "idle", snapshot: null, error: null };
  });

  const lookupSeqRef = useRef(0);
  const parsedPreview = parseGitHubUsername(inputValue);
  const activeError =
    validationError ||
    syncError ||
    (previewState.status === "error" ? previewState.error : null);
  const isEmpty = !inputValue.trim();
  const isSubmitDisabled = loading || isEmpty;

  useEffect(() => {
    if (!parsedPreview) {
      lookupSeqRef.current += 1;
      const timer = window.setTimeout(() => {
        setPreviewState({ status: "idle", snapshot: null, error: null });
      }, 0);
      return () => window.clearTimeout(timer);
    }

    if (
      initialSnapshot &&
      initialSnapshot.username.toLowerCase() === parsedPreview.toLowerCase()
    ) {
      const timer = window.setTimeout(() => {
        setPreviewState({
          status: "found",
          snapshot: initialSnapshot,
          error: null,
        });
      }, 0);
      return () => window.clearTimeout(timer);
    }

    const requestId = ++lookupSeqRef.current;
    const timer = window.setTimeout(async () => {
      setPreviewState({ status: "loading", snapshot: null, error: null });
      try {
        const snap = await fetchGitHubProfileSnapshot(parsedPreview);
        if (lookupSeqRef.current !== requestId) return;
        setPreviewState({ status: "found", snapshot: snap, error: null });
      } catch (err) {
        if (lookupSeqRef.current !== requestId) return;
        const message =
          err instanceof TypeError
            ? "Network error while contacting GitHub. Check your connection and try again."
            : err instanceof Error
              ? err.message
              : "Failed to fetch GitHub profile.";
        setPreviewState({ status: "error", snapshot: null, error: message });
      }
    }, 550);

    return () => window.clearTimeout(timer);
  }, [parsedPreview, initialSnapshot]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!parsedPreview) {
      setValidationError(
        "Enter a GitHub username or profile URL such as octocat."
      );
      return;
    }
    setValidationError(null);
    const readySnapshot =
      previewState.status === "found" &&
      previewState.snapshot &&
      previewState.snapshot.username.toLowerCase() ===
        parsedPreview.toLowerCase()
        ? previewState.snapshot
        : null;
    await onNext(inputValue, readySnapshot);
  };

  const continueBtn = (
    <StudioButton
      type="submit"
      variant="primary"
      size="lg"
      disabled={isSubmitDisabled}
    >
      {loading ? (
        <>
          <Loader2 className="animate-spin" />
          <span>Fetching profile</span>
        </>
      ) : (
        <>
          <span>Continue</span>
          <ArrowRight />
        </>
      )}
    </StudioButton>
  );

  return (
    <TooltipProvider delay={150}>
      <div className="mx-auto w-full max-w-[1120px] px-4 py-10 sm:px-6 sm:py-16">
        <div className="grid items-start gap-8 lg:grid-cols-12 lg:gap-10">
          {/* Left Form Column */}
          <div className="flex min-w-0 flex-col gap-6 lg:col-span-6">
            <div className="flex flex-col gap-3">
              <h1 className="text-[28px] leading-[1.18] font-semibold tracking-[-0.025em] text-[var(--text)] sm:text-[32px]">
                Connect your GitHub profile
              </h1>
              <p className="text-[15px] leading-6 text-[var(--text-2)]">
                ReadmeForge reads your public language stats and commit counts to
                shape your creature. It also checks your profile repository for
                any saved setup so you can continue editing cleanly.
              </p>
            </div>

            <form
              onSubmit={handleSubmit}
              className="flex flex-col gap-6 rounded-[12px] bg-[var(--surface)] p-6 sm:p-8"
            >
              <StudioField
                label="GitHub username or profile URL"
                htmlFor="github-username-input"
                helper="Try octocat or https://github.com/octocat"
                error={activeError}
              >
                <div className="relative">
                  <GitHubMark className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-[var(--text-2)]" />
                  <StudioInput
                    id="github-username-input"
                    inputSize="lg"
                    autoFocus
                    value={inputValue}
                    invalid={Boolean(activeError)}
                    onChange={(e) => {
                      setInputValue(e.target.value);
                      if (validationError) setValidationError(null);
                      if (syncError) onClearError?.();
                    }}
                    placeholder="octocat or https://github.com/octocat"
                    className="pl-10"
                  />
                </div>
              </StudioField>

              {parsedPreview && !activeError && (
                <div className="flex flex-wrap items-center justify-between gap-2 rounded-[8px] bg-[var(--surface-2)] px-3.5 py-2.5 text-[13px]">
                  <span className="text-[var(--text-2)]">
                    Target repository
                  </span>
                  <code className="studio-mono min-w-0 font-medium break-all text-[var(--text)]">
                    github.com/{parsedPreview}/{parsedPreview}
                  </code>
                </div>
              )}

              <div className="flex items-center justify-between gap-3 pt-1">
                <StudioButton
                  type="button"
                  variant="ghost"
                  onClick={onBack}
                  disabled={loading}
                >
                  <ArrowLeft />
                  <span>Back</span>
                </StudioButton>

                {isEmpty && !loading ? (
                  <Tooltip>
                    <TooltipTrigger
                      render={
                        <span tabIndex={0} className="inline-flex">
                          {continueBtn}
                        </span>
                      }
                    />
                    <TooltipContent
                      data-app="studio"
                      className="border-0 bg-[var(--text)] text-[var(--bg)] shadow-[var(--shadow-float)]"
                    >
                      Enter a GitHub username or profile URL to continue.
                    </TooltipContent>
                  </Tooltip>
                ) : (
                  continueBtn
                )}
              </div>
            </form>

            <div className="flex items-center gap-2.5 px-1 text-[13px] text-[var(--text-2)]">
              <ShieldCheck className="size-4 shrink-0 text-[var(--tide)]" />
              <span>
                Runs in your browser. Read only lookup through the public GitHub
                API.
              </span>
            </div>
          </div>

          {/* Right Glass Profile Preview Card */}
          <div className="min-w-0 lg:col-span-6">
            <div
              aria-live="polite"
              data-testid="connect-preview-card"
              className="flex min-w-0 flex-col gap-6 overflow-hidden rounded-[16px] bg-[var(--surface)]/80 p-6 shadow-[var(--shadow-float)] backdrop-blur-xl sm:p-8"
            >
              {(previewState.status === "loading" || loading) && (
                <div
                  data-testid="connect-preview-skeleton"
                  className="flex flex-col gap-6"
                >
                  <div className="flex items-center gap-4">
                    <div className="size-16 shrink-0 animate-pulse rounded-full bg-[var(--surface-2)]" />
                    <div className="flex flex-1 flex-col gap-2">
                      <div className="h-5 w-44 animate-pulse rounded-[6px] bg-[var(--surface-2)]" />
                      <div className="h-4 w-28 animate-pulse rounded-[6px] bg-[var(--surface-2)]" />
                    </div>
                  </div>
                  <div className="flex flex-col gap-2">
                    <div className="h-4 w-full animate-pulse rounded-[6px] bg-[var(--surface-2)]" />
                    <div className="h-4 w-3/4 animate-pulse rounded-[6px] bg-[var(--surface-2)]" />
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <div className="h-7 w-24 animate-pulse rounded-full bg-[var(--surface-2)]" />
                    <div className="h-7 w-24 animate-pulse rounded-full bg-[var(--surface-2)]" />
                    <div className="h-7 w-20 animate-pulse rounded-full bg-[var(--surface-2)]" />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="h-20 animate-pulse rounded-[12px] bg-[var(--surface-2)]" />
                    <div className="h-20 animate-pulse rounded-[12px] bg-[var(--surface-2)]" />
                  </div>
                </div>
              )}

              {!(previewState.status === "loading" || loading) &&
                previewState.status === "found" &&
                previewState.snapshot && (
                  <LiveSnapshotPreviewCard snapshot={previewState.snapshot} />
                )}

              {!(previewState.status === "loading" || loading) &&
                previewState.status === "error" && (
                  <div className="flex flex-col gap-5">
                    <div className="flex items-start gap-3 rounded-[12px] bg-[var(--danger-soft)] p-4 text-[13px] leading-5 text-[var(--text)]">
                      <AlertCircle className="mt-0.5 size-4 shrink-0 text-[var(--danger)]" />
                      <div className="flex flex-col gap-1">
                        <span className="font-semibold text-[var(--danger)]">
                          Profile lookup did not succeed
                        </span>
                        <span className="text-[var(--text-2)]">
                          {previewState.error}
                        </span>
                      </div>
                    </div>
                    <SampleTulkunPreviewCard muted />
                  </div>
                )}

              {!(previewState.status === "loading" || loading) &&
                previewState.status === "idle" && <SampleTulkunPreviewCard />}
            </div>
          </div>
        </div>
      </div>
    </TooltipProvider>
  );
}

function SampleTulkunPreviewCard({ muted = false }: { muted?: boolean }) {
  return (
    <div className={muted ? "flex flex-col gap-5 opacity-75" : "flex flex-col gap-5"}>
      <div className="flex items-center justify-between gap-3">
        <span className="text-[12px] font-medium tracking-[0.04em] text-[var(--text-3)] uppercase">
          Sample preview
        </span>
        <span className="inline-flex items-center gap-1.5 rounded-full bg-[var(--ember-soft)] px-2.5 py-1 text-[12px] font-medium text-[var(--ember)]">
          Stage 4 Mature
        </span>
      </div>

      <div className="overflow-hidden rounded-[12px] bg-[#0d1117] p-3">
        <img
          src={showcaseAsset("hero-tulkun.webp")}
          alt="Animated Pixel Tulkun banner preview"
          className="aspect-2/1 w-full rounded-[6px] object-contain"
        />
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          {HOME_FACTS.sampleLanguages.map((lang) => (
            <span
              key={lang.name}
              className="inline-flex items-center gap-1.5 rounded-full bg-[var(--surface-2)] px-2.5 py-1 text-[12px] text-[var(--text)]"
            >
              <span
                className="size-2 rounded-full"
                style={{ backgroundColor: lang.color }}
              />
              <span>{lang.name}</span>
            </span>
          ))}
        </div>

        <span className="studio-mono inline-flex items-center gap-1.5 text-[12px] font-medium text-[var(--text-2)] tabular-nums">
          <GitCommitHorizontal className="size-3.5 text-[var(--ember)]" />
          <span>{HOME_FACTS.sampleCommits.toLocaleString("en-US")} commits</span>
        </span>
      </div>
    </div>
  );
}

function LiveSnapshotPreviewCard({
  snapshot,
}: {
  snapshot: GitHubProfileSnapshot;
}) {
  const topLanguages = snapshot.languages.slice(0, 5);

  return (
    <div data-testid="connect-live-profile" className="flex min-w-0 flex-col gap-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex min-w-0 items-center gap-4">
          <img
            src={snapshot.avatarUrl}
            alt={snapshot.displayName}
            className="size-14 shrink-0 rounded-full bg-[var(--surface-2)] object-cover sm:size-16"
          />
          <div className="flex min-w-0 flex-col gap-0.5">
            <h2 className="truncate text-[18px] leading-6 font-semibold tracking-[-0.02em] text-[var(--text)]">
              {snapshot.displayName}
            </h2>
            <span className="studio-mono truncate text-[13px] text-[var(--text-2)]">
              @{snapshot.username}
            </span>
          </div>
        </div>

        <span
          className={
            snapshot.profileRepoExists
              ? "inline-flex shrink-0 items-center gap-1.5 rounded-full bg-[var(--tide-soft)] px-2.5 py-1 text-[12px] font-medium text-[var(--tide)]"
              : "inline-flex shrink-0 items-center gap-1.5 rounded-full bg-[var(--surface-2)] px-2.5 py-1 text-[12px] font-medium text-[var(--text-2)]"
          }
        >
          {snapshot.profileRepoExists ? (
            <>
              <CheckCircle2 className="size-3.5" />
              <span>Profile repo found</span>
            </>
          ) : (
            <span>Ready to set up</span>
          )}
        </span>
      </div>

      <p className="text-[14px] leading-6 break-words text-[var(--text-2)]">
        {snapshot.bio ||
          "Public GitHub profile loaded and ready to customize."}
      </p>

      <div className="flex flex-col gap-2.5">
        <span className="text-[12px] font-medium text-[var(--text-3)]">
          Top public languages
        </span>
        <div className="flex flex-wrap gap-2">
          {topLanguages.map((lang) => (
            <span
              key={lang.name}
              className="inline-flex items-center gap-2 rounded-full bg-[var(--surface-2)] px-3 py-1 text-[13px] text-[var(--text)]"
            >
              <span
                className="size-2.5 rounded-full"
                style={{ backgroundColor: lang.color }}
              />
              <span className="font-medium">{lang.name}</span>
              {typeof lang.share === "number" && (
                <span className="studio-mono text-[12px] text-[var(--text-2)] tabular-nums">
                  {lang.share}%
                </span>
              )}
            </span>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="flex flex-col gap-1 rounded-[12px] bg-[var(--surface-2)] p-4">
          <span className="text-[12px] text-[var(--text-2)]">
            Commits this year
          </span>
          <span className="studio-mono text-[20px] font-semibold text-[var(--text)] tabular-nums">
            {snapshot.annualCommits.toLocaleString("en-US")}
          </span>
        </div>
        <div className="flex flex-col gap-1 rounded-[12px] bg-[var(--surface-2)] p-4">
          <span className="text-[12px] text-[var(--text-2)]">
            All time commits
          </span>
          <span className="studio-mono text-[20px] font-semibold text-[var(--ember)] tabular-nums">
            {snapshot.allTimeCommits.toLocaleString("en-US")}
          </span>
        </div>
      </div>

      <p className="text-[12px] leading-5 text-[var(--text-3)]">
        {snapshot.sourceNote}
      </p>
    </div>
  );
}
