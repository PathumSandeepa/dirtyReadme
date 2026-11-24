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
import { ImageStudioDialog } from "../ImageStudioDialog";
import { CanvasLinksSection } from "./CanvasLinksSection";
import { CanvasStackSection } from "./CanvasStackSection";
import { EditorTopBar } from "./EditorTopBar";
import type { FormatPanelActions, FormatPanelState } from "./FormatPanel";
import type { InsertBlockAction } from "./InsertPalette";
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

type CanvasViewMode = "visual" | "markdown";
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
  insertSnippetById: (snippetId: "status" | "roadmap" | "visitors") => void;
  insertBlock: (action: InsertBlockAction) => void;
  insertEmoji: (emoji: string) => void;
  openTemplates: () => void;
  openEditorImageStudio: () => void;
  scrollToPart: (part: CustomizePartId) => void;
  exportWebP: () => Promise<void>;
  exportGif: () => Promise<void>;
  getFormatActions: () => FormatPanelActions;
}

interface LiveProfileCanvasProps {
  activePart: CustomizePartId;
  selectedStackCardId: string;
  onSelectPart: (part: CustomizePartId, stackCardId?: string) => void;
  onEditorFocus?: () => void;
  onFormatStateChange?: (state: FormatPanelState) => void;
  onExportBusyChange?: (busy: { webp: boolean; gif: boolean }) => void;
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
  onDeleteStackCard: (cardId: string) => void;
  onReorderStackCards: (fromIdx: number, toIdx: number) => void;
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
  onAddCustomBadgeToCard: (
    cardId: string,
    badge: Omit<ReadmeBadge, "enabled">
  ) => void;
  onSyncFromForm: () => void;
  onRegisterCustomImage: (asset: CustomImageMemoryAsset) => void;
  onSelectView: (view: CameraView) => void;
  canUndo: boolean;
  canRedo: boolean;
  onUndo: () => void;
  onRedo: () => void;
  onClearAll: () => void;
  onShowUndoToast: (message: string) => void;
  onFocusAddToReadme?: () => void;
}

export const LiveProfileCanvas = forwardRef<
  LiveProfileCanvasHandle,
  LiveProfileCanvasProps
