"use client";

import { useEffect, useMemo, useState } from "react";
import {
  AlertCircle,
  AlertTriangle,
  ArrowLeft,
  BookOpen,
  Check,
  CheckCircle2,
  Download,
  ExternalLink,
  Eye,
  EyeOff,
  FileCode2,
  FileText,
  Image as ImageIcon,
  Loader2,
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
  type PublishProgressStep,
} from "@/infrastructure/github/githubClient";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { StudioButton } from "../studio/ui/StudioButton";
import { StudioField, StudioInput } from "../studio/ui/StudioInput";
import { StudioSectionCard } from "../studio/ui/StudioSectionCard";
import { StudioSegmentedControl } from "../studio/ui/StudioSegmentedControl";
import { StudioSwitchRow } from "../studio/ui/StudioSwitchRow";
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

function formatByteSize(text: string): string {
  const bytes = new TextEncoder().encode(text).length;
  if (bytes < 1024) return `${bytes} B`;
  return `${(bytes / 1024).toFixed(1)} KB`;
}

function isValidTokenFormat(raw: string): boolean {
  const trimmed = raw.trim();
  if (!trimmed) return false;
  return /^(ghp_[A-Za-z0-9]{20,}|github_pat_[A-Za-z0-9_]{20,})$/.test(trimmed);
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
  const repoPath = `${username}/${username}`;
  const repoUrl = `https://github.com/${encodeURIComponent(username)}/${encodeURIComponent(username)}`;

  const [tokenInput, setTokenInput] = useState("");
  const [showToken, setShowToken] = useState(false);
  const [tokenTab, setTokenTab] = useState<"classic" | "fine-grained">(
    "classic"
  );
  const [includeWorkflowFiles, setIncludeWorkflowFiles] = useState(false);
  const [timezoneMode, setTimezoneMode] = useState<"local" | "utc">("local");
  const [pushLoading, setPushLoading] = useState(false);
  const [completedSteps, setCompletedSteps] = useState<PublishProgressStep[]>(
    []
  );
  const [activePushStep, setActivePushStep] =
    useState<PublishProgressStep | null>(null);
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

  const configJson = useMemo(
    () => generateCreatureConfigJson(creatureConfig, readmeConfig),
    [creatureConfig, readmeConfig]
  );

  const workflowYaml = useMemo(
    () =>
      includeWorkflowFiles
        ? generateEvolveWorkflowYaml(creatureConfig, cronExpression)
        : "",
    [includeWorkflowFiles, creatureConfig, cronExpression]
  );

  const evolveScript = useMemo(
    () =>
      includeWorkflowFiles
        ? generateEvolveScriptMjs(creatureConfig, readmeConfig)
        : "",
    [includeWorkflowFiles, creatureConfig, readmeConfig]
  );

  const trimmedToken = tokenInput.trim();
  const tokenValid = isValidTokenFormat(trimmedToken);
  const tokenFormatError =
    trimmedToken.length > 0 && !tokenValid
      ? "Enter a valid GitHub token starting with github_pat_ or ghp_."
      : null;

  const commitFiles = useMemo(() => {
    const items: {
      path: string;
      size: string;
      kind: "image" | "doc" | "code";
    }[] = [
      { path: "creature.webp", size: "Animated WebP", kind: "image" },
      {
        path: "README.md",
        size: formatByteSize(readmeMarkdown),
        kind: "doc",
      },
      {
        path: "creature-config.json",
        size: formatByteSize(configJson),
        kind: "code",
      },
    ];

    if (includeShareCard) {
      items.push({ path: "share-card.png", size: "1280×640 PNG", kind: "image" });
    }

    if (includeWorkflowFiles) {
      items.push(
        {
          path: ".github/workflows/evolve-creature.yml",
          size: formatByteSize(workflowYaml),
          kind: "code",
        },
        {
          path: "scripts/evolve-creature.mjs",
          size: formatByteSize(evolveScript),
          kind: "code",
        },
        {
          path: "assets/creature-sprite.png",
          size: "Sprite PNG",
          kind: "image",
        }
      );
    }

    return items;
  }, [
    readmeMarkdown,
    configJson,
    includeShareCard,
    includeWorkflowFiles,
    workflowYaml,
    evolveScript,
  ]);

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
    if (!tokenValid) {
      setPushError(
        "Paste a valid GitHub Personal Access Token (github_pat_... or ghp_...) before pushing."
      );
      return;
    }

    setPushLoading(true);
    setPushError(null);
    setPublishResult(null);
    setCompletedSteps([]);
    setActivePushStep("uploading-webp");

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
          content: configJson,
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
            content: workflowYaml,
            message: "ci: add 12:00 AM daily creature auto-evolve workflow",
          },
          {
            path: "scripts/evolve-creature.mjs",
            content: evolveScript,
            message: "ci: add daily creature WebP & README evolution script",
          }
        );
      }

      const stepOrder: PublishProgressStep[] = includeWorkflowFiles
        ? [
            "uploading-webp",
            "updating-readme",
            "adding-workflow",
            "committing",
          ]
        : ["uploading-webp", "updating-readme", "committing"];

      const result = await publishFilesToProfileRepo({
        token: trimmedToken,
        owner: username,
        repo: username,
        branch: resolvedBranch || "main",
        files,
        onStep: (step) => {
          setActivePushStep(step);
          const idx = stepOrder.indexOf(step);
          if (idx > 0) {
            setCompletedSteps(stepOrder.slice(0, idx));
          }
        },
      });

      setCompletedSteps(stepOrder);
      setActivePushStep(null);
      setTokenInput("");
      setShowToken(false);
      setPublishResult({
        username,
        repoUrl: result.repoUrl,
        updatedPaths: result.updatedPaths,
      });
    } catch (err) {
      setPushError(
        err instanceof Error
          ? err.message
          : "Failed to push changes to GitHub. Your token was kept in the field so you can retry."
      );
    } finally {
      setPushLoading(false);
      setActivePushStep(null);
    }
  };

  const pushButton = (
    <StudioButton
      type="submit"
      variant="primary"
      size="lg"
      disabled={pushLoading || !tokenValid}
    >
      {pushLoading ? (
        <>
          <Loader2 className="animate-spin" />
          <span>Pushing changes...</span>
        </>
      ) : (
        <>
          <Zap />
          <span>Push changes to README</span>
        </>
      )}
    </StudioButton>
  );

  const pushStepRows: { id: PublishProgressStep; label: string }[] = [
    { id: "uploading-webp", label: "Uploading creature.webp" },
    { id: "updating-readme", label: "Updating README.md" },
    ...(includeWorkflowFiles
      ? [
          {
            id: "adding-workflow" as const,
            label: "Adding .github/workflows/evolve-creature.yml",
          },
        ]
      : []),
    { id: "committing", label: "Creating commit on branch" },
  ];

  const classicCreateUrl = `https://github.com/settings/tokens/new?description=dynamic-readme-creature&scopes=${includeWorkflowFiles ? "repo,workflow" : "repo"}`;

  return (
    <TooltipProvider delay={150}>
      <div className="mx-auto flex w-full max-w-[1120px] flex-col gap-6 px-4 py-8 sm:px-6 sm:py-10">
        {/* Page Header */}
        <div className="flex flex-col gap-2">
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-[24px] leading-8 font-semibold tracking-tight text-[var(--text)]">
              Publish to your profile repository
            </h1>
            <a
              href={repoUrl}
              target="_blank"
              rel="noreferrer"
              className="studio-mono inline-flex items-center gap-1.5 rounded-[6px] border border-[var(--border)] bg-[var(--surface)] px-2.5 py-1 text-[13px] font-medium text-[var(--text)] transition-[color,border-color] duration-150 hover:border-[var(--accent)] hover:text-[var(--accent)]"
            >
              <span>{repoPath}</span>
              <ExternalLink className="size-3.5 text-[var(--text-muted)]" />
            </a>
          </div>
          <p className="text-[14px] leading-6 text-[var(--text-muted)]">
            Commit your animated WebP creature and README directly from your
            browser using a temporary GitHub token.
          </p>
        </div>

        {/* Repository Status Banner */}
        {repoCheckState === "checking" && (
          <div
            role="status"
            className="flex items-center gap-2.5 rounded-[8px] border border-[var(--border)] bg-[var(--surface)] px-4 py-3 text-[13px] text-[var(--text-muted)]"
          >
            <Loader2 className="size-4 shrink-0 animate-spin text-[var(--accent)]" />
            <span>
              Checking{" "}
              <code className="studio-mono text-[var(--text)]">{repoPath}</code>{" "}
              on GitHub...
            </span>
          </div>
        )}

        {repoCheckState === "missing" && (
          <div
            role="status"
            className="flex flex-wrap items-center justify-between gap-3 rounded-[8px] border border-[var(--warning)]/35 bg-[var(--warning-soft)] px-4 py-3 text-[13px] text-[var(--text)]"
          >
            <div className="flex items-start gap-2.5">
              <AlertTriangle className="mt-0.5 size-4 shrink-0 text-[var(--warning)]" />
              <span>
                Public repository{" "}
                <code className="studio-mono font-medium">{repoPath}</code> was
                not detected yet. Create it on GitHub or re-check before
                pushing.
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <StudioButton
                variant="secondary"
                size="sm"
                onClick={handleRecheckRepo}
              >
                <RefreshCw />
                <span>Re-check repository</span>
              </StudioButton>
              <a
                href="https://github.com/new"
                target="_blank"
                rel="noreferrer"
                className="inline-flex h-8 items-center gap-1.5 rounded-[6px] border border-[var(--border)] bg-[var(--surface)] px-3 text-[13px] font-medium text-[var(--text)] transition-[color,border-color] duration-150 hover:border-[var(--border-strong)]"
              >
                <span>Create {repoPath}</span>
                <ExternalLink className="size-3.5 text-[var(--text-muted)]" />
              </a>
            </div>
          </div>
        )}

        {/* Two-column layout: 640px main + 360px sticky right column on >=1024px */}
        <div className="grid items-start gap-8 lg:grid-cols-[minmax(0,640px)_360px] lg:justify-between">
          {/* Left Main Column */}
          <div className="flex flex-col gap-6">
            {/* Summary Card: What will be committed */}
            <StudioSectionCard
              title="What will be committed"
              description="Files included in the atomic commit to your profile repository."
              headerAction={
                <span className="studio-mono inline-flex items-center rounded-[6px] border border-[var(--border)] bg-[var(--surface-2)] px-2.5 py-1 text-[12px] font-medium text-[var(--text)]">
                  Branch: {resolvedBranch || "main"}
                </span>
              }
            >
              <ul className="divide-y divide-[var(--border)] rounded-[6px] border border-[var(--border)] bg-[var(--surface-2)]">
                {commitFiles.map((file) => {
                  const Icon =
                    file.kind === "image"
                      ? ImageIcon
                      : file.kind === "code"
                        ? FileCode2
                        : FileText;
                  return (
                    <li
                      key={file.path}
                      className="flex items-center justify-between gap-3 px-3.5 py-2.5 text-[13px]"
                    >
                      <span className="flex min-w-0 items-center gap-2.5">
                        <Icon className="size-4 shrink-0 text-[var(--text-muted)]" />
                        <span className="studio-mono truncate font-medium text-[var(--text)]">
                          {file.path}
                        </span>
                      </span>
                      <span className="studio-mono shrink-0 text-[12px] text-[var(--text-muted)]">
                        {file.size}
                      </span>
                    </li>
                  );
                })}
              </ul>
            </StudioSectionCard>

            {/* Card 1: Create a token */}
            <StudioSectionCard
              number={1}
              title="Create a token"
              description="Generate a temporary GitHub Personal Access Token with write access to your profile repository."
            >
              <StudioSegmentedControl<"classic" | "fine-grained">
                ariaLabel="Token format"
                value={tokenTab}
                onChange={setTokenTab}
                options={[
                  { value: "classic", label: "Classic token" },
                  { value: "fine-grained", label: "Fine-grained token" },
                ]}
              />

              {tokenTab === "classic" ? (
                <div className="flex flex-col gap-4 rounded-[6px] border border-[var(--border)] bg-[var(--surface-2)] p-4">
                  <div className="flex flex-col gap-2">
                    <span className="text-[13px] font-medium text-[var(--text)]">
                      Required permissions
                    </span>
                    <div className="flex flex-wrap items-center gap-2 text-[13px]">
                      <span className="studio-mono inline-flex items-center gap-1.5 rounded-[6px] border border-[var(--border)] bg-[var(--surface)] px-2.5 py-1 font-medium text-[var(--text)]">
                        <Check className="size-3.5 text-[var(--accent)]" />
                        repo
                      </span>
                      {includeWorkflowFiles ? (
                        <span className="studio-mono inline-flex items-center gap-1.5 rounded-[6px] border border-[var(--accent)] bg-[var(--accent-soft)] px-2.5 py-1 font-medium text-[var(--accent)]">
                          <Check className="size-3.5" />
                          workflow
                        </span>
                      ) : (
                        <span className="text-[13px] text-[var(--text-muted)]">
                          (Add <code className="studio-mono">workflow</code> if
                          enabling the 12:00 AM action)
                        </span>
                      )}
                    </div>
                  </div>

                  <div>
                    <a
                      href={classicCreateUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex h-9 items-center gap-2 rounded-[6px] border border-[var(--border)] bg-[var(--surface)] px-3.5 text-[13px] font-medium text-[var(--text)] transition-[color,background-color,border-color] duration-150 hover:border-[var(--border-strong)] hover:bg-[var(--surface-2)]"
                    >
                      <span>Create classic token</span>
                      <ExternalLink className="size-3.5 text-[var(--text-muted)]" />
                    </a>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col gap-4 rounded-[6px] border border-[var(--border)] bg-[var(--surface-2)] p-4">
                  <div className="flex flex-col gap-2">
                    <span className="text-[13px] font-medium text-[var(--text)]">
                      Required repository permissions (for{" "}
                      <code className="studio-mono">{repoPath}</code>)
                    </span>
                    <div className="flex flex-wrap items-center gap-2 text-[13px]">
                      <span className="studio-mono inline-flex items-center gap-1.5 rounded-[6px] border border-[var(--border)] bg-[var(--surface)] px-2.5 py-1 font-medium text-[var(--text)]">
                        <Check className="size-3.5 text-[var(--accent)]" />
                        Contents: Read and write
                      </span>
                      {includeWorkflowFiles && (
                        <span className="studio-mono inline-flex items-center gap-1.5 rounded-[6px] border border-[var(--accent)] bg-[var(--accent-soft)] px-2.5 py-1 font-medium text-[var(--accent)]">
                          <Check className="size-3.5" />
                          Workflows: Read and write
                        </span>
                      )}
                      <span className="studio-mono inline-flex items-center rounded-[6px] border border-[var(--border)] bg-[var(--surface)] px-2.5 py-1 text-[var(--text-muted)]">
                        Metadata: Read-only (auto)
                      </span>
                    </div>
                  </div>

                  <div>
                    <a
                      href="https://github.com/settings/personal-access-tokens/new"
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex h-9 items-center gap-2 rounded-[6px] border border-[var(--border)] bg-[var(--surface)] px-3.5 text-[13px] font-medium text-[var(--text)] transition-[color,background-color,border-color] duration-150 hover:border-[var(--border-strong)] hover:bg-[var(--surface-2)]"
                    >
                      <span>Create fine-grained token</span>
                      <ExternalLink className="size-3.5 text-[var(--text-muted)]" />
                    </a>
                  </div>
                </div>
              )}

              <div className="flex flex-wrap items-center gap-3">
                <StudioButton
                  variant="secondary"
                  size="sm"
                  onClick={() => setTokenGuideOpen(true)}
                >
                  <BookOpen />
                  <span>How to create a classic token and permissions</span>
                </StudioButton>

                <button
                  type="button"
                  onClick={() => setTokenGuideOpen(true)}
                  className="cursor-pointer rounded-[6px] py-1 text-[13px] font-medium text-[var(--accent)] underline underline-offset-4 hover:text-[var(--accent-hover)]"
                >
                  Full step guide
                </button>
              </div>
            </StudioSectionCard>

            {/* Form wrapping Card 2 & Card 3 */}
            <form onSubmit={handlePush} className="flex flex-col gap-6">
              {/* Card 2: Paste your token */}
              <StudioSectionCard
                number={2}
                title="Paste your token"
                description="Copy, cut and context menu actions are disabled on this field."
              >
                <StudioField
                  label="GitHub personal access token"
                  htmlFor="pat-single-input"
                  trailing={
                    <span className="inline-flex items-center gap-1.5 text-[12px] text-[var(--text-muted)]">
                      <Lock className="size-3.5" />
                      <span>Kept in memory only</span>
                    </span>
                  }
                  error={tokenFormatError}
                  helper={
                    tokenValid
                      ? undefined
                      : "Prefix should start with github_pat_ or ghp_."
                  }
                >
                  <div className="flex items-center gap-2">
                    <StudioInput
                      id="pat-single-input"
                      inputSize="lg"
                      type={showToken ? "text" : "password"}
                      monospace
                      autoComplete="off"
                      spellCheck={false}
                      value={tokenInput}
                      invalid={Boolean(tokenFormatError)}
                      onChange={(e) => {
                        setTokenInput(e.target.value);
                        if (pushError) setPushError(null);
                      }}
                      onCopy={(e) => e.preventDefault()}
                      onCut={(e) => e.preventDefault()}
                      onDragStart={(e) => e.preventDefault()}
                      onContextMenu={(e) => e.preventDefault()}
                      placeholder="github_pat_... or ghp_..."
                      className="flex-1 select-none"
                    />

                    <Tooltip>
                      <TooltipTrigger
                        render={
                          <StudioButton
                            type="button"
                            variant="secondary"
                            size="icon"
                            className="sm:size-10"
                            onClick={() => setShowToken((prev) => !prev)}
                            aria-label={
                              showToken ? "Hide token" : "Show token"
                            }
                          />
                        }
                      >
                        {showToken ? <EyeOff /> : <Eye />}
                      </TooltipTrigger>
                      <TooltipContent
                        data-app="studio"
                        className="border border-[var(--border)] bg-[var(--text)] text-[var(--bg)] shadow-[var(--studio-shadow-overlay)]"
                      >
                        {showToken ? "Hide token" : "Show token"}
                      </TooltipContent>
                    </Tooltip>

                    {tokenInput && (
                      <Tooltip>
                        <TooltipTrigger
                          render={
                            <StudioButton
                              type="button"
                              variant="ghost"
                              size="icon"
                              className="sm:size-10"
                              onClick={() => setTokenInput("")}
                              aria-label="Clear token from memory"
                            />
                          }
                        >
                          <Trash2 />
                        </TooltipTrigger>
                        <TooltipContent
                          data-app="studio"
                          className="border border-[var(--border)] bg-[var(--text)] text-[var(--bg)] shadow-[var(--studio-shadow-overlay)]"
                        >
                          Clear token from memory
                        </TooltipContent>
                      </Tooltip>
                    )}
                  </div>

                  {tokenValid && (
                    <p className="mt-1 flex items-center gap-1.5 text-[13px] text-[var(--success)]">
                      <CheckCircle2 className="size-3.5 shrink-0" />
                      <span>Token format recognized.</span>
                    </p>
                  )}
                </StudioField>
              </StudioSectionCard>

              {/* Card 3: Options and publish */}
              <StudioSectionCard
                number={3}
                title="Options and publish"
                description="Choose whether to install the automated midnight update workflow, then push."
              >
                <StudioSwitchRow
                  id="auto-evolve-check"
                  checked={includeWorkflowFiles}
                  onCheckedChange={setIncludeWorkflowFiles}
                  label="Include 12:00 AM daily auto-evolve GitHub Action"
                  description="Updates creature.webp and README.md every midnight. Requires the workflow permission."
                />

                {includeWorkflowFiles && (
                  <div className="flex flex-col gap-2">
                    <span className="text-[13px] font-medium text-[var(--text-muted)]">
                      Daily schedule
                    </span>
                    <StudioSegmentedControl<"local" | "utc">
                      ariaLabel="Daily GitHub Action schedule"
                      value={timezoneMode}
                      onChange={setTimezoneMode}
                      options={[
                        {
                          value: "local",
                          label: `12:00 AM Local (${localCron})`,
                        },
                        {
                          value: "utc",
                          label: "12:00 AM UTC (0 0 * * *)",
                        },
                      ]}
                    />
                  </div>
                )}

                {hasLegacyWorkflow && !includeWorkflowFiles && (
                  <div className="flex items-start gap-2.5 rounded-[6px] border border-[var(--warning)]/35 bg-[var(--warning-soft)] px-3.5 py-2.5 text-[13px] leading-5 text-[var(--text)]">
                    <AlertCircle className="mt-0.5 size-4 shrink-0 text-[var(--warning)]" />
                    <span>
                      An older{" "}
                      <code className="studio-mono">evolve-creature.yml</code>{" "}
                      was detected in <code className="studio-mono">{repoPath}</code>
                      . Enable the switch above (with workflow permission) to
                      upgrade it to Animated WebP.
                    </span>
                  </div>
                )}

                {pushLoading && (
                  <ul
                    aria-live="polite"
                    className="flex flex-col gap-2 rounded-[6px] border border-[var(--border)] bg-[var(--surface-2)] p-3.5 text-[13px]"
                  >
                    {pushStepRows.map((step) => {
                      const isDone = completedSteps.includes(step.id);
                      const isActive = activePushStep === step.id && !isDone;
                      return (
                        <li
                          key={step.id}
                          className={cn(
                            "flex items-center gap-2.5",
                            isDone
                              ? "text-[var(--success)]"
                              : isActive
                                ? "font-medium text-[var(--text)]"
                                : "text-[var(--text-faint)]"
                          )}
                        >
                          {isDone ? (
                            <CheckCircle2 className="size-4 shrink-0" />
                          ) : isActive ? (
                            <Loader2 className="size-4 shrink-0 animate-spin text-[var(--accent)]" />
                          ) : (
                            <span className="size-4 shrink-0 rounded-full border border-[var(--border)]" />
                          )}
                          <span>{step.label}</span>
                        </li>
                      );
                    })}
                  </ul>
                )}

                {pushError && (
                  <div
                    role="alert"
                    className="flex items-start gap-3 rounded-[6px] border border-[var(--danger)]/40 bg-[var(--danger-soft)] p-4 text-[13px] leading-5 text-[var(--text)]"
                  >
                    <AlertCircle className="mt-0.5 size-4 shrink-0 text-[var(--danger)]" />
                    <div className="flex flex-col gap-1">
                      <span className="font-semibold text-[var(--danger)]">
                        Push failed
                      </span>
                      <span>{pushError}</span>
                    </div>
                  </div>
                )}

                {publishResult && (
                  <div
                    role="status"
                    className="flex flex-col gap-3 rounded-[6px] border border-[var(--success)]/40 bg-[var(--success-soft)] p-4 text-[13px] leading-5 text-[var(--text)]"
                  >
                    <div className="flex items-start gap-2.5">
                      <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-[var(--success)]" />
                      <div className="flex flex-col gap-1">
                        <span className="text-[14px] font-semibold text-[var(--success)]">
                          Published
                        </span>
                        <span>
                          Committed{" "}
                          <code className="studio-mono">
                            {publishResult.updatedPaths.join(", ")}
                          </code>{" "}
                          to <code className="studio-mono">{repoPath}</code>.
                          Your token was cleared from memory.
                        </span>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2 pl-6">
                      <a
                        href={publishResult.repoUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex h-9 items-center gap-1.5 rounded-[6px] border border-[var(--border)] bg-[var(--surface)] px-3 text-[13px] font-medium text-[var(--text)] transition-[color,border-color] duration-150 hover:border-[var(--border-strong)]"
                      >
                        <span>View repository</span>
                        <ExternalLink className="size-3.5 text-[var(--text-muted)]" />
                      </a>
                      <a
                        href={`https://github.com/${encodeURIComponent(publishResult.username)}`}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex h-9 items-center gap-1.5 rounded-[6px] bg-[var(--accent)] px-3 text-[13px] font-medium text-[var(--on-accent)] transition-colors duration-150 hover:bg-[var(--accent-hover)]"
                      >
                        <span>View your profile</span>
                        <ExternalLink className="size-3.5" />
                      </a>
                    </div>
                  </div>
                )}

                <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
                  <StudioButton
                    type="button"
                    variant="ghost"
                    onClick={onBack}
                    disabled={pushLoading}
                  >
                    <ArrowLeft />
                    <span>Back</span>
                  </StudioButton>

                  {!tokenValid && !pushLoading ? (
                    <Tooltip>
                      <TooltipTrigger
                        render={
                          <span tabIndex={0} className="inline-flex">
                            {pushButton}
                          </span>
                        }
                      />
                      <TooltipContent
                        data-app="studio"
                        className="border border-[var(--border)] bg-[var(--text)] text-[var(--bg)] shadow-[var(--studio-shadow-overlay)]"
                      >
                        Paste a valid token starting with github_pat_ or ghp_ to
                        push.
                      </TooltipContent>
                    </Tooltip>
                  ) : (
                    pushButton
                  )}
                </div>
              </StudioSectionCard>
            </form>

            {/* Secondary Section: Prefer to do it yourself? */}
            <StudioSectionCard
              title="Prefer to do it yourself?"
              description="Download the generated files and commit them to your repository manually."
            >
              <div className="flex flex-wrap gap-2">
                <StudioButton
                  variant="secondary"
                  disabled={webpBusy}
                  onClick={handleDownloadWebP}
                >
                  <Download />
                  <span>
                    {webpBusy ? "Encoding WebP..." : "Download creature.webp"}
                  </span>
                </StudioButton>

                <StudioButton
                  variant="secondary"
                  disabled={gifBusy}
                  onClick={handleDownloadGif}
                >
                  <Download />
                  <span>
                    {gifBusy ? "Encoding GIF..." : "Download creature.gif"}
                  </span>
                </StudioButton>

                <StudioButton
                  variant="secondary"
                  onClick={() =>
                    downloadTextFile(
                      "README.md",
                      readmeMarkdown,
                      "text/markdown"
                    )
                  }
                >
                  <Download />
                  <span>Download README.md</span>
                </StudioButton>
              </div>
            </StudioSectionCard>
          </div>

          {/* Right Sticky Column */}
          <aside className="lg:sticky lg:top-[120px]">
            <StudioSectionCard title="Token safety">
              <div className="flex flex-col gap-3">
                <div className="flex items-center gap-2 text-[14px] font-medium text-[var(--text)]">
                  <ShieldCheck className="size-4 shrink-0 text-[var(--accent)]" />
                  <span>In-memory security guarantee</span>
                </div>

                <p className="text-[13px] leading-5 text-[var(--text-muted)]">
                  Your token stays in this tab&apos;s memory. This static app
                  never stores tokens in cookies, localStorage, sessionStorage
                  or on any server. It is cleared automatically after the push.
                </p>

                <a
                  href="https://docs.github.com/en/site-policy/privacy-policies/github-general-privacy-statement"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex w-fit items-center gap-1.5 rounded-[6px] py-0.5 text-[13px] font-medium text-[var(--accent)] underline underline-offset-4 hover:text-[var(--accent-hover)]"
                >
                  <span>GitHub privacy statement</span>
                  <ExternalLink className="size-3.5" />
                </a>
              </div>
            </StudioSectionCard>
          </aside>
        </div>

        <TokenGuideDialog
          open={tokenGuideOpen}
          onClose={() => setTokenGuideOpen(false)}
          username={username}
          includeWorkflowFiles={includeWorkflowFiles}
        />
      </div>
    </TooltipProvider>
  );
}
