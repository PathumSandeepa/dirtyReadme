"use client";

import {
  Clock,
  Copy,
  History,
  RefreshCw,
  Sparkles,
  SunMoon,
} from "lucide-react";
import { Reveal } from "./Reveal";
import { showcaseAsset } from "./homeData";

const MORE_FEATURES = [
  {
    id: "creature",
    title: "Optional pixel creature",
    description:
      "Grows with your commit count over time and can be turned off anytime.",
    Icon: Sparkles,
    hasCreaturePreview: true,
  },
  {
    id: "auto-update",
    title: "Daily auto update",
    description:
      "Optionally schedule a GitHub Action and choose the time when you publish.",
    Icon: Clock,
    hasCreaturePreview: false,
  },
  {
    id: "theme-preview",
    title: "Light and dark preview",
    description:
      "Check how your README looks on GitHub in both light and dark themes.",
    Icon: SunMoon,
    hasCreaturePreview: false,
  },
  {
    id: "undo",
    title: "Undo anything",
    description:
      "Keep editing without worry with built in history for your changes.",
    Icon: History,
    hasCreaturePreview: false,
  },
  {
    id: "markdown",
    title: "Markdown you own",
    description:
      "Copy the generated Markdown or download your files at any point.",
    Icon: Copy,
    hasCreaturePreview: false,
  },
  {
    id: "restore",
    title: "Works with your saved README",
    description:
      "Loads your saved customization from your profile repository when found.",
    Icon: RefreshCw,
    hasCreaturePreview: false,
  },
] as const;

export function HomeMoreFeaturesSection() {
  return (
    <section
      id="more-features"
      aria-labelledby="more-features-heading"
      className="home-section-below px-4 py-24 sm:px-6 sm:py-32"
    >
      <div className="mx-auto max-w-[1160px]">
        <Reveal className="flex flex-col items-center text-center">
          <p className="home-section-label">More features</p>
          <h2
            id="more-features-heading"
            className="home-h2 home-gradient-text mt-3"
          >
            Small things that save time.
          </h2>
        </Reveal>

        <div className="mt-14 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {MORE_FEATURES.map((item, index) => {
            const Icon = item.Icon;
            return (
              <Reveal key={item.id} stagger={index * 60}>
                <div className="home-glass flex h-full flex-col justify-between rounded-[20px] p-6">
                  <div>
                    <div className="flex items-center justify-between gap-3">
                      <span className="inline-flex size-10 items-center justify-center rounded-[12px] bg-white/[0.07] text-[var(--amber-label)]">
                        <Icon className="size-5" aria-hidden="true" />
                      </span>

                      {item.hasCreaturePreview && (
                        <img
                          src={showcaseAsset("view-side.webp")}
                          width={64}
                          height={32}
                          loading="lazy"
                          alt="Optional animated pixel creature preview"
                          className="h-8 w-auto rounded-[6px] object-contain"
                          style={{ imageRendering: "pixelated" }}
                        />
                      )}
                    </div>

                    <h3 className="mt-5 text-[18px] font-semibold tracking-[-0.02em] text-white">
                      {item.title}
                    </h3>
                    <p className="mt-2 text-[14px] leading-relaxed text-[var(--home-text-2)]">
                      {item.description}
                    </p>
                  </div>
                </div>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
