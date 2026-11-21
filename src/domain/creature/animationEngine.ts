import {
  STAGE_DEFINITIONS,
  type CreatureConfig,
  type HudAlign,
  type HudFontFamily,
  type HudFontWeight,
} from "@/domain/creature/entities";
import { GLYPHS_5X7, fillRectRgba } from "@/domain/creature/pixelArt";
import {
  derivePalette,
  getCreatureMeta,
  getEffectiveCameraView,
  getEvolutionStage,
  getViewDisplayLabel,
  getVisibleLanguages,
  hexToRgb,
  mixHex,
  resolveHudFontColor,
  resolveWaterMode,
} from "@/domain/creature/services";

export const CANVAS_WIDTH = 920;
export const CANVAS_HEIGHT = 460;
export const LOGICAL_WIDTH = 460;
export const LOGICAL_HEIGHT = 230;
export const SHARE_CARD_WIDTH = 1280;
export const SHARE_CARD_HEIGHT = 640;
export const BASE_LOOP_DURATION_MS = 2800;

export interface SpriteRgba {
  width: number;
  height: number;
  data: Uint8ClampedArray;
}

const STAGE_SCALES = [0.46, 0.6, 0.74, 0.89, 1.05] as const;

function clamp(v: number, lo: number, hi: number): number {
  return v < lo ? lo : v > hi ? hi : v;
}

function smoothstep(edge0: number, edge1: number, x: number): number {
  const t = clamp((x - edge0) / (edge1 - edge0), 0, 1);
  return t * t * (3 - 2 * t);
}

export function clampAnimationSpeed(speed: number): number {
  if (!Number.isFinite(speed)) return 1;
  return clamp(speed, 0.4, 2.5);
}

export function getLoopDurationMs(speed: number): number {
  return Math.round(BASE_LOOP_DURATION_MS / clampAnimationSpeed(speed));
}

function rgbToHsl(r: number, g: number, b: number): [number, number, number] {
  const rn = r / 255;
  const gn = g / 255;
  const bn = b / 255;
  const max = Math.max(rn, gn, bn);
  const min = Math.min(rn, gn, bn);
  const l = (max + min) / 2;

  if (max === min) {
    return [0, 0, l];
  }
  const d = max - min;
  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
  let h = 0;
  if (max === rn) {
    h = (gn - bn) / d + (gn < bn ? 6 : 0);
  } else if (max === gn) {
    h = (bn - rn) / d + 2;
  } else {
    h = (rn - gn) / d + 4;
  }
  h *= 60;
  return [h, s, l];
}

function hslToRgb(h: number, s: number, l: number): [number, number, number] {
  const hue = ((h % 360) + 360) % 360;
  if (s <= 0.0001) {
    const g = Math.round(clamp(l, 0, 1) * 255);
    return [g, g, g];
  }
  const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
  const p = 2 * l - q;
  const hue2rgb = (t: number) => {
    let tt = t;
    if (tt < 0) tt += 1;
    if (tt > 1) tt -= 1;
    if (tt < 1 / 6) return p + (q - p) * 6 * tt;
    if (tt < 1 / 2) return q;
    if (tt < 2 / 3) return p + (q - p) * (2 / 3 - tt) * 6;
    return p;
  };
  const hNorm = hue / 360;
  return [
    Math.round(hue2rgb(hNorm + 1 / 3) * 255),
    Math.round(hue2rgb(hNorm) * 255),
    Math.round(hue2rgb(hNorm - 1 / 3) * 255),
  ];
}

function blendRgbaPixel(
  buffer: Uint8ClampedArray,
  bufW: number,
  bufH: number,
  px: number,
  py: number,
  r: number,
  g: number,
  b: number,
  a: number
): void {
  if (px < 0 || px >= bufW || py < 0 || py >= bufH || a <= 0) return;
  const idx = (py * bufW + px) * 4;
  if (a >= 255 || buffer[idx + 3] === 0) {
    buffer[idx] = r;
    buffer[idx + 1] = g;
    buffer[idx + 2] = b;
    buffer[idx + 3] = a;
    return;
  }
  const alpha = a / 255;
  const inv = 1 - alpha;
  buffer[idx] = Math.round(r * alpha + buffer[idx] * inv);
  buffer[idx + 1] = Math.round(g * alpha + buffer[idx + 1] * inv);
  buffer[idx + 2] = Math.round(b * alpha + buffer[idx + 2] * inv);
  buffer[idx + 3] = Math.min(255, Math.round(a + buffer[idx + 3] * inv));
}