>(function LiveProfileCanvas(
  {
    activePart,
    selectedStackCardId,
    onSelectPart,
    onEditorFocus,
    onFormatStateChange,
    onExportBusyChange,
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
    onDeleteStackCard,
    onReorderStackCards,
    onAddBadgeToCard,
    onRemoveBadgeFromCard,
    onMoveBadgeAcrossCards,
    onAddCustomBadgeToCard,
    onSyncFromForm,
    onRegisterCustomImage,
    canUndo,
    canRedo,
    onUndo,
    onRedo,
    onClearAll,
    onShowUndoToast,
    onFocusAddToReadme,
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
  const [bubbleLinkMode, setBubbleLinkMode] = useState(false);
  const [bubbleLinkInput, setBubbleLinkInput] = useState("https://");
  const [tableRowSize, setTableRowSize] = useState<
    "compact" | "default" | "spacious" | "tall"
  >("default");
  const [tableBorderColor, setTableBorderColor] = useState("");

  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [webpBusy, setWebpBusy] = useState(false);
  const [gifBusy, setGifBusy] = useState(false);

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
        undoRedo: false,
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
        table: { resizable: true, cellMinWidth: 64 },
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
    onFocus: () => {
      onEditorFocus?.();
    },
    onUpdate: ({ editor: activeEditor }) => {
      const serialized = tiptapJsonToGithubMarkdown(activeEditor.getJSON());
      lastEmittedMarkdownRef.current = serialized;
      onUpdateFieldRef.current("advancedProfileMarkdown", serialized);
    },
    onSelectionUpdate: ({ editor: activeEditor }) => {
      const { state, view } = activeEditor;
      const { $from, empty } = state.selection;
      if (!empty) {
        onEditorFocus?.();
      }
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
          editor.chain().focus().insertContent("👋").run();
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

  useEffect(() => {
    onFormatStateChange?.({
      hasEditor: Boolean(editor && viewMode === "visual"),
      headingLabel: currentHeadingLabel,
      hasHeadingUnderline,
      bold: Boolean(editor?.isActive("bold")),
      italic: Boolean(editor?.isActive("italic")),
      underline: Boolean(editor?.isActive("underline")),
      strike: Boolean(editor?.isActive("strike")),
      code: Boolean(editor?.isActive("code")),
      alignLeft: Boolean(editor?.isActive({ textAlign: "left" })),
      alignCenter: Boolean(editor?.isActive({ textAlign: "center" })),
      alignRight: Boolean(editor?.isActive({ textAlign: "right" })),
      bulletList: Boolean(editor?.isActive("bulletList")),
      orderedList: Boolean(editor?.isActive("orderedList")),
      taskList: Boolean(editor?.isActive("taskList")),
      blockquote: Boolean(editor?.isActive("blockquote")),
      codeBlock: Boolean(editor?.isActive("codeBlock")),
      inTable,
      tableRowSize,
      tableBorderColor,
      hasLink: Boolean(editor?.isActive("link")),
      currentLinkHref: String(editor?.getAttributes("link").href ?? ""),
    });
  });

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
    onExportBusyChange?.({ webp: webpBusy, gif: true });
    try {
      const sprite = await loadCreatureSprite(
        getSpriteKey(creatureConfig.creature, creatureConfig.view)
      );
      const blob = await encodeAnimatedGifFromCreature(creatureConfig, sprite);
      downloadBlobFile("creature.gif", blob);
    } finally {
      setGifBusy(false);
      onExportBusyChange?.({ webp: webpBusy, gif: false });
    }
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
    onShowUndoToast("Template applied");
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
      insertSnippetById: (snippetId: "status" | "roadmap" | "visitors") => {
        setViewMode("visual");
        if (snippetId === "status") {
          editor
            ?.chain()
            .focus()
            .insertContent(
              markdownToEditorHtml(
                [
                  "- Currently building open source web tools",
                  "- Learning distributed systems",
                  "- Reach me through GitHub or Email",
                ].join("\n"),
                imageUrlMap
              )
            )
            .run();
        } else if (snippetId === "roadmap") {
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
            .run();
        } else {
          editor
            ?.chain()
            .focus()
            .insertContent(
              markdownToEditorHtml(
                `![Profile views](https://komarev.com/ghpvc/?username=${encodeURIComponent(username)}&color=58D6B0&style=for-the-badge)`,
                imageUrlMap
              )
            )
            .run();
        }
      },
      insertBlock: (action: InsertBlockAction) => {
        if (action === "image") {
          setEditorImageOpen(true);
          return;
        }
        if (action === "stackGroup") {
          const newId = onAddStackCard("Tech stack");
          onSelectPart("stack", newId);
          return;
        }
        if (action === "linkButtons") {
          onUpdateReadmeField("showLinksRow", true);
          onSelectPart("links");
          return;
        }
        if (action === "creatureBanner") {
          onUpdateReadmeField("showCreatureBanner", true);
          onSelectPart("creature");
          return;
        }
        setViewMode("visual");
        if (!editor) return;
        const applyHeading = (level: 1 | 2 | 3 | 4) => {
          const { from, to, empty, $from, $to } = editor.state.selection;
          if (
            !empty &&
            $from.sameParent($to) &&
            (from > $from.start() || to < $to.end())
          ) {
            const splitStart = from > $from.start();
            const splitEnd = to < $to.end();
            editor
              .chain()
              .focus()
              .command(({ tr }) => {
                if (splitEnd) tr.split(to);
                if (splitStart) tr.split(from);
                return true;
              })
              .setTextSelection(splitStart ? from + 2 : from)
              .setHeading({ level })
              .run();
            return;
          }
          editor.chain().focus().toggleHeading({ level }).run();
        };
        const chain = editor.chain().focus();
        switch (action) {
          case "h1":
            applyHeading(1);
            break;
          case "h2":
            applyHeading(2);
            break;
          case "h3":
            applyHeading(3);
            break;
          case "paragraph":
            chain.setParagraph().run();
            break;
          case "quote":
            chain.toggleBlockquote().run();
            break;
          case "bulletList":
            chain.toggleBulletList().run();
            break;
          case "orderedList":
            chain.toggleOrderedList().run();
            break;
          case "taskList":
            chain.toggleTaskList().run();
            break;
          case "table":
            chain.insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run();
            break;
          case "divider":
            chain.setHorizontalRule().run();
            break;
          case "link":
            onEditorFocus?.();
            break;
          case "codeBlock":
            chain.toggleCodeBlock().run();
            break;
        }
      },
      insertEmoji: (emoji: string) => {
        setViewMode("visual");
        editor?.chain().focus().insertContent(emoji).run();
      },
      openTemplates: () => setTemplatesOpen(true),
      openEditorImageStudio: () => setEditorImageOpen(true),
      scrollToPart: scrollToCanvasPart,
      exportWebP: handleExportWebP,
      exportGif: handleExportGif,
      getFormatActions: () => ({
        setParagraph: () => editor?.chain().focus().setParagraph().run(),
        toggleHeading: (level: 1 | 2 | 3 | 4) => {
          if (!editor) return;
          const { from, to, empty, $from, $to } = editor.state.selection;
          if (
            !empty &&
            $from.sameParent($to) &&
            (from > $from.start() || to < $to.end())
          ) {
            const splitStart = from > $from.start();
            const splitEnd = to < $to.end();
            editor
              .chain()
              .focus()
              .command(({ tr }) => {
                if (splitEnd) tr.split(to);
                if (splitStart) tr.split(from);
                return true;
              })
              .setTextSelection(splitStart ? from + 2 : from)
              .setHeading({ level })
              .run();
            return;
          }
          editor.chain().focus().toggleHeading({ level }).run();
        },
        toggleHeadingUnderline: handleToggleHeadingUnderline,
        toggleBold: () => editor?.chain().focus().toggleBold().run(),
        toggleItalic: () => editor?.chain().focus().toggleItalic().run(),
        toggleUnderline: () => editor?.chain().focus().toggleUnderline().run(),
        toggleStrike: () => editor?.chain().focus().toggleStrike().run(),
        toggleCode: () => editor?.chain().focus().toggleCode().run(),
        clearFormatting: () =>
          editor?.chain().focus().unsetAllMarks().clearNodes().run(),
        setAlign: (align: "left" | "center" | "right") =>
          editor?.chain().focus().setTextAlign(align).run(),
        toggleBulletList: () =>
          editor?.chain().focus().toggleBulletList().run(),
        toggleOrderedList: () =>
          editor?.chain().focus().toggleOrderedList().run(),
        toggleTaskList: () => editor?.chain().focus().toggleTaskList().run(),
        toggleBlockquote: () =>
          editor?.chain().focus().toggleBlockquote().run(),
        toggleCodeBlock: () => editor?.chain().focus().toggleCodeBlock().run(),
        applyLink: (url: string) => {
          const normalized = normalizeInputUrl(url);
          if (normalized) {
            editor
              ?.chain()
              .focus()
              .extendMarkRange("link")
              .setLink({ href: normalized })
              .run();
          }
        },
        removeLink: () => editor?.chain().focus().unsetLink().run(),
        addTableRow: () => editor?.chain().focus().addRowAfter().run(),
        deleteTableRow: () => editor?.chain().focus().deleteRow().run(),
        addTableColumn: () => editor?.chain().focus().addColumnAfter().run(),
        deleteTableColumn: () => editor?.chain().focus().deleteColumn().run(),
        deleteTable: () => editor?.chain().focus().deleteTable().run(),
        setTableColumnWidth: (width: number | null) =>
          editor
            ?.chain()
            .focus()
            .command(({ tr, state }) => {
              const { $from } = state.selection;
              let tableDepth = -1;
              let rowDepth = -1;
              let cellDepth = -1;
              for (let d = $from.depth; d > 0; d--) {
                const name = $from.node(d).type.name;
                if (cellDepth === -1 && (name === "tableCell" || name === "tableHeader")) {
                  cellDepth = d;
                } else if (rowDepth === -1 && name === "tableRow") {
                  rowDepth = d;
                } else if (tableDepth === -1 && name === "table") {
                  tableDepth = d;
                  break;
                }
              }
              if (tableDepth === -1 || rowDepth === -1 || cellDepth === -1) {
                return false;
              }
              const targetColIndex = $from.index(rowDepth);
              const tableNode = $from.node(tableDepth);
              const tableStart = $from.start(tableDepth);
              let rowOffset = tableStart;
              tableNode.forEach((rowNode) => {
                let cellOffset = rowOffset + 1;
                rowNode.forEach((cellNode, _offset, colIdx) => {
                  if (colIdx === targetColIndex) {
                    tr.setNodeMarkup(cellOffset, undefined, {
                      ...cellNode.attrs,
                      colwidth: width ? [width] : null,
                    });
                  }
                  cellOffset += cellNode.nodeSize;
                });
                rowOffset += rowNode.nodeSize;
              });
              return true;
            })
            .run(),
        setTableRowSize,
        setTableBorderColor,
      }),
    }),
    [editor, imageUrlMap, onAddStackCard, onEditorFocus, onSelectPart, onUpdateReadmeField]
  );

  const tableRowPadding =
    tableRowSize === "compact"
      ? "4px"
      : tableRowSize === "spacious"
        ? "11px"
        : tableRowSize === "tall"
          ? "16px"
          : "6px";

  const readmeBoxContent = (isModalFullscreen: boolean) => {
    const innerContent = (
      <div
        data-gh-theme={githubTheme}
        style={
          {
            "--gh-table-cell-py": tableRowPadding,
            ...(tableBorderColor
              ? { "--gh-table-border": tableBorderColor }
              : {}),
          } as React.CSSProperties
        }
        className={cn(
          "grid items-start",
          !isModalFullscreen && widthMode === "fit-pane"
            ? "w-full grid-cols-1"
            : showSidebar && !isModalFullscreen
              ? "w-[1200px] grid-cols-[296px_880px] gap-6"
              : "w-full max-w-[880px] grid-cols-1"
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

          <div className="px-1.5 py-3">
            <div
              className={cn(
                "flex flex-col gap-5",
                !isModalFullscreen && widthMode === "fit-pane"
                  ? "w-full"
                  : "mx-auto w-full max-w-[848px]"
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


              {/* Empty State when Clear all has emptied the README */}
              {!isMarkerOnly &&
                readmeConfig.advancedProfileMarkdown.trim() === "" &&
                readmeConfig.stackCards.filter((c) => c.visible !== false).length === 0 &&
                enabledLinks.length === 0 &&
                readmeConfig.showCreatureBanner === false && (
                  <div className="flex flex-col items-center justify-center gap-3 rounded-[10px] border border-dashed border-[var(--gh-border)] px-6 py-12 text-center">
                    <div className="text-[15px] font-semibold text-[var(--gh-text)]">
                      Your README is empty
                    </div>
                    <p className="max-w-sm text-[13px] text-[var(--gh-muted)]">
                      Start from a template or add a block from the left sidebar.
                    </p>
                    <div className="mt-1 flex flex-wrap items-center justify-center gap-2">
                      <StudioButton
                        variant="primary"
                        size="sm"
                        onClick={() => setTemplatesOpen(true)}
                      >
                        <LayoutTemplate />
                        <span>Start from a template</span>
                      </StudioButton>
                      <StudioButton
                        variant="secondary"
                        size="sm"
                        onClick={() => onFocusAddToReadme?.()}
                      >
                        <Sparkles />
                        <span>Add a block</span>
                      </StudioButton>
                    </div>
                  </div>
                )}

              {/* 2. Interactive Tech Stack Cards */}
              {!isMarkerOnly && !isMinimal && (
                <CanvasStackSection
                  readmeConfig={readmeConfig}
                  activePart={activePart}
                  selectedStackCardId={selectedStackCardId}
                  isAlignedLeft={isAlignedLeft}
                  onSelectGroup={(cardId) => onSelectPart("stack", cardId)}
                  onAddBadgeToCard={onAddBadgeToCard}
                  onRemoveBadgeFromCard={onRemoveBadgeFromCard}
                  onMoveBadgeAcrossCards={onMoveBadgeAcrossCards}
                  onAddStackCard={onAddStackCard}
                  onToggleStackCardVisibility={onToggleStackCardVisibility}
                  onDeleteStackCard={onDeleteStackCard}
                  onReorderStackCards={onReorderStackCards}
                  onAddCustomBadgeToCard={onAddCustomBadgeToCard}
                />
              )}

              {/* 3. Interactive Links Row */}
              {!isMarkerOnly &&
                !isMinimal &&
                readmeConfig.showLinksRow !== false && (
                  <CanvasLinksSection
                    creatureConfig={creatureConfig}
                    readmeConfig={readmeConfig}
                    activePart={activePart}
                    isAlignedLeft={isAlignedLeft}
                    onSelectLinks={() => onSelectPart("links")}
                    onUpdateLinks={(nextLinks) =>
                      onUpdateReadmeField("actionLinks", nextLinks)
                    }
                    onHideLinks={() =>
                      onUpdateReadmeField("showLinksRow", false)
                    }
                    onShowUndoToast={onShowUndoToast}
                  />
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
                      <span>Replace</span>
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

              {readmeConfig.showCreatureBanner === false &&
                (readmeConfig.advancedProfileMarkdown.trim() !== "" ||
                  readmeConfig.stackCards.length > 0 ||
                  enabledLinks.length > 0) && (
                  <div className="flex justify-center">
                    <button
                      type="button"
                      onClick={() =>
                        onUpdateReadmeField("showCreatureBanner", true)
                      }
                      className="cursor-pointer rounded-[8px] bg-[var(--gh-surface)] px-3 py-1.5 text-[12px] font-medium text-[var(--gh-muted)] transition-colors hover:text-[var(--gh-text)]"
                    >
                      Show creature
                    </button>
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
      <div className="flex h-full min-h-0 min-w-0 flex-1 flex-col gap-2 overflow-hidden">
        {/* Slim 44px Single-Row Top Bar */}
        <div className="overflow-hidden rounded-[12px]">
          <EditorTopBar
            canUndo={canUndo}
            canRedo={canRedo}
            onUndo={onUndo}
            onRedo={onRedo}
            onClearAll={onClearAll}
            viewMode={viewMode}
            onViewModeChange={setViewMode}
            githubTheme={githubTheme}
            onGithubThemeChange={onGithubThemeChange}
            zoomMode={zoomMode}
            onZoomModeChange={setZoomMode}
            zoomPct={zoomPct}
            widthMode={widthMode}
            onWidthModeChange={setWidthMode}
            showSidebar={showSidebar}
            onShowSidebarChange={setShowSidebar}
            copied={copiedId === "top-md"}
            onCopyMarkdown={() => void handleCopy("top-md", readmeMarkdown)}
            fullscreen={fullscreen}
            onToggleFullscreen={() => setFullscreen((prev) => !prev)}
          />
        </div>

        {/* Main Canvas Viewport (scrolls inside its own column) */}
        <div
          ref={canvasScrollRef}
          className="flex min-h-0 flex-1 flex-col gap-2 overflow-y-auto rounded-[12px] bg-[var(--surface)] px-1 py-1.5"
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

        {/* Templates Gallery Modal */}
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
          <div className="overflow-x-auto">
            {fullscreen && readmeBoxContent(true)}
          </div>
        </StudioDialog>
      </div>
    </TooltipProvider>
  );
});
