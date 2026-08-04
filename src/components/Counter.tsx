import "@/styles/common.module.scss";
import "@/styles/components/counter.scss";
import { useEffect, useState } from "react";

/**
 * A React component that displays a character counter for an input or textarea element.
 */
export default function Counter({ refInput, max }: { refInput: React.RefObject<HTMLInputElement | HTMLTextAreaElement>; max?: number }) {
    const [count, setCount] = useState(0);
    useEffect(() => {
        if (refInput.current) {
            setCount(refInput.current.value.length);
            const updCtn = () => {
                refInput.current && setCount(refInput.current.value.length);
            };
            refInput.current.addEventListener("input", updCtn);
            return () => {
                refInput.current && refInput.current.removeEventListener("input", updCtn);
            };
        }
    }, [refInput.current]);
    return (
        <span className={"input-counter " + (max && count > max ? "input-counter--overload" : "")}>
            <span className="ct">{count}</span>
            {max && <span className="slash">/</span>}
            {max && <span className="mx">{max}</span>}
        </span>
    );
}
