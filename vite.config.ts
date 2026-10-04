import path from "node:path";
import { fileURLToPath } from "node:url";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "vite";

const root = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  root: path.join(root, "app"),
  publicDir: path.join(root, "app", "public"),
  plugins: [react(), tailwindcss()],
  resolve: { alias: { "@": path.join(root, "app", "src") } },
  build: { outDir: path.join(root, "dist-site"), emptyOutDir: true },
});
