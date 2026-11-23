"use client";

import type { MouseEvent } from "react";
import { BRAND } from "@/config/brand";
import { useReducedMotion } from "./useReducedMotion";

const PRODUCT_LINKS = [
  { id: "editor", label: "Editor" },
  { id: "templates", label: "Templates" },
  { id: "stack", label: "Stack" },
  { id: "creatures", label: "Creatures" },
  { id: "privacy", label: "Privacy" },
] as const;

const SOURCE_LINKS = [
  { href: BRAND.repoUrl, label: "GitHub" },
  { href: BRAND.issuesUrl, label: "Issues" },
  { href: BRAND.pullsUrl, label: "Pull requests" },
] as const;

const PROJECT_LINKS = [
  { href: BRAND.readmeUrl, label: "README" },
  { href: `${BRAND.repoUrl}/blob/main/LICENSE`, label: "License" },
  { href: BRAND.authorUrl, label: "Author" },
] as const;

export function HomeFooter() {
  const reducedMotion = useReducedMotion();

  const handleAnchorClick = (
    event: MouseEvent<HTMLAnchorElement>,
    id: string
  ) => {
    const target = document.getElementById(id);
    if (!target) return;
    event.preventDefault();
    const top = target.getBoundingClientRect().top + window.scrollY - 96;
    window.scrollTo({
      top: Math.max(0, top),
      behavior: reducedMotion ? "auto" : "smooth",
    });
  };

  return (
    <footer className="relative overflow-hidden border-t border-[var(--home-line)] pt-20">
      <div className="mx-auto max-w-[1200px] px-5 sm:px-8">
        <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <p className="home-display text-[18px] font-extrabold tracking-[-0.03em] text-white">
              {BRAND.name}
            </p>
            <p className="mt-3 max-w-[260px] text-[14px] leading-relaxed text-[var(--home-text-2)]">
              Build, edit and publish a GitHub profile README right in your
              browser.
            </p>
          </div>

          <div>
            <h3 className="home-mono-caption text-[11px] text-[var(--home-text-3)]">
              Product
            </h3>
            <ul className="mt-4 space-y-2.5 text-[14px]">
              {PRODUCT_LINKS.map((item) => (
                <li key={item.id}>
                  <a
                    href={`#${item.id}`}
                    onClick={(event) => handleAnchorClick(event, item.id)}
                    className="text-[var(--home-text-2)] transition-colors hover:text-white"
                  >
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="home-mono-caption text-[11px] text-[var(--home-text-3)]">
              Source
            </h3>
            <ul className="mt-4 space-y-2.5 text-[14px]">
              {SOURCE_LINKS.map((item) => (
                <li key={item.label}>
                  <a
                    href={item.href}
                    target="_blank"
                    rel="noreferrer"
                    className="text-[var(--home-text-2)] transition-colors hover:text-white"
                  >
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="home-mono-caption text-[11px] text-[var(--home-text-3)]">
              Project
            </h3>
            <ul className="mt-4 space-y-2.5 text-[14px]">
              {PROJECT_LINKS.map((item) => (
                <li key={item.label}>
                  <a
                    href={item.href}
                    target="_blank"
                    rel="noreferrer"
                    className="text-[var(--home-text-2)] transition-colors hover:text-white"
                  >
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-16 border-t border-[var(--home-line)] pt-6 text-[13px] text-[var(--home-text-3)]">
          Made by {BRAND.authorName}. Open source.
        </div>
      </div>

      <div
        aria-hidden="true"
        className="mt-6 flex justify-center overflow-hidden px-2"
      >
        <span className="home-footer-wordmark -mb-[0.18em] whitespace-nowrap">
          {BRAND.name}
        </span>
      </div>
    </footer>
  );
}
