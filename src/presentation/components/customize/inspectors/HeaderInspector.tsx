"use client";

import { AlignCenter, AlignLeft, AlignRight, RotateCcw } from "lucide-react";
import {
  applyHeaderPatchToMarkdown,
  extractHeaderFromMarkdown,
} from "@/domain/profile/headerSync";
import { StudioButton } from "../../../studio/ui/StudioButton";
import { StudioField, StudioInput } from "../../../studio/ui/StudioInput";
import { StudioSegmentedControl } from "../../../studio/ui/StudioSegmentedControl";
import { StudioSwitchRow } from "../../../studio/ui/StudioSwitchRow";

interface HeaderInspectorProps {
  markdown: string;
  onChangeMarkdown: (next: string) => void;
  onSyncFromForm: () => void;
}

export function HeaderInspector({
  markdown,
  onChangeMarkdown,
  onSyncFromForm,
}: HeaderInspectorProps) {
  const parsed = extractHeaderFromMarkdown(markdown);

  const patchHeader = (
    patch: Partial<Parameters<typeof applyHeaderPatchToMarkdown>[1]>
  ) => {
    onChangeMarkdown(applyHeaderPatchToMarkdown(markdown, patch));
  };

  return (
    <div className="flex flex-col gap-5">
      <StudioField label="Title" htmlFor="inspector-header-title">
        <StudioInput
          id="inspector-header-title"
          value={parsed.title}
          onChange={(e) => patchHeader({ title: e.target.value })}
          placeholder="Hi, I am @username"
        />
      </StudioField>

      <StudioField label="Role line" htmlFor="inspector-header-role">
        <StudioInput
          id="inspector-header-role"
          value={parsed.roleLine}
          onChange={(e) => patchHeader({ roleLine: e.target.value })}
          placeholder="Software engineer and open source builder"
        />
      </StudioField>

      <StudioField label="Specialty line" htmlFor="inspector-header-specialty">
        <StudioInput
          id="inspector-header-specialty"
          value={parsed.specialtyLine}
          onChange={(e) => patchHeader({ specialtyLine: e.target.value })}
          placeholder="Systems architecture, UI craft, automation"
        />
      </StudioField>

      <StudioField label="Alignment">
        <StudioSegmentedControl<"left" | "center" | "right">
          ariaLabel="Header alignment"
          value={parsed.align}
          onChange={(align) => patchHeader({ align })}
          options={[
            { value: "left", label: "Left", icon: <AlignLeft /> },
            { value: "center", label: "Center", icon: <AlignCenter /> },
            { value: "right", label: "Right", icon: <AlignRight /> },
          ]}
        />
      </StudioField>

      <StudioSwitchRow
        id="inspector-header-underline"
        checked={parsed.headingUnderline}
        onCheckedChange={(checked) =>
          patchHeader({ headingUnderline: checked })
        }
        label="Heading underline"
        description="Uses a GitHub H2 heading divider beneath the title."
      />

      <div className="rounded-[12px] bg-[var(--surface-2)] p-3.5">
        <div className="flex items-center justify-between gap-2">
          <div className="flex flex-col">
            <span className="text-[13px] font-medium text-[var(--text)]">
              Sync from GitHub profile
            </span>
            <span className="text-[12px] text-[var(--text-2)]">
              Replaces your title and bio with your fetched GitHub profile details.
            </span>
          </div>
          <StudioButton variant="secondary" size="sm" onClick={onSyncFromForm}>
            <RotateCcw />
            <span>Sync</span>
          </StudioButton>
        </div>
      </div>
    </div>
  );
}
