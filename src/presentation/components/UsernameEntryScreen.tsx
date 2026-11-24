"use client";

import { useEffect, useRef, useState } from "react";
import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
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
import { BRAND } from "@/config/brand";
import { StudioButton } from "../studio/ui/StudioButton";
import { StudioField, StudioInput } from "../studio/ui/StudioInput";

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

const RECENT_USERNAMES_KEY = "dirtyreadme_recent_usernames_v1";
const MAX_RECENT_USERNAMES = 3;

function readRecentUsernames(): string[] {
  try {
    const raw = window.localStorage.getItem(RECENT_USERNAMES_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed
      .filter((item): item is string => typeof item === "string" && item.trim().length > 0)
      .slice(0, MAX_RECENT_USERNAMES);
  } catch {
    return [];
  }
}

function writeRecentUsernames(list: string[]): void {
  try {
    if (list.length === 0) {
      window.localStorage.removeItem(RECENT_USERNAMES_KEY);
      return;
    }
    window.localStorage.setItem(
      RECENT_USERNAMES_KEY,
      JSON.stringify(list.slice(0, MAX_RECENT_USERNAMES))
    );
  } catch {
    // Ignore storage quota or private browsing errors.
  }
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
 * Step 1 Connect screen with full-height two-panel layout, recent usernames, and floating glass profile card.
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
  const [recentUsernames, setRecentUsernames] = useState<string[]>([]);
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
    const timer = window.setTimeout(() => {
      setRecentUsernames(readRecentUsernames());
    }, 0);
    return () => window.clearTimeout(timer);
  }, []);

  const recordRecentUsername = (username: string) => {
    const clean = username.trim();
    if (!clean) return;
    setRecentUsernames((prev) => {
      const next = [
        clean,
        ...prev.filter((item) => item.toLowerCase() !== clean.toLowerCase()),
      ].slice(0, MAX_RECENT_USERNAMES);
      writeRecentUsernames(next);
      return next;
    });
  };

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
        recordRecentUsername(snap.username);
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
    if (readySnapshot) {
      recordRecentUsername(readySnapshot.username);
    }
    await onNext(inputValue, readySnapshot);
  };

  const handleClearRecent = () => {
    setRecentUsernames([]);
    writeRecentUsernames([]);
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
      <div className="mx-auto flex min-h-[calc(100vh-156px)] w-full max-w-[1200px] items-center px-4 pt-8 pb-16 sm:px-6">
        <div className="grid w-full items-center gap-8 min-[900px]:grid-cols-[46fr_54fr] min-[900px]:gap-10">
          {/* Left Panel (46%) */}
          <div className="flex min-w-0 flex-col gap-6">
            <div className="flex flex-col gap-3">
              <span className="text-[12px] font-semibold tracking-[0.04em] text-[var(--text-3)] uppercase">
                Step 1 of 4
              </span>
              <h1 className="text-[28px] leading-[1.18] font-semibold tracking-[-0.025em] text-[var(--text)] sm:text-[32px]">
                Connect your GitHub profile
              </h1>
              <p className="text-[15px] leading-6 text-[var(--text-2)]">
                {BRAND.name} reads your public language stats and commit counts
                to populate your profile. It also checks your profile repository
                for any saved README setup.
              </p>
            </div>

            <form
              onSubmit={handleSubmit}
              className="flex flex-col gap-5 rounded-[14px] bg-[var(--surface)] p-6 sm:p-8"
            >
              <StudioField
                label="GitHub username or profile URL"
                htmlFor="github-username-input"
                helper="Try octocat or https://github.com/octocat"
                error={activeError}
              >
                <div className="relative">
                  <GitHubMark className="pointer-events-none absolute top-1/2 left-4 size-4 -translate-y-1/2 text-[var(--text-2)]" />
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
                    className="h-[52px] pl-11 text-[15px]"
                  />
                </div>
              </StudioField>

              {recentUsernames.length > 0 && (
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-[12px] text-[var(--text-3)]">
                    Recent
                  </span>
                  {recentUsernames.map((recent) => (
                    <button
                      key={recent}
                      type="button"
                      onClick={() => {
                        setInputValue(recent);
                        if (validationError) setValidationError(null);
                        if (syncError) onClearError?.();
                      }}
                      className="studio-mono cursor-pointer rounded-full bg-[var(--surface-2)] px-3 py-1 text-[12px] font-medium text-[var(--text)] transition-colors duration-150 hover:bg-[var(--surface-3)]"
                    >
                      {recent}
                    </button>
                  ))}
                  <button
                    type="button"
                    onClick={handleClearRecent}
                    className="cursor-pointer px-1.5 py-1 text-[12px] font-medium text-[var(--text-3)] transition-colors duration-150 hover:text-[var(--text)]"
                  >
                    Clear
                  </button>
                </div>
              )}

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

          {/* Right Panel (54%): Wallpaper + Floating Glass Profile Card */}
          <div className="min-w-0">
            <div className="studio-wallpaper flex items-center justify-center rounded-[20px] p-4 sm:p-7 min-[900px]:p-10">
              <div
                aria-live="polite"
                data-testid="connect-preview-card"
                className="flex w-full min-w-0 flex-col gap-6 overflow-hidden rounded-[16px] bg-[var(--surface)]/80 p-5 shadow-[var(--shadow-float)] backdrop-blur-xl transition-all duration-150 sm:p-7"
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
                      <SamplePlaceholderCard muted />
                    </div>
                  )}

                {!(previewState.status === "loading" || loading) &&
                  previewState.status === "idle" && <SamplePlaceholderCard />}
              </div>
            </div>
          </div>
        </div>
      </div>
    </TooltipProvider>
  );
}

