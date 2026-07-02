import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { VitePWA } from "vite-plugin-pwa";

// base: "./" keeps asset + data URLs relative, so the app works whether it is
// served from the domain root or a GitHub Pages project subpath (/repo/).
export default defineConfig({
  base: "./",
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      // App shell auto-updates on each deploy (the Snapshot refreshes on a
      // 30-min cron, so users should never be stuck on a stale build).
      registerType: "autoUpdate",
      includeAssets: ["favicon.svg", "apple-touch-icon.png"],
      manifest: {
        name: "AI News Arcade",
        short_name: "AI News",
        description:
          "8-bit newsroom for the latest AI-lab announcements — bilingual EN/TH, works offline.",
        lang: "en",
        theme_color: "#0b0b1a",
        background_color: "#0b0b1a",
        display: "standalone",
        orientation: "portrait",
        // Relative so install works from a GitHub Pages project subpath.
        scope: "./",
        start_url: "./",
        icons: [
          { src: "pwa-192x192.png", sizes: "192x192", type: "image/png" },
          { src: "pwa-512x512.png", sizes: "512x512", type: "image/png" },
          {
            src: "maskable-512x512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "maskable",
          },
        ],
      },
      workbox: {
        // Precache the app shell only; the Snapshot's per-article JSON is cached
        // at runtime instead (there can be hundreds of files).
        globPatterns: ["**/*.{js,css,html,svg,png,woff2}"],
        globIgnores: ["**/data/**"],
        navigateFallback: "index.html",
        runtimeCaching: [
          {
            // Snapshot JSON (index + articles): serve cached instantly, refresh
            // in the background so the app opens offline after one visit.
            urlPattern: ({ url }) => url.pathname.includes("/data/"),
            handler: "StaleWhileRevalidate",
            options: {
              cacheName: "news-snapshot",
              expiration: { maxEntries: 500, maxAgeSeconds: 60 * 60 * 24 * 30 },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
          {
            // Google Fonts CSS + font files (the pixel/body typefaces).
            urlPattern: ({ url }) =>
              url.origin === "https://fonts.googleapis.com" ||
              url.origin === "https://fonts.gstatic.com",
            handler: "CacheFirst",
            options: {
              cacheName: "google-fonts",
              expiration: { maxEntries: 30, maxAgeSeconds: 60 * 60 * 24 * 365 },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
        ],
      },
      devOptions: { enabled: false },
    }),
  ],
});
