import { bindInputDebounce } from "minutool";
import { useState, useEffect, useRef } from "react";

/**
 * 自定义 Hook，用于处理输入框的值，支持防抖
 * @param ref - 输入框的引用
 * @param delay - 防抖延迟时间，默认 50ms
 */
export const useInputDebounce = (ref: React.RefObject<HTMLInputElement | HTMLTextAreaElement | null>, delay = 50): [string, () => void] => {
    const [value, setValue] = useState("");
    const flushRef = useRef<() => void>(() => {});

    useEffect(() => {
        if (!ref) {
            return;
        }
        const el = ref.current;
        if (!el) {
            return;
        }
        const flush = () => {
            setValue(el.value);
        };
        flushRef.current = flush;
        return bindInputDebounce(el, setValue, delay);
    }, [ref, delay]);

    return [value, () => flushRef.current()];
};
