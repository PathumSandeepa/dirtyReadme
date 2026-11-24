"use client";

import { Check, Copy, Search } from "lucide-react";
import { Reveal } from "./Reveal";

const HOW_IT_WORKS_STEPS = [
  {
    number: "01",
    title: "Connect",
    description: "Enter your GitHub username to load public profile details.",
  },
  {
    number: "02",
    title: "Repository",
    description: "Confirm your public username repository is ready.",
  },
  {
    number: "03",
    title: "Customize",
    description: "Edit sections, templates, badges, and links live.",
  },
  {
    number: "04",
    title: "Publish",
    description: "Push README.md and assets in one atomic commit.",
  },
] as const;

function StepVisual({ index }: { index: number }) {
  if (index === 0) {
    return (
      <div className="mt-5 rounded-[12px] border border-white/10 bg-[#0B0B0C] p-3">
        <div className="flex items-center gap-2 rounded-[8px] border border-white/10 bg-white/[0.04] px-2.5 py-2 font-mono text-[12px] text-white/85">
          <Search className="size-3.5 text-[var(--amber-label)]" />
          <span>octocat</span>
        </div>
      </div>
    );
  }

  if (index === 1) {
    return (
      <div className="mt-5 rounded-[12px] border border-white/10 bg-[#0B0B0C] p-3">
        <div className="flex items-center justify-between gap-2 rounded-[8px] border border-white/10 bg-white/[0.04] px-2.5 py-2 font-mono text-[12px] text-white/85">
          <span className="truncate">octocat/octocat</span>
          <Copy className="size-3.5 shrink-0 text-[var(--home-text-2)]" />
        </div>
      </div>
    );
  }

  if (index === 2) {
    return (
      <div className="mt-5 rounded-[12px] border border-white/10 bg-[#0B0B0C] p-3">
        <div className="space-y-1.5 text-[11px] font-medium">
          <div className="rounded-[6px] bg-white/12 px-2.5 py-1 text-white">
            Header
          </div>
          <div className="rounded-[6px] px-2.5 py-1 text-[var(--home-text-2)]">
            Tech stack
          </div>
          <div className="rounded-[6px] px-2.5 py-1 text-[var(--home-text-2)]">
            Links
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-5 rounded-[12px] border border-white/10 bg-[#0B0B0C] p-3">
      <div className="space-y-1.5 text-[11px]">
        {["Build README.md", "Commit to main", "Published"].map((label) => (
          <div
            key={label}
            className="flex items-center gap-2 text-white/85"
          >
            <span className="inline-flex size-4 items-center justify-center rounded-full bg-[#58d6b0]/20 text-[var(--live)]">
              <Check className="size-2.5" />
            </span>
            <span>{label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export function HomeHowItWorksSection() {
  return (
    <section
      id="how-it-works"
      aria-labelledby="how-it-works-heading"
      className="home-section-below px-4 py-24 sm:px-6 sm:py-32"
    >
      <div className="mx-auto max-w-[1160px]">
        <Reveal className="flex flex-col items-center text-center">
          <p className="home-section-label">How it works</p>
          <h2
            id="how-it-works-heading"
            className="home-h2 home-gradient-text mt-3"
          >
            From username to published README.
          </h2>
        </Reveal>

        <div className="mt-14">
          <div className="relative grid grid-cols-2 gap-4 lg:grid-cols-4 lg:gap-5">
            {HOW_IT_WORKS_STEPS.map((step, index) => (
              <Reveal key={step.number} stagger={index * 70}>
                <div className="home-glass flex h-full flex-col justify-between rounded-[20px] p-5 sm:p-6">
                  <div>
                    <div className="home-display text-[32px] leading-none font-extrabold tracking-[-0.04em] text-[var(--amber-label)] sm:text-[38px]">
                      {step.number}
                    </div>
                    <h3 className="mt-4 text-[18px] font-semibold tracking-[-0.02em] text-white">
                      {step.title}
                    </h3>
                    <p className="mt-1.5 text-[14px] leading-relaxed text-[var(--home-text-2)]">
                      {step.description}
                    </p>
                  </div>

                  <StepVisual index={index} />
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
