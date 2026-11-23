"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  CANVAS_HEIGHT,
  CANVAS_WIDTH,
  LOGICAL_HEIGHT,
  LOGICAL_WIDTH,
  drawHudOnCanvas2D,
  getLoopDurationMs,
  recolorSpriteRgba,
  renderCreatureFrameRgba,
  type SpriteRgba,
} from "@/domain/creature/animationEngine";
import type { CreatureConfig } from "@/domain/creature/entities";
import { getCreatureMeta, getSpriteKey } from "@/domain/creature/services";
import { loadCreatureSprite } from "@/infrastructure/browser/spriteLoader";

interface CreatureAnimatedViewProps {
  config: CreatureConfig;
  className?: string;
}

export function CreatureAnimatedView({
  config,
  className = "",
}: CreatureAnimatedViewProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [loadedKey, setLoadedKey] = useState<string | null>(null);
  const [sprite, setSprite] = useState<SpriteRgba | null>(null);
  const [error, setError] = useState<string | null>(null);

  const spriteKey = getSpriteKey(config.creature, config.view);

  useEffect(() => {
    let cancelled = false;
    loadCreatureSprite(spriteKey)
      .then((loaded) => {
        if (!cancelled) {
          setSprite(loaded);
          setLoadedKey(spriteKey);
          setError(null);
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setError(
            err instanceof Error ? err.message : "Failed loading creature sprite."
          );
        }
      });
    return () => {
      cancelled = true;
    };
  }, [spriteKey]);

  const recolored = useMemo(() => {
    if (!sprite || loadedKey !== spriteKey) return null;
    return recolorSpriteRgba(sprite, config);
  }, [sprite, loadedKey, spriteKey, config]);

  const stateRef = useRef({
    config,
    recolored,
  });

  useEffect(() => {
    stateRef.current = { config, recolored };
  }, [config, recolored]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const scratchCanvas = document.createElement("canvas");
    scratchCanvas.width = LOGICAL_WIDTH;
    scratchCanvas.height = LOGICAL_HEIGHT;
    const scratchCtx = scratchCanvas.getContext("2d");
    if (!scratchCtx) return;

    const imgData = scratchCtx.createImageData(LOGICAL_WIDTH, LOGICAL_HEIGHT);
    let rafId = 0;
    let phase = 0;
    let lastTime = performance.now();

    const tick = (now: number) => {
      const dt = Math.min(100, Math.max(0, now - lastTime));
      lastTime = now;

      const { config: curConfig, recolored: curSprite } = stateRef.current;
      const loopMs = getLoopDurationMs(curConfig.animationSpeed);
      phase = (phase + dt / loopMs) % 1;

      if (curSprite) {
        const frame = renderCreatureFrameRgba(curSprite, curConfig, phase, {
          skipHud: true,
        });
        imgData.data.set(frame);
        scratchCtx.putImageData(imgData, 0, 0);

        ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
        ctx.imageSmoothingEnabled = false;
        ctx.drawImage(scratchCanvas, 0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
        drawHudOnCanvas2D(ctx, curConfig);
      }

      rafId = window.requestAnimationFrame(tick);
    };

    rafId = window.requestAnimationFrame(tick);
    return () => window.cancelAnimationFrame(rafId);
  }, []);

  const meta = getCreatureMeta(config.creature);

  if (error) {
    return (
      <div
        className={`flex aspect-2/1 items-center justify-center rounded-lg bg-[var(--danger-soft)] px-4 text-xs text-[var(--danger)] ${className}`}
      >
        {error}
      </div>
    );
  }

  return (
    <canvas
      ref={canvasRef}
      width={CANVAS_WIDTH}
      height={CANVAS_HEIGHT}
      role="img"
      aria-label={`${meta.name} (${meta.subtitle})`}
      style={{
        imageRendering: config.hudFontFamily === "pixel" ? "pixelated" : "auto",
      }}
      className={`block aspect-2/1 h-auto w-full ${className}`}
    />
  );
}
