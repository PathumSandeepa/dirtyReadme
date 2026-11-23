"use client";

import { useMemo, useState } from "react";
import { Check, Copy, Download, FileCode2, FileText, FolderGit2 } from "lucide-react";
import { cn } from "cn";
import {
  generateCreatureConfigJson,
  generateEvolveScriptMjs,
  generateEvolveWorkflowYaml,
  getMidnightCronForTimezone,
} from "@/domain/automation/workflowService";
import type { CreatureConfig } from "@/domain/creature/entities";
import { getSpriteAssetPath, getSpriteKey } from "@/domain/creature/services";
import type { ReadmeConfig } from "@/domain/profile/entities";
import { copyToClipboard } from "@/infrastructure/browser/downloadAdapter";
import { StudioButton } from "../studio/ui/StudioButton";
import { StudioDialog } from "../studio/ui/StudioDialog";
import { StudioSegmentedControl } from "../studio/ui/StudioSegmentedControl";

interface AutoEvolveDialogProps {
  open: boolean;
  onClose: () => void;
  config: CreatureConfig;
  readmeConfig: ReadmeConfig;
}

export function AutoEvolveDialog({
  open,
  onClose,
  config,
  readmeConfig,
}: AutoEvolveDialogProps) {
  const [activeTab, setActiveTab] = useState<"workflow" | "script" | "config">(
    "workflow"
  );
  const [timezoneMode, setTimezoneMode] = useState<"local" | "utc">("local");
  const [copiedTarget, setCopiedTarget] = useState<string | null>(null);

  const localCron = useMemo(() => {
    const offsetMinutesEast = -new Date().getTimezoneOffset();
    return getMidnightCronForTimezone(offsetMinutesEast);
  }, []);

  const localTimezoneName = useMemo(() => {
    try {
      return Intl.DateTimeFormat().resolvedOptions().timeZone || "Local time";
    } catch {
      return "Local time";
    }
  }, []);

  const cronExpression = timezoneMode === "local" ? localCron : "0 0 * * *";
  const workflowYaml = generateEvolveWorkflowYaml(config, cronExpression);
  const scriptMjs = generateEvolveScriptMjs(config, readmeConfig);
  const configJson = generateCreatureConfigJson(config, readmeConfig);
  const spriteAssetUrl = getSpriteAssetPath(
    getSpriteKey(config.creature, config.view)
  );

  const currentCode =
    activeTab === "workflow"
      ? workflowYaml
      : activeTab === "script"
        ? scriptMjs
        : configJson;

  const handleCopy = async (target: "workflow" | "script" | "config") => {
    const content =
      target === "workflow"
        ? workflowYaml
        : target === "script"
          ? scriptMjs
          : configJson;
    await copyToClipboard(content);
    setCopiedTarget(target);
    window.setTimeout(() => {
      setCopiedTarget((curr) => (curr === target ? null : curr));
    }, 1800);
  };

  return (
    <StudioDialog
      open={open}
      onOpenChange={(isOpen) => {
        if (!isOpen) onClose();
      }}
      title="12 AM daily GitHub Action"
      description="Regenerates animated creature.webp and updates README.md markers every midnight. Works without custom secrets. An optional PROFILE_PAT secret counts private commits."
      maxWidthClass="sm:max-w-4xl"
      footer={
        <div className="flex w-full flex-wrap items-center justify-between gap-3">
          <span className="studio-mono text-[12px] text-[var(--text-2)] tabular-nums">
            Stages 1 (0+) 2 (150+) 3 (500+) 4 (1,200+) 5 (2,500+)
          </span>
          <StudioButton variant="primary" onClick={onClose}>
            Done
          </StudioButton>
        </div>
      }
    >
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-3 rounded-[12px] bg-[var(--surface-2)] p-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <span className="text-[13px] font-medium text-[var(--text-2)]">
              Schedule ({localTimezoneName})
            </span>
            <div className="w-full sm:w-auto sm:min-w-[340px]">
              <StudioSegmentedControl<"local" | "utc">
                ariaLabel="Workflow schedule timezone"
                size="sm"
                value={timezoneMode}
                onChange={setTimezoneMode}
                options={[
                  {
                    value: "local",
                    label: `12 AM local (${localCron} UTC)`,
                  },
                  {
                    value: "utc",
                    label: "12 AM UTC (0 0 * * *)",
                  },
                ]}
              />
            </div>
          </div>

          <ol className="grid gap-2 text-[12px] text-[var(--text-2)] sm:grid-cols-4">
            <li className="rounded-[8px] bg-[var(--surface)] p-2.5">
              <strong className="text-[var(--text)]">1.</strong> Push{" "}
              <code className="studio-mono text-[var(--text)]">creature.webp</code>{" "}
              and{" "}
              <code className="studio-mono text-[var(--text)]">README.md</code>.
            </li>
            <li className="rounded-[8px] bg-[var(--surface)] p-2.5">
              <strong className="text-[var(--text)]">2.</strong> Add{" "}
              <code className="studio-mono text-[var(--text)]">
                assets/creature-sprite.png
              </code>
              .
            </li>
            <li className="rounded-[8px] bg-[var(--surface)] p-2.5">
              <strong className="text-[var(--text)]">3.</strong> Add{" "}
              <code className="studio-mono text-[var(--text)]">
                creature-config.json
              </code>
              .
            </li>
            <li className="rounded-[8px] bg-[var(--surface)] p-2.5">
              <strong className="text-[var(--text)]">4.</strong> Add workflow and{" "}
              <code className="studio-mono text-[var(--text)]">
                scripts/evolve-creature.mjs
              </code>
              .
            </li>
          </ol>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex flex-wrap gap-1 rounded-[8px] bg-[var(--surface-2)] p-1">
            {(
              [
                {
                  id: "workflow",
                  label: "evolve-creature.yml",
                  icon: FolderGit2,
                },
                { id: "script", label: "evolve-creature.mjs", icon: FileText },
                { id: "config", label: "creature-config.json", icon: FileCode2 },
              ] as const
            ).map((item) => {
              const Icon = item.icon;
              const selected = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setActiveTab(item.id)}
                  className={cn(
                    "studio-mono inline-flex h-8 cursor-pointer items-center gap-1.5 rounded-[6px] px-2.5 text-[12px] font-medium transition-colors duration-150",
                    selected
                      ? "bg-[var(--surface-3)] text-[var(--text)]"
                      : "text-[var(--text-2)] hover:text-[var(--text)]"
                  )}
                >
                  <Icon className="size-3.5" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>

          <div className="flex items-center gap-2">
            <a
              href={spriteAssetUrl}
              download="creature-sprite.png"
              className="inline-flex h-8 items-center gap-1.5 rounded-[8px] bg-[var(--surface-2)] px-3 text-[13px] font-medium text-[var(--text)] transition-colors duration-150 hover:bg-[var(--surface-3)]"
            >
              <Download className="size-3.5" />
              <span>creature-sprite.png</span>
            </a>
            <StudioButton
              variant="secondary"
              size="sm"
              onClick={() => void handleCopy(activeTab)}
            >
              {copiedTarget === activeTab ? <Check /> : <Copy />}
              <span>
                {copiedTarget === activeTab ? "Copied" : "Copy file"}
              </span>
            </StudioButton>
          </div>
        </div>

        <div className="max-h-[42vh] overflow-auto rounded-[12px] bg-[#0d1117] p-4">
          <pre className="studio-mono text-[12px] leading-relaxed text-slate-200">
            <code>{currentCode}</code>
          </pre>
        </div>
      </div>
    </StudioDialog>
  );
}
