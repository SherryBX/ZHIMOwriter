import type { ChangeEvent } from "react";

type AppHeaderProps = {
  copyButtonLabel: string;
  onImportMarkdown: (markdown: string) => void;
  onCopyToWechat: () => void | Promise<void>;
};

function readMarkdownFile(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = () => resolve(typeof reader.result === "string" ? reader.result : "");
    reader.onerror = () => reject(reader.error ?? new Error("Markdown \u6587\u4ef6\u8bfb\u53d6\u5931\u8d25"));

    reader.readAsText(file, "utf-8");
  });
}

function AppHeader({ copyButtonLabel, onImportMarkdown, onCopyToWechat }: AppHeaderProps) {
  const fileInputId = "markdown-import-input";

  async function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    const content = await readMarkdownFile(file);
    onImportMarkdown(content);
    event.target.value = "";
  }

  return (
    <header className="app-header" aria-label="\u516c\u4f17\u53f7\u6a21\u677f\u7f16\u8f91\u5668\u5934\u90e8">
      <div>
        <p className="eyebrow">ZHIMO EDITOR</p>
        <h1>{"\u667a\u8309\u5de5\u4f5c\u53f0"}</h1>
      </div>
      <div className="app-header__actions">
        <label className="ghost-button app-header__import" htmlFor={fileInputId}>
          {"\u5bfc\u5165 MD"}
        </label>
        <input
          id={fileInputId}
          className="visually-hidden"
          type="file"
          accept=".md,.markdown,.txt,text/markdown,text/plain"
          aria-label="\u5bfc\u5165 Markdown \u6587\u4ef6"
          onChange={handleFileChange}
        />
        <button type="button" className="primary-button" onClick={onCopyToWechat}>
          {copyButtonLabel}
        </button>
      </div>
    </header>
  );
}

export default AppHeader;
