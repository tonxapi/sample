import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import { nodePolyfills } from "vite-plugin-node-polyfills";
import notifier from "vite-plugin-notifier";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  plugins:
    mode === "development"
      ? [
        react(),
        notifier(),
        nodePolyfills({
          // Whether to polyfill `node:` protocol imports.
          protocolImports: true,
        }),
      ]
      : [],
  server: {
    port: 4000,
  },
  resolve: {
    alias:
      /** browserify for @jbrowse/react-linear-genome-view */
      { stream: "stream-browserify" },
  },
  optimizeDeps: {
    esbuildOptions: {
      // Node.js global to browser globalThis
      define: {
        global: "globalThis",
      },
    },
  },
  build: {
    outDir: "build",
    // used for "Graph" is undefined error with Dagre package https://github.com/vitejs/vite/issues/5759
    commonjsOptions: {
      ignoreTryCatch: false,
    },
  },
  // needed to fix the "react not defined" error in the ag-grid renderer components
  // https://github.com/vitejs/vite/issues/2369
  esbuild: {
    jsxFactory: "_jsx",
    jsxFragment: "_jsxFragment",
    jsxInject: `import { createElement as _jsx, Fragment as _jsxFragment } from 'react'`,
  },
}));