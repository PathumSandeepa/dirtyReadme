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
import { BRAND } from "@/config/brand";
import {
  generateCreatureConfigJson,
  generateEvolveScriptMjs,
  generateEvolveWorkflowYaml,
  getMidnightCronForTimezone,
} from "@/domain/automation/workflowService";
import type { CreatureConfig } from "@/domain/creature/entities";
import { getSpriteKey } from "@/domain/creature/services";
import type {
  CustomImageMemoryAsset,
  ReadmeConfig,
} from "@/domain/profile/entities";
import {
  blobToBase64,
  downloadBlobFile,
  downloadTextFile,
} from "@/infrastructure/browser/downloadAdapter";
import { formatFileBytes } from "@/infrastructure/browser/imageStudioEngine";
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
  buildZipBlob,
  type ZipEntryInput,
} from "@/infrastructure/browser/zipBuilder";
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
  customImages?: CustomImageMemoryAsset[];
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

/**
 * Step 4 Publish screen with atomic GitHub commit flow, sticky help rail, and local bundle downloads.
 */
export function TokenPublishScreen({
  creatureConfig,
  readmeConfig,
  readmeMarkdown,
  customImages = [],
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
  const [zipBusy, setZipBusy] = useState(false);
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

  const includesCreatureBinary =
    readmeConfig.bannerSource !== "custom-image" ||
    readmeMarkdown.includes("creature.webp");

  const commitFiles = useMemo(() => {
    const items: {
      path: string;
      size: string;
      kind: "image" | "doc" | "code";
    }[] = [
      ...(includesCreatureBinary
        ? [
            {
              path: "creature.webp",
              size: "Animated WebP",
              kind: "image" as const,
            },
          ]
        : []),
      ...customImages.map((img) => ({
        path: img.repoPath,
        size: `${formatFileBytes(img.webpSizeBytes)} (${img.width} by ${img.height})`,
        kind: "image" as const,
      })),
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

    if (includeShareCard && readmeConfig.bannerSource !== "custom-image") {
      items.push({ path: "share-card.png", size: "1280 by 640 PNG", kind: "image" });
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
    includesCreatureBinary,
    customImages,
    readmeMarkdown,
    configJson,
    includeShareCard,
    readmeConfig.bannerSource,
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

  const handleDownloadAllZip = async () => {
    setZipBusy(true);
    try {
      const encoder = new TextEncoder();
      const entries: ZipEntryInput[] = [
        { path: "README.md", data: encoder.encode(readmeMarkdown) },
        { path: "creature-config.json", data: encoder.encode(configJson) },
      ];

      if (includesCreatureBinary) {
        const sprite = await loadCreatureSprite(
          getSpriteKey(creatureConfig.creature, creatureConfig.view)
        );
        const webpBlob = await encodeAnimatedWebPFromCreature(
          creatureConfig,
          sprite
        );
        entries.push({
          path: "creature.webp",
          data: new Uint8Array(await webpBlob.arrayBuffer()),
        });
      }

      for (const img of customImages) {
        entries.push({
          path: img.repoPath,
          data: new Uint8Array(await img.webpBlob.arrayBuffer()),
        });
      }

      if (includeShareCard && readmeConfig.bannerSource !== "custom-image") {
        const sprite = await loadCreatureSprite(
          getSpriteKey(creatureConfig.creature, creatureConfig.view)
        );
        const shareBlob = await exportShareCardPngBlob(creatureConfig, sprite);
        entries.push({
          path: "share-card.png",
          data: new Uint8Array(await shareBlob.arrayBuffer()),
        });
      }

      if (includeWorkflowFiles) {
        entries.push(
          {
            path: ".github/workflows/evolve-creature.yml",
            data: encoder.encode(workflowYaml),
          },
          {
            path: "scripts/evolve-creature.mjs",
            data: encoder.encode(evolveScript),
          }
        );
      }

      const zipBlob = buildZipBlob(entries);
      downloadBlobFile(`${username}-readme-bundle.zip`, zipBlob);
    } catch (err) {
      setPushError(
        err instanceof Error ? err.message : "Failed creating bundle archive."
      );
    } finally {
      setZipBusy(false);
    }
  };

  const pushStepRows: { id: PublishProgressStep; label: string }[] = [
    ...(includesCreatureBinary
      ? [{ id: "uploading-webp" as const, label: "Uploading creature.webp" }]
      : []),
    ...(customImages.length > 0
      ? [{ id: "uploading-images" as const, label: "Uploading custom images" }]
      : []),
    { id: "updating-readme", label: "Updating README.md" },
    ...(includeWorkflowFiles
      ? [
          {
            id: "adding-workflow" as const,
            label: "Adding workflow files",
          },
        ]
      : []),
    { id: "committing", label: "Creating commit on branch" },
  ];

  const handlePush = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!tokenValid) {
      setPushError(
        "Paste a valid GitHub Personal Access Token starting with github_pat_ or ghp_ before pushing."
      );
      return;
    }

    const firstStep = pushStepRows[0]?.id ?? "updating-readme";
    setPushLoading(true);
    setPushError(null);
    setPublishResult(null);
    setCompletedSteps([]);
    setActivePushStep(firstStep);

    try {
      const spriteKey = getSpriteKey(
        creatureConfig.creature,
        creatureConfig.view
      );
      const needsSprite =
        includesCreatureBinary ||
        includeWorkflowFiles ||
        (includeShareCard && readmeConfig.bannerSource !== "custom-image");
      const sprite = needsSprite ? await loadCreatureSprite(spriteKey) : null;

      const files: PublishFileInput[] = [];

      if (includesCreatureBinary && sprite) {
        const webpBlob = await encodeAnimatedWebPFromCreature(
          creatureConfig,
          sprite
        );
        files.push({
          path: "creature.webp",
          base64Content: await blobToBase64(webpBlob),
          message: "feat: update animated pixel creature WebP",
        });
      }

      for (const customAsset of customImages) {
        files.push({
          path: customAsset.repoPath,
          base64Content: await blobToBase64(customAsset.webpBlob),
          message: `feat: add ${customAsset.repoPath}`,
        });
      }

      files.push(
        {
          path: "README.md",
          content: readmeMarkdown,
          message: "feat: update GitHub profile README",
        },
        {
          path: "creature-config.json",
          content: configJson,
          message: "ci: save ReadmeForge profile configuration",
        }
      );

      if (
        includeShareCard &&
        readmeConfig.bannerSource !== "custom-image" &&
        sprite
      ) {
        const shareBlob = await exportShareCardPngBlob(creatureConfig, sprite);
        files.push({
          path: "share-card.png",
          base64Content: await blobToBase64(shareBlob),
          message: "feat: update creature share banner",
        });
      }

      if (includeWorkflowFiles) {
        const spritePngBase64 = await fetchSpritePngBase64(spriteKey);
        files.push(
          {
            path: "assets/creature-sprite.png",
            base64Content: spritePngBase64,
            message: "ci: store base pixel creature sprite for midnight updates",
          },
          {
            path: ".github/workflows/evolve-creature.yml",
            content: workflowYaml,
            message: "ci: add 12 AM daily auto evolve workflow",
          },
          {
            path: "scripts/evolve-creature.mjs",
            content: evolveScript,
            message: "ci: add daily creature evolution script",
          }
        );
      }

      const stepOrder = pushStepRows.map((s) => s.id);

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
          <span>Pushing to GitHub</span>
        </>
      ) : (
        <>
          <Zap />
          <span>Push to GitHub</span>
        </>
      )}
    </StudioButton>
  );

  const classicCreateUrl = `https://github.com/settings/tokens/new?description=dynamic-readme-creature&scopes=${includeWorkflowFiles ? "repo,workflow" : "repo"}`;

  return (
    <TooltipProvider delay={150}>
      <div className="mx-auto flex w-full max-w-[1120px] flex-col gap-8 px-4 py-10 sm:px-6 sm:py-12">
        {/* Page Header */}
        <div className="flex flex-col gap-2">
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-[28px] leading-[1.18] font-semibold tracking-[-0.025em] text-[var(--text)] sm:text-[32px]">
              Publish to your profile
            </h1>
            <a
              href={repoUrl}
              target="_blank"
              rel="noreferrer"
              className="studio-mono inline-flex items-center gap-1.5 rounded-[8px] bg-[var(--surface-2)] px-3 py-1 text-[13px] font-medium text-[var(--text)] transition-colors duration-150 hover:bg-[var(--surface-3)] hover:text-[var(--tide)]"
            >
              <span>{repoPath}</span>
              <ExternalLink className="size-3.5 text-[var(--text-2)]" />
            </a>
          </div>
          <p className="text-[15px] leading-6 text-[var(--text-2)]">
            Commit your README, creature animation and custom images directly
            from your browser using a temporary GitHub token.
          </p>
        </div>

        {/* Repository Status Banner */}
        {repoCheckState === "checking" && (
          <div
            role="status"
            className="flex items-center gap-2.5 rounded-[12px] bg-[var(--surface)] px-5 py-4 text-[14px] text-[var(--text-2)]"
          >
            <Loader2 className="size-4 shrink-0 animate-spin text-[var(--tide)]" />
            <span>
              Checking{" "}
              <code className="studio-mono text-[var(--text)]">{repoPath}</code>{" "}
              on GitHub.
            </span>
          </div>
        )}

        {repoCheckState === "missing" && (
          <div
            role="status"
            className="flex flex-wrap items-center justify-between gap-4 rounded-[12px] bg-[var(--warning-soft)] px-5 py-4 text-[14px] text-[var(--text)]"
          >
            <div className="flex items-start gap-3">
              <AlertTriangle className="mt-1 size-4 shrink-0 text-[var(--warning)]" />
              <span>
                Public repository{" "}
                <code className="studio-mono font-semibold">{repoPath}</code>{" "}
                was not detected yet. Create it on GitHub or re-check before
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
                className="inline-flex h-8 items-center gap-1.5 rounded-[8px] bg-[var(--surface)] px-3 text-[13px] font-medium text-[var(--text)] transition-colors duration-150 hover:bg-[var(--surface-2)]"
              >
                <span>Create {repoPath}</span>
                <ExternalLink className="size-3.5 text-[var(--text-2)]" />
              </a>
            </div>
          </div>
        )}

        {/* Two columns: 680px main and sticky 360px help rail */}
        <div className="grid items-start gap-8 lg:grid-cols-[minmax(0,680px)_360px] lg:justify-between">
          {/* Left Main Column */}
          <div className="flex flex-col gap-6">
            {/* 1. What will be committed */}
            <StudioSectionCard
              title="What will be committed"
              description="Files included in one atomic commit to your profile repository."
              headerAction={
                <span className="studio-mono inline-flex shrink-0 items-center rounded-[8px] bg-[var(--surface-2)] px-3 py-1 text-[12px] font-medium whitespace-nowrap text-[var(--text)]">
                  Branch {resolvedBranch || "main"}
                </span>
              }
            >
              <ul className="divide-y divide-[var(--line)] rounded-[10px] bg-[var(--surface-2)]">
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
                      className="flex items-center justify-between gap-3 px-4 py-3 text-[13px]"
                    >
                      <span className="flex min-w-0 items-center gap-2.5">
                        <Icon className="size-4 shrink-0 text-[var(--text-2)]" />
                        <span className="studio-mono truncate font-medium text-[var(--text)]">
                          {file.path}
                        </span>
                      </span>
                      <span className="studio-mono shrink-0 text-[12px] text-[var(--text-2)] tabular-nums">
                        {file.size}
                      </span>
                    </li>
                  );
                })}
              </ul>
            </StudioSectionCard>

            {/* 2. Create a token */}
            <StudioSectionCard
              title="Create a token"
              description="Generate a temporary GitHub token with write access to your profile repository."
            >
              <StudioSegmentedControl<"classic" | "fine-grained">
                ariaLabel="Token format"
                value={tokenTab}
                onChange={setTokenTab}
                options={[
                  { value: "classic", label: "Classic" },
                  { value: "fine-grained", label: "Fine grained" },
                ]}
              />

              {tokenTab === "classic" ? (
                <div className="flex flex-col gap-4 rounded-[10px] bg-[var(--surface-2)] p-4">
                  <div className="flex flex-col gap-2">
                    <span className="text-[13px] font-medium text-[var(--text)]">
                      Required permissions
                    </span>
                    <div className="flex flex-wrap items-center gap-2 text-[13px]">
                      <span className="studio-mono inline-flex items-center gap-1.5 rounded-[8px] bg-[var(--surface)] px-3 py-1.5 font-medium text-[var(--text)]">
                        <Check className="size-3.5 text-[var(--tide)]" />
                        <span>repo</span>
                      </span>
                      {includeWorkflowFiles ? (
                        <span className="studio-mono inline-flex items-center gap-1.5 rounded-[8px] bg-[var(--tide-soft)] px-3 py-1.5 font-medium text-[var(--tide)]">
                          <Check className="size-3.5" />
                          <span>workflow</span>
                        </span>
                      ) : (
                        <span className="text-[13px] text-[var(--text-2)]">
                          Also select{" "}
                          <code className="studio-mono text-[var(--text)]">
                            workflow
                          </code>{" "}
                          only when the daily action is on.
                        </span>
                      )}
                    </div>
                  </div>

                  <div>
                    <a
                      href={classicCreateUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex h-9 items-center gap-2 rounded-[8px] bg-[var(--surface)] px-3.5 text-[13px] font-medium text-[var(--text)] transition-colors duration-150 hover:bg-[var(--surface-3)]"
                    >
                      <span>Create classic token</span>
                      <ExternalLink className="size-3.5 text-[var(--text-2)]" />
                    </a>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col gap-4 rounded-[10px] bg-[var(--surface-2)] p-4">
                  <div className="flex flex-col gap-2">
                    <span className="text-[13px] font-medium text-[var(--text)]">
                      Repository permissions for{" "}
                      <code className="studio-mono">{repoPath}</code>
                    </span>
                    <div className="flex flex-wrap items-center gap-2 text-[13px]">
                      <span className="studio-mono inline-flex items-center gap-1.5 rounded-[8px] bg-[var(--surface)] px-3 py-1.5 font-medium text-[var(--text)]">
                        <Check className="size-3.5 text-[var(--tide)]" />
                        <span>Contents read and write</span>
                      </span>
                      {includeWorkflowFiles && (
                        <span className="studio-mono inline-flex items-center gap-1.5 rounded-[8px] bg-[var(--tide-soft)] px-3 py-1.5 font-medium text-[var(--tide)]">
                          <Check className="size-3.5" />
                          <span>Workflows read and write</span>
                        </span>
                      )}
                      <span className="studio-mono inline-flex items-center rounded-[8px] bg-[var(--surface)] px-3 py-1.5 text-[var(--text-2)]">
                        Metadata read only
                      </span>
                    </div>
                  </div>

                  <div>
                    <a
                      href="https://github.com/settings/personal-access-tokens/new"
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex h-9 items-center gap-2 rounded-[8px] bg-[var(--surface)] px-3.5 text-[13px] font-medium text-[var(--text)] transition-colors duration-150 hover:bg-[var(--surface-3)]"
                    >
                      <span>Create fine grained token</span>
                      <ExternalLink className="size-3.5 text-[var(--text-2)]" />
                    </a>
                  </div>
                </div>
              )}

              <div>
                <StudioButton
                  variant="secondary"
                  size="sm"
                  onClick={() => setTokenGuideOpen(true)}
                >
                  <BookOpen />
                  <span>Step by step guide</span>
                </StudioButton>
              </div>
            </StudioSectionCard>

            {/* Form wrapping Paste your token and Options and publish */}
            <form onSubmit={handlePush} className="flex flex-col gap-6">
              {/* 3. Paste your token */}
              <StudioSectionCard
                title="Paste your token"
                description="Copy, cut and context menu actions are disabled on this field."
              >
                <StudioField
                  label="GitHub personal access token"
                  htmlFor="pat-single-input"
                  trailing={
                    <span className="inline-flex items-center gap-1.5 text-[12px] text-[var(--text-2)]">
                      <Lock className="size-3.5" />
                      <span>Kept in memory only</span>
                    </span>
                  }
                  error={tokenFormatError}
                  helper={
                    tokenValid
                      ? undefined
                      : "Prefix must start with github_pat_ or ghp_."
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
                      placeholder="github_pat_ or ghp_ token"
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
                        className="border-0 bg-[var(--text)] text-[var(--bg)] shadow-[var(--shadow-float)]"
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
                          className="border-0 bg-[var(--text)] text-[var(--bg)] shadow-[var(--shadow-float)]"
                        >
                          Clear token from memory
                        </TooltipContent>
                      </Tooltip>
                    )}
                  </div>

                  {tokenValid && (
                    <p
                      data-testid="token-valid-indicator"
                      className="mt-1 flex items-center gap-1.5 text-[13px] text-[var(--tide)]"
                    >
                      <CheckCircle2 className="size-3.5 shrink-0" />
                      <span>Token format recognized.</span>
                    </p>
                  )}
                </StudioField>
              </StudioSectionCard>

              {/* 4. Options and publish */}
              <StudioSectionCard
                title="Options and publish"
                description="Choose whether to enable the 12:00 AM daily auto evolve GitHub Action, then push."
              >
                <StudioSwitchRow
                  id="auto-evolve-check"
                  checked={includeWorkflowFiles}
                  onCheckedChange={setIncludeWorkflowFiles}
                  label="Enable 12:00 AM daily auto evolve action"
                  description="Refreshes creature.webp and README.md markers every midnight."
                />

                {includeWorkflowFiles && (
                  <div className="flex flex-col gap-2">
                    <span className="text-[13px] font-medium text-[var(--text-2)]">
                      Daily schedule
                    </span>
                    <StudioSegmentedControl<"local" | "utc">
                      ariaLabel="Daily GitHub Action schedule"
                      value={timezoneMode}
                      onChange={setTimezoneMode}
                      options={[
                        {
                          value: "local",
                          label: `12:00 AM local (${localCron})`,
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
                  <div className="flex items-start gap-2.5 rounded-[10px] bg-[var(--warning-soft)] px-4 py-3 text-[13px] leading-5 text-[var(--text)]">
                    <AlertCircle className="mt-0.5 size-4 shrink-0 text-[var(--warning)]" />
                    <span>
                      An older{" "}
                      <code className="studio-mono">evolve-creature.yml</code>{" "}
                      was detected in{" "}
                      <code className="studio-mono">{repoPath}</code>. Enable
                      the switch above with workflow permission to upgrade it
                      to animated WebP.
                    </span>
                  </div>
                )}

                {pushLoading && (
                  <ul
                    aria-live="polite"
                    className="flex flex-col gap-2.5 rounded-[10px] bg-[var(--surface-2)] p-4 text-[13px]"
                  >
                    {pushStepRows.map((step) => {
                      const isDone = completedSteps.includes(step.id);
                      const isActive = activePushStep === step.id && !isDone;
                      return (
                        <li
                          key={step.id}
                          className={cn(
                            "flex items-center gap-3",
                            isDone
                              ? "text-[var(--tide)]"
                              : isActive
                                ? "font-medium text-[var(--text)]"
                                : "text-[var(--text-3)]"
                          )}
                        >
                          {isDone ? (
                            <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-[var(--tide-soft)] text-[var(--tide)]">
                              <Check className="size-3.5" />
                            </span>
                          ) : isActive ? (
                            <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-[var(--tide)] text-[var(--on-primary)]">
                              <Loader2 className="size-3 animate-spin" />
                            </span>
                          ) : (
                            <span className="size-5 shrink-0 rounded-full bg-[var(--surface-3)]" />
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
                    className="flex items-start gap-3 rounded-[10px] bg-[var(--danger-soft)] p-4 text-[13px] leading-5 text-[var(--text)]"
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
                    className="flex flex-col gap-3 rounded-[10px] bg-[var(--tide-soft)] p-4 text-[13px] leading-5 text-[var(--text)]"
                  >
                    <div className="flex items-start gap-2.5">
                      <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-[var(--tide)]" />
                      <div className="flex flex-col gap-1">
                        <span className="text-[14px] font-semibold text-[var(--tide)]">
                          Published to GitHub
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
                        className="inline-flex h-9 items-center gap-1.5 rounded-[8px] bg-[var(--surface)] px-3.5 text-[13px] font-medium text-[var(--text)] transition-colors duration-150 hover:bg-[var(--surface-2)]"
                      >
                        <span>View repository</span>
                        <ExternalLink className="size-3.5 text-[var(--text-2)]" />
                      </a>
                      <a
                        href={`https://github.com/${encodeURIComponent(publishResult.username)}`}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex h-9 items-center gap-1.5 rounded-[8px] bg-[var(--primary)] px-3.5 text-[13px] font-medium text-[var(--on-primary)] transition-colors duration-150 hover:bg-[var(--primary-hover)]"
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
                        className="border-0 bg-[var(--text)] text-[var(--bg)] shadow-[var(--shadow-float)]"
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

            {/* 5. Prefer to do it yourself */}
            <StudioSectionCard
              title="Prefer to do it yourself"
              description="Download the generated files or zip archive and commit them manually."
            >
              <div className="flex flex-wrap gap-2">
                <StudioButton
                  variant="primary"
                  disabled={zipBusy}
                  onClick={handleDownloadAllZip}
                >
                  <Download />
                  <span>
                    {zipBusy ? "Creating zip" : "Download all files (.zip)"}
                  </span>
                </StudioButton>

                {includesCreatureBinary && (
                  <StudioButton
                    variant="secondary"
                    disabled={webpBusy}
                    onClick={handleDownloadWebP}
                  >
                    <Download />
                    <span>
                      {webpBusy ? "Encoding WebP" : "Download creature.webp"}
                    </span>
                  </StudioButton>
                )}

                {includesCreatureBinary && (
                  <StudioButton
                    variant="secondary"
                    disabled={gifBusy}
                    onClick={handleDownloadGif}
                  >
                    <Download />
                    <span>
                      {gifBusy ? "Encoding GIF" : "Download creature.gif"}
                    </span>
                  </StudioButton>
                )}

                {customImages.map((img) => (
                  <StudioButton
                    key={img.repoPath}
                    variant="secondary"
                    onClick={() => downloadBlobFile(img.filename, img.webpBlob)}
                  >
                    <Download />
                    <span>Download {img.repoPath}</span>
                  </StudioButton>
                ))}

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

          {/* Right Sticky Help Column */}
          <aside className="flex flex-col gap-6 lg:sticky lg:top-[116px] lg:self-start">
            <StudioSectionCard title="Token safety">
              <div className="flex flex-col gap-3">
                <div className="flex items-center gap-2 text-[14px] font-medium text-[var(--text)]">
                  <ShieldCheck className="size-4 shrink-0 text-[var(--tide)]" />
                  <span>In memory only</span>
                </div>

                <p className="text-[13px] leading-6 text-[var(--text-2)]">
                  {BRAND.name} runs purely in your browser. Your token stays in
                  component memory for this tab only, is never written to cookies
                  or storage, and is cleared right after pushing.
                </p>

                <a
                  href="https://docs.github.com/en/site-policy/privacy-policies/github-general-privacy-statement"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex w-fit items-center gap-1.5 rounded-[6px] py-0.5 text-[13px] font-medium text-[var(--tide)] underline underline-offset-4 hover:opacity-85"
                >
                  <span>GitHub privacy statement</span>
                  <ExternalLink className="size-3.5" />
                </a>
              </div>
            </StudioSectionCard>

            <StudioSectionCard title="What happens next">
              <ol className="flex flex-col gap-3.5 text-[13px] leading-5 text-[var(--text-2)]">
                <li className="flex items-start gap-3">
                  <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-[var(--surface-2)] text-[12px] font-semibold text-[var(--text)]">
                    1
                  </span>
                  <span>
                    GitHub displays the updated README on your profile within
                    about a minute.
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-[var(--surface-2)] text-[12px] font-semibold text-[var(--text)]">
                    2
                  </span>
                  <span>
                    If the midnight action is enabled, GitHub Actions updates
                    your creature automatically every day.
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-[var(--surface-2)] text-[12px] font-semibold text-[var(--text)]">
                    3
                  </span>
                  <span>
                    Come back to {BRAND.name} anytime and connect your username
                    to load and edit your saved setup.
                  </span>
                </li>
              </ol>
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
