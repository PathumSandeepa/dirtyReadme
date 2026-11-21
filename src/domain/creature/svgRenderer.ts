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

const PX = 3;

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
  const delay = (baseSec: number) => `${(baseSec / s).toFixed(2)}s`;

  return `
    .cc-swim-body {
      animation: ccSwimBody ${dur(4.2)} ease-in-out infinite;
    }
    .cc-shoulder {
      animation: ccShoulder ${dur(3.6)} ease-in-out infinite;
    }
    .cc-wing-tip {
      animation: ccWingTip ${dur(3.6)} ease-in-out infinite;
      animation-delay: ${delay(-0.45)};
    }
    .cc-wing-mirror {
      animation: ccWingMirror ${dur(3.6)} ease-in-out infinite;
    }
    .cc-wing-far {
      animation: ccWingFar ${dur(3.6)} ease-in-out infinite;
      animation-delay: ${delay(-1.6)};
    }
    .cc-tail-s1 {
      animation: ccTailWave ${dur(2.8)} ease-in-out infinite;
    }
    .cc-tail-s2 {
      animation: ccTailWave ${dur(2.8)} ease-in-out infinite;
      animation-delay: ${delay(-0.55)};
    }
    .cc-tail-s3 {
      animation: ccFlukeFlex ${dur(2.8)} ease-in-out infinite;
      animation-delay: ${delay(-1.05)};
    }
    .cc-jelly-surge {
      animation: ccJellySurge ${dur(3.4)} cubic-bezier(0.45, 0.05, 0.55, 0.95) infinite;
    }
    .cc-jelly-bell {
      animation: ccJellyBell ${dur(3.4)} ease-in-out infinite;
    }
    .cc-wave-a1 {
      animation: ccTentWave ${dur(3.2)} ease-in-out infinite;
    }
    .cc-wave-a2 {
      animation: ccTentWave ${dur(3.2)} ease-in-out infinite;
      animation-delay: ${delay(-0.65)};
    }
    .cc-wave-a3 {
      animation: ccTentWave ${dur(3.2)} ease-in-out infinite;
      animation-delay: ${delay(-1.3)};
    }
    .cc-wave-b1 {
      animation: ccTentWave ${dur(3.8)} ease-in-out infinite;
      animation-delay: ${delay(-0.9)};
    }
    .cc-wave-b2 {
      animation: ccTentWave ${dur(3.8)} ease-in-out infinite;
      animation-delay: ${delay(-1.65)};
    }
    .cc-wave-b3 {
      animation: ccTentWave ${dur(3.8)} ease-in-out infinite;
      animation-delay: ${delay(-2.4)};
    }
    .cc-pulse {
      animation: ccPulse ${dur(2.2)} ease-in-out infinite;
    }
    @keyframes ccSwimBody {
      0%, 100% { transform: translate(3px, -5px) rotate(-1.1deg); }
      50% { transform: translate(-5px, 5px) rotate(1.1deg); }
    }
    @keyframes ccShoulder {
      0%, 100% { transform: rotate(-6deg); }
      50% { transform: rotate(7deg); }
    }
    @keyframes ccWingTip {
      0%, 100% { transform: rotate(-7deg); }
      50% { transform: rotate(8deg); }
    }
    @keyframes ccWingMirror {
      0%, 100% { transform: rotate(6deg); }
      50% { transform: rotate(-7deg); }
    }
    @keyframes ccWingFar {
      0%, 100% { transform: rotate(5deg); }
      50% { transform: rotate(-6deg); }
    }
    @keyframes ccTailWave {
      0%, 100% { transform: rotate(-4.5deg); }
      50% { transform: rotate(4.5deg); }
    }
    @keyframes ccFlukeFlex {
      0%, 100% { transform: rotate(-6.5deg); }
      50% { transform: rotate(6.5deg); }
    }
    @keyframes ccJellySurge {
      0% { transform: translate(6px, -3px); }
      38% { transform: translate(-10px, 2px); }
      100% { transform: translate(6px, -3px); }
    }
    @keyframes ccJellyBell {
      0% { transform: scale(1.04, 0.94); }
      35% { transform: scale(0.91, 1.07); }
      100% { transform: scale(1.04, 0.94); }
    }
    @keyframes ccTentWave {
      0%, 100% { transform: rotate(-4.2deg); }
      50% { transform: rotate(4.2deg); }
    }
    @keyframes ccPulse {
      0%, 100% { opacity: 0.6; }
      50% { opacity: 1; }
    }
  `;
}

function getStageScale(stage: number): number {
  const scales = [0.78, 0.86, 0.94, 1.0, 1.06];
  return scales[Math.max(0, Math.min(4, stage - 1))];
}

