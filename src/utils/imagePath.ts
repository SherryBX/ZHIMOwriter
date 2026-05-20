function isWindowsAbsolutePath(src: string) {
  return /^[A-Za-z]:[\\/]/.test(src);
}

function isWindowsFileUrl(src: string) {
  return /^file:(\/\/\/|\/\/localhost\/|\/)[A-Za-z]:/i.test(src);
}

function safeDecode(value: string) {
  try {
    return decodeURI(value);
  } catch {
    return value;
  }
}

export function normalizeMarkdownImageSource(src: string) {
  let normalized = src.trim();

  if (normalized.startsWith("<") && normalized.endsWith(">")) {
    normalized = normalized.slice(1, -1);
  }

  normalized = safeDecode(normalized).replace(/%5C/gi, "\\");

  if (isWindowsFileUrl(normalized)) {
    normalized = normalized.replace(/^file:(\/\/\/|\/\/localhost\/|\/)/i, "");
  }

  return normalized.replaceAll("\\", "/");
}

export function isLocalAbsoluteImagePath(src: string) {
  const normalized = normalizeMarkdownImageSource(src);
  return normalized.startsWith("/@fs/") || normalized.startsWith("/__local-image?") || isWindowsAbsolutePath(normalized);
}

export function isRemoteImageUrl(src: string) {
  const normalized = normalizeMarkdownImageSource(src);
  return /^(https?:)?\/\//i.test(normalized);
}

export function resolvePreviewImageSrc(src: string) {
  const normalized = normalizeMarkdownImageSource(src);

  if (normalized.startsWith("/@fs/") || normalized.startsWith("/__local-image?")) {
    return normalized;
  }

  if (!isWindowsAbsolutePath(normalized)) {
    return normalized;
  }

  return `/__local-image?path=${encodeURIComponent(normalized)}`;
}

const failedImageCache = new Set<string>();

export function markImageFailed(src: string) {
  failedImageCache.add(src);
}

export function isImageFailed(src: string) {
  return failedImageCache.has(src);
}

export function markImageSuccess(src: string) {
  failedImageCache.delete(src);
}
