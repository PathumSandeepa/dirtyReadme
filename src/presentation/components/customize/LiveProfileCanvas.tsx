"use client";

import {
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
  forwardRef,
} from "react";
import ImageExtension from "@tiptap/extension-image";
import { TaskItem, TaskList } from "@tiptap/extension-list";
import { TableKit } from "@tiptap/extension-table";
import TextAlign from "@tiptap/extension-text-align";
import { CharacterCount, Placeholder } from "@tiptap/extensions";
import { EditorContent, useEditor } from "@tiptap/react";
import { BubbleMenu } from "@tiptap/react/menus";
import StarterKit from "@tiptap/starter-kit";
import {
  ArrowDown,
  ArrowUp,
  AlignCenter,
  AlignLeft,
  AlignRight,
  Bold,
  Building2,
  Check,
  CheckSquare,
  ChevronDown,
  Clock,
  Code,
  Columns3,
  Copy,
  Download,
  Edit3,
  Eraser,
  ExternalLink,
  EyeOff,
  FileCode2,
  Heading,
  Image as ImageIcon,
  Italic,
  Layers,
  LayoutTemplate,
  Link2,
  List,
  ListOrdered,
  MapPin,
  Maximize2,
  Minimize2,
  Moon,
  PanelLeft,
  Pilcrow,
  Quote,
  Redo2,
  RefreshCw,
  RemoveFormatting,
  RotateCcw,
  Rows3,
  SeparatorHorizontal,
  Smile,
  Sparkles,
  Strikethrough,
  Sun,
  Table2,
  Trash2,
  Underline as UnderlineIcon,
  Undo2,
  Unlink,
} from "lucide-react";
import { cn } from "cn";
import type { CameraView, CreatureConfig } from "@/domain/creature/entities";
import {
  derivePalette,
  getCreatureMeta,
  getEvolutionStage,
  getSpriteKey,
  getViewDisplayLabel,
  getVisibleLanguages,
} from "@/domain/creature/services";
import {
  DYNAMIC_TOKENS,
  type CustomImageMemoryAsset,
  type ReadmeBadge,
  type ReadmeConfig,
} from "@/domain/profile/entities";
import {
  PROFILE_EDITOR_TEMPLATES,
  markdownToEditorHtml,
  tiptapJsonToGithubMarkdown,
} from "@/domain/profile/markdownRichText";
import {
  buildActionLinkBadgeUrl,
  buildShieldBadgeUrl,
  resolveDynamicTokens,
} from "@/domain/profile/readmeService";
import {
  copyToClipboard,
  downloadBlobFile,
} from "@/infrastructure/browser/downloadAdapter";
import { loadCreatureSprite } from "@/infrastructure/browser/spriteLoader";
import {
  encodeAnimatedGifFromCreature,
  encodeAnimatedWebPFromCreature,
  exportShareCardPngBlob,
} from "@/infrastructure/browser/webpEncoder";
import type { GitHubProfileSnapshot } from "@/infrastructure/github/githubClient";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useDebouncedValue } from "../../studio/hooks/useDebouncedValue";
import {
  ScaledReadmeViewport,
  type ReadmeZoomMode,
} from "../../studio/ui/ScaledReadmeViewport";
import { StudioButton } from "../../studio/ui/StudioButton";
import {
  StudioConfirmDialog,
  StudioDialog,
} from "../../studio/ui/StudioDialog";
import { StudioField, StudioInput } from "../../studio/ui/StudioInput";
import { StudioSegmentedControl } from "../../studio/ui/StudioSegmentedControl";
import { Switch } from "@/components/ui/switch";
import { CreatureAnimatedView } from "../CreatureAnimatedView";
import { EvolutionPanel } from "../EvolutionPanel";
import { ImageStudioDialog } from "../ImageStudioDialog";
import { ShareCardCanvasView } from "../ShareCardCanvasView";
import { TemplateGalleryDialog } from "./TemplateGalleryDialog";
import type { CustomizePartId } from "./customizeTypes";

const StudioImageExtension = ImageExtension.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      repoPath: {
        default: null,
        parseHTML: (el: HTMLElement) => el.getAttribute("data-repo-path"),
        renderHTML: (attrs: Record<string, unknown>) =>
          attrs.repoPath ? { "data-repo-path": String(attrs.repoPath) } : {},
      },
    };
  },
});

type CanvasViewMode = "visual" | "markdown" | "share-card" | "stages";
type WidthMode = "github-848" | "fit-pane";

const PROFILE_EMOJIS = [
  "👋",
  "🚀",
  "💻",
  "⚡",
  "🧠",
  "🌱",
  "🔥",
  "🛠️",
  "✨",
  "🎯",
  "📫",
  "🌍",
  "📚",
  "🎨",
  "🤝",
  "☕",
  "🧪",
  "📦",
  "🛡️",
  "⭐",
  "🏆",
  "💡",
  "📌",
  "🔍",
  "🧩",
  "🎓",
  "⚙️",
  "🌐",
  "📊",
  "🖥️",
  "📱",
  "💬",
  "📣",
  "🎉",
  "💎",
  "🐳",
];

function normalizeInputUrl(raw: string): string {
  const trimmed = raw.trim();
  if (!trimmed) return "";
  if (
    /^https?:\/\//i.test(trimmed) ||
    /^mailto:/i.test(trimmed) ||
    trimmed.startsWith("#") ||
    trimmed.startsWith("/") ||
    trimmed.startsWith("./")
  ) {
    return trimmed;
  }
  return `https://${trimmed}`;
}

function isValidUrlInput(raw: string): boolean {
  const trimmed = raw.trim();
  if (!trimmed) return false;
  if (
    trimmed.startsWith("#") ||
    trimmed.startsWith("/") ||
    trimmed.startsWith("./") ||
    /^mailto:[^\s@]+@[^\s@]+\.[^\s@]+$/i.test(trimmed)
  ) {
    return true;
  }
  try {
    const candidate = /^https?:\/\//i.test(trimmed)
      ? trimmed
      : `https://${trimmed}`;
    const u = new URL(candidate);
    return Boolean(u.hostname && u.hostname.includes("."));
  } catch {
    return false;
  }
}

interface SlashState {
  from: number;
  to: number;
  query: string;
  top: number;
  left: number;
}

interface SlashItem {
  id: string;
  label: string;
  description: string;
  keywords: string;
  icon: React.ReactNode;
}

const SLASH_ITEMS: SlashItem[] = [
  {
    id: "heading",
    label: "Heading",
    description: "Medium section heading with GitHub divider",
    keywords: "h1 h2 h3 title heading",
    icon: <Heading className="size-4" />,
  },
  {
    id: "paragraph",
    label: "Paragraph",
    description: "Plain body text paragraph",
    keywords: "text body paragraph normal",
    icon: <Pilcrow className="size-4" />,
  },
  {
    id: "bulletList",
    label: "Bullet list",
    description: "Unordered list of short points",
    keywords: "bullet unordered list",
    icon: <List className="size-4" />,
  },
  {
    id: "orderedList",
    label: "Numbered list",
    description: "Ordered steps list",
    keywords: "numbered ordered list steps",
    icon: <ListOrdered className="size-4" />,
  },
  {
    id: "taskList",
    label: "Checklist",
    description: "Interactive markdown checkboxes",
    keywords: "check task todo roadmap",
    icon: <CheckSquare className="size-4" />,
  },
  {
    id: "quote",
    label: "Quote",
    description: "Highlighted blockquote callout",
    keywords: "blockquote callout quote",
    icon: <Quote className="size-4" />,
  },
  {
    id: "codeBlock",
    label: "Code block",
    description: "Fenced monospace snippet",
    keywords: "code pre snippet block",
    icon: <FileCode2 className="size-4" />,
  },
  {
    id: "table",
    label: "Table",
    description: "Three column GitHub table",
    keywords: "table grid rows columns",
    icon: <Table2 className="size-4" />,
  },
  {
    id: "divider",
    label: "Divider",
    description: "Horizontal rule separator",
    keywords: "divider hr rule line",
    icon: <SeparatorHorizontal className="size-4" />,
  },
  {
    id: "image",
    label: "Image",
    description: "Upload, crop and convert a WebP image or URL",
    keywords: "image picture photo webp banner",
    icon: <ImageIcon className="size-4" />,
  },
  {
    id: "emoji",
    label: "Emoji",
    description: "Pick an emoji to insert in your text",
    keywords: "emoji icon",
    icon: <Smile className="size-4" />,
  },
  {
    id: "stackGroup",
    label: "Tech stack group",
    description: "Create a new tech badge group below",
    keywords: "tech stack badges skills group",
    icon: <Layers className="size-4" />,
  },
  {
    id: "linksRow",
    label: "Links row",
    description: "Show and focus your social link buttons",
    keywords: "links social buttons cta",
    icon: <Link2 className="size-4" />,
  },
  {
    id: "snippet",
    label: "Snippet",
    description: "Insert structured developer status bullets",
    keywords: "snippet status template",
    icon: <Sparkles className="size-4" />,
  },
];

function ToolbarIconButton({
  label,
  tooltip,
  active = false,
  disabled = false,
  onClick,
  children,
}: {
  label: string;
  tooltip: string;
  active?: boolean;
  disabled?: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <Tooltip>
      <TooltipTrigger
        render={
          <StudioButton
            variant="ghost"
            size="icon"
            active={active}
            disabled={disabled}
            onClick={onClick}
            aria-label={label}
            className="size-8"
          />
        }
      >
        {children}
      </TooltipTrigger>
      <TooltipContent
        data-app="studio"
        className="border-0 bg-[var(--text)] text-[var(--bg)] shadow-[var(--shadow-float)]"
      >
        {tooltip}
      </TooltipContent>
    </Tooltip>
  );
}

const BUBBLE_MENU_OPTIONS = {
  placement: "top" as const,
  offset: 8,
  strategy: "fixed" as const,
};

const getBubbleMenuContainer = () =>
  document.querySelector<HTMLElement>('[data-app="studio"]') ?? document.body;

export interface LiveProfileCanvasHandle {
  insertToken: (token: string) => void;
  insertSnippet: (markdown: string) => void;
  openTemplates: () => void;
  openEditorImageStudio: () => void;
  scrollToPart: (part: CustomizePartId) => void;
}

