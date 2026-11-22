"use client";

import { useMemo, useRef, useState } from "react";
import {
  ArrowDown,
  ArrowUp,
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  GripVertical,
  LayoutGrid,
  Plus,
  RefreshCw,
  Search,
  Trash2,
  Undo2,
  X,
} from "lucide-react";
import { cn } from "cn";
import type { CreatureConfig } from "@/domain/creature/entities";
import {
  CTA_QUICK_TEMPLATES,
  DYNAMIC_TOKENS,
  README_TEMPLATES,
  TECH_CATEGORIES_ORDER,
  TECH_CATEGORY_LABELS,
  type ReadmeBadge,
  type ReadmeConfig,
  type ReadmeTemplateId,
  type TechCategory,
} from "@/domain/profile/entities";
import {
  DEFAULT_PLATFORM_ICON_ID,
  detectPlatformFromUrl,
} from "@/domain/profile/platformIcons";
import {
  buildActionLinkBadgeUrl,
  buildGeneratedReadmeMarkdown,
  buildShieldBadgeUrl,
  reorderItems,
} from "@/domain/profile/readmeService";
import { Switch } from "@/components/ui/switch";
import { StudioButton } from "../studio/ui/StudioButton";
import { StudioColorSwatch } from "../studio/ui/StudioColorSwatch";
import {
  StudioField,
  StudioInput,
  StudioSelect,
} from "../studio/ui/StudioInput";
import { type ReadmeZoomMode } from "../studio/ui/ScaledReadmeViewport";
import { StudioSegmentedControl } from "../studio/ui/StudioSegmentedControl";
import { StudioSliderField } from "../studio/ui/StudioSliderField";
import { StudioSwitchRow } from "../studio/ui/StudioSwitchRow";
import { AdvancedMarkdownEditor } from "./AdvancedMarkdownEditor";
import {
  PlatformIconGlyph,
  PlatformIconPickerButton,
} from "./PlatformIconPickerButton";
import type { PreviewRegion } from "./PreviewWorkspace";

export type ReadmeAccordionSection = 1 | 2 | 3 | 4 | 5;

interface ProfileReadmeStepPanelProps {
  creatureConfig: CreatureConfig;
  readmeConfig: ReadmeConfig;
  githubTheme: "light" | "dark";
  zoomMode: ReadmeZoomMode;
  sharedFitZoom?: number;
  onMeasureFitZoom?: (zoom: number) => void;
  onSectionFocus: (region: PreviewRegion) => void;
  onFieldEdited: (region: PreviewRegion) => void;
  onUpdateField: <K extends keyof ReadmeConfig>(
    key: K,
    value: ReadmeConfig[K]
  ) => void;
  onSelectTemplate: (templateId: ReadmeTemplateId) => void;
  onChangeRawMarkdown: (raw: string | null) => void;
  onAddBadgeToCard: (
    cardId: string,
    badgeId: string,
    beforeBadgeId?: string
  ) => void;
  onRemoveBadgeFromCard: (cardId: string, badgeId: string) => void;
  onMoveBadgeAcrossCards: (
    badgeId: string,
    fromCardId: string,
    toCardId: string,
    targetBadgeId?: string
  ) => void;
  onAddStackCard: (title?: string) => string;
  onRenameStackCard: (cardId: string, title: string) => void;
  onToggleStackCardVisibility: (cardId: string, visible: boolean) => void;
  onDeleteStackCard: (cardId: string) => void;
  onReorderStackCards: (fromIdx: number, toIdx: number) => void;
  onCombineStackCards: () => void;
  onUndoCombineStackCards: () => void;
  onAddCustomBadgeToCard: (
    cardId: string,
    badge: Omit<ReadmeBadge, "enabled">
  ) => void;
}

type CategoryFilter = "all" | TechCategory;

interface DragPayload {
  badgeId: string;
  fromCardId: string | null;
}

const QUICK_ADD_PLATFORMS: {
  label: string;
  template: (typeof CTA_QUICK_TEMPLATES)[number];
}[] = [
  { label: "Medium", template: CTA_QUICK_TEMPLATES[0] },
  { label: "Hashnode", template: CTA_QUICK_TEMPLATES[1] },
  { label: "Substack", template: CTA_QUICK_TEMPLATES[2] },
  { label: "Dev.to", template: CTA_QUICK_TEMPLATES[3] },
  { label: "LinkedIn", template: CTA_QUICK_TEMPLATES[4] },
  { label: "X", template: CTA_QUICK_TEMPLATES[5] },
  { label: "YouTube", template: CTA_QUICK_TEMPLATES[6] },
  { label: "Discord", template: CTA_QUICK_TEMPLATES[7] },
  { label: "Email", template: CTA_QUICK_TEMPLATES[8] },
  { label: "Portfolio", template: CTA_QUICK_TEMPLATES[9] },
  { label: "Sponsor", template: CTA_QUICK_TEMPLATES[10] },
];

function normalizeActionUrl(raw: string): string {
  const trimmed = raw.trim();
  if (!trimmed) return "";
  if (
    /^https?:\/\//i.test(trimmed) ||
    /^mailto:/i.test(trimmed) ||
    trimmed.startsWith("#") ||
    trimmed.startsWith("/")
  ) {
    return trimmed;
  }
  return `https://${trimmed}`;
}

function validateLinkUrl(raw: string): string | null {
  const trimmed = raw.trim();
  if (!trimmed) return "URL is required.";
  if (/^mailto:/i.test(trimmed)) {
    const addr = trimmed.slice(7);
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(addr)
      ? null
      : "Enter a valid mailto email (for example mailto:you@domain.com).";
  }
  if (trimmed.startsWith("#") || trimmed.startsWith("/")) return null;
  if (/^javascript:/i.test(trimmed) || /^data:/i.test(trimmed)) {
    return "Use an https:// or mailto: URL.";
  }
  try {
    const candidate = /^https?:\/\//i.test(trimmed)
      ? trimmed
      : `https://${trimmed}`;
    const u = new URL(candidate);
    if (!u.hostname || (!u.hostname.includes(".") && !trimmed.includes("{{"))) {
      return "Enter a valid web address (for example https://github.com/user).";
    }
    return null;
  } catch {
    return "Enter a valid URL starting with https:// or mailto:.";
  }
}

function StructurePresetWireframe({ id }: { id: ReadmeTemplateId }) {
  if (id === "minimal-header") {
    return (
      <div className="flex h-16 w-24 shrink-0 flex-col justify-center gap-1.5 rounded-[4px] border border-[var(--border)] bg-[var(--surface-2)] p-2">
        <div className="h-2 w-12 rounded-[2px] bg-[var(--border-strong)]" />
        <div className="h-1.5 w-full rounded-[2px] bg-[var(--border)]" />
        <div className="mt-1 h-5 w-full rounded-[2px] bg-[var(--accent-soft)] border border-[var(--accent)]/40" />
      </div>
    );
  }
  if (id === "auto-evolve-block") {
    return (
      <div className="flex h-16 w-24 shrink-0 flex-col items-center justify-center gap-1.5 rounded-[4px] border border-[var(--border)] bg-[var(--surface-2)] p-2">
        <div className="h-1 w-14 rounded-[2px] bg-[var(--border)]" />
        <div className="h-7 w-full rounded-[2px] border border-[var(--accent)]/40 bg-[var(--accent-soft)]" />
        <div className="h-1 w-14 rounded-[2px] bg-[var(--border)]" />
      </div>
    );
  }
  if (id === "telemetry-stats") {
    return (
      <div className="flex h-16 w-24 shrink-0 flex-col justify-between rounded-[4px] border border-[var(--border)] bg-[var(--surface-2)] p-1.5">
        <div className="h-1.5 w-10 rounded-[2px] bg-[var(--border-strong)]" />
        <div className="h-4 w-full rounded-[2px] border border-[var(--accent)]/40 bg-[var(--accent-soft)]" />
        <div className="grid grid-cols-2 gap-1">
          <div className="h-3 rounded-[2px] bg-[var(--border)]" />
          <div className="h-3 rounded-[2px] bg-[var(--border)]" />
        </div>
      </div>
    );
  }
  return (
    <div className="flex h-16 w-24 shrink-0 flex-col justify-between rounded-[4px] border border-[var(--border)] bg-[var(--surface-2)] p-1.5">
      <div className="flex flex-col gap-0.5">
        <div className="h-1.5 w-11 rounded-[2px] bg-[var(--border-strong)]" />
        <div className="h-1 w-full rounded-[2px] bg-[var(--border)]" />
      </div>
      <div className="flex gap-1">
        <div className="h-1.5 w-4 rounded-[2px] bg-[var(--border-strong)]" />
        <div className="h-1.5 w-4 rounded-[2px] bg-[var(--border-strong)]" />
        <div className="h-1.5 w-4 rounded-[2px] bg-[var(--border-strong)]" />
      </div>
      <div className="h-4 w-full rounded-[2px] border border-[var(--accent)]/40 bg-[var(--accent-soft)]" />
    </div>
  );
}

