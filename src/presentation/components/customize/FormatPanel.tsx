"use client";

import { useState } from "react";
import {
  AlignCenter,
  AlignLeft,
  AlignRight,
  Bold,
  CheckSquare,
  ChevronDown,
  Code,
  Columns3,
  FileCode2,
  Heading,
  Italic,
  Link2,
  List,
  ListOrdered,
  Quote,
  RemoveFormatting,
  Rows3,
  Strikethrough,
  Trash2,
  Underline as UnderlineIcon,
  Unlink,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Switch } from "@/components/ui/switch";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { StudioButton } from "../../studio/ui/StudioButton";
import { StudioField, StudioInput } from "../../studio/ui/StudioInput";

export interface FormatPanelState {
  hasEditor: boolean;
  headingLabel: string;
  hasHeadingUnderline: boolean;
  bold: boolean;
  italic: boolean;
  underline: boolean;
  strike: boolean;
  code: boolean;
  alignLeft: boolean;
  alignCenter: boolean;
  alignRight: boolean;
  bulletList: boolean;
  orderedList: boolean;
  taskList: boolean;
  blockquote: boolean;
  codeBlock: boolean;
  inTable: boolean;
  hasLink: boolean;
  currentLinkHref: string;
}

export interface FormatPanelActions {
  setParagraph: () => void;
  toggleHeading: (level: 1 | 2 | 3 | 4) => void;
  toggleHeadingUnderline: () => void;
  toggleBold: () => void;
  toggleItalic: () => void;
  toggleUnderline: () => void;
  toggleStrike: () => void;
  toggleCode: () => void;
  clearFormatting: () => void;
  setAlign: (align: "left" | "center" | "right") => void;
  toggleBulletList: () => void;
  toggleOrderedList: () => void;
  toggleTaskList: () => void;
  toggleBlockquote: () => void;
  toggleCodeBlock: () => void;
  applyLink: (url: string) => void;
  removeLink: () => void;
  addTableRow: () => void;
  deleteTableRow: () => void;
  addTableColumn: () => void;
  deleteTableColumn: () => void;
  deleteTable: () => void;
}

interface FormatPanelProps {
  state: FormatPanelState;
  actions: FormatPanelActions;
}

function FormatActionButton({
  disabled,
  active,
  onClick,
  icon: Icon,
  label,
}: {
  disabled: boolean;
  active?: boolean;
  onClick: () => void;
  icon: React.ComponentType<{ className?: string }>;
  label: string;
}) {
  const button = (
    <StudioButton
      variant="secondary"
      size="sm"
      disabled={disabled}
      active={active}
      onClick={onClick}
      className="justify-start"
    >
      <Icon />
      <span>{label}</span>
    </StudioButton>
  );

  if (!disabled) return button;
  return (
    <Tooltip>
      <TooltipTrigger render={<span className="inline-flex w-full" />}>
        {button}
      </TooltipTrigger>
      <TooltipContent
        data-app="studio"
        className="border-0 bg-[var(--text)] text-[var(--bg)] shadow-[var(--shadow-float)]"
      >
        Place cursor in text to format
      </TooltipContent>
    </Tooltip>
  );
}