function buildStageWrapper(stage: number, markup: string): string {
  const s = getStageScale(stage);
  const cx = 450;
  const cy = 195;
  return `<g transform="translate(${cx}, ${cy}) scale(${s.toFixed(3)}) translate(${-cx}, ${-cy})">${markup}</g>`;
}

interface PixelPalette {
  slateDark: string;
  slateMain: string;
  slateLight: string;
  stripeBlue: string;
  whitePure: string;
  whiteMid: string;
  whiteShadow: string;
  crestGold: string;
  crestShadow: string;
  energyBright: string;
}

function toPixelPalette(p: DerivedPalette): PixelPalette {
  return {
    slateDark: mixHex(p.armorMain, "#0A121C", 0.45),
    slateMain: p.armorMain,
    slateLight: mixHex(p.armorMain, "#9EC5EC", 0.3),
    stripeBlue: p.energyMain,
    whitePure: "#F3F6FA",
    whiteMid: "#B8C4D4",
    whiteShadow: "#738296",
    crestGold: p.accentMain,
    crestShadow: mixHex(p.accentMain, "#5A3B12", 0.36),
    energyBright: p.energyBright,
  };
}

function renderChainedSeg(
  canvas: PixelCanvas,
  pivotGx: number,
  pivotGy: number,
  cssClass: string,
  phase: number | undefined,
  phaseLag: number,
  ampDeg: number,
  childMarkup = ""
): string {
  const px = pivotGx * PX;
  const py = pivotGy * PX;
  const transformAttr =
    phase !== undefined
      ? `rotate(${(Math.sin(phase * Math.PI * 2 - phaseLag) * ampDeg).toFixed(2)}, ${px}, ${py})`
      : "";
  const classAttr = phase === undefined ? cssClass : "";
  return `
    <g transform="${transformAttr}" class="${classAttr}" style="transform-origin: ${px}px ${py}px;">
      ${canvas.toSvgRects(PX)}
      ${childMarkup}
    </g>
  `;
}

