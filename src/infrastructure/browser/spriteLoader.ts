import type { SpriteRgba } from "@/domain/creature/animationEngine";
import { getSpriteAssetPath, type SpriteKey } from "@/domain/creature/services";

const spriteCache = new Map<SpriteKey, Promise<SpriteRgba>>();

export function loadCreatureSprite(key: SpriteKey): Promise<SpriteRgba> {
  const cached = spriteCache.get(key);
  if (cached) return cached;

  const promise = new Promise<SpriteRgba>((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = img.naturalWidth || img.width;
      canvas.height = img.naturalHeight || img.height;
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        reject(new Error("2D canvas context unavailable for sprite loading."));
        return;
      }
      ctx.drawImage(img, 0, 0);
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      resolve({
        width: imageData.width,
        height: imageData.height,
        data: imageData.data,
      });
    };
    img.onerror = () => {
      spriteCache.delete(key);
      reject(new Error(`Failed loading sprite asset: ${key}.png`));
    };
    img.src = getSpriteAssetPath(key);
  });

  spriteCache.set(key, promise);
  return promise;
}

export async function fetchSpritePngBase64(key: SpriteKey): Promise<string> {
  const response = await fetch(getSpriteAssetPath(key));
  if (!response.ok) {
    throw new Error(`Failed loading sprite PNG (${response.status})`);
  }
  const buffer = await response.arrayBuffer();
  const bytes = new Uint8Array(buffer);
  let binary = "";
  const chunkSize = 0x8000;
  for (let i = 0; i < bytes.length; i += chunkSize) {
    binary += String.fromCharCode(...bytes.subarray(i, i + chunkSize));
  }
  return btoa(binary);
}
