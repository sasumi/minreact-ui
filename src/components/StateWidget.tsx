import { Spinner } from "./Spinner";
import { namespace } from "./../styles/namespace";
import "./../styles/components/statewidget.scss";

const CSS_NS = namespace + "-statewidget";

export const LoadingHolder = ({ text, ...props }: { text?: string; [key: string]: any } = {}) => {
    const className = [CSS_NS + "-loading", props.className].filter(Boolean).join(" ");
    props.className = className;
    return (
        <div className={className} {...props}>
            <Spinner/>
            {text}
        </div>
    );
};

export const EmptyHolder = ({ text, ...props }: { text?: string; [key: string]: any } = {}) => {
    const className = [CSS_NS + "-empty", props.className].filter(Boolean).join(" ");
    props.className = className;
    return (
        <span className={className} {...props}>
            {text || "没有数据"}
        </span>
    );
};

export const ErrorHolder = ({ error, ...props }: { error?: string; [key: string]: any } = {}) => {
    const className = [CSS_NS + "-error", props.className].filter(Boolean).join(" ");
    props.className = className;
    return (
        <span className={className} {...props}>
            {error || "发生错误"}
        </span>
    );
};
