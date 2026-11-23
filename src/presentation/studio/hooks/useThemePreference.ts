"use client";

import { useCallback, useLayoutEffect, useSyncExternalStore } from "react";

export type ThemePreference = "system" | "light" | "dark";
export type ResolvedTheme = "dark" | "light";

const THEME_STORAGE_KEY = "readmeforge-theme";
const listeners = new Set<() => void>();

function normalizeThemePreference(raw: string | null): ThemePreference {
  if (raw === "light" || raw === "dark" || raw === "system") {
    return raw;
  }
  return "dark";
}

export function resolveThemePreference(pref: ThemePreference): ResolvedTheme {
  if (pref === "light") return "light";
  if (pref === "dark") return "dark";
  if (typeof window !== "undefined") {
    return window.matchMedia("(prefers-color-scheme: light)").matches
      ? "light"
      : "dark";
  }
  return "dark";
}

function applyThemeToDocument(pref: ThemePreference) {
  if (typeof document === "undefined") return;
  const resolved = resolveThemePreference(pref);
  const root = document.documentElement;
  root.setAttribute("data-theme", resolved);
  root.setAttribute("data-theme-pref", pref);
  root.classList.toggle("dark", resolved === "dark");
  root.style.colorScheme = resolved;
}

function readStoredPreference(): ThemePreference {
  if (typeof window === "undefined") return "dark";
  try {
    return normalizeThemePreference(
      window.localStorage.getItem(THEME_STORAGE_KEY)
    );
  } catch {
    return "dark";
  }
}

function notifyListeners() {
  listeners.forEach((listener) => listener());
}

function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  if (typeof window === "undefined") {
    return () => {
      listeners.delete(listener);
    };
  }

  const media = window.matchMedia("(prefers-color-scheme: light)");
  const handleMediaChange = () => {
    const pref = readStoredPreference();
    if (pref === "system") {
      applyThemeToDocument("system");
      notifyListeners();
    }
  };
  const handleStorage = (event: StorageEvent) => {
    if (event.key === THEME_STORAGE_KEY) {
      applyThemeToDocument(readStoredPreference());
      notifyListeners();
    }
  };

  media.addEventListener("change", handleMediaChange);
  window.addEventListener("storage", handleStorage);

  return () => {
    listeners.delete(listener);
    media.removeEventListener("change", handleMediaChange);
    window.removeEventListener("storage", handleStorage);
  };
}

function getServerSnapshot(): ThemePreference {
  return "dark";
}

export function useThemePreference() {
  const preference = useSyncExternalStore(
    subscribe,
    readStoredPreference,
    getServerSnapshot
  );

  useLayoutEffect(() => {
    applyThemeToDocument(preference);
  }, [preference]);

  const setPreference = useCallback((next: ThemePreference) => {
    try {
      window.localStorage.setItem(THEME_STORAGE_KEY, next);
    } catch {
      // Ignore storage quota or privacy restrictions
    }
    applyThemeToDocument(next);
    notifyListeners();
  }, []);

  const resolvedTheme = resolveThemePreference(preference);

  return {
    preference,
    resolvedTheme,
    isDark: resolvedTheme === "dark",
    setPreference,
  };
}
