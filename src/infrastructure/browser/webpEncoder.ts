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

interface ParsedWebPFrame {
  alphChunk: Uint8Array | null;
  imageChunkId: "VP8 " | "VP8L";
  imageChunkPayload: Uint8Array;
  hasAlpha: boolean;
}

function extractSingleWebPFrame(data: Uint8Array): ParsedWebPFrame {
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

function assembleAnimatedWebP(
  width: number,
  height: number,
  frames: ParsedWebPFrame[],
  frameDelayMs: number
): Blob {
  const hasAnyAlpha = frames.some((f) => f.hasAlpha);
  const vp8xPayload = new Uint8Array(10);
  let flags = 0x02;
  if (hasAnyAlpha) flags |= 0x10;
  vp8xPayload[0] = flags;
  writeUint24LE(vp8xPayload, 4, width - 1);
  writeUint24LE(vp8xPayload, 7, height - 1);
  const vp8xChunk = makeChunk("VP8X", vp8xPayload);

  const animPayload = new Uint8Array(6);
  animPayload[0] = 0;
  animPayload[1] = 0;
  animPayload[2] = 0;
  animPayload[3] = 0;
  animPayload[4] = 0;
  animPayload[5] = 0;
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

  return new Blob([finalBytes], { type: "image/webp" });
}

function loadSvgFrameOnCanvas(
  svgString: string,
  canvas: HTMLCanvasElement,
  ctx: CanvasRenderingContext2D
): Promise<void> {
  return new Promise((resolve, reject) => {
    const blob = new Blob([svgString], {
      type: "image/svg+xml;charset=utf-8",
    });
    const url = URL.createObjectURL(blob);
    const img = new Image();
    img.onload = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      URL.revokeObjectURL(url);
      resolve();
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Failed rasterizing SVG frame."));
    };
    img.src = url;
  });
}

export async function encodeAnimatedWebPFromSvgFrames(params: {
  width: number;
  height: number;
  frameCount: number;
  durationMs: number;
  buildFrameSvg: (phase: number) => string;
}): Promise<Blob> {
  const { width, height, frameCount, durationMs, buildFrameSvg } = params;
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) {
    throw new Error("2D canvas context unavailable.");
  }

  const parsedFrames: ParsedWebPFrame[] = [];
  for (let i = 0; i < frameCount; i++) {
    const phase = i / frameCount;
    const svg = buildFrameSvg(phase);
    await loadSvgFrameOnCanvas(svg, canvas, ctx);
    const frameBlob = await new Promise<Blob>((resolve, reject) => {
      canvas.toBlob(
        (b) => (b ? resolve(b) : reject(new Error("WebP encoding unsupported."))),
        "image/webp",
        0.92
      );
    });
    const buf = new Uint8Array(await frameBlob.arrayBuffer());
    parsedFrames.push(extractSingleWebPFrame(buf));
  }

  return assembleAnimatedWebP(
    width,
    height,
    parsedFrames,
    durationMs / frameCount
  );
}