export function ProfileReadmeStepPanel({
  creatureConfig,
  readmeConfig,
  githubTheme,
  zoomMode,
  sharedFitZoom,
  onMeasureFitZoom,
  onSectionFocus,
  onFieldEdited,
  onUpdateField,
  onSelectTemplate,
  onChangeRawMarkdown,
  onAddBadgeToCard,
  onRemoveBadgeFromCard,
  onMoveBadgeAcrossCards,
  onAddStackCard,
  onRenameStackCard,
  onToggleStackCardVisibility,
  onDeleteStackCard,
  onReorderStackCards,
  onCombineStackCards,
  onUndoCombineStackCards,
  onAddCustomBadgeToCard,
}: ProfileReadmeStepPanelProps) {
  const nextIdRef = useRef(1);
  const customLinkInputRef = useRef<HTMLInputElement | null>(null);

  const [openSection, setOpenSection] = useState<ReadmeAccordionSection>(1);

  // Section 2 state
  const [badgeCategory, setBadgeCategory] = useState<CategoryFilter>("all");
  const [badgeSearch, setBadgeSearch] = useState("");
  const [selectedCardId, setSelectedCardId] = useState<string>(
    readmeConfig.stackCards[0]?.id ?? ""
  );
  const [dragPayload, setDragPayload] = useState<DragPayload | null>(null);
  const [dropCardId, setDropCardId] = useState<string | null>(null);
  const [dragOverChip, setDragOverChip] = useState<{
    cardId: string;
    badgeId: string;
  } | null>(null);

  const [newBadgeLabel, setNewBadgeLabel] = useState("");
  const [newBadgeLogo, setNewBadgeLogo] = useState("");
  const [newBadgeColor, setNewBadgeColor] = useState("#0F766E");
  const [newBadgeError, setNewBadgeError] = useState<string | null>(null);

  // Section 3 state
  const [newLinkLabel, setNewLinkLabel] = useState("");
  const [newLinkText, setNewLinkText] = useState("");
  const [newLinkUrl, setNewLinkUrl] = useState("");
  const [newLinkLogo, setNewLinkLogo] = useState(DEFAULT_PLATFORM_ICON_ID);
  const [newLinkColor, setNewLinkColor] = useState("#0F766E");
  const [manualNewLinkLogo, setManualNewLinkLogo] = useState(false);
  const [manualNewLinkColor, setManualNewLinkColor] = useState(false);
  const [newLinkError, setNewLinkError] = useState<string | null>(null);

  // Section 5 state
  const [rawWrapLines, setRawWrapLines] = useState(true);

  const activeCardId = readmeConfig.stackCards.some(
    (c) => c.id === selectedCardId
  )
    ? selectedCardId
    : (readmeConfig.stackCards[0]?.id ?? "");

  const badgeById = useMemo(
    () => new Map(readmeConfig.badges.map((b) => [b.id, b])),
    [readmeConfig.badges]
  );

  const activeCardBadgeSet = useMemo(() => {
    const activeCard = readmeConfig.stackCards.find(
      (c) => c.id === activeCardId
    );
    return new Set(activeCard?.badgeIds ?? []);
  }, [readmeConfig.stackCards, activeCardId]);

  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = { all: readmeConfig.badges.length };
    for (const b of readmeConfig.badges) {
      const cat = b.category ?? "skills";
      counts[cat] = (counts[cat] ?? 0) + 1;
    }
    return counts;
  }, [readmeConfig.badges]);

  const filteredBadges = useMemo(() => {
    const query = badgeSearch.trim().toLowerCase();
    return readmeConfig.badges.filter((b) => {
      const matchesCat =
        badgeCategory === "all" || b.category === badgeCategory;
      const matchesQuery =
        !query ||
        b.label.toLowerCase().includes(query) ||
        (b.category &&
          TECH_CATEGORY_LABELS[b.category].toLowerCase().includes(query));
      return matchesCat && matchesQuery;
    });
  }, [readmeConfig.badges, badgeCategory, badgeSearch]);

  const generatedMarkdown = buildGeneratedReadmeMarkdown(
    creatureConfig,
    readmeConfig
  );
  const currentRawText =
    readmeConfig.rawOverride !== null
      ? readmeConfig.rawOverride
      : generatedMarkdown;
  const rawLines = currentRawText.split(/\r?\n/);

  const introWordCount = useMemo(() => {
    const trimmed = readmeConfig.advancedProfileMarkdown.trim();
    return trimmed ? trimmed.split(/\s+/).length : 0;
  }, [readmeConfig.advancedProfileMarkdown]);

  const totalBadgeCount = useMemo(
    () =>
      readmeConfig.stackCards.reduce((sum, c) => sum + c.badgeIds.length, 0),
    [readmeConfig.stackCards]
  );

  const activeTemplateName =
    README_TEMPLATES.find((t) => t.id === readmeConfig.templateId)?.name ??
    "Full Developer Profile";

  const handleOpenSection = (
    num: ReadmeAccordionSection,
    region: PreviewRegion
  ) => {
    setOpenSection(num);
    onSectionFocus(region);
  };

  function readPayloadFromEvent(e: React.DragEvent): DragPayload | null {
    const raw = e.dataTransfer?.getData("application/json");
    if (raw) {
      try {
        return JSON.parse(raw) as DragPayload;
      } catch {
        // Fallback to React state payload
      }
    }
    return dragPayload;
  }

  function handleDropOnCard(e: React.DragEvent, targetCardId: string) {
    e.preventDefault();
    const payload = readPayloadFromEvent(e);
    if (!payload) return;
    if (payload.fromCardId) {
      onMoveBadgeAcrossCards(payload.badgeId, payload.fromCardId, targetCardId);
    } else {
      onAddBadgeToCard(targetCardId, payload.badgeId);
    }
    setSelectedCardId(targetCardId);
    setDragPayload(null);
    setDropCardId(null);
    setDragOverChip(null);
    onFieldEdited("stack");
  }

  function handleDropOnChip(
    e: React.DragEvent,
    targetCardId: string,
    targetBadgeId: string
  ) {
    e.preventDefault();
    e.stopPropagation();
    const payload = readPayloadFromEvent(e);
    if (!payload) return;
    if (payload.fromCardId) {
      onMoveBadgeAcrossCards(
        payload.badgeId,
        payload.fromCardId,
        targetCardId,
        targetBadgeId
      );
    } else {
      onAddBadgeToCard(targetCardId, payload.badgeId, targetBadgeId);
    }
    setSelectedCardId(targetCardId);
    setDragPayload(null);
    setDropCardId(null);
    setDragOverChip(null);
    onFieldEdited("stack");
  }

  function handleAddCustomBadge(e: React.FormEvent) {
    e.preventDefault();
    const label = newBadgeLabel.trim();
    if (!label) {
      setNewBadgeError("Enter a badge name (for example Zig or WebGPU).");
      return;
    }
    if (!activeCardId) return;
    const logoSlug = newBadgeLogo.trim().toLowerCase().replace(/\s+/g, "");
    const seq = nextIdRef.current++;
    onAddCustomBadgeToCard(activeCardId, {
      id: `custom-${seq}`,
      label,
      color: newBadgeColor.replace("#", ""),
      ...(logoSlug ? { logo: logoSlug, logoColor: "white" } : {}),
      category: "skills",
    });
    setNewBadgeLabel("");
    setNewBadgeLogo("");
    setNewBadgeError(null);
    onFieldEdited("stack");
  }

  function handleAddActionLink(e: React.FormEvent) {
    e.preventDefault();
    if (!newLinkLabel.trim()) {
      setNewLinkError("Enter a label (for example PORTFOLIO or BLOG).");
      return;
    }
    const urlValidation = validateLinkUrl(newLinkUrl);
    if (urlValidation) {
      setNewLinkError(urlValidation);
      return;
    }
    const normalizedUrl = normalizeActionUrl(newLinkUrl);
    const seq = nextIdRef.current++;
    const resolvedLogo = manualNewLinkLogo
      ? newLinkLogo
      : detectPlatformFromUrl(normalizedUrl).id;
    onUpdateField("actionLinks", [
      ...readmeConfig.actionLinks,
      {
        id: `link-${seq}`,
        label: newLinkLabel.trim().toUpperCase(),
        valueText: (newLinkText.trim() || "OPEN").toUpperCase(),
        url: normalizedUrl,
        color: newLinkColor.replace("#", ""),
        logo: resolvedLogo || DEFAULT_PLATFORM_ICON_ID,
        enabled: true,
      },
    ]);
    setNewLinkLabel("");
    setNewLinkText("");
    setNewLinkUrl("");
    setNewLinkLogo(DEFAULT_PLATFORM_ICON_ID);
    setNewLinkColor("#0F766E");
    setManualNewLinkLogo(false);
    setManualNewLinkColor(false);
    setNewLinkError(null);
    onFieldEdited("links");
  }

  function handleQuickAddCta(tpl: (typeof CTA_QUICK_TEMPLATES)[number]) {
    const seq = nextIdRef.current++;
    onUpdateField("actionLinks", [
      ...readmeConfig.actionLinks,
      {
        id: `link-${seq}-${tpl.label.toLowerCase()}`,
        ...tpl,
        enabled: true,
      },
    ]);
    onFieldEdited("links");
  }

  function insertRawToken(token: string) {
    const base =
      readmeConfig.rawOverride !== null
        ? readmeConfig.rawOverride
        : generatedMarkdown;
    onChangeRawMarkdown(`${base}\n${token}`);
    onFieldEdited("raw");
  }

  const customBadgePreview: ReadmeBadge = {
    id: "preview",
    label: newBadgeLabel.trim() || "Custom",
    color: newBadgeColor.replace("#", "") || "0F766E",
    logo: newBadgeLogo.trim().toLowerCase().replace(/\s+/g, "") || undefined,
    logoColor: "white",
    enabled: true,
  };

  const customLinkPreview = {
    id: "preview",
    label: (newLinkLabel.trim() || "PORTFOLIO").toUpperCase(),
    valueText: (newLinkText.trim() || "VISIT").toUpperCase(),
    url: newLinkUrl.trim() || "https://example.com",
    color: newLinkColor.replace("#", "") || "0F766E",
    logo: newLinkLogo || DEFAULT_PLATFORM_ICON_ID,
    enabled: true,
  };

  const sections: {
    num: ReadmeAccordionSection;
    title: string;
    description: string;
    summary: string;
    region: PreviewRegion;
  }[] = [
    {
      num: 1,
      title: "Header and intro",
      description: "Edit your profile title, bio, lists, and dynamic tokens.",
      summary: `${introWordCount} words`,
      region: "header",
    },
    {
      num: 2,
      title: "Tech stack",
      description: "Group technology badges into cards and pick from 202 skills.",
      summary: `${totalBadgeCount} badges`,
      region: "stack",
    },
    {
      num: 3,
      title: "Links and buttons",
      description: "Add social, blog, and portfolio badges under your stack.",
      summary: `${readmeConfig.actionLinks.length} links`,
      region: "links",
    },
    {
      num: 4,
      title: "Layout and structure",
      description: "Choose a README preset, optional sections, and banner width.",
      summary: activeTemplateName,
      region: "creature",
    },
    {
      num: 5,
      title: "Advanced",
      description: "Inspect or override the full generated README.md source.",
      summary:
        readmeConfig.rawOverride !== null ? "Overridden" : "Generated",
      region: readmeConfig.rawOverride !== null ? "raw" : "header",
    },
  ];

  return (
    <div className="flex flex-col gap-4">
      {sections.map((sec) => {
        const isOpen = openSection === sec.num;

        return (
          <div
            key={sec.num}
            className={cn(
              "overflow-hidden rounded-[8px] border bg-[var(--surface)] transition-colors duration-150",
              isOpen
                ? "border-[var(--border-strong)]"
                : "border-[var(--border)]"
            )}
          >
            <button
              type="button"
              aria-expanded={isOpen}
              onClick={() => handleOpenSection(sec.num, sec.region)}
              className="flex w-full cursor-pointer items-center justify-between gap-4 px-5 py-4 text-left transition-colors duration-150 hover:bg-[var(--surface-2)]"
            >
              <div className="flex min-w-0 items-start gap-3">
                <span
                  className={cn(
                    "mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full text-[12px] font-semibold",
                    isOpen
                      ? "bg-[var(--accent)] text-[var(--on-accent)]"
                      : "border border-[var(--border)] bg-[var(--surface-2)] text-[var(--text-muted)]"
                  )}
                >
                  {sec.num}
                </span>
                <div className="flex min-w-0 flex-col gap-0.5">
                  <span className="text-[16px] leading-6 font-semibold text-[var(--text)]">
                    {sec.title}
                  </span>
                  <span className="text-[13px] leading-5 text-[var(--text-muted)]">
                    {sec.description}
                  </span>
                </div>
              </div>

              <div className="flex shrink-0 items-center gap-3">
                <span className="inline-flex items-center rounded-full border border-[var(--border)] bg-[var(--surface-2)] px-2.5 py-0.5 text-[12px] font-medium text-[var(--text-muted)]">
                  {sec.summary}
                </span>
                <ChevronDown
                  className={cn(
                    "size-4 text-[var(--text-muted)] transition-transform duration-150",
                    isOpen && "rotate-180 text-[var(--text)]"
                  )}
                />
              </div>
            </button>

            {isOpen && (
              <div className="border-t border-[var(--border)]">
                {/* SECTION 1: Header and intro */}
                {sec.num === 1 && (
                  <div className="pt-5 min-[1800px]:pb-0 pb-5">
                    <AdvancedMarkdownEditor
                      value={readmeConfig.advancedProfileMarkdown}
                      onChange={(next) =>
                        onUpdateField("advancedProfileMarkdown", next)
                      }
                      creatureConfig={creatureConfig}
                      onSyncFromForm={() => {
                        onUpdateField(
                          "advancedProfileMarkdown",
                          buildGeneratedIntroFallback(
                            creatureConfig,
                            readmeConfig
                          )
                        );
                        onFieldEdited("header");
                      }}
                      githubTheme={githubTheme}
                      zoomMode={zoomMode}
                      sharedFitZoom={sharedFitZoom}
                      onMeasureFitZoom={onMeasureFitZoom}
                      onUserEdit={() => onFieldEdited("header")}
                    />
                  </div>
                )}

                {/* SECTION 2: Tech stack */}
                {sec.num === 2 && (
                  <div className="flex flex-col gap-6 p-5 sm:p-6">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <p className="text-[13px] leading-5 text-[var(--text-muted)]">
                        Each card is a group of badges in your README. Drag
                        badges between cards or use the arrows.
                      </p>

                      <div className="flex flex-wrap items-center gap-2">
                        {readmeConfig.savedOrganizedCards !== null && (
                          <StudioButton
                            variant="secondary"
                            size="sm"
                            onClick={() => {
                              onUndoCombineStackCards();
                              onFieldEdited("stack");
                            }}
                          >
                            <Undo2 />
                            <span>
                              Undo combine (
                              {readmeConfig.savedOrganizedCards.length})
                            </span>
                          </StudioButton>
                        )}
                        {readmeConfig.stackCards.length > 1 && (
                          <StudioButton
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              onCombineStackCards();
                              onFieldEdited("stack");
                            }}
                          >
                            <LayoutGrid />
                            <span>Combine all</span>
                          </StudioButton>
                        )}
                        <StudioButton
                          variant="secondary"
                          size="sm"
                          onClick={() => {
                            const id = onAddStackCard(
                              `Stack group ${readmeConfig.stackCards.length + 1}`
                            );
                            setSelectedCardId(id);
                            onFieldEdited("stack");
                          }}
                        >
                          <Plus />
                          <span>Add card</span>
                        </StudioButton>
                      </div>
                    </div>

                    {/* Cards List */}
                    <div className="flex flex-col gap-4">
                      {readmeConfig.stackCards.map((card, cardIdx) => {
                        const isSelected = card.id === activeCardId;
                        const isDropping = dropCardId === card.id;
                        const isVisible = card.visible !== false;
                        const resolvedBadges = card.badgeIds
                          .map((id) => badgeById.get(id))
                          .filter((b): b is ReadmeBadge => Boolean(b));

                        return (
                          <div
                            key={card.id}
                            onClick={() => setSelectedCardId(card.id)}
                            onDragOver={(e) => {
                              e.preventDefault();
                              setDropCardId(card.id);
                            }}
                            onDragLeave={() => {
                              if (dropCardId === card.id) setDropCardId(null);
                            }}
                            onDrop={(e) => handleDropOnCard(e, card.id)}
                            className={cn(
                              "flex flex-col gap-4 rounded-[8px] border p-4 transition-colors duration-150",
                              isDropping
                                ? "border-dashed border-[var(--accent)] bg-[var(--accent-soft)]"
                                : isSelected
                                  ? "border-[var(--accent)] bg-[var(--surface)]"
                                  : "border-[var(--border)] bg-[var(--surface-2)]",
                              !isVisible && "opacity-75"
                            )}
                          >
                            <div className="flex flex-wrap items-end justify-between gap-3">
                              <div
                                className="min-w-[200px] flex-1"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <StudioField
                                  label="Heading (optional)"
                                  htmlFor={`card-heading-${card.id}`}
                                >
                                  <StudioInput
                                    id={`card-heading-${card.id}`}
                                    value={card.title}
                                    onFocus={() => setSelectedCardId(card.id)}
                                    onChange={(e) => {
                                      onRenameStackCard(
                                        card.id,
                                        e.target.value
                                      );
                                      onFieldEdited("stack");
                                    }}
                                    placeholder={
                                      readmeConfig.stackCards.length === 1 &&
                                      !card.title
                                        ? "Combined tech stack (no heading)"
                                        : "e.g. Languages & Frontend"
                                    }
                                  />
                                </StudioField>
                              </div>

                              <div
                                className="flex flex-wrap items-center gap-3"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <div className="flex items-center gap-2">
                                  <Switch
                                    id={`card-visible-${card.id}`}
                                    size="sm"
                                    checked={isVisible}
                                    onCheckedChange={(checked) => {
                                      onToggleStackCardVisibility(
                                        card.id,
                                        Boolean(checked)
                                      );
                                      onFieldEdited("stack");
                                    }}
                                  />
                                  <label
                                    htmlFor={`card-visible-${card.id}`}
                                    className="cursor-pointer text-[13px] font-medium text-[var(--text)]"
                                  >
                                    Show in README
                                  </label>
                                </div>

                                <span className="studio-mono inline-flex items-center rounded-full border border-[var(--border)] bg-[var(--surface-2)] px-2 py-0.5 text-[12px] font-medium text-[var(--text-muted)]">
                                  {resolvedBadges.length}
                                </span>

                                <div className="flex items-center gap-1">
                                  <StudioButton
                                    variant="ghost"
                                    size="icon"
                                    disabled={cardIdx === 0}
                                    onClick={() => {
                                      onReorderStackCards(
                                        cardIdx,
                                        cardIdx - 1
                                      );
                                      onFieldEdited("stack");
                                    }}
                                    aria-label="Move card up"
                                    title="Move card up"
                                  >
                                    <ArrowUp />
                                  </StudioButton>
                                  <StudioButton
                                    variant="ghost"
                                    size="icon"
                                    disabled={
                                      cardIdx ===
                                      readmeConfig.stackCards.length - 1
                                    }
                                    onClick={() => {
                                      onReorderStackCards(
                                        cardIdx,
                                        cardIdx + 1
                                      );
                                      onFieldEdited("stack");
                                    }}
                                    aria-label="Move card down"
                                    title="Move card down"
                                  >
                                    <ArrowDown />
                                  </StudioButton>
                                  <StudioButton
                                    variant="ghost"
                                    size="icon"
                                    disabled={
                                      readmeConfig.stackCards.length <= 1
                                    }
                                    onClick={() => {
                                      onDeleteStackCard(card.id);
                                      onFieldEdited("stack");
                                    }}
                                    aria-label="Delete card"
                                    title="Delete card"
                                    className="hover:text-[var(--danger)]"
                                  >
                                    <Trash2 />
                                  </StudioButton>
                                </div>
                              </div>
                            </div>

                            {resolvedBadges.length === 0 ? (
                              <p className="rounded-[6px] border border-dashed border-[var(--border)] py-4 text-center text-[13px] text-[var(--text-muted)]">
                                Drag badges here or select skills from the
                                library below.
                              </p>
                            ) : (
                              <div className="flex flex-wrap gap-2">
                                {resolvedBadges.map((badge, idx) => (
                                  <div
                                    key={`${card.id}-${badge.id}`}
                                    draggable
                                    onDragStart={(e) => {
                                      e.stopPropagation();
                                      const payload: DragPayload = {
                                        badgeId: badge.id,
                                        fromCardId: card.id,
                                      };
                                      setDragPayload(payload);
                                      e.dataTransfer.setData(
                                        "application/json",
                                        JSON.stringify(payload)
                                      );
                                    }}
                                    onDragEnd={() => {
                                      setDragPayload(null);
                                      setDropCardId(null);
                                      setDragOverChip(null);
                                    }}
                                    onDragOver={(e) => {
                                      e.preventDefault();
                                      e.stopPropagation();
                                      setDragOverChip({
                                        cardId: card.id,
                                        badgeId: badge.id,
                                      });
                                    }}
                                    onDrop={(e) =>
                                      handleDropOnChip(e, card.id, badge.id)
                                    }
                                    className={cn(
                                      "inline-flex min-h-[34px] cursor-grab items-center gap-1.5 rounded-[6px] border border-[var(--border)] bg-[var(--surface)] px-2 py-1 text-[13px] font-medium text-[var(--text)] active:cursor-grabbing",
                                      dragOverChip?.cardId === card.id &&
                                        dragOverChip?.badgeId === badge.id &&
                                        "border-[var(--accent)] ring-1 ring-[var(--accent)]"
                                    )}
                                  >
                                    <GripVertical className="size-3.5 shrink-0 text-[var(--text-faint)]" />
                                    <span
                                      className="size-2.5 shrink-0 rounded-full border border-black/15"
                                      style={{
                                        backgroundColor: `#${badge.color}`,
                                      }}
                                    />
                                    <span>{badge.label}</span>

                                    <div className="ml-1 flex items-center gap-0.5 border-l border-[var(--border)] pl-1">
                                      <button
                                        type="button"
                                        disabled={idx === 0}
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          onMoveBadgeAcrossCards(
                                            badge.id,
                                            card.id,
                                            card.id,
                                            resolvedBadges[idx - 1]?.id
                                          );
                                          onFieldEdited("stack");
                                        }}
                                        aria-label={`Move ${badge.label} left`}
                                        title="Move left"
                                        className="flex size-6 cursor-pointer items-center justify-center rounded-[4px] text-[var(--text-muted)] hover:bg-[var(--surface-2)] hover:text-[var(--text)] disabled:cursor-not-allowed disabled:opacity-30"
                                      >
                                        <ChevronLeft className="size-3.5" />
                                      </button>
                                      <button
                                        type="button"
                                        disabled={
                                          idx === resolvedBadges.length - 1
                                        }
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          const nextItem =
                                            resolvedBadges[idx + 1];
                                          if (nextItem) {
                                            onMoveBadgeAcrossCards(
                                              nextItem.id,
                                              card.id,
                                              card.id,
                                              badge.id
                                            );
                                            onFieldEdited("stack");
                                          }
                                        }}
                                        aria-label={`Move ${badge.label} right`}
                                        title="Move right"
                                        className="flex size-6 cursor-pointer items-center justify-center rounded-[4px] text-[var(--text-muted)] hover:bg-[var(--surface-2)] hover:text-[var(--text)] disabled:cursor-not-allowed disabled:opacity-30"
                                      >
                                        <ChevronRight className="size-3.5" />
                                      </button>

                                      {readmeConfig.stackCards.length > 1 && (
                                        <select
                                          aria-label={`Move ${badge.label} to another card`}
                                          title="Move to card"
                                          value={card.id}
                                          onClick={(e) => e.stopPropagation()}
                                          onChange={(e) => {
                                            const targetId = e.target.value;
                                            if (targetId && targetId !== card.id) {
                                              onMoveBadgeAcrossCards(
                                                badge.id,
                                                card.id,
                                                targetId
                                              );
                                              onFieldEdited("stack");
                                            }
                                          }}
                                          className="h-6 max-w-[78px] cursor-pointer rounded-[4px] border border-[var(--border)] bg-[var(--surface-2)] px-1 text-[11px] text-[var(--text-muted)] hover:text-[var(--text)]"
                                        >
                                          {readmeConfig.stackCards.map(
                                            (opt, optIdx) => (
                                              <option
                                                key={opt.id}
                                                value={opt.id}
                                              >
                                                {opt.title.trim() ||
                                                  `Card ${optIdx + 1}`}
                                              </option>
                                            )
                                          )}
                                        </select>
                                      )}

                                      <button
                                        type="button"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          onRemoveBadgeFromCard(
                                            card.id,
                                            badge.id
                                          );
                                          onFieldEdited("stack");
                                        }}
                                        aria-label={`Remove ${badge.label}`}
                                        title="Remove badge"
                                        className="flex size-6 cursor-pointer items-center justify-center rounded-[4px] text-[var(--text-muted)] hover:bg-[var(--surface-2)] hover:text-[var(--danger)]"
                                      >
                                        <X className="size-3.5" />
                                      </button>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>

                    {/* Two-Column Skills Library */}
                    <div className="flex flex-col gap-3">
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <div className="flex items-center gap-2">
                          <h3 className="text-[14px] font-semibold text-[var(--text)]">
                            Skills library
                          </h3>
                          <span className="studio-mono inline-flex items-center rounded-full border border-[var(--border)] bg-[var(--surface-2)] px-2 py-0.5 text-[12px] text-[var(--text-muted)]">
                            {readmeConfig.badges.length}
                          </span>
                        </div>

                        <div className="flex items-center gap-2">
                          <label
                            htmlFor="adding-to-card-select"
                            className="text-[13px] font-medium whitespace-nowrap text-[var(--text-muted)]"
                          >
                            Adding to:
                          </label>
                          <StudioSelect
                            id="adding-to-card-select"
                            value={activeCardId}
                            onChange={(e) => setSelectedCardId(e.target.value)}
                            className="w-48"
                          >
                            {readmeConfig.stackCards.map((c, idx) => (
                              <option key={c.id} value={c.id}>
                                {c.title.trim() || `Card ${idx + 1}`}
                              </option>
                            ))}
                          </StudioSelect>
                        </div>
                      </div>

                      <div className="grid overflow-hidden rounded-[8px] border border-[var(--border)] bg-[var(--surface)] md:grid-cols-[200px_1fr]">
                        {/* Left Category Column */}
                        <div className="flex max-h-72 flex-row gap-1 overflow-x-auto border-b border-[var(--border)] bg-[var(--surface-2)] p-2 md:flex-col md:overflow-y-auto md:border-r md:border-b-0">
                          <button
                            type="button"
                            onClick={() => setBadgeCategory("all")}
                            className={cn(
                              "flex shrink-0 cursor-pointer items-center justify-between gap-2 rounded-[6px] border px-2.5 py-1.5 text-left text-[13px] font-medium transition-[color,background-color,border-color] duration-150",
                              badgeCategory === "all"
                                ? "border-[var(--accent)] bg-[var(--surface)] text-[var(--accent)]"
                                : "border-transparent text-[var(--text-muted)] hover:text-[var(--text)]"
                            )}
                          >
                            <span>All</span>
                            <span className="studio-mono text-[11px] opacity-80">
                              {categoryCounts.all ?? 0}
                            </span>
                          </button>

                          {TECH_CATEGORIES_ORDER.map((cat) => (
                            <button
                              key={cat}
                              type="button"
                              onClick={() => setBadgeCategory(cat)}
                              className={cn(
                                "flex shrink-0 cursor-pointer items-center justify-between gap-2 rounded-[6px] border px-2.5 py-1.5 text-left text-[13px] font-medium transition-[color,background-color,border-color] duration-150",
                                badgeCategory === cat
                                  ? "border-[var(--accent)] bg-[var(--surface)] text-[var(--accent)]"
                                  : "border-transparent text-[var(--text-muted)] hover:text-[var(--text)]"
                              )}
                            >
                              <span className="truncate">
                                {TECH_CATEGORY_LABELS[cat]}
                              </span>
                              <span className="studio-mono text-[11px] opacity-80">
                                {categoryCounts[cat] ?? 0}
                              </span>
                            </button>
                          ))}
                        </div>

                        {/* Right Search + Selectable Chips */}
                        <div className="flex flex-col gap-3 p-3">
                          <div className="relative">
                            <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-[var(--text-muted)]" />
                            <StudioInput
                              aria-label="Search skills"
                              value={badgeSearch}
                              onChange={(e) => setBadgeSearch(e.target.value)}
                              placeholder="Search React, Rust, Docker..."
                              className="pl-9"
                            />
                          </div>

                          <div className="flex max-h-56 flex-wrap content-start gap-1.5 overflow-y-auto">
                            {filteredBadges.length === 0 ? (
                              <p className="w-full py-6 text-center text-[13px] text-[var(--text-muted)]">
                                No matching skills found. Create a custom badge
                                below.
                              </p>
                            ) : (
                              filteredBadges.map((badge) => {
                                const inActiveCard = activeCardBadgeSet.has(
                                  badge.id
                                );
                                return (
                                  <button
                                    key={badge.id}
                                    type="button"
                                    draggable
                                    onDragStart={(e) => {
                                      const payload: DragPayload = {
                                        badgeId: badge.id,
                                        fromCardId: null,
                                      };
                                      setDragPayload(payload);
                                      e.dataTransfer.setData(
                                        "application/json",
                                        JSON.stringify(payload)
                                      );
                                    }}
                                    onDragEnd={() => {
                                      setDragPayload(null);
                                      setDropCardId(null);
                                    }}
                                    onClick={() => {
                                      if (!activeCardId) return;
                                      if (inActiveCard) {
                                        onRemoveBadgeFromCard(
                                          activeCardId,
                                          badge.id
                                        );
                                      } else {
                                        onAddBadgeToCard(
                                          activeCardId,
                                          badge.id
                                        );
                                      }
                                      onFieldEdited("stack");
                                    }}
                                    className={cn(
                                      "inline-flex min-h-[32px] cursor-pointer items-center gap-1.5 rounded-[6px] border px-2.5 py-1 text-[13px] font-medium transition-[color,background-color,border-color] duration-150",
                                      inActiveCard
                                        ? "border-[var(--accent)] bg-[var(--accent-soft)] text-[var(--accent)]"
                                        : "border-[var(--border)] bg-[var(--surface-2)] text-[var(--text)] hover:border-[var(--border-strong)]"
                                    )}
                                  >
                                    {inActiveCard ? (
                                      <Check className="size-3.5 shrink-0" />
                                    ) : (
                                      <Plus className="size-3.5 shrink-0 text-[var(--text-muted)]" />
                                    )}
                                    <span
                                      className="size-2.5 shrink-0 rounded-full border border-black/15"
                                      style={{
                                        backgroundColor: `#${badge.color}`,
                                      }}
                                    />
                                    <span>{badge.label}</span>
                                  </button>
                                );
                              })
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Custom Badge Form */}
                    <form
                      onSubmit={handleAddCustomBadge}
                      className="flex flex-col gap-4 rounded-[8px] border border-[var(--border)] bg-[var(--surface-2)] p-4"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <span className="text-[14px] font-semibold text-[var(--text)]">
                          Create custom badge
                        </span>
                        <div className="flex items-center gap-2">
                          <span className="text-[12px] text-[var(--text-muted)]">
                            Preview:
                          </span>
                          <img
                            src={buildShieldBadgeUrl(customBadgePreview)}
                            alt={customBadgePreview.label}
                            className="h-6 w-auto"
                          />
                        </div>
                      </div>

                      <div className="grid gap-4 sm:grid-cols-12">
                        <div className="sm:col-span-4">
                          <StudioField
                            label="Name"
                            htmlFor="custom-badge-name"
                            error={newBadgeError}
                          >
                            <StudioInput
                              id="custom-badge-name"
                              value={newBadgeLabel}
                              invalid={Boolean(newBadgeError)}
                              onChange={(e) => {
                                setNewBadgeLabel(e.target.value);
                                if (newBadgeError) setNewBadgeError(null);
                              }}
                              placeholder="Zig, WebGPU..."
                            />
                          </StudioField>
                        </div>

                        <div className="sm:col-span-4">
                          <StudioField
                            label="Icon slug"
                            htmlFor="custom-badge-slug"
                            helper="simple-icons slug, for example python"
                          >
                            <StudioInput
                              id="custom-badge-slug"
                              monospace
                              value={newBadgeLogo}
                              onChange={(e) => setNewBadgeLogo(e.target.value)}
                              placeholder="python"
                            />
                          </StudioField>
                        </div>

                        <div className="sm:col-span-4">
                          <StudioField label="Color">
                            <div className="flex items-start gap-2">
                              <StudioColorSwatch
                                label="Badge color"
                                value={newBadgeColor}
                                onChange={setNewBadgeColor}
                              />
                              <StudioButton type="submit" variant="primary">
                                Add
                              </StudioButton>
                            </div>
                          </StudioField>
                        </div>
                      </div>
                    </form>
                  </div>
                )}

                {/* SECTION 3: Links and buttons (CTA) */}
                {sec.num === 3 && (
                  <div className="flex flex-col gap-6 p-5 sm:p-6">
                    {/* Quick Add Platform Row */}
                    <div className="flex flex-col gap-2">
                      <span className="text-[14px] font-medium text-[var(--text)]">
                        Add a link
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {QUICK_ADD_PLATFORMS.map(({ label, template }) => (
                          <StudioButton
                            key={label}
                            variant="secondary"
                            size="sm"
                            onClick={() => handleQuickAddCta(template)}
                          >
                            <PlatformIconGlyph
                              iconId={template.logo}
                              className="size-3.5"
                            />
                            <span>{label}</span>
                          </StudioButton>
                        ))}
                        <StudioButton
                          variant="secondary"
                          size="sm"
                          onClick={() => customLinkInputRef.current?.focus()}
                        >
                          <Plus />
                          <span>Custom link</span>
                        </StudioButton>
                      </div>
                    </div>

                    {/* Existing Link Row Cards */}
                    <div className="flex flex-col gap-3">
                      {readmeConfig.actionLinks.map((link, idx) => {
                        const urlError = validateLinkUrl(link.url);
                        return (
                          <div
                            key={link.id}
                            className="flex flex-col gap-3 rounded-[8px] border border-[var(--border)] bg-[var(--surface-2)] p-4"
                          >
                            <div className="grid gap-3 sm:grid-cols-12">
                              <div className="flex items-end gap-3 sm:col-span-3">
                                <label className="flex h-9 cursor-pointer items-center gap-2 text-[13px] font-medium text-[var(--text)]">
                                  <input
                                    type="checkbox"
                                    checked={link.enabled}
                                    onChange={(e) => {
                                      const updated = [
                                        ...readmeConfig.actionLinks,
                                      ];
                                      updated[idx] = {
                                        ...link,
                                        enabled: e.target.checked,
                                      };
                                      onUpdateField("actionLinks", updated);
                                      onFieldEdited("links");
                                    }}
                                    className="size-4 rounded-[4px] border-[var(--border)] accent-[var(--accent)]"
                                  />
                                  <span>Show</span>
                                </label>

                                <div className="flex-1">
                                  <StudioField label="Platform">
                                    <PlatformIconPickerButton
                                      value={
                                        link.logo ?? DEFAULT_PLATFORM_ICON_ID
                                      }
                                      compact
                                      onChange={(iconId) => {
                                        const updated = [
                                          ...readmeConfig.actionLinks,
                                        ];
                                        updated[idx] = {
                                          ...link,
                                          logo: iconId,
                                        };
                                        onUpdateField("actionLinks", updated);
                                        onFieldEdited("links");
                                      }}
                                    />
                                  </StudioField>
                                </div>
                              </div>

                              <div className="sm:col-span-3">
                                <StudioField
                                  label="Label"
                                  htmlFor={`cta-label-${link.id}`}
                                >
                                  <StudioInput
                                    id={`cta-label-${link.id}`}
                                    value={link.label}
                                    onChange={(e) => {
                                      const updated = [
                                        ...readmeConfig.actionLinks,
                                      ];
                                      updated[idx] = {
                                        ...link,
                                        label: e.target.value,
                                      };
                                      onUpdateField("actionLinks", updated);
                                      onFieldEdited("links");
                                    }}
                                    placeholder="GITHUB"
                                  />
                                </StudioField>
                              </div>

                              <div className="sm:col-span-3">
                                <StudioField
                                  label="Text"
                                  htmlFor={`cta-text-${link.id}`}
                                >
                                  <StudioInput
                                    id={`cta-text-${link.id}`}
                                    value={link.valueText}
                                    onChange={(e) => {
                                      const updated = [
                                        ...readmeConfig.actionLinks,
                                      ];
                                      updated[idx] = {
                                        ...link,
                                        valueText: e.target.value,
                                      };
                                      onUpdateField("actionLinks", updated);
                                      onFieldEdited("links");
                                    }}
                                    placeholder="@username"
                                  />
                                </StudioField>
                              </div>

                              <div className="sm:col-span-3">
                                <StudioField label="Color">
                                  <StudioColorSwatch
                                    label={`Color for ${link.label || "link"}`}
                                    value={`#${link.color.replace("#", "").padEnd(6, "0").slice(0, 6)}`}
                                    hideInput
                                    onChange={(hex) => {
                                      const updated = [
                                        ...readmeConfig.actionLinks,
                                      ];
                                      updated[idx] = {
                                        ...link,
                                        color: hex
                                          .replace("#", "")
                                          .toUpperCase(),
                                      };
                                      onUpdateField("actionLinks", updated);
                                      onFieldEdited("links");
                                    }}
                                  />
                                </StudioField>
                              </div>

                              <div className="sm:col-span-12">
                                <StudioField
                                  label="URL"
                                  htmlFor={`cta-url-${link.id}`}
                                  error={urlError}
                                >
                                  <StudioInput
                                    id={`cta-url-${link.id}`}
                                    value={link.url}
                                    invalid={Boolean(urlError)}
                                    onChange={(e) => {
                                      const nextUrl = e.target.value;
                                      const detected =
                                        detectPlatformFromUrl(nextUrl);
                                      const updated = [
                                        ...readmeConfig.actionLinks,
                                      ];
                                      updated[idx] = {
                                        ...link,
                                        url: nextUrl,
                                        logo: detected.id,
                                      };
                                      onUpdateField("actionLinks", updated);
                                      onFieldEdited("links");
                                    }}
                                    placeholder="https://github.com/username or mailto:..."
                                  />
                                </StudioField>
                              </div>
                            </div>

                            <div className="flex flex-wrap items-center justify-between gap-2 border-t border-[var(--border)] pt-3">
                              <img
                                src={buildActionLinkBadgeUrl(
                                  link,
                                  creatureConfig
                                )}
                                alt={link.label || "Link preview"}
                                className="h-6 w-auto"
                              />

                              <div className="flex items-center gap-1">
                                <StudioButton
                                  variant="ghost"
                                  size="icon"
                                  disabled={idx === 0}
                                  onClick={() => {
                                    onUpdateField(
                                      "actionLinks",
                                      reorderItems(
                                        readmeConfig.actionLinks,
                                        idx,
                                        idx - 1
                                      )
                                    );
                                    onFieldEdited("links");
                                  }}
                                  aria-label="Move link up"
                                  title="Move up"
                                >
                                  <ArrowUp />
                                </StudioButton>
                                <StudioButton
                                  variant="ghost"
                                  size="icon"
                                  disabled={
                                    idx === readmeConfig.actionLinks.length - 1
                                  }
                                  onClick={() => {
                                    onUpdateField(
                                      "actionLinks",
                                      reorderItems(
                                        readmeConfig.actionLinks,
                                        idx,
                                        idx + 1
                                      )
                                    );
                                    onFieldEdited("links");
                                  }}
                                  aria-label="Move link down"
                                  title="Move down"
                                >
                                  <ArrowDown />
                                </StudioButton>
                                <StudioButton
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => {
                                    onUpdateField(
                                      "actionLinks",
                                      readmeConfig.actionLinks.filter(
                                        (l) => l.id !== link.id
                                      )
                                    );
                                    onFieldEdited("links");
                                  }}
                                  aria-label="Delete link"
                                  title="Delete link"
                                  className="hover:text-[var(--danger)]"
                                >
                                  <Trash2 />
                                </StudioButton>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* Custom Link Form */}
                    <form
                      onSubmit={handleAddActionLink}
                      className="flex flex-col gap-4 rounded-[8px] border border-[var(--border)] bg-[var(--surface)] p-4"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <span className="text-[14px] font-semibold text-[var(--text)]">
                          Custom link
                        </span>
                        <img
                          src={buildActionLinkBadgeUrl(
                            customLinkPreview,
                            creatureConfig
                          )}
                          alt="Custom link preview"
                          className="h-6 w-auto"
                        />
                      </div>

                      <div className="grid gap-3 sm:grid-cols-12">
                        <div className="sm:col-span-4">
                          <StudioField label="Label" htmlFor="new-link-label">
                            <StudioInput
                              ref={customLinkInputRef}
                              id="new-link-label"
                              value={newLinkLabel}
                              onChange={(e) => {
                                setNewLinkLabel(e.target.value);
                                if (newLinkError) setNewLinkError(null);
                              }}
                              placeholder="PORTFOLIO"
                            />
                          </StudioField>
                        </div>

                        <div className="sm:col-span-4">
                          <StudioField label="Text" htmlFor="new-link-text">
                            <StudioInput
                              id="new-link-text"
                              value={newLinkText}
                              onChange={(e) => setNewLinkText(e.target.value)}
                              placeholder="VISIT SITE"
                            />
                          </StudioField>
                        </div>

                        <div className="sm:col-span-4">
                          <StudioField label="Platform">
                            <PlatformIconPickerButton
                              value={newLinkLogo}
                              onChange={(iconId) => {
                                setManualNewLinkLogo(true);
                                setNewLinkLogo(iconId);
                              }}
                              className="w-full justify-between"
                            />
                          </StudioField>
                        </div>

                        <div className="sm:col-span-7">
                          <StudioField
                            label="URL"
                            htmlFor="new-link-url"
                            error={newLinkError}
                          >
                            <StudioInput
                              id="new-link-url"
                              value={newLinkUrl}
                              invalid={Boolean(newLinkError)}
                              onChange={(e) => {
                                const nextUrl = e.target.value;
                                setNewLinkUrl(nextUrl);
                                if (newLinkError) setNewLinkError(null);
                                const detected = detectPlatformFromUrl(nextUrl);
                                if (!manualNewLinkLogo) {
                                  setNewLinkLogo(detected.id);
                                }
                                if (!manualNewLinkColor) {
                                  setNewLinkColor(`#${detected.hex}`);
                                }
                              }}
                              placeholder="https://example.com or mailto:you@example.com"
                            />
                          </StudioField>
                        </div>

                        <div className="sm:col-span-5">
                          <StudioField label="Color">
                            <div className="flex items-start gap-2">
                              <StudioColorSwatch
                                label="Link badge color"
                                value={newLinkColor}
                                hideInput
                                onChange={(hex) => {
                                  setManualNewLinkColor(true);
                                  setNewLinkColor(hex);
                                }}
                              />
                              <StudioButton
                                type="submit"
                                variant="primary"
                                className="flex-1"
                              >
                                Add link
                              </StudioButton>
                            </div>
                          </StudioField>
                        </div>
                      </div>
                    </form>
                  </div>
                )}

                {/* SECTION 4: Layout and structure */}
                {sec.num === 4 && (
                  <div className="flex flex-col gap-6 p-5 sm:p-6">
                    <div className="flex flex-col gap-3">
                      <span className="text-[14px] font-medium text-[var(--text)]">
                        README structure preset
                      </span>
                      <div className="grid gap-3 sm:grid-cols-2">
                        {README_TEMPLATES.map((tpl) => {
                          const active = readmeConfig.templateId === tpl.id;
                          return (
                            <button
                              key={tpl.id}
                              type="button"
                              aria-pressed={active}
                              onClick={() => {
                                onSelectTemplate(tpl.id);
                                onFieldEdited("creature");
                              }}
                              className={cn(
                                "flex cursor-pointer items-start gap-3 rounded-[8px] border p-3.5 text-left transition-[color,background-color,border-color] duration-150",
                                active
                                  ? "border-[var(--accent)] bg-[var(--accent-soft)]"
                                  : "border-[var(--border)] bg-[var(--surface)] hover:border-[var(--border-strong)] hover:bg-[var(--surface-2)]"
                              )}
                            >
                              <StructurePresetWireframe id={tpl.id} />
                              <div className="flex min-w-0 flex-1 flex-col gap-1">
                                <div className="flex items-center justify-between gap-2">
                                  <span className="text-[14px] font-semibold text-[var(--text)]">
                                    {tpl.name}
                                  </span>
                                  {active && (
                                    <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-[var(--accent)] text-[var(--on-accent)]">
                                      <Check className="size-3 stroke-[2.5]" />
                                    </span>
                                  )}
                                </div>
                                <span className="text-[12px] leading-4 text-[var(--text-muted)]">
                                  {tpl.description}
                                </span>
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    <div className="flex flex-col gap-3">
                      <span className="text-[14px] font-medium text-[var(--text)]">
                        Optional sections
                      </span>

                      <StudioSwitchRow
                        id="opt-includeMarkers"
                        checked={readmeConfig.includeMarkers}
                        onCheckedChange={(checked) => {
                          onUpdateField("includeMarkers", checked);
                          onFieldEdited("creature");
                        }}
                        label="Auto update markers"
                        description="Adds START/END comment markers so the 12 AM action can update only the creature block."
                      />

                      <StudioSwitchRow
                        id="opt-includeStatsTable"
                        checked={readmeConfig.includeStatsTable}
                        onCheckedChange={(checked) => {
                          onUpdateField("includeStatsTable", checked);
                          onFieldEdited(checked ? "telemetry" : "creature");
                        }}
                        label="Telemetry table"
                        description="Appends a live stats table showing stage, commits, and top languages."
                      />

                      {readmeConfig.includeStatsTable && (
                        <div className="pl-2">
                          <StudioField
                            label="Telemetry table title"
                            htmlFor="telemetry-title-input"
                          >
                            <StudioInput
                              id="telemetry-title-input"
                              value={readmeConfig.statsTableTitle}
                              onChange={(e) => {
                                onUpdateField(
                                  "statsTableTitle",
                                  e.target.value
                                );
                                onFieldEdited("telemetry");
                              }}
                            />
                          </StudioField>
                        </div>
                      )}

                      <StudioSwitchRow
                        id="opt-includeShareCard"
                        checked={readmeConfig.includeShareCard}
                        onCheckedChange={(checked) => {
                          onUpdateField("includeShareCard", checked);
                          onFieldEdited(checked ? "share-card" : "creature");
                        }}
                        label="1280×640 share card"
                        description="Embeds a 1280×640 social preview image beneath your creature."
                      />
                    </div>

                    <StudioField label="Badges and CTA alignment">
                      <StudioSegmentedControl<"left" | "center">
                        ariaLabel="Badges and CTA alignment"
                        value={readmeConfig.align}
                        onChange={(alignVal) => {
                          onUpdateField("align", alignVal);
                          onFieldEdited("stack");
                        }}
                        options={[
                          { value: "left", label: "Left" },
                          { value: "center", label: "Center" },
                        ]}
                      />
                    </StudioField>

                    <StudioSliderField
                      label="Creature banner width"
                      value={readmeConfig.imageWidth}
                      min={320}
                      max={920}
                      step={20}
                      unit="px"
                      onChange={(next) => {
                        onUpdateField("imageWidth", next);
                        onFieldEdited("creature");
                      }}
                      presetSlot={
                        <StudioSegmentedControl<string>
                          ariaLabel="Creature banner width presets"
                          size="sm"
                          value={
                            [480, 640, 760, 920].includes(
                              readmeConfig.imageWidth
                            )
                              ? String(readmeConfig.imageWidth)
                              : "custom"
                          }
                          onChange={(val) => {
                            const n = Number(val);
                            if (Number.isFinite(n)) {
                              onUpdateField("imageWidth", n);
                              onFieldEdited("creature");
                            }
                          }}
                          options={[
                            { value: "480", label: "480" },
                            { value: "640", label: "640" },
                            { value: "760", label: "760" },
                            { value: "920", label: "920" },
                          ]}
                        />
                      }
                    />
                  </div>
                )}

                {/* SECTION 5: Advanced */}
                {sec.num === 5 && (
                  <div className="flex flex-col gap-4 p-5 sm:p-6">
                    <div className="flex flex-col gap-1">
                      <h3 className="text-[14px] font-semibold text-[var(--text)]">
                        Inspect / override full raw README.md
                      </h3>
                      <p className="rounded-[6px] border border-[var(--warning)]/40 bg-[var(--surface-2)] px-3.5 py-2.5 text-[13px] leading-5 text-[var(--text)]">
                        Editing this raw source overrides the generated README
                        (dynamic values such as{" "}
                        <code className="studio-mono text-[12px]">
                          {"{{USERNAME}}"}
                        </code>{" "}
                        still resolve in preview and export). Changing any
                        visual control in Sections 1–4 clears this override and
                        returns to the generated README.
                      </p>
                    </div>

                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex flex-wrap gap-1.5">
                        {DYNAMIC_TOKENS.map((t) => (
                          <button
                            key={t.token}
                            type="button"
                            onClick={() => insertRawToken(t.token)}
                            className="studio-mono h-7 cursor-pointer rounded-[6px] border border-[var(--border)] bg-[var(--surface-2)] px-2 text-[12px] text-[var(--text)] transition-colors duration-150 hover:border-[var(--accent)] hover:bg-[var(--accent-soft)] hover:text-[var(--accent)]"
                          >
                            {t.token}
                          </button>
                        ))}
                      </div>

                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2">
                          <Switch
                            id="raw-wrap-lines"
                            size="sm"
                            checked={rawWrapLines}
                            onCheckedChange={(c) => setRawWrapLines(Boolean(c))}
                          />
                          <label
                            htmlFor="raw-wrap-lines"
                            className="cursor-pointer text-[13px] font-medium text-[var(--text)]"
                          >
                            Wrap lines
                          </label>
                        </div>

                        <StudioButton
                          variant="secondary"
                          size="sm"
                          disabled={readmeConfig.rawOverride === null}
                          onClick={() => {
                            onChangeRawMarkdown(null);
                            onFieldEdited("header");
                          }}
                        >
                          <RefreshCw />
                          <span>Reset to generated</span>
                        </StudioButton>
                      </div>
                    </div>

                    <div className="flex max-h-[380px] overflow-auto rounded-[6px] border border-[var(--border)] bg-[var(--surface-2)]">
                      <div
                        aria-hidden="true"
                        className="studio-mono shrink-0 border-r border-[var(--border)] bg-[var(--surface)] px-3 py-3 text-right text-[12px] leading-6 text-[var(--text-faint)] select-none"
                      >
                        {rawLines.map((_, idx) => (
                          <div key={idx}>{idx + 1}</div>
                        ))}
                      </div>
                      <textarea
                        aria-label="Full raw README.md source"
                        rows={Math.max(12, Math.min(20, rawLines.length))}
                        value={currentRawText}
                        onChange={(e) => {
                          onChangeRawMarkdown(e.target.value);
                          onFieldEdited("raw");
                        }}
                        spellCheck={false}
                        wrap={rawWrapLines ? "soft" : "off"}
                        className={cn(
                          "studio-mono min-h-[280px] w-full flex-1 resize-y border-0 bg-transparent p-3 text-[13px] leading-6 text-[var(--text)] focus:outline-none",
                          rawWrapLines ? "whitespace-pre-wrap" : "whitespace-pre overflow-x-auto"
                        )}
                      />
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

function buildGeneratedIntroFallback(
  creature: CreatureConfig,
  readme: ReadmeConfig
): string {
  const safeUser = creature.username.trim() || "your-username";
  const headline = readme.headline.replaceAll("{{USERNAME}}", safeUser).trim();
  const bio = readme.bio.replaceAll("{{USERNAME}}", safeUser).trim();
  const parts: string[] = [];
  if (headline) parts.push(`### ${headline}`);
  if (readme.subtitleTags.length > 0) {
    parts.push(`**${readme.subtitleTags.join(" | ")}**`);
  }
  if (bio) parts.push(bio);
  if (readme.ctaLine.trim()) parts.push(readme.ctaLine.trim());
  return parts.join("\n\n");
}
