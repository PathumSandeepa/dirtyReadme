"use client";

import { ArrowRight } from "lucide-react";
import { StudioButton } from "../../studio/ui/StudioButton";
import { CUSTOMIZE_PARTS, type CustomizePartId } from "./customizeTypes";

interface InspectorPanelProps {
  activePart: CustomizePartId;
  onAdvancePart: () => void;
  children: React.ReactNode;
}

export function getNextPartId(current: CustomizePartId): CustomizePartId | null {
  const idx = CUSTOMIZE_PARTS.findIndex((p) => p.id === current);
  if (idx === -1 || idx >= CUSTOMIZE_PARTS.length - 1) return null;
  return CUSTOMIZE_PARTS[idx + 1].id;
}

export function getPartMeta(id: CustomizePartId) {
  return CUSTOMIZE_PARTS.find((p) => p.id === id) ?? CUSTOMIZE_PARTS[0];
}

/** Fixed 360px right inspector rendered on desktop viewports (1200px and wider). */
export function InspectorPanel({
  activePart,
  onAdvancePart,
  children,
}: InspectorPanelProps) {
  const meta = getPartMeta(activePart);

  return (
    <aside
      aria-label="Part inspector"
      className="hidden w-[360px] shrink-0 overflow-hidden rounded-[12px] bg-[var(--surface)] min-[1200px]:sticky min-[1200px]:top-[116px] min-[1200px]:flex min-[1200px]:max-h-[calc(100vh-188px)] min-[1200px]:flex-col min-[1200px]:self-start"
    >
      <div className="shrink-0 px-5 pt-5 pb-3">
        <h2 className="text-[18px] leading-6 font-semibold tracking-[-0.02em] text-[var(--text)]">
          {meta.label}
        </h2>
        <p className="mt-1 text-[13px] leading-5 text-[var(--text-2)]">
          {meta.description}
        </p>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto px-5 pb-5">
        {children}
      </div>

      <div className="shrink-0 bg-[var(--surface-2)] px-5 py-3.5">
        <StudioButton
          variant="primary"
          className="w-full justify-between"
          onClick={onAdvancePart}
        >
          <span>{meta.nextLabel}</span>
          <ArrowRight />
        </StudioButton>
      </div>
    </aside>
  );
}
