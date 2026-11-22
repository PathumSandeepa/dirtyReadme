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
  Columns2,
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
import { copyToClipboard } from "@/infrastructure/browser/downloadAdapter";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverDescription,
  PopoverHeader,
  PopoverTitle,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Separator } from "@/components/ui/separator";
import { Toggle } from "@/components/ui/toggle";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface AdvancedMarkdownEditorProps {
  value: string;
  onChange: (next: string) => void;
  creatureConfig: CreatureConfig;
  onSyncFromForm: () => void;
  focusExpanded?: boolean;
  onToggleFocusExpanded?: () => void;
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

export function AdvancedMarkdownEditor({
  value,
  onChange,
  creatureConfig,
  onSyncFromForm,
  focusExpanded = false,
  onToggleFocusExpanded,
}: AdvancedMarkdownEditorProps) {
  const lastEmittedMarkdownRef = useRef<string>(value);
  const onChangeRef = useRef(onChange);

  useEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);

  const [expanded, setExpanded] = useState(false);
  const [copied, setCopied] = useState(false);
  const [templatesOpen, setTemplatesOpen] = useState(false);
  const [emojisOpen, setEmojisOpen] = useState(false);
  const [linkPopoverOpen, setLinkPopoverOpen] = useState(false);
  const [linkUrlInput, setLinkUrlInput] = useState("https://");
  const [imagePopoverOpen, setImagePopoverOpen] = useState(false);
  const [imageUrlInput, setImageUrlInput] = useState("");
  const [imageAltInput, setImageAltInput] = useState("");

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
          "Start writing your GitHub profile intro, choose a Template above, or insert Dynamic Tokens...",
      }),
      CharacterCount,
    ],
    content: markdownToEditorHtml(value),
    onUpdate: ({ editor: activeEditor }) => {
      const serialized = tiptapJsonToGithubMarkdown(activeEditor.getJSON());
      lastEmittedMarkdownRef.current = serialized;
      onChangeRef.current(serialized);
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
      return;
    }
    const html = markdownToEditorHtml(markdown);
    editor.chain().focus().setContent(html).run();
  };

  const handleOpenLinkPopover = (open: boolean) => {
    if (open && editor) {
      const existing = String(editor.getAttributes("link").href ?? "");
      setLinkUrlInput(existing || "https://");
    }
    setLinkPopoverOpen(open);
  };

  const handleApplyLink = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editor) return;
    const normalized = normalizeInputUrl(linkUrlInput);
    if (!normalized) {
      editor.chain().focus().unsetLink().run();
    } else {
      editor
        .chain()
        .focus()
        .extendMarkRange("link")
        .setLink({ href: normalized })
        .run();
    }
    setLinkPopoverOpen(false);
  };

  const handleInsertImage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editor) return;
    const normalized = normalizeInputUrl(imageUrlInput);
    if (!normalized) return;
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
    setImagePopoverOpen(false);
  };

  const handleToggleHeadingLine = () => {
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
    ? "H1 · Line"
    : editor?.isActive("heading", { level: 2 })
      ? "H2 · Line"
      : editor?.isActive("heading", { level: 3 })
        ? "H3 · Clean"
        : editor?.isActive("heading", { level: 4 })
          ? "H4 · Small"
          : "Normal";

  const hasHeadingUnderline = Boolean(
    editor?.isActive("heading", { level: 1 }) ||
    editor?.isActive("heading", { level: 2 })
  );

  const inTable = Boolean(editor?.isActive("table"));
  const words = editor?.storage.characterCount?.words() ?? 0;
  const chars = editor?.storage.characterCount?.characters() ?? 0;
  const linesCount = value ? value.split(/\r?\n/).length : 0;

  return (
    <TooltipProvider delay={200}>
      <section className="flex flex-col gap-3 rounded-xl border bg-card p-4 sm:p-5">
        {/* Clean Header + Top Action Bar */}
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="flex flex-col gap-1">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="font-mono text-sm font-semibold text-foreground sm:text-base">
                Advanced Profile README Editor
              </h2>
              <Badge variant="secondary" className="font-mono text-[10px]">
                WYSIWYG
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground">
              Format directly like a live GitHub document — changes stream
              live into the README preview.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-1.5">
            <Popover open={templatesOpen} onOpenChange={setTemplatesOpen}>
              <PopoverTrigger
                render={<Button type="button" variant="secondary" size="sm" />}
              >
                <LayoutTemplate data-icon="inline-start" />
                Templates
                <Badge variant="outline" className="font-mono text-[10px]">
                  {PROFILE_EDITOR_TEMPLATES.length}
                </Badge>
              </PopoverTrigger>
              <PopoverContent
                align="end"
                className="w-[min(calc(100vw-2rem),540px)]"
              >
                <PopoverHeader>
                  <PopoverTitle className="font-mono text-xs">
                    Starter README Templates (10)
                  </PopoverTitle>
                  <PopoverDescription className="text-xs">
                    Dynamic Tokens automatically adapt to your GitHub handle and
                    telemetry.
                  </PopoverDescription>
                </PopoverHeader>
                <div className="grid max-h-[360px] gap-2 overflow-y-auto pr-1 sm:grid-cols-2">
                  {PROFILE_EDITOR_TEMPLATES.map((tpl) => (
                    <button
                      key={tpl.id}
                      type="button"
                      onClick={() => {
                        applyExternalMarkdown(tpl.markdown);
                        setTemplatesOpen(false);
                      }}
                      className="flex flex-col items-start gap-1 rounded-lg bg-muted/45 p-2.5 text-left transition hover:bg-accent"
                    >
                      <div className="flex w-full items-center justify-between gap-2">
                        <span className="text-xs font-semibold text-foreground">
                          {tpl.name}
                        </span>
                        <Badge
                          variant="secondary"
                          className="font-mono text-[10px]"
                        >
                          {tpl.category}
                        </Badge>
                      </div>
                      <span className="text-[11px] leading-snug text-muted-foreground">
                        {tpl.description}
                      </span>
                    </button>
                  ))}
                </div>
              </PopoverContent>
            </Popover>

            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={onSyncFromForm}
              title="Re-sync intro from your GitHub profile"
            >
              <RotateCcw data-icon="inline-start" />
              Sync from Form
            </Button>

            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => {
                if (editor) {
                  editor.chain().focus().clearContent(true).run();
                } else {
                  onChange("");
                }
              }}
              className="hover:text-destructive"
            >
              <Eraser data-icon="inline-start" />
              Clear all
            </Button>

            {onToggleFocusExpanded && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={onToggleFocusExpanded}
                className="hidden xl:inline-flex"
              >
                <Columns2 data-icon="inline-start" />
                {focusExpanded ? "Side-by-Side" : "Full 848px Width"}
              </Button>
            )}
          </div>
        </div>

        {/* Dynamic Tokens Ribbon */}
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="font-mono text-[11px] text-muted-foreground">
            Tokens:
          </span>
          {DYNAMIC_TOKENS.map((t) => (
            <button
              key={t.token}
              type="button"
              title={t.description}
              onClick={() => {
                editor?.chain().focus().insertContent(t.token).run();
              }}
              className="rounded-md bg-muted/65 px-2 py-0.5 font-mono text-[11px] text-foreground transition hover:bg-accent"
            >
              {t.token}
            </button>
          ))}
        </div>

        {/* Responsive GitHub-Width Container */}
        <div
          className={cn(
            "w-full overflow-hidden rounded-xl border bg-background",
            focusExpanded && "mx-auto max-w-[896px]"
          )}
        >
          {/* Rich WYSIWYG Formatting Bar */}
          <div className="flex flex-wrap items-center gap-0.5 border-b bg-muted/35 px-2 py-1.5">
            <Tooltip>
              <TooltipTrigger
                render={
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-sm"
                    disabled={!editor?.can().undo()}
                    onClick={() => editor?.chain().focus().undo().run()}
                    aria-label="Undo"
                  />
                }
              >
                <Undo2 />
              </TooltipTrigger>
              <TooltipContent>Undo (Ctrl+Z)</TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger
                render={
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-sm"
                    disabled={!editor?.can().redo()}
                    onClick={() => editor?.chain().focus().redo().run()}
                    aria-label="Redo"
                  />
                }
              >
                <Redo2 />
              </TooltipTrigger>
              <TooltipContent>Redo (Ctrl+Y)</TooltipContent>
            </Tooltip>

            <Separator orientation="vertical" className="mx-1 h-5" />

            <DropdownMenu>
              <DropdownMenuTrigger
                render={
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    className="font-mono text-xs"
                  />
                }
              >
                <Heading data-icon="inline-start" />
                {currentHeadingLabel}
                <ChevronDown data-icon="inline-end" />
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56">
                <DropdownMenuGroup>
                  <DropdownMenuLabel>Text Block Level</DropdownMenuLabel>
                  <DropdownMenuItem
                    onClick={() =>
                      editor?.chain().focus().setParagraph().run()
                    }
                  >
                    Normal Text (Body 16px)
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() =>
                      editor?.chain().focus().toggleHeading({ level: 1 }).run()
                    }
                  >
                    H1 · Large Banner (has line)
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() =>
                      editor?.chain().focus().toggleHeading({ level: 2 }).run()
                    }
                  >
                    H2 · Section Title (has line)
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() =>
                      editor?.chain().focus().toggleHeading({ level: 3 }).run()
                    }
                  >
                    H3 · Clean Title (no line)
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() =>
                      editor?.chain().focus().toggleHeading({ level: 4 }).run()
                    }
                  >
                    H4 · Small Heading (no line)
                  </DropdownMenuItem>
                </DropdownMenuGroup>
              </DropdownMenuContent>
            </DropdownMenu>

            <Tooltip>
              <TooltipTrigger
                render={
                  <Toggle
                    size="sm"
                    pressed={hasHeadingUnderline}
                    onPressedChange={handleToggleHeadingLine}
                    aria-label="Toggle heading horizontal underline"
                    className="font-mono text-[11px]"
                  />
                }
              >
                {hasHeadingUnderline ? "Line: ON" : "Line: OFF"}
              </TooltipTrigger>
              <TooltipContent>
                Toggle GitHub horizontal underline under this heading (H2 ↔ H3)
              </TooltipContent>
            </Tooltip>

            <Separator orientation="vertical" className="mx-1 h-5" />

            <Tooltip>
              <TooltipTrigger
                render={
                  <Toggle
                    size="sm"
                    pressed={Boolean(editor?.isActive("bold"))}
                    onPressedChange={() =>
                      editor?.chain().focus().toggleBold().run()
                    }
                    aria-label="Bold"
                  />
                }
              >
                <Bold />
              </TooltipTrigger>
              <TooltipContent>Bold (Ctrl+B)</TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger
                render={
                  <Toggle
                    size="sm"
                    pressed={Boolean(editor?.isActive("italic"))}
                    onPressedChange={() =>
                      editor?.chain().focus().toggleItalic().run()
                    }
                    aria-label="Italic"
                  />
                }
              >
                <Italic />
              </TooltipTrigger>
              <TooltipContent>Italic (Ctrl+I)</TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger
                render={
                  <Toggle
                    size="sm"
                    pressed={Boolean(editor?.isActive("underline"))}
                    onPressedChange={() =>
                      editor?.chain().focus().toggleUnderline().run()
                    }
                    aria-label="Underline"
                  />
                }
              >
                <UnderlineIcon />
              </TooltipTrigger>
              <TooltipContent>Underline (Ctrl+U)</TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger
                render={
                  <Toggle
                    size="sm"
                    pressed={Boolean(editor?.isActive("strike"))}
                    onPressedChange={() =>
                      editor?.chain().focus().toggleStrike().run()
                    }
                    aria-label="Strikethrough"
                  />
                }
              >
                <Strikethrough />
              </TooltipTrigger>
              <TooltipContent>Strikethrough</TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger
                render={
                  <Toggle
                    size="sm"
                    pressed={Boolean(editor?.isActive("code"))}
                    onPressedChange={() =>
                      editor?.chain().focus().toggleCode().run()
                    }
                    aria-label="Inline Code"
                  />
                }
              >
                <Code />
              </TooltipTrigger>
              <TooltipContent>Inline Code</TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger
                render={
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-sm"
                    onClick={() =>
                      editor
                        ?.chain()
                        .focus()
                        .unsetAllMarks()
                        .clearNodes()
                        .run()
                    }
                    aria-label="Clear Formatting"
                  />
                }
              >
                <RemoveFormatting />
              </TooltipTrigger>
              <TooltipContent>Clear Formatting</TooltipContent>
            </Tooltip>

            <Separator orientation="vertical" className="mx-1 h-5" />

            <Tooltip>
              <TooltipTrigger
                render={
                  <Toggle
                    size="sm"
                    pressed={Boolean(editor?.isActive({ textAlign: "left" }))}
                    onPressedChange={() =>
                      editor?.chain().focus().setTextAlign("left").run()
                    }
                    aria-label="Align Left"
                  />
                }
              >
                <AlignLeft />
              </TooltipTrigger>
              <TooltipContent>Align Left</TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger
                render={
                  <Toggle
                    size="sm"
                    pressed={Boolean(
                      editor?.isActive({ textAlign: "center" })
                    )}
                    onPressedChange={() =>
                      editor?.chain().focus().setTextAlign("center").run()
                    }
                    aria-label="Align Center"
                  />
                }
              >
                <AlignCenter />
              </TooltipTrigger>
              <TooltipContent>Align Center</TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger
                render={
                  <Toggle
                    size="sm"
                    pressed={Boolean(editor?.isActive({ textAlign: "right" }))}
                    onPressedChange={() =>
                      editor?.chain().focus().setTextAlign("right").run()
                    }
                    aria-label="Align Right"
                  />
                }
              >
                <AlignRight />
              </TooltipTrigger>
              <TooltipContent>Align Right</TooltipContent>
            </Tooltip>

            <Separator orientation="vertical" className="mx-1 h-5" />

            <Tooltip>
              <TooltipTrigger
                render={
                  <Toggle
                    size="sm"
                    pressed={Boolean(editor?.isActive("bulletList"))}
                    onPressedChange={() =>
                      editor?.chain().focus().toggleBulletList().run()
                    }
                    aria-label="Bullet List"
                  />
                }
              >
                <List />
              </TooltipTrigger>
              <TooltipContent>Bullet List</TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger
                render={
                  <Toggle
                    size="sm"
                    pressed={Boolean(editor?.isActive("orderedList"))}
                    onPressedChange={() =>
                      editor?.chain().focus().toggleOrderedList().run()
                    }
                    aria-label="Numbered List"
                  />
                }
              >
                <ListOrdered />
              </TooltipTrigger>
              <TooltipContent>Numbered List</TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger
                render={
                  <Toggle
                    size="sm"
                    pressed={Boolean(editor?.isActive("taskList"))}
                    onPressedChange={() =>
                      editor?.chain().focus().toggleTaskList().run()
                    }
                    aria-label="Task Checklist"
                  />
                }
              >
                <CheckSquare />
              </TooltipTrigger>
              <TooltipContent>Task Checklist</TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger
                render={
                  <Toggle
                    size="sm"
                    pressed={Boolean(editor?.isActive("blockquote"))}
                    onPressedChange={() =>
                      editor?.chain().focus().toggleBlockquote().run()
                    }
                    aria-label="Blockquote"
                  />
                }
              >
                <Quote />
              </TooltipTrigger>
              <TooltipContent>Blockquote</TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger
                render={
                  <Toggle
                    size="sm"
                    pressed={Boolean(editor?.isActive("codeBlock"))}
                    onPressedChange={() =>
                      editor?.chain().focus().toggleCodeBlock().run()
                    }
                    aria-label="Code Block"
                  />
                }
              >
                <FileCode2 />
              </TooltipTrigger>
              <TooltipContent>Code Block</TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger
                render={
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-sm"
                    onClick={() =>
                      editor?.chain().focus().setHorizontalRule().run()
                    }
                    aria-label="Insert Horizontal Line"
                  />
                }
              >
                <Minus />
              </TooltipTrigger>
              <TooltipContent>
                Insert Horizontal Divider (click line &amp; Backspace to delete)
              </TooltipContent>
            </Tooltip>

            <Separator orientation="vertical" className="mx-1 h-5" />

            {/* Link Popover */}
            <Popover
              open={linkPopoverOpen}
              onOpenChange={handleOpenLinkPopover}
            >
              <PopoverTrigger
                render={
                  <Button
                    type="button"
                    variant={editor?.isActive("link") ? "secondary" : "ghost"}
                    size="icon-sm"
                    title="Insert or edit link"
                    aria-label="Insert or edit link"
                  />
                }
              >
                <Link2 />
              </PopoverTrigger>
              <PopoverContent className="w-80">
                <PopoverHeader>
                  <PopoverTitle className="font-mono text-xs">
                    Add or Edit Link
                  </PopoverTitle>
                </PopoverHeader>
                <form onSubmit={handleApplyLink} className="flex flex-col gap-3">
                  <FieldGroup>
                    <Field>
                      <FieldLabel
                        htmlFor="editor-link-url"
                        className="font-mono text-xs"
                      >
                        Target URL
                      </FieldLabel>
                      <Input
                        id="editor-link-url"
                        type="text"
                        value={linkUrlInput}
                        onChange={(e) => setLinkUrlInput(e.target.value)}
                        placeholder="https://github.com/..."
                      />
                    </Field>
                  </FieldGroup>
                  <div className="flex items-center justify-between gap-2">
                    {editor?.isActive("link") && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          editor.chain().focus().unsetLink().run();
                          setLinkPopoverOpen(false);
                        }}
                      >
                        <Unlink data-icon="inline-start" />
                        Remove
                      </Button>
                    )}
                    <Button type="submit" size="sm" className="ml-auto">
                      Apply Link
                    </Button>
                  </div>
                </form>
              </PopoverContent>
            </Popover>

            {/* Image / Shield Popover */}
            <Popover
              open={imagePopoverOpen}
              onOpenChange={setImagePopoverOpen}
            >
              <PopoverTrigger
                render={
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-sm"
                    title="Insert image or badge URL"
                    aria-label="Insert image or badge URL"
                  />
                }
              >
                <ImageIcon />
              </PopoverTrigger>
              <PopoverContent className="w-80">
                <PopoverHeader>
                  <PopoverTitle className="font-mono text-xs">
                    Insert Image or Shield URL
                  </PopoverTitle>
                </PopoverHeader>
                <form
                  onSubmit={handleInsertImage}
                  className="flex flex-col gap-3"
                >
                  <FieldGroup>
                    <Field>
                      <FieldLabel
                        htmlFor="editor-img-url"
                        className="font-mono text-xs"
                      >
                        Image URL
                      </FieldLabel>
                      <Input
                        id="editor-img-url"
                        type="text"
                        value={imageUrlInput}
                        onChange={(e) => setImageUrlInput(e.target.value)}
                        placeholder="https://img.shields.io/badge/..."
                      />
                    </Field>
                    <Field>
                      <FieldLabel
                        htmlFor="editor-img-alt"
                        className="font-mono text-xs"
                      >
                        Alt Text
                      </FieldLabel>
                      <Input
                        id="editor-img-alt"
                        type="text"
                        value={imageAltInput}
                        onChange={(e) => setImageAltInput(e.target.value)}
                        placeholder="Badge or Banner description"
                      />
                    </Field>
                  </FieldGroup>
                  <div className="flex items-center justify-between gap-2">
                    <Button
                      type="button"
                      variant="secondary"
                      size="sm"
                      onClick={() => {
                        setImageUrlInput(
                          `https://komarev.com/ghpvc/?username=${encodeURIComponent(username)}&color=4f46e5&style=for-the-badge`
                        );
                        setImageAltInput("Profile views");
                      }}
                    >
                      Visitor Badge
                    </Button>
                    <Button type="submit" size="sm">
                      Insert Image
                    </Button>
                  </div>
                </form>
              </PopoverContent>
            </Popover>

            {/* Table Insert Button */}
            <Tooltip>
              <TooltipTrigger
                render={
                  <Button
                    type="button"
                    variant={inTable ? "secondary" : "ghost"}
                    size="icon-sm"
                    onClick={() =>
                      editor
                        ?.chain()
                        .focus()
                        .insertTable({
                          rows: 3,
                          cols: 3,
                          withHeaderRow: true,
                        })
                        .run()
                    }
                    aria-label="Insert 3x3 Table"
                  />
                }
              >
                <Table2 />
              </TooltipTrigger>
              <TooltipContent>Insert 3×3 Markdown Table</TooltipContent>
            </Tooltip>

            {/* Emoji Popover */}
            <Popover open={emojisOpen} onOpenChange={setEmojisOpen}>
              <PopoverTrigger
                render={
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-sm"
                    title="Insert emoji"
                    aria-label="Insert emoji"
                  />
                }
              >
                <Smile />
              </PopoverTrigger>
              <PopoverContent className="w-72">
                <PopoverHeader>
                  <PopoverTitle className="font-mono text-xs">
                    Quick Profile Emojis
                  </PopoverTitle>
                </PopoverHeader>
                <div className="grid grid-cols-6 gap-1">
                  {PROFILE_EMOJIS.map((emoji) => (
                    <button
                      key={emoji}
                      type="button"
                      onClick={() => {
                        editor?.chain().focus().insertContent(emoji).run();
                        setEmojisOpen(false);
                      }}
                      className="flex size-9 items-center justify-center rounded-md bg-muted/40 text-base transition hover:scale-105 hover:bg-muted"
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </PopoverContent>
            </Popover>

            {/* Snippets Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger
                render={
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="font-mono text-xs"
                  />
                }
              >
                <Sparkles data-icon="inline-start" />
                Snippets
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56">
                <DropdownMenuGroup>
                  <DropdownMenuLabel>Insert Profile Block</DropdownMenuLabel>
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
                    Developer Status Bullets
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() =>
                      editor
                        ?.chain()
                        .focus()
                        .insertContent(
                          markdownToEditorHtml(
                            "> **Current Focus:** Building clean architecture and open-source developer tools."
                          )
                        )
                        .run()
                    }
                  >
                    Highlight Callout Quote
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
                    Roadmap Checklist
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
                            `![Profile Views](https://komarev.com/ghpvc/?username=${encodeURIComponent(username)}&color=4f46e5&style=for-the-badge)`
                          )
                        )
                        .run()
                    }
                  >
                    Profile Visitor Counter Badge
                  </DropdownMenuItem>
                </DropdownMenuGroup>
              </DropdownMenuContent>
            </DropdownMenu>

            <div className="ml-auto flex items-center gap-0.5">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleCopyMarkdown}
                className="font-mono text-xs"
              >
                {copied ? (
                  <Check data-icon="inline-start" />
                ) : (
                  <Copy data-icon="inline-start" />
                )}
                {copied ? "Copied" : "Copy MD"}
              </Button>

              <Tooltip>
                <TooltipTrigger
                  render={
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon-sm"
                      onClick={() => setExpanded((prev) => !prev)}
                      aria-label={
                        expanded
                          ? "Compact editor height"
                          : "Expand editor height"
                      }
                    />
                  }
                >
                  {expanded ? <Minimize2 /> : <Maximize2 />}
                </TooltipTrigger>
                <TooltipContent>
                  {expanded ? "Compact canvas" : "Expand canvas"}
                </TooltipContent>
              </Tooltip>
            </div>
          </div>

          {/* Contextual Table Controls Bar */}
          {inTable && (
            <div className="flex flex-wrap items-center gap-1 border-b bg-accent/50 px-3 py-1.5 text-xs">
              <span className="mr-1 font-mono text-[11px] font-semibold text-foreground">
                Table:
              </span>
              <Button
                type="button"
                variant="secondary"
                size="xs"
                onClick={() => editor?.chain().focus().addRowAfter().run()}
              >
                <Rows3 data-icon="inline-start" />+ Row
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="xs"
                onClick={() => editor?.chain().focus().deleteRow().run()}
              >
                - Row
              </Button>
              <Button
                type="button"
                variant="secondary"
                size="xs"
                onClick={() => editor?.chain().focus().addColumnAfter().run()}
              >
                <Columns3 data-icon="inline-start" />+ Col
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="xs"
                onClick={() => editor?.chain().focus().deleteColumn().run()}
              >
                - Col
              </Button>
              <Button
                type="button"
                variant="destructive"
                size="xs"
                onClick={() => editor?.chain().focus().deleteTable().run()}
                className="ml-auto"
              >
                <Trash2 data-icon="inline-start" />
                Delete Table
              </Button>
            </div>
          )}

          {/* GitHub-Sized White Canvas Header */}
          <div className="flex items-center justify-between border-b border-slate-200 bg-white px-4 py-2 font-mono text-[11px] text-slate-500 sm:px-6">
            <span>{username} / README.md</span>
            <span>Real-Time GitHub Primer Scale</span>
          </div>

          {/* Pure White GitHub Primer Typography Canvas */}
          <div
            className={cn(
              "github-wysiwyg px-4 py-4 transition-all sm:px-6 sm:py-5",
              expanded ? "min-h-[440px]" : "min-h-[240px]"
            )}
          >
            <EditorContent editor={editor} />
          </div>

          {/* Status Footer */}
          <div className="flex flex-wrap items-center justify-between gap-2 border-t bg-muted/30 px-4 py-2 font-mono text-[11px] text-muted-foreground">
            <span>
              {words} words · {chars} chars · {linesCount} lines
            </span>
            <span className="hidden sm:inline">
              Tip: Toggle heading underline with <strong>Line: ON / OFF</strong>
            </span>
          </div>
        </div>
      </section>
    </TooltipProvider>
  );
}
