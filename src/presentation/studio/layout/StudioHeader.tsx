"use client";

import { BookOpen, Moon, RotateCcw, Sun } from "lucide-react";
import { cn } from "cn";
import { BRAND } from "@/config/brand";
import { useWindowScrolled } from "../hooks/useWindowScrolled";
import { BrandMark } from "../ui/BrandMark";
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

/** Sticky 56px navigation bar shared by Studio steps using borderless Abyss and Paper tokens. */
export function StudioHeader({
  username,
  isDark,
  showRepoGuide = true,
  onToggleTheme,
  onGoHome,
  onOpenRepoGuide,
  onRequestStartOver,
}: StudioHeaderProps) {
  const scrolled = useWindowScrolled(4);
  const trimmedUser = username.trim();
  const hasRealUser =
    Boolean(trimmedUser) && trimmedUser !== "your-username";

  return (
    <header
      className={cn(
        "sticky top-0 z-30 h-14 transition-[background-color,box-shadow] duration-150",
        scrolled
          ? "bg-[var(--bg)]/85 backdrop-blur-md shadow-[var(--shadow-float)]"
          : "bg-[var(--bg)]"
      )}
    >
      <div className="mx-auto flex h-full max-w-[1784px] items-center justify-between gap-2 px-4 sm:px-6">
        <button
          type="button"
          onClick={onGoHome}
          className="flex min-w-0 cursor-pointer items-center gap-2.5 rounded-[8px] py-1 pr-2 text-left transition-opacity duration-150 hover:opacity-85"
        >
          <BrandMark size={28} className="shrink-0" />
          <span className="truncate text-[14px] font-semibold tracking-[-0.02em] text-[var(--text)]">
            {BRAND.name}
          </span>
        </button>

        <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">
          {hasRealUser && (
            <span
              title={`GitHub user @${trimmedUser}`}
              className="studio-mono hidden max-w-[160px] truncate rounded-[8px] bg-[var(--surface-2)] px-2.5 py-1 text-[13px] text-[var(--text)] sm:inline-block"
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
              <span>Repo guide</span>
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
            className="text-[var(--text-2)] hover:text-[var(--danger)]"
          >
            <RotateCcw />
            <span className="hidden sm:inline">Start over</span>
            <span className="sm:hidden">Reset</span>
          </StudioButton>
        </div>
      </div>
    </header>
  );
}
