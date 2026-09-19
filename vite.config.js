import { defineConfig } from "vite";

export default defineConfig({
  build: {
    outDir: "dist",
    emptyOutDir: true,
    lib: {
      entry: "src/card.js",
      name: "ConsumptionCostChart",
      formats: ["iife"],
      fileName: () => "cost-chart-card.js",
    },
    sourcemap: true,
  },
});
