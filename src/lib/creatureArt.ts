import {
  derivePalette,
  formatHudLabel,
  getCreatureMeta,
  getEvolutionStage,
} from "@/lib/themes";
import type { CreatureConfig, DerivedPalette } from "@/types/creature";

export const SVG_WIDTH = 920;
export const SVG_HEIGHT = 460;

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
    curve = 14,
    orangeTip = true,
    orangeFull = false,
    greenTip = false,
    far = false,
    animClass = "cc-f1",
  } = spec;

  const fillMain = orangeFull
    ? p.accentMain
    : far
      ? p.armorShadow
      : `url(#${idPrefix}-armor-v)`;
  const fillVane = orangeFull
    ? p.accentDeep
    : far
      ? p.armorFar
      : p.armorMid;
  const strokeCol = p.seamStroke;
  const tipX = length;
  const tipY = curve;

  const upperPath = `M 0 ${-width * 0.35} Q ${length * 0.45} ${-width * 0.68 + curve * 0.2}, ${tipX} ${tipY} Q ${length * 0.52} ${width * 0.1 + curve * 0.45}, 0 ${width * 0.12} Z`;
  const lowerPath = `M 0 ${width * 0.12} Q ${length * 0.52} ${width * 0.1 + curve * 0.45}, ${tipX} ${tipY} Q ${length * 0.42} ${width * 0.55 + curve * 0.5}, 0 ${width * 0.36} Z`;

  const tipStart = 0.78;
  const tx1 = length * tipStart;
  const ty1 = curve * 0.58 - width * 0.16;
  const tx2 = length * (tipStart + 0.04);
  const ty2 = curve * 0.7 + width * 0.18;
  const orangeCap =
    orangeTip && !orangeFull
      ? `<path d="M ${tx1.toFixed(1)} ${ty1.toFixed(1)} Q ${length * 0.9} ${curve * 0.8 - width * 0.08}, ${tipX} ${tipY} Q ${length * 0.89} ${curve * 0.85 + width * 0.12}, ${tx2.toFixed(1)} ${ty2.toFixed(1)} Z" fill="${far ? p.accentDeep : p.accentMain}" stroke="${strokeCol}" stroke-width="0.9" />`
      : "";

  const greenFilament = greenTip
    ? `<path class="cc-pulse" d="M ${(length * 0.88).toFixed(1)} ${(curve * 0.84).toFixed(1)} L ${(length + 13).toFixed(1)} ${(curve + 2.5).toFixed(1)}" stroke="${p.energyMain}" stroke-width="2" stroke-linecap="round" /><circle class="cc-pulse" cx="${(length + 13).toFixed(1)}" cy="${(curve + 2.5).toFixed(1)}" r="2.1" fill="${p.energyBright}" />`
    : "";

  return `
    <g transform="translate(${x.toFixed(1)}, ${y.toFixed(1)}) rotate(${angle.toFixed(1)})">
      <g class="${animClass}" style="transform-origin: 0px 0px;">
        <path d="${lowerPath}" fill="${fillVane}" stroke="${strokeCol}" stroke-width="1.15" stroke-linejoin="round" />
        <path d="${upperPath}" fill="${fillMain}" stroke="${strokeCol}" stroke-width="1.25" stroke-linejoin="round" />
        ${orangeCap}
        <path d="M 3 0 Q ${length * 0.48} ${curve * 0.38}, ${(length * 0.86).toFixed(1)} ${(curve * 0.82).toFixed(1)}" fill="none" stroke="${strokeCol}" stroke-width="1" opacity="0.7" />
        ${greenFilament}
        <circle cx="4" cy="0" r="3.2" fill="${p.frameMain}" stroke="${strokeCol}" stroke-width="1" />
        <circle cx="4" cy="0" r="1.2" fill="${far ? p.armorShadow : p.armorMid}" />
      </g>
    </g>`;
}

interface CableSpec {
  d: string;
  tipX: number;
  tipY: number;
  variant: "ribbed" | "fiber" | "white-rib";
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
    variant,
    width = 3.2,
    tipColor = "orange",
    animClass,
    originX,
    originY,
  } = spec;

  let strokeMarkup = "";
  if (variant === "ribbed") {
    strokeMarkup = `
      <path d="${d}" fill="none" stroke="${p.frameDark}" stroke-width="${width + 2}" stroke-linecap="round" />
      <path d="${d}" fill="none" stroke="${p.frameLight}" stroke-width="${width}" stroke-linecap="round" stroke-dasharray="5 3.5" />
    `;
  } else if (variant === "white-rib") {
    strokeMarkup = `
      <path d="${d}" fill="none" stroke="${p.seamStroke}" stroke-width="${width + 2.2}" stroke-linecap="round" />
      <path d="${d}" fill="none" stroke="${p.armorMid}" stroke-width="${width}" stroke-linecap="round" />
      <path d="${d}" fill="none" stroke="${p.frameMain}" stroke-width="${width}" stroke-dasharray="3 6" />
    `;
  } else {
    strokeMarkup = `
      <path d="${d}" fill="none" stroke="${p.frameDark}" stroke-width="${width + 1.4}" stroke-linecap="round" />
      <path d="${d}" fill="none" stroke="${p.armorShadow}" stroke-width="${Math.max(1.2, width - 0.8)}" stroke-linecap="round" />
      <path class="cc-pulse" d="${d}" fill="none" stroke="${p.energyMain}" stroke-width="0.95" stroke-opacity="0.65" stroke-linecap="round" />
    `;
  }

  let tipMarkup = "";
  if (tipColor === "orange") {
    tipMarkup = `
      <circle cx="${tipX}" cy="${tipY}" r="${width * 0.95}" fill="${p.accentMain}" stroke="${p.seamStroke}" stroke-width="1" />
      <circle cx="${tipX}" cy="${tipY}" r="${width * 0.35}" fill="${p.armorHighlight}" />
    `;
  } else if (tipColor === "green") {
    tipMarkup = `
      <circle class="cc-pulse" cx="${tipX}" cy="${tipY}" r="${width * 1.45}" fill="${p.energyMain}" fill-opacity="0.32" />
      <circle class="cc-pulse" cx="${tipX}" cy="${tipY}" r="${width * 0.85}" fill="${p.energyBright}" stroke="${p.energyMain}" stroke-width="1" />
    `;
  }

  return `
    <g class="${animClass}" style="transform-origin: ${originX}px ${originY}px;">
      ${strokeMarkup}
      ${tipMarkup}
    </g>`;
}

