import { Spinner } from "./Spinner";

/**
 * DataLoading 数据加载中提示组件
 */
export const DataLoading = ({ text, ...props }: { text?: string; [key: string]: any } = {}) => {
    const className = ["loading", props.className].filter(Boolean).join(" ");
    props.className = className;
    return (
        <div className={className} {...props}>
            <Spinner run={true} />
            {text}
        </div>
    );
};

/**
 * DataEmpty 数据为空提示组件
 */
export const DataEmpty = ({ text, ...props }: { text?: string; [key: string]: any } = {}) => {
    const className = ["empty", props.className].filter(Boolean).join(" ");
    props.className = className;
    return (
        <span className={className} {...props}>
            {text}
        </span>
    );
};

/**
 * RequestError 请求错误提示组件
 */
export const RequestError = ({ error, ...props }: { error?: string; [key: string]: any } = {}) => {
    const className = ["request-error", props.className].filter(Boolean).join(" ");
    props.className = className;
    return (
        <span className={className} {...props}>
            {error}
        </span>
    );
};
