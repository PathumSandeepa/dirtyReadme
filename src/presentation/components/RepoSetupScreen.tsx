"use client";

import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  ExternalLink,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

interface RepoSetupScreenProps {
  username: string;
  profileRepoExists: boolean;
  onBack: () => void;
  onNext: () => void;
}

export function RepoSetupScreen({
  username,
  profileRepoExists,
  onBack,
  onNext,
}: RepoSetupScreenProps) {
  const safeUsername = username.trim() || "your-username";

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-7 py-6 sm:py-10">
      <div className="flex flex-col gap-2">
        <Badge variant="secondary" className="w-fit font-mono text-[10px]">
          STEP 2 OF 4 · PROFILE REPOSITORY
        </Badge>
        <h1 className="font-mono text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
          Create Your Public Profile Repository
        </h1>
        <p className="text-sm leading-relaxed text-muted-foreground">
          GitHub displays a profile README when a public repository matches your
          exact username.
        </p>

        {profileRepoExists && (
          <div className="mt-2 flex items-center gap-2 rounded-lg bg-muted/60 px-3.5 py-2.5 text-xs text-foreground">
            <CheckCircle2 className="size-4 shrink-0 text-primary" />
            <span>
              Repository{" "}
              <code className="font-mono font-semibold">
                {safeUsername}/{safeUsername}
              </code>{" "}
              detected. Make sure its visibility is Public, then continue below.
            </span>
          </div>
        )}
      </div>

      <Separator />

      <ol className="flex flex-col divide-y divide-border/70">
        <li className="flex flex-wrap items-center justify-between gap-4 py-5 first:pt-1">
          <div className="flex items-start gap-3.5">
            <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-muted font-mono text-xs font-semibold text-foreground">
              1
            </span>
            <div className="flex flex-col gap-1">
              <span className="font-mono text-sm font-semibold text-foreground">
                Open github.com/new
              </span>
              <span className="text-xs text-muted-foreground">
                Ensure you are signed in to your @{safeUsername} account.
              </span>
            </div>
          </div>

          <Button
            variant="secondary"
            size="sm"
            nativeButton={false}
            render={
              <a
                href="https://github.com/new"
                target="_blank"
                rel="noreferrer"
              />
            }
          >
            Open GitHub New Repo
            <ExternalLink data-icon="inline-end" />
          </Button>
        </li>

        <li className="flex items-start gap-3.5 py-5">
          <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-muted font-mono text-xs font-semibold text-foreground">
            2
          </span>
          <div className="flex min-w-0 flex-1 flex-col gap-2">
            <span className="font-mono text-sm font-semibold text-foreground">
              Set repository name to match your username
            </span>
            <div className="w-fit rounded-lg bg-muted/60 px-3.5 py-2 font-mono text-sm">
              <span className="text-muted-foreground">{safeUsername} / </span>
              <span className="font-semibold text-primary">{safeUsername}</span>
            </div>
            <span className="text-xs text-muted-foreground">
              GitHub shows a special banner confirming this repository powers
              your public profile README.
            </span>
          </div>
        </li>

        <li className="flex items-start gap-3.5 py-5 last:pb-1">
          <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-muted font-mono text-xs font-semibold text-foreground">
            3
          </span>
          <div className="flex flex-col gap-1">
            <span className="font-mono text-sm font-semibold text-foreground">
              Select Public &amp; check &ldquo;Add a README file&rdquo;
            </span>
            <span className="text-xs text-muted-foreground">
              Create the repository on GitHub, then open the studio to customize
              your creature and README.
            </span>
          </div>
        </li>
      </ol>

      <Separator />

      <div className="flex flex-wrap items-center justify-between gap-3">
        <Button type="button" variant="ghost" onClick={onBack}>
          <ArrowLeft data-icon="inline-start" />
          Back
        </Button>
        <Button type="button" onClick={onNext}>
          Customize Creature &amp; README
          <ArrowRight data-icon="inline-end" />
        </Button>
      </div>
    </div>
  );
}
