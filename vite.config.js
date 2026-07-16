import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { viteSingleFile } from "vite-plugin-singlefile";
import { resolve } from "path";

// Build the whole app into ONE self-contained index.html (JS + CSS inlined).
// This serves correctly from GitHub Pages no matter how Pages is configured.
export default defineConfig({
  base: "/",
  plugins: [react(), viteSingleFile()],
  build: {
    rollupOptions: { input: resolve(__dirname, "index.dev.html") },
    assetsInlineLimit: 100000000,
    cssCodeSplit: false,
  },
});
