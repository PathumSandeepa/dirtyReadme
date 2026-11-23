"use client";

import { useCallback, useEffect, useState } from "react";
import { useStudioController } from "@/application/useStudioController";
import { DEFAULT_DUMMY_INTRO } from "@/domain/profile/entities";
import { buildStructuredProfileMarkdown } from "@/domain/profile/readmeService";
import type { GitHubProfileSnapshot } from "@/infrastructure/github/githubClient";
import { AutoEvolveDialog } from "./components/AutoEvolveDialog";
import { CustomizeWorkspace } from "./components/CustomizeWorkspace";
import {
  isCustomizePartId,
  type CustomizePartId,
} from "./components/customize/customizeTypes";
import { RepoSetupScreen } from "./components/RepoSetupScreen";
import { ShowcaseGalleryView } from "./components/ShowcaseGalleryView";
import { TokenPublishScreen } from "./components/TokenPublishScreen";
import { UsernameEntryScreen } from "./components/UsernameEntryScreen";
import { useThemePreference } from "./studio/hooks/useThemePreference";
import { StudioShell } from "./studio/layout/StudioShell";
import type { StudioMainStep } from "./studio/layout/StudioStepper";

type AppScreen = "showcase" | "username" | "repo-guide" | "customize" | "publish";

function parseHashRoute(hash: string): {
  screen: AppScreen;
  part?: CustomizePartId;
} {
  const clean = hash.replace(/^#\/?/, "").toLowerCase();
  if (clean === "connect") return { screen: "username" };
  if (clean === "repository") return { screen: "repo-guide" };
  if (clean === "customize" || clean === "customize/header") {
    return { screen: "customize", part: "header" };
  }
  if (clean === "customize/readme") {
    return { screen: "customize", part: "header" };
  }
  if (clean.startsWith("customize/")) {
    const seg = clean.slice("customize/".length);
    if (isCustomizePartId(seg)) {
      return { screen: "customize", part: seg };
    }
    return { screen: "customize", part: "header" };
  }
  if (clean === "publish") return { screen: "publish" };
  return { screen: "showcase" };
}

function formatHashRoute(screen: AppScreen, part: CustomizePartId): string {
  switch (screen) {
    case "username":
      return "#/connect";
    case "repo-guide":
      return "#/repository";
    case "customize":
      return part === "header" ? "#/customize" : `#/customize/${part}`;
    case "publish":
      return "#/publish";
    default:
      return "#/";
  }
}

export function StudioApp() {
  const controller = useStudioController();
  const {
    preference: themePreference,
    resolvedTheme,
    isDark,
    setPreference: setThemePreference,
  } = useThemePreference();
  const [screen, setScreen] = useState<AppScreen>("showcase");
  const [customizePart, setCustomizePart] = useState<CustomizePartId>("header");
  const [autoEvolveOpen, setAutoEvolveOpen] = useState(false);

  useEffect(() => {
    const applyHash = () => {
      const parsed = parseHashRoute(window.location.hash);
      setScreen(parsed.screen);
      if (parsed.part) {
        setCustomizePart(parsed.part);
      }
    };

    if (window.location.hash) {
      applyHash();
    }

    window.addEventListener("hashchange", applyHash);
    return () => window.removeEventListener("hashchange", applyHash);
  }, []);

  const navigateTo = useCallback(
    (nextScreen: AppScreen, nextPart?: CustomizePartId) => {
      const resolvedPart = nextPart ?? customizePart;
      setScreen(nextScreen);
      if (nextPart) {
        setCustomizePart(nextPart);
      }
      const targetHash = formatHashRoute(nextScreen, resolvedPart);
      if (typeof window !== "undefined" && window.location.hash !== targetHash) {
        window.location.hash = targetHash;
      }
      if (typeof window !== "undefined" && nextScreen !== screen) {
        window.scrollTo(0, 0);
      }
    },
    [customizePart, screen]
  );

  const handleUsernameNext = async (
    rawInput: string,
    preloadedSnapshot?: GitHubProfileSnapshot | null
  ) => {
    const snap = await controller.syncFromGitHub(
      rawInput,
      undefined,
      preloadedSnapshot
    );
    if (snap) {
      navigateTo("repo-guide");
    }
  };

  const handleReset = () => {
    controller.resetAll();
    navigateTo("showcase", "header");
  };

  const handleNavigateStep = (step: StudioMainStep) => {
    if (step === "connect") navigateTo("username");
    else if (step === "repository") navigateTo("repo-guide");
    else if (step === "customize") navigateTo("customize", customizePart);
    else navigateTo("publish");
  };

  const handleSyncIntroFromForm = () => {
    const snap = controller.snapshot;
    const syncedHeadline = snap
      ? `${snap.displayName}, Software developer`
      : controller.readmeConfig.headline;
    const syncedIntro = DEFAULT_DUMMY_INTRO.replaceAll(
      "{{USERNAME}}",
      controller.creatureConfig.username || "your-username"
    );
    const nextConfig = {
      ...controller.readmeConfig,
      headline: syncedHeadline,
      bio: syncedIntro,
    };
    const nextMarkdown = buildStructuredProfileMarkdown(
      controller.creatureConfig,
      nextConfig
    );
    controller.updateReadmeField("headline", syncedHeadline);
    controller.updateReadmeField("bio", syncedIntro);
    controller.updateReadmeField("advancedProfileMarkdown", nextMarkdown);
  };

  if (screen !== "showcase") {
    const currentStep: StudioMainStep =
      screen === "username"
        ? "connect"
        : screen === "repo-guide"
          ? "repository"
          : screen === "publish"
            ? "publish"
            : "customize";

    return (
      <>
        <StudioShell
          username={controller.creatureConfig.username}
          isDark={isDark}
          onToggleTheme={() => setThemePreference(isDark ? "light" : "dark")}
          currentStep={currentStep}
          onGoHome={() => navigateTo("showcase")}
          onNavigateStep={handleNavigateStep}
          onResetAll={handleReset}
          showActionBar={screen === "customize"}
          showFooter={screen !== "customize"}
          backLabel="Back"
          nextLabel="Continue to publish"
          onBack={() => navigateTo("repo-guide")}
          onNext={() => navigateTo("publish")}
        >
          <div key={screen} className="studio-step-enter">
            {screen === "username" && (
              <UsernameEntryScreen
                initialInput={controller.creatureConfig.username}
                initialSnapshot={controller.snapshot}
                loading={controller.syncLoading}
                syncError={controller.syncError}
                onClearError={controller.clearSyncError}
                onBack={() => navigateTo("showcase")}
                onNext={handleUsernameNext}
              />
            )}

            {screen === "repo-guide" && (
              <RepoSetupScreen
                username={controller.creatureConfig.username}
                profileRepoExists={Boolean(
                  controller.snapshot?.profileRepoExists
                )}
                onBack={() => navigateTo("username")}
                onNext={() => navigateTo("customize", "header")}
              />
            )}

            {screen === "customize" && (
              <CustomizeWorkspace
                activePart={customizePart}
                onChangePart={(part) => navigateTo("customize", part)}
                onContinueToPublish={() => navigateTo("publish")}
                creatureConfig={controller.creatureConfig}
                readmeConfig={controller.readmeConfig}
                customBgHex={controller.customBgHex}
                snapshot={controller.snapshot}
                readmeMarkdown={controller.fullReadmeMarkdown}
                customImages={controller.customImages}
                imageUrlMap={controller.imageUrlMap}
                restoredNotice={controller.restoredNotice}
                onDismissRestoredNotice={controller.dismissRestoredNotice}
                onSelectCreature={controller.selectCreature}
                onSelectView={controller.selectView}
                onSelectWindow={controller.selectWindow}
                onApplyOriginalColors={controller.applyOriginalColors}
                onApplyAutoLanguageColors={controller.applyAutoLanguageColors}
                onSetLanguageCount={controller.setLanguageCount}
                onUpdateLanguageColor={controller.updateLanguageColor}
                onUpdateLanguageName={controller.updateLanguageName}
                onResetLanguageColors={controller.resetLanguageColors}
                onSetWaterMode={controller.setWaterMode}
                onSetBackgroundMode={controller.setBackgroundMode}
                onUpdateCustomBg={controller.updateCustomBackground}
                onUpdateCreatureConfig={controller.setCreatureConfig}
                onUpdateReadmeField={controller.updateReadmeField}
                onSelectTemplate={controller.selectReadmeTemplate}
                onChangeRawMarkdown={(raw) =>
                  controller.updateReadmeField("rawOverride", raw)
                }
                onAddBadgeToCard={controller.addBadgeToCard}
                onRemoveBadgeFromCard={controller.removeBadgeFromCard}
                onMoveBadgeAcrossCards={controller.moveBadgeAcrossCards}
                onAddStackCard={controller.addStackCard}
                onRenameStackCard={controller.renameStackCard}
                onToggleStackCardVisibility={
                  controller.toggleStackCardVisibility
                }
                onDeleteStackCard={controller.deleteStackCard}
                onReorderStackCards={controller.reorderCards}
                onCombineStackCards={controller.combineStackCards}
                onUndoCombineStackCards={controller.undoCombineStackCards}
                onAddCustomBadgeToCard={controller.addCustomBadgeToCard}
                onRegisterCustomImage={controller.registerCustomImage}
                onSetCustomBannerImage={controller.setCustomBannerImage}
                onClearCustomBannerImage={controller.clearCustomBannerImage}
                onUpdateBannerAlt={controller.updateCustomBannerAlt}
                onSyncFromForm={handleSyncIntroFromForm}
                onOpenAutoEvolve={() => setAutoEvolveOpen(true)}
              />
            )}

            {screen === "publish" && (
              <TokenPublishScreen
                creatureConfig={controller.creatureConfig}
                readmeConfig={controller.readmeConfig}
                readmeMarkdown={controller.fullReadmeMarkdown}
                customImages={controller.referencedCustomImages}
                includeShareCard={
                  controller.readmeConfig.templateId !== "minimal-header" &&
                  controller.readmeConfig.templateId !== "auto-evolve-block" &&
                  controller.readmeConfig.includeShareCard
                }
                defaultBranch={controller.snapshot?.profileRepoBranch || "main"}
                initialProfileRepoExists={Boolean(
                  controller.snapshot?.profileRepoExists
                )}
                hasLegacyWorkflow={Boolean(
                  controller.snapshot?.hasLegacyWorkflow
                )}
                onBack={() => navigateTo("customize", "creature")}
              />
            )}
          </div>
        </StudioShell>

        <AutoEvolveDialog
          open={autoEvolveOpen}
          onClose={() => setAutoEvolveOpen(false)}
          config={controller.creatureConfig}
          readmeConfig={controller.readmeConfig}
        />
      </>
    );
  }

  return (
    <ShowcaseGalleryView
      themePreference={themePreference}
      resolvedTheme={resolvedTheme}
      onChangeTheme={setThemePreference}
      onStartCustomize={() => navigateTo("username")}
    />
  );
}
