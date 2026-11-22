"use client";

import { useEffect, useState } from "react";
import {
  ArrowRight,
  Cpu,
  FolderGit2,
  Moon,
  RotateCcw,
  Sun,
} from "lucide-react";
import { cn } from "cn";
import { useStudioController } from "@/application/useStudioController";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { AutoEvolveDialog } from "./components/AutoEvolveDialog";
import { CustomizeWorkspace } from "./components/CustomizeWorkspace";
import { RepoSetupScreen } from "./components/RepoSetupScreen";
import { ShowcaseGalleryView } from "./components/ShowcaseGalleryView";
import { TokenPublishScreen } from "./components/TokenPublishScreen";
import { UsernameEntryScreen } from "./components/UsernameEntryScreen";

type AppScreen = "showcase" | "username" | "repo-guide" | "customize" | "publish";

export function StudioApp() {
  const controller = useStudioController();
  const [screen, setScreen] = useState<AppScreen>("showcase");
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

  const handleUsernameNext = async (rawInput: string) => {
    await controller.syncFromGitHub(rawInput);
    setScreen("repo-guide");
  };

  const handleReset = () => {
    controller.resetAll();
    setScreen("showcase");
  };

  const containerWidthClass =
    screen === "customize"
      ? "max-w-[1600px]"
      : screen === "showcase"
        ? "max-w-6xl"
        : "max-w-5xl";

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <header className="sticky top-0 z-30 border-b bg-card/85 backdrop-blur">
        <div
          className={cn(
            "mx-auto flex flex-wrap items-center justify-between gap-3 px-4 py-3 sm:px-6",
            containerWidthClass
          )}
        >
          <button
            type="button"
            onClick={() => setScreen("showcase")}
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
            {screen !== "showcase" && (
              <Badge
                variant="secondary"
                className="hidden font-mono text-xs sm:inline-flex"
              >
                @{controller.creatureConfig.username}
              </Badge>
            )}

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

            {screen === "showcase" ? (
              <Button
                type="button"
                size="sm"
                onClick={() => setScreen("username")}
              >
                Add Profile
                <ArrowRight data-icon="inline-end" />
              </Button>
            ) : (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleReset}
              >
                <RotateCcw data-icon="inline-start" />
                Start Over
              </Button>
            )}
          </div>
        </div>
      </header>

      <main
        className={cn(
          "mx-auto w-full flex-1 px-4 py-6 sm:px-6",
          containerWidthClass
        )}
      >
        {screen === "showcase" && (
          <ShowcaseGalleryView
            creatureConfig={controller.creatureConfig}
            readmeConfig={controller.readmeConfig}
            onStartCustomize={() => setScreen("username")}
          />
        )}

        {screen === "username" && (
          <UsernameEntryScreen
            initialInput={controller.creatureConfig.username}
            loading={controller.syncLoading}
            onBack={() => setScreen("showcase")}
            onNext={handleUsernameNext}
          />
        )}

        {screen === "repo-guide" && (
          <RepoSetupScreen
            username={controller.creatureConfig.username}
            profileRepoExists={Boolean(controller.snapshot?.profileRepoExists)}
            onBack={() => setScreen("username")}
            onNext={() => setScreen("customize")}
          />
        )}

        {screen === "customize" && (
          <CustomizeWorkspace
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
            onDeleteStackCard={controller.deleteStackCard}
            onReorderStackCards={controller.reorderCards}
            onCombineStackCards={controller.combineStackCards}
            onUndoCombineStackCards={controller.undoCombineStackCards}
            onAddCustomBadgeToCard={controller.addCustomBadgeToCard}
            onOpenAutoEvolve={() => setAutoEvolveOpen(true)}
            onBackToRepoGuide={() => setScreen("repo-guide")}
            onNextToPublish={() => setScreen("publish")}
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
            hasLegacyWorkflow={Boolean(controller.snapshot?.hasLegacyWorkflow)}
            onBack={() => setScreen("customize")}
          />
        )}
      </main>

      <Separator />

      <footer className="bg-card/50">
        <div
          className={cn(
            "mx-auto flex flex-wrap items-center justify-between gap-3 px-4 py-3.5 sm:px-6",
            containerWidthClass
          )}
        >
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
