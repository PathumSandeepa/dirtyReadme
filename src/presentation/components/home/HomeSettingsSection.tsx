"use client";

import { useState, type CSSProperties } from "react";
import { Reveal } from "./Reveal";
import {
  HERO_SAMPLE_BADGES,
  HOME_FACTS,
  STACK_DEMO_BADGES,
  STACK_DEMO_PLATFORMS,
  getContrastingInk,
  normalizeHex,
  showcaseAsset,
} from "./homeData";
import { useReducedMotion } from "./useReducedMotion";

type SettingsTab = "text" | "stack" | "links" | "creature";
type PreviewAngle = "side" | "top";
type PreviewBackdrop = "water" | "clear";
type LinkAlignment = "left" | "center";

const TABS: { id: SettingsTab; label: string }[] = [
  { id: "creature", label: "Creature" },
  { id: "text", label: "Text" },
  { id: "stack", label: "Stack" },
  { id: "links", label: "Links" },
];

const SECONDARY_BADGES = STACK_DEMO_BADGES.slice(6, 10);
const PREVIEW_LINKS = STACK_DEMO_PLATFORMS.slice(0, 3);

function ToggleRow({
  id,
  label,
  description,
  checked,
  onToggle,
}: {
  id: string;
  label: string;
  description: string;
  checked: boolean;
  onToggle: () => void;
}) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-2xl border border-[var(--home-line)] bg-white/[0.03] px-4 py-3.5">
      <div className="min-w-0">
        <label
          htmlFor={id}
          className="block cursor-pointer text-[14px] font-medium text-white"
        >
          {label}
        </label>
        <p className="mt-0.5 text-[12px] text-[var(--home-text-2)]">
          {description}
        </p>
      </div>
      <button
        id={id}
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={onToggle}
        className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors ${
          checked ? "bg-[var(--amber-label)]" : "bg-white/[0.16]"
        }`}
      >
        <span
          className={`inline-block h-4 w-4 rounded-full bg-white shadow transition-transform ${
            checked ? "translate-x-6" : "translate-x-1"
          }`}
        />
      </button>
    </div>
  );
}

export function HomeSettingsSection() {
  const reducedMotion = useReducedMotion();
  const [activeTab, setActiveTab] = useState<SettingsTab>("creature");
  const [showStatsOverlay, setShowStatsOverlay] = useState(true);
  const [cameraAngle, setCameraAngle] = useState<PreviewAngle>("side");
  const [backdrop, setBackdrop] = useState<PreviewBackdrop>("water");
  const [swimSpeed, setSwimSpeed] = useState(1.0);
  const [showSecondBadgeCard, setShowSecondBadgeCard] = useState(true);
  const [linkAlignment, setLinkAlignment] = useState<LinkAlignment>("left");
  const [showHeadingUnderline, setShowHeadingUnderline] = useState(true);

  const swimDuration = `${(3.8 / swimSpeed).toFixed(2)}s`;

  return (
    <section
      id="settings"
      aria-labelledby="settings-heading"
      className="home-section-below relative py-28 sm:py-36"
    >
      <div className="mx-auto max-w-[1200px] px-5 sm:px-8">
        <Reveal>
          <p className="home-section-label">Settings</p>
          <h2
            id="settings-heading"
            className="home-h2 home-gradient-text mt-4 max-w-[14ch]"
          >
            Make it yours.
          </h2>
          <p className="home-subcopy mt-5">
            Toggle overlays, alignment, badge groups and motion speed and watch
            your README respond live.
          </p>
        </Reveal>

        <Reveal className="mt-14">
          <div className="home-glass rounded-3xl p-4 sm:p-6">
            <div className="grid grid-cols-1 items-stretch gap-6 lg:grid-cols-12">
              <div className="flex flex-col gap-4 lg:col-span-5">
                <div
                  role="tablist"
                  aria-label="README setting sections"
                  className="grid grid-cols-4 gap-1.5 rounded-2xl border border-[var(--home-line)] bg-black/35 p-1.5"
                >
                  {TABS.map((tab) => {
                    const selected = activeTab === tab.id;
                    return (
                      <button
                        key={tab.id}
                        id={`settings-tab-${tab.id}`}
                        type="button"
                        role="tab"
                        aria-selected={selected}
                        aria-controls={`settings-panel-${tab.id}`}
                        onClick={() => setActiveTab(tab.id)}
                        className={`rounded-xl px-2.5 py-2 text-[13px] font-medium transition-colors ${
                          selected
                            ? "bg-white text-[#0b0b0c]"
                            : "text-[var(--home-text-2)] hover:text-white"
                        }`}
                      >
                        {tab.label}
                      </button>
                    );
                  })}
                </div>

                <div
                  id={`settings-panel-${activeTab}`}
                  role="tabpanel"
                  aria-labelledby={`settings-tab-${activeTab}`}
                  className="flex flex-1 flex-col gap-3.5 rounded-2xl border border-[var(--home-line)] bg-[#0b0b0d]/85 p-4 sm:p-5"
                >
                  {activeTab === "creature" ? (
                    <>
                      <ToggleRow
                        id="setting-stats-overlay"
                        label="Stats overlay"
                        description="Show commits and stage rank on the creature banner."
                        checked={showStatsOverlay}
                        onToggle={() => setShowStatsOverlay((v) => !v)}
                      />

                      <div className="rounded-2xl border border-[var(--home-line)] bg-white/[0.03] px-4 py-3.5">
                        <span className="block text-[14px] font-medium text-white">
                          Camera view
                        </span>
                        <div
                          role="group"
                          aria-label="Camera view"
                          className="mt-2.5 grid grid-cols-2 gap-1.5 rounded-xl bg-black/40 p-1"
                        >
                          {(
                            [
                              { id: "side", label: "Side" },
                              { id: "top", label: "Top" },
                            ] as const
                          ).map((option) => (
                            <button
                              key={option.id}
                              type="button"
                              aria-pressed={cameraAngle === option.id}
                              onClick={() => setCameraAngle(option.id)}
                              className={`rounded-lg py-1.5 text-[13px] font-medium transition-colors ${
                                cameraAngle === option.id
                                  ? "bg-white text-[#0b0b0c]"
                                  : "text-[var(--home-text-2)] hover:text-white"
                              }`}
                            >
                              {option.label}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="rounded-2xl border border-[var(--home-line)] bg-white/[0.03] px-4 py-3.5">
                        <span className="block text-[14px] font-medium text-white">
                          Water backdrop
                        </span>
                        <div
                          role="group"
                          aria-label="Water backdrop"
                          className="mt-2.5 grid grid-cols-2 gap-1.5 rounded-xl bg-black/40 p-1"
                        >
                          {(
                            [
                              { id: "water", label: "In water" },
                              { id: "clear", label: "Clear" },
                            ] as const
                          ).map((option) => (
                            <button
                              key={option.id}
                              type="button"
                              aria-pressed={backdrop === option.id}
                              onClick={() => setBackdrop(option.id)}
                              className={`rounded-lg py-1.5 text-[13px] font-medium transition-colors ${
                                backdrop === option.id
                                  ? "bg-white text-[#0b0b0c]"
                                  : "text-[var(--home-text-2)] hover:text-white"
                              }`}
                            >
                              {option.label}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="rounded-2xl border border-[var(--home-line)] bg-white/[0.03] px-4 py-3.5">
                        <div className="flex items-center justify-between">
                          <label
                            htmlFor="setting-swim-speed"
                            className="text-[14px] font-medium text-white"
                          >
                            Swimming speed
                          </label>
                          <span className="font-mono text-[12px] text-[var(--amber-label)]">
                            {swimSpeed.toFixed(1)}x
                          </span>
                        </div>
                        <input
                          id="setting-swim-speed"
                          type="range"
                          min={0.5}
                          max={2.0}
                          step={0.1}
                          value={swimSpeed}
                          onChange={(event) =>
                            setSwimSpeed(Number(event.target.value))
                          }
                          className="mt-3 w-full cursor-pointer accent-[#ffa033]"
                        />
                      </div>
                    </>
                  ) : null}

                  {activeTab === "text" ? (
                    <>
                      <ToggleRow
                        id="setting-heading-underline"
                        label="Heading underline"
                        description="Add a crisp dividing rule beneath your profile title."
                        checked={showHeadingUnderline}
                        onToggle={() => setShowHeadingUnderline((v) => !v)}
                      />
                      <p className="px-1 text-[13px] leading-relaxed text-[var(--home-text-2)]">
                        In the full studio you can also switch templates, edit
                        markdown blocks directly or reorder sections from the
                        README map.
                      </p>
                    </>
                  ) : null}

                  {activeTab === "stack" ? (
                    <>
                      <ToggleRow
                        id="setting-second-card"
                        label="Second badge card"
                        description="Group frameworks and tools into separate stacked cards."
                        checked={showSecondBadgeCard}
                        onToggle={() => setShowSecondBadgeCard((v) => !v)}
                      />
                      <p className="px-1 text-[13px] leading-relaxed text-[var(--home-text-2)]">
                        Pick from over two hundred technology badges across
                        eleven categories with matching icon colors.
                      </p>
                    </>
                  ) : null}

                  {activeTab === "links" ? (
                    <>
                      <div className="rounded-2xl border border-[var(--home-line)] bg-white/[0.03] px-4 py-3.5">
                        <span className="block text-[14px] font-medium text-white">
                          Button alignment
                        </span>
                        <div
                          role="group"
                          aria-label="Link button alignment"
                          className="mt-2.5 grid grid-cols-2 gap-1.5 rounded-xl bg-black/40 p-1"
                        >
                          {(
                            [
                              { id: "left", label: "Left" },
                              { id: "center", label: "Center" },
                            ] as const
                          ).map((option) => (
                            <button
                              key={option.id}
                              type="button"
                              aria-pressed={linkAlignment === option.id}
                              onClick={() => setLinkAlignment(option.id)}
                              className={`rounded-lg py-1.5 text-[13px] font-medium transition-colors ${
                                linkAlignment === option.id
                                  ? "bg-white text-[#0b0b0c]"
                                  : "text-[var(--home-text-2)] hover:text-white"
                              }`}
                            >
                              {option.label}
                            </button>
                          ))}
                        </div>
                      </div>
                      <p className="px-1 text-[13px] leading-relaxed text-[var(--home-text-2)]">
                        Add buttons for GitHub, X, LinkedIn, YouTube, Discord or
                        your personal website.
                      </p>
                    </>
                  ) : null}
                </div>
              </div>

              <div className="lg:col-span-7">
                <div className="wall-lagoon flex h-full flex-col justify-between p-4 sm:p-5">
                  <div className="overflow-hidden rounded-2xl border border-black/15 bg-[#f7f4ef] text-[#171614] shadow-[0_24px_60px_rgba(0,0,0,0.45)]">
                    <div className="flex items-center justify-between border-b border-black/10 bg-[#efeae2] px-4 py-2.5">
                      <div
                        className="flex items-center gap-1.5"
                        aria-hidden="true"
                      >
                        <span className="h-2.5 w-2.5 rounded-full bg-[#e06c5c]" />
                        <span className="h-2.5 w-2.5 rounded-full bg-[#e3b341]" />
                        <span className="h-2.5 w-2.5 rounded-full bg-[#4fb86d]" />
                      </div>
                      <span className="font-mono text-[11px] font-medium text-[#5c564f]">
                        README.md
                      </span>
                      <span className="rounded-full bg-black/[0.07] px-2 py-0.5 font-mono text-[10px] uppercase tracking-[0.08em] text-[#5c564f]">
                        Live preview
                      </span>
                    </div>

                    <div className="space-y-4 p-5 sm:p-6">
                      <div
                        className={
                          showHeadingUnderline
                            ? "border-b border-black/12 pb-3"
                            : "pb-1"
                        }
                      >
                        <p className="text-[18px] font-bold tracking-[-0.02em] text-[#161513]">
                          Hi, I am octocat.
                        </p>
                        <p className="mt-1 text-[13px] text-[#56514b]">
                          Building open source tools for clean developer
                          profiles.
                        </p>
                      </div>

                      <div className="space-y-2.5">
                        <div className="rounded-xl border border-black/8 bg-white/80 p-3">
                          <p className="mb-2 font-mono text-[10px] uppercase tracking-[0.12em] text-[#6d675f]">
                            Core stack
                          </p>
                          <div className="flex flex-wrap gap-1.5">
                            {HERO_SAMPLE_BADGES.slice(0, 4).map((badge) => {
                              const bg = normalizeHex(badge.color);
                              const fg = getContrastingInk(bg);
                              return (
                                <span
                                  key={badge.id}
                                  className="rounded-md px-2 py-1 text-[11px] font-semibold"
                                  style={{ backgroundColor: bg, color: fg }}
                                >
                                  {badge.label}
                                </span>
                              );
                            })}
                          </div>
                        </div>

                        {showSecondBadgeCard ? (
                          <div className="rounded-xl border border-black/8 bg-white/80 p-3">
                            <p className="mb-2 font-mono text-[10px] uppercase tracking-[0.12em] text-[#6d675f]">
                              Tools and backend
                            </p>
                            <div className="flex flex-wrap gap-1.5">
                              {SECONDARY_BADGES.map((badge) => {
                                const bg = normalizeHex(badge.color);
                                const fg = getContrastingInk(bg);
                                return (
                                  <span
                                    key={badge.id}
                                    className="rounded-md px-2 py-1 text-[11px] font-semibold"
                                    style={{ backgroundColor: bg, color: fg }}
                                  >
                                    {badge.label}
                                  </span>
                                );
                              })}
                            </div>
                          </div>
                        ) : null}
                      </div>

                      <div
                        className={`flex flex-wrap gap-2 ${
                          linkAlignment === "center"
                            ? "justify-center"
                            : "justify-start"
                        }`}
                      >
                        {PREVIEW_LINKS.map((platform) => (
                          <span
                            key={platform.id}
                            className="inline-flex items-center gap-1.5 rounded-full bg-[#191816] px-3 py-1 text-[11px] font-medium text-white"
                          >
                            {platform.id === "x" ? "X" : platform.label}
                          </span>
                        ))}
                      </div>

                      <div
                        className={`relative overflow-hidden rounded-xl border p-4 transition-colors ${
                          backdrop === "water"
                            ? "border-[#16344d] bg-gradient-to-br from-[#071829] via-[#0c2640] to-[#081523] text-white"
                            : "border-black/10 bg-[#ece7df] text-[#171614]"
                        }`}
                      >
                        <div className="flex items-center justify-center py-2">
                          <img
                            src={showcaseAsset(
                              cameraAngle === "top"
                                ? "view-top.webp"
                                : "view-side.webp"
                            )}
                            alt={
                              cameraAngle === "top"
                                ? "Pixel Tulkun top camera view"
                                : "Pixel Tulkun side camera view"
                            }
                            width={640}
                            height={240}
                            loading="lazy"
                            className={`h-[96px] w-auto object-contain ${
                              reducedMotion ? "" : "home-creature-swim-demo"
                            }`}
                            style={
                              {
                                imageRendering: "pixelated",
                                "--swim-duration": swimDuration,
                              } as CSSProperties
                            }
                          />
                        </div>

                        {showStatsOverlay ? (
                          <div
                            className={`mt-2 flex flex-wrap items-center justify-between gap-2 border-t pt-2 font-mono text-[10px] uppercase tracking-[0.1em] ${
                              backdrop === "water"
                                ? "border-white/12 text-[#b9ddf4]"
                                : "border-black/10 text-[#5c564f]"
                            }`}
                          >
                            <span>Stage 4 Mature</span>
                            <span>
                              {HOME_FACTS.sampleCommits.toLocaleString("en-US")}{" "}
                              commits
                            </span>
                            <span>TypeScript</span>
                          </div>
                        ) : null}
                      </div>
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
