"use client";

import { BookOpen, Cpu, Moon, RotateCcw, Sun } from "lucide-react";
import { StudioButton } from "../ui/StudioButton";

interface StudioHeaderProps {
  username: string;
  isDark: boolean;
  showRepoGuide?: boolean;
  onToggleTheme: () => void;
  onGoHome: () => void;
  onOpenRepoGuide: () => void;
  onRequestStartOver: () => void;
}

/** Sticky 56px developer-tool top bar shared by the Studio steps. */
export function StudioHeader({
  username,
  isDark,
  showRepoGuide = true,
  onToggleTheme,
  onGoHome,
  onOpenRepoGuide,
  onRequestStartOver,
}: StudioHeaderProps) {
  const trimmedUser = username.trim();
  const hasRealUser =
    Boolean(trimmedUser) && trimmedUser !== "your-username";

  return (
    <header className="sticky top-0 z-30 h-14 border-b border-[var(--border)] bg-[var(--surface)]">
      <div className="mx-auto flex h-full max-w-[1784px] items-center justify-between gap-2 px-4 sm:px-6">
        <button
          type="button"
          onClick={onGoHome}
          className="flex min-w-0 cursor-pointer items-center gap-2.5 rounded-[6px] py-1 text-left transition-[color,opacity] duration-150 hover:opacity-85"
        >
          <span className="flex size-7 shrink-0 items-center justify-center rounded-[6px] border border-[var(--border)] bg-[var(--surface-2)] text-[var(--accent)]">
            <Cpu className="size-4" />
          </span>
          <span className="truncate text-[14px] font-semibold tracking-tight text-[var(--text)]">
            dynamic-creature
          </span>
        </button>

        <div className="flex shrink-0 items-center gap-1 sm:gap-2">
          {hasRealUser && (
            <span
              title={`GitHub user @${trimmedUser}`}
              className="studio-mono hidden max-w-[160px] truncate rounded-[6px] border border-[var(--border)] bg-[var(--surface-2)] px-2.5 py-1 text-[13px] text-[var(--text)] sm:inline-block"
            >
              @{trimmedUser}
            </span>
          )}

          {showRepoGuide && (
            <StudioButton
              variant="ghost"
              size="sm"
              onClick={onOpenRepoGuide}
              className="hidden sm:inline-flex"
            >
              <BookOpen />
              <span>Repo Guide</span>
            </StudioButton>
          )}

          <StudioButton
            variant="ghost"
            size="sm"
            onClick={onToggleTheme}
            aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
          >
            {isDark ? <Sun /> : <Moon />}
            <span>{isDark ? "Light" : "Dark"}</span>
          </StudioButton>

          <StudioButton
            variant="ghost"
            size="sm"
            onClick={onRequestStartOver}
            className="text-[var(--text-muted)] hover:text-[var(--danger)]"
          >
            <RotateCcw />
            <span className="hidden sm:inline">Start Over</span>
            <span className="sm:hidden">Reset</span>
          </StudioButton>
        </div>
      </div>
    </header>
  );
}
