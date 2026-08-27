import { defineConfig } from "vite";
import { dirname, resolve } from "path";
import { fileURLToPath } from "url";
import react from "@vitejs/plugin-react";

const __dirname = dirname(fileURLToPath(import.meta.url));

// 根据命令决定 alias
export default defineConfig(({ command }) => ({
    plugins: [react()],
    resolve: {
        alias: {
            // 开发时指向本地 minutool 的入口（源码或构建后的入口）
            // 构建时保留 'minutool'，让 Vite 从 node_modules 解析
            minutool:
                command === "serve"
                    ? resolve(__dirname, "../minutool/src/index.ts") // 或 '../minutool/dist/index.js' 取决于你的结构
                    : "minutool",
        },
    },
    build: {
        sourcemap: true,
        lib: {
            entry: resolve(__dirname, "src/index.ts"),
            name: "minreactui",
            formats: ["es", "umd"],
            fileName: (format) => {
                if (format === "es") return "minreactui.js";
                if (format === "umd") return "minreactui.umd.cjs";
                return `minreactui.${format}.js`;
            },
        },
        rollupOptions: {
            external: [
                "react",
                "react-dom",
                "react/jsx-runtime",
                "react/jsx-dev-runtime",
                "@radix-ui/react-popover",
                "i18next",
                "react-i18next",
                "react-toastify",
                "minutool", // 保持外部化
            ],
            output: {
                globals: {
                    react: "React",
                    "react-dom": "ReactDOM",
                    "react/jsx-runtime": "ReactJSXRuntime",
                    "react/jsx-dev-runtime": "ReactJSXDevRuntime",
                    "@radix-ui/react-popover": "ReactPopover",
                    i18next: "i18next",
                    "react-i18next": "ReactI18next",
                    "react-toastify": "ReactToastify",
                    minutool: "minutool",
                },
            },
        },
    },
}));
