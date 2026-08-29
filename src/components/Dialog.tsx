import { NormalButton, SpanButton } from ".//Button";
import "./../styles/common.module.scss";
import "./../styles/components/dialog.scss";
import { namespace } from "./../styles/namespace";
import { mountReactNode } from "./../utils.tsx";
import { bindClick, bindNodeMove, calcRemainingMSecs, detectedPrecision, findOne, lockElementInteraction, precisionToStep } from "minutool";
import type { ComponentType, ReactNode } from "react";
import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from "react";
import ReactDOM from "react-dom";

const CSS_NS = namespace;
const TITLE_CLASS_NAME = `${CSS_NS}-dialog-title`;
const TOP_CLOSER_CLASS_NAME = `${CSS_NS}-dialog-close-btn`;
const CONTENT_CLASS_NAME = `${CSS_NS}-dialog-content`;
const ACTION_CLASS_NAME = `${CSS_NS}-dialog-actions`;
const MASKER_CLASS_NAME = `${CSS_NS}-dialog-masker`;

/**
 * 对话框大小
 */
export const DIALOG_SIZE_SMALL = "24em";
export const DIALOG_SIZE_NORMAL = "32em";
export const DIALOG_SIZE_LARGE = "60em";
export const DIALOG_SIZE_XLARGE = "80em";
export const DIALOG_SIZE_FULL = "90vw";

const DialogTitleSymbol = Symbol("DialogTitle");
const DialogContentSymbol = Symbol("DialogContent");
const DialogActionSymbol = Symbol("DialogAction");

export interface DialogProps {
    children?: ReactNode | string;
    open: boolean;
    setOpen: (open: boolean) => void;
    modal?: boolean;

    className?: string;
    maxHeight?: string | number | null;
    maxWidth?: string | number | null;
    width?: string | null;
    autoFocus?: boolean;
    moveable?: boolean;
    clickMaskerToClose?: boolean;
    showTopCloser?: boolean;
}

interface DialogTitleProps {
    children?: ReactNode;
    className?: string;
}

interface DialogContentProps {
    children?: ReactNode;
    className?: string;
    maxHeight?: string | number | null;
    maxWidth?: string | number | null;
}

interface DialogActionProps {
    children?: ReactNode;
    className?: string;
    align?: "left" | "center" | "right";
    gap?: string | number;
}

/**
 * 对话框主组件
 * @param children - 对话框的子组件
 * @param open - 是否打开对话框
 * @param setOpen - 设置对话框打开状态的函数
 * @param ref - 对话框的引用
 * @param className - 对话框的自定义类名
 * @param maxHeight - 对话框内容的最大高度
 * @param maxWidth - 对话框内容的最大宽度
 * @param width - 对话框的宽度
 * @param autoFocus - 是否自动聚焦第一个可聚焦元素
 * @param modal - 是否为模态对话框
 * @param moveable - 是否允许拖动对话框
 * @param clickMaskerToClose - 是否允许点击遮罩层关闭对话框
 * @param showTopCloser - 是否显示右上角的关闭按钮
 */
