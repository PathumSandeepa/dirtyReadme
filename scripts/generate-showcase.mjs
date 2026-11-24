import fs from "node:fs";
import path from "node:path";
import { createRequire } from "node:module";
import sharp from "sharp";
import ts from "typescript";

const require = createRequire(import.meta.url);
const rootDir = process.cwd();
const cache = new Map();

function loadTsModule(relPath) {
  const fullPath = path.resolve(rootDir, relPath);
  if (cache.has(fullPath)) return cache.get(fullPath).exports;

  const source = fs.readFileSync(fullPath, "utf8");
  const { outputText } = ts.transpileModule(source, {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2020,
      esModuleInterop: true,
    },
    fileName: fullPath,
  });

  const mod = { exports: {} };
  cache.set(fullPath, mod);

  const localRequire = (specifier) => {
    if (specifier.startsWith("@/")) {
      return loadTsModule(path.join("src", `${specifier.slice(2)}.ts`));
    }
    if (specifier.startsWith(".")) {
      return loadTsModule(
        path.relative(rootDir, path.resolve(path.dirname(fullPath), `${specifier}.ts`))
      );
    }
    return require(specifier);
  };

  const fn = new Function(
    "exports",
    "require",
    "module",
    "__filename",
    "__dirname",
    outputText
  );
  fn(mod.exports, localRequire, mod, fullPath, path.dirname(fullPath));
  return mod.exports;
}

const {
  DEFAULT_CREATURE_CONFIG: DEFAULT_CONFIG,
  ORIGINAL_CREATURE_PALETTES,
  STAGE_DEFINITIONS,
} = loadTsModule("src/domain/creature/entities.ts");
const { GLYPHS_5X7 } = loadTsModule("src/domain/creature/pixelArt.ts");
const { getSpriteKey } = loadTsModule("src/domain/creature/services.ts");
const {
  CANVAS_WIDTH,
  CANVAS_HEIGHT,
  computeHudLayout,
  getLoopDurationMs,
  recolorSpriteRgba,
  renderCreatureFrameRgba,
  upscaleRgba2x,
} = loadTsModule("src/domain/creature/animationEngine.ts");
const {
  extractSingleWebPFrame,
  assembleAnimatedWebP,
} = loadTsModule("src/infrastructure/browser/webpEncoder.ts");

