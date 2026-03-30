import type { PreviewNode } from "./markdown";
import { isLocalAbsoluteImagePath, isRemoteImageUrl, normalizeMarkdownImageSource, resolvePreviewImageSrc } from "./imagePath";
import { renderStandardMarkdownHtml } from "./markdownRenderer";

export { resolvePreviewImageSrc } from "./imagePath";

const syntaxTokenStyles: Array<[selector: string, style: string]> = [
  [".hljs-comment, .hljs-quote", "color:#8a8a82;font-style:italic;"],
  [".hljs-keyword, .hljs-selector-tag, .hljs-literal, .hljs-name", "color:#c23616;font-weight:600;"],
  [".hljs-string, .hljs-doctag, .hljs-template-tag, .hljs-template-variable", "color:#2f855a;"],
  [".hljs-title, .hljs-title.class_, .hljs-title.class_.inherited__", "color:#2c5282;"],
  [".hljs-number, .hljs-symbol, .hljs-bullet, .hljs-variable, .hljs-meta", "color:#b7791f;"],
  [".hljs-built_in, .hljs-type, .hljs-class", "color:#7b341e;"],
  [".hljs-attr, .hljs-attribute, .hljs-regexp, .hljs-link", "color:#2b6cb0;"],
  [".hljs-function .hljs-title, .hljs-title.function_", "color:#2c5282;"],
  [".hljs-params", "color:#5e5a54;"],
];

function arrayBufferToBase64(buffer: ArrayBuffer) {
  let binary = "";
  const bytes = new Uint8Array(buffer);
  const chunkSize = 0x8000;

  for (let index = 0; index < bytes.length; index += chunkSize) {
    const chunk = bytes.subarray(index, index + chunkSize);
    binary += String.fromCharCode(...chunk);
  }

  return btoa(binary);
}

function createClipboardBlob(content: string, type: string) {
  return new Blob([content], {
    type: `${type};charset=utf-8`,
  });
}

function serializeLegacyNodes(nodes: PreviewNode[]) {
  return nodes
    .map((node) => {
      switch (node.type) {
        case "heading":
          return `${"#".repeat(node.level)} ${node.text}`;
        case "paragraph":
          return node.text;
        case "blockquote":
          return `> ${node.text}`;
        case "list":
          return node.items.map((item) => `- ${item}`).join("\n");
        case "image":
          return `![${node.alt}](${node.src})`;
      }
    })
    .join("\n\n");
}

function toMarkdown(markdownOrNodes: string | PreviewNode[], markdown?: string) {
  if (typeof markdownOrNodes === "string") {
    return markdownOrNodes;
  }

  return markdown ?? serializeLegacyNodes(markdownOrNodes);
}

function isMediaOnlyParagraph(paragraph: HTMLParagraphElement) {
  const textNodes = Array.from(paragraph.childNodes).filter((node) => node.nodeType === Node.TEXT_NODE);
  const hasMeaningfulText = textNodes.some((node) => node.textContent?.trim());

  if (hasMeaningfulText) {
    return false;
  }

  const children = Array.from(paragraph.children);
  return children.length > 0 && children.every((child) => child.tagName === "IMG");
}

async function inlineImageSrc(src: string) {
  const response = await fetch(resolvePreviewImageSrc(src));

  if (!response.ok) {
    throw new Error(`Image read failed: ${src}`);
  }

  const contentType = response.headers.get("content-type") ?? "application/octet-stream";
  const buffer = await response.arrayBuffer();
  return `data:${contentType};base64,${arrayBufferToBase64(buffer)}`;
}

async function resolveWechatImageSrc(src: string) {
  const normalized = normalizeMarkdownImageSource(src);

  if (isLocalAbsoluteImagePath(normalized)) {
    return inlineImageSrc(normalized);
  }

  if (isRemoteImageUrl(normalized)) {
    try {
      return await inlineImageSrc(normalized);
    } catch {
      return normalized;
    }
  }

  return normalized;
}

function applyInlineStyle(element: Element, style: string) {
  const previous = element.getAttribute("style");
  element.setAttribute("style", previous ? `${previous};${style}` : style);
}

function replaceElementWithStyledSpan(element: Element, doc: Document, style: string) {
  const replacement = doc.createElement("span");
  replacement.innerHTML = element.innerHTML;
  applyInlineStyle(replacement, style);
  element.replaceWith(replacement);
  return replacement;
}

function applySyntaxHighlightInlineStyles(root: ParentNode) {
  for (const [selector, style] of syntaxTokenStyles) {
    for (const node of root.querySelectorAll(selector)) {
      applyInlineStyle(node, style);
    }
  }
}