function buildAnimationStyles(speed: number): string {
  const safeSpeed = Math.max(0.5, Math.min(2.5, speed || 1));
  const dur = (base: number) => `${(base / safeSpeed).toFixed(2)}s`;

  return `
    .cc-float {
      transform-box: fill-box;
      transform-origin: center;
      animation: ccFloat ${dur(5.6)} ease-in-out infinite;
    }
    .cc-wing-near {
      transform-box: fill-box;
      animation: ccWingNear ${dur(4.4)} ease-in-out infinite;
    }
    .cc-wing-far {
      transform-box: fill-box;
      animation: ccWingFar ${dur(4.4)} ease-in-out infinite;
    }
    .cc-f1, .cc-f2, .cc-f3, .cc-f4, .cc-f5, .cc-f6 {
      transform-box: fill-box;
    }
    .cc-f1 { animation: ccFeatherA ${dur(3.2)} ease-in-out infinite; }
    .cc-f2 { animation: ccFeatherB ${dur(3.5)} ease-in-out 0.25s infinite; }
    .cc-f3 { animation: ccFeatherA ${dur(3.8)} ease-in-out 0.55s infinite; }
    .cc-f4 { animation: ccFeatherB ${dur(3.4)} ease-in-out 0.8s infinite; }
    .cc-f5 { animation: ccFeatherA ${dur(3.7)} ease-in-out 1.1s infinite; }
    .cc-f6 { animation: ccFeatherB ${dur(3.1)} ease-in-out 1.35s infinite; }
    .cc-c1, .cc-c2, .cc-c3, .cc-c4, .cc-c5 {
      transform-box: fill-box;
    }
    .cc-c1 { animation: ccCableA ${dur(4.6)} ease-in-out infinite; }
    .cc-c2 { animation: ccCableB ${dur(5.1)} ease-in-out 0.4s infinite; }
    .cc-c3 { animation: ccCableA ${dur(4.8)} ease-in-out 0.9s infinite; }
    .cc-c4 { animation: ccCableB ${dur(5.4)} ease-in-out 1.3s infinite; }
    .cc-c5 { animation: ccCableA ${dur(4.3)} ease-in-out 0.6s infinite; }
    .cc-pulse {
      animation: ccPulse ${dur(2.4)} ease-in-out infinite;
    }
    .cc-hud-blink {
      animation: ccHudBlink ${dur(1.8)} ease-in-out infinite;
    }
    @keyframes ccFloat {
      0%, 100% { transform: translateY(-5px) rotate(-0.5deg); }
      50% { transform: translateY(5px) rotate(0.5deg); }
    }
    @keyframes ccWingNear {
      0%, 100% { transform: rotate(-2.4deg) translateY(-2px); }
      50% { transform: rotate(2.8deg) translateY(3px); }
    }
    @keyframes ccWingFar {
      0%, 100% { transform: rotate(2deg) translateY(2px); }
      50% { transform: rotate(-2.4deg) translateY(-2px); }
    }
    @keyframes ccFeatherA {
      0%, 100% { transform: rotate(-3.2deg); }
      50% { transform: rotate(3.6deg); }
    }
    @keyframes ccFeatherB {
      0%, 100% { transform: rotate(3deg); }
      50% { transform: rotate(-3.5deg); }
    }
    @keyframes ccCableA {
      0%, 100% { transform: rotate(-3.2deg) translateY(-2px); }
      50% { transform: rotate(3.4deg) translateY(2.5px); }
    }
    @keyframes ccCableB {
      0%, 100% { transform: rotate(2.8deg) translateY(2px); }
      50% { transform: rotate(-3.1deg) translateY(-2px); }
    }
    @keyframes ccPulse {
      0%, 100% { opacity: 0.68; }
      50% { opacity: 1; }
    }
    @keyframes ccHudBlink {
      0%, 100% { opacity: 0.45; }
      50% { opacity: 1; }
    }
  `;
}

function buildDefs(p: DerivedPalette, idPrefix: string): string {
  return `
    <defs>
      <linearGradient id="${idPrefix}-armor-v" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stop-color="${p.armorHighlight}" />
        <stop offset="35%" stop-color="${p.armorMain}" />
        <stop offset="100%" stop-color="${p.armorMid}" />
      </linearGradient>
      <linearGradient id="${idPrefix}-armor-d" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="${p.armorMain}" />
        <stop offset="65%" stop-color="${p.armorMid}" />
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
        <stop offset="0%" stop-color="${p.energyBright}" stop-opacity="0.95" />
        <stop offset="45%" stop-color="${p.energyMain}" stop-opacity="0.55" />
        <stop offset="100%" stop-color="${p.energyMain}" stop-opacity="0" />
      </radialGradient>
      <linearGradient id="${idPrefix}-hud-bg" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stop-color="#0D1117" stop-opacity="0.94" />
        <stop offset="50%" stop-color="#161B22" stop-opacity="0.94" />
        <stop offset="100%" stop-color="#0D1117" stop-opacity="0.94" />
      </linearGradient>
    </defs>
  `;
}

function getStageScaleTransform(stage: number): string {
  const scales: Record<number, number> = {
    1: 0.72,
    2: 0.81,
    3: 0.9,
    4: 0.98,
    5: 1.03,
  };
  const s = scales[stage] ?? 1;
  if (s === 1) return "";
  const cx = 460;
  const cy = 212;
  return `translate(${cx}, ${cy}) scale(${s}) translate(${-cx}, ${-cy})`;
}

/* -------------------------------------------------------------------------- */
/* CREATURE 1: CYBER-TULKUN (SIDE / DIVE / TOP)                               */
/* -------------------------------------------------------------------------- */

