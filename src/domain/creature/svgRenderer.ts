import {
  STAGE_DEFINITIONS,
  type CameraView,
  type CreatureConfig,
  type DerivedPalette,
} from "@/domain/creature/entities";
import { PixelCanvas, renderPixelText } from "@/domain/creature/pixelArt";
import {
  derivePalette,
  getCreatureMeta,
  getEvolutionStage,
  mixHex,
} from "@/domain/creature/services";

export const SVG_WIDTH = 920;
export const SVG_HEIGHT = 460;
export const SHARE_CARD_WIDTH = 1280;
export const SHARE_CARD_HEIGHT = 640;

const PIXEL_SIZE = 4;

export function escapeXml(input: string): string {
  return input
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

export function buildAnimationStyles(speed: number): string {
  const s = Math.max(0.25, Math.min(3, speed || 1));
  const dur = (baseSec: number) => `${(baseSec / s).toFixed(2)}s`;

  return `
    .cc-body-float {
      animation: ccSwimBody ${dur(4.4)} ease-in-out infinite;
      transform-box: fill-box;
      transform-origin: center;
    }
    .cc-wing-near {
      animation: ccWingNear ${dur(3.8)} ease-in-out infinite;
    }
    .cc-wing-far {
      animation: ccWingFar ${dur(3.8)} ease-in-out infinite;
    }
    .cc-tail-swim {
      animation: ccTailSwim ${dur(3.2)} ease-in-out infinite;
    }
    .cc-fluke-wave {
      animation: ccFlukeWave ${dur(3.2)} ease-in-out infinite;
    }
    .cc-jelly-swim {
      animation: ccJellySwim ${dur(4.6)} ease-in-out infinite;
      transform-box: fill-box;
      transform-origin: center;
    }
    .cc-jelly-bell {
      animation: ccJellyBell ${dur(3.2)} ease-in-out infinite;
    }
    .cc-jelly-arm-1 {
      animation: ccJellyArmA ${dur(3.6)} ease-in-out infinite;
    }
    .cc-jelly-arm-2 {
      animation: ccJellyArmB ${dur(4.2)} ease-in-out infinite;
    }
    .cc-jelly-arm-3 {
      animation: ccJellyArmC ${dur(3.9)} ease-in-out infinite;
    }
    .cc-jelly-whip-1 {
      animation: ccJellyWhipA ${dur(4.8)} ease-in-out infinite;
    }
    .cc-jelly-whip-2 {
      animation: ccJellyWhipB ${dur(5.2)} ease-in-out infinite;
    }
    .cc-pulse {
      animation: ccPulse ${dur(2.2)} ease-in-out infinite;
    }
    @keyframes ccSwimBody {
      0%, 100% { transform: translate(0px, -6px) rotate(-1.2deg); }
      50% { transform: translate(-4px, 6px) rotate(1.2deg); }
    }
    @keyframes ccWingNear {
      0%, 100% { transform: rotate(-7deg) translateY(-2px); }
      50% { transform: rotate(8deg) translateY(3px); }
    }
    @keyframes ccWingFar {
      0%, 100% { transform: rotate(6deg) translateY(2px); }
      50% { transform: rotate(-6deg) translateY(-2px); }
    }
    @keyframes ccTailSwim {
      0%, 100% { transform: rotate(-5.5deg) translateY(-2px); }
      50% { transform: rotate(6deg) translateY(2px); }
    }
    @keyframes ccFlukeWave {
      0%, 100% { transform: rotate(7deg); }
      50% { transform: rotate(-7deg); }
    }
    @keyframes ccJellySwim {
      0%, 100% { transform: translate(2px, -5px) rotate(-0.8deg); }
      45% { transform: translate(-7px, 4px) rotate(0.9deg); }
    }
    @keyframes ccJellyBell {
      0%, 100% { transform: scale(1.03, 0.96); }
      45% { transform: scale(0.94, 1.05); }
    }
    @keyframes ccJellyArmA {
      0%, 100% { transform: rotate(-4.2deg) translateY(-2px); }
      50% { transform: rotate(4.8deg) translateY(3px); }
    }
    @keyframes ccJellyArmB {
      0%, 100% { transform: rotate(4.5deg) translateY(2px); }
      50% { transform: rotate(-4.5deg) translateY(-2px); }
    }
    @keyframes ccJellyArmC {
      0%, 100% { transform: rotate(-3deg) translate(2px, 3px); }
      50% { transform: rotate(3.8deg) translate(-2px, -3px); }
    }
    @keyframes ccJellyWhipA {
      0%, 100% { transform: rotate(-5.5deg); }
      50% { transform: rotate(6deg); }
    }
    @keyframes ccJellyWhipB {
      0%, 100% { transform: rotate(5.5deg); }
      50% { transform: rotate(-5.5deg); }
    }
    @keyframes ccPulse {
      0%, 100% { opacity: 0.65; }
      50% { opacity: 1; }
    }
  `;
}

function getStageScale(stage: number): number {
  const scales = [0.78, 0.86, 0.93, 1.0, 1.06];
  return scales[Math.max(0, Math.min(4, stage - 1))];
}

function getViewTransform(view: CameraView, stage: number): string {
  const s = getStageScale(stage);
  const cx = 460;
  const cy = 205;
  if (view === "dive") {
    return `translate(${cx}, ${cy}) rotate(-10) scale(${(s * 0.96).toFixed(3)}) translate(${-cx}, ${-cy})`;
  }
  if (view === "top") {
    return `translate(${cx}, ${cy}) scale(${(s * 1.05).toFixed(3)}, ${(s * 0.91).toFixed(3)}) translate(${-cx}, ${-cy})`;
  }
  return `translate(${cx}, ${cy}) scale(${s.toFixed(3)}) translate(${-cx}, ${-cy})`;
}

function renderPixelTulkun(
  p: DerivedPalette,
  stage: number,
  phase?: number
): string {
  const slateDark = mixHex(p.armorMain, "#0A121C", 0.45);
  const slateMain = p.armorMain;
  const slateLight = mixHex(p.armorMain, "#9EC5EC", 0.28);
  const stripeBlue = p.energyMain;
  const whitePure = "#F3F6FA";
  const whiteMid = "#B8C4D4";
  const whiteShadow = "#758498";
  const crestGold = p.accentMain;
  const crestShadow = mixHex(p.accentMain, "#5A3B12", 0.35);

  const farFlipperCanvas = new PixelCanvas();
  farFlipperCanvas.fillPolygon(
    [
      [75, 36],
      [81, 36],
      [94, 57],
      [90, 60],
      [82, 50],
    ],
    (gx, gy, nx) => {
      if (nx < 0.28) return whiteMid;
      return (gx + gy) % 2 === 0 ? slateDark : slateMain;
    }
  );
  farFlipperCanvas.fillPolygon(
    [
      [130, 42],
      [144, 42],
      [148, 52],
      [141, 55],
      [133, 49],
    ],
    (gx, gy) => ((gx + gy) % 2 === 0 ? slateMain : slateDark)
  );

  const tailCanvas = new PixelCanvas();
  tailCanvas.fillPolygon(
    [
      [123, 31],
      [145, 29],
      [158, 28],
      [158, 34],
      [146, 37],
      [125, 40],
    ],
    (gx, gy, _nx, ny) => {
      if (ny > 0.72) return stripeBlue;
      if (ny < 0.25 && (gx === 142 || gx === 143)) return whitePure;
      return (gx + gy) % 2 === 0 && ny < 0.45 ? slateMain : slateDark;
    }
  );

  const flukeCanvas = new PixelCanvas();
  flukeCanvas.fillPolygon(
    [
      [153, 30],
      [172, 21],
      [187, 17],
      [181, 24],
      [164, 32],
    ],
    (gx, gy, _nx, ny) => {
      if (ny < 0.28) return slateLight;
      return (gx + gy) % 2 === 0 ? slateMain : slateDark;
    }
  );
  flukeCanvas.fillPolygon(
    [
      [154, 32],
      [168, 33],
      [188, 36],
      [180, 40],
      [156, 36],
    ],
    (gx, gy, _nx, ny) => {
      if (ny > 0.72) return stripeBlue;
      return (gx + gy) % 2 === 0 ? slateDark : slateMain;
    }
  );

  const bodyCanvas = new PixelCanvas();
  bodyCanvas.fillPolygon(
    [
      [48, 36],
      [51, 30],
      [62, 23],
      [79, 18],
      [101, 19],
      [120, 26],
      [132, 31],
      [132, 41],
      [115, 44],
      [96, 45],
      [78, 43],
      [53, 39],
    ],
    (gx, gy, _nx, ny) => {
      if (ny > 0.78) return stripeBlue;
      if (ny < 0.24 && gx >= 82 && gx <= 86) return whitePure;
      if (ny < 0.25 && gx >= 106 && gx <= 108 && stage >= 3) return whitePure;
      if (ny < 0.3) return (gx + gy) % 2 === 0 ? slateLight : slateMain;
      return (gx + gy) % 2 === 0 ? slateMain : slateDark;
    }
  );

  bodyCanvas.fillEllipse(71, 41, 22, 13, (gx, gy, nx, ny) => {
    if (gy < 34) return null;
    if (ny > 0.62) {
      return (gx + gy) % 2 === 0 ? whiteMid : whiteShadow;
    }
    if (ny > 0.25) {
      return (gx + gy) % 2 === 0 ? whitePure : whiteMid;
    }
    if (gx < 58 && ny < 0.1) return whitePure;
    return whitePure;
  });

  for (let gx = 48; gx <= 82; gx++) {
    const t = (gx - 48) / 34;
    const jawY = Math.round(35 + Math.sin(t * Math.PI) * 2 + (t > 0.5 ? (t - 0.5) * 6 : 0));
    bodyCanvas.setPixel(gx, jawY, slateDark);
    if (gx >= 53 && gx <= 60 && gx % 4 === 0) {
      bodyCanvas.setPixel(gx, jawY - 1, whitePure);
      bodyCanvas.setPixel(gx + 1, jawY + 2, slateMain);
    }
  }

  for (let k = 0; k < 4; k++) {
    const px = 63 + k * 4;
    for (let dy = 0; dy < 5; dy++) {
      bodyCanvas.setPixel(px + Math.floor(dy / 2), 38 + dy, slateDark);
    }
  }

  bodyCanvas.fillPolygon(
    [
      [55, 29],
      [68, 22],
      [78, 21],
      [81, 26],
      [71, 29],
    ],
    (gx, gy, _nx, ny) => {
      if (gx >= 69 && gx <= 74 && gy <= 24) return slateDark;
      return ny > 0.7 ? crestShadow : crestGold;
    }
  );

  bodyCanvas.setPixel(76, 30, crestGold);
  bodyCanvas.setPixel(77, 30, crestGold);
  bodyCanvas.setPixel(76, 31, crestShadow);
  bodyCanvas.setPixel(77, 31, crestGold);

  bodyCanvas.fillEllipse(57, 33, 3, 1.5, whitePure);
  bodyCanvas.setPixel(55, 33, slateDark);

  if (stage >= 5) {
    bodyCanvas.setPixel(84, 17, p.energyBright);
    bodyCanvas.setPixel(85, 17, p.energyBright);
    bodyCanvas.setPixel(107, 23, p.energyBright);
  }

  const nearWingCanvas = new PixelCanvas();
  nearWingCanvas.fillPolygon(
    [
      [89, 31],
      [98, 30],
      [118, 49],
      [140, 71],
      [135, 73],
      [108, 53],
      [89, 37],
    ],
    (gx, gy, _nx, ny) => {
      const diag = (gy - 31) - (gx - 89) * 0.92;
      if (diag < -0.5) return whitePure;
      if (diag < 1.6) return whiteMid;
      if (ny > 0.5 && diag > 2.2) return slateMain;
      return slateDark;
    }
  );
  nearWingCanvas.setPixel(91, 32, whitePure);
  nearWingCanvas.setPixel(92, 32, whitePure);

  const angleRad = phase !== undefined ? phase * Math.PI * 2 : 0;
  const floatT =
    phase !== undefined
      ? `translate(${(-2 - Math.cos(angleRad) * 2).toFixed(2)}, ${(Math.sin(angleRad) * 6).toFixed(2)}) rotate(${(Math.sin(angleRad) * 1.2).toFixed(2)}, 420, 145)`
      : "";
  const wingNearT =
    phase !== undefined ? `rotate(${(Math.sin(angleRad) * 7.5).toFixed(2)}, 372, 132)` : "";
  const wingFarT =
    phase !== undefined ? `rotate(${(-Math.sin(angleRad) * 6).toFixed(2)}, 312, 148)` : "";
  const tailT =
    phase !== undefined ? `rotate(${(Math.sin(angleRad - 0.7) * 5.8).toFixed(2)}, 504, 140)` : "";
  const flukeT =
    phase !== undefined ? `rotate(${(-Math.sin(angleRad - 1.3) * 7).toFixed(2)}, 620, 128)` : "";

  const staticGroup = phase !== undefined;

  return `
    <g transform="${floatT}" class="${staticGroup ? "" : "cc-body-float"}">
      <g transform="${wingFarT}" class="${staticGroup ? "" : "cc-wing-far"}" style="transform-origin: 312px 148px;">
        ${farFlipperCanvas.toSvgRects(PIXEL_SIZE)}
      </g>
      <g transform="${tailT}" class="${staticGroup ? "" : "cc-tail-swim"}" style="transform-origin: 504px 140px;">
        ${tailCanvas.toSvgRects(PIXEL_SIZE)}
        <g transform="${flukeT}" class="${staticGroup ? "" : "cc-fluke-wave"}" style="transform-origin: 620px 128px;">
          ${flukeCanvas.toSvgRects(PIXEL_SIZE)}
        </g>
      </g>
      ${bodyCanvas.toSvgRects(PIXEL_SIZE)}
      <g transform="${wingNearT}" class="${staticGroup ? "" : "cc-wing-near"}" style="transform-origin: 372px 132px;">
        ${nearWingCanvas.toSvgRects(PIXEL_SIZE)}
      </g>
    </g>
  `;
}

function renderPixelJellyfish(
  p: DerivedPalette,
  stage: number,
  phase?: number
): string {
  const glowIce = mixHex(p.armorHighlight, "#FFFFFF", 0.55);
  const bellBright =
    p.armorMain === "#36506B" ? "#7AD2FF" : mixHex(p.armorMain, "#96E4FF", 0.48);
  const bellMid =
    p.armorMain === "#36506B" ? "#2E82E6" : p.armorMain;
  const bellDeep =
    p.armorMain === "#36506B" ? "#16449C" : p.armorShadow;
  const rimAccent =
    p.armorMain === "#36506B" ? "#10285E" : p.frameDark;
  const sporeColor = p.energyBright;

  const whipBackCanvas = new PixelCanvas();
  const buildWhip = (
    canvas: PixelCanvas,
    startX: number,
    startY: number,
    endX: number,
    arcAmp: number,
    freq: number,
    hue: string
  ) => {
    const samples: { x: number; y: number; r: number }[] = [];
    const steps = 48;
    for (let i = 0; i <= steps; i++) {
      const t = i / steps;
      const x = startX + (endX - startX) * t;
      const y =
        startY +
        Math.sin(t * Math.PI * freq) * arcAmp * (0.4 + t * 0.8) +
        (t * t * (arcAmp > 0 ? 10 : -11));
      samples.push({ x, y, r: t < 0.35 ? 0.85 : 0.6 });
    }
    canvas.fillSplineRibbon(samples, hue);
  };

  buildWhip(whipBackCanvas, 60, 26, 178, -9, 1.5, bellMid);
  if (stage >= 2) {
    buildWhip(whipBackCanvas, 58, 56, 184, 11, 1.4, bellBright);
  }

  const armUpperCanvas = new PixelCanvas();
  const armCenterCanvas = new PixelCanvas();
  const armLowerCanvas = new PixelCanvas();

  const paintRuffledArm = (
    canvas: PixelCanvas,
    startX: number,
    baseY: number,
    len: number,
    freq: number,
    amp: number,
    thickness: number
  ) => {
    const samples: { x: number; y: number; r: number }[] = [];
    const count = 42;
    for (let i = 0; i <= count; i++) {
      const t = i / count;
      const x = startX + t * len;
      const wave =
        Math.sin(t * Math.PI * freq) * amp +
        Math.cos(t * Math.PI * freq * 2.1) * (amp * 0.35);
      const taper = 1 - t * 0.62;
      const ruffle = Math.abs(Math.sin(t * 22)) * 1.2 + 0.6;
      samples.push({
        x,
        y: baseY + wave,
        r: Math.max(0.8, thickness * taper * ruffle),
      });
    }
    canvas.fillSplineRibbon(samples, (gx, gy, t, ny) => {
      const dither = (gx + gy) % 2 === 0;
      if (Math.abs(ny) > 0.55) {
        return dither ? glowIce : bellBright;
      }
      if (t > 0.65) {
        return dither ? bellBright : bellMid;
      }
      return dither ? bellBright : bellDeep;
    });
  };

  paintRuffledArm(armUpperCanvas, 58, 35, 114, 2.2, 4.5, 2.6);
  paintRuffledArm(armCenterCanvas, 56, 42, 128, 2.6, 5.2, 3.4);
  if (stage >= 2) {
    paintRuffledArm(armLowerCanvas, 58, 49, 110, 2.1, -4.4, 2.5);
  }

  const whipFrontCanvas = new PixelCanvas();
  buildWhip(whipFrontCanvas, 61, 29, 192, -13, 1.2, bellBright);
  buildWhip(whipFrontCanvas, 61, 53, 194, 14, 1.3, glowIce);
  if (stage >= 3) {
    buildWhip(whipFrontCanvas, 59, 44, 186, 6, 2.0, bellMid);
  }

  const bellCanvas = new PixelCanvas();
  bellCanvas.fillEllipse(49, 42, 16, 21, (gx, gy, nx, ny) => {
    if (nx > 0.62) return null;
    const dist = Math.sqrt(nx * nx + ny * ny);
    const dither = (gx + gy) % 2 === 0;
    const rib = Math.sin(ny * 10) > 0.35;

    if (nx < -0.78 || dist > 0.88) {
      return dither ? glowIce : bellBright;
    }
    if (nx > 0.36) {
      if (Math.round(gy) % 5 === 0) return rimAccent;
      return dither ? bellMid : bellDeep;
    }
    if (rib) {
      return dither ? glowIce : bellBright;
    }
    return dither ? bellBright : bellMid;
  });

  bellCanvas.fillEllipse(57, 42, 6, 17, (gx, gy, _nx, ny) => {
    if (gx > 61) return null;
    if (Math.abs(ny) > 0.85) return bellBright;
    return (gx + gy) % 2 === 0 ? bellDeep : bellMid;
  });

  for (let sy = 25; sy <= 59; sy += 4) {
    bellCanvas.setPixel(59, sy, glowIce);
    bellCanvas.setPixel(60, sy + 1, bellBright);
    if (sy % 8 === 1) {
      bellCanvas.setPixel(57, sy, rimAccent);
    }
  }

  if (stage >= 3) {
    bellCanvas.setPixel(40, 29, glowIce);
    bellCanvas.setPixel(37, 42, glowIce);
    bellCanvas.setPixel(41, 55, glowIce);
  }
  if (stage >= 4) {
    bellCanvas.setPixel(54, 19, sporeColor);
    bellCanvas.setPixel(108, 22, sporeColor);
    bellCanvas.setPixel(142, 61, glowIce);
  }
  if (stage >= 5) {
    bellCanvas.setPixel(168, 28, sporeColor);
    bellCanvas.setPixel(176, 52, sporeColor);
    bellCanvas.setPixel(32, 36, glowIce);
  }

  const angleRad = phase !== undefined ? phase * Math.PI * 2 : 0;
  const swimT =
    phase !== undefined
      ? `translate(${(-3 + Math.sin(angleRad) * 4.5).toFixed(2)}, ${(Math.cos(angleRad) * 4.5).toFixed(2)}) rotate(${(Math.sin(angleRad) * 0.8).toFixed(2)}, 440, 168)`
      : "";
  const bellScaleX = phase !== undefined ? 0.985 + Math.cos(angleRad) * 0.045 : 1;
  const bellScaleY = phase !== undefined ? 1.005 - Math.cos(angleRad) * 0.045 : 1;
  const bellT =
    phase !== undefined
      ? `translate(224, 168) scale(${bellScaleX.toFixed(3)}, ${bellScaleY.toFixed(3)}) translate(-224, -168)`
      : "";
  const arm1T =
    phase !== undefined ? `rotate(${(Math.sin(angleRad) * 4.6).toFixed(2)}, 228, 148)` : "";
  const arm2T =
    phase !== undefined ? `rotate(${(-Math.sin(angleRad + 1.1) * 4.5).toFixed(2)}, 226, 168)` : "";
  const arm3T =
    phase !== undefined ? `rotate(${(Math.sin(angleRad + 2.1) * 3.8).toFixed(2)}, 228, 188)` : "";
  const whip1T =
    phase !== undefined ? `rotate(${(Math.sin(angleRad + 0.5) * 5.8).toFixed(2)}, 232, 130)` : "";
  const whip2T =
    phase !== undefined ? `rotate(${(-Math.sin(angleRad + 1.5) * 5.8).toFixed(2)}, 232, 200)` : "";

  const staticGroup = phase !== undefined;

  return `
    <g transform="${swimT}" class="${staticGroup ? "" : "cc-jelly-swim"}">
      <g transform="${whip1T}" class="${staticGroup ? "" : "cc-jelly-whip-1"}" style="transform-origin: 232px 130px;">
        ${whipBackCanvas.toSvgRects(PIXEL_SIZE)}
      </g>
      <g transform="${arm1T}" class="${staticGroup ? "" : "cc-jelly-arm-1"}" style="transform-origin: 228px 148px;">
        ${armUpperCanvas.toSvgRects(PIXEL_SIZE)}
      </g>
      <g transform="${arm2T}" class="${staticGroup ? "" : "cc-jelly-arm-2"}" style="transform-origin: 226px 168px;">
        ${armCenterCanvas.toSvgRects(PIXEL_SIZE)}
      </g>
      <g transform="${arm3T}" class="${staticGroup ? "" : "cc-jelly-arm-3"}" style="transform-origin: 228px 188px;">
        ${armLowerCanvas.toSvgRects(PIXEL_SIZE)}
      </g>
      <g transform="${whip2T}" class="${staticGroup ? "" : "cc-jelly-whip-2"}" style="transform-origin: 232px 200px;">
        ${whipFrontCanvas.toSvgRects(PIXEL_SIZE)}
      </g>
      <g transform="${bellT}" class="${staticGroup ? "" : "cc-jelly-bell"}" style="transform-origin: 224px 168px;">
        ${bellCanvas.toSvgRects(PIXEL_SIZE)}
      </g>
    </g>
  `;
}

function renderPixelHud(config: CreatureConfig, p: DerivedPalette): string {
  if (!config.showHud) return "";

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

  const primaryText = p.energyBright;
  const secondaryText = p.isLightArmor ? "#334155" : "#C9D1D9";
  const hasDarkBg = p.background === "#000000" || p.background === "#0D1117";
  const labelColor =
    hasDarkBg || p.background === "transparent"
      ? mixHex(p.energyMain, "#9ED4FF", 0.55)
      : secondaryText;

  const langChips = (config.languages ?? []).slice(0, 3);
  let chipCursorX = 56;
  const langSvg = langChips
    .map((lang) => {
      const nameShort = lang.name.toUpperCase().slice(0, 8);
      const swatch = `<rect shape-rendering="crispEdges" x="${chipCursorX}" y="424" width="6" height="8" fill="${escapeXml(lang.color)}" />`;
      const text = renderPixelText(nameShort, chipCursorX + 10, 424, 1.5, labelColor);
      const nextX = chipCursorX + 16 + nameShort.length * 9 + 12;
      chipCursorX = nextX;
      return swatch + text;
    })
    .join("");

  return `
    <g>
      <rect shape-rendering="crispEdges" x="56" y="382" width="7" height="13" fill="${p.accentMain}" />
      ${renderPixelText(line1, 70, 383, 1.6, labelColor)}
      ${renderPixelText(line2, 56, 404, 1.6, primaryText)}
      ${langSvg}
    </g>
  `;
}

export function renderCreatureGeometryOnly(
  config: CreatureConfig,
  _idPrefix = "cc",
  phase?: number
): string {
  const p = derivePalette(config);
  const { stage } = getEvolutionStage(config.commits);
  const viewTransform = getViewTransform(config.view, stage);

  const creatureMarkup =
    config.creature === "jellyfish"
      ? renderPixelJellyfish(p, stage, phase)
      : renderPixelTulkun(p, stage, phase);

  return `<g transform="${viewTransform}">${creatureMarkup}</g>`;
}

export function buildCreatureInnerSvg(
  config: CreatureConfig,
  idPrefix = "cc",
  phase?: number
): string {
  const p = derivePalette(config);
  const styles = phase === undefined ? buildAnimationStyles(config.animationSpeed) : "";

  const bgRect =
    p.background !== "transparent"
      ? `<rect x="0" y="0" width="${SVG_WIDTH}" height="${SVG_HEIGHT}" fill="${escapeXml(p.background)}" />`
      : "";

  const creatureBody = renderCreatureGeometryOnly(config, idPrefix, phase);
  const yOffset = config.showHud ? -12 : 14;
  const hud = renderPixelHud(config, p);

  return `
    ${styles ? `<style>${styles}</style>` : ""}
    ${bgRect}
    <g transform="translate(0, ${yOffset})">
      ${creatureBody}
    </g>
    ${hud}
  `.trim();
}

export function generateCreatureSvgDocument(
  config: CreatureConfig,
  phase?: number
): string {
  const meta = getCreatureMeta(config.creature);
  const inner = buildCreatureInnerSvg(config, "cc", phase);
  const ariaLabel = escapeXml(`${meta.name} - ${meta.subtitle}`);

  return [
    `<?xml version="1.0" encoding="UTF-8"?>`,
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${SVG_WIDTH} ${SVG_HEIGHT}" width="${SVG_WIDTH}" height="${SVG_HEIGHT}" role="img" aria-label="${ariaLabel}">`,
    `  <title>${ariaLabel}</title>`,
    `  ${inner}`,
    `</svg>`,
  ].join("\n");
}

export function buildShareCardInnerSvg(
  config: CreatureConfig,
  idPrefix = "sc"
): string {
  const p = derivePalette(config);
  const styles = buildAnimationStyles(config.animationSpeed);
  const stageInfo = getEvolutionStage(config.commits);
  const meta = getCreatureMeta(config.creature);
  const geometry = renderCreatureGeometryOnly(config, idPrefix);

  const safeUser = escapeXml(config.username.trim() || "your-username");
  const titleText = config.customTitle.trim()
    ? escapeXml(config.customTitle.trim().toUpperCase())
    : escapeXml(`${stageInfo.rank} ${meta.name.toUpperCase()}`);
  const formattedCommits = Math.max(
    0,
    Math.floor(config.commits || 0)
  ).toLocaleString("en-US");
  const windowLabel = config.windowMode === "annual" ? "ANNUAL" : "365D";

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
    <rect x="0" y="0" width="1280" height="640" fill="#0B0F17" />
    <g stroke="#1A2230" stroke-width="1" opacity="0.55">
      <line x1="0" y1="160" x2="1280" y2="160" />
      <line x1="0" y1="320" x2="1280" y2="320" />
      <line x1="0" y1="480" x2="1280" y2="480" />
      <line x1="320" y1="0" x2="320" y2="640" />
      <line x1="640" y1="0" x2="640" y2="640" />
      <line x1="960" y1="0" x2="960" y2="640" />
    </g>

    <rect x="20" y="20" width="1240" height="600" rx="14" fill="none" stroke="${p.accentMain}" stroke-opacity="0.55" stroke-width="2" />
    <rect x="28" y="28" width="1224" height="48" rx="8" fill="#111622" />
    <circle cx="50" cy="52" r="5" fill="${p.energyMain}" />
    <text x="66" y="57" fill="#E6EDF3" font-family="ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace" font-size="15" font-weight="700" letter-spacing="1.2">DYNAMIC-CREATURE // @${safeUser}</text>
    <text x="1232" y="57" fill="${p.accentMain}" font-family="ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace" font-size="15" font-weight="700" text-anchor="end">STAGE ${stageInfo.stage}: ${titleText}</text>

    <g transform="translate(150, 72) scale(1.06)">
      ${geometry}
    </g>

    <rect x="28" y="514" width="1224" height="98" rx="8" fill="#111622" />
    <rect x="44" y="534" width="10" height="10" rx="2" fill="${p.energyMain}" />
    <text x="62" y="544" fill="#E6EDF3" font-family="ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace" font-size="15" font-weight="700">STAGE ${stageInfo.stage}: ${titleText}</text>
    <text x="44" y="570" fill="#8B949E" font-family="ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace" font-size="14" font-weight="600">CONTRIBUTIONS (${windowLabel}): <tspan fill="#FFFFFF">${formattedCommits}</tspan>  •  VIEW: ${config.view.toUpperCase()}</text>
    ${langMarkup}

    <text x="768" y="556" fill="#8B949E" font-family="ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace" font-size="12" font-weight="600" letter-spacing="0.8">EVOLUTION (0 → 2,500+)</text>
    ${stageRail}
  `.trim();
}

export function generateShareCardSvgDocument(config: CreatureConfig): string {
  const meta = getCreatureMeta(config.creature);
  const inner = buildShareCardInnerSvg(config, "sc");
  const title = escapeXml(
    `${meta.name} Share Card - @${config.username || "your-username"}`
  );

  return [
    `<?xml version="1.0" encoding="UTF-8"?>`,
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${SHARE_CARD_WIDTH} ${SHARE_CARD_HEIGHT}" width="${SHARE_CARD_WIDTH}" height="${SHARE_CARD_HEIGHT}" role="img" aria-label="${title}">`,
    `  <title>${title}</title>`,
    `  ${inner}`,
    `</svg>`,
  ].join("\n");
}
