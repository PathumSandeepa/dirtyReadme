"use client";

import { ArrowLeft, ArrowRight, ExternalLink, FolderGit2 } from "lucide-react";

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

  return (
    <div className="flex min-h-[calc(100vh-140px)] items-center justify-center px-4 py-10">
      <div className="w-full max-w-2xl rounded-3xl border border-slate-200 bg-white p-8 shadow-sm dark:border-[#363d4a] dark:bg-[#1e222a] sm:p-10">
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600 dark:bg-indigo-500/15 dark:text-indigo-300">
            <FolderGit2 className="h-6 w-6" />
          </div>
          <div>
            <span className="inline-block rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-700 dark:bg-indigo-500/15 dark:text-indigo-300">
              Step 2 of 4 · Preparation Instructions
            </span>
            <h2 className="mt-2 text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
              Create Your Special GitHub Profile Repository
            </h2>
            <p className="mt-1 text-sm leading-relaxed text-slate-600 dark:text-slate-300">
              GitHub displays a custom README on your main profile only when a{" "}
              <strong className="font-semibold text-slate-900 dark:text-slate-100">
                public
              </strong>{" "}
              repository matches your exact username.
            </p>
          </div>
        </div>

        {profileRepoExists && (
          <div className="mt-6 rounded-2xl border border-emerald-200 bg-emerald-50 px-5 py-4 text-sm text-emerald-900 dark:border-emerald-700/50 dark:bg-emerald-950/30 dark:text-emerald-200">
            Good news: <code className="font-semibold">{safeUsername}/{safeUsername}</code>{" "}
            already exists on GitHub. You can skip ahead or double-check it is set to{" "}
            <strong>Public</strong>.
          </div>
        )}

        <ol className="mt-7 space-y-4">
          <li className="rounded-2xl border border-slate-200 bg-slate-50 p-5 dark:border-[#363d4a] dark:bg-[#272c36]">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <div className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                  1. Open the New Repository page on GitHub
                </div>
                <p className="mt-1 text-xs text-slate-600 dark:text-slate-300">
                  Make sure you are signed in as{" "}
                  <code className="font-semibold">@{safeUsername}</code>.
                </p>
              </div>
              <a
                href="https://github.com/new"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 rounded-xl border border-slate-300 bg-white px-4 py-2 text-xs font-semibold text-slate-800 transition hover:bg-slate-100 dark:border-[#454e5e] dark:bg-[#1e222a] dark:text-slate-100 dark:hover:bg-[#2f3642]"
              >
                <span>Open github.com/new</span>
                <ExternalLink className="h-3.5 w-3.5" />
              </a>
            </div>
          </li>

          <li className="rounded-2xl border border-slate-200 bg-slate-50 p-5 dark:border-[#363d4a] dark:bg-[#272c36]">
            <div className="text-sm font-semibold text-slate-900 dark:text-slate-100">
              2. Name the repository identically to your username
            </div>
            <div className="mt-2.5 flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 font-mono text-sm text-slate-800 dark:border-[#363d4a] dark:bg-[#1e222a] dark:text-slate-100">
              <span className="text-slate-400 dark:text-slate-500">
                {safeUsername} /
              </span>
              <span className="font-semibold text-indigo-600 dark:text-indigo-300">
                {safeUsername}
              </span>
            </div>
            <p className="mt-2 text-xs text-slate-600 dark:text-slate-300">
              GitHub will show a banner confirming this is a special repository whose
              README.md appears on your public GitHub profile.
            </p>
          </li>

          <li className="rounded-2xl border border-slate-200 bg-slate-50 p-5 dark:border-[#363d4a] dark:bg-[#272c36]">
            <div className="text-sm font-semibold text-slate-900 dark:text-slate-100">
              3. Select Public, tick &ldquo;Add a README file&rdquo;, and click Create
              repository
            </div>
            <p className="mt-1 text-xs text-slate-600 dark:text-slate-300">
              No forms or tokens are needed on this step. Once your repository exists, click{" "}
              <strong>Next</strong> below to customize your creature and README.
            </p>
          </li>
        </ol>

        <div className="mt-8 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={onBack}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-5 py-3 text-sm font-medium text-slate-700 transition hover:bg-slate-50 dark:border-[#363d4a] dark:bg-[#272c36] dark:text-slate-200 dark:hover:bg-[#2f3642]"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </button>

          <button
            type="button"
            onClick={onNext}
            className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-400"
          >
            <span>Next: Customize Creature &amp; README</span>
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