export function FormatPanel({ state, actions }: FormatPanelProps) {
  const [linkUrlInput, setLinkUrlInput] = useState(
    state.currentLinkHref || "https://"
  );
  const [linkError, setLinkError] = useState<string | null>(null);
  const disabled = !state.hasEditor;

  const handleLinkSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (disabled) return;
    const trimmed = linkUrlInput.trim();
    if (!trimmed) {
      setLinkError("Enter a link URL.");
      return;
    }
    setLinkError(null);
    actions.applyLink(trimmed);
  };

  return (
    <TooltipProvider delay={150}>
      <div className="flex flex-col gap-5">
        {disabled && (
          <div className="rounded-[12px] bg-[var(--surface-2)] p-3 text-[12px] text-[var(--text-2)]">
            Place your cursor in the README text to enable formatting controls.
          </div>
        )}

        {/* Style */}
        <div className="flex flex-col gap-2.5">
          <span className="text-[12px] font-medium text-[var(--text-2)]">
            Style
          </span>

          <DropdownMenu>
            <DropdownMenuTrigger
              render={
                <StudioButton
                  variant="secondary"
                  size="sm"
                  disabled={disabled}
                  className="w-full justify-between"
                />
              }
            >
              <span className="inline-flex items-center gap-2">
                <Heading className="size-3.5" />
                <span>{state.headingLabel}</span>
              </span>
              <ChevronDown className="size-3.5 text-[var(--text-2)]" />
            </DropdownMenuTrigger>
            <DropdownMenuContent
              data-app="studio"
              className="w-60 rounded-[12px] border-0 bg-[var(--surface)] p-1 text-[var(--text)] ring-0 shadow-[var(--shadow-float)]"
            >
              <DropdownMenuGroup>
                <DropdownMenuItem onClick={actions.setParagraph}>
                  Normal text
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => actions.toggleHeading(1)}>
                  Heading 1 (with underline)
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => actions.toggleHeading(2)}>
                  Heading 2 (with underline)
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => actions.toggleHeading(3)}>
                  Heading 3
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => actions.toggleHeading(4)}>
                  Heading 4
                </DropdownMenuItem>
              </DropdownMenuGroup>
            </DropdownMenuContent>
          </DropdownMenu>

          <div className="flex items-center justify-between gap-3 rounded-[8px] bg-[var(--surface-2)] px-3 py-2">
            <label
              htmlFor="fmt-heading-underline"
              className="cursor-pointer text-[13px] font-medium text-[var(--text)]"
            >
              Heading underline
            </label>
            <Switch
              id="fmt-heading-underline"
              size="sm"
              disabled={disabled}
              checked={state.hasHeadingUnderline}
              onCheckedChange={actions.toggleHeadingUnderline}
            />
          </div>

          <div className="grid grid-cols-2 gap-1.5">
            <FormatActionButton
              disabled={disabled}
              active={state.bold}
              onClick={actions.toggleBold}
              icon={Bold}
              label="Bold"
            />
            <FormatActionButton
              disabled={disabled}
              active={state.italic}
              onClick={actions.toggleItalic}
              icon={Italic}
              label="Italic"
            />
            <FormatActionButton
              disabled={disabled}
              active={state.underline}
              onClick={actions.toggleUnderline}
              icon={UnderlineIcon}
              label="Underline"
            />
            <FormatActionButton
              disabled={disabled}
              active={state.strike}
              onClick={actions.toggleStrike}
              icon={Strikethrough}
              label="Strikethrough"
            />
            <FormatActionButton
              disabled={disabled}
              active={state.code}
              onClick={actions.toggleCode}
              icon={Code}
              label="Inline code"
            />
            <FormatActionButton
              disabled={disabled}
              onClick={actions.clearFormatting}
              icon={RemoveFormatting}
              label="Clear style"
            />
          </div>
        </div>

        {/* Alignment */}
        <div className="flex flex-col gap-2">
          <span className="text-[12px] font-medium text-[var(--text-2)]">
            Alignment
          </span>
          <div className="grid grid-cols-2 gap-1.5">
            <FormatActionButton
              disabled={disabled}
              active={state.alignLeft}
              onClick={() => actions.setAlign("left")}
              icon={AlignLeft}
              label="Left"
            />
            <FormatActionButton
              disabled={disabled}
              active={state.alignCenter}
              onClick={() => actions.setAlign("center")}
              icon={AlignCenter}
              label="Center"
            />
            <FormatActionButton
              disabled={disabled}
              active={state.alignRight}
              onClick={() => actions.setAlign("right")}
              icon={AlignRight}
              label="Right"
            />
          </div>
        </div>

        {/* Lists */}
        <div className="flex flex-col gap-2">
          <span className="text-[12px] font-medium text-[var(--text-2)]">
            Lists
          </span>
          <div className="grid grid-cols-2 gap-1.5">
            <FormatActionButton
              disabled={disabled}
              active={state.bulletList}
              onClick={actions.toggleBulletList}
              icon={List}
              label="Bullet"
            />
            <FormatActionButton
              disabled={disabled}
              active={state.orderedList}
              onClick={actions.toggleOrderedList}
              icon={ListOrdered}
              label="Numbered"
            />
            <FormatActionButton
              disabled={disabled}
              active={state.taskList}
              onClick={actions.toggleTaskList}
              icon={CheckSquare}
              label="Checklist"
            />
          </div>
        </div>

        {/* Blocks */}
        <div className="flex flex-col gap-2">
          <span className="text-[12px] font-medium text-[var(--text-2)]">
            Blocks
          </span>
          <div className="grid grid-cols-2 gap-1.5">
            <FormatActionButton
              disabled={disabled}
              active={state.blockquote}
              onClick={actions.toggleBlockquote}
              icon={Quote}
              label="Quote"
            />
            <FormatActionButton
              disabled={disabled}
              active={state.codeBlock}
              onClick={actions.toggleCodeBlock}
              icon={FileCode2}
              label="Code block"
            />
          </div>
        </div>

        {/* Link */}
        <form onSubmit={handleLinkSubmit} className="flex flex-col gap-2.5">
          <span className="text-[12px] font-medium text-[var(--text-2)]">
            Link
          </span>
          <StudioField
            label="Target URL"
            htmlFor="fmt-link-url"
            error={linkError}
          >
            <StudioInput
              id="fmt-link-url"
              disabled={disabled}
              value={linkUrlInput}
              invalid={Boolean(linkError)}
              onChange={(e) => {
                setLinkUrlInput(e.target.value);
                if (linkError) setLinkError(null);
              }}
              placeholder="https://github.com/..."
            />
          </StudioField>
          <div className="flex items-center gap-2">
            <StudioButton
              type="submit"
              variant="secondary"
              size="sm"
              disabled={disabled}
            >
              <Link2 />
              <span>Set link</span>
            </StudioButton>
            {state.hasLink && (
              <StudioButton
                type="button"
                variant="ghost"
                size="sm"
                disabled={disabled}
                onClick={actions.removeLink}
              >
                <Unlink />
                <span>Remove</span>
              </StudioButton>
            )}
          </div>
        </form>

        {/* Contextual Table Controls */}
        {state.inTable && (
          <div className="flex flex-col gap-2 rounded-[12px] bg-[var(--tide-soft)] p-3">
            <span className="text-[12px] font-medium text-[var(--tide)]">
              Table actions
            </span>
            <div className="grid grid-cols-2 gap-1.5">
              <StudioButton
                variant="secondary"
                size="sm"
                onClick={actions.addTableRow}
              >
                <Rows3 />
                <span>Add row</span>
              </StudioButton>
              <StudioButton
                variant="ghost"
                size="sm"
                onClick={actions.deleteTableRow}
              >
                <span>Remove row</span>
              </StudioButton>
              <StudioButton
                variant="secondary"
                size="sm"
                onClick={actions.addTableColumn}
              >
                <Columns3 />
                <span>Add column</span>
              </StudioButton>
              <StudioButton
                variant="ghost"
                size="sm"
                onClick={actions.deleteTableColumn}
              >
                <span>Remove column</span>
              </StudioButton>
            </div>
            <StudioButton
              variant="ghost"
              size="sm"
              onClick={actions.deleteTable}
              className="justify-start text-[var(--danger)]"
            >
              <Trash2 />
              <span>Delete table</span>
            </StudioButton>
          </div>
        )}
      </div>
    </TooltipProvider>
  );
}
