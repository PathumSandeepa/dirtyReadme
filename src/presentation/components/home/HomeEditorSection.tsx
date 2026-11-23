"use client";

import { useEffect, useRef, useState } from "react";
import { Blocks, FileText, Fish, Heading, Link2 } from "lucide-react";
import { cn } from "cn";
import { homeAsset } from "./homeData";
import { Reveal } from "./Reveal";

const EDITOR_BLOCKS = [
  {
    id: "header",
    title: "Header",
    body: "Title and role line. Live as you type.",
    position: "top" as const,
    Icon: Heading,
    xPercent: 10,
  },
  {
    id: "about",
    title: "About",
    body: "Short bio with dynamic values like your commit count.",
    position: "bottom" as const,
    Icon: FileText,
    xPercent: 30,
  },
  {
    id: "stack",
    title: "Tech stack",
    body: "More than 200 badges in cards you can drag.",
    position: "top" as const,
    Icon: Blocks,
    xPercent: 50,
  },
  {
    id: "links",
    title: "Links",
    body: "Platform buttons that pick their icons for you.",
    position: "bottom" as const,
    Icon: Link2,
    xPercent: 70,
  },
  {
    id: "creature",
    title: "Creature",
    body: "Always at the bottom of the README.",
    position: "top" as const,
    Icon: Fish,
    xPercent: 90,
  },
] as const;

