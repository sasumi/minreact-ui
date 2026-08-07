/* eslint-disable react-refresh/only-export-components */
import { SpanButton } from "@/components/Button";
import styleDefines from "@/styles/common.module.scss";
import "@/styles/components/dialog.scss";
import { bindClick, bindNodeMove, focusFirstElement } from "@/utils/Dom";
import { findOne } from "minutool";
import type { ReactElement, ReactNode, RefObject } from "react";
import { Children, isValidElement, useEffect, useRef } from "react";
import ReactDOM from "react-dom";

const CSS_NS = styleDefines.namespace;

/**
 * 对话框大小
 */
export const DIALOG_SIZE_SMALL = "24em";
export const DIALOG_SIZE_NORMAL = "32em";
export const DIALOG_SIZE_LARGE = "60em";
export const DIALOG_SIZE_XLARGE = "80em";
export const DIALOG_SIZE_FULL = "90vw";

const DialogTitleSymbol = Symbol("DialogTitle");
const DialogTopCloserSymbol = Symbol("DialogTopCloser");
const DialogActionsSymbol = Symbol("DialogActions");

interface DialogProps {
    children?: ReactNode;
    open: boolean;
    setOpen: (open: boolean) => void;
    ref?: RefObject<HTMLDialogElement | null> | null;
    className?: string;
    maxHeight?: string | number | null;
    maxWidth?: string | number | null;
    autoFocus?: boolean;
    size?: string | null;
    maxSize?: string | null;
    modal?: boolean;

    Title?: ReactNode;
    TopCloser?: ReactNode;
    Actions?: ReactNode;
}

interface DialogTitleProps {
    children?: ReactNode;
    moveable?: boolean;
}

interface DialogTopCloserProps {
    onPreClick?: (e: React.MouseEvent<HTMLButtonElement>) => void | boolean;
    className?: string;
}

interface DialogActionsProps {
    children?: ReactNode;
    align?: "left" | "center" | "right";
    gap?: string | number;
}

/**
 * 从 children 中提取特定的子组件
 */
const extractChildComponents = (
    children: ReactNode,
): {
    Title?: ReactElement<DialogTitleProps> | undefined;
    TopCloser?: ReactElement<DialogTopCloserProps> | undefined;
    Actions?: ReactElement<DialogActionsProps> | undefined;
    Contents: ReactNode[];
} => {
    const Title = Children.toArray(children).find((child) => isValidElement(child) && (child.type as any)._type === DialogTitleSymbol) as
        | ReactElement<DialogTitleProps>
        | undefined;

    const TopCloser = Children.toArray(children).find((child) => isValidElement(child) && (child.type as any)._type === DialogTopCloserSymbol) as
        | ReactElement<DialogTopCloserProps>
        | undefined;

    const Actions = Children.toArray(children).find((child) => isValidElement(child) && (child.type as any)._type === DialogActionsSymbol) as
        | ReactElement<DialogActionsProps>
        | undefined;

    const Contents = Children.toArray(children).filter((child) => {
        if (!isValidElement(child)) {
            return true;
        }
        const type = (child.type as any)._type;
        return type !== DialogTitleSymbol && type !== DialogTopCloserSymbol && type !== DialogActionsSymbol;
    });

    return {
        Title,
        TopCloser,
        Actions,
        Contents,
    };
};

/**
 * 对话框主组件
 */
export const Dialog = ({
    children,
    open,
    setOpen,
    ref = null,
    className = "",
    maxHeight = null,
    maxWidth = null,
    autoFocus = false,
    size = null,
    maxSize = null,
    modal = true,
}: DialogProps) => {
    const dlgRef = useRef<HTMLDialogElement | null>(null);
    const cleanupRef = useRef<(() => void)[] | null>([]);

    // 提取子组件
    const { Title, TopCloser, Actions, Contents } = extractChildComponents(children);

    // 使用 callback ref 确保在 DOM 挂载时立即执行
    const handleDialogRef = (dlgNode: HTMLDialogElement | null) => {
        dlgRef.current = dlgNode;

        // 清理旧的事件监听器
        if (cleanupRef.current) {
            cleanupRef.current.forEach((fn) => fn());
        }
        cleanupRef.current = [];

        // 设置外部 ref
        if (ref) {
            ref.current = dlgNode;
        }

        // 绑定拖动事件
        if (Title?.props.moveable && dlgNode) {
            const titleNode = findOne(`.${CSS_NS}-dialog-title`, dlgNode) as HTMLElement;
            cleanupRef.current.push(bindNodeMove(dlgNode, titleNode));
        }

        /**
         * 绑定关闭按钮点击事件
         * 如果 onPreClick 返回 false，则阻止关闭
         * 否则关闭对话框
         */
        if (TopCloser && dlgNode) {
            const preClick = TopCloser.props.onPreClick;
            const closeBtn = findOne(`.${CSS_NS}-dialog-close-btn`, dlgNode) as HTMLElement;
            cleanupRef.current.push(
                bindClick(closeBtn, (e) => {
                    if (preClick && preClick(e) === false) {
                        return;
                    }
                    setOpen(false);
                }),
            );
        }
    };

    useEffect(() => {
        if (open) {
            dlgRef.current?.show();
            autoFocus && focusFirstElement(dlgRef.current);
        } else {
            dlgRef.current?.close();
        }
    }, [open, autoFocus]);

    // 组件卸载时清理
    useEffect(() => {
        return () => {
            if (cleanupRef.current) {
                cleanupRef.current.forEach((fn) => fn());
            }
        };
    }, []);

    if (!open) {
        return null;
    }

    return ReactDOM.createPortal(
        <div className={`${CSS_NS}-dialog-wrap`} data-modal={modal} data-moveable={Title?.props.moveable ?? false}>
            <div className={`${CSS_NS}-dialog-masker`}></div>
            <dialog
                className={`${CSS_NS}-dialog ${className}`}
                style={{ width: size ?? undefined, maxWidth: maxSize ?? undefined }}
                ref={handleDialogRef}
                onClose={() => {
                    setOpen(false);
                }}
            >
                {TopCloser}
                {Title}
                <div className={`${CSS_NS}-dialog-content`} style={{ maxHeight: maxHeight ?? undefined, maxWidth: maxWidth ?? undefined }}>
                    {Contents}
                </div>
                {Actions}
            </dialog>
        </div>,
        document.body,
    );
};

/**
 * 标题子组件
 */
const DialogTitle = ({ children, moveable = false }: DialogTitleProps) => {
    return <div className={`${CSS_NS}-dialog-title`}>{children}</div>;
};
DialogTitle._type = DialogTitleSymbol;
Dialog.Title = DialogTitle;

/**
 * 顶部关闭按钮子组件
 * 可以自定义 onClick 行为，如果返回 false 则阻止关闭
 * 如果不传 onClick，则默认关闭对话框
 */
const DialogTopCloser = ({ onPreClick }: DialogTopCloserProps) => {
    return <SpanButton className={`icon-button ${CSS_NS}-dialog-close-btn`}></SpanButton>;
};
DialogTopCloser._type = DialogTopCloserSymbol;
Dialog.TopCloser = DialogTopCloser;

/**
 * 操作按钮区域子组件
 */
const DialogActions = ({ children, align = "right", gap = ".5em" }: DialogActionsProps) => {
    return (
        <div className={`${CSS_NS}-dialog-buttons`} style={{ "--align": align, "--gap": gap } as React.CSSProperties}>
            {children}
        </div>
    );
};
DialogActions._type = DialogActionsSymbol;
Dialog.Actions = DialogActions;
