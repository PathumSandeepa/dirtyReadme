export type CreatureId = "tulkun" | "jellyfish";

export type CameraView = "side" | "top";

export type ContributionWindow = "annual" | "all-time";

export type ColorMode = "canonical" | "languages" | "custom";

export type BackgroundMode = "transparent" | "custom";

export type WaterMode = "water" | "no-water" | "clear";

export type HudFontFamily = "pixel" | "mono" | "sans" | "serif";

export type HudFontWeight = "normal" | "semibold" | "bold";

export type HudAlign = "left" | "center" | "right";

export type LanguageCount = 3 | 5 | 7;

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
  colors: CreatureColors;
  backgroundMode: BackgroundMode;
  waterMode: WaterMode;
  languageCount: LanguageCount;
  animationSpeed: number;
  showHud: boolean;
  customTitle: string;
  hudFontSize: number;
  hudFontFamily: HudFontFamily;
  hudFontWeight: HudFontWeight;
  hudFontColor: string;
  hudAlign: HudAlign;
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
  supportsViewSelection: boolean;
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

export const ORIGINAL_CREATURE_PALETTES: Record<
  CreatureId,
  Omit<CreatureColors, "background">
> = {
  tulkun: {
    primary: "#2C4156",
    accent: "#C86D3B",
    energy: "#9CE2F8",
    frame: "#141E2B",
  },
  jellyfish: {
    primary: "#1F75E8",
    accent: "#7AE0FF",
    energy: "#0D3E9E",
    frame: "#0A2259",
  },
};

export const ORIGINAL_CREATURE_SWATCHES: Record<CreatureId, string[]> = {
  tulkun: [
    "#2C4156",
    "#C86D3B",
    "#9CE2F8",
    "#52728E",
    "#C9D8E6",
    "#3B5875",
    "#78A7C7",
  ],
  jellyfish: [
    "#1F75E8",
    "#7AE0FF",
    "#0D3E9E",
    "#48A4FF",
    "#B5F0FF",
    "#1553C2",
    "#2D8DF5",
  ],
};

export const CREATURE_CATALOG: CreatureMeta[] = [
  {
    id: "tulkun",
    name: "Pixel Tulkun",
    subtitle: "Armored Leviathan",
    designation: "UNIT-01 // TULKUN",
    description:
      "Armored pixel-art leviathan with Side and Top views, animated with smooth S-curve body swimming, pectoral fin sweeps, and forked tail propulsion.",
    defaultTitle: "MATURE TULKUN",
    supportsViewSelection: true,
  },
  {
    id: "jellyfish",
    name: "Pixel Jellyfish",
    subtitle: "Bioluminescent Medusa",
    designation: "UNIT-02 // MEDUSA",
    description:
      "Pelagic pixel-art jellyfish with rhythmic bell head contraction, jet-propulsion surge, and fluid S-curve undulating oral arms and trailing filaments.",
    defaultTitle: "PELAGIC JELLYFISH",
    supportsViewSelection: false,
  },
];

export const CAMERA_VIEWS: CameraViewMeta[] = [
  {
    id: "side",
    name: "Side View",
    shortLabel: "Side",
    description:
      "Lateral swimming profile showcasing the copper brow crest, pleated jaw, sweeping pectoral fins, and vertical S-curve tail wave.",
  },
  {
    id: "top",
    name: "Top View",
    shortLabel: "Top",
    description:
      "Dorsal top-down view showcasing full symmetrical wingspan, glowing spine runes, and fluid horizontal S-curve swimming.",
  },
];

export const STAGE_DEFINITIONS: StageDefinition[] = [
  {
    stage: 1,
    rank: "CALF",
    shortCode: "1.CALF",
    minCommits: 0,
    rangeLabel: "0 to 149",
    sampleCommits: 64,
    unlocks: "Compact starter silhouette with smooth baseline S-curve swim glide.",
  },
  {
    stage: 2,
    rank: "YOUNG",
    shortCode: "2.YUNG",
    minCommits: 150,
    rangeLabel: "150 to 499",
    sampleCommits: 320,
    unlocks: "Larger body span with starter bioluminescent wake motes.",
  },
  {
    stage: 3,
    rank: "SUB-ADULT",
    shortCode: "3.SUBA",
    minCommits: 500,
    rangeLabel: "500 to 1,199",
    sampleCommits: 840,
    unlocks: "Expanded swim amplitude and richer ambient wake particle stream.",
  },
  {
    stage: 4,
    rank: "MATURE",
    shortCode: "4.MATR",
    minCommits: 1200,
    rangeLabel: "1,200 to 2,499",
    sampleCommits: 1990,
    unlocks: "Full mature scale with dense glowing wake trail and telemetry.",
  },
  {
    stage: 5,
    rank: "ELDER",
    shortCode: "5.ELDR",
    minCommits: 2500,
    rangeLabel: "2,500+",
    sampleCommits: 2940,
    unlocks: "Maximum elder colossus span and overcharged bioluminescent particle stream.",
  },
];

export const LANGUAGE_COUNTS: LanguageCount[] = [3, 5, 7];

export const DEFAULT_LANGUAGES: LanguageStat[] = [
  { name: "TypeScript", color: "#3178C6", share: 32 },
  { name: "JavaScript", color: "#F1E05A", share: 22 },
  { name: "Python", color: "#3572A5", share: 16 },
  { name: "Rust", color: "#DEA584", share: 10 },
  { name: "Go", color: "#00ADD8", share: 8 },
  { name: "CSS", color: "#663399", share: 7 },
  { name: "HTML", color: "#E34C26", share: 5 },
];

export const DEFAULT_CREATURE_CONFIG: CreatureConfig = {
  creature: "tulkun",
  view: "side",
  windowMode: "annual",
  colorMode: "canonical",
  colors: {
    ...ORIGINAL_CREATURE_PALETTES.tulkun,
    background: "transparent",
  },
  backgroundMode: "transparent",
  waterMode: "water",
  languageCount: 3,
  animationSpeed: 1.0,
  showHud: true,
  customTitle: "",
  hudFontSize: 14,
  hudFontFamily: "pixel",
  hudFontWeight: "bold",
  hudFontColor: "#D8F3FF",
  hudAlign: "left",
  commits: 1990,
  username: "your-username",
  languages: DEFAULT_LANGUAGES,
};
