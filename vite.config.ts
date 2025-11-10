import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { URL, fileURLToPath } from "url";
import path from "path";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  // 注入全局变量，解决 global 未定义问题
  define: {
    'global': 'window'
  },
  base: "/",
  server: {
    proxy: {
      "/api": {
        target: "http://13.214.253.55:8090",
        changeOrigin: true,
      },
      "/v4": {
        target: "http://13.214.253.55:3002", // Indexer API
        changeOrigin: true,
      },
      "/cosmos": {
        target: "http://13.214.253.55:1317", // Protocol REST API（链上查询）
        changeOrigin: true,
      },
      "/dydxprotocol": {
        target: "http://13.214.253.55:1317", // Protocol REST API（链上查询）
        changeOrigin: true,
      },
      "/binance-proxy": {
        target: "https://api.binance.com",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/binance-proxy/, ""),
        configure: (proxy, _options) => {
          proxy.on("proxyReq", (proxyReq, req, _res) => {
            // 移除 host 头，让代理服务器设置
            proxyReq.removeHeader("origin");
          });
        },
      },
    },
  },
  build: {
    rollupOptions: {
      input: {
        main: fileURLToPath(new URL("index.html", import.meta.url)),
        notFound: fileURLToPath(new URL("public/404.html", import.meta.url)),
      },
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
