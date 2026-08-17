import { createRoot } from "react-dom/client";
import type { ReactNode } from "react";
import { findOne } from "minutool";

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
 * 将焦点设置到容器内的第一个可聚焦元素上
 * @param {HTMLElement | null} container - 容器元素
 */
export const focusFirstElement = (container: HTMLElement | null) => {
    if (!container) {
        return;
    }
    const el = findOne('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])', container) as HTMLElement | null;
    if (el && typeof el.focus === "function") {
        el.focus();
    }
};

export function prettyTimeDuration(totalSeconds: number) {
    const seconds = Math.max(0, Math.floor(totalSeconds));
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainSeconds = seconds % 60;

    const parts: string[] = [];
    if (days > 0) {
        parts.push(`${days}d`);
    }
    if (hours > 0 || parts.length > 0) {
        parts.push(`${hours}h`);
    }
    if (minutes > 0 || parts.length > 0) {
        parts.push(`${minutes}m`);
    }
    parts.push(`${remainSeconds}s`);
    return parts.join(" ");
}

export const textTranslate = (text: string, translations: Record<string, number | string>) => {
    for (const key in translations) {
        const value = translations[key];
        text = text.replace(new RegExp(`{${key}}`, "g"), String(value));
    }
    return text;
};
