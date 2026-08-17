import { useEffect, useState } from "react";
import { SpanButton } from "./Button";
import "@/styles/components/stepinput.scss";
import "@/styles/common.module.scss";
import { namespace } from "@/styles/namespace";
const CSS_NS = namespace;

export const StepInput = ({
    value,
    onChange,
    min = 0,
    max = null as number | null,
    step = 1,
}: {
    value: any;
    onChange?: (n: number) => void;
    min?: number;
    max?: number | null;
    step?: number;
}) => {
    const [val, setVal] = useState(value ? parseInt(value) : 0);

    useEffect(() => {
        setVal(value ? parseInt(value) : 0);
    }, [value]);

    useEffect(() => {
        onChange && onChange(val);
    }, [val]);

    return (
        <>
            <span className={`${CSS_NS}-step-input-wrap`}>
                <SpanButton
                    className={"si-minus" + (min !== null && val <= min ? " disabled" : "")}
                    onClick={() => {
                        if (min !== null && val - step < min) {
                            return;
                        }
                        setVal(val - step);
                    }}
                ></SpanButton>
                <input type="text" value={val} pattern="\d*" onChange={(e) => setVal(parseInt(e.target.value))} />
                <SpanButton
                    className={"si-plus" + (max !== null && val >= max ? " disabled" : "")}
                    onClick={() => {
                        if (max !== null && val + step > max) {
                            return;
                        }
                        setVal(val + step);
                    }}
                ></SpanButton>
            </span>
        </>
    );
};
