import { useCallback, useRef } from "react";

type PossibleRef<T> = React.Ref<T> | undefined;

function setRef<T>(ref: PossibleRef<T>, value: T | null) {
    if (typeof ref === "function") {
        ref(value);
    } else if (ref != null) {
        (ref as React.MutableRefObject<T | null>).current = value;
    }
}

/**
 * 合并多个 ref，返回一个 callback ref。
 * 支持 object ref、function ref 以及 undefined/null。
 */
export function useMergedRef<T>(...refs: PossibleRef<T>[]): (node: T | null) => void {
    // 用 ref 保存最新的 refs，避免每次渲染都重新创建 callback
    const refsRef = useRef(refs);
    refsRef.current = refs;

    return useCallback((node: T | null) => {
        refsRef.current.forEach((ref) => setRef(ref, node));
    }, []);
}
