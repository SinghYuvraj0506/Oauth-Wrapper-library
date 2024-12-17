import { defineConfig } from "tsup";

export default defineConfig([
  // Main entry point
  {
    entry: ["./src/core/index.ts"],
    format: ["cjs", "esm"],
    treeshake: true,
    splitting: false,
    dts: true,
    clean: true,
    shims: true,
    skipNodeModulesBundle: true,
    outExtension: ({ format }) => ({ js: format === "esm" ? ".mjs" : ".js" }),
  },

  // Providers entry point
  {
    entry: ["./src/providers/index.ts"],
    format: ["cjs", "esm"],
    treeshake: true,
    splitting: false,
    dts: true,
    clean: false, // Don't clean the dist folder again
    shims: true,
    skipNodeModulesBundle: true,
    outExtension: ({ format }) => ({ js: format === "esm" ? ".mjs" : ".js" }),
    outDir: "dist/providers",
  },

  //   React entry point
  {
    entry: ["./src/browser/react.tsx"],
    format: ["cjs", "esm"],
    treeshake: true,
    splitting: false,
    dts: true,
    clean: false, // Don't clean the dist folder again
    shims: true,
    skipNodeModulesBundle: true,
    outExtension: ({ format }) => ({ js: format === "esm" ? ".mjs" : ".js" }),
    outDir: "dist/react",
  },

  //   React entry point
  {
    entry: ["./src/serverUtils/expressHelper.ts"],
    format: ["cjs", "esm"],
    treeshake: true,
    splitting: false,
    dts: true,
    clean: false, // Don't clean the dist folder again
    shims: true,
    skipNodeModulesBundle: true,
    outExtension: ({ format }) => ({ js: format === "esm" ? ".mjs" : ".js" }),
    outDir: "dist/express",
  },
]);

