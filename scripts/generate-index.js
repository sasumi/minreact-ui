#!/usr/bin/env node
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const srcDir = path.join(__dirname, "../src");

// 这些目录下的文件不通过 index.ts 对外导出
const SKIP_DIRS = new Set(["modules", "styles"]);

// 递归收集 src 下的源文件（.ts / .tsx，排除 .d.ts 和 index.ts）
function collectSourceFiles(dir) {
    const results = [];

    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
        if (entry.name === "index.ts") continue;

        const fullPath = path.join(dir, entry.name);

        if (entry.isDirectory()) {
            if (SKIP_DIRS.has(entry.name)) continue;
            results.push(...collectSourceFiles(fullPath));
        } else if (
            (entry.name.endsWith(".ts") || entry.name.endsWith(".tsx")) &&
            !entry.name.endsWith(".d.ts")
        ) {
            results.push(fullPath);
        }
    }

    return results;
}

// 根据模块名生成注释
function getCategoryComment(moduleName) {
    // 首字母大写
    const capitalized = moduleName.charAt(0).toUpperCase() + moduleName.slice(1);
    return `${capitalized} utilities`;
}

// 解析文件中的所有 export
function parseExports(filePath) {
    const content = fs.readFileSync(filePath, "utf-8");
    const typeExports = new Set();
    const valueExports = new Set();
    const defaultExports = new Set();

    let match;

    // 匹配类型导出 (interface, type, enum)
    const typeExportRegex = /^export\s+(?:interface|type|enum)\s+(\w+)/gm;
    while ((match = typeExportRegex.exec(content)) !== null) {
        typeExports.add(match[1]);
    }

    // 匹配值导出 (const, function, class)
    const valueExportRegex = /^export\s+(?:const|function|class)\s+(\w+)/gm;
    while ((match = valueExportRegex.exec(content)) !== null) {
        valueExports.add(match[1]);
    }

    // 匹配默认导出 (export default X / function X / class X)
    const defaultExportRegex = /^export\s+default\s+(?:function\s+|class\s+)?(\w+)/gm;
    while ((match = defaultExportRegex.exec(content)) !== null) {
        defaultExports.add(match[1]);
    }

    // 匹配 export { ... }
    const namedExportRegex = /export\s+\{([^}]+)\}/g;
    while ((match = namedExportRegex.exec(content)) !== null) {
        match[1]
            .split(",")
            .map((name) => name.trim())
            .filter(Boolean)
            .forEach((name) => {
                // 处理 "x as y" 的情况，取别名后的名字
                const asMatch = name.match(/^(\w+)\s+as\s+(\w+)$/);
                valueExports.add(asMatch ? asMatch[2] : name);
            });
    }

    return {
        types: [...typeExports],
        values: [...valueExports],
        defaults: [...defaultExports],
    };
}

// 生成 index.ts 内容
function generateIndexContent() {
    const files = collectSourceFiles(srcDir)
        .map((filePath) => {
            const importPath =
                "./" +
                path.relative(srcDir, filePath).replace(/\\/g, "/").replace(/\.tsx?$/, "");
            return { filePath, importPath };
        })
        .sort((a, b) => a.importPath.localeCompare(b.importPath));

    let content = "";

    files.forEach(({ filePath, importPath }) => {
        const { types, values, defaults } = parseExports(filePath);

        if (types.length === 0 && values.length === 0 && defaults.length === 0) return;

        const moduleName = path.basename(filePath).replace(/\.tsx?$/, "");
        content += `// ${getCategoryComment(moduleName)}\n`;

        // 导出类型
        if (types.length > 0) {
            content += `export type {\n`;
            types.sort().forEach((exp, index) => {
                content += `  ${exp}${index < types.length - 1 ? "," : ""}\n`;
            });
            content += `} from '${importPath}'\n`;
        }

        // 导出命名值
        if (values.length > 0) {
            content += `export {\n`;
            values.sort().forEach((exp, index) => {
                content += `  ${exp}${index < values.length - 1 ? "," : ""}\n`;
            });
            content += `} from '${importPath}'\n`;
        }

        // 导出默认值（转为具名导出）
        if (defaults.length > 0) {
            defaults.sort().forEach((exp) => {
                content += `export { default as ${exp} } from '${importPath}'\n`;
            });
        }

        content += "\n";
    });

    return content.trim() + "\n";
}

// 主函数
function main() {
    try {
        console.log("🔍 Scanning exports from src files...");

        const indexContent = generateIndexContent();
        const indexPath = path.join(srcDir, "index.ts");

        fs.writeFileSync(indexPath, indexContent, "utf-8");

        console.log("✅ index.ts has been generated successfully!");
        console.log(`📝 File: ${indexPath}`);
    } catch (error) {
        console.error("❌ Error generating index.ts:", error);
        process.exit(1);
    }
}

main();
