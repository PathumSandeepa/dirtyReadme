import type { CustomImageMemoryAsset } from "@/domain/profile/entities";
import {
  assembleAnimatedWebP,
  extractSingleWebPFrame,
  type ParsedWebPFrame,
} from "@/infrastructure/browser/webpEncoder";

export const MAX_IMAGE_INPUT_BYTES = 15 * 1024 * 1024;
export const MAX_OUTPUT_WIDTH_PX = 1696;

export type ImageOutputWidthMode = "original" | 1200 | 848 | 640;

export interface PixelCropRect {
  x: number;
  y: number;
  width: number;
  height: number;
}

interface ImageDecoderFrameLike {
  displayWidth: number;
  displayHeight: number;
  duration?: number | null;
  close(): void;
}

interface ImageDecoderInstanceLike {
  tracks: {
    ready: Promise<void>;
    selectedTrack: { frameCount: number } | null;
  };
  decode(options: { frameIndex: number }): Promise<{
    image: ImageDecoderFrameLike;
  }>;
  close(): void;
}

type ImageDecoderCtorLike = new (init: {
  data: BufferSource;
  type: string;
}) => ImageDecoderInstanceLike;

const ACCEPTED_MIME_TYPES = new Set([
  "image/png",
  "image/jpeg",
  "image/jpg",
  "image/webp",
  "image/avif",
  "image/gif",
]);

const ACCEPTED_EXTENSIONS = [".png", ".jpg", ".jpeg", ".webp", ".avif", ".gif"];

