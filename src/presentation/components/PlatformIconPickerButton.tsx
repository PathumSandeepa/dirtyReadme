"use client";

import { useMemo, useState } from "react";
import { Ban, Globe, Search, X } from "lucide-react";
import {
  DEFAULT_PLATFORM_ICON,
  DEFAULT_PLATFORM_ICON_ID,
  PLATFORM_CATEGORY_LABELS,
  PLATFORM_ICON_CATALOG,
  findPlatformIconById,
  type PlatformIconCategory,
} from "@/domain/profile/platformIcons";
import { Button } from "@/components/ui/button";

interface PlatformIconPickerButtonProps {
  value?: string;
  onChange: (iconId: string) => void;
  compact?: boolean;
  className?: string;
}

const CATEGORIES = Object.keys(PLATFORM_CATEGORY_LABELS) as PlatformIconCategory[];

export function PlatformIconGlyph({
  iconId,
  className = "size-3.5",
}: {
  iconId?: string;
  className?: string;
}) {
  if (iconId === "none") {
    return <Ban className={`${className} text-muted-foreground`} />;
  }
  const meta = findPlatformIconById(iconId) ?? DEFAULT_PLATFORM_ICON;
  if (!meta?.svgPath) {
    return <Globe className={className} />;
  }
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      className={`${className} shrink-0 fill-current`}
    >
      <path d={meta.svgPath} />
    </svg>
  );
}

export function PlatformIconPickerButton({
  value,
  onChange,
  compact = false,
  className = "",
}: PlatformIconPickerButtonProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<"all" | PlatformIconCategory>("all");

  const resolved =
    value === "none" ? null : (findPlatformIconById(value) ?? DEFAULT_PLATFORM_ICON);

  const filteredIcons = useMemo(() => {
    const q = query.trim().toLowerCase();
    return PLATFORM_ICON_CATALOG.filter((item) => {
      const catOk = category === "all" || item.category === category;
      const queryOk =
        !q ||
        item.label.toLowerCase().includes(q) ||
        item.id.toLowerCase().includes(q) ||
        item.domains.some((d) => d.includes(q));
      return catOk && queryOk;
    });
  }, [query, category]);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        title={`Choose CTA platform icon (${resolved ? resolved.label : "No Icon"})`}
        className={`inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-border bg-card px-2.5 py-1.5 text-xs text-foreground transition hover:border-primary/70 hover:bg-muted/50 ${className}`}
      >
        <PlatformIconGlyph iconId={value} className="size-3.5 shrink-0" />
        {!compact && (
          <span className="max-w-28 truncate font-mono text-[11px]">
            {value === "none" ? "No Icon" : (resolved?.label ?? "Default")}
          </span>
        )}
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/55 p-4 backdrop-blur-xs"
          onClick={() => setOpen(false)}
        >
          <div
            className="flex max-h-[85vh] w-full max-w-lg flex-col gap-3 rounded-2xl border border-border bg-card p-4 text-card-foreground shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <PlatformIconGlyph iconId={value} className="size-4" />
                <span className="font-mono text-xs font-semibold">
                  Select Platform Icon ({PLATFORM_ICON_CATALOG.length} Available)
                </span>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Close icon picker"
                className="rounded-md p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
              >
                <X className="size-4" />
              </button>
            </div>

            <div className="relative">
              <Search className="pointer-events-none absolute top-2.5 left-3 size-3.5 text-muted-foreground" />
              <input
                type="text"
                autoFocus
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search Medium, Hashnode, LinkedIn, YouTube, DEV.to..."
                className="w-full rounded-xl border border-border bg-muted/50 py-2 pr-3 pl-8 text-xs text-foreground placeholder:text-muted-foreground focus:border-primary focus:bg-background focus:outline-none"
              />
            </div>

            <div className="flex flex-wrap gap-1.5">
              <button
                type="button"
                onClick={() => setCategory("all")}
                className={`rounded-lg px-2 py-1 text-[11px] font-medium transition ${
                  category === "all"
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground hover:bg-accent"
                }`}
              >
                All ({PLATFORM_ICON_CATALOG.length})
              </button>
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setCategory(cat)}
                  className={`rounded-lg px-2 py-1 text-[11px] font-medium transition ${
                    category === cat
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground hover:bg-accent"
                  }`}
                >
                  {PLATFORM_CATEGORY_LABELS[cat]}
                </button>
              ))}
            </div>

            <div className="grid grid-cols-2 gap-1.5">
              <button
                type="button"
                onClick={() => {
                  onChange(DEFAULT_PLATFORM_ICON_ID);
                  setOpen(false);
                }}
                className={`flex items-center gap-2 rounded-lg border px-2.5 py-2 text-left text-xs transition ${
                  resolved?.id === DEFAULT_PLATFORM_ICON_ID && value !== "none"
                    ? "border-primary bg-primary/10 font-semibold"
                    : "border-border bg-muted/30 hover:bg-muted"
                }`}
              >
                <PlatformIconGlyph iconId={DEFAULT_PLATFORM_ICON_ID} />
                <span className="truncate">Default Website Icon</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  onChange("none");
                  setOpen(false);
                }}
                className={`flex items-center gap-2 rounded-lg border px-2.5 py-2 text-left text-xs transition ${
                  value === "none"
                    ? "border-primary bg-primary/10 font-semibold"
                    : "border-border bg-muted/30 hover:bg-muted"
                }`}
              >
                <Ban className="size-3.5 text-muted-foreground" />
                <span>No Icon</span>
              </button>
            </div>

            <div className="grid max-h-64 grid-cols-2 gap-1.5 overflow-y-auto rounded-xl border border-border bg-muted/25 p-2 sm:grid-cols-3">
              {filteredIcons.length === 0 ? (
                <div className="col-span-full py-6 text-center text-xs text-muted-foreground">
                  No platform matched &ldquo;{query}&rdquo;. Default Website icon will be
                  used automatically.
                </div>
              ) : (
                filteredIcons.map((item) => {
                  const selected = resolved?.id === item.id && value !== "none";
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => {
                        onChange(item.id);
                        setOpen(false);
                      }}
                      className={`flex items-center gap-2 rounded-lg border px-2.5 py-2 text-left text-xs transition ${
                        selected
                          ? "border-primary bg-primary/15 font-semibold text-foreground"
                          : "border-border bg-card text-card-foreground hover:border-primary/60 hover:bg-accent/50"
                      }`}
                    >
                      <span
                        className="flex size-5 shrink-0 items-center justify-center rounded text-white"
                        style={{ backgroundColor: `#${item.hex}` }}
                      >
                        <svg viewBox="0 0 24 24" className="size-3 fill-current">
                          <path d={item.svgPath} />
                        </svg>
                      </span>
                      <span className="truncate">{item.label}</span>
                    </button>
                  );
                })
              )}
            </div>

            <div className="flex justify-end">
              <Button type="button" size="sm" onClick={() => setOpen(false)}>
                Done
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