function renderTulkunSide(
  pp: PixelPalette,
  stage: number,
  phase?: number
): string {
  const farCanvas = new PixelCanvas();
  farCanvas.fillPolygon(
    [
      [100, 48],
      [108, 48],
      [125, 76],
      [119, 80],
      [108, 66],
    ],
    (gx, gy, nx) => (nx < 0.28 ? pp.whiteMid : (gx + gy) % 2 === 0 ? pp.slateDark : pp.slateMain)
  );
  farCanvas.fillPolygon(
    [
      [172, 56],
      [190, 56],
      [196, 69],
      [186, 73],
      [176, 65],
    ],
    (gx, gy) => ((gx + gy) % 2 === 0 ? pp.slateMain : pp.slateDark)
  );

  const tailS1 = new PixelCanvas();
  tailS1.fillPolygon(
    [
      [162, 41],
      [188, 39],
      [188, 49],
      [163, 53],
    ],
    (gx, gy, _nx, ny) =>
      ny > 0.72 ? pp.stripeBlue : (gx + gy) % 2 === 0 && ny < 0.45 ? pp.slateMain : pp.slateDark
  );

  const tailS2 = new PixelCanvas();
  tailS2.fillPolygon(
    [
      [185, 39],
      [212, 37],
      [212, 45],
      [185, 49],
    ],
    (gx, gy, _nx, ny) => {
      if (ny > 0.72) return pp.stripeBlue;
      if (ny < 0.25 && gx >= 191 && gx <= 193) return pp.whitePure;
      return (gx + gy) % 2 === 0 ? pp.slateMain : pp.slateDark;
    }
  );

  const flukeCanvas = new PixelCanvas();
  flukeCanvas.fillPolygon(
    [
      [207, 39],
      [231, 27],
      [252, 22],
      [244, 31],
      [220, 42],
    ],
    (gx, gy, _nx, ny) =>
      ny < 0.28 ? pp.slateLight : (gx + gy) % 2 === 0 ? pp.slateMain : pp.slateDark
  );
  flukeCanvas.fillPolygon(
    [
      [208, 42],
      [228, 44],
      [253, 48],
      [242, 53],
      [210, 46],
    ],
    (gx, gy, _nx, ny) =>
      ny > 0.72 ? pp.stripeBlue : (gx + gy) % 2 === 0 ? pp.slateDark : pp.slateMain
  );

  const bodyCanvas = new PixelCanvas();
  bodyCanvas.fillPolygon(
    [
      [62, 48],
      [67, 40],
      [82, 31],
      [105, 24],
      [135, 25],
      [162, 35],
      [166, 41],
      [166, 54],
      [148, 58],
      [126, 59],
      [102, 57],
      [69, 52],
    ],
    (gx, gy, _nx, ny) => {
      if (ny > 0.78) return pp.stripeBlue;
      if (ny < 0.24 && gx >= 109 && gx <= 115) return pp.whitePure;
      if (ny < 0.25 && gx >= 141 && gx <= 144 && stage >= 3) return pp.whitePure;
      if (ny < 0.28) return (gx + gy) % 2 === 0 ? pp.slateLight : pp.slateMain;
      return (gx + gy) % 2 === 0 ? pp.slateMain : pp.slateDark;
    }
  );

  bodyCanvas.fillEllipse(94, 54, 29, 17, (gx, gy, _nx, ny) => {
    if (gy < 45) return null;
    if (ny > 0.65) return (gx + gy) % 2 === 0 ? pp.whiteMid : pp.whiteShadow;
    if (ny > 0.28) return (gx + gy) % 2 === 0 ? pp.whitePure : pp.whiteMid;
    return pp.whitePure;
  });

  for (let gx = 63; gx <= 108; gx++) {
    const t = (gx - 63) / 45;
    const jawY = Math.round(46 + Math.sin(t * Math.PI) * 3 + (t > 0.5 ? (t - 0.5) * 8 : 0));
    bodyCanvas.setPixel(gx, jawY, pp.slateDark);
    if (gx >= 69 && gx <= 80 && gx % 5 === 0) {
      bodyCanvas.setPixel(gx, jawY - 1, pp.whitePure);
    }
  }
  for (let k = 0; k < 5; k++) {
    const px = 82 + k * 5;
    for (let dy = 0; dy < 7; dy++) {
      bodyCanvas.setPixel(px + Math.floor(dy / 2), 51 + dy, pp.slateDark);
    }
  }

  bodyCanvas.fillPolygon(
    [
      [72, 38],
      [90, 29],
      [104, 28],
      [108, 34],
      [94, 38],
    ],
    (gx, gy, _nx, ny) => {
      if (gx >= 92 && gx <= 98 && gy <= 32) return pp.slateDark;
      return ny > 0.72 ? pp.crestShadow : pp.crestGold;
    }
  );
  bodyCanvas.fillRect(101, 40, 3, 2, pp.crestGold);
  bodyCanvas.fillEllipse(75, 44, 4, 2, pp.whitePure);
  bodyCanvas.setPixel(73, 44, pp.slateDark);

  if (stage >= 5) {
    bodyCanvas.fillRect(112, 23, 3, 1, pp.energyBright);
    bodyCanvas.fillRect(142, 30, 2, 1, pp.energyBright);
  }

  const wingUpper = new PixelCanvas();
  wingUpper.fillPolygon(
    [
      [118, 42],
      [129, 41],
      [149, 60],
      [143, 64],
      [119, 49],
    ],
    (gx, gy) => {
      const diag = gy - 42 - (gx - 118) * 0.92;
      if (diag < -0.5) return pp.whitePure;
      if (diag < 2) return pp.whiteMid;
      return pp.slateDark;
    }
  );

  const wingTip = new PixelCanvas();
  wingTip.fillPolygon(
    [
      [144, 59],
      [149, 59],
      [186, 95],
      [180, 98],
      [141, 64],
    ],
    (gx, gy, _nx, ny) => {
      const diag = gy - 59 - (gx - 144) * 0.95;
      if (diag < -0.2) return pp.whitePure;
      if (diag < 2.2) return pp.whiteMid;
      return ny > 0.4 ? pp.slateMain : pp.slateDark;
    }
  );

  const farWingXml = renderChainedSeg(farCanvas, 104, 49, "cc-wing-far", phase, 1.5, 6);
  const flukeXml = renderChainedSeg(flukeCanvas, 210, 41, "cc-tail-s3", phase, 1.6, 6.5);
  const tailS2Xml = renderChainedSeg(tailS2, 187, 43, "cc-tail-s2", phase, 0.9, 4.5, flukeXml);
  const tailS1Xml = renderChainedSeg(tailS1, 165, 45, "cc-tail-s1", phase, 0.2, 4.5, tailS2Xml);
  const wingTipXml = renderChainedSeg(wingTip, 146, 61, "cc-wing-tip", phase, 0.7, 7.5);
  const nearWingXml = renderChainedSeg(wingUpper, 122, 44, "cc-shoulder", phase, 0, 6, wingTipXml);

  const bodyTranslate =
    phase !== undefined
      ? `translate(${(-1 - Math.cos(phase * Math.PI * 2) * 3).toFixed(2)}, ${(Math.sin(phase * Math.PI * 2) * 5).toFixed(2)}) rotate(${(Math.sin(phase * Math.PI * 2) * 1.1).toFixed(2)}, 440, 145)`
      : "";

  return `
    <g transform="${bodyTranslate}" class="${phase === undefined ? "cc-swim-body" : ""}" style="transform-origin: 440px 145px;">
      ${farWingXml}
      ${tailS1Xml}
      ${bodyCanvas.toSvgRects(PX)}
      ${nearWingXml}
    </g>
  `;
}

