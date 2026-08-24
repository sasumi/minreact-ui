import "./../styles/common.module.scss";
import { lockElementInteraction } from "minutool";
import { memo, useState } from "react";
import { Spinner } from "./Spinner";
import { textTranslate } from "@/utils";

const BUTTON_DEBOUNCE_TIME = 200;

type AnyButtonProps = {
    tag?: string;
    children?: React.ReactNode;
    className?: string;
    style?: React.CSSProperties;
    onClick?: (e: any) => void;
    onKeyDown?: (e: any) => void;
    disabled?: boolean;
    debounce?: boolean;
    checked?: boolean;
    onChange?: (v: any) => void;
    [key: string]: any;
};

export const SpanButton = memo(function ({ children, ...props }: AnyButtonProps) {
    return (
        <AnyButton tag="span" {...props}>
            {children}
        </AnyButton>
    );
});

export const SubmitButton = memo(function ({ children, ...props }: AnyButtonProps) {
    return (
        <AnyButton tag="button" type="submit" {...props}>
            {children}
        </AnyButton>
    );
});

export const PrimaryButton = memo(function ({ children, ...props }: AnyButtonProps) {
    return (
        <AnyButton tag="button" {...props}>
            {children}
        </AnyButton>
    );
});

export const NormalButton = memo(function ({ children, ...props }: AnyButtonProps) {
    return (
        <AnyButton tag="button" {...props}>
            {children}
        </AnyButton>
    );
});

export const AnyButton = memo(function ({ tag: Tag, children, ...props }: AnyButtonProps) {
    const [lastClickTime, setLastClickTime] = useState<number | null>(null);
    const callback = (event: any) => {
        if (props.onClick && (event.type === "click" || event.key === "Enter" || event.key === " ")) {
            // event.preventDefault(); // 防止默认行为（如滚动）
            if (!props.disabled) {
                const now = Date.now();
                //按钮默认开启debounce
                if ((props.debounce || props.debounce === undefined) && lastClickTime && now - lastClickTime < BUTTON_DEBOUNCE_TIME) {
                    console.debug("button debounce");
                    return false;
                }
                setLastClickTime(now);
                props.onClick(event);
            }
            return false;
        }
    };

    const TagEl = (Tag || "span") as any;

    // aria-disabled 属性用于无障碍访问，表示元素是否可交互
    if (props.disabled) {
        props["aria-disabled"] = true;
    }
    let attrs: Record<string, any> = { ...props };
    attrs.style = { ...attrs.style };

    delete attrs.onClick;
    delete attrs.debounce;
    return (
        <TagEl {...attrs} role="button" tabIndex={props.disabled ? -1 : 0} onClick={callback} onKeyDown={callback}>
            {children}
        </TagEl>
    );
});

interface ReloadButtonProps {
    payload: () => Promise<any>;
    className?: string;
    resultKeepTime?: number;
    refreshDataText?: string;
    refreshingDataText?: string;
    refreshDataSuccessText?: string;
    refreshDataFailedText?: string;
}

/**
 * ReloadButton 重新加载按钮组件，点击后执行 payload 函数，并显示加载状态、成功或失败状态
 * @param payload 点击按钮后执行的函数，返回一个 Promise
 * @param className 按钮的自定义 className
 * @param resultKeepTime 错误或成功状态保持时间，超过这个时间会自动恢复到初始状态
 * @param refreshDataText 刷新数据按钮的文本
 * @param refreshingDataText 刷新数据中按钮的文本
 * @param refreshDataSuccessText 刷新数据成功按钮的文本
 * @param refreshDataFailedText 刷新数据失败按钮的文本
 */
export const ReloadButton = ({
    payload,
    className,
    resultKeepTime = 2000,
    refreshDataText = "刷新数据",
    refreshingDataText = "刷新数据中",
    refreshDataSuccessText = "刷新数据成功",
    refreshDataFailedText = "刷新数据失败({error})",
}: ReloadButtonProps) => {
    const [running, setRunning] = useState(false);
    const STATE_INIT = "INIT";
    const STATE_ERROR = "ERROR";
    const STATE_SUCCESS = "SUCCESS";

    const RESULT_KEEP_TIME = resultKeepTime; //错误或成功状态保持时间，超过这个时间会自动恢复到初始状态
    const [state, setState] = useState<typeof STATE_INIT | typeof STATE_ERROR | typeof STATE_SUCCESS>(STATE_INIT);
    const [title, setTitle] = useState(refreshDataText);

    return (
        <SpanButton
            className={"reload-button " + (className || "")}
            title={title}
            onClick={(e) => {
                lockElementInteraction(e.currentTarget, (reset) => {
                    setState(STATE_INIT);
                    setTitle(refreshingDataText);
                    setRunning(true);
                    payload()
                        .then(() => {
                            setState(STATE_SUCCESS);
                            setTitle(refreshDataSuccessText);
                        })
                        .catch((error) => {
                            reset();
                            setState(STATE_ERROR);
                            setTitle(textTranslate(refreshDataFailedText, { error: error.message || error.toString() }));
                        })
                        .finally(() => {
                            setRunning(false);
                            setTimeout(() => {
                                reset();
                                setState(STATE_INIT);
                                setTitle(refreshDataText);
                            }, RESULT_KEEP_TIME);
                        });
                });
            }}
        >
            {state === STATE_INIT && <Spinner run={running} />}
            {state === STATE_ERROR && <span className="icon icon-warning"></span>}
            {state === STATE_SUCCESS && <span className="icon icon-check"></span>}
        </SpanButton>
    );
};
