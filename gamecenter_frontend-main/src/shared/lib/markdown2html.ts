import { marked } from "marked";

/**
 * Content in descriptions and assignments comes from the API.  It is
 * rendered as HTML by `BriefArticle`, so raw HTML and dangerous URL schemes
 * must never pass through unchecked.
 */
const isSafeUrl = (value: string) => {
  const url = value.trim();

  // Backslashes are normalized to slashes by the URL parser, so reject them
  // before parsing to prevent a disguised protocol-relative destination.
  if (!url || url.startsWith("//") || url.includes("\\")) {
    return false;
  }

  if (/^(?:[./#]|mailto:|tel:)/i.test(url)) {
    return true;
  }

  try {
    const protocol = new URL(url, "https://gamecenter.invalid").protocol;
    return protocol === "http:" || protocol === "https:";
  } catch {
    return false;
  }
};

const renderer = new marked.Renderer();
const renderLink = renderer.link.bind(renderer);
const renderImage = renderer.image.bind(renderer);

/**
 * Station copy is commonly stored as an indented multiline string. Markdown
 * treats four leading spaces as a code block, which changes the typeface to
 * monospace and makes long lines overflow narrow screens. Strip only the
 * indentation shared by every non-empty line before parsing.
 */
const dedentMarkdown = (markdown: string) => {
  const lines = markdown.replace(/\r\n?/g, "\n").split("\n");

  while (lines.length && !lines[0].trim()) {
    lines.shift();
  }

  while (lines.length && !lines.at(-1)?.trim()) {
    lines.pop();
  }

  const indentation = lines
    .filter((line) => line.trim())
    .map((line) => line.match(/^[\t ]*/)?.[0].length ?? 0);
  const commonIndent = indentation.length ? Math.min(...indentation) : 0;

  return lines.map((line) => line.slice(commonIndent)).join("\n");
};

// Markdown is intentionally limited to text formatting.  API users should
// not be able to inject arbitrary markup or executable links into the page.
renderer.html = () => "";
renderer.link = (href, title, text) =>
  isSafeUrl(href) ? renderLink(href, title, text) : text;
renderer.image = (href, title, text) =>
  isSafeUrl(href) ? renderImage(href, title, text) : "";

export const markdown2html = (markdown: string) =>
  marked.parse(dedentMarkdown(markdown), { renderer }) as string;