export function recolorSpriteRgba(
  sprite: SpriteRgba,
  config: CreatureConfig
): SpriteRgba {
  if (config.colorMode === "canonical") {
    return sprite;
  }

  const visibleLangs = getVisibleLanguages(config);
  const langHsls = visibleLangs.map((lang) => {
    const [r, g, b] = hexToRgb(lang.color);
    return rgbToHsl(r, g, b);
  });

  const zonePalette: [number, number, number][] =
    config.colorMode === "languages" && langHsls.length > 0
      ? langHsls
      : [
          rgbToHsl(...hexToRgb(config.colors.primary)),
          rgbToHsl(...hexToRgb(config.colors.accent)),
          rgbToHsl(...hexToRgb(config.colors.energy)),
        ];

  const zoneCount = zonePalette.length;
  const view = getEffectiveCameraView(config.creature, config.view);
  const out = new Uint8ClampedArray(sprite.data.length);
  const src = sprite.data;
  const w = sprite.width;
  const hPx = sprite.height;

  const measureVerticalSpan = (x: number, y: number): number => {
    let span = 1;
    for (let dy = 1; dy <= 5 && y - dy >= 0; dy++) {
      if (src[((y - dy) * w + x) * 4 + 3] <= 20) break;
      span++;
    }
    for (let dy = 1; dy <= 5 && y + dy < hPx; dy++) {
      if (src[((y + dy) * w + x) * 4 + 3] <= 20) break;
      span++;
    }
    return span;
  };

  for (let i = 0; i < src.length; i += 4) {
    const a = src[i + 3];
    if (a === 0) continue;

    const r = src[i];
    const g = src[i + 1];
    const b = src[i + 2];
    const [h, s, l] = rgbToHsl(r, g, b);

    // Keep crisp dark outlines and pure bright highlights untouched
    if (l < 0.13 || (l > 0.9 && s < 0.16)) {
      out[i] = r;
      out[i + 1] = g;
      out[i + 2] = b;
      out[i + 3] = a;
      continue;
    }

    const pixIdx = i / 4;
    const px = pixIdx % w;
    const py = Math.floor(pixIdx / w);
    const u = px / Math.max(1, w - 1);
    const v = (py / Math.max(1, hPx - 1)) * 2 - 1;

    let zoneIdx = 0;

    if (config.creature === "tulkun") {
      if (h >= 6 && h <= 54 && s > 0.24) {
        zoneIdx = 1 % zoneCount;
      } else if (l > 0.56 && h >= 172 && h <= 228 && s > 0.14) {
        zoneIdx = 2 % zoneCount;
      } else if (zoneCount >= 5 && u >= (view === "top" ? 0.79 : 0.77)) {
        zoneIdx = 4 % zoneCount;
      } else if (
        zoneCount >= 5 &&
        (view === "top"
          ? u >= 0.22 && u <= 0.46 && Math.abs(v) > 0.31
          : u >= 0.28 &&
            u <= 0.54 &&
            v > 0.11 - 0.35 * Math.max(0, u - 0.28))
      ) {
        zoneIdx = 3 % zoneCount;
      } else if (
        zoneCount >= 7 &&
        (view === "side"
          ? v > 0.04 && u >= 0.05 && u < 0.77 && (s <= 0.2 || l > 0.42)
          : u >= 0.58 && u < 0.79 && Math.abs(v) > 0.145)
      ) {
        zoneIdx = 5 % zoneCount;
      } else if (
        zoneCount >= 7 &&
        u >= 0.24 &&
        u < (view === "top" ? 0.79 : 0.77) &&
        l >= 0.33 &&
        (view === "top" || v <= 0.04)
      ) {
        zoneIdx = 6 % zoneCount;
      } else if (s <= 0.15 && l > 0.65) {
        const [pH, pS] = zonePalette[0];
        const [nr, ng, nb] = hslToRgb(pH, Math.min(0.16, pS * 0.32), l);
        out[i] = nr;
        out[i + 1] = ng;
        out[i + 2] = nb;
        out[i + 3] = a;
        continue;
      } else {
        zoneIdx = 0;
      }
    } else {
      // Jellyfish: curved bell rim + organic thickness classification (zero straight cuts)
      const isBell = u < 0.265 - 0.08 * v * v;
      if (isBell || zoneCount <= 3) {
        if (l > 0.66) zoneIdx = 1 % zoneCount;
        else if (l < 0.34) zoneIdx = 2 % zoneCount;
        else zoneIdx = 0;
      } else {
        const spanY = measureVerticalSpan(px, py);
        const isThickOralArm = spanY >= 4 && Math.abs(v) < 0.56;
        if (isThickOralArm) {
          zoneIdx = zoneCount >= 7 && l > 0.58 ? 4 : 3 % zoneCount;
        } else if (zoneCount >= 7) {
          zoneIdx = v < 0 ? 5 : 6;
        } else {
          zoneIdx = 4 % zoneCount;
        }
      }
    }

    const [zH, zS, zL] = zonePalette[zoneIdx];
    const targetL = clamp(
      zL * 0.32 + l * 0.68 + (l - 0.42) * 0.22,
      0.16,
      0.9
    );
    const targetS = clamp(zS * 0.92 + s * 0.1, 0.12, 0.98);
    const [nr, ng, nb] = hslToRgb(zH, targetS, targetL);

    out[i] = nr;
    out[i + 1] = ng;
    out[i + 2] = nb;
    out[i + 3] = a;
  }

  return { width: sprite.width, height: sprite.height, data: out };
}

