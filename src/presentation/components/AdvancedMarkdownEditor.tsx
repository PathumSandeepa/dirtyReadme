"use client";

import { useEffect, useRef, useState } from "react";
import ImageExtension from "@tiptap/extension-image";
import { TaskItem, TaskList } from "@tiptap/extension-list";
import { TableKit } from "@tiptap/extension-table";
import TextAlign from "@tiptap/extension-text-align";
import { CharacterCount, Placeholder } from "@tiptap/extensions";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import {
  AlignCenter,
  AlignLeft,
  AlignRight,
  Bold,
  Check,
  CheckSquare,
  ChevronDown,
  Code,
  Columns3,
  Copy,
  Eraser,
  FileCode2,
  Heading,
  Image as ImageIcon,
  Italic,
  LayoutTemplate,
  Link2,
  List,
  ListOrdered,
  Maximize2,
  Minimize2,
  Minus,
  Quote,
  Redo2,
  RemoveFormatting,
  RotateCcw,
  Rows3,
  Smile,
  Sparkles,
  Strikethrough,
  Table2,
  Trash2,
  Underline as UnderlineIcon,
  Undo2,
  Unlink,
} from "lucide-react";
import { cn } from "cn";
import type { CreatureConfig } from "@/domain/creature/entities";
import { DYNAMIC_TOKENS } from "@/domain/profile/entities";
import {
  markdownToEditorHtml,
  PROFILE_EDITOR_TEMPLATES,
  tiptapJsonToGithubMarkdown,
} from "@/domain/profile/markdownRichText";
import { resolveDynamicTokens } from "@/domain/profile/readmeService";
import { copyToClipboard } from "@/infrastructure/browser/downloadAdapter";
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
import {
  ScaledReadmeViewport,
  type ReadmeZoomMode,
} from "../studio/ui/ScaledReadmeViewport";
import { StudioButton } from "../studio/ui/StudioButton";
import { StudioConfirmDialog, StudioDialog } from "../studio/ui/StudioDialog";
import { StudioField, StudioInput } from "../studio/ui/StudioInput";
import { StudioSegmentedControl } from "../studio/ui/StudioSegmentedControl";
import { AdvancedMarkdownPreview } from "./MarkdownPreviewRenderer";

interface AdvancedMarkdownEditorProps {
  value: string;
  onChange: (next: string) => void;
  creatureConfig: CreatureConfig;
  onSyncFromForm: () => void;
  githubTheme: "light" | "dark";
  zoomMode: ReadmeZoomMode;
  sharedFitZoom?: number;
  onMeasureFitZoom?: (zoom: number) => void;
  onUserEdit?: () => void;
}

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

type WidthMode = "github-848" | "fit-pane";

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
          />
        }
      >
        {children}
      </TooltipTrigger>
      <TooltipContent
        data-app="studio"
        className="border border-[var(--border)] bg-[var(--text)] text-[var(--bg)] shadow-[var(--studio-shadow-overlay)]"
      >
        {tooltip}
      </TooltipContent>
    </Tooltip>
  );
}

