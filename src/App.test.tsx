import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import App from "./App";

async function readBlobAsText(blob: Blob): Promise<string> {
  if (typeof blob.text === "function") {
    return blob.text();
  }

  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(reader.error);
    reader.readAsText(blob);
  });
}

const previewImagePath = "/__local-image?path=E%3A%2F%E7%B4%A0%E6%9D%90%E5%BA%93%2F%E6%98%A5%E5%AD%A3%2F%E5%B0%81%E9%9D%A2.png";
const copiedImagePath = "/__local-image?path=E%3A%2F%E7%B4%A0%E6%9D%90%2F%E5%B0%81%E9%9D%A2.png";
const originalCreateObjectURL = URL.createObjectURL;

function mockPreviewImageLoading(objectUrl = "blob:preview-image") {
  Object.defineProperty(URL, "createObjectURL", {
    configurable: true,
    writable: true,
    value: vi.fn(() => objectUrl),
  });
}

afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
  if (originalCreateObjectURL) {
    Object.defineProperty(URL, "createObjectURL", {
      configurable: true,
      writable: true,
      value: originalCreateObjectURL,
    });
  } else {
    Reflect.deleteProperty(URL, "createObjectURL");
  }
});

describe("App", () => {
  it("renders the editor shell with the toolbar sidebar", () => {
    const { container } = render(<App />);

    expect(screen.getByRole("textbox", { name: "Markdown 编辑区" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /复制为图片/ })).toBeInTheDocument();
    expect(container.querySelector('input[type="file"]')).toBeInTheDocument();
    expect(screen.getByLabelText("快捷工具栏")).toBeInTheDocument();
  });

  it("syncs markdown input and absolute-path images into the preview", async () => {
    const user = userEvent.setup();

    render(<App />);

    const editor = screen.getByRole("textbox", { name: "Markdown 编辑区" });

    await user.clear(editor);
    await user.paste("# New Title\n\n![cover](E:/素材库/春季/封面.png)\n\n- First item\n- Second item\n\n> Quote");

    await waitFor(() => {
      expect(screen.getByRole("heading", { level: 1, name: "New Title" })).toBeInTheDocument();
    });

    const article = screen.getByRole("article");
    const image = article.querySelector<HTMLImageElement>('img[alt="cover"]');
    expect(image).toBeTruthy();
    expect(image).toHaveAttribute("data-original-src", "E:/素材库/春季/封面.png");
    expect(image).toHaveAttribute("data-preview-src", previewImagePath);
    expect(screen.getByText("First item")).toBeInTheDocument();
    expect(screen.getByText("Second item")).toBeInTheDocument();
    expect(screen.getByText("Quote")).toBeInTheDocument();
  });

  it("imports markdown files into the editor and preview", async () => {
    const user = userEvent.setup();

    render(<App />);

    const editor = screen.getByRole("textbox", { name: "Markdown 编辑区" });
    const fileInput = screen.getByLabelText(/导入 Markdown/);
    const markdownFile = new File(["# Import Success\n\nThis came from a file."], "demo.md", {
      type: "text/markdown",
    });

    await user.upload(fileInput, markdownFile);

    await waitFor(() => {
      expect(editor).toHaveValue("# Import Success\n\nThis came from a file.");
    });

    expect(await screen.findByRole("heading", { level: 1, name: "Import Success" })).toBeInTheDocument();
    expect(screen.getByText("This came from a file.")).toBeInTheDocument();
  });

  it("copies formatted wechat html with inlined local images", async () => {
    const user = userEvent.setup();
    const write = vi.fn().mockResolvedValue(undefined);
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(new Uint8Array([137, 80, 78, 71]), {
        status: 200,
        headers: { "content-type": "image/png" },
      }),
    );

    mockPreviewImageLoading();
    vi.stubGlobal("fetch", fetchMock);
    globalThis.fetch = fetchMock;

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

    render(<App />);

    const editor = screen.getByRole("textbox", { name: "Markdown 编辑区" });

    await user.clear(editor);
    await user.paste("# Gallery\n\n![cover](E:/素材/封面.png)\n\nBody copy");
    await user.click(screen.getByRole("button", { name: /复制到公众号|已复制/ }));

    await waitFor(() => {
      expect(write).toHaveBeenCalledTimes(1);
    });

    expect(fetchMock.mock.calls.some(([url]) => url === copiedImagePath)).toBe(true);

    const clipboardItem = write.mock.calls[0][0][0] as ClipboardItemMock;
    const html = await readBlobAsText(await clipboardItem.data["text/html"]);

    expect(html).toContain("data:image/png;base64,");
    expect(html).toContain("cover");
    expect(html).toContain("Body copy");
  });
});
