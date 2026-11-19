"use client";

import { useId, useMemo } from "react";
import type { CreatureConfig } from "@/domain/creature/entities";
import { getCreatureMeta } from "@/domain/creature/services";
import {
  SHARE_CARD_HEIGHT,
  SHARE_CARD_WIDTH,
  buildShareCardInnerSvg,
} from "@/domain/creature/svgRenderer";

interface ShareCardSvgViewProps {
  config: CreatureConfig;
  className?: string;
}

export function ShareCardSvgView({
  config,
  className = "",
}: ShareCardSvgViewProps) {
  const rawId = useId();
  const idPrefix = useMemo(
    () => `sc-${rawId.replace(/[^a-zA-Z0-9_-]/g, "")}`,
    [rawId]
  );

  const innerSvg = useMemo(
    () => buildShareCardInnerSvg(config, idPrefix),
    [config, idPrefix]
  );

  const meta = getCreatureMeta(config.creature);

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox={`0 0 ${SHARE_CARD_WIDTH} ${SHARE_CARD_HEIGHT}`}
      role="img"
      aria-label={`${meta.name} Social Share Card`}
      className={className}
      dangerouslySetInnerHTML={{ __html: innerSvg }}
    />
  );
}