export function HomeEditorSection() {
  const diagramRef = useRef<HTMLDivElement | null>(null);
  const [drawn, setDrawn] = useState(false);
  const [highlightedId, setHighlightedId] = useState<string | null>(null);
  const [imgFailed, setImgFailed] = useState(false);

  useEffect(() => {
    const node = diagramRef.current;
    if (!node) return;
    if (typeof IntersectionObserver === "undefined") {
      queueMicrotask(() => setDrawn(true));
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setDrawn(true);
            observer.disconnect();
            break;
          }
        }
      },
      { threshold: 0.2 }
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return (
    <section
      id="editor"
      aria-labelledby="editor-heading"
      className="home-section-below px-4 py-24 sm:px-6 sm:py-32"
    >
      <div className="mx-auto max-w-[1160px]">
        <Reveal className="flex flex-col items-center text-center">
          <div className="home-section-label">The editor</div>
          <h2
            id="editor-heading"
            className="home-h2 home-gradient-text mt-3"
          >
            Edit it right where it shows.
          </h2>
          <p className="home-subcopy mt-5">
            Click any part of your GitHub profile and type straight inside the
            848px README canvas.
          </p>
        </Reveal>

        {/* Desktop alternating SVG bracket callout diagram */}
        <div
          ref={diagramRef}
          className="mt-16 hidden min-[900px]:block"
        >
          {/* Top callout row: Header, Tech stack, Creature */}
          <div className="grid grid-cols-5 gap-4">
            {EDITOR_BLOCKS.map((block) =>
              block.position === "top" ? (
                <button
                  key={block.id}
                  type="button"
                  onMouseEnter={() => setHighlightedId(block.id)}
                  onMouseLeave={() => setHighlightedId(null)}
                  onFocus={() => setHighlightedId(block.id)}
                  onBlur={() => setHighlightedId(null)}
                  className={cn(
                    "cursor-pointer rounded-[14px] border p-3.5 text-left transition-colors duration-150",
                    highlightedId === block.id
                      ? "border-white/24 bg-white/[0.08]"
                      : "border-transparent bg-transparent hover:bg-white/[0.04]"
                  )}
                >
                  <div className="text-[15px] font-semibold text-white">
                    {block.title}
                  </div>
                  <p className="mt-1 text-[13px] leading-relaxed text-[var(--home-text-2)]">
                    {block.body}
                  </p>
                </button>
              ) : (
                <div key={block.id} aria-hidden="true" />
              )
            )}
          </div>

          {/* Top SVG bracket lines */}
          <svg
            viewBox="0 0 1000 56"
            className="h-14 w-full overflow-visible"
            fill="none"
            aria-hidden="true"
          >
            {EDITOR_BLOCKS.filter((b) => b.position === "top").map(
              (block, idx) => {
                const x = block.xPercent * 10;
                const active = highlightedId === block.id;
                return (
                  <g key={block.id}>
                    <path
                      d={`M ${x} 4 L ${x} 32 L ${x} 52`}
                      pathLength={1}
                      data-drawn={drawn ? "true" : "false"}
                      style={{ transitionDelay: `${idx * 100}ms` }}
                      stroke={
                        active ? "#FFA033" : "rgba(255,255,255,0.22)"
                      }
                      strokeWidth={active ? 2 : 1.25}
                      className="home-bracket-path"
                    />
                    <circle
                      cx={x}
                      cy={52}
                      r={3}
                      fill={active ? "#FFA033" : "rgba(255,255,255,0.4)"}
                    />
                  </g>
                );
              }
            )}
          </svg>

          {/* Center wide glass README wireframe shelf */}
          <div className="home-glass grid grid-cols-5 gap-3 rounded-[20px] p-4">
            {EDITOR_BLOCKS.map((block) => {
              const Icon = block.Icon;
              const active = highlightedId === block.id;
              return (
                <button
                  key={block.id}
                  type="button"
                  onMouseEnter={() => setHighlightedId(block.id)}
                  onMouseLeave={() => setHighlightedId(null)}
                  onFocus={() => setHighlightedId(block.id)}
                  onBlur={() => setHighlightedId(null)}
                  className={cn(
                    "flex cursor-pointer flex-col items-center justify-center gap-2.5 rounded-[14px] border px-3 py-5 text-center transition-colors duration-150",
                    active
                      ? "border-white/28 bg-white/[0.12] text-white"
                      : "border-[var(--home-line)] bg-[var(--home-surface-2)]/85 text-[var(--home-text-2)] hover:text-white"
                  )}
                >
                  <span className="flex size-10 items-center justify-center rounded-[10px] bg-white/[0.07] text-white">
                    <Icon className="size-5" />
                  </span>
                  <span className="text-[14px] font-semibold text-white">
                    {block.title}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Bottom SVG bracket lines */}
          <svg
            viewBox="0 0 1000 56"
            className="h-14 w-full overflow-visible"
            fill="none"
            aria-hidden="true"
          >
            {EDITOR_BLOCKS.filter((b) => b.position === "bottom").map(
              (block, idx) => {
                const x = block.xPercent * 10;
                const active = highlightedId === block.id;
                return (
                  <g key={block.id}>
                    <circle
                      cx={x}
                      cy={4}
                      r={3}
                      fill={active ? "#FFA033" : "rgba(255,255,255,0.4)"}
                    />
                    <path
                      d={`M ${x} 4 L ${x} 24 L ${x} 52`}
                      pathLength={1}
                      data-drawn={drawn ? "true" : "false"}
                      style={{ transitionDelay: `${(idx + 3) * 100}ms` }}
                      stroke={
                        active ? "#FFA033" : "rgba(255,255,255,0.22)"
                      }
                      strokeWidth={active ? 2 : 1.25}
                      className="home-bracket-path"
                    />
                  </g>
                );
              }
            )}
          </svg>

          {/* Bottom callout row: About, Links */}
          <div className="grid grid-cols-5 gap-4">
            {EDITOR_BLOCKS.map((block) =>
              block.position === "bottom" ? (
                <button
                  key={block.id}
                  type="button"
                  onMouseEnter={() => setHighlightedId(block.id)}
                  onMouseLeave={() => setHighlightedId(null)}
                  onFocus={() => setHighlightedId(block.id)}
                  onBlur={() => setHighlightedId(null)}
                  className={cn(
                    "cursor-pointer rounded-[14px] border p-3.5 text-left transition-colors duration-150",
                    highlightedId === block.id
                      ? "border-white/24 bg-white/[0.08]"
                      : "border-transparent bg-transparent hover:bg-white/[0.04]"
                  )}
                >
                  <div className="text-[15px] font-semibold text-white">
                    {block.title}
                  </div>
                  <p className="mt-1 text-[13px] leading-relaxed text-[var(--home-text-2)]">
                    {block.body}
                  </p>
                </button>
              ) : (
                <div key={block.id} aria-hidden="true" />
              )
            )}
          </div>
        </div>

        {/* Mobile vertical list below 900px */}
        <div className="mt-12 grid gap-3 min-[900px]:hidden">
          {EDITOR_BLOCKS.map((block) => {
            const Icon = block.Icon;
            return (
              <div
                key={block.id}
                className="home-glass flex items-start gap-4 rounded-[16px] p-4"
              >
                <span className="flex size-10 shrink-0 items-center justify-center rounded-[10px] bg-white/[0.07] text-white">
                  <Icon className="size-5" />
                </span>
                <div>
                  <h3 className="text-[16px] font-semibold text-white">
                    {block.title}
                  </h3>
                  <p className="mt-1 text-[14px] leading-relaxed text-[var(--home-text-2)]">
                    {block.body}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Real studio screenshot framed on .wall-lagoon */}
        <Reveal stagger={100} className="mt-14">
          <div className="wall-lagoon p-3 shadow-[0_28px_80px_rgba(0,0,0,0.65)] sm:p-5 md:p-7">
            <div className="home-glass overflow-hidden rounded-[16px] p-1.5 shadow-2xl">
              {!imgFailed ? (
                <img
                  src={homeAsset("editor-map-dark.png")}
                  width={1440}
                  height={960}
                  loading="lazy"
                  onError={() => setImgFailed(true)}
                  alt="ReadmeForge live editor workspace with README map, inline canvas and right inspector"
                  className="block h-auto w-full rounded-[12px]"
                />
              ) : (
                <div className="flex aspect-[3/2] items-center justify-center rounded-[12px] bg-[#0B0B0C] p-8 text-[14px] text-[var(--home-text-2)]">
                  Live README editor preview
                </div>
              )}
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
