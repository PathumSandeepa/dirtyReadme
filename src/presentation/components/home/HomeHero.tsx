"use client";

import { useState } from "react";
import {
  Anchor,
  ArrowRight,
  Blocks,
  FileText,
  Fish,
  FolderOpen,
  Image as ImageIcon,
  LayoutTemplate,
  Link2,
  Send,
  Share2,
  ShieldCheck,
  Sparkles,
  Star,
  Type,
  Wifi,
} from "lucide-react";
import { cn } from "cn";
import { BRAND } from "@/config/brand";
import {
  HERO_SAMPLE_BADGES,
  HOME_FACTS,
  STACK_DEMO_PLATFORMS,
  getContrastingInk,
  normalizeHex,
  showcaseAsset,
} from "./homeData";
import { useDockMagnification } from "./useDockMagnification";
import { useGitHubStars } from "./useGitHubStars";
import { useReducedMotion } from "./useReducedMotion";
import { useTilt3D } from "./useTilt3D";

interface HomeHeroProps {
  onStartBuilding: () => void;
}

const LINE_ONE_WORDS = ["Your", "README,"];
const LINE_TWO_WORDS = ["now", "alive."];

const HERO_MAP_PARTS = [
  { id: "header", label: "Header", status: "Left aligned" },
  { id: "about", label: "About", status: "52 words" },
  { id: "stack", label: "Tech stack", status: "15 badges" },
  { id: "links", label: "Links", status: "3 buttons" },
  { id: "creature", label: "Creature", status: "Stage 4" },
] as const;

type HeroMapPartId = (typeof HERO_MAP_PARTS)[number]["id"];

const HERO_DOCK_ITEMS = [
  { id: "editor", label: "Editor", bg: "#2563EB", Icon: Type, section: "editor" },
  {
    id: "templates",
    label: "Templates",
    bg: "#8B5CF6",
    Icon: LayoutTemplate,
    section: "templates",
  },
  { id: "stack", label: "Tech badge", bg: "#06B6D4", Icon: Blocks, section: "stack" },
  { id: "links", label: "Links", bg: "#10B981", Icon: Link2, section: "stack" },
  { id: "creature", label: "Creature", bg: "#F59E0B", Icon: Fish, section: "creatures" },
  { id: "image", label: "Image", bg: "#EC4899", Icon: ImageIcon, section: "images" },
  { id: "share", label: "Share card", bg: "#6366F1", Icon: Share2, section: "settings" },
  { id: "publish", label: "Publish", bg: "#EA580C", Icon: Send, section: "privacy" },
  {
    id: "github",
    label: "GitHub",
    bg: "#27272A",
    Icon: FileText,
    section: "open-source",
  },
] as const;

