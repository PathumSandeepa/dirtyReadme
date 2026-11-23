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
        path.relative(
          rootDir,
          path.resolve(path.dirname(fullPath), `${specifier}.ts`)
        )
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

const { DEFAULT_CREATURE_CONFIG } = loadTsModule("src/domain/creature/entities.ts");
const { getSpriteKey } = loadTsModule("src/domain/creature/services.ts");
const {
  CANVAS_WIDTH,
  CANVAS_HEIGHT,
  recolorSpriteRgba,
  renderCreatureFrameRgba,
  upscaleRgba2x,
} = loadTsModule("src/domain/creature/animationEngine.ts");

async function buildOgImage() {
  const config = {
    ...DEFAULT_CREATURE_CONFIG,
    creature: "tulkun",
    view: "side",
    waterMode: "no-water",
    showHud: false,
    commits: 1990,
  };

  const spritePath = path.resolve(
    rootDir,
    "public/sprites",
    `${getSpriteKey(config.creature, config.view)}.png`
  );
  const { data, info } = await sharp(spritePath)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  const sprite = {
    width: info.width,
    height: info.height,
    data: new Uint8ClampedArray(data),
  };

  const recolored = recolorSpriteRgba(sprite, config);
  const logical = renderCreatureFrameRgba(recolored, config, 0.25, {
    forceTransparent: true,
    skipHud: true,
  });
  const upscaled = upscaleRgba2x(logical);
  const creaturePng = await sharp(Buffer.from(upscaled), {
    raw: { width: CANVAS_WIDTH, height: CANVAS_HEIGHT, channels: 4 },
  })
    .resize({ width: 580 })
    .png()
    .toBuffer();

  const backgroundSvg = Buffer.from(`
    <svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
      <defs>
        <radialGradient id="caustic" cx="76%" cy="48%" r="48%">
          <stop offset="0%" stop-color="#58D6B0" stop-opacity="0.16" />
          <stop offset="65%" stop-color="#58D6B0" stop-opacity="0.04" />
          <stop offset="100%" stop-color="#0C0E0F" stop-opacity="0" />
        </radialGradient>
        <radialGradient id="emberGlow" cx="76%" cy="55%" r="34%">
          <stop offset="0%" stop-color="#F28C4B" stop-opacity="0.12" />
          <stop offset="100%" stop-color="#0C0E0F" stop-opacity="0" />
        </radialGradient>
      </defs>

      <rect width="1200" height="630" fill="#0C0E0F" />
      <rect width="1200" height="630" fill="url(#caustic)" />
      <rect width="1200" height="630" fill="url(#emberGlow)" />

      <!-- Brand mark + wordmark -->
      <g transform="translate(72, 72)">
        <rect width="44" height="44" rx="10" fill="#171B1E" />
        <rect x="11" y="11" width="3" height="3" fill="#58D6B0" />
        <rect x="17" y="11" width="3" height="3" fill="#58D6B0" />
        <rect x="14" y="14" width="3" height="3" fill="#58D6B0" />
        <rect x="8" y="19" width="14" height="3" fill="#ECEFF1" />
        <rect x="30" y="19" width="3" height="3" fill="#ECEFF1" />
        <rect x="35" y="19" width="3" height="3" fill="#ECEFF1" />
        <rect x="5" y="22" width="19" height="3" fill="#ECEFF1" />
        <rect x="33" y="22" width="3" height="3" fill="#ECEFF1" />
        <rect x="5" y="25" width="3" height="3" fill="#ECEFF1" />
        <rect x="8" y="25" width="3" height="3" fill="#F28C4B" />
        <rect x="11" y="25" width="16" height="3" fill="#ECEFF1" />
        <rect x="33" y="25" width="3" height="3" fill="#ECEFF1" />
        <rect x="5" y="28" width="30" height="3" fill="#ECEFF1" />
        <rect x="25" y="31" width="8" height="3" fill="#ECEFF1" />
        <rect x="8" y="31" width="17" height="3" fill="#A4ADB3" />
        <text x="62" y="30" fill="#ECEFF1" font-family="system-ui, -apple-system, Segoe UI, sans-serif" font-size="24" font-weight="600" letter-spacing="-0.5">ReadmeForge</text>
      </g>

      <!-- Hero title & description -->
      <text x="72" y="232" fill="#ECEFF1" font-family="system-ui, -apple-system, Segoe UI, sans-serif" font-size="54" font-weight="600" letter-spacing="-1.5">Your GitHub profile</text>
      <text x="72" y="296" fill="#ECEFF1" font-family="system-ui, -apple-system, Segoe UI, sans-serif" font-size="54" font-weight="600" letter-spacing="-1.5">finally worth a visit.</text>

      <text x="72" y="356" fill="#A4ADB3" font-family="system-ui, -apple-system, Segoe UI, sans-serif" font-size="20">Build and edit your profile README with live</text>
      <text x="72" y="386" fill="#A4ADB3" font-family="system-ui, -apple-system, Segoe UI, sans-serif" font-size="20">preview, starter templates, animated pixel</text>
      <text x="72" y="416" fill="#A4ADB3" font-family="system-ui, -apple-system, Segoe UI, sans-serif" font-size="20">creatures and custom images in your browser.</text>

      <!-- Bottom pills -->
      <rect x="72" y="478" width="212" height="44" rx="10" fill="#171B1E" />
      <circle cx="96" cy="500" r="5" fill="#58D6B0" />
      <text x="114" y="506" fill="#ECEFF1" font-family="system-ui, -apple-system, Segoe UI, sans-serif" font-size="16" font-weight="500">Runs in your browser</text>

      <rect x="300" y="478" width="186" height="44" rx="10" fill="#171B1E" />
      <circle cx="324" cy="500" r="5" fill="#F28C4B" />
      <text x="342" y="506" fill="#ECEFF1" font-family="system-ui, -apple-system, Segoe UI, sans-serif" font-size="16" font-weight="500">Stage 4 Mature</text>

      <!-- Glass preview card on the right -->
      <rect x="616" y="138" width="520" height="390" rx="18" fill="#121517" fill-opacity="0.92" />
      <rect x="638" y="160" width="476" height="346" rx="10" fill="#0D1117" stroke="#3D444D" stroke-width="1" />
      <rect x="638" y="160" width="476" height="38" rx="10" fill="#161B22" />
      <text x="658" y="184" fill="#9198A1" font-family="ui-monospace, Menlo, Consolas, monospace" font-size="14">octocat/README.md</text>
      <text x="1092" y="184" fill="#58D6B0" font-family="ui-monospace, Menlo, Consolas, monospace" font-size="13" text-anchor="end">Live preview</text>
    </svg>
  `);

  const dest = path.resolve(rootDir, "public/og-image.png");
  await sharp(backgroundSvg)
    .composite([{ input: creaturePng, left: 586, top: 210 }])
    .png()
    .toFile(dest);

  const meta = await sharp(dest).metadata();
  console.log(`Generated public/og-image.png (${meta.width}x${meta.height})`);
}

buildOgImage().catch((err) => {
  console.error(err);
  process.exit(1);
});
