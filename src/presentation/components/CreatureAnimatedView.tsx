"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  LOGICAL_HEIGHT,
  LOGICAL_WIDTH,
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

    const imgData = ctx.createImageData(LOGICAL_WIDTH, LOGICAL_HEIGHT);
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
        const frame = renderCreatureFrameRgba(curSprite, curConfig, phase);
        imgData.data.set(frame);
        ctx.putImageData(imgData, 0, 0);
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
        className={`flex aspect-2/1 items-center justify-center rounded-lg border border-dashed text-xs text-muted-foreground ${className}`}
      >
        {error}
      </div>
    );
  }

  return (
    <canvas
      ref={canvasRef}
      width={LOGICAL_WIDTH}
      height={LOGICAL_HEIGHT}
      role="img"
      aria-label={`${meta.name} (${meta.subtitle})`}
      style={{ imageRendering: "pixelated" }}
      className={`block aspect-2/1 h-auto w-full ${className}`}
    />
  );
}
