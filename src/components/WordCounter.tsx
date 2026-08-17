import "@/styles/common.module.scss";
import "@/styles/components/wordcounter.scss";
import { namespace } from "@/styles/namespace";
import { bindDomEvent } from "minutool";
import { useEffect, useState } from "react";

const CSS_NS = namespace + "-wordcounter";

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
        <span className={`${CSS_NS} ${isOverload ? `${CSS_NS}--overload` : ""}`} data-count={count} data-max={max}>
            <span className={`${CSS_NS}-ct`}>{count}</span>
            {max !== undefined && (
                <>
                    <span className={`${CSS_NS}-slash`}>/</span>
                    <span className={`${CSS_NS}-mx`}>{max}</span>
                </>
            )}
        </span>
    );
}
