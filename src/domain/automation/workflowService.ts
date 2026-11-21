import {
  DEFAULT_LANGUAGES,
  ORIGINAL_CREATURE_SWATCHES,
  type CreatureConfig,
} from "@/domain/creature/entities";
import { GLYPHS_5X7 } from "@/domain/creature/pixelArt";
import { getCreatureMeta, getSpriteKey } from "@/domain/creature/services";
import type { ReadmeConfig } from "@/domain/profile/entities";

export function getMidnightCronForTimezone(offsetMinutesEast: number): string {
  let utcMinutes = (24 * 60 - offsetMinutesEast) % (24 * 60);
  if (utcMinutes < 0) utcMinutes += 24 * 60;
  const hour = Math.floor(utcMinutes / 60);
  const minute = utcMinutes % 60;
  return `${minute} ${hour} * * *`;
}

export function generateCreatureConfigJson(
  creatureConfig: CreatureConfig,
  readmeConfig: ReadmeConfig
): string {
  return JSON.stringify(
    {
      ...creatureConfig,
      readme: {
        align: readmeConfig.align,
        imageWidth: readmeConfig.imageWidth,
        useOutputBranchUrl: readmeConfig.useOutputBranchUrl,
        includeMarkers: readmeConfig.includeMarkers,
        statsTableTitle: readmeConfig.statsTableTitle,
      },
    },
    null,
    2
  );
}

export function generateEvolveWorkflowYaml(
  config: CreatureConfig,
  cronExpression = "0 0 * * *"
): string {
  return `name: Evolve Cyber Creature & Profile Details

on:
  schedule:
    - cron: "${cronExpression}"
  workflow_dispatch:

permissions:
  contents: write

concurrency:
  group: evolve-creature
  cancel-in-progress: true

jobs:
  evolve:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout repository
        uses: actions/checkout@v7

      - name: Setup Node.js
        uses: actions/setup-node@v7
        with:
          node-version: "22"

      - name: Install Sharp WebP encoder
        run: npm install --no-save --prefix /tmp/creature-deps sharp

      - name: Fetch Live Telemetry & Regenerate Animated creature.webp
        env:
          GITHUB_TOKEN: \${{ secrets.GITHUB_TOKEN }}
          PROFILE_PAT: \${{ secrets.PROFILE_PAT }}
          GITHUB_USERNAME: \${{ github.repository_owner }}
          CREATURE_WINDOW: "${config.windowMode}"
          CREATURE_VIEW: "${config.view}"
        run: NODE_PATH=/tmp/creature-deps/node_modules node scripts/evolve-creature.mjs

      - name: Commit updated creature.webp, creature-config.json & README.md
        run: |
          git config user.name "github-actions[bot]"
          git config user.email "41898282+github-actions[bot]@users.noreply.github.com"
          git add creature.webp README.md creature-config.json 2>/dev/null || true
          if ! git diff --cached --quiet; then
            git commit -m "chore: 12AM daily profile & creature telemetry update"
            git pull --rebase origin "\${{ github.ref_name }}"
            git push
          else
            echo "No profile telemetry changes detected."
          fi
`;
}

