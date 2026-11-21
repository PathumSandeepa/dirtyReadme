"use client";

import { useEffect, useRef } from "react";
import {
  ColorPicker,
  ColorService,
  useColor,
  type IColor,
} from "react-color-palette";
import "react-color-palette/css";
import { normalizeHex } from "@/domain/creature/services";

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
