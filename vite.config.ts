// @ts-ignore
import { defineConfig } from "vite";
// @ts-ignore
import react from "@vitejs/plugin-react-swc";
import path from "path";
// @ts-ignore
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
// @ts-ignore
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [react(), mode === "development" && componentTagger()].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