async function decorateWechatHtml(html: string) {
  if (typeof DOMParser === "undefined") {
    return `<section style="max-width:677px;margin:0 auto;padding:24px 16px 32px;box-sizing:border-box;color:#1a1a18;background:#FAFAF9;font-family:'Noto Sans SC','PingFang SC','Microsoft YaHei',sans-serif;">${html}</section>`;
  }

  const doc = new DOMParser().parseFromString(
    `<section style="max-width:677px;margin:0 auto;padding:24px 16px 32px;box-sizing:border-box;color:#1a1a18;background:#FAFAF9;font-family:'Noto Sans SC','PingFang SC','Microsoft YaHei',sans-serif;">${html}</section>`,
    "text/html",
  );

  const root = doc.body.firstElementChild as HTMLElement | null;

  if (!root) {
    return html;
  }

  for (const heading of root.querySelectorAll("h1")) {
    applyInlineStyle(
      heading,
      "margin:0 0 24px;color:#1a1a18;font-size:34px;font-weight:700;line-height:1.28;letter-spacing:0.01em;font-family:'Noto Serif SC','Songti SC',STSong,Georgia,serif;",
    );
  }

  for (const heading of root.querySelectorAll("h2")) {
    applyInlineStyle(
      heading,
      "margin:18px 0 18px;color:#1a1a18;font-size:24px;font-weight:700;line-height:1.42;font-family:'Noto Serif SC','Songti SC',STSong,Georgia,serif;",
    );
  }

  for (const heading of root.querySelectorAll("h3")) {
    applyInlineStyle(
      heading,
      "margin:26px 0 16px;color:#1a1a18;font-size:19px;font-weight:600;line-height:1.44;font-family:'Noto Serif SC','Songti SC',STSong,Georgia,serif;",
    );
  }

  for (const paragraph of root.querySelectorAll("p")) {
    const style = isMediaOnlyParagraph(paragraph)
      ? "margin:0 0 10px;"
      : "margin:0 0 16px;color:#4a4a45;font-size:16px;line-height:1.9;word-break:break-word;";

    applyInlineStyle(paragraph, style);
  }

  for (const paragraph of root.querySelectorAll("p")) {
    if (!isMediaOnlyParagraph(paragraph)) {
      continue;
    }

    const image = paragraph.querySelector("img");
    const caption = image?.getAttribute("data-caption")?.trim();

    if (!image || !caption) {
      continue;
    }

    const captionElement = doc.createElement("span");
    captionElement.className = "wechat-image-caption";
    captionElement.textContent = caption;
    paragraph.append(captionElement);
  }

  for (const quote of root.querySelectorAll("blockquote")) {
    applyInlineStyle(
      quote,
      "margin:0 0 18px;display:flex;flex-direction:column;justify-content:center;min-height:72px;padding:16px 20px;border-left:3px solid #c23616;border-radius:0 8px 8px 0;background:#ffffff;color:#4a4a45;font-size:15px;line-height:1.9;",
    );
  }

  for (const paragraph of root.querySelectorAll("blockquote p")) {
    applyInlineStyle(paragraph, "margin:0;width:100%;");
  }

  for (const list of root.querySelectorAll("ul")) {
    applyInlineStyle(list, "margin:0 0 18px;padding-left:24px;color:#4a4a45;font-size:15px;line-height:1.9;");
  }

  for (const list of root.querySelectorAll("ol")) {
    applyInlineStyle(list, "margin:0 0 18px;padding-left:24px;color:#4a4a45;font-size:15px;line-height:1.9;");
  }

  for (const item of root.querySelectorAll("li")) {
    applyInlineStyle(item, "margin:0 0 6px;");
  }

  for (const link of root.querySelectorAll("a")) {
    applyInlineStyle(link, "color:#2b6cb0;text-decoration:none;border-bottom:1px solid #a0c4e8;padding-bottom:1px;");
  }

  for (const inlineCode of root.querySelectorAll("code")) {
    if (inlineCode.parentElement?.tagName === "PRE") {
      continue;
    }

    applyInlineStyle(
      inlineCode,
      "padding:2px 6px;border-radius:4px;background:#f5f5f3;color:#1a1a18;font-size:0.92em;font-family:'JetBrains Mono','SF Mono',Menlo,Consolas,monospace;",
    );
  }

  for (const block of root.querySelectorAll("pre")) {
    applyInlineStyle(
      block,
      "margin:0 0 18px;max-width:100%;padding:14px 18px;overflow:hidden;border-radius:8px;border:1px solid #e5e4e0;background:#fcfbf8;color:#1a1a18;font-size:14px;line-height:1.72;box-sizing:border-box;",
    );
  }

  for (const code of root.querySelectorAll("pre code")) {
    applyInlineStyle(
      code,
      "display:block;white-space:pre-wrap;word-break:break-word;overflow-wrap:anywhere;font-family:'JetBrains Mono','SF Mono',Menlo,Consolas,monospace;background:transparent;color:#1a1a18;",
    );
  }

  applySyntaxHighlightInlineStyles(root);

  for (const hr of root.querySelectorAll("hr")) {
    applyInlineStyle(hr, "margin:30px 0;border:0;border-top:1px solid rgba(120,120,112,0.18);");
  }

  for (const strong of Array.from(root.querySelectorAll("strong"))) {
    replaceElementWithStyledSpan(strong, doc, "font-weight:600;color:#c23616;");
  }

  for (const em of root.querySelectorAll("em")) {
    applyInlineStyle(em, "font-style:italic;");
  }

  for (const table of root.querySelectorAll("table")) {
    applyInlineStyle(table, "width:100%;margin:0 0 20px;border-collapse:collapse;font-size:14px;line-height:1.75;");
  }

  for (const head of root.querySelectorAll("th")) {
    applyInlineStyle(head, "padding:10px 12px;border:1px solid #e5e4e0;background:#f8f6f2;color:#1a1a18;text-align:left;");
  }

  for (const cell of root.querySelectorAll("td")) {
    applyInlineStyle(cell, "padding:10px 12px;border:1px solid #e5e4e0;color:#4a4a45;");
  }

  for (const image of root.querySelectorAll("img")) {
    const originalSrc = normalizeMarkdownImageSource(image.getAttribute("data-original-src") ?? image.getAttribute("src") ?? "");

    image.setAttribute("src", await resolveWechatImageSrc(originalSrc));

    image.removeAttribute("data-original-src");
    applyInlineStyle(
      image,
      "display:block;width:100%;max-width:100%;border-radius:6px;border:3px solid #C23616;box-shadow:none;",
    );
  }

  for (const caption of root.querySelectorAll(".wechat-image-caption")) {
    applyInlineStyle(
      caption,
      "display:block;margin-top:8px;color:#8a8a82;font-size:12px;line-height:1.7;text-align:center;font-family:'Noto Sans SC','PingFang SC','Microsoft YaHei',sans-serif;",
    );
  }

  for (const tag of Array.from(root.querySelectorAll(".wechat-article__top-tag"))) {
    const styledTag = replaceElementWithStyledSpan(
      tag,
      doc,
      "display:block;margin:0 0 18px;color:#C23616;font-family:'JetBrains Mono','SF Mono',Menlo,Consolas,monospace;font-size:12px;letter-spacing:0.28em;text-transform:uppercase;",
    );
    styledTag.className = "wechat-article__top-tag";
  }

  for (const divider of root.querySelectorAll(".wechat-article__top-divider")) {
    applyInlineStyle(divider, "margin:0 0 16px;");
  }

  for (const dividerLine of root.querySelectorAll(".wechat-article__top-divider-line")) {
    applyInlineStyle(dividerLine, "display:block;height:0;overflow:hidden;border-top:1px solid rgba(194,54,22,0.18);");
  }

  return root.outerHTML;
}

