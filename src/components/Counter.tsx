import styleDefines from "@/styles/common.module.scss";
import "@/styles/components/counter.scss";
import { bindDomEvent } from "minutool";
import { useEffect, useRef, useState } from "react";

const { namespace } = styleDefines;

/**
 * A React component that displays a character counter for an input or textarea element.
 */
export default function Counter({ refInput, max }: { refInput: React.RefObject<HTMLInputElement | HTMLTextAreaElement | null>; max?: number }) {
    const [count, setCount] = useState(0);
    const boundElRef = useRef<HTMLElement | null>(null);

    // Intentionally no deps array — refInput is a stable RefObject;
    // boundElRef guards against redundant re-bindings.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    useEffect(() => {
        const el = refInput?.current;
        if (!el || el === boundElRef.current) return;

        boundElRef.current = el;
        setCount(el.value.length);
        const updCtn = () => {
            setCount(el.value.length);
        };
        return bindDomEvent(el, "input", updCtn);
    });
    return (
        <span className={namespace + "-input-counter " + (max && count > max ? namespace + "-input-counter--overload" : "")}>
            <span className={namespace + "-ct"}>{count}</span>
            {max && <span className={namespace + "-slash"}>/</span>}
            {max && <span className={namespace + "-mx"}>{max}</span>}
        </span>
    );
}
