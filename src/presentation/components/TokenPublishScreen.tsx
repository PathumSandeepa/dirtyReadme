"use client";

import { useEffect, useMemo, useState } from "react";
import {
  AlertCircle,
  ArrowLeft,
  BookOpen,
  CheckCircle2,
  Download,
  ExternalLink,
  FolderGit2,
  KeyRound,
  Lock,
  RefreshCw,
  ShieldCheck,
  Trash2,
  Zap,
} from "lucide-react";
import { cn } from "cn";
import {
  generateCreatureConfigJson,
  generateEvolveScriptMjs,
  generateEvolveWorkflowYaml,
  getMidnightCronForTimezone,
} from "@/domain/automation/workflowService";
import type { CreatureConfig } from "@/domain/creature/entities";
import { getSpriteKey } from "@/domain/creature/services";
import type { ReadmeConfig } from "@/domain/profile/entities";
import {
  blobToBase64,
  downloadBlobFile,
  downloadTextFile,
} from "@/infrastructure/browser/downloadAdapter";
import {
  fetchSpritePngBase64,
  loadCreatureSprite,
} from "@/infrastructure/browser/spriteLoader";
import {
  encodeAnimatedGifFromCreature,
  encodeAnimatedWebPFromCreature,
  exportShareCardPngBlob,
} from "@/infrastructure/browser/webpEncoder";
import {
  checkProfileRepoExists,
  publishFilesToProfileRepo,
  type PublishFileInput,
} from "@/infrastructure/github/githubClient";
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
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { TokenGuideDialog } from "./TokenGuideDialog";

interface TokenPublishScreenProps {
  creatureConfig: CreatureConfig;
  readmeConfig: ReadmeConfig;
  readmeMarkdown: string;
  includeShareCard: boolean;
  defaultBranch: string;
  initialProfileRepoExists: boolean;
  hasLegacyWorkflow?: boolean;
  onBack: () => void;
}

