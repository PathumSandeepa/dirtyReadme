"use client";

import * as React from "react";
import { Dialog as DialogPrimitive } from "@base-ui/react/dialog";
import { X } from "lucide-react";
import { cn } from "cn";
import { StudioButton } from "./StudioButton";

interface StudioDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  maxWidthClass?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}

/** Accessible floating dialog scoped to [data-app="studio"] with soft layered shadow and 16px radius. */
export function StudioDialog({
  open,
  onOpenChange,
  title,
  description,
  maxWidthClass = "sm:max-w-md",
  children,
  footer,
}: StudioDialogProps) {
  return (
    <DialogPrimitive.Root open={open} onOpenChange={onOpenChange}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Backdrop className="fixed inset-0 z-50 bg-black/50 backdrop-blur-[2px] transition-opacity duration-150 data-open:animate-in data-open:fade-in-0 data-closed:animate-out data-closed:fade-out-0" />
        <DialogPrimitive.Popup
          data-app="studio"
          className={cn(
            "fixed top-1/2 left-1/2 z-50 flex max-h-[90vh] w-[calc(100%-2rem)] -translate-x-1/2 -translate-y-1/2 flex-col overflow-hidden rounded-[16px] border-0 bg-[var(--surface)] text-[var(--text)] shadow-[var(--shadow-float)] outline-none",
            maxWidthClass
          )}
        >
          <div className="flex items-start justify-between gap-4 px-6 pt-5 pb-4">
            <div className="flex flex-col gap-1">
              <DialogPrimitive.Title className="text-[18px] leading-6 font-semibold tracking-[-0.02em] text-[var(--text)]">
                {title}
              </DialogPrimitive.Title>
              {description && (
                <DialogPrimitive.Description className="text-[13px] leading-5 text-[var(--text-2)]">
                  {description}
                </DialogPrimitive.Description>
              )}
            </div>

            <DialogPrimitive.Close
              render={
                <StudioButton
                  variant="ghost"
                  size="icon"
                  aria-label="Close dialog"
                  className="-mt-1 -mr-2"
                />
              }
            >
              <X />
            </DialogPrimitive.Close>
          </div>

          <div className="flex-1 overflow-y-auto px-6 pb-5">{children}</div>

          {footer && (
            <div className="flex flex-wrap items-center justify-end gap-2 bg-[var(--surface-2)] px-6 py-3.5">
              {footer}
            </div>
          )}
        </DialogPrimitive.Popup>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}

interface StudioConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  destructive?: boolean;
  onConfirm: () => void;
}

/** Confirmation dialog replacing native browser confirm() prompts. */
export function StudioConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  destructive = false,
  onConfirm,
}: StudioConfirmDialogProps) {
  return (
    <StudioDialog
      open={open}
      onOpenChange={onOpenChange}
      title={title}
      description={description}
      maxWidthClass="sm:max-w-[440px]"
      footer={
        <>
          <StudioButton
            variant="secondary"
            onClick={() => onOpenChange(false)}
          >
            {cancelLabel}
          </StudioButton>
          <StudioButton
            variant={destructive ? "danger" : "primary"}
            onClick={() => {
              onConfirm();
              onOpenChange(false);
            }}
          >
            {confirmLabel}
          </StudioButton>
        </>
      }
    >
      <p className="text-[13px] leading-5 text-[var(--text-2)]">
        This updates your current studio session right away.
      </p>
    </StudioDialog>
  );
}

interface StudioDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  children: React.ReactNode;
}

/** Slide-over side drawer for secondary panels on smaller viewports. */
export function StudioDrawer({
  open,
  onOpenChange,
  title,
  children,
}: StudioDrawerProps) {
  return (
    <DialogPrimitive.Root open={open} onOpenChange={onOpenChange}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Backdrop className="fixed inset-0 z-50 bg-black/50 backdrop-blur-[2px] transition-opacity duration-150" />
        <DialogPrimitive.Popup
          data-app="studio"
          className="fixed inset-y-0 right-0 z-50 flex h-full w-full max-w-[94vw] flex-col rounded-l-[16px] border-0 bg-[var(--bg)] text-[var(--text)] shadow-[var(--shadow-float)] outline-none sm:max-w-2xl"
        >
          <div className="flex h-14 shrink-0 items-center justify-between gap-3 bg-[var(--surface)] px-5">
            <DialogPrimitive.Title className="text-[16px] font-semibold tracking-[-0.02em] text-[var(--text)]">
              {title}
            </DialogPrimitive.Title>
            <DialogPrimitive.Close
              render={
                <StudioButton
                  variant="ghost"
                  size="icon"
                  aria-label="Close drawer"
                />
              }
            >
              <X />
            </DialogPrimitive.Close>
          </div>
          <div className="flex-1 overflow-y-auto p-4">{children}</div>
        </DialogPrimitive.Popup>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}

interface StudioBottomSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}

/** Mobile and tablet bottom sheet inspector shown below 1200px viewport width. */
export function StudioBottomSheet({
  open,
  onOpenChange,
  title,
  description,
  children,
  footer,
}: StudioBottomSheetProps) {
  return (
    <DialogPrimitive.Root open={open} onOpenChange={onOpenChange}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Backdrop className="fixed inset-0 z-50 bg-black/50 backdrop-blur-[2px] transition-opacity duration-150 data-open:animate-in data-open:fade-in-0 data-closed:animate-out data-closed:fade-out-0" />
        <DialogPrimitive.Popup
          data-app="studio"
          className="fixed inset-x-0 bottom-0 z-50 flex max-h-[84vh] flex-col overflow-hidden rounded-t-[16px] border-0 bg-[var(--surface)] text-[var(--text)] shadow-[var(--shadow-float)] outline-none"
        >
          <div className="flex justify-center pt-2.5 pb-1">
            <span
              aria-hidden="true"
              className="h-1 w-9 rounded-full bg-[var(--surface-3)]"
            />
          </div>

          <div className="flex items-start justify-between gap-4 px-5 pt-1 pb-3">
            <div className="flex flex-col gap-0.5">
              <DialogPrimitive.Title className="text-[18px] leading-6 font-semibold tracking-[-0.02em] text-[var(--text)]">
                {title}
              </DialogPrimitive.Title>
              {description && (
                <DialogPrimitive.Description className="text-[13px] leading-5 text-[var(--text-2)]">
                  {description}
                </DialogPrimitive.Description>
              )}
            </div>

            <DialogPrimitive.Close
              render={
                <StudioButton
                  variant="ghost"
                  size="icon"
                  aria-label="Close inspector"
                  className="-mt-1 -mr-1.5"
                />
              }
            >
              <X />
            </DialogPrimitive.Close>
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto px-5 pb-5">
            {children}
          </div>

          {footer && (
            <div className="shrink-0 bg-[var(--surface-2)] px-5 py-3.5">
              {footer}
            </div>
          )}
        </DialogPrimitive.Popup>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}
