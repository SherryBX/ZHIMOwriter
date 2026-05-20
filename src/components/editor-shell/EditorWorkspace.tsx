import type { RefObject } from "react";

type EditorWorkspaceProps = {
  markdown: string;
  onChange: (value: string) => void;
  scrollRef: RefObject<HTMLTextAreaElement | null>;
  onScroll: () => void;
};

function EditorWorkspace({ markdown, onChange, scrollRef, onScroll }: EditorWorkspaceProps) {
  return (
    <main className="workspace-panel" aria-label="编辑工作区">
      <div className="panel-heading">
        <p className="panel-kicker">WORKSPACE</p>
        <h2>Markdown 编辑区</h2>
      </div>
      <label className="editor-surface" htmlFor="markdown-editor">
        <div className="editor-surface__topbar">
          <span>markdown</span>
          <span>{markdown.split("\n").length} lines</span>
        </div>
        <textarea
          ref={scrollRef}
          id="markdown-editor"
          className="markdown-editor"
          aria-label="Markdown 编辑区"
          spellCheck="false"
          value={markdown}
          onChange={(event) => onChange(event.target.value)}
          onScroll={onScroll}
        />
      </label>
    </main>
  );
}

export default EditorWorkspace;
