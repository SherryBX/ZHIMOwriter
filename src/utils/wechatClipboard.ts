import type { PreviewNode } from "./markdown";
import { isLocalAbsoluteImagePath, isRemoteImageUrl, normalizeMarkdownImageSource, resolvePreviewImageSrc } from "./imagePath";
import { renderStandardMarkdownHtml } from "./markdownRenderer";
import { defaultThemeId, getTheme, type ThemeId, type ThemeSpec } from "../themes/themes";

export { resolvePreviewImageSrc } from "./imagePath";

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
    try {
      return await inlineImageSrc(normalized);
    } catch {
      return normalized;
    }
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
  const previous = element.getAttribute("style") ?? "";

  const parseStyle = (str: string) => {
    const rules: Record<string, string> = {};
    const parts = str.split(";");
    for (const part of parts) {
      const colonIndex = part.indexOf(":");
      if (colonIndex > 0) {
        const key = part.slice(0, colonIndex).trim().toLowerCase();
        const value = part.slice(colonIndex + 1).trim();
        if (key && value) {
          rules[key] = value;
        }
      }
    }
    return rules;
  };

  const prevRules = parseStyle(previous);
  const nextRules = parseStyle(style);
  const mergedRules = { ...prevRules, ...nextRules };

  const mergedString = Object.entries(mergedRules)
    .map(([key, value]) => `${key}:${value}`)
    .join(";");

  if (mergedString) {
    element.setAttribute("style", mergedString + ";");
  }
}

function replaceElementWithStyledSpan(element: Element, doc: Document, style: string) {
  const replacement = doc.createElement("span");
  replacement.innerHTML = element.innerHTML;
  applyInlineStyle(replacement, style);
  element.replaceWith(replacement);
  return replacement;
}

function applySyntaxHighlightInlineStyles(root: ParentNode, theme: ThemeSpec) {
  for (const [selector, style] of theme.syntaxTokenStyles) {
    for (const node of root.querySelectorAll(selector)) {
      applyInlineStyle(node, style);
    }
  }
}

