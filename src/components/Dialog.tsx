import { SpanButton } from "@/components/Button";
import styleDefines from "@/styles/common.module.scss";
import "@/styles/components/dialog.scss";
import { focusFirstElement } from "@/utils/Dom";
import { bindClick, bindNodeMove, findOne } from "minutool";
import type { ReactNode } from "react";
import { forwardRef, useEffect, useImperativeHandle, useRef } from "react";
import ReactDOM from "react-dom";

const CSS_NS = styleDefines.namespace;
const TITLE_CLASS_NAME = `${CSS_NS}-dialog-title`;
const TOP_CLOSER_CLASS_NAME = `${CSS_NS}-dialog-close-btn`;
const CONTENT_CLASS_NAME = `${CSS_NS}-dialog-content`;

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

    showTopCloser?: boolean;
    wrapContent?: boolean;
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
 * @param wrapContent - 是否包裹内容
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

        return () => {
            cleanup.forEach((fn) => fn());
        };
    });

    if (!open) {
        return null;
    }

    return ReactDOM.createPortal(
        <div className={`${CSS_NS}-dialog-wrap`} data-modal={modal}>
            <div className={`${CSS_NS}-dialog-masker`}></div>
            <dialog
                className={`${CSS_NS}-dialog ${className}`}
                style={{ width: width ?? undefined, maxWidth: maxWidth ?? undefined }}
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
 * 可以通过 maxHeight 属性限制内容高度
 */
const Content = Object.assign(
    ({ children, className, maxHeight = null, maxWidth = null }: DialogContentProps) => {
        return (
            <div className={`${CONTENT_CLASS_NAME} ${className || ""}`} style={{ maxHeight: maxHeight ?? undefined, maxWidth: maxWidth ?? undefined }}>
                {children}
            </div>
        );
    },
    { _type: DialogContentSymbol },
);

/**
 * 操作按钮区域子组件
 */
const Action = Object.assign(
    ({ children, className, align = "right", gap = ".5em" }: DialogActionProps) => {
        return (
            <div className={`${CSS_NS}-dialog-buttons ${className || ""}`} style={{ "--align": align, "--gap": gap } as React.CSSProperties}>
                {children}
            </div>
        );
    },
    { _type: DialogActionSymbol },
);

/**
 * 对话框主组件导出（含子组件）
 */
export const Dialog = Object.assign(DialogImpl, { Title, Content, Action });
