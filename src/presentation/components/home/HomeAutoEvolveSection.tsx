"use client";

import { useEffect, useRef, useState } from "react";
import { Check, Copy } from "lucide-react";
import { Reveal } from "./Reveal";
import { WORKFLOW_SNIPPET } from "./homeData";

const TIMELINE_STEPS = [
  {
    title: "You commit",
    description:
      "Push work to your public repositories throughout the day as you normally do.",
    dotClass: "bg-white",
  },
  {
    title: "Midnight run",
    description:
      "GitHub Actions triggers the scheduled workflow at midnight UTC.",
    dotClass: "bg-[var(--amber-label)]",
  },
  {
    title: "README updated",
    description:
      "Your fresh commit total and evolved creature image commit back to your profile repo.",
    dotClass:
      "bg-[var(--live)] shadow-[0_0_0_5px_rgba(88,214,176,0.2)]",
  },
] as const;

export function HomeAutoEvolveSection() {
  const [copied, setCopied] = useState(false);
  const timeoutRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (timeoutRef.current !== null) {
        window.clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(WORKFLOW_SNIPPET);
      setCopied(true);
      if (timeoutRef.current !== null) {
        window.clearTimeout(timeoutRef.current);
      }
      timeoutRef.current = window.setTimeout(() => {
        setCopied(false);
      }, 2000);
    } catch {
      setCopied(false);
    }
  };

  return (
    <section
      id="auto-evolve"
      aria-labelledby="auto-evolve-heading"
      className="home-section-below relative py-28 sm:py-36"
    >
      <div className="mx-auto max-w-[1200px] px-5 sm:px-8">
        <Reveal>
          <p className="home-section-label">Auto evolve</p>
          <h2
            id="auto-evolve-heading"
            className="home-h2 home-gradient-text mt-4 max-w-[15ch]"
          >
            It updates itself at midnight.
          </h2>
          <p className="home-subcopy mt-5">
            Add one optional GitHub Action file and let your profile stay fresh
            every night without touching it again.
          </p>
        </Reveal>

        <div className="mt-14 grid grid-cols-1 items-start gap-8 lg:grid-cols-12 lg:gap-10">
          <Reveal className="lg:col-span-7" stagger={0}>
            <div className="home-glass overflow-hidden rounded-2xl">
              <div className="flex items-center justify-between gap-3 border-b border-[var(--home-line)] px-4 py-3">
                <span className="truncate font-mono text-[12px] text-[var(--home-text-2)]">
                  .github/workflows/evolve-creature.yml
                </span>
                <button
                  type="button"
                  onClick={handleCopy}
                  className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-[var(--home-line-strong)] bg-white/[0.06] px-3 py-1 text-[12px] font-medium text-white transition-colors hover:bg-white/[0.12]"
                >
                  {copied ? (
                    <>
                      <Check
                        className="h-3.5 w-3.5 text-[var(--live)]"
                        aria-hidden="true"
                      />
                      <span>Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy className="h-3.5 w-3.5" aria-hidden="true" />
                      <span>Copy</span>
                    </>
                  )}
                </button>
              </div>
              <div className="overflow-x-auto bg-[#08080a]/90 p-4 sm:p-5">
                <pre className="font-mono text-[12px] leading-relaxed text-[#e6e6e3]">
                  <code>{WORKFLOW_SNIPPET}</code>
                </pre>
              </div>
            </div>
          </Reveal>

          <Reveal className="lg:col-span-5" stagger={120}>
            <ol className="relative space-y-8 pl-8 before:absolute before:top-3 before:bottom-3 before:left-[9px] before:w-px before:bg-white/[0.12]">
              {TIMELINE_STEPS.map((step) => (
                <li key={step.title} className="relative">
                  <span
                    aria-hidden="true"
                    className={`absolute top-1.5 -left-8 h-[19px] w-[19px] rounded-full border-[4px] border-[var(--home-bg)] ${step.dotClass}`}
                  />
                  <div className="home-glass rounded-2xl p-5">
                    <h3 className="text-[17px] font-semibold tracking-[-0.02em] text-white">
                      {step.title}
                    </h3>
                    <p className="mt-1.5 text-[14px] leading-relaxed text-[var(--home-text-2)]">
                      {step.description}
                    </p>
                  </div>
                </li>
              ))}
            </ol>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
