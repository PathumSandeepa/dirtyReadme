"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Blocks,
  Eye,
  FolderOpen,
  GitBranch,
  Image as ImageIcon,
  LayoutTemplate,
  Link2,
  Moon,
  Send,
  Settings,
  ShieldCheck,
  Sun,
  Type,
  Wifi,
} from "lucide-react";
import { cn } from "cn";
import { BRAND } from "@/config/brand";
import { AdvancedMarkdownPreview } from "@/presentation/components/MarkdownPreviewRenderer";
import {
  HERO_BANNER_IMAGE_MAP,
  HERO_EXTRA_BADGE_POOL,
  HERO_MOCK_PROFILES,
  buildHeroMockMarkdown,
} from "./heroMockData";
import { useDockMagnification } from "./useDockMagnification";
import { useReducedMotion } from "./useReducedMotion";

type MenuId = "file" | "edit" | "insert" | "view";
type MapPartId = "header" | "about" | "stack" | "links";
type WindowState = "open" | "minimized" | "closed";
type PublishToastState = "idle" | "uploading" | "done";

const MAP_PARTS: { id: MapPartId; label: string }[] = [
  { id: "header", label: "Header" },
  { id: "about", label: "About" },
  { id: "stack", label: "Stack" },
  { id: "links", label: "Links" },
];

const DOCK_ITEMS = [
  {
    id: "editor",
    label: "Editor",
    Icon: Type,
    gradient: "linear-gradient(180deg, #60A5FA 0%, #2563EB 100%)",
  },
  {
    id: "templates",
    label: "Templates",
    Icon: LayoutTemplate,
    gradient: "linear-gradient(180deg, #A78BFA 0%, #7C3AED 100%)",
  },
  {
    id: "badges",
    label: "Badges",
    Icon: Blocks,
    gradient: "linear-gradient(180deg, #2DD4BF 0%, #0D9488 100%)",
  },
  {
    id: "links",
    label: "Links",
    Icon: Link2,
    gradient: "linear-gradient(180deg, #34D399 0%, #059669 100%)",
  },
  {
    id: "image",
    label: "Image",
    Icon: ImageIcon,
    gradient: "linear-gradient(180deg, #F472B6 0%, #DB2777 100%)",
  },
  {
    id: "preview",
    label: "Preview",
    Icon: Eye,
    gradient: "linear-gradient(180deg, #FBBF24 0%, #D97706 100%)",
  },
  {
    id: "publish",
    label: "Publish",
    Icon: Send,
    gradient: "linear-gradient(180deg, #FB923C 0%, #EA580C 100%)",
  },
  {
    id: "github",
    label: "GitHub",
    Icon: GitBranch,
    gradient: "linear-gradient(180deg, #52525B 0%, #27272A 100%)",
  },
  {
    id: "settings",
    label: "Settings",
    Icon: Settings,
    gradient: "linear-gradient(180deg, #818CF8 0%, #4F46E5 100%)",
  },
] as const;

type DockId = (typeof DOCK_ITEMS)[number]["id"];