function renderTulkunSide(
  p: DerivedPalette,
  idPrefix: string,
  stage: number
): string {
  const allTailCables: CableSpec[] = [
    {
      d: "M 632 146 C 698 136, 755 110, 822 126",
      tipX: 822,
      tipY: 126,
      variant: "fiber",
      width: 2.2,
      tipColor: "green",
      animClass: "cc-c1",
      originX: 632,
      originY: 146,
    },
    {
      d: "M 626 154 C 708 175, 768 188, 862 146",
      tipX: 862,
      tipY: 146,
      variant: "white-rib",
      width: 4.1,
      tipColor: "orange",
      animClass: "cc-c2",
      originX: 626,
      originY: 154,
    },
    {
      d: "M 618 164 C 692 212, 775 215, 855 178",
      tipX: 855,
      tipY: 178,
      variant: "ribbed",
      width: 4.5,
      tipColor: "orange",
      animClass: "cc-c3",
      originX: 618,
      originY: 164,
    },
    {
      d: "M 610 172 C 675 245, 765 248, 848 214",
      tipX: 848,
      tipY: 214,
      variant: "white-rib",
      width: 4.2,
      tipColor: "green",
      animClass: "cc-c4",
      originX: 610,
      originY: 172,
    },
    {
      d: "M 596 178 C 660 278, 755 288, 838 250",
      tipX: 838,
      tipY: 250,
      variant: "ribbed",
      width: 4.8,
      tipColor: "orange",
      animClass: "cc-c5",
      originX: 596,
      originY: 178,
    },
    {
      d: "M 582 182 C 642 308, 745 322, 824 282",
      tipX: 824,
      tipY: 282,
      variant: "white-rib",
      width: 4.6,
      tipColor: "green",
      animClass: "cc-c1",
      originX: 582,
      originY: 182,
    },
    {
      d: "M 568 184 C 625 325, 725 348, 798 312",
      tipX: 798,
      tipY: 312,
      variant: "fiber",
      width: 2.6,
      tipColor: "orange",
      animClass: "cc-c2",
      originX: 568,
      originY: 184,
    },
    {
      d: "M 556 186 C 602 292, 682 328, 745 330",
      tipX: 745,
      tipY: 330,
      variant: "ribbed",
      width: 3.4,
      tipColor: "green",
      animClass: "cc-c3",
      originX: 556,
      originY: 186,
    },
  ];
  const cableLimit = stage === 1 ? 2 : stage === 2 ? 4 : stage === 3 ? 6 : 8;
  const tailCables = allTailCables.slice(0, cableLimit);

  const headTendrils: CableSpec[] =
    stage >= 2
      ? [
        {
          d: "M 244 74 C 288 52, 342 46, 392 60",
          tipX: 392,
          tipY: 60,
          variant: "fiber",
          width: 2.0,
          tipColor: "orange",
          animClass: "cc-c1",
          originX: 244,
          originY: 74,
        },
        {
          d: "M 252 78 C 304 64, 362 56, 422 50",
          tipX: 422,
          tipY: 50,
          variant: "white-rib",
          width: 2.3,
          tipColor: "green",
          animClass: "cc-c2",
          originX: 252,
          originY: 78,
        },
        ...(stage >= 4
          ? [
            {
              d: "M 258 84 C 312 78, 368 82, 412 76",
              tipX: 412,
              tipY: 76,
              variant: "fiber" as const,
              width: 1.9,
              tipColor: "orange" as const,
              animClass: "cc-c3",
              originX: 258,
              originY: 84,
            },
            {
              d: "M 262 88 C 310 92, 354 102, 396 96",
              tipX: 396,
              tipY: 96,
              variant: "fiber" as const,
              width: 1.8,
              tipColor: "green" as const,
              animClass: "cc-c4",
              originX: 262,
              originY: 88,
            },
          ]
          : []),
      ]
      : [];

  const farFeathers: FeatherSpec[] = [
    { x: 246, y: 274, length: 92, width: 15, angle: 76, curve: 8, far: true, orangeTip: true, animClass: "cc-f4" },
    { x: 254, y: 288, length: 102, width: 16, angle: 82, curve: 10, far: true, orangeTip: true, animClass: "cc-f5" },
    { x: 262, y: 300, length: 106, width: 16, angle: 88, curve: 10, far: true, orangeTip: true, greenTip: stage >= 4, animClass: "cc-f6" },
    { x: 270, y: 312, length: 96, width: 15, angle: 96, curve: 8, far: true, orangeTip: true, animClass: "cc-f1" },
    { x: 276, y: 322, length: 82, width: 14, angle: 104, curve: 6, far: true, orangeTip: false, animClass: "cc-f2" },
  ].slice(0, stage <= 2 ? 3 : 5);

  const dorsalFeathers: FeatherSpec[] =
    stage >= 3
      ? [
        { x: 432, y: 120, length: 78, width: 13, angle: -44, curve: -8, orangeTip: true, animClass: "cc-f1" },
        { x: 444, y: 125, length: 86, width: 14, angle: -34, curve: -8, orangeTip: true, greenTip: stage >= 4, animClass: "cc-f2" },
        { x: 454, y: 130, length: 82, width: 13, angle: -22, curve: -6, orangeTip: false, animClass: "cc-f3" },
        ...(stage >= 4
          ? [
            { x: 466, y: 136, length: 74, width: 12, angle: -12, curve: -4, orangeTip: true, animClass: "cc-f4" },
            { x: 478, y: 142, length: 64, width: 11, angle: -4, curve: -3, orangeTip: false, animClass: "cc-f5" },
          ]
          : []),
      ]
      : [];

  const allNearFeathers: FeatherSpec[] = [
    { x: 356, y: 242, length: 112, width: 15, angle: 34, curve: 10, orangeTip: true, animClass: "cc-f1" },
    { x: 368, y: 252, length: 128, width: 16, angle: 31, curve: 11, orangeTip: true, greenTip: stage >= 3, animClass: "cc-f2" },
    { x: 382, y: 263, length: 142, width: 17, angle: 28, curve: 12, orangeTip: true, animClass: "cc-f3" },
    { x: 396, y: 274, length: 154, width: 18, angle: 26, curve: 13, orangeTip: true, greenTip: stage >= 4, animClass: "cc-f4" },
    { x: 412, y: 286, length: 162, width: 18, angle: 25, curve: 14, orangeTip: true, animClass: "cc-f5" },
    { x: 428, y: 298, length: 168, width: 19, angle: 24, curve: 14, orangeTip: true, greenTip: stage >= 5, animClass: "cc-f6" },
    { x: 444, y: 310, length: 158, width: 18, angle: 27, curve: 12, orangeTip: true, animClass: "cc-f1" },
    { x: 458, y: 320, length: 138, width: 16, angle: 31, curve: 10, orangeTip: true, animClass: "cc-f2" },
  ];
  const nearFeathers = allNearFeathers.slice(
    0,
    stage === 1 ? 4 : stage === 2 ? 5 : stage === 3 ? 6 : 8
  );

  const tailSegments = [
    { x: 428, y: 118, w: 48, h: 92, r: 6 },
    { x: 468, y: 124, w: 44, h: 80, r: 7 },
    { x: 504, y: 129, w: 40, h: 68, r: 8 },
    { x: 538, y: 133, w: 36, h: 56, r: 8 },
    { x: 568, y: 136, w: 32, h: 44, r: 7 },
    { x: 595, y: 139, w: 28, h: 34, r: 6 },
  ];

  // Stage 5 Ascended Overdrive Crown & Scar Glow
  const ascendedCrown =
    stage === 5
      ? `
      <g>
        ${renderFeather({ x: 204, y: 74, length: 68, width: 11, angle: -24, curve: -8, orangeTip: true, greenTip: true, animClass: "cc-f2" }, p, idPrefix)}
        ${renderFeather({ x: 222, y: 70, length: 76, width: 12, angle: -18, curve: -8, orangeFull: true, greenTip: true, animClass: "cc-f3" }, p, idPrefix)}
        <path class="cc-pulse" d="M 118 118 L 166 106 L 154 128 L 210 116" fill="none" stroke="${p.energyBright}" stroke-width="2" stroke-linecap="round" />
      </g>`
      : "";

  // Stage 3+ Pelvic Ventral Paddle
  const ventralPaddle =
    stage >= 3
      ? `
      <g>
        ${renderFeather({ x: 472, y: 204, length: 72, width: 13, angle: 44, curve: 8, far: true, orangeTip: true, animClass: "cc-f4" }, p, idPrefix)}
        ${renderFeather({ x: 484, y: 200, length: 60, width: 11, angle: 36, curve: 6, far: true, orangeTip: false, greenTip: stage >= 5, animClass: "cc-f5" }, p, idPrefix)}
      </g>`
      : "";

  return `
    <g transform="${getStageScaleTransform(stage)}">
      <g class="cc-float">
        <g>${headTendrils.map((c) => renderCable(c, p)).join("")}</g>

        <!-- Far Pectoral Fin -->
        <g class="cc-wing-far" style="transform-origin: 240px 235px;">
          <path d="M 225 224 L 245 276 L 278 326 L 260 336 L 216 254 Z" fill="${p.armorShadow}" stroke="${p.seamStroke}" stroke-width="1.4" />
          <circle cx="232" cy="240" r="14" fill="${p.frameDark}" stroke="${p.seamStroke}" stroke-width="1.4" />
          <circle cx="232" cy="240" r="8" fill="${p.accentDeep}" />
          ${farFeathers.map((f) => renderFeather(f, p, idPrefix)).join("")}
        </g>

        ${ventralPaddle}
        <g>${tailCables.map((c) => renderCable(c, p)).join("")}</g>

        <!-- Mechanical Spine & Belly Under-Frame -->
        <path d="M 275 130 C 375 112, 480 124, 625 144 L 622 178 C 495 198, 395 232, 290 250 Z" fill="url(#${idPrefix}-frame-v)" stroke="${p.seamStroke}" stroke-width="1.6" />
        ${stage >= 2
      ? `<path d="M 332 230 C 405 222, 470 206, 520 192" fill="none" stroke="${p.energyMain}" stroke-width="2.2" stroke-opacity="0.75" class="cc-pulse" />`
      : ""
    }
        <path d="M 342 238 L 355 212 M 365 234 L 378 206 M 388 228 L 400 201 M 412 222 L 422 196 M 436 215 L 444 191" stroke="${p.frameLight}" stroke-width="2.5" stroke-linecap="round" />

        <g>${dorsalFeathers.map((f) => renderFeather(f, p, idPrefix)).join("")}</g>

        <!-- Segmented Tail Carapace Plates -->
        <g>
          ${tailSegments
      .slice(0, stage === 1 ? 4 : 6)
      .map(
        (seg, idx) => `
            <g transform="translate(${seg.x}, ${seg.y}) rotate(${seg.r})">
              <rect x="0" y="0" width="${seg.w}" height="${seg.h}" rx="10" fill="url(#${idPrefix}-armor-d)" stroke="${p.seamStroke}" stroke-width="1.4" />
              <path d="M 4 ${seg.h * 0.28} L ${seg.w - 4} ${seg.h * 0.24}" stroke="${p.seamStroke}" stroke-width="1" opacity="0.7" />
              <rect x="${seg.w * 0.25}" y="5" width="${seg.w * 0.5}" height="6" rx="3" fill="${p.armorHighlight}" opacity="0.85" />
              ${idx % 2 === 0 && stage >= 3 ? `<rect x="${seg.w - 10}" y="${seg.h * 0.52}" width="6" height="10" rx="1.5" fill="${p.accentMain}" stroke="${p.seamStroke}" stroke-width="0.8" />` : `<circle cx="${seg.w * 0.5}" cy="${seg.h * 0.65}" r="2.2" fill="${p.energyMain}" class="cc-pulse" />`}
            </g>`
      )
      .join("")}
        </g>

        <!-- Rear Tail Stabilizer Fluke -->
        <g>
          <path d="M 616 144 L 718 124 L 748 134 L 690 156 L 618 162 Z" fill="url(#${idPrefix}-armor-v)" stroke="${p.seamStroke}" stroke-width="1.4" stroke-linejoin="round" />
          <path d="M 696 128 L 718 124 L 748 134 L 724 143 Z" fill="${p.accentMain}" stroke="${p.seamStroke}" stroke-width="1.1" />
          <circle cx="624" cy="153" r="6" fill="${p.frameMain}" stroke="${p.seamStroke}" stroke-width="1.2" />
          <circle cx="624" cy="153" r="2.3" fill="${p.energyMain}" class="cc-pulse" />
        </g>

        <!-- Mid-Torso Modular Armor Plates -->
        <path d="M 285 92 C 350 96, 408 112, 442 132 L 426 218 C 378 232, 326 242, 290 242 Z" fill="url(#${idPrefix}-armor-v)" stroke="${p.seamStroke}" stroke-width="1.6" />
        <path d="M 326 105 L 352 225 M 378 118 L 392 214" stroke="${p.seamStroke}" stroke-width="1.2" opacity="0.8" />
        <rect x="336" y="138" width="26" height="10" rx="2.5" fill="${p.frameMain}" stroke="${p.seamStroke}" stroke-width="1" />
        <rect x="340" y="141" width="18" height="4" rx="1" fill="${p.energyMain}" class="cc-pulse" />

        <!-- Massive Rounded Cyber-Tulkun Head -->
        <g>
          <path d="M 74 148 C 142 156, 224 162, 306 154 L 310 172 C 222 178, 140 172, 74 164 Z" fill="${p.frameDark}" stroke="${p.seamStroke}" stroke-width="1.4" />
          <path d="M 95 154 L 98 164 M 115 156 L 118 166 M 135 158 L 138 168 M 155 159 L 158 169 M 175 160 L 178 170" stroke="${p.frameLight}" stroke-width="1.6" />

          <path d="M 76 164 C 102 228, 198 266, 322 252 L 332 198 C 258 188, 165 174, 76 164 Z" fill="url(#${idPrefix}-armor-d)" stroke="${p.seamStroke}" stroke-width="1.6" stroke-linejoin="round" />
          <path d="M 88 182 C 148 214, 232 232, 314 232" fill="none" stroke="${p.seamStroke}" stroke-width="1.3" />
          <path d="M 106 202 C 166 232, 240 246, 318 244" fill="none" stroke="${p.seamStroke}" stroke-width="1.3" />
          ${stage >= 2
      ? `<path class="cc-pulse" d="M 102 194 C 160 222, 228 238, 294 238" fill="none" stroke="${p.energyMain}" stroke-width="2" stroke-dasharray="14 6 4 6" />`
      : ""
    }
          <circle cx="116" cy="176" r="6.5" fill="${p.frameMain}" stroke="${p.seamStroke}" stroke-width="1.2" />
          <circle class="cc-pulse" cx="116" cy="176" r="3" fill="${p.energyBright}" />

          <path d="M 70 150 C 66 84, 152 58, 258 74 L 328 102 L 308 160 C 224 166, 138 158, 70 150 Z" fill="url(#${idPrefix}-armor-v)" stroke="${p.seamStroke}" stroke-width="1.7" stroke-linejoin="round" />
          <path d="M 84 114 C 144 92, 230 94, 316 116" fill="none" stroke="${p.seamStroke}" stroke-width="1.25" />
          <path d="M 118 76 C 122 104, 128 130, 136 154" fill="none" stroke="${p.seamStroke}" stroke-width="1.2" />
          <path d="M 192 68 C 194 98, 198 128, 206 158" fill="none" stroke="${p.seamStroke}" stroke-width="1.25" />
          <path d="M 262 76 L 248 156" fill="none" stroke="${p.seamStroke}" stroke-width="1.25" />
          <path d="M 92 106 C 142 78, 212 74, 266 86" fill="none" stroke="${p.armorHighlight}" stroke-width="3.5" stroke-linecap="round" opacity="0.7" />

          ${stage >= 3
      ? `<g opacity="0.88">
                  <rect x="148" y="96" width="38" height="22" rx="3" fill="${p.energyMain}" fill-opacity="0.18" stroke="${p.energyMain}" stroke-width="1.1" />
                  <path class="cc-pulse" d="M 154 104 L 180 104 M 154 111 L 172 111" stroke="${p.energyBright}" stroke-width="1.4" />
                  <rect x="208" y="104" width="34" height="16" rx="2.5" fill="${p.energyMain}" fill-opacity="0.16" stroke="${p.energyMain}" stroke-width="1" />
                  <rect x="172" y="132" width="18" height="7" rx="1.5" fill="${p.accentMain}" stroke="${p.seamStroke}" stroke-width="0.9" />
                  <rect x="202" y="138" width="24" height="5" rx="1.5" fill="${p.energyMain}" class="cc-pulse" />
                </g>`
      : ""
    }

          ${ascendedCrown}

          <g>
            <circle cx="144" cy="144" r="9" fill="${p.frameMain}" stroke="${p.seamStroke}" stroke-width="1.3" />
            <circle cx="144" cy="144" r="12" fill="url(#${idPrefix}-energy-glow)" class="cc-pulse" />
            <circle cx="144" cy="144" r="4.5" fill="${p.energyMain}" stroke="${p.frameDark}" stroke-width="1" />
            <circle cx="142.5" cy="142.5" r="1.5" fill="${p.energyBright}" />
          </g>

          <g transform="translate(268, 174)">
            <circle cx="0" cy="0" r="${stage >= 4 ? 28 : 22}" fill="${p.frameMain}" stroke="${p.seamStroke}" stroke-width="1.6" />
            ${stage >= 4 ? `<circle cx="0" cy="0" r="22" fill="none" stroke="${p.energyMain}" stroke-width="1.6" stroke-dasharray="10 6" class="cc-pulse" />` : ""}
            <circle cx="0" cy="0" r="16" fill="${p.frameDark}" stroke="${p.accentMain}" stroke-width="3.2" />
            <circle cx="0" cy="0" r="10" fill="url(#${idPrefix}-energy-glow)" class="cc-pulse" />
            <circle cx="0" cy="0" r="5.5" fill="${p.accentMain}" stroke="${p.seamStroke}" stroke-width="1" />
            <circle cx="0" cy="0" r="2.2" fill="${p.energyBright}" />
          </g>

          <circle cx="248" cy="78" r="11" fill="${p.frameMain}" stroke="${p.seamStroke}" stroke-width="1.3" />
          <circle cx="248" cy="78" r="5.5" fill="${p.accentMain}" />
        </g>

        <!-- Hero Near Pectoral Wing-Fin -->
        <g class="cc-wing-near" style="transform-origin: 332px 212px;">
          <circle cx="332" cy="212" r="26" fill="${p.frameMain}" stroke="${p.seamStroke}" stroke-width="1.7" />
          <circle cx="332" cy="212" r="18" fill="${p.frameDark}" stroke="${p.armorMid}" stroke-width="2" stroke-dasharray="18 7" />
          <circle cx="332" cy="212" r="9" fill="${p.accentMain}" stroke="${p.seamStroke}" stroke-width="1.2" />
          <circle class="cc-pulse" cx="332" cy="212" r="4" fill="${p.energyBright}" />

          ${nearFeathers.map((f) => renderFeather(f, p, idPrefix)).join("")}

          <path d="M 328 214 L 408 268 L 478 328 L 456 344 L 386 286 L 316 232 Z" fill="url(#${idPrefix}-armor-v)" stroke="${p.seamStroke}" stroke-width="1.6" stroke-linejoin="round" />
          <path d="M 378 262 L 395 250 L 404 260 L 386 274 Z" fill="${p.accentMain}" stroke="${p.seamStroke}" stroke-width="1.1" />
          <path class="cc-pulse" d="M 404 278 L 452 318" stroke="${p.energyMain}" stroke-width="3.2" stroke-linecap="round" />
          <circle cx="464" cy="332" r="6.5" fill="${p.frameMain}" stroke="${p.seamStroke}" stroke-width="1.2" />
          <circle class="cc-pulse" cx="464" cy="332" r="2.6" fill="${p.energyBright}" />
          ${stage >= 3 ? `<path class="cc-pulse" d="M 476 338 L 516 364" stroke="${p.energyMain}" stroke-width="2.4" stroke-linecap="round" />` : ""}
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
  // 3/4 Dynamic Dive: pitched down-left with lifted anchor so pectoral tips never touch the HUD bar
  return `
    <g transform="translate(460, 188) rotate(-15) scale(0.84) translate(-460, -205)">
      ${renderTulkunSide(p, idPrefix, stage)}
    </g>
  `;
}

function renderTulkunTop(
  p: DerivedPalette,
  idPrefix: string,
  stage: number
): string {
  const leftWingFeathers: FeatherSpec[] = [
    { x: 356, y: 158, length: 120, width: 15, angle: -135, curve: -12, orangeTip: true, animClass: "cc-f1" },
    { x: 374, y: 156, length: 138, width: 16, angle: -130, curve: -12, orangeTip: true, greenTip: stage >= 4, animClass: "cc-f2" },
    { x: 394, y: 156, length: 150, width: 17, angle: -125, curve: -14, orangeTip: true, animClass: "cc-f3" },
    { x: 414, y: 158, length: 142, width: 16, angle: -118, curve: -10, orangeTip: true, animClass: "cc-f4" },
    { x: 434, y: 162, length: 122, width: 15, angle: -112, curve: -8, orangeTip: true, greenTip: stage >= 5, animClass: "cc-f5" },
  ].slice(0, stage <= 2 ? 3 : 5);

  const rightWingFeathers: FeatherSpec[] = [
    { x: 356, y: 254, length: 120, width: 15, angle: 135, curve: 12, orangeTip: true, animClass: "cc-f2" },
    { x: 374, y: 256, length: 138, width: 16, angle: 130, curve: 12, orangeTip: true, greenTip: stage >= 4, animClass: "cc-f3" },
    { x: 394, y: 256, length: 150, width: 17, angle: 125, curve: 14, orangeTip: true, animClass: "cc-f4" },
    { x: 414, y: 254, length: 142, width: 16, angle: 118, curve: 10, orangeTip: true, animClass: "cc-f5" },
    { x: 434, y: 250, length: 122, width: 15, angle: 112, curve: 8, orangeTip: true, greenTip: stage >= 5, animClass: "cc-f6" },
  ].slice(0, stage <= 2 ? 3 : 5);

  const rawTopCables: CableSpec[] = [
    { d: "M 642 194 C 710 176, 778 148, 856 164", tipX: 856, tipY: 164, variant: "white-rib", width: 3.6, tipColor: "orange", animClass: "cc-c1", originX: 642, originY: 194 },
    { d: "M 646 202 C 722 198, 788 188, 868 194", tipX: 868, tipY: 194, variant: "fiber", width: 2.3, tipColor: "green", animClass: "cc-c2", originX: 646, originY: 202 },
    { d: "M 646 210 C 722 214, 788 224, 868 218", tipX: 868, tipY: 218, variant: "ribbed", width: 3.8, tipColor: "green", animClass: "cc-c3", originX: 646, originY: 210 },
    { d: "M 642 218 C 710 236, 778 264, 856 248", tipX: 856, tipY: 248, variant: "white-rib", width: 3.6, tipColor: "orange", animClass: "cc-c4", originX: 642, originY: 218 },
  ];
  const topCables = rawTopCables.slice(0, stage === 1 ? 2 : 4);

  return `
    <g transform="${getStageScaleTransform(stage)}">
      <g class="cc-float">
        <!-- Trailing Tail Cables -->
        <g>${topCables.map((c) => renderCable(c, p)).join("")}</g>

        <!-- Dorsal Top Wing Left & Right -->
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

        <!-- Pelvic Stabilizer Paddles (Stage 3+) -->
        ${stage >= 3
      ? `<g>
                <path d="M 526 178 L 566 138 L 584 148 L 548 184 Z" fill="url(#${idPrefix}-armor-d)" stroke="${p.seamStroke}" stroke-width="1.2" />
                <path d="M 526 234 L 566 274 L 584 264 L 548 228 Z" fill="url(#${idPrefix}-armor-d)" stroke="${p.seamStroke}" stroke-width="1.2" />
              </g>`
      : ""
    }

        <!-- Forked Caudal Tail Flukes -->
        <path d="M 624 198 L 716 142 L 736 160 L 664 206 L 736 252 L 716 270 L 624 214 Z" fill="url(#${idPrefix}-armor-d)" stroke="${p.seamStroke}" stroke-width="1.5" stroke-linejoin="round" />
        <path d="M 692 156 L 716 142 L 736 160 L 710 172 Z" fill="${p.accentMain}" stroke="${p.seamStroke}" stroke-width="1" />
        <path d="M 692 256 L 716 270 L 736 252 L 710 240 Z" fill="${p.accentMain}" stroke="${p.seamStroke}" stroke-width="1" />

        <!-- Mechanical Inner Spine -->
        <path d="M 280 176 L 642 192 L 642 220 L 280 236 Z" fill="url(#${idPrefix}-frame-v)" stroke="${p.seamStroke}" stroke-width="1.5" />

        <!-- Segmented Dorsal Carapace Spine Plates -->
        ${[0, 1, 2, 3, 4, 5]
      .map((i) => {
        const x = 352 + i * 46;
        const h = 76 - i * 8;
        const y = 206 - h / 2;
        return `<rect x="${x}" y="${y}" width="38" height="${h}" rx="12" fill="url(#${idPrefix}-armor-d)" stroke="${p.seamStroke}" stroke-width="1.4" />
                    <circle cx="${x + 19}" cy="206" r="3.5" fill="${p.energyMain}" class="cc-pulse" />`;
      })
      .join("")}

        <!-- Broad Rounded Whale Head (Dorsal Top View) -->
        <path d="M 88 206 C 88 148, 178 134, 316 150 L 352 174 L 352 238 L 316 262 C 178 278, 88 264, 88 206 Z" fill="url(#${idPrefix}-armor-v)" stroke="${p.seamStroke}" stroke-width="1.8" />
        <path d="M 106 206 L 348 206" stroke="${p.seamStroke}" stroke-width="1.4" />
        <path d="M 164 152 C 168 186, 168 226, 164 260" fill="none" stroke="${p.seamStroke}" stroke-width="1.3" />
        <path d="M 244 146 C 248 186, 248 226, 244 266" fill="none" stroke="${p.seamStroke}" stroke-width="1.3" />

        <!-- Dual Dorsal Sensor Optics -->
        <circle cx="148" cy="176" r="7.5" fill="${p.frameMain}" stroke="${p.seamStroke}" stroke-width="1.2" />
        <circle class="cc-pulse" cx="148" cy="176" r="3.6" fill="${p.energyBright}" />
        <circle cx="148" cy="236" r="7.5" fill="${p.frameMain}" stroke="${p.seamStroke}" stroke-width="1.2" />
        <circle class="cc-pulse" cx="148" cy="236" r="3.6" fill="${p.energyBright}" />

        <!-- Central Crown Core -->
        <circle cx="282" cy="206" r="14" fill="${p.frameMain}" stroke="${p.seamStroke}" stroke-width="1.5" />
        <circle cx="282" cy="206" r="9" fill="${p.frameDark}" stroke="${p.accentMain}" stroke-width="2.5" />
        <circle class="cc-pulse" cx="282" cy="206" r="4" fill="${p.energyBright}" />
      </g>
    </g>
  `;
}

/* -------------------------------------------------------------------------- */
/* CREATURE 2: CYBER-SERPENT (SIDE / DIVE / TOP)                              */
/* -------------------------------------------------------------------------- */

function renderSerpentSide(
  p: DerivedPalette,
  idPrefix: string,
  stage: number
): string {
  const tailRibbons: FeatherSpec[] = [
    { x: 258, y: 205, length: 196, width: 22, angle: -158, curve: -26, orangeTip: true, greenTip: stage >= 3, animClass: "cc-c1" },
    { x: 268, y: 220, length: 215, width: 24, angle: -172, curve: -22, orangeTip: true, animClass: "cc-c2" },
    { x: 274, y: 234, length: 185, width: 20, angle: 168, curve: -18, orangeTip: true, greenTip: stage >= 4, animClass: "cc-c3" },
    { x: 262, y: 246, length: 165, width: 18, angle: 154, curve: -16, orangeTip: false, animClass: "cc-c4" },
  ].slice(0, stage === 1 ? 2 : stage === 2 ? 3 : 4);

  const rawTailCables: CableSpec[] = [
    { d: "M 290 236 C 210 310, 128 332, 66 292", tipX: 66, tipY: 292, variant: "ribbed", width: 4.2, tipColor: "orange", animClass: "cc-c1", originX: 290, originY: 236 },
    { d: "M 305 242 C 232 332, 148 358, 86 336", tipX: 86, tipY: 336, variant: "white-rib", width: 3.6, tipColor: "green", animClass: "cc-c2", originX: 305, originY: 242 },
    { d: "M 322 246 C 254 342, 185 366, 122 362", tipX: 122, tipY: 362, variant: "fiber", width: 2.3, tipColor: "green", animClass: "cc-c3", originX: 322, originY: 246 },
    { d: "M 272 200 C 202 146, 146 95, 92 78", tipX: 92, tipY: 78, variant: "fiber", width: 2.1, tipColor: "orange", animClass: "cc-c4", originX: 272, originY: 200 },
  ];
  const tailCables = rawTailCables.slice(0, stage === 1 ? 1 : stage === 2 ? 2 : 4);

  const spineFeathers: FeatherSpec[] =
    stage >= 2
      ? [
        { x: 342, y: 188, length: 92, width: 15, angle: -145, curve: -12, orangeTip: true, animClass: "cc-f1" },
        { x: 378, y: 172, length: 108, width: 16, angle: -140, curve: -14, orangeTip: true, greenTip: stage >= 4, animClass: "cc-f2" },
        { x: 418, y: 154, length: 118, width: 17, angle: -136, curve: -14, orangeTip: true, animClass: "cc-f3" },
        { x: 458, y: 138, length: 114, width: 17, angle: -134, curve: -12, orangeTip: true, greenTip: stage >= 4, animClass: "cc-f4" },
        { x: 498, y: 126, length: 102, width: 16, angle: -138, curve: -10, orangeTip: true, animClass: "cc-f5" },
        { x: 540, y: 118, length: 88, width: 14, angle: -144, curve: -8, orangeTip: false, animClass: "cc-f6" },
        { x: 582, y: 116, length: 74, width: 13, angle: -150, curve: -6, orangeTip: true, animClass: "cc-f1" },
      ].slice(0, stage === 2 ? 3 : stage === 3 ? 5 : 7)
      : [];

  const farWingFeathers: FeatherSpec[] = [
    { x: 650, y: 245, length: 84, width: 15, angle: 115, curve: 10, far: true, orangeTip: false, animClass: "cc-f3" },
    { x: 642, y: 256, length: 96, width: 16, angle: 122, curve: 12, far: true, orangeFull: true, animClass: "cc-f4" },
    { x: 632, y: 268, length: 102, width: 16, angle: 130, curve: 12, far: true, orangeTip: true, animClass: "cc-f5" },
    { x: 622, y: 278, length: 90, width: 14, angle: 138, curve: 10, far: true, orangeTip: false, animClass: "cc-f6" },
  ].slice(0, stage <= 2 ? 2 : 4);

  const nearWingFeathers: FeatherSpec[] = [
    { x: 562, y: 196, length: 106, width: 16, angle: 145, curve: 12, orangeTip: false, animClass: "cc-f1" },
    { x: 552, y: 210, length: 126, width: 18, angle: 142, curve: 14, orangeFull: true, animClass: "cc-f2" },
    { x: 540, y: 224, length: 144, width: 19, angle: 138, curve: 14, orangeTip: true, greenTip: stage >= 4, animClass: "cc-f3" },
    { x: 528, y: 238, length: 158, width: 20, angle: 134, curve: 14, orangeFull: true, animClass: "cc-f4" },
    { x: 516, y: 252, length: 148, width: 19, angle: 130, curve: 12, orangeTip: true, animClass: "cc-f5" },
    { x: 504, y: 266, length: 126, width: 17, angle: 125, curve: 10, orangeTip: true, greenTip: stage >= 5, animClass: "cc-f6" },
  ].slice(0, stage === 1 ? 3 : stage === 2 ? 4 : 6);

  const bodySegments = [
    { x: 294, y: 198, w: 42, h: 48, r: -18 },
    { x: 330, y: 180, w: 46, h: 56, r: -20 },
    { x: 370, y: 162, w: 50, h: 64, r: -18 },
    { x: 414, y: 144, w: 54, h: 72, r: -14 },
    { x: 462, y: 130, w: 58, h: 78, r: -10 },
    { x: 514, y: 120, w: 60, h: 82, r: -4 },
    { x: 566, y: 116, w: 62, h: 86, r: 4 },
    { x: 618, y: 120, w: 58, h: 82, r: 10 },
  ];

  return `
    <g transform="${getStageScaleTransform(stage)}">
      <g class="cc-float">
        <g>${tailCables.map((c) => renderCable(c, p)).join("")}</g>
        <g>${tailRibbons.map((f) => renderFeather(f, p, idPrefix)).join("")}</g>

        <g class="cc-wing-far" style="transform-origin: 672px 214px;">
          <path d="M 672 208 L 656 266 L 622 300 L 636 308 L 682 232 Z" fill="${p.armorShadow}" stroke="${p.seamStroke}" stroke-width="1.4" />
          ${farWingFeathers.map((f) => renderFeather(f, p, idPrefix)).join("")}
        </g>

        <path d="M 272 222 C 340 202, 415 152, 520 144 C 598 138, 665 152, 718 164 L 712 198 C 655 206, 595 208, 515 206 C 425 204, 345 236, 274 238 Z" fill="url(#${idPrefix}-frame-v)" stroke="${p.seamStroke}" stroke-width="1.6" />
        <path class="cc-pulse" d="M 300 222 C 378 192, 462 162, 565 164 C 625 165, 668 174, 704 180" fill="none" stroke="${p.energyMain}" stroke-width="2.4" stroke-dasharray="16 6" />

        <g>${spineFeathers.map((f) => renderFeather(f, p, idPrefix)).join("")}</g>

        <g>
          ${bodySegments
      .map(
        (s, i) => `
            <g transform="translate(${s.x}, ${s.y}) rotate(${s.r})">
              <rect x="0" y="0" width="${s.w}" height="${s.h}" rx="14" fill="url(#${idPrefix}-armor-d)" stroke="${p.seamStroke}" stroke-width="1.4" />
              <path d="M 6 ${s.h * 0.34} L ${s.w - 6} ${s.h * 0.3}" stroke="${p.seamStroke}" stroke-width="1" opacity="0.7" />
              <rect x="8" y="6" width="${s.w - 16}" height="7" rx="3.5" fill="${p.armorHighlight}" opacity="0.85" />
              ${i % 2 === 1 && stage >= 3 ? `<rect x="${s.w * 0.3}" y="${s.h * 0.56}" width="14" height="6" rx="2" fill="${p.accentMain}" stroke="${p.seamStroke}" stroke-width="0.8" />` : `<circle cx="${s.w * 0.5}" cy="${s.h * 0.6}" r="3" fill="${p.energyMain}" class="cc-pulse" />`}
            </g>`
      )
      .join("")}
        </g>

        <g>
          <path d="M 678 148 C 702 144, 722 146, 738 152" fill="none" stroke="${p.frameLight}" stroke-width="6" stroke-linecap="round" />
          <path d="M 678 178 C 704 182, 726 184, 742 180" fill="none" stroke="${p.frameDark}" stroke-width="5" stroke-linecap="round" />

          ${stage >= 2 ? renderFeather({ x: 724, y: 128, length: 68, width: 12, angle: -152, curve: -6, orangeTip: true, animClass: "cc-f2" }, p, idPrefix) : ""}
          ${stage >= 4 ? renderFeather({ x: 738, y: 122, length: 58, width: 11, angle: -144, curve: -5, orangeTip: false, greenTip: true, animClass: "cc-f3" }, p, idPrefix) : ""}
          ${stage === 5 ? renderFeather({ x: 752, y: 116, length: 52, width: 10, angle: -136, curve: -4, orangeFull: true, greenTip: true, animClass: "cc-f1" }, p, idPrefix) : ""}

          <path d="M 738 172 L 828 166 L 838 178 C 810 198, 765 204, 732 192 Z" fill="url(#${idPrefix}-armor-d)" stroke="${p.seamStroke}" stroke-width="1.5" stroke-linejoin="round" />
          <path d="M 762 182 L 814 178" stroke="${p.seamStroke}" stroke-width="1.2" />

          <path d="M 716 144 C 736 106, 804 106, 846 146 L 854 162 C 824 170, 774 174, 724 168 Z" fill="url(#${idPrefix}-armor-v)" stroke="${p.seamStroke}" stroke-width="1.7" stroke-linejoin="round" />
          <path d="M 744 126 C 778 118, 814 126, 840 144" fill="none" stroke="${p.armorHighlight}" stroke-width="3" stroke-linecap="round" opacity="0.8" />
          <path d="M 762 118 L 758 168 M 802 122 L 798 166" stroke="${p.seamStroke}" stroke-width="1.2" />

          <path d="M 796 148 L 844 146 L 848 156 L 802 158 Z" fill="${p.frameDark}" stroke="${p.seamStroke}" stroke-width="1.2" />
          <circle cx="826" cy="152" r="11" fill="url(#${idPrefix}-energy-glow)" class="cc-pulse" />
          <circle cx="826" cy="152" r="4.8" fill="${p.energyMain}" />
          <circle cx="825" cy="151" r="1.8" fill="${p.energyBright}" />
          <rect x="770" y="142" width="16" height="5" rx="1.5" fill="${p.accentMain}" stroke="${p.seamStroke}" stroke-width="0.8" />

          <g transform="translate(734, 162)">
            <circle cx="0" cy="0" r="22" fill="${p.frameMain}" stroke="${p.seamStroke}" stroke-width="1.6" />
            <circle cx="0" cy="0" r="15" fill="${p.frameDark}" stroke="${p.accentMain}" stroke-width="2.8" />
            <circle cx="0" cy="0" r="7" fill="${p.armorMid}" stroke="${p.seamStroke}" stroke-width="1" />
            <circle class="cc-pulse" cx="0" cy="0" r="3" fill="${p.energyMain}" />
          </g>
        </g>

        <g class="cc-wing-near" style="transform-origin: 598px 176px;">
          <circle cx="598" cy="176" r="22" fill="${p.frameMain}" stroke="${p.seamStroke}" stroke-width="1.6" />
          <circle cx="598" cy="176" r="14" fill="${p.frameDark}" stroke="${p.accentMain}" stroke-width="2.4" />
          <circle class="cc-pulse" cx="598" cy="176" r="5" fill="${p.energyMain}" />
          ${nearWingFeathers.map((f) => renderFeather(f, p, idPrefix)).join("")}
          <path d="M 596 178 L 542 238 L 494 294 L 512 308 L 568 248 L 614 194 Z" fill="url(#${idPrefix}-armor-v)" stroke="${p.seamStroke}" stroke-width="1.6" stroke-linejoin="round" />
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
    <g transform="translate(460, 200) rotate(14) scale(0.90) translate(-460, -210)">
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
        <!-- Sweeping Ribbon Tail Plumes -->
        ${renderFeather({ x: 256, y: 196, length: 178, width: 20, angle: -162, curve: -18, orangeTip: true, greenTip: stage >= 4, animClass: "cc-c1" }, p, idPrefix)}
        ${renderFeather({ x: 256, y: 216, length: 178, width: 20, angle: 162, curve: 18, orangeTip: true, greenTip: stage >= 4, animClass: "cc-c2" }, p, idPrefix)}
        ${renderCable({ d: "M 264 206 C 190 194, 130 218, 68 206", tipX: 68, tipY: 206, variant: "white-rib", width: 3.6, tipColor: "green", animClass: "cc-c3", originX: 264, originY: 206 }, p)}

        <!-- Symmetric Wings -->
        <g class="cc-wing-far" style="transform-origin: 580px 180px;">
          ${[0, 1, 2, 3].slice(0, stage <= 2 ? 2 : 4).map((i) => renderFeather({ x: 560 - i * 16, y: 170 - i * 16, length: 118 - i * 10, width: 16, angle: -145 + i * 6, curve: -10, orangeFull: i === 1, orangeTip: true, animClass: `cc-f${i + 1}` }, p, idPrefix)).join("")}
          <path d="M 596 184 L 542 108 L 474 62 L 456 80 L 520 132 L 566 192 Z" fill="url(#${idPrefix}-armor-v)" stroke="${p.seamStroke}" stroke-width="1.5" />
        </g>

        <g class="cc-wing-near" style="transform-origin: 580px 232px;">
          ${[0, 1, 2, 3].slice(0, stage <= 2 ? 2 : 4).map((i) => renderFeather({ x: 560 - i * 16, y: 242 + i * 16, length: 118 - i * 10, width: 16, angle: 145 - i * 6, curve: 10, orangeFull: i === 1, orangeTip: true, animClass: `cc-f${i + 2}` }, p, idPrefix)).join("")}
          <path d="M 596 228 L 542 304 L 474 350 L 456 332 L 520 280 L 566 220 Z" fill="url(#${idPrefix}-armor-v)" stroke="${p.seamStroke}" stroke-width="1.5" />
        </g>

        <!-- Undulating Serpentine Spine (Top View) -->
        <path d="M 262 206 C 340 164, 440 248, 536 206 C 608 176, 668 202, 720 206" fill="none" stroke="${p.frameMain}" stroke-width="34" stroke-linecap="round" />
        ${[0, 1, 2, 3, 4, 5, 6, 7].map((i) => {
    const x = 290 + i * 54;
    const y = 206 + Math.sin(i * 0.9) * 18;
    return `<rect x="${x - 22}" y="${y - 24}" width="44" height="48" rx="14" fill="url(#${idPrefix}-armor-d)" stroke="${p.seamStroke}" stroke-width="1.4" />
                  <circle cx="${x}" cy="${y}" r="3.2" fill="${p.energyMain}" class="cc-pulse" />`;
  }).join("")}

        <!-- Dragon Head (Top View) -->
        <path d="M 702 182 C 744 166, 816 174, 854 206 C 816 238, 744 246, 702 230 Z" fill="url(#${idPrefix}-armor-v)" stroke="${p.seamStroke}" stroke-width="1.7" />
        <path d="M 720 206 L 844 206" stroke="${p.seamStroke}" stroke-width="1.3" />
        <circle cx="808" cy="192" r="5" fill="${p.energyMain}" class="cc-pulse" />
        <circle cx="808" cy="220" r="5" fill="${p.energyMain}" class="cc-pulse" />
      </g>
    </g>
  `;
}

/* -------------------------------------------------------------------------- */
/* CREATURE 3: CYBER-MANTA (SIDE / DIVE / TOP)                                */
/* -------------------------------------------------------------------------- */

function renderMantaSide(
  p: DerivedPalette,
  idPrefix: string,
  stage: number
): string {
  const rawTailTendrils: CableSpec[] = [
    { d: "M 516 208 C 608 182, 702 152, 822 178", tipX: 822, tipY: 178, variant: "white-rib", width: 3.4, tipColor: "orange", animClass: "cc-c1", originX: 516, originY: 208 },
    { d: "M 508 228 C 618 242, 718 232, 856 202", tipX: 856, tipY: 202, variant: "ribbed", width: 4.4, tipColor: "green", animClass: "cc-c2", originX: 508, originY: 228 },
    { d: "M 496 244 C 594 278, 694 316, 816 286", tipX: 816, tipY: 286, variant: "fiber", width: 2.6, tipColor: "green", animClass: "cc-c3", originX: 496, originY: 244 },
    { d: "M 482 252 C 562 308, 658 346, 772 336", tipX: 772, tipY: 336, variant: "white-rib", width: 3.0, tipColor: "orange", animClass: "cc-c4", originX: 482, originY: 252 },
  ];
  const tailTendrils = rawTailTendrils.slice(0, stage === 1 ? 2 : stage === 2 ? 3 : 4);

  const farWingFeathers: FeatherSpec[] = [
    { x: 422, y: 128, length: 94, width: 15, angle: -24, curve: -6, far: true, orangeTip: true, animClass: "cc-f1" },
    { x: 454, y: 108, length: 106, width: 16, angle: -18, curve: -8, far: true, orangeTip: true, greenTip: stage >= 4, animClass: "cc-f2" },
    { x: 486, y: 92, length: 112, width: 16, angle: -12, curve: -8, far: true, orangeTip: true, animClass: "cc-f3" },
    { x: 518, y: 78, length: 102, width: 15, angle: -6, curve: -6, far: true, orangeTip: false, animClass: "cc-f4" },
    { x: 550, y: 68, length: 88, width: 13, angle: 0, curve: -4, far: true, orangeTip: true, animClass: "cc-f5" },
  ].slice(0, stage <= 2 ? 3 : 5);

  const nearWingFeathers: FeatherSpec[] = [
    { x: 356, y: 268, length: 108, width: 15, angle: 28, curve: 10, orangeTip: true, animClass: "cc-f1" },
    { x: 382, y: 284, length: 124, width: 16, angle: 24, curve: 12, orangeTip: true, greenTip: stage >= 3, animClass: "cc-f2" },
    { x: 410, y: 300, length: 138, width: 17, angle: 20, curve: 12, orangeTip: true, animClass: "cc-f3" },
    { x: 440, y: 316, length: 146, width: 18, angle: 16, curve: 12, orangeTip: true, greenTip: stage >= 4, animClass: "cc-f4" },
    { x: 470, y: 332, length: 136, width: 17, angle: 12, curve: 10, orangeTip: true, animClass: "cc-f5" },
    { x: 500, y: 346, length: 116, width: 15, angle: 8, curve: 8, orangeTip: true, animClass: "cc-f6" },
    { x: 530, y: 358, length: 92, width: 13, angle: 4, curve: 6, orangeTip: false, animClass: "cc-f1" },
  ].slice(0, stage === 1 ? 3 : stage === 2 ? 5 : 7);

  return `
    <g transform="${getStageScaleTransform(stage)}">
      <g class="cc-float">
        <g>${tailTendrils.map((c) => renderCable(c, p)).join("")}</g>

        <g class="cc-wing-far" style="transform-origin: 336px 176px;">
          ${farWingFeathers.map((f) => renderFeather(f, p, idPrefix)).join("")}
          <path d="M 288 182 C 354 118, 456 66, 588 46 L 548 86 C 468 112, 396 150, 336 196 Z" fill="${p.armorShadow}" stroke="${p.seamStroke}" stroke-width="1.6" stroke-linejoin="round" />
          <path d="M 326 164 L 548 64" stroke="${p.seamStroke}" stroke-width="1.2" opacity="0.7" />
          <path d="M 526 62 L 588 46 L 564 74 L 516 84 Z" fill="${p.accentDeep}" stroke="${p.seamStroke}" stroke-width="1.1" />
        </g>

        <g>
          <path d="M 192 214 C 266 254, 380 264, 512 238 L 496 202 C 386 194, 276 192, 192 214 Z" fill="url(#${idPrefix}-frame-v)" stroke="${p.seamStroke}" stroke-width="1.6" />
          <g class="cc-pulse">
            <path d="M 272 224 L 288 240 M 292 226 L 308 242 M 312 228 L 328 244 M 332 228 L 348 244" stroke="${p.energyMain}" stroke-width="2.6" stroke-linecap="round" />
          </g>

          <path d="M 204 186 C 166 170, 128 164, 102 172 C 128 186, 162 198, 198 202 Z" fill="${p.armorMid}" stroke="${p.seamStroke}" stroke-width="1.4" />
          <path d="M 102 172 L 130 172 L 124 180 Z" fill="${p.accentDeep}" />

          <path d="M 178 202 C 216 154, 326 150, 446 186 L 522 214 L 468 238 C 362 246, 250 232, 178 202 Z" fill="url(#${idPrefix}-armor-v)" stroke="${p.seamStroke}" stroke-width="1.7" stroke-linejoin="round" />
          <path d="M 232 176 L 268 224 M 302 166 L 336 234 M 378 172 L 404 238" stroke="${p.seamStroke}" stroke-width="1.25" opacity="0.8" />
          <path d="M 218 190 C 292 178, 376 192, 466 218" fill="none" stroke="${p.armorHighlight}" stroke-width="3" stroke-linecap="round" opacity="0.75" />

          <g transform="translate(342, 198)">
            <polygon points="0,-12 24,0 0,12 -24,0" fill="${p.frameMain}" stroke="${p.seamStroke}" stroke-width="1.3" />
            <polygon class="cc-pulse" points="0,-7 15,0 0,7 -15,0" fill="${p.energyMain}" />
            <circle cx="0" cy="0" r="14" fill="url(#${idPrefix}-energy-glow)" class="cc-pulse" />
          </g>

          <path d="M 216 210 C 168 214, 118 208, 86 226 C 122 238, 172 238, 224 228 Z" fill="url(#${idPrefix}-armor-v)" stroke="${p.seamStroke}" stroke-width="1.5" stroke-linejoin="round" />
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
          <path d="M 278 224 C 362 232, 476 286, 616 378 L 538 366 C 436 334, 338 286, 266 240 Z" fill="url(#${idPrefix}-armor-v)" stroke="${p.seamStroke}" stroke-width="1.7" stroke-linejoin="round" />
          <path d="M 328 242 L 368 294 M 398 268 L 438 326 M 468 302 L 504 352" stroke="${p.seamStroke}" stroke-width="1.25" opacity="0.8" />
          <path class="cc-pulse" d="M 304 238 C 392 266, 480 310, 566 360" fill="none" stroke="${p.energyMain}" stroke-width="2.4" stroke-dasharray="14 6" />
          <circle cx="318" cy="238" r="16" fill="${p.frameMain}" stroke="${p.seamStroke}" stroke-width="1.4" />
          <circle cx="318" cy="238" r="9" fill="${p.frameDark}" stroke="${p.accentMain}" stroke-width="2.4" />
          <circle class="cc-pulse" cx="318" cy="238" r="3.5" fill="${p.energyBright}" />
          <path d="M 548 342 L 616 378 L 574 374 L 532 354 Z" fill="url(#${idPrefix}-accent-v)" stroke="${p.seamStroke}" stroke-width="1.2" />
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
    <g transform="translate(460, 200) rotate(-14) scale(0.90) translate(-460, -210)">
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
        ${renderCable({ d: "M 510 198 C 620 184, 730 162, 856 176", tipX: 856, tipY: 176, variant: "white-rib", width: 3.2, tipColor: "orange", animClass: "cc-c1", originX: 510, originY: 198 }, p)}
        ${renderCable({ d: "M 510 214 C 620 228, 730 250, 856 236", tipX: 856, tipY: 236, variant: "ribbed", width: 3.4, tipColor: "green", animClass: "cc-c2", originX: 510, originY: 214 }, p)}

        <!-- Symmetric Manta Delta Wings -->
        <g class="cc-wing-far" style="transform-origin: 310px 180px;">
          ${[0, 1, 2, 3].slice(0, stage <= 2 ? 2 : 4).map((i) => renderFeather({ x: 332 + i * 36, y: 152 - i * 24, length: 102, width: 15, angle: -24 + i * 5, curve: -8, orangeTip: true, greenTip: i === 2, animClass: `cc-f${i + 1}` }, p, idPrefix)).join("")}
          <path d="M 220 184 C 280 120, 390 66, 512 44 L 460 126 L 348 184 Z" fill="url(#${idPrefix}-armor-v)" stroke="${p.seamStroke}" stroke-width="1.6" />
          <path d="M 456 62 L 512 44 L 494 74 L 444 86 Z" fill="${p.accentMain}" stroke="${p.seamStroke}" stroke-width="1.1" />
        </g>

        <g class="cc-wing-near" style="transform-origin: 310px 232px;">
          ${[0, 1, 2, 3].slice(0, stage <= 2 ? 2 : 4).map((i) => renderFeather({ x: 332 + i * 36, y: 260 + i * 24, length: 102, width: 15, angle: 24 - i * 5, curve: 8, orangeTip: true, greenTip: i === 2, animClass: `cc-f${i + 2}` }, p, idPrefix)).join("")}
          <path d="M 220 228 C 280 292, 390 346, 512 368 L 460 286 L 348 228 Z" fill="url(#${idPrefix}-armor-v)" stroke="${p.seamStroke}" stroke-width="1.6" />
          <path d="M 456 350 L 512 368 L 494 338 L 444 326 Z" fill="${p.accentMain}" stroke="${p.seamStroke}" stroke-width="1.1" />
        </g>

        <!-- Central Manta Fuselage (Top View) -->
        <path d="M 140 206 L 236 160 L 512 192 L 512 220 L 236 252 Z" fill="url(#${idPrefix}-armor-d)" stroke="${p.seamStroke}" stroke-width="1.7" />
        <!-- Twin Cephalic Prongs -->
        <path d="M 184 182 L 96 168 L 128 194 L 194 196 Z" fill="url(#${idPrefix}-armor-v)" stroke="${p.seamStroke}" stroke-width="1.3" />
        <path d="M 184 230 L 96 244 L 128 218 L 194 216 Z" fill="url(#${idPrefix}-armor-v)" stroke="${p.seamStroke}" stroke-width="1.3" />
        <polygon class="cc-pulse" points="296,194 330,206 296,218 262,206" fill="${p.energyMain}" stroke="${p.seamStroke}" stroke-width="1.2" />
      </g>
    </g>
  `;
}

/* -------------------------------------------------------------------------- */
/* 2-ROW HUD TELEMETRY BAR (NO COLLISIONS, LANGUAGE CHIPS + STAGE TRACK)      */
/* -------------------------------------------------------------------------- */

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
  const yOffset = config.showHud ? -6 : 14;
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

export { buildAnimationStyles, buildDefs };
