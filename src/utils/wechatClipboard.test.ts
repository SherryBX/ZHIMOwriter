import { describe, expect, it, vi } from "vitest";
import { buildWechatHtml, copyWechatContent, resolvePreviewImageSrc } from "./wechatClipboard";
import type { PreviewNode } from "./markdown";

const seasonalCoverPath = "/__local-image?path=E%3A%2F%E7%B4%A0%E6%9D%90%E5%BA%93%2F%E6%98%A5%E5%AD%A3%2F%E5%B0%81%E9%9D%A2.png";
const coverPath = "/__local-image?path=E%3A%2F%E7%B4%A0%E6%9D%90%2F%E5%B0%81%E9%9D%A2.png";

describe("wechatClipboard", () => {
  it("resolves windows absolute paths through the local image endpoint", () => {
    expect(resolvePreviewImageSrc("E:\\素材库\\春季\\封面.png")).toBe(seasonalCoverPath);
  });

  it("builds wechat html with inline image data", async () => {
    const nodes: PreviewNode[] = [
      { type: "heading", level: 1, text: "Title" },
      { type: "image", alt: "cover", src: "E:/素材/封面.png" },
      { type: "paragraph", text: "Body" },
    ];

    const fetchMock = vi.fn().mockResolvedValue(
      new Response(new Uint8Array([137, 80, 78, 71]), {
        status: 200,
        headers: { "content-type": "image/png" },
      }),
    );

    vi.stubGlobal("fetch", fetchMock);

    const html = await buildWechatHtml(nodes);

    expect(fetchMock).toHaveBeenCalledWith(coverPath);
    expect(html).toContain("data:image/png;base64,");
    expect(html).toContain("cover");
    expect(html).toContain("Body");
  });

  it("writes html and plain text to the clipboard", async () => {
    const nodes: PreviewNode[] = [{ type: "paragraph", text: "Body" }];
    const write = vi.fn().mockResolvedValue(undefined);

    class ClipboardItemMock {
      data: Record<string, Promise<Blob>>;

      constructor(data: Record<string, Promise<Blob>>) {
        this.data = data;
      }
    }

    vi.stubGlobal("ClipboardItem", ClipboardItemMock);
    Object.defineProperty(navigator, "clipboard", {
      value: {
        write,
        writeText: vi.fn(),
      },
      configurable: true,
    });

    await copyWechatContent(nodes, "Body");

    expect(write).toHaveBeenCalledTimes(1);
    const clipboardItem = write.mock.calls[0][0][0] as ClipboardItemMock;
    expect(await (await clipboardItem.data["text/plain"]).text()).toBe("Body");
    expect(await (await clipboardItem.data["text/html"]).text()).toContain("Body");
  });
});
