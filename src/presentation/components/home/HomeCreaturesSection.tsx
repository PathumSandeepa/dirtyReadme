"use client";

import { useEffect, useRef, useState } from "react";
import {
  CREATURE_CATALOG,
  STAGE_DEFINITIONS,
  type CameraView,
  type CreatureId,
} from "@/domain/creature/entities";
import { Reveal } from "./Reveal";
import { STAGE_DISPLAY_NAMES, showcaseAsset } from "./homeData";
import { useReducedMotion } from "./useReducedMotion";

export function HomeCreaturesSection() {
  const reducedMotion = useReducedMotion();
  const sectionRef = useRef<HTMLElement | null>(null);
  const [creature, setCreature] = useState<CreatureId>("tulkun");
  const [view, setView] = useState<CameraView>("side");
  const [stageIndex, setStageIndex] = useState(3);
  const [userInteracted, setUserInteracted] = useState(false);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const node = sectionRef.current;
    if (!node) return;
    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        setInView(Boolean(entry?.isIntersecting));
      },
      { threshold: 0.25 }
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (reducedMotion || userInteracted || !inView) return;
    const timer = window.setInterval(() => {
      setStageIndex((current) => (current + 1) % STAGE_DEFINITIONS.length);
    }, 4000);
    return () => window.clearInterval(timer);
  }, [reducedMotion, userInteracted, inView]);

  const activeStage = STAGE_DEFINITIONS[stageIndex] ?? STAGE_DEFINITIONS[0];
  const stageName =
    STAGE_DISPLAY_NAMES[activeStage.stage] ?? activeStage.rank;
  const activeCreatureMeta =
    CREATURE_CATALOG.find((item) => item.id === creature) ??
    CREATURE_CATALOG[0];

  const previewSrc =
    creature === "jellyfish"
      ? showcaseAsset("creature-jellyfish.webp")
      : view === "top"
        ? showcaseAsset("view-top.webp")
        : showcaseAsset(`stage-${activeStage.stage}.webp`);

  const previewAlt =
    creature === "jellyfish"
      ? "Animated Pixel Jellyfish preview"
      : view === "top"
        ? "Animated Pixel Tulkun top view preview"
        : `Animated Pixel Tulkun stage ${activeStage.stage} ${stageName} preview`;

  const handleSelectCreature = (next: CreatureId) => {
    setUserInteracted(true);
    setCreature(next);
    if (next === "jellyfish") {
      setView("side");
    }
  };

  const handleSelectView = (next: CameraView) => {
    setUserInteracted(true);
    setView(next);
  };

  const handleSelectStage = (index: number) => {
    setUserInteracted(true);
    setStageIndex(index);
  };

  return (
    <section
      id="creatures"
      ref={sectionRef}
      aria-labelledby="creatures-heading"
      className="home-section-below relative py-28 sm:py-36"
    >
      <div className="mx-auto max-w-[1200px] px-5 sm:px-8">
        <Reveal>
          <p className="home-section-label">Creatures</p>
          <h2
            id="creatures-heading"
            className="home-h2 home-gradient-text mt-4 max-w-[14ch]"
          >
            A little friend that grows.
          </h2>
          <p className="home-subcopy mt-5">
            Pick an animated pixel creature that scales up across five stages as
            your public commits grow.
          </p>
        </Reveal>

        <div className="mt-14 grid grid-cols-1 items-center gap-8 lg:grid-cols-12 lg:gap-10">
          <Reveal className="lg:col-span-7" stagger={0}>
            <div className="wall-ocean p-4 sm:p-6">
              <div className="home-glass overflow-hidden rounded-2xl">
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[var(--home-line)] px-4 py-3">
                  <div
                    role="group"
                    aria-label="Creature species"
                    className="inline-flex rounded-full bg-white/[0.06] p-1"
                  >
                    {CREATURE_CATALOG.map((item) => {
                      const active = creature === item.id;
                      return (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => handleSelectCreature(item.id)}
                          aria-pressed={active}
                          className={`rounded-full px-3 py-1 text-[12px] font-medium transition-colors ${
                            active
                              ? "bg-white text-[#0b0b0c]"
                              : "text-[var(--home-text-2)] hover:text-white"
                          }`}
                        >
                          {item.name}
                        </button>
                      );
                    })}
                  </div>

                  <div className="flex items-center gap-2">
                    {creature === "tulkun" ? (
                      <div
                        role="group"
                        aria-label="Camera angle"
                        className="inline-flex rounded-full bg-white/[0.06] p-1"
                      >
                        {(["side", "top"] as const).map((angle) => {
                          const active = view === angle;
                          return (
                            <button
                              key={angle}
                              type="button"
                              onClick={() => handleSelectView(angle)}
                              aria-pressed={active}
                              className={`rounded-full px-2.5 py-1 text-[12px] font-medium transition-colors ${
                                active
                                  ? "bg-white text-[#0b0b0c]"
                                  : "text-[var(--home-text-2)] hover:text-white"
                              }`}
                            >
                              {angle === "side" ? "Side" : "Top"}
                            </button>
                          );
                        })}
                      </div>
                    ) : null}

                    <span className="home-mono-caption rounded-full border border-[var(--home-line-strong)] bg-black/35 px-2.5 py-1 text-[10px] text-[var(--home-text-2)]">
                      Example values
                    </span>
                  </div>
                </div>

                <div className="relative flex min-h-[290px] flex-col items-center justify-between px-4 py-6 sm:min-h-[340px] sm:px-6">
                  <div className="relative rounded-2xl border border-white/[0.14] bg-black/55 px-4 py-2 text-center shadow-[0_12px_30px_rgba(0,0,0,0.4)]">
                    <p className="text-[13px] font-semibold text-white">
                      Stage {activeStage.stage} {stageName}
                    </p>
                    <p className="mt-0.5 font-mono text-[11px] text-[var(--home-text-2)]">
                      {activeStage.rangeLabel} commits
                    </p>
                    <span
                      aria-hidden="true"
                      className="absolute -bottom-1.5 left-1/2 h-3 w-3 -translate-x-1/2 rotate-45 border-r border-b border-white/[0.14] bg-black/55"
                    />
                  </div>

                  <div
                    key={`${creature}-${view}-${activeStage.stage}`}
                    className="home-stage-pop my-4 flex w-full items-center justify-center"
                  >
                    <img
                      src={previewSrc}
                      alt={previewAlt}
                      width={820}
                      height={340}
                      loading="lazy"
                      className="h-auto max-h-[210px] w-full max-w-[540px] rounded-xl object-contain"
                      style={{ imageRendering: "pixelated" }}
                    />
                  </div>

                  <div className="flex w-full flex-wrap items-center justify-between gap-2 border-t border-[var(--home-line)] pt-3 text-[12px] text-[var(--home-text-2)]">
                    <span className="font-medium text-white">
                      {activeCreatureMeta.name}
                    </span>
                    <span className="font-mono text-[11px] text-[var(--home-text-3)]">
                      {activeStage.sampleCommits.toLocaleString("en-US")}{" "}
                      commits in preview
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </Reveal>

          <Reveal className="lg:col-span-5" stagger={120}>
            <ul className="space-y-2.5" aria-label="Growth stages">
              {STAGE_DEFINITIONS.map((def, idx) => {
                const active = idx === stageIndex;
                const displayName = STAGE_DISPLAY_NAMES[def.stage] ?? def.rank;
                return (
                  <li key={def.stage}>
                    <button
                      type="button"
                      onClick={() => handleSelectStage(idx)}
                      aria-pressed={active}
                      className={`group flex w-full items-start gap-4 rounded-2xl border p-4 text-left transition-colors ${
                        active
                          ? "border-white/[0.18] bg-white/[0.08]"
                          : "border-[var(--home-line)] bg-[var(--home-surface)]/80 hover:border-white/[0.14] hover:bg-white/[0.04]"
                      }`}
                    >
                      <span
                        className={`mt-0.5 font-mono text-[12px] font-semibold ${
                          active
                            ? "text-[var(--amber-label)]"
                            : "text-[var(--home-text-3)]"
                        }`}
                      >
                        0{def.stage}
                      </span>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-baseline justify-between gap-3">
                          <span className="text-[15px] font-semibold text-white">
                            {displayName}
                          </span>
                          <span className="font-mono text-[11px] text-[var(--home-text-2)]">
                            {def.rangeLabel} commits
                          </span>
                        </div>
                        <p className="mt-1 text-[13px] leading-relaxed text-[var(--home-text-2)]">
                          {def.unlocks}
                        </p>
                      </div>
                    </button>
                  </li>
                );
              })}
            </ul>

            <p className="mt-5 text-[14px] leading-relaxed text-[var(--home-text-2)]">
              The creature is optional. You can use your own image instead.
            </p>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
