import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { dirname, resolve } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));

/**
 * demo 的静态构建配置。
 *
 * 与 `vite.config.ts`（组件库构建）分开，产物落在 demo/dist/，由手写的 demo/dist.html 引用：
 * - 入口 HTML 不参与构建，因此 demo/index.html（HMR 入口）不会被覆盖
 * - 用固定文件名 app.js / app.css，手写的 dist.html 不必跟着 hash 变
 * - base 为相对路径，产物放到 web 根下的任意子目录都能跑，例如 http://localhost/min-react-ui/demo/dist.html
 */
export default defineConfig({
    root: resolve(__dirname, "demo"),
    base: "./",
    plugins: [react()],
    build: {
        outDir: "dist",
        emptyOutDir: true,
        rollupOptions: {
            input: resolve(__dirname, "demo/main.tsx"),
            output: {
                entryFileNames: "app.js",
                // 入口 CSS 固定成 app.css，其余资源（图片等）保持带 hash 的默认命名
                assetFileNames: (assetInfo) => {
                    const original = assetInfo.names?.[0] ?? "";
                    return original.endsWith(".css") ? "app.css" : "assets/[name]-[hash][extname]";
                },
            },
        },
    },
});