function drawUnderwaterBackdrop(
  buffer: Uint8ClampedArray,
  phase: number,
  config: CreatureConfig,
  hudTopLogicalY: number
): void {
  const t = phase * Math.PI * 2;
  const isTransparent = config.backgroundMode === "transparent";
  const maxWaterY = config.showHud
    ? Math.max(120, Math.min(204, Math.floor(hudTopLogicalY - 2)))
    : 214;

  if (isTransparent) {
    // Soft feathered deep-ocean aura centered behind creature (alpha fades to 0 inside canvas edges)
    const cx = LOGICAL_WIDTH * 0.5;
    const cy = config.showHud ? Math.round(maxWaterY * 0.52) : 112;
    const rx = 212;
    const ry = config.showHud ? Math.max(66, Math.round(maxWaterY * 0.48)) : 104;

    for (let y = 0; y < LOGICAL_HEIGHT; y++) {
      const ny = (y - cy) / ry;
      const ny2 = ny * ny;
      if (ny2 >= 1) continue;
      for (let x = 0; x < LOGICAL_WIDTH; x++) {
        const nx = (x - cx) / rx;
        const r2 = nx * nx + ny2;
        if (r2 >= 1) continue;
        const falloff = Math.pow(1 - Math.sqrt(r2), 1.65);
        const depthT = y / LOGICAL_HEIGHT;
        const r = Math.round(12 + (1 - depthT) * 14);
        const g = Math.round(48 + (1 - depthT) * 52);
        const b = Math.round(92 + (1 - depthT) * 68);
        const a = Math.round(170 * falloff);
        blendRgbaPixel(buffer, LOGICAL_WIDTH, LOGICAL_HEIGHT, x, y, r, g, b, a);
      }
    }
  } else {
    // Subtle deep-water top-to-bottom ocean depth gradient over custom background
    for (let y = 0; y < LOGICAL_HEIGHT; y++) {
      const depth = y / LOGICAL_HEIGHT;
      const topMix = 1 - depth;
      const r = Math.round(8 + topMix * 16);
      const g = Math.round(30 + topMix * 56);
      const b = Math.round(62 + topMix * 84);
      const a = Math.round(72 + Math.abs(0.5 - depth) * 32);
      for (let x = 0; x < LOGICAL_WIDTH; x++) {
        blendRgbaPixel(buffer, LOGICAL_WIDTH, LOGICAL_HEIGHT, x, y, r, g, b, a);
      }
    }
  }

  // Soft swaying underwater caustic sunbeams from surface
  const rayBases = [65, 138, 224, 308, 382];
  const rayWidths = [18, 24, 28, 20, 16];
  const rayMaxY = maxWaterY;

  for (let i = 0; i < rayBases.length; i++) {
    const sway = Math.sin(t + i * 1.35) * 9;
    const baseX = rayBases[i] + sway;
    const width = rayWidths[i];
    for (let y = 4; y < rayMaxY; y++) {
      const vFrac = y / rayMaxY;
      const fadeY = (1 - vFrac) * smoothstep(0, 16, y);
      const center = baseX + vFrac * 26;
      const halfW = (width * (0.65 + vFrac * 0.7)) * 0.5;
      const x0 = Math.max(8, Math.floor(center - halfW));
      const x1 = Math.min(LOGICAL_WIDTH - 8, Math.ceil(center + halfW));

      // Keep rays feathered well inside transparent aura
      const edgeFade = isTransparent
        ? smoothstep(20, 75, center) *
          smoothstep(LOGICAL_WIDTH - 20, LOGICAL_WIDTH - 75, center)
        : 1;

      for (let x = x0; x < x1; x++) {
        const dxNorm = Math.abs(x - center) / Math.max(1, halfW);
        const alpha = Math.round(28 * (1 - dxNorm * dxNorm) * fadeY * edgeFade);
        if (alpha > 2) {
          blendRgbaPixel(
            buffer,
            LOGICAL_WIDTH,
            LOGICAL_HEIGHT,
            x,
            y,
            135,
            222,
            255,
            alpha
          );
        }
      }
    }
  }

  // Subtle drifting underwater current streaks
  for (let s = 0; s < 6; s++) {
    const baseY = 26 + s * 24;
    if (baseY > rayMaxY - 8) continue;
    const segLen = 36 + (s % 3) * 18;
    const scrollX =
      ((s * 83 + phase * LOGICAL_WIDTH) % (LOGICAL_WIDTH + 60)) - 30;
    for (let k = 0; k < segLen; k++) {
      const px = Math.round(scrollX + k);
      if (px < 18 || px > LOGICAL_WIDTH - 18) continue;
      const py = Math.round(baseY + Math.sin(k * 0.16 + t + s) * 2.2);
      const edge = Math.sin((k / segLen) * Math.PI);
      const alpha = Math.round(32 * edge);
      blendRgbaPixel(
        buffer,
        LOGICAL_WIDTH,
        LOGICAL_HEIGHT,
        px,
        py,
        165,
        232,
        255,
        alpha
      );
    }
  }

  // Rising background pixel bubbles
  const maxBubbleY = maxWaterY;
  for (let i = 0; i < 10; i++) {
    const seedX = ((i * 67 + 29) % 100) / 100;
    const seedY = ((i * 43 + 11) % 100) / 100;
    const bx = Math.round(
      36 + seedX * (LOGICAL_WIDTH - 72) + Math.sin(t + i * 1.1) * 3.5
    );
    const riseProgress = (seedY + phase) % 1;
    const by = Math.round(maxBubbleY - riseProgress * (maxBubbleY - 14));
    const fade = Math.sin(riseProgress * Math.PI);
    const alpha = Math.round(145 * fade);
    if (alpha > 12) {
      const size = i % 3 === 0 ? 2 : 1;
      fillRectRgba(buffer, LOGICAL_WIDTH, LOGICAL_HEIGHT, bx, by, size, size, [
        178,
        236,
        255,
        alpha,
      ]);
    }
  }
}

function drawUnderwaterForegroundBubbles(
  buffer: Uint8ClampedArray,
  phase: number,
  config: CreatureConfig,
  hudTopLogicalY: number
): void {
  if (resolveWaterMode(config) !== "water") return;
  const t = phase * Math.PI * 2;
  const maxBubbleY = config.showHud
    ? Math.max(120, Math.min(204, Math.floor(hudTopLogicalY - 2)))
    : 214;

  for (let i = 0; i < 6; i++) {
    const seedX = ((i * 89 + 17) % 100) / 100;
    const seedY = ((i * 53 + 23) % 100) / 100;
    const speedMul = i % 2 === 0 ? 1 : 2;
    const rise = (seedY + phase * speedMul) % 1;
    const bx = Math.round(
      46 + seedX * (LOGICAL_WIDTH - 92) + Math.sin(t * speedMul + i * 2.1) * 4.5
    );
    const by = Math.round(maxBubbleY - rise * (maxBubbleY - 16));
    const alpha = Math.round(180 * Math.sin(rise * Math.PI));
    if (alpha < 18) continue;

    if (i < 2) {
      // Crisp 4x4 hollow pixel bubble ring with top-left specular gleam
      const rim: readonly [number, number, number, number] = [
        148,
        224,
        255,
        alpha,
      ];
      const gleam: readonly [number, number, number, number] = [
        235,
        250,
        255,
        Math.min(255, alpha + 40),
      ];
      fillRectRgba(buffer, LOGICAL_WIDTH, LOGICAL_HEIGHT, bx + 1, by, 2, 1, rim);
      fillRectRgba(
        buffer,
        LOGICAL_WIDTH,
        LOGICAL_HEIGHT,
        bx + 1,
        by + 3,
        2,
        1,
        rim
      );
      fillRectRgba(buffer, LOGICAL_WIDTH, LOGICAL_HEIGHT, bx, by + 1, 1, 2, rim);
      fillRectRgba(
        buffer,
        LOGICAL_WIDTH,
        LOGICAL_HEIGHT,
        bx + 3,
        by + 1,
        1,
        2,
        rim
      );
      fillRectRgba(
        buffer,
        LOGICAL_WIDTH,
        LOGICAL_HEIGHT,
        bx + 1,
        by + 1,
        1,
        1,
        gleam
      );
    } else {
      fillRectRgba(buffer, LOGICAL_WIDTH, LOGICAL_HEIGHT, bx, by, 2, 2, [
        200,
        242,
        255,
        alpha,
      ]);
    }
  }
}

