"use client";

import { useState } from "react";
import { cn } from "cn";
import { normalizeHex } from "@/domain/creature/services";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ColorPalettePicker } from "@/presentation/components/ColorPalettePicker";
import { StudioButton } from "./StudioButton";
import { StudioField, StudioInput } from "./StudioInput";

function isValidHexDraft(raw: string): boolean {
  return /^#?([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/.test(raw.trim());
}

function formatHexDraft(raw: string): string {
  const clean = raw.trim().replace(/^#/, "");
  if (/^[0-9a-fA-F]{3}$/.test(clean)) {
    return `#${clean[0]}${clean[0]}${clean[1]}${clean[1]}${clean[2]}${clean[2]}`.toUpperCase();
  }
  return `#${clean.toUpperCase()}`;
}

interface StudioColorSwatchProps {
  value: string;
  onChange: (hex: string) => void;
  label: string;
  ariaLabel?: string;
  hideInput?: boolean;
  className?: string;
}

/** Borderless color swatch popover with live hex input and inline validation. */
export function StudioColorSwatch({
  value,
  onChange,
  label,
  ariaLabel,
  hideInput = false,
  className,
}: StudioColorSwatchProps) {
  const safeHex = normalizeHex(value, "#58D6B0");
  const [open, setOpen] = useState(false);
  const [hexDraft, setHexDraft] = useState<string | null>(null);
  const [hexError, setHexError] = useState<string | null>(null);

  const displayedHex = hexDraft ?? safeHex;

  const handleHexInputChange = (raw: string) => {
    const prefixed = (
      raw.startsWith("#") ? raw : `#${raw.replace(/^#+/, "")}`
    ).toUpperCase();
    setHexDraft(prefixed);
    if (isValidHexDraft(prefixed)) {
      setHexError(null);
      onChange(formatHexDraft(prefixed));
    } else {
      setHexError("Enter a 6-digit hex color like #58D6B0.");
    }
  };

  const handleHexBlur = () => {
    setHexDraft(null);
    setHexError(null);
  };

  return (
    <div className={cn("flex flex-col gap-1", className)}>
      <div className="flex items-center gap-2">
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger
            render={
              <button
                type="button"
                aria-label={ariaLabel ?? `Pick ${label}`}
                title={`${label}: ${safeHex}`}
                className="inline-flex h-10 min-w-10 shrink-0 cursor-pointer items-center justify-center gap-2 rounded-[8px] border-0 bg-[var(--surface-2)] px-2.5 text-[13px] text-[var(--text)] transition-colors duration-150 hover:bg-[var(--surface-3)] sm:h-9 sm:min-w-9"
              />
            }
          >
            <span
              className="size-4 shrink-0 rounded-[4px]"
              style={{ backgroundColor: safeHex }}
            />
            {hideInput && (
              <span className="studio-mono text-[12px] text-[var(--text-2)]">
                {safeHex}
              </span>
            )}
          </PopoverTrigger>
          <PopoverContent
            data-app="studio"
            align="start"
            sideOffset={6}
            className="w-72 rounded-[12px] border-0 bg-[var(--surface)] p-3 text-[var(--text)] ring-0 shadow-[var(--shadow-float)]"
          >
            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between gap-2">
                <span className="text-[13px] font-medium text-[var(--text)]">
                  {label}
                </span>
                <span className="studio-mono text-[12px] text-[var(--text-2)]">
                  {safeHex}
                </span>
              </div>

              <ColorPalettePicker
                value={safeHex}
                onChange={(nextHex) => {
                  onChange(nextHex);
                  setHexDraft(null);
                  setHexError(null);
                }}
                height={132}
              />

              <StudioField label="Hex value" error={hexError}>
                <StudioInput
                  monospace
                  maxLength={7}
                  value={displayedHex}
                  invalid={Boolean(hexError)}
                  onChange={(e) => handleHexInputChange(e.target.value)}
                  onBlur={handleHexBlur}
                  placeholder="#58D6B0"
                />
              </StudioField>

              <div className="flex justify-end">
                <StudioButton
                  variant="secondary"
                  size="sm"
                  onClick={() => setOpen(false)}
                >
                  Done
                </StudioButton>
              </div>
            </div>
          </PopoverContent>
        </Popover>

        {!hideInput && (
          <StudioInput
            monospace
            maxLength={7}
            value={displayedHex}
            invalid={Boolean(hexError)}
            aria-label={`${label} hex value`}
            onChange={(e) => handleHexInputChange(e.target.value)}
            onBlur={handleHexBlur}
            placeholder="#58D6B0"
            className="w-28"
          />
        )}
      </div>

      {!hideInput && hexError && (
        <p role="alert" className="text-[13px] text-[var(--danger)]">
          {hexError}
        </p>
      )}
    </div>
  );
}

interface StudioChipColorPopoverProps {
  name: string;
  color: string;
  onChangeName: (name: string) => void;
  onChangeColor: (hex: string) => void;
  index: number;
}

/** Editable language chip with anchored color picker popover using surface fill selection. */
export function StudioChipColorPopover({
  name,
  color,
  onChangeName,
  onChangeColor,
  index,
}: StudioChipColorPopoverProps) {
  const safeHex = normalizeHex(color, "#3178C6");
  const [open, setOpen] = useState(false);
  const [hexDraft, setHexDraft] = useState<string | null>(null);
  const [hexError, setHexError] = useState<string | null>(null);

  const displayedHex = hexDraft ?? safeHex;

  const handleHexChange = (raw: string) => {
    const prefixed = (
      raw.startsWith("#") ? raw : `#${raw.replace(/^#+/, "")}`
    ).toUpperCase();
    setHexDraft(prefixed);
    if (isValidHexDraft(prefixed)) {
      setHexError(null);
      onChangeColor(formatHexDraft(prefixed));
    } else {
      setHexError("Enter a valid hex code like #3178C6.");
    }
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        render={
          <button
            type="button"
            aria-label={`Edit ${name || `Language ${index + 1}`} color (${safeHex})`}
            className={cn(
              "inline-flex min-h-[34px] cursor-pointer items-center gap-2 rounded-[8px] border-0 px-2.5 py-1.5 text-[13px] font-medium transition-colors duration-150",
              open
                ? "bg-[var(--surface-3)] text-[var(--text)]"
                : "bg-[var(--surface-2)] text-[var(--text)] hover:bg-[var(--surface-3)]"
            )}
          />
        }
      >
        <span
          className="size-3 shrink-0 rounded-full"
          style={{ backgroundColor: safeHex }}
        />
        <span>{name || `Language ${index + 1}`}</span>
        <span className="studio-mono text-[12px] text-[var(--text-2)]">
          {safeHex}
        </span>
      </PopoverTrigger>

      <PopoverContent
        data-app="studio"
        align="start"
        sideOffset={6}
        className="w-72 rounded-[12px] border-0 bg-[var(--surface)] p-3 text-[var(--text)] ring-0 shadow-[var(--shadow-float)]"
      >
        <div className="flex flex-col gap-3">
          <StudioField label="Language name" htmlFor={`lang-name-${index}`}>
            <StudioInput
              id={`lang-name-${index}`}
              maxLength={18}
              value={name}
              onChange={(e) => onChangeName(e.target.value)}
              placeholder={`Language ${index + 1}`}
            />
          </StudioField>

          <ColorPalettePicker
            value={safeHex}
            onChange={(nextHex) => {
              onChangeColor(nextHex);
              setHexDraft(null);
              setHexError(null);
            }}
            height={128}
          />

          <StudioField
            label="Hex color"
            htmlFor={`lang-hex-${index}`}
            error={hexError}
          >
            <StudioInput
              id={`lang-hex-${index}`}
              monospace
              maxLength={7}
              value={displayedHex}
              invalid={Boolean(hexError)}
              onChange={(e) => handleHexChange(e.target.value)}
              onBlur={() => {
                setHexDraft(null);
                setHexError(null);
              }}
            />
          </StudioField>

          <div className="flex justify-end">
            <StudioButton
              variant="secondary"
              size="sm"
              onClick={() => setOpen(false)}
            >
              Done
            </StudioButton>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
