export interface ParsedHeaderState {
  title: string;
  roleLine: string;
  specialtyLine: string;
  align: "left" | "center" | "right";
  headingUnderline: boolean;
  bodyMarkdown: string;
}

function stripInlineTags(raw: string): string {
  return raw
    .replace(/<[^>]+>/g, "")
    .replace(/^\*\*|\*\*$/g, "")
    .replace(/^\*|\*$/g, "")
    .trim();
}

function escapeHtml(text: string): string {
  return text
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}

function splitMarkdownBlocks(markdown: string): string[] {
  const lines = (markdown || "").replace(/\r\n/g, "\n").split("\n");
  const blocks: string[] = [];
  let i = 0;

  while (i < lines.length) {
    const trimmed = lines[i].trim();
    if (!trimmed) {
      i++;
      continue;
    }

    if (trimmed.startsWith("```")) {
      const group = [lines[i]];
      i++;
      while (i < lines.length) {
        group.push(lines[i]);
        if (lines[i].trim().startsWith("```")) {
          i++;
          break;
        }
        i++;
      }
      blocks.push(group.join("\n"));
      continue;
    }

    if (/^<p(?:\s+[^>]*align=["'](?:left|center|right)["'][^>]*)?>$/i.test(trimmed)) {
      const group = [lines[i]];
      i++;
      while (i < lines.length) {
        group.push(lines[i]);
        if (/<\/p>/i.test(lines[i])) {
          i++;
          break;
        }
        i++;
      }
      blocks.push(group.join("\n"));
      continue;
    }

    const group: string[] = [];
    while (i < lines.length && lines[i].trim()) {
      group.push(lines[i]);
      i++;
    }
    blocks.push(group.join("\n"));
  }

  return blocks;
}

function parseSingleTagBlock(block: string): {
  tag: "h" | "p" | "other";
  level?: number;
  align?: "left" | "center" | "right";
  inner: string;
} {
  const oneLine = block.trim();
  const htmlHeading = oneLine.match(
    /^<h([1-4])(?:\s+[^>]*align=["'](left|center|right)["'][^>]*)?>([\s\S]*)<\/h\1>$/i
  );
  if (htmlHeading) {
    return {
      tag: "h",
      level: Number(htmlHeading[1]),
      align: (htmlHeading[2]?.toLowerCase() as "left" | "center" | "right") ?? "left",
      inner: htmlHeading[3].trim(),
    };
  }

  const mdHeading = oneLine.match(/^(#{1,4})\s+([\s\S]+)$/);
  if (mdHeading) {
    return {
      tag: "h",
      level: mdHeading[1].length,
      align: "left",
      inner: mdHeading[2].trim(),
    };
  }

  const htmlPara = oneLine.match(
    /^<p(?:\s+[^>]*align=["'](left|center|right)["'][^>]*)?>([\s\S]*?)<\/p>$/i
  );
  if (htmlPara) {
    return {
      tag: "p",
      align: (htmlPara[1]?.toLowerCase() as "left" | "center" | "right") ?? "left",
      inner: htmlPara[2].trim(),
    };
  }

  return { tag: "other", inner: oneLine };
}

function isBoldOnlyLine(text: string): boolean {
  const clean = text.trim();
  return (
    (/^\*\*[^*]+\*\*$/.test(clean) && !clean.slice(2, -2).includes("**")) ||
    /^<(strong|b)>[\s\S]+<\/\1>$/i.test(clean)
  );
}

function isItalicOnlyLine(text: string): boolean {
  const clean = text.trim();
  return (
    (/^\*[^*]+\*$/.test(clean) && !clean.startsWith("**")) ||
    /^<(em|i)>[\s\S]+<\/\1>$/i.test(clean)
  );
}

/** Parses title, role line, specialty line, alignment and underline state from README intro markdown. */
export function extractHeaderFromMarkdown(markdown: string): ParsedHeaderState {
  const blocks = splitMarkdownBlocks(markdown);
  let cursor = 0;
  let title = "";
  let align: "left" | "center" | "right" = "left";
  let headingUnderline = false;
  let roleLine = "";
  let specialtyLine = "";

  if (blocks[cursor]) {
    const first = parseSingleTagBlock(blocks[cursor]);
    if (first.tag === "h") {
      title = stripInlineTags(first.inner);
      align = first.align ?? "left";
      headingUnderline = (first.level ?? 3) <= 2;
      cursor++;
    }
  }

  if (blocks[cursor]) {
    const second = parseSingleTagBlock(blocks[cursor]);
    const inner = second.tag === "p" ? second.inner : blocks[cursor].trim();
    if (isBoldOnlyLine(inner) && inner.length < 140) {
      roleLine = stripInlineTags(inner);
      if (second.tag === "p" && second.align && align === "left") {
        align = second.align;
      }
      cursor++;
    }
  }

  if (blocks[cursor]) {
    const third = parseSingleTagBlock(blocks[cursor]);
    const inner = third.tag === "p" ? third.inner : blocks[cursor].trim();
    if ((isItalicOnlyLine(inner) || isBoldOnlyLine(inner)) && inner.length < 160) {
      specialtyLine = stripInlineTags(inner);
      cursor++;
    }
  }

  return {
    title,
    roleLine,
    specialtyLine,
    align,
    headingUnderline,
    bodyMarkdown: blocks.slice(cursor).join("\n\n").trim(),
  };
}

/** Applies Header inspector changes to the top blocks while leaving About paragraphs, lists and tables untouched. */
export function applyHeaderPatchToMarkdown(
  currentMarkdown: string,
  patch: Partial<Omit<ParsedHeaderState, "bodyMarkdown">>
): string {
  const parsed = extractHeaderFromMarkdown(currentMarkdown);
  const nextTitle = patch.title !== undefined ? patch.title : parsed.title;
  const nextRole =
    patch.roleLine !== undefined ? patch.roleLine : parsed.roleLine;
  const nextSpecialty =
    patch.specialtyLine !== undefined ? patch.specialtyLine : parsed.specialtyLine;
  const nextAlign = patch.align ?? parsed.align;
  const nextUnderline = patch.headingUnderline ?? parsed.headingUnderline;

  const headingLevel = nextUnderline ? 2 : 3;
  const topBlocks: string[] = [];

  if (nextTitle.trim()) {
    if (nextAlign === "center" || nextAlign === "right") {
      topBlocks.push(
        `<h${headingLevel} align="${nextAlign}">${escapeHtml(nextTitle.trim())}</h${headingLevel}>`
      );
    } else {
      topBlocks.push(`${"#".repeat(headingLevel)} ${nextTitle.trim()}`);
    }
  }

  if (nextRole.trim()) {
    if (nextAlign === "center" || nextAlign === "right") {
      topBlocks.push(
        `<p align="${nextAlign}">\n  <strong>${escapeHtml(nextRole.trim())}</strong>\n</p>`
      );
    } else {
      topBlocks.push(`**${nextRole.trim()}**`);
    }
  }

  if (nextSpecialty.trim()) {
    if (nextAlign === "center" || nextAlign === "right") {
      topBlocks.push(
        `<p align="${nextAlign}">\n  <em>${escapeHtml(nextSpecialty.trim())}</em>\n</p>`
      );
    } else {
      topBlocks.push(`*${nextSpecialty.trim()}*`);
    }
  }

  if (parsed.bodyMarkdown.trim()) {
    topBlocks.push(parsed.bodyMarkdown.trim());
  }

  return topBlocks.join("\n\n").trim();
}
