// Vite config for Capacitor SPA build (no SSR, produces dist/ with index.html)
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "path";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    outDir: "dist-capacitor",
    emptyOutDir: true,
    rollupOptions: {
      input: path.resolve(__dirname, "capacitor.html"),
    },
  },
});
