"use client";

import { FolderGit2 } from "lucide-react";
import { BRAND } from "@/config/brand";
import { BrandLockup } from "../ui/BrandLockup";

/** Single-row open-source footer shared across Studio pages. */
export function StudioFooter() {
  return (
    <footer className="bg-[var(--surface)]">
      <div className="mx-auto flex max-w-[1200px] flex-wrap items-center justify-between gap-3 px-4 py-4 text-[13px] text-[var(--text-2)] sm:px-6">
        <span className="inline-flex flex-wrap items-center gap-1.5">
          <BrandLockup size="sm" variant="studio" />
          <span>Open source by {BRAND.authorName}.</span>
        </span>

        <div className="flex items-center gap-4">
          <a
            href={BRAND.repoUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 rounded-[8px] py-0.5 text-[var(--text-2)] transition-colors duration-150 hover:text-[var(--text)]"
          >
            <FolderGit2 className="size-3.5" />
            <span>Repository</span>
          </a>
          <a
            href={BRAND.authorUrl}
            target="_blank"
            rel="noreferrer"
            className="rounded-[8px] py-0.5 text-[var(--text-2)] transition-colors duration-150 hover:text-[var(--text)]"
          >
            {BRAND.authorHandle}
          </a>
        </div>
      </div>
    </footer>
  );
}
