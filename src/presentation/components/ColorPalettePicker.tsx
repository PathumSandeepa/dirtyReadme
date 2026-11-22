"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "cn";
import {
  ColorPicker,
  ColorService,
  useColor,
  type IColor,
} from "react-color-palette";
import "react-color-palette/css";
import { normalizeHex } from "@/domain/creature/services";
import { Button } from "@/components/ui/button";

interface ColorPalettePickerProps {
  value: string;
  onChange: (hex: string) => void;
  height?: number;
}

export function ColorPalettePicker({
  value,
  onChange,
  height = 135,
}: ColorPalettePickerProps) {
  const safeHex = normalizeHex(value, "#2C4156");
  const [color, setColor] = useColor(safeHex);
  const lastEmittedRef = useRef<string>(safeHex);

  useEffect(() => {
    const incoming = normalizeHex(value, "#2C4156");
    if (incoming !== lastEmittedRef.current) {
      lastEmittedRef.current = incoming;
      setColor(ColorService.convert("hex", incoming));
    }
  }, [value, setColor]);

  const handleChange = (nextColor: IColor) => {
    setColor(nextColor);
    const nextHex = normalizeHex(nextColor.hex, safeHex);
    lastEmittedRef.current = nextHex;
    if (nextHex !== normalizeHex(value, "")) {
      onChange(nextHex);
    }
  };

  return (
    <div className="overflow-hidden rounded-lg border border-border">
      <ColorPicker
        height={height}
        hideAlpha
        hideInput={["hsv"]}
        color={color}
        onChange={handleChange}
      />
    </div>
  );
}

interface ColorPalettePopoverButtonProps {
  value: string;
  onChange: (hex: string) => void;
  label?: string;
  compact?: boolean;
  className?: string;
}

export function ColorPalettePopoverButton({
  value,
  onChange,
  label = "Pick Color",
  compact = false,
  className = "",
}: ColorPalettePopoverButtonProps) {
  const [open, setOpen] = useState(false);
  const safeHex = normalizeHex(value, "#2563EB");

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label={label}
        title={`${label} (${safeHex})`}
        className={cn(
          "inline-flex cursor-pointer items-center gap-1.5 rounded-lg bg-muted/60 px-2.5 py-1.5 font-mono text-xs text-foreground transition hover:bg-muted",
          className
        )}
      >
        <span
          className="size-4 shrink-0 rounded"
          style={{ backgroundColor: safeHex }}
        />
        {!compact && (
          <span className="text-[11px] text-muted-foreground">{safeHex}</span>
        )}
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/55 p-4 backdrop-blur-xs"
          onClick={() => setOpen(false)}
        >
          <div
            className="flex w-full max-w-xs flex-col gap-3 rounded-2xl border border-border bg-card p-4 text-card-foreground shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span
                  className="size-4 rounded-full border border-border"
                  style={{ backgroundColor: safeHex }}
                />
                <span className="font-mono text-xs font-semibold">{label}</span>
              </div>
              <span className="font-mono text-xs text-muted-foreground">
                {safeHex}
              </span>
            </div>

            <ColorPalettePicker value={safeHex} onChange={onChange} height={145} />

            <div className="flex justify-end">
              <Button
                type="button"
                size="sm"
                onClick={() => setOpen(false)}
              >
                Done
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
