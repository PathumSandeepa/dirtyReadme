import {
  STAGE_DEFINITIONS,
  type CreatureConfig,
} from "@/domain/creature/entities";
import { drawPixelTextRgba, fillRectRgba } from "@/domain/creature/pixelArt";
import {
  derivePalette,
  getCreatureMeta,
  getEffectiveCameraView,
  getEvolutionStage,
  getLuminance,
  getViewDisplayLabel,
  hexToRgb,
  mixHex,
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

const STAGE_SCALES = [0.74, 0.82, 0.9, 0.98, 1.05] as const;

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

export function recolorSpriteRgba(
  sprite: SpriteRgba,
  config: CreatureConfig
): SpriteRgba {
  const isOriginalTulkun =
    config.creature === "tulkun" &&
    config.colorMode === "canonical" &&
    config.themeId === "ocean-slate";
  const isOriginalJellyfish =
    config.creature === "jellyfish" &&
    config.colorMode === "canonical" &&
    config.themeId === "biolume-azure";

  if (isOriginalTulkun || isOriginalJellyfish) {
    return sprite;
  }

  const [pr, pg, pb] = hexToRgb(config.colors.primary);
  const [ar, ag, ab] = hexToRgb(config.colors.accent);
  const [er, eg, eb] = hexToRgb(config.colors.energy);

  const [pH, pS, pL] = rgbToHsl(pr, pg, pb);
  const [aH, aS, aL] = rgbToHsl(ar, ag, ab);
  const [eH, eS, eL] = rgbToHsl(er, eg, eb);

  const out = new Uint8ClampedArray(sprite.data.length);
  const src = sprite.data;

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

    let nr: number;
    let ng: number;
    let nb: number;

    if (config.creature === "tulkun") {
      if (h >= 6 && h <= 54 && s > 0.24) {
        // Copper brow crest -> accent channel
        const targetL = clamp(l * 0.65 + aL * 0.35, 0.18, 0.85);
        [nr, ng, nb] = hslToRgb(aH, Math.max(s * 0.45, aS * 0.9), targetL);
      } else if (l > 0.56 && h >= 172 && h <= 228 && s > 0.14) {
        // Dorsal cyan markings & pale cyan belly tint -> energy channel
        const targetL = clamp(l * 0.72 + eL * 0.28, 0.35, 0.92);
        [nr, ng, nb] = hslToRgb(eH, clamp(eS * 0.85, 0.2, 0.95), targetL);
      } else if (s <= 0.15 && l > 0.65) {
        // White/silver belly pleats stay neutral silver-white slightly harmonized
        [nr, ng, nb] = hslToRgb(pH, Math.min(0.14, pS * 0.3), l);
      } else {
        // Slate body armor -> primary channel while preserving original shading depth
        const deltaL = l - 0.31;
        const targetL = clamp(pL + deltaL * 0.85, 0.14, 0.88);
        [nr, ng, nb] = hslToRgb(pH, clamp(pS * 0.92 + s * 0.12, 0.04, 0.88), targetL);
      }
    } else {
      // Jellyfish: split blue luminosity into highlight/accent, mid/primary, deep/energy
      if (l > 0.68) {
        const targetL = clamp(l * 0.74 + aL * 0.26, 0.55, 0.94);
        [nr, ng, nb] = hslToRgb(aH, clamp(aS * 0.92, 0.25, 0.96), targetL);
      } else if (l < 0.34) {
        const targetL = clamp(l * 0.65 + eL * 0.35, 0.16, 0.58);
        [nr, ng, nb] = hslToRgb(eH, clamp(eS * 0.95, 0.35, 0.98), targetL);
      } else {
        const targetL = clamp(pL + (l - 0.48) * 0.85, 0.2, 0.82);
        [nr, ng, nb] = hslToRgb(pH, clamp(pS * 0.95, 0.25, 0.98), targetL);
      }
    }

    out[i] = nr;
    out[i + 1] = ng;
    out[i + 2] = nb;
    out[i + 3] = a;
  }

  return { width: sprite.width, height: sprite.height, data: out };
}

