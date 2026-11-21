"use client";

import { useRef, useState } from "react";
import {
  AlignCenter,
  Bold,
  Check,
  CheckSquare,
  Code2,
  Copy,
  Eraser,
  Eye,
  FileCode2,
  Heading1,
  Heading2,
  Heading3,
  Image as ImageIcon,
  Italic,
  LayoutTemplate,
  Link2,
  List,
  ListOrdered,
  Maximize2,
  Minimize2,
  Pencil,
  Quote,
  Redo2,
  RotateCcw,
  SeparatorHorizontal,
  Smile,
  Strikethrough,
  Table2,
  Undo2,
} from "lucide-react";
import type { CreatureConfig } from "@/domain/creature/entities";
import { DYNAMIC_TOKENS } from "@/domain/profile/entities";
import { resolveDynamicTokens } from "@/domain/profile/readmeService";
import { copyToClipboard } from "@/infrastructure/browser/downloadAdapter";
import { AdvancedMarkdownPreview } from "./MarkdownPreviewRenderer";

interface AdvancedMarkdownEditorProps {
  value: string;
  onChange: (next: string) => void;
  creatureConfig: CreatureConfig;
  onSyncFromForm: () => void;
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
];

const STARTER_TEMPLATES: {
  id: string;
  name: string;
  content: string;
}[] = [
  {
    id: "dev-intro",
    name: "Developer Intro",
    content: [
      "## Hi there, I'm @{{USERNAME}} 👋",
      "",
      "**FULL-STACK DEVELOPER | OPEN SOURCE | CLEAN ARCHITECTURE**",
      "",
      "Building fast, reliable software with `{{LANGUAGES}}`. Currently evolving my Stage {{STAGE}} **{{CREATURE}}** (`{{COMMITS}}` contributions).",
      "",
      "- 🔭 Working on scalable web tools and automation",
      "- 🌱 Exploring systems engineering and AI developer workflows",
      "- 📫 Reach out via the links below!",
    ].join("\n"),
  },
  {
    id: "maintainer",
    name: "Open-Source Maintainer",
    content: [
      "## @{{USERNAME}} · Open-Source Maintainer 🛠️",
      "",
      "> Shipping developer-first packages, CLI utilities, and composable UI libraries.",
      "",
      "### Highlights",
      "",
      "| Focus | Stack | Status |",
      "| --- | --- | --- |",
      "| Core Architecture | TypeScript · Node.js | Active |",
      "| Documentation | Markdown · Live Demos | Maintained |",
      "",
      "- [x] Automated profile evolution enabled (`{{RANK}}`)",
      "- [x] Open to meaningful OSS collaborations",
    ].join("\n"),
  },
  {
    id: "minimal-clean",
    name: "Minimal Clean",
    content: [
      "<p align=\"center\">",
      "  <strong>@{{USERNAME}}</strong> — Software Engineer crafting calm, durable software.",
      "</p>",
      "",
      "---",
      "",
      "Primary stack: `{{LANGUAGES}}`",
    ].join("\n"),
  },
  {
    id: "building-learning",
    name: "Building & Learning",
    content: [
      "## Welcome to @{{USERNAME}}'s Lab 🚀",
      "",
      "Here's what's on my radar right now:",
      "",
      "1. Designing interactive Canvas & WebP generators",
      "2. Writing clean, well-tested TypeScript modules",
      "3. Contributing daily towards Stage 5 (**ELDER**)",
      "",
      "```ts",
      'const focus = "Keep building, stay curious";',
      "```",
    ].join("\n"),
  },
];

