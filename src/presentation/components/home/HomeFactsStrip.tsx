"use client";

import { useEffect, useRef, useState } from "react";
import { HOME_FACTS } from "./homeData";
import { useCountUp } from "./useCountUp";
import { usePointerSpotlight } from "./usePointerSpotlight";
import { useReducedMotion } from "./useReducedMotion";

const FACT_ITEMS = [
  { target: HOME_FACTS.templateCount, unit: "templates" },
  { target: HOME_FACTS.creatureCount, unit: "creatures" },
  { target: HOME_FACTS.stageCount, unit: "stages" },
  { target: HOME_FACTS.serverCount, unit: "servers" },
] as const;

function FactCell({
  target,
  unit,
  active,
  reducedMotion,
}: {
  target: number;
  unit: string;
  active: boolean;
  reducedMotion: boolean;
}) {
  const value = useCountUp({ target, active, reducedMotion });
  const spotlight = usePointerSpotlight(reducedMotion);

  return (
    <div
      onPointerMove={spotlight.onPointerMove}
      onPointerLeave={spotlight.onPointerLeave}
      className="home-spotlight-cell flex items-baseline justify-center gap-2.5 px-6 py-8 sm:py-10"
    >
      <span className="home-display text-[44px] leading-none font-extrabold tracking-[-0.04em] text-white tabular-nums sm:text-[56px]">
        {value}
      </span>
      <span className="home-mono-caption text-[var(--home-text-2)]">
        {unit}
      </span>
    </div>
  );
}

export function HomeFactsStrip() {
  const stripRef = useRef<HTMLDivElement | null>(null);
  const [entered, setEntered] = useState(false);
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    const node = stripRef.current;
    if (!node) return;
    if (typeof IntersectionObserver === "undefined") {
      queueMicrotask(() => setEntered(true));
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setEntered(true);
            observer.disconnect();
            break;
          }
        }
      },
      { threshold: 0.25 }
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return (
    <section
      aria-label="Product facts"
      className="px-4 py-10 sm:px-6 sm:py-14"
    >
      <div
        ref={stripRef}
        className="home-glass mx-auto grid max-w-[1160px] grid-cols-2 overflow-hidden rounded-[20px] lg:grid-cols-4"
      >
        {FACT_ITEMS.map((item, index) => (
          <div
            key={item.unit}
            className={
              index === 0
                ? "border-r border-b border-[var(--home-line)] lg:border-b-0"
                : index === 1
                  ? "border-b border-[var(--home-line)] lg:border-r lg:border-b-0"
                  : index === 2
                    ? "border-r border-[var(--home-line)]"
                    : ""
            }
          >
            <FactCell
              target={item.target}
              unit={item.unit}
              active={entered}
              reducedMotion={reducedMotion}
            />
          </div>
        ))}
      </div>
    </section>
  );
}
