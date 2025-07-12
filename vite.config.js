import path from "path";
import { fileURLToPath } from "url";
import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react-swc";
import tailwindcss from "@tailwindcss/vite";
import compression from "vite-plugin-compression2";
import { VitePWA } from "vite-plugin-pwa";
import { createEnv } from "@t3-oss/env-core";
import { z } from "zod";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default defineConfig(({ mode }) => {
  const envVars = loadEnv(mode, __dirname, "");

  const env = createEnv({
    clientPrefix: "VITE_",
    emptyStringAsUndefined: true,

    server: {
      SERVER_URL: z.string().url().optional(),
      API_SECRET: z.string().min(1),
    },

    client: {
      VITE_APP_TITLE: z.string().min(1).optional(),
      VITE_PORT: z.coerce.number().optional(),
      VITE_NODE_ENV: z.enum(["development", "production", "test"]).optional(),
    },

    runtimeEnv: {
      SERVER_URL: envVars.SERVER_URL,
      API_SECRET: envVars.API_SECRET,
      VITE_APP_TITLE: envVars.VITE_APP_TITLE,
      VITE_PORT: envVars.VITE_PORT,
      VITE_NODE_ENV: envVars.VITE_NODE_ENV,
    },
  });

  return {
    build: {
      chunkSizeWarningLimit: 1000,
      rollupOptions: {
        output: {
          manualChunks: {
            // Core React dependencies
            vendor: ["react", "react-dom"],

            // TanStack ecosystem
            tanstack: [
              "@tanstack/react-router",
              "@tanstack/react-query",
              "@tanstack/react-table",
            ],

            // UI components
            radix: [
              "@radix-ui/react-dialog",
              "@radix-ui/react-dropdown-menu",
              "@radix-ui/react-popover",
              "@radix-ui/react-select",
              "@radix-ui/react-tabs",
              "@radix-ui/react-tooltip",
              "@radix-ui/react-checkbox",
              "@radix-ui/react-label",
              "@radix-ui/react-switch",
              "@radix-ui/react-avatar",
              "@radix-ui/react-alert-dialog",
            ],

            // Chart libraries
            charts: ["recharts"],

            // Animation libraries
            motion: ["framer-motion"],

            // DnD libraries
            dnd: [
              "@dnd-kit/core",
              "@dnd-kit/sortable",
              "@dnd-kit/modifiers",
              "@dnd-kit/utilities",
            ],

            // Form libraries
            forms: ["react-hook-form", "@hookform/resolvers", "zod"],

            // Date libraries
            dates: ["date-fns"],

            // Utility libraries
            utils: [
              "lodash-es",
              "clsx",
              "class-variance-authority",
              "tailwind-merge",
            ],

            // PDF and file handling
            pdf: ["jspdf", "jspdf-autotable", "pdf-lib", "html2canvas"],

            // Other large dependencies
            misc: [
              "print-js",
              "papaparse",
              "xlsx",
              "match-sorter",
              "encrypt-storage",
            ],
          },
        },
        onwarn(warning, defaultHandler) {
          if (warning.code === "SOURCEMAP_ERROR") {
            return;
          }
          defaultHandler(warning);
        },
      },
    },
    plugins: [
      react(),
      tailwindcss(),
      compression({
        algorithm: "brotliCompress",
        exclude: [/\.(br)$/, /\.(gz)$/],
      }),
      VitePWA({
        registerType: "autoUpdate",
        includeAssets: ["vite.svg"],
        manifest: {
          name: "E-nauli Bima CRM",
          short_name: "E-nauli CRM",
          description: "E-nauli Bima Customer Relationship Management System",
          theme_color: "#ffffff",
          background_color: "#ffffff",
          display: "standalone",
          start_url: "/",
          icons: [
            {
              src: "vite.svg",
              sizes: "192x192",
              type: "image/svg+xml",
            },
          ],
        },
        workbox: {
          globPatterns: ["**/*.{js,css,html,ico,png,svg}"],
          runtimeCaching: [
            {
              urlPattern: /^https:\/\/api\./,
              handler: "NetworkFirst",
              options: {
                cacheName: "api-cache",
                cacheableResponse: {
                  statuses: [0, 200],
                },
              },
            },
          ],
        },
      }),
    ],
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
      extensions: [".js", ".ts", ".jsx", ".tsx"],
    },
    server: {
      watch: {
        usePolling: true,
      },
      host: true,
      port: env.VITE_PORT ?? 5173,
      strictPort: true,
      cors: true,
    },
    esbuild: {
      supported: {
        "top-level-await": true,
      },
    },
    define: {
      __API_BASE__: JSON.stringify(env.SERVER_URL ?? ""),
      __APP_TITLE__: JSON.stringify(env.VITE_APP_TITLE ?? ""),
      VITE_NODE_ENV: JSON.stringify(env.VITE_NODE_ENV ?? "development"),
    },
  };
});
