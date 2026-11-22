import type { JSONContent } from "@tiptap/react";

export interface EditorTemplateItem {
  id: string;
  name: string;
  category: string;
  description: string;
  markdown: string;
}

export const PROFILE_EDITOR_TEMPLATES: EditorTemplateItem[] = [
  {
    id: "clean-dev",
    name: "Clean Developer Intro",
    category: "Balanced",
    description: "Clean heading without divider, role tagline, intro bio & 3 bullets",
    markdown: [
      "### Hi there, I'm @{{USERNAME}} 👋",
      "",
      "**FULL-STACK DEVELOPER | SYSTEMS ARCHITECTURE | OPEN SOURCE**",
      "",
      "I build fast, reliable software with `{{LANGUAGES}}` and share open-source tools on GitHub. Currently evolving my Stage {{STAGE}} **{{CREATURE}}** (`{{COMMITS}}` contributions).",
      "",
      "- 🔭 Building scalable web applications and developer tooling",
      "- ⚡ Interested in clean architecture, UI craft, and automation",
      "- 📫 Connect with me through the links below",
    ].join("\n"),
  },
  {
    id: "centered-hero",
    name: "Centered Hero Banner",
    category: "Centered",
    description: "Centered title, subtitle tagline & crisp hero summary",
    markdown: [
      '<h3 align="center">Hi there, I\'m @{{USERNAME}} 👋</h3>',
      "",
      '<p align="center">',
      "  <strong>SOFTWARE ENGINEER · OPEN-SOURCE BUILDER · UI CRAFTSMAN</strong>",
      "</p>",
      "",
      '<p align="center">',
      "  Crafting resilient web apps, developer tools, and automated workflows with <code>{{LANGUAGES}}</code>.",
      "</p>",
      "",
      "---",
      "",
      '<p align="center">',
      "  Stage {{STAGE}} <strong>{{CREATURE}}</strong> · Rank: <strong>{{RANK}}</strong> · <code>{{COMMITS}}</code> contributions",
      "</p>",
    ].join("\n"),
  },
  {
    id: "fullstack-eng",
    name: "Full-Stack Engineer",
    category: "Engineering",
    description: "Clear engineering stack overview with core focus table",
    markdown: [
      "### @{{USERNAME}} — Full-Stack Software Engineer 💻",
      "",
      "Designing end-to-end products from pixel-accurate frontends to fault-tolerant APIs.",
      "",
      "- 🌐 **Frontend**: Component systems, accessibility, state machines, WebGL/Canvas",
      "- ⚙️ **Backend**: REST/GraphQL services, relational data modeling, queues & caching",
      "- 🛠️ **Tooling**: CI/CD pipelines, static analysis, container workflows",
      "",
      "| Domain | Primary Tools | Focus |",
      "| --- | --- | --- |",
      "| Product UI | TypeScript · React · Next.js | Fast & accessible UX |",
      "| Services | Node.js · PostgreSQL · Docker | Reliable APIs |",
    ].join("\n"),
  },
  {
    id: "oss-maintainer",
    name: "Open-Source Maintainer",
    category: "Open Source",
    description: "Mission quote, project health table & maintainer checklist",
    markdown: [
      "### @{{USERNAME}} · Open-Source Maintainer 🛠️",
      "",
      "> Shipping composable packages, clean abstractions, and thorough documentation.",
      "",
      "| Area | Focus | Status |",
      "| --- | --- | --- |",
      "| Libraries | Developer DX & Zero-Dependency Core | Active |",
      "| Automation | GitHub Actions & Release Pipelines | Maintained |",
      "| Primary Stack | `{{LANGUAGES}}` | Growing |",
      "",
      "- [x] Automated profile creature evolution (`{{RANK}}`)",
      "- [x] Open to pull requests, code reviews & collaborations",
    ].join("\n"),
  },
  {
    id: "ai-data",
    name: "AI & Data Engineer",
    category: "AI / ML",
    description: "Research & evaluation workflow with code snippet block",
    markdown: [
      "### @{{USERNAME}} · AI & Systems Engineer 🧠",
      "",
      "Exploring LLM evaluation pipelines, retrieval architecture, and high-throughput data workflows.",
      "",
      "1. Benchmarking agent tool-use reliability and latency budgets",
      "2. Building structured evaluation harnesses in `{{LANGUAGES}}`",
      "3. Packaging reproducible notebooks & production inference APIs",
      "",
      "```python",
      "profile = {",
      '    "handle": "@{{USERNAME}}",',
      '    "guardian": "{{CREATURE}} (Stage {{STAGE}})",',
      '    "commits": "{{COMMITS}}",',
      "}",
      "```",
    ].join("\n"),
  },
  {
    id: "student-learner",
    name: "Student & Learner",
    category: "Learning",
    description: "Friendly bio with interactive learning roadmap checkboxes",
    markdown: [
      "### Hey! I'm @{{USERNAME}} 🌱",
      "",
      "Computer science student passionate about software engineering, problem solving, and shipping real projects every week.",
      "",
      "#### Learning Roadmap",
      "",
      "- [x] Core algorithms, Git workflows & TypeScript fundamentals",
      "- [x] Building full-stack apps with modern frameworks",
      "- [ ] Deep diving into distributed systems and compiler design",
      "",
      "Always excited to team up on hackathons and open-source beginner issues!",
    ].join("\n"),
  },
  {
    id: "minimalist-zen",
    name: "Minimalist Zen",
    category: "Minimal",
    description: "Short, airy 3-line signature intro with zero clutter",
    markdown: [
      '<h3 align="center">@{{USERNAME}}</h3>',
      "",
      '<p align="center">',
      "  Software Engineer crafting calm, dependable software in <code>{{LANGUAGES}}</code>.",
      "</p>",
    ].join("\n"),
  },
  {
    id: "design-engineer",
    name: "UI & Design Engineer",
    category: "Design",
    description: "Design systems craft philosophy & key focus highlights",
    markdown: [
      "### @{{USERNAME}} — Design Engineer ✨",
      "",
      "> Bridging design tokens, crisp typography, and 60fps interaction engineering.",
      "",
      "- 🎨 **Design Systems**: Composable primitives, accessible states, semantic tokens",
      "- 🖼️ **Graphics & Motion**: Procedural canvas rendering, micro-interactions, WebP pipelines",
      "- 📦 **Everyday Stack**: `{{LANGUAGES}}`",
    ].join("\n"),
  },
  {
    id: "terminal-bio",
    name: "Developer Terminal Card",
    category: "Code",
    description: "Clean code-block developer card showing live creature stats",
    markdown: [
      "### whoami :: @{{USERNAME}} ⚡",
      "",
      "```ts",
      "export const developer = {",
      '  username: "@{{USERNAME}}",',
      '  stack: "{{LANGUAGES}}",',
      '  companion: "{{CREATURE}}",',
      '  stage: "Stage {{STAGE}} ({{RANK}})",',
      '  contributions: "{{COMMITS}}",',
      "};",
      "```",
      "",
      "Feel free to explore pinned repositories or reach out below.",
    ].join("\n"),
  },
  {
    id: "freelancer-pro",
    name: "Freelancer & Consultant",
    category: "Work",
    description: "Services table, availability checklist & project contact CTA",
    markdown: [
      "### @{{USERNAME}} · Independent Software Consultant 🚀",
      "",
      "Helping startups and engineering teams go from architecture to production launch cleanly.",
      "",
      "| Engagement | Deliverable | Stack |",
      "| --- | --- | --- |",
      "| MVP Build | Production web app + CI/CD | `{{LANGUAGES}}` |",
      "| Architecture Audit | Performance & code health report | Full-Stack |",
      "",
      "- [x] Available for select product engineering contracts",
      "- [x] Direct technical advisory & UI modernization",
      "",
      "Reach out via **Portfolio** or **Email** below to discuss a project!",
    ].join("\n"),
  },
];