function drawWakeParticles(
  buffer: Uint8ClampedArray,
  stage: number,
  phase: number,
  config: CreatureConfig
): void {
  if (stage < 2) return;
  const count = stage === 2 ? 4 : stage === 3 ? 7 : stage === 4 ? 11 : 15;
  const p = derivePalette(config);
  const [er, eg, eb] = hexToRgb(p.energyBright);
  const [ar, ag, ab] = hexToRgb(p.accentMain);
  const maxY = config.showHud ? 176 : 216;

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
    const useAccent = i % 5 === 0 && stage >= 4;
    const alpha = Math.round(135 + 100 * Math.sin((phase + seed2) * Math.PI * 2) * 0.5 + 50);
    fillRectRgba(
      buffer,
      LOGICAL_WIDTH,
      LOGICAL_HEIGHT,
      px,
      py,
      size,
      size,
      [useAccent ? ar : er, useAccent ? ag : eg, useAccent ? ab : eb, clamp(alpha, 90, 235)]
    );
  }
}

function drawPixelHud(
  buffer: Uint8ClampedArray,
  config: CreatureConfig
): void {
  if (!config.showHud) return;

  const stageInfo = getEvolutionStage(config.commits);
  const meta = getCreatureMeta(config.creature);
  const titleText = config.customTitle.trim()
    ? config.customTitle.trim().toUpperCase()
    : `${stageInfo.rank} ${meta.id.toUpperCase()}`;
  const formattedCommits = Math.max(
    0,
    Math.floor(config.commits || 0)
  ).toLocaleString("en-US");

  const line1 = `STAGE ${stageInfo.stage}: ${titleText}`;
  const line2 = `CONTRIBUTIONS: ${formattedCommits}`;

  const p = derivePalette(config);
  const isLightBg =
    config.backgroundMode === "custom" && getLuminance(p.background) > 0.55;

  const [ar, ag, ab] = hexToRgb(p.accentMain);
  const labelHex = isLightBg
    ? "#1E293B"
    : mixHex(p.energyMain, "#CBEBFF", 0.55);
  const commitHex = isLightBg ? "#0F172A" : mixHex(p.energyBright, "#FFFFFF", 0.4);
  const [lr, lg, lb] = hexToRgb(labelHex);
  const [cr, cg, cb] = hexToRgb(commitHex);

  // Row 1: accent indicator + stage & title
  fillRectRgba(buffer, LOGICAL_WIDTH, LOGICAL_HEIGHT, 24, 190, 4, 7, [ar, ag, ab, 255]);
  drawPixelTextRgba(buffer, LOGICAL_WIDTH, LOGICAL_HEIGHT, line1, 31, 190, 1, [lr, lg, lb, 255]);

  // Row 2: contribution count
  drawPixelTextRgba(buffer, LOGICAL_WIDTH, LOGICAL_HEIGHT, line2, 24, 201, 1, [cr, cg, cb, 255]);

  // Row 3: top 3 language chips
  const langChips = (config.languages ?? []).slice(0, 3);
  let chipX = 24;
  for (const lang of langChips) {
    const nameShort = lang.name.toUpperCase().slice(0, 10);
    const [sr, sg, sb] = hexToRgb(lang.color);
    fillRectRgba(buffer, LOGICAL_WIDTH, LOGICAL_HEIGHT, chipX, 212, 4, 7, [sr, sg, sb, 255]);
    drawPixelTextRgba(
      buffer,
      LOGICAL_WIDTH,
      LOGICAL_HEIGHT,
      nameShort,
      chipX + 7,
      212,
      1,
      [lr, lg, lb, 255]
    );
    chipX += 7 + nameShort.length * 6 + 9;
  }
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
  if (creature === "jellyfish") {
    // Asymmetric jet-propulsion pulse: fast crisp bell contraction, gentle open glide
    const pulse =
      (0.62 * Math.sin(t) +
        0.26 * Math.sin(2 * t - 0.5) +
        0.08 * Math.sin(3 * t - 1.0)) /
      0.92;

    const u = clamp(lx / drawW + 0.5, 0, 1);
    const v = clamp((ly / drawH) * 2, -1.2, 1.2);

    // Bell dome occupies u in [0, 0.28]; oral arms & tentacles trail across [0.21, 1.0]
    const trailWeight = smoothstep(0.21, 0.29, u);
    const bellWeight = 1 - trailWeight;

    // 1) Anatomical bell head contraction + radial rim pinch + gentle scalloped flare
    const rimFactor = smoothstep(0.02, 0.24, u);
    const bellScaleY = 1.0 - 0.145 * pulse * (0.25 + 0.75 * rimFactor);
    const bellScaleX = 1.0 + 0.075 * pulse * (1.0 - 0.35 * rimFactor);
    const rimRipple = 1.35 * rimFactor * Math.sin(v * Math.PI * 3.0) * pulse;
    const pivotLx = (0.14 - 0.5) * drawW;

    const bellSrcX = pivotLx + (lx - pivotLx) / bellScaleX;
    const bellSrcY = (ly - rimRipple) / bellScaleY;

    // 2) Trailing oral arms & filaments: fluid travelling S-curve + axial surge drag
    const trailT = clamp((u - 0.21) / 0.79, 0, 1);
    const vPhase = v * 0.65;
    const primaryAmp = 14.5 * Math.pow(trailT, 1.12);
    const secondaryAmp = 3.0 * Math.pow(trailT, 1.35);
    const waveY =
      primaryAmp * Math.sin(1.65 * Math.PI * 2 * trailT - t + vPhase) +
      secondaryAmp * Math.sin(2.7 * Math.PI * 2 * trailT - 2 * t - vPhase);
    const dragX = 4.6 * Math.pow(trailT, 0.85) * Math.sin(t - 0.65 - trailT * 1.4);
    const baseRimAttach = 1.0 - 0.11 * pulse * (1.0 - trailT * 0.85);

    const trailSrcX = lx - dragX;
    const trailSrcY = (ly - waveY) / baseRimAttach;

    return [
      bellSrcX * bellWeight + trailSrcX * trailWeight,
      bellSrcY * bellWeight + trailSrcY * trailWeight,
    ];
  }

  if (view === "top") {
    // Top-down Tulkun: full body lateral S-curve swimming + gentle pectoral rowing sweep
    const maxAmp = 16.5 * (0.85 + 0.15 * stageScale);
    const k = 1.45;
    let srcX = lx;
    let srcY = ly;

    for (let iter = 0; iter < 2; iter++) {
      const u = clamp(srcX / drawW + 0.5, 0, 1);
      const v = clamp((srcY / drawH) * 2, -1, 1);
      const env = 0.09 + 0.91 * Math.pow(u, 1.55);
      const waveAngle = k * Math.PI * 2 * u - t;
      const spineY = maxAmp * env * Math.sin(waveAngle);

      const dEnv = 0.91 * 1.55 * Math.pow(Math.max(u, 0.001), 0.55) / drawW;
      const dWave = (k * Math.PI * 2) / drawW;
      const slopeY =
        maxAmp * (dEnv * Math.sin(waveAngle) + env * Math.cos(waveAngle) * dWave);

      const uWing = Math.exp(-Math.pow((u - 0.34) / 0.11, 2));
      const vWing = smoothstep(0.24, 0.52, Math.abs(v));
      const wingMask = uWing * vWing;
      const wingSweepX = 6.5 * wingMask * Math.sin(t - 0.6);
      const wingSweepY = 2.8 * wingMask * Math.sign(v) * Math.cos(t - 0.6);

      srcY = ly - spineY - wingSweepY;
      srcX = lx - wingSweepX + slopeY * srcY * 0.28;
    }

    return [srcX, srcY];
  }

  // Side-view Tulkun: smooth dorso-ventral S-curve propulsion + pectoral fin stroke
  const maxAmp = 15.5 * (0.85 + 0.15 * stageScale);
  const k = 1.35;
  let srcX = lx;
  let srcY = ly;

  for (let iter = 0; iter < 2; iter++) {
    const u = clamp(srcX / drawW + 0.5, 0, 1);
    const v = clamp((srcY / drawH) * 2, -1, 1);
    const env = 0.11 + 0.89 * Math.pow(u, 1.65);
    const waveAngle = k * Math.PI * 2 * u - t;
    const spineY = maxAmp * env * Math.sin(waveAngle);

    const dEnv = 0.89 * 1.65 * Math.pow(Math.max(u, 0.001), 0.65) / drawW;
    const dWave = (k * Math.PI * 2) / drawW;
    const slopeY =
      maxAmp * (dEnv * Math.sin(waveAngle) + env * Math.cos(waveAngle) * dWave);

    const uFin = Math.exp(-Math.pow((u - 0.42) / 0.13, 2));
    const vFin = smoothstep(0.18, 0.58, v);
    const finMask = uFin * vFin;
    const finDx = 6.0 * finMask * Math.sin(t - 0.9);
    const finDy = 3.2 * finMask * Math.cos(t - 0.9);

    srcY = ly - spineY - finDy;
    srcX = lx - finDx + slopeY * srcY * 0.24;
  }

  return [srcX, srcY];
}

