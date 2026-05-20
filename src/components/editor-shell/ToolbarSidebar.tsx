import { useState, useEffect, useRef, type RefObject } from "react";

/* ─── Types ─── */

type SnippetDef = {
  id: string;
  label: string;
  defaultContent: string;
  editable?: boolean; // true = user can edit the display text
  isRaw?: boolean;    // true = insert as raw markdown, no style wrapper
};

type SnippetGroup = {
  id: string;
  title: string;
  iconType: "info" | "structure" | "guide" | "footer" | "custom";
  items: SnippetDef[];
};

/* ─── Subtle inline style for inserted metadata (left-aligned, light gray) ─── */

const metaStyle =
  "text-align:left;color:#b5b5ad;font-size:13px;letter-spacing:0.05em;line-height:2;margin:4px 0;";

const footerStyle =
  "text-align:left;color:#b5b5ad;font-size:12px;letter-spacing:0.04em;line-height:2;margin:4px 0;";

/* ─── Default snippet groups ─── */

const defaultGroups: SnippetGroup[] = [
  {
    id: "meta",
    title: "文章信息",
    iconType: "info",
    items: [
      { id: "meta-author", label: "作者署名", defaultContent: "作者 ｜ 智茉编辑部", editable: true },
      { id: "meta-editor", label: "主编", defaultContent: "主编 ｜ XXX", editable: true },
      { id: "meta-reviewer", label: "责任编辑", defaultContent: "责编 ｜ XXX", editable: true },
      { id: "meta-auditor", label: "审核", defaultContent: "审核 ｜ XXX", editable: true },
      { id: "meta-source", label: "来源声明", defaultContent: "本文由智茉原创发布 · 转载请注明出处", editable: true },
    ],
  },
  {
    id: "structure",
    title: "内容结构",
    iconType: "structure",
    items: [
      { id: "struct-hr", label: "分割线", defaultContent: "---", isRaw: true },
      { id: "struct-quote", label: "引用块", defaultContent: "> 在这里输入引用内容", isRaw: true },
      { id: "struct-h2", label: "二级标题", defaultContent: "## 标题内容", isRaw: true },
      { id: "struct-h3", label: "三级标题", defaultContent: "### 标题内容", isRaw: true },
      { id: "struct-ul", label: "无序列表", defaultContent: "- 列表项 1\n- 列表项 2\n- 列表项 3", isRaw: true },
      { id: "struct-ol", label: "有序列表", defaultContent: "1. 第一步\n2. 第二步\n3. 第三步", isRaw: true },
    ],
  },
  {
    id: "cta",
    title: "互动引导",
    iconType: "guide",
    items: [
      { id: "cta-follow", label: "关注引导", defaultContent: "▲ 点击上方蓝字关注我们", editable: true },
      { id: "cta-like", label: "在看引导", defaultContent: "觉得有用？点个「在看」让更多人看到 ↓", editable: true },
      { id: "cta-comment", label: "留言互动", defaultContent: "留言话题 ｜ 你对这个话题有什么看法？", editable: true },
      { id: "cta-share", label: "转发引导", defaultContent: "好内容值得分享 · 转发给需要的朋友", editable: true },
    ],
  },
  {
    id: "footer",
    title: "文末信息",
    iconType: "footer",
    items: [
      { id: "foot-copyright", label: "版权声明", defaultContent: "© 2026 智茉工作室 · 版权所有", editable: true },
      { id: "foot-contact", label: "联系方式", defaultContent: "商务合作 ｜ business@zhimo.com", editable: true },
      { id: "foot-recommend", label: "往期推荐", defaultContent: "### 往期精选\n\n- [文章标题一](链接)\n- [文章标题二](链接)\n- [文章标题三](链接)", isRaw: true },
    ],
  },
];

/* ─── LocalStorage ─── */

const OVERRIDES_KEY = "zhimo:snippet-overrides";
const CUSTOM_KEY = "zhimo:custom-snippets";

type CustomSnippet = { id: string; label: string; content: string };

