import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "path";

export default defineConfig({
  base: "/mylogo/",
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    port: 3003,
    host: true,
    allowedHosts: true,
    proxy: {
      "/mylogo/api": {
        target: "http://localhost:5003",
        rewrite: (path) => path.replace(/^\/mylogo/, ""),
      },
      "/api": {
        target: "http://localhost:5003",
      },
    },
  },
});