function drawWakeParticles(
  buffer: Uint8ClampedArray,
  stage: number,
  phase: number,
  config: CreatureConfig,
  hudTopLogicalY: number
): void {
  const waterMode = resolveWaterMode(config);
  if (waterMode === "clear" || stage < 2) return;
  const count = stage === 2 ? 4 : stage === 3 ? 7 : stage === 4 ? 11 : 15;
  const p = derivePalette(config);
  const visibleLangs = getVisibleLanguages(config);
  const useLangColors =
    config.colorMode !== "canonical" && visibleLangs.length > 0;
  const [er, eg, eb] = hexToRgb(p.energyBright);
  const [ar, ag, ab] = hexToRgb(p.accentMain);
  const maxY = config.showHud
    ? Math.max(120, Math.min(204, Math.floor(hudTopLogicalY - 2)))
    : 216;

  for (let i = 0; i < count; i++) {
    const seed1 = ((i * 73 + 19) % 100) / 100;
    const seed2 = ((i * 41 + 7) % 100) / 100;
    const speedMul = (i % 3) + 1;
    const xWrap = (seed1 + phase * speedMul) % 1;
    const px = Math.round(28 + xWrap * (LOGICAL_WIDTH - 56));
    const py = Math.round(
      24 +
      seed2 * (maxY - 36) +
      Math.sin((phase * speedMul + seed1) * Math.PI * 2) * 4
    );
    const size = i % 4 === 0 && stage >= 4 ? 2 : 1;
    const alpha = clamp(
      Math.round(135 + 50 * Math.sin((phase + seed2) * Math.PI * 2) + 50),
      90,
      235
    );

    let rgb: [number, number, number];
    if (useLangColors) {
      const lang = visibleLangs[i % visibleLangs.length];
      rgb = hexToRgb(mixHex(lang.color, "#FFFFFF", 0.35));
    } else {
      const useAccent = i % 5 === 0 && stage >= 4;
      rgb = useAccent ? [ar, ag, ab] : [er, eg, eb];
    }

    fillRectRgba(buffer, LOGICAL_WIDTH, LOGICAL_HEIGHT, px, py, size, size, [
      rgb[0],
      rgb[1],
      rgb[2],
      alpha,
    ]);
  }
}

export interface HudChipItem {
  name: string;
  color: string;
  swatchSize: number;
  width: number;
}

export interface HudLayout {
  topY: number;
  fontSize: number;
  chipFontSize: number;
  fontFamily: HudFontFamily;
  fontWeight: HudFontWeight;
  fontColor: string;
  align: HudAlign;
  accentColor: string;
  swatchSize: number;
  line1Text: string;
  line1Y: number;
  line1Width: number;
  line2Text: string;
  line2Y: number;
  line2Width: number;
  chipRows: { y: number; totalWidth: number; items: HudChipItem[] }[];
}

function getCssFontString(
  family: Exclude<HudFontFamily, "pixel">,
  size: number,
  weight: HudFontWeight
): string {
  const cssWeight = weight === "normal" ? "400" : weight === "semibold" ? "600" : "700";
  const cssFamily =
    family === "mono"
      ? 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", monospace'
      : family === "serif"
        ? 'Georgia, "Times New Roman", Times, serif'
        : 'system-ui, -apple-system, "Segoe UI", Roboto, Helvetica, Arial, sans-serif';
  return `${cssWeight} ${size}px ${cssFamily}`;
}

function measureTextWidthApprox(
  text: string,
  fontSize: number,
  family: HudFontFamily,
  weight: HudFontWeight,
  ctx?: CanvasRenderingContext2D
): number {
  if (family === "pixel") {
    const unit = fontSize / 7;
    return Math.max(0, text.length * 6 * unit - unit);
  }
  if (ctx) {
    ctx.font = getCssFontString(family, fontSize, weight);
    return ctx.measureText(text).width;
  }
  const ratio =
    family === "mono" ? 0.66 : family === "serif" ? 0.6 : weight === "bold" ? 0.62 : 0.58;
  return text.length * fontSize * ratio;
}

export function computeHudLayout(
  config: CreatureConfig,
  ctx?: CanvasRenderingContext2D
): HudLayout {
  const stageInfo = getEvolutionStage(config.commits);
  const meta = getCreatureMeta(config.creature);
  const titleText = config.customTitle.trim()
    ? config.customTitle.trim().toUpperCase()
    : `${stageInfo.rank} ${meta.id.toUpperCase()}`;
  const formattedCommits = Math.max(
    0,
    Math.floor(config.commits || 0)
  ).toLocaleString("en-US");

  const fontSize = clamp(Math.round(config.hudFontSize || 14), 12, 22);
  const chipFontSize = Math.max(10, Math.round(fontSize * 0.86));
  const fontFamily: HudFontFamily =
    config.hudFontFamily === "mono" ||
    config.hudFontFamily === "sans" ||
    config.hudFontFamily === "serif"
      ? config.hudFontFamily
      : "pixel";
  const fontWeight: HudFontWeight =
    config.hudFontWeight === "normal" || config.hudFontWeight === "semibold"
      ? config.hudFontWeight
      : "bold";
  const align: HudAlign =
    config.hudAlign === "center" || config.hudAlign === "right"
      ? config.hudAlign
      : "left";

  const p = derivePalette(config);
  const fontColor = resolveHudFontColor(config);

  const line1Text = `STAGE ${stageInfo.stage}: ${titleText}`;
  const line2Text = `CONTRIBUTIONS: ${formattedCommits}`;

  const swatchSize = Math.max(8, Math.round(fontSize * 0.68));
  const swatchGap = Math.max(6, Math.round(fontSize * 0.45));
  const line1TextWidth = measureTextWidthApprox(
    line1Text,
    fontSize,
    fontFamily,
    fontWeight,
    ctx
  );
  const line1Width = swatchSize + swatchGap + line1TextWidth;
  const line2Width = measureTextWidthApprox(
    line2Text,
    fontSize,
    fontFamily,
    fontWeight,
    ctx
  );

  const chipSwatch = Math.max(7, Math.round(chipFontSize * 0.62));
  const chipSwatchGap = Math.max(5, Math.round(chipFontSize * 0.4));
  const chipSpacer = 22;
  const maxHudWidth = CANVAS_WIDTH - 80;

  const visibleLangs = getVisibleLanguages(config);
  const wrappedRows: { items: HudChipItem[]; totalWidth: number }[] = [];
  let currentItems: HudChipItem[] = [];
  let currentWidth = 0;

  for (const lang of visibleLangs) {
    const nameShort = lang.name.toUpperCase().slice(0, 10);
    const labelW = measureTextWidthApprox(
      nameShort,
      chipFontSize,
      fontFamily,
      fontWeight,
      ctx
    );
    const itemW = chipSwatch + chipSwatchGap + labelW;
    const added = currentItems.length === 0 ? itemW : chipSpacer + itemW;
    if (currentItems.length > 0 && currentWidth + added > maxHudWidth) {
      wrappedRows.push({ items: currentItems, totalWidth: currentWidth });
      currentItems = [{ name: nameShort, color: lang.color, swatchSize: chipSwatch, width: itemW }];
      currentWidth = itemW;
    } else {
      currentItems.push({ name: nameShort, color: lang.color, swatchSize: chipSwatch, width: itemW });
      currentWidth += added;
    }
  }
  if (currentItems.length > 0) {
    wrappedRows.push({ items: currentItems, totalWidth: currentWidth });
  }

  const lineStep = Math.round(fontSize * 1.38);
  const chipStep = Math.round(chipFontSize * 1.45);
  const totalHeight =
    lineStep * 2 + 4 + wrappedRows.length * chipStep;
  const topY = Math.max(12, CANVAS_HEIGHT - 14 - totalHeight);

  const line1Y = topY;
  const line2Y = topY + lineStep;
  const chipsStartY = line2Y + lineStep + 4;

  const chipRows = wrappedRows.map((row, idx) => ({
    y: chipsStartY + idx * chipStep,
    totalWidth: row.totalWidth,
    items: row.items,
  }));

  return {
    topY,
    fontSize,
    chipFontSize,
    fontFamily,
    fontWeight,
    fontColor,
    align,
    accentColor: p.accentMain,
    swatchSize,
    line1Text,
    line1Y,
    line1Width,
    line2Text,
    line2Y,
    line2Width,
    chipRows,
  };
}

