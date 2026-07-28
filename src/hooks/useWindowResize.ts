import { useEffect } from "react";

/**
 * 监听窗口大小变化
 * @param handler - 窗口大小变化时的回调函数
 */
export const useWindowResize = (handler: () => void) => {
	useEffect(() => {
		const wrappedHandler = () => requestAnimationFrame(handler);
		window.addEventListener("resize", wrappedHandler);
		return () => {
			window.removeEventListener("resize", wrappedHandler);
		};
	}, [handler]);
};