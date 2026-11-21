import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";

const rootDir = process.cwd();
const sourceDir = path.join(rootDir, "assets", "source");
const outDir = path.join(rootDir, "public", "sprites");

fs.mkdirSync(outDir, { recursive: true });

function isNeutralWhite(r, g, b, lumMin = 224, maxSpread = 26) {
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  return r >= lumMin && g >= lumMin && b >= lumMin && max - min <= maxSpread;
}

function borderFloodFillTransparent(data, width, height, lumMin = 224, maxSpread = 26) {
  const visited = new Uint8Array(width * height);
  const queue = new Int32Array(width * height);
  let head = 0;
  let tail = 0;

  const tryPush = (x, y) => {
    if (x < 0 || x >= width || y < 0 || y >= height) return;
    const idx = y * width + x;
    if (visited[idx]) return;
    const p = idx * 4;
    if (data[p + 3] === 0 || isNeutralWhite(data[p], data[p + 1], data[p + 2], lumMin, maxSpread)) {
      visited[idx] = 1;
      data[p + 3] = 0;
      queue[tail++] = idx;
    }
  };

  for (let x = 0; x < width; x++) {
    tryPush(x, 0);
    tryPush(x, height - 1);
  }
  for (let y = 0; y < height; y++) {
    tryPush(0, y);
    tryPush(width - 1, y);
  }

  while (head < tail) {
    const idx = queue[head++];
    const x = idx % width;
    const y = (idx - x) / width;
    tryPush(x + 1, y);
    tryPush(x - 1, y);
    tryPush(x, y + 1);
    tryPush(x, y - 1);
  }
}

function removeTrappedWhitePocketsRightOf(data, width, height, minX, lumMin = 230, maxSpread = 20) {
  const visited = new Uint8Array(width * height);
  const queue = new Int32Array(width * height);

  for (let y = 0; y < height; y++) {
    for (let x = minX; x < width; x++) {
      const startIdx = y * width + x;
      if (visited[startIdx]) continue;
      const sp = startIdx * 4;
      if (data[sp + 3] === 0 || !isNeutralWhite(data[sp], data[sp + 1], data[sp + 2], lumMin, maxSpread)) {
        continue;
      }

      let head = 0;
      let tail = 0;
      let touchesLeftBoundary = false;
      visited[startIdx] = 1;
      queue[tail++] = startIdx;

      while (head < tail) {
        const idx = queue[head++];
        const cx = idx % width;
        const cy = (idx - cx) / width;
        if (cx <= minX) touchesLeftBoundary = true;

        const neighbors = [
          [cx + 1, cy],
          [cx - 1, cy],
          [cx, cy + 1],
          [cx, cy - 1],
        ];
        for (const [nx, ny] of neighbors) {
          if (nx < 0 || nx >= width || ny < 0 || ny >= height) continue;
          const nIdx = ny * width + nx;
          if (visited[nIdx]) continue;
          const np = nIdx * 4;
          if (data[np + 3] > 0 && isNeutralWhite(data[np], data[np + 1], data[np + 2], lumMin, maxSpread)) {
            visited[nIdx] = 1;
            queue[tail++] = nIdx;
          }
        }
      }

      if (!touchesLeftBoundary) {
        for (let k = 0; k < tail; k++) {
          data[queue[k] * 4 + 3] = 0;
        }
      }
    }
  }
}

function dehaloEdgesAgainstWhite(data, width, height, passes = 2) {
  for (let pass = 0; pass < passes; pass++) {
    const isEdge = new Uint8Array(width * height);
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const idx = y * width + x;
        const p = idx * 4;
        if (data[p + 3] === 0) continue;

        let touchesTransparent = false;
        for (let dy = -1; dy <= 1 && !touchesTransparent; dy++) {
          for (let dx = -1; dx <= 1; dx++) {
            if (dx === 0 && dy === 0) continue;
            const nx = x + dx;
            const ny = y + dy;
            if (nx < 0 || nx >= width || ny < 0 || ny >= height) {
              touchesTransparent = true;
              break;
            }
            if (data[(ny * width + nx) * 4 + 3] === 0) {
              touchesTransparent = true;
              break;
            }
          }
        }
        if (touchesTransparent) {
          isEdge[idx] = 1;
        }
      }
    }

    for (let idx = 0; idx < width * height; idx++) {
      if (!isEdge[idx]) continue;
      const p = idx * 4;
      const r = data[p];
      const g = data[p + 1];
      const b = data[p + 2];
      const max = Math.max(r, g, b);
      const min = Math.min(r, g, b);
      const lum = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
      const sat = max === 0 ? 0 : (max - min) / max;

      if (lum > 0.87 && sat < 0.14) {
        data[p + 3] = 0;
        continue;
      }

      if (lum > 0.62 && sat < 0.25) {
        // Unmix light neutral fringe blended with a #FFFFFF background matte
        const alphaFrac = Math.max(0.08, Math.min(1, (255 - min) / 140));
        data[p] = Math.max(0, Math.min(255, Math.round((r - 255 * (1 - alphaFrac)) / alphaFrac)));
        data[p + 1] = Math.max(0, Math.min(255, Math.round((g - 255 * (1 - alphaFrac)) / alphaFrac)));
        data[p + 2] = Math.max(0, Math.min(255, Math.round((b - 255 * (1 - alphaFrac)) / alphaFrac)));
        data[p + 3] = Math.round(data[p + 3] * alphaFrac);
      } else if (sat >= 0.25 && min > 155) {
        // Blue/colored edge pixel blended over white background: recover saturated color + smooth alpha
        const alphaFrac = Math.max(0.18, Math.min(1, (255 - min) / 110));
        data[p] = Math.max(0, Math.min(255, Math.round((r - 255 * (1 - alphaFrac)) / alphaFrac)));
        data[p + 1] = Math.max(0, Math.min(255, Math.round((g - 255 * (1 - alphaFrac)) / alphaFrac)));
        data[p + 2] = Math.max(0, Math.min(255, Math.round((b - 255 * (1 - alphaFrac)) / alphaFrac)));
        data[p + 3] = Math.round(data[p + 3] * alphaFrac);
      }
    }
  }
}