function getRowStartX(align: HudAlign, rowWidth: number): number {
  const marginX = 40;
  if (align === "center") {
    return (CANVAS_WIDTH - rowWidth) * 0.5;
  }
  if (align === "right") {
    return CANVAS_WIDTH - marginX - rowWidth;
  }
  return marginX;
}

function drawPixelTextCanvas(
  ctx: CanvasRenderingContext2D,
  text: string,
  originX: number,
  originY: number,
  fontSize: number,
  weight: HudFontWeight,
  color: string
): void {
  const upper = text.toUpperCase();
  const unit = fontSize / 7;
  const dotExpand = weight === "bold" ? Math.max(0.45, unit * 0.22) : weight === "semibold" ? Math.max(0.2, unit * 0.1) : 0;
  let cursorX = originX;
  const startY = originY;

  ctx.fillStyle = color;
  for (let i = 0; i < upper.length; i++) {
    const glyph = GLYPHS_5X7[upper[i]] ?? GLYPHS_5X7[" "];
    for (let row = 0; row < glyph.length; row++) {
      const bits = glyph[row];
      for (let col = 0; col < bits.length; col++) {
        if (bits[col] === "1") {
          ctx.fillRect(
            Math.round(cursorX + col * unit),
            Math.round(startY + row * unit),
            Math.max(1, Math.ceil(unit + dotExpand)),
            Math.max(1, Math.ceil(unit))
          );
        }
      }
    }
    cursorX += 6 * unit;
  }
}

export function drawHudOnCanvas2D(
  ctx: CanvasRenderingContext2D,
  config: CreatureConfig
): void {
  if (!config.showHud) return;

  const layout = computeHudLayout(config, ctx);
  const swatchGap1 = Math.max(6, Math.round(layout.fontSize * 0.45));
  const row1X = getRowStartX(layout.align, layout.line1Width);
  const row1SwatchY = layout.line1Y + Math.round((layout.fontSize - layout.swatchSize) * 0.5);

  ctx.save();
  ctx.fillStyle = layout.accentColor;
  ctx.beginPath();
  ctx.roundRect(row1X, row1SwatchY, layout.swatchSize, layout.swatchSize, 2);
  ctx.fill();

  const text1X = row1X + layout.swatchSize + swatchGap1;
  const row2X = getRowStartX(layout.align, layout.line2Width);

  if (layout.fontFamily === "pixel") {
    drawPixelTextCanvas(
      ctx,
      layout.line1Text,
      text1X,
      layout.line1Y,
      layout.fontSize,
      layout.fontWeight,
      layout.fontColor
    );
    drawPixelTextCanvas(
      ctx,
      layout.line2Text,
      row2X,
      layout.line2Y,
      layout.fontSize,
      layout.fontWeight,
      layout.fontColor
    );
  } else {
    ctx.textBaseline = "top";
    ctx.textAlign = "left";
    ctx.fillStyle = layout.fontColor;
    ctx.font = getCssFontString(
      layout.fontFamily,
      layout.fontSize,
      layout.fontWeight
    );
    ctx.fillText(layout.line1Text, text1X, layout.line1Y);
    ctx.fillText(layout.line2Text, row2X, layout.line2Y);
  }

  const chipSwatchGap = Math.max(5, Math.round(layout.chipFontSize * 0.4));
  for (const row of layout.chipRows) {
    let cx = getRowStartX(layout.align, row.totalWidth);
    for (const item of row.items) {
      const sy =
        row.y + Math.round((layout.chipFontSize - item.swatchSize) * 0.5);
      ctx.fillStyle = item.color;
      ctx.beginPath();
      ctx.roundRect(cx, sy, item.swatchSize, item.swatchSize, 2);
      ctx.fill();

      const labelX = cx + item.swatchSize + chipSwatchGap;
      if (layout.fontFamily === "pixel") {
        drawPixelTextCanvas(
          ctx,
          item.name,
          labelX,
          row.y,
          layout.chipFontSize,
          layout.fontWeight,
          layout.fontColor
        );
      } else {
        ctx.textBaseline = "top";
        ctx.textAlign = "left";
        ctx.fillStyle = layout.fontColor;
        ctx.font = getCssFontString(
          layout.fontFamily,
          layout.chipFontSize,
          layout.fontWeight
        );
        ctx.fillText(item.name, labelX, row.y);
      }

      cx += item.width + 22;
    }
  }
  ctx.restore();
}

