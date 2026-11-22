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

/** Flat, accessible dialog scoped to [data-app="studio"] with Esc-to-close and soft shadow. */
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
        <DialogPrimitive.Backdrop className="fixed inset-0 z-50 bg-black/45 transition-opacity duration-150 data-open:animate-in data-open:fade-in-0 data-closed:animate-out data-closed:fade-out-0" />
        <DialogPrimitive.Popup
          data-app="studio"
          className={cn(
            "fixed top-1/2 left-1/2 z-50 flex max-h-[90vh] w-[calc(100%-2rem)] -translate-x-1/2 -translate-y-1/2 flex-col overflow-hidden rounded-[8px] border border-[var(--border)] bg-[var(--surface)] text-[var(--text)] shadow-[var(--studio-shadow-overlay)] outline-none",
            maxWidthClass
          )}
        >
          <div className="flex items-start justify-between gap-4 border-b border-[var(--border)] px-6 py-4">
            <div className="flex flex-col gap-1">
              <DialogPrimitive.Title className="text-[16px] leading-6 font-semibold text-[var(--text)]">
                {title}
              </DialogPrimitive.Title>
              {description && (
                <DialogPrimitive.Description className="text-[13px] leading-5 text-[var(--text-muted)]">
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

          <div className="flex-1 overflow-y-auto px-6 py-5">{children}</div>

          {footer && (
            <div className="flex flex-wrap items-center justify-end gap-2 border-t border-[var(--border)] bg-[var(--surface-2)] px-6 py-3.5">
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

/** Confirmation dialog replacing browser confirm() dialogs. */
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
      <p className="text-[14px] leading-5 text-[var(--text-muted)]">
        This action updates your current studio session immediately.
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

/** Full-height slide-over drawer used on viewports below 1200px for live preview. */
export function StudioDrawer({
  open,
  onOpenChange,
  title,
  children,
}: StudioDrawerProps) {
  return (
    <DialogPrimitive.Root open={open} onOpenChange={onOpenChange}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Backdrop className="fixed inset-0 z-50 bg-black/45 transition-opacity duration-150" />
        <DialogPrimitive.Popup
          data-app="studio"
          className="fixed inset-y-0 right-0 z-50 flex h-full w-full max-w-[94vw] flex-col border-l border-[var(--border)] bg-[var(--bg)] text-[var(--text)] shadow-[var(--studio-shadow-overlay)] outline-none sm:max-w-2xl"
        >
          <div className="flex h-14 shrink-0 items-center justify-between gap-3 border-b border-[var(--border)] bg-[var(--surface)] px-4">
            <DialogPrimitive.Title className="text-[16px] font-semibold text-[var(--text)]">
              {title}
            </DialogPrimitive.Title>
            <DialogPrimitive.Close
              render={
                <StudioButton
                  variant="ghost"
                  size="icon"
                  aria-label="Close preview drawer"
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