function trimAndPadRgba(data, width, height, padding = 2) {
  let minX = width;
  let minY = height;
  let maxX = -1;
  let maxY = -1;

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      if (data[(y * width + x) * 4 + 3] > 8) {
        if (x < minX) minX = x;
        if (x > maxX) maxX = x;
        if (y < minY) minY = y;
        if (y > maxY) maxY = y;
      }
    }
  }

  if (maxX < minX || maxY < minY) {
    throw new Error("Sprite trim failed: empty image.");
  }

  const cropW = maxX - minX + 1;
  const cropH = maxY - minY + 1;
  const outW = cropW + padding * 2;
  const outH = cropH + padding * 2;
  const out = Buffer.alloc(outW * outH * 4, 0);

  for (let y = 0; y < cropH; y++) {
    const srcStart = ((minY + y) * width + minX) * 4;
    const dstStart = ((y + padding) * outW + padding) * 4;
    data.copy(out, dstStart, srcStart, srcStart + cropW * 4);
  }

  return { data: out, width: outW, height: outH };
}

async function saveCrispSprite(rawBuffer, width, height, targetWidth, outName) {
  const { data: resized, info } = await sharp(rawBuffer, {
    raw: { width, height, channels: 4 },
  })
    .resize({ width: targetWidth, kernel: sharp.kernel.lanczos3 })
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  // Snap near-zero/near-solid alpha slightly to preserve crisp pixel silhouette while keeping soft filament tips
  for (let i = 0; i < resized.length; i += 4) {
    if (resized[i + 3] < 18) {
      resized[i] = 0;
      resized[i + 1] = 0;
      resized[i + 2] = 0;
      resized[i + 3] = 0;
    } else if (resized[i + 3] > 235) {
      resized[i + 3] = 255;
    }
  }

  const dest = path.join(outDir, outName);
  await sharp(resized, {
    raw: { width: info.width, height: info.height, channels: 4 },
  })
    .png({ compressionLevel: 9 })
    .toFile(dest);

  console.log(`Extracted ${outName} (${info.width}x${info.height})`);
}

async function extractTulkunTop() {
  const { data, info } = await sharp(path.join(sourceDir, "tulkun-sheet.jpg"))
    .extract({ left: 16, top: 28, width: 656, height: 468 })
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  // Blank out the "TOP VIEW" text area at top-left (original x<165, y<48 -> crop x<150, y<20)
  for (let y = 0; y < 22; y++) {
    for (let x = 0; x < 160; x++) {
      const p = (y * info.width + x) * 4;
      data[p] = 255;
      data[p + 1] = 255;
      data[p + 2] = 255;
      data[p + 3] = 255;
    }
  }

  borderFloodFillTransparent(data, info.width, info.height, 224, 24);
  dehaloEdgesAgainstWhite(data, info.width, info.height, 2);
  const trimmed = trimAndPadRgba(data, info.width, info.height, 2);
  await saveCrispSprite(trimmed.data, trimmed.width, trimmed.height, 310, "tulkun-top.png");
}

async function extractTulkunSide() {
  const { data, info } = await sharp(path.join(sourceDir, "tulkun-sheet.jpg"))
    .extract({ left: 18, top: 676, width: 660, height: 284 })
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  borderFloodFillTransparent(data, info.width, info.height, 224, 24);
  removeTrappedWhitePocketsRightOf(data, info.width, info.height, 540, 222, 24);
  dehaloEdgesAgainstWhite(data, info.width, info.height, 2);
  const trimmed = trimAndPadRgba(data, info.width, info.height, 2);
  await saveCrispSprite(trimmed.data, trimmed.width, trimmed.height, 320, "tulkun-side.png");
}

async function extractJellyfish() {
  const { data, info } = await sharp(path.join(sourceDir, "jellyfish.jpg"))
    .extract({ left: 20, top: 128, width: 988, height: 432 })
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  borderFloodFillTransparent(data, info.width, info.height, 222, 26);
  // Knock out enclosed white gaps between trailing tentacles strictly to the right of the bell dome (x >= 200)
  removeTrappedWhitePocketsRightOf(data, info.width, info.height, 200, 218, 28);
  dehaloEdgesAgainstWhite(data, info.width, info.height, 2);
  const trimmed = trimAndPadRgba(data, info.width, info.height, 2);
  await saveCrispSprite(trimmed.data, trimmed.width, trimmed.height, 330, "jellyfish.png");
}

await extractTulkunTop();
await extractTulkunSide();
await extractJellyfish();
