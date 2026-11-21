import { GIFEncoder, applyPalette, quantize } from "gifenc";
import {
  CANVAS_HEIGHT,
  CANVAS_WIDTH,
  LOGICAL_HEIGHT,
  LOGICAL_WIDTH,
  SHARE_CARD_HEIGHT,
  SHARE_CARD_WIDTH,
  drawHudOnCanvas2D,
  getLoopDurationMs,
  recolorSpriteRgba,
  renderCreatureFrameRgba,
  renderShareCardToCanvas,
  type SpriteRgba,
} from "@/domain/creature/animationEngine";
import type { CreatureConfig } from "@/domain/creature/entities";

function writeUint32LE(buf: Uint8Array, offset: number, val: number): void {
  buf[offset] = val & 0xff;
  buf[offset + 1] = (val >>> 8) & 0xff;
  buf[offset + 2] = (val >>> 16) & 0xff;
  buf[offset + 3] = (val >>> 24) & 0xff;
}

function writeUint24LE(buf: Uint8Array, offset: number, val: number): void {
  buf[offset] = val & 0xff;
  buf[offset + 1] = (val >>> 8) & 0xff;
  buf[offset + 2] = (val >>> 16) & 0xff;
}

function writeAscii(buf: Uint8Array, offset: number, str: string): void {
  for (let i = 0; i < str.length; i++) {
    buf[offset + i] = str.charCodeAt(i);
  }
}

function readAscii(buf: Uint8Array, offset: number, len: number): string {
  let out = "";
  for (let i = 0; i < len; i++) {
    out += String.fromCharCode(buf[offset + i]);
  }
  return out;
}

function readUint32LE(buf: Uint8Array, offset: number): number {
  return (
    (buf[offset] |
      (buf[offset + 1] << 8) |
      (buf[offset + 2] << 16) |
      (buf[offset + 3] << 24)) >>>
    0
  );
}

export interface ParsedWebPFrame {
  alphChunk: Uint8Array | null;
  imageChunkId: "VP8 " | "VP8L";
  imageChunkPayload: Uint8Array;
  hasAlpha: boolean;
}

export function extractSingleWebPFrame(data: Uint8Array): ParsedWebPFrame {
  if (readAscii(data, 0, 4) !== "RIFF" || readAscii(data, 8, 4) !== "WEBP") {
    throw new Error("Browser failed to produce a valid WebP frame.");
  }

  let offset = 12;
  let alphChunk: Uint8Array | null = null;
  let imageChunkId: "VP8 " | "VP8L" | null = null;
  let imageChunkPayload: Uint8Array | null = null;

  while (offset + 8 <= data.length) {
    const chunkId = readAscii(data, offset, 4);
    const chunkSize = readUint32LE(data, offset + 4);
    const payloadStart = offset + 8;
    const payload = data.subarray(payloadStart, payloadStart + chunkSize);

    if (chunkId === "ALPH") {
      alphChunk = payload;
    } else if (chunkId === "VP8 " || chunkId === "VP8L") {
      imageChunkId = chunkId;
      imageChunkPayload = payload;
    }

    offset = payloadStart + chunkSize + (chunkSize % 2);
  }

  if (!imageChunkId || !imageChunkPayload) {
    throw new Error("WebP frame missing image bitstream.");
  }

  const hasAlpha = Boolean(alphChunk) || imageChunkId === "VP8L";
  return {
    alphChunk,
    imageChunkId,
    imageChunkPayload,
    hasAlpha,
  };
}

function makeChunk(id: string, payload: Uint8Array): Uint8Array {
  const paddedSize = payload.length + (payload.length % 2);
  const chunk = new Uint8Array(8 + paddedSize);
  writeAscii(chunk, 0, id);
  writeUint32LE(chunk, 4, payload.length);
  chunk.set(payload, 8);
  return chunk;
}

