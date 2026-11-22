"use client";

import { FolderGit2 } from "lucide-react";

/** Single-row open-source footer shared by Studio workflow pages. */
export function StudioFooter() {
  return (
    <footer className="border-t border-[var(--border)] bg-[var(--surface)]">
      <div className="mx-auto flex max-w-[1120px] flex-wrap items-center justify-between gap-3 px-4 py-4 text-[13px] text-[var(--text-muted)] sm:px-6">
        <span>
          <strong className="font-medium text-[var(--text)]">
            dynamic-creature
          </strong>
          , an open source project by PathumSandeepa
        </span>

        <div className="flex items-center gap-4">
          <a
            href="https://github.com/PathumSandeepa/dynamic-readme-creature"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 rounded-[6px] py-0.5 text-[var(--text-muted)] transition-colors duration-150 hover:text-[var(--text)]"
          >
            <FolderGit2 className="size-3.5" />
            <span>Repository</span>
          </a>
          <a
            href="https://github.com/PathumSandeepa"
            target="_blank"
            rel="noreferrer"
            className="rounded-[6px] py-0.5 text-[var(--text-muted)] transition-colors duration-150 hover:text-[var(--text)]"
          >
            github.com/PathumSandeepa
          </a>
        </div>
      </div>
    </footer>
  );
}
