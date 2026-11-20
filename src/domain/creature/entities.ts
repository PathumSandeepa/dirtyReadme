export type CreatureId = "tulkun" | "serpent" | "manta" | "jellyfish";

export type CameraView = "side" | "dive" | "top";

export type ContributionWindow = "annual" | "rolling";

export type ColorMode = "canonical" | "languages" | "custom";

export type BackgroundMode = "transparent" | "black" | "github-dark" | "custom";

export type ThemePresetId =
  | "mecha-prototype"
  | "stealth-carbon"
  | "crimson-mecha"
  | "solar-gold"
  | "cobalt-indigo"
  | "custom";

export interface LanguageStat {
  name: string;
  color: string;
  share?: number;
}

export interface CreatureColors {
  primary: string;
  accent: string;
  energy: string;
  frame: string;
  background: string;
}

export interface CreatureConfig {
  creature: CreatureId;
  view: CameraView;
  windowMode: ContributionWindow;
  colorMode: ColorMode;
  themeId: ThemePresetId;
  colors: CreatureColors;
  backgroundMode: BackgroundMode;
  animationSpeed: number;
  showHud: boolean;
  customTitle: string;
  commits: number;
  username: string;
  languages: LanguageStat[];
}

export interface CreatureMeta {
  id: CreatureId;
  name: string;
  subtitle: string;
  designation: string;
  description: string;
  defaultTitle: string;
}

export interface CameraViewMeta {
  id: CameraView;
  name: string;
  shortLabel: string;
  description: string;
}

export interface StageDefinition {
  stage: 1 | 2 | 3 | 4 | 5;
  rank: string;
  shortCode: string;
  minCommits: number;
  rangeLabel: string;
  sampleCommits: number;
  unlocks: string;
}

export interface ThemePreset {
  id: Exclude<ThemePresetId, "custom">;
  name: string;
  tagline: string;
  colors: Omit<CreatureColors, "background">;
}

export interface DerivedPalette {
  armorHighlight: string;
  armorMain: string;
  armorMid: string;
  armorShadow: string;
  armorFar: string;
  accentMain: string;
  accentDeep: string;
  energyMain: string;
  energyBright: string;
  frameMain: string;
  frameLight: string;
  frameDark: string;
  seamStroke: string;
  background: string;
  isLightArmor: boolean;
}

export const CREATURE_CATALOG: CreatureMeta[] = [
  {
    id: "tulkun",
    name: "Cyber-Tulkun",
    subtitle: "Armored Leviathan",
    designation: "UNIT-01 // CETACEA-MK4",
    description:
      "Rounded whale-leviathan chassis with sensor optics, contoured dorsal armor, feathered wings, and trailing fiber-optic cables.",
    defaultTitle: "APEX CYBER-TULKUN",
  },
  {
    id: "serpent",
    name: "Cyber-Serpent",
    subtitle: "Mecha Sky-Dragon",
    designation: "UNIT-02 // OROCHI-V7",
    description:
      "Undulating sky-dragon with optical visor crest, spine-mounted mechanical feathers, and sweeping tail ribbons.",
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
  {
    id: "jellyfish",
    name: "Cyber-Jellyfish",
    subtitle: "Pelagic Biolume",
    designation: "UNIT-04 // MEDUSA-BIO",
    description:
      "Bioluminescent drifting jellyfish with gently rippling currents, glowing bell telemetry, and trailing tentacles.",
    defaultTitle: "PELAGIC BIO-MEDUSA",
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
  {
    id: "cobalt-indigo",
    name: "Nordic Indigo",
    tagline: "Arctic White / Cobalt Indigo / Mint",
    colors: {
      primary: "#EEF2FF",
      accent: "#4F46E5",
      energy: "#10B981",
      frame: "#1E293B",
    },
  },
];

export const DEFAULT_LANGUAGES: LanguageStat[] = [
  { name: "TypeScript", color: "#3178C6", share: 54 },
  { name: "JavaScript", color: "#F1E05A", share: 28 },
  { name: "Python", color: "#3572A5", share: 18 },
];

export const DEFAULT_CREATURE_CONFIG: CreatureConfig = {
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
  username: "your-username",
  languages: DEFAULT_LANGUAGES,
};