function renderTulkunDive(
  pp: PixelPalette,
  stage: number,
  phase?: number
): string {
  const upperFarWing = new PixelCanvas();
  upperFarWing.fillPolygon(
    [
      [126, 44],
      [135, 38],
      [168, 20],
      [162, 31],
      [133, 50],
    ],
    (gx, gy) => ((gx + gy) % 2 === 0 ? pp.slateLight : pp.slateMain)
  );

  const tailS1 = new PixelCanvas();
  tailS1.fillPolygon(
    [
      [158, 42],
      [195, 29],
      [198, 37],
      [163, 53],
    ],
    (gx, gy, _nx, ny) =>
      ny > 0.74 ? pp.stripeBlue : (gx + gy) % 2 === 0 ? pp.slateMain : pp.slateDark
  );

  const flukeCanvas = new PixelCanvas();
  flukeCanvas.fillPolygon(
    [
      [193, 31],
      [226, 12],
      [234, 17],
      [205, 35],
    ],
    (gx, gy) => ((gx + gy) % 2 === 0 ? pp.slateLight : pp.slateMain)
  );
  flukeCanvas.fillPolygon(
    [
      [195, 34],
      [233, 27],
      [228, 35],
      [197, 39],
    ],
    (gx, gy) => ((gx + gy) % 2 === 0 ? pp.slateDark : pp.slateMain)
  );

  const bodyCanvas = new PixelCanvas();
  bodyCanvas.fillPolygon(
    [
      [58, 79],
      [58, 70],
      [70, 56],
      [96, 44],
      [130, 39],
      [162, 41],
      [165, 53],
      [138, 63],
      [106, 73],
      [72, 83],
    ],
    (gx, gy, _nx, ny) => {
      if (ny > 0.78) return pp.stripeBlue;
      if (ny < 0.25 && gx >= 112 && gx <= 118) return pp.whitePure;
      if (ny < 0.3) return (gx + gy) % 2 === 0 ? pp.slateLight : pp.slateMain;
      return (gx + gy) % 2 === 0 ? pp.slateMain : pp.slateDark;
    }
  );

  bodyCanvas.fillEllipse(85, 76, 25, 13, (gx, gy, _nx, ny) => {
    if (gy < 68) return null;
    if (ny > 0.55) return (gx + gy) % 2 === 0 ? pp.whiteMid : pp.whiteShadow;
    return (gx + gy) % 2 === 0 ? pp.whitePure : pp.whiteMid;
  });

  bodyCanvas.fillPolygon(
    [
      [67, 63],
      [88, 49],
      [105, 45],
      [104, 52],
      [83, 62],
    ],
    (gx, gy) => (gx >= 89 && gx <= 94 && gy <= 52 ? pp.slateDark : pp.crestGold)
  );
  bodyCanvas.fillRect(92, 60, 3, 2, pp.crestGold);
  bodyCanvas.fillEllipse(68, 71, 3, 1.5, pp.whitePure);

  if (stage >= 4) {
    bodyCanvas.fillRect(114, 41, 3, 2, pp.energyBright);
  }

  const lowerNearWing = new PixelCanvas();
  lowerNearWing.fillPolygon(
    [
      [111, 61],
      [123, 57],
      [158, 92],
      [169, 108],
      [159, 108],
      [129, 82],
      [109, 68],
    ],
    (gx, gy) => {
      const diag = gy - 61 - (gx - 111) * 0.95;
      if (diag < -0.5) return pp.whitePure;
      if (diag < 2) return pp.whiteMid;
      return (gx + gy) % 2 === 0 ? pp.slateMain : pp.slateDark;
    }
  );

  const farWingXml = renderChainedSeg(upperFarWing, 130, 44, "cc-wing-far", phase, 1.4, 5);
  const flukeXml = renderChainedSeg(flukeCanvas, 195, 34, "cc-tail-s3", phase, 1.2, 6);
  const tailXml = renderChainedSeg(tailS1, 161, 46, "cc-tail-s1", phase, 0.3, 4.5, flukeXml);
  const nearWingXml = renderChainedSeg(lowerNearWing, 114, 62, "cc-shoulder", phase, 0, 6.5);

  const diveFloat =
    phase !== undefined
      ? `translate(${(-Math.cos(phase * Math.PI * 2) * 3).toFixed(2)}, ${(Math.sin(phase * Math.PI * 2) * 5).toFixed(2)})`
      : "";

  return `
    <g transform="${diveFloat}" class="${phase === undefined ? "cc-swim-body" : ""}" style="transform-origin: 420px 175px;">
      ${farWingXml}
      ${tailXml}
      ${bodyCanvas.toSvgRects(PX)}
      ${nearWingXml}
    </g>
  `;
}

