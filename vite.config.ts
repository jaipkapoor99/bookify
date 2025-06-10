/// <reference types="vitest" />

import { defineConfig, type Plugin } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import tailwindcss from "@tailwindcss/vite";

// Import with type assertion to satisfy TypeScript
const debugPlugin = (() => {
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    return require("./vite-debug-plugin.js").default as () => Plugin;
  } catch {
    return () => ({ name: "debug-plugin-fallback" } as Plugin);
  }
})();

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    ...(process.env.DEBUG === "true" ? [debugPlugin()] : []),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: "./src/setupTests.ts",
  },
});
