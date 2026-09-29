import { Spinner } from "./Spinner";

export const LoadingHolder = ({ text, ...props }: { text?: string; [key: string]: any } = {}) => {
    const className = ["loading", props.className].filter(Boolean).join(" ");
    props.className = className;
    return (
        <div className={className} {...props}>
            <Spinner run={true} />
            {text}
        </div>
    );
};

export const EmptyHolder = ({ text, ...props }: { text?: string; [key: string]: any } = {}) => {
    const className = ["empty", props.className].filter(Boolean).join(" ");
    props.className = className;
    return (
        <span className={className} {...props}>
            {text}
        </span>
    );
};

export const ErrorHolder = ({ error, ...props }: { error?: string; [key: string]: any } = {}) => {
    const className = ["request-error", props.className].filter(Boolean).join(" ");
    props.className = className;
    return (
        <span className={className} {...props}>
            {error}
        </span>
    );
};