function escapeXml(str) {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function getRowStartX(align, rowWidth) {
  if (align === "center") return (CANVAS_WIDTH - rowWidth) * 0.5;
  if (align === "right") return CANVAS_WIDTH - 40 - rowWidth;
  return 40;
}

function pixelTextSvgRects(text, ox, oy, fontSize, weight, color) {
  const upper = String(text || "").toUpperCase();
  const unit = fontSize / 7;
  const dotExpand =
    weight === "bold"
      ? Math.max(0.45, unit * 0.22)
      : weight === "semibold"
        ? Math.max(0.2, unit * 0.1)
        : 0;
  let cx = ox;
  let rects = "";
  for (let i = 0; i < upper.length; i++) {
    const glyph = GLYPHS_5X7[upper[i]] ?? GLYPHS_5X7[" "];
    for (let row = 0; row < glyph.length; row++) {
      const bits = glyph[row];
      for (let col = 0; col < bits.length; col++) {
        if (bits[col] === "1") {
          const rx = Math.round(cx + col * unit);
          const ry = Math.round(oy + row * unit);
          const rw = Math.max(1, Math.ceil(unit + dotExpand));
          const rh = Math.max(1, Math.ceil(unit));
          rects += `<rect x="${rx}" y="${ry}" width="${rw}" height="${rh}" fill="${color}" />`;
        }
      }
    }
    cx += 6 * unit;
  }
  return rects;
}

async function buildHudOverlayPng(config) {
  if (!config.showHud) return null;
  const layout = computeHudLayout(config);
  const swatchGap1 = Math.max(6, Math.round(layout.fontSize * 0.45));
  const row1X = getRowStartX(layout.align, layout.line1Width);
  const row1SwatchY =
    layout.line1Y + Math.round((layout.fontSize - layout.swatchSize) * 0.5);
  const text1X = row1X + layout.swatchSize + swatchGap1;
  const row2X = getRowStartX(layout.align, layout.line2Width);
  const svgWeight =
    layout.fontWeight === "normal"
      ? "400"
      : layout.fontWeight === "semibold"
        ? "600"
        : "700";
  const svgFamily =
    layout.fontFamily === "mono"
      ? "monospace"
      : layout.fontFamily === "serif"
        ? "serif"
        : "sans-serif";

  const parts = [];
  parts.push(
    `<rect x="${Math.round(row1X)}" y="${Math.round(row1SwatchY)}" width="${layout.swatchSize}" height="${layout.swatchSize}" rx="2" fill="${layout.accentColor}" />`
  );
  if (layout.fontFamily === "pixel") {
    parts.push(
      pixelTextSvgRects(
        layout.line1Text,
        text1X,
        layout.line1Y,
        layout.fontSize,
        layout.fontWeight,
        layout.fontColor
      )
    );
    parts.push(
      pixelTextSvgRects(
        layout.line2Text,
        row2X,
        layout.line2Y,
        layout.fontSize,
        layout.fontWeight,
        layout.fontColor
      )
    );
  } else {
    parts.push(
      `<text x="${Math.round(text1X)}" y="${Math.round(layout.line1Y + layout.fontSize * 0.88)}" font-family="${svgFamily}" font-size="${layout.fontSize}" font-weight="${svgWeight}" fill="${layout.fontColor}">${escapeXml(layout.line1Text)}</text>`
    );
    parts.push(
      `<text x="${Math.round(row2X)}" y="${Math.round(layout.line2Y + layout.fontSize * 0.88)}" font-family="${svgFamily}" font-size="${layout.fontSize}" font-weight="${svgWeight}" fill="${layout.fontColor}">${escapeXml(layout.line2Text)}</text>`
    );
  }

  const chipSwatchGap = Math.max(5, Math.round(layout.chipFontSize * 0.4));
  for (const row of layout.chipRows) {
    let cx = getRowStartX(layout.align, row.totalWidth);
    for (const item of row.items) {
      const sy =
        row.y + Math.round((layout.chipFontSize - item.swatchSize) * 0.5);
      parts.push(
        `<rect x="${Math.round(cx)}" y="${Math.round(sy)}" width="${item.swatchSize}" height="${item.swatchSize}" rx="2" fill="${item.color}" />`
      );
      const labelX = cx + item.swatchSize + chipSwatchGap;
      if (layout.fontFamily === "pixel") {
        parts.push(
          pixelTextSvgRects(
            item.name,
            labelX,
            row.y,
            layout.chipFontSize,
            layout.fontWeight,
            layout.fontColor
          )
        );
      } else {
        parts.push(
          `<text x="${Math.round(labelX)}" y="${Math.round(row.y + layout.chipFontSize * 0.88)}" font-family="${svgFamily}" font-size="${layout.chipFontSize}" font-weight="${svgWeight}" fill="${layout.fontColor}">${escapeXml(item.name)}</text>`
        );
      }
      cx += item.width + 22;
    }
  }

  const svg = Buffer.from(
    `<svg xmlns="http://www.w3.org/2000/svg" width="${CANVAS_WIDTH}" height="${CANVAS_HEIGHT}"><rect width="${CANVAS_WIDTH}" height="${CANVAS_HEIGHT}" fill="none" />${parts.join("")}</svg>`
  );
  return sharp(svg).png().toBuffer();
}

const outDir = path.resolve(rootDir, "public/showcase");
fs.mkdirSync(outDir, { recursive: true });

const spriteCache = new Map();
async function loadSprite(key) {
  if (spriteCache.has(key)) return spriteCache.get(key);
  const { data, info } = await sharp(
    path.resolve(rootDir, "public/sprites", `${key}.png`)
  )
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });
  const sprite = {
    width: info.width,
    height: info.height,
    data: new Uint8ClampedArray(data),
  };
  spriteCache.set(key, sprite);
  return sprite;
}

async function writeAnimatedWebP(name, config, frameCount = 24) {
  const sprite = await loadSprite(getSpriteKey(config.creature, config.view));
  const recolored = recolorSpriteRgba(sprite, config);
  const durationMs = getLoopDurationMs(config.animationSpeed);
  const frameDelayMs = Math.max(20, Math.round(durationMs / frameCount));
  const hudOverlayPng = await buildHudOverlayPng(config);

  const parsedFrames = [];
  for (let i = 0; i < frameCount; i++) {
    const logical = renderCreatureFrameRgba(recolored, config, i / frameCount, {
      skipHud: true,
    });
    const upscaled = upscaleRgba2x(logical);
    let img = sharp(Buffer.from(upscaled), {
      raw: { width: CANVAS_WIDTH, height: CANVAS_HEIGHT, channels: 4 },
    });
    if (hudOverlayPng) {
      img = img.composite([{ input: hudOverlayPng, top: 0, left: 0 }]);
    }
    const buf = await img.webp({ quality: 92 }).toBuffer();
    parsedFrames.push(extractSingleWebPFrame(new Uint8Array(buf)));
  }

  const finalBytes = assembleAnimatedWebP(
    CANVAS_WIDTH,
    CANVAS_HEIGHT,
    parsedFrames,
    frameDelayMs
  );
  const dest = path.join(outDir, name);
  fs.writeFileSync(dest, finalBytes);
  console.log(`Generated ${path.relative(rootDir, dest)} (${finalBytes.length} bytes)`);
}

