"use client";

import { useState } from "react";
import { BRAND } from "@/config/brand";
import { Reveal } from "./Reveal";
import { homeAsset } from "./homeData";

const IMAGE_FEATURES = [
  {
    title: "Drop, paste or pick",
    description:
      "Add a PNG, JPEG or WebP directly from your clipboard or computer.",
  },
  {
    title: "Crop with presets",
    description:
      "Frame your artwork for wide banners, cards or square badges with live drag.",
  },
  {
    title: "Converted to WebP",
    description:
      "Images convert into compact WebP right in the browser for fast README loads.",
  },
  {
    title: "Stays on your device",
    description:
      "No upload server touches your artwork until you choose to publish.",
  },
] as const;

export function HomeCustomImagesSection() {
  const [imageError, setImageError] = useState(false);

  return (
    <section
      id="images"
      aria-labelledby="images-heading"
      className="home-section-below relative py-28 sm:py-36"
    >
      <div className="mx-auto max-w-[1200px] px-5 sm:px-8">
        <Reveal>
          <p className="home-section-label">Images</p>
          <h2
            id="images-heading"
            className="home-h2 home-gradient-text mt-4 max-w-[14ch]"
          >
            Bring your own banner.
          </h2>
          <p className="home-subcopy mt-5">
            Drop any photo or illustration and shape it right inside the editor.
          </p>
        </Reveal>

        <div className="mt-14 grid grid-cols-1 items-center gap-10 lg:grid-cols-12 lg:gap-12">
          <Reveal
            className="order-first lg:order-last lg:col-span-7"
            stagger={0}
          >
            <div className="wall-sunset p-4 sm:p-6">
              <div className="home-glass overflow-hidden rounded-2xl">
                <div className="flex items-center justify-between border-b border-[var(--home-line)] px-4 py-2.5">
                  <div className="flex items-center gap-1.5" aria-hidden="true">
                    <span className="h-2.5 w-2.5 rounded-full bg-white/25" />
                    <span className="h-2.5 w-2.5 rounded-full bg-white/18" />
                    <span className="h-2.5 w-2.5 rounded-full bg-white/14" />
                  </div>
                  <span className="font-mono text-[11px] text-[var(--home-text-2)]">
                    Custom image crop
                  </span>
                  <span className="home-mono-caption rounded-full bg-white/[0.08] px-2 py-0.5 text-[10px] text-white">
                    WebP
                  </span>
                </div>

                {!imageError ? (
                  <img
                    src={homeAsset("custom-image-crop-dark.png")}
                    alt={`${BRAND.name} custom image crop dialog showing aspect presets and WebP output`}
                    width={1440}
                    height={960}
                    loading="lazy"
                    onError={() => setImageError(true)}
                    className="block h-auto w-full object-cover"
                  />
                ) : (
                  <div className="flex flex-col gap-4 bg-[#0d0e11] p-6">
                    <div className="flex flex-wrap gap-2">
                      {["Banner 3 to 1", "Wide 16 to 9", "Square 1 to 1"].map(
                        (preset, index) => (
                          <span
                            key={preset}
                            className={`rounded-full px-3 py-1 text-[12px] font-medium ${
                              index === 0
                                ? "bg-white text-[#0b0b0c]"
                                : "bg-white/[0.08] text-[var(--home-text-2)]"
                            }`}
                          >
                            {preset}
                          </span>
                        )
                      )}
                    </div>
                    <div className="relative aspect-[16/9] w-full overflow-hidden rounded-xl border border-white/20 bg-gradient-to-br from-[#23324b] via-[#1b2234] to-[#0f131c]">
                      <div className="absolute inset-6 rounded-lg border-2 border-dashed border-[var(--amber-label)]/80" />
                    </div>
                    <div className="flex items-center justify-between text-[12px] text-[var(--home-text-2)]">
                      <span>Output format WebP</span>
                      <span className="font-mono text-white">
                        Ready to embed
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </Reveal>

          <div className="order-last space-y-7 lg:order-first lg:col-span-5">
            {IMAGE_FEATURES.map((item, idx) => (
              <Reveal key={item.title} stagger={idx * 70}>
                <div className="border-l-2 border-[var(--amber-label)] pl-5">
                  <h3 className="text-[18px] font-semibold tracking-[-0.02em] text-white">
                    {item.title}
                  </h3>
                  <p className="mt-1.5 text-[15px] leading-relaxed text-[var(--home-text-2)]">
                    {item.description}
                  </p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
