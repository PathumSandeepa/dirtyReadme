"use client";

import { useState } from "react";
import {
  BookOpen,
  CheckCircle2,
  ExternalLink,
  KeyRound,
  Lock,
  ShieldAlert,
  ShieldCheck,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

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

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="flex max-h-[88vh] flex-col sm:max-w-2xl">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <BookOpen className="size-4 text-primary" />
            <DialogTitle className="font-mono">
              How to Create a GitHub Token &amp; Required Permissions
            </DialogTitle>
          </div>
          <DialogDescription>
            Follow these steps to generate a Classic or Fine-Grained Personal
            Access Token to publish to{" "}
            <code>
              {safeUser}/{safeUser}
            </code>
            .
          </DialogDescription>
        </DialogHeader>

        <div className="min-h-0 flex-1 space-y-4 overflow-y-auto pr-1">
          <Tabs
            value={tokenTab}
            onValueChange={(val) =>
              setTokenTab(val as "classic" | "fine-grained")
            }
          >
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="classic" className="gap-1.5 font-mono text-xs">
                <KeyRound className="size-3.5" />
                Classic Token (ghp_...)
              </TabsTrigger>
              <TabsTrigger
                value="fine-grained"
                className="gap-1.5 font-mono text-xs"
              >
                <ShieldCheck className="size-3.5" />
                Fine-Grained (github_pat_...)
              </TabsTrigger>
            </TabsList>

            <TabsContent value="classic" className="mt-3 space-y-4">
              <div className="rounded-lg border bg-muted/40 p-3.5">
                <div className="mb-2 flex items-center justify-between gap-2">
                  <span className="font-mono text-xs font-semibold text-foreground">
                    Required Classic PAT Scopes
                  </span>
                  <Badge variant="secondary" className="font-mono text-[10px]">
                    ghp_...
                  </Badge>
                </div>
                <div className="space-y-2 text-xs">
                  <div className="flex flex-wrap items-start justify-between gap-2 rounded-md border bg-card px-3 py-2">
                    <div>
                      <code className="font-mono font-semibold text-foreground">
                        repo
                      </code>
                      <p className="mt-0.5 text-muted-foreground">
                        Allows committing <code>README.md</code>,{" "}
                        <code>creature.webp</code>,{" "}
                        <code>creature-config.json</code>, and optional{" "}
                        <code>share-card.png</code>.
                      </p>
                    </div>
                    <Badge className="font-mono text-[10px]">Required</Badge>
                  </div>

                  <div
                    className={`flex flex-wrap items-start justify-between gap-2 rounded-md border px-3 py-2 ${
                      includeWorkflowFiles
                        ? "border-primary/60 bg-primary/5"
                        : "bg-card"
                    }`}
                  >
                    <div>
                      <code className="font-mono font-semibold text-foreground">
                        workflow
                      </code>
                      <p className="mt-0.5 text-muted-foreground">
                        Required to push{" "}
                        <code>.github/workflows/evolve-creature.yml</code> for the
                        12:00 AM daily auto-evolve GitHub Action.
                      </p>
                    </div>
                    <Badge
                      variant={includeWorkflowFiles ? "default" : "outline"}
                      className="font-mono text-[10px]"
                    >
                      {includeWorkflowFiles
                        ? "Required (Checked)"
                        : "If 12AM Action Enabled"}
                    </Badge>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="font-mono text-xs font-semibold text-foreground">
                  Step-by-Step Classic Token Creation
                </h4>
                <ol className="space-y-2 text-xs text-muted-foreground">
                  <li className="rounded-lg border bg-card p-3">
                    <span className="font-semibold text-foreground">
                      1. Open Classic Token Generator:
                    </span>{" "}
                    Go to{" "}
                    <strong>
                      GitHub Settings &rarr; Developer settings &rarr; Personal
                      access tokens &rarr; Tokens (classic) &rarr; Generate new
                      token (classic)
                    </strong>
                    , or use the direct button below.
                  </li>
                  <li className="rounded-lg border bg-card p-3">
                    <span className="font-semibold text-foreground">
                      2. Add a Note:
                    </span>{" "}
                    Enter a label such as <code>dynamic-readme-creature</code> so
                    you recognize it later.
                  </li>
                  <li className="rounded-lg border bg-card p-3">
                    <span className="font-semibold text-foreground">
                      3. Choose Expiration:
                    </span>{" "}
                    Pick <code>7 days</code> or <code>30 days</code> (recommended
                    for better security; you can revoke anytime).
                  </li>
                  <li className="rounded-lg border bg-card p-3">
                    <span className="font-semibold text-foreground">
                      4. Select Scopes:
                    </span>{" "}
                    Check <strong>repo</strong> (this selects all{" "}
                    <code>repo</code> sub-scopes). If you enabled{" "}
                    <strong>
                      Include 12:00 AM Daily Auto-Evolve GitHub Action
                    </strong>
                    , also check <strong>workflow</strong>.
                  </li>
                  <li className="rounded-lg border bg-card p-3">
                    <span className="font-semibold text-foreground">
                      5. Generate &amp; Copy:
                    </span>{" "}
                    Click <strong>Generate token</strong> at the bottom and copy
                    the <code>ghp_...</code> token right away (GitHub shows it
                    only once).
                  </li>
                  <li className="rounded-lg border bg-card p-3">
                    <span className="font-semibold text-foreground">
                      6. Paste &amp; Push:
                    </span>{" "}
                    Close this guide, paste the token into the PAT field, and
                    click <strong>Push Changes to README</strong>.
                  </li>
                </ol>
              </div>
            </TabsContent>

            <TabsContent value="fine-grained" className="mt-3 space-y-4">
              <div className="rounded-lg border bg-muted/40 p-3.5">
                <div className="mb-2 flex items-center justify-between gap-2">
                  <span className="font-mono text-xs font-semibold text-foreground">
                    Fine-Grained PAT Repository Permissions
                  </span>
                  <Badge variant="secondary" className="font-mono text-[10px]">
                    github_pat_...
                  </Badge>
                </div>
                <div className="space-y-2 text-xs">
                  <div className="flex flex-wrap items-center justify-between gap-2 rounded-md border bg-card px-3 py-2">
                    <span>
                      <strong>Contents</strong> &rarr;{" "}
                      <code>Read and write</code>
                    </span>
                    <Badge className="font-mono text-[10px]">Required</Badge>
                  </div>
                  <div
                    className={`flex flex-wrap items-center justify-between gap-2 rounded-md border px-3 py-2 ${
                      includeWorkflowFiles
                        ? "border-primary/60 bg-primary/5"
                        : "bg-card"
                    }`}
                  >
                    <span>
                      <strong>Workflows</strong> &rarr;{" "}
                      <code>Read and write</code>
                    </span>
                    <Badge
                      variant={includeWorkflowFiles ? "default" : "outline"}
                      className="font-mono text-[10px]"
                    >
                      {includeWorkflowFiles
                        ? "Required (Checked)"
                        : "If 12AM Action Enabled"}
                    </Badge>
                  </div>
                  <div className="flex flex-wrap items-center justify-between gap-2 rounded-md border bg-card px-3 py-2">
                    <span>
                      <strong>Metadata</strong> &rarr; <code>Read-only</code>
                    </span>
                    <Badge variant="secondary" className="font-mono text-[10px]">
                      Auto-selected
                    </Badge>
                  </div>
                </div>
              </div>

              <ol className="space-y-2 text-xs text-muted-foreground">
                <li className="rounded-lg border bg-card p-3">
                  <span className="font-semibold text-foreground">
                    1. Open Fine-Grained Token Page:
                  </span>{" "}
                  Visit{" "}
                  <a
                    href="https://github.com/settings/personal-access-tokens/new"
                    target="_blank"
                    rel="noreferrer"
                    className="font-medium text-primary underline"
                  >
                    github.com/settings/personal-access-tokens/new
                  </a>
                  .
                </li>
                <li className="rounded-lg border bg-card p-3">
                  <span className="font-semibold text-foreground">
                    2. Scope Repository Access:
                  </span>{" "}
                  Under <strong>Repository access</strong>, select{" "}
                  <strong>Only select repositories</strong> and choose{" "}
                  <code>
                    {safeUser}/{safeUser}
                  </code>
                  .
                </li>
                <li className="rounded-lg border bg-card p-3">
                  <span className="font-semibold text-foreground">
                    3. Set Permissions &amp; Generate:
                  </span>{" "}
                  Grant <strong>Contents: Read and write</strong> (and{" "}
                  <strong>Workflows: Read and write</strong> if using the 12:00
                  AM Action), then click <strong>Generate token</strong> and copy{" "}
                  <code>github_pat_...</code>.
                </li>
              </ol>
            </TabsContent>
          </Tabs>

          <Separator />

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-lg border bg-muted/30 p-3 text-xs">
              <div className="mb-1 flex items-center gap-1.5 font-mono font-semibold text-foreground">
                <CheckCircle2 className="size-3.5 text-primary" />
                Optional: PROFILE_PAT Secret
              </div>
              <p className="text-muted-foreground">
                The 12:00 AM GitHub Action works with zero secrets for public
                commits. To count private commits too, add a repository secret
                named <code>PROFILE_PAT</code> (<code>read:user</code> +{" "}
                <code>repo</code>) in{" "}
                <a
                  href={secretsUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="text-primary underline"
                >
                  Actions secrets
                </a>
                .
              </p>
            </div>

            <div className="rounded-lg border bg-muted/30 p-3 text-xs">
              <div className="mb-1 flex items-center gap-1.5 font-mono font-semibold text-foreground">
                <Lock className="size-3.5 text-primary" />
                Privacy &amp; Token Revocation
              </div>
              <p className="text-muted-foreground">
                Your token stays solely in ephemeral browser memory and is
                cleared after pushing. Need to expire or delete it later? Manage
                tokens anytime in{" "}
                <a
                  href="https://github.com/settings/tokens"
                  target="_blank"
                  rel="noreferrer"
                  className="text-primary underline"
                >
                  GitHub Token Settings
                </a>
                .
              </p>
            </div>
          </div>

          <div className="flex items-start gap-2 rounded-lg border border-amber-500/30 bg-amber-500/10 p-3 text-xs text-muted-foreground">
            <ShieldAlert className="mt-0.5 size-4 shrink-0 text-amber-500" />
            <span>
              Never share your Personal Access Token publicly or commit it into{" "}
              <code>README.md</code> or <code>creature-config.json</code>.
            </span>
          </div>
        </div>

        <DialogFooter className="items-center gap-2 sm:justify-between">
          <Button
            variant="outline"
            size="sm"
            render={
              <a
                href={
                  tokenTab === "classic"
                    ? "https://github.com/settings/tokens/new?description=dynamic-readme-creature&scopes=repo,workflow"
                    : "https://github.com/settings/personal-access-tokens/new"
                }
                target="_blank"
                rel="noreferrer"
              />
            }
          >
            {tokenTab === "classic"
              ? "Open Classic Token Page"
              : "Open Fine-Grained PAT Page"}
            <ExternalLink data-icon="inline-end" />
          </Button>
          <Button type="button" onClick={onClose}>
            Done
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
