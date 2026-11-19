"use client";

import { useMemo, useState } from "react";
import { Check, Clock, Copy, Cpu, FileCode2, GitBranch, X } from "lucide-react";
import {
  generateEvolveScriptMjs,
  generateEvolveWorkflowYaml,
  getMidnightCronForTimezone,
} from "@/lib/autoEvolveTemplates";
import type { CreatureConfig } from "@/types/creature";

interface AutoEvolveModalProps {
  open: boolean;
  onClose: () => void;
  config: CreatureConfig;
}

export function AutoEvolveModal({
  open,
  onClose,
  config,
}: AutoEvolveModalProps) {
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
    await navigator.clipboard.writeText(text);
    setCopiedTarget(target);
    setTimeout(() => setCopiedTarget(null), 2000);
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="auto-evolve-title"
    >
      <div className="flex max-h-[90vh] w-full max-w-3xl flex-col overflow-hidden rounded-lg border border-zinc-800 bg-zinc-950 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-zinc-800 px-5 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-md border border-zinc-800 bg-zinc-900 text-zinc-100">
              <Cpu className="h-4 w-4" />
            </div>
            <div>
              <h2
                id="auto-evolve-title"
                className="text-sm font-semibold text-zinc-50"
              >
                Daily 12:00 AM Auto-Evolve GitHub Action
              </h2>
              <p className="text-xs text-zinc-400">
                Automatically updates <code className="text-zinc-200">creature.svg</code> and your{" "}
                <code className="text-zinc-200">README.md</code> profile telemetry every midnight.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close modal"
            className="rounded-md p-1.5 text-zinc-400 transition hover:bg-zinc-900 hover:text-zinc-50"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Schedule Selector & Steps */}
        <div className="space-y-3 border-b border-zinc-800 bg-zinc-900/40 px-5 py-3 text-xs text-zinc-400">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="flex items-center gap-1.5 font-medium text-zinc-200">
              <Clock className="h-3.5 w-3.5 text-zinc-400" />
              12:00 AM Schedule Timezone
            </span>
            <div className="inline-flex rounded-md border border-zinc-800 bg-zinc-950 p-0.5 text-[11px]">
              <button
                type="button"
                onClick={() => setTimezoneMode("local")}
                className={`rounded px-2.5 py-1 font-mono transition ${
                  timezoneMode === "local"
                    ? "bg-zinc-50 font-semibold text-zinc-950"
                    : "text-zinc-400 hover:text-zinc-100"
                }`}
              >
                12:00 AM Local ({localCron} UTC)
              </button>
              <button
                type="button"
                onClick={() => setTimezoneMode("utc")}
                className={`rounded px-2.5 py-1 font-mono transition ${
                  timezoneMode === "utc"
                    ? "bg-zinc-50 font-semibold text-zinc-950"
                    : "text-zinc-400 hover:text-zinc-100"
                }`}
              >
                12:00 AM UTC (0 0 * * *)
              </button>
            </div>
          </div>

          <ol className="grid gap-2 sm:grid-cols-3">
            <li className="rounded-md border border-zinc-800 bg-zinc-950 px-3 py-2">
              <span className="font-mono font-semibold text-zinc-100">01.</span>{" "}
              Push <code className="text-zinc-200">creature.svg</code> &amp;{" "}
              <code className="text-zinc-200">README.md</code> to your profile repo.
            </li>
            <li className="rounded-md border border-zinc-800 bg-zinc-950 px-3 py-2">
              <span className="font-mono font-semibold text-zinc-100">02.</span>{" "}
              Add{" "}
              <code className="text-zinc-200">
                .github/workflows/evolve-creature.yml
              </code>
              .
            </li>
            <li className="rounded-md border border-zinc-800 bg-zinc-950 px-3 py-2">
              <span className="font-mono font-semibold text-zinc-100">03.</span>{" "}
              Add <code className="text-zinc-200">scripts/evolve-creature.mjs</code>{" "}
              and enable Read &amp; Write workflow permissions.
            </li>
          </ol>
        </div>

        {/* Tabs */}
        <div className="flex items-center justify-between border-b border-zinc-800 px-5 pt-2">
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setActiveTab("workflow")}
              className={`flex items-center gap-2 border-b-2 px-3 py-2 text-xs font-medium transition ${
                activeTab === "workflow"
                  ? "border-zinc-50 text-zinc-50"
                  : "border-transparent text-zinc-400 hover:text-zinc-200"
              }`}
            >
              <GitBranch className="h-3.5 w-3.5" />
              .github/workflows/evolve-creature.yml
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("script")}
              className={`flex items-center gap-2 border-b-2 px-3 py-2 text-xs font-medium transition ${
                activeTab === "script"
                  ? "border-zinc-50 text-zinc-50"
                  : "border-transparent text-zinc-400 hover:text-zinc-200"
              }`}
            >
              <FileCode2 className="h-3.5 w-3.5" />
              scripts/evolve-creature.mjs
            </button>
          </div>
          <button
            type="button"
            onClick={() => handleCopy(activeTab)}
            className="mb-1.5 inline-flex items-center gap-1.5 rounded-md border border-zinc-800 bg-zinc-900 px-3 py-1.5 text-xs font-medium text-zinc-100 transition hover:bg-zinc-800"
          >
            {copiedTarget === activeTab ? (
              <>
                <Check className="h-3.5 w-3.5 text-zinc-100" />
                Copied!
              </>
            ) : (
              <>
                <Copy className="h-3.5 w-3.5" />
                Copy File
              </>
            )}
          </button>
        </div>

        {/* Code Viewer */}
        <div className="flex-1 overflow-auto bg-black p-5">
          <pre className="font-mono text-xs leading-relaxed text-zinc-300">
            <code>{currentCode}</code>
          </pre>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-zinc-800 px-5 py-3 text-xs text-zinc-400">
          <span>
            Stages: 1 (0–149) · 2 (150–499) · 3 (500–1,199) · 4 (1,200–2,499) · 5 (2,500+)
          </span>
          <button
            type="button"
            onClick={onClose}
            className="rounded-md bg-zinc-50 px-4 py-1.5 text-xs font-semibold text-zinc-950 transition hover:bg-zinc-200"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