async function decorateWechatHtml(html: string, theme: ThemeSpec) {
  if (typeof DOMParser === "undefined") {
    return `<section style="${theme.container};box-shadow:none;border:none;border-radius:0;">${html}</section>`;
  }

  const doc = new DOMParser().parseFromString(
    `<section style="${theme.container};box-shadow:none;border:none;border-radius:0;">${html}</section>`,
    "text/html",
  );

  const root = doc.body.firstElementChild as HTMLElement | null;

  if (!root) {
    return html;
  }

  for (const h1 of Array.from(root.querySelectorAll("h1"))) {
    applyInlineStyle(h1, theme.h1);

    if (theme.h1MarkBefore) {
      const mark = doc.createElement("span");
      mark.setAttribute("style", theme.h1MarkBefore);
      mark.textContent = "「";
      h1.insertBefore(mark, h1.firstChild);
    }

    if (theme.h1MarkAfter) {
      const mark = doc.createElement("span");
      mark.setAttribute("style", theme.h1MarkAfter);
      mark.textContent = "」";
      h1.appendChild(mark);
    }
  }

  let h2Index = 0;
  for (const heading of root.querySelectorAll("h2")) {
    h2Index += 1;
    applyInlineStyle(heading, theme.h2);

    if (theme.h2AutoNumber) {
      const n = String(h2Index).padStart(2, "0");
      const text = theme.h2AutoNumber.format.replace("{n}", n);
      const prefix = doc.createElement("span");
      prefix.textContent = text;
      applyInlineStyle(prefix, theme.h2AutoNumber.style);
      heading.insertBefore(prefix, heading.firstChild);
    }
  }

  for (const heading of root.querySelectorAll("h3")) {
    applyInlineStyle(heading, theme.h3);

    if (theme.h3PrefixMark) {
      const prefix = doc.createElement("span");
      prefix.textContent = theme.h3PrefixMark.content;
      applyInlineStyle(prefix, theme.h3PrefixMark.style);
      heading.insertBefore(prefix, heading.firstChild);
    }
  }

  for (const paragraph of root.querySelectorAll("p")) {
    const style = isMediaOnlyParagraph(paragraph) ? theme.mediaParagraph : theme.paragraph;
    applyInlineStyle(paragraph, style);
  }

  let figureIndex = 0;
  for (const paragraph of root.querySelectorAll("p")) {
    if (!isMediaOnlyParagraph(paragraph)) {
      continue;
    }

    const image = paragraph.querySelector("img");
    const caption = image?.getAttribute("data-caption")?.trim();

    if (!image || !caption) {
      continue;
    }

    figureIndex += 1;
    const captionElement = doc.createElement("span");
    captionElement.className = "wechat-image-caption";

    if (theme.figurePrefix) {
      const n = String(figureIndex).padStart(2, "0");
      const prefixText = theme.figurePrefix.format.replace("{n}", n);
      const prefix = doc.createElement("span");
      prefix.textContent = prefixText;
      applyInlineStyle(prefix, theme.figurePrefix.style);
      captionElement.append(prefix);
      captionElement.append(doc.createTextNode(caption));
    } else {
      captionElement.textContent = caption;
    }

    paragraph.append(captionElement);
  }

  for (const blockquote of Array.from(root.querySelectorAll("blockquote"))) {
    const section = doc.createElement("section");
    while (blockquote.firstChild) {
      section.appendChild(blockquote.firstChild);
    }
    applyInlineStyle(section, theme.blockquote);

    if (theme.blockquoteMarkBefore) {
      const mark = doc.createElement("span");
      mark.setAttribute("style", theme.blockquoteMarkBefore);
      mark.textContent = "“";
      section.insertBefore(mark, section.firstChild);
    }

    if (theme.blockquoteMarkAfter) {
      const mark = doc.createElement("span");
      mark.setAttribute("style", theme.blockquoteMarkAfter);
      mark.textContent = "”";
      section.appendChild(mark);
    }

    for (const p of section.querySelectorAll("p")) {
      applyInlineStyle(p, theme.blockquoteParagraph);
    }

    blockquote.replaceWith(section);
  }

  for (const list of root.querySelectorAll("ul")) {
    applyInlineStyle(list, theme.unorderedList);
  }

  for (const list of root.querySelectorAll("ol")) {
    applyInlineStyle(list, theme.orderedList);
  }

  for (const item of root.querySelectorAll("li")) {
    applyInlineStyle(item, theme.listItem);
  }

  for (const link of root.querySelectorAll("a")) {
    applyInlineStyle(link, theme.link);
  }

  for (const inlineCode of root.querySelectorAll("code")) {
    if (inlineCode.parentElement?.tagName === "PRE") {
      continue;
    }

    applyInlineStyle(inlineCode, theme.inlineCode);
  }

  for (const block of root.querySelectorAll("pre")) {
    applyInlineStyle(block, theme.preBlock);
  }

  for (const code of root.querySelectorAll("pre code")) {
    applyInlineStyle(code, theme.preCode);
  }

  applySyntaxHighlightInlineStyles(root, theme);

  for (const hr of root.querySelectorAll("hr")) {
    if (hr.closest(".wechat-article__header") || hr.closest(".wechat-article__footer")) {
      continue;
    }
    if (theme.hrContent) {
      const replacement = doc.createElement("p");
      replacement.textContent = theme.hrContent;
      applyInlineStyle(replacement, theme.hr);
      hr.replaceWith(replacement);
    } else {
      applyInlineStyle(hr, theme.hr);
    }
  }

  for (const strong of Array.from(root.querySelectorAll("strong"))) {
    replaceElementWithStyledSpan(strong, doc, theme.strong);
  }

  for (const em of root.querySelectorAll("em")) {
    applyInlineStyle(em, theme.em);
  }

  for (const table of root.querySelectorAll("table")) {
    applyInlineStyle(table, theme.table);
  }

  for (const head of root.querySelectorAll("th")) {
    applyInlineStyle(head, theme.tableHead);
  }

  for (const cell of root.querySelectorAll("td")) {
    applyInlineStyle(cell, theme.tableCell);
  }

  for (const image of root.querySelectorAll("img")) {
    const originalSrc = normalizeMarkdownImageSource(image.getAttribute("data-original-src") ?? image.getAttribute("src") ?? "");

    image.setAttribute("src", await resolveWechatImageSrc(originalSrc));

    image.removeAttribute("data-original-src");
    applyInlineStyle(image, theme.image);
  }

  for (const caption of root.querySelectorAll(".wechat-image-caption")) {
    applyInlineStyle(caption, theme.caption);
  }

  for (const tag of Array.from(root.querySelectorAll(".wechat-article__top-tag"))) {
    const styledTag = replaceElementWithStyledSpan(tag, doc, theme.topTag);
    styledTag.className = "wechat-article__top-tag";

    if (theme.topTagLeadingBar) {
      const leadingBar = doc.createElement("span");
      leadingBar.setAttribute("style", theme.topTagLeadingBar);
      styledTag.insertBefore(leadingBar, styledTag.firstChild);
    }
  }

  // Extract border width and color from theme.headerLine for line styling
  const borderWidthMatch = theme.headerLine.match(/border-top:\s*(\d+px)/);
  const borderColorMatch = theme.headerLine.match(/border-top:[^#\s]+(#[a-fA-F0-9]{3,8})/);
  
  const lineHeight = borderWidthMatch ? borderWidthMatch[1] : "2px";
  const lineColor = borderColorMatch ? borderColorMatch[1] : "#ecccc2";

  // Use section + display:inline-block + background-color to draw lines.
  // This is the proven approach used by professional WeChat editors (秀米, 135编辑器).
  // WeChat's sanitizer preserves: <section>, display:inline-block, background-color, width, height.
  // It strips: <hr>, empty <div>, background-image:linear-gradient, <table> cell tricks.

  for (const header of Array.from(root.querySelectorAll(".wechat-article__header"))) {
    const textNode = header.querySelector(".wechat-article__header-text");
    const textContent = textNode ? textNode.textContent : "";

    const wrapper = doc.createElement("section");
    wrapper.setAttribute("style", `display:flex;align-items:center;width:100%;margin:0 0 32px;`);

    const lineLeft = doc.createElement("section");
    lineLeft.setAttribute("style", `flex:1;height:${lineHeight};background-color:${lineColor};overflow:hidden;font-size:0;`);
    lineLeft.innerHTML = "&nbsp;";

    const textSpan = doc.createElement("section");
    textSpan.setAttribute("style", `flex-shrink:0;padding:0 10px;white-space:nowrap;line-height:1;${theme.headerText}`);
    textSpan.textContent = textContent;

    const lineRight = doc.createElement("section");
    lineRight.setAttribute("style", `flex:1;height:${lineHeight};background-color:${lineColor};overflow:hidden;font-size:0;`);
    lineRight.innerHTML = "&nbsp;";

    wrapper.appendChild(lineLeft);
    wrapper.appendChild(textSpan);
    wrapper.appendChild(lineRight);

    header.replaceWith(wrapper);
  }

  for (const footer of Array.from(root.querySelectorAll(".wechat-article__footer"))) {
    const textNode = footer.querySelector(".wechat-article__header-text");
    const textContent = textNode ? textNode.textContent : "END";

    const wrapper = doc.createElement("section");
    wrapper.setAttribute("style", `display:flex;align-items:center;width:100%;margin:32px 0 0;`);

    const lineLeft = doc.createElement("section");
    lineLeft.setAttribute("style", `flex:1;height:${lineHeight};background-color:${lineColor};overflow:hidden;font-size:0;`);
    lineLeft.innerHTML = "&nbsp;";

    const textSpan = doc.createElement("section");
    textSpan.setAttribute("style", `flex-shrink:0;padding:0 10px;white-space:nowrap;line-height:1;${theme.headerText}`);
    textSpan.textContent = textContent;

    const lineRight = doc.createElement("section");
    lineRight.setAttribute("style", `flex:1;height:${lineHeight};background-color:${lineColor};overflow:hidden;font-size:0;`);
    lineRight.innerHTML = "&nbsp;";

    wrapper.appendChild(lineLeft);
    wrapper.appendChild(textSpan);
    wrapper.appendChild(lineRight);

    footer.replaceWith(wrapper);
  }

  if (theme.topDividerVisible) {
    // Extract color from topDividerLine style (e.g. "border-top:1px solid rgba(194,54,22,0.18)")
    const dividerColorMatch = theme.topDividerLine.match(/border-top:\s*\d+px\s+solid\s+([^;]+)/);
    const dividerHeightMatch = theme.topDividerLine.match(/border-top:\s*(\d+px)/);
    const dividerColor = dividerColorMatch ? dividerColorMatch[1].trim() : "rgba(194,54,22,0.18)";
    const dividerHeight = dividerHeightMatch ? dividerHeightMatch[1] : "1px";

    for (const divider of Array.from(root.querySelectorAll(".wechat-article__top-divider"))) {
      // Replace the empty div with a section that has visible background-color + &nbsp;
      const line = doc.createElement("section");
      line.setAttribute("style", `margin:${theme.topDivider.match(/margin:\s*([^;]+)/)?.[1] || "0 0 16px"};height:${dividerHeight};background-color:${dividerColor};overflow:hidden;font-size:0;`);
      line.innerHTML = "&nbsp;";
      divider.replaceWith(line);
    }
  } else {
    for (const divider of root.querySelectorAll(".wechat-article__top-divider")) {
      divider.remove();
    }
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

export async function buildWechatHtml(markdownOrNodes: string | PreviewNode[], themeId: ThemeId = defaultThemeId) {
  const markdown = toMarkdown(markdownOrNodes);
  const html = renderStandardMarkdownHtml(markdown, themeId);
  return decorateWechatHtml(html, getTheme(themeId));
}

export async function copyWechatContent(
  markdownOrNodes: string | PreviewNode[],
  markdownOrTheme?: string | ThemeId,
  themeId: ThemeId = defaultThemeId,
) {
  let resolvedMarkdown: string;
  let resolvedTheme: ThemeId = themeId;

  if (markdownOrTheme === "classic" || markdownOrTheme === "blackred") {
    resolvedMarkdown = toMarkdown(markdownOrNodes);
    resolvedTheme = markdownOrTheme;
  } else {
    resolvedMarkdown = toMarkdown(markdownOrNodes, markdownOrTheme);
  }

  const html = await buildWechatHtml(resolvedMarkdown, resolvedTheme);

  try {
    if (await copyWithClipboardItem(html, resolvedMarkdown)) {
      return;
    }
  } catch {
    if (copyWithExecCommand(html, resolvedMarkdown)) {
      return;
    }
  }

  if (copyWithExecCommand(html, resolvedMarkdown)) {
    return;
  }

  throw new Error("Clipboard copy is not supported in the current environment");
}
