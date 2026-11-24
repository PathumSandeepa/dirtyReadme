"use client";

import { useState } from "react";
import { GripVertical, X } from "lucide-react";
import { cn } from "cn";
import {
  HOME_FACTS,
  STACK_DEMO_BADGES,
  STACK_DEMO_PLATFORMS,
  getContrastingInk,
  normalizeHex,
} from "./homeData";
import { Reveal } from "./Reveal";
import { useDockMagnification } from "./useDockMagnification";
import { useReducedMotion } from "./useReducedMotion";

const STACK_FEATURES = [
  {
    title: `${HOME_FACTS.techBadgeCount} built in badges`,
    description: `Search ${HOME_FACTS.techBadgeCount} built in badges across ${HOME_FACTS.techCategoryCount} categories or create your own custom shields.`,
  },
  {
    title: "Drag and arrange",
    description:
      "Group technologies into stack cards, reorder them cleanly and hide or show any card.",
  },
  {
    title: "Links that know their icons",
    description:
      "Paste any profile URL and the matching platform icon and color are picked automatically.",
  },
  {
    title: "Match your style",
    description:
      "Control text alignment, banner width and layout structure presets without hand editing Markdown.",
  },
] as const;

export function HomeStackSection() {
  const reducedMotion = useReducedMotion();
  const [hoveredFeature, setHoveredFeature] = useState<number | null>(0);

  const badgeDock = useDockMagnification({
    maxScale: 1.24,
    radius: 136,
    lift: 6,
    disabled: reducedMotion,
  });

  const linksDock = useDockMagnification({
    maxScale: 1.22,
    radius: 120,
    lift: 6,
    disabled: reducedMotion,
  });

  return (
    <section
      id="stack"
      className="home-section-below px-4 py-20 sm:px-6 sm:py-28"
    >
      <div className="mx-auto max-w-[1160px]">
        <Reveal className="flex flex-col items-center text-center">
          <div className="home-section-label">Stack and links</div>
          <h2 className="home-h2 home-gradient-text mt-3 mb-2 pb-1">
            Show what you build with.
          </h2>
        </Reveal>

        <div className="mt-14 grid items-center gap-10 lg:grid-cols-12 lg:gap-12">
          {/* Left picture / interactive showcase on .wall-sunset */}
          <Reveal className="lg:col-span-7">
            <div className="wall-sunset p-5 shadow-[0_28px_80px_rgba(0,0,0,0.65)] sm:p-7">
              <div className="home-glass rounded-[18px] p-5 sm:p-7">
                <div className="flex items-center justify-between gap-2">
                  <span className="home-mono-caption text-[var(--home-text-2)]">
                    Tech stack card
                  </span>
                  <span className="font-mono text-[11px] text-[var(--home-text-3)]">
                    Hover badges
                  </span>
                </div>

                {/* Dock-magnifying row of real tech badges */}
                <div
                  onPointerMove={badgeDock.onPointerMove}
                  onPointerLeave={badgeDock.onPointerLeave}
                  className="mt-5 flex flex-wrap items-end justify-center gap-2 py-3"
                >
                  {STACK_DEMO_BADGES.map((badge, index) => (
                    <div
                      key={badge.id}
                      ref={badgeDock.registerItem(index)}
                      style={{
                        backgroundColor: normalizeHex(badge.color),
                        color: getContrastingInk(badge.color),
                      }}
                      className="inline-flex origin-bottom items-center gap-1.5 rounded-[7px] py-1.5 pr-2 pl-2 font-mono text-[12px] font-semibold shadow-sm transition-transform duration-150 ease-out will-change-transform select-none"
                    >
                      <GripVertical
                        className="size-3 opacity-60"
                        aria-hidden="true"
                      />
                      <span>{badge.label}</span>
                      <span
                        aria-hidden="true"
                        className="inline-flex size-3.5 items-center justify-center rounded-full bg-black/15 opacity-75"
                      >
                        <X className="size-2.5" />
                      </span>
                    </div>
                  ))}
                </div>

                {/* Real link button row */}
                <div className="mt-6 border-t border-[var(--home-line)] pt-5">
                  <div className="home-mono-caption mb-3 text-[var(--home-text-2)]">
                    Profile links
                  </div>
                  <div
                    onPointerMove={linksDock.onPointerMove}
                    onPointerLeave={linksDock.onPointerLeave}
                    className="flex flex-wrap items-end gap-2.5 py-1"
                  >
                    {STACK_DEMO_PLATFORMS.map((platform, index) => {
                      const label =
                        platform.id === "x" ? "X" : platform.label;
                      return (
                        <span
                          key={platform.id}
                          ref={linksDock.registerItem(index)}
                          style={{
                            backgroundColor: normalizeHex(platform.hex),
                            color: getContrastingInk(platform.hex),
                          }}
                          className="inline-flex origin-bottom items-center gap-2 rounded-[8px] px-3 py-1.5 text-[12px] font-semibold shadow-sm transition-transform duration-150 ease-out will-change-transform select-none"
                        >
                          <svg
                            viewBox="0 0 24 24"
                            width={14}
                            height={14}
                            fill="currentColor"
                            aria-hidden="true"
                          >
                            <path d={platform.svgPath} />
                          </svg>
                          <span>{label}</span>
                        </span>
                      );
                    })}
                  </div>
                </div>
              </div>

              <div className="mt-4 flex justify-end">
                <span className="home-glass rounded-full px-3 py-1 font-mono text-[11px] text-white/80">
                  Example
                </span>
              </div>
            </div>
          </Reveal>

          {/* Right feature list with thin 2px vertical amber rule */}
          <div className="flex flex-col gap-6 lg:col-span-5">
            {STACK_FEATURES.map((item, index) => {
              const active = hoveredFeature === index;
              return (
                <Reveal key={item.title} stagger={index * 70}>
                  <div
                    onMouseEnter={() => setHoveredFeature(index)}
                    onMouseLeave={() => setHoveredFeature(0)}
                    className="relative pl-5"
                  >
                    <span
                      aria-hidden="true"
                      className="absolute inset-y-0 left-0 w-[2px] rounded-full bg-white/10"
                    />
                    <span
                      aria-hidden="true"
                      className={cn(
                        "absolute inset-y-0 left-0 w-[2px] origin-top rounded-full bg-[var(--amber-label)] transition-transform duration-300 ease-out",
                        active ? "scale-y-100" : "scale-y-[0.35] opacity-60"
                      )}
                    />
                    <h3 className="text-[19px] font-semibold tracking-[-0.02em] text-white">
                      {item.title}
                    </h3>
                    <p className="mt-1.5 text-[15px] leading-relaxed text-[var(--home-text-2)]">
                      {item.description}
                    </p>
                  </div>
                </Reveal>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
