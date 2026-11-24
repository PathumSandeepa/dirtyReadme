"use client";

import type { CreatureConfig } from "@/domain/creature/entities";
import { DYNAMIC_TOKENS } from "@/domain/profile/entities";
import { resolveDynamicTokens } from "@/domain/profile/readmeService";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface DynamicValuesListProps {
  creatureConfig: CreatureConfig;
  onInsertToken: (token: string) => void;
}

export function DynamicValuesList({
  creatureConfig,
  onInsertToken,
}: DynamicValuesListProps) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {DYNAMIC_TOKENS.map((item) => {
        const label = item.token.replaceAll("{{", "").replaceAll("}}", "");
        const resolved = resolveDynamicTokens(item.token, creatureConfig);
        return (
          <Tooltip key={item.token}>
            <TooltipTrigger
              render={
                <button
                  type="button"
                  onClick={() => onInsertToken(item.token)}
                  className="studio-mono cursor-pointer rounded-[6px] bg-[var(--surface-2)] px-2 py-1 text-[11px] font-medium text-[var(--tide)] transition-colors duration-150 hover:bg-[var(--surface-3)]"
                />
              }
            >
              {label}
            </TooltipTrigger>
            <TooltipContent
              data-app="studio"
              className="border-0 bg-[var(--text)] text-[var(--bg)] shadow-[var(--shadow-float)]"
            >
              {resolved}
            </TooltipContent>
          </Tooltip>
        );
      })}
    </div>
  );
}
