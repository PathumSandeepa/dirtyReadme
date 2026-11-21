import {
  CAMERA_VIEWS,
  CREATURE_CATALOG,
  STAGE_DEFINITIONS,
  type BackgroundMode,
  type CameraView,
  type CameraViewMeta,
  type CreatureConfig,
  type CreatureId,
  type CreatureMeta,
  type DerivedPalette,
  type LanguageStat,
  type StageDefinition,
} from "@/domain/creature/entities";

export type SpriteKey = "tulkun-top" | "tulkun-side" | "jellyfish";

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

export function resolveBackgroundHex(
  mode: BackgroundMode,
  customHex: string
): string {
  return mode === "transparent"
    ? "transparent"
    : normalizeHex(customHex, "#0D1117");
}

export function hexToRgb(hex: string): [number, number, number] {
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

export function getLuminance(hex: string): number {
  const [r, g, b] = hexToRgb(hex).map((v) => v / 255);
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

export function getEffectiveCameraView(
  creature: CreatureId,
  view: CameraView
): CameraView {
  if (creature === "jellyfish") return "side";
  return view === "top" ? "top" : "side";
}

export function getSpriteKey(
  creature: CreatureId,
  view: CameraView
): SpriteKey {
  if (creature === "jellyfish") return "jellyfish";
  return view === "top" ? "tulkun-top" : "tulkun-side";
}

export function getSpriteAssetPath(key: SpriteKey): string {
  const basePath = process.env.NEXT_PUBLIC_BASE_PATH || "";
  return `${basePath}/sprites/${key}.png`;
}

export function getViewDisplayLabel(
  creature: CreatureId,
  view: CameraView
): string {
  if (creature === "jellyfish") return "PELAGIC";
  return getEffectiveCameraView(creature, view).toUpperCase();
}

export function applyLanguageColors(
  baseConfig: CreatureConfig,
  languages: LanguageStat[]
): CreatureConfig {
  const lang1 = languages[0]?.color ?? "#3178C6";
  const lang2 = languages[1]?.color ?? "#FF6B00";
  const lang3 = languages[2]?.color ?? "#00E676";

  const primary = mixHex("#36506B", lang1, 0.55);
  const accent = normalizeHex(lang2, "#FF6B00");
  const energy =
    getLuminance(lang3) < 0.35
      ? mixHex(lang3, "#FFFFFF", 0.35)
      : normalizeHex(lang3, "#00E676");

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
  const primary = normalizeHex(config.colors.primary, "#2C4156");
  const accent = normalizeHex(config.colors.accent, "#C86D3B");
  const energy = normalizeHex(config.colors.energy, "#9CE2F8");
  const frame = normalizeHex(config.colors.frame, "#141E2B");
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