function SamplePlaceholderCard({ muted = false }: { muted?: boolean }) {
  return (
    <div
      className={
        muted
          ? "flex flex-col gap-5 opacity-75 transition-opacity duration-150"
          : "flex flex-col gap-5 transition-opacity duration-150"
      }
    >
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3.5">
          <div className="size-12 shrink-0 rounded-full bg-[var(--surface-2)] sm:size-14" />
          <div className="flex flex-col gap-2">
            <div className="h-4 w-32 rounded-[6px] bg-[var(--surface-2)]" />
            <div className="h-3 w-20 rounded-[6px] bg-[var(--surface-2)]" />
          </div>
        </div>
        <span className="rounded-full bg-[var(--surface-2)] px-2.5 py-1 text-[11px] font-medium text-[var(--text-3)]">
          Sample profile
        </span>
      </div>

      <div className="flex flex-col gap-2">
        <div className="h-3.5 w-full rounded-[6px] bg-[var(--surface-2)]" />
        <div className="h-3.5 w-4/5 rounded-[6px] bg-[var(--surface-2)]" />
      </div>

      <div className="flex flex-wrap gap-2">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-[var(--surface-2)] px-3 py-1 text-[12px] text-[var(--text-2)]">
          <span className="size-2 rounded-full bg-[#3178C6]" />
          <span>TypeScript</span>
        </span>
        <span className="inline-flex items-center gap-1.5 rounded-full bg-[var(--surface-2)] px-3 py-1 text-[12px] text-[var(--text-2)]">
          <span className="size-2 rounded-full bg-[#3572A5]" />
          <span>Python</span>
        </span>
        <span className="inline-flex items-center gap-1.5 rounded-full bg-[var(--surface-2)] px-3 py-1 text-[12px] text-[var(--text-2)]">
          <span className="size-2 rounded-full bg-[#00ADD8]" />
          <span>Go</span>
        </span>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="flex flex-col gap-1.5 rounded-[12px] bg-[var(--surface-2)] p-3.5">
          <span className="text-[11px] text-[var(--text-3)]">
            Commits this year
          </span>
          <div className="h-5 w-16 rounded-[6px] bg-[var(--surface-3)]" />
        </div>
        <div className="flex flex-col gap-1.5 rounded-[12px] bg-[var(--surface-2)] p-3.5">
          <span className="text-[11px] text-[var(--text-3)]">
            All time commits
          </span>
          <div className="h-5 w-20 rounded-[6px] bg-[var(--surface-3)]" />
        </div>
      </div>

      <p className="text-[12px] text-[var(--text-3)]">
        Enter a username to load live stats and README repository status.
      </p>
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
    <div
      data-testid="connect-live-profile"
      className="flex min-w-0 flex-col gap-5 transition-opacity duration-150"
    >
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
      </div>

      <p className="text-[14px] leading-6 break-words text-[var(--text-2)]">
        {snapshot.bio ||
          "Public GitHub profile loaded and ready to customize."}
      </p>

      <div className="flex flex-col gap-2">
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

      <div className="flex items-center gap-2 text-[12px] font-medium">
        {snapshot.profileRepoExists ? (
          <>
            <CheckCircle2 className="size-4 shrink-0 text-[var(--tide)]" />
            <span className="text-[var(--tide)]">README repository found</span>
          </>
        ) : (
          <span className="text-[var(--text-2)]">No README repository yet</span>
        )}
      </div>
    </div>
  );
}
