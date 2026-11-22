"use client";

import { useCallback, useEffect, useState } from "react";
import {
  ArrowRight,
  Cpu,
  FolderGit2,
  Moon,
  Sun,
} from "lucide-react";
import { useStudioController } from "@/application/useStudioController";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { AutoEvolveDialog } from "./components/AutoEvolveDialog";
import { CustomizeWorkspace } from "./components/CustomizeWorkspace";
import { RepoSetupScreen } from "./components/RepoSetupScreen";
import { ShowcaseGalleryView } from "./components/ShowcaseGalleryView";
import { TokenPublishScreen } from "./components/TokenPublishScreen";
import { UsernameEntryScreen } from "./components/UsernameEntryScreen";
import { StudioShell } from "./studio/layout/StudioShell";
import type {
  CustomizeSubTab,
  StudioMainStep,
} from "./studio/layout/StudioStepper";

type AppScreen = "showcase" | "username" | "repo-guide" | "customize" | "publish";

function parseHashRoute(hash: string): {
  screen: AppScreen;
  subTab?: CustomizeSubTab;
} {
  const clean = hash.replace(/^#\/?/, "").toLowerCase();
  if (clean === "connect") return { screen: "username" };
  if (clean === "repository") return { screen: "repo-guide" };
  if (clean === "customize/readme") {
    return { screen: "customize", subTab: "readme" };
  }
  if (clean === "customize/creature" || clean === "customize") {
    return { screen: "customize", subTab: "creature" };
  }
  if (clean === "publish") return { screen: "publish" };
  return { screen: "showcase" };
}

function formatHashRoute(screen: AppScreen, subTab: CustomizeSubTab): string {
  switch (screen) {
    case "username":
      return "#/connect";
    case "repo-guide":
      return "#/repository";
    case "customize":
      return subTab === "readme"
        ? "#/customize/readme"
        : "#/customize/creature";
    case "publish":
      return "#/publish";
    default:
      return "#/";
  }
}

export function StudioApp() {
  const controller = useStudioController();
  const [screen, setScreen] = useState<AppScreen>("showcase");
  const [customizeSubTab, setCustomizeSubTab] =
    useState<CustomizeSubTab>("creature");
  const [autoEvolveOpen, setAutoEvolveOpen] = useState(false);
  const [isDark, setIsDark] = useState(true);

  useEffect(() => {
    const root = document.documentElement;
    if (isDark) {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
  }, [isDark]);

  useEffect(() => {
    const applyHash = () => {
      const parsed = parseHashRoute(window.location.hash);
      setScreen(parsed.screen);
      if (parsed.subTab) {
        setCustomizeSubTab(parsed.subTab);
      }
    };

    if (window.location.hash) {
      applyHash();
    }

    window.addEventListener("hashchange", applyHash);
    return () => window.removeEventListener("hashchange", applyHash);
  }, []);

  const navigateTo = useCallback(
    (nextScreen: AppScreen, nextSubTab?: CustomizeSubTab) => {
      const resolvedSubTab = nextSubTab ?? customizeSubTab;
      setScreen(nextScreen);
      if (nextSubTab) {
        setCustomizeSubTab(nextSubTab);
      }
      const targetHash = formatHashRoute(nextScreen, resolvedSubTab);
      if (typeof window !== "undefined" && window.location.hash !== targetHash) {
        window.location.hash = targetHash;
      }
      if (typeof window !== "undefined") {
        window.scrollTo(0, 0);
      }
    },
    [customizeSubTab]
  );

  const handleUsernameNext = async (rawInput: string) => {
    const snap = await controller.syncFromGitHub(rawInput);
    if (snap) {
      navigateTo("repo-guide");
    }
  };

  const handleReset = () => {
    controller.resetAll();
    navigateTo("showcase", "creature");
  };

  const handleNavigateStep = (step: StudioMainStep) => {
    if (step === "connect") navigateTo("username");
    else if (step === "repository") navigateTo("repo-guide");
    else if (step === "customize") navigateTo("customize", customizeSubTab);
    else navigateTo("publish");
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
          onToggleTheme={() => setIsDark((prev) => !prev)}
          currentStep={currentStep}
          customizeSubTab={customizeSubTab}
          onGoHome={() => navigateTo("showcase")}
          onNavigateStep={handleNavigateStep}
          onChangeCustomizeSubTab={(tab) => navigateTo("customize", tab)}
          onResetAll={handleReset}
          showActionBar={screen === "customize"}
          showFooter={screen !== "customize"}
          backLabel="Back"
          nextLabel={
            customizeSubTab === "creature"
              ? "Next: README Text & Stack"
              : "Next: Token & Push"
          }
          onBack={() => {
            if (customizeSubTab === "readme") {
              navigateTo("customize", "creature");
            } else {
              navigateTo("repo-guide");
            }
          }}
          onNext={() => {
            if (customizeSubTab === "creature") {
              navigateTo("customize", "readme");
            } else {
              navigateTo("publish");
            }
          }}
        >
          {screen === "username" && (
            <UsernameEntryScreen
              initialInput={controller.creatureConfig.username}
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
              onNext={() => navigateTo("customize", "creature")}
            />
          )}

          {screen === "customize" && (
            <CustomizeWorkspace
              activeTab={customizeSubTab}
              onChangeTab={(tab) => navigateTo("customize", tab)}
              creatureConfig={controller.creatureConfig}
              readmeConfig={controller.readmeConfig}
              customBgHex={controller.customBgHex}
              snapshot={controller.snapshot}
              readmeMarkdown={controller.fullReadmeMarkdown}
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
              onOpenAutoEvolve={() => setAutoEvolveOpen(true)}
            />
          )}

          {screen === "publish" && (
            <TokenPublishScreen
              creatureConfig={controller.creatureConfig}
              readmeConfig={controller.readmeConfig}
              readmeMarkdown={controller.fullReadmeMarkdown}
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
              onBack={() => navigateTo("customize", "readme")}
            />
          )}
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
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <header className="sticky top-0 z-30 border-b bg-card/85 backdrop-blur">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-3 sm:px-6">
          <button
            type="button"
            onClick={() => navigateTo("showcase")}
            className="flex items-center gap-2.5 text-left"
          >
            <div className="flex size-8 items-center justify-center rounded-md bg-muted text-foreground">
              <Cpu className="size-4" />
            </div>
            <span className="font-mono text-sm font-semibold tracking-tight text-foreground">
              dynamic-creature
            </span>
          </button>

          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setIsDark((prev) => !prev)}
            >
              {isDark ? (
                <Sun data-icon="inline-start" />
              ) : (
                <Moon data-icon="inline-start" />
              )}
              {isDark ? "Light" : "Dark"}
            </Button>

            <Button
              type="button"
              size="sm"
              onClick={() => navigateTo("username")}
            >
              Add Profile
              <ArrowRight data-icon="inline-end" />
            </Button>
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-6 sm:px-6">
        <ShowcaseGalleryView
          creatureConfig={controller.creatureConfig}
          readmeConfig={controller.readmeConfig}
          onStartCustomize={() => navigateTo("username")}
        />
      </main>

      <Separator />

      <footer className="bg-card/50">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-3.5 sm:px-6">
          <div className="flex items-center gap-2 font-mono text-xs text-muted-foreground">
            <Cpu className="size-3.5 text-foreground" />
            <span>
              <strong className="font-semibold text-foreground">
                dynamic-creature
              </strong>{" "}
              by PathumSandeepa · S-curve Animated WebP &amp; GIF GitHub profile
              builder.
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            <Button
              variant="ghost"
              size="sm"
              nativeButton={false}
              render={
                <a
                  href="https://github.com/PathumSandeepa/dynamic-readme-creature"
                  target="_blank"
                  rel="noreferrer"
                />
              }
            >
              <FolderGit2 data-icon="inline-start" />
              repository
            </Button>
            <Button
              variant="ghost"
              size="sm"
              nativeButton={false}
              render={
                <a
                  href="https://github.com/PathumSandeepa"
                  target="_blank"
                  rel="noreferrer"
                />
              }
            >
              github.com/PathumSandeepa
            </Button>
          </div>
        </div>
      </footer>

      <AutoEvolveDialog
        open={autoEvolveOpen}
        onClose={() => setAutoEvolveOpen(false)}
        config={controller.creatureConfig}
        readmeConfig={controller.readmeConfig}
      />
    </div>
  );
}