export function assembleAnimatedWebP(
  width: number,
  height: number,
  frames: ParsedWebPFrame[],
  frameDelayMs: number
): Uint8Array {
  const hasAnyAlpha = frames.some((f) => f.hasAlpha);
  const vp8xPayload = new Uint8Array(10);
  let flags = 0x02;
  if (hasAnyAlpha) flags |= 0x10;
  vp8xPayload[0] = flags;
  writeUint24LE(vp8xPayload, 4, width - 1);
  writeUint24LE(vp8xPayload, 7, height - 1);
  const vp8xChunk = makeChunk("VP8X", vp8xPayload);

  const animPayload = new Uint8Array(6);
  const animChunk = makeChunk("ANIM", animPayload);

  const anmfChunks: Uint8Array[] = [];
  for (const frame of frames) {
    const subChunks: Uint8Array[] = [];
    if (frame.alphChunk) {
      subChunks.push(makeChunk("ALPH", frame.alphChunk));
    }
    subChunks.push(makeChunk(frame.imageChunkId, frame.imageChunkPayload));
    const subLen = subChunks.reduce((acc, c) => acc + c.length, 0);

    const anmfPayload = new Uint8Array(16 + subLen);
    writeUint24LE(anmfPayload, 6, width - 1);
    writeUint24LE(anmfPayload, 9, height - 1);
    writeUint24LE(anmfPayload, 12, Math.max(16, Math.round(frameDelayMs)));
    anmfPayload[15] = 0x02;

    let pos = 16;
    for (const sub of subChunks) {
      anmfPayload.set(sub, pos);
      pos += sub.length;
    }

    anmfChunks.push(makeChunk("ANMF", anmfPayload));
  }

  const allChunks = [vp8xChunk, animChunk, ...anmfChunks];
  const bodySize = allChunks.reduce((acc, c) => acc + c.length, 0);
  const finalBytes = new Uint8Array(12 + bodySize);
  writeAscii(finalBytes, 0, "RIFF");
  writeUint32LE(finalBytes, 4, 4 + bodySize);
  writeAscii(finalBytes, 8, "WEBP");

  let cursor = 12;
  for (const chunk of allChunks) {
    finalBytes.set(chunk, cursor);
    cursor += chunk.length;
  }

  return finalBytes;
}

