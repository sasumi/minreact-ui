import { useSyncExternalStore } from "react";

/**
 * TranslateFn 是一个函数类型，用于翻译文本。
 * @param key - 翻译键，用于标识要翻译的文本。
 * @param defaultText - 默认文本，当没有找到对应的翻译时使用。
 * @param params - 可选的占位符参数，用于替换文本中的占位符。
 * @returns 翻译后的文本。
 */
export type TranslateFn = (key: string, defaultText?: string, params?: Record<string, string | number>) => string;

/**
 * 默认的翻译函数，直接返回 defaultText，并替换 params 中的占位符
 * @param key - 翻译键
 * @param defaultText - 默认文本
 * @param params - 占位符参数
 * @returns 翻译后的文本
 */
const defaultTranslator: TranslateFn = (key, defaultText, params) => {
    if (!params) {
        return defaultText || key;
    }
    return Object.keys(params).reduce((str, pKey) => str.replace(new RegExp(`\\{${pKey}\\}`, "g"), String(params[pKey])), defaultText);
};

/**
 * 当前使用的翻译函数，初始为默认翻译函数
 */
let currentTranslator: TranslateFn = defaultTranslator;

/**
 * 设置自定义翻译函数
 */
const listeners = new Set<() => void>();

/**
 * 供外部配置自定义翻译函数
 */
export const setTranslateFn = (fn: TranslateFn) => {
    currentTranslator = fn;
    listeners.forEach((listener) => listener());
};

const subscribe = (listener: () => void) => {
    listeners.add(listener);
    return () => listeners.delete(listener);
};

/**
 * useMinuiTranslate 是一个自定义 Hook，用于获取当前的翻译函数。
 * 它使用 useSyncExternalStore 来订阅翻译函数的变化，从而在翻译函数更新时触发组件重新渲染。
 * @returns 当前的翻译函数
 */
export const useMinuiTranslate = (): TranslateFn => {
    return useSyncExternalStore(
        subscribe,
        () => currentTranslator,
        () => currentTranslator,
    );
};
