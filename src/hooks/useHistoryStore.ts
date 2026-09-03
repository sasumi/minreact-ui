import { useCallback } from "react";
import { useLocalStorage } from "./useLocalStorage";

/** 稳定的空数组，避免快照每次返回新引用导致无意义重渲染 */
const EMPTY_ITEMS: unknown[] = [];

/**
 * 历史记录存储 Hook，基于 localStorage 管理历史记录项，支持添加、删除、清空和读取。
 * @template T 历史记录项的类型，默认为字符串。
 * @param key 本地存储的键名。
 * @param maxItems 最大历史记录条数，默认为 20。
 * @returns 包含历史记录列表以及添加、删除、清空方法的对象。
 * @example
 * const { histories, add, remove, clear } = useHistoryStore("my-history");
 * add("item1");
 * remove("item1");
 * clear();
 */
export interface UseHistoryStoreResult<T = string> {
    histories: T[];
    add(val: T): void;
    remove(val: T): void;
    clear(): void;
}

export const useHistoryStore = <T = string>(key: string, { maxItems = 20 }: { maxItems?: number } = {}): UseHistoryStoreResult<T> => {
    const [items, setItems, clear] = useLocalStorage<T[]>(key, EMPTY_ITEMS as T[]);

    const add = useCallback(
        (val: T) => {
            const normalized = typeof val === "string" ? val.trim() : val;
            if (!normalized) return;
            const v = normalized as T;
            setItems((prev) => [v, ...prev.filter((h) => h !== v)].slice(0, maxItems));
        },
        [setItems, maxItems],
    );

    const remove = useCallback(
        (val: T) => {
            setItems((prev) => prev.filter((h) => h !== val));
        },
        [setItems],
    );

    return { histories: items, add, remove, clear };
};
