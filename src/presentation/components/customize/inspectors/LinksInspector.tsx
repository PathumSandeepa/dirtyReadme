"use client";

import { useRef, useState } from "react";
import { ArrowDown, ArrowUp, Plus, Trash2 } from "lucide-react";
import type { CreatureConfig } from "@/domain/creature/entities";
import {
  CTA_QUICK_TEMPLATES,
  type ReadmeActionLink,
  type ReadmeConfig,
} from "@/domain/profile/entities";
import {
  DEFAULT_PLATFORM_ICON_ID,
  detectPlatformFromUrl,
} from "@/domain/profile/platformIcons";
import {
  buildActionLinkBadgeUrl,
  reorderItems,
} from "@/domain/profile/readmeService";
import { Switch } from "@/components/ui/switch";
import { StudioButton } from "../../../studio/ui/StudioButton";
import { StudioColorSwatch } from "../../../studio/ui/StudioColorSwatch";
import { StudioField, StudioInput } from "../../../studio/ui/StudioInput";
import { StudioSegmentedControl } from "../../../studio/ui/StudioSegmentedControl";
import { StudioSwitchRow } from "../../../studio/ui/StudioSwitchRow";
import {
  PlatformIconGlyph,
  PlatformIconPickerButton,
} from "../../PlatformIconPickerButton";

interface LinksInspectorProps {
  creatureConfig: CreatureConfig;
  readmeConfig: ReadmeConfig;
  onUpdateField: <K extends keyof ReadmeConfig>(
    key: K,
    value: ReadmeConfig[K]
  ) => void;
}

const QUICK_PLATFORMS: {
  label: string;
  template: (typeof CTA_QUICK_TEMPLATES)[number];
}[] = [
  { label: "Medium", template: CTA_QUICK_TEMPLATES[0] },
  { label: "Hashnode", template: CTA_QUICK_TEMPLATES[1] },
  { label: "Substack", template: CTA_QUICK_TEMPLATES[2] },
  { label: "Dev.to", template: CTA_QUICK_TEMPLATES[3] },
  { label: "LinkedIn", template: CTA_QUICK_TEMPLATES[4] },
  { label: "X", template: CTA_QUICK_TEMPLATES[5] },
  { label: "YouTube", template: CTA_QUICK_TEMPLATES[6] },
  { label: "Discord", template: CTA_QUICK_TEMPLATES[7] },
  { label: "Email", template: CTA_QUICK_TEMPLATES[8] },
  { label: "Portfolio", template: CTA_QUICK_TEMPLATES[9] },
  { label: "Sponsor", template: CTA_QUICK_TEMPLATES[10] },
];

function normalizeActionUrl(raw: string): string {
  const trimmed = raw.trim();
  if (!trimmed) return "";
  if (
    /^https?:\/\//i.test(trimmed) ||
    /^mailto:/i.test(trimmed) ||
    trimmed.startsWith("#") ||
    trimmed.startsWith("/")
  ) {
    return trimmed;
  }
  return `https://${trimmed}`;
}

function validateLinkUrl(raw: string): string | null {
  const trimmed = raw.trim();
  if (!trimmed) return "URL is required.";
  if (/^mailto:/i.test(trimmed)) {
    const addr = trimmed.slice(7);
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(addr)
      ? null
      : "Enter a valid mailto email such as mailto:you@domain.com.";
  }
  if (trimmed.startsWith("#") || trimmed.startsWith("/")) return null;
  if (/^javascript:/i.test(trimmed) || /^data:/i.test(trimmed)) {
    return "Use an https:// or mailto: URL.";
  }
  try {
    const candidate = /^https?:\/\//i.test(trimmed)
      ? trimmed
      : `https://${trimmed}`;
    const u = new URL(candidate);
    if (!u.hostname || (!u.hostname.includes(".") && !trimmed.includes("{{"))) {
      return "Enter a valid web address.";
    }
    return null;
  } catch {
    return "Enter a valid URL starting with https:// or mailto:.";
  }
}

