import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  base: "./",
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
        name: "Spotless Wash",
        short_name: "Spotless",
        start_url: "/",
        display: "standalone",
        background_color: "#ffffff",
        theme_color: "#000000",
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
        ],
      },
    }),
  ],
  server: {
    proxy: {
      "/api": "http://localhost:5000",
    },
  },
});
