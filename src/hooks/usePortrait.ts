import { isPortrait } from "minutool";
import { useEffect, useState } from "react";

/**
 * 监听屏幕方向变化
 */
export const usePortrait = () => {
	const [inPortrait, setInPortrait] = useState(isPortrait());
	useEffect(() => {
		const handleResize = () => {
			setInPortrait(isPortrait());
		};
		window.addEventListener("resize", handleResize);
		return () => {
			window.removeEventListener("resize", handleResize);
		};
	}, []);

	return inPortrait;
};
