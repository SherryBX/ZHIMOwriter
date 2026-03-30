import { describe, expect, it } from "vitest";
import { parseMarkdown } from "./markdown";

describe("parseMarkdown", () => {
  it("parses headings, paragraphs, quotes, and unordered lists", () => {
    const nodes = parseMarkdown("# 标题\n\n正文段落\n\n- 条目一\n- 条目二\n\n> 一句引用");

    expect(nodes).toEqual([
      { type: "heading", level: 1, text: "标题" },
      { type: "paragraph", text: "正文段落" },
      { type: "list", items: ["条目一", "条目二"] },
      { type: "blockquote", text: "一句引用" },
    ]);
  });

  it("parses standalone markdown images with absolute paths", () => {
    const nodes = parseMarkdown("![封面图](E:/素材库/春季/封面.png)");

    expect(nodes).toEqual([
      {
        type: "image",
        alt: "封面图",
        src: "E:/素材库/春季/封面.png",
      },
    ]);
  });
});
