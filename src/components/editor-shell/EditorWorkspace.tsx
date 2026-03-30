import { useLayoutEffect, useRef } from "react";

type EditorWorkspaceProps = {
  markdown: string;
  onChange: (value: string) => void;
};

function EditorWorkspace({ markdown, onChange }: EditorWorkspaceProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useLayoutEffect(() => {
    const textarea = textareaRef.current;

    if (!textarea) {
      return;
    }

    textarea.style.height = "auto";
    textarea.style.height = `${Math.max(textarea.scrollHeight, 720)}px`;
  }, [markdown]);

  return (
    <main className="workspace-panel" aria-label="编辑工作区">
      <div className="panel-heading">
        <p className="panel-kicker">WORKSPACE</p>
        <h2>Markdown 编辑区</h2>
        <p className="panel-description">左侧实时写 Markdown，右侧实时预览。</p>
      </div>
      <label className="editor-surface" htmlFor="markdown-editor">
        <div className="editor-surface__topbar">
          <span>markdown</span>
          <span>{markdown.split("\n").length} lines</span>
        </div>
        <textarea
          ref={textareaRef}
          id="markdown-editor"
          className="markdown-editor"
          aria-label="Markdown 编辑区"
          spellCheck="false"
          value={markdown}
          onChange={(event) => onChange(event.target.value)}
        />
      </label>
    </main>
  );
}

export default EditorWorkspace;
