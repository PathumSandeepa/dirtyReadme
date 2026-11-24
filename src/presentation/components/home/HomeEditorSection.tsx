"use client";

import { useEffect, useRef, useState } from "react";
import { Blocks, FileText, Heading, Link2, Sparkles } from "lucide-react";
import { cn } from "cn";
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
    title: "Optional creature",
    body: "An optional animated banner at the bottom.",
    position: "top" as const,
    Icon: Sparkles,
    xPercent: 90,
  },
] as const;

export function HomeEditorSection() {
  const diagramRef = useRef<HTMLDivElement | null>(null);
  const [drawn, setDrawn] = useState(false);
  const [highlightedId, setHighlightedId] = useState<string | null>(null);

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

        {/* Three-zone CSS wireframe framed on .wall-lagoon */}
        <Reveal stagger={100} className="mt-14">
          <div className="wall-lagoon p-3 shadow-[0_28px_80px_rgba(0,0,0,0.65)] sm:p-5 md:p-7">
            <div className="home-glass overflow-hidden rounded-[16px] p-3 sm:p-4">
              <div className="grid gap-3 md:grid-cols-[200px_minmax(0,1fr)_220px]">
                {/* Left zone: parts and blocks */}
                <div className="rounded-[12px] border border-white/10 bg-[#0B0B0C] p-3.5">
                  <div className="font-mono text-[11px] uppercase tracking-[0.1em] text-[var(--home-text-3)]">
                    Parts and blocks
                  </div>
                  <div className="mt-3 space-y-1.5 text-[13px]">
                    {EDITOR_BLOCKS.map((block) => (
                      <div
                        key={block.id}
                        className={cn(
                          "rounded-[8px] px-2.5 py-1.5 transition-colors",
                          highlightedId === block.id ||
                            (highlightedId === null && block.id === "header")
                            ? "bg-white/12 font-semibold text-white"
                            : "text-[var(--home-text-2)]"
                        )}
                      >
                        {block.title}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Center zone: README canvas */}
                <div className="rounded-[12px] border border-white/10 bg-[#FAF8F4] p-5 text-[#171717]">
                  <div className="flex items-center justify-between border-b border-black/8 pb-2.5 font-mono text-[11px] text-black/55">
                    <span>README.md</span>
                    <span>848px canvas</span>
                  </div>
                  <div className="mt-4 space-y-3">
                    <div className="home-display text-[20px] font-extrabold tracking-[-0.03em] text-[#111111]">
                      Hi, I am The Octocat
                    </div>
                    <p className="text-[13px] leading-relaxed text-black/65">
                      Building fast developer tools and open source libraries.
                    </p>
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      <span className="rounded-[5px] bg-[#3178C6] px-2.5 py-1 font-mono text-[11px] font-semibold text-white">
                        TypeScript
                      </span>
                      <span className="rounded-[5px] bg-[#181717] px-2.5 py-1 font-mono text-[11px] font-semibold text-white">
                        Next.js
                      </span>
                      <span className="rounded-[5px] bg-[#06B6D4] px-2.5 py-1 font-mono text-[11px] font-semibold text-[#111111]">
                        Tailwind
                      </span>
                    </div>
                  </div>
                </div>

                {/* Right zone: settings */}
                <div className="rounded-[12px] border border-white/10 bg-[#0B0B0C] p-3.5">
                  <div className="font-mono text-[11px] uppercase tracking-[0.1em] text-[var(--home-text-3)]">
                    Settings
                  </div>
                  <div className="mt-3 space-y-2.5 text-[12px]">
                    <div className="flex items-center justify-between rounded-[8px] bg-white/[0.04] px-2.5 py-2 text-white/85">
                      <span>Alignment</span>
                      <span className="font-mono text-[var(--amber-label)]">
                        Center
                      </span>
                    </div>
                    <div className="flex items-center justify-between rounded-[8px] bg-white/[0.04] px-2.5 py-2 text-white/85">
                      <span>Surface</span>
                      <span className="font-mono text-white/65">Light</span>
                    </div>
                    <div className="flex items-center justify-between rounded-[8px] bg-white/[0.04] px-2.5 py-2 text-white/85">
                      <span>Links row</span>
                      <span className="font-mono text-[var(--live)]">On</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
