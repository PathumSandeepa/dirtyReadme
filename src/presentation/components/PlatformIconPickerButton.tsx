"use client";

import { useMemo, useState } from "react";
import { Ban, Check, Globe, Search } from "lucide-react";
import { cn } from "cn";
import {
  DEFAULT_PLATFORM_ICON,
  DEFAULT_PLATFORM_ICON_ID,
  PLATFORM_CATEGORY_LABELS,
  PLATFORM_ICON_CATALOG,
  findPlatformIconById,
  type PlatformIconCategory,
} from "@/domain/profile/platformIcons";
import { StudioButton } from "../studio/ui/StudioButton";
import { StudioDialog } from "../studio/ui/StudioDialog";
import { StudioField, StudioInput } from "../studio/ui/StudioInput";

interface PlatformIconPickerButtonProps {
  value?: string;
  onChange: (iconId: string) => void;
  compact?: boolean;
  className?: string;
}

const CATEGORIES = Object.keys(
  PLATFORM_CATEGORY_LABELS
) as PlatformIconCategory[];

export function PlatformIconGlyph({
  iconId,
  className = "size-3.5",
}: {
  iconId?: string;
  className?: string;
}) {
  if (iconId === "none") {
    return <Ban className={`${className} text-[var(--text-muted)]`} />;
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
    value === "none"
      ? null
      : (findPlatformIconById(value) ?? DEFAULT_PLATFORM_ICON);

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
        aria-label={`Choose platform icon (${resolved ? resolved.label : "No icon"})`}
        title={`Choose platform icon (${resolved ? resolved.label : "No icon"})`}
        className={cn(
          "inline-flex h-11 min-w-0 cursor-pointer items-center gap-2 rounded-[6px] border border-[var(--border)] bg-[var(--surface)] px-2.5 text-[13px] font-medium text-[var(--text)] transition-[color,background-color,border-color] duration-150 hover:border-[var(--border-strong)] hover:bg-[var(--surface-2)] sm:h-9",
          className
        )}
      >
        <PlatformIconGlyph iconId={value} className="size-4 shrink-0" />
        {!compact && (
          <span className="truncate">
            {value === "none" ? "No icon" : (resolved?.label ?? "Website")}
          </span>
        )}
      </button>

      <StudioDialog
        open={open}
        onOpenChange={setOpen}
        title="Select platform icon"
        description={`Choose from ${PLATFORM_ICON_CATALOG.length} supported platforms or select No icon.`}
        maxWidthClass="sm:max-w-xl"
        footer={
          <StudioButton variant="secondary" onClick={() => setOpen(false)}>
            Done
          </StudioButton>
        }
      >
        <div className="flex flex-col gap-4">
          <StudioField label="Search platforms" htmlFor="platform-icon-search">
            <div className="relative">
              <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-[var(--text-muted)]" />
              <StudioInput
                id="platform-icon-search"
                autoFocus
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Medium, Hashnode, LinkedIn, YouTube, Dev.to..."
                className="pl-9"
              />
            </div>
          </StudioField>

          <div className="flex flex-wrap gap-1.5">
            <button
              type="button"
              onClick={() => setCategory("all")}
              className={cn(
                "cursor-pointer rounded-[6px] border px-2.5 py-1 text-[12px] font-medium transition-[color,background-color,border-color] duration-150",
                category === "all"
                  ? "border-[var(--accent)] bg-[var(--accent-soft)] text-[var(--accent)]"
                  : "border-[var(--border)] bg-[var(--surface)] text-[var(--text-muted)] hover:text-[var(--text)]"
              )}
            >
              All ({PLATFORM_ICON_CATALOG.length})
            </button>
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setCategory(cat)}
                className={cn(
                  "cursor-pointer rounded-[6px] border px-2.5 py-1 text-[12px] font-medium transition-[color,background-color,border-color] duration-150",
                  category === cat
                    ? "border-[var(--accent)] bg-[var(--accent-soft)] text-[var(--accent)]"
                    : "border-[var(--border)] bg-[var(--surface)] text-[var(--text-muted)] hover:text-[var(--text)]"
                )}
              >
                {PLATFORM_CATEGORY_LABELS[cat]}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => {
                onChange(DEFAULT_PLATFORM_ICON_ID);
                setOpen(false);
              }}
              className={cn(
                "flex cursor-pointer items-center justify-between gap-2 rounded-[6px] border px-3 py-2 text-left text-[13px] font-medium transition-[color,background-color,border-color] duration-150",
                resolved?.id === DEFAULT_PLATFORM_ICON_ID && value !== "none"
                  ? "border-[var(--accent)] bg-[var(--accent-soft)] text-[var(--accent)]"
                  : "border-[var(--border)] bg-[var(--surface-2)] text-[var(--text)] hover:border-[var(--border-strong)]"
              )}
            >
              <span className="flex items-center gap-2 truncate">
                <PlatformIconGlyph iconId={DEFAULT_PLATFORM_ICON_ID} />
                <span className="truncate">Default website icon</span>
              </span>
              {resolved?.id === DEFAULT_PLATFORM_ICON_ID &&
                value !== "none" && <Check className="size-3.5 shrink-0" />}
            </button>
            <button
              type="button"
              onClick={() => {
                onChange("none");
                setOpen(false);
              }}
              className={cn(
                "flex cursor-pointer items-center justify-between gap-2 rounded-[6px] border px-3 py-2 text-left text-[13px] font-medium transition-[color,background-color,border-color] duration-150",
                value === "none"
                  ? "border-[var(--accent)] bg-[var(--accent-soft)] text-[var(--accent)]"
                  : "border-[var(--border)] bg-[var(--surface-2)] text-[var(--text)] hover:border-[var(--border-strong)]"
              )}
            >
              <span className="flex items-center gap-2">
                <Ban className="size-3.5 text-[var(--text-muted)]" />
                <span>No icon</span>
              </span>
              {value === "none" && <Check className="size-3.5 shrink-0" />}
            </button>
          </div>

          <div className="grid max-h-64 grid-cols-2 gap-2 overflow-y-auto rounded-[8px] border border-[var(--border)] bg-[var(--surface-2)] p-2.5 sm:grid-cols-3">
            {filteredIcons.length === 0 ? (
              <div className="col-span-full py-6 text-center text-[13px] text-[var(--text-muted)]">
                No platform matched &ldquo;{query}&rdquo;.
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
                    className={cn(
                      "flex cursor-pointer items-center gap-2 rounded-[6px] border px-2.5 py-2 text-left text-[13px] font-medium transition-[color,background-color,border-color] duration-150",
                      selected
                        ? "border-[var(--accent)] bg-[var(--accent-soft)] text-[var(--accent)]"
                        : "border-[var(--border)] bg-[var(--surface)] text-[var(--text)] hover:border-[var(--border-strong)]"
                    )}
                  >
                    <span
                      className="flex size-5 shrink-0 items-center justify-center rounded-[4px] text-white"
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
        </div>
      </StudioDialog>
    </>
  );
}
