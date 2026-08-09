/* eslint-disable react-refresh/only-export-components */
import { SpanButton } from "@/components/Button";
import styleDefines from "@/styles/common.module.scss";
import "@/styles/components/dialog.scss";
import { focusFirstElement } from "@/utils/Dom";
import { bindClick, bindNodeMove } from "minutool";
import type { ReactNode, RefObject } from "react";
import { createContext, useEffect, useRef } from "react";
import ReactDOM from "react-dom";

const CSS_NS = styleDefines.namespace;
const titleClassName = `${CSS_NS}-dialog-title`;
const topCloserClassName = `${CSS_NS}-dialog-close-btn`;
const contentClassName = `${CSS_NS}-dialog-content`;

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
    ref?: RefObject<HTMLDialogElement | null> | null;
    modal?: boolean;

    className?: string;
    maxHeight?: string | number | null;
    maxWidth?: string | number | null;
    width?: string | null;
    autoFocus?: boolean;
    moveable?: boolean;

    title?: ReactNode | string;
    showTopCloser?: boolean;
    action?: ReactNode;
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
export const Dialog = ({
    children,
    open,
    setOpen,
    ref = null,
    title,
    moveable = false,
    action = null,
    showTopCloser = true,
    className = "",
    maxHeight = null,
    maxWidth = null,
    autoFocus = false,
    width = null,
    modal = true,
    wrapContent = true,
}: DialogProps) => {
    const dlgRef = useRef<HTMLDialogElement | null>(null);

    if (!open) {
        return null;
    }

    useEffect(() => {
        if (ref) {
            ref.current = dlgRef.current;
        }
        if (dlgRef.current) {
            const dlg = dlgRef.current;
            dlg[open ? "show" : "close"]();
            const cleanup: (() => void)[] = [];
            if (open && autoFocus) {
                focusFirstElement(dlgRef.current);
            }

            if (title !== null && moveable) {
                cleanup.push(bindNodeMove(dlg, `.${titleClassName}`));
            }

            if (showTopCloser) {
                cleanup.push(
                    bindClick(`.${topCloserClassName}`, () => {
                        setOpen(false);
                    }),
                );
            }

            return () => {
                cleanup.forEach((fn) => fn());
            };
        }
    }, [dlgRef, open]);

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
                            className={topCloserClassName}
                        ></SpanButton>
                    )}
                    {title && <Dialog.Title>{title}</Dialog.Title>}
                    {wrapContent && (
                        <Dialog.Content maxHeight={maxHeight} maxWidth={maxWidth}>
                            {children}
                        </Dialog.Content>
                    )}
                    {!wrapContent && children}
                    {action && <Dialog.Action>{action}</Dialog.Action>}
                </dialog>
            </div>
        document.body,
    );
};

/**
 * 标题子组件
 * 可以通过 moveable 属性设置标题是否可拖动
 */
Dialog.Title = Object.assign(
    ({ children, className }: DialogTitleProps) => {
        return <div className={`${titleClassName} ${className || ""}`}>{children}</div>;
    },
    { _type: DialogTitleSymbol },
);

/**
 * 内容子组件
 * 可以通过 maxHeight 属性限制内容高度
 */
Dialog.Content = Object.assign(
    ({ children, className, maxHeight = null, maxWidth = null }: DialogContentProps) => {
        return (
            <div className={`${contentClassName} ${className || ""}`} style={{ maxHeight: maxHeight ?? undefined, maxWidth: maxWidth ?? undefined }}>
                {children}
            </div>
        );
    },
    { _type: DialogContentSymbol },
);

/**
 * 操作按钮区域子组件
 */
Dialog.Action = Object.assign(
    ({ children, className, align = "right", gap = ".5em" }: DialogActionProps) => {
        return (
            <div className={`${CSS_NS}-dialog-buttons ${className || ""}`} style={{ "--align": align, "--gap": gap } as React.CSSProperties}>
                {children}
            </div>
        );
    },
    { _type: DialogActionSymbol },
);