async function copyWithClipboardItem(html: string, plainText: string) {
  if (!navigator.clipboard || !("write" in navigator.clipboard) || typeof ClipboardItem === "undefined") {
    return false;
  }

  const item = new ClipboardItem({
    "text/html": Promise.resolve(createClipboardBlob(html, "text/html")),
    "text/plain": Promise.resolve(createClipboardBlob(plainText, "text/plain")),
  });

  await navigator.clipboard.write([item]);
  return true;
}

function copyWithExecCommand(html: string, plainText: string) {
  if (typeof document === "undefined" || typeof window === "undefined") {
    return false;
  }

  const handler = (event: ClipboardEvent) => {
    event.preventDefault();
    event.clipboardData?.setData("text/html", html);
    event.clipboardData?.setData("text/plain", plainText);
  };

  document.addEventListener("copy", handler);

  try {
    return document.execCommand("copy");
  } finally {
    document.removeEventListener("copy", handler);
  }
}

export async function buildWechatHtml(markdownOrNodes: string | PreviewNode[]) {
  const markdown = toMarkdown(markdownOrNodes);
  const html = renderStandardMarkdownHtml(markdown);
  return decorateWechatHtml(html);
}

export async function copyWechatContent(markdownOrNodes: string | PreviewNode[], markdown?: string) {
  const sourceMarkdown = toMarkdown(markdownOrNodes, markdown);
  const html = await buildWechatHtml(sourceMarkdown);

  try {
    if (await copyWithClipboardItem(html, sourceMarkdown)) {
      return;
    }
  } catch {
    if (copyWithExecCommand(html, sourceMarkdown)) {
      return;
    }
  }

  if (copyWithExecCommand(html, sourceMarkdown)) {
    return;
  }

  throw new Error("Clipboard copy is not supported in the current environment");
}
