"use client";

import { useState } from "react";
import { ArrowLeft, ArrowRight, RefreshCw, ShieldCheck } from "lucide-react";
import { parseGitHubUsername } from "@/infrastructure/github/githubClient";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";

interface UsernameEntryScreenProps {
  initialInput: string;
  loading: boolean;
  onBack: () => void;
  onNext: (rawInput: string) => Promise<void>;
}

export function UsernameEntryScreen({
  initialInput,
  loading,
  onBack,
  onNext,
}: UsernameEntryScreenProps) {
  const [inputValue, setInputValue] = useState(
    initialInput === "your-username" ? "" : initialInput
  );
  const [validationError, setValidationError] = useState<string | null>(null);

  const parsedPreview = parseGitHubUsername(inputValue);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!parsedPreview) {
      setValidationError(
        "Enter a GitHub username or URL such as octocat or https://github.com/octocat."
      );
      return;
    }
    setValidationError(null);
    await onNext(inputValue);
  };

  return (
    <div className="mx-auto flex min-h-[calc(100vh-185px)] w-full max-w-md flex-col justify-center py-8 sm:py-12">
      <form onSubmit={handleSubmit} className="flex flex-col gap-6">
        <div className="flex flex-col gap-2">
          <Badge variant="secondary" className="w-fit font-mono text-[10px]">
            STEP 1 OF 4 · SYNC PROFILE
          </Badge>
          <h1 className="font-mono text-2xl font-bold tracking-tight text-foreground">
            Connect Your GitHub Profile
          </h1>
          <p className="text-sm leading-relaxed text-muted-foreground">
            Loads public language weights, annual/all-time commit counts, and any
            existing Dynamic Creature setup from your profile repo.
          </p>
        </div>

        <FieldGroup>
          <Field data-invalid={validationError ? true : undefined}>
            <FieldLabel
              htmlFor="github-username-input"
              className="font-mono text-xs"
            >
              GitHub Username or Profile URL
            </FieldLabel>
            <Input
              id="github-username-input"
              autoFocus
              value={inputValue}
              aria-invalid={Boolean(validationError)}
              onChange={(e) => {
                setInputValue(e.target.value);
                if (validationError) setValidationError(null);
              }}
              placeholder="octocat or https://github.com/octocat"
              className="h-10 font-mono"
            />
            {parsedPreview && !validationError && (
              <FieldDescription className="font-mono text-xs">
                Target repository: {parsedPreview}/{parsedPreview}
              </FieldDescription>
            )}
            {validationError && (
              <FieldDescription className="text-xs text-destructive">
                {validationError}
              </FieldDescription>
            )}
          </Field>
        </FieldGroup>

        <div className="flex items-center justify-between gap-3">
          <Button
            type="button"
            variant="ghost"
            onClick={onBack}
            disabled={loading}
          >
            <ArrowLeft data-icon="inline-start" />
            Back
          </Button>

          <Button type="submit" disabled={loading}>
            {loading ? (
              <>
                <RefreshCw data-icon="inline-start" className="animate-spin" />
                Loading...
              </>
            ) : (
              <>
                Continue
                <ArrowRight data-icon="inline-end" />
              </>
            )}
          </Button>
        </div>

        <Separator />

        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <ShieldCheck className="size-4 shrink-0 text-primary" />
          <span>100% browser-side. Read-only lookup via public GitHub API.</span>
        </div>
      </form>
    </div>
  );
}
