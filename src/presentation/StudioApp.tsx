"use client";

import { useEffect, useState } from "react";
import {
  CheckCircle2,
  Cpu,
  FileText,
  FolderGit2,
  Moon,
  RotateCcw,
  Sun,
} from "lucide-react";
import { useStudioController } from "@/application/useStudioController";
import { AutoEvolveDialog } from "./components/AutoEvolveDialog";
import { CreatureStepPanel } from "./components/CreatureStepPanel";
import { PreviewWorkspace } from "./components/PreviewWorkspace";
import { ProfileReadmeStepPanel } from "./components/ProfileReadmeStepPanel";
import { PublishStepPanel } from "./components/PublishStepPanel";

type WizardStep = 1 | 2 | 3;

export function StudioApp() {
  const controller = useStudioController();
  const [step, setStep] = useState<WizardStep>(1);
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

  const steps: {
    id: WizardStep;
    title: string;
    subtitle: string;
    icon: React.ReactNode;
  }[] = [
    {
      id: 1,
      title: "1. Design Creature",
      subtitle: "Model, colors & animation",
      icon: <Cpu className="h-4 w-4" />,
    },
    {
      id: 2,
      title: "2. Customize README",
      subtitle: "Text, links & drag-drop stack",
      icon: <FileText className="h-4 w-4" />,
    },
    {
      id: 3,
      title: "3. Connect & Publish",
      subtitle: "Create repo, PAT & push",
      icon: <FolderGit2 className="h-4 w-4" />,
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 transition-colors dark:bg-zinc-950 dark:text-zinc-100">
      <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/90 backdrop-blur dark:border-zinc-800 dark:bg-zinc-950/90">
        <div className="mx-auto flex max-w-[1440px] flex-wrap items-center justify-between gap-4 px-5 py-4 sm:px-8">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-900 text-white dark:bg-zinc-100 dark:text-zinc-900">
              <Cpu className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-base font-semibold tracking-tight text-slate-900 dark:text-zinc-100">
                Dynamic Cybernetic Creature Studio
              </h1>
              <p className="text-xs text-slate-500 dark:text-zinc-400">
                Build an animated GitHub profile creature & custom README in 3 simple steps
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={() => setIsDark((prev) => !prev)}
              className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-medium text-slate-700 transition hover:bg-slate-50 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:bg-zinc-800"
            >
              {isDark ? (
                <>
                  <Sun className="h-4 w-4" />
                  <span>Light Mode</span>
                </>
              ) : (
                <>
                  <Moon className="h-4 w-4" />
                  <span>Dark Mode</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={() => {
                controller.resetAll();
                setStep(1);
              }}
              className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-medium text-slate-700 transition hover:bg-slate-50 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:bg-zinc-800"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              Reset All
            </button>
          </div>
        </div>

        <div className="border-t border-slate-100 bg-slate-50/70 dark:border-zinc-900 dark:bg-zinc-900/40">
          <div className="mx-auto grid max-w-[1440px] gap-3 px-5 py-3 sm:grid-cols-3 sm:px-8">
            {steps.map((item) => {
              const active = step === item.id;
              const completed = step > item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setStep(item.id)}
                  className={`flex items-center gap-3 rounded-xl border px-4 py-2.5 text-left transition ${
                    active
                      ? "border-slate-900 bg-white shadow-sm dark:border-zinc-100 dark:bg-zinc-900"
                      : "border-slate-200 bg-white/60 hover:border-slate-300 hover:bg-white dark:border-zinc-800 dark:bg-zinc-950/60 dark:hover:border-zinc-700"
                  }`}
                >
                  <div
                    className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${
                      active
                        ? "bg-slate-900 text-white dark:bg-zinc-100 dark:text-zinc-900"
                        : completed
                          ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300"
                          : "bg-slate-100 text-slate-500 dark:bg-zinc-800 dark:text-zinc-400"
                    }`}
                  >
                    {completed ? (
                      <CheckCircle2 className="h-4 w-4" />
                    ) : (
                      item.icon
                    )}
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-slate-900 dark:text-zinc-100">
                      {item.title}
                    </div>
                    <div className="text-xs text-slate-500 dark:text-zinc-400">
                      {item.subtitle}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-[1440px] px-5 py-7 sm:px-8">
        <div className="grid items-start gap-7 lg:grid-cols-12">
          <section className="lg:col-span-5">
            {step === 1 && (
              <CreatureStepPanel
                config={controller.creatureConfig}
                customBgHex={controller.customBgHex}
                onSelectCreature={controller.selectCreature}
                onSelectView={controller.selectView}
                onApplyPreset={controller.applyThemePreset}
                onUpdateColor={controller.updateCreatureColor}
                onSetBackgroundMode={controller.setBackgroundMode}
                onUpdateCustomBg={controller.updateCustomBackground}
                onUpdateConfig={controller.setCreatureConfig}
                onNextStep={() => setStep(2)}
              />
            )}

            {step === 2 && (
              <ProfileReadmeStepPanel
                creatureConfig={controller.creatureConfig}
                readmeConfig={controller.readmeConfig}
                onUpdateField={controller.updateReadmeField}
                onChangeRawMarkdown={(raw) =>
                  controller.updateReadmeField("rawOverride", raw)
                }
                onReorderBadges={controller.reorderBadges}
                onMoveBadge={controller.moveBadgeByStep}
                onReorderTags={controller.reorderSubtitleTags}
                onPrevStep={() => setStep(1)}
                onNextStep={() => setStep(3)}
              />
            )}

            {step === 3 && (
              <PublishStepPanel
                creatureConfig={controller.creatureConfig}
                creatureSvg={controller.creatureSvg}
                shareCardSvg={controller.shareCardSvg}
                readmeMarkdown={controller.fullReadmeMarkdown}
                snapshot={controller.snapshot}
                syncLoading={controller.syncLoading}
                syncError={controller.syncError}
                onSyncFromGitHub={controller.syncFromGitHub}
                onSelectWindow={controller.selectWindow}
                onOpenAutoEvolveModal={() => setAutoEvolveOpen(true)}
                onPrevStep={() => setStep(2)}
              />
            )}
          </section>

          <section className="lg:sticky lg:top-36 lg:col-span-7">
            <PreviewWorkspace
              creatureConfig={controller.creatureConfig}
              readmeConfig={controller.readmeConfig}
              creatureSvg={controller.creatureSvg}
              shareCardSvg={controller.shareCardSvg}
              readmeMarkdown={controller.fullReadmeMarkdown}
              snapshot={controller.snapshot}
              onEditReadme={() => setStep(2)}
              onOpenAutoEvolve={() => setAutoEvolveOpen(true)}
              onSelectView={controller.selectView}
              onApplyCommits={(commits) =>
                controller.setCreatureConfig((prev) => ({
                  ...prev,
                  commits,
                }))
              }
            />
          </section>
        </div>
      </main>

      <AutoEvolveDialog
        open={autoEvolveOpen}
        onClose={() => setAutoEvolveOpen(false)}
        config={controller.creatureConfig}
      />
    </div>
  );
}
