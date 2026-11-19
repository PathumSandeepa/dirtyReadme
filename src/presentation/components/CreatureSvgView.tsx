"use client";

import { useId, useMemo } from "react";
import type { CreatureConfig } from "@/domain/creature/entities";
import { getCreatureMeta } from "@/domain/creature/services";
import {
  SVG_HEIGHT,
  SVG_WIDTH,
  buildCreatureInnerSvg,
} from "@/domain/creature/svgRenderer";

interface CreatureSvgViewProps {
  config: CreatureConfig;
  className?: string;
}

export function CreatureSvgView({
  config,
  className = "",
}: CreatureSvgViewProps) {
  const rawId = useId();
  const idPrefix = useMemo(
    () => `cc-${rawId.replace(/[^a-zA-Z0-9_-]/g, "")}`,
    [rawId]
  );

  const innerSvg = useMemo(
    () => buildCreatureInnerSvg(config, idPrefix),
    [config, idPrefix]
  );

  const meta = getCreatureMeta(config.creature);

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox={`0 0 ${SVG_WIDTH} ${SVG_HEIGHT}`}
      role="img"
      aria-label={`${meta.name} (${meta.subtitle})`}
      className={className}
      dangerouslySetInnerHTML={{ __html: innerSvg }}
    />
  );
}
