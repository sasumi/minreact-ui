/* eslint-disable react-refresh/only-export-components */
import { NormalButton } from "@/components/Button";
import type { DialogProps } from "./Dialog";
import styleDefines from "@/styles/common.module.scss";
import { mountReactNode } from "@/utils/Dom";
import { prettyTimeDuration } from "@/utils/Time";
import { calcRemainingMSecs, lockElementInteraction } from "minutool";
import type { ComponentType, ReactNode } from "react";
import { useEffect, useRef, useState } from "react";
import { createRoot } from "react-dom/client";
import { useTranslation } from "react-i18next";
import { Dialog, DIALOG_SIZE_NORMAL, DIALOG_SIZE_SMALL } from "./Dialog";
import { makeElement } from "./Form";

const CSS_NS = styleDefines.namespace;

/**
 * 简单对话框
 */
export const showDialog = ({ content, onClose, ...dlgProps }: Partial<DialogProps> & { content: ReactNode | string; onClose?: () => boolean | void }) => {
    const div = document.createElement("div");
    document.body.appendChild(div);
    const root = createRoot(div);

    function destroy() {
        root.unmount();
        div.remove();
        onClose?.();
    }

    function DialogWrapper() {
        const [open, setOpen] = useState(true);
        useEffect(() => {
            !open && setTimeout(destroy, 0);
        }, [open]);

        return (
            <Dialog {...dlgProps} open={open} setOpen={setOpen}>
                {content}
            </Dialog>
        );
    }

    root.render(<DialogWrapper />);
    return destroy;
};

/**
 * 显示 React 组件作为对话框
 */
export const showDialogComponent = <P extends object>(
    DialogComponent: ComponentType<P & { open: boolean; setOpen: (open: boolean) => void }>,
    props: P = {} as P,
) => {
    const unmountRef: { current: (() => void) | null } = { current: null };
    const DialogWrapper = () => {
        const [open, setOpen] = useState(true);
        useEffect(() => {
            if (!open) {
                setTimeout(() => {
                    if (unmountRef.current) {
                        unmountRef.current();
                    }
                }, 0);
            }
        }, [open]);

        return <DialogComponent open={open} setOpen={setOpen} {...props} />;
    };

    unmountRef.current = mountReactNode(<DialogWrapper />);
    return unmountRef.current;
};

export const showIframeDialog = ({
    title = "",
    url,
    width = DIALOG_SIZE_NORMAL,
    height = null,
}: {
    title?: string;
    url: string;
    width?: string;
    height?: string | null;
}) => {
    return showDialog({
        title,
        content: <iframe src={url} style={{ width: "100%", height: height ?? "400px", border: "none" }} />,
        width,
        wrapContent: false,
    });
};

/**
 * 图片预览
 */
export const showImgPreview = (src: string) => {
    let closer: (() => void) | null = null;
    closer = showDialog({
        title: "",
        content: (
            <img
                src={src}
                onClick={() => {
                    closer?.();
                }}
            />
        ),
        className: `${CSS_NS}-dialog-img-preview`,
    });
};

/**
 * 显示输入提示对话框
 */
export const prompt = ({
    title = "",
    defaultValue = "" as string | number,
    onSubmit = null,
    type = "text",
    step = null,
    width = DIALOG_SIZE_SMALL,
    showTopCloser = true,
}: {
    title?: string;
    defaultValue?: string | number;
    onSubmit?: ((value: string) => Promise<unknown>) | null;
    type?: string;
    step?: string | number | null;
    width?: string | null;
    showTopCloser?: boolean;
} = {}) => {
    return new Promise<string | void>((resolve) => {
        const closerRef: { current: (() => void) | null } = { current: null };

        function DialogWrap() {
            const formRef = useRef<HTMLFormElement>(null);
            const elRef = useRef<HTMLInputElement>(null);
            const [inputValue, setInputValue] = useState(defaultValue);

            const doSubmit = () => {
                let val = elRef.current!.value;
                if (onSubmit) {
                    formRef.current &&
                        lockElementInteraction(formRef.current, (reset) => {
                            onSubmit(val)
                                .then(() => {
                                    resolve(val);
                                    closerRef.current?.();
                                })
                                .finally(reset);
                        });
                } else {
                    resolve(val);
                    closerRef.current?.();
                }
            };
            useEffect(() => {
                if (elRef.current) {
                    elRef.current.focus();
                }
            }, []);
            return (
                <Dialog
                    showTopCloser={showTopCloser}
                    open={true}
                    setOpen={(open) => !open && closerRef.current?.()}
                    className={`${CSS_NS}-dialog-prompt`}
                    width={width}
                    wrapContent={false}
                >
                    <form
                        ref={formRef}
                        onSubmit={(e) => {
                            e.preventDefault();
                            doSubmit();
                            return false;
                        }}
                    >
                        <Dialog.Title>{title}</Dialog.Title>
                        <Dialog.Content>
                            <div className="pt-inputs">
                                {makeElement({
                                    type,
                                    defaultValue,
                                    step,
                                    ref: elRef,
                                    onChange: (e: React.ChangeEvent<HTMLInputElement>) => setInputValue(e.target.value),
                                })}
                            </div>
                        </Dialog.Content>
                        <Dialog.Action>
                            <NormalButton
                                type="submit"
                                onClick={(e) => {
                                    e.preventDefault();
                                    doSubmit();
                                }}
                            >
                                确认
                            </NormalButton>
                            <NormalButton
                                type="button"
                                onClick={(e) => {
                                    e.preventDefault();
                                    closerRef.current?.();
                                }}
                            >
                                取消
                            </NormalButton>
                        </Dialog.Action>
                    </form>
                </Dialog>
            );
        }

        let closer: (() => void) | null = null;
        closer = showDialogComponent(DialogWrap);
        closerRef.current = closer;
    });
};

