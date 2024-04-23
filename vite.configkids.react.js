import path from "path";
import { defineConfig } from "vite";
import { VitePWA } from "vite-plugin-pwa";
import EnvironmentPlugin from "vite-plugin-environment";
import dotenv from "dotenv";
import reactRefresh from "@vitejs/plugin-react";
import svgr from "vite-plugin-svgr";

dotenv.config();

const manifestForPlugin = {
  registerType: "prompt",
  includeAssets: ["favicon.ico"],
  manifest: {
    short_name: "DooCoins Kids",
    name: "DooCoins Kids Rewards dApp",
    description: "Children earn DooCoins for good behavior, completing chores and personal achievements. Web3 dApp built on blockchain",
    icons: [
      {
        src: "/favicon.ico",
        sizes: "64x64 32x32 24x24 16x16",
        type: "image/x-icon"
      },
      {
        src: "/192.png",
        type: "image/png",
        sizes: "192x192",
        purpose: "any maskable"
      },
      {
        src: "/512.png",
        type: "image/png",
        sizes: "512x512",
        purpose: "any maskable"
      },
      {
        src: "/144.png",
        sizes: "144x144",
        type: "image/png",
        purpose: "any maskable"
      },
      {
        src: "/1024.png",
        sizes: "1024x1024",
        type: "image/png",
        purpose: "any maskable"
      }
    ],
    theme_color: "#0B334D",
    background_color: "#0B334D",
    display: "standalone",
    scope: "/",
    start_url: "/",
    orientation: "portrait"
  }
};

export default defineConfig({
  root: path.resolve(__dirname, "src", "frontend_kids"),
  build: {
    outDir: path.resolve(__dirname, "src", "frontend_kids", "dist"),
    emptyOutDir: true
  },
  define: {
    global: "window"
  },
  server: {
    host: true,
    proxy: {
      "/api": {
        target: "http://127.0.0.1:4943",
        // target: "http://127.0.0.1:5173",
        changeOrigin: true
      }
    }
  },
  plugins: [
    reactRefresh(),
    EnvironmentPlugin("all", { prefix: "CANISTER_" }),
    EnvironmentPlugin("all", { prefix: "DFX_" }),
    EnvironmentPlugin({ BACKEND_CANISTER_ID: "" }),
    VitePWA(manifestForPlugin),
    svgr()
  ]
});