export function estimateHudTopLogicalY(config: CreatureConfig): number {
  if (!config.showHud) return LOGICAL_HEIGHT;
  return computeHudLayout(config).topY * 0.5;
}

function invertCreatureDisplacement(
  creature: CreatureConfig["creature"],
  view: "side" | "top",
  lx: number,
  ly: number,
  drawW: number,
  drawH: number,
  stageScale: number,
  t: number
): [number, number] {
  const ampScale = 0.55 + 0.45 * stageScale;

  if (creature === "jellyfish") {
    const pulse =
      (0.62 * Math.sin(t) +
        0.26 * Math.sin(2 * t - 0.5) +
        0.08 * Math.sin(3 * t - 1.0)) /
      0.92;

    const u = clamp(lx / drawW + 0.5, 0, 1);
    const v = clamp((ly / drawH) * 2, -1.2, 1.2);

    const trailWeight = smoothstep(0.21, 0.29, u);
    const bellWeight = 1 - trailWeight;

    const rimFactor = smoothstep(0.02, 0.24, u);
    const bellScaleY = 1.0 - 0.145 * pulse * (0.25 + 0.75 * rimFactor);
    const bellScaleX = 1.0 + 0.075 * pulse * (1.0 - 0.35 * rimFactor);
    const rimRipple = 1.35 * rimFactor * Math.sin(v * Math.PI * 3.0) * pulse;
    const pivotLx = (0.14 - 0.5) * drawW;

    const bellSrcX = pivotLx + (lx - pivotLx) / bellScaleX;
    const bellSrcY = (ly - rimRipple) / bellScaleY;

    const trailT = clamp((u - 0.21) / 0.79, 0, 1);
    const vPhase = v * 0.65;
    const primaryAmp = 14.5 * ampScale * Math.pow(trailT, 1.12);
    const secondaryAmp = 3.0 * ampScale * Math.pow(trailT, 1.35);
    const waveY =
      primaryAmp * Math.sin(1.65 * Math.PI * 2 * trailT - t + vPhase) +
      secondaryAmp * Math.sin(2.7 * Math.PI * 2 * trailT - 2 * t - vPhase);
    const dragX =
      4.6 * ampScale * Math.pow(trailT, 0.85) * Math.sin(t - 0.65 - trailT * 1.4);
    const baseRimAttach = 1.0 - 0.11 * pulse * (1.0 - trailT * 0.85);

    const trailSrcX = lx - dragX;
    const trailSrcY = (ly - waveY) / baseRimAttach;

    return [
      bellSrcX * bellWeight + trailSrcX * trailWeight,
      bellSrcY * bellWeight + trailSrcY * trailWeight,
    ];
  }

  if (view === "top") {
    const maxAmp = 16.5 * ampScale;
    const k = 1.45;
    let srcX = lx;
    let srcY = ly;

    for (let iter = 0; iter < 2; iter++) {
      const u = clamp(srcX / drawW + 0.5, 0, 1);
      const v = clamp((srcY / drawH) * 2, -1, 1);
      const env = 0.09 + 0.91 * Math.pow(u, 1.55);
      const waveAngle = k * Math.PI * 2 * u - t;
      const spineY = maxAmp * env * Math.sin(waveAngle);

      const dEnv = (0.91 * 1.55 * Math.pow(Math.max(u, 0.001), 0.55)) / drawW;
      const dWave = (k * Math.PI * 2) / drawW;
      const slopeY =
        maxAmp * (dEnv * Math.sin(waveAngle) + env * Math.cos(waveAngle) * dWave);

      const uWing = Math.exp(-Math.pow((u - 0.34) / 0.11, 2));
      const vWing = smoothstep(0.24, 0.52, Math.abs(v));
      const wingMask = uWing * vWing;
      const wingSweepX = 6.5 * ampScale * wingMask * Math.sin(t - 0.6);
      const wingSweepY =
        2.8 * ampScale * wingMask * Math.sign(v) * Math.cos(t - 0.6);

      srcY = ly - spineY - wingSweepY;
      srcX = lx - wingSweepX + slopeY * srcY * 0.28;
    }

    return [srcX, srcY];
  }

  const maxAmp = 15.5 * ampScale;
  const k = 1.35;
  let srcX = lx;
  let srcY = ly;

  for (let iter = 0; iter < 2; iter++) {
    const u = clamp(srcX / drawW + 0.5, 0, 1);
    const v = clamp((srcY / drawH) * 2, -1, 1);
    const env = 0.11 + 0.89 * Math.pow(u, 1.65);
    const waveAngle = k * Math.PI * 2 * u - t;
    const spineY = maxAmp * env * Math.sin(waveAngle);

    const dEnv = (0.89 * 1.65 * Math.pow(Math.max(u, 0.001), 0.65)) / drawW;
    const dWave = (k * Math.PI * 2) / drawW;
    const slopeY =
      maxAmp * (dEnv * Math.sin(waveAngle) + env * Math.cos(waveAngle) * dWave);

    const uFin = Math.exp(-Math.pow((u - 0.42) / 0.13, 2));
    const vFin = smoothstep(0.18, 0.58, v);
    const finMask = uFin * vFin;
    const finDx = 6.0 * ampScale * finMask * Math.sin(t - 0.9);
    const finDy = 3.2 * ampScale * finMask * Math.cos(t - 0.9);

    srcY = ly - spineY - finDy;
    srcX = lx - finDx + slopeY * srcY * 0.24;
  }

  return [srcX, srcY];
}