export function TokenPublishScreen({
  creatureConfig,
  readmeConfig,
  readmeMarkdown,
  includeShareCard,
  defaultBranch,
  initialProfileRepoExists,
  hasLegacyWorkflow = false,
  onBack,
}: TokenPublishScreenProps) {
  const username = creatureConfig.username.trim() || "your-username";
  const [tokenInput, setTokenInput] = useState("");
  const [includeWorkflowFiles, setIncludeWorkflowFiles] = useState(false);
  const [timezoneMode, setTimezoneMode] = useState<"local" | "utc">("local");
  const [pushLoading, setPushLoading] = useState(false);
  const [webpBusy, setWebpBusy] = useState(false);
  const [gifBusy, setGifBusy] = useState(false);
  const [tokenGuideOpen, setTokenGuideOpen] = useState(false);
  const [pushError, setPushError] = useState<string | null>(null);
  const [repoCheckState, setRepoCheckState] = useState<
    "checking" | "exists" | "missing"
  >(
    username === "your-username"
      ? "missing"
      : initialProfileRepoExists
        ? "exists"
        : "checking"
  );
  const [resolvedBranch, setResolvedBranch] = useState(defaultBranch || "main");
  const [publishResult, setPublishResult] = useState<{
    username: string;
    repoUrl: string;
    updatedPaths: string[];
  } | null>(null);

  useEffect(() => {
    if (!username || username === "your-username") return;
    let cancelled = false;
    checkProfileRepoExists(username).then((res) => {
      if (cancelled) return;
      if (res.rateLimited) {
        setRepoCheckState(initialProfileRepoExists ? "exists" : "missing");
        return;
      }
      setRepoCheckState(res.exists ? "exists" : "missing");
      if (res.defaultBranch) {
        setResolvedBranch(res.defaultBranch);
      }
    });
    return () => {
      cancelled = true;
    };
  }, [username, initialProfileRepoExists]);

  const handleRecheckRepo = async () => {
    setRepoCheckState("checking");
    const res = await checkProfileRepoExists(username);
    if (res.rateLimited) {
      setRepoCheckState(initialProfileRepoExists ? "exists" : "missing");
      return;
    }
    setRepoCheckState(res.exists ? "exists" : "missing");
    if (res.defaultBranch) {
      setResolvedBranch(res.defaultBranch);
    }
  };

  const localCron = useMemo(() => {
    const offsetMinutesEast = -new Date().getTimezoneOffset();
    return getMidnightCronForTimezone(offsetMinutesEast);
  }, []);

  const cronExpression = timezoneMode === "local" ? localCron : "0 0 * * *";

  const handleDownloadWebP = async () => {
    setWebpBusy(true);
    try {
      const sprite = await loadCreatureSprite(
        getSpriteKey(creatureConfig.creature, creatureConfig.view)
      );
      const blob = await encodeAnimatedWebPFromCreature(creatureConfig, sprite);
      downloadBlobFile("creature.webp", blob);
    } catch (err) {
      setPushError(
        err instanceof Error ? err.message : "Failed encoding animated WebP."
      );
    } finally {
      setWebpBusy(false);
    }
  };

  const handleDownloadGif = async () => {
    setGifBusy(true);
    try {
      const sprite = await loadCreatureSprite(
        getSpriteKey(creatureConfig.creature, creatureConfig.view)
      );
      const blob = await encodeAnimatedGifFromCreature(creatureConfig, sprite);
      downloadBlobFile("creature.gif", blob);
    } catch (err) {
      setPushError(
        err instanceof Error ? err.message : "Failed encoding animated GIF."
      );
    } finally {
      setGifBusy(false);
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
      const spriteKey = getSpriteKey(
        creatureConfig.creature,
        creatureConfig.view
      );
      const sprite = await loadCreatureSprite(spriteKey);
      const webpBlob = await encodeAnimatedWebPFromCreature(
        creatureConfig,
        sprite
      );
      const webpBase64 = await blobToBase64(webpBlob);

      const files: PublishFileInput[] = [
        {
          path: "creature.webp",
          base64Content: webpBase64,
          message: "feat: update animated pixel creature WebP",
        },
        {
          path: "README.md",
          content: readmeMarkdown,
          message: "feat: update dynamic GitHub profile README",
        },
        {
          path: "creature-config.json",
          content: generateCreatureConfigJson(creatureConfig, readmeConfig),
          message: "ci: save creature & README studio configuration",
        },
      ];

      if (includeShareCard) {
        const shareBlob = await exportShareCardPngBlob(creatureConfig, sprite);
        files.push({
          path: "share-card.png",
          base64Content: await blobToBase64(shareBlob),
          message: "feat: update creature social share banner",
        });
      }

      if (includeWorkflowFiles) {
        const spritePngBase64 = await fetchSpritePngBase64(spriteKey);
        files.push(
          {
            path: "assets/creature-sprite.png",
            base64Content: spritePngBase64,
            message: "ci: store base pixel creature sprite for 12AM updates",
          },
          {
            path: ".github/workflows/evolve-creature.yml",
            content: generateEvolveWorkflowYaml(creatureConfig, cronExpression),
            message: "ci: add 12:00 AM daily creature auto-evolve workflow",
          },
          {
            path: "scripts/evolve-creature.mjs",
            content: generateEvolveScriptMjs(creatureConfig, readmeConfig),
            message: "ci: add daily creature WebP & README evolution script",
          }
        );
      }

      const result = await publishFilesToProfileRepo({
        token: tokenInput,
        owner: username,
        repo: username,
        branch: resolvedBranch || "main",
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
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-8 py-4 sm:py-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="flex flex-col gap-2">
          <Badge variant="secondary" className="w-fit font-mono text-[10px]">
            STEP 4 OF 4 · PUBLISH
          </Badge>
          <h1 className="font-mono text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            Publish to {username}/{username}
          </h1>
          <p className="text-sm text-muted-foreground">
            Commit your animated WebP creature and README directly from browser
            memory using a temporary GitHub token.
          </p>
        </div>

        <Button
          type="button"
          variant="secondary"
          size="sm"
          onClick={() => setTokenGuideOpen(true)}
        >
          <BookOpen data-icon="inline-start" />
          How to Create Classic Token &amp; Permissions
        </Button>
      </div>

      {repoCheckState !== "exists" ? (
        <div className="flex flex-col gap-6 rounded-xl bg-muted/35 p-6">
          <div className="flex items-start gap-3">
            {repoCheckState === "checking" ? (
              <RefreshCw className="mt-0.5 size-5 shrink-0 animate-spin text-primary" />
            ) : (
              <FolderGit2 className="mt-0.5 size-5 shrink-0 text-destructive" />
            )}
            <div className="flex flex-col gap-1.5">
              <h2 className="font-mono text-sm font-semibold text-foreground">
                {repoCheckState === "checking"
                  ? `Checking ${username}/${username} on GitHub...`
                  : `Profile Repository ${username}/${username} Not Found`}
              </h2>
              <p className="text-sm text-muted-foreground">
                {repoCheckState === "checking"
                  ? "Verifying that your public GitHub profile repository exists before requesting a Personal Access Token."
                  : `Create a public repository named ${username}/${username} on GitHub first. Token entry stays hidden until it is detected.`}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3">
            <Button type="button" variant="ghost" onClick={onBack}>
              <ArrowLeft data-icon="inline-start" />
              Back to Studio
            </Button>

            {repoCheckState === "missing" && (
              <div className="flex flex-wrap items-center gap-2">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={handleRecheckRepo}
                >
                  <RefreshCw data-icon="inline-start" />
                  Re-check Repository
                </Button>
                <Button
                  nativeButton={false}
                  render={
                    <a
                      href="https://github.com/new"
                      target="_blank"
                      rel="noreferrer"
                    />
                  }
                >
                  Create {username}/{username}
                  <ExternalLink data-icon="inline-end" />
                </Button>
              </div>
            )}
          </div>

          <Separator />

          <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-muted-foreground">
            <span>Or export files locally instead:</span>
            <div className="flex flex-wrap items-center gap-1">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                disabled={webpBusy}
                onClick={handleDownloadWebP}
              >
                <Download data-icon="inline-start" />
                {webpBusy ? "Encoding..." : "creature.webp"}
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                disabled={gifBusy}
                onClick={handleDownloadGif}
              >
                <Download data-icon="inline-start" />
                {gifBusy ? "Encoding..." : "creature.gif"}
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() =>
                  downloadTextFile("README.md", readmeMarkdown, "text/markdown")
                }
              >
                <Download data-icon="inline-start" />
                README.md
              </Button>
            </div>
          </div>
        </div>
      ) : (
        <div className="grid items-start gap-8 lg:grid-cols-12">
          <div className="lg:col-span-7">
            <Card>
              <CardHeader className="border-b">
                <CardTitle className="font-mono text-base">
                  Enter Personal Access Token
                </CardTitle>
                <CardDescription>
                  Target branch: <code>{resolvedBranch}</code> · Copy, cut, and
                  context-menu actions are blocked on the token field.
                </CardDescription>
              </CardHeader>

              <CardContent className="pt-4">
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
                          Ephemeral RAM only
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <Input
                          id="pat-single-input"
                          type="password"
                          autoComplete="off"
                          spellCheck={false}
                          value={tokenInput}
                          aria-invalid={Boolean(pushError)}
                          onChange={(e) => {
                            setTokenInput(e.target.value);
                            if (pushError) setPushError(null);
                          }}
                          onCopy={(e) => e.preventDefault()}
                          onCut={(e) => e.preventDefault()}
                          onDragStart={(e) => e.preventDefault()}
                          onContextMenu={(e) => e.preventDefault()}
                          placeholder="github_pat_... or ghp_..."
                          className="h-10 flex-1 select-none font-mono"
                        />
                        {tokenInput && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => setTokenInput("")}
                            title="Clear token from memory"
                          >
                            <Trash2 />
                          </Button>
                        )}
                      </div>
                    </Field>
                  </FieldGroup>

                  <Separator />

                  <div className="flex flex-col gap-3">
                    <Field orientation="horizontal">
                      <Switch
                        id="auto-evolve-check"
                        checked={includeWorkflowFiles}
                        onCheckedChange={(val) =>
                          setIncludeWorkflowFiles(Boolean(val))
                        }
                      />
                      <div className="flex flex-col gap-0.5">
                        <FieldLabel
                          htmlFor="auto-evolve-check"
                          className="font-mono text-xs font-semibold"
                        >
                          Include 12:00 AM Daily Auto-Evolve GitHub Action
                        </FieldLabel>
                        <FieldDescription className="text-xs">
                          Requires <code>workflow</code> permission. Updates{" "}
                          <code>creature.webp</code> &amp; <code>README.md</code>{" "}
                          every midnight.
                        </FieldDescription>
                      </div>
                    </Field>

                    {includeWorkflowFiles && (
                      <div className="grid grid-cols-2 rounded-lg bg-muted/70 p-1">
                        <button
                          type="button"
                          onClick={() => setTimezoneMode("local")}
                          className={cn(
                            "rounded-md px-2.5 py-1.5 font-mono text-[11px] font-medium transition",
                            timezoneMode === "local"
                              ? "bg-background text-foreground shadow-xs"
                              : "text-muted-foreground hover:text-foreground"
                          )}
                        >
                          12:00 AM Local ({localCron})
                        </button>
                        <button
                          type="button"
                          onClick={() => setTimezoneMode("utc")}
                          className={cn(
                            "rounded-md px-2.5 py-1.5 font-mono text-[11px] font-medium transition",
                            timezoneMode === "utc"
                              ? "bg-background text-foreground shadow-xs"
                              : "text-muted-foreground hover:text-foreground"
                          )}
                        >
                          12:00 AM UTC (0 0 * * *)
                        </button>
                      </div>
                    )}

                    {hasLegacyWorkflow && !includeWorkflowFiles && (
                      <p className="flex items-start gap-2 rounded-lg bg-muted/50 px-3 py-2 text-xs text-muted-foreground">
                        <AlertCircle className="mt-0.5 size-3.5 shrink-0 text-primary" />
                        <span>
                          Earlier <code>evolve-creature.yml</code> detected in{" "}
                          <code>{username}/{username}</code>. Enable the switch
                          above (with <code>workflow</code> scope) to upgrade it
                          to Animated WebP.
                        </span>
                      </p>
                    )}
                  </div>

                  {pushError && (
                    <Alert variant="destructive">
                      <AlertCircle />
                      <AlertTitle className="font-mono text-xs">
                        Push Failed
                      </AlertTitle>
                      <AlertDescription className="text-xs">
                        {pushError}
                      </AlertDescription>
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
                          nativeButton={false}
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
                          variant="secondary"
                          size="sm"
                          nativeButton={false}
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

                  <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
                    <Button
                      type="button"
                      variant="ghost"
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
                          <RefreshCw
                            data-icon="inline-start"
                            className="animate-spin"
                          />
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

              <CardFooter className="flex flex-wrap items-center justify-between gap-2 text-xs text-muted-foreground">
                <span>Manual downloads:</span>
                <div className="flex flex-wrap gap-1">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    disabled={webpBusy}
                    onClick={handleDownloadWebP}
                  >
                    <Download data-icon="inline-start" />
                    {webpBusy ? "Encoding..." : "creature.webp"}
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    disabled={gifBusy}
                    onClick={handleDownloadGif}
                  >
                    <Download data-icon="inline-start" />
                    {gifBusy ? "Encoding..." : "creature.gif"}
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() =>
                      downloadTextFile(
                        "README.md",
                        readmeMarkdown,
                        "text/markdown"
                      )
                    }
                  >
                    <Download data-icon="inline-start" />
                    README.md
                  </Button>
                </div>
              </CardFooter>
            </Card>
          </div>

          <aside className="flex flex-col gap-6 lg:col-span-5 lg:pt-1">
            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between gap-2">
                <h2 className="font-mono text-sm font-semibold text-foreground">
                  Required Token Permissions
                </h2>
                <button
                  type="button"
                  onClick={() => setTokenGuideOpen(true)}
                  className="font-mono text-xs text-primary underline underline-offset-4 hover:opacity-80"
                >
                  Full Step Guide
                </button>
              </div>

              <div className="flex flex-col gap-2.5 text-xs text-muted-foreground">
                <div className="flex flex-wrap items-center gap-1.5">
                  <span className="font-mono text-foreground">
                    Classic (<code>ghp_...</code>):
                  </span>
                  <Badge variant="secondary" className="font-mono text-[10px]">
                    repo
                  </Badge>
                  {includeWorkflowFiles ? (
                    <Badge className="font-mono text-[10px]">+ workflow</Badge>
                  ) : (
                    <span>
                      (+ <code>workflow</code> if 12:00 AM Action enabled)
                    </span>
                  )}
                </div>

                <div className="flex flex-wrap items-center gap-1.5">
                  <span className="font-mono text-foreground">
                    Fine-Grained (<code>github_pat_...</code>):
                  </span>
                  <Badge variant="secondary" className="font-mono text-[10px]">
                    Contents: Read &amp; write
                  </Badge>
                  {includeWorkflowFiles && (
                    <Badge className="font-mono text-[10px]">
                      + Workflows: R/W
                    </Badge>
                  )}
                </div>
              </div>

              <div className="flex flex-wrap gap-3 pt-1 text-xs">
                <a
                  href="https://github.com/settings/tokens/new?description=dynamic-readme-creature&scopes=repo,workflow"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 font-medium text-primary underline underline-offset-4"
                >
                  Create Classic Token
                  <ExternalLink className="size-3" />
                </a>
                <a
                  href="https://github.com/settings/personal-access-tokens/new"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 font-medium text-primary underline underline-offset-4"
                >
                  Create Fine-Grained PAT
                  <ExternalLink className="size-3" />
                </a>
              </div>
            </div>

            <Separator />

            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2 font-mono text-sm font-semibold text-foreground">
                <ShieldCheck className="size-4 text-primary" />
                In-Memory Security Guarantee
              </div>
              <p className="text-xs leading-relaxed text-muted-foreground">
                This static app never stores tokens in cookies, localStorage, or
                any server. Your token stays strictly inside React memory during
                the push and is cleared automatically afterward.
              </p>
              <a
                href="https://docs.github.com/en/site-policy/privacy-policies/github-general-privacy-statement"
                target="_blank"
                rel="noreferrer"
                className="inline-flex w-fit items-center gap-1 text-xs text-muted-foreground underline underline-offset-4 hover:text-foreground"
              >
                GitHub Privacy Statement
                <ExternalLink className="size-3" />
              </a>
            </div>
          </aside>
        </div>
      )}

      <TokenGuideDialog
        open={tokenGuideOpen}
        onClose={() => setTokenGuideOpen(false)}
        username={username}
        includeWorkflowFiles={includeWorkflowFiles}
      />
    </div>
  );
}
