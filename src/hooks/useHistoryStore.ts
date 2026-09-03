import { bindStorageEvent } from "minutool";
import { useCallback, useSyncExternalStore } from "react";

const dispatchStorageChange = (key: string, newValue: string | null) => {
    window.dispatchEvent(new StorageEvent("storage", { key, newValue }));
};

const readItems = <T>(key: string): T[] => {
    try {
        const raw = localStorage.getItem(key);
        return raw ? (JSON.parse(raw) as T[]) : [];
    } catch {
        return [];
    }
};

const writeItems = <T>(key: string, items: T[]) => {
    const raw = JSON.stringify(items);
    localStorage.setItem(key, raw);
    dispatchStorageChange(key, raw);
};

/** 稳定的空数组，避免 getSnapshot 每次返回新引用导致无意义重渲染 */
const EMPTY_ITEMS: unknown[] = [];

/** 解析结果缓存，保证 getSnapshot 在同一原始数据下返回同一引用 */
const cache = new Map<string, { raw: string | null; parsed: unknown }>();

const parseItems = <T>(raw: string): T[] => {
    try {
        return JSON.parse(raw) as T[];
    } catch {
        return EMPTY_ITEMS as T[];
    }
};

const getSnapshot = <T>(key: string): T[] => {
    const raw = (() => {
        try {
            return localStorage.getItem(key);
        } catch {
            return null;
        }
    })();
    if (raw === null) {
        cache.delete(key);
        return EMPTY_ITEMS as T[];
    }
    const cached = cache.get(key);
    if (cached && cached.raw === raw) {
        return cached.parsed as T[];
    }
    const parsed = parseItems<T>(raw);
    cache.set(key, { raw, parsed });
    return parsed;
};

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
    const histories = useSyncExternalStore(
        useCallback((cb: () => void) => bindStorageEvent(key, cb), [key]),
        () => getSnapshot<T>(key),
        () => EMPTY_ITEMS as T[],
    );

    const add = useCallback(
        (val: T) => {
            const normalized = typeof val === "string" ? val.trim() : val;
            if (!normalized) return;
            const v = normalized as T;
            const deduped = readItems<T>(key).filter((h) => h !== v);
            writeItems(key, [v, ...deduped].slice(0, maxItems));
        },
        [key, maxItems],
    );

    const remove = useCallback(
        (val: T) => {
            writeItems(
                key,
                readItems<T>(key).filter((h) => h !== val),
            );
        },
        [key],
    );

    const clear = useCallback(() => {
        localStorage.removeItem(key);
        dispatchStorageChange(key, null);
    }, [key]);

    return { histories, add, remove, clear };
};
