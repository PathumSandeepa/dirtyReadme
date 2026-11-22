"use client";

import { useState } from "react";
import { ArrowLeft, ArrowRight, Loader2, ShieldCheck } from "lucide-react";
import { parseGitHubUsername } from "@/infrastructure/github/githubClient";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { StudioButton } from "../studio/ui/StudioButton";
import { StudioField, StudioInput } from "../studio/ui/StudioInput";

interface UsernameEntryScreenProps {
  initialInput: string;
  loading: boolean;
  syncError?: string | null;
  onClearError?: () => void;
  onBack: () => void;
  onNext: (rawInput: string) => Promise<void>;
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

export function UsernameEntryScreen({
  initialInput,
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

  const parsedPreview = parseGitHubUsername(inputValue);
  const activeError = validationError || syncError || null;
  const isEmpty = !inputValue.trim();
  const isSubmitDisabled = loading || isEmpty;

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!parsedPreview) {
      setValidationError(
        "Enter a GitHub username or URL such as octocat or https://github.com/octocat."
      );
      return;
    }
    setValidationError(null);
    await onNext(inputValue);
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
          <span>Fetching profile...</span>
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
      <div className="mx-auto w-full max-w-[1120px] px-4 pt-[8vh] pb-12 sm:px-6 sm:pt-[13vh]">
        <div className="mx-auto flex w-full max-w-[520px] flex-col gap-4">
          <form
            onSubmit={handleSubmit}
            className="flex flex-col gap-6 rounded-[8px] border border-[var(--border)] bg-[var(--surface)] p-6 sm:p-8"
          >
            <div className="flex flex-col gap-2">
              <h1 className="text-[24px] leading-8 font-semibold tracking-tight text-[var(--text)]">
                Connect your GitHub profile
              </h1>
              <p className="text-[14px] leading-6 text-[var(--text-muted)]">
                We read your public language stats, commit counts and any
                existing Dynamic Creature setup from your profile repo.
              </p>
            </div>

            <StudioField
              label="GitHub username or profile URL"
              htmlFor="github-username-input"
              helper={
                parsedPreview && !activeError
                  ? `Examples: octocat or https://github.com/octocat · Target repo: ${parsedPreview}/${parsedPreview}`
                  : "Examples: octocat or https://github.com/octocat"
              }
              error={activeError}
            >
              <div className="relative">
                <GitHubMark className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-[var(--text-muted)]" />
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
                    className="border border-[var(--border)] bg-[var(--text)] text-[var(--bg)] shadow-[var(--studio-shadow-overlay)]"
                  >
                    Enter a GitHub username or profile URL to continue.
                  </TooltipContent>
                </Tooltip>
              ) : (
                continueBtn
              )}
            </div>
          </form>

          <div className="flex items-center gap-2 px-1 text-[13px] text-[var(--text-muted)]">
            <ShieldCheck className="size-4 shrink-0 text-[var(--accent)]" />
            <span>
              Runs fully in your browser. Read-only lookup through the public
              GitHub API.
            </span>
          </div>
        </div>
      </div>
    </TooltipProvider>
  );
}
