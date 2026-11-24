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

function resolvePreviewImageSrc(
  rawUrl: string,
  imageUrlMap?: Record<string, string>
): string | null {
  const trimmed = rawUrl.trim();
  if (imageUrlMap) {
    const cleanRel = trimmed.replace(/^\.\//, "");
    const mapped =
      imageUrlMap[trimmed] ?? imageUrlMap[`./${cleanRel}`] ?? imageUrlMap[cleanRel];
    if (mapped) return mapped;
  }
  if (
    /^https?:\/\//i.test(trimmed) ||
    trimmed.startsWith("./") ||
    trimmed.startsWith("/")
  ) {
    return trimmed;
  }
  return null;
}

function parseAttr(attrText: string, name: string): string {
  const match = attrText.match(new RegExp(`${name}=["']([^"']*)["']`, "i"));
  return match?.[1] ?? "";
}

function renderMarkdownOnlyInline(
  text: string,
  keyPrefix: string,
  imageUrlMap?: Record<string, string>
): React.ReactNode[] {
  const nodes: React.ReactNode[] = [];
  const tokenRegex =
    /(!\[[^\]]*\]\([^)]+\)|\[[^\]]+\]\([^)]+\)|`[^`]+`|\*\*[^*]+\*\*|~~[^~]+~~|\*[^*]+\*)/g;
  let lastIndex = 0;
  let match: RegExpExecArray | null;
  let idx = 0;

  while ((match = tokenRegex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      nodes.push(text.slice(lastIndex, match.index));
    }
    const token = match[0];
    const k = `${keyPrefix}-${idx++}`;

    if (token.startsWith("![")) {
      const imgMatch = token.match(/^!\[([^\]]*)\]\(([^)]+)\)$/);
      const safeSrc = imgMatch
        ? resolvePreviewImageSrc(imgMatch[2], imageUrlMap)
        : null;
      if (imgMatch && safeSrc) {
        nodes.push(
          <img
            key={k}
            src={safeSrc}
            alt={imgMatch[1]}
            className="my-1 mr-1 inline-block align-middle"
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
            key={k}
            href={sanitizeHref(linkMatch[2])}
            target="_blank"
            rel="noreferrer"
          >
            {renderInlineMarkdown(linkMatch[1], imageUrlMap)}
          </a>
        );
      } else {
        nodes.push(token);
      }
    } else if (token.startsWith("`") && token.endsWith("`")) {
      nodes.push(<code key={k}>{token.slice(1, -1)}</code>);
    } else if (token.startsWith("**") && token.endsWith("**")) {
      nodes.push(
        <strong key={k}>{renderInlineMarkdown(token.slice(2, -2), imageUrlMap)}</strong>
      );
    } else if (token.startsWith("~~") && token.endsWith("~~")) {
      nodes.push(
        <del key={k}>{renderInlineMarkdown(token.slice(2, -2), imageUrlMap)}</del>
      );
    } else if (token.startsWith("*") && token.endsWith("*")) {
      nodes.push(
        <em key={k}>{renderInlineMarkdown(token.slice(1, -1), imageUrlMap)}</em>
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

export function renderInlineMarkdown(
  text: string,
  imageUrlMap?: Record<string, string>
): React.ReactNode[] {
  const nodes: React.ReactNode[] = [];
  const htmlRegex =
    /(<br\s*\/?>|<img\b[^>]*\/?>|<a\b([^>]*)>([\s\S]*?)<\/a>|<(strong|b|em|i|u|ins|del|s|code)>([\s\S]*?)<\/\4>)/gi;
  let lastIndex = 0;
  let match: RegExpExecArray | null;
  let key = 0;

  while ((match = htmlRegex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      nodes.push(
        ...renderMarkdownOnlyInline(
          text.slice(lastIndex, match.index),
          `md-${key++}`,
          imageUrlMap
        )
      );
    }
    const full = match[0];
    const k = `html-${key++}`;

    if (/^<br/i.test(full)) {
      nodes.push(<br key={k} />);
    } else if (/^<img/i.test(full)) {
      const safeSrc = resolvePreviewImageSrc(parseAttr(full, "src"), imageUrlMap);
      const alt = parseAttr(full, "alt");
      if (safeSrc) {
        nodes.push(
          <img
            key={k}
            src={safeSrc}
            alt={alt}
            className="my-1 mr-1 inline-block align-middle"
          />
        );
      }
    } else if (/^<a\b/i.test(full)) {
      const attrs = match[2] || "";
      const inner = match[3] || "";
      nodes.push(
        <a
          key={k}
          href={sanitizeHref(parseAttr(attrs, "href"))}
          target="_blank"
          rel="noreferrer"
        >
          {renderInlineMarkdown(inner, imageUrlMap)}
        </a>
      );
    } else {
      const tag = (match[4] || "").toLowerCase();
      const inner = match[5] || "";
      if (tag === "strong" || tag === "b") {
        nodes.push(
          <strong key={k}>{renderInlineMarkdown(inner, imageUrlMap)}</strong>
        );
      } else if (tag === "em" || tag === "i") {
        nodes.push(
          <em key={k}>{renderInlineMarkdown(inner, imageUrlMap)}</em>
        );
      } else if (tag === "u" || tag === "ins") {
        nodes.push(<u key={k}>{renderInlineMarkdown(inner, imageUrlMap)}</u>);
      } else if (tag === "del" || tag === "s") {
        nodes.push(
          <del key={k}>{renderInlineMarkdown(inner, imageUrlMap)}</del>
        );
      } else if (tag === "code") {
        nodes.push(<code key={k}>{inner}</code>);
      }
    }

    lastIndex = match.index + full.length;
  }

  if (lastIndex < text.length) {
    nodes.push(
      ...renderMarkdownOnlyInline(
        text.slice(lastIndex),
        `md-${key++}`,
        imageUrlMap
      )
    );
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

function getAlignStyle(align?: string): React.CSSProperties | undefined {
  const clean = align?.toLowerCase();
  if (clean === "center") return { textAlign: "center" };
  if (clean === "right") return { textAlign: "right" };
  if (clean === "left") return { textAlign: "left" };
  return undefined;
}

export function AdvancedMarkdownPreview({
  markdown,
  isDark,
  imageUrlMap,
}: {
  markdown: string;
  isDark: boolean;
  imageUrlMap?: Record<string, string>;
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
          data-type={hasCheckboxes ? "taskList" : undefined}
        >
          {ulItems.map((item, idx) =>
            item.checked !== null ? (
              <li key={idx}>
                <label>
                  <span
                    aria-hidden="true"
                    className="inline-flex size-4 items-center justify-center rounded-[3px] border"
                    style={{
                      borderColor: item.checked
                        ? "var(--gh-link)"
                        : "var(--gh-border)",
                      backgroundColor: item.checked
                        ? "var(--gh-link)"
                        : "var(--gh-bg)",
                      color: "#FFFFFF",
                    }}
                  >
                    {item.checked && <Check className="size-3 stroke-[3]" />}
                  </span>
                </label>
                <div style={{ opacity: item.checked ? 0.85 : 1 }}>
                  {renderInlineMarkdown(item.text, imageUrlMap)}
                </div>
              </li>
            ) : (
              <li key={idx}>{renderInlineMarkdown(item.text, imageUrlMap)}</li>
            )
          )}
        </ul>
      );
      ulItems = [];
    }

    if (olItems.length > 0) {
      blocks.push(
        <ol key={key++}>
          {olItems.map((item, idx) => (
            <li key={idx}>{renderInlineMarkdown(item, imageUrlMap)}</li>
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
        <pre key={key++} data-lang={lang || undefined}>
          <code>{codeLines.join("\n")}</code>
        </pre>
      );
      i = j;
      continue;
    }

    // HTML Heading (<h1..4 align="left|center|right">...</h1..4>)
    const htmlHeading = trimmed.match(
      /^<h([1-4])(?:\s+[^>]*align=["'](left|center|right)["'][^>]*)?>([\s\S]*)<\/h\1>$/i
    );
    if (htmlHeading) {
      flushLists();
      const lvl = htmlHeading[1];
      const alignStyle = getAlignStyle(htmlHeading[2]);
      const content = htmlHeading[3].trim();
      if (lvl === "1") {
        blocks.push(
          <h1 key={key++} style={alignStyle}>
            {renderInlineMarkdown(content, imageUrlMap)}
          </h1>
        );
      } else if (lvl === "2") {
        blocks.push(
          <h2 key={key++} style={alignStyle}>
            {renderInlineMarkdown(content, imageUrlMap)}
          </h2>
        );
      } else if (lvl === "3") {
        blocks.push(
          <h3 key={key++} style={alignStyle}>
            {renderInlineMarkdown(content, imageUrlMap)}
          </h3>
        );
      } else {
        blocks.push(
          <h4 key={key++} style={alignStyle}>
            {renderInlineMarkdown(content, imageUrlMap)}
          </h4>
        );
      }
      continue;
    }

    // Aligned HTML paragraph (<p align="left|center|right">...</p>)
    const paraSingle = trimmed.match(
      /^<p(?:\s+[^>]*align=["'](left|center|right)["'][^>]*)?>([\s\S]*)<\/p>$/i
    );
    if (paraSingle) {
      flushLists();
      blocks.push(
        <p key={key++} style={getAlignStyle(paraSingle[1])}>
          {renderInlineMarkdown(paraSingle[2].trim(), imageUrlMap)}
        </p>
      );
      continue;
    }

    const paraStart = trimmed.match(
      /^<p(?:\s+[^>]*align=["'](left|center|right)["'][^>]*)?>$/i
    );
    if (paraStart) {
      flushLists();
      const alignStyle = getAlignStyle(paraStart[1]);
      const innerLines: string[] = [];
      let j = i + 1;
      while (j < lines.length && !/<\/p>/i.test(lines[j])) {
        innerLines.push(lines[j].trim());
        j++;
      }
      const nonEmptyLines = innerLines.filter(Boolean);
      blocks.push(
        <p key={key++} style={alignStyle}>
          {nonEmptyLines.map((lineText, idx) => (
            <React.Fragment key={idx}>
              {idx > 0 && " "}
              {renderInlineMarkdown(lineText, imageUrlMap)}
            </React.Fragment>
          ))}
        </p>
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
        <table key={key++}>
          <thead>
            <tr>
              {headers.map((h, hIdx) => (
                <th key={hIdx}>{renderInlineMarkdown(h, imageUrlMap)}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {bodyRows.map((cells, rIdx) => (
              <tr key={rIdx}>
                {headers.map((_, cIdx) => (
                  <td key={cIdx}>
                    {renderInlineMarkdown(cells[cIdx] ?? "", imageUrlMap)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
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
      blocks.push(<hr key={key++} />);
    } else if (trimmed.startsWith("# ")) {
      blocks.push(
        <h1 key={key++}>{renderInlineMarkdown(trimmed.slice(2), imageUrlMap)}</h1>
      );
    } else if (trimmed.startsWith("## ")) {
      blocks.push(
        <h2 key={key++}>{renderInlineMarkdown(trimmed.slice(3), imageUrlMap)}</h2>
      );
    } else if (trimmed.startsWith("### ")) {
      blocks.push(
        <h3 key={key++}>{renderInlineMarkdown(trimmed.slice(4), imageUrlMap)}</h3>
      );
    } else if (trimmed.startsWith("#### ")) {
      blocks.push(
        <h4 key={key++}>{renderInlineMarkdown(trimmed.slice(5), imageUrlMap)}</h4>
      );
    } else if (trimmed.startsWith(">")) {
      const quoteLines: string[] = [trimmed.replace(/^>\s?/, "")];
      let j = i + 1;
      while (j < lines.length && lines[j].trim().startsWith(">")) {
        quoteLines.push(lines[j].trim().replace(/^>\s?/, ""));
        j++;
      }
      blocks.push(
        <blockquote key={key++}>
          {quoteLines.map((ql, qIdx) => (
            <p key={qIdx}>{renderInlineMarkdown(ql, imageUrlMap)}</p>
          ))}
        </blockquote>
      );
      i = j - 1;
    } else {
      blocks.push(
        <p key={key++}>{renderInlineMarkdown(trimmed, imageUrlMap)}</p>
      );
    }
  }

  flushLists();
  return (
    <div
      data-gh-theme={isDark ? "dark" : "light"}
      className="gh-markdown-body text-left"
    >
      {blocks}
    </div>
  );
}
