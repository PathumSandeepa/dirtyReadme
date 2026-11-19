"use client";

import { useState } from "react";
import { Check, Copy, Cpu, FileCode2, GitBranch, X } from "lucide-react";
import {
  generateEvolveScriptMjs,
  generateEvolveWorkflowYaml,
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
  const [copiedTarget, setCopiedTarget] = useState<"workflow" | "script" | null>(
    null
  );

  if (!open) return null;

  const workflowCode = generateEvolveWorkflowYaml(config);
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
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="auto-evolve-title"
    >
      <div className="flex max-h-[90vh] w-full max-w-3xl flex-col overflow-hidden rounded-xl border border-[#30363d] bg-[#0d1117] shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#30363d] bg-[#161b22] px-5 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-[#00E676]/40 bg-[#00E676]/10 text-[#00E676]">
              <Cpu className="h-5 w-5" />
            </div>
            <div>
              <h2
                id="auto-evolve-title"
                className="text-base font-semibold text-[#e6edf3]"
              >
                Auto-Evolve GitHub Action (Orphan Output Branch)
              </h2>
              <p className="text-xs text-[#8b949e]">
                Publishes updated <code className="text-[#c9d1d9]">creature.svg</code> to an orphan{" "}
                <code className="text-[#c9d1d9]">output</code> branch so daily updates never bloat{" "}
                <code className="text-[#c9d1d9]">main</code>.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close modal"
            className="rounded-lg p-1.5 text-[#8b949e] transition hover:bg-[#30363d]/60 hover:text-white"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Instructions */}
        <div className="border-b border-[#30363d] bg-[#0d1117] px-5 py-3 text-xs text-[#8b949e]">
          <ol className="grid gap-1.5 sm:grid-cols-3">
            <li className="rounded-md border border-[#30363d]/70 bg-[#161b22]/60 px-3 py-2">
              <span className="font-mono font-semibold text-[#FF6B00]">
                01.
              </span>{" "}
              Save <code className="text-[#e6edf3]">creature.svg</code> (with HUD
              enabled) to your profile repo root.
            </li>
            <li className="rounded-md border border-[#30363d]/70 bg-[#161b22]/60 px-3 py-2">
              <span className="font-mono font-semibold text-[#FF6B00]">
                02.
              </span>{" "}
              Add{" "}
              <code className="text-[#e6edf3]">
                .github/workflows/evolve-creature.yml
              </code>{" "}
              and{" "}
              <code className="text-[#e6edf3]">scripts/evolve-creature.mjs</code>.
            </li>
            <li className="rounded-md border border-[#30363d]/70 bg-[#161b22]/60 px-3 py-2">
              <span className="font-mono font-semibold text-[#FF6B00]">
                03.
              </span>{" "}
              Embed from <code className="text-[#e6edf3]">raw.githubusercontent.com/.../output/creature.svg</code>.
            </li>
          </ol>
        </div>

        {/* Tabs */}
        <div className="flex items-center justify-between border-b border-[#30363d] bg-[#161b22]/60 px-5 pt-2">
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setActiveTab("workflow")}
              className={`flex items-center gap-2 border-b-2 px-3 py-2 text-xs font-medium transition ${
                activeTab === "workflow"
                  ? "border-[#FF6B00] text-[#e6edf3]"
                  : "border-transparent text-[#8b949e] hover:text-[#e6edf3]"
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
                  ? "border-[#00E676] text-[#e6edf3]"
                  : "border-transparent text-[#8b949e] hover:text-[#e6edf3]"
              }`}
            >
              <FileCode2 className="h-3.5 w-3.5" />
              scripts/evolve-creature.mjs
            </button>
          </div>
          <button
            type="button"
            onClick={() => handleCopy(activeTab)}
            className="mb-1.5 inline-flex items-center gap-1.5 rounded-md border border-[#30363d] bg-[#21262d] px-3 py-1.5 text-xs font-medium text-[#e6edf3] transition hover:border-[#8b949e] hover:bg-[#30363d]"
          >
            {copiedTarget === activeTab ? (
              <>
                <Check className="h-3.5 w-3.5 text-[#00E676]" />
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
        <div className="flex-1 overflow-auto bg-[#090c10] p-5">
          <pre className="font-mono text-xs leading-relaxed text-[#c9d1d9]">
            <code>{currentCode}</code>
          </pre>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-[#30363d] bg-[#161b22] px-5 py-3 text-xs text-[#8b949e]">
          <span>
            Stages: 1 (0–149) • 2 (150–499) • 3 (500–1,199) • 4 (1,200–2,499) • 5 (2,500+)
          </span>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg bg-[#21262d] px-4 py-1.5 font-medium text-[#e6edf3] transition hover:bg-[#30363d]"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
