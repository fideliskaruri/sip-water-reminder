import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { VitePWA } from "vite-plugin-pwa";

// Served from a GitHub Pages project site, so everything lives under this path.
const base = "/sip-water-reminder/";

export default defineConfig({
  base,
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: ["apple-touch-icon-180.png", "favicon.svg"],
      manifest: {
        name: "Sip — Water Reminder",
        short_name: "Sip",
        description: "Stay hydrated with gentle reminders and a delightful water tracker.",
        theme_color: "#2f8fff",
        background_color: "#eaf4ff",
        display: "standalone",
        orientation: "portrait",
        start_url: base,
        scope: base,
        icons: [
          { src: "pwa-192.png", sizes: "192x192", type: "image/png" },
          { src: "pwa-512.png", sizes: "512x512", type: "image/png" },
          {
            src: "pwa-maskable-512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "maskable",
          },
        ],
      },
      workbox: {
        globPatterns: ["**/*.{js,css,html,svg,png,woff2}"],
        navigateFallback: base + "index.html",
      },
    }),
  ],
  server: { host: true, port: 5173 },
});
