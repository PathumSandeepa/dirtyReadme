"use client";

import { useState } from "react";
import {
  CheckCircle2,
  ExternalLink,
  Lock,
  ShieldAlert,
} from "lucide-react";
import { cn } from "cn";
import { StudioButton } from "../studio/ui/StudioButton";
import { StudioDialog } from "../studio/ui/StudioDialog";
import { StudioSegmentedControl } from "../studio/ui/StudioSegmentedControl";

interface TokenGuideDialogProps {
  open: boolean;
  onClose: () => void;
  username: string;
  includeWorkflowFiles: boolean;
}

export function TokenGuideDialog({
  open,
  onClose,
  username,
  includeWorkflowFiles,
}: TokenGuideDialogProps) {
  const [tokenTab, setTokenTab] = useState<"classic" | "fine-grained">(
    "classic"
  );
  const safeUser =
    username && username !== "your-username" ? username : "YOUR_USERNAME";
  const secretsUrl = `https://github.com/${encodeURIComponent(safeUser)}/${encodeURIComponent(safeUser)}/settings/secrets/actions`;
  const classicUrl = `https://github.com/settings/tokens/new?description=dynamic-readme-creature&scopes=${includeWorkflowFiles ? "repo,workflow" : "repo"}`;
  const fineGrainedUrl =
    "https://github.com/settings/personal-access-tokens/new";

  return (
    <StudioDialog
      open={open}
      onOpenChange={(isOpen) => {
        if (!isOpen) onClose();
      }}
      title="How to create a GitHub token & required permissions"
      description={`Follow these steps to create a Classic or Fine-grained Personal Access Token for ${safeUser}/${safeUser}.`}
      maxWidthClass="sm:max-w-2xl"
      footer={
        <div className="flex w-full flex-wrap items-center justify-between gap-2">
          <a
            href={tokenTab === "classic" ? classicUrl : fineGrainedUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex h-9 items-center gap-2 rounded-[6px] border border-[var(--border)] bg-[var(--surface)] px-3.5 text-[13px] font-medium text-[var(--text)] transition-[color,background-color,border-color] duration-150 hover:border-[var(--border-strong)] hover:bg-[var(--surface-2)]"
          >
            <span>
              {tokenTab === "classic"
                ? "Open classic token page"
                : "Open fine-grained token page"}
            </span>
            <ExternalLink className="size-3.5 text-[var(--text-muted)]" />
          </a>

          <StudioButton variant="primary" onClick={onClose}>
            Done
          </StudioButton>
        </div>
      }
    >
      <div className="flex flex-col gap-5">
        <StudioSegmentedControl<"classic" | "fine-grained">
          ariaLabel="Token type"
          value={tokenTab}
          onChange={setTokenTab}
          options={[
            { value: "classic", label: "Classic token (ghp_...)" },
            { value: "fine-grained", label: "Fine-grained (github_pat_...)" },
          ]}
        />

        {tokenTab === "classic" ? (
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-2.5 rounded-[8px] border border-[var(--border)] bg-[var(--surface-2)] p-4">
              <div className="flex items-center justify-between gap-2">
                <span className="text-[14px] font-semibold text-[var(--text)]">
                  Required Classic scopes
                </span>
                <span className="studio-mono rounded-full border border-[var(--border)] bg-[var(--surface)] px-2 py-0.5 text-[12px] text-[var(--text-muted)]">
                  ghp_...
                </span>
              </div>

              <div className="flex flex-wrap items-start justify-between gap-2 rounded-[6px] border border-[var(--border)] bg-[var(--surface)] px-3 py-2.5 text-[13px]">
                <div className="min-w-0 flex-1">
                  <code className="studio-mono font-semibold text-[var(--text)]">
                    repo
                  </code>
                  <p className="mt-0.5 text-[var(--text-muted)]">
                    Allows committing <code className="studio-mono">README.md</code>,{" "}
                    <code className="studio-mono">creature.webp</code>,{" "}
                    <code className="studio-mono">creature-config.json</code>,
                    and optional{" "}
                    <code className="studio-mono">share-card.png</code>.
                  </p>
                </div>
                <span className="rounded-full bg-[var(--accent-soft)] px-2 py-0.5 text-[12px] font-medium text-[var(--accent)]">
                  Required
                </span>
              </div>

              <div
                className={cn(
                  "flex flex-wrap items-start justify-between gap-2 rounded-[6px] border px-3 py-2.5 text-[13px]",
                  includeWorkflowFiles
                    ? "border-[var(--accent)] bg-[var(--accent-soft)]"
                    : "border-[var(--border)] bg-[var(--surface)]"
                )}
              >
                <div className="min-w-0 flex-1">
                  <code className="studio-mono font-semibold text-[var(--text)]">
                    workflow
                  </code>
                  <p className="mt-0.5 text-[var(--text-muted)]">
                    Required to push{" "}
                    <code className="studio-mono">
                      .github/workflows/evolve-creature.yml
                    </code>{" "}
                    for the 12:00 AM daily auto-evolve GitHub Action.
                  </p>
                </div>
                <span
                  className={cn(
                    "rounded-full px-2 py-0.5 text-[12px] font-medium",
                    includeWorkflowFiles
                      ? "bg-[var(--accent)] text-[var(--on-accent)]"
                      : "border border-[var(--border)] bg-[var(--surface-2)] text-[var(--text-muted)]"
                  )}
                >
                  {includeWorkflowFiles
                    ? "Required (enabled)"
                    : "If 12 AM action enabled"}
                </span>
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <h3 className="text-[14px] font-semibold text-[var(--text)]">
                Step-by-step classic token creation
              </h3>
              <ol className="flex flex-col gap-2 text-[13px] leading-5 text-[var(--text-muted)]">
                <li className="rounded-[6px] border border-[var(--border)] bg-[var(--surface)] p-3">
                  <strong className="font-medium text-[var(--text)]">
                    1. Open Classic Token Generator:
                  </strong>{" "}
                  Go to GitHub Settings &rarr; Developer settings &rarr;
                  Personal access tokens &rarr; Tokens (classic) &rarr; Generate
                  new token (classic), or use the button below.
                </li>
                <li className="rounded-[6px] border border-[var(--border)] bg-[var(--surface)] p-3">
                  <strong className="font-medium text-[var(--text)]">
                    2. Add a Note:
                  </strong>{" "}
                  Enter a label such as{" "}
                  <code className="studio-mono text-[var(--text)]">
                    dynamic-readme-creature
                  </code>{" "}
                  so you recognize it later.
                </li>
                <li className="rounded-[6px] border border-[var(--border)] bg-[var(--surface)] p-3">
                  <strong className="font-medium text-[var(--text)]">
                    3. Choose Expiration:
                  </strong>{" "}
                  Pick <code className="studio-mono">7 days</code> or{" "}
                  <code className="studio-mono">30 days</code> (recommended; you
                  can revoke anytime).
                </li>
                <li className="rounded-[6px] border border-[var(--border)] bg-[var(--surface)] p-3">
                  <strong className="font-medium text-[var(--text)]">
                    4. Select Scopes:
                  </strong>{" "}
                  Check <strong className="text-[var(--text)]">repo</strong>. If
                  you enabled the{" "}
                  <strong className="text-[var(--text)]">
                    12:00 AM daily auto-evolve GitHub Action
                  </strong>
                  , also check{" "}
                  <strong className="text-[var(--text)]">workflow</strong>.
                </li>
                <li className="rounded-[6px] border border-[var(--border)] bg-[var(--surface)] p-3">
                  <strong className="font-medium text-[var(--text)]">
                    5. Generate &amp; Copy:
                  </strong>{" "}
                  Click Generate token and copy the{" "}
                  <code className="studio-mono">ghp_...</code> token immediately.
                </li>
                <li className="rounded-[6px] border border-[var(--border)] bg-[var(--surface)] p-3">
                  <strong className="font-medium text-[var(--text)]">
                    6. Paste &amp; Push:
                  </strong>{" "}
                  Close this dialog, paste the token, and click Push changes to
                  README.
                </li>
              </ol>
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-2.5 rounded-[8px] border border-[var(--border)] bg-[var(--surface-2)] p-4">
              <div className="flex items-center justify-between gap-2">
                <span className="text-[14px] font-semibold text-[var(--text)]">
                  Fine-grained repository permissions
                </span>
                <span className="studio-mono rounded-full border border-[var(--border)] bg-[var(--surface)] px-2 py-0.5 text-[12px] text-[var(--text-muted)]">
                  github_pat_...
                </span>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-2 rounded-[6px] border border-[var(--border)] bg-[var(--surface)] px-3 py-2.5 text-[13px]">
                <span>
                  <strong className="text-[var(--text)]">Contents</strong> &rarr;{" "}
                  <code className="studio-mono">Read and write</code>
                </span>
                <span className="rounded-full bg-[var(--accent-soft)] px-2 py-0.5 text-[12px] font-medium text-[var(--accent)]">
                  Required
                </span>
              </div>

              <div
                className={cn(
                  "flex flex-wrap items-center justify-between gap-2 rounded-[6px] border px-3 py-2.5 text-[13px]",
                  includeWorkflowFiles
                    ? "border-[var(--accent)] bg-[var(--accent-soft)]"
                    : "border-[var(--border)] bg-[var(--surface)]"
                )}
              >
                <span>
                  <strong className="text-[var(--text)]">Workflows</strong> &rarr;{" "}
                  <code className="studio-mono">Read and write</code>
                </span>
                <span
                  className={cn(
                    "rounded-full px-2 py-0.5 text-[12px] font-medium",
                    includeWorkflowFiles
                      ? "bg-[var(--accent)] text-[var(--on-accent)]"
                      : "border border-[var(--border)] bg-[var(--surface-2)] text-[var(--text-muted)]"
                  )}
                >
                  {includeWorkflowFiles
                    ? "Required (enabled)"
                    : "If 12 AM action enabled"}
                </span>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-2 rounded-[6px] border border-[var(--border)] bg-[var(--surface)] px-3 py-2.5 text-[13px]">
                <span>
                  <strong className="text-[var(--text)]">Metadata</strong> &rarr;{" "}
                  <code className="studio-mono">Read-only</code>
                </span>
                <span className="rounded-full border border-[var(--border)] bg-[var(--surface-2)] px-2 py-0.5 text-[12px] text-[var(--text-muted)]">
                  Auto-selected
                </span>
              </div>
            </div>

            <ol className="flex flex-col gap-2 text-[13px] leading-5 text-[var(--text-muted)]">
              <li className="rounded-[6px] border border-[var(--border)] bg-[var(--surface)] p-3">
                <strong className="font-medium text-[var(--text)]">
                  1. Open Fine-Grained Token Page:
                </strong>{" "}
                Visit{" "}
                <a
                  href={fineGrainedUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="font-medium text-[var(--accent)] underline underline-offset-2"
                >
                  github.com/settings/personal-access-tokens/new
                </a>
                .
              </li>
              <li className="rounded-[6px] border border-[var(--border)] bg-[var(--surface)] p-3">
                <strong className="font-medium text-[var(--text)]">
                  2. Scope Repository Access:
                </strong>{" "}
                Under Repository access, select Only select repositories and
                choose{" "}
                <code className="studio-mono text-[var(--text)]">
                  {safeUser}/{safeUser}
                </code>
                .
              </li>
              <li className="rounded-[6px] border border-[var(--border)] bg-[var(--surface)] p-3">
                <strong className="font-medium text-[var(--text)]">
                  3. Set Permissions &amp; Generate:
                </strong>{" "}
                Grant{" "}
                <strong className="text-[var(--text)]">
                  Contents: Read and write
                </strong>{" "}
                (and{" "}
                <strong className="text-[var(--text)]">
                  Workflows: Read and write
                </strong>{" "}
                when the 12:00 AM Action is enabled), then copy{" "}
                <code className="studio-mono">github_pat_...</code>.
              </li>
            </ol>
          </div>
        )}

        <div className="grid gap-3 sm:grid-cols-2">
          <div className="rounded-[6px] border border-[var(--border)] bg-[var(--surface-2)] p-3.5 text-[13px] leading-5">
            <div className="mb-1 flex items-center gap-1.5 font-semibold text-[var(--text)]">
              <CheckCircle2 className="size-4 text-[var(--accent)]" />
              <span>Optional: PROFILE_PAT secret</span>
            </div>
            <p className="text-[var(--text-muted)]">
              The 12:00 AM GitHub Action works with zero secrets for public
              commits. To count private commits too, add a repository secret
              named <code className="studio-mono">PROFILE_PAT</code> (
              <code className="studio-mono">read:user</code> +{" "}
              <code className="studio-mono">repo</code>) in{" "}
              <a
                href={secretsUrl}
                target="_blank"
                rel="noreferrer"
                className="font-medium text-[var(--accent)] underline underline-offset-2"
              >
                Actions secrets
              </a>
              .
            </p>
          </div>

          <div className="rounded-[6px] border border-[var(--border)] bg-[var(--surface-2)] p-3.5 text-[13px] leading-5">
            <div className="mb-1 flex items-center gap-1.5 font-semibold text-[var(--text)]">
              <Lock className="size-4 text-[var(--accent)]" />
              <span>Privacy &amp; revocation</span>
            </div>
            <p className="text-[var(--text-muted)]">
              Your token stays solely in ephemeral browser memory and is cleared
              after pushing. Manage or revoke tokens anytime in{" "}
              <a
                href="https://github.com/settings/tokens"
                target="_blank"
                rel="noreferrer"
                className="font-medium text-[var(--accent)] underline underline-offset-2"
              >
                GitHub Token Settings
              </a>
              .
            </p>
          </div>
        </div>

        <div className="flex items-start gap-2.5 rounded-[6px] border border-[var(--warning)]/35 bg-[var(--warning-soft)] p-3.5 text-[13px] leading-5 text-[var(--text)]">
          <ShieldAlert className="mt-0.5 size-4 shrink-0 text-[var(--warning)]" />
          <span>
            Never share your Personal Access Token publicly or commit it into{" "}
            <code className="studio-mono">README.md</code> or{" "}
            <code className="studio-mono">creature-config.json</code>.
          </span>
        </div>
      </div>
    </StudioDialog>
  );
}