export function generateEvolveScriptMjs(
  creatureConfig: CreatureConfig,
  readmeConfig: ReadmeConfig
): string {
  const embeddedConfig = JSON.parse(
    generateCreatureConfigJson(creatureConfig, readmeConfig)
  );
  const spriteKey = getSpriteKey(creatureConfig.creature, creatureConfig.view);
  const meta = getCreatureMeta(creatureConfig.creature);
  const glyphsJson = JSON.stringify(GLYPHS_5X7);
  const defaultLangsJson = JSON.stringify(DEFAULT_LANGUAGES);
  const swatchesJson = JSON.stringify(ORIGINAL_CREATURE_SWATCHES);

  return `import fs from "node:fs";
import path from "node:path";
import { createRequire } from "node:module";

const LOGICAL_WIDTH = 460;
const LOGICAL_HEIGHT = 230;
const CANVAS_WIDTH = 920;
const CANVAS_HEIGHT = 460;
const BASE_LOOP_DURATION_MS = 2800;
const FRAME_COUNT = 24;
const STAGE_SCALES = [0.46, 0.6, 0.74, 0.89, 1.05];

const STAGES = [
  { stage: 1, rank: "CALF", min: 0 },
  { stage: 2, rank: "YOUNG", min: 150 },
  { stage: 3, rank: "SUB-ADULT", min: 500 },
  { stage: 4, rank: "MATURE", min: 1200 },
  { stage: 5, rank: "ELDER", min: 2500 },
];

const EMBEDDED_CONFIG = ${JSON.stringify(embeddedConfig, null, 2)};
const DEFAULT_SPRITE_KEY = ${JSON.stringify(spriteKey)};
const CREATURE_DESIGNATION = ${JSON.stringify(meta.designation)};
const CREATURE_DISPLAY_NAME = ${JSON.stringify(meta.name)};
const GLYPHS_5X7 = ${glyphsJson};
const DEFAULT_LANGUAGES = ${defaultLangsJson};
const ORIGINAL_CREATURE_SWATCHES = ${swatchesJson};

function loadConfig() {
  const cfgPath = path.resolve("creature-config.json");
  if (fs.existsSync(cfgPath)) {
    try {
      const parsed = JSON.parse(fs.readFileSync(cfgPath, "utf8"));
      return {
        ...EMBEDDED_CONFIG,
        ...parsed,
        colors: { ...EMBEDDED_CONFIG.colors, ...(parsed.colors || {}) },
        readme: { ...EMBEDDED_CONFIG.readme, ...(parsed.readme || {}) },
      };
    } catch {
      return EMBEDDED_CONFIG;
    }
  }
  return EMBEDDED_CONFIG;
}

async function loadSharp() {
  const req = createRequire(import.meta.url);
  const nodePathDirs = (process.env.NODE_PATH || "")
    .split(path.delimiter)
    .filter(Boolean)
    .map((dir) => path.join(dir, "sharp"));
  const candidates = [
    ...nodePathDirs,
    "/tmp/creature-deps/node_modules/sharp",
    path.resolve("node_modules/sharp"),
  ];
  for (const candidate of candidates) {
    if (fs.existsSync(candidate)) {
      return req(candidate);
    }
  }
  return req("sharp");
}

function getEvolutionStage(commits) {
  const safe = Math.max(0, Math.floor(commits || 0));
  for (let i = STAGES.length - 1; i >= 0; i--) {
    if (safe >= STAGES[i].min) return STAGES[i];
  }
  return STAGES[0];
}

function clamp(v, lo, hi) {
  return v < lo ? lo : v > hi ? hi : v;
}

function smoothstep(e0, e1, x) {
  const t = clamp((x - e0) / (e1 - e0), 0, 1);
  return t * t * (3 - 2 * t);
}

function hexToRgb(hex, fallback = "#2C4156") {
  const clean = (hex || fallback).trim().replace("#", "");
  if (!/^[0-9a-fA-F]{6}$/.test(clean)) {
    return hexToRgb(fallback, "#2C4156");
  }
  return [
    parseInt(clean.slice(0, 2), 16),
    parseInt(clean.slice(2, 4), 16),
    parseInt(clean.slice(4, 6), 16),
  ];
}

function mixHex(hexA, hexB, weightB) {
  const [r1, g1, b1] = hexToRgb(hexA);
  const [r2, g2, b2] = hexToRgb(hexB);
  const w = clamp(weightB, 0, 1);
  return (
    "#" +
    [r1 * (1 - w) + r2 * w, g1 * (1 - w) + g2 * w, b1 * (1 - w) + b2 * w]
      .map((n) => clamp(Math.round(n), 0, 255).toString(16).padStart(2, "0"))
      .join("")
      .toUpperCase()
  );
}

function getLuminance(hex) {
  const [r, g, b] = hexToRgb(hex).map((v) => v / 255);
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function rgbToHsl(r, g, b) {
  const rn = r / 255;
  const gn = g / 255;
  const bn = b / 255;
  const max = Math.max(rn, gn, bn);
  const min = Math.min(rn, gn, bn);
  const l = (max + min) / 2;
  if (max === min) return [0, 0, l];
  const d = max - min;
  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
  let h = 0;
  if (max === rn) h = (gn - bn) / d + (gn < bn ? 6 : 0);
  else if (max === gn) h = (bn - rn) / d + 2;
  else h = (rn - gn) / d + 4;
  return [h * 60, s, l];
}

function hslToRgb(h, s, l) {
  const hue = ((h % 360) + 360) % 360;
  if (s <= 0.0001) {
    const g = Math.round(clamp(l, 0, 1) * 255);
    return [g, g, g];
  }
  const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
  const p = 2 * l - q;
  const hue2rgb = (t) => {
    let tt = t < 0 ? t + 1 : t > 1 ? t - 1 : t;
    if (tt < 1 / 6) return p + (q - p) * 6 * tt;
    if (tt < 1 / 2) return q;
    if (tt < 2 / 3) return p + (q - p) * (2 / 3 - tt) * 6;
    return p;
  };
  const hn = hue / 360;
  return [
    Math.round(hue2rgb(hn + 1 / 3) * 255),
    Math.round(hue2rgb(hn) * 255),
    Math.round(hue2rgb(hn - 1 / 3) * 255),
  ];
}

function ensureLanguageSlots(languages, count) {
  const merged = [];
  const seen = new Set();
  for (const lang of languages || []) {
    const key = String(lang?.name || "").trim().toLowerCase();
    if (!key || seen.has(key)) continue;
    seen.add(key);
    merged.push({ ...lang, color: lang.color || "#3178C6" });
  }
  for (const fallback of DEFAULT_LANGUAGES) {
    if (merged.length >= count) break;
    const key = fallback.name.toLowerCase();
    if (!seen.has(key)) {
      seen.add(key);
      merged.push({ ...fallback });
    }
  }
  return merged;
}

function resolveWaterMode(config) {
  if (config.waterMode === "water" || config.waterMode === "no-water" || config.waterMode === "clear") {
    return config.waterMode;
  }
  return config.inWater === false ? "no-water" : "water";
}

function getVisibleLanguages(config) {
  const count = config.languageCount === 7 || config.languageCount === 5 ? config.languageCount : 3;
  const sliced = ensureLanguageSlots(config.languages, count).slice(0, count);
  if (config.colorMode === "canonical") {
    const swatches = ORIGINAL_CREATURE_SWATCHES[config.creature] || ORIGINAL_CREATURE_SWATCHES.tulkun;
    return sliced.map((lang, idx) => ({ ...lang, color: swatches[idx % swatches.length] }));
  }
  return sliced;
}

function resolveHudFontColor(config) {
  const custom = String(config.hudFontColor || "").trim();
  if (/^#[0-9a-fA-F]{6}$/.test(custom)) return custom.toUpperCase();
  const isLightBg = resolveWaterMode(config) !== "water" && config.backgroundMode !== "transparent" && getLuminance(config.colors.background) > 0.55;
  return isLightBg ? "#0F172A" : "#D8F3FF";
}

function blendRgbaPixel(buf, px, py, r, g, b, a) {
  if (px < 0 || px >= LOGICAL_WIDTH || py < 0 || py >= LOGICAL_HEIGHT || a <= 0) return;
  const idx = (py * LOGICAL_WIDTH + px) * 4;
  if (a >= 255 || buf[idx + 3] === 0) {
    buf[idx] = r; buf[idx + 1] = g; buf[idx + 2] = b; buf[idx + 3] = a;
    return;
  }
  const alpha = a / 255;
  const inv = 1 - alpha;
  buf[idx] = Math.round(r * alpha + buf[idx] * inv);
  buf[idx + 1] = Math.round(g * alpha + buf[idx + 1] * inv);
  buf[idx + 2] = Math.round(b * alpha + buf[idx + 2] * inv);
  buf[idx + 3] = Math.min(255, Math.round(a + buf[idx + 3] * inv));
}

function recolorSprite(sprite, config) {
  if (config.colorMode === "canonical") return sprite;

  const visibleLangs = getVisibleLanguages(config);
  const langHsls = visibleLangs.map((lang) => rgbToHsl(...hexToRgb(lang.color)));
  const zonePalette = config.colorMode === "languages" && langHsls.length > 0
    ? langHsls
    : [rgbToHsl(...hexToRgb(config.colors.primary)), rgbToHsl(...hexToRgb(config.colors.accent)), rgbToHsl(...hexToRgb(config.colors.energy))];
  const zoneCount = zonePalette.length;
  const view = config.creature === "jellyfish" ? "side" : (config.view === "top" ? "top" : "side");

  const out = new Uint8ClampedArray(sprite.data.length);
  const src = sprite.data;
  const w = sprite.width;
  const hPx = sprite.height;

  const measureVerticalSpan = (x, y) => {
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
    const r = src[i], g = src[i + 1], b = src[i + 2];
    const [h, s, l] = rgbToHsl(r, g, b);
    if (l < 0.13 || (l > 0.9 && s < 0.16)) {
      out[i] = r; out[i + 1] = g; out[i + 2] = b; out[i + 3] = a;
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
      } else if (zoneCount >= 5 && (view === "top" ? (u >= 0.22 && u <= 0.46 && Math.abs(v) > 0.31) : (u >= 0.28 && u <= 0.54 && v > 0.11 - 0.35 * Math.max(0, u - 0.28)))) {
        zoneIdx = 3 % zoneCount;
      } else if (zoneCount >= 7 && (view === "side" ? (v > 0.04 && u >= 0.05 && u < 0.77 && (s <= 0.2 || l > 0.42)) : (u >= 0.58 && u < 0.79 && Math.abs(v) > 0.145))) {
        zoneIdx = 5 % zoneCount;
      } else if (zoneCount >= 7 && u >= 0.24 && u < (view === "top" ? 0.79 : 0.77) && l >= 0.33 && (view === "top" || v <= 0.04)) {
        zoneIdx = 6 % zoneCount;
      } else if (s <= 0.15 && l > 0.65) {
        const [pH, pS] = zonePalette[0];
        const rgb = hslToRgb(pH, Math.min(0.16, pS * 0.32), l);
        out[i] = rgb[0]; out[i + 1] = rgb[1]; out[i + 2] = rgb[2]; out[i + 3] = a;
        continue;
      } else {
        zoneIdx = 0;
      }
    } else {
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
    const targetL = clamp(zL * 0.32 + l * 0.68 + (l - 0.42) * 0.22, 0.16, 0.9);
    const targetS = clamp(zS * 0.92 + s * 0.1, 0.12, 0.98);
    const rgb = hslToRgb(zH, targetS, targetL);
    out[i] = rgb[0]; out[i + 1] = rgb[1]; out[i + 2] = rgb[2]; out[i + 3] = a;
  }
  return { width: sprite.width, height: sprite.height, data: out };
}

function fillRectRgba(buf, x, y, w, h, rgba) {
  const x0 = Math.max(0, Math.floor(x));
  const y0 = Math.max(0, Math.floor(y));
  const x1 = Math.min(LOGICAL_WIDTH, Math.ceil(x + w));
  const y1 = Math.min(LOGICAL_HEIGHT, Math.ceil(y + h));
  const [r, g, b, a] = rgba;
  for (let py = y0; py < y1; py++) {
    for (let px = x0; px < x1; px++) {
      blendRgbaPixel(buf, px, py, r, g, b, a);
    }
  }
}

function measureTextWidth(text, fontSize, family, weight) {
  if (family === "pixel") {
    const unit = fontSize / 7;
    return Math.max(0, text.length * 6 * unit - unit);
  }
  const ratio = family === "mono" ? 0.66 : family === "serif" ? 0.6 : weight === "bold" ? 0.62 : 0.58;
  return text.length * fontSize * ratio;
}

function computeHudLayout(config) {
  const stageInfo = getEvolutionStage(config.commits);
  const titleText = (config.customTitle || "").trim()
    ? config.customTitle.trim().toUpperCase()
    : \`\${stageInfo.rank} \${String(config.creature || "tulkun").toUpperCase()}\`;
  const commitsStr = Math.max(0, Math.floor(config.commits || 0)).toLocaleString("en-US");
  const fontSize = clamp(Math.round(config.hudFontSize || 14), 12, 22);
  const chipFontSize = Math.max(10, Math.round(fontSize * 0.86));
  const fontFamily = config.hudFontFamily === "mono" || config.hudFontFamily === "sans" || config.hudFontFamily === "serif" ? config.hudFontFamily : "pixel";
  const fontWeight = config.hudFontWeight === "normal" || config.hudFontWeight === "semibold" ? config.hudFontWeight : "bold";
  const align = config.hudAlign === "center" || config.hudAlign === "right" ? config.hudAlign : "left";
  const fontColor = resolveHudFontColor(config);
  const accentColor = config.colors?.accent || "#C86D3B";

  const line1Text = \`STAGE \${stageInfo.stage}: \${titleText}\`;
  const line2Text = \`CONTRIBUTIONS: \${commitsStr}\`;

  const swatchSize = Math.max(8, Math.round(fontSize * 0.68));
  const swatchGap = Math.max(6, Math.round(fontSize * 0.45));
  const line1Width = swatchSize + swatchGap + measureTextWidth(line1Text, fontSize, fontFamily, fontWeight);
  const line2Width = measureTextWidth(line2Text, fontSize, fontFamily, fontWeight);

  const chipSwatch = Math.max(7, Math.round(chipFontSize * 0.62));
  const chipSwatchGap = Math.max(5, Math.round(chipFontSize * 0.4));
  const chipSpacer = 22;
  const maxHudWidth = CANVAS_WIDTH - 80;
  const visibleLangs = getVisibleLanguages(config);
  const wrappedRows = [];
  let curItems = [], curWidth = 0;

  for (const lang of visibleLangs) {
    const nameShort = lang.name.toUpperCase().slice(0, 10);
    const itemW = chipSwatch + chipSwatchGap + measureTextWidth(nameShort, chipFontSize, fontFamily, fontWeight);
    const added = curItems.length === 0 ? itemW : chipSpacer + itemW;
    if (curItems.length > 0 && curWidth + added > maxHudWidth) {
      wrappedRows.push({ items: curItems, totalWidth: curWidth });
      curItems = [{ name: nameShort, color: lang.color, swatchSize: chipSwatch, width: itemW }];
      curWidth = itemW;
    } else {
      curItems.push({ name: nameShort, color: lang.color, swatchSize: chipSwatch, width: itemW });
      curWidth += added;
    }
  }
  if (curItems.length > 0) wrappedRows.push({ items: curItems, totalWidth: curWidth });

  const lineStep = Math.round(fontSize * 1.38);
  const chipStep = Math.round(chipFontSize * 1.45);
  const totalHeight = lineStep * 2 + 4 + wrappedRows.length * chipStep;
  const topY = Math.max(12, CANVAS_HEIGHT - 14 - totalHeight);
  const line1Y = topY, line2Y = topY + lineStep, chipsStartY = line2Y + lineStep + 4;
  return {
    topY, fontSize, chipFontSize, fontFamily, fontWeight, fontColor, align, accentColor, swatchSize,
    line1Text, line1Y, line1Width, line2Text, line2Y, line2Width,
    chipRows: wrappedRows.map((row, idx) => ({ y: chipsStartY + idx * chipStep, totalWidth: row.totalWidth, items: row.items })),
  };
}

function escapeXml(str) {
  return String(str).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&apos;");
}

function getRowStartX(align, rowWidth) {
  if (align === "center") return (CANVAS_WIDTH - rowWidth) * 0.5;
  if (align === "right") return CANVAS_WIDTH - 40 - rowWidth;
  return 40;
}

function pixelTextSvgRects(text, ox, oy, fontSize, weight, color) {
  const upper = String(text || "").toUpperCase();
  const unit = fontSize / 7;
  const dotExpand = weight === "bold" ? Math.max(0.45, unit * 0.22) : weight === "semibold" ? Math.max(0.2, unit * 0.1) : 0;
  let cx = ox;
  let rects = "";
  for (let i = 0; i < upper.length; i++) {
    const glyph = GLYPHS_5X7[upper[i]] || GLYPHS_5X7[" "];
    for (let row = 0; row < glyph.length; row++) {
      const bits = glyph[row];
      for (let col = 0; col < bits.length; col++) {
        if (bits[col] === "1") {
          const rx = Math.round(cx + col * unit);
          const ry = Math.round(oy + row * unit);
          const rw = Math.max(1, Math.ceil(unit + dotExpand));
          const rh = Math.max(1, Math.ceil(unit));
          rects += \`<rect x="\${rx}" y="\${ry}" width="\${rw}" height="\${rh}" fill="\${color}" />\`;
        }
      }
    }
    cx += 6 * unit;
  }
  return rects;
}

function buildHudSvgOverlay(config) {
  if (!config.showHud) return null;
  const layout = computeHudLayout(config);
  const swatchGap1 = Math.max(6, Math.round(layout.fontSize * 0.45));
  const row1X = getRowStartX(layout.align, layout.line1Width);
  const row1SwatchY = layout.line1Y + Math.round((layout.fontSize - layout.swatchSize) * 0.5);
  const text1X = row1X + layout.swatchSize + swatchGap1;
  const row2X = getRowStartX(layout.align, layout.line2Width);
  const svgWeight = layout.fontWeight === "normal" ? "400" : layout.fontWeight === "semibold" ? "600" : "700";
  const svgFamily = layout.fontFamily === "mono" ? "monospace" : layout.fontFamily === "serif" ? "serif" : "sans-serif";

  const parts = [];
  parts.push(\`<rect x="\${Math.round(row1X)}" y="\${Math.round(row1SwatchY)}" width="\${layout.swatchSize}" height="\${layout.swatchSize}" rx="2" fill="\${layout.accentColor}" />\`);

  if (layout.fontFamily === "pixel") {
    parts.push(pixelTextSvgRects(layout.line1Text, text1X, layout.line1Y, layout.fontSize, layout.fontWeight, layout.fontColor));
    parts.push(pixelTextSvgRects(layout.line2Text, row2X, layout.line2Y, layout.fontSize, layout.fontWeight, layout.fontColor));
  } else {
    parts.push(\`<text x="\${Math.round(text1X)}" y="\${Math.round(layout.line1Y + layout.fontSize * 0.88)}" font-family="\${svgFamily}" font-size="\${layout.fontSize}" font-weight="\${svgWeight}" fill="\${layout.fontColor}">\${escapeXml(layout.line1Text)}</text>\`);
    parts.push(\`<text x="\${Math.round(row2X)}" y="\${Math.round(layout.line2Y + layout.fontSize * 0.88)}" font-family="\${svgFamily}" font-size="\${layout.fontSize}" font-weight="\${svgWeight}" fill="\${layout.fontColor}">\${escapeXml(layout.line2Text)}</text>\`);
  }

  const chipSwatchGap = Math.max(5, Math.round(layout.chipFontSize * 0.4));
  for (const row of layout.chipRows) {
    let cx = getRowStartX(layout.align, row.totalWidth);
    for (const item of row.items) {
      const sy = row.y + Math.round((layout.chipFontSize - item.swatchSize) * 0.5);
      parts.push(\`<rect x="\${Math.round(cx)}" y="\${Math.round(sy)}" width="\${item.swatchSize}" height="\${item.swatchSize}" rx="2" fill="\${item.color}" />\`);
      const labelX = cx + item.swatchSize + chipSwatchGap;
      if (layout.fontFamily === "pixel") {
        parts.push(pixelTextSvgRects(item.name, labelX, row.y, layout.chipFontSize, layout.fontWeight, layout.fontColor));
      } else {
        parts.push(\`<text x="\${Math.round(labelX)}" y="\${Math.round(row.y + layout.chipFontSize * 0.88)}" font-family="\${svgFamily}" font-size="\${layout.chipFontSize}" font-weight="\${svgWeight}" fill="\${layout.fontColor}">\${escapeXml(item.name)}</text>\`);
      }
      cx += item.width + 22;
    }
  }

  return Buffer.from(\`<svg xmlns="http://www.w3.org/2000/svg" width="\${CANVAS_WIDTH}" height="\${CANVAS_HEIGHT}"><rect width="\${CANVAS_WIDTH}" height="\${CANVAS_HEIGHT}" fill="none" />\${parts.join("")}</svg>\`);
}

function drawUnderwaterBackdrop(buf, phase, config, hudTopLogicalY) {
  const t = phase * Math.PI * 2;
  const isTransparent = config.backgroundMode === "transparent";
  const maxWaterY = config.showHud ? Math.max(120, Math.min(204, Math.floor(hudTopLogicalY - 2))) : 214;
  if (isTransparent) {
    const cx = LOGICAL_WIDTH * 0.5, cy = config.showHud ? Math.round(maxWaterY * 0.52) : 112, rx = 212, ry = config.showHud ? Math.max(66, Math.round(maxWaterY * 0.48)) : 104;
    for (let y = 0; y < LOGICAL_HEIGHT; y++) {
      const ny = (y - cy) / ry;
      if (ny * ny >= 1) continue;
      for (let x = 0; x < LOGICAL_WIDTH; x++) {
        const nx = (x - cx) / rx;
        const r2 = nx * nx + ny * ny;
        if (r2 >= 1) continue;
        const falloff = Math.pow(1 - Math.sqrt(r2), 1.65);
        const depthT = y / LOGICAL_HEIGHT;
        blendRgbaPixel(buf, x, y, Math.round(12 + (1 - depthT) * 14), Math.round(48 + (1 - depthT) * 52), Math.round(92 + (1 - depthT) * 68), Math.round(170 * falloff));
      }
    }
  } else {
    for (let y = 0; y < LOGICAL_HEIGHT; y++) {
      const depth = y / LOGICAL_HEIGHT;
      const topMix = 1 - depth;
      const r = Math.round(8 + topMix * 16), g = Math.round(30 + topMix * 56), b = Math.round(62 + topMix * 84);
      const a = Math.round(72 + Math.abs(0.5 - depth) * 32);
      for (let x = 0; x < LOGICAL_WIDTH; x++) blendRgbaPixel(buf, x, y, r, g, b, a);
    }
  }

  const rayBases = [65, 138, 224, 308, 382], rayWidths = [18, 24, 28, 20, 16];
  const rayMaxY = maxWaterY;
  for (let i = 0; i < rayBases.length; i++) {
    const baseX = rayBases[i] + Math.sin(t + i * 1.35) * 9, width = rayWidths[i];
    for (let y = 4; y < rayMaxY; y++) {
      const vFrac = y / rayMaxY, fadeY = (1 - vFrac) * smoothstep(0, 16, y);
      const center = baseX + vFrac * 26, halfW = (width * (0.65 + vFrac * 0.7)) * 0.5;
      const x0 = Math.max(8, Math.floor(center - halfW)), x1 = Math.min(LOGICAL_WIDTH - 8, Math.ceil(center + halfW));
      const edgeFade = isTransparent ? smoothstep(20, 75, center) * smoothstep(LOGICAL_WIDTH - 20, LOGICAL_WIDTH - 75, center) : 1;
      for (let x = x0; x < x1; x++) {
        const dxNorm = Math.abs(x - center) / Math.max(1, halfW);
        const alpha = Math.round(28 * (1 - dxNorm * dxNorm) * fadeY * edgeFade);
        if (alpha > 2) blendRgbaPixel(buf, x, y, 135, 222, 255, alpha);
      }
    }
  }

  for (let s = 0; s < 6; s++) {
    const baseY = 26 + s * 24;
    if (baseY > rayMaxY - 8) continue;
    const segLen = 36 + (s % 3) * 18;
    const scrollX = ((s * 83 + phase * LOGICAL_WIDTH) % (LOGICAL_WIDTH + 60)) - 30;
    for (let k = 0; k < segLen; k++) {
      const px = Math.round(scrollX + k);
      if (px < 18 || px > LOGICAL_WIDTH - 18) continue;
      const py = Math.round(baseY + Math.sin(k * 0.16 + t + s) * 2.2);
      blendRgbaPixel(buf, px, py, 165, 232, 255, Math.round(32 * Math.sin((k / segLen) * Math.PI)));
    }
  }

  const maxBubbleY = maxWaterY;
  for (let i = 0; i < 10; i++) {
    const seedX = ((i * 67 + 29) % 100) / 100, seedY = ((i * 43 + 11) % 100) / 100;
    const bx = Math.round(36 + seedX * (LOGICAL_WIDTH - 72) + Math.sin(t + i * 1.1) * 3.5);
    const rise = (seedY + phase) % 1, by = Math.round(maxBubbleY - rise * (maxBubbleY - 14));
    const alpha = Math.round(145 * Math.sin(rise * Math.PI));
    if (alpha > 12) fillRectRgba(buf, bx, by, i % 3 === 0 ? 2 : 1, i % 3 === 0 ? 2 : 1, [178, 236, 255, alpha]);
  }
}

function drawUnderwaterForegroundBubbles(buf, phase, config, hudTopLogicalY) {
  if (resolveWaterMode(config) !== "water") return;
  const t = phase * Math.PI * 2, maxBubbleY = config.showHud ? Math.max(120, Math.min(204, Math.floor(hudTopLogicalY - 2))) : 214;
  for (let i = 0; i < 6; i++) {
    const seedX = ((i * 89 + 17) % 100) / 100, seedY = ((i * 53 + 23) % 100) / 100;
    const mul = i % 2 === 0 ? 1 : 2, rise = (seedY + phase * mul) % 1;
    const bx = Math.round(46 + seedX * (LOGICAL_WIDTH - 92) + Math.sin(t * mul + i * 2.1) * 4.5);
    const by = Math.round(maxBubbleY - rise * (maxBubbleY - 16));
    const alpha = Math.round(180 * Math.sin(rise * Math.PI));
    if (alpha < 18) continue;
    if (i < 2) {
      const rim = [148, 224, 255, alpha], gleam = [235, 250, 255, Math.min(255, alpha + 40)];
      fillRectRgba(buf, bx + 1, by, 2, 1, rim); fillRectRgba(buf, bx + 1, by + 3, 2, 1, rim);
      fillRectRgba(buf, bx, by + 1, 1, 2, rim); fillRectRgba(buf, bx + 3, by + 1, 1, 2, rim);
      fillRectRgba(buf, bx + 1, by + 1, 1, 1, gleam);
    } else {
      fillRectRgba(buf, bx, by, 2, 2, [200, 242, 255, alpha]);
    }
  }
}

function invertDisplacement(creature, view, lx, ly, drawW, drawH, stageScale, t) {
  const ampScale = 0.55 + 0.45 * stageScale;
  if (creature === "jellyfish") {
    const pulse = (0.62 * Math.sin(t) + 0.26 * Math.sin(2 * t - 0.5) + 0.08 * Math.sin(3 * t - 1.0)) / 0.92;
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
    const waveY =
      14.5 * ampScale * Math.pow(trailT, 1.12) * Math.sin(1.65 * Math.PI * 2 * trailT - t + vPhase) +
      3.0 * ampScale * Math.pow(trailT, 1.35) * Math.sin(2.7 * Math.PI * 2 * trailT - 2 * t - vPhase);
    const dragX = 4.6 * ampScale * Math.pow(trailT, 0.85) * Math.sin(t - 0.65 - trailT * 1.4);
    const baseRimAttach = 1.0 - 0.11 * pulse * (1.0 - trailT * 0.85);
    const trailSrcX = lx - dragX;
    const trailSrcY = (ly - waveY) / baseRimAttach;

    return [
      bellSrcX * bellWeight + trailSrcX * trailWeight,
      bellSrcY * bellWeight + trailSrcY * trailWeight,
    ];
  }

  const isTop = view === "top";
  const maxAmp = (isTop ? 16.5 : 15.5) * ampScale;
  const k = isTop ? 1.45 : 1.35;
  const envPower = isTop ? 1.55 : 1.65;
  const envBase = isTop ? 0.09 : 0.11;
  let srcX = lx, srcY = ly;

  for (let iter = 0; iter < 2; iter++) {
    const u = clamp(srcX / drawW + 0.5, 0, 1);
    const v = clamp((srcY / drawH) * 2, -1, 1);
    const env = envBase + (1 - envBase) * Math.pow(u, envPower);
    const waveAngle = k * Math.PI * 2 * u - t;
    const spineY = maxAmp * env * Math.sin(waveAngle);
    const dEnv = (1 - envBase) * envPower * Math.pow(Math.max(u, 0.001), envPower - 1) / drawW;
    const dWave = (k * Math.PI * 2) / drawW;
    const slopeY = maxAmp * (dEnv * Math.sin(waveAngle) + env * Math.cos(waveAngle) * dWave);

    if (isTop) {
      const wingMask = Math.exp(-Math.pow((u - 0.34) / 0.11, 2)) * smoothstep(0.24, 0.52, Math.abs(v));
      srcY = ly - spineY - 2.8 * ampScale * wingMask * Math.sign(v) * Math.cos(t - 0.6);
      srcX = lx - 6.5 * ampScale * wingMask * Math.sin(t - 0.6) + slopeY * srcY * 0.28;
    } else {
      const finMask = Math.exp(-Math.pow((u - 0.42) / 0.13, 2)) * smoothstep(0.18, 0.58, v);
      srcY = ly - spineY - 3.2 * ampScale * finMask * Math.cos(t - 0.9);
      srcX = lx - 6.0 * ampScale * finMask * Math.sin(t - 0.9) + slopeY * srcY * 0.24;
    }
  }
  return [srcX, srcY];
}

function renderFrameRgba(recoloredSprite, config, phase) {
  const out = new Uint8ClampedArray(LOGICAL_WIDTH * LOGICAL_HEIGHT * 4);
  if (config.backgroundMode !== "transparent") {
    const [br, bg, bb] = hexToRgb(config.colors.background, "#0D1117");
    for (let i = 0; i < out.length; i += 4) {
      out[i] = br; out[i + 1] = bg; out[i + 2] = bb; out[i + 3] = 255;
    }
  }

  const waterMode = resolveWaterMode(config);
  const hudTopLogicalY = config.showHud ? computeHudLayout(config).topY * 0.5 : LOGICAL_HEIGHT;
  if (waterMode === "water") {
    drawUnderwaterBackdrop(out, phase, config, hudTopLogicalY);
  }

  const stageInfo = getEvolutionStage(config.commits);
  const stageScale = STAGE_SCALES[stageInfo.stage - 1] || 1.0;
  const view = config.creature === "jellyfish" ? "side" : (config.view === "top" ? "top" : "side");
  const t = phase * Math.PI * 2;
  const visibleLangs = getVisibleLanguages(config);

  if (waterMode !== "clear" && stageInfo.stage >= 2) {
    const count = stageInfo.stage === 2 ? 4 : stageInfo.stage === 3 ? 7 : stageInfo.stage === 4 ? 11 : 15;
    const useLangColors = config.colorMode !== "canonical" && visibleLangs.length > 0;
    const [er, eg, eb] = hexToRgb(mixHex(config.colors.energy, "#FFFFFF", 0.45));
    const [ar, ag, ab] = hexToRgb(config.colors.accent);
    const maxY = config.showHud ? Math.max(120, Math.min(204, Math.floor(hudTopLogicalY - 2))) : 216;
    for (let i = 0; i < count; i++) {
      const s1 = ((i * 73 + 19) % 100) / 100, s2 = ((i * 41 + 7) % 100) / 100, mul = (i % 3) + 1;
      const px = Math.round(28 + ((s1 + phase * mul) % 1) * (LOGICAL_WIDTH - 56));
      const py = Math.round(24 + s2 * (maxY - 36) + Math.sin((phase * mul + s1) * Math.PI * 2) * 4);
      const sz = i % 4 === 0 && stageInfo.stage >= 4 ? 2 : 1;
      const alpha = clamp(Math.round(135 + 50 * Math.sin((phase + s2) * Math.PI * 2) + 50), 90, 235);
      const rgb = useLangColors
        ? hexToRgb(mixHex(visibleLangs[i % visibleLangs.length].color, "#FFFFFF", 0.35))
        : (i % 5 === 0 && stageInfo.stage >= 4 ? [ar, ag, ab] : [er, eg, eb]);
      fillRectRgba(out, px, py, sz, sz, [rgb[0], rgb[1], rgb[2], alpha]);
    }
  }

  const availH = Math.max(96, hudTopLogicalY - 12);
  const baseFitW = view === "top" ? 340 : 356;
  const baseFitH = view === "top"
    ? (config.showHud ? Math.min(148, availH * 0.85) : 192)
    : (config.showHud ? Math.min(142, availH * 0.84) : 172);
  const maxFitW = baseFitW * stageScale;
  const maxFitH = baseFitH * stageScale;
  const fitScale = Math.min(maxFitW / recoloredSprite.width, maxFitH / recoloredSprite.height);
  const drawW = recoloredSprite.width * fitScale;
  const drawH = recoloredSprite.height * fitScale;
  const centerX = LOGICAL_WIDTH * 0.5;
  const centerY = config.showHud ? Math.max(54, Math.min(96, (hudTopLogicalY - 6) * 0.49)) : 115;

  const ampScale = 0.55 + 0.45 * stageScale;
  let gx = 0, gy = 0;
  if (config.creature === "jellyfish") {
    gx = (-6.5 * Math.sin(t - 0.45) - 1.6 * Math.sin(2 * t - 0.9)) * ampScale;
    gy = 2.4 * Math.sin(t + 0.5) * ampScale;
  } else if (view === "top") {
    gx = -2.2 * Math.cos(t) * ampScale;
    gy = 1.4 * Math.sin(t + 0.3) * ampScale;
  } else {
    gx = -2.6 * Math.cos(t) * ampScale;
    gy = 2.0 * Math.sin(t + 0.5) * ampScale;
  }

  const minDx = Math.max(0, Math.floor(centerX + gx - drawW * 0.5 - 24));
  const maxDx = Math.min(LOGICAL_WIDTH - 1, Math.ceil(centerX + gx + drawW * 0.5 + 24));
  const minDy = Math.max(0, Math.floor(centerY + gy - drawH * 0.5 - 30));
  const maxDy = Math.min(LOGICAL_HEIGHT - 1, Math.ceil(centerY + gy + drawH * 0.5 + 30));
  const srcData = recoloredSprite.data;

  for (let dy = minDy; dy <= maxDy; dy++) {
    const ly = dy - centerY - gy;
    for (let dx = minDx; dx <= maxDx; dx++) {
      const lx = dx - centerX - gx;
      const [slx, sly] = invertDisplacement(config.creature, view, lx, ly, drawW, drawH, stageScale, t);
      const sx = Math.round((slx / drawW + 0.5) * (recoloredSprite.width - 1));
      const sy = Math.round((sly / drawH + 0.5) * (recoloredSprite.height - 1));
      if (sx < 0 || sx >= recoloredSprite.width || sy < 0 || sy >= recoloredSprite.height) continue;
      const sp = (sy * recoloredSprite.width + sx) * 4;
      const sa = srcData[sp + 3];
      if (sa < 12) continue;
      blendRgbaPixel(out, dx, dy, srcData[sp], srcData[sp + 1], srcData[sp + 2], sa);
    }
  }

  drawUnderwaterForegroundBubbles(out, phase, config, hudTopLogicalY);
  return out;
}

function upscaleRgba2x(logical) {
  const out = Buffer.alloc(CANVAS_WIDTH * CANVAS_HEIGHT * 4);
  for (let y = 0; y < LOGICAL_HEIGHT; y++) {
    const r0 = y * 2 * CANVAS_WIDTH * 4, r1 = (y * 2 + 1) * CANVAS_WIDTH * 4;
    for (let x = 0; x < LOGICAL_WIDTH; x++) {
      const sp = (y * LOGICAL_WIDTH + x) * 4;
      const r = logical[sp], g = logical[sp + 1], b = logical[sp + 2], a = logical[sp + 3];
      const d0 = r0 + x * 8, d1 = r1 + x * 8;
      out[d0] = r; out[d0 + 1] = g; out[d0 + 2] = b; out[d0 + 3] = a;
      out[d0 + 4] = r; out[d0 + 5] = g; out[d0 + 6] = b; out[d0 + 7] = a;
      out[d1] = r; out[d1 + 1] = g; out[d1 + 2] = b; out[d1 + 3] = a;
      out[d1 + 4] = r; out[d1 + 5] = g; out[d1 + 6] = b; out[d1 + 7] = a;
    }
  }
  return out;
}

function writeUint32LE(buf, off, val) {
  buf[off] = val & 0xff; buf[off + 1] = (val >>> 8) & 0xff;
  buf[off + 2] = (val >>> 16) & 0xff; buf[off + 3] = (val >>> 24) & 0xff;
}
function writeUint24LE(buf, off, val) {
  buf[off] = val & 0xff; buf[off + 1] = (val >>> 8) & 0xff; buf[off + 2] = (val >>> 16) & 0xff;
}
function extractSingleWebPFrame(data) {
  if (data.toString("ascii", 0, 4) !== "RIFF" || data.toString("ascii", 8, 12) !== "WEBP") {
    throw new Error("Invalid single WebP frame");
  }
  let off = 12, alphChunk = null, imageChunkId = null, imageChunkPayload = null;
  while (off + 8 <= data.length) {
    const id = data.toString("ascii", off, off + 4);
    const size = data.readUInt32LE(off + 4);
    const payload = data.subarray(off + 8, off + 8 + size);
    if (id === "ALPH") alphChunk = payload;
    else if (id === "VP8 " || id === "VP8L") { imageChunkId = id; imageChunkPayload = payload; }
    off += 8 + size + (size % 2);
  }
  return { alphChunk, imageChunkId, imageChunkPayload, hasAlpha: Boolean(alphChunk) || imageChunkId === "VP8L" };
}
function makeChunk(id, payload) {
  const chunk = Buffer.alloc(8 + payload.length + (payload.length % 2));
  chunk.write(id, 0, "ascii");
  writeUint32LE(chunk, 4, payload.length);
  Buffer.from(payload).copy(chunk, 8);
  return chunk;
}
function assembleAnimatedWebP(width, height, frames, frameDelayMs) {
  const vp8x = Buffer.alloc(10);
  vp8x[0] = frames.some((f) => f.hasAlpha) ? 0x12 : 0x02;
  writeUint24LE(vp8x, 4, width - 1);
  writeUint24LE(vp8x, 7, height - 1);
  const anmfChunks = frames.map((f) => {
    const subs = [];
    if (f.alphChunk) subs.push(makeChunk("ALPH", f.alphChunk));
    subs.push(makeChunk(f.imageChunkId, f.imageChunkPayload));
    const subLen = subs.reduce((a, c) => a + c.length, 0);
    const anmf = Buffer.alloc(16 + subLen);
    writeUint24LE(anmf, 6, width - 1);
    writeUint24LE(anmf, 9, height - 1);
    writeUint24LE(anmf, 12, Math.max(20, Math.round(frameDelayMs)));
    anmf[15] = 0x02;
    let pos = 16;
    for (const s of subs) { s.copy(anmf, pos); pos += s.length; }
    return makeChunk("ANMF", anmf);
  });
  const chunks = [makeChunk("VP8X", vp8x), makeChunk("ANIM", Buffer.alloc(6)), ...anmfChunks];
  const bodySize = chunks.reduce((a, c) => a + c.length, 0);
  const finalBuf = Buffer.alloc(12 + bodySize);
  finalBuf.write("RIFF", 0, "ascii");
  writeUint32LE(finalBuf, 4, 4 + bodySize);
  finalBuf.write("WEBP", 8, "ascii");
  let cursor = 12;
  for (const c of chunks) { c.copy(finalBuf, cursor); cursor += c.length; }
  return finalBuf;
}

const LANGUAGE_COLORS = {
  TypeScript: "#3178C6", JavaScript: "#F1E05A", Python: "#3572A5", Rust: "#DEA584",
  Go: "#00ADD8", Java: "#B07219", "C++": "#F34B7D", C: "#555555", "C#": "#178600",
  PHP: "#4F5D95", Ruby: "#701516", Swift: "#F05138", Kotlin: "#A97BFF", Dart: "#00B4AB",
  HTML: "#E34C26", CSS: "#563D7C", Shell: "#89E051", Vue: "#41B883", Svelte: "#FF3E00",
  Dockerfile: "#384D54", YAML: "#CB171E", SQL: "#E38C00", "Jupyter Notebook": "#DA5B0B",
};

async function fetchLiveTelemetry(username, windowMode, fallbackCommits, fallbackLangs, languageCount) {
  const token = process.env.PROFILE_PAT || process.env.GITHUB_TOKEN || "";
  let commits = null;

  if (process.env.PROFILE_PAT) {
    try {
      const now = new Date();
      if (windowMode === "all-time") {
        const yearsQuery = \`query($login: String!) { user(login: $login) { contributionsCollection { contributionYears } } }\`;
        const yearsRes = await fetch("https://api.github.com/graphql", {
          method: "POST",
          headers: {
            Authorization: \`Bearer \${process.env.PROFILE_PAT}\`,
            "Content-Type": "application/json",
            "User-Agent": "dynamic-readme-creature",
          },
          body: JSON.stringify({ query: yearsQuery, variables: { login: username } }),
        });
        if (yearsRes.ok) {
          const yJson = await yearsRes.json();
          const years = yJson?.data?.user?.contributionsCollection?.contributionYears || [];
          if (Array.isArray(years) && years.length > 0) {
            let totalAll = 0;
            for (const yr of years) {
              const from = new Date(Date.UTC(yr, 0, 1)).toISOString();
              const to = new Date(Date.UTC(yr, 11, 31, 23, 59, 59)).toISOString();
              const q = \`query($login: String!, $from: DateTime!, $to: DateTime!) { user(login: $login) { contributionsCollection(from: $from, to: $to) { contributionCalendar { totalContributions } } } }\`;
              const r = await fetch("https://api.github.com/graphql", {
                method: "POST",
                headers: {
                  Authorization: \`Bearer \${process.env.PROFILE_PAT}\`,
                  "Content-Type": "application/json",
                  "User-Agent": "dynamic-readme-creature",
                },
                body: JSON.stringify({ query: q, variables: { login: username, from, to } }),
              });
              if (r.ok) {
                const j = await r.json();
                totalAll += j?.data?.user?.contributionsCollection?.contributionCalendar?.totalContributions || 0;
              }
            }
            commits = totalAll;
          }
        }
      } else {
        const fromDate = new Date(Date.UTC(now.getUTCFullYear(), 0, 1)).toISOString();
        const query = \`query($login: String!, $from: DateTime!, $to: DateTime!) {
          user(login: $login) { contributionsCollection(from: $from, to: $to) { contributionCalendar { totalContributions } } }
        }\`;
        const res = await fetch("https://api.github.com/graphql", {
          method: "POST",
          headers: {
            Authorization: \`Bearer \${process.env.PROFILE_PAT}\`,
            "Content-Type": "application/json",
            "User-Agent": "dynamic-readme-creature",
          },
          body: JSON.stringify({ query, variables: { login: username, from: fromDate, to: now.toISOString() } }),
        });
        if (res.ok) {
          const json = await res.json();
          const total = json?.data?.user?.contributionsCollection?.contributionCalendar?.totalContributions;
          if (typeof total === "number") commits = total;
        }
      }
    } catch { /* fall through */ }
  }

  if (commits === null) {
    try {
      const currentYear = String(new Date().getUTCFullYear());
      const res = await fetch(\`https://github-contributions-api.jogruber.de/v4/\${encodeURIComponent(username)}\`, {
        headers: { "User-Agent": "dynamic-readme-creature" },
      });
      if (res.ok) {
        const data = await res.json();
        if (data?.total && typeof data.total === "object") {
          if (windowMode === "all-time") {
            let sumAll = 0, found = false;
            for (const [k, v] of Object.entries(data.total)) {
              if (/^\\d{4}$/.test(k) && typeof v === "number") { sumAll += v; found = true; }
            }
            if (found) commits = sumAll;
          } else if (typeof data.total[currentYear] === "number") {
            commits = data.total[currentYear];
          }
        }
      }
    } catch { /* fall through */ }
  }

  if (commits === null && windowMode === "annual") {
    try {
      const res = await fetch(\`https://github.com/users/\${encodeURIComponent(username)}/contributions\`, {
        headers: { "User-Agent": "dynamic-readme-creature" },
      });
      if (res.ok) {
        const html = await res.text();
        const match = html.match(/([\\d,]+)\\s+contributions?\\s+in/i);
        if (match?.[1]) commits = parseInt(match[1].replace(/,/g, ""), 10);
      }
    } catch { /* keep previous commits */ }
  }

  // Preserve custom user colors by language name when syncing updated GitHub repo stats
  const existingColorMap = new Map(
    (fallbackLangs || []).map((l) => [String(l.name || "").toLowerCase(), l.color])
  );
  let topLanguages = fallbackLangs || [];

  try {
    const headers = { Accept: "application/vnd.github+json", "User-Agent": "dynamic-readme-creature" };
    if (token) headers.Authorization = \`Bearer \${token}\`;
    const reposRes = await fetch(
      \`https://api.github.com/users/\${encodeURIComponent(username)}/repos?per_page=100&sort=updated\`,
      { headers }
    );
    if (reposRes.ok) {
      const repos = await reposRes.json();
      const counts = new Map();
      for (const r of repos || []) {
        if (!r?.language) continue;
        const w = r.fork ? 1 : Math.max(2, Math.min(20, Math.round((r.size || 10) / 100) + 2));
        counts.set(r.language, (counts.get(r.language) || 0) + w);
      }
      if (counts.size > 0) {
        topLanguages = Array.from(counts.entries())
          .sort((a, b) => b[1] - a[1])
          .slice(0, 7)
          .map(([name]) => ({
            name,
            color: existingColorMap.get(name.toLowerCase()) || LANGUAGE_COLORS[name] || "#8B949E",
          }));
      }
    }
  } catch { /* keep existing languages */ }

  return {
    commits: typeof commits === "number" && Number.isFinite(commits) ? commits : fallbackCommits,
    topLanguages: ensureLanguageSlots(topLanguages, languageCount),
  };
}

function resolveTokens(template, config, username, stage, rank, commits, visibleLangs) {
  const viewText = config.creature === "jellyfish" ? "PELAGIC" : (config.view === "top" ? "TOP" : "SIDE");
  const langsText = (visibleLangs || []).map((l) => l.name).join(" · ");
  return String(template || "")
    .replaceAll("{{USERNAME}}", username)
    .replaceAll("{{CREATURE}}", CREATURE_DISPLAY_NAME)
    .replaceAll("{{STAGE}}", String(stage))
    .replaceAll("{{RANK}}", rank)
    .replaceAll("{{COMMITS}}", commits.toLocaleString("en-US"))
    .replaceAll("{{VIEW}}", viewText)
    .replaceAll("{{LANGUAGES}}", langsText);
}

function updateReadmeFiles(config, username, stage, rank, commits, visibleLangs) {
  const readmePath = path.resolve("README.md");
  if (!fs.existsSync(readmePath)) return;

  let raw = fs.readFileSync(readmePath, "utf8");
  const rm = config.readme || {};
  const align = rm.align === "left" ? "left" : "center";
  const width = Number(rm.imageWidth) || 760;
  const imgSrc = rm.useOutputBranchUrl
    ? \`https://raw.githubusercontent.com/\${username}/\${username}/output/creature.webp\`
    : "./creature.webp";

  const startMarker = "<!-- CYBER-CREATURE:START -->";
  const endMarker = "<!-- CYBER-CREATURE:END -->";
  const sIdx = raw.indexOf(startMarker);
  const eIdx = raw.indexOf(endMarker);

  if (sIdx !== -1 && eIdx !== -1 && eIdx > sIdx) {
    const block = [
      startMarker,
      \`<p align="\${align}">\`,
      \`  <a href="https://github.com/\${username}/\${username}">\`,
      \`    <img src="\${imgSrc}" width="\${width}" alt="\${CREATURE_DISPLAY_NAME} Stage \${stage} \${rank}" />\`,
      \`  </a>\`,
      \`</p>\`,
      endMarker,
    ].join("\\n");
    raw = raw.slice(0, sIdx) + block + raw.slice(eIdx + endMarker.length);
  }

  const statsStart = "<!-- CYBER-CREATURE-STATS:START -->";
  const statsEnd = "<!-- CYBER-CREATURE-STATS:END -->";
  const ssIdx = raw.indexOf(statsStart);
  const seIdx = raw.indexOf(statsEnd);

  if (ssIdx !== -1 && seIdx !== -1 && seIdx > ssIdx) {
    const viewLabel = config.creature === "jellyfish" ? "PELAGIC" : (config.view === "top" ? "TOP" : "SIDE");
    const langList = (visibleLangs || []).map((l) => \`\\\`\${l.name}\\\`\`).join(" · ");
    const tableTitle = resolveTokens(rm.statsTableTitle || "Cybernetic Telemetry", config, username, stage, rank, commits, visibleLangs);
    const periodLabel = config.windowMode === "all-time" ? "All Time" : "Current Year";
    const statsBlock = [
      statsStart,
      \`### \${tableTitle}\`,
      "",
      "| Metric | Active Value |",
      "| --- | --- |",
      \`| **Guardian Chassis** | \${CREATURE_DISPLAY_NAME} (\\\`\${CREATURE_DESIGNATION}\\\`) |\`,
      \`| **Evolution Stage** | Stage \${stage} / 5 (**\${rank}**) |\`,
      \`| **Contributions (\${periodLabel})** | \\\`\${commits.toLocaleString("en-US")}\\\` commits |\`,
      \`| **Camera Angle** | \\\`\${viewLabel}\\\` |\`,
      \`| **Top Languages** | \${langList} |\`,
      statsEnd,
    ].join("\\n");
    raw = raw.slice(0, ssIdx) + statsBlock + raw.slice(seIdx + statsEnd.length);
  }

  fs.writeFileSync(readmePath, raw, "utf8");
}

async function main() {
  const sharp = await loadSharp();
  const config = loadConfig();
  const username =
    process.env.GITHUB_USERNAME ||
    process.env.GITHUB_ACTOR ||
    config.username ||
    "your-username";
  const windowMode = process.env.CREATURE_WINDOW || config.windowMode || "annual";
  const languageCount = config.languageCount === 7 || config.languageCount === 5 ? config.languageCount : 3;

  const telemetry = await fetchLiveTelemetry(
    username,
    windowMode,
    config.commits,
    config.languages,
    languageCount
  );

  const nextConfig = {
    ...config,
    username,
    windowMode,
    languageCount,
    commits: telemetry.commits,
    languages: telemetry.topLanguages,
  };

  let spriteBuffer;
  const localSpritePath = path.resolve("assets/creature-sprite.png");
  if (fs.existsSync(localSpritePath)) {
    spriteBuffer = fs.readFileSync(localSpritePath);
  } else {
    const spriteRes = await fetch(
      \`https://pathumsandeepa.github.io/dynamic-readme-creature/sprites/\${DEFAULT_SPRITE_KEY}.png\`
    );
    if (!spriteRes.ok) throw new Error("Missing assets/creature-sprite.png and unable to download fallback sprite.");
    spriteBuffer = Buffer.from(await spriteRes.arrayBuffer());
  }

  const { data: rawData, info } = await sharp(spriteBuffer)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  const sprite = { width: info.width, height: info.height, data: new Uint8ClampedArray(rawData) };
  const recolored = recolorSprite(sprite, nextConfig);

  const speed = clamp(Number(nextConfig.animationSpeed) || 1.0, 0.4, 2.5);
  const loopMs = Math.round(BASE_LOOP_DURATION_MS / speed);
  const frameDelayMs = Math.max(20, Math.round(loopMs / FRAME_COUNT));
  const hudOverlaySvg = buildHudSvgOverlay(nextConfig);
  const hudOverlayPng = hudOverlaySvg ? await sharp(hudOverlaySvg).png().toBuffer() : null;

  const parsedFrames = [];
  for (let i = 0; i < FRAME_COUNT; i++) {
    const logical = renderFrameRgba(recolored, nextConfig, i / FRAME_COUNT);
    const upscaled = upscaleRgba2x(logical);
    let img = sharp(upscaled, {
      raw: { width: CANVAS_WIDTH, height: CANVAS_HEIGHT, channels: 4 },
    });
    if (hudOverlayPng) {
      img = img.composite([{ input: hudOverlayPng, top: 0, left: 0 }]);
    }
    const singleWebP = await img.webp({ quality: 92 }).toBuffer();
    parsedFrames.push(extractSingleWebPFrame(singleWebP));
  }

  const animatedWebP = assembleAnimatedWebP(CANVAS_WIDTH, CANVAS_HEIGHT, parsedFrames, frameDelayMs);
  fs.writeFileSync(path.resolve("creature.webp"), animatedWebP);

  const { stage, rank } = getEvolutionStage(nextConfig.commits);
  const visibleLangs = getVisibleLanguages(nextConfig);
  updateReadmeFiles(nextConfig, username, stage, rank, nextConfig.commits, visibleLangs);

  const cfgPath = path.resolve("creature-config.json");
  if (fs.existsSync(cfgPath)) {
    fs.writeFileSync(cfgPath, JSON.stringify(nextConfig, null, 2), "utf8");
  }

  console.log(\`Synced @\${username}: Stage \${stage} (\${rank}) · \${nextConfig.commits} commits · \${visibleLangs.length} langs -> creature.webp (\${animatedWebP.length} bytes)\`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
`;
}
