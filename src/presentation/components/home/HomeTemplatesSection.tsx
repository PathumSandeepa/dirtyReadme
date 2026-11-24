"use client";

import { ArrowRight } from "lucide-react";
import {
  PROFILE_EDITOR_TEMPLATES,
  type EditorTemplateItem,
} from "@/domain/profile/markdownRichText";
import {
  HOME_FACTS,
  extractTemplatePreviewLines,
  normalizeCategoryLabel,
  sanitizePreviewLine,
} from "./homeData";
import { Reveal } from "./Reveal";

interface HomeTemplatesSectionProps {
  onStartBuilding: () => void;
}

const TEMPLATE_SPLIT_INDEX = Math.ceil(PROFILE_EDITOR_TEMPLATES.length / 2);
const ROW_ONE_TEMPLATES = PROFILE_EDITOR_TEMPLATES.slice(0, TEMPLATE_SPLIT_INDEX);
const ROW_TWO_TEMPLATES = PROFILE_EDITOR_TEMPLATES.slice(TEMPLATE_SPLIT_INDEX);

function TemplateMarqueeCard({
  tpl,
  onStartBuilding,
  isDuplicate = false,
}: {
  tpl: EditorTemplateItem;
  onStartBuilding: () => void;
  isDuplicate?: boolean;
}) {
  const previewLines = extractTemplatePreviewLines(tpl.markdown);
  const category = normalizeCategoryLabel(tpl.category);
  const cleanDescription = sanitizePreviewLine(tpl.description).replace(
    /\.$/,
    ""
  );

  return (
    <button
      type="button"
      tabIndex={isDuplicate ? -1 : undefined}
      onClick={onStartBuilding}
      className="home-glass group flex w-[280px] shrink-0 cursor-pointer flex-col justify-between gap-3.5 rounded-[16px] p-4 text-left transition-[transform,background-color,border-color] duration-200 hover:-translate-y-0.5 hover:border-[var(--home-line-strong)] hover:bg-[rgba(28,28,32,0.78)]"
    >
      {/* Tiny scaled README preview */}
      <div className="w-full overflow-hidden rounded-[10px] border border-white/10 bg-[#0D1117] p-3">
        <div className="mb-2 flex items-center justify-between font-mono text-[10px] text-white/45">
          <span>README.md</span>
          <span>{category}</span>
        </div>
        <div className="space-y-1">
          {previewLines.map((line, index) => (
            <div
              key={`${tpl.id}-line-${index}`}
              className={
                index === 0
                  ? "truncate text-[12px] font-semibold text-white"
                  : "truncate text-[11px] text-white/55"
              }
            >
              {line}
            </div>
          ))}
        </div>
      </div>

      <div>
        <div className="truncate text-[15px] font-semibold text-white">
          {tpl.name}
        </div>
        <p className="mt-1 line-clamp-2 text-[13px] leading-snug text-[var(--home-text-2)]">
          {cleanDescription}.
        </p>
      </div>
    </button>
  );
}

export function HomeTemplatesSection({
  onStartBuilding,
}: HomeTemplatesSectionProps) {
  return (
    <section
      id="templates"
      className="home-section-below py-24 sm:py-32"
    >
      <div className="mx-auto max-w-[1160px] px-4 sm:px-6">
        <Reveal className="flex flex-col items-center text-center">
          <div className="home-section-label">Templates</div>
          <h2 className="home-h2 home-gradient-text mt-3">
            Never start from blank.
          </h2>
        </Reveal>
      </div>

      {/* Dual opposite-direction marquee rows with black edge fades */}
      <div className="relative mt-14 space-y-4 overflow-hidden">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-y-0 left-0 z-10 w-12 bg-gradient-to-r from-[#050505] to-transparent sm:w-28"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-y-0 right-0 z-10 w-12 bg-gradient-to-l from-[#050505] to-transparent sm:w-28"
        />

        {/* Row 1 moving left */}
        <div className="home-marquee-row overflow-hidden py-1">
          <div className="home-marquee-track gap-4 px-4">
            <div className="flex shrink-0 gap-4">
              {ROW_ONE_TEMPLATES.map((tpl) => (
                <TemplateMarqueeCard
                  key={`r1-a-${tpl.id}`}
                  tpl={tpl}
                  onStartBuilding={onStartBuilding}
                />
              ))}
            </div>
            <div
              aria-hidden="true"
              className="home-marquee-duplicate flex shrink-0 gap-4"
            >
              {ROW_ONE_TEMPLATES.map((tpl) => (
                <TemplateMarqueeCard
                  key={`r1-b-${tpl.id}`}
                  tpl={tpl}
                  onStartBuilding={onStartBuilding}
                  isDuplicate
                />
              ))}
            </div>
          </div>
        </div>

        {/* Row 2 moving right */}
        <div className="home-marquee-row overflow-hidden py-1">
          <div className="home-marquee-track-reverse gap-4 px-4">
            <div className="flex shrink-0 gap-4">
              {ROW_TWO_TEMPLATES.map((tpl) => (
                <TemplateMarqueeCard
                  key={`r2-a-${tpl.id}`}
                  tpl={tpl}
                  onStartBuilding={onStartBuilding}
                />
              ))}
            </div>
            <div
              aria-hidden="true"
              className="home-marquee-duplicate flex shrink-0 gap-4"
            >
              {ROW_TWO_TEMPLATES.map((tpl) => (
                <TemplateMarqueeCard
                  key={`r2-b-${tpl.id}`}
                  tpl={tpl}
                  onStartBuilding={onStartBuilding}
                  isDuplicate
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      <Reveal className="mx-auto mt-12 flex max-w-[1160px] flex-col items-center px-4 text-center sm:px-6">
        <p className="text-[18px] font-medium text-[var(--home-text-2)]">
          {HOME_FACTS.templateCount} templates for every kind of developer.
        </p>
        <button
          type="button"
          onClick={onStartBuilding}
          className="mt-5 inline-flex min-h-[46px] cursor-pointer items-center gap-2 rounded-full border border-white/24 bg-transparent px-6 text-[15px] font-medium text-white transition-colors duration-150 hover:border-white/45 hover:bg-white/[0.06]"
        >
          <span>Browse them in the studio</span>
          <ArrowRight className="size-4" />
        </button>
      </Reveal>
    </section>
  );
}
