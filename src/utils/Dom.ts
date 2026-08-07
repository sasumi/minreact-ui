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

/**
 * 绑定面板移动事件
 * @param {HTMLElement} element - 要移动的元素
 * @param {HTMLElement | null} handle - 拖动句柄，默认为元素本身
 */
export function bindNodeMove(element: HTMLElement, handle: HTMLElement | null = null) {
    handle = handle || element;
    const previousPosition = element.style.position;
    const previousLeft = element.style.left;
    const previousTop = element.style.top;
    const previousTransform = element.style.transform;

    let dragging = false;
    let offsetX = 0;
    let offsetY = 0;

    const onMouseMove = (event: MouseEvent) => {
        if (!dragging) {
            return;
        }
        element.style.position = "fixed";
        element.style.transform = "none";
        element.style.left = `${event.clientX - offsetX}px`;
        element.style.top = `${event.clientY - offsetY}px`;
    };

    const stopDragging = () => {
        dragging = false;
        document.removeEventListener("mousemove", onMouseMove);
        document.removeEventListener("mouseup", stopDragging);
    };

    const onMouseDown = (event: MouseEvent) => {
        if (event.button !== 0) {
            return;
        }
        dragging = true;
        const rect = element.getBoundingClientRect();
        offsetX = event.clientX - rect.left;
        offsetY = event.clientY - rect.top;
        document.addEventListener("mousemove", onMouseMove);
        document.addEventListener("mouseup", stopDragging);
        event.preventDefault();
    };

    handle.addEventListener("mousedown", onMouseDown);

    return () => {
        stopDragging();
        handle.removeEventListener("mousedown", onMouseDown);
        element.style.position = previousPosition;
        element.style.left = previousLeft;
        element.style.top = previousTop;
        element.style.transform = previousTransform;
    };
}

/**
 * 绑定点击事件，并返回一个解绑函数
 * @param element - 要绑定事件的元素
 * @param callback - 事件回调函数
 * @returns 解绑函数
 */
export const bindClick = (element: HTMLElement, callback: (event: Event) => void) => {
    return bindDomEvent(element, "click", callback);
};

/**
 * 绑定键盘按键抬起事件，并返回一个解绑函数
 * @param element - 要绑定事件的元素
 * @param callback - 事件回调函数
 * @returns 解绑函数
 */
export const bindKeyUp = (element: HTMLElement, callback: (event: Event) => void) => {
    return bindDomEvent(element, "keyup", callback);
};

/**
 * 绑定键盘按键按下事件，并返回一个解绑函数
 * @param element - 要绑定事件的元素
 * @param callback - 事件回调函数
 * @returns 解绑函数
 */
export const bindKeyDown = (element: HTMLElement, callback: (event: Event) => void) => {
    return bindDomEvent(element, "keydown", callback);
};

/**
 * 绑定双击事件，并返回一个解绑函数
 * @param element - 要绑定事件的元素
 * @param callback - 事件回调函数
 * @returns 解绑函数
 */
export const bindDoubleClick = (element: HTMLElement, callback: (event: Event) => void) => {
    return bindDomEvent(element, "dblclick", callback);
};

/**
 * 绑定DOM事件，并返回一个解绑函数
 * @param element - 要绑定事件的元素
 * @param eventName - 事件名称
 * @param callback - 事件回调函数
 * @returns 解绑函数
 */
export const bindDomEvent = (element: HTMLElement, eventName: string, callback: (event: Event) => void) => {
    const onEvent = (event: Event) => {
        callback(event);
    };
    element.addEventListener(eventName, onEvent);
    return () => {
        element.removeEventListener(eventName, onEvent);
    };
};

/**
 * 将焦点设置到容器内的第一个可聚焦元素上
 * @param {HTMLElement | null} container - 容器元素
 */
export const focusFirstElement = (container: HTMLElement | null) => {
    if (!container) {
        return;
    }
    const el = container.querySelector('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])') as HTMLElement | null;
    if (el && typeof el.focus === "function") {
        el.focus();
    }
};
