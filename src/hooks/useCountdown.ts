import { useEffect, useRef, useState } from "react";

/**
 * 倒计时hook
 * @param initialSeconds - 初始秒数
 * @param min - 最小秒数，默认为0
 * @returns 当前剩余秒数
 */
export const useCountdown = (initialSeconds: number, min: number = 0) => {
    const [seconds, setSeconds] = useState(initialSeconds);
    const startTimeRef = useRef<number>(Date.now());
    const targetSecondsRef = useRef<number>(initialSeconds);
    const timerIdRef = useRef<number | undefined>(undefined);

    useEffect(() => {
        // 重置开始时间和目标秒数
        startTimeRef.current = Date.now();
        targetSecondsRef.current = initialSeconds;
        setSeconds(initialSeconds);
    }, [initialSeconds]);

    useEffect(() => {
        if (seconds <= min) {
            return;
        }

        const tick = () => {
            const now = Date.now();
            const elapsed = Math.floor((now - startTimeRef.current) / 1000);
            const remaining = Math.max(min, targetSecondsRef.current - elapsed);

            setSeconds(remaining);

            if (remaining > min) {
                timerIdRef.current = window.setTimeout(tick, 1000);
            }
        };

        // 计算到下一秒的初始延迟
        const now = Date.now();
        const initialDelay = 1000 - ((now - startTimeRef.current) % 1000);
        timerIdRef.current = window.setTimeout(tick, initialDelay);

        return () => {
            if (timerIdRef.current !== undefined) {
                clearTimeout(timerIdRef.current);
            }
        };
    }, [seconds, min]);

    return seconds;
};
