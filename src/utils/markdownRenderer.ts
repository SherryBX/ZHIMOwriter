import hljs from "highlight.js";
import MarkdownIt from "markdown-it";
import { isImageFailed, normalizeMarkdownImageSource, resolvePreviewImageSrc } from "./imagePath";
import { getTheme, type ThemeId } from "../themes/themes";

const topArticleLabel = "ZHIMO";

function escapeAttribute(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function highlightCodeBlock(code: string, language: string) {
  const normalizedLanguage = language.trim().toLowerCase();
  const languageClass = normalizedLanguage ? ` language-${normalizedLanguage} hljs-language-${normalizedLanguage}` : "";

  const highlighted =
    normalizedLanguage && hljs.getLanguage(normalizedLanguage)
      ? hljs.highlight(code, {
          language: normalizedLanguage,
          ignoreIllegals: true,
        }).value
      : hljs.highlightAuto(code).value;

  return `<pre><code class="hljs${languageClass}">${highlighted}</code></pre>`;
}

function createMarkdownParser(imageRenderer: (src: string, alt: string, caption: string) => string) {
  const parser = new MarkdownIt({
    html: false,
    linkify: true,
    breaks: true,
    typographer: false,
    highlight: highlightCodeBlock,
  });

  parser.renderer.rules.link_open = (tokens, idx, options, _env, self) => {
    const token = tokens[idx];
    token.attrSet("target", "_blank");
    token.attrSet("rel", "noreferrer noopener");

    return self.renderToken(tokens, idx, options);
  };

  parser.renderer.rules.image = (tokens, idx) => {
    const token = tokens[idx];
    const src = normalizeMarkdownImageSource(token.attrGet("src") ?? "");
    const rawAlt = (token.content || token.attrGet("alt") || "").trim();
    const alt = rawAlt || "Local image";

    return imageRenderer(src, alt, rawAlt);
  };

  return parser;
}

const previewMarkdown = createMarkdownParser(
  (src, alt, caption) =>
    `<img class="preview-phone__image" src="${escapeAttribute(resolvePreviewImageSrc(src))}" alt="${escapeAttribute(alt)}" referrerpolicy="no-referrer" data-original-src="${escapeAttribute(src)}" data-preview-src="${escapeAttribute(resolvePreviewImageSrc(src))}"${caption ? ` data-caption="${escapeAttribute(caption)}"` : ""} />`,
);

const standardMarkdown = createMarkdownParser(
  (src, alt, caption) =>
    `<img src="${escapeAttribute(src)}" alt="${escapeAttribute(alt)}" referrerpolicy="no-referrer" data-original-src="${escapeAttribute(src)}"${caption ? ` data-caption="${escapeAttribute(caption)}"` : ""} />`,
);

function isMediaOnlyParagraph(paragraph: HTMLParagraphElement) {
  const textNodes = Array.from(paragraph.childNodes).filter((node) => node.nodeType === Node.TEXT_NODE);
  const hasMeaningfulText = textNodes.some((node) => node.textContent?.trim());

  if (hasMeaningfulText) {
    return false;
  }

  const children = Array.from(paragraph.children);
  return children.length > 0 && children.every((child) => child.tagName === "IMG");
}

function decoratePreviewMarkup(html: string) {
  if (typeof DOMParser === "undefined") {
    return html;
  }

  const doc = new DOMParser().parseFromString(`<div>${html}</div>`, "text/html");
  const root = doc.body.firstElementChild as HTMLDivElement | null;

  if (!root) {
    return html;
  }

  for (const paragraph of root.querySelectorAll("p")) {
    if (isMediaOnlyParagraph(paragraph)) {
      paragraph.classList.add("preview-phone__paragraph--media");
    }
  }

  for (const image of root.querySelectorAll("img.preview-phone__image")) {
    const originalSrc = image.getAttribute("data-original-src") ?? image.getAttribute("src") ?? "";
    const previewSrc = resolvePreviewImageSrc(originalSrc);
    image.setAttribute("data-preview-src", previewSrc);

    const wrapper = doc.createElement("span");
    wrapper.className = isImageFailed(previewSrc) ? "preview-phone__figure is-failed" : "preview-phone__figure";

    const fallback = doc.createElement("span");
    fallback.className = "preview-phone__image-fallback";

    const title = doc.createElement("strong");
    title.textContent = "Image unavailable";

    const path = doc.createElement("span");
    path.textContent = image.getAttribute("data-original-src") ?? image.getAttribute("src") ?? "";

    fallback.append(title, path);

    const caption = image.getAttribute("data-caption")?.trim();
    let captionElement: HTMLSpanElement | null = null;

    if (caption) {
      captionElement = doc.createElement("span");
      captionElement.className = "preview-phone__image-caption";
      captionElement.textContent = caption;
    }

    const parent = image.parentNode;
    if (!parent) {
      continue;
    }

    parent.replaceChild(wrapper, image);
    wrapper.append(image, fallback);

    if (captionElement) {
      wrapper.append(captionElement);
    }
  }

  return root.innerHTML;
}

const fileUrlPattern = /(!\[[^\]]*\]\()(file:(\/\/\/|\/\/localhost\/|\/)[A-Za-z]:[^)]+)(\))/gi;
const windowsBackslashPattern = /(!\[[^\]]*\]\()([A-Za-z]:[\\/][^)]+)(\))/gi;

