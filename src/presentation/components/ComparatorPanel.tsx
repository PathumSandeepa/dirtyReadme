"use client";

import React, { useState } from "react";
import { AlertCircle, RefreshCw, Users } from "lucide-react";
import type { CreatureConfig } from "@/domain/creature/entities";
import { applyLanguageColors, getEvolutionStage } from "@/domain/creature/services";
import {
  fetchGitHubProfileSnapshot,
  type GitHubProfileSnapshot,
} from "@/infrastructure/github/githubClient";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { CreatureAnimatedView } from "./CreatureAnimatedView";

interface ComparatorPanelProps {
  baseConfig: CreatureConfig;
}

export function ComparatorPanel({ baseConfig }: ComparatorPanelProps) {
  const [leftUser, setLeftUser] = useState(
    baseConfig.username && baseConfig.username !== "your-username"
      ? baseConfig.username
      : "octocat"
  );
  const [rightUser, setRightUser] = useState("torvalds");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [results, setResults] = useState<{
    left: GitHubProfileSnapshot;
    right: GitHubProfileSnapshot;
  } | null>(null);

  const handleCompare = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const [left, right] = await Promise.all([
        fetchGitHubProfileSnapshot(leftUser),
        fetchGitHubProfileSnapshot(rightUser),
      ]);
      setResults({ left, right });
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to compare profiles."
      );
    } finally {
      setLoading(false);
    }
  };

  const buildComparedConfig = (
    snap: GitHubProfileSnapshot
  ): CreatureConfig => {
    const commits =
      baseConfig.windowMode === "annual"
        ? snap.annualCommits
        : snap.rollingCommits;
    const nextBase =
      baseConfig.colorMode === "languages" && snap.languages.length > 0
        ? applyLanguageColors(baseConfig, snap.languages)
        : baseConfig;

    return {
      ...nextBase,
      username: snap.username,
      commits,
      languages:
        snap.languages.length > 0 ? snap.languages : nextBase.languages,
    };
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Users className="size-4 text-primary" />
          <CardTitle className="font-mono">
            Compare Two GitHub Profiles Side-by-Side
          </CardTitle>
        </div>
        <CardDescription>
          Preview how your active pixel creature scales across any two GitHub accounts.
        </CardDescription>
      </CardHeader>

      <CardContent className="flex flex-col gap-5">
        <form
          onSubmit={handleCompare}
          className="grid gap-3 sm:grid-cols-[1fr_1fr_auto]"
        >
          <Input
            type="text"
            value={leftUser}
            onChange={(e) => setLeftUser(e.target.value)}
            placeholder="First GitHub username"
            className="font-mono"
          />
          <Input
            type="text"
            value={rightUser}
            onChange={(e) => setRightUser(e.target.value)}
            placeholder="Second GitHub username"
            className="font-mono"
          />
          <Button type="submit" disabled={loading}>
            <RefreshCw
              data-icon="inline-start"
              className={loading ? "animate-spin" : ""}
            />
            {loading ? "Comparing..." : "Compare"}
          </Button>
        </form>

        {error && (
          <Alert variant="destructive">
            <AlertCircle />
            <AlertDescription className="text-xs">{error}</AlertDescription>
          </Alert>
        )}

        {results && (
          <div className="grid gap-4 md:grid-cols-2">
            {[results.left, results.right].map((snap) => {
              const cfg = buildComparedConfig(snap);
              const stage = getEvolutionStage(cfg.commits);
              return (
                <div
                  key={snap.username}
                  className="overflow-hidden rounded-lg border bg-muted/40"
                >
                  <div className="flex items-center justify-between border-b px-4 py-3">
                    <div>
                      <div className="font-mono text-sm font-semibold text-foreground">
                        @{snap.username}
                      </div>
                      <div className="font-mono text-xs text-muted-foreground">
                        {snap.publicRepos} repos · {snap.totalStars} stars
                      </div>
                    </div>
                    <Badge className="font-mono">
                      Stage {stage.stage} · {stage.rank}
                    </Badge>
                  </div>
                  <div className="bg-[#0d1117] p-3">
                    <CreatureAnimatedView config={cfg} className="w-full" />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
