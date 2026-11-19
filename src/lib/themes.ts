import type {
  BackgroundMode,
  CameraView,
  CameraViewMeta,
  CreatureConfig,
  CreatureId,
  CreatureMeta,
  DerivedPalette,
  LanguageStat,
  StageDefinition,
  ThemePreset,
} from "@/types/creature";

export const CREATURE_CATALOG: CreatureMeta[] = [
  {
    id: "tulkun",
    name: "Cyber-Tulkun",
    subtitle: "Armored Leviathan",
    designation: "UNIT-01 // CETACEA-MK4",
    description:
      "Massive rounded whale-leviathan chassis with sensor optics, segmented dorsal plates, feathered pectoral wings, and trailing fiber-optic cables.",
    defaultTitle: "APEX CYBER-TULKUN",
  },
  {
    id: "serpent",
    name: "Cyber-Serpent",
    subtitle: "Mecha Sky-Dragon",
    designation: "UNIT-02 // OROCHI-V7",
    description:
      "Sleek undulating sky-dragon with optical visor crest, spine-mounted mechanical feathers, and sweeping tail ribbons.",
    defaultTitle: "SKY-DRAGON SERPENT",
  },
  {
    id: "manta",
    name: "Cyber-Manta",
    subtitle: "Aether Ray",
    designation: "UNIT-03 // MOBULA-X9",
    description:
      "Aerodynamic gliding manta frame with wide articulated feathered wings, forward sensor prongs, and dual cyber-tendrils.",
    defaultTitle: "AETHER CYBER-MANTA",
  },
];

export const CAMERA_VIEWS: CameraViewMeta[] = [
  {
    id: "side",
    name: "Lateral Side Glide",
    shortLabel: "Side",
    description:
      "Classic lateral profile showcasing modular head armor, articulated pectoral wings, dorsal feather crest, and trailing tail cables.",
  },
  {
    id: "dive",
    name: "3/4 Dynamic Dive",
    shortLabel: "Dive",
    description:
      "Angled pitch-down diving perspective highlighting arched dorsal carapace, sweeping foreground wing, and kinetic flow.",
  },
  {
    id: "top",
    name: "Dorsal Top-Down",
    shortLabel: "Top",
    description:
      "Full symmetric wingspan view revealing twin feathered wings, spinal armor plates, pelvic stabilizer fins, and splayed tail arrays.",
  },
];

export const STAGE_DEFINITIONS: StageDefinition[] = [
  {
    stage: 1,
    rank: "PROTOTYPE",
    shortCode: "1.PRTO",
    minCommits: 0,
    rangeLabel: "0 - 149",
    sampleCommits: 64,
    unlocks:
      "Compact juvenile frame, short spine plating, blunt optic sensor dome, and 4 starter wing feathers.",
  },
  {
    stage: 2,
    rank: "RECON",
    shortCode: "2.RCON",
    minCommits: 150,
    rangeLabel: "150 - 499",
    sampleCommits: 320,
    unlocks:
      "Lengthened chassis, cranial neural whips sprout behind the brow, active energy conduits, and 5 wing feathers.",
  },
  {
    stage: 3,
    rank: "ARMORED",
    shortCode: "3.ARMR",
    minCommits: 500,
    rangeLabel: "500 - 1,199",
    sampleCommits: 840,
    unlocks:
      "Dorsal feather crest unfolds, secondary ventral stabilizer paddles emerge, and 6 elongated pectoral feathers.",
  },
  {
    stage: 4,
    rank: "APEX",
    shortCode: "4.APEX",
    minCommits: 1200,
    rangeLabel: "1,200 - 2,499",
    sampleCommits: 1680,
    unlocks:
      "Heavy segmented carapace armor, full gyro-optic ear assembly, 8 articulated wing feathers, and full tail cable array.",
  },
  {
    stage: 5,
    rank: "ASCENDED",
    shortCode: "5.ASCD",
    minCommits: 2500,
    rangeLabel: "2,500+",
    sampleCommits: 2940,
    unlocks:
      "Maximum leviathan wingspan, glowing apex energy battle-scars, crown halo crest, and overcharged emitter filaments.",
  },
];

