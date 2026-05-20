import html2canvas from "html2canvas";

/**
 * 将公众号预览区域的 DOM 节点截取为一张高清晰度 PNG 图片，并写入系统剪贴板。
 */
export async function copyPreviewAsImage(): Promise<void> {
  const element = document.querySelector(".preview-phone__article") as HTMLElement;
  if (!element) {
    throw new Error("找不到预览区域对应的 DOM 元素");
  }

  // 保存原始样式，以便截图后恢复
  const originalBoxShadow = element.style.boxShadow;
  const originalBorder = element.style.border;
  const originalBorderRadius = element.style.borderRadius;

  // 临时去除阴影、边框、圆角，使导出的图片是一张干净的内容图
  element.style.boxShadow = "none";
  element.style.border = "none";
  element.style.borderRadius = "0";

  try {
    // 使用 html2canvas 进行截图
    // scale: 2 可以保证截图是 2 倍清晰度（比如宽度从 375px 提升到 750px 视网膜清晰度）
    const canvas = await html2canvas(element, {
      useCORS: true,
      allowTaint: true,
      scale: 2,
      backgroundColor: null, // 保持与 DOM 元素自身的背景色一致
      logging: false,
    });

    // 恢复原始样式
    element.style.boxShadow = originalBoxShadow;
    element.style.border = originalBorder;
    element.style.borderRadius = originalBorderRadius;

    return new Promise<void>((resolve, reject) => {
      canvas.toBlob(
        async (blob) => {
          if (!blob) {
            reject(new Error("图片转换 Blob 失败"));
            return;
          }

          try {
            if (!navigator.clipboard || !("write" in navigator.clipboard) || typeof ClipboardItem === "undefined") {
              reject(new Error("当前浏览器或协议不支持复制图片到剪贴板"));
              return;
            }

            const data = [new ClipboardItem({ "image/png": blob })];
            await navigator.clipboard.write(data);
            resolve();
          } catch (err) {
            reject(err);
          }
        },
        "image/png"
      );
    });
  } catch (err) {
    // 确保即使出错也恢复样式
    element.style.boxShadow = originalBoxShadow;
    element.style.border = originalBorder;
    element.style.borderRadius = originalBorderRadius;
    throw err;
  }
}