function renderTulkunTop(
  pp: PixelPalette,
  stage: number,
  phase?: number
): string {
  const topWing = new PixelCanvas();
  topWing.fillPolygon(
    [
      [104, 49],
      [118, 49],
      [148, 22],
      [156, 15],
      [144, 15],
      [115, 36],
    ],
    (gx, gy, _nx, ny) => {
      if (ny < 0.25) return pp.whitePure;
      if (ny < 0.45) return pp.whiteMid;
      return (gx + gy) % 2 === 0 ? pp.slateMain : pp.slateDark;
    }
  );

  const bottomWing = new PixelCanvas();
  bottomWing.fillPolygon(
    [
      [104, 69],
      [118, 69],
      [148, 96],
      [156, 103],
      [144, 103],
      [115, 82],
    ],
    (gx, gy, _nx, ny) => {
      if (ny > 0.75) return pp.whitePure;
      if (ny > 0.55) return pp.whiteMid;
      return (gx + gy) % 2 === 0 ? pp.slateMain : pp.slateDark;
    }
  );

  const tailCanvas = new PixelCanvas();
  tailCanvas.fillPolygon(
    [
      [164, 53],
      [204, 56],
      [204, 62],
      [164, 65],
    ],
    (gx, gy, _nx, ny) =>
      Math.abs(ny - 0.5) > 0.35 ? pp.stripeBlue : (gx + gy) % 2 === 0 ? pp.slateMain : pp.slateDark
  );
  tailCanvas.fillPolygon(
    [
      [172, 53],
      [186, 44],
      [190, 49],
      [176, 56],
    ],
    pp.slateDark
  );
  tailCanvas.fillPolygon(
    [
      [172, 65],
      [186, 74],
      [190, 69],
      [176, 62],
    ],
    pp.slateDark
  );

  const flukeCanvas = new PixelCanvas();
  flukeCanvas.fillPolygon(
    [
      [201, 58],
      [226, 36],
      [234, 34],
      [216, 59],
      [234, 84],
      [226, 82],
      [201, 60],
    ],
    (gx, gy, nx) => {
      if (nx > 0.72) return pp.slateLight;
      return (gx + gy) % 2 === 0 ? pp.slateMain : pp.slateDark;
    }
  );

  const bodyCanvas = new PixelCanvas();
  bodyCanvas.fillEllipse(104, 59, 44, 14, (gx, gy, nx, ny) => {
    const absY = Math.abs(ny);
    if (absY < 0.14 && gx > 85 && gx % 16 === 0) return pp.whitePure;
    if (absY > 0.8) return pp.stripeBlue;
    if (nx < -0.82 && absY > 0.25) return pp.whiteMid;
    return (gx + gy) % 2 === 0 ? pp.slateMain : pp.slateDark;
  });

  bodyCanvas.fillPolygon(
    [
      [130, 51],
      [168, 53],
      [168, 65],
      [130, 67],
    ],
    (gx, gy, _nx, ny) =>
      ny < 0.2 || ny > 0.8 ? pp.stripeBlue : (gx + gy) % 2 === 0 ? pp.slateMain : pp.slateDark
  );

  bodyCanvas.fillPolygon(
    [
      [66, 54],
      [94, 49],
      [96, 55],
      [74, 57],
    ],
    pp.crestGold
  );
  bodyCanvas.fillPolygon(
    [
      [66, 64],
      [94, 69],
      [96, 63],
      [74, 61],
    ],
    pp.crestGold
  );
  bodyCanvas.fillRect(62, 57, 4, 4, pp.whitePure);

  if (stage >= 4) {
    bodyCanvas.fillRect(110, 58, 4, 2, pp.energyBright);
    bodyCanvas.fillRect(142, 58, 3, 2, pp.energyBright);
  }

  const topWingXml = renderChainedSeg(topWing, 110, 50, "cc-wing-mirror", phase, 0, 6.5);
  const botWingXml = renderChainedSeg(bottomWing, 110, 68, "cc-shoulder", phase, 0, 6.5);
  const flukeXml = renderChainedSeg(flukeCanvas, 203, 59, "cc-tail-s3", phase, 1.3, 6);
  const tailXml = renderChainedSeg(tailCanvas, 165, 59, "cc-tail-s1", phase, 0.3, 4, flukeXml);

  const floatTop =
    phase !== undefined
      ? `translate(${(-Math.cos(phase * Math.PI * 2) * 3).toFixed(2)}, ${(Math.sin(phase * Math.PI * 2) * 3).toFixed(2)})`
      : "";

  return `
    <g transform="${floatTop}" class="${phase === undefined ? "cc-swim-body" : ""}" style="transform-origin: 420px 175px;">
      ${topWingXml}
      ${botWingXml}
      ${tailXml}
      ${bodyCanvas.toSvgRects(PX)}
    </g>
  `;
}

