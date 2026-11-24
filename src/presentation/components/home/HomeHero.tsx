"use client";

import dynamic from "next/dynamic";
import { ArrowRight, Star } from "lucide-react";
import { BRAND } from "@/config/brand";
import { HeroLiveMockSkeleton } from "./HeroLiveMockSkeleton";
import { useGitHubStars } from "./useGitHubStars";
import { useReducedMotion } from "./useReducedMotion";

const HeroLiveMock = dynamic(
  () => import("./HeroLiveMock").then((mod) => mod.HeroLiveMock),
  {
    ssr: false,
    loading: () => <HeroLiveMockSkeleton />,
  }
);

interface HomeHeroProps {
  onStartBuilding: () => void;
}

const LINE_ONE_WORDS = ["Your", "GitHub", "README,"];
const LINE_TWO_WORDS = ["built", "in", "minutes."];

export function HomeHero({ onStartBuilding }: HomeHeroProps) {
  const starCount = useGitHubStars();
  const reducedMotion = useReducedMotion();

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
        {/* Two-line gradient display headline */}
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
          {BRAND.name} is a free and open source README builder. Pick a
          template, edit with a live preview, add badges and links, and push it
          to your GitHub profile. No sign up. No server.
        </p>

        {/* Primary amber CTA with live star pill and transparent outline button */}
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

        <HeroLiveMock />
      </div>
    </section>
  );
}
