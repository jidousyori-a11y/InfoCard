import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { registerApiPlugin } from "./src/devServer/registerApiPlugin";
import { aiApiPlugin } from "./src/devServer/aiApiPlugin";

// base: "./" にすることで GitHub Pages のプロジェクトページ
// (https://<user>.github.io/<repo>/) 配下でも相対パスで動作する
export default defineConfig({
  base: "./",
  plugins: [react(), registerApiPlugin(), aiApiPlugin()],
});
