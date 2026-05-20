export type ThemeId = "classic" | "blackred";

export type SyntaxTokenStyle = [selector: string, style: string];

export type AutoNumberSpec = {
  format: string;
  style: string;
};

export type PrefixMarkSpec = {
  content: string;
  style: string;
};

export type ThemeSpec = {
  id: ThemeId;
  label: string;
  description: string;
  swatch: string;
  container: string;
  h1: string;
  h1MarkBefore?: string;
  h1MarkAfter: string | null;
  h2: string;
  h3: string;
  paragraph: string;
  mediaParagraph: string;
  blockquote: string;
  blockquoteMarkBefore?: string;
  blockquoteMarkAfter?: string;
  blockquoteParagraph: string;
  unorderedList: string;
  orderedList: string;
  listItem: string;
  link: string;
  inlineCode: string;
  preBlock: string;
  preCode: string;
  hr: string;
  hrContent: string | null;
  strong: string;
  em: string;
  table: string;
  tableHead: string;
  tableCell: string;
  image: string;
  caption: string;
  topTag: string;
  headerContainer: string;
  headerLine: string;
  headerText: string;
  footerContainer: string;
  headerFooterVisible: boolean;
  topDividerVisible: boolean;
  topDivider: string;
  topDividerLine: string;
  topTagLeadingBar: string | null;
  h2AutoNumber: AutoNumberSpec | null;
  h3PrefixMark: PrefixMarkSpec | null;
  figurePrefix: AutoNumberSpec | null;
  syntaxTokenStyles: SyntaxTokenStyle[];
};

