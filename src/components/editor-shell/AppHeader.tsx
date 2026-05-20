import type { ChangeEvent } from "react";
import { themeList, type ThemeId } from "../../themes/themes";

type AppHeaderProps = {
  copyButtonLabel: string;
  themeId: ThemeId;
  onImportMarkdown: (markdown: string) => void;
  onCopyToWechat: () => void | Promise<void>;
  onThemeChange: (theme: ThemeId) => void;
};

function readMarkdownFile(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = () => resolve(typeof reader.result === "string" ? reader.result : "");
    reader.onerror = () => reject(reader.error ?? new Error("Markdown 文件读取失败"));

    reader.readAsText(file, "utf-8");
  });
}

function AppHeader({ copyButtonLabel, themeId, onImportMarkdown, onCopyToWechat, onThemeChange }: AppHeaderProps) {
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
    <header className="app-header" aria-label="公众号模板编辑器头部">
      <div>
        <p className="eyebrow">ZHIMO EDITOR</p>
        <h1>{"智茉工作台"}</h1>
      </div>
      <div className="app-header__actions">
        <div className="theme-picker" role="radiogroup" aria-label="主题模板">
          <span className="theme-picker__label">主题</span>
          {themeList.map((theme) => (
            <button
              key={theme.id}
              type="button"
              role="radio"
              aria-pressed={themeId === theme.id}
              aria-checked={themeId === theme.id}
              className="theme-picker__option"
              title={theme.description}
              onClick={() => onThemeChange(theme.id)}
            >
              <span className="theme-picker__swatch" style={{ background: theme.swatch }} />
              {theme.label}
            </button>
          ))}
        </div>
        <label className="ghost-button app-header__import" htmlFor={fileInputId}>
          {"导入 MD"}
        </label>
        <input
          id={fileInputId}
          className="visually-hidden"
          type="file"
          accept=".md,.markdown,.txt,text/markdown,text/plain"
          aria-label="导入 Markdown 文件"
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
