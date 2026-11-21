"use client";

import { useState } from "react";
import { ArrowLeft, ArrowRight, Cpu, RefreshCw, ShieldCheck } from "lucide-react";
import { parseGitHubUsername } from "@/infrastructure/github/githubClient";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";

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
    <div className="flex min-h-[calc(100vh-170px)] items-center justify-center px-4 py-10">
      <form onSubmit={handleSubmit} className="w-full max-w-md">
        <Card>
          <CardHeader className="items-center text-center">
            <div className="mb-1 flex size-10 items-center justify-center rounded-lg border bg-muted text-foreground">
              <Cpu className="size-5" />
            </div>
            <CardTitle className="font-mono text-lg">
              Add GitHub Username or URL
            </CardTitle>
            <CardDescription>
              Loads public language stats and commit activity into a fresh template.
            </CardDescription>
          </CardHeader>

          <CardContent>
            <FieldGroup>
              <Field data-invalid={validationError ? true : undefined}>
                <FieldLabel htmlFor="github-username-input" className="font-mono text-xs">
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
                  className="text-center font-mono"
                />
                {parsedPreview && !validationError && (
                  <FieldDescription className="text-center font-mono text-xs">
                    Target repo: {parsedPreview}/{parsedPreview}
                  </FieldDescription>
                )}
                {validationError && (
                  <FieldDescription className="text-center text-xs text-destructive">
                    {validationError}
                  </FieldDescription>
                )}
              </Field>
            </FieldGroup>
          </CardContent>

          <CardFooter className="flex items-center justify-between gap-3">
            <Button
              type="button"
              variant="outline"
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
                  Next
                  <ArrowRight data-icon="inline-end" />
                </>
              )}
            </Button>
          </CardFooter>

          <div className="flex items-center justify-center gap-1.5 border-t px-4 py-3 text-xs text-muted-foreground">
            <ShieldCheck className="size-3.5 text-emerald-500" />
            <span>100% browser-side. Read-only lookup via public GitHub API.</span>
          </div>
        </Card>
      </form>
    </div>
  );
}