export const THEME_PRESETS: ThemePreset[] = [
  {
    id: "mecha-prototype",
    name: "Mecha Prototype",
    tagline: "75% Matte White / Safety Orange / Cyber Green",
    colors: {
      primary: "#F4F6F8",
      accent: "#FF6B00",
      energy: "#00E676",
      frame: "#1F242D",
    },
  },
  {
    id: "stealth-carbon",
    name: "Stealth Carbon / Cyan",
    tagline: "Gunmetal Slate / Electric Cyan / Mint Core",
    colors: {
      primary: "#2C3545",
      accent: "#00D2FF",
      energy: "#00FFA3",
      frame: "#11161F",
    },
  },
  {
    id: "crimson-mecha",
    name: "Crimson Mecha",
    tagline: "Pearl Titanium / Crimson Red / Amber Plasma",
    colors: {
      primary: "#ECE7EB",
      accent: "#FF1E42",
      energy: "#FFAB00",
      frame: "#1E1720",
    },
  },
  {
    id: "solar-gold",
    name: "Solar Gold",
    tagline: "Warm Ceramic / Solar Gold / Ion Cyan",
    colors: {
      primary: "#F5EFE4",
      accent: "#FFB300",
      energy: "#00E5FF",
      frame: "#231F1A",
    },
  },
];

export const DEFAULT_LANGUAGES: LanguageStat[] = [
  { name: "TypeScript", color: "#3178C6", share: 54 },
  { name: "JavaScript", color: "#F1E05A", share: 28 },
  { name: "Python", color: "#3572A5", share: 18 },
];

export const DEFAULT_CONFIG: CreatureConfig = {
  creature: "tulkun",
  view: "side",
  windowMode: "annual",
  colorMode: "canonical",
  themeId: "mecha-prototype",
  colors: {
    ...THEME_PRESETS[0].colors,
    background: "transparent",
  },
  backgroundMode: "transparent",
  animationSpeed: 1.0,
  showHud: true,
  customTitle: "",
  commits: 1680,
  username: "PathumSandeepa",
  languages: DEFAULT_LANGUAGES,
};

export function resolveBackgroundHex(
  mode: BackgroundMode,
  customHex: string
): string {
  switch (mode) {
    case "transparent":
      return "transparent";
    case "black":
      return "#000000";
    case "github-dark":
      return "#0D1117";
    case "custom":
      return normalizeHex(customHex, "#0D1117");
  }
}

export function normalizeHex(value: string, fallback = "#F4F6F8"): string {
  const trimmed = value.trim();
  if (/^#[0-9a-fA-F]{6}$/.test(trimmed)) {
    return trimmed.toUpperCase();
  }
  if (/^#[0-9a-fA-F]{3}$/.test(trimmed)) {
    const r = trimmed[1];
    const g = trimmed[2];
    const b = trimmed[3];
    return `#${r}${r}${g}${g}${b}${b}`.toUpperCase();
  }
  return fallback;
}

function hexToRgb(hex: string): [number, number, number] {
  const clean = normalizeHex(hex).slice(1);
  return [
    parseInt(clean.slice(0, 2), 16),
    parseInt(clean.slice(2, 4), 16),
    parseInt(clean.slice(4, 6), 16),
  ];
}

function rgbToHex(r: number, g: number, b: number): string {
  const clamp = (n: number) => Math.max(0, Math.min(255, Math.round(n)));
  return (
    "#" +
    [clamp(r), clamp(g), clamp(b)]
      .map((v) => v.toString(16).padStart(2, "0"))
      .join("")
      .toUpperCase()
  );
}

export function mixHex(hexA: string, hexB: string, weightB: number): string {
  const [r1, g1, b1] = hexToRgb(hexA);
  const [r2, g2, b2] = hexToRgb(hexB);
  const w = Math.max(0, Math.min(1, weightB));
  return rgbToHex(
    r1 * (1 - w) + r2 * w,
    g1 * (1 - w) + g2 * w,
    b1 * (1 - w) + b2 * w
  );
}

