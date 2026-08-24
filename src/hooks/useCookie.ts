import { useCallback, useSyncExternalStore } from 'react';

// Cookie 设置时的可选配置
export interface CookieOptions {
    days?: number;
    path?: string;
    domain?: string;
    sameSite?: 'Strict' | 'Lax' | 'None';
    secure?: boolean;
}

// 1. 同标签页跨组件更新事件通知
const COOKIE_EVENT_TYPE = 'react_use_cookie_change';

const dispatchCookieEvent = (name: string, value: string | null) => {
    window.dispatchEvent(
        new CustomEvent(COOKIE_EVENT_TYPE, { detail: { name, value } })
    );
};

// 2. 原生 Cookie 读写工具方法
const getCookie = (name: string): string | null => {
    if (typeof document === 'undefined') return null;
    const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
    return match ? decodeURIComponent(match[2]) : null;
};

const setCookie = (name: string, value: string, options: CookieOptions = {}) => {
    if (typeof document === 'undefined') return;

    const { days = 7, path = '/', domain, sameSite = 'Lax', secure } = options;
    let expires = '';

    if (days) {
        const date = new Date();
        date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
        expires = `; expires=${date.toUTCString()}`;
    }

    const domainStr = domain ? `; domain=${domain}` : '';
    const secureStr = secure ? '; secure' : '';
    const sameSiteStr = `; samesite=${sameSite}`;

    document.cookie = `${name}=${encodeURIComponent(value)}${expires}; path=${path}${domainStr}${sameSiteStr}${secureStr}`;
    dispatchCookieEvent(name, value);
};

const eraseCookie = (name: string, path = '/', domain?: string) => {
    if (typeof document === 'undefined') return;
    const domainStr = domain ? `; domain=${domain}` : '';
    document.cookie = `${name}=; Max-Age=-99999999; path=${path}${domainStr}`;
    dispatchCookieEvent(name, null);
};

// 3. 订阅同页签事件 + 现代 CookieStore 变动事件
function subscribeCookie(name: string, callback: () => void) {
    // A. 订阅自定义广播事件（解决应用内多组件同步）
    const handleCustomEvent = (e: Event) => {
        const detail = (e as CustomEvent).detail;
        if (!detail || detail.name === name) {
            callback();
        }
    };
    window.addEventListener(COOKIE_EVENT_TYPE, handleCustomEvent);

    // B. 如果浏览器支持 Cookie Store API，订阅原生跨页签/外部修改事件
    let cookieStoreListener: ((e: any) => void) | null = null;
    if ('cookieStore' in window) {
        cookieStoreListener = (e: any) => {
            const isChanged = [...e.changed, ...e.deleted].some(
                (c) => c.name === name
            );
            if (isChanged) callback();
        };
        (window as any).cookieStore.addEventListener('change', cookieStoreListener);
    }

    return () => {
        window.removeEventListener(COOKIE_EVENT_TYPE, handleCustomEvent);
        if ('cookieStore' in window && cookieStoreListener) {
            (window as any).cookieStore.removeEventListener('change', cookieStoreListener);
        }
    };
}

// 4. Custom Hook 定义
export function useCookie(
    name: string,
    defaultValue: string = ''
): [
        string,
        (value: string | ((prev: string) => string), options?: CookieOptions) => void,
        (options?: Pick<CookieOptions, 'path' | 'domain'>) => void
    ] {
    // 渲染快照获取
    const getSnapshot = useCallback(() => {
        const val = getCookie(name);
        return val !== null ? val : defaultValue;
    }, [name, defaultValue]);

    // SSR 快照降级
    const getServerSnapshot = useCallback(() => defaultValue, [defaultValue]);

    // 借助 React 18 外部状态订阅机制
    const cookieValue = useSyncExternalStore(
        useCallback((cb) => subscribeCookie(name, cb), [name]),
        getSnapshot,
        getServerSnapshot
    );

    // 更新 Cookie
    const updateCookie = useCallback(
        (
            valueOrFn: string | ((prev: string) => string),
            options?: CookieOptions
        ) => {
            const currentVal = getCookie(name) ?? defaultValue;
            const nextVal =
                typeof valueOrFn === 'function' ? valueOrFn(currentVal) : valueOrFn;

            setCookie(name, nextVal, options);
        },
        [name, defaultValue]
    );

    // 删除 Cookie
    const deleteCookie = useCallback(
        (options?: Pick<CookieOptions, 'path' | 'domain'>) => {
            eraseCookie(name, options?.path, options?.domain);
        },
        [name]
    );

    return [cookieValue, updateCookie, deleteCookie];
}