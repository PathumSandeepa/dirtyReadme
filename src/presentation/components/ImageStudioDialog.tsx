"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Cropper, { type Area, type Point } from "react-easy-crop";
import {
  Check,
  FlipHorizontal2,
  FlipVertical2,
  Image as ImageIcon,
  Info,
  Link2,
  RotateCw,
  Trash2,
  Upload,
} from "lucide-react";
import { cn } from "cn";
import type { CustomImageMemoryAsset } from "@/domain/profile/entities";
import {
  buildFlippedPreviewUrl,
  buildMemoryAssetRecord,
  canEncodeAnimatedGifToWebP,
  convertImageToWebP,
  formatFileBytes,
  generateCustomImagePath,
  prepareUploadedImage,
  validateImageFile,
  type ImageOutputWidthMode,
  type PixelCropRect,
} from "@/infrastructure/browser/imageStudioEngine";
import { useDebouncedValue } from "../studio/hooks/useDebouncedValue";
import { StudioButton } from "../studio/ui/StudioButton";
import { StudioDialog } from "../studio/ui/StudioDialog";
import { StudioField, StudioInput } from "../studio/ui/StudioInput";
import { StudioSegmentedControl } from "../studio/ui/StudioSegmentedControl";
import { StudioSliderField } from "../studio/ui/StudioSliderField";
import { StudioSwitchRow } from "../studio/ui/StudioSwitchRow";

type AspectPresetId = "free" | "3:1" | "2:1" | "16:9" | "1:1";

const ASPECT_PRESETS: { id: AspectPresetId; label: string; ratio?: number }[] = [
  { id: "free", label: "Free" },
  { id: "3:1", label: "Banner 3 to 1", ratio: 3 },
  { id: "2:1", label: "Wide 2 to 1", ratio: 2 },
  { id: "16:9", label: "Video 16 to 9", ratio: 16 / 9 },
  { id: "1:1", label: "Square 1 to 1", ratio: 1 },
];

type DialogStep = "input" | "crop" | "convert";
type DialogSourceMode = "upload" | "url";

interface LoadedSourceState {
  originalBlob: Blob;
  originalFilename: string;
  uprightBlob: Blob;
  naturalWidth: number;
  naturalHeight: number;
  isAnimatedGif: boolean;
}

interface ImageStudioDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: "banner" | "editor";
  username: string;
  githubTheme: "light" | "dark";
  initialAsset?: CustomImageMemoryAsset | null;
  initialStep?: DialogStep;
  onConfirmAsset: (asset: CustomImageMemoryAsset) => void;
  onInsertExternalUrl?: (url: string, alt: string) => void;
  onRemoveExisting?: () => void;
}

function isValidExternalImageUrl(raw: string): boolean {
  const trimmed = raw.trim();
  if (!trimmed) return false;
  if (trimmed.startsWith("./") || trimmed.startsWith("/")) return true;
  try {
    const candidate = /^https?:\/\//i.test(trimmed)
      ? trimmed
      : `https://${trimmed}`;
    const u = new URL(candidate);
    return Boolean(u.hostname && u.hostname.includes("."));
  } catch {
    return false;
  }
}

