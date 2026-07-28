import { DependencyList, useEffect, useRef } from "react";

/**
 * react更新effect
 * @param effect
 * @param deps
 */
export function useUpdateEffect(effect: () => void, deps?: DependencyList) {
	const isFirst = useRef(true);
	useEffect(() => {
		if (isFirst.current) {
			isFirst.current = false;
			return;
		}
		return effect();
	}, deps);
}
