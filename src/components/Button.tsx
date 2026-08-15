import { memo, useEffect, useState } from "react";
import "@/styles/common.module.scss";
import { Spinner } from "./Spinner";
import { lockElementInteraction } from "minutool";
import { useTranslation } from "react-i18next";

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
    props = { ...props };
    props.className = "button-outlined " + (props.className || "");
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
    let attrs: Record<string, any> = { ...props };
    attrs.style = { ...attrs.style };

    delete attrs.onClick;
    delete attrs.debounce;
    return (
        <TagEl {...attrs} role="button" tabIndex={0} onClick={callback} onKeyDown={callback}>
            {children}
        </TagEl>
    );
});

export const ReloadButton = ({ payload, className, resultKeepTime }: { payload: () => Promise<any>; className?: string; resultKeepTime?: number }) => {
    const { t } = useTranslation(["component"]);
    const [runing, setRunning] = useState(false);
    const STATE_INIT = "INIT";
    const STATE_ERROR = "ERROR";
    const STATE_SUCCESS = "SUCCESS";

    const RESULT_KEEP_TIME = resultKeepTime || 2000; //错误或成功状态保持时间，超过这个时间会自动恢复到初始状态
    const [state, setState] = useState<typeof STATE_INIT | typeof STATE_ERROR | typeof STATE_SUCCESS>(STATE_INIT);
    const [title, setTitle] = useState(t("component:reloadButton.refreshData"));

    return (
        <SpanButton
            className={"reload-button " + (className || "")}
            title={title}
            onClick={(e) => {
                lockElementInteraction(e.currentTarget, (reset) => {
                    setState(STATE_INIT);
                    setTitle(t("component:reloadButton.refreshingData"));
                    setRunning(true);
                    payload()
                        .then(() => {
                            setState(STATE_SUCCESS);
                            setTitle(t("component:reloadButton.refreshDataSuccess"));
                        })
                        .catch((error) => {
                            reset();
                            setState(STATE_ERROR);
                            setTitle(t("component:reloadButton.refreshDataFailed", { error }));
                        })
                        .finally(() => {
                            setRunning(false);
                            setTimeout(() => {
                                reset();
                                setState(STATE_INIT);
                                setTitle(t("component:reloadButton.refreshData"));
                            }, RESULT_KEEP_TIME);
                        });
                });
            }}
        >
            {state === STATE_INIT && <Spinner run={runing} />}
            {state === STATE_ERROR && <span className="icon icon-warning"></span>}
            {state === STATE_SUCCESS && <span className="icon icon-check"></span>}
        </SpanButton>
    );
};
