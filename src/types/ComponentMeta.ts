import type { FC, ReactElement } from 'react';

/**
 * 带标题的组件类型
 * 组件通过静态 Hook useTitle 返回翻译后的标题
 */
export interface IComponentWithTitle<P = any> extends FC<P> {
	/** 标题 Hook，内部调用 useTranslation，返回翻译后的标题 */
	useTitle: () => string;
}

/**
 * 检测子组件是否有 useTitle 方法
 */
export function hasUseTitle(child: any): child is ReactElement & { type: IComponentWithTitle } {
	return child && typeof child === 'object' && child.type && typeof child.type.useTitle === 'function';
}

/**
 * 从 children 中提取标题
 * 支持单个子组件或子组件数组
 */
export function extractTitle(children: any): string | null {
	if (!children) return null;

	// 如果是数组，取第一个
	const child = Array.isArray(children) ? children[0] : children;

	if (hasUseTitle(child)) {
		return child.type.useTitle();
	}

	return null;
}