function getLuminance(hex: string): number {
  const [r, g, b] = hexToRgb(hex).map((v) => v / 255);
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

export function applyLanguageColors(
  baseConfig: CreatureConfig,
  languages: LanguageStat[]
): CreatureConfig {
  const lang1 = languages[0]?.color ?? "#3178C6";
  const lang2 = languages[1]?.color ?? "#FF6B00";
  const lang3 = languages[2]?.color ?? "#00E676";

  // Keep 75% crisp armored base subtly tinted by primary language, accent from #2, glow from #3
  const primary = mixHex("#F4F6F8", lang1, 0.18);
  const accent = normalizeHex(lang2, "#FF6B00");
  const energy =
    getLuminance(lang3) < 0.35 ? mixHex(lang3, "#FFFFFF", 0.35) : normalizeHex(lang3, "#00E676");

  return {
    ...baseConfig,
    colorMode: "languages",
    themeId: "custom",
    languages,
    colors: {
      ...baseConfig.colors,
      primary,
      accent,
      energy,
      frame: mixHex("#1F242D", lang1, 0.2),
    },
  };
}

export function derivePalette(config: CreatureConfig): DerivedPalette {
  const primary = normalizeHex(config.colors.primary, "#F4F6F8");
  const accent = normalizeHex(config.colors.accent, "#FF6B00");
  const energy = normalizeHex(config.colors.energy, "#00E676");
  const frame = normalizeHex(config.colors.frame, "#1F242D");
  const isLightArmor = getLuminance(primary) > 0.45;

  const armorMid =
    primary === "#F4F6F8"
      ? "#D0D7DE"
      : isLightArmor
        ? mixHex(primary, "#64748B", 0.24)
        : mixHex(primary, "#0B0F17", 0.25);

  const armorHighlight = isLightArmor
    ? mixHex(primary, "#FFFFFF", 0.65)
    : mixHex(primary, "#CBD5E1", 0.22);

  const armorShadow = isLightArmor
    ? mixHex(primary, "#334155", 0.38)
    : mixHex(primary, "#05070B", 0.48);

  const armorFar = isLightArmor
    ? mixHex(primary, "#1E293B", 0.52)
    : mixHex(primary, "#030508", 0.62);

  return {
    armorHighlight,
    armorMain: primary,
    armorMid,
    armorShadow,
    armorFar,
    accentMain: accent,
    accentDeep: mixHex(accent, "#000000", 0.34),
    energyMain: energy,
    energyBright: mixHex(energy, "#FFFFFF", 0.45),
    frameMain: frame,
    frameLight: mixHex(frame, "#94A3B8", 0.16),
    frameDark: frame === "#1F242D" ? "#0D1117" : mixHex(frame, "#000000", 0.52),
    seamStroke: isLightArmor ? "#1F242D" : "#0A0D12",
    background:
      config.backgroundMode === "transparent"
        ? "transparent"
        : resolveBackgroundHex(config.backgroundMode, config.colors.background),
    isLightArmor,
  };
}

export function getEvolutionStage(commits: number): StageDefinition {
  const safeCommits = Math.max(0, Math.floor(commits || 0));
  for (let i = STAGE_DEFINITIONS.length - 1; i >= 0; i--) {
    if (safeCommits >= STAGE_DEFINITIONS[i].minCommits) {
      return STAGE_DEFINITIONS[i];
    }
  }
  return STAGE_DEFINITIONS[0];
}

export function getCreatureMeta(id: CreatureId): CreatureMeta {
  return CREATURE_CATALOG.find((c) => c.id === id) ?? CREATURE_CATALOG[0];
}

export function getCameraViewMeta(id: CameraView): CameraViewMeta {
  return CAMERA_VIEWS.find((v) => v.id === id) ?? CAMERA_VIEWS[0];
}

export function formatHudLabel(config: CreatureConfig): string {
  const { stage, rank } = getEvolutionStage(config.commits);
  const meta = getCreatureMeta(config.creature);
  const title = config.customTitle.trim()
    ? config.customTitle.trim().toUpperCase()
    : `${rank} ${meta.name.toUpperCase()}`;
  const formattedCommits = Math.max(
    0,
    Math.floor(config.commits || 0)
  ).toLocaleString("en-US");
  return `STAGE ${stage}: ${title} // COMMITS: ${formattedCommits}`;
}