export function renderCreatureFrameRgba(
  recoloredSprite: SpriteRgba,
  config: CreatureConfig,
  phase: number,
  options?: { forceTransparent?: boolean; skipHud?: boolean }
): Uint8ClampedArray {
  const out = new Uint8ClampedArray(LOGICAL_WIDTH * LOGICAL_HEIGHT * 4);
  const forceTransparent = options?.forceTransparent ?? false;
  const p = derivePalette(config);
  const waterMode = resolveWaterMode(config);
  const hudTopLogicalY = estimateHudTopLogicalY(config);

  if (!forceTransparent && config.backgroundMode !== "transparent") {
    const [br, bg, bb] = hexToRgb(p.background);
    for (let i = 0; i < out.length; i += 4) {
      out[i] = br;
      out[i + 1] = bg;
      out[i + 2] = bb;
      out[i + 3] = 255;
    }
  }

  if (waterMode === "water") {
    drawUnderwaterBackdrop(out, phase, config, hudTopLogicalY);
  }

  const stageInfo = getEvolutionStage(config.commits);
  const stageScale = STAGE_SCALES[stageInfo.stage - 1] ?? 1.0;
  const view = getEffectiveCameraView(config.creature, config.view);
  const t = phase * Math.PI * 2;

  drawWakeParticles(out, stageInfo.stage, phase, config, hudTopLogicalY);

  const availH = Math.max(96, hudTopLogicalY - 12);
  const baseFitW = view === "top" ? 340 : 356;
  const baseFitH =
    view === "top"
      ? config.showHud
        ? Math.min(148, availH * 0.85)
        : 192
      : config.showHud
        ? Math.min(142, availH * 0.84)
        : 172;
  const maxFitW = baseFitW * stageScale;
  const maxFitH = baseFitH * stageScale;

  const fitScale = Math.min(
    maxFitW / Math.max(1, recoloredSprite.width),
    maxFitH / Math.max(1, recoloredSprite.height)
  );
  const drawW = recoloredSprite.width * fitScale;
  const drawH = recoloredSprite.height * fitScale;

  const centerX = LOGICAL_WIDTH * 0.5;
  const centerY = config.showHud
    ? Math.max(54, Math.min(96, (hudTopLogicalY - 6) * 0.49))
    : 115;

  let globalX = 0;
  let globalY = 0;
  const ampScale = 0.55 + 0.45 * stageScale;
  if (config.creature === "jellyfish") {
    globalX =
      (-6.5 * Math.sin(t - 0.45) - 1.6 * Math.sin(2 * t - 0.9)) * ampScale;
    globalY = 2.4 * Math.sin(t + 0.5) * ampScale;
  } else if (view === "top") {
    globalX = -2.2 * Math.cos(t) * ampScale;
    globalY = 1.4 * Math.sin(t + 0.3) * ampScale;
  } else {
    globalX = -2.6 * Math.cos(t) * ampScale;
    globalY = 2.0 * Math.sin(t + 0.5) * ampScale;
  }

  const padX = 24;
  const padY = 30;
  const minDx = Math.max(0, Math.floor(centerX + globalX - drawW * 0.5 - padX));
  const maxDx = Math.min(
    LOGICAL_WIDTH - 1,
    Math.ceil(centerX + globalX + drawW * 0.5 + padX)
  );
  const minDy = Math.max(0, Math.floor(centerY + globalY - drawH * 0.5 - padY));
  const maxDy = Math.min(
    LOGICAL_HEIGHT - 1,
    Math.ceil(centerY + globalY + drawH * 0.5 + padY)
  );

  const srcData = recoloredSprite.data;
  const srcW = recoloredSprite.width;
  const srcH = recoloredSprite.height;

  for (let dy = minDy; dy <= maxDy; dy++) {
    const ly = dy - centerY - globalY;
    for (let dx = minDx; dx <= maxDx; dx++) {
      const lx = dx - centerX - globalX;

      const [srcLx, srcLy] = invertCreatureDisplacement(
        config.creature,
        view,
        lx,
        ly,
        drawW,
        drawH,
        stageScale,
        t
      );

      const sx = Math.round((srcLx / drawW + 0.5) * (srcW - 1));
      const sy = Math.round((srcLy / drawH + 0.5) * (srcH - 1));
      if (sx < 0 || sx >= srcW || sy < 0 || sy >= srcH) continue;

      const sp = (sy * srcW + sx) * 4;
      const sa = srcData[sp + 3];
      if (sa < 12) continue;

      const dp = (dy * LOGICAL_WIDTH + dx) * 4;
      if (sa >= 250 || out[dp + 3] === 0) {
        out[dp] = srcData[sp];
        out[dp + 1] = srcData[sp + 1];
        out[dp + 2] = srcData[sp + 2];
        out[dp + 3] = sa;
      } else {
        const alpha = sa / 255;
        const inv = 1 - alpha;
        out[dp] = Math.round(srcData[sp] * alpha + out[dp] * inv);
        out[dp + 1] = Math.round(srcData[sp + 1] * alpha + out[dp + 1] * inv);
        out[dp + 2] = Math.round(srcData[sp + 2] * alpha + out[dp + 2] * inv);
        out[dp + 3] = Math.min(255, Math.round(sa + out[dp + 3] * inv));
      }
    }
  }

  drawUnderwaterForegroundBubbles(out, phase, config, hudTopLogicalY);
  return out;
}

export function upscaleRgba2x(logical: Uint8ClampedArray): Uint8ClampedArray {
  const out = new Uint8ClampedArray(CANVAS_WIDTH * CANVAS_HEIGHT * 4);
  for (let y = 0; y < LOGICAL_HEIGHT; y++) {
    const outRow0 = y * 2 * CANVAS_WIDTH * 4;
    const outRow1 = (y * 2 + 1) * CANVAS_WIDTH * 4;
    for (let x = 0; x < LOGICAL_WIDTH; x++) {
      const sp = (y * LOGICAL_WIDTH + x) * 4;
      const r = logical[sp];
      const g = logical[sp + 1];
      const b = logical[sp + 2];
      const a = logical[sp + 3];

      const dp0 = outRow0 + x * 8;
      const dp1 = outRow1 + x * 8;
      out[dp0] = r;
      out[dp0 + 1] = g;
      out[dp0 + 2] = b;
      out[dp0 + 3] = a;
      out[dp0 + 4] = r;
      out[dp0 + 5] = g;
      out[dp0 + 6] = b;
      out[dp0 + 7] = a;

      out[dp1] = r;
      out[dp1 + 1] = g;
      out[dp1 + 2] = b;
      out[dp1 + 3] = a;
      out[dp1 + 4] = r;
      out[dp1 + 5] = g;
      out[dp1 + 6] = b;
      out[dp1 + 7] = a;
    }
  }
  return out;
}

