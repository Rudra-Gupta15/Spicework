import { fileURLToPath, URL } from "node:url";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
  build: {
    /* Pages are bundled together on purpose (see src/routes) — the whole
       app is ~150 kB gzipped, so the split-chunk warning does not apply. */
    chunkSizeWarningLimit: 700,
  },
});
