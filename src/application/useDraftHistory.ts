"use client";

import { useCallback, useRef, useState } from "react";
import type { CreatureConfig } from "@/domain/creature/entities";
import type { ReadmeConfig } from "@/domain/profile/entities";

export interface DraftSnapshot {
  creatureConfig: CreatureConfig;
  readmeConfig: ReadmeConfig;
  customBgHex: string;
}

export interface RecordHistoryOptions {
  coalesceKey?: string;
  coalesceMs?: number;
}

export interface UndoToastState {
  id: number;
  message: string;
}

const MAX_HISTORY_STEPS = 100;

function cloneSnapshot(snapshot: DraftSnapshot): DraftSnapshot {
  if (typeof structuredClone === "function") {
    return structuredClone(snapshot);
  }
  return JSON.parse(JSON.stringify(snapshot)) as DraftSnapshot;
}

/** Session-only unified undo/redo history manager with action coalescing. */
export function useDraftHistory() {
  const pastRef = useRef<DraftSnapshot[]>([]);
  const futureRef = useRef<DraftSnapshot[]>([]);
  const lastCoalesceRef = useRef<{ key: string; ts: number } | null>(null);
  const toastSeqRef = useRef(1);

  const [canUndo, setCanUndo] = useState(false);
  const [canRedo, setCanRedo] = useState(false);
  const [undoToast, setUndoToast] = useState<UndoToastState | null>(null);

  const syncFlags = useCallback(() => {
    setCanUndo(pastRef.current.length > 0);
    setCanRedo(futureRef.current.length > 0);
  }, []);

  const recordBefore = useCallback(
    (before: DraftSnapshot, options: RecordHistoryOptions = {}) => {
      const { coalesceKey, coalesceMs = 0 } = options;
      const now = Date.now();

      if (
        coalesceKey &&
        coalesceMs > 0 &&
        lastCoalesceRef.current &&
        lastCoalesceRef.current.key === coalesceKey &&
        now - lastCoalesceRef.current.ts <= coalesceMs &&
        pastRef.current.length > 0
      ) {
        lastCoalesceRef.current.ts = now;
        futureRef.current = [];
        syncFlags();
        return;
      }

      const nextPast = [...pastRef.current, cloneSnapshot(before)];
      if (nextPast.length > MAX_HISTORY_STEPS) {
        nextPast.shift();
      }
      pastRef.current = nextPast;
      futureRef.current = [];
      lastCoalesceRef.current = coalesceKey
        ? { key: coalesceKey, ts: now }
        : null;
      syncFlags();
    },
    [syncFlags]
  );

  const undo = useCallback(
    (current: DraftSnapshot): DraftSnapshot | null => {
      if (pastRef.current.length === 0) return null;
      const previous = pastRef.current[pastRef.current.length - 1];
      pastRef.current = pastRef.current.slice(0, -1);
      const nextFuture = [...futureRef.current, cloneSnapshot(current)];
      if (nextFuture.length > MAX_HISTORY_STEPS) {
        nextFuture.shift();
      }
      futureRef.current = nextFuture;
      lastCoalesceRef.current = null;
      setUndoToast(null);
      syncFlags();
      return cloneSnapshot(previous);
    },
    [syncFlags]
  );

  const redo = useCallback(
    (current: DraftSnapshot): DraftSnapshot | null => {
      if (futureRef.current.length === 0) return null;
      const next = futureRef.current[futureRef.current.length - 1];
      futureRef.current = futureRef.current.slice(0, -1);
      const nextPast = [...pastRef.current, cloneSnapshot(current)];
      if (nextPast.length > MAX_HISTORY_STEPS) {
        nextPast.shift();
      }
      pastRef.current = nextPast;
      lastCoalesceRef.current = null;
      syncFlags();
      return cloneSnapshot(next);
    },
    [syncFlags]
  );

  const clearHistory = useCallback(() => {
    pastRef.current = [];
    futureRef.current = [];
    lastCoalesceRef.current = null;
    setUndoToast(null);
    syncFlags();
  }, [syncFlags]);

  const showUndoToast = useCallback((message: string) => {
    toastSeqRef.current += 1;
    setUndoToast({ id: toastSeqRef.current, message });
  }, []);

  const dismissUndoToast = useCallback(() => {
    setUndoToast(null);
  }, []);

  return {
    canUndo,
    canRedo,
    undoToast,
    recordBefore,
    undo,
    redo,
    clearHistory,
    showUndoToast,
    dismissUndoToast,
  };
}
