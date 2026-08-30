import { bindInputDebounce } from "minutool";
import { useState, useEffect, useRef } from "react";

/**
 * 自定义 Hook，用于处理输入框的值，支持防抖、去除首尾空格和最小长度限制
 * @param ref - 输入框的引用
 * @param delay - 防抖延迟时间，默认 300ms
 */
export function useInput(ref: React.RefObject<HTMLInputElement | HTMLTextAreaElement>, delay = 300): [string, () => void] {
    const [value, setValue] = useState("");
    const flushRef = useRef<() => void>(() => {});

    useEffect(() => {
        const el = ref.current;
        if (!el) {
            return;
        }
        const flush = () => {
            setValue(el.value);
        };
        flushRef.current = flush;
        const destroy = bindInputDebounce(el, setValue, delay);
        return destroy;
    }, [ref, delay]);

    return [value, () => flushRef.current()];
}
