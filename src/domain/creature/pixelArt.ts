export type PixelShader =
  | string
  | ((gx: number, gy: number, nx: number, ny: number) => string | null);

const GLYPHS_5X7: Record<string, string[]> = {
  A: ["01110", "10001", "10001", "11111", "10001", "10001", "10001"],
  B: ["11110", "10001", "10001", "11110", "10001", "10001", "11110"],
  C: ["01111", "10000", "10000", "10000", "10000", "10000", "01111"],
  D: ["11110", "10001", "10001", "10001", "10001", "10001", "11110"],
  E: ["11111", "10000", "10000", "11110", "10000", "10000", "11111"],
  F: ["11111", "10000", "10000", "11110", "10000", "10000", "10000"],
  G: ["01111", "10000", "10000", "10111", "10001", "10001", "01111"],
  H: ["10001", "10001", "10001", "11111", "10001", "10001", "10001"],
  I: ["11111", "00100", "00100", "00100", "00100", "00100", "11111"],
  J: ["00111", "00010", "00010", "00010", "10010", "10010", "01100"],
  K: ["10001", "10010", "10100", "11000", "10100", "10010", "10001"],
  L: ["10000", "10000", "10000", "10000", "10000", "10000", "11111"],
  M: ["10001", "11011", "10101", "10101", "10001", "10001", "10001"],
  N: ["10001", "11001", "10101", "10011", "10001", "10001", "10001"],
  O: ["01110", "10001", "10001", "10001", "10001", "10001", "01110"],
  P: ["11110", "10001", "10001", "11110", "10000", "10000", "10000"],
  Q: ["01110", "10001", "10001", "10001", "10101", "10010", "01101"],
  R: ["11110", "10001", "10001", "11110", "10100", "10010", "10001"],
  S: ["01111", "10000", "10000", "01110", "00001", "00001", "11110"],
  T: ["11111", "00100", "00100", "00100", "00100", "00100", "00100"],
  U: ["10001", "10001", "10001", "10001", "10001", "10001", "01110"],
  V: ["10001", "10001", "10001", "10001", "10001", "01010", "00100"],
  W: ["10001", "10001", "10001", "10101", "10101", "11011", "10001"],
  X: ["10001", "10001", "01010", "00100", "01010", "10001", "10001"],
  Y: ["10001", "10001", "01010", "00100", "00100", "00100", "00100"],
  Z: ["11111", "00001", "00010", "00100", "01000", "10000", "11111"],
  "0": ["01110", "10011", "10101", "10101", "11001", "10001", "01110"],
  "1": ["00100", "01100", "00100", "00100", "00100", "00100", "01110"],
  "2": ["01110", "10001", "00001", "00110", "01000", "10000", "11111"],
  "3": ["11110", "00001", "00001", "01110", "00001", "00001", "11110"],
  "4": ["00010", "00110", "01010", "10010", "11111", "00010", "00010"],
  "5": ["11111", "10000", "11110", "00001", "00001", "10001", "01110"],
  "6": ["01110", "10000", "10000", "11110", "10001", "10001", "01110"],
  "7": ["11111", "00001", "00010", "00100", "01000", "01000", "01000"],
  "8": ["01110", "10001", "10001", "01110", "10001", "10001", "01110"],
  "9": ["01110", "10001", "10001", "01111", "00001", "00001", "01110"],
  ":": ["00000", "00100", "00100", "00000", "00100", "00100", "00000"],
  ".": ["00000", "00000", "00000", "00000", "00000", "00100", "00100"],
  ",": ["00000", "00000", "00000", "00000", "00000", "00100", "01000"],
  "-": ["00000", "00000", "00000", "11111", "00000", "00000", "00000"],
  "+": ["00000", "00100", "00100", "11111", "00100", "00100", "00000"],
  "/": ["00001", "00010", "00010", "00100", "01000", "01000", "10000"],
  "#": ["01010", "11111", "01010", "01010", "11111", "01010", "00000"],
  "@": ["01110", "10001", "10111", "10101", "10111", "10000", "01110"],
  "(": ["00010", "00100", "01000", "01000", "01000", "00100", "00010"],
  ")": ["01000", "00100", "00010", "00010", "00010", "00100", "01000"],
  " ": ["00000", "00000", "00000", "00000", "00000", "00000", "00000"],
};

