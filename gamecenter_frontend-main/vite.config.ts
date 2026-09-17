import { defineConfig } from "vite";

export default defineConfig({
  // Vite's built-in esbuild transform is enough for this small React entry
  // point. Keeping the config plugin-free also makes the production build
  // resilient when optional Babel tooling is not available in a clean
  // deployment environment.
  esbuild: {
    jsx: "automatic",
  },
});
