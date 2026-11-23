"use client";

import * as React from "react";
import { useState } from "react";
import { StudioConfirmDialog } from "../ui/StudioDialog";
import { StudioActionBar } from "./StudioActionBar";
import { StudioFooter } from "./StudioFooter";
import { StudioHeader } from "./StudioHeader";
import { StudioStepper, type StudioMainStep } from "./StudioStepper";

interface StudioShellProps {
  username: string;
  isDark: boolean;
  onToggleTheme: () => void;
  currentStep: StudioMainStep;
  onGoHome: () => void;
  onNavigateStep: (step: StudioMainStep) => void;
  onResetAll: () => void;
  showActionBar?: boolean;
  showFooter?: boolean;
  backLabel?: string;
  nextLabel?: string;
  onBack?: () => void;
  onNext?: () => void;
  children: React.ReactNode;
}

/** Shared Studio frame providing sticky navigation, progress stepper, content area, and bottom action bar. */
export function StudioShell({
  username,
  isDark,
  onToggleTheme,
  currentStep,
  onGoHome,
  onNavigateStep,
  onResetAll,
  showActionBar = true,
  showFooter = false,
  backLabel = "Back",
  nextLabel = "Next",
  onBack,
  onNext,
  children,
}: StudioShellProps) {
  const [confirmResetOpen, setConfirmResetOpen] = useState(false);

  return (
    <div
      data-app="studio"
      className="flex min-h-screen flex-col bg-[var(--bg)] text-[var(--text)]"
    >
      <StudioHeader
        username={username}
        isDark={isDark}
        showRepoGuide={
          currentStep !== "connect" && currentStep !== "repository"
        }
        onToggleTheme={onToggleTheme}
        onGoHome={onGoHome}
        onOpenRepoGuide={() => onNavigateStep("repository")}
        onRequestStartOver={() => setConfirmResetOpen(true)}
      />

      <StudioStepper currentStep={currentStep} onNavigateStep={onNavigateStep} />

      <main className="flex-1">{children}</main>

      {showFooter && <StudioFooter />}

      {showActionBar && onBack && onNext && (
        <StudioActionBar
          backLabel={backLabel}
          nextLabel={nextLabel}
          onBack={onBack}
          onNext={onNext}
        />
      )}

      <StudioConfirmDialog
        open={confirmResetOpen}
        onOpenChange={setConfirmResetOpen}
        title="Start over from scratch?"
        description="This clears your creature settings, custom README text, tech stack cards, custom images, and loaded profile data."
        confirmLabel="Start over"
        destructive
        onConfirm={onResetAll}
      />
    </div>
  );
}
