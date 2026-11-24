"use client";

import { useEffect, useRef, useState } from "react";
import {
  ArrowRight,
  ArrowUpRight,
  Check,
  CircleDot,
  Copy,
  GitPullRequest,
} from "lucide-react";
import { BRAND } from "@/config/brand";
import { Reveal } from "./Reveal";
import { HOME_FACTS, LICENSE_NAME } from "./homeData";

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

interface HomeOpenSourceSectionProps {
  onStartBuilding: () => void;
}

const BUILD_COMMANDS = [
  `git clone ${BRAND.repoUrl}.git`,
  "cd DirtyReadme",
  "pnpm install",
  "pnpm dev",
].join("\n");

const PROJECT_FACTS = [
  { label: "Version", value: `v${HOME_FACTS.appVersion}` },
  { label: "License", value: LICENSE_NAME },
  { label: "Runtime", value: "Runs in your browser" },
  { label: "Access", value: "Free and open source" },
  { label: "Framework", value: "Built with Next.js" },
] as const;

export function HomeOpenSourceSection({
  onStartBuilding,
}: HomeOpenSourceSectionProps) {
  const [copied, setCopied] = useState(false);
  const timeoutRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (timeoutRef.current !== null) {
        window.clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const handleCopyCommands = async () => {
    try {
      await navigator.clipboard.writeText(BUILD_COMMANDS);
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
      id="open-source"
      aria-labelledby="open-source-heading"
      className="home-section-below relative py-28 sm:py-36"
    >
      <div className="mx-auto max-w-[1200px] px-5 sm:px-8">
        <Reveal>
          <p className="home-section-label">Open source</p>
          <h2
            id="open-source-heading"
            className="home-h2 home-gradient-text mt-4 max-w-[15ch]"
          >
            Free and open to everyone.
          </h2>
          <p className="home-subcopy mt-5">
            Inspect every line of code, suggest a template or run the full
            studio locally.
          </p>
        </Reveal>

        <Reveal className="mt-14">
          <div className="home-glass rounded-3xl p-5 sm:p-8">
            <div className="grid grid-cols-1 items-center gap-8 lg:grid-cols-12">
              <div className="lg:col-span-5">
                <div className="wall-ocean p-4">
                  <div className="overflow-hidden rounded-2xl border border-white/15 bg-[#0c0d12]/80 p-4 shadow-[0_20px_50px_rgba(0,0,0,0.45)]">
                    <div className="flex items-center justify-between border-b border-white/10 pb-2.5">
                      <div
                        className="flex items-center gap-1.5"
                        aria-hidden="true"
                      >
                        <span className="h-2 w-2 rounded-full bg-[#e06c5c]" />
                        <span className="h-2 w-2 rounded-full bg-[#e3b341]" />
                        <span className="h-2 w-2 rounded-full bg-[#4fb86d]" />
                      </div>
                      <span className="font-mono text-[10px] text-[var(--home-text-2)]">
                        {BRAND.name}
                      </span>
                    </div>

                    <div className="mt-3 rounded-xl bg-[#f7f4ef] p-3 text-[#181614]">
                      <p className="text-[12px] font-bold">octocat</p>
                      <p className="mt-0.5 text-[10px] text-[#5e5850]">
                        {BRAND.tagline}
                      </p>
                      <div className="mt-2.5 flex flex-wrap gap-1 rounded-lg bg-[#0d1117] p-2.5">
                        <span className="rounded bg-[#3178C6] px-2 py-0.5 font-mono text-[9px] font-semibold text-white">
                          TypeScript
                        </span>
                        <span className="rounded bg-[#181717] px-2 py-0.5 font-mono text-[9px] font-semibold text-white">
                          Next.js
                        </span>
                        <span className="rounded bg-[#06B6D4] px-2 py-0.5 font-mono text-[9px] font-semibold text-[#111111]">
                          Tailwind
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="lg:col-span-7">
                <h3 className="home-display text-[28px] font-extrabold tracking-[-0.04em] text-white sm:text-[32px]">
                  {BRAND.name}
                </h3>
                <p className="mt-2 text-[15px] leading-relaxed text-[var(--home-text-2)]">
                  {BRAND.tagline}
                </p>

                <dl className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
                  {PROJECT_FACTS.map((fact) => (
                    <div
                      key={fact.label}
                      className="rounded-xl border border-[var(--home-line)] bg-white/[0.03] px-4 py-3"
                    >
                      <dt className="home-mono-caption text-[10px] text-[var(--home-text-3)]">
                        {fact.label}
                      </dt>
                      <dd className="mt-1 text-[14px] font-medium text-white">
                        {fact.value}
                      </dd>
                    </div>
                  ))}
                </dl>

                <div className="mt-7 flex flex-wrap items-center gap-3">
                  <button
                    type="button"
                    onClick={onStartBuilding}
                    className="home-btn-amber inline-flex items-center gap-2 rounded-full px-6 py-3 text-[14px] font-semibold"
                  >
                    <span>Start building</span>
                    <ArrowRight className="h-4 w-4" aria-hidden="true" />
                  </button>

                  <a
                    href={BRAND.repoUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 rounded-full border border-[var(--home-line-strong)] bg-white/[0.03] px-5 py-3 text-[14px] font-medium text-white transition-colors hover:bg-white/[0.08]"
                  >
                    <GitHubIcon className="h-4 w-4" />
                    <span>View on GitHub</span>
                    <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
                  </a>
                </div>
              </div>
            </div>
          </div>
        </Reveal>

        <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-12">
          <Reveal className="lg:col-span-8" stagger={80}>
            <div className="home-glass overflow-hidden rounded-2xl">
              <div className="flex items-center justify-between border-b border-[var(--home-line)] px-5 py-3">
                <span className="text-[13px] font-semibold text-white">
                  Build it from source
                </span>
                <button
                  type="button"
                  onClick={handleCopyCommands}
                  className="inline-flex items-center gap-1.5 rounded-full border border-[var(--home-line-strong)] bg-white/[0.06] px-3 py-1 text-[12px] font-medium text-white transition-colors hover:bg-white/[0.12]"
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
              <div className="overflow-x-auto bg-[#08080a]/90 p-5">
                <pre className="font-mono text-[13px] leading-relaxed text-[#e6e6e3]">
                  <code>{BUILD_COMMANDS}</code>
                </pre>
              </div>
            </div>
          </Reveal>

          <Reveal className="lg:col-span-4" stagger={140}>
            <div className="home-glass flex h-full flex-col justify-between rounded-2xl p-5">
              <div>
                <h3 className="text-[16px] font-semibold text-white">
                  Contribute
                </h3>
                <p className="mt-1.5 text-[14px] leading-relaxed text-[var(--home-text-2)]">
                  Report a bug, suggest a template or open a pull request on
                  GitHub.
                </p>
              </div>

              <div className="mt-5 flex flex-col gap-2.5">
                <a
                  href={BRAND.issuesUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center justify-between rounded-xl border border-[var(--home-line)] bg-white/[0.03] px-4 py-3 text-[14px] font-medium text-white transition-colors hover:bg-white/[0.08]"
                >
                  <span className="inline-flex items-center gap-2.5">
                    <CircleDot
                      className="h-4 w-4 text-[var(--amber-label)]"
                      aria-hidden="true"
                    />
                    Issues
                  </span>
                  <ArrowUpRight
                    className="h-4 w-4 text-[var(--home-text-2)]"
                    aria-hidden="true"
                  />
                </a>

                <a
                  href={BRAND.pullsUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center justify-between rounded-xl border border-[var(--home-line)] bg-white/[0.03] px-4 py-3 text-[14px] font-medium text-white transition-colors hover:bg-white/[0.08]"
                >
                  <span className="inline-flex items-center gap-2.5">
                    <GitPullRequest
                      className="h-4 w-4 text-[var(--live)]"
                      aria-hidden="true"
                    />
                    Pull requests
                  </span>
                  <ArrowUpRight
                    className="h-4 w-4 text-[var(--home-text-2)]"
                    aria-hidden="true"
                  />
                </a>
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