export function AdvancedMarkdownEditor({
  value,
  onChange,
  creatureConfig,
  onSyncFromForm,
  githubTheme,
  zoomMode,
  sharedFitZoom,
  onMeasureFitZoom,
  onUserEdit,
}: AdvancedMarkdownEditorProps) {
  const lastEmittedMarkdownRef = useRef<string>(value);
  const onChangeRef = useRef(onChange);
  const onUserEditRef = useRef(onUserEdit);

  useEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);

  useEffect(() => {
    onUserEditRef.current = onUserEdit;
  }, [onUserEdit]);

  const [widthMode, setWidthMode] = useState<WidthMode>("github-848");
  const [fullscreen, setFullscreen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [templatesOpen, setTemplatesOpen] = useState(false);
  const [confirmClearOpen, setConfirmClearOpen] = useState(false);
  const [emojisOpen, setEmojisOpen] = useState(false);

  const [linkPopoverOpen, setLinkPopoverOpen] = useState(false);
  const [linkUrlInput, setLinkUrlInput] = useState("https://");
  const [linkError, setLinkError] = useState<string | null>(null);

  const [imagePopoverOpen, setImagePopoverOpen] = useState(false);
  const [imageUrlInput, setImageUrlInput] = useState("");
  const [imageAltInput, setImageAltInput] = useState("");
  const [imageError, setImageError] = useState<string | null>(null);

  const username = creatureConfig.username.trim() || "your-username";

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
      ImageExtension.configure({
        inline: true,
        allowBase64: false,
      }),
      Placeholder.configure({
        placeholder:
          "Write your GitHub profile intro, choose a template above, or insert dynamic values...",
      }),
      CharacterCount,
    ],
    content: markdownToEditorHtml(value),
    onUpdate: ({ editor: activeEditor }) => {
      const serialized = tiptapJsonToGithubMarkdown(activeEditor.getJSON());
      lastEmittedMarkdownRef.current = serialized;
      onChangeRef.current(serialized);
      onUserEditRef.current?.();
    },
  });

  useEffect(() => {
    if (!editor) return;
    if (value === lastEmittedMarkdownRef.current) return;
    lastEmittedMarkdownRef.current = value;
    editor.commands.setContent(markdownToEditorHtml(value), {
      emitUpdate: false,
    });
  }, [editor, value]);

  const applyExternalMarkdown = (markdown: string) => {
    if (!editor) {
      onChange(markdown);
      onUserEdit?.();
      return;
    }
    const html = markdownToEditorHtml(markdown);
    editor.chain().focus().setContent(html).run();
    onUserEdit?.();
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
      setLinkError("Enter a valid URL (for example https://github.com/user).");
      return;
    }
    const normalized = normalizeInputUrl(raw);
    editor
      .chain()
      .focus()
      .extendMarkRange("link")
      .setLink({ href: normalized })
      .run();
    setLinkError(null);
    setLinkPopoverOpen(false);
  };

  const handleInsertImage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editor) return;
    const raw = imageUrlInput.trim();
    if (!isValidUrlInput(raw)) {
      setImageError("Enter a valid image URL starting with https:// or ./");
      return;
    }
    const normalized = normalizeInputUrl(raw);
    editor
      .chain()
      .focus()
      .setImage({
        src: normalized,
        alt: imageAltInput.trim() || "Profile image",
      })
      .run();
    setImageUrlInput("");
    setImageAltInput("");
    setImageError(null);
    setImagePopoverOpen(false);
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

  const handleCopyMarkdown = async () => {
    await copyToClipboard(value);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1600);
  };

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
  const words = editor?.storage.characterCount?.words() ?? 0;
  const chars = editor?.storage.characterCount?.characters() ?? 0;
  const linesCount = value ? value.split(/\r?\n/).length : 0;

  const dynamicValueBar = (
    <div className="flex flex-wrap items-center gap-2">
      <span className="text-[13px] font-medium text-[var(--text-muted)]">
        Insert dynamic value
      </span>
      <div className="flex flex-wrap items-center gap-1.5">
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
                    className="studio-mono inline-flex h-7 cursor-pointer items-center rounded-[6px] border border-[var(--border)] bg-[var(--surface-2)] px-2 text-[12px] text-[var(--text)] transition-[color,background-color,border-color] duration-150 hover:border-[var(--accent)] hover:bg-[var(--accent-soft)] hover:text-[var(--accent)]"
                  />
                }
              >
                {t.token}
              </TooltipTrigger>
              <TooltipContent
                data-app="studio"
                className="border border-[var(--border)] bg-[var(--text)] text-[var(--bg)] shadow-[var(--studio-shadow-overlay)]"
              >
                <span>
                  {t.description}:{" "}
                  <strong className="studio-mono">{resolved}</strong>
                </span>
              </TooltipContent>
            </Tooltip>
          );
        })}
      </div>
    </div>
  );

  const renderEditorSurface = (isModalFullscreen: boolean) => (
    <div
      className={cn(
        "flex flex-col overflow-hidden border border-[var(--border)] bg-[var(--surface)]",
        isModalFullscreen
          ? "h-full rounded-[6px]"
          : "mx-4 rounded-[6px] sm:mx-5 min-[1800px]:mx-0 min-[1800px]:rounded-none min-[1800px]:border-x-0 min-[1800px]:border-b-0"
      )}
    >
      {/* Sticky Formatting Toolbar (all buttons 36px, wraps cleanly, never hidden) */}
      <div className="sticky top-0 z-10 flex flex-wrap items-center gap-1 border-b border-[var(--border)] bg-[var(--surface-2)] p-1.5">
        {/* Group 1: Undo / Redo */}
        <ToolbarIconButton
          label="Undo"
          tooltip="Undo (Ctrl+Z)"
          disabled={!editor?.can().undo()}
          onClick={() => editor?.chain().focus().undo().run()}
        >
          <Undo2 />
        </ToolbarIconButton>
        <ToolbarIconButton
          label="Redo"
          tooltip="Redo (Ctrl+Y)"
          disabled={!editor?.can().redo()}
          onClick={() => editor?.chain().focus().redo().run()}
        >
          <Redo2 />
        </ToolbarIconButton>

        <span
          aria-hidden="true"
          className="mx-1 h-5 w-px bg-[var(--border)]"
        />

        {/* Group 2: Heading dropdown + Heading underline toggle */}
        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <StudioButton
                variant="secondary"
                size="default"
                className="h-9 px-2.5 text-[13px]"
                aria-label="Text block level"
              />
            }
          >
            <Heading />
            <span>{currentHeadingLabel}</span>
            <ChevronDown className="size-3.5 text-[var(--text-muted)]" />
          </DropdownMenuTrigger>
          <DropdownMenuContent
            data-app="studio"
            className="w-60 rounded-[8px] border border-[var(--border)] bg-[var(--surface)] p-1 text-[var(--text)] ring-0 shadow-[var(--studio-shadow-overlay)]"
          >
            <DropdownMenuGroup>
              <DropdownMenuLabel className="text-[12px] text-[var(--text-muted)]">
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
                size="default"
                active={hasHeadingUnderline}
                onClick={handleToggleHeadingUnderline}
                className="h-9 px-2.5 text-[13px]"
                aria-label="Heading underline"
              />
            }
          >
            <span>Heading underline</span>
          </TooltipTrigger>
          <TooltipContent
            data-app="studio"
            className="border border-[var(--border)] bg-[var(--text)] text-[var(--bg)] shadow-[var(--studio-shadow-overlay)]"
          >
            Toggle GitHub horizontal underline under this heading (H2 ↔ H3)
          </TooltipContent>
        </Tooltip>

        <span
          aria-hidden="true"
          className="mx-1 h-5 w-px bg-[var(--border)]"
        />

        {/* Group 3: Inline styles */}
        <ToolbarIconButton
          label="Bold"
          tooltip="Bold (Ctrl+B)"
          active={Boolean(editor?.isActive("bold"))}
          onClick={() => editor?.chain().focus().toggleBold().run()}
        >
          <Bold />
        </ToolbarIconButton>
        <ToolbarIconButton
          label="Italic"
          tooltip="Italic (Ctrl+I)"
          active={Boolean(editor?.isActive("italic"))}
          onClick={() => editor?.chain().focus().toggleItalic().run()}
        >
          <Italic />
        </ToolbarIconButton>
        <ToolbarIconButton
          label="Underline"
          tooltip="Underline (Ctrl+U)"
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

        <span
          aria-hidden="true"
          className="mx-1 h-5 w-px bg-[var(--border)]"
        />

        {/* Group 4: Alignment */}
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

        <span
          aria-hidden="true"
          className="mx-1 h-5 w-px bg-[var(--border)]"
        />

        {/* Group 5: Lists, Quote, Code block */}
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

        <span
          aria-hidden="true"
          className="mx-1 h-5 w-px bg-[var(--border)]"
        />

        {/* Group 6: Divider, Link, Image, Table, Emoji */}
        <ToolbarIconButton
          label="Divider"
          tooltip="Insert horizontal divider"
          onClick={() => editor?.chain().focus().setHorizontalRule().run()}
        >
          <Minus />
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
                    />
                  }
                >
                  <Link2 />
                </PopoverTrigger>
              }
            />
            <TooltipContent
              data-app="studio"
              className="border border-[var(--border)] bg-[var(--text)] text-[var(--bg)] shadow-[var(--studio-shadow-overlay)]"
            >
              Insert or edit link
            </TooltipContent>
          </Tooltip>
          <PopoverContent
            data-app="studio"
            className="w-80 rounded-[8px] border border-[var(--border)] bg-[var(--surface)] p-4 text-[var(--text)] ring-0 shadow-[var(--studio-shadow-overlay)]"
          >
            <form onSubmit={handleApplyLink} className="flex flex-col gap-3">
              <div className="text-[14px] font-semibold text-[var(--text)]">
                Add or edit link
              </div>
              <StudioField
                label="Target URL"
                htmlFor="editor-link-url"
                error={linkError}
              >
                <StudioInput
                  id="editor-link-url"
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

        <Popover
          open={imagePopoverOpen}
          onOpenChange={(open) => {
            setImagePopoverOpen(open);
            if (open) setImageError(null);
          }}
        >
          <Tooltip>
            <TooltipTrigger
              render={
                <PopoverTrigger
                  render={
                    <StudioButton
                      variant="ghost"
                      size="icon"
                      aria-label="Insert image or shield URL"
                    />
                  }
                >
                  <ImageIcon />
                </PopoverTrigger>
              }
            />
            <TooltipContent
              data-app="studio"
              className="border border-[var(--border)] bg-[var(--text)] text-[var(--bg)] shadow-[var(--studio-shadow-overlay)]"
            >
              Insert image or shield URL
            </TooltipContent>
          </Tooltip>
          <PopoverContent
            data-app="studio"
            className="w-80 rounded-[8px] border border-[var(--border)] bg-[var(--surface)] p-4 text-[var(--text)] ring-0 shadow-[var(--studio-shadow-overlay)]"
          >
            <form onSubmit={handleInsertImage} className="flex flex-col gap-3">
              <div className="text-[14px] font-semibold text-[var(--text)]">
                Insert image or badge URL
              </div>
              <StudioField
                label="Image URL"
                htmlFor="editor-img-url"
                error={imageError}
              >
                <StudioInput
                  id="editor-img-url"
                  value={imageUrlInput}
                  invalid={Boolean(imageError)}
                  onChange={(e) => {
                    setImageUrlInput(e.target.value);
                    if (imageError) setImageError(null);
                  }}
                  placeholder="https://img.shields.io/badge/..."
                />
              </StudioField>
              <StudioField label="Alt text" htmlFor="editor-img-alt">
                <StudioInput
                  id="editor-img-alt"
                  value={imageAltInput}
                  onChange={(e) => setImageAltInput(e.target.value)}
                  placeholder="Badge or banner description"
                />
              </StudioField>
              <div className="flex items-center justify-between gap-2">
                <StudioButton
                  variant="secondary"
                  size="sm"
                  onClick={() => {
                    setImageUrlInput(
                      `https://komarev.com/ghpvc/?username=${encodeURIComponent(username)}&color=0f766e&style=for-the-badge`
                    );
                    setImageAltInput("Profile views");
                    setImageError(null);
                  }}
                >
                  Visitor badge
                </StudioButton>
                <StudioButton type="submit" variant="primary" size="sm">
                  Insert image
                </StudioButton>
              </div>
            </form>
          </PopoverContent>
        </Popover>

        <ToolbarIconButton
          label="Insert 3x3 table"
          tooltip="Insert 3×3 table"
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
                    />
                  }
                >
                  <Smile />
                </PopoverTrigger>
              }
            />
            <TooltipContent
              data-app="studio"
              className="border border-[var(--border)] bg-[var(--text)] text-[var(--bg)] shadow-[var(--studio-shadow-overlay)]"
            >
              Insert emoji
            </TooltipContent>
          </Tooltip>
          <PopoverContent
            data-app="studio"
            className="w-72 rounded-[8px] border border-[var(--border)] bg-[var(--surface)] p-3 text-[var(--text)] ring-0 shadow-[var(--studio-shadow-overlay)]"
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
                  className="flex size-9 cursor-pointer items-center justify-center rounded-[6px] border border-transparent text-base transition-colors duration-150 hover:border-[var(--border)] hover:bg-[var(--surface-2)]"
                >
                  {emoji}
                </button>
              ))}
            </div>
          </PopoverContent>
        </Popover>

        <span
          aria-hidden="true"
          className="mx-1 h-5 w-px bg-[var(--border)]"
        />

        {/* Group 7: Snippets */}
        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <StudioButton
                variant="ghost"
                size="default"
                className="h-9 px-2.5 text-[13px]"
                aria-label="Insert profile snippet"
              />
            }
          >
            <Sparkles />
            <span>Snippets</span>
            <ChevronDown className="size-3.5 text-[var(--text-muted)]" />
          </DropdownMenuTrigger>
          <DropdownMenuContent
            data-app="studio"
            className="w-60 rounded-[8px] border border-[var(--border)] bg-[var(--surface)] p-1 text-[var(--text)] ring-0 shadow-[var(--studio-shadow-overlay)]"
          >
            <DropdownMenuGroup>
              <DropdownMenuLabel className="text-[12px] text-[var(--text-muted)]">
                Insert profile block
              </DropdownMenuLabel>
              <DropdownMenuItem
                onClick={() =>
                  editor
                    ?.chain()
                    .focus()
                    .insertContent(
                      markdownToEditorHtml(
                        [
                          "- 🔭 Currently building **open-source web tools**",
                          "- 🌱 Learning **distributed systems**",
                          "- 📫 Reach me via **GitHub or Email**",
                        ].join("\n")
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
                        "> **Current focus:** Building clean architecture and open-source developer tools."
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
                          "- [x] Shipped v1.0 open-source release",
                          "- [ ] Exploring distributed systems",
                        ].join("\n")
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
                        `![Profile Views](https://komarev.com/ghpvc/?username=${encodeURIComponent(username)}&color=0f766e&style=for-the-badge)`
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

        {/* Right actions: Copy MD + Fullscreen */}
        <div className="ml-auto flex items-center gap-1">
          <Tooltip>
            <TooltipTrigger
              render={
                <StudioButton
                  variant="ghost"
                  size="default"
                  onClick={handleCopyMarkdown}
                  className="h-9 px-2.5 text-[13px]"
                  aria-label="Copy markdown"
                />
              }
            >
              {copied ? <Check /> : <Copy />}
              <span>{copied ? "Copied" : "Copy MD"}</span>
            </TooltipTrigger>
            <TooltipContent
              data-app="studio"
              className="border border-[var(--border)] bg-[var(--text)] text-[var(--bg)] shadow-[var(--studio-shadow-overlay)]"
            >
              Copy header &amp; intro markdown
            </TooltipContent>
          </Tooltip>

          <ToolbarIconButton
            label={isModalFullscreen ? "Exit fullscreen" : "Fullscreen editor"}
            tooltip={
              isModalFullscreen ? "Exit fullscreen (Esc)" : "Fullscreen editor"
            }
            active={isModalFullscreen}
            onClick={() => setFullscreen((prev) => !prev)}
          >
            {isModalFullscreen ? <Minimize2 /> : <Maximize2 />}
          </ToolbarIconButton>
        </div>
      </div>

      {/* Contextual Table Controls */}
      {inTable && (
        <div className="flex flex-wrap items-center gap-1.5 border-b border-[var(--border)] bg-[var(--accent-soft)] px-3 py-1.5 text-[13px]">
          <span className="font-medium text-[var(--accent)]">Table:</span>
          <StudioButton
            variant="secondary"
            size="sm"
            onClick={() => editor?.chain().focus().addRowAfter().run()}
          >
            <Rows3 />
            <span>+ Row</span>
          </StudioButton>
          <StudioButton
            variant="ghost"
            size="sm"
            onClick={() => editor?.chain().focus().deleteRow().run()}
          >
            - Row
          </StudioButton>
          <StudioButton
            variant="secondary"
            size="sm"
            onClick={() => editor?.chain().focus().addColumnAfter().run()}
          >
            <Columns3 />
            <span>+ Col</span>
          </StudioButton>
          <StudioButton
            variant="ghost"
            size="sm"
            onClick={() => editor?.chain().focus().deleteColumn().run()}
          >
            - Col
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

      {/* GitHub Box Header + Real 848px Canvas */}
      <div
        data-gh-theme={githubTheme}
        className={cn(
          "flex flex-col bg-[var(--gh-bg)] text-[var(--gh-text)]",
          isModalFullscreen && "min-h-0 flex-1 overflow-y-auto"
        )}
      >
        {widthMode === "github-848" || isModalFullscreen ? (
          <ScaledReadmeViewport
            intrinsicWidth={880}
            zoomMode={isModalFullscreen ? "100" : zoomMode}
            overrideFitZoom={isModalFullscreen ? 1 : sharedFitZoom}
            onFitZoomChange={isModalFullscreen ? undefined : onMeasureFitZoom}
          >
            <div className="w-[880px] bg-[var(--gh-bg)]">
              <div className="flex items-center justify-between border-b border-[var(--gh-border)] bg-[var(--gh-surface)] px-4 py-2 text-[12px] text-[var(--gh-muted)]">
                <span className="studio-mono font-medium text-[var(--gh-text)]">
                  {username} / README.md
                </span>
                <span>GitHub width (848px)</span>
              </div>
              <div
                className={cn(
                  "gh-markdown-body px-4 py-6",
                  isModalFullscreen ? "min-h-[460px]" : "min-h-[260px]"
                )}
              >
                <div className="mx-auto w-[848px]">
                  <EditorContent editor={editor} />
                </div>
              </div>
            </div>
          </ScaledReadmeViewport>
        ) : (
          <div className="w-full bg-[var(--gh-bg)]">
            <div className="flex items-center justify-between border-b border-[var(--gh-border)] bg-[var(--gh-surface)] px-4 py-2 text-[12px] text-[var(--gh-muted)]">
              <span className="studio-mono font-medium text-[var(--gh-text)]">
                {username} / README.md
              </span>
              <span>Fit pane</span>
            </div>
            <div className="gh-markdown-body min-h-[260px] px-4 py-6">
              <EditorContent editor={editor} />
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-t border-[var(--border)] bg-[var(--surface-2)] px-4 py-2 text-[12px] text-[var(--text-muted)]">
        <span className="studio-mono">
          {words} words · {chars} characters · {linesCount} lines
        </span>
        <span className="hidden sm:inline">
          Use Heading underline to toggle the bottom divider on headings.
        </span>
      </div>
    </div>
  );

  return (
    <TooltipProvider delay={180}>
      <div className="flex flex-col gap-4">
        {/* Top action row above editor */}
        <div className="flex flex-wrap items-center justify-between gap-2.5 px-4 sm:px-5">
          <div className="flex flex-wrap items-center gap-2">
            <StudioButton
              variant="secondary"
              size="sm"
              onClick={() => setTemplatesOpen(true)}
            >
              <LayoutTemplate />
              <span>Templates</span>
              <span className="studio-mono inline-flex items-center rounded-full border border-[var(--border)] bg-[var(--surface-2)] px-2 py-0.5 text-[11px] font-medium text-[var(--text)]">
                {PROFILE_EDITOR_TEMPLATES.length}
              </span>
            </StudioButton>

            <StudioButton
              variant="secondary"
              size="sm"
              onClick={onSyncFromForm}
              title="Re-sync intro from your GitHub profile"
            >
              <RotateCcw />
              <span>Sync from form</span>
            </StudioButton>

            <StudioButton
              variant="ghost"
              size="sm"
              onClick={() => setConfirmClearOpen(true)}
              className="text-[var(--text-muted)] hover:text-[var(--danger)]"
            >
              <Eraser />
              <span>Clear all</span>
            </StudioButton>
          </div>

          <div className="w-full sm:w-auto sm:min-w-[260px]">
            <StudioSegmentedControl<WidthMode>
              ariaLabel="Editor width mode"
              size="sm"
              value={widthMode}
              onChange={setWidthMode}
              options={[
                { value: "github-848", label: "GitHub width (848px)" },
                { value: "fit-pane", label: "Fit pane" },
              ]}
            />
          </div>
        </div>

        {/* Dynamic Value Chips */}
        <div className="px-4 sm:px-5">{dynamicValueBar}</div>

        {/* Inline Editor Surface (yields to modal when fullscreen is active so single editor instance moves cleanly) */}
        {!fullscreen && renderEditorSurface(false)}

        {/* Templates Gallery Modal */}
        <StudioDialog
          open={templatesOpen}
          onOpenChange={setTemplatesOpen}
          title={`Starter README templates (${PROFILE_EDITOR_TEMPLATES.length})`}
          description="Select a template to populate your header and intro. Dynamic values automatically adapt to your profile."
          maxWidthClass="sm:max-w-4xl"
          footer={
            <StudioButton
              variant="secondary"
              onClick={() => setTemplatesOpen(false)}
            >
              Close
            </StudioButton>
          }
        >
          <div className="grid gap-4 sm:grid-cols-2">
            {PROFILE_EDITOR_TEMPLATES.map((tpl) => {
              const resolvedPreview = resolveDynamicTokens(
                tpl.markdown,
                creatureConfig
              );
              return (
                <button
                  key={tpl.id}
                  type="button"
                  onClick={() => {
                    applyExternalMarkdown(tpl.markdown);
                    setTemplatesOpen(false);
                  }}
                  className="flex cursor-pointer flex-col overflow-hidden rounded-[8px] border border-[var(--border)] bg-[var(--surface)] text-left transition-[color,background-color,border-color] duration-150 hover:border-[var(--accent)]"
                >
                  <div className="flex flex-col gap-1 border-b border-[var(--border)] bg-[var(--surface-2)] px-4 py-3">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[14px] font-semibold text-[var(--text)]">
                        {tpl.name}
                      </span>
                      <span className="inline-flex rounded-full border border-[var(--border)] bg-[var(--surface)] px-2 py-0.5 text-[11px] font-medium text-[var(--text-muted)]">
                        {tpl.category}
                      </span>
                    </div>
                    <p className="text-[12px] leading-4 text-[var(--text-muted)]">
                      {tpl.description}
                    </p>
                  </div>

                  <div
                    data-gh-theme={githubTheme}
                    className="h-36 overflow-hidden bg-[var(--gh-bg)] p-3"
                  >
                    <div
                      style={{
                        width: "848px",
                        zoom: 0.44,
                        pointerEvents: "none",
                      }}
                    >
                      <AdvancedMarkdownPreview
                        markdown={resolvedPreview}
                        isDark={githubTheme === "dark"}
                      />
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </StudioDialog>

        {/* Clear All Confirmation Dialog */}
        <StudioConfirmDialog
          open={confirmClearOpen}
          onOpenChange={setConfirmClearOpen}
          title="Clear header and intro?"
          description="This empties the rich text intro editor. Your tech stack cards, links, and creature settings stay intact."
          confirmLabel="Clear all"
          destructive
          onConfirm={() => {
            if (editor) {
              editor.chain().focus().clearContent(true).run();
            } else {
              onChange("");
            }
          }}
        />

        {/* Fullscreen Editor Modal */}
        <StudioDialog
          open={fullscreen}
          onOpenChange={setFullscreen}
          title="Profile header & intro editor"
          description="Full-width 848px GitHub markdown editing canvas."
          maxWidthClass="sm:max-w-[980px]"
          footer={
            <StudioButton
              variant="primary"
              onClick={() => setFullscreen(false)}
            >
              Done editing
            </StudioButton>
          }
        >
          <div className="flex h-[68vh] flex-col gap-3">
            {dynamicValueBar}
            <div className="min-h-0 flex-1">
              {fullscreen && renderEditorSurface(true)}
            </div>
          </div>
        </StudioDialog>
      </div>
    </TooltipProvider>
  );
}
