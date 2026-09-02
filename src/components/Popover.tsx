import * as ReactPopover from "@radix-ui/react-popover";
import { createContext, forwardRef, useContext, useMemo, useRef } from "react";
import "./../styles/common.module.scss";
import "./../styles/components/popover.scss";
import { namespace } from "./../styles/namespace";

const CSS_NS = namespace;

interface PopoverContextValue {
    // 用于在 Popover 树内共享 trigger 的 DOM ref
    triggerRef: React.MutableRefObject<any> | null;

    // 用于在 Popover 树内共享 className
    wrapperClassName?: string;

    // 控制 Content 是否渲染箭头
    showArrow?: boolean;
}

const PopoverContext = createContext<PopoverContextValue | null>(null);

type PopoverProps = React.ComponentProps<typeof ReactPopover.Root> & {
    className?: string;
    showArrow?: boolean;
};

const PopoverAnchor = ReactPopover.Anchor;

/**
 * PopoverTrigger 组件，作为 Popover 的触发元素，必须放在 Popover 内部
 * 使用 forwardRef 转发 ref，并将 trigger 的 DOM 元素 ref 存入 context，供 PopoverContent 使用
 */
const PopoverTrigger = forwardRef<HTMLElement, React.ComponentProps<typeof ReactPopover.Trigger>>(({ children, className = "", ...rest }, ref) => {
    const { triggerRef } = useContext(PopoverContext) ?? {};
    return (
        <ReactPopover.Trigger
            asChild
            ref={(el) => {
                // 同时写入 context ref 和外部 ref
                if (triggerRef) triggerRef.current = el;
                if (typeof ref === "function") ref(el as any);
                else if (ref) (ref as React.MutableRefObject<any>).current = el;
            }}
            className={CSS_NS + "-popover-trigger " + className}
            {...rest}
        >
            {children}
        </ReactPopover.Trigger>
    );
});

type PopoverContentProps = React.ComponentProps<typeof ReactPopover.Content> & {
    onCloseBy?: (target: HTMLElement) => boolean;
};

/**
 * PopoverContent 组件，作为 Popover 的内容容器，必须放在 Popover 内部
 * 使用 forwardRef 转发 ref，并从 context 获取 trigger 的 DOM 元素 ref，用于判断点击是否在 trigger 内部
 * 支持 onCloseBy 回调函数，返回 false 可阻止关闭
 * 支持 onOpenAutoFocus 回调函数，默认阻止自动聚焦
 */
const PopoverContent = forwardRef<HTMLDivElement, PopoverContentProps>(({ children, className, onCloseBy, align = "start", onOpenAutoFocus, ...rest }, ref) => {
    const { triggerRef, wrapperClassName, showArrow = false } = useContext(PopoverContext) ?? {};
    const contentRef = useRef<HTMLDivElement>(null);
    const DIALOG_WRAP_SELECTOR = ".dialog-wrap";

    onCloseBy =
        onCloseBy ||
        ((target) => {
            //不是对话框，关闭
            if (!target.closest(DIALOG_WRAP_SELECTOR)) {
                return true;
            }

            const triggerDialog = triggerRef?.current?.closest(DIALOG_WRAP_SELECTOR);

            // 点击在 trigger 的 dialog-wrap 内 → 允许关闭；否则阻止
            if (triggerDialog && triggerDialog.contains(target)) {
                return true;
            }

            return false;
        });

    const handleDismiss = (e: any) => {
        if (onCloseBy && onCloseBy(e.target) === false) {
            e.preventDefault();
        }
    };

    const handleOpenAutoFocus = (event: Event) => {
        // 默认不聚焦，避免 Popover 打开时抢走触发元素（如输入框）的焦点
        if (onOpenAutoFocus) {
            onOpenAutoFocus(event);
            return;
        }
        event.preventDefault();
    };

    return (
        <ReactPopover.Portal>
            <ReactPopover.Content
                ref={(el) => {
                    // 同时设置内部 ref 和外部 ref
                    contentRef.current = el;
                    if (typeof ref === "function") ref(el as any);
                    else if (ref) (ref as React.MutableRefObject<any>).current = el;

                    // 给 wrapper 添加 class
                    if (el && wrapperClassName) {
                        const wrapper = el.parentElement;
                        if (wrapper) {
                            wrapper.classList.add(...wrapperClassName.split(" "));
                        }
                    }
                }}
                align={align}
                className={CSS_NS + "-popover-content-wrap"}
                onInteractOutside={handleDismiss}
                onFocusOutside={handleDismiss}
                onOpenAutoFocus={handleOpenAutoFocus}
                {...rest}
            >
                <div className={CSS_NS + "-popover-content" + (className ? " " + className : "")}>{children}</div>
                {showArrow && <ReactPopover.Arrow className={CSS_NS + "-popover-arrow"} width={20} height={10} offset={5} />}
            </ReactPopover.Content>
        </ReactPopover.Portal>
    );
});

export const Popover = Object.assign(
    ({ children, className, showArrow, ...rest }: PopoverProps) => {
        const triggerRef = useRef<any>(null);
        const contextValue = useMemo(() => ({ triggerRef, wrapperClassName: className, showArrow }), [className, showArrow]);
        return (
            <PopoverContext.Provider value={contextValue}>
                <ReactPopover.Root {...rest}>{children}</ReactPopover.Root>
            </PopoverContext.Provider>
        );
    },
    {
        Anchor: PopoverAnchor,
        Trigger: PopoverTrigger,
        Content: PopoverContent,
        Arrow: ReactPopover.Arrow,
    },
);