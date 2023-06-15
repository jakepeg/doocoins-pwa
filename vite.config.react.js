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
    short_name: "React App",
    name: "Create React App Sample",
    description: "An app with description.",
    icons: [
      {
        src: "/favicon.ico",
        sizes: "64x64 32x32 24x24 16x16",
        type: "image/x-icon"
      },
      {
        src: "/logo192.png",
        type: "image/png",
        sizes: "192x192",
        purpose: "maskable"
      },
      {
        src: "/logo512.png",
        type: "image/png",
        sizes: "512x512",
        purpose: "maskable"
      },
      {
        src: "/logo192.png",
        sizes: "144x144",
        type: "image/png",
        purpose: "any"
      }
    ],
    theme_color: "#000000",
    background_color: "#ffffff",
    display: "standalone",
    scope: "/",
    start_url: "/",
    orientation: "portrait"
  }
};

export default defineConfig({
  root: path.resolve(__dirname, "src", "frontend"),
  build: {
    outDir: path.resolve(__dirname, "src", "frontend", "dist"),
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

// import path from "path";
// import { defineConfig } from "vite";
// import { VitePWA } from "vite-plugin-pwa";
// import EnvironmentPlugin from "vite-plugin-environment";
// import dotenv from "dotenv";
// dotenv.config();

// const manifestForPlugin = {
//   registerType: "prompt",
//   includeAssets: ["favicon.ico"],
//   manifest: {
//     short_name: "React App",
//     name: "Create React App Sample",
//     description: "An app with description.",
//     icons: [
//       {
//         src: "/favicon.ico",
//         sizes: "64x64 32x32 24x24 16x16",
//         type: "image/x-icon"
//       },
//       {
//         src: "/logo192.png",
//         type: "image/png",
//         sizes: "192x192",
//         purpose: "maskable"
//       },
//       {
//         src: "/logo512.png",
//         type: "image/png",
//         sizes: "512x512",
//         purpose: "maskable"
//       },
//       {
//         src: "/logo192.png",
//         sizes: "144x144",
//         type: "image/png",
//         purpose: "any"
//       }
//     ],
//     theme_color: "#000000",
//     background_color: "#ffffff",
//     display: "standalone",
//     scope: "/",
//     start_url: "/",
//     orientation: "portrait"
//   }
// };

// export default defineConfig({
//   root: path.resolve(__dirname, "src", "frontend"),
//   build: {
//     outDir: path.resolve(__dirname, "src", "frontend", "dist"),
//     emptyOutDir: true
//   },
//   define: {
//     global: "window"
//   },
//   server: {
//     proxy: {
//       "/api": {
//         target: "http://127.0.0.1:4943",
//         changeOrigin: true
//       }
//     }
//   },
//   plugins: [
//     EnvironmentPlugin("all", { prefix: "CANISTER_" }),
//     EnvironmentPlugin("all", { prefix: "DFX_" }),
//     EnvironmentPlugin({ BACKEND_CANISTER_ID: "" }),
//     VitePWA(manifestForPlugin)
//   ]
// });