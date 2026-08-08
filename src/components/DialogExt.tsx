/* eslint-disable react-refresh/only-export-components */
import { NormalButton } from "@/components/Button";
import { FormTextTypes, makeElement } from "@/components/Form";
import { useMinuiTranslate } from "@/locale/i18n";
import styleDefines from "@/styles/common.module.scss";
import { mountReactNode } from "@/utils/Dom";
import { prettyTimeDuration } from "@/utils/Time";
import { calcRemainingMSecs, lockElementInteraction } from "minutool";
import type { ComponentType, ReactNode } from "react";
import { useEffect, useRef, useState } from "react";
import { createRoot } from "react-dom/client";
import { useTranslation } from "react-i18next";
import { Dialog, DIALOG_SIZE_SMALL } from "./Dialog";
import { showWarning } from "./Toast";

const CSS_NS = styleDefines.namespace;

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

/**
 * 简单对话框
 */
export const showDialog = ({
    title = undefined,
    content,
    actions = undefined,
    className = "",
    maxHeight = null,
    width = null,
    maxWidth = null,
    topCloseButton = true,
    onClose = undefined,
    autoFocus = false,
}: {
    title?: ReactNode;
    content?: ReactNode | string;
    actions?: ReactNode;
    className?: string;
    maxHeight?: string | number | null;
    width?: string | null;
    maxWidth?: string | null;
    topCloseButton?: boolean;
    onClose?: (() => void) | undefined;
    autoFocus?: boolean;
}) => {
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
            <Dialog
                open={open}
                setOpen={setOpen}
                maxHeight={maxHeight ?? undefined}
                autoFocus={autoFocus}
                className={className}
                width={width}
                maxWidth={maxWidth}
            >
                {title && <Dialog.Title>{title}</Dialog.Title>}
                {topCloseButton && <Dialog.TopCloser />}
                {content}
                {actions && <Dialog.Actions>{actions}</Dialog.Actions>}
            </Dialog>
        );
    }

    root.render(<DialogWrapper />);
    return destroy;
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

interface PromptOptions {
    defaultValue?: string | number;
    required?: boolean;
    onSubmitPromise?: ((value: string) => Promise<unknown>) | null;
    type?: string;
    step?: string | number | null;
    trimText?: boolean;
    width?: string | null;
}
/**
 * 显示输入提示对话框
 */
export const prompt = (
    label = "",
    {
        defaultValue = "" as string | number,
        required = false,
        onSubmitPromise = null,
        type = "text",
        step = null,
        trimText = false,
        width = DIALOG_SIZE_SMALL,
    }: PromptOptions = {},
) => {
    return new Promise<string | void>((resolve, reject) => {
        let closer: (() => void) | null = null;

        function DialogWrap() {
            const formRef = useRef<HTMLFormElement>(null);
            const elRef = useRef<HTMLInputElement>(null);
            const t = useMinuiTranslate();
            const [inputValue, setInputValue] = useState(defaultValue);
            const doSubmit = () => {
                let val = elRef.current!.value;

                if (FormTextTypes.includes(type) && trimText) {
                    val = val.trim();
                    if (required && !val) {
                        showWarning(t("common:pleaseEnterContent"));
                        elRef.current!.focus();
                        return;
                    }
                }
                if (onSubmitPromise) {
                    formRef.current &&
                        lockElementInteraction(formRef.current, (reset) => {
                            onSubmitPromise(val)
                                .then(() => {
                                    resolve(val);
                                    closer?.();
                                })
                                .finally(reset);
                        });
                } else {
                    resolve(val);
                    closer?.();
                }
            };
            useEffect(() => {
                if (elRef.current) {
                    elRef.current.focus();
                }
            }, []);
            return (
                <form
                    ref={formRef}
                    onSubmit={(e) => {
                        e.preventDefault();
                        doSubmit();
                        return false;
                    }}
                >
                    <div className="pt-inputs">
                        {makeElement({
                            type,
                            defaultValue,
                            step,
                            required,
                            ref: elRef,
                            onChange: (e: React.ChangeEvent<HTMLInputElement>) => setInputValue(e.target.value),
                        })}
                    </div>
                </form>
            );
        }

        closer = confirm(label, <DialogWrap />, {
            className: `${CSS_NS}-dialog-prompt`,
            width,
            onPreConfirm: () => {
                if (required && FormTextTypes.includes(type) && !String(inputValue).trim().length) {
                    showWarning(t("common:pleaseEnterContent"));
                    return false;
                }
            },
        });
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
                className={`${CSS_NS}-dialog-progress`}
                autoFocus={false}
            >
                {canAbort && (
                    <Dialog.TopCloser
                        onPreClick={() => {
                            if (window.confirm(abortText || t("common:confirmAbort"))) {
                                abortControllerRef.current.abort();
                                setAborted(true);
                                closer?.();
                                onAbort?.();
                            }
                        }}
                    />
                )}
                {title && <Dialog.Title>{title}</Dialog.Title>}
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
export const confirm = (
    title: string = "",
    message: string | ReactNode = null,
    options: {
        width?: string | null;
        className?: string;
        confirmText?: string;
        cancelText?: string;
        onPreConfirm?: () => boolean | void;
        onPreCancel?: () => boolean | void;
    } = {
        width: DIALOG_SIZE_SMALL,
        className: "",
        confirmText: "确定",
        cancelText: "取消",
        onPreConfirm: () => true,
        onPreCancel: () => true,
    },
): Promise<void> => {
    return new Promise<void>((resolve, reject) => {
        let closerFn: (() => void) | null = null;
        closerFn = showDialog({
            title,
            content: message,
            actions: (
                <>
                    <button
                        onClick={() => {
                            if (options.onPreConfirm?.() === false) {
                                return;
                            }
                            closerFn?.();
                            resolve();
                        }}
                    >
                        {options.confirmText}
                    </button>
                    <button
                        onClick={() => {
                            if (options.onPreCancel?.() === false) {
                                return;
                            }
                            closerFn?.();
                            reject();
                        }}
                    >
                        {options.cancelText}
                    </button>
                </>
            ),
            className: `${CSS_NS}-dialog-confirm ${options.className || ""}`,
            topCloseButton: false,
            width: options.width || DIALOG_SIZE_SMALL,
        });
    });
};

/**
 * 显示提示对话框
 */
export const alert = (
    title = "",
    message: ReactNode = "",
    option: { closeButtonTitle?: string; size?: string; maxWidth?: string | null } = {
        closeButtonTitle: "OK",
        size: DIALOG_SIZE_SMALL,
        maxWidth: null,
    },
) => {
    return new Promise<void>((resolve) => {
        const closer = showDialog({
            title,
            content: message,
            actions: (
                <NormalButton
                    onClick={() => {
                        closer?.();
                        resolve();
                    }}
                >
                    {option.closeButtonTitle}
                </NormalButton>
            ),
            className: `${CSS_NS}-dialog-alert`,
            autoFocus: true,
            topCloseButton: false,
            width: option.size,
            maxWidth: option.maxWidth,
        });
    });
};