export class PixelCanvas {
  private readonly cells = new Map<number, string>();
  private readonly cols = 512;
  private readonly offset = 128;

  private encodeKey(gx: number, gy: number): number {
    return (gy + this.offset) * this.cols + (gx + this.offset);
  }

  public setPixel(gx: number, gy: number, color: string | null): void {
    if (!color) return;
    const rx = Math.round(gx);
    const ry = Math.round(gy);
    this.cells.set(this.encodeKey(rx, ry), color);
  }

  public hasPixel(gx: number, gy: number): boolean {
    return this.cells.has(this.encodeKey(Math.round(gx), Math.round(gy)));
  }

  public fillRect(
    x: number,
    y: number,
    w: number,
    h: number,
    shader: PixelShader
  ): void {
    const x0 = Math.floor(x);
    const y0 = Math.floor(y);
    const x1 = Math.ceil(x + w);
    const y1 = Math.ceil(y + h);
    for (let gy = y0; gy < y1; gy++) {
      for (let gx = x0; gx < x1; gx++) {
        const col =
          typeof shader === "string"
            ? shader
            : shader(
                gx,
                gy,
                w > 0 ? (gx - x0) / w : 0,
                h > 0 ? (gy - y0) / h : 0
              );
        this.setPixel(gx, gy, col);
      }
    }
  }

  public fillEllipse(
    cx: number,
    cy: number,
    rx: number,
    ry: number,
    shader: PixelShader
  ): void {
    const minX = Math.floor(cx - rx);
    const maxX = Math.ceil(cx + rx);
    const minY = Math.floor(cy - ry);
    const maxY = Math.ceil(cy + ry);
    for (let gy = minY; gy <= maxY; gy++) {
      for (let gx = minX; gx <= maxX; gx++) {
        const nx = (gx - cx) / Math.max(1, rx);
        const ny = (gy - cy) / Math.max(1, ry);
        if (nx * nx + ny * ny <= 1) {
          const col =
            typeof shader === "string" ? shader : shader(gx, gy, nx, ny);
          this.setPixel(gx, gy, col);
        }
      }
    }
  }

  public fillPolygon(
    points: [number, number][],
    shader: PixelShader
  ): void {
    if (points.length < 3) return;
    let minX = Infinity;
    let maxX = -Infinity;
    let minY = Infinity;
    let maxY = -Infinity;
    for (const [px, py] of points) {
      if (px < minX) minX = px;
      if (px > maxX) maxX = px;
      if (py < minY) minY = py;
      if (py > maxY) maxY = py;
    }

    const xStart = Math.floor(minX);
    const xEnd = Math.ceil(maxX);
    const yStart = Math.floor(minY);
    const yEnd = Math.ceil(maxY);
    const spanX = Math.max(1, xEnd - xStart);
    const spanY = Math.max(1, yEnd - yStart);

    for (let gy = yStart; gy <= yEnd; gy++) {
      const py = gy + 0.5;
      for (let gx = xStart; gx <= xEnd; gx++) {
        const px = gx + 0.5;
        let inside = false;
        for (let i = 0, j = points.length - 1; i < points.length; j = i++) {
          const xi = points[i][0];
          const yi = points[i][1];
          const xj = points[j][0];
          const yj = points[j][1];
          const intersect =
            yi > py !== yj > py &&
            px < ((xj - xi) * (py - yi)) / (yj - yi || 0.0001) + xi;
          if (intersect) inside = !inside;
        }
        if (inside) {
          const nx = (gx - xStart) / spanX;
          const ny = (gy - yStart) / spanY;
          const col =
            typeof shader === "string" ? shader : shader(gx, gy, nx, ny);
          this.setPixel(gx, gy, col);
        }
      }
    }
  }

