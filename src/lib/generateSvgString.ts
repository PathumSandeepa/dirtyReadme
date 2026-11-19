import {
  SVG_HEIGHT,
  SVG_WIDTH,
  buildCreatureInnerSvg,
  escapeXml,
} from "@/lib/creatureArt";
import { getCreatureMeta } from "@/lib/themes";
import type { CreatureConfig } from "@/types/creature";

/**
 * Generates a complete, self-contained, animated `.svg` document string
 * suitable for embedding directly in a GitHub Profile `README.md`.
 */
export function generateSvgString(config: CreatureConfig): string {
  const meta = getCreatureMeta(config.creature);
  const inner = buildCreatureInnerSvg(config, "cc");
  const ariaLabel = escapeXml(`${meta.name} - ${meta.subtitle}`);

  return [
    `<?xml version="1.0" encoding="UTF-8"?>`,
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${SVG_WIDTH} ${SVG_HEIGHT}" width="${SVG_WIDTH}" height="${SVG_HEIGHT}" role="img" aria-label="${ariaLabel}">`,
    `  <title>${ariaLabel}</title>`,
    `  ${inner}`,
    `</svg>`,
  ].join("\n");
}
