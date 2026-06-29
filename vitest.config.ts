/**
 * vitest.config.ts
 *
 * Vitest configuration for PadiDoc unit tests.
 * Uses the 'node' environment (no browser/DOM required for pure logic tests).
 */
import { defineConfig } from "vitest/config";
import path from "path";

export default defineConfig({
  test: {
    environment: "node",
    include: ["**/__tests__/**/*.test.ts", "**/*.test.ts"],
    exclude: ["node_modules", ".next"],
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "."),
    },
  },
});
