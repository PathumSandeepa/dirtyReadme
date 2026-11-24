"use client";

import { useState } from "react";
import {
  CheckSquare,
  FileCode2,
  Heading1,
  Heading2,
  Heading3,
  Image as ImageIcon,
  Layers,
  Link2,
  List,
  ListOrdered,
  Pilcrow,
  Quote,
  SeparatorHorizontal,
  Smile,
  Sparkles,
  Table2,
  Wand2,
} from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

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
];

export type InsertBlockAction =
  | "h1"
  | "h2"
  | "h3"
  | "paragraph"
  | "quote"
  | "bulletList"
  | "orderedList"
  | "taskList"
  | "image"
  | "table"
  | "divider"
  | "link"
  | "codeBlock"
  | "stackGroup"
  | "linkButtons"
  | "creatureBanner";

interface InsertPaletteProps {
  onInsertBlock: (action: InsertBlockAction) => void;
  onInsertEmoji: (emoji: string) => void;
  onInsertSnippet: (snippetId: "status" | "roadmap" | "visitors") => void;
}

function PaletteButton({
  icon: Icon,
  label,
  onClick,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex cursor-pointer items-center gap-2 rounded-[8px] bg-[var(--surface-2)] px-2.5 py-2 text-left text-[12px] font-medium text-[var(--text)] transition-colors duration-150 hover:bg-[var(--surface-3)]"
    >
      <Icon className="size-3.5 shrink-0 text-[var(--text-2)]" />
      <span className="truncate">{label}</span>
    </button>
  );
}

export function InsertPalette({
  onInsertBlock,
  onInsertEmoji,
  onInsertSnippet,
}: InsertPaletteProps) {
  const [emojisOpen, setEmojisOpen] = useState(false);

  return (
    <div className="flex flex-col gap-3.5">
      {/* Text */}
      <div className="flex flex-col gap-1.5">
        <span className="text-[11px] font-medium text-[var(--text-3)]">
          Text
        </span>
        <div className="grid grid-cols-2 gap-1.5">
          <PaletteButton
            icon={Heading1}
            label="Heading 1"
            onClick={() => onInsertBlock("h1")}
          />
          <PaletteButton
            icon={Heading2}
            label="Heading 2"
            onClick={() => onInsertBlock("h2")}
          />
          <PaletteButton
            icon={Heading3}
            label="Heading 3"
            onClick={() => onInsertBlock("h3")}
          />
          <PaletteButton
            icon={Pilcrow}
            label="Paragraph"
            onClick={() => onInsertBlock("paragraph")}
          />
          <PaletteButton
            icon={Quote}
            label="Quote"
            onClick={() => onInsertBlock("quote")}
          />
        </div>
      </div>

      {/* Lists */}
      <div className="flex flex-col gap-1.5">
        <span className="text-[11px] font-medium text-[var(--text-3)]">
          Lists
        </span>
        <div className="grid grid-cols-2 gap-1.5">
          <PaletteButton
            icon={List}
            label="Bullet list"
            onClick={() => onInsertBlock("bulletList")}
          />
          <PaletteButton
            icon={ListOrdered}
            label="Numbered list"
            onClick={() => onInsertBlock("orderedList")}
          />
          <PaletteButton
            icon={CheckSquare}
            label="Checklist"
            onClick={() => onInsertBlock("taskList")}
          />
        </div>
      </div>

      {/* Media */}
      <div className="flex flex-col gap-1.5">
        <span className="text-[11px] font-medium text-[var(--text-3)]">
          Media
        </span>
        <div className="grid grid-cols-2 gap-1.5">
          <PaletteButton
            icon={ImageIcon}
            label="Image"
            onClick={() => onInsertBlock("image")}
          />
          <PaletteButton
            icon={Table2}
            label="Table"
            onClick={() => onInsertBlock("table")}
          />
          <PaletteButton
            icon={SeparatorHorizontal}
            label="Divider"
            onClick={() => onInsertBlock("divider")}
          />
          <Popover open={emojisOpen} onOpenChange={setEmojisOpen}>
            <PopoverTrigger
              render={
                <button
                  type="button"
                  className="flex cursor-pointer items-center gap-2 rounded-[8px] bg-[var(--surface-2)] px-2.5 py-2 text-left text-[12px] font-medium text-[var(--text)] transition-colors duration-150 hover:bg-[var(--surface-3)]"
                />
              }
            >
              <Smile className="size-3.5 shrink-0 text-[var(--text-2)]" />
              <span className="truncate">Emoji</span>
            </PopoverTrigger>
            <PopoverContent
              data-app="studio"
              className="w-64 rounded-[12px] border-0 bg-[var(--surface)] p-3 text-[var(--text)] ring-0 shadow-[var(--shadow-float)]"
            >
              <div className="mb-2 text-[12px] font-semibold text-[var(--text)]">
                Insert emoji
              </div>
              <div className="grid grid-cols-6 gap-1">
                {PROFILE_EMOJIS.map((emoji) => (
                  <button
                    key={emoji}
                    type="button"
                    onClick={() => {
                      onInsertEmoji(emoji);
                      setEmojisOpen(false);
                    }}
                    className="flex size-8 cursor-pointer items-center justify-center rounded-[6px] text-base transition-colors hover:bg-[var(--surface-2)]"
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </PopoverContent>
          </Popover>
          <PaletteButton
            icon={Link2}
            label="Link"
            onClick={() => onInsertBlock("link")}
          />
        </div>
      </div>

      {/* Code */}
      <div className="flex flex-col gap-1.5">
        <span className="text-[11px] font-medium text-[var(--text-3)]">
          Code
        </span>
        <div className="grid grid-cols-2 gap-1.5">
          <PaletteButton
            icon={FileCode2}
            label="Code block"
            onClick={() => onInsertBlock("codeBlock")}
          />
          <PaletteButton
            icon={Wand2}
            label="Visitor counter"
            onClick={() => onInsertSnippet("visitors")}
          />
        </div>
      </div>

      {/* Profile blocks */}
      <div className="flex flex-col gap-1.5">
        <span className="text-[11px] font-medium text-[var(--text-3)]">
          Profile blocks
        </span>
        <div className="grid grid-cols-1 gap-1.5">
          <PaletteButton
            icon={Layers}
            label="Tech stack group"
            onClick={() => onInsertBlock("stackGroup")}
          />
          <PaletteButton
            icon={Link2}
            label="Link buttons"
            onClick={() => onInsertBlock("linkButtons")}
          />
          <PaletteButton
            icon={Sparkles}
            label="Creature banner"
            onClick={() => onInsertBlock("creatureBanner")}
          />
        </div>
      </div>
    </div>
  );
}
