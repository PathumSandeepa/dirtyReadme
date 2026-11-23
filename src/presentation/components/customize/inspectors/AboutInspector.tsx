"use client";

import { useState } from "react";
import { Eraser, Image as ImageIcon, LayoutTemplate, Sparkles } from "lucide-react";
import type { CreatureConfig } from "@/domain/creature/entities";
import { DYNAMIC_TOKENS } from "@/domain/profile/entities";
import { resolveDynamicTokens } from "@/domain/profile/readmeService";
import { StudioButton } from "../../../studio/ui/StudioButton";
import { StudioConfirmDialog } from "../../../studio/ui/StudioDialog";

interface AboutInspectorProps {
  creatureConfig: CreatureConfig;
  markdown: string;
  templateCount: number;
  onInsertToken: (token: string) => void;
  onInsertSnippet: (snippetMarkdown: string) => void;
  onOpenTemplates: () => void;
  onOpenImageStudio: () => void;
  onClearIntro: () => void;
}

export function AboutInspector({
  creatureConfig,
  markdown,
  templateCount,
  onInsertToken,
  onInsertSnippet,
  onOpenTemplates,
  onOpenImageStudio,
  onClearIntro,
}: AboutInspectorProps) {
  const [confirmClearOpen, setConfirmClearOpen] = useState(false);

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col gap-2.5 rounded-[12px] bg-[var(--surface-2)] p-3.5">
        <div className="text-[13px] font-medium text-[var(--text)]">
          Dynamic values
        </div>
        <p className="text-[12px] leading-relaxed text-[var(--text-2)]">
          Click a token to insert it at your cursor in the README canvas. Values update automatically when stats change.
        </p>

        <div className="flex flex-col gap-1.5 pt-1">
          {DYNAMIC_TOKENS.map((item) => {
            const liveValue = resolveDynamicTokens(item.token, creatureConfig);
            return (
              <button
                key={item.token}
                type="button"
                onClick={() => onInsertToken(item.token)}
                className="flex cursor-pointer items-center justify-between gap-2 rounded-[8px] bg-[var(--surface)] px-2.5 py-2 text-left transition-colors duration-150 hover:bg-[var(--surface-3)]"
              >
                <span className="studio-mono text-[12px] font-medium text-[var(--tide)]">
                  {item.token}
                </span>
                <span className="max-w-[160px] truncate text-[12px] text-[var(--text-2)]">
                  {liveValue}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <span className="text-[13px] font-medium text-[var(--text)]">
          Templates and blocks
        </span>

        <StudioButton
          variant="secondary"
          className="w-full justify-start"
          onClick={onOpenTemplates}
        >
          <LayoutTemplate />
          <span>Rewrite from template ({templateCount})</span>
        </StudioButton>

        <StudioButton
          variant="secondary"
          className="w-full justify-start"
          onClick={onOpenImageStudio}
        >
          <ImageIcon />
          <span>Insert custom image or badge</span>
        </StudioButton>

        <StudioButton
          variant="secondary"
          className="w-full justify-start"
          onClick={() =>
            onInsertSnippet(
              [
                "- Currently building open source web tools",
                "- Learning distributed systems",
                "- Reach me through GitHub or Email",
              ].join("\n")
            )
          }
        >
          <Sparkles />
          <span>Insert developer status bullets</span>
        </StudioButton>
      </div>

      {markdown.trim().length > 0 && (
        <div className="pt-1">
          <StudioButton
            variant="ghost"
            size="sm"
            onClick={() => setConfirmClearOpen(true)}
            className="text-[var(--text-2)] hover:text-[var(--danger)]"
          >
            <Eraser />
            <span>Clear header and about text</span>
          </StudioButton>
        </div>
      )}

      <StudioConfirmDialog
        open={confirmClearOpen}
        onOpenChange={setConfirmClearOpen}
        title="Clear intro text?"
        description="This empties your top profile text in the canvas. Your tech stack cards, links and banner settings stay intact."
        confirmLabel="Clear text"
        destructive
        onConfirm={onClearIntro}
      />
    </div>
  );
}
