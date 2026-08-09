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
    const el = findOne('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])') as HTMLElement | null;
    if (el && typeof el.focus === "function") {
        el.focus();
    }
};
