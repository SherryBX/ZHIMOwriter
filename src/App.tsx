import { useDeferredValue, useEffect, useRef, useState } from "react";
import AppHeader from "./components/editor-shell/AppHeader";
import EditorWorkspace from "./components/editor-shell/EditorWorkspace";
import PreviewPanel from "./components/editor-shell/PreviewPanel";
import { initialMarkdown } from "./data/mockMarkdown";
import { copyWechatContent } from "./utils/wechatClipboard";
import { defaultThemeId, getTheme, type ThemeId } from "./themes/themes";

const defaultCopyButtonLabel = "复制到公众号";
const themeStorageKey = "zhimo:theme";

function readPersistedTheme(): ThemeId {
  if (typeof window === "undefined") {
    return defaultThemeId;
  }
  try {
    const value = window.localStorage.getItem(themeStorageKey);
    return getTheme(value).id;
  } catch {
    return defaultThemeId;
  }
}

function App() {
  const [markdown, setMarkdown] = useState(initialMarkdown);
  const [copyButtonLabel, setCopyButtonLabel] = useState(defaultCopyButtonLabel);
  const [theme, setTheme] = useState<ThemeId>(() => readPersistedTheme());
  const deferredMarkdown = useDeferredValue(markdown);

  const editorScrollRef = useRef<HTMLTextAreaElement>(null);
  const previewScrollRef = useRef<HTMLDivElement>(null);
  const isScrollingRef = useRef<"editor" | "preview" | null>(null);
  const scrollTimeoutRef = useRef<number | null>(null);

  const handleScroll = (source: "editor" | "preview") => {
    if (isScrollingRef.current && isScrollingRef.current !== source) {
      return;
    }

    const sourceEl = source === "editor" ? editorScrollRef.current : previewScrollRef.current;
    const targetEl = source === "editor" ? previewScrollRef.current : editorScrollRef.current;

    if (!sourceEl || !targetEl) return;

    isScrollingRef.current = source;
    if (scrollTimeoutRef.current) window.clearTimeout(scrollTimeoutRef.current);

    const percentage = sourceEl.scrollTop / (sourceEl.scrollHeight - sourceEl.clientHeight);
    targetEl.scrollTop = percentage * (targetEl.scrollHeight - targetEl.clientHeight);

    scrollTimeoutRef.current = window.setTimeout(() => {
      isScrollingRef.current = null;
    }, 50) as unknown as number;
  };

  const handleWheel = (event: React.WheelEvent<HTMLElement>, source: "editor" | "preview") => {
    const sourceEl = source === "editor" ? editorScrollRef.current : previewScrollRef.current;
    const targetEl = source === "editor" ? previewScrollRef.current : editorScrollRef.current;

    if (!sourceEl || !targetEl) return;

    const isSourceScrollable = sourceEl.scrollHeight > sourceEl.clientHeight;
    if (!isSourceScrollable) {
      targetEl.scrollTop += event.deltaY;
    }
  };

  useEffect(() => {
    try {
      window.localStorage.setItem(themeStorageKey, theme);
    } catch {
      /* ignore persistence errors */
    }
  }, [theme]);

  async function handleCopyToWechat() {
    try {
      await copyWechatContent(markdown, theme);
      setCopyButtonLabel("已复制");
      window.setTimeout(() => setCopyButtonLabel(defaultCopyButtonLabel), 1800);
    } catch {
      setCopyButtonLabel("复制失败");
      window.setTimeout(() => setCopyButtonLabel(defaultCopyButtonLabel), 1800);
    }
  }

  return (
    <div className="app-shell">
      <div className="app-shell__backdrop" />
      <div className="app-shell__frame">
        <AppHeader
          copyButtonLabel={copyButtonLabel}
          themeId={theme}
          onImportMarkdown={setMarkdown}
          onCopyToWechat={handleCopyToWechat}
          onThemeChange={setTheme}
        />
        <div className="editor-layout">
          <EditorWorkspace 
            markdown={markdown} 
            onChange={setMarkdown} 
            scrollRef={editorScrollRef}
            onScroll={() => handleScroll("editor")}
            onWheel={(e) => handleWheel(e, "editor")}
          />
          <PreviewPanel 
            markdown={deferredMarkdown} 
            theme={theme} 
            scrollRef={previewScrollRef}
            onScroll={() => handleScroll("preview")}
            onWheel={(e) => handleWheel(e, "preview")}
          />
        </div>
      </div>
    </div>
  );
}

export default App;
