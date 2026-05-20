import { useDeferredValue, useEffect, useState } from "react";
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
          <EditorWorkspace markdown={markdown} onChange={setMarkdown} />
          <PreviewPanel markdown={deferredMarkdown} theme={theme} />
        </div>
      </div>
    </div>
  );
}

export default App;
