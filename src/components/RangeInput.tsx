import "@/styles/components/range.scss";
import { detectedPrecision, round } from "minutool";
import { useCallback, useEffect, useRef, useState } from "react";

import "@/styles/common.module.scss";
import { namespace } from "@/styles/namespace";
import { textTranslate } from "@/utils.tsx";

const CSS_NS = namespace;
let changeTm: ReturnType<typeof setTimeout> | null = null;

interface RangeInputProps {
    value: number;
    min?: number;
    max?: number;
    precision?: number | null;
    disabled?: boolean;
    step?: number;
    unit?: string;
    inputPromptText?: string;
    inputRangeAlertText?: string;
    onInput?: (v: number) => void;
}

function RangeInput({
    value,
    min = 0,
    max = 100,
    precision = null,
    disabled = false,
    step = 1,
    unit = "",
    inputPromptText: inputPromptTitle = "请输入数值",
    inputRangeAlertText = "请输入范围在 {min} 到 {max} 之间的数值",
    onInput = () => {},
}: RangeInputProps) {
    min = Number(min);
    max = Number(max);
    const [val, setVal] = useState<number>(value);
    const stepV = Number(step);
    const rangeRef = useRef<HTMLInputElement>(null);
    precision = precision === null ? detectedPrecision(min, max, step) : precision;

    useEffect(() => {
        changeTm && clearTimeout(changeTm);
        changeTm = setTimeout(() => {
            if (val !== value) {
                onInput(val);
            }
        }, 100);
    }, [val]);

    const promptVal = useCallback(() => {
        let vStr = window.prompt(inputPromptTitle, String(val));
        if (vStr === null) {
            return;
        }
        const v = parseFloat(vStr);
        if (v > max || v < min) {
            alert(textTranslate(inputRangeAlertText, { min, max }));
            return;
        }
        setVal(v);
    }, [val, min, max]);

    const handleScroll = useCallback(
        (e: WheelEvent) => {
            e.preventDefault();
            if (e.deltaY < 0) {
                if (val + stepV <= max) {
                    setVal(round(val + stepV, precision));
                }
            } else {
                if (val - stepV >= min) {
                    setVal(round(val - stepV, precision));
                }
            }
        },
        [val, stepV, min, max, precision],
    );

    useEffect(() => {
        rangeRef.current?.addEventListener("wheel", handleScroll);
        return () => {
            rangeRef.current?.removeEventListener("wheel", handleScroll);
        };
    }, [handleScroll]);

    return (
        <>
            <span className={CSS_NS + "-range-selector"} {...(disabled ? { "aria-disabled": true } : {})}>
                <input
                    ref={rangeRef}
                    type="range"
                    value={val}
                    min={min}
                    step={step}
                    max={max}
                    disabled={disabled}
                    onChange={(e) => {
                        setVal(parseFloat(e.target.value));
                    }}
                />
                <span className="rs-input" role="button" tabIndex={0} onClick={promptVal}>
                    {val}
                </span>
                {unit}
            </span>
        </>
    );
}

export default RangeInput;
