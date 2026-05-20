import { describe, expect, it } from "vitest";
import { renderPreviewHtml } from "./markdownRenderer";
import { buildWechatHtml } from "./wechatClipboard";

const typoraImagePath = "/__local-image?path=D%3A%2FTypora%2FIMG%2Fimage-20260304144423930.png";

describe("markdownRenderer", () => {
  it("renders syntax-highlighted code blocks in the preview", () => {
    const html = renderPreviewHtml("```ts\nconst total = 1;\n```");

    expect(html).toContain("hljs-keyword");
    expect(html).toContain("hljs-language-ts");
  });

  it("preserves syntax highlighting when building wechat html (classic theme)", async () => {
    const html = await buildWechatHtml("```ts\nconst total = 1;\n```");

    expect(html).toContain("hljs-keyword");
    expect(html).toContain("style=\"color:#c23616;font-weight:600;\"");
  });

  it("uses blackred accents when building wechat html with blackred theme", async () => {
    const html = await buildWechatHtml("```ts\nconst total = 1;\n```", "blackred");

    expect(html).toContain("style=\"color:#991b1b;font-weight:600;\"");
  });

  it("maps typora-style absolute image paths to the local image endpoint", () => {
    const html = renderPreviewHtml("![image-20260304144423930](D:\\Typora\\IMG\\image-20260304144423930.png)");

    expect(html).toContain(`data-preview-src="${typoraImagePath}"`);
    expect(html).not.toContain('loading="lazy"');
  });

  it("normalizes file protocol image paths into the local image endpoint", () => {
    const html = renderPreviewHtml("![image-20260304144423930](file:///D:/Typora/IMG/image-20260304144423930.png)");

    expect(html).toContain(`data-preview-src="${typoraImagePath}"`);
    expect(html).not.toContain("file:///D:/Typora/IMG/image-20260304144423930.png");
  });

  it("supports file localhost image paths", () => {
    const html = renderPreviewHtml("![image-20260304144423930](file://localhost/D:/Typora/IMG/image-20260304144423930.png)");

    expect(html).toContain(`data-preview-src="${typoraImagePath}"`);
    expect(html).not.toContain("file://localhost/D:/Typora/IMG/image-20260304144423930.png");
  });

  it("preserves consecutive empty newlines in render output", () => {
    const html = renderPreviewHtml("Paragraph A\n\n\n\nParagraph B", "classic");
    
    // 4 newlines = 2 spacer paragraphs
    expect(html).toContain("<p>Paragraph A</p>");
    expect(html).toContain("<p>&nbsp;</p>");
    expect(html).toContain("<p>Paragraph B</p>");
  });
});
