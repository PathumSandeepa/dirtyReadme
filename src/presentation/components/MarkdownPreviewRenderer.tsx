"use client";

import React from "react";
import { Check } from "lucide-react";

function sanitizeHref(rawUrl: string): string {
  const trimmed = rawUrl.trim();
  if (
    /^https?:\/\//i.test(trimmed) ||
    /^mailto:/i.test(trimmed) ||
    trimmed.startsWith("#") ||
    trimmed.startsWith("/") ||
    trimmed.startsWith("./")
  ) {
    return trimmed;
  }
  return "#";
}

function sanitizeImageSrc(rawUrl: string): string | null {
  const trimmed = rawUrl.trim();
  if (
    /^https?:\/\//i.test(trimmed) ||
    trimmed.startsWith("./") ||
    trimmed.startsWith("/")
  ) {
    return trimmed;
  }
  return null;
}

export function renderInlineMarkdown(text: string): React.ReactNode[] {
  const nodes: React.ReactNode[] = [];
  const tokenRegex =
    /(!\[[^\]]*\]\([^)]+\)|\[[^\]]+\]\([^)]+\)|`[^`]+`|\*\*[^*]+\*\*|~~[^~]+~~|\*[^*]+\*)/g;
  let lastIndex = 0;
  let match: RegExpExecArray | null;
  let key = 0;

  while ((match = tokenRegex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      nodes.push(text.slice(lastIndex, match.index));
    }
    const token = match[0];

    if (token.startsWith("![")) {
      const imgMatch = token.match(/^!\[([^\]]*)\]\(([^)]+)\)$/);
      const safeSrc = imgMatch ? sanitizeImageSrc(imgMatch[2]) : null;
      if (imgMatch && safeSrc) {
        nodes.push(
          <img
            key={key++}
            src={safeSrc}
            alt={imgMatch[1]}
            className="my-1 inline-block max-h-24 rounded align-middle"
          />
        );
      } else {
        nodes.push(token);
      }
    } else if (token.startsWith("[")) {
      const linkMatch = token.match(/^\[([^\]]+)\]\(([^)]+)\)$/);
      if (linkMatch) {
        nodes.push(
          <a
            key={key++}
            href={sanitizeHref(linkMatch[2])}
            target="_blank"
            rel="noreferrer"
            className="text-[#2f81f7] underline"
          >
            {linkMatch[1]}
          </a>
        );
      } else {
        nodes.push(token);
      }
    } else if (token.startsWith("`") && token.endsWith("`")) {
      nodes.push(
        <code
          key={key++}
          className="rounded bg-black/10 px-1.5 py-0.5 font-mono text-xs dark:bg-white/10"
        >
          {token.slice(1, -1)}
        </code>
      );
    } else if (token.startsWith("**") && token.endsWith("**")) {
      nodes.push(
        <strong key={key++} className="font-semibold">
          {token.slice(2, -2)}
        </strong>
      );
    } else if (token.startsWith("~~") && token.endsWith("~~")) {
      nodes.push(
        <del key={key++} className="line-through opacity-75">
          {token.slice(2, -2)}
        </del>
      );
    } else if (token.startsWith("*") && token.endsWith("*")) {
      nodes.push(
        <em key={key++} className="italic">
          {token.slice(1, -1)}
        </em>
      );
    } else {
      nodes.push(token);
    }

    lastIndex = match.index + token.length;
  }

  if (lastIndex < text.length) {
    nodes.push(text.slice(lastIndex));
  }
  return nodes;
}

function splitTableCells(row: string): string[] {
  return row
    .trim()
    .replace(/^\|/, "")
    .replace(/\|$/, "")
    .split("|")
    .map((cell) => cell.trim());
}

function isTableSeparator(line: string): boolean {
  return /^\|?(\s*:?-{3,}:?\s*\|)+(\s*:?-{3,}:?\s*)?\|?$/.test(line.trim());
}

export function AdvancedMarkdownPreview({
  markdown,
  isDark,
}: {
  markdown: string;
  isDark: boolean;
}) {
  const lines = markdown.split(/\r?\n/);
  const blocks: React.ReactNode[] = [];
  let key = 0;

  let ulItems: { text: string; checked: boolean | null }[] = [];
  let olItems: string[] = [];

  const flushLists = () => {
    if (ulItems.length > 0) {
      const hasCheckboxes = ulItems.some((item) => item.checked !== null);
      blocks.push(
        <ul
          key={key++}
          className={`space-y-1 text-left text-sm ${
            hasCheckboxes ? "list-none pl-1" : "list-disc pl-5"
          }`}
        >
          {ulItems.map((item, idx) =>
            item.checked !== null ? (
              <li key={idx} className="flex items-start gap-2">
                <span
                  aria-hidden="true"
                  className={`mt-0.5 inline-flex size-4 shrink-0 items-center justify-center rounded border text-[10px] ${
                    item.checked
                      ? "border-[#2f81f7] bg-[#2f81f7] text-white"
                      : isDark
                        ? "border-[#30363d] bg-[#161b22]"
                        : "border-[#d0d7de] bg-white"
                  }`}
                >
                  {item.checked && <Check className="size-3 stroke-[3]" />}
                </span>
                <span className={item.checked ? "opacity-80" : ""}>
                  {renderInlineMarkdown(item.text)}
                </span>
              </li>
            ) : (
              <li key={idx}>{renderInlineMarkdown(item.text)}</li>
            )
          )}
        </ul>
      );
      ulItems = [];
    }

    if (olItems.length > 0) {
      blocks.push(
        <ol key={key++} className="list-decimal space-y-1 pl-5 text-left text-sm">
          {olItems.map((item, idx) => (
            <li key={idx}>{renderInlineMarkdown(item)}</li>
          ))}
        </ol>
      );
      olItems = [];
    }
  };

  for (let i = 0; i < lines.length; i++) {
    const rawLine = lines[i];
    const trimmed = rawLine.trim();

    if (!trimmed) {
      flushLists();
      continue;
    }

    // Fenced code blocks
    if (trimmed.startsWith("```")) {
      flushLists();
      const lang = trimmed.slice(3).trim();
      const codeLines: string[] = [];
      let j = i + 1;
      while (j < lines.length && !lines[j].trim().startsWith("```")) {
        codeLines.push(lines[j]);
        j++;
      }
      blocks.push(
        <div
          key={key++}
          className={`overflow-x-auto rounded-lg border text-left font-mono text-xs ${
            isDark
              ? "border-[#30363d] bg-[#161b22] text-[#e6edf3]"
              : "border-[#d0d7de] bg-[#f6f8fa] text-[#1f2328]"
          }`}
        >
          {lang && (
            <div
              className={`border-b px-3 py-1 text-[10px] uppercase tracking-wider opacity-70 ${
                isDark ? "border-[#30363d]" : "border-[#d0d7de]"
              }`}
            >
              {lang}
            </div>
          )}
          <pre className="p-3 leading-relaxed">
            <code>{codeLines.join("\n")}</code>
          </pre>
        </div>
      );
      i = j;
      continue;
    }

    // Center-aligned HTML block (<p align="center">...</p>)
    const centerBlockStart = trimmed.match(/^<p\s+align=["']center["']>$/i);
    const centerSingleLine = trimmed.match(
      /^<p\s+align=["']center["']>([\s\S]*)<\/p>$/i
    );
    if (centerSingleLine) {
      flushLists();
      blocks.push(
        <div key={key++} className="text-center text-sm leading-relaxed">
          {renderInlineMarkdown(centerSingleLine[1].trim())}
        </div>
      );
      continue;
    }
    if (centerBlockStart) {
      flushLists();
      const innerLines: string[] = [];
      let j = i + 1;
      while (j < lines.length && !/<\/p>/i.test(lines[j])) {
        innerLines.push(lines[j].trim());
        j++;
      }
      blocks.push(
        <div key={key++} className="space-y-1 text-center text-sm leading-relaxed">
          {innerLines
            .filter(Boolean)
            .map((lineText, idx) => (
              <p key={idx}>{renderInlineMarkdown(lineText)}</p>
            ))}
        </div>
      );
      i = j;
      continue;
    }

    // GFM Markdown table
    if (
      trimmed.includes("|") &&
      i + 1 < lines.length &&
      isTableSeparator(lines[i + 1])
    ) {
      flushLists();
      const headers = splitTableCells(trimmed);
      const bodyRows: string[][] = [];
      let j = i + 2;
      while (j < lines.length && lines[j].trim().includes("|")) {
        bodyRows.push(splitTableCells(lines[j]));
        j++;
      }
      blocks.push(
        <div
          key={key++}
          className={`overflow-x-auto rounded-lg border text-left text-xs ${
            isDark ? "border-[#30363d]" : "border-[#d0d7de]"
          }`}
        >
          <table className="w-full border-collapse">
            <thead>
              <tr className={isDark ? "bg-[#161b22]" : "bg-[#f6f8fa]"}>
                {headers.map((h, hIdx) => (
                  <th
                    key={hIdx}
                    className={`border-b px-3 py-2 font-semibold ${
                      isDark ? "border-[#30363d]" : "border-[#d0d7de]"
                    }`}
                  >
                    {renderInlineMarkdown(h)}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody
              className={`divide-y ${
                isDark ? "divide-[#30363d]" : "divide-[#d0d7de]"
              }`}
            >
              {bodyRows.map((cells, rIdx) => (
                <tr key={rIdx}>
                  {headers.map((_, cIdx) => (
                    <td key={cIdx} className="px-3 py-1.5">
                      {renderInlineMarkdown(cells[cIdx] ?? "")}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
      i = j - 1;
      continue;
    }

    // Checklists & unordered lists
    const checkMatch = trimmed.match(/^[-*]\s+\[([ xX])\]\s+(.*)$/);
    if (checkMatch) {
      if (olItems.length > 0) flushLists();
      ulItems.push({
        text: checkMatch[2],
        checked: checkMatch[1].toLowerCase() === "x",
      });
      continue;
    }
    if (/^[-*]\s+/.test(trimmed)) {
      if (olItems.length > 0) flushLists();
      ulItems.push({ text: trimmed.replace(/^[-*]\s+/, ""), checked: null });
      continue;
    }

    // Numbered lists
    if (/^\d+\.\s+/.test(trimmed)) {
      if (ulItems.length > 0) flushLists();
      olItems.push(trimmed.replace(/^\d+\.\s+/, ""));
      continue;
    }

    flushLists();

    if (/^(---+|\*\*\*+)$/.test(trimmed)) {
      blocks.push(
        <hr
          key={key++}
          className={isDark ? "border-[#30363d]" : "border-[#d0d7de]"}
        />
      );
    } else if (trimmed.startsWith("# ")) {
      blocks.push(
        <h1
          key={key++}
          className={`border-b pb-2 text-2xl font-bold ${
            isDark ? "border-[#30363d]" : "border-[#d0d7de]"
          }`}
        >
          {renderInlineMarkdown(trimmed.slice(2))}
        </h1>
      );
    } else if (trimmed.startsWith("## ")) {
      blocks.push(
        <h2
          key={key++}
          className={`border-b pb-2 text-xl font-semibold ${
            isDark ? "border-[#30363d]" : "border-[#d0d7de]"
          }`}
        >
          {renderInlineMarkdown(trimmed.slice(3))}
        </h2>
      );
    } else if (trimmed.startsWith("### ")) {
      blocks.push(
        <h3 key={key++} className="text-base font-semibold">
          {renderInlineMarkdown(trimmed.slice(4))}
        </h3>
      );
    } else if (trimmed.startsWith("#### ")) {
      blocks.push(
        <h4 key={key++} className="text-sm font-semibold">
          {renderInlineMarkdown(trimmed.slice(5))}
        </h4>
      );
    } else if (trimmed.startsWith("> ")) {
      blocks.push(
        <blockquote
          key={key++}
          className={`border-l-2 pl-3 text-left text-sm opacity-85 ${
            isDark ? "border-[#30363d]" : "border-[#d0d7de]"
          }`}
        >
          {renderInlineMarkdown(trimmed.slice(2))}
        </blockquote>
      );
    } else {
      blocks.push(
        <p key={key++} className="text-sm leading-relaxed opacity-95">
          {renderInlineMarkdown(trimmed)}
        </p>
      );
    }
  }

  flushLists();
  return <div className="flex flex-col gap-2.5">{blocks}</div>;
}
