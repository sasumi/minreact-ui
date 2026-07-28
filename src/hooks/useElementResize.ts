import { RefObject, useEffect } from "react";

/**
 * 监听元素大小变化
 * @param ref - 要监听的元素的引用
 * @param handler - 元素大小变化时的回调函数
 */
export const useElementResize = (ref: RefObject<HTMLElement>, handler: () => void) => {
    useEffect(() => {
        if (!ref.current) return;
        const resizeObserver = new ResizeObserver(() => {
            handler();
        });
        resizeObserver.observe(ref.current);
        return () => {
            resizeObserver.disconnect();
        };
    }, [ref, handler]);
};