export function ImageStudioDialog({
  open,
  onOpenChange,
  mode,
  username,
  githubTheme,
  initialAsset = null,
  initialStep,
  onConfirmAsset,
  onInsertExternalUrl,
  onRemoveExisting,
}: ImageStudioDialogProps) {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const canKeepAnimation = useMemo(() => canEncodeAnimatedGifToWebP(), []);

  const [sourceTab, setSourceTab] = useState<DialogSourceMode>("upload");
  const [step, setStep] = useState<DialogStep>("input");
  const [draggingOver, setDraggingOver] = useState(false);
  const [inputError, setInputError] = useState<string | null>(null);
  const [busyLoad, setBusyLoad] = useState(false);

  const [loaded, setLoaded] = useState<LoadedSourceState | null>(null);
  const [cropDisplayUrl, setCropDisplayUrl] = useState<string | null>(null);

  // Crop step controls
  const [aspectId, setAspectId] = useState<AspectPresetId>(
    mode === "banner" ? "2:1" : "free"
  );
  const [crop, setCrop] = useState<Point>({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [flipH, setFlipH] = useState(false);
  const [flipV, setFlipV] = useState(false);
  const [keepAnimation, setKeepAnimation] = useState(true);
  const [croppedAreaPixels, setCroppedAreaPixels] =
    useState<PixelCropRect | null>(null);

  // Convert step controls
  const [widthMode, setWidthMode] = useState<ImageOutputWidthMode>(848);
  const [quality, setQuality] = useState(90);
  const [altText, setAltText] = useState("");
  const [generatedMeta, setGeneratedMeta] = useState(() =>
    generateCustomImagePath("profile-image.png")
  );
  const [convertBusy, setConvertBusy] = useState(false);
  const [convertError, setConvertError] = useState<string | null>(null);
  const [convertedResult, setConvertedResult] = useState<{
    webpBlob: Blob;
    previewUrl: string;
    width: number;
    height: number;
    isAnimated: boolean;
  } | null>(null);

  // External URL fallback tab for Editor mode
  const [externalUrl, setExternalUrl] = useState("");
  const [externalAlt, setExternalAlt] = useState("");
  const [externalError, setExternalError] = useState<string | null>(null);

  const debouncedQuality = useDebouncedValue(quality, 180);
  const previewUrlRef = useRef<string | null>(null);
  const cropUrlRef = useRef<string | null>(null);

  useEffect(() => {
    return () => {
      if (previewUrlRef.current) URL.revokeObjectURL(previewUrlRef.current);
      if (cropUrlRef.current) URL.revokeObjectURL(cropUrlRef.current);
    };
  }, []);

  const loadFileIntoCrop = useCallback(
    async (
      blob: Blob,
      filename: string,
      opts?: { existingAlt?: string; existingMeta?: { id: string; filename: string; repoPath: string }; targetStep?: DialogStep }
    ) => {
      const err = validateImageFile(blob, filename);
      if (err) {
        setInputError(err);
        return;
      }

      setBusyLoad(true);
      setInputError(null);
      setConvertError(null);
      try {
        const prepared = await prepareUploadedImage(blob, filename);
        setLoaded({
          originalBlob: blob,
          originalFilename: filename,
          uprightBlob: prepared.uprightBlob,
          naturalWidth: prepared.naturalWidth,
          naturalHeight: prepared.naturalHeight,
          isAnimatedGif: prepared.isAnimatedGif,
        });
        setCrop({ x: 0, y: 0 });
        setZoom(1);
        setRotation(0);
        setFlipH(false);
        setFlipV(false);
        setKeepAnimation(prepared.isAnimatedGif && canKeepAnimation);
        setCroppedAreaPixels({
          x: 0,
          y: 0,
          width: prepared.naturalWidth,
          height: prepared.naturalHeight,
        });
        setAltText(
          opts?.existingAlt ??
            filename.replace(/\.[^.]+$/, "").replace(/[-_]+/g, " ")
        );
        setGeneratedMeta(opts?.existingMeta ?? generateCustomImagePath(filename));
        setStep(opts?.targetStep ?? "crop");
      } catch (decodeErr) {
        setInputError(
          decodeErr instanceof Error
            ? decodeErr.message
            : "Could not read that image file."
        );
      } finally {
        setBusyLoad(false);
      }
    },
    [canKeepAnimation]
  );

  // Reset or hydrate from initialAsset whenever dialog opens
  useEffect(() => {
    if (!open) return;
    let cancelled = false;
    queueMicrotask(() => {
      if (cancelled) return;
      setSourceTab("upload");
      setInputError(null);
      setExternalError(null);

      if (initialAsset) {
        void loadFileIntoCrop(
          initialAsset.originalBlob,
          initialAsset.originalFilename,
          {
            existingAlt: initialAsset.alt,
            existingMeta: {
              id: initialAsset.id,
              filename: initialAsset.filename,
              repoPath: initialAsset.repoPath,
            },
            targetStep: initialStep ?? "crop",
          }
        );
      } else {
        setLoaded(null);
        setStep("input");
        setAltText("");
      }
    });
    return () => {
      cancelled = true;
    };
  }, [open, initialAsset, initialStep, loadFileIntoCrop]);

  // Clipboard paste handler while dialog is open in input step
  useEffect(() => {
    if (!open || sourceTab !== "upload") return;
    const handlePaste = (e: ClipboardEvent) => {
      const items = e.clipboardData?.items;
      if (!items) return;
      for (const item of Array.from(items)) {
        if (item.kind === "file" && item.type.startsWith("image/")) {
          const file = item.getAsFile();
          if (file) {
            e.preventDefault();
            void loadFileIntoCrop(
              file,
              file.name || `pasted.${file.type.split("/")[1] || "png"}`
            );
            break;
          }
        }
      }
    };
    window.addEventListener("paste", handlePaste);
    return () => window.removeEventListener("paste", handlePaste);
  }, [open, sourceTab, loadFileIntoCrop]);

  // Keep Cropper display URL synced with flip state
  useEffect(() => {
    let cancelled = false;
    if (!loaded) {
      queueMicrotask(() => {
        if (!cancelled) setCropDisplayUrl(null);
      });
      return () => {
        cancelled = true;
      };
    }
    void buildFlippedPreviewUrl(loaded.uprightBlob, flipH, flipV).then(
      ({ url }) => {
        if (cancelled) {
          URL.revokeObjectURL(url);
          return;
        }
        if (cropUrlRef.current) URL.revokeObjectURL(cropUrlRef.current);
        cropUrlRef.current = url;
        setCropDisplayUrl(url);
      }
    );
    return () => {
      cancelled = true;
    };
  }, [loaded, flipH, flipV]);

  // Perform live WebP conversion when on the convert step
  useEffect(() => {
    if (step !== "convert" || !loaded || !croppedAreaPixels) return;
    let cancelled = false;

    queueMicrotask(() => {
      if (cancelled) return;
      setConvertBusy(true);
      setConvertError(null);

      void convertImageToWebP({
        uprightBlob: loaded.uprightBlob,
        originalAnimatedBlob: loaded.isAnimatedGif ? loaded.originalBlob : undefined,
        cropRect: croppedAreaPixels,
        rotation,
        flipH,
        flipV,
        outputWidthMode: widthMode,
        quality: debouncedQuality,
        keepAnimation: keepAnimation && loaded.isAnimatedGif,
      })
        .then((res) => {
          if (cancelled) return;
          const nextUrl = URL.createObjectURL(res.webpBlob);
          if (previewUrlRef.current) URL.revokeObjectURL(previewUrlRef.current);
          previewUrlRef.current = nextUrl;
          setConvertedResult({
            webpBlob: res.webpBlob,
            previewUrl: nextUrl,
            width: res.width,
            height: res.height,
            isAnimated: res.isAnimated,
          });
        })
        .catch((err) => {
          if (!cancelled) {
            setConvertError(
              err instanceof Error ? err.message : "Failed converting to WebP."
            );
          }
        })
        .finally(() => {
          if (!cancelled) setConvertBusy(false);
        });
    });

    return () => {
      cancelled = true;
    };
  }, [
    step,
    loaded,
    croppedAreaPixels,
    rotation,
    flipH,
    flipV,
    widthMode,
    debouncedQuality,
    keepAnimation,
  ]);

  const effectiveAspect = useMemo(() => {
    const preset = ASPECT_PRESETS.find((p) => p.id === aspectId);
    if (preset?.ratio) return preset.ratio;
    if (!loaded) return 2;
    const isQuarter = rotation % 180 !== 0;
    const w = isQuarter ? loaded.naturalHeight : loaded.naturalWidth;
    const h = isQuarter ? loaded.naturalWidth : loaded.naturalHeight;
    return Math.max(0.25, Math.min(5, w / Math.max(1, h)));
  }, [aspectId, loaded, rotation]);

  const handleUseImage = () => {
    if (!loaded || !convertedResult) return;
    const asset = buildMemoryAssetRecord({
      meta: generatedMeta,
      alt: altText,
      width: convertedResult.width,
      height: convertedResult.height,
      isAnimated: convertedResult.isAnimated,
      webpBlob: convertedResult.webpBlob,
      originalBlob: loaded.originalBlob,
      originalFilename: loaded.originalFilename,
    });
    onConfirmAsset(asset);
    onOpenChange(false);
  };

  const handleInsertUrlSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValidExternalImageUrl(externalUrl)) {
      setExternalError("Enter a valid image URL starting with https:// or ./");
      return;
    }
    const trimmed = externalUrl.trim();
    const normalized =
      /^https?:\/\//i.test(trimmed) ||
      trimmed.startsWith("/") ||
      trimmed.startsWith("./")
        ? trimmed
        : `https://${trimmed}`;
    onInsertExternalUrl?.(
      normalized,
      externalAlt.trim() || "Profile image"
    );
    setExternalUrl("");
    setExternalAlt("");
    setExternalError(null);
    onOpenChange(false);
  };

  const savingsPct =
    loaded && convertedResult && loaded.originalBlob.size > 0
      ? Math.round(
          ((loaded.originalBlob.size - convertedResult.webpBlob.size) /
            loaded.originalBlob.size) *
            100
        )
      : null;

  return (
    <StudioDialog
      open={open}
      onOpenChange={onOpenChange}
      title={
        mode === "banner"
          ? "Custom banner image"
          : "Add image to README"
      }
      description="Everything stays in your browser. Nothing is uploaded to a server."
      maxWidthClass="sm:max-w-3xl"
      footer={
        sourceTab === "url" ? (
          <StudioButton variant="secondary" onClick={() => onOpenChange(false)}>
            Cancel
          </StudioButton>
        ) : step === "input" ? (
          <div className="flex w-full items-center justify-between gap-2">
            {onRemoveExisting ? (
              <StudioButton
                variant="danger"
                onClick={() => {
                  onRemoveExisting();
                  onOpenChange(false);
                }}
              >
                <Trash2 />
                <span>Remove</span>
              </StudioButton>
            ) : (
              <span />
            )}
            <StudioButton variant="secondary" onClick={() => onOpenChange(false)}>
              Cancel
            </StudioButton>
          </div>
        ) : step === "crop" ? (
          <div className="flex w-full flex-wrap items-center justify-between gap-2">
            <StudioButton
              variant="secondary"
              onClick={() => {
                setLoaded(null);
                setStep("input");
              }}
            >
              Replace image
            </StudioButton>
            <div className="flex items-center gap-2">
              {onRemoveExisting && (
                <StudioButton
                  variant="danger"
                  onClick={() => {
                    onRemoveExisting();
                    onOpenChange(false);
                  }}
                >
                  Remove
                </StudioButton>
              )}
              <StudioButton
                variant="primary"
                onClick={() => setStep("convert")}
                disabled={!croppedAreaPixels}
              >
                Continue to convert
              </StudioButton>
            </div>
          </div>
        ) : (
          <div className="flex w-full flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <StudioButton variant="secondary" onClick={() => setStep("crop")}>
                Re-crop
              </StudioButton>
              <StudioButton
                variant="ghost"
                onClick={() => {
                  setLoaded(null);
                  setStep("input");
                }}
              >
                Replace image
              </StudioButton>
              {onRemoveExisting && (
                <StudioButton
                  variant="danger"
                  onClick={() => {
                    onRemoveExisting();
                    onOpenChange(false);
                  }}
                >
                  Remove
                </StudioButton>
              )}
            </div>

            <StudioButton
              variant="primary"
              disabled={convertBusy || !convertedResult}
              onClick={handleUseImage}
            >
              <Check />
              <span>{convertBusy ? "Converting..." : "Use this image"}</span>
            </StudioButton>
          </div>
        )
      }
    >
      <div className="flex flex-col gap-5">
        {mode === "editor" && step === "input" && (
          <StudioSegmentedControl<DialogSourceMode>
            ariaLabel="Image source"
            size="sm"
            value={sourceTab}
            onChange={setSourceTab}
            options={[
              {
                value: "upload",
                label: "Upload and crop WebP",
                icon: <Upload />,
              },
              {
                value: "url",
                label: "External image URL",
                icon: <Link2 />,
              },
            ]}
          />
        )}

        {sourceTab === "url" ? (
          <form onSubmit={handleInsertUrlSubmit} className="flex flex-col gap-4">
            <StudioField
              label="Image URL"
              htmlFor="studio-external-img-url"
              error={externalError}
            >
              <StudioInput
                id="studio-external-img-url"
                value={externalUrl}
                invalid={Boolean(externalError)}
                onChange={(e) => {
                  setExternalUrl(e.target.value);
                  if (externalError) setExternalError(null);
                }}
                placeholder="https://img.shields.io/badge/..."
              />
            </StudioField>

            <StudioField label="Alt text" htmlFor="studio-external-img-alt">
              <StudioInput
                id="studio-external-img-alt"
                value={externalAlt}
                onChange={(e) => setExternalAlt(e.target.value)}
                placeholder="Describe the image for screen readers"
              />
            </StudioField>

            <div className="flex flex-wrap items-center justify-between gap-2">
              <StudioButton
                variant="secondary"
                size="sm"
                onClick={() => {
                  setExternalUrl(
                    `https://komarev.com/ghpvc/?username=${encodeURIComponent(username || "octocat")}&color=58D6B0&style=for-the-badge`
                  );
                  setExternalAlt("Profile views");
                  setExternalError(null);
                }}
              >
                Use visitor counter badge
              </StudioButton>

              <StudioButton type="submit" variant="primary" size="sm">
                Insert image URL
              </StudioButton>
            </div>
          </form>
        ) : step === "input" ? (
          <div className="flex flex-col gap-4">
            <div
              onDragOver={(e) => {
                e.preventDefault();
                setDraggingOver(true);
              }}
              onDragLeave={() => setDraggingOver(false)}
              onDrop={(e) => {
                e.preventDefault();
                setDraggingOver(false);
                const file = e.dataTransfer.files?.[0];
                if (file) {
                  void loadFileIntoCrop(file, file.name);
                }
              }}
              className={cn(
                "flex min-h-[220px] flex-col items-center justify-center gap-3 rounded-[12px] p-6 text-center transition-colors duration-150",
                draggingOver
                  ? "bg-[var(--surface-3)]"
                  : "bg-[var(--surface-2)]"
              )}
            >
              <div className="flex size-12 items-center justify-center rounded-[12px] bg-[var(--surface)] text-[var(--text)]">
                <ImageIcon className="size-5" />
              </div>

              <div className="flex flex-col gap-1">
                <p className="text-[14px] font-medium text-[var(--text)]">
                  {busyLoad
                    ? "Reading image..."
                    : "Drop an image here, pick a file, or paste from your clipboard."}
                </p>
                <p className="text-[13px] text-[var(--text-2)]">
                  Accepts PNG, JPG, WebP, AVIF and GIF up to 15 MB.
                </p>
              </div>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/png,image/jpeg,image/webp,image/avif,image/gif,.png,.jpg,.jpeg,.webp,.avif,.gif"
                className="sr-only"
                aria-label="Choose image file"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    void loadFileIntoCrop(file, file.name);
                  }
                  e.target.value = "";
                }}
              />

              <StudioButton
                variant="primary"
                size="sm"
                disabled={busyLoad}
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload />
                <span>Choose file</span>
              </StudioButton>
            </div>

            {inputError && (
              <p
                role="alert"
                className="rounded-[8px] bg-[var(--danger-soft)] px-3.5 py-2.5 text-[13px] text-[var(--danger)]"
              >
                {inputError}
              </p>
            )}
          </div>
        ) : step === "crop" && loaded ? (
          <div className="flex flex-col gap-4">
            {/* Aspect Presets */}
            <div className="flex flex-wrap gap-1.5">
              {ASPECT_PRESETS.map((preset) => {
                const active = aspectId === preset.id;
                return (
                  <button
                    key={preset.id}
                    type="button"
                    aria-pressed={active}
                    onClick={() => setAspectId(preset.id)}
                    className={cn(
                      "h-8 cursor-pointer rounded-[8px] px-3 text-[13px] font-medium transition-colors duration-150",
                      active
                        ? "bg-[var(--surface-3)] text-[var(--text)]"
                        : "bg-[var(--surface-2)] text-[var(--text-2)] hover:text-[var(--text)]"
                    )}
                  >
                    {preset.label}
                  </button>
                );
              })}
            </div>

            {/* Crop Stage */}
            <div className="relative h-[300px] w-full overflow-hidden rounded-[12px] bg-[#0C0E0F] sm:h-[340px]">
              {cropDisplayUrl && (
                <Cropper
                  image={cropDisplayUrl}
                  crop={crop}
                  zoom={zoom}
                  rotation={rotation}
                  aspect={effectiveAspect}
                  minZoom={1}
                  maxZoom={3}
                  zoomSpeed={0.8}
                  cropShape="rect"
                  showGrid={false}
                  restrictPosition
                  onCropChange={setCrop}
                  onZoomChange={setZoom}
                  onRotationChange={setRotation}
                  onCropComplete={(_area: Area, pixels: Area) => {
                    setCroppedAreaPixels({
                      x: pixels.x,
                      y: pixels.y,
                      width: pixels.width,
                      height: pixels.height,
                    });
                  }}
                  style={{
                    containerStyle: { background: "#0C0E0F" },
                    cropAreaStyle: {
                      border: "1px solid rgba(255, 255, 255, 0.72)",
                      boxShadow: "0 0 0 9999px rgba(12, 14, 15, 0.72)",
                    },
                  }}
                />
              )}
            </div>

            {/* Zoom + Rotate + Flip */}
            <div className="grid gap-4 rounded-[12px] bg-[var(--surface-2)] p-4 sm:grid-cols-[1fr_auto] sm:items-end">
              <StudioSliderField
                label="Zoom"
                value={zoom}
                min={1}
                max={3}
                step={0.05}
                unit="x"
                formatValue={(v) => v.toFixed(2)}
                onChange={setZoom}
              />

              <div className="flex flex-wrap items-center gap-1.5">
                <StudioButton
                  variant="secondary"
                  size="sm"
                  onClick={() => setRotation((r) => (r + 90) % 360)}
                >
                  <RotateCw />
                  <span>Rotate 90</span>
                </StudioButton>

                <StudioButton
                  variant="secondary"
                  size="sm"
                  active={flipH}
                  onClick={() => setFlipH((prev) => !prev)}
                >
                  <FlipHorizontal2 />
                  <span>Flip horizontal</span>
                </StudioButton>

                <StudioButton
                  variant="secondary"
                  size="sm"
                  active={flipV}
                  onClick={() => setFlipV((prev) => !prev)}
                >
                  <FlipVertical2 />
                  <span>Flip vertical</span>
                </StudioButton>
              </div>
            </div>

            {loaded.isAnimatedGif && (
              <div className="flex flex-col gap-2 rounded-[12px] bg-[var(--surface-2)] p-3.5">
                <div className="flex items-start gap-2.5 text-[13px] text-[var(--text)]">
                  <Info className="mt-0.5 size-4 shrink-0 text-[var(--ember)]" />
                  <span>
                    Animated GIF detected.{" "}
                    {canKeepAnimation
                      ? "Keep animation encodes the cropped frames into an animated WebP file in your browser."
                      : "This browser cannot decode animated GIF frames locally, so the first frame will be converted to WebP."}
                  </span>
                </div>
                {canKeepAnimation && (
                  <StudioSwitchRow
                    id="keep-gif-animation-switch"
                    checked={keepAnimation}
                    onCheckedChange={setKeepAnimation}
                    label="Keep animation"
                    description="Exports cropped frames as animated WebP instead of a single frame."
                    className="bg-[var(--surface)]"
                  />
                )}
              </div>
            )}
          </div>
        ) : loaded ? (
          /* Step 3: Convert & Result */
          <div className="flex flex-col gap-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <StudioField label="Output width">
                <StudioSegmentedControl<`${ImageOutputWidthMode}`>
                  ariaLabel="Output WebP width"
                  size="sm"
                  value={`${widthMode}` as `${ImageOutputWidthMode}`}
                  onChange={(val) =>
                    setWidthMode(
                      val === "original"
                        ? "original"
                        : (Number(val) as ImageOutputWidthMode)
                    )
                  }
                  options={[
                    { value: "original", label: "Original" },
                    { value: "1200", label: "1200" },
                    { value: "848", label: "848" },
                    { value: "640", label: "640" },
                  ]}
                />
              </StudioField>

              <StudioSliderField
                label="WebP quality"
                value={quality}
                min={40}
                max={100}
                step={2}
                onChange={setQuality}
              />
            </div>

            {/* Size Comparison & Output Specs */}
            <div className="grid grid-cols-3 gap-2 rounded-[12px] bg-[var(--surface-2)] p-3.5 text-[13px]">
              <div className="flex flex-col">
                <span className="text-[var(--text-2)]">Original</span>
                <span className="studio-mono font-medium text-[var(--text)] tabular-nums">
                  {formatFileBytes(loaded.originalBlob.size)}
                </span>
              </div>
              <div className="flex flex-col">
                <span className="text-[var(--text-2)]">Converted WebP</span>
                <span className="studio-mono font-medium text-[var(--tide)] tabular-nums">
                  {convertedResult
                    ? `${formatFileBytes(convertedResult.webpBlob.size)}${
                        savingsPct !== null && savingsPct > 0
                          ? ` (${savingsPct}% smaller)`
                          : ""
                      }`
                    : "Converting..."}
                </span>
              </div>
              <div className="flex flex-col">
                <span className="text-[var(--text-2)]">Pixel dimensions</span>
                <span className="studio-mono font-medium text-[var(--text)] tabular-nums">
                  {convertedResult
                    ? `${convertedResult.width} by ${convertedResult.height}`
                    : "Calculating..."}
                </span>
              </div>
            </div>

            {/* Real-width README Preview */}
            <div
              data-gh-theme={githubTheme}
              className="rounded-[12px] border border-[var(--gh-border)] bg-[var(--gh-bg)] p-4"
            >
              <div className="mb-2 flex items-center justify-between text-[12px] text-[var(--gh-muted)]">
                <span className="studio-mono">Preview at 848px README width</span>
                <span className="studio-mono">{generatedMeta.repoPath}</span>
              </div>
              <div className="overflow-hidden rounded-[6px] bg-[var(--gh-surface)] p-3">
                {convertedResult ? (
                  <img
                    src={convertedResult.previewUrl}
                    alt={altText || "Converted WebP preview"}
                    style={{
                      width: `${Math.min(848, convertedResult.width)}px`,
                      maxWidth: "100%",
                      height: "auto",
                    }}
                    className="mx-auto block rounded-[4px]"
                  />
                ) : (
                  <div className="flex h-36 items-center justify-center text-[13px] text-[var(--gh-muted)]">
                    Converting to WebP...
                  </div>
                )}
              </div>
            </div>

            {convertError && (
              <p
                role="alert"
                className="rounded-[8px] bg-[var(--danger-soft)] px-3.5 py-2.5 text-[13px] text-[var(--danger)]"
              >
                {convertError}
              </p>
            )}

            <div className="grid gap-3 sm:grid-cols-2">
              <StudioField
                label="Alt text"
                htmlFor="custom-img-alt-input"
                helper="Helpful hint for screen readers. Optional if decorative."
              >
                <StudioInput
                  id="custom-img-alt-input"
                  value={altText}
                  onChange={(e) => setAltText(e.target.value)}
                  placeholder="Describe what this image shows"
                />
              </StudioField>

              <StudioField
                label="Repository path"
                htmlFor="custom-img-path-input"
                helper="Committed automatically with README.md during publish."
              >
                <StudioInput
                  id="custom-img-path-input"
                  readOnly
                  monospace
                  value={`./${generatedMeta.repoPath}`}
                />
              </StudioField>
            </div>
          </div>
        ) : null}
      </div>
    </StudioDialog>
  );
}
