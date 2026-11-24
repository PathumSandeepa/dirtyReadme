"use client";

import { useEffect, useMemo, useState } from "react";
import {
  AlertCircle,
  AlertTriangle,
  ArrowLeft,
  BookOpen,
  Check,
  CheckCircle2,
  ChevronDown,
  Copy,
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
  formatNextRunLocal,
  generateCreatureConfigJson,
  generateEvolveScriptMjs,
  generateEvolveWorkflowYaml,
  getDailyCronForTimeZone,
  getSupportedTimeZones,
  hasDaylightSavingTime,
} from "@/domain/automation/workflowService";
import type { CreatureConfig } from "@/domain/creature/entities";
import { getSpriteKey } from "@/domain/creature/services";
import type {
  CustomImageMemoryAsset,
  ReadmeConfig,
} from "@/domain/profile/entities";
import {
  blobToBase64,
  copyToClipboard,
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
import { StudioDialog } from "../studio/ui/StudioDialog";
import { StudioField, StudioInput } from "../studio/ui/StudioInput";
import { StudioSegmentedControl } from "../studio/ui/StudioSegmentedControl";
import { StudioSwitchRow } from "../studio/ui/StudioSwitchRow";
import { AdvancedMarkdownPreview } from "./MarkdownPreviewRenderer";
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

const DEFAULT_COMMIT_MESSAGE = "Update README with DirtyReadme";
const MINUTE_OPTIONS = [0, 15, 30, 45];
const HOUR_OPTIONS = Array.from({ length: 24 }, (_, index) => index);
const TIME_PRESETS = [
  { label: "Midnight", hour: 0, minute: 0 },
  { label: "6 AM", hour: 6, minute: 0 },
  { label: "Noon", hour: 12, minute: 0 },
  { label: "6 PM", hour: 18, minute: 0 },
] as const;

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

function formatHourMinute(hour: number, minute: number): string {
  return `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`;
}

interface NumberedPublishCardProps {
  number: number;
  title: string;
  help: string;
  headerAction?: React.ReactNode;
  children: React.ReactNode;
}

function NumberedPublishCard({
  number,
  title,
  help,
  headerAction,
  children,
}: NumberedPublishCardProps) {
  return (
    <section className="flex flex-col gap-5 rounded-[12px] bg-[var(--surface)] p-6 sm:p-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex items-start gap-4">
          <span className="flex size-10 shrink-0 items-center justify-center rounded-[10px] bg-[var(--surface-2)] text-[18px] font-semibold text-[var(--text)] tabular-nums">
            {number}
          </span>
          <div className="flex flex-col gap-1">
            <h2 className="text-[18px] leading-6 font-semibold tracking-[-0.02em] text-[var(--text)]">
              {title}
            </h2>
            <p className="text-[13px] leading-5 text-[var(--text-2)]">{help}</p>
          </div>
        </div>
        {headerAction}
      </div>

      <div className="flex flex-col gap-5">{children}</div>
    </section>
  );
}

/**
 * Step 4 Publish screen with 4 numbered sections, sticky summary column, daily schedule, and local downloads.
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
  const [commitMessage, setCommitMessage] = useState(DEFAULT_COMMIT_MESSAGE);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewMode, setPreviewMode] = useState<"visual" | "markdown">(
    "visual"
  );

  const [includeWorkflowFiles, setIncludeWorkflowFiles] = useState(false);
  const [scheduleHour, setScheduleHour] = useState(0);
  const [scheduleMinute, setScheduleMinute] = useState(0);
  const [selectedTimeZone, setSelectedTimeZone] = useState(() => {
    try {
      return Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";
    } catch {
      return "UTC";
    }
  });
  const [timeZoneFilter, setTimeZoneFilter] = useState("");
  const [workflowPreviewOpen, setWorkflowPreviewOpen] = useState(false);
  const [copiedId, setCopiedId] = useState<"cron" | "yaml" | "readme" | null>(
    null
  );

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

  const includesCreatureBinary =
    (readmeConfig.showCreatureBanner !== false &&
      readmeConfig.bannerSource !== "custom-image") ||
    readmeMarkdown.includes("creature.webp");

  const effectiveDailyUpdate = includesCreatureBinary && includeWorkflowFiles;

  const allTimeZones = useMemo(() => {
    const supported = getSupportedTimeZones();
    if (!supported.includes(selectedTimeZone)) {
      return [selectedTimeZone, ...supported];
    }
    return supported;
  }, [selectedTimeZone]);

  const filteredTimeZones = useMemo(() => {
    const query = timeZoneFilter.trim().toLowerCase();
    if (!query) return allTimeZones;
    const matches = allTimeZones.filter((tz) =>
      tz.toLowerCase().includes(query)
    );
    if (matches.length > 0 && !matches.includes(selectedTimeZone)) {
      return [selectedTimeZone, ...matches];
    }
    return matches;
  }, [allTimeZones, timeZoneFilter, selectedTimeZone]);

  const cronInfo = useMemo(
    () =>
      getDailyCronForTimeZone(scheduleHour, scheduleMinute, selectedTimeZone),
    [scheduleHour, scheduleMinute, selectedTimeZone]
  );

  const nextRunLabel = useMemo(
    () => formatNextRunLocal(scheduleHour, scheduleMinute, selectedTimeZone),
    [scheduleHour, scheduleMinute, selectedTimeZone]
  );

  const usesDst = useMemo(
    () => hasDaylightSavingTime(selectedTimeZone),
    [selectedTimeZone]
  );

  const configJson = useMemo(
    () => generateCreatureConfigJson(creatureConfig, readmeConfig),
    [creatureConfig, readmeConfig]
  );

  const workflowYaml = useMemo(
    () =>
      effectiveDailyUpdate
        ? generateEvolveWorkflowYaml(creatureConfig, cronInfo.cron)
        : "",
    [effectiveDailyUpdate, creatureConfig, cronInfo.cron]
  );

  const evolveScript = useMemo(
    () =>
      effectiveDailyUpdate
        ? generateEvolveScriptMjs(creatureConfig, readmeConfig)
        : "",
    [effectiveDailyUpdate, creatureConfig, readmeConfig]
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
      items.push({
        path: "share-card.png",
        size: "1280 by 640 PNG",
        kind: "image",
      });
    }

    if (effectiveDailyUpdate) {
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
    effectiveDailyUpdate,
    workflowYaml,
    evolveScript,
  ]);

  const handleCopyText = async (
    target: "cron" | "yaml" | "readme",
    text: string
  ) => {
    await copyToClipboard(text);
    setCopiedId(target);
    window.setTimeout(() => {
      setCopiedId((curr) => (curr === target ? null : curr));
    }, 1800);
  };

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

      if (effectiveDailyUpdate) {
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
    ...(effectiveDailyUpdate
      ? [
          {
            id: "adding-workflow" as const,
            label: "Adding workflow files",
          },
        ]
      : []),
    { id: "committing", label: "Creating commit on branch" },
  ];

  const handlePush = async (event?: React.FormEvent) => {
    event?.preventDefault();
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
        effectiveDailyUpdate ||
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
          message: commitMessage.trim() || DEFAULT_COMMIT_MESSAGE,
        },
        {
          path: "creature-config.json",
          content: configJson,
          message: `ci: save ${BRAND.name} profile configuration`,
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

      if (effectiveDailyUpdate) {
        const spritePngBase64 = await fetchSpritePngBase64(spriteKey);
        files.push(
          {
            path: "assets/creature-sprite.png",
            base64Content: spritePngBase64,
            message: "ci: store base pixel creature sprite for daily updates",
          },
          {
            path: ".github/workflows/evolve-creature.yml",
            content: workflowYaml,
            message: "ci: add daily auto evolve workflow",
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
        commitMessage: commitMessage.trim() || DEFAULT_COMMIT_MESSAGE,
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

  const renderPushButton = (fullWidth = false) => (
    <StudioButton
      type="submit"
      variant="primary"
      size="lg"
      disabled={pushLoading || !tokenValid}
      className={fullWidth ? "w-full" : undefined}
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

  const classicCreateUrl = `https://github.com/settings/tokens/new?description=dirtyreadme&scopes=${effectiveDailyUpdate ? "repo,workflow" : "repo"}`;

  const tokenStatusLabel = !trimmedToken
    ? "Token not added"
    : tokenValid
      ? "Token format looks good"
      : "Check token prefix";

  const dailySummaryLabel = effectiveDailyUpdate
    ? `Every day at ${formatHourMinute(scheduleHour, scheduleMinute)} ${selectedTimeZone}, next run ${nextRunLabel}`
    : "Off";

  return (
    <TooltipProvider delay={150}>
      <div className="mx-auto flex w-full max-w-[1120px] flex-col gap-8 px-4 py-10 sm:px-6 sm:py-12">
        {/* Page Header */}
        <div className="flex flex-col gap-3">
          <h1 className="text-[28px] leading-[1.18] font-semibold tracking-[-0.025em] text-[var(--text)] sm:text-[32px]">
            Publish your README
          </h1>
          <div className="flex flex-wrap items-center gap-3">
            <a
              href={repoUrl}
              target="_blank"
              rel="noreferrer"
              className="studio-mono inline-flex w-fit items-center gap-1.5 rounded-[8px] bg-[var(--surface-2)] px-3 py-1 text-[13px] font-medium text-[var(--text)] transition-colors duration-150 hover:bg-[var(--surface-3)] hover:text-[var(--tide)]"
            >
              <span>{repoPath}</span>
              <ExternalLink className="size-3.5 text-[var(--text-2)]" />
            </a>
            <span className="text-[14px] text-[var(--text-2)]">
              Commit directly from your browser using a temporary GitHub token.
            </span>
          </div>
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
                was not detected yet. Create it on GitHub or check again before
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
                <span>Check again</span>
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

        {/* Two columns: 680px main and sticky 360px summary */}
        <form
          id="publish-form"
          onSubmit={handlePush}
          className="grid items-start gap-8 lg:grid-cols-[minmax(0,680px)_360px] lg:justify-between"
        >
          {/* Left Main Column */}
          <div className="flex flex-col gap-6">
            {/* Section 1: Review */}
            <NumberedPublishCard
              number={1}
              title="Review"
              help="Check the files, commit message and branch before pushing."
              headerAction={
                <span className="studio-mono inline-flex shrink-0 items-center rounded-[8px] bg-[var(--surface-2)] px-3 py-1 text-[12px] font-medium whitespace-nowrap text-[var(--text)]">
                  Branch {resolvedBranch || "main"}
                </span>
              }
            >
              <ul className="flex flex-col gap-1.5 rounded-[10px] bg-[var(--surface-2)] p-2">
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
                      className="flex items-center justify-between gap-3 rounded-[8px] bg-[var(--surface)] px-3.5 py-2.5 text-[13px]"
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

              <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
                <div className="flex-1">
                  <StudioField
                    label="Commit message"
                    htmlFor="publish-commit-message"
                  >
                    <StudioInput
                      id="publish-commit-message"
                      value={commitMessage}
                      onChange={(e) => setCommitMessage(e.target.value)}
                      placeholder={DEFAULT_COMMIT_MESSAGE}
                    />
                  </StudioField>
                </div>

                <StudioButton
                  type="button"
                  variant="secondary"
                  onClick={() => setPreviewOpen(true)}
                >
                  <Eye />
                  <span>Preview README</span>
                </StudioButton>
              </div>
            </NumberedPublishCard>

            {/* Section 2: Token */}
            <NumberedPublishCard
              number={2}
              title="Token"
              help="Create and paste a temporary GitHub token with write access."
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
                      {effectiveDailyUpdate && (
                        <span className="studio-mono inline-flex items-center gap-1.5 rounded-[8px] bg-[var(--tide-soft)] px-3 py-1.5 font-medium text-[var(--tide)]">
                          <Check className="size-3.5" />
                          <span>workflow</span>
                        </span>
                      )}
                    </div>
                    {!effectiveDailyUpdate && (
                      <p className="text-[12px] text-[var(--text-2)]">
                        Only repo is needed while daily update is off.
                      </p>
                    )}
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <a
                      href={classicCreateUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex h-9 items-center gap-2 rounded-[8px] bg-[var(--surface)] px-3.5 text-[13px] font-medium text-[var(--text)] transition-colors duration-150 hover:bg-[var(--surface-3)]"
                    >
                      <span>Create classic token</span>
                      <ExternalLink className="size-3.5 text-[var(--text-2)]" />
                    </a>

                    <StudioButton
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => setTokenGuideOpen(true)}
                    >
                      <BookOpen />
                      <span>Step by step guide</span>
                    </StudioButton>
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
                      <span className="studio-mono inline-flex items-center rounded-[8px] bg-[var(--surface)] px-3 py-1.5 text-[var(--text-2)]">
                        Metadata read only
                      </span>
                      {effectiveDailyUpdate && (
                        <span className="studio-mono inline-flex items-center gap-1.5 rounded-[8px] bg-[var(--tide-soft)] px-3 py-1.5 font-medium text-[var(--tide)]">
                          <Check className="size-3.5" />
                          <span>Workflows read and write</span>
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <a
                      href="https://github.com/settings/personal-access-tokens/new"
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex h-9 items-center gap-2 rounded-[8px] bg-[var(--surface)] px-3.5 text-[13px] font-medium text-[var(--text)] transition-colors duration-150 hover:bg-[var(--surface-3)]"
                    >
                      <span>Create fine grained token</span>
                      <ExternalLink className="size-3.5 text-[var(--text-2)]" />
                    </a>

                    <StudioButton
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => setTokenGuideOpen(true)}
                    >
                      <BookOpen />
                      <span>Step by step guide</span>
                    </StudioButton>
                  </div>
                </div>
              )}

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
                          aria-label={showToken ? "Hide token" : "Show token"}
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
                    <span>Token format looks good.</span>
                  </p>
                )}
              </StudioField>
            </NumberedPublishCard>

            {/* Section 3: Daily update (optional) */}
            <NumberedPublishCard
              number={3}
              title="Daily update"
              help="Optional GitHub Action that refreshes your creature image and stats."
            >
              {!includesCreatureBinary ? (
                <div className="flex flex-wrap items-center justify-between gap-4 rounded-[10px] bg-[var(--surface-2)] p-4">
                  <p className="text-[13px] leading-5 text-[var(--text-2)]">
                    Turn on the creature in the editor to use daily updates.
                  </p>
                  <StudioButton
                    type="button"
                    variant="secondary"
                    size="sm"
                    onClick={onBack}
                  >
                    <span>Open editor</span>
                  </StudioButton>
                </div>
              ) : (
                <>
                  <StudioSwitchRow
                    id="daily-update-check"
                    checked={includeWorkflowFiles}
                    onCheckedChange={setIncludeWorkflowFiles}
                    label="Update my README every day"
                    description="Adds a GitHub Actions workflow that regenerates creature.webp on schedule."
                  />

                  {hasLegacyWorkflow && !includeWorkflowFiles && (
                    <div className="flex items-start gap-2.5 rounded-[10px] bg-[var(--warning-soft)] px-4 py-3 text-[13px] leading-5 text-[var(--text)]">
                      <AlertCircle className="mt-0.5 size-4 shrink-0 text-[var(--warning)]" />
                      <span>
                        An older{" "}
                        <code className="studio-mono">evolve-creature.yml</code>{" "}
                        was detected in{" "}
                        <code className="studio-mono">{repoPath}</code>. Turn on
                        daily update above with workflow permission to upgrade
                        it.
                      </span>
                    </div>
                  )}

                  {includeWorkflowFiles && (
                    <div className="flex flex-col gap-5 rounded-[10px] bg-[var(--surface-2)] p-4">
                      {/* Time of day */}
                      <div className="flex flex-col gap-2.5">
                        <span className="text-[13px] font-medium text-[var(--text)]">
                          Time of day
                        </span>

                        <div className="flex flex-wrap items-center gap-2">
                          <label className="sr-only" htmlFor="schedule-hour">
                            Hour
                          </label>
                          <select
                            id="schedule-hour"
                            value={scheduleHour}
                            onChange={(e) =>
                              setScheduleHour(Number(e.target.value))
                            }
                            className="h-9 rounded-[8px] bg-[var(--surface)] px-3 text-[13px] font-medium text-[var(--text)] outline-none"
                          >
                            {HOUR_OPTIONS.map((hour) => (
                              <option key={hour} value={hour}>
                                {String(hour).padStart(2, "0")}
                              </option>
                            ))}
                          </select>

                          <span className="text-[13px] font-semibold text-[var(--text-2)]">
                            :
                          </span>

                          <label className="sr-only" htmlFor="schedule-minute">
                            Minute
                          </label>
                          <select
                            id="schedule-minute"
                            value={scheduleMinute}
                            onChange={(e) =>
                              setScheduleMinute(Number(e.target.value))
                            }
                            className="h-9 rounded-[8px] bg-[var(--surface)] px-3 text-[13px] font-medium text-[var(--text)] outline-none"
                          >
                            {MINUTE_OPTIONS.map((minute) => (
                              <option key={minute} value={minute}>
                                {String(minute).padStart(2, "0")}
                              </option>
                            ))}
                          </select>

                          <div className="flex flex-wrap gap-1.5 sm:ml-2">
                            {TIME_PRESETS.map((preset) => {
                              const isSelected =
                                scheduleHour === preset.hour &&
                                scheduleMinute === preset.minute;
                              return (
                                <button
                                  key={preset.label}
                                  type="button"
                                  onClick={() => {
                                    setScheduleHour(preset.hour);
                                    setScheduleMinute(preset.minute);
                                  }}
                                  className={cn(
                                    "h-8 cursor-pointer rounded-[8px] px-3 text-[12px] font-medium transition-colors outline-none",
                                    isSelected
                                      ? "bg-[var(--surface-3)] text-[var(--text)]"
                                      : "bg-[var(--surface)] text-[var(--text-2)] hover:bg-[var(--surface-3)] hover:text-[var(--text)]"
                                  )}
                                >
                                  {preset.label}
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      </div>

                      {/* Time zone */}
                      <div className="flex flex-col gap-2">
                        <label
                          htmlFor="schedule-timezone-search"
                          className="text-[13px] font-medium text-[var(--text)]"
                        >
                          Time zone
                        </label>
                        <div className="grid gap-2 sm:grid-cols-2">
                          <StudioInput
                            id="schedule-timezone-search"
                            value={timeZoneFilter}
                            onChange={(e) => setTimeZoneFilter(e.target.value)}
                            placeholder="Filter time zones..."
                            aria-label="Filter time zones"
                          />
                          <select
                            aria-label="Select time zone"
                            value={selectedTimeZone}
                            onChange={(e) =>
                              setSelectedTimeZone(e.target.value)
                            }
                            className="h-9 rounded-[8px] bg-[var(--surface)] px-3 text-[13px] text-[var(--text)] outline-none"
                          >
                            {filteredTimeZones.map((tz) => (
                              <option key={tz} value={tz}>
                                {tz}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>

                      {/* Live UTC conversion and cron */}
                      <div className="flex flex-col gap-2 rounded-[8px] bg-[var(--surface)] p-3.5">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <span className="text-[13px] font-medium text-[var(--text)]">
                            In UTC this runs at {cronInfo.utcTimeLabel}
                          </span>
                          <div className="flex items-center gap-2">
                            <code className="studio-mono rounded-[6px] bg-[var(--surface-2)] px-2.5 py-1 text-[12px] text-[var(--text)]">
                              {cronInfo.cron}
                            </code>
                            <StudioButton
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() =>
                                handleCopyText("cron", cronInfo.cron)
                              }
                            >
                              {copiedId === "cron" ? <Check /> : <Copy />}
                              <span>
                                {copiedId === "cron" ? "Copied" : "Copy"}
                              </span>
                            </StudioButton>
                          </div>
                        </div>

                        <p className="text-[13px] text-[var(--text-2)]">
                          Next run: {nextRunLabel}
                        </p>

                        <p className="text-[12px] leading-5 text-[var(--text-2)]">
                          GitHub schedules use UTC and runs can start a few
                          minutes late.
                          {usesDst
                            ? " The local time shifts by one hour when daylight saving changes."
                            : ""}
                        </p>
                      </div>

                      {/* Preview workflow file */}
                      <div className="flex flex-col gap-2">
                        <div className="flex items-center justify-between gap-2">
                          <button
                            type="button"
                            onClick={() =>
                              setWorkflowPreviewOpen((prev) => !prev)
                            }
                            className="inline-flex cursor-pointer items-center gap-1.5 text-[13px] font-medium text-[var(--text)] transition-opacity hover:opacity-80"
                          >
                            <ChevronDown
                              className={cn(
                                "size-4 transition-transform duration-150",
                                workflowPreviewOpen && "rotate-180"
                              )}
                            />
                            <span>Preview workflow file</span>
                          </button>

                          {workflowPreviewOpen && (
                            <StudioButton
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() =>
                                handleCopyText("yaml", workflowYaml)
                              }
                            >
                              {copiedId === "yaml" ? <Check /> : <Copy />}
                              <span>
                                {copiedId === "yaml" ? "Copied" : "Copy YAML"}
                              </span>
                            </StudioButton>
                          )}
                        </div>

                        {workflowPreviewOpen && (
                          <pre className="studio-mono max-h-64 overflow-auto rounded-[8px] bg-[var(--surface)] p-3.5 text-[12px] leading-5 text-[var(--text)]">
                            <code>{workflowYaml}</code>
                          </pre>
                        )}
                      </div>
                    </div>
                  )}
                </>
              )}
            </NumberedPublishCard>

            {/* Section 4: Publish */}
            <NumberedPublishCard
              number={4}
              title="Publish"
              help="Push all selected files to your profile repository."
            >
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
                        to <code className="studio-mono">{repoPath}</code>. Your
                        token was cleared from memory.
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
                    <StudioButton
                      type="button"
                      variant="secondary"
                      onClick={onBack}
                    >
                      <span>Back to editor</span>
                    </StudioButton>
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
                  <span>Back to editor</span>
                </StudioButton>

                {!tokenValid && !pushLoading ? (
                  <Tooltip>
                    <TooltipTrigger
                      render={
                        <span tabIndex={0} className="inline-flex">
                          {renderPushButton(false)}
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
                  renderPushButton(false)
                )}
              </div>
            </NumberedPublishCard>

            {/* Secondary: Prefer to do it yourself */}
            <section className="flex flex-col gap-5 rounded-[12px] bg-[var(--surface)] p-6 sm:p-8">
              <div className="flex flex-col gap-1">
                <h2 className="text-[18px] leading-6 font-semibold tracking-[-0.02em] text-[var(--text)]">
                  Prefer to do it yourself
                </h2>
                <p className="text-[13px] leading-5 text-[var(--text-2)]">
                  Download the generated files or zip archive and commit them
                  manually.
                </p>
              </div>

              <div className="flex flex-wrap gap-2">
                <StudioButton
                  type="button"
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
                    type="button"
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
                    type="button"
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
                    type="button"
                    variant="secondary"
                    onClick={() => downloadBlobFile(img.filename, img.webpBlob)}
                  >
                    <Download />
                    <span>Download {img.repoPath}</span>
                  </StudioButton>
                ))}

                <StudioButton
                  type="button"
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
            </section>
          </div>

          {/* Right Sticky Summary Column */}
          <aside className="flex flex-col gap-6 lg:sticky lg:top-[116px] lg:self-start">
            <section className="flex flex-col gap-5 rounded-[12px] bg-[var(--surface)] p-6">
              <div className="flex flex-col gap-1">
                <h2 className="text-[16px] leading-6 font-semibold tracking-[-0.015em] text-[var(--text)]">
                  Publish summary
                </h2>
                <p className="studio-mono text-[12px] text-[var(--text-2)]">
                  {repoPath} on {resolvedBranch || "main"}
                </p>
              </div>

              <div className="flex flex-col gap-2">
                <span className="text-[12px] font-medium text-[var(--text-2)]">
                  Files
                </span>
                <ul className="flex flex-col gap-1.5">
                  {commitFiles.map((file) => (
                    <li
                      key={file.path}
                      className="flex items-center justify-between gap-2 rounded-[8px] bg-[var(--surface-2)] px-3 py-2 text-[12px]"
                    >
                      <span className="studio-mono truncate text-[var(--text)]">
                        {file.path}
                      </span>
                      <span className="studio-mono shrink-0 text-[var(--text-2)] tabular-nums">
                        {file.size}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="flex flex-col gap-2.5 rounded-[10px] bg-[var(--surface-2)] p-3.5 text-[12px]">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[var(--text-2)]">Token</span>
                  <span
                    className={cn(
                      "font-medium",
                      tokenValid ? "text-[var(--tide)]" : "text-[var(--text)]"
                    )}
                  >
                    {tokenStatusLabel}
                  </span>
                </div>
                <div className="flex items-start justify-between gap-3">
                  <span className="shrink-0 text-[var(--text-2)]">
                    Daily update
                  </span>
                  <span className="text-right font-medium text-[var(--text)]">
                    {dailySummaryLabel}
                  </span>
                </div>
              </div>

              {!tokenValid && !pushLoading ? (
                <Tooltip>
                  <TooltipTrigger
                    render={
                      <span tabIndex={0} className="inline-flex w-full">
                        {renderPushButton(true)}
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
                renderPushButton(true)
              )}
            </section>

            <section className="flex flex-col gap-3 rounded-[12px] bg-[var(--surface)] p-6">
              <div className="flex items-center gap-2 text-[14px] font-semibold text-[var(--text)]">
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
            </section>

            <section className="flex flex-col gap-4 rounded-[12px] bg-[var(--surface)] p-6">
              <h3 className="text-[15px] font-semibold text-[var(--text)]">
                What happens next
              </h3>
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
                    If daily update is on, GitHub Actions refreshes your
                    creature automatically on schedule.
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
            </section>
          </aside>
        </form>

        {/* Preview README Dialog */}
        <StudioDialog
          open={previewOpen}
          onOpenChange={setPreviewOpen}
          title="Preview README"
          description={`Rendered preview for ${repoPath}`}
          maxWidthClass="sm:max-w-4xl"
          footer={
            <div className="flex w-full items-center justify-between gap-2">
              <StudioButton
                type="button"
                variant="secondary"
                size="sm"
                onClick={() => handleCopyText("readme", readmeMarkdown)}
              >
                {copiedId === "readme" ? <Check /> : <Copy />}
                <span>{copiedId === "readme" ? "Copied" : "Copy markdown"}</span>
              </StudioButton>
              <StudioButton
                type="button"
                variant="primary"
                onClick={() => setPreviewOpen(false)}
              >
                Done
              </StudioButton>
            </div>
          }
        >
          <div className="flex flex-col gap-4">
            <StudioSegmentedControl<"visual" | "markdown">
              ariaLabel="README preview mode"
              value={previewMode}
              onChange={setPreviewMode}
              options={[
                { value: "visual", label: "Visual" },
                { value: "markdown", label: "Markdown" },
              ]}
            />

            {previewMode === "visual" ? (
              <div
                data-gh-theme="light"
                className="rounded-[12px] bg-[var(--gh-bg)] p-5"
              >
                <AdvancedMarkdownPreview
                  markdown={readmeMarkdown}
                  isDark={false}
                />
              </div>
            ) : (
              <pre className="studio-mono max-h-[55vh] overflow-auto rounded-[12px] bg-[var(--surface-2)] p-4 text-[12px] leading-5 text-[var(--text)]">
                <code>{readmeMarkdown}</code>
              </pre>
            )}
          </div>
        </StudioDialog>

        <TokenGuideDialog
          open={tokenGuideOpen}
          onClose={() => setTokenGuideOpen(false)}
          username={username}
          includeWorkflowFiles={effectiveDailyUpdate}
        />
      </div>
    </TooltipProvider>
  );
}
