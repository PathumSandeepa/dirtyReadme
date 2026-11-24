"use client";

import { BookOpen, Moon, Sun } from "lucide-react";
import { cn } from "cn";
import { useWindowScrolled } from "../hooks/useWindowScrolled";
import { BrandLockup } from "../ui/BrandLockup";
import { StudioButton } from "../ui/StudioButton";

interface StudioHeaderProps {
  username: string;
  isDark: boolean;
  showRepoGuide?: boolean;
  onToggleTheme: () => void;
  onGoHome: () => void;
  onOpenRepoGuide: () => void;
}

/** Sticky 56px navigation bar shared by Studio steps using borderless Abyss and Paper tokens. */
export function StudioHeader({
  username,
  isDark,
  showRepoGuide = true,
  onToggleTheme,
  onGoHome,
  onOpenRepoGuide,
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
        <BrandLockup
          size="md"
          variant="studio"
          onClick={(event) => {
            event.preventDefault();
            onGoHome();
          }}
        />

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
        </div>
      </div>
    </header>
  );
}
