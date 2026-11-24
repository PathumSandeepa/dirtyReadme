"use client";

import { useState } from "react";
import { KeyRound, Lock, Monitor, Server } from "lucide-react";
import { BRAND } from "@/config/brand";
import { Reveal } from "./Reveal";
import { homeAsset } from "./homeData";

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

type PrivacyMode = "this-site" | "typical";

const PRIVACY_CARDS = [
  {
    number: "01",
    title: "Read only lookup",
    description:
      "Public stats, language shares and your existing README load straight from GitHub without signing in.",
  },
  {
    number: "02",
    title: "Token stays in memory",
    description:
      "When you publish, your personal access token stays in browser memory and clears right after pushing.",
  },
  {
    number: "03",
    title: "Commit directly",
    description:
      "Your browser talks straight to the GitHub REST API with zero backend proxy and zero tracking scripts.",
  },
] as const;

export function HomePrivacySection() {
  const [mode, setMode] = useState<PrivacyMode>("this-site");
  const [imageError, setImageError] = useState(false);

  const isDirect = mode === "this-site";

  return (
    <section
      id="privacy"
      aria-labelledby="privacy-heading"
      className="home-section-below relative py-20 sm:py-24"
    >
      <div className="mx-auto max-w-[1200px] px-5 sm:px-8">
        <Reveal>
          <p className="home-section-label">Privacy</p>
          <h2
            id="privacy-heading"
            className="home-h2 home-gradient-text mt-4 max-w-[15ch]"
          >
            Your token stays with you.
          </h2>
          <p className="home-subcopy mt-5">
            No accounts, no OAuth database and no server sitting between your
            browser and GitHub.
          </p>
        </Reveal>

        <div className="mt-14 grid grid-cols-1 items-stretch gap-6 lg:grid-cols-12">
          <Reveal className="lg:col-span-7" stagger={0}>
            <div className="home-glass flex h-full flex-col justify-between rounded-3xl p-5 sm:p-7">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div
                  role="group"
                  aria-label="Architecture comparison"
                  className="inline-flex rounded-full border border-[var(--home-line)] bg-black/45 p-1"
                >
                  <button
                    type="button"
                    aria-pressed={mode === "typical"}
                    onClick={() => setMode("typical")}
                    className={`rounded-full px-3.5 py-1.5 text-[13px] font-medium transition-colors ${
                      mode === "typical"
                        ? "bg-white text-[#0b0b0c]"
                        : "text-[var(--home-text-2)] hover:text-white"
                    }`}
                  >
                    Typical tools
                  </button>
                  <button
                    type="button"
                    aria-pressed={mode === "this-site"}
                    onClick={() => setMode("this-site")}
                    className={`rounded-full px-3.5 py-1.5 text-[13px] font-medium transition-colors ${
                      mode === "this-site"
                        ? "bg-white text-[#0b0b0c]"
                        : "text-[var(--home-text-2)] hover:text-white"
                    }`}
                  >
                    This site
                  </button>
                </div>

                <span
                  className={`inline-flex items-center gap-2 rounded-full px-3 py-1 font-mono text-[11px] ${
                    isDirect
                      ? "bg-[#58d6b0]/15 text-[var(--live)]"
                      : "bg-[#ffa033]/15 text-[var(--amber-label)]"
                  }`}
                >
                  <span
                    className={`h-2 w-2 rounded-full ${
                      isDirect ? "bg-[var(--live)]" : "bg-[var(--amber-label)]"
                    }`}
                  />
                  {isDirect ? "Direct browser path" : "Relayed via server"}
                </span>
              </div>

              <div className="my-8 grid grid-cols-1 items-center gap-4 sm:grid-cols-3">
                <div className="rounded-2xl border border-white/[0.14] bg-white/[0.04] p-4 text-center">
                  <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-xl bg-white/[0.08] text-white">
                    <Monitor className="h-5 w-5" aria-hidden="true" />
                  </div>
                  <p className="mt-3 text-[14px] font-semibold text-white">
                    Your browser
                  </p>
                  <div className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-white/[0.08] px-2.5 py-1 text-[11px] text-[var(--home-text-2)]">
                    <KeyRound
                      className="h-3 w-3 text-[var(--live)]"
                      aria-hidden="true"
                    />
                    <span>{isDirect ? "Token kept here" : "Sends token"}</span>
                  </div>
                </div>

                <div className="flex flex-col items-center justify-center py-2">
                  {isDirect ? (
                    <div className="flex w-full flex-col items-center gap-2.5">
                      <div className="relative flex h-9 w-full items-center justify-center">
                        <div className="h-[2px] w-full bg-gradient-to-r from-[var(--live)]/30 via-[var(--live)] to-[var(--live)]/30" />
                        <span className="home-packet-travel absolute inline-flex h-3 w-3 rounded-full bg-[var(--live)] shadow-[0_0_12px_rgba(88,214,176,0.85)]" />
                      </div>
                      <span className="inline-flex items-center gap-1.5 rounded-full border border-[#58d6b0]/30 bg-[#58d6b0]/10 px-3 py-1 font-mono text-[11px] text-[var(--live)]">
                        <Lock className="h-3 w-3" aria-hidden="true" />
                        No server in the middle
                      </span>
                    </div>
                  ) : (
                    <div className="w-full rounded-2xl border border-[#ffa033]/40 bg-[#ffa033]/10 p-4 text-center">
                      <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-xl bg-[#ffa033]/20 text-[var(--amber-label)]">
                        <Server className="h-5 w-5" aria-hidden="true" />
                      </div>
                      <p className="mt-3 text-[14px] font-semibold text-white">
                        Third-party server
                      </p>
                      <div className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-black/35 px-2.5 py-1 text-[11px] text-[var(--amber-label)]">
                        <KeyRound className="h-3 w-3" aria-hidden="true" />
                        <span>Reads your token</span>
                      </div>
                    </div>
                  )}
                </div>

                <div className="rounded-2xl border border-white/[0.14] bg-white/[0.04] p-4 text-center">
                  <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-xl bg-white/[0.08] text-white">
                    <GitHubIcon className="h-5 w-5" />
                  </div>
                  <p className="mt-3 text-[14px] font-semibold text-white">
                    GitHub API
                  </p>
                  <p className="mt-2 text-[11px] text-[var(--home-text-2)]">
                    Writes your README commit
                  </p>
                </div>
              </div>

              <p className="border-t border-[var(--home-line)] pt-4 text-[14px] leading-relaxed text-[var(--home-text-2)]">
                {isDirect
                  ? "This site ships as static files. Every GitHub request leaves your browser directly over HTTPS."
                  : "Many hosted profile builders route your OAuth session or token through an external backend server."}
              </p>
            </div>
          </Reveal>

          <Reveal className="lg:col-span-5" stagger={100}>
            <div className="wall-lagoon flex h-full items-center p-4 sm:p-5">
              <div className="home-glass w-full overflow-hidden rounded-2xl">
                <div className="flex items-center justify-between border-b border-[var(--home-line)] px-4 py-2.5">
                  <span className="font-mono text-[11px] text-[var(--home-text-2)]">
                    Publish step
                  </span>
                  <span className="inline-flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.1em] text-[var(--live)]">
                    <span className="h-1.5 w-1.5 rounded-full bg-[var(--live)]" />
                    Client only
                  </span>
                </div>

                {!imageError ? (
                  <img
                    src={homeAsset("publish-dark.png")}
                    alt={`${BRAND.name} publish screen committing directly to GitHub`}
                    width={1440}
                    height={960}
                    loading="lazy"
                    onError={() => setImageError(true)}
                    className="block h-auto w-full object-cover"
                  />
                ) : (
                  <div className="space-y-3 bg-[#0c0d10] p-5">
                    <p className="text-[14px] font-semibold text-white">
                      Publish to your profile repository
                    </p>
                    <p className="text-[12px] text-[var(--home-text-2)]">
                      Paste a fine-grained token to commit README.md and your
                      assets directly.
                    </p>
                    <div className="rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2 font-mono text-[11px] text-[var(--home-text-3)]">
                      github_pat_memory_only
                    </div>
                  </div>
                )}
              </div>
            </div>
          </Reveal>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-3">
          {PRIVACY_CARDS.map((card, idx) => (
            <Reveal key={card.number} stagger={idx * 70}>
              <div className="home-glass h-full rounded-2xl p-6">
                <span className="font-mono text-[12px] font-semibold text-[var(--amber-label)]">
                  {card.number}
                </span>
                <h3 className="mt-3 text-[17px] font-semibold tracking-[-0.02em] text-white">
                  {card.title}
                </h3>
                <p className="mt-2 text-[14px] leading-relaxed text-[var(--home-text-2)]">
                  {card.description}
                </p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