function escapeHtmlText(text: string): string {
  return text
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}

function escapeHtmlAttr(text: string): string {
  return escapeHtmlText(text).replaceAll('"', "&quot;").replaceAll("'", "&#39;");
}

function sanitizeHref(rawUrl: string): string {
  const trimmed = rawUrl.trim();
  if (
    /^https?:\/\//i.test(trimmed) ||
    /^mailto:/i.test(trimmed) ||
    trimmed.startsWith("#") ||
    trimmed.startsWith("/") ||
    trimmed.startsWith("./") ||
    trimmed.includes("{{USERNAME}}")
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

function parseTagAttr(attrText: string, attrName: string): string {
  const match = attrText.match(
    new RegExp(`${attrName}=["']([^"']*)["']`, "i")
  );
  return match?.[1] ?? "";
}

function convertPlainInlineMarkdown(raw: string): string {
  let result = "";
  const tokenRegex =
    /(`[^`]+`|!\[[^\]]*\]\([^)]+\)|\[[^\]]+\]\([^)]+\)|\*\*[^*]+\*\*|~~[^~]+~~|\*[^*]+\*)/g;
  let lastIdx = 0;
  let match: RegExpExecArray | null;

  while ((match = tokenRegex.exec(raw)) !== null) {
    if (match.index > lastIdx) {
      result += escapeHtmlText(raw.slice(lastIdx, match.index));
    }
    const token = match[0];

    if (token.startsWith("`") && token.endsWith("`")) {
      result += `<code>${escapeHtmlText(token.slice(1, -1))}</code>`;
    } else if (token.startsWith("![")) {
      const m = token.match(/^!\[([^\]]*)\]\(([^)]+)\)$/);
      const safeSrc = m ? sanitizeImageSrc(m[2]) : null;
      if (m && safeSrc) {
        result += `<img src="${escapeHtmlAttr(safeSrc)}" alt="${escapeHtmlAttr(m[1])}" />`;
      } else {
        result += escapeHtmlText(token);
      }
    } else if (token.startsWith("[")) {
      const m = token.match(/^\[([^\]]+)\]\(([^)]+)\)$/);
      if (m) {
        result += `<a href="${escapeHtmlAttr(sanitizeHref(m[2]))}">${convertPlainInlineMarkdown(m[1])}</a>`;
      } else {
        result += escapeHtmlText(token);
      }
    } else if (token.startsWith("**") && token.endsWith("**")) {
      result += `<strong>${convertPlainInlineMarkdown(token.slice(2, -2))}</strong>`;
    } else if (token.startsWith("~~") && token.endsWith("~~")) {
      result += `<del>${convertPlainInlineMarkdown(token.slice(2, -2))}</del>`;
    } else if (token.startsWith("*") && token.endsWith("*")) {
      result += `<em>${convertPlainInlineMarkdown(token.slice(1, -1))}</em>`;
    } else {
      result += escapeHtmlText(token);
    }
    lastIdx = match.index + token.length;
  }

  if (lastIdx < raw.length) {
    result += escapeHtmlText(raw.slice(lastIdx));
  }
  return result;
}

function convertInlineMixedToHtml(raw: string): string {
  const htmlTokenRegex =
    /(<br\s*\/?>|<img\b[^>]*\/?>|<a\b([^>]*)>([\s\S]*?)<\/a>|<(strong|b|em|i|u|ins|del|s|code)>([\s\S]*?)<\/\4>)/gi;
  let out = "";
  let lastIdx = 0;
  let match: RegExpExecArray | null;

  while ((match = htmlTokenRegex.exec(raw)) !== null) {
    if (match.index > lastIdx) {
      out += convertPlainInlineMarkdown(raw.slice(lastIdx, match.index));
    }

    const full = match[0];
    if (/^<br/i.test(full)) {
      out += "<br />";
    } else if (/^<img/i.test(full)) {
      const safeSrc = sanitizeImageSrc(parseTagAttr(full, "src"));
      const alt = parseTagAttr(full, "alt");
      if (safeSrc) {
        out += `<img src="${escapeHtmlAttr(safeSrc)}" alt="${escapeHtmlAttr(alt)}" />`;
      }
    } else if (/^<a\b/i.test(full)) {
      const attrs = match[2] || "";
      const inner = match[3] || "";
      const href = sanitizeHref(parseTagAttr(attrs, "href"));
      out += `<a href="${escapeHtmlAttr(href)}">${convertInlineMixedToHtml(inner)}</a>`;
    } else {
      const rawTag = (match[4] || "").toLowerCase();
      const inner = match[5] || "";
      const tagMap: Record<string, string> = {
        strong: "strong",
        b: "strong",
        em: "em",
        i: "em",
        u: "u",
        ins: "u",
        del: "del",
        s: "del",
        code: "code",
      };
      const tag = tagMap[rawTag] || "span";
      out +=
        tag === "code"
          ? `<code>${escapeHtmlText(inner)}</code>`
          : `<${tag}>${convertInlineMixedToHtml(inner)}</${tag}>`;
    }

    lastIdx = match.index + full.length;
  }

  if (lastIdx < raw.length) {
    out += convertPlainInlineMarkdown(raw.slice(lastIdx));
  }
  return out;
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

export function markdownToEditorHtml(markdown: string): string {
  const source = (markdown || "").trim();
  if (!source) return "<p></p>";

  const lines = source.split(/\r?\n/);
  const blocks: string[] = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();
    if (!trimmed) continue;

    // Fenced code block
    if (trimmed.startsWith("```")) {
      const lang = trimmed.slice(3).trim();
      const codeLines: string[] = [];
      let j = i + 1;
      while (j < lines.length && !lines[j].trim().startsWith("```")) {
        codeLines.push(lines[j]);
        j++;
      }
      const cls = lang ? ` class="language-${escapeHtmlAttr(lang)}"` : "";
      blocks.push(`<pre><code${cls}>${escapeHtmlText(codeLines.join("\n"))}</code></pre>`);
      i = j;
      continue;
    }

    // HTML Heading <h1..4 align="...">...</h1>
    const htmlHeadingSingle = trimmed.match(
      /^<h([1-4])(?:\s+[^>]*align=["'](left|center|right)["'][^>]*)?>([\s\S]*)<\/h\1>$/i
    );
    if (htmlHeadingSingle) {
      const level = htmlHeadingSingle[1];
      const align = htmlHeadingSingle[2]?.toLowerCase();
      const inner = htmlHeadingSingle[3].trim();
      const style = align ? ` style="text-align: ${align}"` : "";
      blocks.push(
        `<h${level}${style}>${convertInlineMixedToHtml(inner)}</h${level}>`
      );
      continue;
    }

    // HTML Paragraph <p align="...">...</p> (single or multi-line)
    const htmlParaSingle = trimmed.match(
      /^<p(?:\s+[^>]*align=["'](left|center|right)["'][^>]*)?>([\s\S]*)<\/p>$/i
    );
    if (htmlParaSingle) {
      const align = htmlParaSingle[1]?.toLowerCase();
      const inner = htmlParaSingle[2].trim();
      const style = align ? ` style="text-align: ${align}"` : "";
      blocks.push(`<p${style}>${convertInlineMixedToHtml(inner)}</p>`);
      continue;
    }

    const htmlParaStart = trimmed.match(
      /^<p(?:\s+[^>]*align=["'](left|center|right)["'][^>]*)?>$/i
    );
    if (htmlParaStart) {
      const align = htmlParaStart[1]?.toLowerCase();
      const innerLines: string[] = [];
      let j = i + 1;
      while (j < lines.length && !/<\/p>/i.test(lines[j])) {
        innerLines.push(lines[j].trim());
        j++;
      }
      const style = align ? ` style="text-align: ${align}"` : "";
      const joined = innerLines
        .filter(Boolean)
        .map((l) => convertInlineMixedToHtml(l))
        .join("<br />");
      blocks.push(`<p${style}>${joined}</p>`);
      i = j;
      continue;
    }

    // GFM Markdown table
    if (
      trimmed.includes("|") &&
      i + 1 < lines.length &&
      isTableSeparator(lines[i + 1])
    ) {
      const headers = splitTableCells(trimmed);
      const bodyRows: string[][] = [];
      let j = i + 2;
      while (j < lines.length && lines[j].trim().includes("|")) {
        bodyRows.push(splitTableCells(lines[j]));
        j++;
      }
      const thHtml = headers
        .map((h) => `<th><p>${convertInlineMixedToHtml(h)}</p></th>`)
        .join("");
      const bodyHtml = bodyRows
        .map((cells) => {
          const tds = headers
            .map(
              (_, cIdx) =>
                `<td><p>${convertInlineMixedToHtml(cells[cIdx] ?? "")}</p></td>`
            )
            .join("");
          return `<tr>${tds}</tr>`;
        })
        .join("");
      blocks.push(
        `<table><thead><tr>${thHtml}</tr></thead><tbody>${bodyHtml}</tbody></table>`
      );
      i = j - 1;
      continue;
    }

    // Horizontal rule
    if (/^(---+|\*\*\*+)$/.test(trimmed)) {
      blocks.push("<hr />");
      continue;
    }

    // Markdown headings
    const mdHeading = trimmed.match(/^(#{1,4})\s+(.*)$/);
    if (mdHeading) {
      const lvl = mdHeading[1].length;
      blocks.push(
        `<h${lvl}>${convertInlineMixedToHtml(mdHeading[2].trim())}</h${lvl}>`
      );
      continue;
    }

    // Task list
    if (/^[-*]\s+\[[ xX]\]\s+/.test(trimmed)) {
      const items: string[] = [];
      let j = i;
      while (j < lines.length) {
        const m = lines[j].trim().match(/^[-*]\s+\[([ xX])\]\s+(.*)$/);
        if (!m) break;
        const checked = m[1].toLowerCase() === "x";
        items.push(
          `<li data-type="taskItem" data-checked="${checked}"><p>${convertInlineMixedToHtml(m[2])}</p></li>`
        );
        j++;
      }
      blocks.push(`<ul data-type="taskList">${items.join("")}</ul>`);
      i = j - 1;
      continue;
    }

    // Unordered list
    if (/^[-*]\s+/.test(trimmed)) {
      const items: string[] = [];
      let j = i;
      while (j < lines.length) {
        const t = lines[j].trim();
        if (/^[-*]\s+\[[ xX]\]\s+/.test(t)) break;
        const m = t.match(/^[-*]\s+(.*)$/);
        if (!m) break;
        items.push(`<li><p>${convertInlineMixedToHtml(m[1])}</p></li>`);
        j++;
      }
      blocks.push(`<ul>${items.join("")}</ul>`);
      i = j - 1;
      continue;
    }

    // Ordered list
    if (/^\d+\.\s+/.test(trimmed)) {
      const items: string[] = [];
      let j = i;
      while (j < lines.length) {
        const m = lines[j].trim().match(/^\d+\.\s+(.*)$/);
        if (!m) break;
        items.push(`<li><p>${convertInlineMixedToHtml(m[1])}</p></li>`);
        j++;
      }
      blocks.push(`<ol>${items.join("")}</ol>`);
      i = j - 1;
      continue;
    }

    // Blockquote
    if (trimmed.startsWith(">")) {
      const quoteLines: string[] = [];
      let j = i;
      while (j < lines.length && lines[j].trim().startsWith(">")) {
        quoteLines.push(lines[j].trim().replace(/^>\s?/, ""));
        j++;
      }
      const qParagraphs = quoteLines
        .map((q) => `<p>${convertInlineMixedToHtml(q)}</p>`)
        .join("");
      blocks.push(`<blockquote>${qParagraphs}</blockquote>`);
      i = j - 1;
      continue;
    }

    // Regular paragraph (consume plain text lines until blank line or block starter)
    const paraLines: string[] = [trimmed];
    let j = i + 1;
    while (j < lines.length) {
      const nextTrim = lines[j].trim();
      if (
        !nextTrim ||
        nextTrim.startsWith("```") ||
        /^(#{1,4})\s+/.test(nextTrim) ||
        /^(---+|\*\*\*+)$/.test(nextTrim) ||
        /^[-*]\s+/.test(nextTrim) ||
        /^\d+\.\s+/.test(nextTrim) ||
        nextTrim.startsWith(">") ||
        /^<(?:h[1-4]|p)(?:\s|>)/i.test(nextTrim) ||
        (nextTrim.includes("|") &&
          j + 1 < lines.length &&
          isTableSeparator(lines[j + 1]))
      ) {
        break;
      }
      paraLines.push(nextTrim);
      j++;
    }
    blocks.push(
      `<p>${paraLines.map((l) => convertInlineMixedToHtml(l)).join(" ")}</p>`
    );
    i = j - 1;
  }

  return blocks.length > 0 ? blocks.join("") : "<p></p>";
}

function serializeTextWithMarks(
  node: JSONContent,
  htmlMode: boolean
): string {
  const rawText = node.text ?? "";
  const marks = node.marks ?? [];
  const hasCode = marks.some((m) => m.type === "code");

  let out = htmlMode ? escapeHtmlText(rawText) : rawText;

  if (hasCode) {
    if (htmlMode) {
      out = `<code>${out}</code>`;
    } else {
      const fence = rawText.includes("`") ? "``" : "`";
      out =
        fence.length === 2
          ? `\`\` ${rawText} \`\``
          : `\`${rawText}\``;
    }
  }

  const orderedMarkTypes = ["bold", "italic", "strike", "underline", "link"];
  for (const type of orderedMarkTypes) {
    const mark = marks.find((m) => m.type === type);
    if (!mark) continue;
    if (type === "bold") {
      out = htmlMode ? `<strong>${out}</strong>` : `**${out}**`;
    } else if (type === "italic") {
      out = htmlMode ? `<em>${out}</em>` : `*${out}*`;
    } else if (type === "strike") {
      out = htmlMode ? `<del>${out}</del>` : `~~${out}~~`;
    } else if (type === "underline") {
      out = `<u>${out}</u>`;
    } else if (type === "link") {
      const href = sanitizeHref(String(mark.attrs?.href ?? "#"));
      out = htmlMode
        ? `<a href="${escapeHtmlAttr(href)}">${out}</a>`
        : `[${out}](${href})`;
    }
  }

  return out;
}

function serializeInlineContent(
  nodes: JSONContent[] | undefined,
  htmlMode: boolean
): string {
  if (!nodes || nodes.length === 0) return "";
  return nodes
    .map((child) => {
      if (child.type === "text") {
        return serializeTextWithMarks(child, htmlMode);
      }
      if (child.type === "hardBreak") {
        return htmlMode ? "<br />" : "  \n";
      }
      if (child.type === "image") {
        const src = sanitizeImageSrc(String(child.attrs?.src ?? ""));
        const alt = String(child.attrs?.alt ?? "");
        if (!src) return "";
        return htmlMode
          ? `<img src="${escapeHtmlAttr(src)}" alt="${escapeHtmlAttr(alt)}" />`
          : `![${alt}](${src})`;
      }
      return child.content ? serializeInlineContent(child.content, htmlMode) : "";
    })
    .join("");
}

function serializeListNode(
  listNode: JSONContent,
  depth = 0
): string {
  const isOrdered = listNode.type === "orderedList";
  const isTask = listNode.type === "taskList";
  const startNum = Number(listNode.attrs?.start ?? 1);
  const indent = "  ".repeat(depth);
  const lines: string[] = [];

  (listNode.content ?? []).forEach((item, idx) => {
    const bullet = isTask
      ? `- [${item.attrs?.checked ? "x" : " "}] `
      : isOrdered
        ? `${startNum + idx}. `
        : "- ";

    const childBlocks = item.content ?? [];
    const firstInline =
      childBlocks[0]?.type === "paragraph"
        ? serializeInlineContent(childBlocks[0].content, false).trim()
        : "";
    lines.push(`${indent}${bullet}${firstInline}`);

    for (let k = 1; k < childBlocks.length; k++) {
      const sub = childBlocks[k];
      if (
        sub.type === "bulletList" ||
        sub.type === "orderedList" ||
        sub.type === "taskList"
      ) {
        lines.push(serializeListNode(sub, depth + 1));
      } else if (sub.type === "paragraph") {
        const subText = serializeInlineContent(sub.content, false).trim();
        if (subText) lines.push(`${indent}  ${subText}`);
      }
    }
  });

  return lines.join("\n");
}

function serializeTableNode(tableNode: JSONContent): string {
  const rows = tableNode.content ?? [];
  if (rows.length === 0) return "";

  const matrix = rows.map((row) =>
    (row.content ?? []).map((cell) => {
      const inner = (cell.content ?? [])
        .map((blk) => serializeInlineContent(blk.content, false).trim())
        .filter(Boolean)
        .join("<br />");
      return inner.replaceAll("|", "\\|");
    })
  );

  const colCount = Math.max(1, ...matrix.map((r) => r.length));
  const normalizeRow = (cells: string[]) =>
    `| ${Array.from({ length: colCount }, (_, idx) => cells[idx] ?? "").join(" | ")} |`;

  const headerLine = normalizeRow(matrix[0] ?? []);
  const sepLine = `| ${Array.from({ length: colCount }, () => "---").join(" | ")} |`;
  const bodyLines = matrix.slice(1).map(normalizeRow);
  return [headerLine, sepLine, ...bodyLines].join("\n");
}

function serializeBlockNode(node: JSONContent): string {
  const type = node.type;
  const align = String(node.attrs?.textAlign ?? "left");
  const isCustomAlign = align === "center" || align === "right";

  if (type === "heading") {
    const level = Math.min(4, Math.max(1, Number(node.attrs?.level ?? 3)));
    if (isCustomAlign) {
      const inner = serializeInlineContent(node.content, true).trim();
      return inner ? `<h${level} align="${align}">${inner}</h${level}>` : "";
    }
    const inner = serializeInlineContent(node.content, false).trim();
    return inner ? `${"#".repeat(level)} ${inner}` : "";
  }

  if (type === "paragraph") {
    if (isCustomAlign) {
      const inner = serializeInlineContent(node.content, true).trim();
      return inner ? `<p align="${align}">\n  ${inner}\n</p>` : "";
    }
    return serializeInlineContent(node.content, false).trim();
  }

  if (
    type === "bulletList" ||
    type === "orderedList" ||
    type === "taskList"
  ) {
    return serializeListNode(node);
  }

  if (type === "blockquote") {
    const innerBlocks = (node.content ?? [])
      .map(serializeBlockNode)
      .filter(Boolean)
      .join("\n\n");
    if (!innerBlocks) return "";
    return innerBlocks
      .split("\n")
      .map((l) => (l ? `> ${l}` : ">"))
      .join("\n");
  }

  if (type === "codeBlock") {
    const lang = String(node.attrs?.language ?? "").trim();
    const rawCode = (node.content ?? []).map((n) => n.text ?? "").join("");
    return `\`\`\`${lang}\n${rawCode}\n\`\`\``;
  }

  if (type === "horizontalRule") {
    return "---";
  }

  if (type === "image") {
    const src = sanitizeImageSrc(String(node.attrs?.src ?? ""));
    if (!src) return "";
    const alt = String(node.attrs?.alt ?? "");
    return `![${alt}](${src})`;
  }

  if (type === "table") {
    return serializeTableNode(node);
  }

  return (node.content ?? []).map(serializeBlockNode).filter(Boolean).join("\n\n");
}

export function tiptapJsonToGithubMarkdown(doc: JSONContent): string {
  const blocks = (doc.content ?? []).map(serializeBlockNode).filter(Boolean);
  return blocks.join("\n\n").trim();
}
