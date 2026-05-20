import { type RefObject, type WheelEvent } from "react";
import PreviewPhone from "./PreviewPhone";
import type { ThemeId } from "../../themes/themes";

type PreviewPanelProps = {
  markdown: string;
  theme: ThemeId;
  articleLabel: string;
  scrollRef: RefObject<HTMLDivElement | null>;
  onScroll: () => void;
  onWheel: (event: WheelEvent<HTMLDivElement>) => void;
};

function PreviewPanel({ markdown, theme, articleLabel, scrollRef, onScroll, onWheel }: PreviewPanelProps) {
  return (
    <section className="preview-panel" aria-label="公众号预览区">
      <div className="panel-heading">
        <p className="panel-kicker">PREVIEW</p>
        <h2>{"\u5fae\u4fe1\u6587\u7ae0\u9884\u89c8"}</h2>
      </div>
      <div className="preview-surface">
        <div className="preview-surface__topbar">
          <span>preview</span>
          <span>wechat ready</span>
        </div>
        <div 
          className="preview-surface__content"
          ref={scrollRef}
          onScroll={onScroll}
          onWheel={onWheel}
        >
          <PreviewPhone markdown={markdown} theme={theme} articleLabel={articleLabel} />
        </div>
      </div>
    </section>
  );
}

export default PreviewPanel;
