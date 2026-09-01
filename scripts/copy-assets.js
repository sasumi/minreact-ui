#!/usr/bin/env node
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const srcAssets = path.join(__dirname, "../src/assets");
const distAssets = path.join(__dirname, "../dist/assets");

// 将 src/assets 下的图片等静态资源拷贝到发布结果 dist/assets 中，
// 使样式涉及的图片资源在 npm 发布时随包提供。
if (!fs.existsSync(srcAssets)) {
    console.log("⚠️  src/assets 不存在，跳过资源拷贝");
    process.exit(0);
}

fs.mkdirSync(distAssets, { recursive: true });

let count = 0;
for (const entry of fs.readdirSync(srcAssets, { withFileTypes: true })) {
    if (!entry.isFile()) continue;
    const src = path.join(srcAssets, entry.name);
    const dest = path.join(distAssets, entry.name);
    fs.copyFileSync(src, dest);
    count++;
}

console.log(`✅ 已拷贝 ${count} 个资源文件到 dist/assets`);