interface LiveProfileCanvasProps {
  activePart: CustomizePartId;
  selectedStackCardId: string;
  onSelectPart: (part: CustomizePartId, stackCardId?: string) => void;
  creatureConfig: CreatureConfig;
  readmeConfig: ReadmeConfig;
  readmeMarkdown: string;
  snapshot: GitHubProfileSnapshot | null;
  imageUrlMap: Record<string, string>;
  activeCustomBannerAsset?: CustomImageMemoryAsset | null;
  githubTheme: "light" | "dark";
  onGithubThemeChange: (theme: "light" | "dark") => void;
  onUpdateReadmeField: <K extends keyof ReadmeConfig>(
    key: K,
    value: ReadmeConfig[K]
  ) => void;
  onChangeRawMarkdown: (raw: string | null) => void;
  onAddStackCard: (title?: string) => string;
  onToggleStackCardVisibility: (cardId: string, visible: boolean) => void;
  onReorderStackCards: (fromIdx: number, toIdx: number) => void;
  onSyncFromForm: () => void;
  onRegisterCustomImage: (asset: CustomImageMemoryAsset) => void;
  onSelectView: (view: CameraView) => void;
  onOpenAutoEvolve: () => void;
}

export const LiveProfileCanvas = forwardRef<
  LiveProfileCanvasHandle,
  LiveProfileCanvasProps
