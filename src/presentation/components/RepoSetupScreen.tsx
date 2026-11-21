"use client";

import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  ExternalLink,
  FolderGit2,
} from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

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
    <div className="flex min-h-[calc(100vh-170px)] items-center justify-center px-4 py-10">
      <div className="w-full max-w-2xl">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="flex size-10 shrink-0 items-center justify-center rounded-lg border bg-muted text-foreground">
                <FolderGit2 className="size-5" />
              </div>
              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="font-mono text-[10px]">
                    STEP 2 · INSTRUCTIONS ONLY
                  </Badge>
                </div>
                <CardTitle className="font-mono text-lg">
                  Create Your Public Profile Repository
                </CardTitle>
                <CardDescription>
                  GitHub renders your profile README only when a public repository
                  matches your exact username.
                </CardDescription>
              </div>
            </div>
          </CardHeader>

          <CardContent className="flex flex-col gap-4">
            {profileRepoExists && (
              <Alert>
                <CheckCircle2 />
                <AlertTitle className="font-mono text-xs font-semibold">
                  Repository Already Detected
                </AlertTitle>
                <AlertDescription className="text-xs">
                  <code>{safeUsername}/{safeUsername}</code> already exists. Make sure its
                  visibility is Public, then click Next.
                </AlertDescription>
              </Alert>
            )}

            <ol className="flex flex-col gap-3">
              <li className="flex flex-wrap items-center justify-between gap-3 rounded-lg border bg-muted/40 p-4">
                <div className="flex flex-col gap-1">
                  <span className="font-mono text-sm font-semibold text-foreground">
                    1. Open github.com/new
                  </span>
                  <span className="text-xs text-muted-foreground">
                    Ensure you are signed in to your @{safeUsername} account.
                  </span>
                </div>
                <Button
                  variant="outline"
                  size="sm"
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

              <li className="flex flex-col gap-2 rounded-lg border bg-muted/40 p-4">
                <span className="font-mono text-sm font-semibold text-foreground">
                  2. Set Repository name to match your username
                </span>
                <div className="rounded-md border bg-background px-3 py-2 font-mono text-sm">
                  <span className="text-muted-foreground">{safeUsername} / </span>
                  <span className="font-semibold text-primary">{safeUsername}</span>
                </div>
                <span className="text-xs text-muted-foreground">
                  GitHub displays a special banner confirming this repository powers your
                  public profile README.
                </span>
              </li>

              <li className="flex flex-col gap-1 rounded-lg border bg-muted/40 p-4">
                <span className="font-mono text-sm font-semibold text-foreground">
                  3. Select Public &amp; check &ldquo;Add a README file&rdquo;
                </span>
                <span className="text-xs text-muted-foreground">
                  Click Create repository on GitHub, then click Next below to customize
                  your creature and README.
                </span>
              </li>
            </ol>
          </CardContent>

          <CardFooter className="flex items-center justify-between gap-3 border-t pt-4">
            <Button type="button" variant="outline" onClick={onBack}>
              <ArrowLeft data-icon="inline-start" />
              Back
            </Button>
            <Button type="button" onClick={onNext}>
              Next: Customize Creature &amp; README
              <ArrowRight data-icon="inline-end" />
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
