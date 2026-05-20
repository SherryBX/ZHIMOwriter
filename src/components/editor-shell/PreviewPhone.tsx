import { useEffect, useMemo, useRef } from "react";
import { renderPreviewHtml } from "../../utils/markdownRenderer";
import { isImageFailed, markImageFailed, markImageSuccess } from "../../utils/imagePath";
import { defaultThemeId, type ThemeId } from "../../themes/themes";

type PreviewPhoneProps = {
  markdown: string;
  theme?: ThemeId;
  articleLabel?: string;
};

function PreviewPhone({ markdown, theme = defaultThemeId, articleLabel }: PreviewPhoneProps) {
  const articleRef = useRef<HTMLElement>(null);
  const previewHtml = useMemo(() => renderPreviewHtml(markdown, theme, articleLabel), [markdown, theme, articleLabel]);

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

      const src = image.getAttribute("src") || "";

      const markLoaded = () => {
        wrapper.classList.remove("is-failed");
        image.style.removeProperty("display");
        markImageSuccess(src);
      };

      const markFailed = () => {
        wrapper.classList.add("is-failed");
        image.style.setProperty("display", "none");
        markImageFailed(src);
      };

      if (isImageFailed(src)) {
        markFailed();
        continue;
      }

      image.addEventListener("load", markLoaded);
      image.addEventListener("error", markFailed);
      cleanups.push(() => {
        image.removeEventListener("load", markLoaded);
        image.removeEventListener("error", markFailed);
      });

      if (image.complete) {
        if (image.naturalWidth > 0) {
          markLoaded();
        } else if (image.naturalWidth === 0 && image.src) {
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
    <article
      ref={articleRef}
      className="preview-phone__article"
      data-theme={theme}
      dangerouslySetInnerHTML={{ __html: previewHtml }}
    />
  );
}

export default PreviewPhone;
