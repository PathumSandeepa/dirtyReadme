"use client";

import { useEffect, useState } from "react";
import { ArrowRight, Cpu, Moon, RotateCcw, Sun } from "lucide-react";
import { useStudioController } from "@/application/useStudioController";
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
  const [isDark, setIsDark] = useState(false);

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

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 transition-colors dark:bg-[#14171c] dark:text-slate-100">
      <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 backdrop-blur dark:border-[#363d4a] dark:bg-[#1b1f26]/95">
        <div className="mx-auto flex max-w-[1440px] flex-wrap items-center justify-between gap-4 px-5 py-3.5 sm:px-8">
          <button
            type="button"
            onClick={() => setScreen("showcase")}
            className="flex items-center gap-3 text-left"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600 text-white dark:bg-indigo-500">
              <Cpu className="h-5 w-5" />
            </div>
            <div>
              <span className="block text-base font-semibold tracking-tight text-slate-900 dark:text-slate-100">
                Dynamic Cybernetic Creature Studio
              </span>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {screen === "showcase"
                  ? "Animated SVG creatures & customizable GitHub profile README"
                  : `Configuring profile for @${controller.creatureConfig.username}`}
              </p>
            </div>
          </button>

          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={() => setIsDark((prev) => !prev)}
              className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-medium text-slate-700 transition hover:bg-slate-50 dark:border-[#363d4a] dark:bg-[#272c36] dark:text-slate-200 dark:hover:bg-[#2f3642]"
            >
              {isDark ? (
                <>
                  <Sun className="h-4 w-4 text-amber-400" />
                  <span>Light Mode</span>
                </>
              ) : (
                <>
                  <Moon className="h-4 w-4 text-indigo-600" />
                  <span>Dark Mode</span>
                </>
              )}
            </button>

            {screen === "showcase" ? (
              <button
                type="button"
                onClick={() => setScreen("username")}
                className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2 text-xs font-semibold text-white transition hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-400"
              >
                <span>Add Profile</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
            ) : (
              <button
                type="button"
                onClick={handleReset}
                className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-medium text-slate-700 transition hover:bg-slate-50 dark:border-[#363d4a] dark:bg-[#272c36] dark:text-slate-200 dark:hover:bg-[#2f3642]"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                Start Over
              </button>
            )}
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-[1440px] px-5 py-6 sm:px-8">
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
            creatureSvg={controller.creatureSvg}
            shareCardSvg={controller.shareCardSvg}
            readmeMarkdown={controller.fullReadmeMarkdown}
            onSelectCreature={controller.selectCreature}
            onSelectView={controller.selectView}
            onApplyPreset={controller.applyThemePreset}
            onUpdateColor={controller.updateCreatureColor}
            onSetBackgroundMode={controller.setBackgroundMode}
            onUpdateCustomBg={controller.updateCustomBackground}
            onUpdateCreatureConfig={controller.setCreatureConfig}
            onUpdateReadmeField={controller.updateReadmeField}
            onChangeRawMarkdown={(raw) =>
              controller.updateReadmeField("rawOverride", raw)
            }
            onReorderBadges={controller.reorderBadges}
            onMoveBadge={controller.moveBadgeByStep}
            onReorderTags={controller.reorderSubtitleTags}
            onOpenAutoEvolve={() => setAutoEvolveOpen(true)}
            onBackToRepoGuide={() => setScreen("repo-guide")}
            onNextToPublish={() => setScreen("publish")}
          />
        )}

        {screen === "publish" && (
          <TokenPublishScreen
            creatureConfig={controller.creatureConfig}
            creatureSvg={controller.creatureSvg}
            shareCardSvg={controller.shareCardSvg}
            readmeMarkdown={controller.fullReadmeMarkdown}
            includeShareCard={controller.readmeConfig.includeShareCard}
            defaultBranch={controller.snapshot?.profileRepoBranch || "main"}
            onBack={() => setScreen("customize")}
          />
        )}
      </main>

      <AutoEvolveDialog
        open={autoEvolveOpen}
        onClose={() => setAutoEvolveOpen(false)}
        config={controller.creatureConfig}
      />
    </div>
  );
}
