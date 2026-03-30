import PreviewPhone from "./PreviewPhone";

type PreviewPanelProps = {
  markdown: string;
};

function PreviewPanel({ markdown }: PreviewPanelProps) {
  return (
    <section className="preview-panel" aria-label="\u516c\u4f17\u53f7\u9884\u89c8\u533a">
      <div className="panel-heading">
        <p className="panel-kicker">PREVIEW</p>
        <h2>{"\u5fae\u4fe1\u6587\u7ae0\u9884\u89c8"}</h2>
      </div>
      <PreviewPhone markdown={markdown} />
    </section>
  );
}

export default PreviewPanel;
