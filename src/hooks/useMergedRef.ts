import { useCallback, useEffect, useLayoutEffect, useRef } from "react";

const useIsomorphicLayoutEffect = typeof window !== "undefined" ? useLayoutEffect : useEffect;

/**
 * Merges multiple React refs into a single ref callback.
 * This is useful when you need to assign multiple refs to the same element.
 */
export function useMergedRef<T>(...refs: (React.Ref<T> | undefined)[]): React.RefCallback<T> {
    const refsRef = useRef(refs);

    useIsomorphicLayoutEffect(() => {
        refsRef.current = refs;
    });

    return useCallback((node: T | null) => {
        refsRef.current.forEach((ref) => {
            if (typeof ref === "function") ref(node);
            else if (ref != null) (ref as React.MutableRefObject<T | null>).current = node;
        });
    }, []);
}