async function writeStaticShareCardPng(name, config) {
  const sprite = await loadSprite(getSpriteKey(config.creature, config.view));
  const recolored = recolorSpriteRgba(sprite, config);
  const logical = renderCreatureFrameRgba(
    recolored,
    { ...config, showHud: false },
    0.25,
    { forceTransparent: true, skipHud: true }
  );
  const upscaled = upscaleRgba2x(logical);
  const creaturePng = await sharp(Buffer.from(upscaled), {
    raw: { width: CANVAS_WIDTH, height: CANVAS_HEIGHT, channels: 4 },
  })
    .png()
    .toBuffer();

  const headerSvg = Buffer.from(`
    <svg xmlns="http://www.w3.org/2000/svg" width="1280" height="640">
      <rect width="1280" height="640" fill="#0B0F17" />
      <rect x="20" y="20" width="1240" height="600" rx="14" fill="none" stroke="${config.colors.accent}" stroke-opacity="0.6" stroke-width="2" />
      <rect x="28" y="28" width="1224" height="48" rx="8" fill="#111622" />
      <text x="56" y="57" fill="#E6EDF3" font-family="monospace" font-size="16" font-weight="700">DIRTYREADME  @${config.username}</text>
      <text x="1224" y="57" fill="${config.colors.accent}" font-family="monospace" font-size="16" font-weight="700" text-anchor="end">STAGE 4: MATURE TULKUN</text>
      <rect x="28" y="520" width="1224" height="92" rx="8" fill="#111622" />
      <text x="52" y="560" fill="#E6EDF3" font-family="monospace" font-size="16" font-weight="700">CONTRIBUTIONS (THIS YEAR): ${config.commits.toLocaleString("en-US")}</text>
      <text x="52" y="588" fill="#94A3B8" font-family="monospace" font-size="14">TypeScript, JavaScript, Python</text>
    </svg>
  `);

  const dest = path.join(outDir, name);
  await sharp(headerSvg)
    .composite([{ input: creaturePng, left: 180, top: 82 }])
    .png()
    .toFile(dest);
  console.log(`Generated ${path.relative(rootDir, dest)}`);
}

// 1. Hero Pixel Tulkun (Stage 4 Mature)
await writeAnimatedWebP("hero-tulkun.webp", {
  ...DEFAULT_CONFIG,
  creature: "tulkun",
  view: "side",
  commits: 1680,
  username: "PathumSandeepa",
});

// 2. Social Share Card PNG
await writeStaticShareCardPng("share-card.png", {
  ...DEFAULT_CONFIG,
  creature: "tulkun",
  view: "side",
  commits: 1680,
  username: "PathumSandeepa",
});

// 3. All 5 Evolution Stages
for (const st of STAGE_DEFINITIONS) {
  await writeAnimatedWebP(`stage-${st.stage}.webp`, {
    ...DEFAULT_CONFIG,
    creature: "tulkun",
    view: "side",
    commits: st.sampleCommits,
    username: "PathumSandeepa",
  });
}

// 4. Both Camera Perspectives (Side & Top)
for (const view of ["side", "top"]) {
  await writeAnimatedWebP(`view-${view}.webp`, {
    ...DEFAULT_CONFIG,
    creature: "tulkun",
    view,
    commits: 2940,
    username: "PathumSandeepa",
  });
}

// 5. Selectable Creatures
await writeAnimatedWebP("creature-tulkun.webp", {
  ...DEFAULT_CONFIG,
  creature: "tulkun",
  view: "side",
  commits: 1990,
  username: "PathumSandeepa",
});

await writeAnimatedWebP("creature-jellyfish.webp", {
  ...DEFAULT_CONFIG,
  creature: "jellyfish",
  view: "side",
  colorMode: "canonical",
  colors: { ...ORIGINAL_CREATURE_PALETTES.jellyfish, background: "transparent" },
  commits: 1990,
  username: "PathumSandeepa",
});
