import { DependencyList, EffectCallback, useEffect, useRef } from "react";

function depsChanged(prevDeps?: DependencyList, nextDeps?: DependencyList) {
	if (prevDeps === undefined || nextDeps === undefined) {
		return true;
	}

	if (prevDeps.length !== nextDeps.length) {
		return true;
	}

	for (let index = 0; index < prevDeps.length; index += 1) {
		if (!Object.is(prevDeps[index], nextDeps[index])) {
			return true;
		}
	}

	return false;
}

/**
 * react更新effect
 * @param effect
 * @param deps
 */
export function useUpdateEffect(effect: EffectCallback, deps?: DependencyList) {
	const isFirst = useRef(true);
	const effectRef = useRef(effect);
	const depsRef = useRef(deps);
	const cleanupRef = useRef<ReturnType<EffectCallback>>(undefined);

	useEffect(() => {
		effectRef.current = effect;
	}, [effect]);

	useEffect(() => {
		if (isFirst.current) {
			isFirst.current = false;
			depsRef.current = deps;
			return;
		}

		const shouldRun = depsChanged(depsRef.current, deps);
		depsRef.current = deps;

		if (!shouldRun) {
			return;
		}

		cleanupRef.current?.();
		cleanupRef.current = effectRef.current();
	});

	useEffect(() => {
		return () => {
			cleanupRef.current?.();
		};
	}, []);
}