function makeJellyShader(
  glowIce: string,
  bellBright: string,
  bellMid: string,
  bellDeep: string
) {
  return (gx: number, gy: number, t: number, ny: number) => {
    const dither = (gx + gy) % 2 === 0;
    if (Math.abs(ny) > 0.56) return dither ? glowIce : bellBright;
    if (t > 0.65) return dither ? bellBright : bellMid;
    return dither ? bellBright : bellDeep;
  };
}

function renderTentacleRibbonChain(
  startGx: number,
  startGy: number,
  totalLen: number,
  amp: number,
  thickness: number,
  shader: ReturnType<typeof makeJellyShader> | string,
  phase: number | undefined,
  variant: "a" | "b"
): string {
  const segLen = Math.round(totalLen / 3);
  const s1Canvas = new PixelCanvas();
  const s2Canvas = new PixelCanvas();
  const s3Canvas = new PixelCanvas();

  const buildSeg = (
    canvas: PixelCanvas,
    x0: number,
    y0: number,
    len: number,
    phaseBase: number,
    scaleStart: number,
    scaleEnd: number
  ): [number, number] => {
    const samples: { x: number; y: number; r: number }[] = [];
    const steps = 20;
    let endX = x0;
    let endY = y0;
    for (let i = 0; i <= steps; i++) {
      const localT = i / steps;
      const globalT = (phaseBase + localT) / 3;
      const x = x0 + localT * len;
      const y = y0 + Math.sin(globalT * Math.PI * 3.4) * amp;
      const taper = scaleStart + (scaleEnd - scaleStart) * localT;
      const ruffle =
        typeof shader === "string"
          ? 1
          : Math.abs(Math.sin(globalT * 24)) * 0.9 + 0.65;
      samples.push({ x, y, r: Math.max(0.55, thickness * taper * ruffle) });
      endX = x;
      endY = y;
    }
    canvas.fillSplineRibbon(samples, shader);
    return [endX, endY];
  };

  const [j1x, j1y] = buildSeg(s1Canvas, startGx, startGy, segLen, 0, 1.0, 0.78);
  const [j2x, j2y] = buildSeg(s2Canvas, j1x, j1y, segLen, 1, 0.78, 0.52);
  buildSeg(s3Canvas, j2x, j2y, segLen, 2, 0.52, 0.25);

  const lagBase = variant === "a" ? 0 : 1.1;
  const s3Xml = renderChainedSeg(s3Canvas, j2x, j2y, `cc-wave-${variant}3`, phase, lagBase + 1.8, 5);
  const s2Xml = renderChainedSeg(s2Canvas, j1x, j1y, `cc-wave-${variant}2`, phase, lagBase + 0.9, 4.2, s3Xml);
  return renderChainedSeg(s1Canvas, startGx, startGy, `cc-wave-${variant}1`, phase, lagBase, 3.8, s2Xml);
}

