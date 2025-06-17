/// <reference types="vitest" />

import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import tailwindcss from "@tailwindcss/vite";

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    rollupOptions: {
      output: {
        // Manual chunk splitting for optimal lazy loading
        manualChunks: {
          // Core React libraries
          vendor: ["react", "react-dom"],

          // Routing
          routing: ["react-router-dom"],

          // Supabase client
          supabase: ["@supabase/supabase-js"],

          // UI framework components (always needed)
          "ui-core": [
            "@radix-ui/react-slot",
            "class-variance-authority",
            "clsx",
            "tailwind-merge",
          ],

          // Form-related libraries (lazy loaded with forms)
          forms: ["react-hook-form", "@hookform/resolvers", "zod"],

          // Dialog and modal components (lazy loaded)
          "ui-dialogs": [
            "@radix-ui/react-dialog",
            "@radix-ui/react-dropdown-menu",
            "@radix-ui/react-select",
          ],

          // Form input components (lazy loaded)
          "ui-forms": ["@radix-ui/react-checkbox", "@radix-ui/react-label"],

          // Icon library (large, lazy loaded)
          icons: ["lucide-react"],

          // Network requests (specific use cases)
          http: ["axios"],

          // Notifications (lazy loaded)
          notifications: ["sonner"],
        },

        // Optimize chunk loading
        chunkFileNames: (chunkInfo: { name?: string }) => {
          const name = chunkInfo.name || 'unknown';

          // Add hash for cache busting while keeping names readable
          if (name === "vendor") return "vendor-[hash].js";
          if (name === "routing") return "routing-[hash].js";
          if (name === "supabase") return "supabase-[hash].js";
          if (name.startsWith("ui-")) return `${name}-[hash].js`;
          if (name === "forms") return "forms-[hash].js";
          if (name === "icons") return "icons-[hash].js";
          if (name === "http") return "http-[hash].js";
          if (name === "notifications") return "notifications-[hash].js";

          return "[name]-[hash].js";
        },
      },
    },

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
    setupFiles: "./src/setupTests.ts",
  },
});
