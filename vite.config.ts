import react from "@vitejs/plugin-react";
import { defineConfig } from "vitest/config";
import { localImagePreviewPlugin } from "./vite.local-image-plugin.js";

export default defineConfig({
  plugins: [react(), localImagePreviewPlugin()],
  server: {
    fs: {
      // Local-first editor: allow previewing images from absolute paths outside the workspace.
      strict: false,
    },
  },
  test: {
    environment: "jsdom",
    setupFiles: "./src/test/setup.ts",
  },
});