export function HomeHero({ onStartBuilding }: HomeHeroProps) {
  const starCount = useGitHubStars();
  const reducedMotion = useReducedMotion();
  const [islandExpanded, setIslandExpanded] = useState(false);
  const [activePart, setActivePart] = useState<HeroMapPartId>("stack");
  const [activeDockId, setActiveDockId] = useState<string>("creature");
  const [hoveredDockId, setHoveredDockId] = useState<string | null>(null);

  const tilt = useTilt3D({ maxDegrees: 3, disabled: reducedMotion });
  const bottomDock = useDockMagnification({
    maxScale: 1.44,
    radius: 132,
    lift: 10,
    disabled: reducedMotion,
  });

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (!el) return;
    const top = el.getBoundingClientRect().top + window.scrollY - 96;
    window.scrollTo({
      top: Math.max(0, top),
      behavior: reducedMotion ? "auto" : "smooth",
    });
  };

  return (
    <section
      id="top"
      className="relative px-4 pt-24 pb-16 sm:px-6 sm:pt-[120px] sm:pb-24"
    >
      <div className="mx-auto flex max-w-[1160px] flex-col items-center text-center">
        {/* Two-line gradient display headline with inline swimming pixel whale pill */}
        <h1 className="home-h1 flex flex-col items-center">
          <span className="flex flex-wrap items-center justify-center gap-x-[0.26em] gap-y-2">
            {LINE_ONE_WORDS.map((word, index) => (
              <span
                key={word}
                style={{ animationDelay: `${index * 70}ms` }}
                className="home-word-reveal home-gradient-text"
              >
                {word}
              </span>
            ))}

            {/* Inline glass pill with swimming pixel whale */}
            <span
              aria-hidden="true"
              style={{ animationDelay: "160ms" }}
              className="home-word-reveal home-glass inline-flex h-[0.68em] min-h-[42px] w-[1.65em] min-w-[96px] items-center justify-center overflow-hidden rounded-full px-3 align-middle"
            >
              <img
                src={showcaseAsset("view-side.webp")}
                width={72}
                height={36}
                alt=""
                className="home-pill-whale h-[36px] w-auto object-contain"
              />
            </span>
          </span>

          <span className="mt-1 flex flex-wrap items-center justify-center gap-x-[0.26em]">
            {LINE_TWO_WORDS.map((word, index) => (
              <span
                key={word}
                style={{ animationDelay: `${(index + 3) * 70}ms` }}
                className="home-word-reveal home-gradient-text"
              >
                {word}
              </span>
            ))}
          </span>
        </h1>

        <p className="home-subcopy mt-7 text-center">
          {BRAND.name} lets you build and edit a GitHub profile README with a
          live preview, start from {HOME_FACTS.templateCount} templates, add a
          growing pixel creature or your own image, and publish with one push.
          Free, open source and private.
        </p>

        {/* Primary amber CTA with live star pill + transparent outline button */}
        <div className="mt-9 flex flex-wrap items-center justify-center gap-3.5">
          <button
            type="button"
            onClick={onStartBuilding}
            className="home-btn-amber inline-flex min-h-[48px] cursor-pointer items-center gap-2.5 rounded-full px-6 text-[15px] font-semibold"
          >
            <span>Start building</span>
            {starCount !== null && (
              <span className="inline-flex items-center gap-1 rounded-full bg-black/15 px-2.5 py-0.5 font-mono text-[12px] font-semibold text-[#1A0D00] tabular-nums">
                <Star className="size-3 fill-current" />
                <span>{starCount.toLocaleString("en-US")}</span>
              </span>
            )}
            <ArrowRight className="size-4" />
          </button>

          <a
            href="#templates"
            onClick={(event) => {
              event.preventDefault();
              scrollToSection("templates");
            }}
            className="inline-flex min-h-[48px] items-center justify-center rounded-full border border-white/24 bg-transparent px-6 text-[15px] font-medium text-white transition-colors duration-150 hover:border-white/45 hover:bg-white/[0.05]"
          >
            See templates
          </a>
        </div>

        {/* Hero product window on vivid .wall-ocean wallpaper with 3D pointer tilt */}
        <div
          ref={tilt.containerRef}
          onPointerMove={tilt.onPointerMove}
          onPointerLeave={tilt.onPointerLeave}
          className="wall-ocean mt-14 w-full max-w-[1160px] p-3 text-left shadow-[0_30px_100px_rgba(0,0,0,0.75)] transition-transform duration-200 ease-out will-change-transform sm:mt-16 sm:p-5 md:p-6"
        >
          {/* Moving pointer highlight */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 z-20 transition-opacity duration-200"
            style={{
              opacity: "var(--glare-opacity, 0)",
              background:
                "radial-gradient(480px circle at var(--glare-x, 50%) var(--glare-y, 50%), rgba(255,255,255,0.14), transparent 65%)",
            }}
          />

          {/* a. Faux system bar with expandable glass status island */}
          <div className="relative z-20 flex items-center justify-between gap-3 rounded-[14px] bg-black/38 px-3.5 py-2 text-[12px] text-white/80 backdrop-blur-xl">
            <div className="flex items-center gap-2 font-medium text-white">
              <Anchor className="size-3.5 text-[var(--amber-label)]" />
              <span className="font-mono text-[12px]">README.md</span>
            </div>

            {/* Interactive expandable glass island */}
            <div className="relative hidden sm:block">
              <button
                type="button"
                aria-expanded={islandExpanded}
                aria-label="Inspect live commit and stage telemetry"
                onMouseEnter={() => setIslandExpanded(true)}
                onMouseLeave={() => setIslandExpanded(false)}
                onFocus={() => setIslandExpanded(true)}
                onBlur={() => setIslandExpanded(false)}
                onClick={() => setIslandExpanded((prev) => !prev)}
                className="home-glass flex cursor-pointer items-center gap-3 rounded-full px-3.5 py-1 text-[12px] font-medium text-white transition-all duration-200 hover:border-white/25"
              >
                <span className="inline-flex items-center gap-1.5 tabular-nums">
                  <span className="size-1.5 rounded-full bg-[var(--live)]" />
                  <span>
                    {HOME_FACTS.sampleCommits.toLocaleString("en-US")} commits
                  </span>
                </span>
                <span className="text-[var(--amber-label)]">Stage 4</span>
              </button>

              {islandExpanded && (
                <div
                  onMouseEnter={() => setIslandExpanded(true)}
                  onMouseLeave={() => setIslandExpanded(false)}
                  className="home-glass absolute top-full left-1/2 z-30 mt-2 w-[260px] -translate-x-1/2 rounded-[16px] p-3.5 text-left shadow-2xl"
                >
                  <div className="flex items-center justify-between text-[11px] font-medium text-[var(--home-text-2)]">
                    <span>Top languages</span>
                    <span className="font-mono text-[var(--amber-label)] tabular-nums">
                      Stage 4 of 5
                    </span>
                  </div>
                  <div className="mt-2.5 flex flex-wrap gap-2">
                    {HOME_FACTS.sampleLanguages.map((lang) => (
                      <span
                        key={lang.name}
                        className="inline-flex items-center gap-1.5 rounded-full bg-white/[0.06] px-2.5 py-0.5 text-[11px] text-white"
                      >
                        <span
                          className="size-2 rounded-full"
                          style={{ backgroundColor: lang.color }}
                        />
                        <span>{lang.name}</span>
                      </span>
                    ))}
                  </div>
                  <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-white/10">
                    <div
                      className="h-full w-4/5 rounded-full"
                      style={{ background: "var(--amber-gradient)" }}
                    />
                  </div>
                </div>
              )}
            </div>

            <div className="flex items-center gap-2.5 font-mono text-[12px] text-white/75 tabular-nums">
              <Wifi className="size-3.5" />
              <ShieldCheck className="size-3.5 text-[var(--live)]" />
              <span>12:00</span>
            </div>
          </div>

          {/* c. Bobbing Pixel Tulkun peeking above top edge of the paper window */}
          <div className="relative z-10 mx-auto mt-4 max-w-[960px] pt-10 sm:mt-6 sm:pt-12">
            <div className="pointer-events-auto absolute top-0 left-1/2 z-20 -translate-x-1/2">
              <img
                src={showcaseAsset("hero-tulkun.webp")}
                width={176}
                height={88}
                alt="Animated Pixel Tulkun bobbing gently above the README preview window"
                className="home-tulkun-bob h-[68px] w-auto cursor-pointer rounded-[12px] object-contain drop-shadow-[0_12px_24px_rgba(0,0,0,0.55)] sm:h-[84px]"
              />
            </div>

            {/* b. Warm paper white light-mode README window */}
            <div className="overflow-hidden rounded-[18px] border border-black/10 bg-[#FAF8F4] text-[#171717] shadow-[0_24px_70px_rgba(0,0,0,0.45)]">
              <div className="flex items-center justify-between border-b border-black/8 bg-[#F2EFE9] px-4 py-2.5">
                <div className="flex items-center gap-1.5">
                  <span className="size-3 rounded-full bg-[#FF5F56]" />
                  <span className="size-3 rounded-full bg-[#FFBD2E]" />
                  <span className="size-3 rounded-full bg-[#27C93F]" />
                </div>
                <span className="font-mono text-[11px] font-medium text-black/55">
                  octocat README.md
                </span>
                <span className="rounded-full bg-black/6 px-2 py-0.5 font-mono text-[10px] font-medium text-black/60">
                  848px
                </span>
              </div>

              <div className="grid md:grid-cols-[210px_minmax(0,1fr)]">
                {/* Left folder-like list of README parts */}
                <div className="border-b border-black/8 bg-[#F5F2EC] p-3 md:border-r md:border-b-0">
                  <div className="mb-2 flex items-center gap-1.5 px-2 text-[11px] font-semibold text-black/45">
                    <FolderOpen className="size-3.5" />
                    <span>README map</span>
                  </div>
                  <div className="flex gap-1 overflow-x-auto md:flex-col">
                    {HERO_MAP_PARTS.map((part) => {
                      const selected = activePart === part.id;
                      return (
                        <button
                          key={part.id}
                          type="button"
                          onClick={() => setActivePart(part.id)}
                          className={cn(
                            "flex shrink-0 cursor-pointer items-center justify-between gap-2 rounded-[10px] px-2.5 py-2 text-left text-[13px] transition-colors duration-150",
                            selected
                              ? "bg-black/10 font-semibold text-[#111111]"
                              : "text-black/65 hover:bg-black/5 hover:text-[#111111]"
                          )}
                        >
                          <span>{part.label}</span>
                          <span className="hidden font-mono text-[10px] text-black/45 md:inline">
                            {part.status}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Right real-looking GitHub README column */}
                <div className="flex min-w-0 flex-col gap-4 p-5 sm:p-6">
                  <div
                    className={cn(
                      "rounded-[10px] p-2.5 transition-colors duration-150",
                      activePart === "header" || activePart === "about"
                        ? "bg-black/[0.045]"
                        : "bg-transparent"
                    )}
                  >
                    <div className="home-display text-[22px] leading-tight font-extrabold tracking-[-0.03em] text-[#111111] sm:text-[26px]">
                      Hi, I am The Octocat.
                    </div>
                    <p className="mt-1.5 text-[13px] leading-relaxed text-black/65">
                      Building open source developer tools, TypeScript libraries
                      and calm web interfaces. Currently maintaining{" "}
                      {HOME_FACTS.templateCount} profile starter layouts.
                    </p>
                  </div>

                  <div
                    className={cn(
                      "rounded-[10px] p-2.5 transition-colors duration-150",
                      activePart === "stack"
                        ? "bg-amber-500/12"
                        : "bg-transparent"
                    )}
                  >
                    <div className="mb-2 text-[11px] font-semibold text-black/45">
                      Tech stack
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {HERO_SAMPLE_BADGES.map((badge) => (
                        <span
                          key={badge.id}
                          style={{
                            backgroundColor: normalizeHex(badge.color),
                            color: getContrastingInk(badge.color),
                          }}
                          className="rounded-[5px] px-2.5 py-1 font-mono text-[11px] font-semibold tracking-tight"
                        >
                          {badge.label}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div
                    className={cn(
                      "rounded-[10px] p-2.5 transition-colors duration-150",
                      activePart === "links"
                        ? "bg-black/[0.045]"
                        : "bg-transparent"
                    )}
                  >
                    <div className="flex flex-wrap gap-1.5">
                      {STACK_DEMO_PLATFORMS.slice(0, 4).map((platform) => (
                        <span
                          key={platform.id}
                          style={{
                            backgroundColor: normalizeHex(platform.hex),
                            color: getContrastingInk(platform.hex),
                          }}
                          className="inline-flex items-center gap-1.5 rounded-[6px] px-2.5 py-1 text-[11px] font-semibold"
                        >
                          <svg
                            viewBox="0 0 24 24"
                            width={12}
                            height={12}
                            fill="currentColor"
                            aria-hidden="true"
                          >
                            <path d={platform.svgPath} />
                          </svg>
                          <span>
                            {platform.id === "x" ? "X" : platform.label}
                          </span>
                        </span>
                      ))}
                    </div>
                  </div>

                  <div
                    className={cn(
                      "flex items-center justify-between gap-3 rounded-[10px] bg-[#0D1117] px-3.5 py-2.5 text-white transition-transform duration-150",
                      activePart === "creature" && "scale-[1.01]"
                    )}
                  >
                    <div className="flex items-center gap-2.5">
                      <Sparkles className="size-4 text-[var(--amber-label)]" />
                      <div>
                        <div className="font-mono text-[11px] font-semibold">
                          Stage 4 Mature Tulkun
                        </div>
                        <div className="font-mono text-[10px] text-white/60 tabular-nums">
                          {HOME_FACTS.sampleCommits.toLocaleString("en-US")}{" "}
                          commits synced nightly
                        </div>
                      </div>
                    </div>
                    <img
                      src={showcaseAsset("creature-tulkun.webp")}
                      width={96}
                      height={48}
                      alt="Mini animated Pixel Tulkun banner inside README preview"
                      className="h-9 w-auto rounded-[4px] object-contain"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* d. Bottom glass dock of 9 magnifying rounded icon tiles */}
          <div className="relative z-20 mt-5 flex justify-center sm:mt-7">
            <div
              role="toolbar"
              aria-label="Feature dock"
              onPointerMove={bottomDock.onPointerMove}
              onPointerLeave={() => {
                bottomDock.onPointerLeave();
                setHoveredDockId(null);
              }}
              className="home-glass inline-flex max-w-full items-end gap-1.5 overflow-x-auto rounded-[20px] px-3 py-2.5 sm:gap-2.5 sm:overflow-visible sm:px-4"
            >
              {HERO_DOCK_ITEMS.map((item, index) => {
                const Icon = item.Icon;
                const isActive = activeDockId === item.id;
                const showTooltip = hoveredDockId === item.id;

                return (
                  <div
                    key={item.id}
                    className="relative flex flex-col items-center gap-1"
                  >
                    {showTooltip && (
                      <span
                        role="tooltip"
                        className="pointer-events-none absolute -top-9 left-1/2 hidden -translate-x-1/2 rounded-[8px] border border-white/14 bg-[#0B0B0C] px-2.5 py-1 text-[11px] font-medium whitespace-nowrap text-white shadow-lg sm:block"
                      >
                        {item.label}
                      </span>
                    )}

                    <button
                      ref={bottomDock.registerItem(index)}
                      type="button"
                      aria-label={item.label}
                      onMouseEnter={() => setHoveredDockId(item.id)}
                      onFocus={() => setHoveredDockId(item.id)}
                      onBlur={() => setHoveredDockId(null)}
                      onClick={() => {
                        setActiveDockId(item.id);
                        scrollToSection(item.section);
                      }}
                      style={{ backgroundColor: item.bg }}
                      className="flex size-10 shrink-0 origin-bottom cursor-pointer items-center justify-center rounded-[12px] text-white shadow-md transition-transform duration-150 ease-out will-change-transform sm:size-11"
                    >
                      <Icon className="size-5" />
                    </button>

                    <span
                      aria-hidden="true"
                      className={cn(
                        "size-1 rounded-full transition-opacity duration-150",
                        isActive ? "bg-white opacity-100" : "opacity-0"
                      )}
                    />
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
