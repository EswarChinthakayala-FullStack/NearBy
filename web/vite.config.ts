import path from "path"
import tailwindcss from "@tailwindcss/vite"
import react from "@vitejs/plugin-react"
import { defineConfig } from "vite"

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  return {
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
        "@components": path.resolve(__dirname, "./src/components"),
        "@features": path.resolve(__dirname, "./src/features"),
        "@hooks": path.resolve(__dirname, "./src/hooks"),
        "@layouts": path.resolve(__dirname, "./src/layouts"),
        "@pages": path.resolve(__dirname, "./src/pages"),
        "@services": path.resolve(__dirname, "./src/services"),
        "@providers": path.resolve(__dirname, "./src/providers"),
        "@routes": path.resolve(__dirname, "./src/routes"),
        "@types": path.resolve(__dirname, "./src/types"),
        "@utils": path.resolve(__dirname, "./src/utils"),
        "@lib": path.resolve(__dirname, "./src/lib"),
        "@styles": path.resolve(__dirname, "./src/styles"),
        "@assets": path.resolve(__dirname, "./src/assets"),
      },
    },
    optimizeDeps: {
      include: ["@tanstack/react-query", "axios"],
    },
    server: {
      host: true,
      port: 3000,
      strictPort: false,
      cors: true,
      proxy: {
        '/api': {
          target: 'http://localhost:8000',
          changeOrigin: true,
          secure: false,
        },
        '/uploads': {
          target: 'http://localhost:8000',
          changeOrigin: true,
          secure: false,
        },
      },
    },
    preview: {
      host: true,
      port: 4173,
    },
    build: {
      target: "esnext",
      sourcemap: mode === "development",
      cssCodeSplit: true,
      rollupOptions: {
        output: {
          manualChunks(id: string) {
            if (
              id.includes("node_modules/react") ||
              id.includes("node_modules/react-dom") ||
              id.includes("node_modules/react-router-dom") ||
              id.includes("node_modules/@tanstack")
            ) {
              return "vendor-react"
            }
            if (id.includes("node_modules/framer-motion") || id.includes("node_modules/@hugeicons")) {
              return "vendor-ui"
            }
            if (id.includes("node_modules/maplibre-gl")) {
              return "vendor-maps"
            }
          },
        },
      },
    },
    define: {
      "process.env.VITE_APP_BUILD_TIME": JSON.stringify(new Date().toISOString()),
    },
  }
})