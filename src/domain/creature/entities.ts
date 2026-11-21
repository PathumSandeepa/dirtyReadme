export type CreatureId = "tulkun" | "jellyfish";

export type CameraView = "side" | "top";

export type ContributionWindow = "annual" | "rolling";

export type ColorMode = "canonical" | "languages" | "custom";

export type BackgroundMode = "transparent" | "custom";

export type ThemePresetId =
  | "ocean-slate"
  | "biolume-azure"
  | "mecha-prototype"
  | "cobalt-indigo"
  | "sunset-coral"
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
    rangeLabel: "0 - 149",
    sampleCommits: 64,
    unlocks: "Compact starter silhouette with smooth baseline S-curve swim glide.",
  },
  {
    stage: 2,
    rank: "YOUNG",
    shortCode: "2.YUNG",
    minCommits: 150,
    rangeLabel: "150 - 499",
    sampleCommits: 320,
    unlocks: "Larger body span with starter bioluminescent wake motes.",
  },
  {
    stage: 3,
    rank: "SUB-ADULT",
    shortCode: "3.SUBA",
    minCommits: 500,
    rangeLabel: "500 - 1,199",
    sampleCommits: 840,
    unlocks: "Expanded swim amplitude and richer ambient wake particle stream.",
  },
  {
    stage: 4,
    rank: "MATURE",
    shortCode: "4.MATR",
    minCommits: 1200,
    rangeLabel: "1,200 - 2,499",
    sampleCommits: 1990,
    unlocks: "Full mature scale with dense glowing wake trail and full telemetry.",
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

export const THEME_PRESETS: ThemePreset[] = [
  {
    id: "ocean-slate",
    name: "Ocean Tulkun",
    tagline: "Original Slate / Copper Crest / Cyan Glow",
    colors: {
      primary: "#2C4156",
      accent: "#C86D3B",
      energy: "#9CE2F8",
      frame: "#141E2B",
    },
  },
  {
    id: "biolume-azure",
    name: "Biolume Azure",
    tagline: "Original Electric Azure / Ice Cyan / Cobalt",
    colors: {
      primary: "#1F75E8",
      accent: "#7AE0FF",
      energy: "#0D3E9E",
      frame: "#0A2259",
    },
  },
  {
    id: "mecha-prototype",
    name: "Mecha White",
    tagline: "Matte Silver / Safety Orange / Cyber Green",
    colors: {
      primary: "#CBD5E1",
      accent: "#FF6B00",
      energy: "#00E676",
      frame: "#1F242D",
    },
  },
  {
    id: "cobalt-indigo",
    name: "Pastel Indigo",
    tagline: "Periwinkle / Coral / Mint Glow",
    colors: {
      primary: "#5B65D8",
      accent: "#F89B79",
      energy: "#8BE0C8",
      frame: "#262A40",
    },
  },
  {
    id: "sunset-coral",
    name: "Orchid Coral",
    tagline: "Violet Pearl / Sunset Coral / Aqua",
    colors: {
      primary: "#7E57C2",
      accent: "#FF8A65",
      energy: "#80CBC4",
      frame: "#241D35",
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
  themeId: "ocean-slate",
  colors: {
    ...THEME_PRESETS[0].colors,
    background: "transparent",
  },
  backgroundMode: "transparent",
  animationSpeed: 1.0,
  showHud: true,
  customTitle: "",
  commits: 1990,
  username: "your-username",
  languages: DEFAULT_LANGUAGES,
};
