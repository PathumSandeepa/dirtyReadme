"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  LOGICAL_HEIGHT,
  LOGICAL_WIDTH,
  SHARE_CARD_HEIGHT,
  SHARE_CARD_WIDTH,
  getLoopDurationMs,
  recolorSpriteRgba,
  renderShareCardToCanvas,
  type SpriteRgba,
} from "@/domain/creature/animationEngine";
import type { CreatureConfig } from "@/domain/creature/entities";
import { getCreatureMeta, getSpriteKey } from "@/domain/creature/services";
import { loadCreatureSprite } from "@/infrastructure/browser/spriteLoader";

interface ShareCardCanvasViewProps {
  config: CreatureConfig;
  className?: string;
}

export function ShareCardCanvasView({
  config,
  className = "",
}: ShareCardCanvasViewProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [loadedKey, setLoadedKey] = useState<string | null>(null);
  const [sprite, setSprite] = useState<SpriteRgba | null>(null);

  const spriteKey = getSpriteKey(config.creature, config.view);

  useEffect(() => {
    let cancelled = false;
    loadCreatureSprite(spriteKey)
      .then((loaded) => {
        if (!cancelled) {
          setSprite(loaded);
          setLoadedKey(spriteKey);
        }
      })
      .catch(() => {
        // Ignore transient fetch errors in preview card
      });
    return () => {
      cancelled = true;
    };
  }, [spriteKey]);

  const recolored = useMemo(() => {
    if (!sprite || loadedKey !== spriteKey) return null;
    return recolorSpriteRgba(sprite, config);
  }, [sprite, loadedKey, spriteKey, config]);

  const stateRef = useRef({ config, recolored });
  useEffect(() => {
    stateRef.current = { config, recolored };
  }, [config, recolored]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const scratch = document.createElement("canvas");
    scratch.width = LOGICAL_WIDTH;
    scratch.height = LOGICAL_HEIGHT;

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
        renderShareCardToCanvas(canvas, curSprite, curConfig, phase, scratch);
      }

      rafId = window.requestAnimationFrame(tick);
    };

    rafId = window.requestAnimationFrame(tick);
    return () => window.cancelAnimationFrame(rafId);
  }, []);

  const meta = getCreatureMeta(config.creature);

  return (
    <canvas
      ref={canvasRef}
      width={SHARE_CARD_WIDTH}
      height={SHARE_CARD_HEIGHT}
      role="img"
      aria-label={`${meta.name} Social Share Card`}
      className={`block aspect-2/1 h-auto w-full ${className}`}
    />
  );
}