function loadOverrides(): Record<string, string> {
  try {
    const raw = localStorage.getItem(OVERRIDES_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch { return {}; }
}

function saveOverrides(overrides: Record<string, string>) {
  try { localStorage.setItem(OVERRIDES_KEY, JSON.stringify(overrides)); } catch { /* */ }
}

function loadCustomSnippets(): CustomSnippet[] {
  try {
    const raw = localStorage.getItem(CUSTOM_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
}

function saveCustomSnippets(items: CustomSnippet[]) {
  try { localStorage.setItem(CUSTOM_KEY, JSON.stringify(items)); } catch { /* */ }
}

/* ─── Icon component ─── */

function RailIcon({ type }: { type: SnippetGroup["iconType"] }) {
  return <span className={`toolbar-rail-icon toolbar-rail-icon--${type}`} />;
}

/* ─── Build final markdown for insertion ─── */

function buildInsertText(content: string, isRaw: boolean): string {
  if (isRaw) return content;
  const style = content.length < 30 ? metaStyle : footerStyle;
  return `<section style="${style}">${content}</section>`;
}

/* ─── Component ─── */

type ToolbarSidebarProps = {
  editorRef: RefObject<HTMLTextAreaElement | null>;
  markdown: string;
  onChange: (value: string) => void;
};

function ToolbarSidebar({ editorRef, markdown, onChange }: ToolbarSidebarProps) {
  const [activeGroup, setActiveGroup] = useState<string | null>(null);
  const [overrides, setOverrides] = useState<Record<string, string>>(() => loadOverrides());
  const [customSnippets, setCustomSnippets] = useState<CustomSnippet[]>(() => loadCustomSnippets());

  // Editing state for existing presets
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");
  const editInputRef = useRef<HTMLInputElement>(null);

  // Adding state for custom presets
  const [isAdding, setIsAdding] = useState(false);
  const [newLabel, setNewLabel] = useState("");
  const [newContent, setNewContent] = useState("");
  const addLabelRef = useRef<HTMLInputElement>(null);

  useEffect(() => { saveOverrides(overrides); }, [overrides]);
  useEffect(() => { saveCustomSnippets(customSnippets); }, [customSnippets]);
  useEffect(() => { if (editingId) editInputRef.current?.focus(); }, [editingId]);
  useEffect(() => { if (isAdding) addLabelRef.current?.focus(); }, [isAdding]);

  /* ── Get the resolved content for a snippet ── */
  function getResolvedContent(item: SnippetDef): string {
    return overrides[item.id] ?? item.defaultContent;
  }

  /* ── Smart insert: no double blank lines, no page jump ── */
  function insertSnippet(text: string) {
    const textarea = editorRef.current;
    if (!textarea) {
      onChange(markdown + "\n" + text + "\n");
      return;
    }

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const before = markdown.slice(0, start);
    const after = markdown.slice(end);
    const scrollTop = textarea.scrollTop;

    // Smart prefix: ensure one blank line before, but no extra
    let prefix = "";
    if (before.length > 0) {
      if (before.endsWith("\n\n")) prefix = "";
      else if (before.endsWith("\n")) prefix = "\n";
      else prefix = "\n\n";
    }

    // Smart suffix: ensure one blank line after
    let suffix = "";
    if (after.length > 0) {
      if (after.startsWith("\n\n")) suffix = "";
      else if (after.startsWith("\n")) suffix = "\n";
      else suffix = "\n\n";
    } else {
      suffix = "\n";
    }

    const fullSnippet = prefix + text + suffix;
    onChange(before + fullSnippet + after);

    requestAnimationFrame(() => {
      textarea.scrollTop = scrollTop;
      textarea.focus();
      const newPos = start + fullSnippet.length;
      textarea.setSelectionRange(newPos, newPos);
    });
  }

  /* ── Editing handlers ── */
  function startEdit(id: string, currentContent: string) {
    setEditingId(id);
    setEditValue(currentContent);
  }

  function saveEdit() {
    if (editingId && editValue.trim()) {
      setOverrides((prev) => ({ ...prev, [editingId]: editValue.trim() }));
    }
    setEditingId(null);
    setEditValue("");
  }

  function cancelEdit() {
    setEditingId(null);
    setEditValue("");
  }

  /* ── Custom snippet handlers ── */
  function handleAddCustom() {
    const label = newLabel.trim();
    const content = newContent.trim();
    if (!label || !content) return;
    setCustomSnippets((prev) => [...prev, { id: `custom-${Date.now()}`, label, content }]);
    setNewLabel("");
    setNewContent("");
    setIsAdding(false);
  }

  function handleDeleteCustom(id: string) {
    setCustomSnippets((prev) => prev.filter((s) => s.id !== id));
  }

  /* ── Build all groups ── */
  const allGroups: SnippetGroup[] = [
    ...defaultGroups,
    {
      id: "custom",
      title: "我的预设",
      iconType: "custom" as const,
      items: customSnippets.map((s) => ({
        id: s.id,
        label: s.label,
        defaultContent: s.content,
        editable: true,
      })),
    },
  ];

  const activeGroupData = allGroups.find((g) => g.id === activeGroup);
  const isCustomActive = activeGroup === "custom";

  return (
    <aside className="toolbar-sidebar" aria-label="快捷工具栏">
      {/* Icon rail */}
      <nav className="toolbar-sidebar__rail">
        {allGroups.map((group) => (
          <button
            key={group.id}
            className={`toolbar-sidebar__rail-btn${activeGroup === group.id ? " is-active" : ""}`}
            title={group.title}
            aria-pressed={activeGroup === group.id}
            onClick={() => setActiveGroup((p) => (p === group.id ? null : group.id))}
          >
            <RailIcon type={group.iconType} />
          </button>
        ))}
      </nav>

      {/* Expanded panel */}
      {activeGroupData && (
        <div className="toolbar-sidebar__panel">
          <div className="toolbar-sidebar__panel-header">
            <span className="toolbar-sidebar__panel-title">{activeGroupData.title}</span>
            <button
              className="toolbar-sidebar__panel-close"
              onClick={() => setActiveGroup(null)}
              aria-label="关闭面板"
            >×</button>
          </div>

          <div className="toolbar-sidebar__panel-items">
            {activeGroupData.items.map((item) => {
              const resolvedContent = getResolvedContent(item);
              const isEditing = editingId === item.id;

              if (isEditing) {
                return (
                  <div key={item.id} className="toolbar-sidebar__edit-row">
                    <input
                      ref={editInputRef}
                      className="toolbar-sidebar__edit-input"
                      value={editValue}
                      onChange={(e) => setEditValue(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") saveEdit();
                        if (e.key === "Escape") cancelEdit();
                      }}
                    />
                    <div className="toolbar-sidebar__edit-actions">
                      <button className="toolbar-sidebar__edit-save" onClick={saveEdit}>保存</button>
                      <button className="toolbar-sidebar__edit-cancel" onClick={cancelEdit}>取消</button>
                    </div>
                  </div>
                );
              }

              return (
                <div key={item.id} className="toolbar-sidebar__snippet-row">
                  <button
                    className="toolbar-sidebar__snippet-btn"
                    onClick={() => insertSnippet(buildInsertText(resolvedContent, !!item.isRaw))}
                    title={`插入「${item.label}」`}
                  >
                    <span className="toolbar-sidebar__snippet-dot" />
                    <span className="toolbar-sidebar__snippet-label">{item.label}</span>
                  </button>
                  {item.editable && (
                    <button
                      className="toolbar-sidebar__snippet-edit"
                      onClick={() => startEdit(item.id, resolvedContent)}
                      title="编辑内容"
                      aria-label={`编辑 ${item.label}`}
                    >
                      <span className="toolbar-sidebar__pencil-icon" />
                    </button>
                  )}
                  {isCustomActive && (
                    <button
                      className="toolbar-sidebar__snippet-delete"
                      onClick={() => handleDeleteCustom(item.id)}
                      title="删除"
                      aria-label={`删除 ${item.label}`}
                    >×</button>
                  )}
                </div>
              );
            })}

            {isCustomActive && activeGroupData.items.length === 0 && !isAdding && (
              <div className="toolbar-sidebar__empty">暂无自定义预设</div>
            )}

            {isCustomActive && isAdding && (
              <div className="toolbar-sidebar__add-form">
                <input
                  ref={addLabelRef}
                  className="toolbar-sidebar__add-input"
                  placeholder="预设名称"
                  value={newLabel}
                  onChange={(e) => setNewLabel(e.target.value)}
                />
                <input
                  className="toolbar-sidebar__add-input"
                  placeholder="插入内容"
                  value={newContent}
                  onChange={(e) => setNewContent(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleAddCustom()}
                />
                <div className="toolbar-sidebar__add-actions">
                  <button className="toolbar-sidebar__add-save" onClick={handleAddCustom} disabled={!newLabel.trim() || !newContent.trim()}>保存</button>
                  <button className="toolbar-sidebar__add-cancel" onClick={() => { setIsAdding(false); setNewLabel(""); setNewContent(""); }}>取消</button>
                </div>
              </div>
            )}

            {isCustomActive && !isAdding && (
              <button className="toolbar-sidebar__add-btn" onClick={() => setIsAdding(true)}>
                <span className="toolbar-sidebar__add-plus">+</span>
                <span>添加预设</span>
              </button>
            )}
          </div>
        </div>
      )}
    </aside>
  );
}

export default ToolbarSidebar;
