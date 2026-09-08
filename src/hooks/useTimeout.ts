import { useEffect } from "react";

/**
 * 延迟执行回调函数的自定义 Hook
 * @param callback - 延迟执行的回调函数
 * @param delay - 延迟时间，单位为毫秒
 */
export const useTimeout = (callback: () => void, delay: number) => {
    useEffect(() => {
        const timer = setTimeout(callback, delay);
        return () => clearTimeout(timer);
    }, [callback, delay]);
};

/**
 * 定时执行回调函数的自定义 Hook
 * @param callback - 定时执行的回调函数
 * @param delay - 定时间隔，单位为毫秒
 */
export const useInterval = (callback: () => void, delay: number) => {
    useEffect(() => {
        const interval = setInterval(callback, delay);
        return () => clearInterval(interval);
    }, [callback, delay]);
};
