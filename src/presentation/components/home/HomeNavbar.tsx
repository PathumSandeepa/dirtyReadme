"use client";

import { useEffect, useState } from "react";
import { ArrowRight, Menu, X } from "lucide-react";
import { cn } from "cn";
import { BRAND } from "@/config/brand";
import { useWindowScrolled } from "@/presentation/studio/hooks/useWindowScrolled";
import { useDockMagnification } from "./useDockMagnification";
import { useReducedMotion } from "./useReducedMotion";

interface HomeNavbarProps {
  onStartBuilding: () => void;
}

const NAV_LINKS = [
  { id: "editor", label: "Editor" },
  { id: "templates", label: "Templates" },
  { id: "stack", label: "Stack" },
  { id: "creatures", label: "Creatures" },
  { id: "images", label: "Images" },
  { id: "privacy", label: "Privacy" },
  { id: "open-source", label: "Open source" },
] as const;

const DOCK_TILE_COLORS = [
  "#8B5CF6",
  "#06B6D4",
  "#22C55E",
  "#A855F7",
  "#EC4899",
  "#F59E0B",
] as const;

const LOGO_WORD =
  BRAND.name.length > 8
    ? (BRAND.name.match(/^[A-Z][a-z]+/)?.[0] ?? BRAND.name.slice(0, 6))
    : BRAND.name;

const LOGO_TILES = LOGO_WORD.toUpperCase()
  .split("")
  .map((char, index) => ({
    char,
    color: DOCK_TILE_COLORS[index % DOCK_TILE_COLORS.length],
    hasDot: index === 0 || index === 2 || index === 4,
  }));

