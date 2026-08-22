import { defineConfig } from "vite";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  base: "/",
  plugins: [
    VitePWA({
      strategies: "injectManifest",
      srcDir: "src",
      filename: "sw.ts",
      injectRegister: "auto",
      registerType: "autoUpdate",
      manifest: {
        name: "Laters",
        short_name: "Laters",
        description: "A quiet, local-first queue for articles to read later.",
        lang: "en-GB",
        id: "/",
        start_url: "/",
        scope: "/",
        display: "standalone",
        background_color: "#f3efe7",
        theme_color: "#f3efe7",
        categories: ["productivity", "utilities"],
        icons: [
          {
            src: "/icons/laters-192.png",
            sizes: "192x192",
            type: "image/png",
            purpose: "any",
          },
          {
            src: "/icons/laters-512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "any",
          },
          {
            src: "/icons/laters-maskable-512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "maskable",
          },
        ],
        share_target: {
          action: "/share-target",
          method: "POST",
          enctype: "application/x-www-form-urlencoded",
          params: {
            title: "title",
            text: "text",
            url: "url",
          },
        },
      },
      injectManifest: {
        rollupFormat: "iife",
        globPatterns: ["**/*.{css,html,js,png,svg,webmanifest}"],
      },
    }),
  ],
});