export const classicTheme: ThemeSpec = {
  id: "classic",
  label: "Classic",
  description: "Classic design with a focus on typography",
  swatch: "#C23616",
  container:
    "max-width:677px;margin:0 auto;padding:48px 22px 64px;box-sizing:border-box;color:#1a1a18;background:#ffffff;font-family:'Noto Sans SC','PingFang SC','Microsoft YaHei',sans-serif;font-size:16px;line-height:1.75;",
  h1: "margin:0 0 24px;color:#1a1a18;font-size:34px;font-weight:700;line-height:1.25;letter-spacing:0.02em;font-family:'Noto Serif SC','Songti SC',STSong,Georgia,serif;",
  h1MarkBefore: "",
  h1MarkAfter: "",
  h2: "margin:18px 0 18px;color:#1a1a18;font-size:24px;font-weight:700;line-height:1.42;font-family:'Noto Serif SC','Songti SC',STSong,Georgia,serif;",
  h3: "margin:26px 0 16px;color:#1a1a18;font-size:19px;font-weight:600;line-height:1.44;font-family:'Noto Serif SC','Songti SC',STSong,Georgia,serif;",
  paragraph: "margin:0 0 16px;color:#4a4a45;font-size:16px;line-height:1.9;word-break:break-word;",
  mediaParagraph: "margin:0 0 10px;",
  blockquote:
    "margin:0 0 18px;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:16px 20px;border-left:3px solid #c23616;border-radius:0 8px 8px 0;background:#ffffff;color:#4a4a45;font-size:15px;line-height:1.9;",
  blockquoteParagraph: "margin:0;width:100%;",
  unorderedList: "margin:0 0 18px;padding-left:24px;color:#4a4a45;font-size:15px;line-height:1.9;",
  orderedList: "margin:0 0 18px;padding-left:24px;color:#4a4a45;font-size:15px;line-height:1.9;",
  listItem: "margin:0 0 6px;",
  link: "color:#2b6cb0;text-decoration:none;border-bottom:1px solid #a0c4e8;padding-bottom:1px;",
  inlineCode:
    "padding:2px 6px;border-radius:4px;background:#f5f5f3;color:#1a1a18;font-size:0.92em;font-family:'JetBrains Mono','SF Mono',Menlo,Consolas,monospace;",
  preBlock:
    "margin:0 0 18px;max-width:100%;padding:14px 18px;overflow:hidden;border-radius:8px;border:1px solid #e5e4e0;background:#fcfbf8;color:#1a1a18;font-size:14px;line-height:1.72;box-sizing:border-box;",
  preCode:
    "display:block;white-space:pre-wrap;word-break:break-word;overflow-wrap:anywhere;font-family:'JetBrains Mono','SF Mono',Menlo,Consolas,monospace;background:transparent;color:#1a1a18;",
  hr: "margin:30px 0;border:0;border-top:1px solid rgba(120,120,112,0.18);",
  hrContent: null,
  strong: "font-weight:600;color:#c23616;",
  em: "font-style:italic;",
  table: "width:100%;margin:0 0 20px;border-collapse:collapse;font-size:14px;line-height:1.75;",
  tableHead: "padding:10px 12px;border:1px solid #e5e4e0;background:#f8f6f2;color:#1a1a18;text-align:left;",
  tableCell: "padding:10px 12px;border:1px solid #e5e4e0;color:#4a4a45;",
  image: "display:block;width:100%;max-width:100%;border-radius:6px;border:3px solid #C23616;box-shadow:none;",
  caption:
    "display:block;margin-top:8px;color:#8a8a82;font-size:12px;line-height:1.7;text-align:center;font-family:'Noto Sans SC','PingFang SC','Microsoft YaHei',sans-serif;",
  topTag:
    "display:block;margin:0 0 18px;color:#C23616;font-family:'JetBrains Mono','SF Mono',Menlo,Consolas,monospace;font-size:12px;letter-spacing:0.28em;text-transform:uppercase;",
  headerContainer: "width:100%;margin:0 0 32px;border-collapse:collapse;border:none;line-height:1;",
  headerLine:
    "margin:0;border:none;border-top:2px solid rgba(194,54,22,0.22);width:100%;",
  headerText:
    "text-align:center;padding:0 12px;white-space:nowrap;color:#C23616;font-family:'JetBrains Mono','SF Mono',Menlo,Consolas,monospace;font-size:11px;letter-spacing:0.32em;text-transform:uppercase;vertical-align:middle;",
  footerContainer: "width:100%;margin:32px 0 0;border-collapse:collapse;border:none;line-height:1;",
  headerFooterVisible: false,
  topDividerVisible: true,
  topDivider: "margin:0 0 16px;",
  topDividerLine: "display:block;height:0;overflow:hidden;border-top:1px solid rgba(194,54,22,0.18);",
  topTagLeadingBar: null,
  h2AutoNumber: null,
  h3PrefixMark: null,
  figurePrefix: null,
  syntaxTokenStyles: [
    [".hljs-comment, .hljs-quote", "color:#8a8a82;font-style:italic;"],
    [".hljs-keyword, .hljs-selector-tag, .hljs-literal, .hljs-name", "color:#c23616;font-weight:600;"],
    [".hljs-string, .hljs-doctag, .hljs-template-tag, .hljs-template-variable", "color:#2f855a;"],
    [".hljs-title, .hljs-title.class_, .hljs-title.class_.inherited__", "color:#2c5282;"],
    [".hljs-number, .hljs-symbol, .hljs-bullet, .hljs-variable, .hljs-meta", "color:#b7791f;"],
    [".hljs-built_in, .hljs-type, .hljs-class", "color:#7b341e;"],
    [".hljs-attr, .hljs-attribute, .hljs-regexp, .hljs-link", "color:#2b6cb0;"],
    [".hljs-function .hljs-title, .hljs-title.function_", "color:#2c5282;"],
    [".hljs-params", "color:#5e5a54;"],
  ],
};

