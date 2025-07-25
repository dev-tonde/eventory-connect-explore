import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [
    react({
      // Improve Fast Refresh stability
      devTarget: 'esnext',
    }),
    mode === 'development' && componentTagger(),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  optimizeDeps: {
    // Ensure React is properly bundled
    include: ['react', 'react-dom', 'react/jsx-runtime'],
  },
  define: {
    // Ensure proper React mode
    __DEV__: mode === 'development',
  },
}));
