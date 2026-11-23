"use client";

import { ArrowRight } from "lucide-react";
import { Reveal } from "./Reveal";

interface HomeFinalCtaSectionProps {
  onStartBuilding: () => void;
}

export function HomeFinalCtaSection({
  onStartBuilding,
}: HomeFinalCtaSectionProps) {
  return (
    <section
      aria-labelledby="final-cta-heading"
      className="home-section-below relative py-20 sm:py-28"
    >
      <div className="mx-auto max-w-[1200px] px-5 sm:px-8">
        <Reveal>
          <div className="wall-ocean p-5 sm:p-8">
            <div className="home-glass flex flex-col items-center rounded-2xl px-6 py-16 text-center sm:px-12 sm:py-24">
              <h2
                id="final-cta-heading"
                className="home-h2 home-gradient-text max-w-[12ch]"
              >
                Ready when you are.
              </h2>
              <p className="home-subcopy mt-4 text-center">
                Open the studio in your browser and publish a sharper GitHub
                profile in minutes.
              </p>
              <button
                type="button"
                onClick={onStartBuilding}
                className="home-btn-amber mt-9 inline-flex items-center gap-2.5 rounded-full px-8 py-4 text-[15px] font-semibold"
              >
                <span>Start building</span>
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </button>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
