import { createRoot } from "react-dom/client";
import type { ReactNode } from "react";

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

export const textTranslate = (text: string, translations: Record<string, number | string>) => {
    for (const key in translations) {
        const value = translations[key];
        text = text.replace(new RegExp(`{${key}}`, "g"), String(value));
    }
    return text;
};