function renderPixelJellyfishView(
  p: DerivedPalette,
  view: CameraView,
  stage: number,
  phase?: number
): string {
  const glowIce = mixHex(p.armorHighlight, "#FFFFFF", 0.55);
  const bellBright =
    p.armorMain === "#36506B" ? "#7AD2FF" : mixHex(p.armorMain, "#96E4FF", 0.48);
  const bellMid = p.armorMain === "#36506B" ? "#2E82E6" : p.armorMain;
  const bellDeep = p.armorMain === "#36506B" ? "#16449C" : p.armorShadow;
  const rimAccent = p.armorMain === "#36506B" ? "#10285E" : p.frameDark;
  const sporeColor = p.energyBright;
  const frillShader = makeJellyShader(glowIce, bellBright, bellMid, bellDeep);

  const lenScale = stage <= 1 ? 0.78 : stage === 2 ? 0.88 : 1.0;

  if (view === "top") {
    const armTop = renderTentacleRibbonChain(
      82,
      46,
      Math.round(145 * lenScale),
      -5.5,
      2.7,
      frillShader,
      phase,
      "a"
    );
    const armMid = renderTentacleRibbonChain(
      82,
      58,
      Math.round(162 * lenScale),
      3.5,
      3.4,
      frillShader,
      phase,
      "b"
    );
    const armBot = renderTentacleRibbonChain(
      82,
      70,
      Math.round(145 * lenScale),
      5.5,
      2.7,
      frillShader,
      phase,
      "a"
    );
    const whipTop = renderTentacleRibbonChain(
      76,
      32,
      Math.round(168 * lenScale),
      -9,
      0.85,
      bellBright,
      phase,
      "b"
    );
    const whipBot = renderTentacleRibbonChain(
      76,
      84,
      Math.round(168 * lenScale),
      9,
      0.85,
      glowIce,
      phase,
      "a"
    );

    const topBell = new PixelCanvas();
    topBell.fillEllipse(66, 58, 22, 31, (gx, gy, nx, ny) => {
      if (nx > 0.72) return null;
      const dither = (gx + gy) % 2 === 0;
      const dist = Math.sqrt(nx * nx + ny * ny);
      const rad = Math.sin(ny * 12) > 0.3;
      if (dist > 0.86 || nx < -0.75) return dither ? glowIce : bellBright;
      if (nx > 0.42 && Math.abs(ny) < 0.85) return dither ? bellDeep : rimAccent;
      return rad ? (dither ? glowIce : bellBright) : dither ? bellBright : bellMid;
    });

    const bellT =
      phase !== undefined
        ? `translate(198, 174) scale(${(0.985 + Math.cos(phase * Math.PI * 2) * 0.055).toFixed(3)}, ${(1.01 - Math.cos(phase * Math.PI * 2) * 0.05).toFixed(3)}) translate(-198, -174)`
        : "";
    const surgeT =
      phase !== undefined
        ? `translate(${(-2 + Math.sin(phase * Math.PI * 2) * 6).toFixed(2)}, ${(Math.cos(phase * Math.PI * 2) * 3).toFixed(2)})`
        : "";

    return `
      <g transform="${surgeT}" class="${phase === undefined ? "cc-jelly-surge" : ""}">
        ${whipTop}
        ${whipBot}
        ${armTop}
        ${armMid}
        ${armBot}
        <g transform="${bellT}" class="${phase === undefined ? "cc-jelly-bell" : ""}" style="transform-origin: 198px 174px;">
          ${topBell.toSvgRects(PX)}
        </g>
      </g>
    `;
  }

  if (view === "dive") {
    const diveFrill1 = renderTentacleRibbonChain(
      85,
      54,
      Math.round(150 * lenScale),
      5.5,
      3.1,
      frillShader,
      phase,
      "a"
    );
    const diveFrill2 = renderTentacleRibbonChain(
      88,
      66,
      Math.round(142 * lenScale),
      -5,
      2.7,
      frillShader,
      phase,
      "b"
    );
    const diveWhip1 = renderTentacleRibbonChain(
      76,
      44,
      Math.round(166 * lenScale),
      -8,
      0.85,
      glowIce,
      phase,
      "a"
    );
    const diveWhip2 = renderTentacleRibbonChain(
      88,
      78,
      Math.round(162 * lenScale),
      9,
      0.8,
      bellBright,
      phase,
      "b"
    );

    const diveBell = new PixelCanvas();
    diveBell.fillEllipse(66, 62, 22, 26, (gx, gy, nx, ny) => {
      if (nx > 0.52) return null;
      const dither = (gx + gy) % 2 === 0;
      const dist = Math.sqrt(nx * nx + ny * ny);
      if (dist > 0.88 || nx < -0.78) return dither ? glowIce : bellBright;
      if (Math.sin(ny * 9) > 0.35) return dither ? glowIce : bellBright;
      return dither ? bellBright : bellMid;
    });
    diveBell.fillEllipse(80, 62, 10, 23, (gx, gy, nx, ny) => {
      const dist = Math.sqrt(nx * nx + ny * ny);
      if (dist > 0.94) return null;
      if (dist > 0.72) return (gx + gy) % 2 === 0 ? bellBright : rimAccent;
      if (dist < 0.28) return glowIce;
      return (gx + gy) % 2 === 0 ? bellDeep : rimAccent;
    });

    const bellT =
      phase !== undefined
        ? `translate(210, 186) scale(${(0.985 + Math.cos(phase * Math.PI * 2) * 0.055).toFixed(3)}, ${(1.01 - Math.cos(phase * Math.PI * 2) * 0.05).toFixed(3)}) translate(-210, -186)`
        : "";
    const diveSurge =
      phase !== undefined
        ? `translate(${(-2 + Math.sin(phase * Math.PI * 2) * 6).toFixed(2)}, ${(Math.cos(phase * Math.PI * 2) * 4).toFixed(2)})`
        : "";

    return `
      <g transform="translate(450, 195) rotate(-14) translate(-450, -195)">
        <g transform="${diveSurge}" class="${phase === undefined ? "cc-jelly-surge" : ""}">
          ${diveWhip1}
          ${diveFrill1}
          ${diveFrill2}
          ${diveWhip2}
          <g transform="${bellT}" class="${phase === undefined ? "cc-jelly-bell" : ""}" style="transform-origin: 210px 186px;">
            ${diveBell.toSvgRects(PX)}
          </g>
        </g>
      </g>
    `;
  }

  const sideWhipTop = renderTentacleRibbonChain(
    75,
    38,
    Math.round(166 * lenScale),
    -9,
    0.85,
    bellMid,
    phase,
    "b"
  );
  const sideWhipBot = renderTentacleRibbonChain(
    74,
    78,
    Math.round(170 * lenScale),
    10,
    0.85,
    bellBright,
    phase,
    "a"
  );
  const sideFrillTop = renderTentacleRibbonChain(
    77,
    50,
    Math.round(148 * lenScale),
    4.8,
    2.6,
    frillShader,
    phase,
    "a"
  );
  const sideFrillMid = renderTentacleRibbonChain(
    74,
    58,
    Math.round(164 * lenScale),
    5.6,
    3.5,
    frillShader,
    phase,
    "b"
  );
  const sideFrillBot =
    stage >= 2
      ? renderTentacleRibbonChain(
          77,
          66,
          Math.round(145 * lenScale),
          -4.6,
          2.6,
          frillShader,
          phase,
          "a"
        )
      : "";
  const sideWhipFrontTop = renderTentacleRibbonChain(
    76,
    43,
    Math.round(174 * lenScale),
    -11,
    0.75,
    glowIce,
    phase,
    "a"
  );
  const sideWhipFrontBot = renderTentacleRibbonChain(
    76,
    73,
    Math.round(176 * lenScale),
    11,
    0.75,
    glowIce,
    phase,
    "b"
  );

  const sideBell = new PixelCanvas();
  sideBell.fillEllipse(65, 58, 21, 27, (gx, gy, nx, ny) => {
    if (nx > 0.62) return null;
    const dist = Math.sqrt(nx * nx + ny * ny);
    const dither = (gx + gy) % 2 === 0;
    const rib = Math.sin(ny * 10) > 0.35;

    if (nx < -0.78 || dist > 0.88) return dither ? glowIce : bellBright;
    if (nx > 0.36) {
      if (Math.round(gy) % 6 === 0) return rimAccent;
      return dither ? bellMid : bellDeep;
    }
    if (rib) return dither ? glowIce : bellBright;
    return dither ? bellBright : bellMid;
  });

  sideBell.fillEllipse(75, 58, 7, 22, (gx, gy, _nx, ny) => {
    if (gx > 80) return null;
    if (Math.abs(ny) > 0.86) return bellBright;
    return (gx + gy) % 2 === 0 ? bellDeep : bellMid;
  });

  for (let sy = 36; sy <= 80; sy += 5) {
    sideBell.setPixel(77, sy, glowIce);
    sideBell.setPixel(78, sy + 1, bellBright);
    if (sy % 10 === 1) {
      sideBell.setPixel(75, sy, rimAccent);
    }
  }

  if (stage >= 3) {
    sideBell.fillRect(54, 41, 2, 2, glowIce);
    sideBell.fillRect(49, 58, 2, 2, glowIce);
    sideBell.fillRect(54, 75, 2, 2, glowIce);
  }
  if (stage >= 4) {
    sideBell.setPixel(72, 26, sporeColor);
    sideBell.setPixel(132, 30, sporeColor);
    sideBell.setPixel(168, 82, glowIce);
  }
  if (stage >= 5) {
    sideBell.setPixel(196, 36, sporeColor);
    sideBell.setPixel(208, 74, sporeColor);
  }

  const bellT =
    phase !== undefined
      ? `translate(195, 174) scale(${(0.985 + Math.cos(phase * Math.PI * 2) * 0.055).toFixed(3)}, ${(1.01 - Math.cos(phase * Math.PI * 2) * 0.05).toFixed(3)}) translate(-195, -174)`
      : "";
  const swimT =
    phase !== undefined
      ? `translate(${(-2 + Math.sin(phase * Math.PI * 2) * 6).toFixed(2)}, ${(Math.cos(phase * Math.PI * 2) * 3.5).toFixed(2)})`
      : "";

  return `
    <g transform="${swimT}" class="${phase === undefined ? "cc-jelly-surge" : ""}">
      ${sideWhipTop}
      ${sideWhipBot}
      ${sideFrillTop}
      ${sideFrillMid}
      ${sideFrillBot}
      ${sideWhipFrontTop}
      ${sideWhipFrontBot}
      <g transform="${bellT}" class="${phase === undefined ? "cc-jelly-bell" : ""}" style="transform-origin: 195px 174px;">
        ${sideBell.toSvgRects(PX)}
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
  idPrefix = "cc",
  phase?: number
): string {
  const p = derivePalette(config);
  const pp = toPixelPalette(p);
  const { stage } = getEvolutionStage(config.commits);

  if (config.creature === "jellyfish") {
    return buildStageWrapper(
      stage,
      `<g data-creature="${idPrefix}">${renderPixelJellyfishView(p, config.view, stage, phase)}</g>`
    );
  }

  let bodyMarkup = "";
  if (config.view === "dive") {
    bodyMarkup = renderTulkunDive(pp, stage, phase);
  } else if (config.view === "top") {
    bodyMarkup = renderTulkunTop(pp, stage, phase);
  } else {
    bodyMarkup = renderTulkunSide(pp, stage, phase);
  }

  return buildStageWrapper(
    stage,
    `<g data-creature="${idPrefix}">${bodyMarkup}</g>`
  );
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
