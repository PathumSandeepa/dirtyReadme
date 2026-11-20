"use client";

import { useMemo, useState } from "react";
import { Check, Clock, Copy, Cpu, FileText, FolderGit2, X } from "lucide-react";
import {
  generateEvolveScriptMjs,
  generateEvolveWorkflowYaml,
  getMidnightCronForTimezone,
} from "@/domain/automation/workflowService";
import type { CreatureConfig } from "@/domain/creature/entities";
import { copyToClipboard } from "@/infrastructure/browser/downloadAdapter";

interface AutoEvolveDialogProps {
  open: boolean;
  onClose: () => void;
  config: CreatureConfig;
}

export function AutoEvolveDialog({
  open,
  onClose,
  config,
}: AutoEvolveDialogProps) {
  const [activeTab, setActiveTab] = useState<"workflow" | "script">("workflow");
  const [timezoneMode, setTimezoneMode] = useState<"local" | "utc">("local");
  const [copiedTarget, setCopiedTarget] = useState<"workflow" | "script" | null>(
    null
  );

  const localCron = useMemo(() => {
    const offsetEast = -new Date().getTimezoneOffset();
    return getMidnightCronForTimezone(offsetEast);
  }, []);

  if (!open) return null;

  const activeCron = timezoneMode === "local" ? localCron : "0 0 * * *";
  const workflowCode = generateEvolveWorkflowYaml(config, activeCron);
  const scriptCode = generateEvolveScriptMjs(config);
  const currentCode = activeTab === "workflow" ? workflowCode : scriptCode;

  async function handleCopy(target: "workflow" | "script") {
    const text = target === "workflow" ? workflowCode : scriptCode;
    await copyToClipboard(text);
    setCopiedTarget(target);
    setTimeout(() => setCopiedTarget(null), 2000);
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="auto-evolve-title"
    >
      <div className="flex max-h-[90vh] w-full max-w-3xl flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white text-slate-900 shadow-2xl dark:border-[#363d4a] dark:bg-[#1e222a] dark:text-slate-100">
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4 dark:border-[#363d4a]">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-900 dark:bg-[#272c36] dark:text-slate-100">
              <Cpu className="h-5 w-5" />
            </div>
            <div>
              <h2
                id="auto-evolve-title"
                className="text-base font-semibold"
              >
                Daily 12:00 AM Auto-Evolve GitHub Action
              </h2>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Updates your creature SVG and profile README details every day at midnight.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close modal"
            className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-900 dark:hover:bg-zinc-900 dark:hover:text-zinc-100"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-3 border-b border-slate-200 bg-slate-50 px-6 py-4 text-sm dark:border-[#363d4a] dark:bg-[#272c36]">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="flex items-center gap-2 font-medium">
              <Clock className="h-4 w-4 text-slate-500" />
              12:00 AM Schedule Timezone
            </span>
            <div className="inline-flex rounded-lg border border-slate-200 bg-white p-1 text-xs dark:border-[#363d4a] dark:bg-[#1e222a]">
              <button
                type="button"
                onClick={() => setTimezoneMode("local")}
                className={`rounded-md px-3 py-1 font-medium transition ${
                  timezoneMode === "local"
                    ? "bg-slate-900 text-white dark:bg-indigo-500 dark:text-white"
                    : "text-slate-600 hover:text-slate-900 dark:text-slate-400"
                }`}
              >
                12:00 AM Local ({localCron} UTC)
              </button>
              <button
                type="button"
                onClick={() => setTimezoneMode("utc")}
                className={`rounded-md px-3 py-1 font-medium transition ${
                  timezoneMode === "utc"
                    ? "bg-slate-900 text-white dark:bg-indigo-500 dark:text-white"
                    : "text-slate-600 hover:text-slate-900 dark:text-slate-400"
                }`}
              >
                12:00 AM UTC (0 0 * * *)
              </button>
            </div>
          </div>

          <ol className="grid gap-2 text-xs text-slate-600 dark:text-slate-400 sm:grid-cols-3">
            <li className="rounded-lg border border-slate-200 bg-white p-3 dark:border-[#363d4a] dark:bg-[#1e222a]">
              <strong className="text-slate-900 dark:text-slate-100">1.</strong> Push{" "}
              <code>creature.svg</code> and <code>README.md</code> first.
            </li>
            <li className="rounded-lg border border-slate-200 bg-white p-3 dark:border-[#363d4a] dark:bg-[#1e222a]">
              <strong className="text-slate-900 dark:text-slate-100">2.</strong> Add{" "}
              <code>.github/workflows/evolve-creature.yml</code>.
            </li>
            <li className="rounded-lg border border-slate-200 bg-white p-3 dark:border-[#363d4a] dark:bg-[#1e222a]">
              <strong className="text-slate-900 dark:text-slate-100">3.</strong> Add{" "}
              <code>scripts/evolve-creature.mjs</code> to your profile repo.
            </li>
          </ol>
        </div>

        <div className="flex items-center justify-between border-b border-slate-200 px-6 pt-2 dark:border-[#363d4a]">
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => setActiveTab("workflow")}
              className={`flex items-center gap-2 border-b-2 px-2 py-2.5 text-xs font-medium transition ${
                activeTab === "workflow"
                  ? "border-slate-900 text-slate-900 dark:border-indigo-400 dark:text-slate-100"
                  : "border-transparent text-slate-500 hover:text-slate-900 dark:text-slate-400"
              }`}
            >
              <FolderGit2 className="h-4 w-4" />
              .github/workflows/evolve-creature.yml
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("script")}
              className={`flex items-center gap-2 border-b-2 px-2 py-2.5 text-xs font-medium transition ${
                activeTab === "script"
                  ? "border-slate-900 text-slate-900 dark:border-indigo-400 dark:text-slate-100"
                  : "border-transparent text-slate-500 hover:text-slate-900 dark:text-slate-400"
              }`}
            >
              <FileText className="h-4 w-4" />
              scripts/evolve-creature.mjs
            </button>
          </div>
          <button
            type="button"
            onClick={() => void handleCopy(activeTab)}
            className="mb-1.5 inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 transition hover:bg-slate-50 dark:border-[#363d4a] dark:bg-[#272c36] dark:text-slate-200"
          >
            {copiedTarget === activeTab ? (
              <>
                <Check className="h-3.5 w-3.5" />
                Copied
              </>
            ) : (
              <>
                <Copy className="h-3.5 w-3.5" />
                Copy File
              </>
            )}
          </button>
        </div>

        <div className="flex-1 overflow-auto bg-slate-950 p-6">
          <pre className="font-mono text-xs leading-relaxed text-slate-200">
            <code>{currentCode}</code>
          </pre>
        </div>

        <div className="flex items-center justify-between border-t border-slate-200 px-6 py-3.5 text-xs text-slate-500 dark:border-[#363d4a] dark:text-slate-400">
          <span>
            Stages: 1 (0–149) · 2 (150–499) · 3 (500–1,199) · 4 (1,200–2,499) · 5 (2,500+)
          </span>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg bg-slate-900 px-4 py-2 text-xs font-semibold text-white transition hover:bg-slate-800 dark:bg-indigo-500 dark:text-white"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
