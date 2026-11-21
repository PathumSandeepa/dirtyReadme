"use client";

import { useMemo, useState } from "react";
import { Check, Clock, Copy, FileText, FolderGit2 } from "lucide-react";
import {
  generateEvolveScriptMjs,
  generateEvolveWorkflowYaml,
  getMidnightCronForTimezone,
} from "@/domain/automation/workflowService";
import type { CreatureConfig } from "@/domain/creature/entities";
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
  const scriptMjs = generateEvolveScriptMjs(config);
  const currentCode = activeTab === "workflow" ? workflowYaml : scriptMjs;

  const handleCopy = async (target: "workflow" | "script") => {
    await copyToClipboard(target === "workflow" ? workflowYaml : scriptMjs);
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
            Automatically updates creature.svg and README.md telemetry markers every
            midnight.
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

          <ol className="grid gap-2 text-xs text-muted-foreground sm:grid-cols-3">
            <li className="rounded-md border bg-card p-2.5">
              <strong className="text-foreground">1.</strong> Push{" "}
              <code>creature.svg</code> and <code>README.md</code>.
            </li>
            <li className="rounded-md border bg-card p-2.5">
              <strong className="text-foreground">2.</strong> Add{" "}
              <code>.github/workflows/evolve-creature.yml</code>.
            </li>
            <li className="rounded-md border bg-card p-2.5">
              <strong className="text-foreground">3.</strong> Add{" "}
              <code>scripts/evolve-creature.mjs</code>.
            </li>
          </ol>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-2">
          <Tabs
            value={activeTab}
            onValueChange={(val) => setActiveTab(val as "workflow" | "script")}
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
            </TabsList>
          </Tabs>

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

        <div className="min-h-0 flex-1 overflow-auto rounded-lg border bg-[#0d1117] p-4">
          <pre className="font-mono text-xs leading-relaxed text-slate-200">
            <code>{currentCode}</code>
          </pre>
        </div>

        <DialogFooter className="items-center sm:justify-between">
          <span className="font-mono text-[11px] text-muted-foreground">
            Stages: 1 (0–149) · 2 (150–499) · 3 (500–1,199) · 4 (1,200–2,499) · 5 (2,500+)
          </span>
          <Button type="button" onClick={onClose}>
            Done
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
