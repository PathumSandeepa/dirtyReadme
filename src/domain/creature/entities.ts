export type CreatureId = "tulkun" | "jellyfish";

export type CameraView = "side" | "dive" | "top";

export type ContributionWindow = "annual" | "rolling";

export type ColorMode = "canonical" | "languages" | "custom";

export type BackgroundMode = "transparent" | "black" | "github-dark" | "custom";

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
      "Crisp left-swimming pixel leviathan with dithered throat pleats, golden brow armor, long sweeping pectoral wings, and forked tail fluke.",
    defaultTitle: "MATURE TULKUN",
  },
  {
    id: "jellyfish",
    name: "Pixel Jellyfish",
    subtitle: "Bioluminescent Medusa",
    designation: "UNIT-02 // MEDUSA",
    description:
      "Left-facing pixel-art jellyfish on a transparent background with a pulsing translucent bell, undulating frill ribbons, and waving tentacles.",
    defaultTitle: "PELAGIC JELLYFISH",
  },
];

export const CAMERA_VIEWS: CameraViewMeta[] = [
  {
    id: "side",
    name: "Lateral Swim",
    shortLabel: "Side",
    description:
      "Classic left-facing swimming profile showcasing full silhouette, fins or tentacles, and fluid stroke cycle.",
  },
  {
    id: "dive",
    name: "Angled Dive",
    shortLabel: "Dive",
    description:
      "Dynamic angled glide perspective highlighting downward sweep motion and depth contrast.",
  },
  {
    id: "top",
    name: "Panoramic Drift",
    shortLabel: "Top",
    description:
      "Wide balanced drift angle emphasizing wingspan, bell rim, or full trailing wave array.",
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
    unlocks: "Compact starter body silhouette, gentle swim glide, and starter fin/tentacle cluster.",
  },
  {
    stage: 2,
    rank: "YOUNG",
    shortCode: "2.YUNG",
    minCommits: 150,
    rangeLabel: "150 - 499",
    sampleCommits: 320,
    unlocks: "Extended body length, secondary trailing fins/ribbons, and active telemetry nodes.",
  },
  {
    stage: 3,
    rank: "SUB-ADULT",
    shortCode: "3.SUBA",
    minCommits: 500,
    rangeLabel: "500 - 1,199",
    sampleCommits: 840,
    unlocks: "Full lateral glow striping, stronger pectoral sweep, and denser pixel highlight detail.",
  },
  {
    stage: 4,
    rank: "MATURE",
    shortCode: "4.MATR",
    minCommits: 1200,
    rangeLabel: "1,200 - 2,499",
    sampleCommits: 1990,
    unlocks: "Signature armored crest or full frill halo with maximum articulated tail and tentacle sweep.",
  },
  {
    stage: 5,
    rank: "ELDER",
    shortCode: "5.ELDR",
    minCommits: 2500,
    rangeLabel: "2,500+",
    sampleCommits: 2940,
    unlocks: "Elder colossus scale, radiant energy crests, and overcharged bioluminescent filaments.",
  },
];

export const THEME_PRESETS: ThemePreset[] = [
  {
    id: "ocean-slate",
    name: "Ocean Tulkun",
    tagline: "Slate Navy / Gold Crest / Sky Stripe",
    colors: {
      primary: "#36506B",
      accent: "#E4AE5B",
      energy: "#4E9AE6",
      frame: "#1F2E3E",
    },
  },
  {
    id: "biolume-azure",
    name: "Biolume Azure",
    tagline: "Ice Cyan / Sky Blue / Deep Cobalt",
    colors: {
      primary: "#4399F2",
      accent: "#9AE6FF",
      energy: "#1E5DC8",
      frame: "#122C66",
    },
  },
  {
    id: "mecha-prototype",
    name: "Mecha White",
    tagline: "Matte White / Safety Orange / Cyber Green",
    colors: {
      primary: "#ECEFF4",
      accent: "#FF6B00",
      energy: "#00E676",
      frame: "#1F242D",
    },
  },
  {
    id: "cobalt-indigo",
    name: "Pastel Indigo",
    tagline: "Periwinkle / Mint / Coral",
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
    tagline: "Violet Pearl / Coral Pink / Aqua",
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