const DialogImpl = forwardRef<HTMLDialogElement, DialogProps>(function Dialog(
    {
        children,
        open,
        setOpen,
        moveable = false,
        showTopCloser = true,
        className = "",
        maxHeight = null,
        maxWidth = null,
        autoFocus = false,
        width = null,
        modal = true,
        clickMaskerToClose = false,
    },
    ref,
) {
    const dlgRef = useRef<HTMLDialogElement | null>(null);

    useImperativeHandle(ref, () => dlgRef.current!, []);

    useEffect(() => {
        if (!open || !dlgRef.current) return;
        const dlg = dlgRef.current;
        dlg.show();
        const cleanup: (() => void)[] = [];
        if (autoFocus) {
            focusFirstElement(dlgRef.current);
        }
        if (moveable && findOne(`.${TITLE_CLASS_NAME}`, dlg)) {
            cleanup.push(bindNodeMove(dlg, `.${TITLE_CLASS_NAME}`));
        }
        if (showTopCloser) {
            cleanup.push(
                bindClick(`.${TOP_CLOSER_CLASS_NAME}`, () => {
                    setOpen(false);
                }),
            );
        }
        if (clickMaskerToClose) {
            cleanup.push(
                bindClick(`.${MASKER_CLASS_NAME}`, () => {
                    setOpen(false);
                }),
            );
        }

        return () => {
            cleanup.forEach((fn) => fn());
        };
    });

    if (!open) {
        return null;
    }

    return ReactDOM.createPortal(
        <div className={`${CSS_NS}-dialog-wrap`} data-modal={modal}>
            <div className={MASKER_CLASS_NAME}></div>
            <dialog
                className={`${CSS_NS}-dialog ${className}`}
                style={{
                    width: width ?? undefined,
                    maxHeight: maxHeight ?? undefined,
                    maxWidth: maxWidth ?? undefined,
                }}
                ref={dlgRef}
                onClose={() => {
                    setOpen(false);
                }}
            >
                {showTopCloser && (
                    <SpanButton
                        onClick={(e) => {
                            setOpen(false);
                        }}
                        className={TOP_CLOSER_CLASS_NAME}
                    ></SpanButton>
                )}
                {children}
            </dialog>
        </div>,
        document.body,
    );
});

/**
 * 标题子组件
 * 可以通过 moveable 属性设置标题是否可拖动
 */
const Title = Object.assign(
    ({ children, className }: DialogTitleProps) => {
        return <div className={`${TITLE_CLASS_NAME} ${className || ""}`}>{children}</div>;
    },
    { _type: DialogTitleSymbol },
);

/**
 * 内容子组件
 */
const Content = Object.assign(
    ({ children, className }: DialogContentProps) => {
        return <div className={`${CONTENT_CLASS_NAME} ${className || ""}`}>{children}</div>;
    },
    { _type: DialogContentSymbol },
);

/**
 * 操作按钮区域子组件
 */
const Action = Object.assign(
    ({ children, className, align = "right", gap = ".5em" }: DialogActionProps) => {
        return (
            <div className={`${ACTION_CLASS_NAME} ${className || ""}`} style={{ "--align": align, "--gap": gap } as React.CSSProperties}>
                {children}
            </div>
        );
    },
    { _type: DialogActionSymbol },
);

/**
 * 显示自定义对话框
 * @param content - 对话框内容，可以是 ReactNode 或字符串
 * @param onClose - 对话框关闭时的回调函数，返回 false 可阻止关闭
 * @param dlgProps - 其他 Dialog 组件的属性
 * @returns 卸载函数
 */
const showDialog = ({
    title,
    action,
    content,
    children,
    onClose,
    ...dlgProps
}: Partial<DialogProps> & {
    title?: ReactNode | string;
    children?: ReactNode | string;
    action?: ReactNode | string;
    content?: ReactNode | string;
    onClose?: () => boolean | void;
}) => {
    let destroy: (() => void) | null = null;
    function DialogWrapper() {
        const [open, setOpen] = useState(true);
        const handleSetOpen = (newOpen: boolean) => {
            if (!newOpen && onClose && onClose() === false) {
                return;
            }
            setOpen(newOpen);
        };
        useEffect(() => {
            !open && setTimeout(() => destroy?.(), 0);
        }, [open]);
        return (
            <Dialog {...dlgProps} open={open} setOpen={handleSetOpen}>
                {title && <Dialog.Title>{title}</Dialog.Title>}
                {content && <Dialog.Content>{content}</Dialog.Content>}
                {action && <Dialog.Action>{action}</Dialog.Action>}
                {children}
            </Dialog>
        );
    }
    destroy = mountReactNode(<DialogWrapper />);
    return destroy;
};

/**
 * 显示 React 组件作为对话框
 */
