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
  STAGE_DEFINITIONS,
  THEME_PRESETS,
} = loadTsModule("src/domain/creature/entities.ts");
const { getSpriteKey } = loadTsModule("src/domain/creature/services.ts");
const {
  CANVAS_WIDTH,
  CANVAS_HEIGHT,
  getLoopDurationMs,
  recolorSpriteRgba,
  renderCreatureFrameRgba,
  upscaleRgba2x,
} = loadTsModule("src/domain/creature/animationEngine.ts");
const {
  extractSingleWebPFrame,
  assembleAnimatedWebP,
} = loadTsModule("src/infrastructure/browser/webpEncoder.ts");

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

  const parsedFrames = [];
  for (let i = 0; i < frameCount; i++) {
    const logical = renderCreatureFrameRgba(recolored, config, i / frameCount);
    const upscaled = upscaleRgba2x(logical);
    const buf = await sharp(Buffer.from(upscaled), {
      raw: { width: CANVAS_WIDTH, height: CANVAS_HEIGHT, channels: 4 },
    })
      .webp({ quality: 92 })
      .toBuffer();
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
    { forceTransparent: true }
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
      <text x="56" y="57" fill="#E6EDF3" font-family="monospace" font-size="16" font-weight="700">DYNAMIC-CREATURE // @${config.username}</text>
      <text x="1224" y="57" fill="${config.colors.accent}" font-family="monospace" font-size="16" font-weight="700" text-anchor="end">STAGE 4: MATURE TULKUN</text>
      <rect x="28" y="520" width="1224" height="92" rx="8" fill="#111622" />
      <text x="52" y="560" fill="#E6EDF3" font-family="monospace" font-size="16" font-weight="700">CONTRIBUTIONS (ANNUAL): ${config.commits.toLocaleString("en-US")}</text>
      <text x="52" y="588" fill="#94A3B8" font-family="monospace" font-size="14">TypeScript · JavaScript · Python</text>
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
  colors: { ...THEME_PRESETS[1].colors, background: "transparent" },
  themeId: THEME_PRESETS[1].id,
  commits: 1990,
  username: "PathumSandeepa",
});
