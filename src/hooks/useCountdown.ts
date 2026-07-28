import { useEffect, useState } from "react";

/**
 * 倒计时hook
 * @param initialSeconds - 初始秒数
 * @param min - 最小秒数，默认为0
 * @returns 当前剩余秒数
 */
export const useCountdown = (initialSeconds: number, min: number = 0) => {
    const [countdown, setCountdown] = useState({
        seconds: Math.max(min, initialSeconds),
        targetSeconds: initialSeconds,
    });

    useEffect(() => {
        if (initialSeconds <= min) {
            return;
        }

        const startTime = Date.now();
        let timerId: number | undefined;

        const tick = () => {
            const now = Date.now();
            const elapsed = Math.floor((now - startTime) / 1000);
            const remaining = Math.max(min, initialSeconds - elapsed);

            setCountdown({
                seconds: remaining,
                targetSeconds: initialSeconds,
            });

            if (remaining > min) {
                const nextDelay = 1000 - ((now - startTime) % 1000) || 1000;
                timerId = window.setTimeout(tick, nextDelay);
            }
        };

        timerId = window.setTimeout(tick, 1000);

        return () => {
            if (timerId !== undefined) {
                clearTimeout(timerId);
            }
        };
    }, [initialSeconds, min]);

    if (countdown.targetSeconds !== initialSeconds) {
        return Math.max(min, initialSeconds);
    }

    return countdown.seconds;
};
