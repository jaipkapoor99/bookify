/// <reference types="vitest" />

import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import tailwindcss from "@tailwindcss/vite";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    // Optimize build settings
    target: "esnext",
    minify: "esbuild",

    // Split large chunks
    chunkSizeWarningLimit: 1000,
  },

  // Development server optimizations
  server: {
    fs: {
      // Allow serving files from one level up to enable module resolution
      allow: [".."],
    },
  },

  // Optimize dependency pre-bundling - FIXED: Include Supabase for proper ESM handling
  optimizeDeps: {
    include: [
      "react",
      "react-dom",
      "react-router-dom",
      "@supabase/supabase-js",
      "@supabase/postgrest-js",
      "@supabase/realtime-js",
      "@supabase/storage-js",
      "@supabase/gotrue-js",
    ],
    exclude: [
      // Only exclude truly large dependencies that should be lazy loaded
      "lucide-react",
    ],
    // Force ESM for Supabase modules
    esbuildOptions: {
      target: "esnext",
    },
  },

  // Add ESM compatibility
  define: {
    global: "globalThis",
  },

  test: {
    globals: true,
    environment: "jsdom",
    // setupFiles: "./src/setupTests.ts",
  },
});
