import { createRoot } from "react-dom/client";
import type { ReactNode } from "react";
import { regQuote } from "minutool";

/**
 * 将ReactNode挂载到body上，并返回一个卸载函数
 * @param node - 要挂载的ReactNode
 * @returns 卸载函数
 */
export function mountReactNode(node: ReactNode) {
    const container = document.createElement("div");
    document.body.appendChild(container);
    const root = createRoot(container);
    root.render(node);
    return () => {
        root.unmount();
        container.remove();
    };
}

/**
 * 将文本中的占位符替换为指定的值
 * @param text - 原始文本，包含占位符，如 "Hello, {name}!"
 * @param translations - 占位符对应的值，如 { name: "World" }
 * @returns 替换后的文本，如 "Hello, World!"
 */
export const textTranslate = (text: string, translations: Record<string, number | string>): string => {
    for (const key in translations) {
        text = text.replace(new RegExp(`{${key}}`, "g"), String(translations[key]));
    }
    return text;
};

/**
 * 高亮显示文本中匹配的部分
 * @param text - 原始文本
 * @param query - 要匹配的查询字符串
 * @param className - 高亮部分的CSS类名
 * @returns 一个React节点数组，其中匹配的部分被包裹在指定的className中
 */
export const highlightText = (text: string, query: string, className: string): React.ReactNode[] => {
    if (!query) {
        return [text];
    }
    const regex = new RegExp(`(${regQuote(query)})`, "gi");
    const parts = text.split(regex);
    return parts.map((part, index) =>
        part.toLowerCase() === query.toLowerCase() ? (
            <span key={index} className={className}>
                {part}
            </span>
        ) : (
            part
        ),
    );
};
