import { useEffect, useMemo, useRef } from "react";
import { renderPreviewHtml } from "../../utils/markdownRenderer";

type PreviewPhoneProps = {
  markdown: string;
};

function PreviewPhone({ markdown }: PreviewPhoneProps) {
  const articleRef = useRef<HTMLElement>(null);
  const previewHtml = useMemo(() => renderPreviewHtml(markdown), [markdown]);

  useEffect(() => {
    const article = articleRef.current;

    if (!article) {
      return;
    }

    const cleanups: Array<() => void> = [];

    for (const image of article.querySelectorAll<HTMLImageElement>(".preview-phone__figure img")) {
      const wrapper = image.closest<HTMLElement>(".preview-phone__figure");

      if (!wrapper) {
        continue;
      }

      const markLoaded = () => {
        wrapper.classList.remove("is-failed");
        image.style.removeProperty("display");
      };
      const markFailed = () => {
        wrapper.classList.add("is-failed");
        image.style.setProperty("display", "none");
      };

      image.addEventListener("load", markLoaded);
      image.addEventListener("error", markFailed);
      cleanups.push(() => {
        image.removeEventListener("load", markLoaded);
        image.removeEventListener("error", markFailed);
      });

      wrapper.classList.remove("is-failed");

      if (image.complete) {
        if (image.naturalWidth > 0) {
          markLoaded();
        } else {
          markFailed();
        }
      }
    }

    return () => {
      for (const cleanup of cleanups) {
        cleanup();
      }
    };
  }, [previewHtml]);

  return (
    <div className="preview-phone">
      <div className="preview-phone__bar">
        <span />
        <span />
        <span />
      </div>
      <article
        ref={articleRef}
        className="preview-phone__article"
        dangerouslySetInnerHTML={{ __html: previewHtml }}
      />
    </div>
  );
}

export default PreviewPhone;
