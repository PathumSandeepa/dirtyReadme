import {
  buildAnimationStyles,
  buildDefs,
  escapeXml,
  renderCreatureGeometryOnly,
} from "@/lib/creatureArt";
import {
  STAGE_DEFINITIONS,
  derivePalette,
  getCreatureMeta,
  getEvolutionStage,
} from "@/lib/themes";
import type { CreatureConfig } from "@/types/creature";

export const SHARE_CARD_WIDTH = 1280;
export const SHARE_CARD_HEIGHT = 640;

export function buildShareCardInnerSvg(
  config: CreatureConfig,
  idPrefix = "sc"
): string {
  const p = derivePalette(config);
  const styles = buildAnimationStyles(config.animationSpeed);
  const defs = buildDefs(p, idPrefix);
  const stageInfo = getEvolutionStage(config.commits);
  const meta = getCreatureMeta(config.creature);
  const geometry = renderCreatureGeometryOnly(config, idPrefix);

  const safeUser = escapeXml(config.username.trim() || "PathumSandeepa");
  const titleText = config.customTitle.trim()
    ? escapeXml(config.customTitle.trim().toUpperCase())
    : escapeXml(`${stageInfo.rank} ${meta.name.toUpperCase()}`);
  const formattedCommits = Math.max(
    0,
    Math.floor(config.commits || 0)
  ).toLocaleString("en-US");
  const windowLabel = config.windowMode === "annual" ? "ANNUAL" : "365D ROLLING";

  const langChips = (config.languages ?? []).slice(0, 3);
  const langMarkup = langChips
    .map((lang, idx) => {
      const x = 44 + idx * 146;
      return `
        <rect x="${x}" y="592" width="10" height="10" rx="2" fill="${escapeXml(lang.color)}" />
        <text x="${x + 16}" y="601" fill="#C9D1D9" font-family="ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace" font-size="13" font-weight="600">${escapeXml(lang.name.toUpperCase().slice(0, 12))}</text>
      `;
    })
    .join("");

  const stageRail = STAGE_DEFINITIONS.map((st, idx) => {
    const x = 768 + idx * 96;
    const isActive = st.stage === stageInfo.stage;
    const isUnlocked = st.stage <= stageInfo.stage;
    return `
      <rect x="${x}" y="576" width="84" height="28" rx="6" fill="${isActive ? p.accentMain : isUnlocked ? "#1F2937" : "#0D1117"}" fill-opacity="${isActive ? "0.22" : "0.9"}" stroke="${isActive ? p.accentMain : isUnlocked ? p.energyMain : "#30363D"}" stroke-width="${isActive ? "1.6" : "1"}" />
      <text x="${x + 42}" y="594" fill="${isActive ? "#FFFFFF" : isUnlocked ? p.energyBright : "#6E7681"}" font-family="ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace" font-size="12" font-weight="${isActive ? "700" : "600"}" text-anchor="middle">${st.shortCode}</text>
    `;
  }).join("");

  return `
    <style>${styles}</style>
    ${defs}
    <!-- Canvas Backdrop -->
    <rect x="0" y="0" width="1280" height="640" fill="#070B12" />
    <!-- Subtle Blueprint Grid -->
    <g stroke="#162032" stroke-width="1" opacity="0.55">
      <line x1="0" y1="160" x2="1280" y2="160" />
      <line x1="0" y1="320" x2="1280" y2="320" />
      <line x1="0" y1="480" x2="1280" y2="480" />
      <line x1="320" y1="0" x2="320" y2="640" />
      <line x1="640" y1="0" x2="640" y2="640" />
      <line x1="960" y1="0" x2="960" y2="640" />
    </g>

    <!-- Outer Telemetry Frame -->
    <rect x="20" y="20" width="1240" height="600" rx="14" fill="none" stroke="#1F6FEB" stroke-opacity="0.7" stroke-width="2" />
    <rect x="26" y="26" width="1228" height="588" rx="10" fill="none" stroke="#30363D" stroke-width="1" />

    <!-- Top Header Strip -->
    <rect x="28" y="28" width="1224" height="48" rx="8" fill="#0D1117" fill-opacity="0.92" />
    <line x1="28" y1="76" x2="1252" y2="76" stroke="#21262D" stroke-width="1.5" />
    <circle class="cc-hud-blink" cx="50" cy="52" r="5" fill="${p.energyMain}" />
    <text x="66" y="57" fill="#E6EDF3" font-family="ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace" font-size="15" font-weight="700" letter-spacing="1.2">DYNAMIC-README-CREATURE // @${safeUser}</text>
    <text x="1232" y="57" fill="${p.accentMain}" font-family="ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace" font-size="15" font-weight="700" text-anchor="end">STAGE ${stageInfo.stage}: ${titleText}</text>

    <!-- Centered Creature Showcase -->
    <g transform="translate(150, 72) scale(1.06)">
      ${geometry}
    </g>

    <!-- Bottom Telemetry Panel -->
    <rect x="28" y="514" width="1224" height="98" rx="8" fill="#0D1117" fill-opacity="0.92" />
    <line x1="28" y1="514" x2="1252" y2="514" stroke="#21262D" stroke-width="1.5" />
    <rect x="44" y="534" width="10" height="10" rx="2" fill="${p.energyMain}" />
    <text x="62" y="544" fill="#E6EDF3" font-family="ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace" font-size="15" font-weight="700">STAGE ${stageInfo.stage}: ${titleText}</text>
    <text x="44" y="570" fill="#8B949E" font-family="ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace" font-size="14" font-weight="600">CONTRIBUTIONS (${windowLabel}): <tspan fill="#FFFFFF">${formattedCommits}</tspan>  •  VIEW: ${config.view.toUpperCase()}</text>
    ${langMarkup}

    <!-- Evolution Stage Rail -->
    <text x="768" y="556" fill="#8B949E" font-family="ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace" font-size="12" font-weight="600" letter-spacing="0.8">EVOLUTION PROGRESSION (0 → 2,500+)</text>
    ${stageRail}
  `.trim();
}

export function generateShareCardSvgString(config: CreatureConfig): string {
  const meta = getCreatureMeta(config.creature);
  const inner = buildShareCardInnerSvg(config, "sc");
  const title = escapeXml(
    `${meta.name} Share Card - @${config.username || "PathumSandeepa"}`
  );

  return [
    `<?xml version="1.0" encoding="UTF-8"?>`,
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${SHARE_CARD_WIDTH} ${SHARE_CARD_HEIGHT}" width="${SHARE_CARD_WIDTH}" height="${SHARE_CARD_HEIGHT}" role="img" aria-label="${title}">`,
    `  <title>${title}</title>`,
    `  ${inner}`,
    `</svg>`,
  ].join("\n");
}
