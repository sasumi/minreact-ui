import { useEffect, useState } from "react";
import "@/styles/components/com.counter.scss";
export default function Counter({ refInput, maxLength }) {
    const [count, setCount] = useState(0);
    useEffect(() => {
        if (refInput.current) {
            setCount(refInput.current.value.length);
            const updCtn = () => {
                refInput.current && setCount(refInput.current.value.length);
            };
            refInput.current.addEventListener("input", updCtn);
            return updCtn;
        }
    }, [refInput.current]);
    return (
        <span className={"input-counter " + (maxLength && count > maxLength ? "input-counter--overload" : "")}>
            <span className="ct">{count}</span>
            {maxLength && <span className="slash">/</span>}
            {maxLength && <span className="mx">{maxLength}</span>}
        </span>
    );
}