function GitHubIcon({ className }: { className?: string }) {
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

export function HomeNavbar({ onStartBuilding }: HomeNavbarProps) {
  const scrolled = useWindowScrolled(8);
  const reducedMotion = useReducedMotion();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeId, setActiveId] = useState<string>("");

  const logoDock = useDockMagnification({
    maxScale: 1.36,
    radius: 84,
    lift: 4,
    disabled: reducedMotion,
  });

  useEffect(() => {
    if (typeof IntersectionObserver === "undefined") return;
    const elements = NAV_LINKS.map((item) =>
      document.getElementById(item.id)
    ).filter((el): el is HTMLElement => Boolean(el));
    if (elements.length === 0) return;

    const visibleMap = new Map<string, number>();

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            visibleMap.set(entry.target.id, entry.intersectionRatio);
          } else {
            visibleMap.delete(entry.target.id);
          }
        }
        let bestId = "";
        let bestRatio = -1;
        for (const item of NAV_LINKS) {
          const ratio = visibleMap.get(item.id);
          if (ratio !== undefined && ratio > bestRatio) {
            bestRatio = ratio;
            bestId = item.id;
          }
        }
        if (bestId) {
          setActiveId(bestId);
        }
      },
      {
        rootMargin: "-96px 0px -45% 0px",
        threshold: [0.05, 0.25, 0.5],
      }
    );

    for (const el of elements) {
      observer.observe(el);
    }

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!mobileMenuOpen) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setMobileMenuOpen(false);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [mobileMenuOpen]);

  const scrollToSection = (sectionId: string) => {
    const target = document.getElementById(sectionId);
    if (!target) return;
    const top = target.getBoundingClientRect().top + window.scrollY - 96;
    window.scrollTo({
      top: Math.max(0, top),
      behavior: reducedMotion ? "auto" : "smooth",
    });
  };

  return (
    <>
      <header
        className={cn(
          "sticky top-0 z-40 h-[72px] transition-[background-color,border-color,backdrop-filter] duration-200",
          scrolled
            ? "border-b border-[var(--home-line)] bg-[rgba(5,5,5,0.78)] backdrop-blur-xl"
            : "border-b border-transparent bg-transparent"
        )}
      >
        <div className="mx-auto flex h-full max-w-[1240px] items-center justify-between gap-4 px-4 sm:px-6">
          {/* Magnifying glass dock brand logo */}
          <a
            href="#top"
            aria-label={BRAND.name}
            onClick={(event) => {
              event.preventDefault();
              window.scrollTo({
                top: 0,
                behavior: reducedMotion ? "auto" : "smooth",
              });
            }}
            onPointerMove={logoDock.onPointerMove}
            onPointerLeave={logoDock.onPointerLeave}
            className="home-glass inline-flex min-h-[44px] shrink-0 items-center gap-1 rounded-[14px] px-2.5 py-1.5"
          >
            {LOGO_TILES.map((tile, index) => (
              <span
                key={`${tile.char}-${index}`}
                className="flex flex-col items-center gap-[3px]"
              >
                <span
                  ref={logoDock.registerItem(index)}
                  style={{
                    backgroundColor: tile.color,
                    animationDelay: `${index * 60}ms`,
                  }}
                  className="home-dock-tile-pop home-display flex size-[26px] origin-bottom items-center justify-center rounded-[8px] text-[13px] font-extrabold text-white shadow-sm transition-transform duration-150 ease-out will-change-transform select-none"
                >
                  {tile.char}
                </span>
                <span
                  aria-hidden="true"
                  className={cn(
                    "size-[3px] rounded-full",
                    tile.hasDot ? "bg-white/80" : "bg-transparent"
                  )}
                />
              </span>
            ))}
          </a>

          {/* Center mono uppercase navigation */}
          <nav
            aria-label="Primary navigation"
            className="hidden items-center gap-1 min-[900px]:flex"
          >
            {NAV_LINKS.map((item) => {
              const isActive = activeId === item.id;
              return (
                <a
                  key={item.id}
                  href={`#${item.id}`}
                  onClick={(event) => {
                    event.preventDefault();
                    scrollToSection(item.id);
                  }}
                  className={cn(
                    "home-nav-link rounded-[10px] px-2.5 py-2 transition-colors duration-150",
                    isActive
                      ? "text-white"
                      : "text-[var(--home-text-2)] hover:text-white"
                  )}
                >
                  {item.label}
                </a>
              );
            })}
          </nav>

          {/* Right actions */}
          <div className="flex shrink-0 items-center gap-2.5">
            <a
              href={BRAND.repoUrl}
              target="_blank"
              rel="noreferrer"
              aria-label="Open GitHub repository"
              className="home-glass inline-flex size-11 items-center justify-center rounded-full text-[var(--home-text-2)] transition-colors duration-150 hover:border-[var(--home-line-strong)] hover:text-white"
            >
              <GitHubIcon className="size-[18px]" />
            </a>

            <button
              type="button"
              onClick={onStartBuilding}
              className="home-btn-amber inline-flex min-h-[44px] cursor-pointer items-center gap-2 rounded-full px-4 text-[14px] font-semibold"
            >
              <span>Start building</span>
              <ArrowRight className="size-4" />
            </button>

            <button
              type="button"
              aria-label="Open menu"
              onClick={() => setMobileMenuOpen(true)}
              className="home-glass inline-flex size-11 cursor-pointer items-center justify-center rounded-full text-white min-[900px]:hidden"
            >
              <Menu className="size-5" />
            </button>
          </div>
        </div>
      </header>

      {/* Full screen glass navigation sheet below 900px */}
      {mobileMenuOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Navigation menu"
          className="fixed inset-0 z-50 flex flex-col justify-between bg-[rgba(5,5,5,0.92)] p-6 backdrop-blur-2xl min-[900px]:hidden"
        >
          <div className="flex items-center justify-between">
            <span className="home-display text-[18px] font-extrabold tracking-tight text-white">
              {BRAND.name}
            </span>
            <button
              type="button"
              aria-label="Close menu"
              onClick={() => setMobileMenuOpen(false)}
              className="home-glass inline-flex size-11 cursor-pointer items-center justify-center rounded-full text-white"
            >
              <X className="size-5" />
            </button>
          </div>

          <nav
            aria-label="Mobile sections"
            className="flex flex-col gap-1 py-6"
          >
            {NAV_LINKS.map((item) => (
              <a
                key={item.id}
                href={`#${item.id}`}
                onClick={(event) => {
                  event.preventDefault();
                  setMobileMenuOpen(false);
                  scrollToSection(item.id);
                }}
                className="home-display flex min-h-[48px] items-center rounded-[14px] px-4 text-[26px] font-bold tracking-[-0.03em] text-[var(--home-text)] transition-colors duration-150 hover:bg-white/[0.06]"
              >
                {item.label}
              </a>
            ))}
          </nav>

          <div className="flex flex-col gap-3">
            <a
              href={BRAND.repoUrl}
              target="_blank"
              rel="noreferrer"
              className="home-glass inline-flex min-h-[48px] items-center justify-center gap-2 rounded-full text-[15px] font-medium text-white"
            >
              <GitHubIcon className="size-4" />
              <span>View on GitHub</span>
            </a>

            <button
              type="button"
              onClick={() => {
                setMobileMenuOpen(false);
                onStartBuilding();
              }}
              className="home-btn-amber inline-flex min-h-[48px] w-full cursor-pointer items-center justify-center gap-2 rounded-full text-[15px] font-semibold"
            >
              <span>Start building</span>
              <ArrowRight className="size-4" />
            </button>
          </div>
        </div>
      )}
    </>
  );
}
