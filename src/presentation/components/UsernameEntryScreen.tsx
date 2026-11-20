"use client";

import { useState } from "react";
import { ArrowLeft, ArrowRight, RefreshCw } from "lucide-react";
import { parseGitHubUsername } from "@/infrastructure/github/githubClient";

interface UsernameEntryScreenProps {
  initialInput: string;
  loading: boolean;
  onBack: () => void;
  onNext: (rawInput: string) => Promise<void>;
}

export function UsernameEntryScreen({
  initialInput,
  loading,
  onBack,
  onNext,
}: UsernameEntryScreenProps) {
  const [inputValue, setInputValue] = useState(
    initialInput === "your-username" ? "" : initialInput
  );
  const [validationError, setValidationError] = useState<string | null>(null);

  const parsedPreview = parseGitHubUsername(inputValue);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!parsedPreview) {
      setValidationError(
        "Please enter your GitHub username or profile URL (for example: octocat or https://github.com/octocat)."
      );
      return;
    }
    setValidationError(null);
    await onNext(inputValue);
  };

  return (
    <div className="flex min-h-[calc(100vh-140px)] items-center justify-center px-4 py-10">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-lg rounded-3xl border border-slate-200 bg-white p-8 shadow-sm dark:border-[#363d4a] dark:bg-[#1e222a] sm:p-10"
      >
        <div className="space-y-2 text-center">
          <span className="inline-block rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-700 dark:bg-indigo-500/15 dark:text-indigo-300">
            Step 1 of 4
          </span>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
            Add GitHub Username or Profile URL
          </h2>
          <p className="text-sm text-slate-600 dark:text-slate-300">
            Enter your GitHub handle or profile link to load a clean template for your
            account.
          </p>
        </div>

        <div className="mt-7 space-y-3">
          <input
            type="text"
            autoFocus
            value={inputValue}
            onChange={(e) => {
              setInputValue(e.target.value);
              if (validationError) setValidationError(null);
            }}
            placeholder="octocat or https://github.com/octocat"
            className="w-full rounded-xl border border-slate-300 bg-slate-50 px-4 py-3.5 text-center text-base text-slate-900 outline-none transition focus:border-indigo-600 focus:bg-white focus:ring-2 focus:ring-indigo-600/15 dark:border-[#363d4a] dark:bg-[#272c36] dark:text-slate-100 dark:placeholder:text-slate-400 dark:focus:border-indigo-400"
          />

          {parsedPreview && (
            <p className="text-center text-xs text-slate-500 dark:text-slate-400">
              Profile target:{" "}
              <span className="font-mono font-semibold text-indigo-600 dark:text-indigo-300">
                @{parsedPreview}
              </span>{" "}
              ({parsedPreview}/{parsedPreview})
            </p>
          )}

          {validationError && (
            <p className="text-center text-xs font-medium text-rose-600 dark:text-rose-400">
              {validationError}
            </p>
          )}
        </div>

        <div className="mt-8 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={onBack}
            disabled={loading}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-5 py-3 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:opacity-50 dark:border-[#363d4a] dark:bg-[#272c36] dark:text-slate-200 dark:hover:bg-[#2f3642]"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </button>

          <button
            type="submit"
            disabled={loading}
            className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-indigo-700 disabled:opacity-60 dark:bg-indigo-500 dark:hover:bg-indigo-400"
          >
            {loading ? (
              <>
                <RefreshCw className="h-4 w-4 animate-spin" />
                Loading Profile...
              </>
            ) : (
              <>
                <span>Next</span>
                <ArrowRight className="h-4 w-4" />
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
