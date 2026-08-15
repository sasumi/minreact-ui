import styleDefines from "@/styles/common.module.scss";
import "@/styles/components/wordcounter.scss";
import { bindDomEvent } from "minutool";
import { useEffect, useState } from "react";

const { namespace } = styleDefines;
interface WordCounterProps {
    input: HTMLInputElement | HTMLTextAreaElement | null;
    max?: number;
    onOverflowChange?: (isOverflow: boolean, currentLength: number) => void;
}

export default function WordCounter({ input, max, onOverflowChange }: WordCounterProps) {
    const [count, setCount] = useState(0);

    useEffect(() => {
        if (!input) return;

        const updateCount = () => {
            const currentLen = input.value.length;
            setCount(currentLen);

            // 仅在存在 max 时通知越界状态
            if (max !== undefined) {
                const isOver = currentLen > max;
                onOverflowChange?.(isOver, currentLen);
            }
        };
        updateCount();

        const cleanup: Array<() => void> = [];

        // 伪代码示例：避开拼音输入过程中的中间状态
        let isComposing = false;
        cleanup.push(
            bindDomEvent(input, "compositionstart", () => {
                isComposing = true;
            }),
        );
        cleanup.push(
            bindDomEvent(input, "compositionend", () => {
                isComposing = false;
                updateCount();
            }),
        );
        cleanup.push(
            bindDomEvent(input, "input", () => {
                if (!isComposing) updateCount();
            }),
        );

        return () => {
            cleanup.forEach((unbind) => unbind());
        };
    }, [input, max, onOverflowChange]);

    const isOverload = max !== undefined && count > max;

    return (
        <span className={`${namespace}-input-counter ${isOverload ? `${namespace}-input-counter--overload` : ""}`}>
            <span className={`${namespace}-ct`}>{count}</span>
            {max !== undefined && (
                <>
                    <span className={`${namespace}-slash`}>/</span>
                    <span className={`${namespace}-mx`}>{max}</span>
                </>
            )}
        </span>
    );
}
