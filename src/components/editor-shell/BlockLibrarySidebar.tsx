const writingGuides = [
  {
    title: "推荐结构",
    items: ["标题开场", "三段式重点", "场景化描述", "明确转化结尾"],
  },
  {
    title: "排版提醒",
    items: ["一屏一重点", "段落不宜过长", "列表优先短句", "引用用于提气"],
  },
];

function BlockLibrarySidebar() {
  return (
    <aside className="sidebar-panel" aria-label="写作辅助侧栏">
      <div className="panel-heading">
        <p className="panel-kicker">GUIDE</p>
        <h2>写作辅助</h2>
      </div>
      <div className="sidebar-groups">
        {writingGuides.map((group) => (
          <section className="sidebar-group" key={group.title}>
            <h3>{group.title}</h3>
            <div className="sidebar-tags">
              {group.items.map((item) => (
                <span key={item} className="guide-chip">
                  {item}
                </span>
              ))}
            </div>
          </section>
        ))}
      </div>
    </aside>
  );
}

export default BlockLibrarySidebar;
