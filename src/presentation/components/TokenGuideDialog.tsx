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

/**
 * Step by step guide explaining Classic and Fine grained GitHub token creation.
 */
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
      title="How to create a GitHub token"
      description={`Follow these steps to create a Classic or Fine grained Personal Access Token for ${safeUser}/${safeUser}.`}
      maxWidthClass="sm:max-w-2xl"
      footer={
        <div className="flex w-full flex-wrap items-center justify-between gap-2">
          <a
            href={tokenTab === "classic" ? classicUrl : fineGrainedUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex h-9 items-center gap-2 rounded-[8px] bg-[var(--surface-2)] px-3.5 text-[13px] font-medium text-[var(--text)] transition-colors duration-150 hover:bg-[var(--surface-3)]"
          >
            <span>
              {tokenTab === "classic"
                ? "Open classic token page"
                : "Open fine grained token page"}
            </span>
            <ExternalLink className="size-3.5 text-[var(--text-2)]" />
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
            { value: "classic", label: "Classic token (ghp_)" },
            { value: "fine-grained", label: "Fine grained (github_pat_)" },
          ]}
        />

        {tokenTab === "classic" ? (
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-2.5 rounded-[12px] bg-[var(--surface-2)] p-4">
              <div className="flex items-center justify-between gap-2">
                <span className="text-[14px] font-semibold text-[var(--text)]">
                  Required Classic scopes
                </span>
                <span className="studio-mono rounded-full bg-[var(--surface)] px-2.5 py-0.5 text-[12px] text-[var(--text-2)]">
                  ghp_
                </span>
              </div>

              <div className="flex flex-wrap items-start justify-between gap-2 rounded-[8px] bg-[var(--surface)] px-3.5 py-3 text-[13px]">
                <div className="min-w-0 flex-1">
                  <code className="studio-mono font-semibold text-[var(--text)]">
                    repo
                  </code>
                  <p className="mt-0.5 text-[var(--text-2)]">
                    Allows committing{" "}
                    <code className="studio-mono">README.md</code>,{" "}
                    <code className="studio-mono">creature.webp</code>, custom
                    images and{" "}
                    <code className="studio-mono">creature-config.json</code>.
                  </p>
                </div>
                <span className="rounded-full bg-[var(--tide-soft)] px-2.5 py-0.5 text-[12px] font-medium text-[var(--tide)]">
                  Required
                </span>
              </div>

              <div
                className={cn(
                  "flex flex-wrap items-start justify-between gap-2 rounded-[8px] px-3.5 py-3 text-[13px]",
                  includeWorkflowFiles
                    ? "bg-[var(--tide-soft)]"
                    : "bg-[var(--surface)]"
                )}
              >
                <div className="min-w-0 flex-1">
                  <code className="studio-mono font-semibold text-[var(--text)]">
                    workflow
                  </code>
                  <p className="mt-0.5 text-[var(--text-2)]">
                    Needed to push{" "}
                    <code className="studio-mono">
                      .github/workflows/evolve-creature.yml
                    </code>{" "}
                    for the 12:00 AM daily auto evolve GitHub Action.
                  </p>
                </div>
                <span
                  className={cn(
                    "rounded-full px-2.5 py-0.5 text-[12px] font-medium",
                    includeWorkflowFiles
                      ? "bg-[var(--tide)] text-[var(--on-primary)]"
                      : "bg-[var(--surface-2)] text-[var(--text-2)]"
                  )}
                >
                  {includeWorkflowFiles
                    ? "Required now"
                    : "When 12 AM action is on"}
                </span>
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <h3 className="text-[14px] font-semibold text-[var(--text)]">
                Step by step classic token creation
              </h3>
              <ol className="flex flex-col gap-2 text-[13px] leading-5 text-[var(--text-2)]">
                <li className="rounded-[8px] bg-[var(--surface-2)] p-3">
                  <strong className="font-medium text-[var(--text)]">
                    1. Open Classic Token Generator.
                  </strong>{" "}
                  Go to GitHub Settings, Developer settings, Personal access
                  tokens, Tokens (classic), and choose Generate new token.
                </li>
                <li className="rounded-[8px] bg-[var(--surface-2)] p-3">
                  <strong className="font-medium text-[var(--text)]">
                    2. Add a note.
                  </strong>{" "}
                  Enter a label such as{" "}
                  <code className="studio-mono text-[var(--text)]">
                    readmeforge-publish
                  </code>{" "}
                  so you recognize it later.
                </li>
                <li className="rounded-[8px] bg-[var(--surface-2)] p-3">
                  <strong className="font-medium text-[var(--text)]">
                    3. Choose expiration.
                  </strong>{" "}
                  Pick <code className="studio-mono">7 days</code> or{" "}
                  <code className="studio-mono">30 days</code>. You can revoke
                  tokens anytime.
                </li>
                <li className="rounded-[8px] bg-[var(--surface-2)] p-3">
                  <strong className="font-medium text-[var(--text)]">
                    4. Select scopes.
                  </strong>{" "}
                  Check <strong className="text-[var(--text)]">repo</strong>. If
                  you enabled the 12:00 AM daily auto evolve GitHub Action, also
                  check{" "}
                  <strong className="text-[var(--text)]">workflow</strong>.
                </li>
                <li className="rounded-[8px] bg-[var(--surface-2)] p-3">
                  <strong className="font-medium text-[var(--text)]">
                    5. Generate and copy.
                  </strong>{" "}
                  Click Generate token and copy the{" "}
                  <code className="studio-mono">ghp_</code> string right away.
                </li>
                <li className="rounded-[8px] bg-[var(--surface-2)] p-3">
                  <strong className="font-medium text-[var(--text)]">
                    6. Paste and push.
                  </strong>{" "}
                  Close this dialog, paste the token, and click Push to GitHub.
                </li>
              </ol>
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-2.5 rounded-[12px] bg-[var(--surface-2)] p-4">
              <div className="flex items-center justify-between gap-2">
                <span className="text-[14px] font-semibold text-[var(--text)]">
                  Fine grained repository permissions
                </span>
                <span className="studio-mono rounded-full bg-[var(--surface)] px-2.5 py-0.5 text-[12px] text-[var(--text-2)]">
                  github_pat_
                </span>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-2 rounded-[8px] bg-[var(--surface)] px-3.5 py-3 text-[13px]">
                <span>
                  <strong className="text-[var(--text)]">Contents</strong>{" "}
                  <code className="studio-mono text-[var(--text-2)]">
                    Read and write
                  </code>
                </span>
                <span className="rounded-full bg-[var(--tide-soft)] px-2.5 py-0.5 text-[12px] font-medium text-[var(--tide)]">
                  Required
                </span>
              </div>

              <div
                className={cn(
                  "flex flex-wrap items-center justify-between gap-2 rounded-[8px] px-3.5 py-3 text-[13px]",
                  includeWorkflowFiles
                    ? "bg-[var(--tide-soft)]"
                    : "bg-[var(--surface)]"
                )}
              >
                <span>
                  <strong className="text-[var(--text)]">Workflows</strong>{" "}
                  <code className="studio-mono text-[var(--text-2)]">
                    Read and write
                  </code>
                </span>
                <span
                  className={cn(
                    "rounded-full px-2.5 py-0.5 text-[12px] font-medium",
                    includeWorkflowFiles
                      ? "bg-[var(--tide)] text-[var(--on-primary)]"
                      : "bg-[var(--surface-2)] text-[var(--text-2)]"
                  )}
                >
                  {includeWorkflowFiles
                    ? "Required now"
                    : "When 12 AM action is on"}
                </span>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-2 rounded-[8px] bg-[var(--surface)] px-3.5 py-3 text-[13px]">
                <span>
                  <strong className="text-[var(--text)]">Metadata</strong>{" "}
                  <code className="studio-mono text-[var(--text-2)]">
                    Read only
                  </code>
                </span>
                <span className="rounded-full bg-[var(--surface-2)] px-2.5 py-0.5 text-[12px] text-[var(--text-2)]">
                  Auto selected
                </span>
              </div>
            </div>

            <ol className="flex flex-col gap-2 text-[13px] leading-5 text-[var(--text-2)]">
              <li className="rounded-[8px] bg-[var(--surface-2)] p-3">
                <strong className="font-medium text-[var(--text)]">
                  1. Open Fine grained token page.
                </strong>{" "}
                Visit{" "}
                <a
                  href={fineGrainedUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="font-medium text-[var(--tide)] underline underline-offset-2"
                >
                  github.com personal access tokens page
                </a>
                .
              </li>
              <li className="rounded-[8px] bg-[var(--surface-2)] p-3">
                <strong className="font-medium text-[var(--text)]">
                  2. Scope repository access.
                </strong>{" "}
                Under Repository access, pick Only select repositories and choose{" "}
                <code className="studio-mono text-[var(--text)]">
                  {safeUser}/{safeUser}
                </code>
                .
              </li>
              <li className="rounded-[8px] bg-[var(--surface-2)] p-3">
                <strong className="font-medium text-[var(--text)]">
                  3. Set permissions and generate.
                </strong>{" "}
                Grant{" "}
                <strong className="text-[var(--text)]">
                  Contents read and write
                </strong>{" "}
                and{" "}
                <strong className="text-[var(--text)]">
                  Workflows read and write
                </strong>{" "}
                if the 12:00 AM Action is enabled, then copy your{" "}
                <code className="studio-mono">github_pat_</code> token.
              </li>
            </ol>
          </div>
        )}

        <div className="grid gap-3 sm:grid-cols-2">
          <div className="rounded-[10px] bg-[var(--surface-2)] p-3.5 text-[13px] leading-5">
            <div className="mb-1 flex items-center gap-1.5 font-semibold text-[var(--text)]">
              <CheckCircle2 className="size-4 text-[var(--tide)]" />
              <span>Optional PROFILE_PAT secret</span>
            </div>
            <p className="text-[var(--text-2)]">
              The 12:00 AM GitHub Action works with zero secrets for public
              commits. To count private commits too, add a repository secret
              named <code className="studio-mono">PROFILE_PAT</code> with{" "}
              <code className="studio-mono">read:user</code> and{" "}
              <code className="studio-mono">repo</code> in{" "}
              <a
                href={secretsUrl}
                target="_blank"
                rel="noreferrer"
                className="font-medium text-[var(--tide)] underline underline-offset-2"
              >
                Actions secrets
              </a>
              .
            </p>
          </div>

          <div className="rounded-[10px] bg-[var(--surface-2)] p-3.5 text-[13px] leading-5">
            <div className="mb-1 flex items-center gap-1.5 font-semibold text-[var(--text)]">
              <Lock className="size-4 text-[var(--tide)]" />
              <span>Privacy and revocation</span>
            </div>
            <p className="text-[var(--text-2)]">
              Your token stays strictly in browser memory and is cleared right
              after pushing. Manage or revoke tokens anytime in{" "}
              <a
                href="https://github.com/settings/tokens"
                target="_blank"
                rel="noreferrer"
                className="font-medium text-[var(--tide)] underline underline-offset-2"
              >
                GitHub Token Settings
              </a>
              .
            </p>
          </div>
        </div>

        <div className="flex items-start gap-2.5 rounded-[10px] bg-[var(--warning-soft)] p-3.5 text-[13px] leading-5 text-[var(--text)]">
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
