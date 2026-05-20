import html2canvas from "html2canvas";

export async function copyPreviewAsImage(): Promise<void> {
  const element = document.querySelector(".preview-phone__article") as HTMLElement;
  if (!element) {
    throw new Error("找不到预览区域对应的 DOM 元素");
  }

  // 1. 创建一个克隆节点
  const clone = element.cloneNode(true) as HTMLElement;

  // 2. 将克隆节点移出屏幕外，但保持可见状态以允许 html2canvas 渲染
  clone.style.position = "absolute";
  clone.style.left = "-9999px";
  clone.style.top = "0";
  clone.style.width = element.clientWidth + "px";
  clone.style.boxShadow = "none";
  clone.style.border = "none";
  clone.style.borderRadius = "0";

  // 3. 将克隆节点挂载到 body 下
  document.body.appendChild(clone);

  try {
    // 4. 对克隆节点进行截图，避免影响真实的滚动容器
    const canvas = await html2canvas(clone, {
      useCORS: true,
      allowTaint: true,
      scale: 2,
      backgroundColor: null,
      logging: false,
      scrollX: 0,
      scrollY: 0,
    });

    // 5. 移出克隆节点
    document.body.removeChild(clone);

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
    // 确保即使出错也清理克隆节点
    if (clone.parentNode) {
      document.body.removeChild(clone);
    }
    throw err;
  }
}