const showDialogComponent = <P extends object>(
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

const showIframeDialog = ({
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
    });
};

/**
 * 图片预览
 */
const showImgPreview = (src: string) => {
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
const prompt = ({
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
                    open={true}
                    setOpen={(open) => !open && closerRef.current?.()}
                    className={`${CSS_NS}-dialog-prompt`}
                    width={width}
                    showTopCloser={showTopCloser}
                >
                    <Dialog.Title>{title}</Dialog.Title>
                    <form
                        ref={formRef}
                        onSubmit={(e) => {
                            e.preventDefault();
                            doSubmit();
                            return false;
                        }}
                    >
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

interface ProgressDialogProps {
    title: string;
    message?: string;
    canAbort?: boolean;
    remainTimesText?: string;
    autoClose?: boolean;
}

interface ProgressDialogRet {
    updater: (p: number, totalValue?: number) => void;
    isAborted: () => boolean;
    close: () => void;
}

/**
 * 显示进度对话框
 */
const showProgressDialog = ({
    title,
    message,
    canAbort = true,
    autoClose = true,
    remainTimesText = "剩余时间 {timeStr}",
}: ProgressDialogProps): ProgressDialogRet => {
    let closer: (() => void) | null = null;
    const apiRef = {
        updater: null as ((p: number, totalValue?: number) => void) | null,
        isAborted: null as (() => boolean) | null,
    };

    const ProgressDialog = () => {
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
        }, []);

        useEffect(() => {
            if (autoClose && progressValue >= totalValue && totalValue > 0) {
                setTimeout(() => closer?.(), 0);
            }
        }, [progressValue, totalValue]);

        const remainSecs = Math.floor(calcRemainingMSecs(progressValue, totalValue, startTime) / 1000);
        const remainSecsStr = remainSecs === Infinity ? "" : remainTimesText;

        return (
            <Dialog
                open={true}
                setOpen={(open) => {
                    if (!open) {
                        closer?.();
                    }
                }}
                showTopCloser={canAbort}
                className={`${CSS_NS}-dialog-progress`}
                autoFocus={false}
            >
                <Dialog.Title>{title}</Dialog.Title>
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
        updater: (p, totalValue) => apiRef.updater?.(p, totalValue),
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
const confirm = ({
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
const alert = (
    title = "",
    message?: ReactNode,
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

/**
 * 对话框主组件导出（含子组件及函数式调用方法）
 */
export const Dialog = Object.assign(DialogImpl, {
    Title,
    Content,
    Action,
    show: showDialog,
    showComponent: showDialogComponent,
    showIframe: showIframeDialog,
    showImg: showImgPreview,
    prompt,
    showProgress: showProgressDialog,
    confirm,
    alert,
});

/**
 * 将焦点设置到容器内的第一个可聚焦元素上
 * @param {HTMLElement | null} container - 容器元素
 */
const focusFirstElement = (container: HTMLElement | null) => {
    if (!container) {
        return;
    }
    const el = findOne('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])', container) as HTMLElement | null;
    if (el && typeof el.focus === "function") {
        el.focus();
    }
};

//文本类型的表单元素
const FormTextTypes = ["text", "search", "email", "tel", "url", "color", "date", "datetime-local", "time", "week", "password"];

//<input>类型表单元素
const FormInputTypes = [...FormTextTypes, "number", "range", "month", "checkbox", "radio"];

/**
 * 构建表单元素
 * @param param0
 * @returns
 */
const makeElement = ({ type, ...props }: { type: string; [key: string]: any }) => {
    if (FormInputTypes.includes(type)) {
        if (type === "number" && !props.step && props.defaultValue) {
            props.step = precisionToStep(detectedPrecision(props.defaultValue));
        }
        return <input type={type} {...props} />;
    }
    if (type === "select") {
        return <select {...props} />;
    }
    if (type === "textarea") {
        return <textarea {...props} />;
    }
    throw "type not support";
};
