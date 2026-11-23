"use client";

import "./home/homeTheme.css";
import type {
  ResolvedTheme,
  ThemePreference,
} from "@/presentation/studio/hooks/useThemePreference";
import { HomeAutoEvolveSection } from "./home/HomeAutoEvolveSection";
import { HomeCreaturesSection } from "./home/HomeCreaturesSection";
import { HomeCustomImagesSection } from "./home/HomeCustomImagesSection";
import { HomeEditorSection } from "./home/HomeEditorSection";
import { HomeFactsStrip } from "./home/HomeFactsStrip";
import { HomeFinalCtaSection } from "./home/HomeFinalCtaSection";
import { HomeFooter } from "./home/HomeFooter";
import { HomeHero } from "./home/HomeHero";
import { HomeNavbar } from "./home/HomeNavbar";
import { HomeOpenSourceSection } from "./home/HomeOpenSourceSection";
import { HomePrivacySection } from "./home/HomePrivacySection";
import { HomeSettingsSection } from "./home/HomeSettingsSection";
import { HomeStackSection } from "./home/HomeStackSection";
import { HomeTemplatesSection } from "./home/HomeTemplatesSection";

interface ShowcaseGalleryViewProps {
  themePreference: ThemePreference;
  resolvedTheme: ResolvedTheme;
  onChangeTheme: (next: ThemePreference) => void;
  onStartCustomize: () => void;
}

export function ShowcaseGalleryView({
  onStartCustomize,
}: ShowcaseGalleryViewProps) {
  return (
    <div className="home-root flex min-h-screen flex-col">
      <HomeNavbar onStartBuilding={onStartCustomize} />

      <main className="flex-1">
        <HomeHero onStartBuilding={onStartCustomize} />
        <HomeFactsStrip />
        <HomeEditorSection />
        <HomeTemplatesSection onStartBuilding={onStartCustomize} />
        <HomeStackSection />
        <HomeCreaturesSection />
        <HomeCustomImagesSection />
        <HomeSettingsSection />
        <HomeAutoEvolveSection />
        <HomePrivacySection />
        <HomeOpenSourceSection onStartBuilding={onStartCustomize} />
        <HomeFinalCtaSection onStartBuilding={onStartCustomize} />
      </main>

      <HomeFooter />
    </div>
  );
}