const blackredTheme: ThemeSpec = {
  id: "blackred",
  label: "黑红编辑",
  description: "编辑性章节系统：H2 自动编号 + 红色 ◆ 分节符 + 8px 网格 + 图编号",
  swatch: "#991b1b",
  container:
    "max-width:677px;margin:0 auto;padding:32px 24px 56px;box-sizing:border-box;color:#2b2b28;background:#FAFAF7;font-family:'Noto Sans SC','PingFang SC','Microsoft YaHei',sans-serif;font-size:16px;line-height:1.95;",
  h1: "margin:0 0 24px;text-align:center;color:#0a0a0a;font-size:34px;font-weight:700;line-height:1.3;letter-spacing:-0.01em;font-family:'Noto Serif SC','Songti SC',STSong,Georgia,serif;",
  h2: "margin:24px 0 16px;color:#0a0a0a;font-size:24px;font-weight:700;line-height:1.42;letter-spacing:0.005em;font-family:'Noto Serif SC','Songti SC',STSong,Georgia,serif;",
  h3: "margin:20px 0 12px;color:#0a0a0a;font-size:18px;font-weight:600;line-height:1.44;letter-spacing:0.005em;font-family:'Noto Serif SC','Songti SC',STSong,Georgia,serif;",
  paragraph: "margin:0 0 16px;color:#2b2b28;font-size:16px;line-height:1.95;word-break:break-word;",
  mediaParagraph: "margin:0 0 16px;",
  blockquote:
    "margin:32px 0;padding:24px 44px;border-left:4px solid #991b1b;background:#fff9f9;color:#4a4a45;font-family:'Noto Serif SC','Songti SC',STSong,Georgia,serif;font-style:italic;font-size:16px;line-height:1.9;position:relative;border-radius:0 4px 4px 0;",
  blockquoteMarkBefore:
    "position:absolute;top:4px;left:12px;font-size:44px;color:#991b1b;opacity:0.15;font-family:Georgia,serif;",
  blockquoteMarkAfter:
    "position:absolute;bottom:-16px;right:16px;font-size:44px;color:#991b1b;opacity:0.15;font-family:Georgia,serif;",
  blockquoteParagraph: "margin:0;width:100%;",
  unorderedList: "margin:0 0 24px;padding-left:24px;color:#2b2b28;font-size:15.5px;line-height:1.95;",
  orderedList: "margin:0 0 24px;padding-left:24px;color:#2b2b28;font-size:15.5px;line-height:1.95;",
  listItem: "margin:0 0 8px;",
  link: "color:#0a0a0a;text-decoration:none;border-bottom:1px solid #991b1b;padding-bottom:1px;",
  inlineCode:
    "padding:1px 6px;border-radius:3px;background:#FAEDED;color:#991b1b;font-size:0.88em;font-weight:500;font-family:'JetBrains Mono','SF Mono',Menlo,Consolas,monospace;",
  preBlock:
    "margin:0 0 24px;max-width:100%;padding:16px 24px;overflow:hidden;border-radius:4px;border:1px solid #991b1b;background:#fafafa;color:#1a1a1a;font-size:13.5px;line-height:1.72;box-sizing:border-box;",
  preCode:
    "display:block;white-space:pre-wrap;word-break:break-word;overflow-wrap:anywhere;font-family:'JetBrains Mono','SF Mono',Menlo,Consolas,monospace;background:transparent;color:#1a1a1a;",
  hr: "display:block;margin:56px 0;padding:0;border:0;height:auto;background:transparent;text-align:center;color:#991b1b;font-size:14px;letter-spacing:0;font-family:'Noto Serif SC','Songti SC',STSong,Georgia,serif;line-height:1;",
  hrContent: "◆",
  strong: "font-weight:700;color:#0a0a0a;",
  em: "font-style:italic;",
  table: "width:100%;margin:0 0 24px;border-collapse:collapse;font-size:14.5px;line-height:1.8;",
  tableHead:
    "padding:12px 16px;background:#FAFAF7;color:#0a0a0a;text-align:left;font-weight:600;border-bottom:2px solid #0a0a0a;letter-spacing:0.01em;",
  tableCell: "padding:12px 16px;color:#2b2b28;border-bottom:1px solid #E8E5DE;",
  image: "display:block;width:100%;max-width:100%;border-radius:2px;border:1px solid #E8E5DE;box-shadow:none;",
  caption:
    "display:block;margin-top:8px;color:#7c7c75;font-size:12.5px;line-height:1.7;text-align:center;font-style:italic;font-family:'Noto Serif SC','Songti SC',STSong,Georgia,serif;",
  topTag:
    "display:inline-block;margin:0 0 32px;color:#0a0a0a;font-family:'JetBrains Mono','SF Mono',Menlo,Consolas,monospace;font-size:11px;letter-spacing:0.32em;text-transform:uppercase;",
  headerContainer: "width:100%;margin:0 0 32px;border-collapse:collapse;border:none;line-height:1;",
  headerLine:
    "margin:0;border:none;border-top:2px solid rgba(153,27,27,0.22);width:100%;",
  headerText:
    "text-align:center;padding:0 12px;white-space:nowrap;color:#991b1b;font-family:'JetBrains Mono','SF Mono',Menlo,Consolas,monospace;font-size:11px;letter-spacing:0.32em;text-transform:uppercase;vertical-align:middle;",
  footerContainer: "width:100%;margin:32px 0 0;border-collapse:collapse;border:none;line-height:1;",
  headerFooterVisible: true,
  topDividerVisible: false,
  topDivider: "",
  topDividerLine: "",
  h1MarkBefore:
    "display:inline-block;vertical-align:middle;color:#991b1b;font-size:36px;font-weight:400;margin-right:12px;margin-top:-4px;",
  h1MarkAfter:
    "display:inline-block;vertical-align:middle;color:#991b1b;font-size:36px;font-weight:400;margin-left:12px;margin-top:-4px;",
  topTagLeadingBar:
    "display:inline-block;width:36px;height:1.5px;background:#991b1b;vertical-align:middle;margin-right:12px;",
  h2AutoNumber: {
    format: "{n} ／ ",
    style:
      "color:#991b1b;font-family:'JetBrains Mono','SF Mono',Menlo,Consolas,monospace;font-size:0.62em;font-weight:500;letter-spacing:0.14em;margin-right:10px;vertical-align:0.18em;",
  },
  h3PrefixMark: {
    content: "› ",
    style:
      "display:inline-block;color:#991b1b;font-family:'Noto Serif SC','Songti SC',STSong,Georgia,serif;font-weight:600;margin-right:6px;",
  },
  figurePrefix: {
    format: "Fig. {n} — ",
    style:
      "color:#991b1b;font-family:'JetBrains Mono','SF Mono',Menlo,Consolas,monospace;font-style:normal;font-size:0.92em;font-weight:500;letter-spacing:0.06em;margin-right:2px;",
  },
  syntaxTokenStyles: [
    [".hljs-comment, .hljs-quote", "color:#7c7c75;font-style:italic;"],
    [".hljs-keyword, .hljs-selector-tag, .hljs-literal, .hljs-name", "color:#991b1b;font-weight:600;"],
    [".hljs-string, .hljs-doctag, .hljs-template-tag, .hljs-template-variable", "color:#15803d;"],
    [".hljs-title, .hljs-title.class_, .hljs-title.class_.inherited__", "color:#1e40af;"],
    [".hljs-number, .hljs-symbol, .hljs-bullet, .hljs-variable, .hljs-meta", "color:#b45309;"],
    [".hljs-built_in, .hljs-type, .hljs-class", "color:#7f1d1d;"],
    [".hljs-attr, .hljs-attribute, .hljs-regexp, .hljs-link", "color:#1e40af;"],
    [".hljs-function .hljs-title, .hljs-title.function_", "color:#1e40af;"],
    [".hljs-params", "color:#7c7c75;"],
  ],
};

export const themes: Record<ThemeId, ThemeSpec> = {
  classic: classicTheme,
  blackred: blackredTheme,
};

export const themeList: ThemeSpec[] = [classicTheme, blackredTheme];

export const defaultThemeId: ThemeId = "classic";

export function getTheme(id: ThemeId | string | null | undefined): ThemeSpec {
  if (id && (id === "classic" || id === "blackred")) {
    return themes[id];
  }
  return themes[defaultThemeId];
}
