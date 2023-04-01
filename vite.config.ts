import { defineConfig } from "vite";
import path from "path";
import dts from "vite-plugin-dts";

// https://vitejs.dev/guide/build.html#library-mode
export default defineConfig({
  plugins: [dts()],
  build: {
    lib: {
      entry: path.resolve(__dirname, "src/index.ts"),
      name: "monorepo-networker",
      fileName: "monorepo-networker",
    },
  },
});
