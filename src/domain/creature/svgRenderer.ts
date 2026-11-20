import {
  STAGE_DEFINITIONS,
  type CameraView,
  type CreatureConfig,
  type DerivedPalette,
} from "@/domain/creature/entities";
import {
  JELLYFISH_BELL_PNG_URI,
  JELLYFISH_TENTACLES_PNG_URI,
} from "@/domain/creature/jellyfishAssets";
import {
  derivePalette,
  formatHudLabel,
  getCreatureMeta,
  getEvolutionStage,
} from "@/domain/creature/services";

export const SVG_WIDTH = 920;
export const SVG_HEIGHT = 460;
export const SHARE_CARD_WIDTH = 1280;
export const SHARE_CARD_HEIGHT = 640;

export function escapeXml(input: string): string {
  return input
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

interface FeatherSpec {
  x: number;
  y: number;
  length: number;
  width: number;
  angle: number;
  curve?: number;
  orangeTip?: boolean;
  orangeFull?: boolean;
  greenTip?: boolean;
  far?: boolean;
  animClass?: string;
}

function renderFeather(
  spec: FeatherSpec,
  p: DerivedPalette,
  idPrefix: string
): string {
  const {
    x,
    y,
    length,
    width,
    angle,
    curve = 12,
    orangeTip = true,
    orangeFull = false,
    greenTip = false,
    far = false,
    animClass = "cc-f1",
  } = spec;

  const fillUpper = orangeFull
    ? p.accentMain
    : far
      ? p.armorShadow
      : `url(#${idPrefix}-armor-v)`;
  const fillLower = orangeFull
    ? p.accentDeep
    : far
      ? p.armorFar
      : p.armorMid;
  const strokeCol = p.seamStroke;
  const tipX = length;
  const tipY = curve;

  const upperW = width * 0.52;
  const lowerW = width * 0.48;

  const upperPath = [
    `M 0 ${(-upperW * 0.45).toFixed(1)}`,
    `C ${(length * 0.25).toFixed(1)} ${(-upperW * 1.05 + curve * 0.1).toFixed(1)}, ${(length * 0.68).toFixed(1)} ${(-upperW * 0.62 + curve * 0.55).toFixed(1)}, ${tipX.toFixed(1)} ${tipY.toFixed(1)}`,
    `C ${(length * 0.65).toFixed(1)} ${(curve * 0.45 + upperW * 0.08).toFixed(1)}, ${(length * 0.28).toFixed(1)} ${(upperW * 0.14).toFixed(1)}, 0 ${(upperW * 0.1).toFixed(1)}`,
    `Z`,
  ].join(" ");

  const lowerPath = [
    `M 0 ${(upperW * 0.08).toFixed(1)}`,
    `C ${(length * 0.3).toFixed(1)} ${(upperW * 0.14).toFixed(1)}, ${(length * 0.65).toFixed(1)} ${(curve * 0.48).toFixed(1)}, ${tipX.toFixed(1)} ${tipY.toFixed(1)}`,
    `C ${(length * 0.62).toFixed(1)} ${(lowerW * 0.85 + curve * 0.65).toFixed(1)}, ${(length * 0.24).toFixed(1)} ${(lowerW * 0.92 + curve * 0.18).toFixed(1)}, 0 ${(lowerW * 0.45).toFixed(1)}`,
    `Z`,
  ].join(" ");

  const tipStart = 0.74;
  const tx1 = length * tipStart;
  const ty1 = curve * 0.56 - upperW * 0.34;
  const tx2 = length * (tipStart + 0.05);
  const ty2 = curve * 0.7 + lowerW * 0.32;
  const orangeCap =
    orangeTip && !orangeFull
      ? `<path d="M ${tx1.toFixed(1)} ${ty1.toFixed(1)} Q ${(length * 0.88).toFixed(1)} ${(curve * 0.8 - upperW * 0.15).toFixed(1)}, ${tipX.toFixed(1)} ${tipY.toFixed(1)} Q ${(length * 0.89).toFixed(1)} ${(curve * 0.86 + lowerW * 0.16).toFixed(1)}, ${tx2.toFixed(1)} ${ty2.toFixed(1)} Z" fill="${far ? p.accentDeep : p.accentMain}" stroke="${strokeCol}" stroke-width="0.9" stroke-linejoin="round" />`
      : "";

  const highlightEdge = !far
    ? `<path d="M 8 ${(-upperW * 0.38).toFixed(1)} Q ${(length * 0.4).toFixed(1)} ${(-upperW * 0.76 + curve * 0.2).toFixed(1)}, ${(length * 0.72).toFixed(1)} ${(-upperW * 0.32 + curve * 0.56).toFixed(1)}" fill="none" stroke="${p.armorHighlight}" stroke-width="1.3" stroke-linecap="round" opacity="0.7" />`
    : "";

  const greenFilament = greenTip
    ? `<path class="cc-pulse" d="M ${(length * 0.88).toFixed(1)} ${(curve * 0.84).toFixed(1)} L ${(length + 14).toFixed(1)} ${(curve + 3).toFixed(1)}" stroke="${p.energyMain}" stroke-width="1.8" stroke-linecap="round" /><circle class="cc-pulse" cx="${(length + 14).toFixed(1)}" cy="${(curve + 3).toFixed(1)}" r="2" fill="${p.energyBright}" />`
    : "";

  return `
    <g transform="translate(${x.toFixed(1)}, ${y.toFixed(1)}) rotate(${angle.toFixed(1)})">
      <g class="${animClass}" style="transform-origin: 0px 0px;">
        <path d="${lowerPath}" fill="${fillLower}" stroke="${strokeCol}" stroke-width="1.05" stroke-linejoin="round" />
        <path d="${upperPath}" fill="${fillUpper}" stroke="${strokeCol}" stroke-width="1.15" stroke-linejoin="round" />
        ${orangeCap}
        ${highlightEdge}
        <path d="M 5 0 Q ${(length * 0.45).toFixed(1)} ${(curve * 0.36).toFixed(1)}, ${(length * 0.84).toFixed(1)} ${(curve * 0.8).toFixed(1)}" fill="none" stroke="${strokeCol}" stroke-width="0.9" opacity="0.55" />
        ${greenFilament}
        <circle cx="4" cy="0" r="3.4" fill="${p.frameMain}" stroke="${strokeCol}" stroke-width="1" />
        <circle cx="4" cy="0" r="1.3" fill="${far ? p.armorShadow : p.armorMid}" />
      </g>
    </g>`;
}

interface CableSpec {
  d: string;
  tipX: number;
  tipY: number;
  tipAngle?: number;
  variant: "armored" | "fiber" | "ceramic";
  width?: number;
  tipColor?: "orange" | "green" | "none";
  animClass: string;
  originX: number;
  originY: number;
}

function renderCable(spec: CableSpec, p: DerivedPalette): string {
  const {
    d,
    tipX,
    tipY,
    tipAngle = 0,
    variant,
    width = 3.2,
    tipColor = "orange",
    animClass,
    originX,
    originY,
  } = spec;

  let strokeMarkup = "";
  if (variant === "ceramic") {
    strokeMarkup = `
      <path d="${d}" fill="none" stroke="${p.seamStroke}" stroke-width="${width + 1.8}" stroke-linecap="round" />
      <path d="${d}" fill="none" stroke="${p.armorMid}" stroke-width="${width}" stroke-linecap="round" />
      <path d="${d}" fill="none" stroke="${p.armorHighlight}" stroke-width="${Math.max(1, width * 0.38)}" stroke-linecap="round" opacity="0.85" />
    `;
  } else if (variant === "armored") {
    strokeMarkup = `
      <path d="${d}" fill="none" stroke="${p.frameDark}" stroke-width="${width + 1.8}" stroke-linecap="round" />
      <path d="${d}" fill="none" stroke="${p.frameMain}" stroke-width="${width}" stroke-linecap="round" />
      <path d="${d}" fill="none" stroke="${p.frameLight}" stroke-width="${Math.max(1, width * 0.35)}" stroke-linecap="round" opacity="0.85" />
    `;
  } else {
    strokeMarkup = `
      <path d="${d}" fill="none" stroke="${p.frameDark}" stroke-width="${width + 1.4}" stroke-linecap="round" />
      <path d="${d}" fill="none" stroke="${p.armorShadow}" stroke-width="${Math.max(1.2, width - 0.5)}" stroke-linecap="round" />
      <path class="cc-pulse" d="${d}" fill="none" stroke="${p.energyMain}" stroke-width="1.1" stroke-opacity="0.78" stroke-linecap="round" />
    `;
  }

  let tipMarkup = "";
  if (tipColor === "orange") {
    tipMarkup = `
      <g transform="translate(${tipX}, ${tipY}) rotate(${tipAngle})">
        <path d="M -8 -2.8 L 10 0 L -8 2.8 L -4 0 Z" fill="${p.accentMain}" stroke="${p.seamStroke}" stroke-width="0.9" stroke-linejoin="round" />
        <circle cx="-6" cy="0" r="2" fill="${p.frameMain}" />
      </g>
    `;
  } else if (tipColor === "green") {
    tipMarkup = `
      <g transform="translate(${tipX}, ${tipY}) rotate(${tipAngle})">
        <circle class="cc-pulse" cx="2" cy="0" r="${width * 1.5}" fill="${p.energyMain}" fill-opacity="0.28" />
        <path class="cc-pulse" d="M -7 -2.4 L 11 0 L -7 2.4 L -3 0 Z" fill="${p.energyBright}" stroke="${p.energyMain}" stroke-width="0.8" stroke-linejoin="round" />
      </g>
    `;
  }

  return `
    <g class="${animClass}" style="transform-origin: ${originX}px ${originY}px;">
      ${strokeMarkup}
      ${tipMarkup}
    </g>`;
}

export function buildAnimationStyles(speed: number): string {
  const safeSpeed = Math.max(0.5, Math.min(2.5, speed || 1));
  const dur = (base: number) => `${(base / safeSpeed).toFixed(2)}s`;

  return `
    .cc-float {
      transform-box: fill-box;
      transform-origin: center;
      animation: ccFloat ${dur(5.2)} ease-in-out infinite;
    }
    .cc-tail-swim {
      transform-box: fill-box;
      animation: ccTailSwim ${dur(4.2)} ease-in-out infinite;
    }
    .cc-fluke-wave {
      transform-box: fill-box;
      animation: ccFlukeWave ${dur(4.2)} ease-in-out 0.45s infinite;
    }
    .cc-wing-near {
      transform-box: fill-box;
      animation: ccWingNear ${dur(4.0)} ease-in-out infinite;
    }
    .cc-wing-far {
      transform-box: fill-box;
      animation: ccWingFar ${dur(4.0)} ease-in-out infinite;
    }
    .cc-f1, .cc-f2, .cc-f3, .cc-f4, .cc-f5, .cc-f6 {
      transform-box: fill-box;
    }
    .cc-f1 { animation: ccFeatherA ${dur(3.1)} ease-in-out infinite; }
    .cc-f2 { animation: ccFeatherB ${dur(3.3)} ease-in-out 0.25s infinite; }
    .cc-f3 { animation: ccFeatherA ${dur(3.5)} ease-in-out 0.55s infinite; }
    .cc-f4 { animation: ccFeatherB ${dur(3.2)} ease-in-out 0.8s infinite; }
    .cc-f5 { animation: ccFeatherA ${dur(3.4)} ease-in-out 1.1s infinite; }
    .cc-f6 { animation: ccFeatherB ${dur(3.0)} ease-in-out 1.35s infinite; }
    .cc-c1, .cc-c2, .cc-c3, .cc-c4, .cc-c5 {
      transform-box: fill-box;
    }
    .cc-c1 { animation: ccCableA ${dur(4.4)} ease-in-out infinite; }
    .cc-c2 { animation: ccCableB ${dur(4.8)} ease-in-out 0.35s infinite; }
    .cc-c3 { animation: ccCableA ${dur(4.6)} ease-in-out 0.75s infinite; }
    .cc-c4 { animation: ccCableB ${dur(5.1)} ease-in-out 1.15s infinite; }
    .cc-c5 { animation: ccCableA ${dur(4.2)} ease-in-out 0.55s infinite; }
    .cc-pulse {
      animation: ccPulse ${dur(2.2)} ease-in-out infinite;
    }
    .cc-hud-blink {
      animation: ccHudBlink ${dur(1.7)} ease-in-out infinite;
    }
    @keyframes ccFloat {
      0%, 100% { transform: translateY(-9px) rotate(-1.3deg); }
      50% { transform: translateY(9px) rotate(1.3deg); }
    }
    @keyframes ccTailSwim {
      0%, 100% { transform: rotate(-4.5deg) translateY(-2px); }
      50% { transform: rotate(5.2deg) translateY(3px); }
    }
    @keyframes ccFlukeWave {
      0%, 100% { transform: rotate(5deg); }
      50% { transform: rotate(-6deg); }
    }
    @keyframes ccWingNear {
      0%, 100% { transform: rotate(-6.2deg) translateY(-3px); }
      50% { transform: rotate(7.2deg) translateY(4px); }
    }
    @keyframes ccWingFar {
      0%, 100% { transform: rotate(5.5deg) translateY(2px); }
      50% { transform: rotate(-6deg) translateY(-3px); }
    }
    @keyframes ccFeatherA {
      0%, 100% { transform: rotate(-5.2deg); }
      50% { transform: rotate(6deg); }
    }
    @keyframes ccFeatherB {
      0%, 100% { transform: rotate(4.8deg); }
      50% { transform: rotate(-5.5deg); }
    }
    @keyframes ccCableA {
      0%, 100% { transform: rotate(-5.5deg) translateY(-3px); }
      50% { transform: rotate(6deg) translateY(3.5px); }
    }
    @keyframes ccCableB {
      0%, 100% { transform: rotate(5deg) translateY(3px); }
      50% { transform: rotate(-5.5deg) translateY(-3px); }
    }
    @keyframes ccPulse {
      0%, 100% { opacity: 0.48; }
      50% { opacity: 1; }
    }
    @keyframes ccHudBlink {
      0%, 100% { opacity: 0.4; }
      50% { opacity: 1; }
    }
  `;
}

export function buildDefs(p: DerivedPalette, idPrefix: string): string {
  return `
    <defs>
      <linearGradient id="${idPrefix}-armor-v" x1="0%" y1="0%" x2="10%" y2="100%">
        <stop offset="0%" stop-color="${p.armorHighlight}" />
        <stop offset="42%" stop-color="${p.armorMain}" />
        <stop offset="100%" stop-color="${p.armorMid}" />
      </linearGradient>
      <linearGradient id="${idPrefix}-armor-d" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="${p.armorHighlight}" />
        <stop offset="35%" stop-color="${p.armorMain}" />
        <stop offset="78%" stop-color="${p.armorMid}" />
        <stop offset="100%" stop-color="${p.armorShadow}" />
      </linearGradient>
      <linearGradient id="${idPrefix}-head-vol" x1="20%" y1="5%" x2="65%" y2="95%">
        <stop offset="0%" stop-color="${p.armorHighlight}" />
        <stop offset="38%" stop-color="${p.armorMain}" />
        <stop offset="78%" stop-color="${p.armorMid}" />
        <stop offset="100%" stop-color="${p.armorShadow}" />
      </linearGradient>
      <linearGradient id="${idPrefix}-frame-v" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stop-color="${p.frameLight}" />
        <stop offset="50%" stop-color="${p.frameMain}" />
        <stop offset="100%" stop-color="${p.frameDark}" />
      </linearGradient>
      <linearGradient id="${idPrefix}-accent-v" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="${p.accentMain}" />
        <stop offset="100%" stop-color="${p.accentDeep}" />
      </linearGradient>
      <radialGradient id="${idPrefix}-energy-glow" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stop-color="${p.energyBright}" stop-opacity="0.98" />
        <stop offset="45%" stop-color="${p.energyMain}" stop-opacity="0.58" />
        <stop offset="100%" stop-color="${p.energyMain}" stop-opacity="0" />
      </radialGradient>
      <linearGradient id="${idPrefix}-hud-bg" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stop-color="#0D1117" stop-opacity="0.95" />
        <stop offset="50%" stop-color="#161B22" stop-opacity="0.95" />
        <stop offset="100%" stop-color="#0D1117" stop-opacity="0.95" />
      </linearGradient>
    </defs>
  `;
}

function getStageScaleTransform(stage: number): string {
  const scales: Record<number, number> = {
    1: 0.74,
    2: 0.82,
    3: 0.9,
    4: 0.97,
    5: 1.01,
  };
  const s = scales[stage] ?? 1;
  if (s === 1) return "";
  const cx = 460;
  const cy = 205;
  return `translate(${cx}, ${cy}) scale(${s}) translate(${-cx}, ${-cy})`;
}

function renderTulkunSide(
  p: DerivedPalette,
  idPrefix: string,
  stage: number
): string {
  const rawTailCables: CableSpec[] = [
    { d: "M 648 158 C 722 146, 782 118, 846 130", tipX: 846, tipY: 130, tipAngle: 10, variant: "fiber", width: 2.3, tipColor: "green", animClass: "cc-c1", originX: 648, originY: 158 },
    { d: "M 642 166 C 722 184, 786 196, 868 158", tipX: 868, tipY: 158, tipAngle: -16, variant: "ceramic", width: 3.8, tipColor: "orange", animClass: "cc-c2", originX: 642, originY: 166 },
    { d: "M 634 174 C 708 214, 784 222, 858 190", tipX: 858, tipY: 190, tipAngle: -12, variant: "armored", width: 4.2, tipColor: "orange", animClass: "cc-c3", originX: 634, originY: 174 },
    { d: "M 624 180 C 692 246, 774 256, 848 224", tipX: 848, tipY: 224, tipAngle: -10, variant: "ceramic", width: 3.6, tipColor: "green", animClass: "cc-c4", originX: 624, originY: 180 },
    { d: "M 612 186 C 676 276, 762 292, 836 258", tipX: 836, tipY: 258, tipAngle: -14, variant: "armored", width: 4.0, tipColor: "orange", animClass: "cc-c5", originX: 612, originY: 186 },
    { d: "M 598 190 C 656 302, 742 322, 814 292", tipX: 814, tipY: 292, tipAngle: -12, variant: "ceramic", width: 3.4, tipColor: "green", animClass: "cc-c1", originX: 598, originY: 190 },
    { d: "M 584 194 C 638 318, 718 342, 786 320", tipX: 786, tipY: 320, tipAngle: -8, variant: "fiber", width: 2.4, tipColor: "orange", animClass: "cc-c2", originX: 584, originY: 194 },
  ];
  const cableLimit = stage === 1 ? 2 : stage === 2 ? 4 : stage === 3 ? 5 : 7;
  const tailCables = rawTailCables.slice(0, cableLimit);

  const headTendrils: CableSpec[] =
    stage >= 2
      ? [
          { d: "M 248 78 C 296 54, 348 48, 398 58", tipX: 398, tipY: 58, tipAngle: 8, variant: "fiber", width: 2.0, tipColor: "orange", animClass: "cc-c1", originX: 248, originY: 78 },
          { d: "M 256 82 C 308 66, 366 60, 424 50", tipX: 424, tipY: 50, tipAngle: -8, variant: "ceramic", width: 2.4, tipColor: "green", animClass: "cc-c2", originX: 256, originY: 82 },
          ...(stage >= 4
            ? [
                { d: "M 262 88 C 316 80, 370 84, 412 76", tipX: 412, tipY: 76, tipAngle: -6, variant: "fiber" as const, width: 1.8, tipColor: "orange" as const, animClass: "cc-c3", originX: 262, originY: 88 },
                { d: "M 266 94 C 314 96, 358 102, 396 94", tipX: 396, tipY: 94, tipAngle: -8, variant: "fiber" as const, width: 1.7, tipColor: "green" as const, animClass: "cc-c4", originX: 266, originY: 94 },
              ]
            : []),
        ]
      : [];

  const rawFarFeathers: FeatherSpec[] = [
    { x: 224, y: 238, length: 92, width: 24, angle: 112, curve: -8, far: true, orangeTip: true, animClass: "cc-f5" },
    { x: 234, y: 248, length: 106, width: 26, angle: 98, curve: -6, far: true, orangeTip: true, animClass: "cc-f4" },
    { x: 244, y: 258, length: 118, width: 26, angle: 86, curve: 4, far: true, orangeTip: true, greenTip: stage >= 4, animClass: "cc-f3" },
    { x: 254, y: 266, length: 112, width: 24, angle: 74, curve: 8, far: true, orangeTip: true, animClass: "cc-f2" },
    { x: 262, y: 274, length: 96, width: 22, angle: 64, curve: 10, far: true, orangeTip: false, animClass: "cc-f1" },
  ];
  const farFeathers = rawFarFeathers.slice(0, stage <= 2 ? 3 : 5);

  const dorsalFeathers: FeatherSpec[] =
    stage >= 3
      ? [
          { x: 432, y: 122, length: 82, width: 22, angle: -46, curve: -8, orangeTip: true, animClass: "cc-f1" },
          { x: 446, y: 128, length: 92, width: 24, angle: -34, curve: -7, orangeTip: true, greenTip: stage >= 4, animClass: "cc-f2" },
          { x: 460, y: 134, length: 88, width: 22, angle: -22, curve: -5, orangeTip: false, animClass: "cc-f3" },
          ...(stage >= 4
            ? [
                { x: 474, y: 140, length: 78, width: 20, angle: -12, curve: -4, orangeTip: true, animClass: "cc-f4" },
                { x: 488, y: 146, length: 66, width: 18, angle: -4, curve: -3, orangeTip: false, animClass: "cc-f5" },
              ]
            : []),
        ]
      : [];

  const allNearFeathers: FeatherSpec[] = [
    { x: 334, y: 226, length: 116, width: 25, angle: 56, curve: 10, orangeTip: true, animClass: "cc-f6" },
    { x: 350, y: 240, length: 132, width: 27, angle: 49, curve: 11, orangeTip: true, greenTip: stage >= 3, animClass: "cc-f5" },
    { x: 368, y: 254, length: 148, width: 29, angle: 42, curve: 12, orangeTip: true, animClass: "cc-f4" },
    { x: 386, y: 268, length: 162, width: 30, angle: 36, curve: 13, orangeTip: true, greenTip: stage >= 4, animClass: "cc-f3" },
    { x: 406, y: 282, length: 168, width: 30, angle: 30, curve: 13, orangeTip: true, animClass: "cc-f2" },
    { x: 426, y: 296, length: 162, width: 28, angle: 24, curve: 12, orangeTip: true, greenTip: stage >= 5, animClass: "cc-f1" },
    { x: 446, y: 310, length: 146, width: 26, angle: 18, curve: 10, orangeTip: true, animClass: "cc-f2" },
    { x: 464, y: 322, length: 122, width: 23, angle: 12, curve: 8, orangeTip: true, animClass: "cc-f3" },
  ];
  const nearFeathers = allNearFeathers.slice(
    0,
    stage === 1 ? 4 : stage === 2 ? 5 : stage === 3 ? 6 : 8
  );

  const ascendedCrown =
    stage === 5
      ? `
      <g>
        ${renderFeather({ x: 204, y: 74, length: 72, width: 18, angle: -24, curve: -8, orangeTip: true, greenTip: true, animClass: "cc-f2" }, p, idPrefix)}
        ${renderFeather({ x: 222, y: 70, length: 82, width: 20, angle: -18, curve: -8, orangeFull: true, greenTip: true, animClass: "cc-f3" }, p, idPrefix)}
        <path class="cc-pulse" d="M 118 118 L 166 106 L 154 128 L 210 116" fill="none" stroke="${p.energyBright}" stroke-width="2" stroke-linecap="round" />
      </g>`
      : "";

  const ventralPaddle =
    stage >= 3
      ? `
      <g>
        ${renderFeather({ x: 474, y: 206, length: 78, width: 22, angle: 46, curve: 8, far: true, orangeTip: true, animClass: "cc-f4" }, p, idPrefix)}
        ${renderFeather({ x: 486, y: 202, length: 64, width: 19, angle: 36, curve: 6, far: true, orangeTip: false, greenTip: stage >= 5, animClass: "cc-f5" }, p, idPrefix)}
      </g>`
      : "";

  return `
    <g transform="${getStageScaleTransform(stage)}">
      <g class="cc-float">
        <g>${headTendrils.map((c) => renderCable(c, p)).join("")}</g>

        <g class="cc-wing-far" style="transform-origin: 235px 226px;">
          ${farFeathers.map((f) => renderFeather(f, p, idPrefix)).join("")}
          <path d="M 222 216 L 246 274 L 266 322 L 246 328 L 214 248 Z" fill="${p.armorShadow}" stroke="${p.seamStroke}" stroke-width="1.3" stroke-linejoin="round" />
          <circle cx="228" cy="230" r="14" fill="${p.frameDark}" stroke="${p.seamStroke}" stroke-width="1.3" />
          <circle cx="228" cy="230" r="7.5" fill="${p.accentDeep}" />
        </g>

        <g class="cc-tail-swim" style="transform-origin: 430px 168px;">
          ${ventralPaddle}
          <g>${tailCables.map((c) => renderCable(c, p)).join("")}</g>
          <g>${dorsalFeathers.map((f) => renderFeather(f, p, idPrefix)).join("")}</g>

          <path d="M 418 134 C 498 130, 578 142, 650 156 L 646 184 C 574 196, 496 212, 412 224 Z" fill="url(#${idPrefix}-frame-v)" stroke="${p.seamStroke}" stroke-width="1.4" />
          <path d="M 416 122 C 496 126, 576 138, 646 152 L 642 180 C 572 192, 492 204, 412 214 C 402 184, 404 150, 416 122 Z" fill="url(#${idPrefix}-armor-d)" stroke="${p.seamStroke}" stroke-width="1.45" stroke-linejoin="round" />
          <path d="M 454 125 C 446 154, 444 184, 452 209" fill="none" stroke="${p.seamStroke}" stroke-width="1.25" />
          <path d="M 494 129 C 486 156, 484 182, 492 203" fill="none" stroke="${p.seamStroke}" stroke-width="1.25" />
          <path d="M 532 134 C 525 157, 524 179, 530 197" fill="none" stroke="${p.seamStroke}" stroke-width="1.25" />
          <path d="M 568 139 C 562 158, 561 176, 566 192" fill="none" stroke="${p.seamStroke}" stroke-width="1.25" />
          <path d="M 604 144 C 599 160, 598 174, 602 186" fill="none" stroke="${p.seamStroke}" stroke-width="1.2" />
          <path d="M 424 129 C 498 134, 572 145, 636 157" fill="none" stroke="${p.armorHighlight}" stroke-width="3" stroke-linecap="round" opacity="0.75" />
          ${stage >= 3 ? `<rect x="466" y="164" width="12" height="5" rx="1.5" fill="${p.accentMain}" stroke="${p.seamStroke}" stroke-width="0.7" />` : ""}
          ${stage >= 3 ? `<rect x="542" y="162" width="10" height="5" rx="1.5" fill="${p.accentMain}" stroke="${p.seamStroke}" stroke-width="0.7" />` : ""}
          <circle class="cc-pulse" cx="512" cy="166" r="2.6" fill="${p.energyMain}" />
          <circle class="cc-pulse" cx="585" cy="165" r="2.4" fill="${p.energyMain}" />

          <g class="cc-fluke-wave" style="transform-origin: 642px 164px;">
            <path d="M 636 156 L 732 130 L 762 140 L 704 166 L 638 174 Z" fill="url(#${idPrefix}-armor-v)" stroke="${p.seamStroke}" stroke-width="1.4" stroke-linejoin="round" />
            <path d="M 708 136 L 732 130 L 762 140 L 736 150 Z" fill="${p.accentMain}" stroke="${p.seamStroke}" stroke-width="1" />
            <circle cx="644" cy="165" r="6" fill="${p.frameMain}" stroke="${p.seamStroke}" stroke-width="1.1" />
            <circle class="cc-pulse" cx="644" cy="165" r="2.4" fill="${p.energyBright}" />
          </g>
        </g>

        <path d="M 278 124 C 338 112, 390 116, 424 126 L 418 220 C 374 234, 326 244, 286 248 Z" fill="url(#${idPrefix}-frame-v)" stroke="${p.seamStroke}" stroke-width="1.5" />
        ${
          stage >= 2
            ? `<path class="cc-pulse" d="M 326 232 C 378 226, 422 214, 466 202" fill="none" stroke="${p.energyMain}" stroke-width="2" stroke-opacity="0.8" />`
            : ""
        }
        <path d="M 340 236 L 352 212 M 362 232 L 374 206 M 384 226 L 395 201" stroke="${p.frameLight}" stroke-width="2.2" stroke-linecap="round" />

        <path d="M 284 90 C 344 96, 396 110, 428 126 C 416 158, 412 188, 418 216 C 374 230, 324 240, 288 240 Z" fill="url(#${idPrefix}-armor-v)" stroke="${p.seamStroke}" stroke-width="1.5" stroke-linejoin="round" />
        <path d="M 326 102 C 332 144, 338 186, 346 226 M 374 114 C 378 150, 382 184, 388 214" fill="none" stroke="${p.seamStroke}" stroke-width="1.2" opacity="0.82" />
        <rect x="336" y="138" width="24" height="9" rx="2.5" fill="${p.frameMain}" stroke="${p.seamStroke}" stroke-width="0.9" />
        <rect class="cc-pulse" x="340" y="140.5" width="16" height="4" rx="1" fill="${p.energyMain}" />

        <g>
          <path d="M 74 148 C 142 157, 224 162, 306 154 L 310 168 C 222 174, 140 169, 74 161 Z" fill="${p.frameDark}" stroke="${p.seamStroke}" stroke-width="1.2" />
          <path d="M 96 153 L 98 162 M 114 155 L 116 164 M 132 157 L 134 166 M 150 158 L 152 167 M 168 159 L 170 168 M 186 160 L 188 168" stroke="${p.frameLight}" stroke-width="1.2" opacity="0.85" />

          <path d="M 76 161 C 102 226, 198 265, 322 250 L 332 198 C 258 187, 165 172, 76 161 Z" fill="url(#${idPrefix}-head-vol)" stroke="${p.seamStroke}" stroke-width="1.55" stroke-linejoin="round" />
          <path d="M 88 180 C 148 212, 232 230, 314 230" fill="none" stroke="${p.seamStroke}" stroke-width="1.15" />
          <path d="M 106 200 C 166 230, 240 244, 318 242" fill="none" stroke="${p.seamStroke}" stroke-width="1.15" />
          ${
            stage >= 2
              ? `<path class="cc-pulse" d="M 102 192 C 160 220, 228 236, 294 236" fill="none" stroke="${p.energyMain}" stroke-width="1.6" stroke-dasharray="18 8 4 8" />`
              : ""
          }
          <circle cx="116" cy="174" r="6" fill="${p.frameMain}" stroke="${p.seamStroke}" stroke-width="1.1" />
          <circle class="cc-pulse" cx="116" cy="174" r="2.8" fill="${p.energyBright}" />

          <path d="M 70 149 C 66 82, 152 58, 258 74 L 328 102 L 308 159 C 224 165, 138 157, 70 149 Z" fill="url(#${idPrefix}-head-vol)" stroke="${p.seamStroke}" stroke-width="1.65" stroke-linejoin="round" />
          <path d="M 84 114 C 144 92, 230 94, 316 116" fill="none" stroke="${p.seamStroke}" stroke-width="1.15" />
          <path d="M 118 76 C 122 104, 128 130, 136 154" fill="none" stroke="${p.seamStroke}" stroke-width="1.1" />
          <path d="M 192 68 C 194 98, 198 128, 206 158" fill="none" stroke="${p.seamStroke}" stroke-width="1.15" />
          <path d="M 262 76 L 248 156" fill="none" stroke="${p.seamStroke}" stroke-width="1.15" />
          <path d="M 92 103 C 144 74, 214 70, 268 84" fill="none" stroke="${p.armorHighlight}" stroke-width="3.8" stroke-linecap="round" opacity="0.85" />

          ${
            stage >= 3
              ? `<g opacity="0.9">
                  <path class="cc-pulse" d="M 150 100 L 184 100 L 192 108 L 236 108" fill="none" stroke="${p.energyMain}" stroke-width="1.4" stroke-linecap="round" />
                  <path d="M 154 110 L 178 110 L 184 116 L 222 116" fill="none" stroke="${p.energyMain}" stroke-width="1" stroke-opacity="0.65" />
                  <rect x="172" y="130" width="18" height="6" rx="1.5" fill="${p.accentMain}" stroke="${p.seamStroke}" stroke-width="0.8" />
                  <rect class="cc-pulse" x="200" y="134" width="20" height="4" rx="1.2" fill="${p.energyMain}" />
                </g>`
              : ""
          }

          ${ascendedCrown}

          <g>
            <circle cx="144" cy="143" r="8.5" fill="${p.frameMain}" stroke="${p.seamStroke}" stroke-width="1.2" />
            <circle cx="144" cy="143" r="12" fill="url(#${idPrefix}-energy-glow)" class="cc-pulse" />
            <circle cx="144" cy="143" r="4.4" fill="${p.energyMain}" stroke="${p.frameDark}" stroke-width="1" />
            <circle cx="142.5" cy="141.5" r="1.5" fill="${p.energyBright}" />
          </g>

          <g transform="translate(268, 174)">
            <circle cx="0" cy="0" r="${stage >= 4 ? 27 : 22}" fill="${p.frameMain}" stroke="${p.seamStroke}" stroke-width="1.5" />
            ${stage >= 4 ? `<circle cx="0" cy="0" r="21" fill="none" stroke="${p.energyMain}" stroke-width="1.5" stroke-dasharray="12 6" class="cc-pulse" />` : ""}
            <circle cx="0" cy="0" r="15.5" fill="${p.frameDark}" stroke="${p.accentMain}" stroke-width="3" />
            <circle cx="0" cy="0" r="10" fill="url(#${idPrefix}-energy-glow)" class="cc-pulse" />
            <circle cx="0" cy="0" r="5" fill="${p.accentMain}" stroke="${p.seamStroke}" stroke-width="0.9" />
            <circle cx="0" cy="0" r="2.1" fill="${p.energyBright}" />
          </g>

          <circle cx="248" cy="78" r="10" fill="${p.frameMain}" stroke="${p.seamStroke}" stroke-width="1.2" />
          <circle cx="248" cy="78" r="5" fill="${p.accentMain}" />
        </g>

        <g class="cc-wing-near" style="transform-origin: 330px 212px;">
          ${nearFeathers.map((f) => renderFeather(f, p, idPrefix)).join("")}
          <circle cx="330" cy="212" r="25" fill="${p.frameMain}" stroke="${p.seamStroke}" stroke-width="1.6" />
          <circle cx="330" cy="212" r="17" fill="${p.frameDark}" stroke="${p.armorMid}" stroke-width="2" stroke-dasharray="16 6" />
          <circle cx="330" cy="212" r="8.5" fill="${p.accentMain}" stroke="${p.seamStroke}" stroke-width="1.1" />
          <circle class="cc-pulse" cx="330" cy="212" r="3.8" fill="${p.energyBright}" />
          <path d="M 326 212 L 408 266 L 484 328 L 460 344 L 384 284 L 314 232 Z" fill="url(#${idPrefix}-armor-v)" stroke="${p.seamStroke}" stroke-width="1.5" stroke-linejoin="round" />
          <path d="M 340 226 L 466 326" fill="none" stroke="${p.armorHighlight}" stroke-width="2.2" stroke-linecap="round" opacity="0.7" />
          <path d="M 380 260 L 398 248 L 406 258 L 388 272 Z" fill="${p.accentMain}" stroke="${p.seamStroke}" stroke-width="1" />
          <path class="cc-pulse" d="M 406 278 L 454 316" stroke="${p.energyMain}" stroke-width="3" stroke-linecap="round" />
          <circle cx="468" cy="331" r="6" fill="${p.frameMain}" stroke="${p.seamStroke}" stroke-width="1.1" />
          <circle class="cc-pulse" cx="468" cy="331" r="2.5" fill="${p.energyBright}" />
          ${stage >= 3 ? `<path class="cc-pulse" d="M 480 338 L 522 365" stroke="${p.energyMain}" stroke-width="2.2" stroke-linecap="round" />` : ""}
        </g>
      </g>
    </g>
  `;
}

function renderTulkunDive(
  p: DerivedPalette,
  idPrefix: string,
  stage: number
): string {
  return `
    <g transform="translate(460, 188) rotate(-14) scale(0.84) translate(-460, -205)">
      ${renderTulkunSide(p, idPrefix, stage)}
    </g>
  `;
}

function renderTulkunTop(
  p: DerivedPalette,
  idPrefix: string,
  stage: number
): string {
  const rawLeftFeathers: FeatherSpec[] = [
    { x: 350, y: 158, length: 124, width: 24, angle: -138, curve: -12, orangeTip: true, animClass: "cc-f1" },
    { x: 370, y: 154, length: 142, width: 26, angle: -132, curve: -12, orangeTip: true, greenTip: stage >= 4, animClass: "cc-f2" },
    { x: 392, y: 154, length: 154, width: 26, angle: -124, curve: -12, orangeTip: true, animClass: "cc-f3" },
    { x: 414, y: 158, length: 142, width: 24, angle: -116, curve: -10, orangeTip: true, animClass: "cc-f4" },
    { x: 436, y: 164, length: 120, width: 22, angle: -108, curve: -8, orangeTip: true, greenTip: stage >= 5, animClass: "cc-f5" },
  ];
  const leftWingFeathers = rawLeftFeathers.slice(0, stage <= 2 ? 3 : 5);

  const rawRightFeathers: FeatherSpec[] = [
    { x: 350, y: 254, length: 124, width: 24, angle: 138, curve: 12, orangeTip: true, animClass: "cc-f2" },
    { x: 370, y: 258, length: 142, width: 26, angle: 132, curve: 12, orangeTip: true, greenTip: stage >= 4, animClass: "cc-f3" },
    { x: 392, y: 258, length: 154, width: 26, angle: 124, curve: 12, orangeTip: true, animClass: "cc-f4" },
    { x: 414, y: 254, length: 142, width: 24, angle: 116, curve: 10, orangeTip: true, animClass: "cc-f5" },
    { x: 436, y: 248, length: 120, width: 22, angle: 108, curve: 8, orangeTip: true, greenTip: stage >= 5, animClass: "cc-f6" },
  ];
  const rightWingFeathers = rawRightFeathers.slice(0, stage <= 2 ? 3 : 5);

  const rawTopCables: CableSpec[] = [
    { d: "M 642 194 C 710 176, 778 148, 856 164", tipX: 856, tipY: 164, tipAngle: 12, variant: "ceramic", width: 3.4, tipColor: "orange", animClass: "cc-c1", originX: 642, originY: 194 },
    { d: "M 646 202 C 722 198, 788 188, 868 194", tipX: 868, tipY: 194, tipAngle: 4, variant: "fiber", width: 2.3, tipColor: "green", animClass: "cc-c2", originX: 646, originY: 202 },
    { d: "M 646 210 C 722 214, 788 224, 868 218", tipX: 868, tipY: 218, tipAngle: -4, variant: "armored", width: 3.6, tipColor: "green", animClass: "cc-c3", originX: 646, originY: 210 },
    { d: "M 642 218 C 710 236, 778 264, 856 248", tipX: 856, tipY: 248, tipAngle: -12, variant: "ceramic", width: 3.4, tipColor: "orange", animClass: "cc-c4", originX: 642, originY: 218 },
  ];
  const topCables = rawTopCables.slice(0, stage === 1 ? 2 : 4);

  return `
    <g transform="${getStageScaleTransform(stage)}">
      <g class="cc-float">
        <g class="cc-tail-swim" style="transform-origin: 430px 206px;">
          <g>${topCables.map((c) => renderCable(c, p)).join("")}</g>

          ${
            stage >= 3
              ? `<g>
                  <path d="M 526 178 L 566 138 L 584 148 L 548 184 Z" fill="url(#${idPrefix}-armor-d)" stroke="${p.seamStroke}" stroke-width="1.2" />
                  <path d="M 526 234 L 566 274 L 584 264 L 548 228 Z" fill="url(#${idPrefix}-armor-d)" stroke="${p.seamStroke}" stroke-width="1.2" />
                </g>`
              : ""
          }

          <g class="cc-fluke-wave" style="transform-origin: 632px 206px;">
            <path d="M 624 198 L 716 142 L 736 160 L 664 206 L 736 252 L 716 270 L 624 214 Z" fill="url(#${idPrefix}-armor-d)" stroke="${p.seamStroke}" stroke-width="1.5" stroke-linejoin="round" />
            <path d="M 692 156 L 716 142 L 736 160 L 710 172 Z" fill="${p.accentMain}" stroke="${p.seamStroke}" stroke-width="1" />
            <path d="M 692 256 L 716 270 L 736 252 L 710 240 Z" fill="${p.accentMain}" stroke="${p.seamStroke}" stroke-width="1" />
          </g>

          <path d="M 332 172 L 642 192 L 642 220 L 332 240 Z" fill="url(#${idPrefix}-frame-v)" stroke="${p.seamStroke}" stroke-width="1.4" />
          <path d="M 336 160 C 446 164, 548 176, 636 192 L 636 220 C 548 236, 446 248, 336 252 Z" fill="url(#${idPrefix}-armor-d)" stroke="${p.seamStroke}" stroke-width="1.4" />
          <path d="M 392 163 L 392 249 M 446 167 L 446 245 M 498 172 L 498 240 M 548 178 L 548 234 M 594 184 L 594 228" stroke="${p.seamStroke}" stroke-width="1.2" />
          <circle class="cc-pulse" cx="420" cy="206" r="3" fill="${p.energyMain}" />
          <circle class="cc-pulse" cx="472" cy="206" r="3" fill="${p.energyMain}" />
          <circle class="cc-pulse" cx="524" cy="206" r="2.8" fill="${p.energyMain}" />
          <circle class="cc-pulse" cx="572" cy="206" r="2.5" fill="${p.energyMain}" />
        </g>

        <g class="cc-wing-far" style="transform-origin: 344px 170px;">
          ${leftWingFeathers.map((f) => renderFeather(f, p, idPrefix)).join("")}
          <path d="M 308 176 L 352 102 L 420 56 L 444 74 L 382 140 L 348 182 Z" fill="url(#${idPrefix}-armor-v)" stroke="${p.seamStroke}" stroke-width="1.6" />
          <path class="cc-pulse" d="M 338 154 L 408 82" stroke="${p.energyMain}" stroke-width="2.6" stroke-linecap="round" />
          <path d="M 384 82 L 420 56 L 434 68 L 402 94 Z" fill="${p.accentMain}" stroke="${p.seamStroke}" stroke-width="1" />
        </g>

        <g class="cc-wing-near" style="transform-origin: 344px 242px;">
          ${rightWingFeathers.map((f) => renderFeather(f, p, idPrefix)).join("")}
          <path d="M 308 236 L 352 310 L 420 356 L 444 338 L 382 272 L 348 230 Z" fill="url(#${idPrefix}-armor-v)" stroke="${p.seamStroke}" stroke-width="1.6" />
          <path class="cc-pulse" d="M 338 258 L 408 330" stroke="${p.energyMain}" stroke-width="2.6" stroke-linecap="round" />
          <path d="M 384 330 L 420 356 L 434 344 L 402 318 Z" fill="${p.accentMain}" stroke="${p.seamStroke}" stroke-width="1" />
        </g>

        <path d="M 88 206 C 88 148, 178 134, 316 150 L 352 174 L 352 238 L 316 262 C 178 278, 88 264, 88 206 Z" fill="url(#${idPrefix}-head-vol)" stroke="${p.seamStroke}" stroke-width="1.7" />
        <path d="M 106 206 L 348 206" stroke="${p.seamStroke}" stroke-width="1.3" />
        <path d="M 164 152 C 168 186, 168 226, 164 260" fill="none" stroke="${p.seamStroke}" stroke-width="1.2" />
        <path d="M 244 146 C 248 186, 248 226, 244 266" fill="none" stroke="${p.seamStroke}" stroke-width="1.2" />

        <circle cx="148" cy="176" r="7.5" fill="${p.frameMain}" stroke="${p.seamStroke}" stroke-width="1.2" />
        <circle class="cc-pulse" cx="148" cy="176" r="3.6" fill="${p.energyBright}" />
        <circle cx="148" cy="236" r="7.5" fill="${p.frameMain}" stroke="${p.seamStroke}" stroke-width="1.2" />
        <circle class="cc-pulse" cx="148" cy="236" r="3.6" fill="${p.energyBright}" />

        <circle cx="282" cy="206" r="14" fill="${p.frameMain}" stroke="${p.seamStroke}" stroke-width="1.5" />
        <circle cx="282" cy="206" r="9" fill="${p.frameDark}" stroke="${p.accentMain}" stroke-width="2.5" />
        <circle class="cc-pulse" cx="282" cy="206" r="4" fill="${p.energyBright}" />
      </g>
    </g>
  `;
}

function renderSerpentSide(
  p: DerivedPalette,
  idPrefix: string,
  stage: number
): string {
  const rawTailRibbons: FeatherSpec[] = [
    { x: 268, y: 205, length: 196, width: 28, angle: -154, curve: -24, orangeTip: true, greenTip: stage >= 3, animClass: "cc-c1" },
    { x: 274, y: 220, length: 215, width: 30, angle: -170, curve: -20, orangeTip: true, animClass: "cc-c2" },
    { x: 278, y: 234, length: 185, width: 26, angle: 168, curve: -16, orangeTip: true, greenTip: stage >= 4, animClass: "cc-c3" },
    { x: 266, y: 246, length: 165, width: 24, angle: 152, curve: -14, orangeTip: false, animClass: "cc-c4" },
  ];
  const tailRibbons = rawTailRibbons.slice(
    0,
    stage === 1 ? 2 : stage === 2 ? 3 : 4
  );

  const rawTailCables: CableSpec[] = [
    { d: "M 290 236 C 210 310, 128 332, 68 292", tipX: 68, tipY: 292, tipAngle: -145, variant: "armored", width: 3.8, tipColor: "orange", animClass: "cc-c1", originX: 290, originY: 236 },
    { d: "M 305 242 C 232 332, 148 358, 86 336", tipX: 86, tipY: 336, tipAngle: -165, variant: "ceramic", width: 3.4, tipColor: "green", animClass: "cc-c2", originX: 305, originY: 242 },
    { d: "M 322 246 C 254 342, 185 366, 122 362", tipX: 122, tipY: 362, tipAngle: 175, variant: "fiber", width: 2.3, tipColor: "green", animClass: "cc-c3", originX: 322, originY: 246 },
    { d: "M 272 200 C 202 146, 146 95, 92 78", tipX: 92, tipY: 78, tipAngle: -155, variant: "fiber", width: 2.1, tipColor: "orange", animClass: "cc-c4", originX: 272, originY: 200 },
  ];
  const tailCables = rawTailCables.slice(
    0,
    stage === 1 ? 1 : stage === 2 ? 2 : 4
  );

  const spineFeathers: FeatherSpec[] =
    stage >= 2
      ? [
          { x: 342, y: 188, length: 92, width: 22, angle: -145, curve: -12, orangeTip: true, animClass: "cc-f1" },
          { x: 378, y: 172, length: 108, width: 24, angle: -140, curve: -14, orangeTip: true, greenTip: stage >= 4, animClass: "cc-f2" },
          { x: 418, y: 154, length: 118, width: 26, angle: -136, curve: -14, orangeTip: true, animClass: "cc-f3" },
          { x: 458, y: 138, length: 114, width: 25, angle: -134, curve: -12, orangeTip: true, greenTip: stage >= 4, animClass: "cc-f4" },
          { x: 498, y: 126, length: 102, width: 23, angle: -138, curve: -10, orangeTip: true, animClass: "cc-f5" },
          { x: 540, y: 118, length: 88, width: 21, angle: -144, curve: -8, orangeTip: false, animClass: "cc-f6" },
          { x: 582, y: 116, length: 74, width: 19, angle: -150, curve: -6, orangeTip: true, animClass: "cc-f1" },
        ].slice(0, stage === 2 ? 3 : stage === 3 ? 5 : 7)
      : [];

  const farWingFeathers: FeatherSpec[] = [
    { x: 650, y: 245, length: 84, width: 22, angle: 112, curve: 10, far: true, orangeTip: false, animClass: "cc-f3" },
    { x: 640, y: 256, length: 96, width: 24, angle: 122, curve: 12, far: true, orangeFull: true, animClass: "cc-f4" },
    { x: 628, y: 268, length: 102, width: 24, angle: 132, curve: 12, far: true, orangeTip: true, animClass: "cc-f5" },
    { x: 616, y: 278, length: 90, width: 22, angle: 142, curve: 10, far: true, orangeTip: false, animClass: "cc-f6" },
  ].slice(0, stage <= 2 ? 2 : 4);

  const nearWingFeathers: FeatherSpec[] = [
    { x: 564, y: 196, length: 108, width: 24, angle: 152, curve: 10, orangeTip: false, animClass: "cc-f1" },
    { x: 552, y: 210, length: 128, width: 26, angle: 144, curve: 12, orangeFull: true, animClass: "cc-f2" },
    { x: 540, y: 224, length: 146, width: 28, angle: 136, curve: 12, orangeTip: true, greenTip: stage >= 4, animClass: "cc-f3" },
    { x: 526, y: 238, length: 158, width: 28, angle: 128, curve: 12, orangeFull: true, animClass: "cc-f4" },
    { x: 512, y: 252, length: 146, width: 26, angle: 120, curve: 10, orangeTip: true, animClass: "cc-f5" },
    { x: 498, y: 266, length: 124, width: 24, angle: 112, curve: 8, orangeTip: true, greenTip: stage >= 5, animClass: "cc-f6" },
  ].slice(0, stage === 1 ? 3 : stage === 2 ? 4 : 6);

  return `
    <g transform="${getStageScaleTransform(stage)}">
      <g class="cc-float">
        <g class="cc-tail-swim" style="transform-origin: 480px 180px;">
          <g>${tailCables.map((c) => renderCable(c, p)).join("")}</g>
          <g>${tailRibbons.map((f) => renderFeather(f, p, idPrefix)).join("")}</g>
        </g>

        <g class="cc-wing-far" style="transform-origin: 672px 214px;">
          <path d="M 672 208 L 656 266 L 622 300 L 636 308 L 682 232 Z" fill="${p.armorShadow}" stroke="${p.seamStroke}" stroke-width="1.3" />
          ${farWingFeathers.map((f) => renderFeather(f, p, idPrefix)).join("")}
        </g>

        <path d="M 272 222 C 340 202, 415 152, 520 144 C 598 138, 665 152, 718 164 L 712 198 C 655 206, 595 208, 515 206 C 425 204, 345 236, 274 238 Z" fill="url(#${idPrefix}-frame-v)" stroke="${p.seamStroke}" stroke-width="1.5" />
        <path class="cc-pulse" d="M 300 222 C 378 192, 462 162, 565 164 C 625 165, 668 174, 704 180" fill="none" stroke="${p.energyMain}" stroke-width="2.2" />

        <g>${spineFeathers.map((f) => renderFeather(f, p, idPrefix)).join("")}</g>

        <path d="M 278 214 C 344 182, 434 128, 558 118 C 624 114, 676 126, 714 146 L 704 198 C 652 204, 592 206, 514 202 C 424 198, 344 228, 282 232 Z" fill="url(#${idPrefix}-armor-d)" stroke="${p.seamStroke}" stroke-width="1.5" stroke-linejoin="round" />
        <path d="M 342 184 C 344 198, 346 212, 348 224 M 396 160 C 398 178, 400 196, 404 210 M 456 138 C 458 162, 462 184, 466 202 M 520 124 C 522 152, 526 178, 530 202 M 586 120 C 588 148, 592 174, 596 200 M 648 124 C 650 150, 654 174, 656 198" fill="none" stroke="${p.seamStroke}" stroke-width="1.2" />
        <path d="M 312 204 C 388 170, 474 134, 578 128 C 628 126, 668 134, 698 146" fill="none" stroke="${p.armorHighlight}" stroke-width="3" stroke-linecap="round" opacity="0.75" />
        ${stage >= 3 ? `<rect x="480" y="164" width="16" height="6" rx="2" fill="${p.accentMain}" stroke="${p.seamStroke}" stroke-width="0.8" />` : ""}
        <circle class="cc-pulse" cx="428" cy="176" r="2.8" fill="${p.energyMain}" />
        <circle class="cc-pulse" cx="556" cy="164" r="3" fill="${p.energyMain}" />

        <g>
          <path d="M 678 148 C 702 144, 722 146, 738 152" fill="none" stroke="${p.frameLight}" stroke-width="6" stroke-linecap="round" />
          <path d="M 678 178 C 704 182, 726 184, 742 180" fill="none" stroke="${p.frameDark}" stroke-width="5" stroke-linecap="round" />

          ${stage >= 2 ? renderFeather({ x: 724, y: 128, length: 68, width: 18, angle: -152, curve: -6, orangeTip: true, animClass: "cc-f2" }, p, idPrefix) : ""}
          ${stage >= 4 ? renderFeather({ x: 738, y: 122, length: 58, width: 17, angle: -144, curve: -5, orangeTip: false, greenTip: true, animClass: "cc-f3" }, p, idPrefix) : ""}
          ${stage === 5 ? renderFeather({ x: 752, y: 116, length: 52, width: 16, angle: -136, curve: -4, orangeFull: true, greenTip: true, animClass: "cc-f1" }, p, idPrefix) : ""}

          <path d="M 738 172 L 828 166 L 838 178 C 810 198, 765 204, 732 192 Z" fill="url(#${idPrefix}-head-vol)" stroke="${p.seamStroke}" stroke-width="1.5" stroke-linejoin="round" />
          <path d="M 762 182 L 814 178" stroke="${p.seamStroke}" stroke-width="1.1" />

          <path d="M 716 144 C 736 106, 804 106, 846 146 L 854 162 C 824 170, 774 174, 724 168 Z" fill="url(#${idPrefix}-head-vol)" stroke="${p.seamStroke}" stroke-width="1.65" stroke-linejoin="round" />
          <path d="M 744 126 C 778 118, 814 126, 840 144" fill="none" stroke="${p.armorHighlight}" stroke-width="3" stroke-linecap="round" opacity="0.8" />
          <path d="M 762 118 L 758 168 M 802 122 L 798 166" stroke="${p.seamStroke}" stroke-width="1.1" />

          <path d="M 796 148 L 844 146 L 848 156 L 802 158 Z" fill="${p.frameDark}" stroke="${p.seamStroke}" stroke-width="1.1" />
          <circle cx="826" cy="152" r="11" fill="url(#${idPrefix}-energy-glow)" class="cc-pulse" />
          <circle cx="826" cy="152" r="4.8" fill="${p.energyMain}" />
          <circle cx="825" cy="151" r="1.8" fill="${p.energyBright}" />
          <rect x="770" y="142" width="16" height="5" rx="1.5" fill="${p.accentMain}" stroke="${p.seamStroke}" stroke-width="0.8" />

          <g transform="translate(734, 162)">
            <circle cx="0" cy="0" r="22" fill="${p.frameMain}" stroke="${p.seamStroke}" stroke-width="1.5" />
            <circle cx="0" cy="0" r="15" fill="${p.frameDark}" stroke="${p.accentMain}" stroke-width="2.8" />
            <circle cx="0" cy="0" r="7" fill="${p.armorMid}" stroke="${p.seamStroke}" stroke-width="1" />
            <circle class="cc-pulse" cx="0" cy="0" r="3" fill="${p.energyMain}" />
          </g>
        </g>

        <g class="cc-wing-near" style="transform-origin: 598px 176px;">
          ${nearWingFeathers.map((f) => renderFeather(f, p, idPrefix)).join("")}
          <circle cx="598" cy="176" r="22" fill="${p.frameMain}" stroke="${p.seamStroke}" stroke-width="1.5" />
          <circle cx="598" cy="176" r="14" fill="${p.frameDark}" stroke="${p.accentMain}" stroke-width="2.4" />
          <circle class="cc-pulse" cx="598" cy="176" r="5" fill="${p.energyMain}" />
          <path d="M 596 178 L 542 238 L 494 294 L 512 308 L 568 248 L 614 194 Z" fill="url(#${idPrefix}-armor-v)" stroke="${p.seamStroke}" stroke-width="1.5" stroke-linejoin="round" />
          <path class="cc-pulse" d="M 556 226 L 512 276" stroke="${p.energyMain}" stroke-width="3" stroke-linecap="round" />
          <rect x="558" y="210" width="16" height="8" rx="2" transform="rotate(-46 566 214)" fill="${p.accentMain}" stroke="${p.seamStroke}" stroke-width="1" />
        </g>
      </g>
    </g>
  `;
}

function renderSerpentDive(
  p: DerivedPalette,
  idPrefix: string,
  stage: number
): string {
  return `
    <g transform="translate(460, 198) rotate(14) scale(0.88) translate(-460, -210)">
      ${renderSerpentSide(p, idPrefix, stage)}
    </g>
  `;
}

function renderSerpentTop(
  p: DerivedPalette,
  idPrefix: string,
  stage: number
): string {
  return `
    <g transform="${getStageScaleTransform(stage)}">
      <g class="cc-float">
        ${renderFeather({ x: 256, y: 196, length: 178, width: 26, angle: -162, curve: -18, orangeTip: true, greenTip: stage >= 4, animClass: "cc-c1" }, p, idPrefix)}
        ${renderFeather({ x: 256, y: 216, length: 178, width: 26, angle: 162, curve: 18, orangeTip: true, greenTip: stage >= 4, animClass: "cc-c2" }, p, idPrefix)}
        ${renderCable({ d: "M 264 206 C 190 194, 130 218, 68 206", tipX: 68, tipY: 206, tipAngle: 180, variant: "ceramic", width: 3.4, tipColor: "green", animClass: "cc-c3", originX: 264, originY: 206 }, p)}

        <g class="cc-wing-far" style="transform-origin: 580px 180px;">
          ${[0, 1, 2, 3].slice(0, stage <= 2 ? 2 : 4).map((i) => renderFeather({ x: 560 - i * 16, y: 170 - i * 16, length: 118 - i * 10, width: 24, angle: -145 + i * 6, curve: -10, orangeFull: i === 1, orangeTip: true, animClass: `cc-f${i + 1}` }, p, idPrefix)).join("")}
          <path d="M 596 184 L 542 108 L 474 62 L 456 80 L 520 132 L 566 192 Z" fill="url(#${idPrefix}-armor-v)" stroke="${p.seamStroke}" stroke-width="1.5" />
        </g>

        <g class="cc-wing-near" style="transform-origin: 580px 232px;">
          ${[0, 1, 2, 3].slice(0, stage <= 2 ? 2 : 4).map((i) => renderFeather({ x: 560 - i * 16, y: 242 + i * 16, length: 118 - i * 10, width: 24, angle: 145 - i * 6, curve: 10, orangeFull: i === 1, orangeTip: true, animClass: `cc-f${i + 2}` }, p, idPrefix)).join("")}
          <path d="M 596 228 L 542 304 L 474 350 L 456 332 L 520 280 L 566 220 Z" fill="url(#${idPrefix}-armor-v)" stroke="${p.seamStroke}" stroke-width="1.5" />
        </g>

        <path d="M 262 184 C 340 144, 440 226, 536 184 C 608 156, 668 182, 720 184 L 720 228 C 668 226, 608 200, 536 228 C 440 270, 340 188, 262 228 Z" fill="url(#${idPrefix}-armor-d)" stroke="${p.seamStroke}" stroke-width="1.5" />
        ${[0, 1, 2, 3, 4, 5, 6].map((i) => {
          const x = 316 + i * 56;
          const y = 206 + Math.sin(i * 0.9) * 16;
          return `<circle cx="${x}" cy="${y}" r="3.2" fill="${p.energyMain}" class="cc-pulse" />`;
        }).join("")}

        <path d="M 702 182 C 744 166, 816 174, 854 206 C 816 238, 744 246, 702 230 Z" fill="url(#${idPrefix}-head-vol)" stroke="${p.seamStroke}" stroke-width="1.65" />
        <path d="M 720 206 L 844 206" stroke="${p.seamStroke}" stroke-width="1.2" />
        <circle cx="808" cy="192" r="5" fill="${p.energyMain}" class="cc-pulse" />
        <circle cx="808" cy="220" r="5" fill="${p.energyMain}" class="cc-pulse" />
      </g>
    </g>
  `;
}

function renderMantaSide(
  p: DerivedPalette,
  idPrefix: string,
  stage: number
): string {
  const rawTailTendrils: CableSpec[] = [
    { d: "M 516 208 C 608 182, 702 152, 822 178", tipX: 822, tipY: 178, tipAngle: 12, variant: "ceramic", width: 3.4, tipColor: "orange", animClass: "cc-c1", originX: 516, originY: 208 },
    { d: "M 508 228 C 618 242, 718 232, 856 202", tipX: 856, tipY: 202, tipAngle: -10, variant: "armored", width: 4.0, tipColor: "green", animClass: "cc-c2", originX: 508, originY: 228 },
    { d: "M 496 244 C 594 278, 694 316, 816 286", tipX: 816, tipY: 286, tipAngle: -14, variant: "fiber", width: 2.6, tipColor: "green", animClass: "cc-c3", originX: 496, originY: 244 },
    { d: "M 482 252 C 562 308, 658 346, 772 336", tipX: 772, tipY: 336, tipAngle: -4, variant: "ceramic", width: 3.0, tipColor: "orange", animClass: "cc-c4", originX: 482, originY: 252 },
  ];
  const tailTendrils = rawTailTendrils.slice(
    0,
    stage === 1 ? 2 : stage === 2 ? 3 : 4
  );

  const farWingFeathers: FeatherSpec[] = [
    { x: 422, y: 128, length: 94, width: 22, angle: -24, curve: -6, far: true, orangeTip: true, animClass: "cc-f1" },
    { x: 454, y: 108, length: 106, width: 24, angle: -18, curve: -8, far: true, orangeTip: true, greenTip: stage >= 4, animClass: "cc-f2" },
    { x: 486, y: 92, length: 112, width: 24, angle: -12, curve: -8, far: true, orangeTip: true, animClass: "cc-f3" },
    { x: 518, y: 78, length: 102, width: 22, angle: -6, curve: -6, far: true, orangeTip: false, animClass: "cc-f4" },
    { x: 550, y: 68, length: 88, width: 20, angle: 0, curve: -4, far: true, orangeTip: true, animClass: "cc-f5" },
  ].slice(0, stage <= 2 ? 3 : 5);

  const nearWingFeathers: FeatherSpec[] = [
    { x: 356, y: 268, length: 108, width: 24, angle: 34, curve: 10, orangeTip: true, animClass: "cc-f1" },
    { x: 382, y: 284, length: 124, width: 26, angle: 28, curve: 12, orangeTip: true, greenTip: stage >= 3, animClass: "cc-f2" },
    { x: 410, y: 300, length: 138, width: 28, angle: 22, curve: 12, orangeTip: true, animClass: "cc-f3" },
    { x: 440, y: 316, length: 146, width: 28, angle: 16, curve: 12, orangeTip: true, greenTip: stage >= 4, animClass: "cc-f4" },
    { x: 470, y: 332, length: 136, width: 26, angle: 11, curve: 10, orangeTip: true, animClass: "cc-f5" },
    { x: 500, y: 346, length: 116, width: 24, angle: 7, curve: 8, orangeTip: true, animClass: "cc-f6" },
    { x: 530, y: 358, length: 92, width: 20, angle: 3, curve: 6, orangeTip: false, animClass: "cc-f1" },
  ].slice(0, stage === 1 ? 3 : stage === 2 ? 5 : 7);

  return `
    <g transform="${getStageScaleTransform(stage)}">
      <g class="cc-float">
        <g>${tailTendrils.map((c) => renderCable(c, p)).join("")}</g>

        <g class="cc-wing-far" style="transform-origin: 336px 176px;">
          ${farWingFeathers.map((f) => renderFeather(f, p, idPrefix)).join("")}
          <path d="M 288 182 C 354 118, 456 66, 588 46 L 548 86 C 468 112, 396 150, 336 196 Z" fill="${p.armorShadow}" stroke="${p.seamStroke}" stroke-width="1.5" stroke-linejoin="round" />
          <path d="M 326 164 L 548 64" stroke="${p.seamStroke}" stroke-width="1.1" opacity="0.7" />
          <path d="M 526 62 L 588 46 L 564 74 L 516 84 Z" fill="${p.accentDeep}" stroke="${p.seamStroke}" stroke-width="1" />
        </g>

        <g>
          <path d="M 192 214 C 266 254, 380 264, 512 238 L 496 202 C 386 194, 276 192, 192 214 Z" fill="url(#${idPrefix}-frame-v)" stroke="${p.seamStroke}" stroke-width="1.5" />
          <g class="cc-pulse">
            <path d="M 272 224 L 288 240 M 292 226 L 308 242 M 312 228 L 328 244 M 332 228 L 348 244" stroke="${p.energyMain}" stroke-width="2.4" stroke-linecap="round" />
          </g>

          <path d="M 204 186 C 166 170, 128 164, 102 172 C 128 186, 162 198, 198 202 Z" fill="${p.armorMid}" stroke="${p.seamStroke}" stroke-width="1.3" />
          <path d="M 102 172 L 130 172 L 124 180 Z" fill="${p.accentDeep}" />

          <path d="M 178 202 C 216 154, 326 150, 446 186 L 522 214 L 468 238 C 362 246, 250 232, 178 202 Z" fill="url(#${idPrefix}-head-vol)" stroke="${p.seamStroke}" stroke-width="1.6" stroke-linejoin="round" />
          <path d="M 232 176 L 268 224 M 302 166 L 336 234 M 378 172 L 404 238" stroke="${p.seamStroke}" stroke-width="1.15" opacity="0.8" />
          <path d="M 218 190 C 292 178, 376 192, 466 218" fill="none" stroke="${p.armorHighlight}" stroke-width="3" stroke-linecap="round" opacity="0.75" />

          <g transform="translate(342, 198)">
            <polygon points="0,-12 24,0 0,12 -24,0" fill="${p.frameMain}" stroke="${p.seamStroke}" stroke-width="1.2" />
            <polygon class="cc-pulse" points="0,-7 15,0 0,7 -15,0" fill="${p.energyMain}" />
            <circle cx="0" cy="0" r="14" fill="url(#${idPrefix}-energy-glow)" class="cc-pulse" />
          </g>

          <path d="M 216 210 C 168 214, 118 208, 86 226 C 122 238, 172 238, 224 228 Z" fill="url(#${idPrefix}-armor-v)" stroke="${p.seamStroke}" stroke-width="1.4" stroke-linejoin="round" />
          <path d="M 86 226 L 118 220 L 114 232 Z" fill="${p.accentMain}" stroke="${p.seamStroke}" stroke-width="0.9" />
          <path class="cc-pulse" d="M 124 224 L 196 220" stroke="${p.energyMain}" stroke-width="2" stroke-linecap="round" />

          <g>
            <path d="M 196 196 L 236 194 L 228 204 L 192 204 Z" fill="${p.frameDark}" stroke="${p.seamStroke}" stroke-width="1.1" />
            <circle cx="212" cy="199" r="9" fill="url(#${idPrefix}-energy-glow)" class="cc-pulse" />
            <circle cx="212" cy="199" r="3.6" fill="${p.energyBright}" />
          </g>
        </g>

        <g class="cc-wing-near" style="transform-origin: 318px 226px;">
          ${nearWingFeathers.map((f) => renderFeather(f, p, idPrefix)).join("")}
          <path d="M 278 224 C 362 232, 476 286, 616 378 L 538 366 C 436 334, 338 286, 266 240 Z" fill="url(#${idPrefix}-armor-v)" stroke="${p.seamStroke}" stroke-width="1.6" stroke-linejoin="round" />
          <path d="M 328 242 L 368 294 M 398 268 L 438 326 M 468 302 L 504 352" stroke="${p.seamStroke}" stroke-width="1.15" opacity="0.8" />
          <path class="cc-pulse" d="M 304 238 C 392 266, 480 310, 566 360" fill="none" stroke="${p.energyMain}" stroke-width="2.2" />
          <circle cx="318" cy="238" r="16" fill="${p.frameMain}" stroke="${p.seamStroke}" stroke-width="1.3" />
          <circle cx="318" cy="238" r="9" fill="${p.frameDark}" stroke="${p.accentMain}" stroke-width="2.4" />
          <circle class="cc-pulse" cx="318" cy="238" r="3.5" fill="${p.energyBright}" />
          <path d="M 548 342 L 616 378 L 574 374 L 532 354 Z" fill="url(#${idPrefix}-accent-v)" stroke="${p.seamStroke}" stroke-width="1.1" />
        </g>
      </g>
    </g>
  `;
}

function renderMantaDive(
  p: DerivedPalette,
  idPrefix: string,
  stage: number
): string {
  return `
    <g transform="translate(460, 198) rotate(-14) scale(0.88) translate(-460, -210)">
      ${renderMantaSide(p, idPrefix, stage)}
    </g>
  `;
}

function renderMantaTop(
  p: DerivedPalette,
  idPrefix: string,
  stage: number
): string {
  return `
    <g transform="${getStageScaleTransform(stage)}">
      <g class="cc-float">
        ${renderCable({ d: "M 510 198 C 620 184, 730 162, 856 176", tipX: 856, tipY: 176, tipAngle: 8, variant: "ceramic", width: 3.2, tipColor: "orange", animClass: "cc-c1", originX: 510, originY: 198 }, p)}
        ${renderCable({ d: "M 510 214 C 620 228, 730 250, 856 236", tipX: 856, tipY: 236, tipAngle: -8, variant: "armored", width: 3.4, tipColor: "green", animClass: "cc-c2", originX: 510, originY: 214 }, p)}

        <g class="cc-wing-far" style="transform-origin: 310px 180px;">
          ${[0, 1, 2, 3].slice(0, stage <= 2 ? 2 : 4).map((i) => renderFeather({ x: 332 + i * 36, y: 152 - i * 24, length: 102, width: 22, angle: -24 + i * 5, curve: -8, orangeTip: true, greenTip: i === 2, animClass: `cc-f${i + 1}` }, p, idPrefix)).join("")}
          <path d="M 220 184 C 280 120, 390 66, 512 44 L 460 126 L 348 184 Z" fill="url(#${idPrefix}-armor-v)" stroke="${p.seamStroke}" stroke-width="1.6" />
          <path d="M 456 62 L 512 44 L 494 74 L 444 86 Z" fill="${p.accentMain}" stroke="${p.seamStroke}" stroke-width="1.1" />
        </g>

        <g class="cc-wing-near" style="transform-origin: 310px 232px;">
          ${[0, 1, 2, 3].slice(0, stage <= 2 ? 2 : 4).map((i) => renderFeather({ x: 332 + i * 36, y: 260 + i * 24, length: 102, width: 22, angle: 24 - i * 5, curve: 8, orangeTip: true, greenTip: i === 2, animClass: `cc-f${i + 2}` }, p, idPrefix)).join("")}
          <path d="M 220 228 C 280 292, 390 346, 512 368 L 460 286 L 348 228 Z" fill="url(#${idPrefix}-armor-v)" stroke="${p.seamStroke}" stroke-width="1.6" />
          <path d="M 456 350 L 512 368 L 494 338 L 444 326 Z" fill="${p.accentMain}" stroke="${p.seamStroke}" stroke-width="1.1" />
        </g>

        <path d="M 140 206 L 236 160 L 512 192 L 512 220 L 236 252 Z" fill="url(#${idPrefix}-head-vol)" stroke="${p.seamStroke}" stroke-width="1.6" />
        <path d="M 184 182 L 96 168 L 128 194 L 194 196 Z" fill="url(#${idPrefix}-armor-v)" stroke="${p.seamStroke}" stroke-width="1.3" />
        <path d="M 184 230 L 96 244 L 128 218 L 194 216 Z" fill="url(#${idPrefix}-armor-v)" stroke="${p.seamStroke}" stroke-width="1.3" />
        <polygon class="cc-pulse" points="296,194 330,206 296,218 262,206" fill="${p.energyMain}" stroke="${p.seamStroke}" stroke-width="1.2" />
      </g>
    </g>
  `;
}

function renderHudBarWithPrefix(
  config: CreatureConfig,
  p: DerivedPalette,
  idPrefix: string
): string {
  if (!config.showHud) return "";
  const label = escapeXml(formatHudLabel(config));
  const { stage } = getEvolutionStage(config.commits);
  const meta = getCreatureMeta(config.creature);
  const speedText = `${config.animationSpeed.toFixed(1)}X`;
  const viewText = config.view.toUpperCase();

  const stageCodes = [
    { num: 1, code: "1.PRTO" },
    { num: 2, code: "2.RCON" },
    { num: 3, code: "3.ARMR" },
    { num: 4, code: "4.APEX" },
    { num: 5, code: "5.ASCD" },
  ];

  const langChips = (config.languages ?? []).slice(0, 3);
  const langMarkup = langChips
    .map((lang, idx) => {
      const x = 62 + idx * 124;
      const safeName = escapeXml(lang.name.toUpperCase().slice(0, 11));
      const safeColor = escapeXml(lang.color);
      return `
        <rect x="${x}" y="432.5" width="7.5" height="7.5" rx="1.5" fill="${safeColor}" />
        <text x="${x + 12}" y="440" fill="#8B949E" font-family="ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace" font-size="10" font-weight="600">${safeName}</text>
      `;
    })
    .join("");

  const stageRail = stageCodes
    .map((item, idx) => {
      const x = 576 + idx * 62;
      const isActive = item.num === stage;
      const isUnlocked = item.num <= stage;
      return `<text id="${idPrefix}-stage-pip-${item.num}" x="${x}" y="440" fill="${isActive ? p.energyBright : isUnlocked ? "#C9D1D9" : "#484F58"}" font-family="ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace" font-size="10" font-weight="${isActive ? "700" : "500"}">${item.code}</text>`;
    })
    .join("");

  return `
    <g>
      <rect x="20" y="406" width="880" height="46" rx="8" fill="url(#${idPrefix}-hud-bg)" stroke="#30363D" stroke-width="1.2" />
      <path d="M 24 406 L 20 410 L 20 448 L 24 452 L 28 452 L 28 406 Z" fill="${p.accentMain}" />
      <circle class="cc-hud-blink" cx="44" cy="422" r="4.2" fill="${p.energyMain}" />
      <text id="${idPrefix}-hud-label" x="58" y="426" fill="#E6EDF3" font-family="ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace" font-size="11.5" font-weight="700" letter-spacing="0.6">${label}</text>
      <text x="884" y="426" fill="#8B949E" font-family="ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace" font-size="10.5" font-weight="600" text-anchor="end">${escapeXml(meta.designation)} // ${viewText} // ${speedText}</text>
      ${langMarkup}
      ${stageRail}
    </g>
  `;
}

function renderJellyfish(
  p: DerivedPalette,
  idPrefix: string,
  view: CameraView,
  stage: number,
  animationSpeed: number
): string {
  const safeSpeed = Math.max(0.25, Math.min(3, animationSpeed || 1));
  const rippleDuration = (18 / safeSpeed).toFixed(1);

  const viewTransform =
    view === "dive"
      ? "translate(460, 206) rotate(-10) scale(0.95) translate(-412.5, -232.5)"
      : view === "top"
        ? "translate(460, 202) scale(1.06, 0.96) translate(-412.5, -232.5)"
        : "translate(47.5, -14)";

  const stageNodes =
    stage >= 2
      ? `
        <g class="cc-pulse" opacity="0.8">
          <circle cx="235" cy="112" r="3" fill="${p.energyBright}" />
          <circle cx="290" cy="310" r="2.5" fill="${p.energyMain}" />
          <circle cx="670" cy="108" r="3" fill="${p.accentMain}" />
          <circle cx="515" cy="336" r="2.2" fill="${p.energyBright}" />
        </g>
      `
      : "";

  const stageArcs =
    stage >= 3
      ? `
        <g opacity="${stage >= 4 ? "0.7" : "0.45"}">
          <path d="M 640 120 A 118 118 0 0 1 655 312" fill="none" stroke="${p.accentMain}" stroke-width="1.6" stroke-dasharray="6 6" />
          <circle cx="640" cy="120" r="3.2" fill="${p.accentMain}" />
          <circle cx="655" cy="312" r="3.2" fill="${p.energyBright}" />
        </g>
      `
      : "";

  const stageAscended =
    stage >= 5
      ? `
        <g class="cc-pulse" opacity="0.55">
          <circle cx="548" cy="215" r="142" fill="none" stroke="${p.energyMain}" stroke-width="1.2" stroke-dasharray="3 9" />
        </g>
      `
      : "";

  return `
    <g>
      <defs>
        <filter id="${idPrefix}-gentle-current" x="-4%" y="-5%" width="108%" height="110%" color-interpolation-filters="sRGB">
          <feTurbulence type="fractalNoise" baseFrequency="0.008 0.026" numOctaves="1" seed="7" result="current">
            <animate attributeName="baseFrequency" values="0.008 0.026;0.010 0.022;0.008 0.026" dur="${rippleDuration}s" repeatCount="indefinite" />
          </feTurbulence>
          <feDisplacementMap in="SourceGraphic" in2="current" scale="2.2" xChannelSelector="R" yChannelSelector="G">
            <animate attributeName="scale" values="1.8;3.8;1.8" dur="${rippleDuration}s" repeatCount="indefinite" />
          </feDisplacementMap>
        </filter>
      </defs>
      <g class="cc-body-float" style="transform-origin: 460px 210px;">
        ${stageNodes}
        ${stageArcs}
        ${stageAscended}
        <g transform="${viewTransform}">
          <image x="0" y="0" width="825" height="465" href="${JELLYFISH_BELL_PNG_URI}" xlink:href="${JELLYFISH_BELL_PNG_URI}" />
          <image x="0" y="0" width="825" height="465" href="${JELLYFISH_TENTACLES_PNG_URI}" xlink:href="${JELLYFISH_TENTACLES_PNG_URI}" filter="url(#${idPrefix}-gentle-current)" />
        </g>
      </g>
    </g>
  `;
}

export function renderCreatureGeometryOnly(
  config: CreatureConfig,
  idPrefix = "cc"
): string {
  const p = derivePalette(config);
  const { stage } = getEvolutionStage(config.commits);

  if (config.creature === "tulkun") {
    if (config.view === "dive") return renderTulkunDive(p, idPrefix, stage);
    if (config.view === "top") return renderTulkunTop(p, idPrefix, stage);
    return renderTulkunSide(p, idPrefix, stage);
  }

  if (config.creature === "serpent") {
    if (config.view === "dive") return renderSerpentDive(p, idPrefix, stage);
    if (config.view === "top") return renderSerpentTop(p, idPrefix, stage);
    return renderSerpentSide(p, idPrefix, stage);
  }

  if (config.creature === "jellyfish") {
    return renderJellyfish(
      p,
      idPrefix,
      config.view,
      stage,
      config.animationSpeed
    );
  }

  if (config.view === "dive") return renderMantaDive(p, idPrefix, stage);
  if (config.view === "top") return renderMantaTop(p, idPrefix, stage);
  return renderMantaSide(p, idPrefix, stage);
}

export function buildCreatureInnerSvg(
  config: CreatureConfig,
  idPrefix = "cc"
): string {
  const p = derivePalette(config);
  const styles = buildAnimationStyles(config.animationSpeed);
  const defs = buildDefs(p, idPrefix);

  const bgRect =
    p.background !== "transparent"
      ? `<rect x="0" y="0" width="${SVG_WIDTH}" height="${SVG_HEIGHT}" fill="${escapeXml(p.background)}" />`
      : "";

  const creatureBody = renderCreatureGeometryOnly(config, idPrefix);
  const yOffset = config.showHud ? -8 : 12;
  const hud = renderHudBarWithPrefix(config, p, idPrefix);

  return `
    <style>${styles}</style>
    ${defs}
    ${bgRect}
    <g transform="translate(0, ${yOffset})">
      ${creatureBody}
    </g>
    ${hud}
  `.trim();
}

export function generateCreatureSvgDocument(config: CreatureConfig): string {
  const meta = getCreatureMeta(config.creature);
  const inner = buildCreatureInnerSvg(config, "cc");
  const ariaLabel = escapeXml(`${meta.name} - ${meta.subtitle}`);

  return [
    `<?xml version="1.0" encoding="UTF-8"?>`,
    `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 ${SVG_WIDTH} ${SVG_HEIGHT}" width="${SVG_WIDTH}" height="${SVG_HEIGHT}" role="img" aria-label="${ariaLabel}">`,
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
  const defs = buildDefs(p, idPrefix);
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
    <rect x="0" y="0" width="1280" height="640" fill="#070B12" />
    <g stroke="#162032" stroke-width="1" opacity="0.55">
      <line x1="0" y1="160" x2="1280" y2="160" />
      <line x1="0" y1="320" x2="1280" y2="320" />
      <line x1="0" y1="480" x2="1280" y2="480" />
      <line x1="320" y1="0" x2="320" y2="640" />
      <line x1="640" y1="0" x2="640" y2="640" />
      <line x1="960" y1="0" x2="960" y2="640" />
    </g>

    <rect x="20" y="20" width="1240" height="600" rx="14" fill="none" stroke="#1F6FEB" stroke-opacity="0.7" stroke-width="2" />
    <rect x="26" y="26" width="1228" height="588" rx="10" fill="none" stroke="#30363D" stroke-width="1" />

    <rect x="28" y="28" width="1224" height="48" rx="8" fill="#0D1117" fill-opacity="0.92" />
    <line x1="28" y1="76" x2="1252" y2="76" stroke="#21262D" stroke-width="1.5" />
    <circle class="cc-hud-blink" cx="50" cy="52" r="5" fill="${p.energyMain}" />
    <text x="66" y="57" fill="#E6EDF3" font-family="ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace" font-size="15" font-weight="700" letter-spacing="1.2">DYNAMIC-README-CREATURE // @${safeUser}</text>
    <text x="1232" y="57" fill="${p.accentMain}" font-family="ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace" font-size="15" font-weight="700" text-anchor="end">STAGE ${stageInfo.stage}: ${titleText}</text>

    <g transform="translate(150, 72) scale(1.06)">
      ${geometry}
    </g>

    <rect x="28" y="514" width="1224" height="98" rx="8" fill="#0D1117" fill-opacity="0.92" />
    <line x1="28" y1="514" x2="1252" y2="514" stroke="#21262D" stroke-width="1.5" />
    <rect x="44" y="534" width="10" height="10" rx="2" fill="${p.energyMain}" />
    <text x="62" y="544" fill="#E6EDF3" font-family="ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace" font-size="15" font-weight="700">STAGE ${stageInfo.stage}: ${titleText}</text>
    <text x="44" y="570" fill="#8B949E" font-family="ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace" font-size="14" font-weight="600">CONTRIBUTIONS (${windowLabel}): <tspan fill="#FFFFFF">${formattedCommits}</tspan>  •  VIEW: ${config.view.toUpperCase()}</text>
    ${langMarkup}

    <text x="768" y="556" fill="#8B949E" font-family="ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace" font-size="12" font-weight="600" letter-spacing="0.8">EVOLUTION PROGRESSION (0 → 2,500+)</text>
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
    `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 ${SHARE_CARD_WIDTH} ${SHARE_CARD_HEIGHT}" width="${SHARE_CARD_WIDTH}" height="${SHARE_CARD_HEIGHT}" role="img" aria-label="${title}">`,
    `  <title>${title}</title>`,
    `  ${inner}`,
    `</svg>`,
  ].join("\n");
}
