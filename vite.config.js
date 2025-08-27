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
      devOptions: { enabled: true },
      workbox: {
        globPatterns: ["**/*.{js,css,html,ico,png,svg,jpg,jpeg,woff2,webp}"],
        navigateFallback: "/index.html",
      },
      manifest: {
        id: "/",
        scope: "/",
        name: "Spotless Wash",
        short_name: "Spotless",
        description: "Spotless is a modern Laundry booking and management app.",
        start_url: "/",
        display: "fullscreen", 
        display_override: ["fullscreen", "standalone"],
        orientation: "portrait",
        background_color: "#000000", 
        theme_color: "#000000",
        
        icons: [
          { src: "logo192.png", sizes: "192x192", type: "image/png" },
          { src: "logo512.png", sizes: "512x512", type: "image/png" },
          {
            src: "icon-maskable.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "maskable",
          },
        ],
      },
    }),
  ],
});
