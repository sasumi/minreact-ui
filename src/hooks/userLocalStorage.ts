import { useCallback, useSyncExternalStore } from 'react';

/** 定义事件发布/订阅器，用于在同一页面/标签页的不同组件间同步更新 */
const dispatchStorageEvent = (key: string, newValue: string | null) => {
    window.dispatchEvent(
        new StorageEvent('storage', { key, newValue })
    );
};

/** 内存缓存，避免 useSyncExternalStore 频繁 JSON.parse 导致无意义的重渲染 */
const cache = new Map<string, { raw: string | null; parsed: any }>();

const getSnapshot = <T,>(key: string, initialValue: T): T => {
    try {
        const raw = window.localStorage.getItem(key);
        if (raw === null) return initialValue;

        const cached = cache.get(key);
        if (cached && cached.raw === raw) {
            return cached.parsed;
        }

        const parsed = JSON.parse(raw);
        cache.set(key, { raw, parsed });
        return parsed;
    } catch (error) {
        console.warn(`Error reading localStorage key "${key}":`, error);
        return initialValue;
    }
};

/**
 * SSR 降级 Snapshot
 */
const getServerSnapshot = <T>(initialValue: T): T => {
    return initialValue;
};

/**
 * 订阅方法：同时监听原生 storage 事件（跨标签页）和自定义事件（同标签页）
 */
const subscribe = (key: string, callback: () => void) => {
    const handleStorage = (e: StorageEvent) => {
        if (e.key === key || e.key === null) {
            callback();
        }
    };
    window.addEventListener('storage', handleStorage);
    return () => {
        window.removeEventListener('storage', handleStorage);
    };
}

/**
 * 自定义 Hook：useLocalStorage
 * @param key - localStorage 的键名
 * @param initialValue - 初始值
 */
export const useLocalStorage = <T>(
    key: string,
    initialValue: T
): [T, (value: T | ((prev: T) => T)) => void, () => void] => {
    const value = useSyncExternalStore(
        useCallback((cb) => subscribe(key, cb), [key]),
        () => getSnapshot(key, initialValue),
        () => getServerSnapshot(initialValue)
    );

    const setValue = useCallback(
        (valueOrFn: T | ((prev: T) => T)) => {
            try {
                const currentSnapshot = getSnapshot(key, initialValue);
                const nextValue =
                    valueOrFn instanceof Function
                        ? valueOrFn(currentSnapshot)
                        : valueOrFn;

                const serialized = JSON.stringify(nextValue);
                window.localStorage.setItem(key, serialized);

                // 清理/更新缓存
                cache.set(key, { raw: serialized, parsed: nextValue });

                // 通知同页面内使用相同 key 的其他 useLocalStorage 组件同步更新
                dispatchStorageEvent(key, serialized);
            } catch (error) {
                console.warn(`Error setting localStorage key "${key}":`, error);
            }
        },
        [key, initialValue]
    );

    // 5. 删除 key
    const removeValue = useCallback(() => {
        try {
            window.localStorage.removeItem(key);
            cache.delete(key);
            dispatchStorageEvent(key, null);
        } catch (error) {
            console.warn(`Error removing localStorage key "${key}":`, error);
        }
    }, [key]);

    return [value, setValue, removeValue];
};