export function formatFileBytes(bytes: number): string {
  if (!Number.isFinite(bytes) || bytes < 1024) {
    return `${Math.max(0, Math.round(bytes))} B`;
  }
  if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(1)} KB`;
  }
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

export function validateImageFile(file: File | Blob, name = "image"): string | null {
  const size = file.size || 0;
  if (size <= 0) {
    return "This file appears to be empty. Choose another image.";
  }
  if (size > MAX_IMAGE_INPUT_BYTES) {
    return `File is ${formatFileBytes(size)}. Maximum size is 15 MB.`;
  }
  const mime = (file.type || "").toLowerCase();
  const lowerName = name.toLowerCase();
  const hasAllowedExt = ACCEPTED_EXTENSIONS.some((ext) =>
    lowerName.endsWith(ext)
  );
  if (!ACCEPTED_MIME_TYPES.has(mime) && !hasAllowedExt) {
    return "Supported formats are PNG, JPG, WebP, AVIF and GIF.";
  }
  return null;
}

/** Scans a GIF binary stream to determine if it has multiple animation frames. */
export function detectAnimatedGif(bytes: Uint8Array): boolean {
  if (bytes.length < 14) return false;
  const sig = String.fromCharCode(
    bytes[0],
    bytes[1],
    bytes[2],
    bytes[3],
    bytes[4],
    bytes[5]
  );
  if (sig !== "GIF87a" && sig !== "GIF89a") return false;

  let pos = 10;
  const lsdPacked = bytes[pos];
  pos += 3;
  if (lsdPacked & 0x80) {
    const gctSize = 3 * (1 << ((lsdPacked & 0x07) + 1));
    pos += gctSize;
  }

  let frames = 0;
  while (pos < bytes.length) {
    const blockId = bytes[pos++];
    if (blockId === 0x3b) break;

    if (blockId === 0x21) {
      if (pos >= bytes.length) break;
      pos++;
      while (pos < bytes.length) {
        const subLen = bytes[pos++];
        if (subLen === 0) break;
        pos += subLen;
      }
      continue;
    }

    if (blockId === 0x2c) {
      frames++;
      if (frames > 1) return true;
      if (pos + 9 > bytes.length) break;
      const imgPacked = bytes[pos + 8];
      pos += 9;
      if (imgPacked & 0x80) {
        const lctSize = 3 * (1 << ((imgPacked & 0x07) + 1));
        pos += lctSize;
      }
      if (pos >= bytes.length) break;
      pos++;
      while (pos < bytes.length) {
        const subLen = bytes[pos++];
        if (subLen === 0) break;
        pos += subLen;
      }
      continue;
    }

    break;
  }

  return frames > 1;
}

export function canEncodeAnimatedGifToWebP(): boolean {
  if (typeof window === "undefined") return false;
  const win = window as unknown as { ImageDecoder?: ImageDecoderCtorLike };
  return typeof win.ImageDecoder === "function";
}

function getImageDecoderCtor(): ImageDecoderCtorLike | null {
  if (typeof window === "undefined") return null;
  const win = window as unknown as { ImageDecoder?: ImageDecoderCtorLike };
  return typeof win.ImageDecoder === "function" ? win.ImageDecoder : null;
}

async function canvasToWebpBlob(
  canvas: OffscreenCanvas | HTMLCanvasElement,
  quality: number
): Promise<Blob> {
  const q = Math.max(0.1, Math.min(1, quality));
  if (typeof OffscreenCanvas !== "undefined" && canvas instanceof OffscreenCanvas) {
    return canvas.convertToBlob({ type: "image/webp", quality: q });
  }
  return new Promise<Blob>((resolve, reject) => {
    (canvas as HTMLCanvasElement).toBlob(
      (b) => (b ? resolve(b) : reject(new Error("WebP conversion failed."))),
      "image/webp",
      q
    );
  });
}

function createSurface(width: number, height: number): OffscreenCanvas | HTMLCanvasElement {
  const safeW = Math.max(1, Math.round(width));
  const safeH = Math.max(1, Math.round(height));
  if (typeof OffscreenCanvas !== "undefined") {
    return new OffscreenCanvas(safeW, safeH);
  }
  const el = document.createElement("canvas");
  el.width = safeW;
  el.height = safeH;
  return el;
}

function loadBlobViaImgElement(blob: Blob): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(blob);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img);
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Could not decode the selected image."));
    };
    img.src = url;
  });
}

/** Decodes an uploaded image with upright EXIF orientation and reports animation state. */
export async function prepareUploadedImage(
  blob: Blob,
  filename: string
): Promise<{
  uprightBlob: Blob;
  naturalWidth: number;
  naturalHeight: number;
  isAnimatedGif: boolean;
}> {
  const isGif =
    blob.type === "image/gif" || filename.toLowerCase().endsWith(".gif");
  let isAnimatedGif = false;
  if (isGif) {
    const bytes = new Uint8Array(await blob.arrayBuffer());
    isAnimatedGif = detectAnimatedGif(bytes);
  }

  let drawable: ImageBitmap | HTMLImageElement;
  let naturalWidth = 1;
  let naturalHeight = 1;

  if (typeof createImageBitmap === "function") {
    try {
      const bitmap = await createImageBitmap(blob, {
        imageOrientation: "from-image",
      });
      drawable = bitmap;
      naturalWidth = bitmap.width;
      naturalHeight = bitmap.height;
    } catch {
      const img = await loadBlobViaImgElement(blob);
      drawable = img;
      naturalWidth = img.naturalWidth || 1;
      naturalHeight = img.naturalHeight || 1;
    }
  } else {
    const img = await loadBlobViaImgElement(blob);
    drawable = img;
    naturalWidth = img.naturalWidth || 1;
    naturalHeight = img.naturalHeight || 1;
  }

  const canvas = createSurface(naturalWidth, naturalHeight);
  const ctx = canvas.getContext("2d") as
    | OffscreenCanvasRenderingContext2D
    | CanvasRenderingContext2D
    | null;
  if (!ctx) {
    if ("close" in drawable && typeof drawable.close === "function") {
      drawable.close();
    }
    throw new Error("2D canvas context unavailable.");
  }

  ctx.drawImage(drawable as CanvasImageSource, 0, 0, naturalWidth, naturalHeight);
  if ("close" in drawable && typeof drawable.close === "function") {
    drawable.close();
  }

  const uprightBlob =
    typeof OffscreenCanvas !== "undefined" && canvas instanceof OffscreenCanvas
      ? await canvas.convertToBlob({ type: "image/png" })
      : await new Promise<Blob>((resolve, reject) => {
          (canvas as HTMLCanvasElement).toBlob(
            (b) => (b ? resolve(b) : reject(new Error("Image decode failed."))),
            "image/png"
          );
        });

  return {
    uprightBlob,
    naturalWidth,
    naturalHeight,
    isAnimatedGif,
  };
}

/** Builds a visual preview data URL with flipH/flipV already applied so react-easy-crop matches output pixels. */
export async function buildFlippedPreviewUrl(
  uprightBlob: Blob,
  flipH: boolean,
  flipV: boolean
): Promise<{ url: string; width: number; height: number }> {
  if (!flipH && !flipV) {
    const img = await loadBlobViaImgElement(uprightBlob);
    return {
      url: URL.createObjectURL(uprightBlob),
      width: img.naturalWidth || 1,
      height: img.naturalHeight || 1,
    };
  }

  const img = await loadBlobViaImgElement(uprightBlob);
  const w = img.naturalWidth || 1;
  const h = img.naturalHeight || 1;
  const surface = createSurface(w, h);
  const ctx = surface.getContext("2d") as
    | OffscreenCanvasRenderingContext2D
    | CanvasRenderingContext2D
    | null;
  if (!ctx) {
    return {
      url: URL.createObjectURL(uprightBlob),
      width: w,
      height: h,
    };
  }

  ctx.translate(flipH ? w : 0, flipV ? h : 0);
  ctx.scale(flipH ? -1 : 1, flipV ? -1 : 1);
  ctx.drawImage(img, 0, 0, w, h);

  const blob =
    typeof OffscreenCanvas !== "undefined" && surface instanceof OffscreenCanvas
      ? await surface.convertToBlob({ type: "image/png" })
      : await new Promise<Blob>((resolve, reject) => {
          (surface as HTMLCanvasElement).toBlob(
            (b) => (b ? resolve(b) : reject(new Error("Flip preview failed."))),
            "image/png"
          );
        });

  return {
    url: URL.createObjectURL(blob),
    width: w,
    height: h,
  };
}

export function generateCustomImagePath(originalFilename: string): {
  id: string;
  filename: string;
  repoPath: string;
} {
  const baseName = originalFilename.replace(/\.[^.]+$/, "");
  const slug =
    baseName
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 28) || "image";
  const shortId = Math.random().toString(36).slice(2, 6);
  const filename = `${slug}-${shortId}.webp`;
  return {
    id: `${slug}-${shortId}`,
    filename,
    repoPath: `readme-assets/${filename}`,
  };
}

function getRotatedBounds(width: number, height: number, rotationDeg: number) {
  const rad = (rotationDeg * Math.PI) / 180;
  return {
    width: Math.max(
      1,
      Math.round(Math.abs(Math.cos(rad) * width) + Math.abs(Math.sin(rad) * height))
    ),
    height: Math.max(
      1,
      Math.round(Math.abs(Math.sin(rad) * width) + Math.abs(Math.cos(rad) * height))
    ),
    rad,
  };
}

function renderTransformedCropFrame(
  source: CanvasImageSource,
  srcW: number,
  srcH: number,
  cropRect: PixelCropRect,
  rotationDeg: number,
  flipH: boolean,
  flipV: boolean,
  outW: number,
  outH: number,
  qualityFloat: number
): Promise<Blob> {
  const { width: rotW, height: rotH, rad } = getRotatedBounds(
    srcW,
    srcH,
    rotationDeg
  );
  const stage = createSurface(rotW, rotH);
  const stageCtx = stage.getContext("2d") as
    | OffscreenCanvasRenderingContext2D
    | CanvasRenderingContext2D
    | null;
  if (!stageCtx) {
    throw new Error("2D canvas context unavailable.");
  }

  stageCtx.translate(rotW / 2, rotH / 2);
  stageCtx.rotate(rad);
  stageCtx.scale(flipH ? -1 : 1, flipV ? -1 : 1);
  stageCtx.drawImage(source, -srcW / 2, -srcH / 2, srcW, srcH);

  const outSurface = createSurface(outW, outH);
  const outCtx = outSurface.getContext("2d") as
    | OffscreenCanvasRenderingContext2D
    | CanvasRenderingContext2D
    | null;
  if (!outCtx) {
    throw new Error("2D output canvas context unavailable.");
  }

  outCtx.imageSmoothingEnabled = true;
  outCtx.imageSmoothingQuality = "high";
  outCtx.drawImage(
    stage as CanvasImageSource,
    Math.max(0, cropRect.x),
    Math.max(0, cropRect.y),
    Math.max(1, cropRect.width),
    Math.max(1, cropRect.height),
    0,
    0,
    outW,
    outH
  );

  return canvasToWebpBlob(outSurface, qualityFloat);
}

/** Crops, rotates, flips, resizes and converts an image or animated GIF to WebP in memory. */
export async function convertImageToWebP(params: {
  uprightBlob: Blob;
  originalAnimatedBlob?: Blob;
  cropRect: PixelCropRect;
  rotation: number;
  flipH: boolean;
  flipV: boolean;
  outputWidthMode: ImageOutputWidthMode;
  quality: number;
  keepAnimation: boolean;
}): Promise<{
  webpBlob: Blob;
  width: number;
  height: number;
  isAnimated: boolean;
}> {
  const {
    uprightBlob,
    originalAnimatedBlob,
    cropRect,
    rotation,
    flipH,
    flipV,
    outputWidthMode,
    quality,
    keepAnimation,
  } = params;

  const safeCropW = Math.max(1, Math.round(cropRect.width));
  const safeCropH = Math.max(1, Math.round(cropRect.height));
  const targetCapW =
    outputWidthMode === "original" ? MAX_OUTPUT_WIDTH_PX : outputWidthMode;
  const finalWidth = Math.max(1, Math.min(safeCropW, targetCapW));
  const finalHeight = Math.max(1, Math.round((safeCropH * finalWidth) / safeCropW));
  const qFloat = Math.max(0.1, Math.min(1, quality / 100));

  const ImageDecoderCtor = getImageDecoderCtor();
  if (keepAnimation && originalAnimatedBlob && ImageDecoderCtor) {
    try {
      const bytes = await originalAnimatedBlob.arrayBuffer();
      const decoder = new ImageDecoderCtor({
        data: bytes,
        type: "image/gif",
      });
      await decoder.tracks.ready;
      const totalFrames = decoder.tracks.selectedTrack?.frameCount ?? 1;

      if (totalFrames > 1) {
        const cappedFrames = Math.min(totalFrames, 36);
        const step = totalFrames / cappedFrames;
        const parsedFrames: ParsedWebPFrame[] = [];
        let durationSumMs = 0;

        for (let idx = 0; idx < cappedFrames; idx++) {
          const frameIdx = Math.min(
            totalFrames - 1,
            Math.floor(idx * step)
          );
          const decoded = await decoder.decode({ frameIndex: frameIdx });
          const frameImg = decoded.image;
          const durMs =
            typeof frameImg.duration === "number" && frameImg.duration > 0
              ? frameImg.duration / 1000
              : 80;
          durationSumMs += durMs * step;

          const frameWebp = await renderTransformedCropFrame(
            frameImg as unknown as CanvasImageSource,
            frameImg.displayWidth,
            frameImg.displayHeight,
            cropRect,
            rotation,
            flipH,
            flipV,
            finalWidth,
            finalHeight,
            qFloat
          );
          frameImg.close();
          const buf = new Uint8Array(await frameWebp.arrayBuffer());
          parsedFrames.push(extractSingleWebPFrame(buf));
        }

        decoder.close();
        const avgDelayMs = Math.max(
          20,
          Math.round(durationSumMs / Math.max(1, parsedFrames.length))
        );
        const webpBytes = assembleAnimatedWebP(
          finalWidth,
          finalHeight,
          parsedFrames,
          avgDelayMs
        );
        return {
          webpBlob: new Blob([new Uint8Array(webpBytes)], { type: "image/webp" }),
          width: finalWidth,
          height: finalHeight,
          isAnimated: true,
        };
      }
      decoder.close();
    } catch {
      // Fallback cleanly to first static frame when animated decoding fails
    }
  }

  const img = await loadBlobViaImgElement(uprightBlob);
  const staticBlob = await renderTransformedCropFrame(
    img,
    img.naturalWidth || safeCropW,
    img.naturalHeight || safeCropH,
    cropRect,
    rotation,
    flipH,
    flipV,
    finalWidth,
    finalHeight,
    qFloat
  );

  return {
    webpBlob: staticBlob,
    width: finalWidth,
    height: finalHeight,
    isAnimated: false,
  };
}

export function buildMemoryAssetRecord(params: {
  meta: { id: string; filename: string; repoPath: string };
  alt: string;
  width: number;
  height: number;
  isAnimated: boolean;
  webpBlob: Blob;
  originalBlob: Blob;
  originalFilename: string;
}): CustomImageMemoryAsset {
  return {
    id: params.meta.id,
    filename: params.meta.filename,
    repoPath: params.meta.repoPath,
    alt: params.alt.trim() || "Profile image",
    width: params.width,
    height: params.height,
    originalSizeBytes: params.originalBlob.size,
    webpSizeBytes: params.webpBlob.size,
    isAnimated: params.isAnimated,
    webpBlob: params.webpBlob,
    previewUrl: URL.createObjectURL(params.webpBlob),
    originalBlob: params.originalBlob,
    originalFilename: params.originalFilename,
    originalMimeType: params.originalBlob.type || "image/png",
  };
}