export function renderShareCardToCanvas(
  canvas: HTMLCanvasElement,
  recoloredSprite: SpriteRgba,
  config: CreatureConfig,
  phase: number,
  scratchCanvas?: HTMLCanvasElement
): void {
  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  const p = derivePalette(config);
  const stageInfo = getEvolutionStage(config.commits);
  const meta = getCreatureMeta(config.creature);
  const safeUser = config.username.trim() || "your-username";
  const titleText = config.customTitle.trim()
    ? config.customTitle.trim().toUpperCase()
    : `${stageInfo.rank} ${meta.name.toUpperCase()}`;
  const formattedCommits = Math.max(
    0,
    Math.floor(config.commits || 0)
  ).toLocaleString("en-US");
  const windowLabel =
    config.windowMode === "all-time" ? "ALL-TIME" : "THIS YEAR";
  const viewLabel = getViewDisplayLabel(config.creature, config.view);

  ctx.clearRect(0, 0, SHARE_CARD_WIDTH, SHARE_CARD_HEIGHT);
  ctx.fillStyle = "#0B0F17";
  ctx.fillRect(0, 0, SHARE_CARD_WIDTH, SHARE_CARD_HEIGHT);

  ctx.strokeStyle = "rgba(26, 34, 48, 0.55)";
  ctx.lineWidth = 1;
  for (const y of [160, 320, 480]) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(SHARE_CARD_WIDTH, y);
    ctx.stroke();
  }
  for (const x of [320, 640, 960]) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, SHARE_CARD_HEIGHT);
    ctx.stroke();
  }

  ctx.strokeStyle = p.accentMain;
  ctx.globalAlpha = 0.55;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.roundRect(20, 20, 1240, 600, 14);
  ctx.stroke();
  ctx.globalAlpha = 1;

  ctx.fillStyle = "#111622";
  ctx.beginPath();
  ctx.roundRect(28, 28, 1224, 48, 8);
  ctx.fill();

  ctx.fillStyle = p.energyMain;
  ctx.beginPath();
  ctx.arc(50, 52, 5, 0, Math.PI * 2);
  ctx.fill();

  const mono = "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace";
  ctx.font = `700 15px ${mono}`;
  ctx.fillStyle = "#E6EDF3";
  ctx.textAlign = "left";
  ctx.fillText(`DYNAMIC-CREATURE // @${safeUser}`, 66, 57);

  ctx.fillStyle = p.accentMain;
  ctx.textAlign = "right";
  ctx.fillText(`STAGE ${stageInfo.stage}: ${titleText}`, 1232, 57);

  const frameConfig: CreatureConfig = { ...config, showHud: false };
  const frameRgba = renderCreatureFrameRgba(recoloredSprite, frameConfig, phase, {
    forceTransparent: true,
  });

  const offscreen = scratchCanvas ?? document.createElement("canvas");
  if (offscreen.width !== LOGICAL_WIDTH || offscreen.height !== LOGICAL_HEIGHT) {
    offscreen.width = LOGICAL_WIDTH;
    offscreen.height = LOGICAL_HEIGHT;
  }
  const offCtx = offscreen.getContext("2d");
  if (offCtx) {
    const imgData = offCtx.createImageData(LOGICAL_WIDTH, LOGICAL_HEIGHT);
    imgData.data.set(frameRgba);
    offCtx.putImageData(imgData, 0, 0);

    ctx.save();
    ctx.imageSmoothingEnabled = false;
    ctx.drawImage(offscreen, 180, 76, 920, 440);
    ctx.restore();
  }

  ctx.fillStyle = "#111622";
  ctx.beginPath();
  ctx.roundRect(28, 514, 1224, 98, 8);
  ctx.fill();

  ctx.fillStyle = p.energyMain;
  ctx.beginPath();
  ctx.roundRect(44, 534, 10, 10, 2);
  ctx.fill();

  ctx.textAlign = "left";
  ctx.font = `700 15px ${mono}`;
  ctx.fillStyle = "#E6EDF3";
  ctx.fillText(`STAGE ${stageInfo.stage}: ${titleText}`, 62, 544);

  ctx.font = `600 14px ${mono}`;
  ctx.fillStyle = "#8B949E";
  ctx.fillText(
    `CONTRIBUTIONS (${windowLabel}): ${formattedCommits}  •  VIEW: ${viewLabel}`,
    44,
    568
  );

  const langChips = getVisibleLanguages(config);
  const perRow = langChips.length > 4 ? 4 : 3;
  langChips.forEach((lang, idx) => {
    const row = Math.floor(idx / perRow);
    const col = idx % perRow;
    const x = 44 + col * 168;
    const y = langChips.length > 4 ? 584 + row * 18 : 592;
    ctx.fillStyle = lang.color;
    ctx.beginPath();
    ctx.roundRect(x, y, 9, 9, 2);
    ctx.fill();

    ctx.fillStyle = "#C9D1D9";
    ctx.font = `600 12px ${mono}`;
    ctx.fillText(lang.name.toUpperCase().slice(0, 12), x + 15, y + 8);
  });

  ctx.fillStyle = "#8B949E";
  ctx.font = `600 12px ${mono}`;
  ctx.fillText("EVOLUTION (0 -> 2,500+)", 768, 556);

  STAGE_DEFINITIONS.forEach((st, idx) => {
    const x = 768 + idx * 96;
    const isActive = st.stage === stageInfo.stage;
    const isUnlocked = st.stage <= stageInfo.stage;

    ctx.fillStyle = isActive
      ? p.accentMain
      : isUnlocked
        ? "#1F2937"
        : "#0D1117";
    ctx.globalAlpha = isActive ? 0.22 : 0.9;
    ctx.beginPath();
    ctx.roundRect(x, 576, 84, 28, 6);
    ctx.fill();

    ctx.globalAlpha = 1;
    ctx.strokeStyle = isActive
      ? p.accentMain
      : isUnlocked
        ? p.energyMain
        : "#30363D";
    ctx.lineWidth = isActive ? 1.6 : 1;
    ctx.stroke();

    ctx.fillStyle = isActive
      ? "#FFFFFF"
      : isUnlocked
        ? p.energyBright
        : "#6E7681";
    ctx.font = `${isActive ? "700" : "600"} 12px ${mono}`;
    ctx.textAlign = "center";
    ctx.fillText(st.shortCode, x + 42, 594);
  });
}
