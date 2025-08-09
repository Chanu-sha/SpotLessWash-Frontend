import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      injectRegister: "auto",
      registerType: "autoUpdate",
      devOptions: {
        enabled: true,
      },
      workbox: {
        globDirectory: "dist",
        globPatterns: [
          "**/*.{js,css,html,ico,png,svg,jpg,jpeg,woff2}",
          "assets/**/*.{png,jpg,jpeg,svg,webp}",
        ],
        navigateFallback: "/index.html",
      },
      manifest: {
        id: "/",
        scope: "/",
        name: "Spotless Wash",
        short_name: "Spotless",
        description: "Spotless is a modern Laundry booking and management app.",
        start_url: "/",
        display: "standalone",
        display_override: ["standalone", "fullscreen"],
        orientation: "portrait",
        background_color: "#ffffff",
        theme_color: "#000000",
        launch_handler: {
          client_mode: "auto",
        },
        icons: [
          {
            src: "logo192.png",
            sizes: "192x192",
            type: "image/png",
          },
          {
            src: "logo512.png",
            sizes: "512x512",
            type: "image/png",
          },
          {
            src: "icon-maskable.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "maskable",
          },
        ],
        screenshots: [
          {
            src: "screenshots/screen1.png",
            type: "image/png",
            sizes: "540x720",
          },
          {
            src: "screenshots/screen2.png",
            type: "image/png",
            sizes: "540x720",
          },
        ],
      },
    }),
  ],
});