export function renderCreatureFrameRgba(
  recoloredSprite: SpriteRgba,
  config: CreatureConfig,
  phase: number,
  options?: { forceTransparent?: boolean }
): Uint8ClampedArray {
  const out = new Uint8ClampedArray(LOGICAL_WIDTH * LOGICAL_HEIGHT * 4);
  const forceTransparent = options?.forceTransparent ?? false;
  const p = derivePalette(config);

  if (!forceTransparent && config.backgroundMode !== "transparent") {
    const [br, bg, bb] = hexToRgb(p.background);
    for (let i = 0; i < out.length; i += 4) {
      out[i] = br;
      out[i + 1] = bg;
      out[i + 2] = bb;
      out[i + 3] = 255;
    }
  }

  const stageInfo = getEvolutionStage(config.commits);
  const stageScale = STAGE_SCALES[stageInfo.stage - 1] ?? 1.0;
  const view = getEffectiveCameraView(config.creature, config.view);
  const t = phase * Math.PI * 2;

  // Stage wake particles behind creature
  drawWakeParticles(out, stageInfo.stage, phase, config);

  // Fit sprite comfortably inside logical viewport while scaling across stages 1-5
  const maxFitW = 342 * stageScale;
  const maxFitH = (config.showHud ? 136 : 170) * stageScale;
  const fitScale = Math.min(
    maxFitW / Math.max(1, recoloredSprite.width),
    maxFitH / Math.max(1, recoloredSprite.height)
  );
  const drawW = recoloredSprite.width * fitScale;
  const drawH = recoloredSprite.height * fitScale;

  const centerX = LOGICAL_WIDTH * 0.5;
  const centerY = config.showHud ? 92 : 115;

  let globalX = 0;
  let globalY = 0;
  if (config.creature === "jellyfish") {
    globalX = -6.5 * Math.sin(t - 0.45) - 1.6 * Math.sin(2 * t - 0.9);
    globalY = 2.4 * Math.sin(t + 0.5);
  } else if (view === "top") {
    globalX = -2.2 * Math.cos(t);
    globalY = 1.4 * Math.sin(t + 0.3);
  } else {
    globalX = -2.6 * Math.cos(t);
    globalY = 2.0 * Math.sin(t + 0.5);
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

  drawPixelHud(out, config);
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
  const windowLabel = config.windowMode === "annual" ? "ANNUAL" : "365D";
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

  // Render transparent creature frame without HUD and blit crisply into center stage
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

  // Footer telemetry box
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
    570
  );

  const langChips = (config.languages ?? []).slice(0, 3);
  langChips.forEach((lang, idx) => {
    const x = 44 + idx * 146;
    ctx.fillStyle = lang.color;
    ctx.beginPath();
    ctx.roundRect(x, 592, 10, 10, 2);
    ctx.fill();

    ctx.fillStyle = "#C9D1D9";
    ctx.font = `600 13px ${mono}`;
    ctx.fillText(lang.name.toUpperCase().slice(0, 12), x + 16, 601);
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
