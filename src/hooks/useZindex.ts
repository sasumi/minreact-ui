import { useCallback, useEffect, useRef, useState } from "react";

type ZLayer = {
	id: string;
	z: number;
	setZ: (z: number) => void;
};

/**
 * 全局 z-index 管理器（模块级单例）
 *
 * 同一页面内所有 useZindex 实例共享一份登记表，并通过 registry 里的 z
 * 作为唯一事实来源，保证各层能正常切换层级、互不遮挡。
 * z 值尽量维持在既有取值范围内（顶替最高值、其它层依次下移），
 * 而不是每次都 +1 无限增长。
 */
const registry = new Map<number, ZLayer>();
let serial = 0;

/** 返回当前所有活跃层中的最大 z-index（无活跃层时返回 0） */
const getTopZ = (): number => {
	let top = 0;
	registry.forEach((layer) => {
		if (layer.z > top) {
			top = layer.z;
		}
	});
	return top;
};

/** 应用新的 z-index：同步登记表，仅在值变化时才触发该层更新 */
const applyZ = (layer: ZLayer, z: number) => {
	if (layer.z === z) return;
	layer.z = z;
	layer.setZ(z);
};

/**
 * useZindex Hook：为组件提供可动态提升的 z-index
 *
 * @param id            层标识，用于登记/区分不同组件（如 "dialog"、"popover"）
 * @param initialZindex 初始 z-index，作为该组件的基准层级；
 *                      传 null 时自动取当前注册层最高值 + 1，排到最上层
 * @returns
 *   zIndex       当前 z-index（可直接用于 style 或 --zindex CSS 变量）
 *   bringToFront 把本层切到前台：
 *                顶替注册列表中的最高值（若最高值唯一），原在其上方的各层依次 -1；
 *                仅当最高值被多个层共享时才 +1 越过该组
 */
export const useZindex = (id: string, initialZindex: number | null) => {
	// initialZindex 为 null 时先给个占位值，注册阶段再按“当前最高 + 1”修正
	const [zIndex, setZIndex] = useState<number>(initialZindex ?? getTopZ() + 1);

	// 为每个实例生成唯一 token，跨渲染保持稳定
	const tokenRef = useRef<number | null>(null);
	if (tokenRef.current === null) {
		tokenRef.current = ++serial;
	}

	useEffect(() => {
		const token = tokenRef.current;
		if (token === null) return;
		// 此时自身尚未登记，getTopZ 返回的是其它层的最高值
		const base = initialZindex ?? getTopZ() + 1;
		registry.set(token, { id, z: base, setZ: setZIndex });
		setZIndex(base);
		return () => {
			registry.delete(token);
		};
	}, [id, initialZindex]);

	const bringToFront = useCallback(() => {
		const token = tokenRef.current;
		if (token === null) return;
		const me = registry.get(token);
		if (!me) return;

		// 统计全局最高值及其占用的层数
		let maxGlobal = 0;
		registry.forEach((layer) => {
			if (layer.z > maxGlobal) {
				maxGlobal = layer.z;
			}
		});
		let holderCount = 0;
		registry.forEach((layer) => {
			if (layer.z === maxGlobal) {
				holderCount += 1;
			}
		});

		// 已是唯一最高层：无需处理，避免无意义的 +1
		if (me.z === maxGlobal && holderCount === 1) return;

		if (holderCount > 1) {
			// 最高值被多个层共享：唯一需要 +1 的场景，整体越过该共享组
			applyZ(me, maxGlobal + 1);
			return;
		}

		// 最高值唯一：本层顶替该最高值，原在其上方的各层依次 -1，
		// 保持各层相对顺序不变，且 z 值不会随切换次数无限增长
		const oldZ = me.z;
		registry.forEach((layer, key) => {
			if (key !== token && layer.z > oldZ) {
				applyZ(layer, layer.z - 1);
			}
		});
		applyZ(me, maxGlobal);
	}, []);

	return { zIndex, bringToFront };
};