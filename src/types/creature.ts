export type CreatureId = "tulkun" | "serpent" | "manta";

export type CameraView = "side" | "dive" | "top";

export type ContributionWindow = "annual" | "rolling";

export type ColorMode = "canonical" | "languages" | "custom";

export type BackgroundMode = "transparent" | "black" | "github-dark" | "custom";

export type ThemePresetId =
  | "mecha-prototype"
  | "stealth-carbon"
  | "crimson-mecha"
  | "solar-gold"
  | "custom";

export interface LanguageStat {
  name: string;
  color: string;
  share?: number;
}

export interface CreatureColors {
  /** 75% Primary modular armor color */
  primary: string;
  /** Secondary mechanical accent (wing tips, rings, hazard stripes) */
  accent: string;
  /** Energy core & sensor glow color */
  energy: string;
  /** Dark mechanical under-frame base */
  frame: string;
  /** SVG canvas background ("transparent" or hex color) */
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
  /** Animation speed multiplier (0.5 to 2.5) */
  animationSpeed: number;
  /** Toggle bottom HUD telemetry strip inside the exported SVG */
  showHud: boolean;
  /** Custom title/tag shown in HUD (empty falls back to auto stage + creature name) */
  customTitle: string;
  /** Contribution/commit count reflected in evolution stage & HUD telemetry */
  commits: number;
  /** GitHub handle shown in HUD/share card */
  username: string;
  /** Top programming languages shown in HUD/share card & language color mode */
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

export type ReadmeTemplateId =
  | "cyber-guardian"
  | "minimal-header"
  | "auto-evolve-block"
  | "telemetry-stats";

export interface ReadmeBadge {
  id: string;
  label: string;
  color: string;
  logo?: string;
  logoColor?: string;
  category?: "design" | "frontend" | "backend" | "languages" | "devops";
  enabled: boolean;
}

export interface ReadmeActionLink {
  id: string;
  label: string;
  valueText: string;
  url: string;
  color: string;
  logo?: string;
  enabled: boolean;
}

export interface ReadmeConfig {
  templateId: ReadmeTemplateId;
  headline: string;
  subtitleTags: string[];
  bio: string;
  ctaLine: string;
  align: "center" | "left";
  imageWidth: number;
  useOutputBranchUrl: boolean;
  includeMarkers: boolean;
  includeTelemetryCaption: boolean;
  includeShareCard: boolean;
  includeStatsTable: boolean;
  customFooterMarkdown: string;
  badges: ReadmeBadge[];
  actionLinks: ReadmeActionLink[];
  /** Optional profile sidebar display metadata for realistic GitHub preview */
  profileDisplayName: string;
  profileLocation: string;
  profileCompany: string;
  profileWebsite: string;
  /** When user switches to manual raw edit mode, stores their custom edited Markdown */
  rawOverride: string | null;
}
