"use client";

import { useMemo, useState } from "react";
import {
  Check,
  Clock,
  Copy,
  Download,
  FileCode2,
  FileText,
  FolderGit2,
} from "lucide-react";
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
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";

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
      return Intl.DateTimeFormat().resolvedOptions().timeZone || "Local Time";
    } catch {
      return "Local Time";
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
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="flex max-h-[88vh] flex-col sm:max-w-4xl">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <Clock className="size-4 text-primary" />
            <DialogTitle className="font-mono">
              12:00 AM Daily Auto-Evolve GitHub Action
            </DialogTitle>
          </div>
          <DialogDescription>
            Regenerates animated <code>creature.webp</code> and updates{" "}
            <code>README.md</code> markers every midnight. Works out of the box with
            zero custom secrets (optional <code>PROFILE_PAT</code> secret counts private
            commits).
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-3 rounded-lg border bg-muted/40 p-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="font-mono text-xs text-muted-foreground">
              Schedule ({localTimezoneName})
            </span>
            <ToggleGroup
              value={[timezoneMode]}
              onValueChange={(vals) => {
                const v = vals[0] as "local" | "utc" | undefined;
                if (v) setTimezoneMode(v);
              }}
              variant="outline"
              size="sm"
            >
              <ToggleGroupItem value="local" className="font-mono text-xs">
                12:00 AM Local ({localCron} UTC)
              </ToggleGroupItem>
              <ToggleGroupItem value="utc" className="font-mono text-xs">
                12:00 AM UTC (0 0 * * *)
              </ToggleGroupItem>
            </ToggleGroup>
          </div>

          <ol className="grid gap-2 text-xs text-muted-foreground sm:grid-cols-4">
            <li className="rounded-md border bg-card p-2.5">
              <strong className="text-foreground">1.</strong> Push{" "}
              <code>creature.webp</code> &amp; <code>README.md</code>.
            </li>
            <li className="rounded-md border bg-card p-2.5">
              <strong className="text-foreground">2.</strong> Add{" "}
              <code>assets/creature-sprite.png</code>.
            </li>
            <li className="rounded-md border bg-card p-2.5">
              <strong className="text-foreground">3.</strong> Add{" "}
              <code>creature-config.json</code>.
            </li>
            <li className="rounded-md border bg-card p-2.5">
              <strong className="text-foreground">4.</strong> Add workflow &amp;{" "}
              <code>scripts/evolve-creature.mjs</code>.
            </li>
          </ol>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-2">
          <Tabs
            value={activeTab}
            onValueChange={(val) =>
              setActiveTab(val as "workflow" | "script" | "config")
            }
          >
            <TabsList>
              <TabsTrigger value="workflow" className="gap-1.5 font-mono text-xs">
                <FolderGit2 className="size-3.5" />
                evolve-creature.yml
              </TabsTrigger>
              <TabsTrigger value="script" className="gap-1.5 font-mono text-xs">
                <FileText className="size-3.5" />
                evolve-creature.mjs
              </TabsTrigger>
              <TabsTrigger value="config" className="gap-1.5 font-mono text-xs">
                <FileCode2 className="size-3.5" />
                creature-config.json
              </TabsTrigger>
            </TabsList>
          </Tabs>

          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              render={<a href={spriteAssetUrl} download="creature-sprite.png" />}
            >
              <Download data-icon="inline-start" />
              creature-sprite.png
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => void handleCopy(activeTab)}
            >
              {copiedTarget === activeTab ? (
                <Check data-icon="inline-start" />
              ) : (
                <Copy data-icon="inline-start" />
              )}
              {copiedTarget === activeTab ? "Copied" : "Copy File"}
            </Button>
          </div>
        </div>

        <div className="min-h-0 flex-1 overflow-auto rounded-lg border bg-[#0d1117] p-4">
          <pre className="font-mono text-xs leading-relaxed text-slate-200">
            <code>{currentCode}</code>
          </pre>
        </div>

        <DialogFooter className="items-center sm:justify-between">
          <span className="font-mono text-[11px] text-muted-foreground">
            Stages: S1 (0+) · S2 (150+) · S3 (500+) · S4 (1,200+) · S5 (2,500+)
          </span>
          <Button type="button" onClick={onClose}>
            Done
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
