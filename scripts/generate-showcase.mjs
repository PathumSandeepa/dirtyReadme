import fs from "node:fs";
import path from "node:path";
import { createRequire } from "node:module";
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
const {
  generateCreatureSvgDocument: generateSvgString,
  generateShareCardSvgDocument: generateShareCardSvgString,
} = loadTsModule("src/domain/creature/svgRenderer.ts");

const outDir = path.resolve(rootDir, "public/showcase");
fs.mkdirSync(outDir, { recursive: true });

function writeSvg(name, content) {
  const dest = path.join(outDir, name);
  fs.writeFileSync(dest, content, "utf8");
  console.log(`Generated ${path.relative(rootDir, dest)}`);
}

// 1. Hero Cyber-Tulkun (Stage 4 Apex Mecha Prototype)
writeSvg(
  "hero-tulkun.svg",
  generateSvgString({
    ...DEFAULT_CONFIG,
    creature: "tulkun",
    view: "side",
    commits: 1680,
    username: "PathumSandeepa",
  })
);

// 2. 1280x640 Shareable Social Card
writeSvg(
  "share-card.svg",
  generateShareCardSvgString({
    ...DEFAULT_CONFIG,
    creature: "tulkun",
    view: "side",
    commits: 1680,
    username: "PathumSandeepa",
  })
);

// 3. All 5 Evolution Stages
for (const st of STAGE_DEFINITIONS) {
  writeSvg(
    `stage-${st.stage}.svg`,
    generateSvgString({
      ...DEFAULT_CONFIG,
      creature: "tulkun",
      view: "side",
      commits: st.sampleCommits,
      username: "PathumSandeepa",
    })
  );
}

// 4. All 3 Camera Perspectives (Stage 5 Ascended)
for (const view of ["side", "dive", "top"]) {
  writeSvg(
    `view-${view}.svg`,
    generateSvgString({
      ...DEFAULT_CONFIG,
      creature: "tulkun",
      view,
      commits: 2940,
      username: "PathumSandeepa",
    })
  );
}

// 5. All 3 Selectable Cyber-Creatures
writeSvg(
  "creature-tulkun.svg",
  generateSvgString({
    ...DEFAULT_CONFIG,
    creature: "tulkun",
    commits: 1990,
    username: "PathumSandeepa",
  })
);

writeSvg(
  "creature-jellyfish.svg",
  generateSvgString({
    ...DEFAULT_CONFIG,
    creature: "jellyfish",
    colors: { ...THEME_PRESETS[1].colors, background: "transparent" },
    themeId: THEME_PRESETS[1].id,
    commits: 1990,
    username: "PathumSandeepa",
  })
);