  public fillSplineRibbon(
    samples: { x: number; y: number; r: number }[],
    shader: PixelShader
  ): void {
    const total = samples.length;
    for (let i = 0; i < total; i++) {
      const s = samples[i];
      const t = total > 1 ? i / (total - 1) : 0;
      const rad = Math.max(0.6, s.r);
      const minX = Math.floor(s.x - rad);
      const maxX = Math.ceil(s.x + rad);
      const minY = Math.floor(s.y - rad);
      const maxY = Math.ceil(s.y + rad);
      for (let gy = minY; gy <= maxY; gy++) {
        for (let gx = minX; gx <= maxX; gx++) {
          const dx = gx - s.x;
          const dy = gy - s.y;
          if (dx * dx + dy * dy <= rad * rad) {
            const ny = dy / rad;
            const col =
              typeof shader === "string" ? shader : shader(gx, gy, t, ny);
            this.setPixel(gx, gy, col);
          }
        }
      }
    }
  }

  public toSvgRects(pixelSize = 4, opacity = 1): string {
    const rows = new Map<number, { gx: number; color: string }[]>();

    for (const [key, color] of this.cells.entries()) {
      const gy = Math.floor(key / this.cols) - this.offset;
      const gx = (key % this.cols) - this.offset;
      const list = rows.get(gy);
      if (list) {
        list.push({ gx, color });
      } else {
        rows.set(gy, [{ gx, color }]);
      }
    }

    const sortedYs = Array.from(rows.keys()).sort((a, b) => a - b);
    const byColor = new Map<string, string[]>();

    for (const gy of sortedYs) {
      const entries = rows.get(gy)!.sort((a, b) => a.gx - b.gx);
      let runStart = entries[0].gx;
      let runLen = 1;
      let runColor = entries[0].color;

      for (let i = 1; i < entries.length; i++) {
        const cur = entries[i];
        if (cur.gx === runStart + runLen && cur.color === runColor) {
          runLen++;
        } else {
          const bucket = byColor.get(runColor) ?? [];
          bucket.push(
            `M${runStart * pixelSize} ${gy * pixelSize}h${runLen * pixelSize}v${pixelSize}h-${runLen * pixelSize}z`
          );
          byColor.set(runColor, bucket);
          runStart = cur.gx;
          runLen = 1;
          runColor = cur.color;
        }
      }

      const tailBucket = byColor.get(runColor) ?? [];
      tailBucket.push(
        `M${runStart * pixelSize} ${gy * pixelSize}h${runLen * pixelSize}v${pixelSize}h-${runLen * pixelSize}z`
      );
      byColor.set(runColor, tailBucket);
    }

    const paths: string[] = [];
    for (const [color, cmds] of byColor.entries()) {
      paths.push(`<path fill="${color}" d="${cmds.join("")}" />`);
    }

    const opAttr = opacity < 1 ? ` opacity="${opacity}"` : "";
    return `<g shape-rendering="crispEdges"${opAttr}>${paths.join("")}</g>`;
  }
}

export function renderPixelText(
  text: string,
  originX: number,
  originY: number,
  pixelSize = 2,
  color = "#E6EDF3"
): string {
  const upper = text.toUpperCase();
  const pathParts: string[] = [];
  let cursorX = originX;

  for (let i = 0; i < upper.length; i++) {
    const ch = upper[i];
    const glyph = GLYPHS_5X7[ch] ?? GLYPHS_5X7[" "];
    for (let row = 0; row < glyph.length; row++) {
      const bits = glyph[row];
      let colRun = 0;
      let runStart = -1;
      for (let col = 0; col <= bits.length; col++) {
        const on = col < bits.length && bits[col] === "1";
        if (on) {
          if (runStart === -1) {
            runStart = col;
            colRun = 1;
          } else {
            colRun++;
          }
        } else if (runStart !== -1) {
          const x = cursorX + runStart * pixelSize;
          const y = originY + row * pixelSize;
          pathParts.push(
            `M${x} ${y}h${colRun * pixelSize}v${pixelSize}h-${colRun * pixelSize}z`
          );
          runStart = -1;
          colRun = 0;
        }
      }
    }
    cursorX += 6 * pixelSize;
  }

  return `<path shape-rendering="crispEdges" fill="${color}" d="${pathParts.join("")}" />`;
}