export function AdvancedMarkdownEditor({
  value,
  onChange,
  creatureConfig,
  onSyncFromForm,
}: AdvancedMarkdownEditorProps) {
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const lastTypingSnapshotAtRef = useRef<number>(0);

  const [mode, setMode] = useState<"write" | "preview">("write");
  const [expanded, setExpanded] = useState(false);
  const [showEmojis, setShowEmojis] = useState(false);
  const [showTemplates, setShowTemplates] = useState(false);
  const [copied, setCopied] = useState(false);
  const [undoStack, setUndoStack] = useState<string[]>([]);
  const [redoStack, setRedoStack] = useState<string[]>([]);

  function pushUndoSnapshot(snapshot: string) {
    setUndoStack((prev) => {
      if (prev[prev.length - 1] === snapshot) return prev;
      return [...prev.slice(-49), snapshot];
    });
    setRedoStack([]);
  }

  function commitValue(next: string, pushSnapshot = true) {
    if (next === value) return;
    if (pushSnapshot) {
      pushUndoSnapshot(value);
    }
    onChange(next);
  }

  function handleUndo() {
    if (undoStack.length === 0) return;
    const previous = undoStack[undoStack.length - 1];
    setUndoStack((prev) => prev.slice(0, -1));
    setRedoStack((prev) => [...prev.slice(-49), value]);
    onChange(previous);
  }

  function handleRedo() {
    if (redoStack.length === 0) return;
    const next = redoStack[redoStack.length - 1];
    setRedoStack((prev) => prev.slice(0, -1));
    setUndoStack((prev) => [...prev.slice(-49), value]);
    onChange(next);
  }

  function applyMarkdownSnippet(
    prefix: string,
    suffix = "",
    placeholder = "text"
  ) {
    setMode("write");
    const el = textareaRef.current;
    if (!el) {
      commitValue(
        `${value}${value ? "\n" : ""}${prefix}${placeholder}${suffix}`
      );
      return;
    }
    const start = el.selectionStart ?? value.length;
    const end = el.selectionEnd ?? value.length;
    const selected = value.slice(start, end) || placeholder;
    const updated =
      value.slice(0, start) + prefix + selected + suffix + value.slice(end);
    commitValue(updated);
    window.requestAnimationFrame(() => {
      el.focus();
      const cursorStart = start + prefix.length;
      el.setSelectionRange(cursorStart, cursorStart + selected.length);
    });
  }

  function insertAtCursor(snippet: string) {
    setMode("write");
    const el = textareaRef.current;
    if (!el) {
      commitValue(`${value}${snippet}`);
      return;
    }
    const start = el.selectionStart ?? value.length;
    const end = el.selectionEnd ?? value.length;
    const updated = value.slice(0, start) + snippet + value.slice(end);
    commitValue(updated);
    window.requestAnimationFrame(() => {
      el.focus();
      const nextPos = start + snippet.length;
      el.setSelectionRange(nextPos, nextPos);
    });
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if ((e.ctrlKey || e.metaKey) && !e.shiftKey) {
      const k = e.key.toLowerCase();
      if (k === "b") {
        e.preventDefault();
        applyMarkdownSnippet("**", "**", "bold text");
      } else if (k === "i") {
        e.preventDefault();
        applyMarkdownSnippet("*", "*", "italic text");
      } else if (k === "k") {
        e.preventDefault();
        applyMarkdownSnippet("[", "](https://example.com)", "Link");
      }
    } else if (e.key === "Tab") {
      e.preventDefault();
      insertAtCursor("  ");
    }
  }

  async function handleCopyMarkdown() {
    await copyToClipboard(value);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1600);
  }

  const lineCount = value ? value.split(/\r?\n/).length : 0;
  const wordCount = value.trim() ? value.trim().split(/\s+/).length : 0;
  const charCount = value.length;

  const toolbarBtnClass =
    "rounded border border-slate-200 bg-white p-1.5 text-slate-700 transition hover:bg-slate-100 hover:text-slate-950 disabled:cursor-not-allowed disabled:opacity-40";

  return (
    <div className="overflow-hidden rounded-xl border border-slate-300 bg-white text-slate-900 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 bg-slate-50 px-2.5 py-2">
        <div className="flex flex-wrap items-center gap-1">
          <div className="mr-1 grid grid-cols-2 rounded-lg border border-slate-300 bg-slate-100 p-0.5">
            <button
              type="button"
              onClick={() => setMode("write")}
              className={`inline-flex items-center gap-1 rounded-md px-2 py-1 font-mono text-[11px] font-semibold transition ${
                mode === "write"
                  ? "bg-white text-slate-900 shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <Pencil className="size-3" />
              Write
            </button>
            <button
              type="button"
              onClick={() => setMode("preview")}
              className={`inline-flex items-center gap-1 rounded-md px-2 py-1 font-mono text-[11px] font-semibold transition ${
                mode === "preview"
                  ? "bg-white text-slate-900 shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <Eye className="size-3" />
              Preview
            </button>
          </div>

          <button
            type="button"
            title="Undo"
            disabled={undoStack.length === 0}
            onClick={handleUndo}
            className={toolbarBtnClass}
          >
            <Undo2 className="size-3.5" />
          </button>
          <button
            type="button"
            title="Redo"
            disabled={redoStack.length === 0}
            onClick={handleRedo}
            className={toolbarBtnClass}
          >
            <Redo2 className="size-3.5" />
          </button>

          <span className="mx-0.5 h-4 w-px bg-slate-300" />

          <button
            type="button"
            title="Heading 1"
            onClick={() => applyMarkdownSnippet("# ", "", "Heading")}
            className={toolbarBtnClass}
          >
            <Heading1 className="size-3.5" />
          </button>
          <button
            type="button"
            title="Heading 2"
            onClick={() => applyMarkdownSnippet("## ", "", "Section")}
            className={toolbarBtnClass}
          >
            <Heading2 className="size-3.5" />
          </button>
          <button
            type="button"
            title="Heading 3"
            onClick={() => applyMarkdownSnippet("### ", "", "Subsection")}
            className={toolbarBtnClass}
          >
            <Heading3 className="size-3.5" />
          </button>

          <span className="mx-0.5 h-4 w-px bg-slate-300" />

          <button
            type="button"
            title="Bold (Ctrl+B)"
            onClick={() => applyMarkdownSnippet("**", "**", "bold text")}
            className={toolbarBtnClass}
          >
            <Bold className="size-3.5" />
          </button>
          <button
            type="button"
            title="Italic (Ctrl+I)"
            onClick={() => applyMarkdownSnippet("*", "*", "italic text")}
            className={toolbarBtnClass}
          >
            <Italic className="size-3.5" />
          </button>
          <button
            type="button"
            title="Strikethrough"
            onClick={() => applyMarkdownSnippet("~~", "~~", "struck text")}
            className={toolbarBtnClass}
          >
            <Strikethrough className="size-3.5" />
          </button>
          <button
            type="button"
            title="Inline Code"
            onClick={() => applyMarkdownSnippet("`", "`", "code")}
            className={toolbarBtnClass}
          >
            <Code2 className="size-3.5" />
          </button>
          <button
            type="button"
            title="Code Block"
            onClick={() =>
              applyMarkdownSnippet(
                "\n```ts\n",
                "\n```\n",
                'console.log("Hello, GitHub!");'
              )
            }
            className={toolbarBtnClass}
          >
            <FileCode2 className="size-3.5" />
          </button>

          <span className="mx-0.5 h-4 w-px bg-slate-300" />

          <button
            type="button"
            title="Link (Ctrl+K)"
            onClick={() =>
              applyMarkdownSnippet("[", "](https://example.com)", "Link text")
            }
            className={toolbarBtnClass}
          >
            <Link2 className="size-3.5" />
          </button>
          <button
            type="button"
            title="Image"
            onClick={() =>
              applyMarkdownSnippet(
                "![",
                "](https://example.com/banner.png)",
                "Image alt"
              )
            }
            className={toolbarBtnClass}
          >
            <ImageIcon className="size-3.5" />
          </button>
          <button
            type="button"
            title="Bullet List"
            onClick={() => applyMarkdownSnippet("- ", "", "List item")}
            className={toolbarBtnClass}
          >
            <List className="size-3.5" />
          </button>
          <button
            type="button"
            title="Numbered List"
            onClick={() => applyMarkdownSnippet("1. ", "", "Step one")}
            className={toolbarBtnClass}
          >
            <ListOrdered className="size-3.5" />
          </button>
          <button
            type="button"
            title="Task Checklist"
            onClick={() =>
              applyMarkdownSnippet("- [x] ", "", "Completed milestone")
            }
            className={toolbarBtnClass}
          >
            <CheckSquare className="size-3.5" />
          </button>
          <button
            type="button"
            title="Quote"
            onClick={() => applyMarkdownSnippet("> ", "", "Quote")}
            className={toolbarBtnClass}
          >
            <Quote className="size-3.5" />
          </button>
          <button
            type="button"
            title="Insert Markdown Table"
            onClick={() =>
              insertAtCursor(
                "\n| Column A | Column B |\n| --- | --- |\n| Value 1 | Value 2 |\n"
              )
            }
            className={toolbarBtnClass}
          >
            <Table2 className="size-3.5" />
          </button>
          <button
            type="button"
            title="Center Aligned Block"
            onClick={() =>
              applyMarkdownSnippet(
                '<p align="center">\n  ',
                "\n</p>",
                "Centered line"
              )
            }
            className={toolbarBtnClass}
          >
            <AlignCenter className="size-3.5" />
          </button>
          <button
            type="button"
            title="Horizontal Divider"
            onClick={() => insertAtCursor("\n---\n")}
            className={toolbarBtnClass}
          >
            <SeparatorHorizontal className="size-3.5" />
          </button>
        </div>

        <div className="flex flex-wrap items-center gap-1.5">
          <button
            type="button"
            onClick={() => {
              setShowEmojis((prev) => !prev);
              setShowTemplates(false);
            }}
            className={`inline-flex items-center gap-1 rounded-md border px-2 py-1 font-mono text-[11px] transition ${
              showEmojis
                ? "border-slate-900 bg-slate-900 text-white"
                : "border-slate-200 bg-white text-slate-700 hover:bg-slate-100"
            }`}
          >
            <Smile className="size-3" />
            Emojis
          </button>

          <button
            type="button"
            onClick={() => {
              setShowTemplates((prev) => !prev);
              setShowEmojis(false);
            }}
            className={`inline-flex items-center gap-1 rounded-md border px-2 py-1 font-mono text-[11px] transition ${
              showTemplates
                ? "border-slate-900 bg-slate-900 text-white"
                : "border-slate-200 bg-white text-slate-700 hover:bg-slate-100"
            }`}
          >
            <LayoutTemplate className="size-3" />
            Templates
          </button>

          <button
            type="button"
            onClick={() => {
              pushUndoSnapshot(value);
              onSyncFromForm();
            }}
            className="inline-flex items-center gap-1 rounded-md border border-slate-200 bg-white px-2 py-1 font-mono text-[11px] text-slate-700 transition hover:bg-slate-100 hover:text-slate-950"
          >
            <RotateCcw className="size-3" />
            Sync from Form
          </button>

          <button
            type="button"
            onClick={handleCopyMarkdown}
            className="inline-flex items-center gap-1 rounded-md border border-slate-200 bg-white px-2 py-1 font-mono text-[11px] text-slate-700 transition hover:bg-slate-100 hover:text-slate-950"
          >
            {copied ? <Check className="size-3" /> : <Copy className="size-3" />}
            {copied ? "Copied" : "Copy"}
          </button>

          <button
            type="button"
            title="Clear Editor"
            onClick={() => commitValue("")}
            className="inline-flex items-center gap-1 rounded-md border border-slate-200 bg-white px-2 py-1 font-mono text-[11px] text-slate-700 transition hover:bg-red-50 hover:text-red-700"
          >
            <Eraser className="size-3" />
            Clear
          </button>

          <button
            type="button"
            title={expanded ? "Compact height" : "Expand height"}
            onClick={() => setExpanded((prev) => !prev)}
            className={toolbarBtnClass}
          >
            {expanded ? (
              <Minimize2 className="size-3.5" />
            ) : (
              <Maximize2 className="size-3.5" />
            )}
          </button>
        </div>
      </div>

      {showEmojis && (
        <div className="flex flex-wrap items-center gap-1 border-b border-slate-200 bg-slate-50/80 px-3 py-2">
          <span className="mr-1 font-mono text-[10px] font-semibold uppercase tracking-wide text-slate-500">
            Insert Emoji:
          </span>
          {PROFILE_EMOJIS.map((emoji) => (
            <button
              key={emoji}
              type="button"
              onClick={() => insertAtCursor(emoji)}
              className="rounded border border-slate-200 bg-white px-1.5 py-0.5 text-sm transition hover:scale-110 hover:bg-slate-100"
            >
              {emoji}
            </button>
          ))}
        </div>
      )}

      {showTemplates && (
        <div className="flex flex-wrap items-center gap-1.5 border-b border-slate-200 bg-slate-50/80 px-3 py-2">
          <span className="mr-1 font-mono text-[10px] font-semibold uppercase tracking-wide text-slate-500">
            Starter Templates:
          </span>
          {STARTER_TEMPLATES.map((tpl) => (
            <button
              key={tpl.id}
              type="button"
              onClick={() => {
                commitValue(tpl.content);
                setShowTemplates(false);
              }}
              className="rounded-md border border-slate-300 bg-white px-2.5 py-1 font-mono text-[11px] font-medium text-slate-800 transition hover:bg-slate-100"
            >
              {tpl.name}
            </button>
          ))}
        </div>
      )}

      <div className="flex flex-wrap items-center gap-1.5 border-b border-slate-200 bg-slate-50/60 px-2.5 py-1.5">
        <span className="font-mono text-[10px] font-medium text-slate-500">
          Dynamic Tokens:
        </span>
        {DYNAMIC_TOKENS.map((t) => (
          <button
            key={t.token}
            type="button"
            onClick={() => insertAtCursor(t.token)}
            title={t.description}
            className="rounded border border-slate-200 bg-white px-1.5 py-0.5 font-mono text-[10px] text-slate-800 transition hover:bg-slate-100"
          >
            {t.token}
          </button>
        ))}
      </div>

      {mode === "write" ? (
        <textarea
          ref={textareaRef}
          rows={expanded ? 20 : 12}
          value={value}
          onChange={(e) => {
            const now = Date.now();
            if (now - lastTypingSnapshotAtRef.current > 800) {
              pushUndoSnapshot(value);
            }
            lastTypingSnapshotAtRef.current = now;
            onChange(e.target.value);
          }}
          onKeyDown={handleKeyDown}
          placeholder="## Hi there!&#10;&#10;Write your custom README Markdown here..."
          spellCheck={false}
          className="block w-full resize-y bg-white p-4 font-mono text-xs leading-relaxed text-slate-900 placeholder:text-slate-400 focus:outline-none"
        />
      ) : (
        <div
          className={`overflow-y-auto bg-white p-4 text-slate-900 ${
            expanded ? "min-h-[380px]" : "min-h-[240px]"
          }`}
        >
          {value.trim() ? (
            <AdvancedMarkdownPreview
              markdown={resolveDynamicTokens(value, creatureConfig)}
              isDark={false}
            />
          ) : (
            <p className="font-mono text-xs text-slate-400">
              Nothing to preview yet. Switch to Write or load a Starter Template.
            </p>
          )}
        </div>
      )}

      <div className="flex flex-wrap items-center justify-between gap-2 border-t border-slate-200 bg-slate-50 px-3 py-1.5 font-mono text-[10px] text-slate-500">
        <span>
          {lineCount} lines · {wordCount} words · {charCount} chars
        </span>
        <span>Shortcuts: Ctrl+B Bold · Ctrl+I Italic · Ctrl+K Link</span>
      </div>
    </div>
  );
}
