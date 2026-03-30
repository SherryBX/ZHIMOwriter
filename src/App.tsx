import { useDeferredValue, useState } from "react";
import AppHeader from "./components/editor-shell/AppHeader";
import EditorWorkspace from "./components/editor-shell/EditorWorkspace";
import PreviewPanel from "./components/editor-shell/PreviewPanel";
import { initialMarkdown } from "./data/mockMarkdown";
import { copyWechatContent } from "./utils/wechatClipboard";

const defaultCopyButtonLabel = "\u590d\u5236\u5230\u516c\u4f17\u53f7";

function App() {
  const [markdown, setMarkdown] = useState(initialMarkdown);
  const [copyButtonLabel, setCopyButtonLabel] = useState(defaultCopyButtonLabel);
  const deferredMarkdown = useDeferredValue(markdown);

  async function handleCopyToWechat() {
    try {
      await copyWechatContent(markdown);
      setCopyButtonLabel("\u5df2\u590d\u5236");
      window.setTimeout(() => setCopyButtonLabel(defaultCopyButtonLabel), 1800);
    } catch {
      setCopyButtonLabel("\u590d\u5236\u5931\u8d25");
      window.setTimeout(() => setCopyButtonLabel(defaultCopyButtonLabel), 1800);
    }
  }

  return (
    <div className="app-shell">
      <div className="app-shell__backdrop" />
      <div className="app-shell__frame">
        <AppHeader
          copyButtonLabel={copyButtonLabel}
          onImportMarkdown={setMarkdown}
          onCopyToWechat={handleCopyToWechat}
        />
        <div className="editor-layout">
          <EditorWorkspace markdown={markdown} onChange={setMarkdown} />
          <PreviewPanel markdown={deferredMarkdown} />
        </div>
      </div>
    </div>
  );
}

export default App;
