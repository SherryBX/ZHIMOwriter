import fs from "node:fs";
import path from "node:path";

const mimeTypes = {
  ".apng": "image/apng",
  ".avif": "image/avif",
  ".gif": "image/gif",
  ".jpeg": "image/jpeg",
  ".jpg": "image/jpeg",
  ".png": "image/png",
  ".svg": "image/svg+xml",
  ".webp": "image/webp",
  ".bmp": "image/bmp",
  ".ico": "image/x-icon",
};

function isWindowsAbsolutePath(filePath) {
  return /^[A-Za-z]:[\\/]/.test(filePath);
}

function getImageContentType(filePath) {
  return mimeTypes[path.extname(filePath).toLowerCase()] ?? "application/octet-stream";
}

export function localImagePreviewPlugin() {
  return {
    name: "local-image-preview",
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        if (!req.url?.startsWith("/__local-image")) {
          next();
          return;
        }

        const requestUrl = new URL(req.url, "http://127.0.0.1");
        const rawPath = requestUrl.searchParams.get("path");

        if (!rawPath) {
          res.statusCode = 400;
          res.end("Missing path query");
          return;
        }

        const normalizedPath = decodeURIComponent(rawPath);

        if (!isWindowsAbsolutePath(normalizedPath)) {
          res.statusCode = 400;
          res.end("Only Windows absolute file paths are supported");
          return;
        }

        const resolvedPath = path.win32.normalize(normalizedPath);

        if (!fs.existsSync(resolvedPath)) {
          res.statusCode = 404;
          res.end("File not found");
          return;
        }

        const stat = fs.statSync(resolvedPath);

        if (!stat.isFile()) {
          res.statusCode = 400;
          res.end("Target is not a file");
          return;
        }

        res.statusCode = 200;
        res.setHeader("Content-Type", getImageContentType(resolvedPath));
        res.setHeader("Cache-Control", "public, max-age=3600");
        res.setHeader("Last-Modified", stat.mtime.toUTCString());

        const stream = fs.createReadStream(resolvedPath);
        stream.on("error", () => {
          if (!res.headersSent) {
            res.statusCode = 500;
          }
          res.end("Unable to read local image");
        });
        stream.pipe(res);
      });
    },
  };
}
