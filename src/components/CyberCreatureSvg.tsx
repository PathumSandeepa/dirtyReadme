"use client";

import { useId, useMemo } from "react";
import { SVG_HEIGHT, SVG_WIDTH, buildCreatureInnerSvg } from "@/lib/creatureArt";
import { getCreatureMeta } from "@/lib/themes";
import type { CreatureConfig } from "@/types/creature";

interface CyberCreatureSvgProps {
  config: CreatureConfig;
  className?: string;
}

export function CyberCreatureSvg({
  config,
  className = "",
}: CyberCreatureSvgProps) {
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