function countPlainWords(markdown: string): number {
  const plain = markdown
    .replace(/<[^>]+>/g, " ")
    .replace(/[#*_`[\]()]/g, " ")
    .replace(/https?:\/\/\S+/g, " ")
    .trim();
  if (!plain) return 0;
  return plain.split(/\s+/).length;
}

export function HeroLiveMock() {
  const reducedMotion = useReducedMotion();
  const rootRef = useRef<HTMLDivElement | null>(null);
  const [extraBadgeCursor, setExtraBadgeCursor] = useState(0);

  const [profileIndex, setProfileIndex] = useState(0);
  const [badgeIds, setBadgeIds] = useState<string[]>(
    () => HERO_MOCK_PROFILES[0].badgeIds
  );
  const [linksAlign, setLinksAlign] = useState<"left" | "center">("left");
  const [bannerVisible, setBannerVisible] = useState(true);
  const [bannerAnimating, setBannerAnimating] = useState(false);
  const [previewMode, setPreviewMode] = useState<"visual" | "markdown">(
    "visual"
  );
  const [isGhDark, setIsGhDark] = useState(false);
  const [windowState, setWindowState] = useState<WindowState>("open");
  const [isExpanded, setIsExpanded] = useState(false);
  const [activePart, setActivePart] = useState<MapPartId>("header");
  const [settingsTab, setSettingsTab] = useState<"part" | "format" | "page">(
    "page"
  );
  const [structurePreset, setStructurePreset] = useState<"full" | "minimal">(
    "full"
  );
  const [openMenu, setOpenMenu] = useState<MenuId | null>(null);
  const [islandExpanded, setIslandExpanded] = useState(false);
  const [hoveredDockId, setHoveredDockId] = useState<DockId | null>(null);
  const [bouncingDockId, setBouncingDockId] = useState<DockId | null>(null);
  const [publishToast, setPublishToast] = useState<PublishToastState>("idle");
  const [clockText, setClockText] = useState("");

  // Intro sequence state (skipped immediately for reduced motion or any user interaction)
  const [introCancelled, setIntroCancelled] = useState(false);
  const [introStage, setIntroStage] = useState(0);
  const [typedChars, setTypedChars] = useState(0);
  const [introBadges, setIntroBadges] = useState(0);

  const profile = HERO_MOCK_PROFILES[profileIndex];
  const introActive = !reducedMotion && !introCancelled && introStage < 4;

  const stopIntro = useCallback(() => {
    setIntroCancelled(true);
    setIntroStage(4);
  }, []);

  // Client-only clock to avoid hydration mismatch
  useEffect(() => {
    const updateClock = () => {
      const now = new Date();
      setClockText(
        now.toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        })
      );
    };
    const initTimer = window.setTimeout(updateClock, 0);
    const interval = window.setInterval(updateClock, 30000);
    return () => {
      window.clearTimeout(initTimer);
      window.clearInterval(interval);
    };
  }, []);

  // One-time intro sequence
  useEffect(() => {
    if (reducedMotion || introCancelled) return;
    const headlineLen = HERO_MOCK_PROFILES[0].headline.length;
    const totalBadges = HERO_MOCK_PROFILES[0].badgeIds.length;
    const timers: number[] = [];

    for (let c = 1; c <= headlineLen; c++) {
      timers.push(
        window.setTimeout(() => {
          setTypedChars(c);
        }, c * 28)
      );
    }

    const afterTitle = headlineLen * 28 + 120;
    timers.push(window.setTimeout(() => setIntroStage(1), afterTitle));
    timers.push(window.setTimeout(() => setIntroStage(2), afterTitle + 280));

    for (let b = 1; b <= totalBadges; b++) {
      timers.push(
        window.setTimeout(() => {
          setIntroBadges(b);
        }, afterTitle + 280 + b * 110)
      );
    }

    const afterBadges = afterTitle + 280 + totalBadges * 110 + 160;
    timers.push(window.setTimeout(() => setIntroStage(3), afterBadges));
    timers.push(window.setTimeout(() => setIntroStage(4), afterBadges + 260));

    return () => {
      for (const id of timers) window.clearTimeout(id);
    };
  }, [reducedMotion, introCancelled]);

  // Close menus on outside click or Escape
  useEffect(() => {
    if (!openMenu) return;
    const handlePointerDown = (event: PointerEvent) => {
      if (
        rootRef.current &&
        !rootRef.current.contains(event.target as Node)
      ) {
        setOpenMenu(null);
      }
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpenMenu(null);
      }
    };
    window.addEventListener("pointerdown", handlePointerDown);
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("pointerdown", handlePointerDown);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [openMenu]);

  useEffect(() => {
    if (publishToast === "uploading") {
      const t = window.setTimeout(() => setPublishToast("done"), 900);
      return () => window.clearTimeout(t);
    }
    if (publishToast === "done") {
      const t = window.setTimeout(() => setPublishToast("idle"), 1900);
      return () => window.clearTimeout(t);
    }
  }, [publishToast]);

  const {
    registerItem: registerDockItem,
    onPointerMove: handleDockPointerMove,
    onPointerLeave: handleDockPointerLeave,
  } = useDockMagnification({
    maxScale: 1.24,
    radius: 132,
    lift: 8,
    disabled: reducedMotion,
  });

  const triggerBounce = useCallback(
    (id: DockId) => {
      if (reducedMotion) return;
      setBouncingDockId(id);
      window.setTimeout(() => {
        setBouncingDockId((prev) => (prev === id ? null : prev));
      }, 580);
    },
    [reducedMotion]
  );

  const handleCycleTemplate = useCallback(() => {
    stopIntro();
    setWindowState("open");
    setProfileIndex((prev) => {
      const next = (prev + 1) % HERO_MOCK_PROFILES.length;
      setBadgeIds(HERO_MOCK_PROFILES[next].badgeIds);
      return next;
    });
  }, [stopIntro]);

  const handleAddBadge = useCallback(() => {
    stopIntro();
    setWindowState("open");
    setActivePart("stack");
    const nextBadge =
      HERO_EXTRA_BADGE_POOL[extraBadgeCursor % HERO_EXTRA_BADGE_POOL.length];
    setExtraBadgeCursor((prev) => prev + 1);
    setBadgeIds((prev) => {
      const filtered = prev.filter((id) => id !== nextBadge);
      const updated = [...filtered, nextBadge];
      return updated.length > 8 ? updated.slice(updated.length - 8) : updated;
    });
  }, [extraBadgeCursor, stopIntro]);

  const handleToggleLinksAlign = useCallback(() => {
    stopIntro();
    setWindowState("open");
    setActivePart("links");
    setLinksAlign((prev) => (prev === "center" ? "left" : "center"));
  }, [stopIntro]);

  const handleInsertImage = useCallback(() => {
    stopIntro();
    setWindowState("open");
    setActivePart("header");
    setBannerVisible(true);
    if (!reducedMotion) {
      setBannerAnimating(true);
      window.setTimeout(() => setBannerAnimating(false), 950);
    }
  }, [reducedMotion, stopIntro]);

  const handleTogglePreview = useCallback(() => {
    stopIntro();
    setWindowState("open");
    setPreviewMode((prev) => (prev === "visual" ? "markdown" : "visual"));
  }, [stopIntro]);

  const handlePublishDemo = useCallback(() => {
    stopIntro();
    setPublishToast("uploading");
  }, [stopIntro]);

  const handleResetDemo = useCallback(() => {
    stopIntro();
    setProfileIndex(0);
    setBadgeIds(HERO_MOCK_PROFILES[0].badgeIds);
    setLinksAlign("center");
    setBannerVisible(false);
    setPreviewMode("visual");
    setWindowState("open");
    setActivePart("header");
    setOpenMenu(null);
  }, [stopIntro]);

  const handleDockAction = useCallback(
    (id: DockId) => {
      stopIntro();
      triggerBounce(id);
      setOpenMenu(null);

      if (windowState !== "open" && id !== "github" && id !== "settings") {
        setWindowState("open");
      }

      switch (id) {
        case "editor":
          setWindowState("open");
          setPreviewMode("visual");
          break;
        case "templates":
          handleCycleTemplate();
          break;
        case "badges":
          handleAddBadge();
          break;
        case "links":
          handleToggleLinksAlign();
          break;
        case "image":
          handleInsertImage();
          break;
        case "preview":
          handleTogglePreview();
          break;
        case "publish":
          handlePublishDemo();
          break;
        case "github":
          window.open(BRAND.repoUrl, "_blank", "noopener,noreferrer");
          break;
        case "settings":
          setOpenMenu((prev) => (prev === "view" ? null : "view"));
          break;
      }
    },
    [
      handleAddBadge,
      handleCycleTemplate,
      handleInsertImage,
      handlePublishDemo,
      handleToggleLinksAlign,
      handleTogglePreview,
      stopIntro,
      triggerBounce,
      windowState,
    ]
  );

  const markdown = useMemo(() => {
    const effectiveHeadline = introActive
      ? profile.headline.slice(0, Math.max(1, typedChars))
      : profile.headline;
    const effectiveBadges = introActive
      ? introStage >= 2
        ? badgeIds.slice(0, introBadges)
        : []
      : badgeIds;

    return buildHeroMockMarkdown({
      profile,
      badgeIds: effectiveBadges,
      linksAlign,
      bannerVisible,
      headlineOverride: effectiveHeadline,
      showBio: !introActive || introStage >= 1,
      showBadges: !introActive || (introStage >= 2 && effectiveBadges.length > 0),
      showLinks: !introActive || introStage >= 3,
    });
  }, [
    badgeIds,
    bannerVisible,
    introActive,
    introBadges,
    introStage,
    linksAlign,
    profile,
    typedChars,
  ]);

  const wordCount = useMemo(() => countPlainWords(markdown), [markdown]);

  const menuItems: Record<
    MenuId,
    { label: string; onSelect: () => void }[]
  > = {
    file: [
      { label: "New profile", onSelect: handleResetDemo },
      { label: "Cycle template", onSelect: handleCycleTemplate },
      { label: "Publish demo", onSelect: handlePublishDemo },
    ],
    edit: [
      { label: "Toggle link alignment", onSelect: handleToggleLinksAlign },
      {
        label: "Reset badges",
        onSelect: () => {
          stopIntro();
          setBadgeIds(profile.badgeIds);
          setOpenMenu(null);
        },
      },
    ],
    insert: [
      { label: "Badge group", onSelect: handleAddBadge },
      { label: "Link buttons", onSelect: handleToggleLinksAlign },
      { label: "Image", onSelect: handleInsertImage },
    ],
    view: [
      {
        label:
          previewMode === "visual" ? "Switch to Markdown" : "Switch to Visual",
        onSelect: handleTogglePreview,
      },
      {
        label: isGhDark ? "GitHub light theme" : "GitHub dark theme",
        onSelect: () => {
          stopIntro();
          setIsGhDark((prev) => !prev);
          setOpenMenu(null);
        },
      },
      {
        label: isExpanded ? "Default window size" : "Larger window size",
        onSelect: () => {
          stopIntro();
          setWindowState("open");
          setIsExpanded((prev) => !prev);
          setOpenMenu(null);
        },
      },
    ],
  };

  const isDockActive = (id: DockId): boolean => {
    switch (id) {
      case "editor":
        return windowState === "open";
      case "templates":
        return profileIndex > 0;
      case "badges":
        return badgeIds.length > profile.badgeIds.length;
      case "links":
        return linksAlign === "left";
      case "image":
        return bannerVisible;
      case "preview":
        return previewMode === "markdown";
      case "publish":
        return publishToast !== "idle";
      case "settings":
        return openMenu === "view";
      default:
        return false;
    }
  };

  const handleDockKeyDown = (
    event: React.KeyboardEvent<HTMLButtonElement>,
    index: number
  ) => {
    const toolbar = event.currentTarget.closest('[role="toolbar"]');
    if (!toolbar) return;
    const buttons = Array.from(
      toolbar.querySelectorAll<HTMLButtonElement>("[data-dock-btn]")
    );
    if (buttons.length === 0) return;
    if (event.key === "ArrowRight") {
      event.preventDefault();
      buttons[(index + 1) % buttons.length]?.focus();
    } else if (event.key === "ArrowLeft") {
      event.preventDefault();
      buttons[(index - 1 + buttons.length) % buttons.length]?.focus();
    }
  };

  return (
    <div
      onPointerDown={() => {
        if (introActive) stopIntro();
      }}
      className="relative mt-14 w-full max-w-[1160px] text-left sm:mt-16"
    >
      {/* Realistic MacBook Pro anodized aluminum lid */}
      <div className="rounded-[26px] bg-gradient-to-b from-[#34363c] via-[#1d1e22] to-[#121316] p-[8px] shadow-[0_32px_100px_rgba(0,0,0,0.85)] ring-1 ring-white/15 sm:rounded-[30px] sm:p-[11px]">
        {/* Inner black glass display bezel */}
        <div className="relative overflow-hidden rounded-[18px] bg-[#050506] p-[5px] sm:rounded-[21px] sm:p-[7px]">
          {/* Centered MacBook camera notch */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute top-0 left-1/2 z-40 hidden h-[18px] w-[112px] -translate-x-1/2 items-center justify-center rounded-b-[10px] bg-[#050506] sm:flex"
          >
            <span className="flex size-2 items-center justify-center rounded-full bg-[#111722] ring-1 ring-white/10">
              <span className="size-0.5 rounded-full bg-[#38bdf8]/70" />
            </span>
          </div>

          {/* Subtle glass screen reflection */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 z-30 bg-[linear-gradient(115deg,rgba(255,255,255,0.06)_0%,rgba(255,255,255,0.015)_34%,transparent_54%)]"
          />

          {/* macOS desktop screen */}
          <div className="wall-ocean relative flex min-h-[580px] w-full flex-col justify-between overflow-hidden rounded-[13px] p-3 sm:min-h-[610px] sm:rounded-[15px] sm:p-5 md:p-6">
            <div ref={rootRef} className="contents">
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

      {/* macOS-style 32px menu bar */}
      <div className="relative z-30 flex h-8 items-center justify-between gap-2 rounded-[10px] bg-black/45 px-3 text-[12px] text-white/85 backdrop-blur-xl">
        <div className="flex items-center gap-1 sm:gap-2">
          <div className="flex items-center gap-1.5 pr-1 font-semibold text-white">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 28 28"
              width={16}
              height={16}
              aria-hidden="true"
              className="shrink-0"
            >
              <defs>
                <linearGradient id="menu-amber" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#FFB84A" />
                  <stop offset="100%" stopColor="#F07A0F" />
                </linearGradient>
              </defs>
              <rect width="28" height="28" rx="8" fill="url(#menu-amber)" />
              <g fill="#1A0D00">
                <rect x="9.5" y="6.5" width="2.8" height="15" rx="1" />
                <rect x="15.7" y="6.5" width="2.8" height="15" rx="1" />
                <rect x="6.5" y="10" width="15" height="2.6" rx="1" />
                <rect x="6.5" y="15.4" width="15" height="2.6" rx="1" />
              </g>
            </svg>
            <span className="hidden text-[12px] tracking-tight sm:inline">
              DirtyReadme
            </span>
          </div>

          {(["file", "edit", "insert", "view"] as MenuId[]).map((menuKey) => {
            const label =
              menuKey.charAt(0).toUpperCase() + menuKey.slice(1);
            const isOpen = openMenu === menuKey;
            return (
              <div key={menuKey} className="relative">
                <button
                  type="button"
                  aria-expanded={isOpen}
                  onClick={() => {
                    stopIntro();
                    setOpenMenu((prev) => (prev === menuKey ? null : menuKey));
                  }}
                  className={cn(
                    "cursor-pointer rounded-[6px] px-2 py-0.5 text-[12px] font-medium transition-colors",
                    isOpen
                      ? "bg-white/18 text-white"
                      : "text-white/80 hover:bg-white/10 hover:text-white"
                  )}
                >
                  {label}
                </button>

                {isOpen && (
                  <div
                    role="menu"
                    className="home-glass absolute top-full left-0 z-40 mt-1.5 min-w-[180px] rounded-[12px] p-1.5 shadow-2xl"
                  >
                    {menuItems[menuKey].map((item) => (
                      <button
                        key={item.label}
                        type="button"
                        role="menuitem"
                        onClick={() => {
                          item.onSelect();
                          setOpenMenu(null);
                        }}
                        className="flex w-full cursor-pointer items-center rounded-[8px] px-2.5 py-1.5 text-left text-[12px] text-white/90 transition-colors hover:bg-white/12 hover:text-white"
                      >
                        {item.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Center expandable glass status island */}
        <div className="relative hidden md:block">
          <button
            type="button"
            aria-expanded={islandExpanded}
            onMouseEnter={() => setIslandExpanded(true)}
            onMouseLeave={() => setIslandExpanded(false)}
            onFocus={() => setIslandExpanded(true)}
            onBlur={() => setIslandExpanded(false)}
            onClick={() => setIslandExpanded((prev) => !prev)}
            className="home-glass flex cursor-pointer items-center gap-2.5 rounded-full px-3 py-0.5 text-[11px] font-medium text-white transition-all duration-200 hover:border-white/25"
          >
            <span className="inline-flex items-center gap-1.5">
              <span className="size-1.5 rounded-full bg-[var(--live)]" />
              <span>Draft saved</span>
            </span>
            <span className="font-mono text-white/65 tabular-nums">
              {wordCount} words
            </span>
          </button>

          {islandExpanded && (
            <div
              onMouseEnter={() => setIslandExpanded(true)}
              onMouseLeave={() => setIslandExpanded(false)}
              className="home-glass absolute top-full left-1/2 z-40 mt-2 w-[250px] -translate-x-1/2 rounded-[14px] p-3 text-left shadow-2xl"
            >
              <div className="text-[11px] font-medium text-[var(--home-text-2)]">
                Active target file
              </div>
              <div className="mt-1 font-mono text-[12px] text-white">
                username/username README.md
              </div>
              <div className="mt-1.5 font-mono text-[11px] text-[var(--amber-label)]">
                Sample profile: {profile.username}
              </div>
            </div>
          )}
        </div>

        {/* Right client-only clock and status icons */}
        <div className="flex items-center gap-2 font-mono text-[11px] text-white/80 tabular-nums">
          <Wifi className="size-3.5" />
          <ShieldCheck className="size-3.5 text-[var(--live)]" />
          <span className="min-w-[38px] text-right">{clockText}</span>
        </div>
      </div>

      {/* macOS Editor Window */}
      <div className="relative z-10 my-4 flex flex-1 items-center justify-center sm:my-5">
        <div
          className={cn(
            "w-full overflow-hidden rounded-[16px] border shadow-[0_24px_70px_rgba(0,0,0,0.45)] transition-all duration-300 ease-out",
            isExpanded ? "max-w-[1040px]" : "max-w-[920px]",
            isGhDark
              ? "border-white/12 bg-[#0d1117] text-[#f0f6fc]"
              : "border-black/10 bg-[#FAF8F4] text-[#171717]",
            windowState === "open" &&
              "translate-y-0 scale-100 opacity-100",
            windowState === "closed" &&
              "pointer-events-none scale-90 opacity-0",
            windowState === "minimized" &&
              "pointer-events-none translate-y-[180px] scale-[0.35] opacity-0"
          )}
        >
          {/* Window title bar */}
          <div
            className={cn(
              "flex items-center justify-between border-b px-4 py-2.5",
              isGhDark
                ? "border-white/10 bg-[#161b22]"
                : "border-black/8 bg-[#F2EFE9]"
            )}
          >
            <div className="flex items-center gap-2">
              <button
                type="button"
                aria-label="Close preview window"
                onClick={() => {
                  stopIntro();
                  setWindowState("closed");
                }}
                className="size-3 cursor-pointer rounded-full bg-[#FF5F56] transition-transform hover:scale-110"
              />
              <button
                type="button"
                aria-label="Minimize preview window"
                onClick={() => {
                  stopIntro();
                  setWindowState("minimized");
                }}
                className="size-3 cursor-pointer rounded-full bg-[#FFBD2E] transition-transform hover:scale-110"
              />
              <button
                type="button"
                aria-label="Toggle larger preview window"
                onClick={() => {
                  stopIntro();
                  setIsExpanded((prev) => !prev);
                }}
                className="size-3 cursor-pointer rounded-full bg-[#27C93F] transition-transform hover:scale-110"
              />
            </div>

            <span
              className={cn(
                "font-mono text-[11px] font-medium",
                isGhDark ? "text-white/65" : "text-black/60"
              )}
            >
              {profile.username} README.md
            </span>

            <div className="flex items-center gap-2">
              <button
                type="button"
                aria-label={
                  isGhDark
                    ? "Switch preview to GitHub light"
                    : "Switch preview to GitHub dark"
                }
                onClick={() => {
                  stopIntro();
                  setIsGhDark((prev) => !prev);
                }}
                className={cn(
                  "inline-flex size-6 cursor-pointer items-center justify-center rounded-[6px] transition-colors",
                  isGhDark
                    ? "bg-white/8 text-white/80 hover:bg-white/15"
                    : "bg-black/6 text-black/70 hover:bg-black/12"
                )}
              >
                {isGhDark ? (
                  <Sun className="size-3.5" />
                ) : (
                  <Moon className="size-3.5" />
                )}
              </button>
              <span
                className={cn(
                  "hidden rounded-full px-2 py-0.5 font-mono text-[10px] font-medium sm:inline-block",
                  isGhDark
                    ? "bg-white/8 text-white/65"
                    : "bg-black/6 text-black/60"
                )}
              >
                848px
              </span>
            </div>
          </div>

          {/* Window body: left README parts list + center preview + right settings */}
          <div className="grid md:grid-cols-[172px_minmax(0,1fr)] lg:grid-cols-[172px_minmax(0,1fr)_188px]">
            <div
              className={cn(
                "border-b p-3 md:border-r md:border-b-0",
                isGhDark
                  ? "border-white/10 bg-[#12161d]"
                  : "border-black/8 bg-[#F5F2EC]"
              )}
            >
              <div
                className={cn(
                  "mb-2 flex items-center gap-1.5 px-2 text-[11px] font-semibold",
                  isGhDark ? "text-white/50" : "text-black/45"
                )}
              >
                <FolderOpen className="size-3.5" />
                <span>README map</span>
              </div>
              <div className="flex gap-1 overflow-x-auto md:flex-col">
                {MAP_PARTS.map((part) => {
                  const selected = activePart === part.id;
                  return (
                    <button
                      key={part.id}
                      type="button"
                      onClick={() => {
                        stopIntro();
                        setActivePart(part.id);
                      }}
                      className={cn(
                        "flex shrink-0 cursor-pointer items-center justify-between rounded-[8px] px-2.5 py-2 text-left text-[13px] transition-colors duration-150",
                        selected
                          ? isGhDark
                            ? "bg-white/12 font-semibold text-white"
                            : "bg-black/10 font-semibold text-[#111111]"
                          : isGhDark
                            ? "text-white/65 hover:bg-white/6 hover:text-white"
                            : "text-black/65 hover:bg-black/5 hover:text-[#111111]"
                      )}
                    >
                      <span>{part.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div
              className={cn(
                "relative min-h-[340px] max-h-[390px] overflow-y-auto p-5 sm:p-6",
                isGhDark ? "bg-[#0d1117]" : "bg-[#ffffff]"
              )}
            >
              {previewMode === "visual" ? (
                <div
                  key={profile.id}
                  className={cn(
                    "mx-auto max-w-[740px] origin-top transition-opacity duration-200",
                    bannerAnimating && "home-crop-settle"
                  )}
                >
                  <AdvancedMarkdownPreview
                    markdown={markdown}
                    isDark={isGhDark}
                    imageUrlMap={HERO_BANNER_IMAGE_MAP}
                  />
                </div>
              ) : (
                <pre
                  className={cn(
                    "mx-auto max-w-[740px] overflow-x-auto rounded-[10px] p-4 font-mono text-[12px] leading-relaxed whitespace-pre-wrap",
                    isGhDark
                      ? "bg-[#161b22] text-[#e6edf3]"
                      : "bg-[#f6f8fa] text-[#1f2328]"
                  )}
                >
                  {markdown}
                </pre>
              )}
            </div>

            {/* Right Settings mini-panel matching the live editor */}
            <div
              className={cn(
                "hidden flex-col gap-3 border-l p-3 lg:flex",
                isGhDark
                  ? "border-white/10 bg-[#12161d] text-white/80"
                  : "border-black/8 bg-[#F5F2EC] text-black/80"
              )}
            >
              <div
                className={cn(
                  "grid grid-cols-3 gap-1 rounded-[8px] p-1 text-[10px] font-medium",
                  isGhDark ? "bg-black/25" : "bg-black/6"
                )}
              >
                {(
                  [
                    { id: "part", label: "Part" },
                    { id: "format", label: "Format" },
                    { id: "page", label: "Page" },
                  ] as const
                ).map((tab) => {
                  const isTabActive = settingsTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={() => {
                        stopIntro();
                        setSettingsTab(tab.id);
                      }}
                      className={cn(
                        "cursor-pointer rounded-[6px] py-1 text-center transition-colors",
                        isTabActive
                          ? isGhDark
                            ? "bg-white/12 font-semibold text-white"
                            : "bg-white font-semibold text-black shadow-xs"
                          : "opacity-65 hover:opacity-100"
                      )}
                    >
                      {tab.label}
                    </button>
                  );
                })}
              </div>

              {settingsTab === "part" && (
                <div className="flex flex-col gap-2">
                  <span className="text-[10px] font-medium opacity-60">
                    Active part: {activePart}
                  </span>
                  <button
                    type="button"
                    onClick={handleAddBadge}
                    className={cn(
                      "cursor-pointer rounded-[8px] px-2.5 py-2 text-left text-[11px] font-medium transition-colors",
                      isGhDark
                        ? "bg-white/10 text-white hover:bg-white/15"
                        : "bg-black/6 text-black hover:bg-black/10"
                    )}
                  >
                    Add tech badge
                  </button>
                  <button
                    type="button"
                    onClick={handleInsertImage}
                    className={cn(
                      "cursor-pointer rounded-[8px] px-2.5 py-2 text-left text-[11px] font-medium transition-colors",
                      isGhDark
                        ? "bg-white/10 text-white hover:bg-white/15"
                        : "bg-black/6 text-black hover:bg-black/10"
                    )}
                  >
                    {bannerVisible ? "Hide banner" : "Show banner"}
                  </button>
                </div>
              )}

              {settingsTab === "format" && (
                <div className="flex flex-col gap-2.5">
                  <div className="flex flex-col gap-1">
                    <span className="text-[10px] font-medium opacity-60">
                      Preview mode
                    </span>
                    <div
                      className={cn(
                        "grid grid-cols-2 gap-1 rounded-[8px] p-1 text-[11px]",
                        isGhDark ? "bg-black/25" : "bg-black/6"
                      )}
                    >
                      <button
                        type="button"
                        onClick={() => {
                          stopIntro();
                          setPreviewMode("visual");
                        }}
                        className={cn(
                          "cursor-pointer rounded-[6px] py-1 text-center font-medium transition-colors",
                          previewMode === "visual"
                            ? isGhDark
                              ? "bg-white/14 text-white"
                              : "bg-white text-black shadow-xs"
                            : "opacity-65 hover:opacity-100"
                        )}
                      >
                        Visual
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          stopIntro();
                          setPreviewMode("markdown");
                        }}
                        className={cn(
                          "cursor-pointer rounded-[6px] py-1 text-center font-medium transition-colors",
                          previewMode === "markdown"
                            ? isGhDark
                              ? "bg-white/14 text-white"
                              : "bg-white text-black shadow-xs"
                            : "opacity-65 hover:opacity-100"
                        )}
                      >
                        Code
                      </button>
                    </div>
                  </div>

                  <div className="flex flex-col gap-1">
                    <span className="text-[10px] font-medium opacity-60">
                      Surface
                    </span>
                    <div
                      className={cn(
                        "grid grid-cols-2 gap-1 rounded-[8px] p-1 text-[11px]",
                        isGhDark ? "bg-black/25" : "bg-black/6"
                      )}
                    >
                      <button
                        type="button"
                        onClick={() => {
                          stopIntro();
                          setIsGhDark(false);
                        }}
                        className={cn(
                          "cursor-pointer rounded-[6px] py-1 text-center font-medium transition-colors",
                          !isGhDark
                            ? "bg-white text-black shadow-xs"
                            : "opacity-65 hover:opacity-100"
                        )}
                      >
                        Light
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          stopIntro();
                          setIsGhDark(true);
                        }}
                        className={cn(
                          "cursor-pointer rounded-[6px] py-1 text-center font-medium transition-colors",
                          isGhDark
                            ? "bg-white/14 text-white"
                            : "opacity-65 hover:opacity-100"
                        )}
                      >
                        Dark
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {settingsTab === "page" && (
                <>
                  <div className="flex flex-col gap-1.5">
                    <span className="text-[10px] font-medium opacity-60">
                      Structure preset
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        stopIntro();
                        setStructurePreset("full");
                        setProfileIndex(0);
                        setBadgeIds(HERO_MOCK_PROFILES[0].badgeIds);
                        setBannerVisible(true);
                      }}
                      className={cn(
                        "cursor-pointer rounded-[8px] px-2.5 py-2 text-left text-[11px] transition-colors",
                        structurePreset === "full"
                          ? isGhDark
                            ? "bg-white/10 font-semibold text-white"
                            : "bg-black/8 font-semibold text-black"
                          : "opacity-65 hover:opacity-100"
                      )}
                    >
                      Full Developer Profile
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        stopIntro();
                        setStructurePreset("minimal");
                        setProfileIndex(1);
                        setBadgeIds(HERO_MOCK_PROFILES[1].badgeIds);
                        setBannerVisible(false);
                      }}
                      className={cn(
                        "cursor-pointer rounded-[8px] px-2.5 py-1.5 text-left text-[11px] transition-colors",
                        structurePreset === "minimal"
                          ? isGhDark
                            ? "bg-white/10 font-semibold text-white"
                            : "bg-black/8 font-semibold text-black"
                          : "opacity-65 hover:opacity-100"
                      )}
                    >
                      Minimalist Header
                    </button>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <span className="text-[10px] font-medium opacity-60">
                      Alignment
                    </span>
                    <div
                      className={cn(
                        "grid grid-cols-2 gap-1 rounded-[8px] p-1 text-[11px]",
                        isGhDark ? "bg-black/25" : "bg-black/6"
                      )}
                    >
                      <button
                        type="button"
                        onClick={() => {
                          stopIntro();
                          setLinksAlign("left");
                        }}
                        className={cn(
                          "cursor-pointer rounded-[6px] py-1 text-center font-medium transition-colors",
                          linksAlign === "left"
                            ? isGhDark
                              ? "bg-white/14 text-white"
                              : "bg-white text-black shadow-xs"
                            : "opacity-65 hover:opacity-100"
                        )}
                      >
                        Left
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          stopIntro();
                          setLinksAlign("center");
                        }}
                        className={cn(
                          "cursor-pointer rounded-[6px] py-1 text-center font-medium transition-colors",
                          linksAlign === "center"
                            ? isGhDark
                              ? "bg-white/14 text-white"
                              : "bg-white text-black shadow-xs"
                            : "opacity-65 hover:opacity-100"
                        )}
                      >
                        Center
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Glass Publish Demo Toast */}
        {publishToast !== "idle" && (
          <div
            role="status"
            aria-live="polite"
            className="home-glass absolute bottom-3 left-1/2 z-30 flex -translate-x-1/2 items-center gap-2 rounded-full px-4 py-1.5 text-[12px] font-medium text-white shadow-2xl"
          >
            <span
              className={cn(
                "size-2 rounded-full",
                publishToast === "uploading"
                  ? "bg-[#FFA033]"
                  : "bg-[var(--live)]"
              )}
            />
            <span>
              {publishToast === "uploading"
                ? "Uploading README.md"
                : "Published (demo)"}
            </span>
          </div>
        )}
      </div>

      {/* Bottom glass dock of 9 52px rounded gradient icons */}
      <div className="relative z-20 flex items-end justify-center pt-1">
        <div
          role="toolbar"
          aria-label="Interactive feature dock"
          onPointerMove={handleDockPointerMove}
          onPointerLeave={() => {
            handleDockPointerLeave();
            setHoveredDockId(null);
          }}
          className="home-glass inline-flex max-w-full items-end gap-2.5 overflow-x-auto rounded-[22px] px-4 py-3 sm:gap-4 sm:overflow-visible sm:px-5"
        >
          {DOCK_ITEMS.map((item, index) => {
            const Icon = item.Icon;
            const active = isDockActive(item.id);
            const showTooltip = hoveredDockId === item.id;
            const bouncing = bouncingDockId === item.id;

            return (
              <div
                key={item.id}
                className="relative flex flex-col items-center gap-1"
              >
                {showTooltip && (
                  <span
                    role="tooltip"
                    className="pointer-events-none absolute -top-12 left-1/2 z-50 hidden -translate-x-1/2 rounded-[8px] border border-white/14 bg-[#0B0B0C] px-2.5 py-1 text-[11px] font-medium whitespace-nowrap text-white shadow-lg sm:block"
                  >
                    {item.label}
                  </span>
                )}

                <button
                  ref={registerDockItem(index)}
                  data-dock-btn="true"
                  type="button"
                  aria-label={item.label}
                  onMouseEnter={() => setHoveredDockId(item.id)}
                  onFocus={() => setHoveredDockId(item.id)}
                  onBlur={() => setHoveredDockId(null)}
                  onKeyDown={(e) => handleDockKeyDown(e, index)}
                  onClick={() => handleDockAction(item.id)}
                  style={{ background: item.gradient }}
                  className={cn(
                    "flex size-[52px] shrink-0 origin-bottom cursor-pointer items-center justify-center rounded-[14px] text-white shadow-md transition-transform duration-150 ease-out will-change-transform focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white",
                    bouncing && "home-dock-bounce"
                  )}
                >
                  <Icon className="size-5" />
                </button>

                <span
                  aria-hidden="true"
                  className={cn(
                    "size-1 rounded-full transition-opacity duration-150",
                    active ? "bg-white opacity-100" : "opacity-0"
                  )}
                />
              </div>
            );
          })}
        </div>

        {/* Bottom right Interactive demo pill */}
        <span className="home-glass pointer-events-none absolute right-0 bottom-0 hidden rounded-full px-3 py-1 text-[11px] font-medium text-white/80 lg:inline-flex">
          Interactive demo
        </span>
      </div>
            </div>
          </div>
        </div>
      </div>

      {/* Realistic MacBook Pro aluminum lower chassis lip and thumb notch */}
      <div
        aria-hidden="true"
        className="relative mx-auto -mt-[2px] h-[12px] w-[103%] -ml-[1.5%] rounded-b-[14px] bg-gradient-to-b from-[#3f4249] via-[#27292f] to-[#15161a] shadow-[0_18px_36px_rgba(0,0,0,0.7)] ring-1 ring-white/10 sm:h-[15px]"
      >
        <div className="mx-auto h-[5px] w-[96px] rounded-b-[6px] bg-[#131418] shadow-inner sm:h-[6px] sm:w-[120px]" />
      </div>
    </div>
  );
}
