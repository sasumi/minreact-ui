import { fileURLToPath, URL } from "node:url";
import { defineConfig } from "vite";
import { resolve } from "path";
import react from "@vitejs/plugin-react";

// https://vite.dev/config/
export default defineConfig({
    plugins: [react()],
    resolve: {
        alias: {
            "@": fileURLToPath(new URL("./src", import.meta.url)).replace(/\\/g, "/"),
        },
    },
    build: {
        sourcemap: true,
        lib: {
            entry: resolve(__dirname, "src/index.ts"),
            name: "minuui",
            formats: ["es", "umd"],
            fileName: (format) => {
                if (format === "es") return "minuui.js";
                if (format === "umd") return "minuui.umd.cjs";
                return `minuui.${format}.js`;
            },
        },
        rollupOptions: {
            // 确保外部化处理那些你不想打包进库的依赖
            external: [
                "react",
                "react-dom",
                "react/jsx-runtime",
                "react/jsx-dev-runtime",
                "@radix-ui/react-popover",
                "i18next",
                "react-i18next",
                "react-toastify",
                "minutool",
            ],
            output: {
                // 在 UMD 构建模式下为这些外部化的依赖提供一个全局变量
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
});