export function normalizeMarkdownForRender(markdown: string) {
  const normalized = markdown
    .replace(/\r\n/g, "\n")
    .replace(/^[ \t]+$/gm, "")
    .replace(fileUrlPattern, (_match, prefix, src, _protocol, suffix) => {
      const normalized = normalizeMarkdownImageSource(src);
      return `${prefix}${normalized}${suffix}`;
    })
    .replace(windowsBackslashPattern, (_match, prefix, src, suffix) => {
      const normalized = normalizeMarkdownImageSource(src);
      return `${prefix}${normalized}${suffix}`;
    });

  return normalized.replace(/\n{3,}/g, (match) => {
    return "\n\n" + "&nbsp;\n\n".repeat(match.length - 2);
  });
}


export function renderPreviewHtml(markdown: string, themeId: ThemeId = "classic") {
  const normalized = normalizeMarkdownForRender(markdown);
  const content = previewMarkdown.render(normalized);
  const theme = getTheme(themeId);

  if (theme.headerFooterVisible) {
    const header = `<table class="wechat-article__header"><tr><td class="wechat-article__header-line">&#8203;</td><td class="wechat-article__header-text">${topArticleLabel}</td><td class="wechat-article__header-line">&#8203;</td></tr></table>`;
    const footer = `<table class="wechat-article__footer"><tr><td class="wechat-article__header-line">&#8203;</td><td class="wechat-article__header-text">END</td><td class="wechat-article__header-line">&#8203;</td></tr></table>`;
    return decoratePreviewMarkup(`${header}${content}${footer}`);
  }

  // Restore original top tag and divider for themes like Classic
  const topTag = `<div class="wechat-article__top-tag">${topArticleLabel}</div>`;
  const topDivider = theme.topDividerVisible ? `<div class="wechat-article__top-divider"></div>` : "";
  return decoratePreviewMarkup(`${topTag}${topDivider}${content}`);
}

export function renderStandardMarkdownHtml(markdown: string, themeId: ThemeId = "classic") {
  const normalized = normalizeMarkdownForRender(markdown);
  const content = standardMarkdown.render(normalized);
  const theme = getTheme(themeId);

  if (theme.headerFooterVisible) {
    const header = `<table class="wechat-article__header"><tr><td class="wechat-article__header-line">&#8203;</td><td class="wechat-article__header-text">${topArticleLabel}</td><td class="wechat-article__header-line">&#8203;</td></tr></table>`;
    const footer = `<table class="wechat-article__footer"><tr><td class="wechat-article__header-line">&#8203;</td><td class="wechat-article__header-text">END</td><td class="wechat-article__header-line">&#8203;</td></tr></table>`;
    return `${header}${content}${footer}`;
  }

  const topTag = `<div class="wechat-article__top-tag">${topArticleLabel}</div>`;
  const topDivider = theme.topDividerVisible ? `<div class="wechat-article__top-divider"></div>` : "";
  return `${topTag}${topDivider}${content}`;
}

export function extractDocumentTitle(markdown: string) {
  const normalized = normalizeMarkdownForRender(markdown);
  const tokens = standardMarkdown.parse(normalized, {});

  for (let index = 0; index < tokens.length; index += 1) {
    const token = tokens[index];

    if (token.type === "heading_open" && token.tag === "h1") {
      const inlineToken = tokens[index + 1];

      if (inlineToken?.type === "inline" && inlineToken.content.trim()) {
        return inlineToken.content.trim();
      }
    }
  }

  return "Untitled Article";
}