export function LinksInspector({
  creatureConfig,
  readmeConfig,
  onUpdateField,
}: LinksInspectorProps) {
  const nextIdRef = useRef(1);
  const customInputRef = useRef<HTMLInputElement | null>(null);

  const [newLabel, setNewLabel] = useState("");
  const [newText, setNewText] = useState("");
  const [newUrl, setNewUrl] = useState("");
  const [newLogo, setNewLogo] = useState(DEFAULT_PLATFORM_ICON_ID);
  const [newColor, setNewColor] = useState("#58D6B0");
  const [manualLogo, setManualLogo] = useState(false);
  const [manualColor, setManualColor] = useState(false);
  const [newError, setNewError] = useState<string | null>(null);

  const handleQuickAdd = (tpl: (typeof CTA_QUICK_TEMPLATES)[number]) => {
    const seq = nextIdRef.current++;
    onUpdateField("showLinksRow", true);
    onUpdateField("actionLinks", [
      ...readmeConfig.actionLinks,
      {
        id: `link-${seq}-${tpl.label.toLowerCase()}`,
        ...tpl,
        enabled: true,
      },
    ]);
  };

  const handleAddCustom = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLabel.trim()) {
      setNewError("Enter a link label such as PORTFOLIO.");
      return;
    }
    const urlErr = validateLinkUrl(newUrl);
    if (urlErr) {
      setNewError(urlErr);
      return;
    }
    const normalized = normalizeActionUrl(newUrl);
    const seq = nextIdRef.current++;
    const resolvedLogo = manualLogo
      ? newLogo
      : detectPlatformFromUrl(normalized).id;
    onUpdateField("showLinksRow", true);
    onUpdateField("actionLinks", [
      ...readmeConfig.actionLinks,
      {
        id: `link-${seq}`,
        label: newLabel.trim().toUpperCase(),
        valueText: (newText.trim() || "OPEN").toUpperCase(),
        url: normalized,
        color: newColor.replace("#", ""),
        logo: resolvedLogo || DEFAULT_PLATFORM_ICON_ID,
        enabled: true,
      },
    ]);
    setNewLabel("");
    setNewText("");
    setNewUrl("");
    setNewLogo(DEFAULT_PLATFORM_ICON_ID);
    setNewColor("#58D6B0");
    setManualLogo(false);
    setManualColor(false);
    setNewError(null);
  };

  const updateLink = (idx: number, patch: Partial<ReadmeActionLink>) => {
    const updated = [...readmeConfig.actionLinks];
    updated[idx] = { ...updated[idx], ...patch };
    onUpdateField("actionLinks", updated);
  };

  const customPreview: ReadmeActionLink = {
    id: "preview",
    label: (newLabel.trim() || "PORTFOLIO").toUpperCase(),
    valueText: (newText.trim() || "VISIT").toUpperCase(),
    url: newUrl.trim() || "https://example.com",
    color: newColor.replace("#", "") || "58D6B0",
    logo: newLogo || DEFAULT_PLATFORM_ICON_ID,
    enabled: true,
  };

  return (
    <div className="flex flex-col gap-5">
      <StudioSwitchRow
        id="inspector-links-visible"
        checked={readmeConfig.showLinksRow !== false}
        onCheckedChange={(checked) => onUpdateField("showLinksRow", checked)}
        label="Show links in README"
        description="Displays your enabled link badges beneath the tech stack."
      />

      {/* Quick add row */}
      <div className="flex flex-col gap-2">
        <span className="text-[13px] font-medium text-[var(--text)]">
          Add a link
        </span>
        <div className="flex flex-wrap gap-1.5">
          {QUICK_PLATFORMS.map(({ label, template }) => (
            <StudioButton
              key={label}
              variant="secondary"
              size="sm"
              onClick={() => handleQuickAdd(template)}
            >
              <PlatformIconGlyph iconId={template.logo} className="size-3.5" />
              <span>{label}</span>
            </StudioButton>
          ))}
          <StudioButton
            variant="secondary"
            size="sm"
            onClick={() => customInputRef.current?.focus()}
          >
            <Plus />
            <span>Custom</span>
          </StudioButton>
        </div>
      </div>

      {/* Existing links */}
      <div className="flex flex-col gap-3">
        {readmeConfig.actionLinks.length === 0 ? (
          <div className="flex flex-col items-center gap-3 rounded-[12px] bg-[var(--surface-2)] p-5 text-center">
            <p className="text-[13px] text-[var(--text-2)]">
              No profile links yet.
            </p>
            <StudioButton
              variant="secondary"
              size="sm"
              onClick={() => customInputRef.current?.focus()}
            >
              <Plus />
              <span>Add a link</span>
            </StudioButton>
          </div>
        ) : (
          readmeConfig.actionLinks.map((link, idx) => {
          const urlError = validateLinkUrl(link.url);
          return (
            <div
              key={link.id}
              className="flex flex-col gap-3 rounded-[12px] bg-[var(--surface-2)] p-3.5"
            >
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <Switch
                    id={`link-show-${link.id}`}
                    size="sm"
                    checked={link.enabled}
                    onCheckedChange={(c) =>
                      updateLink(idx, { enabled: Boolean(c) })
                    }
                  />
                  <label
                    htmlFor={`link-show-${link.id}`}
                    className="cursor-pointer text-[13px] font-medium text-[var(--text)]"
                  >
                    Show
                  </label>
                </div>

                <div className="flex items-center gap-1">
                  <StudioButton
                    variant="ghost"
                    size="icon"
                    disabled={idx === 0}
                    onClick={() =>
                      onUpdateField(
                        "actionLinks",
                        reorderItems(readmeConfig.actionLinks, idx, idx - 1)
                      )
                    }
                    aria-label="Move link up"
                  >
                    <ArrowUp />
                  </StudioButton>
                  <StudioButton
                    variant="ghost"
                    size="icon"
                    disabled={idx === readmeConfig.actionLinks.length - 1}
                    onClick={() =>
                      onUpdateField(
                        "actionLinks",
                        reorderItems(readmeConfig.actionLinks, idx, idx + 1)
                      )
                    }
                    aria-label="Move link down"
                  >
                    <ArrowDown />
                  </StudioButton>
                  <StudioButton
                    variant="ghost"
                    size="icon"
                    onClick={() =>
                      onUpdateField(
                        "actionLinks",
                        readmeConfig.actionLinks.filter((l) => l.id !== link.id)
                      )
                    }
                    aria-label="Delete link"
                    className="hover:text-[var(--danger)]"
                  >
                    <Trash2 />
                  </StudioButton>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <StudioField label="Label" htmlFor={`cta-lbl-${link.id}`}>
                  <StudioInput
                    id={`cta-lbl-${link.id}`}
                    value={link.label}
                    onChange={(e) =>
                      updateLink(idx, { label: e.target.value })
                    }
                    className="bg-[var(--surface)]"
                  />
                </StudioField>

                <StudioField label="Text" htmlFor={`cta-txt-${link.id}`}>
                  <StudioInput
                    id={`cta-txt-${link.id}`}
                    value={link.valueText}
                    onChange={(e) =>
                      updateLink(idx, { valueText: e.target.value })
                    }
                    className="bg-[var(--surface)]"
                  />
                </StudioField>
              </div>

              <div className="grid grid-cols-[1fr_auto] gap-2.5">
                <StudioField label="Platform">
                  <PlatformIconPickerButton
                    value={link.logo ?? DEFAULT_PLATFORM_ICON_ID}
                    onChange={(iconId) => updateLink(idx, { logo: iconId })}
                    className="w-full justify-start bg-[var(--surface)]"
                  />
                </StudioField>

                <StudioField label="Color">
                  <StudioColorSwatch
                    label={`Color for ${link.label || "link"}`}
                    value={`#${link.color.replace("#", "").padEnd(6, "0").slice(0, 6)}`}
                    hideInput
                    onChange={(hex) =>
                      updateLink(idx, {
                        color: hex.replace("#", "").toUpperCase(),
                      })
                    }
                  />
                </StudioField>
              </div>

              <StudioField
                label="URL"
                htmlFor={`cta-url-${link.id}`}
                error={urlError}
              >
                <StudioInput
                  id={`cta-url-${link.id}`}
                  value={link.url}
                  invalid={Boolean(urlError)}
                  onChange={(e) => {
                    const nextUrl = e.target.value;
                    const detected = detectPlatformFromUrl(nextUrl);
                    updateLink(idx, { url: nextUrl, logo: detected.id });
                  }}
                  placeholder="https://github.com/username"
                  className="bg-[var(--surface)]"
                />
              </StudioField>

              <div className="pt-1">
                <img
                  src={buildActionLinkBadgeUrl(link, creatureConfig)}
                  alt={link.label || "Link badge preview"}
                  className="h-6 w-auto"
                />
              </div>
            </div>
          );
        })
        )}
      </div>

      {/* Custom Link Form */}
      <form
        onSubmit={handleAddCustom}
        className="flex flex-col gap-3 rounded-[12px] bg-[var(--surface-2)] p-3.5"
      >
        <div className="flex flex-wrap items-center justify-between gap-2">
          <span className="text-[14px] font-semibold text-[var(--text)]">
            Custom link
          </span>
          <img
            src={buildActionLinkBadgeUrl(customPreview, creatureConfig)}
            alt="Custom link preview"
            className="h-5 w-auto"
          />
        </div>

        <div className="grid grid-cols-2 gap-2.5">
          <StudioField label="Label" htmlFor="new-link-label">
            <StudioInput
              ref={customInputRef}
              id="new-link-label"
              value={newLabel}
              onChange={(e) => {
                setNewLabel(e.target.value);
                if (newError) setNewError(null);
              }}
              placeholder="PORTFOLIO"
              className="bg-[var(--surface)]"
            />
          </StudioField>

          <StudioField label="Text" htmlFor="new-link-text">
            <StudioInput
              id="new-link-text"
              value={newText}
              onChange={(e) => setNewText(e.target.value)}
              placeholder="VISIT SITE"
              className="bg-[var(--surface)]"
            />
          </StudioField>
        </div>

        <StudioField label="URL" htmlFor="new-link-url" error={newError}>
          <StudioInput
            id="new-link-url"
            value={newUrl}
            invalid={Boolean(newError)}
            onChange={(e) => {
              const nextUrl = e.target.value;
              setNewUrl(nextUrl);
              if (newError) setNewError(null);
              const detected = detectPlatformFromUrl(nextUrl);
              if (!manualLogo) setNewLogo(detected.id);
              if (!manualColor && nextUrl.trim()) {
                setNewColor(`#${detected.hex}`);
              }
            }}
            placeholder="https://example.com"
            className="bg-[var(--surface)]"
          />
        </StudioField>

        <div className="flex items-end justify-between gap-2">
          <div className="flex-1">
            <StudioField label="Platform">
              <PlatformIconPickerButton
                value={newLogo}
                onChange={(id) => {
                  setManualLogo(true);
                  setNewLogo(id);
                }}
                className="w-full justify-start bg-[var(--surface)]"
              />
            </StudioField>
          </div>

          <StudioField label="Color">
            <StudioColorSwatch
              label="New link color"
              value={newColor}
              hideInput
              onChange={(hex) => {
                setManualColor(true);
                setNewColor(hex);
              }}
            />
          </StudioField>
        </div>

        <StudioButton type="submit" variant="primary" className="w-full">
          Add link
        </StudioButton>
      </form>
    </div>
  );
}
