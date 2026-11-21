"use client";

import { useMemo, useState } from "react";
import {
  AlertCircle,
  ArrowLeft,
  CheckCircle2,
  Download,
  ExternalLink,
  KeyRound,
  Lock,
  RefreshCw,
  ShieldCheck,
  Trash2,
  Zap,
} from "lucide-react";
import {
  generateEvolveScriptMjs,
  generateEvolveWorkflowYaml,
  getMidnightCronForTimezone,
} from "@/domain/automation/workflowService";
import type { CreatureConfig } from "@/domain/creature/entities";
import { generateCreatureSvgDocument } from "@/domain/creature/svgRenderer";
import {
  downloadBlobFile,
  downloadTextFile,
} from "@/infrastructure/browser/downloadAdapter";
import { encodeAnimatedWebPFromSvgFrames } from "@/infrastructure/browser/webpEncoder";
import { publishFilesToProfileRepo } from "@/infrastructure/github/githubClient";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";

interface TokenPublishScreenProps {
  creatureConfig: CreatureConfig;
  creatureSvg: string;
  shareCardSvg: string;
  readmeMarkdown: string;
  includeShareCard: boolean;
  defaultBranch: string;
  onBack: () => void;
}

export function TokenPublishScreen({
  creatureConfig,
  creatureSvg,
  shareCardSvg,
  readmeMarkdown,
  includeShareCard,
  defaultBranch,
  onBack,
}: TokenPublishScreenProps) {
  const [tokenInput, setTokenInput] = useState("");
  const [includeWorkflowFiles, setIncludeWorkflowFiles] = useState(false);
  const [pushLoading, setPushLoading] = useState(false);
  const [webpBusy, setWebpBusy] = useState(false);
  const [pushError, setPushError] = useState<string | null>(null);
  const [publishResult, setPublishResult] = useState<{
    username: string;
    repoUrl: string;
    updatedPaths: string[];
  } | null>(null);

  const username = creatureConfig.username.trim() || "your-username";

  const localCron = useMemo(() => {
    const offsetMinutesEast = -new Date().getTimezoneOffset();
    return getMidnightCronForTimezone(offsetMinutesEast);
  }, []);

  const handleDownloadWebP = async () => {
    setWebpBusy(true);
    try {
      const durationMs = Math.round(
        3400 / Math.max(0.25, creatureConfig.animationSpeed || 1)
      );
      const blob = await encodeAnimatedWebPFromSvgFrames({
        width: 920,
        height: 460,
        frameCount: 20,
        durationMs,
        buildFrameSvg: (phase) =>
          generateCreatureSvgDocument(creatureConfig, phase),
      });
      downloadBlobFile("creature.webp", blob);
    } catch (err) {
      setPushError(
        err instanceof Error ? err.message : "Failed encoding animated WebP."
      );
    } finally {
      setWebpBusy(false);
    }
  };

  const handlePush = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!tokenInput.trim()) {
      setPushError("Enter your GitHub Personal Access Token before pushing.");
      return;
    }

    setPushLoading(true);
    setPushError(null);
    setPublishResult(null);

    try {
      const files = [
        {
          path: "creature.svg",
          content: creatureSvg,
          message: "feat: update animated pixel creature SVG",
        },
        {
          path: "README.md",
          content: readmeMarkdown,
          message: "feat: update dynamic GitHub profile README",
        },
      ];

      if (includeShareCard) {
        files.push({
          path: "share-card.svg",
          content: shareCardSvg,
          message: "feat: update creature social share banner",
        });
      }

      if (includeWorkflowFiles) {
        files.push(
          {
            path: ".github/workflows/evolve-creature.yml",
            content: generateEvolveWorkflowYaml(creatureConfig, localCron),
            message: "ci: add 12:00 AM daily creature auto-evolve workflow",
          },
          {
            path: "scripts/evolve-creature.mjs",
            content: generateEvolveScriptMjs(creatureConfig),
            message: "ci: add daily creature evolution script",
          }
        );
      }

      const result = await publishFilesToProfileRepo({
        token: tokenInput,
        owner: username,
        repo: username,
        branch: defaultBranch || "main",
        files,
      });

      setTokenInput("");
      setPublishResult({
        username,
        repoUrl: result.repoUrl,
        updatedPaths: result.updatedPaths,
      });
    } catch (err) {
      setPushError(
        err instanceof Error
          ? err.message
          : "Failed to push changes to GitHub."
      );
    } finally {
      setPushLoading(false);
    }
  };

  return (
    <div className="flex min-h-[calc(100vh-170px)] items-center justify-center px-4 py-10">
      <div className="w-full max-w-xl">
        <Card>
          <CardHeader className="items-center text-center">
            <Badge variant="secondary" className="font-mono text-[10px]">
              STEP 4 · SECURE PUSH
            </Badge>
            <CardTitle className="font-mono text-xl">
              Enter Personal Access Token
            </CardTitle>
            <CardDescription>
              Publishing to{" "}
              <code className="font-mono font-semibold text-foreground">
                {username}/{username}
              </code>
            </CardDescription>
          </CardHeader>

          <CardContent className="flex flex-col gap-5">
            <Alert>
              <ShieldCheck />
              <AlertTitle className="font-mono text-xs font-semibold">
                In-Memory Token Security Guarantee
              </AlertTitle>
              <AlertDescription className="flex flex-col gap-2 text-xs">
                <p>
                  This static app never stores tokens in cookies, localStorage, or any
                  server. Your PAT exists strictly in memory during the GitHub API push
                  and clears automatically afterward. Copy and context-menu actions are
                  disabled on the input field.
                </p>
                <div className="flex flex-wrap gap-3">
                  <a
                    href="https://github.com/settings/personal-access-tokens/new"
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 font-medium text-primary underline"
                  >
                    Create Fine-Grained PAT (Contents: Read &amp; write)
                    <ExternalLink className="size-3" />
                  </a>
                  <a
                    href="https://docs.github.com/en/site-policy/privacy-policies/github-general-privacy-statement"
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 font-medium text-muted-foreground underline"
                  >
                    GitHub Privacy Statement
                    <ExternalLink className="size-3" />
                  </a>
                </div>
              </AlertDescription>
            </Alert>

            <form onSubmit={handlePush} className="flex flex-col gap-5">
              <FieldGroup>
                <Field data-invalid={pushError ? true : undefined}>
                  <div className="flex items-center justify-between">
                    <FieldLabel
                      htmlFor="pat-single-input"
                      className="flex items-center gap-1.5 font-mono text-xs"
                    >
                      <KeyRound className="size-3.5" />
                      GitHub Personal Access Token
                    </FieldLabel>
                    <span className="inline-flex items-center gap-1 font-mono text-[11px] text-muted-foreground">
                      <Lock className="size-3" />
                      Copy blocked
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <Input
                      id="pat-single-input"
                      type="password"
                      autoComplete="off"
                      spellCheck={false}
                      value={tokenInput}
                      onChange={(e) => {
                        setTokenInput(e.target.value);
                        if (pushError) setPushError(null);
                      }}
                      onCopy={(e) => e.preventDefault()}
                      onCut={(e) => e.preventDefault()}
                      onDragStart={(e) => e.preventDefault()}
                      onContextMenu={(e) => e.preventDefault()}
                      placeholder="github_pat_... or ghp_..."
                      className="select-none font-mono"
                    />
                    {tokenInput && (
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        onClick={() => setTokenInput("")}
                        title="Clear token from memory"
                      >
                        <Trash2 />
                      </Button>
                    )}
                  </div>
                </Field>

                <Field orientation="horizontal" className="rounded-lg border bg-muted/40 p-3.5">
                  <Checkbox
                    id="auto-evolve-check"
                    checked={includeWorkflowFiles}
                    onCheckedChange={(val) => setIncludeWorkflowFiles(Boolean(val))}
                  />
                  <div className="flex flex-col gap-1">
                    <FieldLabel
                      htmlFor="auto-evolve-check"
                      className="font-mono text-xs font-semibold"
                    >
                      Include 12:00 AM Daily Auto-Evolve GitHub Action
                    </FieldLabel>
                    <FieldDescription className="text-xs">
                      Requires <code>workflow</code> scope on your PAT. Leave unchecked
                      to push only <code>creature.svg</code> and <code>README.md</code>.
                    </FieldDescription>
                  </div>
                </Field>
              </FieldGroup>

              {pushError && (
                <Alert variant="destructive">
                  <AlertCircle />
                  <AlertTitle className="font-mono text-xs">Push Failed</AlertTitle>
                  <AlertDescription className="text-xs">{pushError}</AlertDescription>
                </Alert>
              )}

              {publishResult && (
                <Alert>
                  <CheckCircle2 />
                  <AlertTitle className="font-mono text-xs font-semibold">
                    Published {publishResult.updatedPaths.join(", ")}
                  </AlertTitle>
                  <AlertDescription className="mt-2 flex flex-wrap gap-2">
                    <Button
                      size="sm"
                      render={
                        <a
                          href={`https://github.com/${encodeURIComponent(publishResult.username)}`}
                          target="_blank"
                          rel="noreferrer"
                        />
                      }
                    >
                      View GitHub Profile
                      <ExternalLink data-icon="inline-end" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      render={
                        <a
                          href={publishResult.repoUrl}
                          target="_blank"
                          rel="noreferrer"
                        />
                      }
                    >
                      Open Repo
                      <ExternalLink data-icon="inline-end" />
                    </Button>
                  </AlertDescription>
                </Alert>
              )}

              <div className="flex flex-wrap items-center justify-between gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={onBack}
                  disabled={pushLoading}
                >
                  <ArrowLeft data-icon="inline-start" />
                  Back
                </Button>

                <Button
                  type="submit"
                  disabled={pushLoading || !tokenInput.trim()}
                >
                  {pushLoading ? (
                    <>
                      <RefreshCw data-icon="inline-start" className="animate-spin" />
                      Pushing...
                    </>
                  ) : (
                    <>
                      <Zap data-icon="inline-start" />
                      Push Changes to README
                    </>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>

          <Separator />

          <CardFooter className="flex flex-wrap items-center justify-between gap-2 pt-3 text-xs text-muted-foreground">
            <span>Manual downloads:</span>
            <div className="flex flex-wrap gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() =>
                  downloadTextFile("creature.svg", creatureSvg, "image/svg+xml")
                }
              >
                <Download data-icon="inline-start" />
                creature.svg
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={webpBusy}
                onClick={handleDownloadWebP}
              >
                <Download data-icon="inline-start" />
                {webpBusy ? "Encoding..." : "creature.webp"}
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() =>
                  downloadTextFile("README.md", readmeMarkdown, "text/markdown")
                }
              >
                <Download data-icon="inline-start" />
                README.md
              </Button>
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
