"use client";

import { Sparkles } from "lucide-react";
import { StudioButton } from "../../../studio/ui/StudioButton";
import { StudioField } from "../../../studio/ui/StudioInput";

interface AboutInspectorProps {
  markdown: string;
  onChangeMarkdown: (next: string) => void;
  onInsertSnippet: (snippetMarkdown: string) => void;
}

export function AboutInspector({
  markdown,
  onChangeMarkdown,
  onInsertSnippet,
}: AboutInspectorProps) {
  return (
    <div className="flex flex-col gap-5">
      <StudioField
        label="Intro markdown"
        htmlFor="inspector-about-markdown"
        helper="Use Dynamic values in the left sidebar to insert live profile tokens."
      >
        <textarea
          id="inspector-about-markdown"
          rows={6}
          value={markdown}
          onChange={(e) => onChangeMarkdown(e.target.value)}
          placeholder="Write a short intro about what you build."
          className="w-full rounded-[8px] border-0 bg-[var(--surface-2)] p-3 text-[13px] leading-relaxed text-[var(--text)] placeholder:text-[var(--text-3)] focus:bg-[var(--surface-3)] focus:outline-none"
        />
      </StudioField>

      <div className="flex flex-col gap-2">
        <span className="text-[13px] font-medium text-[var(--text)]">
          Quick starter
        </span>

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
    </div>
  );
}
