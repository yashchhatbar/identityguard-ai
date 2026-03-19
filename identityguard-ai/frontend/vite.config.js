import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],

  server: {
    port: 5173,
    host: "0.0.0.0", // allow external access (mobile, network)
  },

  preview: {
    port: 5173,
    host: "0.0.0.0",
  },

  build: {
    outDir: "dist",
    sourcemap: false,
  },

  define: {
    __APP_ENV__: JSON.stringify(process.env.NODE_ENV),
  },
});