/**
 * 显示进度对话框
 */
export const showProgressDialog = ({
    title,
    message,
    canAbort = true,
    abortText = "",
    onAbort = null,
    autoClose = true,
}: {
    title: string;
    message?: string;
    canAbort?: boolean;
    abortText?: string;
    onAbort?: (() => void) | null;
    autoClose?: boolean;
}): {
    update: (p: number, totalValue?: number) => void;
    isAborted: () => boolean;
    close: () => void;
} => {
    let closer: (() => void) | null = null;
    const apiRef = {
        updater: null as ((p: number, totalValue?: number) => void) | null,
        isAborted: null as (() => boolean) | null,
    };

    const ProgressDialog = () => {
        const { t } = useTranslation(["common"]);
        const [aborted, setAborted] = useState(false);
        const abortControllerRef = useRef(new AbortController());
        const [progressValue, setProgressValue] = useState(0);
        const [totalValue, setTotalValue] = useState(100);
        const [startTime] = useState(() => Date.now());

        const isAborted = () => {
            return aborted || abortControllerRef.current.signal.aborted;
        };

        const updater = (p: number, newTotal?: number) => {
            if (p !== undefined) {
                setProgressValue(p);
            }
            if (newTotal !== undefined) {
                setTotalValue(newTotal);
            }
        };

        useEffect(() => {
            apiRef.updater = updater;
            apiRef.isAborted = isAborted;
            // eslint-disable-next-line react-hooks/exhaustive-deps
        }, []);

        useEffect(() => {
            if (autoClose && progressValue >= totalValue && totalValue > 0) {
                setTimeout(() => closer?.(), 0);
            }
        }, [progressValue, totalValue]);

        const remainSecs = Math.floor(calcRemainingMSecs(progressValue, totalValue, startTime) / 1000);
        const remainSecsStr = remainSecs === Infinity ? "" : t("common:remainTimes", { timeStr: prettyTimeDuration(remainSecs) });

        return (
            <Dialog
                open={true}
                setOpen={(open) => {
                    if (!open) {
                        closer?.();
                    }
                }}
                showTopCloser={canAbort}
                title={title}
                className={`${CSS_NS}-dialog-progress`}
                autoFocus={false}
            >
                {!!message && <div className="pd-message" dangerouslySetInnerHTML={{ __html: message }} />}
                <progress value={progressValue} max={totalValue} className="progress" />
                <div className="pd-status">
                    <span className="p-tm">{remainSecsStr}</span>
                    <span className="p-txt">
                        {progressValue}/{totalValue}
                        {totalValue > 0 && ` (${Math.floor((progressValue / totalValue) * 100)}%)`}
                    </span>
                </div>
            </Dialog>
        );
    };

    closer = showDialogComponent(ProgressDialog);

    return {
        update: (p, totalValue) => apiRef.updater?.(p, totalValue),
        isAborted: () => apiRef.isAborted?.() ?? false,
        close: () => closer?.(),
    };
};

/**
 * 显示确认对话框
 * @param width 对话框宽度，默认为 DIALOG_SIZE_SMALL
 * @param className 对话框的自定义 className
 * @param confirmText 确认按钮文本，默认为 "确定"
 * @param cancelText 取消按钮文本，默认为 "取消"
 * @param onPreConfirm 确认按钮点击前的回调函数，返回 false 可阻止关闭对话框
 * @param onPreCancel 取消按钮点击前的回调函数，返回 false 可阻止关闭对话框
 * @returns Promise<void>，确认时 resolve，取消时 reject
 */
export const confirm = ({
    title = null,
    message = null,
    width = DIALOG_SIZE_SMALL,
    className = "",
    confirmText = "确定",
    cancelText = "取消",
    onPreConfirm = () => true,
    onPreCancel = () => true,
}: {
    title?: string | null;
    message?: string | ReactNode | null;
    width?: string | null;
    className?: string;
    confirmText?: string;
    cancelText?: string;
    onPreConfirm?: () => boolean | void;
    onPreCancel?: () => boolean | void;
}): Promise<void> => {
    return new Promise<void>((resolve, reject) => {
        let closerFn: (() => void) | null = null;
        closerFn = showDialog({
            title,
            content: message,
            action: (
                <>
                    <button
                        onClick={() => {
                            if (onPreConfirm?.() === false) {
                                return;
                            }
                            closerFn?.();
                            resolve();
                        }}
                    >
                        {confirmText}
                    </button>
                    <button
                        onClick={() => {
                            if (onPreCancel?.() === false) {
                                return;
                            }
                            closerFn?.();
                            reject();
                        }}
                    >
                        {cancelText}
                    </button>
                </>
            ),
            className: `${CSS_NS}-dialog-confirm ${className || ""}`,
            showTopCloser: false,
            width,
        });
    });
};

/**
 * 显示提示对话框
 */
export const alert = (
    title = "",
    message: ReactNode = "",
    {
        closeButtonTitle = "确定",
        width = DIALOG_SIZE_SMALL,
        maxWidth = null,
    }: {
        closeButtonTitle?: string;
        width?: string;
        maxWidth?: string | null;
    } = {},
) => {
    return new Promise<void>((resolve) => {
        const closer = showDialog({
            title,
            content: message,
            action: (
                <NormalButton
                    onClick={() => {
                        closer?.();
                        resolve();
                    }}
                >
                    {closeButtonTitle}
                </NormalButton>
            ),
            className: `${CSS_NS}-dialog-alert`,
            autoFocus: true,
            showTopCloser: false,
            width: width,
            maxWidth: maxWidth,
        });
    });
};