>(function LiveProfileCanvas(
  {
    activePart,
    selectedStackCardId,
    onSelectPart,
    creatureConfig,
    readmeConfig,
    readmeMarkdown,
    snapshot,
    imageUrlMap,
    activeCustomBannerAsset,
    githubTheme,
    onGithubThemeChange,
    onUpdateReadmeField,
    onChangeRawMarkdown,
    onAddStackCard,
    onToggleStackCardVisibility,
    onReorderStackCards,
    onSyncFromForm,
    onRegisterCustomImage,
    onSelectView,
    onOpenAutoEvolve,
  },
  ref
) {
  const [viewMode, setViewMode] = useState<CanvasViewMode>("visual");
  const [showSidebar, setShowSidebar] = useState(false);
  const [zoomMode, setZoomMode] = useState<ReadmeZoomMode>("fit");
  const [widthMode, setWidthMode] = useState<WidthMode>("github-848");
  const [fitZoom, setFitZoom] = useState(1);
  const [fullscreen, setFullscreen] = useState(false);
  const [rawWrapLines, setRawWrapLines] = useState(true);
  const [editRawMode, setEditRawMode] = useState(false);

  const [templatesOpen, setTemplatesOpen] = useState(false);
  const [editorImageOpen, setEditorImageOpen] = useState(false);
  const [confirmClearOpen, setConfirmClearOpen] = useState(false);
  const [emojisOpen, setEmojisOpen] = useState(false);

  const [linkPopoverOpen, setLinkPopoverOpen] = useState(false);
  const [linkUrlInput, setLinkUrlInput] = useState("https://");
  const [linkError, setLinkError] = useState<string | null>(null);
  const [bubbleLinkMode, setBubbleLinkMode] = useState(false);
  const [bubbleLinkInput, setBubbleLinkInput] = useState("https://");

  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [webpBusy, setWebpBusy] = useState(false);
  const [gifBusy, setGifBusy] = useState(false);
  const [shareBusy, setShareBusy] = useState(false);

  const [slashState, setSlashState] = useState<SlashState | null>(null);
  const [slashIndex, setSlashIndex] = useState(0);

  const canvasScrollRef = useRef<HTMLDivElement | null>(null);
  const lastEmittedMarkdownRef = useRef<string>(
    readmeConfig.advancedProfileMarkdown
  );
  const onUpdateFieldRef = useRef(onUpdateReadmeField);
  const onSelectPartRef = useRef(onSelectPart);

  useEffect(() => {
    onUpdateFieldRef.current = onUpdateReadmeField;
  }, [onUpdateReadmeField]);

  useEffect(() => {
    onSelectPartRef.current = onSelectPart;
  }, [onSelectPart]);

  const filteredSlashItems = useMemo(() => {
    if (!slashState) return [];
    const q = slashState.query.trim().toLowerCase();
    if (!q) return SLASH_ITEMS;
    return SLASH_ITEMS.filter(
      (item) =>
        item.label.toLowerCase().includes(q) ||
        item.keywords.toLowerCase().includes(q)
    );
  }, [slashState]);

  const slashStateRef = useRef(slashState);
  const filteredSlashRef = useRef(filteredSlashItems);
  const slashIndexRef = useRef(slashIndex);

  useEffect(() => {
    slashStateRef.current = slashState;
  }, [slashState]);

  useEffect(() => {
    filteredSlashRef.current = filteredSlashItems;
  }, [filteredSlashItems]);

  useEffect(() => {
    slashIndexRef.current = slashIndex;
  }, [slashIndex]);

  const executeSlashCommandRef = useRef<(item: SlashItem) => void>(() => {});

  const editor = useEditor({
    immediatelyRender: false,
    shouldRerenderOnTransaction: true,
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3, 4] },
        link: {
          openOnClick: false,
          autolink: true,
          HTMLAttributes: {
            rel: "noreferrer",
            target: "_blank",
          },
        },
      }),
      TextAlign.configure({
        types: ["heading", "paragraph"],
      }),
      TableKit.configure({
        table: { resizable: false },
      }),
      TaskList,
      TaskItem.configure({
        nested: true,
      }),
      StudioImageExtension.configure({
        inline: true,
        allowBase64: false,
      }),
      Placeholder.configure({
        placeholder:
          "Click to write your README intro or type slash to add blocks",
      }),
      CharacterCount,
    ],
    content: markdownToEditorHtml(
      readmeConfig.advancedProfileMarkdown,
      imageUrlMap
    ),
    editorProps: {
      handleKeyDown: (_view, event) => {
        const currentSlash = slashStateRef.current;
        const items = filteredSlashRef.current;
        if (!currentSlash || items.length === 0) {
          if (currentSlash && event.key === "Escape") {
            setSlashState(null);
            return true;
          }
          return false;
        }
        if (event.key === "ArrowDown") {
          event.preventDefault();
          setSlashIndex((i) => (i + 1) % items.length);
          return true;
        }
        if (event.key === "ArrowUp") {
          event.preventDefault();
          setSlashIndex((i) => (i - 1 + items.length) % items.length);
          return true;
        }
        if (event.key === "Enter") {
          event.preventDefault();
          const chosen = items[slashIndexRef.current] ?? items[0];
          if (chosen) executeSlashCommandRef.current(chosen);
          return true;
        }
        if (event.key === "Escape") {
          event.preventDefault();
          setSlashState(null);
          return true;
        }
        return false;
      },
    },
    onUpdate: ({ editor: activeEditor }) => {
      const serialized = tiptapJsonToGithubMarkdown(activeEditor.getJSON());
      lastEmittedMarkdownRef.current = serialized;
      onUpdateFieldRef.current("advancedProfileMarkdown", serialized);
    },
    onSelectionUpdate: ({ editor: activeEditor }) => {
      const { state, view } = activeEditor;
      const { $from, empty } = state.selection;
      if (!empty || $from.parent.type.spec.code) {
        setSlashState(null);
        return;
      }

      const textBefore = $from.parent.textContent.slice(0, $from.parentOffset);
      const match = textBefore.match(/(^|\s)\/([a-z0-9 ]*)$/i);
      if (!match) {
        setSlashState(null);
        return;
      }

      const slashOffsetInParent = (match.index ?? 0) + match[1].length;
      const fromPos = $from.start() + slashOffsetInParent;
      const toPos = $from.pos;
      try {
        const coords = view.coordsAtPos(toPos);
        setSlashState({
          from: fromPos,
          to: toPos,
          query: match[2],
          top: Math.min(window.innerHeight - 320, coords.bottom + 8),
          left: Math.min(window.innerWidth - 280, Math.max(16, coords.left)),
        });
        setSlashIndex(0);
      } catch {
        setSlashState(null);
      }
    },
  });

  useEffect(() => {
    executeSlashCommandRef.current = (item: SlashItem) => {
      if (!editor) return;
      const slash = slashStateRef.current;
      if (slash) {
        editor.chain().focus().deleteRange({ from: slash.from, to: slash.to }).run();
      } else {
        editor.chain().focus().run();
      }
      setSlashState(null);

      switch (item.id) {
        case "heading":
          editor.chain().focus().toggleHeading({ level: 2 }).run();
          break;
        case "paragraph":
          editor.chain().focus().setParagraph().run();
          break;
        case "bulletList":
          editor.chain().focus().toggleBulletList().run();
          break;
        case "orderedList":
          editor.chain().focus().toggleOrderedList().run();
          break;
        case "taskList":
          editor.chain().focus().toggleTaskList().run();
          break;
        case "quote":
          editor.chain().focus().toggleBlockquote().run();
          break;
        case "codeBlock":
          editor.chain().focus().toggleCodeBlock().run();
          break;
        case "table":
          editor
            .chain()
            .focus()
            .insertTable({ rows: 3, cols: 3, withHeaderRow: true })
            .run();
          break;
        case "divider":
          editor.chain().focus().setHorizontalRule().run();
          break;
        case "image":
          setEditorImageOpen(true);
          break;
        case "emoji":
          setEmojisOpen(true);
          break;
        case "stackGroup": {
          const id = onAddStackCard(
            `Stack group ${readmeConfig.stackCards.length + 1}`
          );
          onSelectPart("stack", id);
          break;
        }
        case "linksRow":
          onUpdateReadmeField("showLinksRow", true);
          onSelectPart("links");
          break;
        case "snippet":
          editor
            .chain()
            .focus()
            .insertContent(
              markdownToEditorHtml(
                [
                  "- Building open source developer tools",
                  "- Learning distributed systems",
                  "- Connect via GitHub or Email",
                ].join("\n"),
                imageUrlMap
              )
            )
            .run();
          break;
      }
    };
  }, [
    editor,
    imageUrlMap,
    onAddStackCard,
    onSelectPart,
    onUpdateReadmeField,
    readmeConfig.stackCards.length,
  ]);

  useEffect(() => {
    if (!editor) return;
    if (readmeConfig.advancedProfileMarkdown === lastEmittedMarkdownRef.current) {
      return;
    }
    lastEmittedMarkdownRef.current = readmeConfig.advancedProfileMarkdown;
    editor.commands.setContent(
      markdownToEditorHtml(readmeConfig.advancedProfileMarkdown, imageUrlMap),
      { emitUpdate: false }
    );
  }, [editor, readmeConfig.advancedProfileMarkdown, imageUrlMap]);

  const scrollToCanvasPart = (part: CustomizePartId) => {
    const container = canvasScrollRef.current;
    if (!container) return;
    const selector =
      part === "header" || part === "about"
        ? `[data-canvas-section="intro"]`
        : `[data-canvas-section="${part}"]`;
    const target = container.querySelector<HTMLElement>(selector);
    if (target) {
      target.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }
  };

  useImperativeHandle(
    ref,
    () => ({
      insertToken: (token: string) => {
        setViewMode("visual");
        editor?.chain().focus().insertContent(token).run();
      },
      insertSnippet: (markdown: string) => {
        setViewMode("visual");
        editor
          ?.chain()
          .focus()
          .insertContent(markdownToEditorHtml(markdown, imageUrlMap))
          .run();
      },
      openTemplates: () => setTemplatesOpen(true),
      openEditorImageStudio: () => setEditorImageOpen(true),
      scrollToPart: scrollToCanvasPart,
    }),
    [editor, imageUrlMap]
  );

  const stage = getEvolutionStage(creatureConfig.commits);
  const meta = getCreatureMeta(creatureConfig.creature);
  const viewLabel = getViewDisplayLabel(
    creatureConfig.creature,
    creatureConfig.view
  );
  const visibleLanguages = getVisibleLanguages(creatureConfig);
  const username = creatureConfig.username.trim() || "your-username";
  const badgeById = new Map(readmeConfig.badges.map((b) => [b.id, b]));
  const enabledLinks = readmeConfig.actionLinks.filter(
    (l) => l.enabled && l.label.trim()
  );

  const displayName = snapshot?.displayName || username;
  const statusBio = snapshot?.bio || "";
  const location = snapshot?.location || "";
  const company = snapshot?.company || "";
  const website = snapshot?.website || "";
  const derived = derivePalette(creatureConfig);

  const isMinimal = readmeConfig.templateId === "minimal-header";
  const isMarkerOnly = readmeConfig.templateId === "auto-evolve-block";
  const isAlignedLeft = readmeConfig.align === "left";
  const bannerWidthPx = Math.min(
    848,
    Math.max(320, readmeConfig.imageWidth || 760)
  );
  const customBannerWidthPx = Math.min(
    848,
    Math.max(320, readmeConfig.customBannerWidth || 760)
  );
  const customBannerAlign = readmeConfig.customBannerAlign || "center";

  const intrinsicWidth = showSidebar ? 1200 : 880;
  const zoomPct = Math.round(fitZoom * 100);

  const debouncedMarkdown = useDebouncedValue(readmeMarkdown, 90);

  const words = editor?.storage.characterCount?.words() ?? 0;
  const chars = editor?.storage.characterCount?.characters() ?? 0;
  const linesCount = readmeConfig.advancedProfileMarkdown
    ? readmeConfig.advancedProfileMarkdown.split(/\r?\n/).length
    : 0;

  const currentHeadingLabel = editor?.isActive("heading", { level: 1 })
    ? "Heading 1"
    : editor?.isActive("heading", { level: 2 })
      ? "Heading 2"
      : editor?.isActive("heading", { level: 3 })
        ? "Heading 3"
        : editor?.isActive("heading", { level: 4 })
          ? "Heading 4"
          : "Normal";

  const hasHeadingUnderline = Boolean(
    editor?.isActive("heading", { level: 1 }) ||
      editor?.isActive("heading", { level: 2 })
  );
  const inTable = Boolean(editor?.isActive("table"));

  const handleCopy = async (id: string, content: string) => {
    await copyToClipboard(content);
    setCopiedId(id);
    window.setTimeout(() => {
      setCopiedId((curr) => (curr === id ? null : curr));
    }, 1600);
  };

  const handleExportWebP = async () => {
    setWebpBusy(true);
    try {
      const sprite = await loadCreatureSprite(
        getSpriteKey(creatureConfig.creature, creatureConfig.view)
      );
      const blob = await encodeAnimatedWebPFromCreature(creatureConfig, sprite);
      downloadBlobFile("creature.webp", blob);
    } finally {
      setWebpBusy(false);
    }
  };

  const handleExportGif = async () => {
    setGifBusy(true);
    try {
      const sprite = await loadCreatureSprite(
        getSpriteKey(creatureConfig.creature, creatureConfig.view)
      );
      const blob = await encodeAnimatedGifFromCreature(creatureConfig, sprite);
      downloadBlobFile("creature.gif", blob);
    } finally {
      setGifBusy(false);
    }
  };

  const handleExportShareCardPng = async () => {
    setShareBusy(true);
    try {
      const sprite = await loadCreatureSprite(
        getSpriteKey(creatureConfig.creature, creatureConfig.view)
      );
      const blob = await exportShareCardPngBlob(creatureConfig, sprite);
      downloadBlobFile("share-card.png", blob);
    } finally {
      setShareBusy(false);
    }
  };

  const handleOpenLinkPopover = (open: boolean) => {
    if (open && editor) {
      const existing = String(editor.getAttributes("link").href ?? "");
      setLinkUrlInput(existing || "https://");
      setLinkError(null);
    }
    setLinkPopoverOpen(open);
  };

  const handleApplyLink = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editor) return;
    const raw = linkUrlInput.trim();
    if (!raw) {
      editor.chain().focus().unsetLink().run();
      setLinkPopoverOpen(false);
      return;
    }
    if (!isValidUrlInput(raw)) {
      setLinkError("Enter a valid URL starting with https://");
      return;
    }
    editor
      .chain()
      .focus()
      .extendMarkRange("link")
      .setLink({ href: normalizeInputUrl(raw) })
      .run();
    setLinkError(null);
    setLinkPopoverOpen(false);
  };

  const handleApplyTemplate = (
    templateMarkdown: string,
    applyMode: "replace" | "append"
  ) => {
    const nextMd =
      applyMode === "append" && readmeConfig.advancedProfileMarkdown.trim()
        ? `${readmeConfig.advancedProfileMarkdown.trim()}\n\n${templateMarkdown}`
        : templateMarkdown;
    onUpdateReadmeField("advancedProfileMarkdown", nextMd);
    if (editor) {
      editor
        .chain()
        .focus()
        .setContent(markdownToEditorHtml(nextMd, imageUrlMap))
        .run();
    }
  };

  const handleToggleHeadingUnderline = () => {
    if (!editor) return;
    if (
      editor.isActive("heading", { level: 1 }) ||
      editor.isActive("heading", { level: 2 })
    ) {
      editor.chain().focus().setHeading({ level: 3 }).run();
    } else {
      editor.chain().focus().setHeading({ level: 2 }).run();
    }
  };

  const formattingToolbar = (
    <div className="flex flex-wrap items-center gap-2 rounded-[10px] bg-[var(--surface-2)] px-2.5 py-1.5">
      {/* Group 1: Undo / Redo */}
      <div className="flex items-center gap-0.5">
        <ToolbarIconButton
          label="Undo"
          tooltip="Undo (Ctrl Z)"
          disabled={!editor?.can().undo()}
          onClick={() => editor?.chain().focus().undo().run()}
        >
          <Undo2 />
        </ToolbarIconButton>
        <ToolbarIconButton
          label="Redo"
          tooltip="Redo (Ctrl Y)"
          disabled={!editor?.can().redo()}
          onClick={() => editor?.chain().focus().redo().run()}
        >
          <Redo2 />
        </ToolbarIconButton>
      </div>

      {/* Group 2: Heading dropdown + Heading underline */}
      <div className="flex items-center gap-1">
        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <StudioButton
                variant="secondary"
                size="sm"
                className="h-8 bg-[var(--surface)] px-2.5 text-[12px]"
                aria-label="Text block level"
              />
            }
          >
            <Heading className="size-3.5" />
            <span>{currentHeadingLabel}</span>
            <ChevronDown className="size-3 text-[var(--text-2)]" />
          </DropdownMenuTrigger>
          <DropdownMenuContent
            data-app="studio"
            className="w-60 rounded-[12px] border-0 bg-[var(--surface)] p-1 text-[var(--text)] ring-0 shadow-[var(--shadow-float)]"
          >
            <DropdownMenuGroup>
              <DropdownMenuLabel className="text-[12px] text-[var(--text-2)]">
                Text block level
              </DropdownMenuLabel>
              <DropdownMenuItem
                onClick={() => editor?.chain().focus().setParagraph().run()}
              >
                Normal text (16px)
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() =>
                  editor?.chain().focus().toggleHeading({ level: 1 }).run()
                }
              >
                Heading 1 (with underline)
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() =>
                  editor?.chain().focus().toggleHeading({ level: 2 }).run()
                }
              >
                Heading 2 (with underline)
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() =>
                  editor?.chain().focus().toggleHeading({ level: 3 }).run()
                }
              >
                Heading 3 (no underline)
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() =>
                  editor?.chain().focus().toggleHeading({ level: 4 }).run()
                }
              >
                Heading 4 (small)
              </DropdownMenuItem>
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>

        <Tooltip>
          <TooltipTrigger
            render={
              <StudioButton
                variant="secondary"
                size="sm"
                active={hasHeadingUnderline}
                onClick={handleToggleHeadingUnderline}
                className={cn(
                  "h-8 px-2.5 text-[12px]",
                  !hasHeadingUnderline && "bg-[var(--surface)]"
                )}
                aria-label="Heading underline"
              />
            }
          >
            <span>Heading underline</span>
          </TooltipTrigger>
          <TooltipContent
            data-app="studio"
            className="border-0 bg-[var(--text)] text-[var(--bg)] shadow-[var(--shadow-float)]"
          >
            Toggle GitHub horizontal underline under this heading
          </TooltipContent>
        </Tooltip>
      </div>

      {/* Group 3: Inline styles */}
      <div className="flex items-center gap-0.5">
        <ToolbarIconButton
          label="Bold"
          tooltip="Bold (Ctrl B)"
          active={Boolean(editor?.isActive("bold"))}
          onClick={() => editor?.chain().focus().toggleBold().run()}
        >
          <Bold />
        </ToolbarIconButton>
        <ToolbarIconButton
          label="Italic"
          tooltip="Italic (Ctrl I)"
          active={Boolean(editor?.isActive("italic"))}
          onClick={() => editor?.chain().focus().toggleItalic().run()}
        >
          <Italic />
        </ToolbarIconButton>
        <ToolbarIconButton
          label="Underline"
          tooltip="Underline (Ctrl U)"
          active={Boolean(editor?.isActive("underline"))}
          onClick={() => editor?.chain().focus().toggleUnderline().run()}
        >
          <UnderlineIcon />
        </ToolbarIconButton>
        <ToolbarIconButton
          label="Strikethrough"
          tooltip="Strikethrough"
          active={Boolean(editor?.isActive("strike"))}
          onClick={() => editor?.chain().focus().toggleStrike().run()}
        >
          <Strikethrough />
        </ToolbarIconButton>
        <ToolbarIconButton
          label="Inline code"
          tooltip="Inline code"
          active={Boolean(editor?.isActive("code"))}
          onClick={() => editor?.chain().focus().toggleCode().run()}
        >
          <Code />
        </ToolbarIconButton>
        <ToolbarIconButton
          label="Clear formatting"
          tooltip="Clear formatting"
          onClick={() =>
            editor?.chain().focus().unsetAllMarks().clearNodes().run()
          }
        >
          <RemoveFormatting />
        </ToolbarIconButton>
      </div>

      {/* Group 4: Alignment */}
      <div className="flex items-center gap-0.5">
        <ToolbarIconButton
          label="Align left"
          tooltip="Align left"
          active={Boolean(editor?.isActive({ textAlign: "left" }))}
          onClick={() => editor?.chain().focus().setTextAlign("left").run()}
        >
          <AlignLeft />
        </ToolbarIconButton>
        <ToolbarIconButton
          label="Align center"
          tooltip="Align center"
          active={Boolean(editor?.isActive({ textAlign: "center" }))}
          onClick={() => editor?.chain().focus().setTextAlign("center").run()}
        >
          <AlignCenter />
        </ToolbarIconButton>
        <ToolbarIconButton
          label="Align right"
          tooltip="Align right"
          active={Boolean(editor?.isActive({ textAlign: "right" }))}
          onClick={() => editor?.chain().focus().setTextAlign("right").run()}
        >
          <AlignRight />
        </ToolbarIconButton>
      </div>

      {/* Group 5: Lists, Quote, Code block */}
      <div className="flex items-center gap-0.5">
        <ToolbarIconButton
          label="Bullet list"
          tooltip="Bullet list"
          active={Boolean(editor?.isActive("bulletList"))}
          onClick={() => editor?.chain().focus().toggleBulletList().run()}
        >
          <List />
        </ToolbarIconButton>
        <ToolbarIconButton
          label="Numbered list"
          tooltip="Numbered list"
          active={Boolean(editor?.isActive("orderedList"))}
          onClick={() => editor?.chain().focus().toggleOrderedList().run()}
        >
          <ListOrdered />
        </ToolbarIconButton>
        <ToolbarIconButton
          label="Checklist"
          tooltip="Task checklist"
          active={Boolean(editor?.isActive("taskList"))}
          onClick={() => editor?.chain().focus().toggleTaskList().run()}
        >
          <CheckSquare />
        </ToolbarIconButton>
        <ToolbarIconButton
          label="Quote"
          tooltip="Blockquote"
          active={Boolean(editor?.isActive("blockquote"))}
          onClick={() => editor?.chain().focus().toggleBlockquote().run()}
        >
          <Quote />
        </ToolbarIconButton>
        <ToolbarIconButton
          label="Code block"
          tooltip="Code block"
          active={Boolean(editor?.isActive("codeBlock"))}
          onClick={() => editor?.chain().focus().toggleCodeBlock().run()}
        >
          <FileCode2 />
        </ToolbarIconButton>
      </div>

      {/* Group 6: Divider, Link, Image, Table, Emoji, Snippets */}
      <div className="flex items-center gap-0.5">
        <ToolbarIconButton
          label="Divider"
          tooltip="Insert horizontal divider"
          onClick={() => editor?.chain().focus().setHorizontalRule().run()}
        >
          <SeparatorHorizontal />
        </ToolbarIconButton>

        <Popover open={linkPopoverOpen} onOpenChange={handleOpenLinkPopover}>
          <Tooltip>
            <TooltipTrigger
              render={
                <PopoverTrigger
                  render={
                    <StudioButton
                      variant="ghost"
                      size="icon"
                      active={Boolean(editor?.isActive("link"))}
                      aria-label="Insert or edit link"
                      className="size-8"
                    />
                  }
                >
                  <Link2 />
                </PopoverTrigger>
              }
            />
            <TooltipContent
              data-app="studio"
              className="border-0 bg-[var(--text)] text-[var(--bg)] shadow-[var(--shadow-float)]"
            >
              Insert or edit link
            </TooltipContent>
          </Tooltip>
          <PopoverContent
            data-app="studio"
            className="w-80 rounded-[12px] border-0 bg-[var(--surface)] p-4 text-[var(--text)] ring-0 shadow-[var(--shadow-float)]"
          >
            <form onSubmit={handleApplyLink} className="flex flex-col gap-3">
              <div className="text-[14px] font-semibold text-[var(--text)]">
                Add or edit link
              </div>
              <StudioField
                label="Target URL"
                htmlFor="canvas-link-url"
                error={linkError}
              >
                <StudioInput
                  id="canvas-link-url"
                  value={linkUrlInput}
                  invalid={Boolean(linkError)}
                  onChange={(e) => {
                    setLinkUrlInput(e.target.value);
                    if (linkError) setLinkError(null);
                  }}
                  placeholder="https://github.com/..."
                />
              </StudioField>
              <div className="flex items-center justify-between gap-2">
                {editor?.isActive("link") && (
                  <StudioButton
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      editor.chain().focus().unsetLink().run();
                      setLinkPopoverOpen(false);
                    }}
                  >
                    <Unlink />
                    <span>Remove</span>
                  </StudioButton>
                )}
                <StudioButton
                  type="submit"
                  variant="primary"
                  size="sm"
                  className="ml-auto"
                >
                  Apply link
                </StudioButton>
              </div>
            </form>
          </PopoverContent>
        </Popover>

        <ToolbarIconButton
          label="Insert image"
          tooltip="Insert custom WebP image or URL"
          onClick={() => setEditorImageOpen(true)}
        >
          <ImageIcon />
        </ToolbarIconButton>

        <ToolbarIconButton
          label="Insert table"
          tooltip="Insert three column table"
          active={inTable}
          onClick={() =>
            editor
              ?.chain()
              .focus()
              .insertTable({ rows: 3, cols: 3, withHeaderRow: true })
              .run()
          }
        >
          <Table2 />
        </ToolbarIconButton>

        <Popover open={emojisOpen} onOpenChange={setEmojisOpen}>
          <Tooltip>
            <TooltipTrigger
              render={
                <PopoverTrigger
                  render={
                    <StudioButton
                      variant="ghost"
                      size="icon"
                      aria-label="Insert emoji into README"
                      className="size-8"
                    />
                  }
                >
                  <Smile />
                </PopoverTrigger>
              }
            />
            <TooltipContent
              data-app="studio"
              className="border-0 bg-[var(--text)] text-[var(--bg)] shadow-[var(--shadow-float)]"
            >
              Insert emoji into README
            </TooltipContent>
          </Tooltip>
          <PopoverContent
            data-app="studio"
            className="w-72 rounded-[12px] border-0 bg-[var(--surface)] p-3 text-[var(--text)] ring-0 shadow-[var(--shadow-float)]"
          >
            <div className="mb-2 text-[13px] font-semibold text-[var(--text)]">
              Insert emoji
            </div>
            <div className="grid grid-cols-6 gap-1">
              {PROFILE_EMOJIS.map((emoji) => (
                <button
                  key={emoji}
                  type="button"
                  onClick={() => {
                    editor?.chain().focus().insertContent(emoji).run();
                    setEmojisOpen(false);
                  }}
                  className="flex size-9 cursor-pointer items-center justify-center rounded-[8px] text-base transition-colors duration-150 hover:bg-[var(--surface-2)]"
                >
                  {emoji}
                </button>
              ))}
            </div>
          </PopoverContent>
        </Popover>

        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <StudioButton
                variant="ghost"
                size="sm"
                className="h-8 px-2 text-[12px]"
                aria-label="Insert snippet"
              />
            }
          >
            <Sparkles className="size-3.5" />
            <span>Snippets</span>
            <ChevronDown className="size-3 text-[var(--text-2)]" />
          </DropdownMenuTrigger>
          <DropdownMenuContent
            data-app="studio"
            className="w-60 rounded-[12px] border-0 bg-[var(--surface)] p-1 text-[var(--text)] ring-0 shadow-[var(--shadow-float)]"
          >
            <DropdownMenuGroup>
              <DropdownMenuLabel className="text-[12px] text-[var(--text-2)]">
                Insert block
              </DropdownMenuLabel>
              <DropdownMenuItem
                onClick={() =>
                  editor
                    ?.chain()
                    .focus()
                    .insertContent(
                      markdownToEditorHtml(
                        [
                          "- Building open source web tools",
                          "- Learning distributed systems",
                          "- Connect via GitHub or Email",
                        ].join("\n"),
                        imageUrlMap
                      )
                    )
                    .run()
                }
              >
                Developer status bullets
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() =>
                  editor
                    ?.chain()
                    .focus()
                    .insertContent(
                      markdownToEditorHtml(
                        "> Current focus: Building clean architecture and open source developer tools.",
                        imageUrlMap
                      )
                    )
                    .run()
                }
              >
                Highlight callout quote
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() =>
                  editor
                    ?.chain()
                    .focus()
                    .insertContent(
                      markdownToEditorHtml(
                        [
                          "- [x] Shipped v1.0 open source release",
                          "- [ ] Exploring distributed systems",
                        ].join("\n"),
                        imageUrlMap
                      )
                    )
                    .run()
                }
              >
                Roadmap checklist
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem
                onClick={() =>
                  editor
                    ?.chain()
                    .focus()
                    .insertContent(
                      markdownToEditorHtml(
                        `![Profile views](https://komarev.com/ghpvc/?username=${encodeURIComponent(username)}&color=58D6B0&style=for-the-badge)`,
                        imageUrlMap
                      )
                    )
                    .run()
                }
              >
                Profile visitor counter badge
              </DropdownMenuItem>
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Right actions: Templates, Sync, Clear, Copy MD, Fullscreen */}
      <div className="ml-auto flex flex-wrap items-center gap-1">
        <StudioButton
          variant="secondary"
          size="sm"
          className="h-8 bg-[var(--surface)] px-2.5 text-[12px]"
          onClick={() => setTemplatesOpen(true)}
        >
          <LayoutTemplate className="size-3.5" />
          <span>Templates ({PROFILE_EDITOR_TEMPLATES.length})</span>
        </StudioButton>

        <Tooltip>
          <TooltipTrigger
            render={
              <StudioButton
                variant="ghost"
                size="icon"
                aria-label="Sync from form"
                onClick={onSyncFromForm}
                className="size-8"
              />
            }
          >
            <RotateCcw />
          </TooltipTrigger>
          <TooltipContent
            data-app="studio"
            className="border-0 bg-[var(--text)] text-[var(--bg)] shadow-[var(--shadow-float)]"
          >
            Sync intro from GitHub profile form
          </TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger
            render={
              <StudioButton
                variant="ghost"
                size="icon"
                aria-label="Clear all intro text"
                onClick={() => setConfirmClearOpen(true)}
                className="size-8 hover:text-[var(--danger)]"
              />
            }
          >
            <Eraser />
          </TooltipTrigger>
          <TooltipContent
            data-app="studio"
            className="border-0 bg-[var(--text)] text-[var(--bg)] shadow-[var(--shadow-float)]"
          >
            Clear header and intro text
          </TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger
            render={
              <StudioButton
                variant="ghost"
                size="icon"
                aria-label="Copy markdown"
                onClick={() => void handleCopy("intro-md", readmeMarkdown)}
                className="size-8"
              />
            }
          >
            {copiedId === "intro-md" ? <Check /> : <Copy />}
          </TooltipTrigger>
          <TooltipContent
            data-app="studio"
            className="border-0 bg-[var(--text)] text-[var(--bg)] shadow-[var(--shadow-float)]"
          >
            Copy full README markdown
          </TooltipContent>
        </Tooltip>

        <ToolbarIconButton
          label={fullscreen ? "Exit fullscreen" : "Fullscreen editor"}
          tooltip={fullscreen ? "Exit fullscreen" : "Fullscreen canvas"}
          active={fullscreen}
          onClick={() => setFullscreen((prev) => !prev)}
        >
          {fullscreen ? <Minimize2 /> : <Maximize2 />}
        </ToolbarIconButton>
      </div>
    </div>
  );

  const dynamicTokenChips = (
    <div className="flex flex-wrap items-center gap-1.5">
      <span className="mr-1 text-[12px] font-medium text-[var(--text-2)]">
        Dynamic values
      </span>
      {DYNAMIC_TOKENS.map((t) => {
        const resolved = resolveDynamicTokens(t.token, creatureConfig);
        return (
          <Tooltip key={t.token}>
            <TooltipTrigger
              render={
                <button
                  type="button"
                  onClick={() => {
                    editor?.chain().focus().insertContent(t.token).run();
                  }}
                  className="studio-mono inline-flex h-7 cursor-pointer items-center rounded-[6px] bg-[var(--surface-2)] px-2 text-[11px] text-[var(--text)] transition-colors duration-150 hover:bg-[var(--surface-3)]"
                />
              }
            >
              {t.token}
            </TooltipTrigger>
            <TooltipContent
              data-app="studio"
              className="border-0 bg-[var(--text)] text-[var(--bg)] shadow-[var(--shadow-float)]"
            >
              <span>
                {t.description}: <strong className="studio-mono">{resolved}</strong>
              </span>
            </TooltipContent>
          </Tooltip>
        );
      })}
    </div>
  );

  const readmeBoxContent = (isModalFullscreen: boolean) => {
    const innerContent = (
      <div
        data-gh-theme={githubTheme}
        className={cn(
          "grid items-start",
          !isModalFullscreen && widthMode === "fit-pane"
            ? "w-full grid-cols-1"
            : showSidebar && !isModalFullscreen
              ? "w-[1200px] grid-cols-[296px_880px] gap-6"
              : "w-[880px] grid-cols-1"
        )}
      >
        {/* Optional Read-only GitHub Sidebar */}
        {showSidebar && !isModalFullscreen && (
          <aside className="flex w-[296px] flex-col gap-4 rounded-[6px] border border-[var(--gh-border)] bg-[var(--gh-bg)] p-4 text-[var(--gh-text)]">
            {snapshot?.avatarUrl ? (
              <img
                src={snapshot.avatarUrl}
                alt={displayName}
                className="size-64 max-w-full rounded-full border border-[var(--gh-border)] object-cover"
              />
            ) : (
              <div className="studio-mono flex size-24 items-center justify-center rounded-full border border-[var(--gh-border)] bg-[var(--gh-surface)] text-xl font-semibold text-[var(--gh-text)]">
                {displayName.slice(0, 2).toUpperCase()}
              </div>
            )}

            <div className="flex flex-col">
              <div className="text-[20px] leading-snug font-semibold text-[var(--gh-text)]">
                {displayName}
              </div>
              <div className="text-[16px] font-light text-[var(--gh-muted)]">
                {username}
              </div>
            </div>

            {statusBio && (
              <p className="text-[14px] leading-5 text-[var(--gh-text)]">
                {resolveDynamicTokens(statusBio, creatureConfig)}
              </p>
            )}

            <a
              href="https://github.com/settings/profile"
              target="_blank"
              rel="noreferrer"
              className="inline-flex h-8 w-full items-center justify-center gap-1.5 rounded-[6px] border border-[var(--gh-border)] bg-[var(--gh-surface)] text-[13px] font-medium text-[var(--gh-text)] transition-opacity duration-150 hover:opacity-85"
            >
              <span>Edit on GitHub</span>
              <ExternalLink className="size-3.5 text-[var(--gh-muted)]" />
            </a>

            <div className="flex flex-col gap-1.5 text-[13px] text-[var(--gh-muted)]">
              {company && (
                <div className="flex items-center gap-2">
                  <Building2 className="size-4 shrink-0" />
                  <span className="truncate">{company}</span>
                </div>
              )}
              {location && (
                <div className="flex items-center gap-2">
                  <MapPin className="size-4 shrink-0" />
                  <span className="truncate">{location}</span>
                </div>
              )}
              {website && (
                <div className="flex items-center gap-2">
                  <Link2 className="size-4 shrink-0" />
                  <span
                    className="truncate"
                    style={{ color: "var(--gh-link)" }}
                  >
                    {website.replace(/^https?:\/\//, "")}
                  </span>
                </div>
              )}
            </div>
          </aside>
        )}

        {/* Authentic 848px GitHub README Box (880px = 848px content + 16px horizontal padding) */}
        <div
          className={cn(
            "rounded-[6px] border border-[var(--gh-border)] bg-[var(--gh-bg)] text-[var(--gh-text)]",
            !isModalFullscreen && widthMode === "fit-pane" ? "w-full" : "w-[880px]"
          )}
        >
          <div className="flex items-center justify-between border-b border-[var(--gh-border)] bg-[var(--gh-surface)] px-4 py-2 text-[12px] text-[var(--gh-muted)]">
            <span className="studio-mono font-medium text-[var(--gh-text)]">
              {username}/README.md
            </span>
            <span className="tabular-nums">
              {!isModalFullscreen && widthMode === "fit-pane"
                ? "Fit width"
                : "GitHub width 848px"}
            </span>
          </div>

          <div className="px-4 py-6">
            <div
              className={cn(
                "flex flex-col gap-5",
                !isModalFullscreen && widthMode === "fit-pane"
                  ? "w-full"
                  : "mx-auto w-[848px]"
              )}
            >
              {/* 1. Header and About in-place TipTap surface */}
              {!isMarkerOnly && (
                <div
                  data-canvas-section="intro"
                  onClick={() => {
                    if (activePart !== "header" && activePart !== "about") {
                      onSelectPart("about");
                    }
                  }}
                  className={cn(
                    "gh-markdown-body rounded-[8px] px-2 py-1 transition-colors duration-150",
                    (activePart === "header" || activePart === "about") &&
                      "bg-[var(--gh-surface)]/45"
                  )}
                >
                  {editor && (
                    <BubbleMenu
                      editor={editor}
                      options={BUBBLE_MENU_OPTIONS}
                      appendTo={getBubbleMenuContainer}
                      updateDelay={100}
                      className="z-50 flex flex-wrap items-center gap-0.5 rounded-[10px] bg-[var(--surface)] p-1 text-[var(--text)] shadow-[var(--shadow-float)]"
                    >
                      <button
                        type="button"
                        onClick={() => editor.chain().focus().setParagraph().run()}
                        className={cn(
                          "h-7 cursor-pointer rounded-[6px] px-2 text-[12px] font-medium transition-colors duration-150",
                          editor.isActive("paragraph")
                            ? "bg-[var(--surface-3)] text-[var(--text)]"
                            : "text-[var(--text-2)] hover:text-[var(--text)]"
                        )}
                      >
                        Text
                      </button>
                      {([1, 2, 3] as const).map((lvl) => (
                        <button
                          key={lvl}
                          type="button"
                          onClick={() =>
                            editor
                              .chain()
                              .focus()
                              .toggleHeading({ level: lvl })
                              .run()
                          }
                          className={cn(
                            "h-7 cursor-pointer rounded-[6px] px-2 text-[12px] font-medium transition-colors duration-150",
                            editor.isActive("heading", { level: lvl })
                              ? "bg-[var(--surface-3)] text-[var(--text)]"
                              : "text-[var(--text-2)] hover:text-[var(--text)]"
                          )}
                        >
                          H{lvl}
                        </button>
                      ))}
                      <button
                        type="button"
                        aria-label="Bubble bold"
                        onClick={() => editor.chain().focus().toggleBold().run()}
                        className={cn(
                          "flex size-7 cursor-pointer items-center justify-center rounded-[6px] transition-colors duration-150",
                          editor.isActive("bold")
                            ? "bg-[var(--surface-3)] text-[var(--text)]"
                            : "text-[var(--text-2)] hover:text-[var(--text)]"
                        )}
                      >
                        <Bold className="size-3.5" />
                      </button>
                      <button
                        type="button"
                        aria-label="Bubble italic"
                        onClick={() =>
                          editor.chain().focus().toggleItalic().run()
                        }
                        className={cn(
                          "flex size-7 cursor-pointer items-center justify-center rounded-[6px] transition-colors duration-150",
                          editor.isActive("italic")
                            ? "bg-[var(--surface-3)] text-[var(--text)]"
                            : "text-[var(--text-2)] hover:text-[var(--text)]"
                        )}
                      >
                        <Italic className="size-3.5" />
                      </button>
                      <button
                        type="button"
                        aria-label="Bubble underline"
                        onClick={() =>
                          editor.chain().focus().toggleUnderline().run()
                        }
                        className={cn(
                          "flex size-7 cursor-pointer items-center justify-center rounded-[6px] transition-colors duration-150",
                          editor.isActive("underline")
                            ? "bg-[var(--surface-3)] text-[var(--text)]"
                            : "text-[var(--text-2)] hover:text-[var(--text)]"
                        )}
                      >
                        <UnderlineIcon className="size-3.5" />
                      </button>
                      <button
                        type="button"
                        aria-label="Bubble strikethrough"
                        onClick={() =>
                          editor.chain().focus().toggleStrike().run()
                        }
                        className={cn(
                          "flex size-7 cursor-pointer items-center justify-center rounded-[6px] transition-colors duration-150",
                          editor.isActive("strike")
                            ? "bg-[var(--surface-3)] text-[var(--text)]"
                            : "text-[var(--text-2)] hover:text-[var(--text)]"
                        )}
                      >
                        <Strikethrough className="size-3.5" />
                      </button>
                      <button
                        type="button"
                        aria-label="Bubble inline code"
                        onClick={() => editor.chain().focus().toggleCode().run()}
                        className={cn(
                          "flex size-7 cursor-pointer items-center justify-center rounded-[6px] transition-colors duration-150",
                          editor.isActive("code")
                            ? "bg-[var(--surface-3)] text-[var(--text)]"
                            : "text-[var(--text-2)] hover:text-[var(--text)]"
                        )}
                      >
                        <Code className="size-3.5" />
                      </button>
                      <button
                        type="button"
                        aria-label="Bubble link"
                        onClick={() => {
                          const existing = String(
                            editor.getAttributes("link").href ?? ""
                          );
                          setBubbleLinkInput(existing || "https://");
                          setBubbleLinkMode((prev) => !prev);
                        }}
                        className={cn(
                          "flex size-7 cursor-pointer items-center justify-center rounded-[6px] transition-colors duration-150",
                          editor.isActive("link") || bubbleLinkMode
                            ? "bg-[var(--surface-3)] text-[var(--text)]"
                            : "text-[var(--text-2)] hover:text-[var(--text)]"
                        )}
                      >
                        <Link2 className="size-3.5" />
                      </button>

                      {bubbleLinkMode && (
                        <form
                          onSubmit={(e) => {
                            e.preventDefault();
                            if (!bubbleLinkInput.trim()) {
                              editor.chain().focus().unsetLink().run();
                            } else if (isValidUrlInput(bubbleLinkInput)) {
                              editor
                                .chain()
                                .focus()
                                .extendMarkRange("link")
                                .setLink({
                                  href: normalizeInputUrl(bubbleLinkInput),
                                })
                                .run();
                            }
                            setBubbleLinkMode(false);
                          }}
                          className="ml-1 flex items-center gap-1"
                        >
                          <input
                            value={bubbleLinkInput}
                            onChange={(e) => setBubbleLinkInput(e.target.value)}
                            placeholder="https://..."
                            className="h-7 w-40 rounded-[6px] bg-[var(--surface-2)] px-2 text-[12px] text-[var(--text)] focus:outline-none"
                          />
                          <StudioButton type="submit" variant="primary" size="sm" className="h-7 px-2 text-[12px]">
                            Set
                          </StudioButton>
                        </form>
                      )}
                    </BubbleMenu>
                  )}

                  <EditorContent editor={editor} />
                </div>
              )}

              {/* 2. Interactive Tech Stack Group Blocks */}
              {!isMarkerOnly && !isMinimal && (
                <div data-canvas-section="stack" className="flex flex-col gap-3">
                  {readmeConfig.stackCards.map((card, cardIdx) => {
                    if (card.visible === false) return null;
                    const cardBadges = card.badgeIds
                      .map((id) => badgeById.get(id))
                      .filter((b): b is ReadmeBadge =>
                        Boolean(b && b.label.trim())
                      );
                    if (cardBadges.length === 0) return null;

                    const selectedBlock =
                      activePart === "stack" && selectedStackCardId === card.id;

                    return (
                      <div
                        key={card.id}
                        role="button"
                        tabIndex={0}
                        onClick={() => onSelectPart("stack", card.id)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" || e.key === " ") {
                            e.preventDefault();
                            onSelectPart("stack", card.id);
                          }
                        }}
                        className={cn(
                          "group relative flex cursor-pointer flex-col gap-2 rounded-[8px] px-3 py-2.5 transition-colors duration-150",
                          selectedBlock
                            ? "bg-[var(--surface-3)]/35"
                            : "hover:bg-[var(--surface-2)]/30"
                        )}
                      >
                        {/* Floating block handle */}
                        <div
                          onClick={(e) => e.stopPropagation()}
                          className="pointer-events-none absolute -top-3 right-2 z-10 flex items-center gap-0.5 rounded-[8px] bg-[var(--surface)] p-1 text-[var(--text)] opacity-0 shadow-[var(--shadow-float)] transition-opacity duration-150 group-hover:pointer-events-auto group-hover:opacity-100 group-focus-within:pointer-events-auto group-focus-within:opacity-100"
                        >
                          <button
                            type="button"
                            onClick={() => onSelectPart("stack", card.id)}
                            className="inline-flex h-7 cursor-pointer items-center gap-1 rounded-[6px] px-2 text-[12px] font-medium text-[var(--text)] hover:bg-[var(--surface-2)]"
                          >
                            <Edit3 className="size-3" />
                            <span>Edit</span>
                          </button>
                          <button
                            type="button"
                            disabled={cardIdx === 0}
                            onClick={() =>
                              onReorderStackCards(cardIdx, cardIdx - 1)
                            }
                            aria-label="Move stack group up"
                            title="Move up"
                            className="flex size-7 cursor-pointer items-center justify-center rounded-[6px] text-[var(--text-2)] hover:bg-[var(--surface-2)] hover:text-[var(--text)] disabled:opacity-35"
                          >
                            <ArrowUp className="size-3.5" />
                          </button>
                          <button
                            type="button"
                            disabled={
                              cardIdx === readmeConfig.stackCards.length - 1
                            }
                            onClick={() =>
                              onReorderStackCards(cardIdx, cardIdx + 1)
                            }
                            aria-label="Move stack group down"
                            title="Move down"
                            className="flex size-7 cursor-pointer items-center justify-center rounded-[6px] text-[var(--text-2)] hover:bg-[var(--surface-2)] hover:text-[var(--text)] disabled:opacity-35"
                          >
                            <ArrowDown className="size-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() =>
                              onToggleStackCardVisibility(card.id, false)
                            }
                            aria-label="Hide stack group"
                            title="Hide"
                            className="inline-flex h-7 cursor-pointer items-center gap-1 rounded-[6px] px-2 text-[12px] text-[var(--text-2)] hover:bg-[var(--surface-2)] hover:text-[var(--text)]"
                          >
                            <EyeOff className="size-3" />
                            <span>Hide</span>
                          </button>
                        </div>

                        {card.title.trim() && (
                          <h4
                            className={cn(
                              "text-[16px] leading-tight font-semibold text-[var(--gh-text)]",
                              isAlignedLeft ? "text-left" : "text-center"
                            )}
                          >
                            {card.title}
                          </h4>
                        )}
                        <div
                          className={cn(
                            "flex flex-wrap gap-1.5",
                            isAlignedLeft ? "justify-start" : "justify-center"
                          )}
                        >
                          {cardBadges.map((badge) => (
                            <img
                              key={`${card.id}-${badge.id}`}
                              src={buildShieldBadgeUrl(badge)}
                              alt={badge.label}
                              className="h-7 w-auto"
                            />
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* 3. Interactive Links Row */}
              {!isMarkerOnly &&
                !isMinimal &&
                readmeConfig.showLinksRow !== false &&
                enabledLinks.length > 0 && (
                  <div
                    data-canvas-section="links"
                    role="button"
                    tabIndex={0}
                    onClick={() => onSelectPart("links")}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        onSelectPart("links");
                      }
                    }}
                    className={cn(
                      "group relative flex cursor-pointer flex-wrap gap-2 rounded-[8px] px-3 py-2.5 transition-colors duration-150",
                      isAlignedLeft ? "justify-start" : "justify-center",
                      activePart === "links"
                        ? "bg-[var(--surface-3)]/35"
                        : "hover:bg-[var(--surface-2)]/30"
                    )}
                  >
                    <div
                      onClick={(e) => e.stopPropagation()}
                      className="pointer-events-none absolute -top-3 right-2 z-10 flex items-center gap-0.5 rounded-[8px] bg-[var(--surface)] p-1 text-[var(--text)] opacity-0 shadow-[var(--shadow-float)] transition-opacity duration-150 group-hover:pointer-events-auto group-hover:opacity-100 group-focus-within:pointer-events-auto group-focus-within:opacity-100"
                    >
                      <button
                        type="button"
                        onClick={() => onSelectPart("links")}
                        className="inline-flex h-7 cursor-pointer items-center gap-1 rounded-[6px] px-2 text-[12px] font-medium text-[var(--text)] hover:bg-[var(--surface-2)]"
                      >
                        <Edit3 className="size-3" />
                        <span>Edit</span>
                      </button>
                      <button
                        type="button"
                        disabled
                        title="Order follows your tech stack"
                        aria-label="Move links up"
                        className="flex size-7 items-center justify-center rounded-[6px] text-[var(--text-3)] opacity-40"
                      >
                        <ArrowUp className="size-3.5" />
                      </button>
                      <button
                        type="button"
                        disabled
                        title="Order sits above the banner"
                        aria-label="Move links down"
                        className="flex size-7 items-center justify-center rounded-[6px] text-[var(--text-3)] opacity-40"
                      >
                        <ArrowDown className="size-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          onUpdateReadmeField("showLinksRow", false)
                        }
                        aria-label="Hide links row"
                        className="inline-flex h-7 cursor-pointer items-center gap-1 rounded-[6px] px-2 text-[12px] text-[var(--text-2)] hover:bg-[var(--surface-2)] hover:text-[var(--text)]"
                      >
                        <EyeOff className="size-3" />
                        <span>Hide</span>
                      </button>
                    </div>

                    {enabledLinks.map((link) => {
                      const href = resolveDynamicTokens(link.url, creatureConfig);
                      return (
                        <a
                          key={link.id}
                          href={href}
                          onClick={(e) => {
                            e.preventDefault();
                            onSelectPart("links");
                          }}
                        >
                          <img
                            src={buildActionLinkBadgeUrl(link, creatureConfig)}
                            alt={link.label}
                            className="h-7 w-auto transition-opacity duration-150 hover:opacity-85"
                          />
                        </a>
                      );
                    })}
                  </div>
                )}

              {/* 4. Interactive Creature or Custom Image Banner */}
              {readmeConfig.showCreatureBanner !== false && (
                <div
                  data-canvas-section="creature"
                  role="button"
                  tabIndex={0}
                  onClick={() => onSelectPart("creature")}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      onSelectPart("creature");
                    }
                  }}
                  className={cn(
                    "group relative flex cursor-pointer rounded-[8px] px-2 py-2.5 transition-colors duration-150",
                    readmeConfig.bannerSource === "custom-image" &&
                      customBannerAlign === "left"
                      ? "justify-start"
                      : readmeConfig.bannerSource === "custom-image" &&
                          customBannerAlign === "right"
                        ? "justify-end"
                        : "justify-center",
                    activePart === "creature"
                      ? "bg-[var(--surface-3)]/35"
                      : "hover:bg-[var(--surface-2)]/30"
                  )}
                >
                  <div
                    onClick={(e) => e.stopPropagation()}
                    className="pointer-events-none absolute -top-3 right-2 z-10 flex items-center gap-0.5 rounded-[8px] bg-[var(--surface)] p-1 text-[var(--text)] opacity-0 shadow-[var(--shadow-float)] transition-opacity duration-150 group-hover:pointer-events-auto group-hover:opacity-100 group-focus-within:pointer-events-auto group-focus-within:opacity-100"
                  >
                    <button
                      type="button"
                      onClick={() => onSelectPart("creature")}
                      className="inline-flex h-7 cursor-pointer items-center gap-1 rounded-[6px] px-2 text-[12px] font-medium text-[var(--text)] hover:bg-[var(--surface-2)]"
                    >
                      <Edit3 className="size-3" />
                      <span>Edit</span>
                    </button>
                    <button
                      type="button"
                      disabled
                      title="Banner stays at the bottom of the README"
                      aria-label="Move banner up"
                      className="flex size-7 items-center justify-center rounded-[6px] text-[var(--text-3)] opacity-40"
                    >
                      <ArrowUp className="size-3.5" />
                    </button>
                    <button
                      type="button"
                      disabled
                      title="Banner stays at the bottom of the README"
                      aria-label="Move banner down"
                      className="flex size-7 items-center justify-center rounded-[6px] text-[var(--text-3)] opacity-40"
                    >
                      <ArrowDown className="size-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        onUpdateReadmeField("showCreatureBanner", false)
                      }
                      aria-label="Hide banner"
                      className="inline-flex h-7 cursor-pointer items-center gap-1 rounded-[6px] px-2 text-[12px] text-[var(--text-2)] hover:bg-[var(--surface-2)] hover:text-[var(--text)]"
                    >
                      <EyeOff className="size-3" />
                      <span>Hide</span>
                    </button>
                  </div>

                  {readmeConfig.bannerSource === "custom-image" &&
                  activeCustomBannerAsset ? (
                    <div
                      style={{
                        width: `${customBannerWidthPx}px`,
                        maxWidth: "100%",
                      }}
                    >
                      <img
                        src={activeCustomBannerAsset.previewUrl}
                        alt={
                          readmeConfig.customBannerAlt ||
                          activeCustomBannerAsset.alt
                        }
                        className="block h-auto w-full rounded-[6px]"
                      />
                    </div>
                  ) : readmeConfig.bannerSource === "custom-image" ? (
                    <div className="flex h-36 w-full items-center justify-center rounded-[8px] bg-[var(--gh-surface)] text-[13px] text-[var(--gh-muted)]">
                      Select an image in the Creature inspector to place your WebP banner here.
                    </div>
                  ) : (
                    <div
                      style={{
                        width: `${bannerWidthPx}px`,
                        maxWidth: "100%",
                        ...(creatureConfig.backgroundMode === "custom"
                          ? { backgroundColor: derived.background }
                          : {}),
                      }}
                      className="overflow-hidden rounded-[6px]"
                    >
                      <CreatureAnimatedView
                        config={creatureConfig}
                        className="w-full"
                      />
                    </div>
                  )}
                </div>
              )}

              {/* 5. Optional Telemetry Table */}
              {!isMarkerOnly &&
                !isMinimal &&
                readmeConfig.includeStatsTable && (
                  <div
                    onClick={() => onSelectPart("creature")}
                    className="gh-markdown-body cursor-pointer rounded-[8px] px-2 py-1"
                  >
                    <h3>
                      {resolveDynamicTokens(
                        readmeConfig.statsTableTitle ||
                          "Profile activity summary",
                        creatureConfig
                      )}
                    </h3>
                    <table>
                      <thead>
                        <tr>
                          <th>Metric</th>
                          <th>Value</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <td>Creature</td>
                          <td>
                            {meta.name} ({viewLabel})
                          </td>
                        </tr>
                        <tr>
                          <td>Evolution stage</td>
                          <td>
                            Stage {stage.stage} of 5 ({stage.rank})
                          </td>
                        </tr>
                        <tr>
                          <td>Commits</td>
                          <td>
                            <code>
                              {creatureConfig.commits.toLocaleString("en-US")}
                            </code>{" "}
                            commits
                          </td>
                        </tr>
                        <tr>
                          <td>Top languages ({visibleLanguages.length})</td>
                          <td>
                            {visibleLanguages.map((l) => l.name).join(", ")}
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                )}

              {/* 6. Optional Share Card */}
              {!isMarkerOnly &&
                !isMinimal &&
                readmeConfig.includeShareCard &&
                readmeConfig.bannerSource !== "custom-image" && (
                  <div
                    onClick={() => onSelectPart("creature")}
                    className="flex cursor-pointer justify-center"
                  >
                    <div
                      style={{ width: `${bannerWidthPx}px`, maxWidth: "100%" }}
                      className="overflow-hidden rounded-[6px] border border-[var(--gh-border)]"
                    >
                      <ShareCardCanvasView
                        config={creatureConfig}
                        className="w-full"
                      />
                    </div>
                  </div>
                )}
            </div>
          </div>
        </div>
      </div>
    );

    if (!isModalFullscreen && widthMode === "github-848") {
      return (
        <ScaledReadmeViewport
          intrinsicWidth={intrinsicWidth}
          zoomMode={zoomMode}
          onFitZoomChange={setFitZoom}
        >
          {innerContent}
        </ScaledReadmeViewport>
      );
    }

    return innerContent;
  };

  return (
    <TooltipProvider delay={160}>
      <div className="flex min-w-0 flex-1 flex-col gap-3">
        {/* Sticky Canvas Top Toolbar */}
        <div className="sticky top-[104px] z-10 flex flex-col gap-2.5 rounded-[12px] bg-[var(--surface)]/92 p-3 backdrop-blur-md shadow-[var(--shadow-float)]">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="max-w-full">
              <StudioSegmentedControl<CanvasViewMode>
                ariaLabel="Canvas view mode"
                size="sm"
                layout="auto"
                value={viewMode}
                onChange={setViewMode}
                options={[
                  { value: "visual", label: "Visual" },
                  { value: "markdown", label: "Markdown" },
                  { value: "share-card", label: "Share card" },
                  { value: "stages", label: "Stages" },
                ]}
              />
            </div>

            <div className="flex flex-wrap items-center gap-1.5">
              {viewMode === "visual" && (
                <>
                  <StudioButton
                    variant="secondary"
                    size="sm"
                    active={showSidebar}
                    onClick={() => setShowSidebar((prev) => !prev)}
                  >
                    <PanelLeft />
                    <span>Sidebar</span>
                  </StudioButton>

                  <div className="shrink-0">
                    <StudioSegmentedControl<"light" | "dark">
                      ariaLabel="GitHub canvas theme"
                      size="sm"
                      layout="auto"
                      value={githubTheme}
                      onChange={onGithubThemeChange}
                      options={[
                        { value: "light", label: "Light", icon: <Sun /> },
                        { value: "dark", label: "Dark", icon: <Moon /> },
                      ]}
                    />
                  </div>

                  {widthMode === "github-848" && (
                    <div className="shrink-0">
                      <StudioSegmentedControl<ReadmeZoomMode>
                        ariaLabel="Canvas zoom"
                        size="sm"
                        layout="auto"
                        value={zoomMode}
                        onChange={setZoomMode}
                        options={[
                          { value: "fit", label: `Fit ${zoomPct}%` },
                          { value: "100", label: "100%" },
                        ]}
                      />
                    </div>
                  )}

                  <div className="hidden shrink-0 sm:block">
                    <StudioSegmentedControl<WidthMode>
                      ariaLabel="README box width"
                      size="sm"
                      layout="auto"
                      value={widthMode}
                      onChange={setWidthMode}
                      options={[
                        { value: "github-848", label: "848px" },
                        { value: "fit-pane", label: "Fit" },
                      ]}
                    />
                  </div>
                </>
              )}

              <StudioButton
                variant="secondary"
                size="sm"
                disabled={webpBusy}
                onClick={handleExportWebP}
              >
                <Download />
                <span>{webpBusy ? "Encoding" : "WebP"}</span>
              </StudioButton>

              <StudioButton
                variant="secondary"
                size="sm"
                disabled={gifBusy}
                onClick={handleExportGif}
              >
                <Download />
                <span>{gifBusy ? "Encoding" : "GIF"}</span>
              </StudioButton>

              <StudioButton
                variant="secondary"
                size="sm"
                onClick={() => void handleCopy("top-md", readmeMarkdown)}
              >
                {copiedId === "top-md" ? <Check /> : <Copy />}
                <span>{copiedId === "top-md" ? "Copied" : "Copy"}</span>
              </StudioButton>

              <StudioButton
                variant="secondary"
                size="sm"
                onClick={onOpenAutoEvolve}
              >
                <Clock />
                <span>12 AM Action</span>
              </StudioButton>
            </div>
          </div>

          {viewMode === "visual" && (
            <>
              {formattingToolbar}

              {inTable && (
                <div className="flex flex-wrap items-center gap-1.5 rounded-[8px] bg-[var(--tide-soft)] px-3 py-1.5 text-[12px]">
                  <span className="font-medium text-[var(--tide)]">Table</span>
                  <StudioButton
                    variant="secondary"
                    size="sm"
                    onClick={() => editor?.chain().focus().addRowAfter().run()}
                  >
                    <Rows3 />
                    <span>Add row</span>
                  </StudioButton>
                  <StudioButton
                    variant="ghost"
                    size="sm"
                    onClick={() => editor?.chain().focus().deleteRow().run()}
                  >
                    Remove row
                  </StudioButton>
                  <StudioButton
                    variant="secondary"
                    size="sm"
                    onClick={() =>
                      editor?.chain().focus().addColumnAfter().run()
                    }
                  >
                    <Columns3 />
                    <span>Add column</span>
                  </StudioButton>
                  <StudioButton
                    variant="ghost"
                    size="sm"
                    onClick={() => editor?.chain().focus().deleteColumn().run()}
                  >
                    Remove column
                  </StudioButton>
                  <StudioButton
                    variant="danger"
                    size="sm"
                    className="ml-auto"
                    onClick={() => editor?.chain().focus().deleteTable().run()}
                  >
                    <Trash2 />
                    <span>Delete table</span>
                  </StudioButton>
                </div>
              )}

              {dynamicTokenChips}
            </>
          )}
        </div>

        {/* Main Canvas Viewport */}
        <div
          ref={canvasScrollRef}
          className="flex flex-col gap-3 rounded-[12px] bg-[var(--surface)] p-3 sm:p-4"
        >
          {viewMode === "visual" && !fullscreen && (
            <>
              {readmeConfig.rawOverride !== null ? (
                <div className="flex flex-col gap-3 rounded-[8px] bg-[var(--surface-2)] p-4">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="text-[13px] font-medium text-[var(--warning)]">
                      Raw markdown override is active. Changing any visual control returns to generated mode.
                    </span>
                    <StudioButton
                      variant="secondary"
                      size="sm"
                      onClick={() => onChangeRawMarkdown(null)}
                    >
                      <RefreshCw />
                      <span>Return to visual canvas</span>
                    </StudioButton>
                  </div>
                  <pre className="studio-mono max-h-[520px] overflow-auto rounded-[8px] bg-[var(--surface)] p-4 text-[13px] leading-relaxed text-[var(--text)]">
                    {resolveDynamicTokens(
                      readmeConfig.rawOverride,
                      creatureConfig
                    )}
                  </pre>
                </div>
              ) : (
                readmeBoxContent(false)
              )}

              <div className="flex flex-wrap items-center justify-between gap-2 rounded-[8px] bg-[var(--surface-2)] px-3.5 py-2 text-[12px] text-[var(--text-2)]">
                <div className="studio-mono flex flex-wrap items-center gap-4 tabular-nums">
                  <span>{words} words</span>
                  <span>{chars} characters</span>
                  <span>{linesCount} lines</span>
                </div>
                <span className="hidden sm:inline">
                  Select text for formatting or type a forward slash for blocks.
                </span>
              </div>
            </>
          )}

          {viewMode === "markdown" && (
            <div className="flex flex-col gap-3">
              <div className="flex flex-wrap items-center justify-between gap-3 rounded-[8px] bg-[var(--surface-2)] px-3.5 py-2.5">
                <span className="studio-mono text-[13px] text-[var(--text)]">
                  {username}/README.md
                </span>

                <div className="flex flex-wrap items-center gap-3">
                  <div className="flex items-center gap-2">
                    <Switch
                      id="canvas-raw-override-switch"
                      size="sm"
                      checked={editRawMode || readmeConfig.rawOverride !== null}
                      onCheckedChange={(c) => {
                        const enable = Boolean(c);
                        setEditRawMode(enable);
                        if (enable && readmeConfig.rawOverride === null) {
                          onChangeRawMarkdown(readmeMarkdown);
                        }
                      }}
                    />
                    <label
                      htmlFor="canvas-raw-override-switch"
                      className="cursor-pointer text-[13px] font-medium text-[var(--text)]"
                    >
                      Edit raw source
                    </label>
                  </div>

                  {readmeConfig.rawOverride !== null && (
                    <StudioButton
                      variant="secondary"
                      size="sm"
                      onClick={() => {
                        setEditRawMode(false);
                        onChangeRawMarkdown(null);
                      }}
                    >
                      <RefreshCw />
                      <span>Reset to generated</span>
                    </StudioButton>
                  )}

                  <StudioButton
                    variant="secondary"
                    size="sm"
                    onClick={() => void handleCopy("md-view", readmeMarkdown)}
                  >
                    {copiedId === "md-view" ? <Check /> : <Copy />}
                    <span>
                      {copiedId === "md-view" ? "Copied" : "Copy markdown"}
                    </span>
                  </StudioButton>
                </div>
              </div>

              {editRawMode || readmeConfig.rawOverride !== null ? (
                <div className="flex flex-col gap-2">
                  <div className="flex items-center justify-between gap-2 text-[12px] text-[var(--text-2)]">
                    <span>
                      Dynamic tokens still resolve automatically during publish.
                    </span>
                    <div className="flex items-center gap-2">
                      <Switch
                        id="raw-wrap-toggle"
                        size="sm"
                        checked={rawWrapLines}
                        onCheckedChange={(c) => setRawWrapLines(Boolean(c))}
                      />
                      <label htmlFor="raw-wrap-toggle" className="cursor-pointer">
                        Wrap lines
                      </label>
                    </div>
                  </div>
                  <textarea
                    aria-label="Full raw README.md source"
                    rows={18}
                    value={readmeConfig.rawOverride ?? readmeMarkdown}
                    onChange={(e) => onChangeRawMarkdown(e.target.value)}
                    spellCheck={false}
                    wrap={rawWrapLines ? "soft" : "off"}
                    className="studio-mono w-full rounded-[8px] border-0 bg-[var(--surface-2)] p-4 text-[13px] leading-6 text-[var(--text)] focus:bg-[var(--surface-3)] focus:outline-none"
                  />
                </div>
              ) : (
                <pre className="studio-mono max-h-[600px] overflow-auto rounded-[8px] bg-[var(--surface-2)] p-4 text-[13px] leading-relaxed text-[var(--text)]">
                  {debouncedMarkdown}
                </pre>
              )}
            </div>
          )}

          {viewMode === "share-card" && (
            <div className="flex flex-col gap-4 rounded-[12px] bg-[var(--surface-2)] p-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex flex-col gap-0.5">
                  <h3 className="text-[16px] font-semibold text-[var(--text)]">
                    Social share card (1280 by 640)
                  </h3>
                  <p className="text-[13px] text-[var(--text-2)]">
                    Static PNG banner synced with your creature palette and stage.
                  </p>
                </div>
                <StudioButton
                  variant="primary"
                  size="sm"
                  disabled={shareBusy}
                  onClick={handleExportShareCardPng}
                >
                  <Download />
                  <span>{shareBusy ? "Exporting..." : "Download PNG"}</span>
                </StudioButton>
              </div>
              <div className="overflow-hidden rounded-[8px]">
                <ShareCardCanvasView
                  config={creatureConfig}
                  className="w-full"
                />
              </div>
            </div>
          )}

          {viewMode === "stages" && (
            <EvolutionPanel
              baseConfig={creatureConfig}
              onSelectView={onSelectView}
            />
          )}
        </div>

        {/* Slash Command Menu Overlay */}
        {slashState && viewMode === "visual" && (
          <div
            role="listbox"
            aria-label="Insert block menu"
            style={{ top: slashState.top, left: slashState.left }}
            className="fixed z-50 w-72 overflow-hidden rounded-[12px] bg-[var(--surface)] p-1.5 shadow-[var(--shadow-float)]"
          >
            <div className="px-2 py-1 text-[11px] font-medium text-[var(--text-3)]">
              Insert block
            </div>
            <div className="max-h-64 overflow-y-auto">
              {filteredSlashItems.length === 0 ? (
                <div className="px-2.5 py-3 text-[12px] text-[var(--text-2)]">
                  No matching blocks.
                </div>
              ) : (
                filteredSlashItems.map((item, idx) => {
                  const active = idx === slashIndex;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      role="option"
                      aria-selected={active}
                      onMouseDown={(e) => {
                        e.preventDefault();
                        executeSlashCommandRef.current(item);
                      }}
                      onMouseEnter={() => setSlashIndex(idx)}
                      className={cn(
                        "flex w-full cursor-pointer items-center gap-2.5 rounded-[8px] px-2.5 py-1.5 text-left transition-colors duration-150",
                        active
                          ? "bg-[var(--surface-3)] text-[var(--text)]"
                          : "text-[var(--text-2)] hover:text-[var(--text)]"
                      )}
                    >
                      <span className="flex size-7 shrink-0 items-center justify-center rounded-[6px] bg-[var(--surface-2)] text-[var(--text)]">
                        {item.icon}
                      </span>
                      <div className="flex min-w-0 flex-1 flex-col">
                        <span className="truncate text-[13px] font-medium text-[var(--text)]">
                          {item.label}
                        </span>
                        <span className="truncate text-[11px] text-[var(--text-2)]">
                          {item.description}
                        </span>
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          </div>
        )}

        {/* Templates Gallery Modal (30 templates) */}
        <TemplateGalleryDialog
          open={templatesOpen}
          onOpenChange={setTemplatesOpen}
          creatureConfig={creatureConfig}
          githubTheme={githubTheme}
          currentMarkdown={readmeConfig.advancedProfileMarkdown}
          onApplyTemplate={handleApplyTemplate}
        />

        {/* Shared Image Studio Dialog for Editor Insertion */}
        <ImageStudioDialog
          open={editorImageOpen}
          onOpenChange={setEditorImageOpen}
          mode="editor"
          username={username}
          githubTheme={githubTheme}
          onConfirmAsset={(asset) => {
            onRegisterCustomImage(asset);
            setViewMode("visual");
            editor
              ?.chain()
              .focus()
              .setImage({
                src: asset.previewUrl,
                alt: asset.alt,
                repoPath: `./${asset.repoPath}`,
              } as Parameters<ReturnType<NonNullable<typeof editor>["chain"]>["setImage"]>[0])
              .run();
          }}
          onInsertExternalUrl={(url, alt) => {
            setViewMode("visual");
            editor?.chain().focus().setImage({ src: url, alt }).run();
          }}
        />

        {/* Clear All Confirmation */}
        <StudioConfirmDialog
          open={confirmClearOpen}
          onOpenChange={setConfirmClearOpen}
          title="Clear header and intro?"
          description="This empties your top profile text in the canvas. Your tech stack cards, links and banner settings stay intact."
          confirmLabel="Clear all"
          destructive
          onConfirm={() => {
            if (editor) {
              editor.chain().focus().clearContent(true).run();
            } else {
              onUpdateReadmeField("advancedProfileMarkdown", "");
            }
          }}
        />

        {/* Fullscreen Modal Canvas */}
        <StudioDialog
          open={fullscreen}
          onOpenChange={setFullscreen}
          title="Full profile README canvas"
          description="Edit your 848px GitHub profile README with full vertical room."
          maxWidthClass="sm:max-w-[1000px]"
          footer={
            <StudioButton
              variant="primary"
              onClick={() => setFullscreen(false)}
            >
              Done editing
            </StudioButton>
          }
        >
          <div className="flex flex-col gap-3">
            {formattingToolbar}
            {dynamicTokenChips}
            <div className="overflow-x-auto">{fullscreen && readmeBoxContent(true)}</div>
          </div>
        </StudioDialog>
      </div>
    </TooltipProvider>
  );
});