export async function encodeAnimatedWebPFromCreature(
  config: CreatureConfig,
  sprite: SpriteRgba,
  frameCount = 24
): Promise<Blob> {
  const recolored = recolorSpriteRgba(sprite, config);
  const durationMs = getLoopDurationMs(config.animationSpeed);
  const frameDelayMs = Math.max(20, Math.round(durationMs / frameCount));

  const logicalCanvas = document.createElement("canvas");
  logicalCanvas.width = LOGICAL_WIDTH;
  logicalCanvas.height = LOGICAL_HEIGHT;
  const logicalCtx = logicalCanvas.getContext("2d");

  const outCanvas = document.createElement("canvas");
  outCanvas.width = CANVAS_WIDTH;
  outCanvas.height = CANVAS_HEIGHT;
  const outCtx = outCanvas.getContext("2d");

  if (!logicalCtx || !outCtx) {
    throw new Error("2D canvas context unavailable.");
  }
  outCtx.imageSmoothingEnabled = false;

  const imgData = logicalCtx.createImageData(LOGICAL_WIDTH, LOGICAL_HEIGHT);
  const parsedFrames: ParsedWebPFrame[] = [];

  for (let i = 0; i < frameCount; i++) {
    const phase = i / frameCount;
    const frameRgba = renderCreatureFrameRgba(recolored, config, phase, {
      skipHud: true,
    });
    imgData.data.set(frameRgba);
    logicalCtx.putImageData(imgData, 0, 0);

    outCtx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    outCtx.imageSmoothingEnabled = false;
    outCtx.drawImage(logicalCanvas, 0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    drawHudOnCanvas2D(outCtx, config);

    const frameBlob = await new Promise<Blob>((resolve, reject) => {
      outCanvas.toBlob(
        (b) => (b ? resolve(b) : reject(new Error("WebP encoding unsupported."))),
        "image/webp",
        0.94
      );
    });
    const buf = new Uint8Array(await frameBlob.arrayBuffer());
    parsedFrames.push(extractSingleWebPFrame(buf));
  }

  const webpBytes = assembleAnimatedWebP(
    CANVAS_WIDTH,
    CANVAS_HEIGHT,
    parsedFrames,
    frameDelayMs
  );
  return new Blob([new Uint8Array(webpBytes)], { type: "image/webp" });
}

export async function encodeAnimatedGifFromCreature(
  config: CreatureConfig,
  sprite: SpriteRgba,
  frameCount = 24
): Promise<Blob> {
  const recolored = recolorSpriteRgba(sprite, config);
  const durationMs = getLoopDurationMs(config.animationSpeed);
  const frameDelayMs = Math.max(20, Math.round(durationMs / frameCount));
  const isTransparent = config.backgroundMode === "transparent";

  const logicalCanvas = document.createElement("canvas");
  logicalCanvas.width = LOGICAL_WIDTH;
  logicalCanvas.height = LOGICAL_HEIGHT;
  const logicalCtx = logicalCanvas.getContext("2d");
  if (!logicalCtx) {
    throw new Error("2D canvas context unavailable.");
  }
  const imgData = logicalCtx.createImageData(LOGICAL_WIDTH, LOGICAL_HEIGHT);

  const gif = GIFEncoder();

  for (let i = 0; i < frameCount; i++) {
    const phase = i / frameCount;
    const baseRgba = renderCreatureFrameRgba(recolored, config, phase, {
      skipHud: true,
    });
    imgData.data.set(baseRgba);
    logicalCtx.putImageData(imgData, 0, 0);
    if (config.showHud) {
      logicalCtx.save();
      logicalCtx.scale(0.5, 0.5);
      drawHudOnCanvas2D(logicalCtx, config);
      logicalCtx.restore();
    }
    const frameRgba = logicalCtx.getImageData(
      0,
      0,
      LOGICAL_WIDTH,
      LOGICAL_HEIGHT
    ).data;

    if (isTransparent) {
      const palette = quantize(frameRgba, 255, {
        format: "rgba4444",
        oneBitAlpha: true,
      });
      let transparentIndex = palette.findIndex((c) => (c[3] ?? 255) === 0);
      if (transparentIndex === -1) {
        palette.unshift([0, 0, 0, 0]);
        transparentIndex = 0;
      }

      const index = applyPalette(frameRgba, palette, "rgba4444");
      const totalPixels = LOGICAL_WIDTH * LOGICAL_HEIGHT;
      for (let p = 0; p < totalPixels; p++) {
        if (frameRgba[p * 4 + 3] < 64) {
          index[p] = transparentIndex;
        }
      }

      gif.writeFrame(index, LOGICAL_WIDTH, LOGICAL_HEIGHT, {
        palette,
        delay: frameDelayMs,
        transparent: true,
        transparentIndex,
        dispose: 2,
        repeat: 0,
      });
    } else {
      const palette = quantize(frameRgba, 256, { format: "rgb565" });
      const index = applyPalette(frameRgba, palette, "rgb565");
      gif.writeFrame(index, LOGICAL_WIDTH, LOGICAL_HEIGHT, {
        palette,
        delay: frameDelayMs,
        dispose: 1,
        repeat: 0,
      });
    }
  }

  gif.finish();
  return new Blob([new Uint8Array(gif.bytesView())], { type: "image/gif" });
}

export async function exportShareCardPngBlob(
  config: CreatureConfig,
  sprite: SpriteRgba
): Promise<Blob> {
  const recolored = recolorSpriteRgba(sprite, config);
  const canvas = document.createElement("canvas");
  canvas.width = SHARE_CARD_WIDTH;
  canvas.height = SHARE_CARD_HEIGHT;
  renderShareCardToCanvas(canvas, recolored, config, 0.25);

  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (b) => (b ? resolve(b) : reject(new Error("PNG export unsupported."))),
      "image/png"
    );
  });
}
