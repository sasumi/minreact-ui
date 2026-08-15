import { forwardRef, useRef } from "react";
import * as ReactPopover from "@radix-ui/react-popover";
import "@/styles/components/popover.scss";
import styleDefines from "@/styles/common.module.scss";

const CSS_NS = styleDefines.namespace;

/**
 * Tip 气泡提示组件，基于 react-popover 实现
 * 简单用法: <Tip content="提示文字"><button>触发</button></Tip>
 * 受控用法: <Tip open={open} onOpenChange={setOpen} content="提示"><button>触发</button></Tip>
 *
 * @param {ReactNode} children - 触发元素
 * @param {ReactNode} content  - 提示内容
 * @param {boolean}  open      - 受控显示状态
 * @param {boolean}  defaultOpen - 非受控初始显示状态
 * @param {Function} onOpenChange - 显示状态变化回调
 * @param {string}   side      - 弹出方向，默认 "top"
 * @param {number}   sideOffset - 偏移距离，默认 6
 * @param {string}   className  - 内容区附加类名
 * @param {string}   wrapperClassName - wrapper 容器的类名
 */
type TipProps = {
    children?: React.ReactNode;
    content?: React.ReactNode;
    className?: string;
    wrapperClassName?: string;
    open?: boolean;
    defaultOpen?: boolean;
    onOpenChange?: (open: boolean) => void;
    side?: "top" | "bottom" | "left" | "right";
    sideOffset?: number;
    [key: string]: any;
};

/**
 * PopoverTrigger 组件，作为 Popover 的触发元素，必须放在 Popover 内部
 * 使用 forwardRef 转发 ref，并将 trigger 的 DOM 元素 ref 存入 context，供 PopoverContent 使用
 * @param {ReactNode} children - 触发元素
 * @param {ReactNode} content  - 提示内容
 * @param {boolean}  open      - 受控显示状态
 * @param {boolean}  defaultOpen - 非受控初始显示状态
 * @param {Function} onOpenChange - 显示状态变化回调
 * @param {string}   side      - 弹出方向，默认 "top"
 * @param {number}   sideOffset - 偏移距离，默认 6
 * @param {string}   contentClassName  - 内容区附加类名
 * @param {string}   className - wrapper 容器的类名
 * @returns {JSX.Element}
 */
export const Tip = forwardRef<HTMLDivElement, TipProps>(
    ({ children, content, contentClassName = "", className, open, defaultOpen, onOpenChange, side = "top", sideOffset = 6, ...rest }, ref) => {
        const contentRef = useRef<HTMLDivElement>(null);
        const rootProps: Record<string, any> = {};
        if (open !== undefined) rootProps.open = open;
        if (defaultOpen !== undefined) rootProps.defaultOpen = defaultOpen;
        if (onOpenChange) rootProps.onOpenChange = onOpenChange;

        return (
            <ReactPopover.Root {...rootProps}>
                <ReactPopover.Trigger asChild>{children}</ReactPopover.Trigger>
                <ReactPopover.Portal>
                    <ReactPopover.Content
                        ref={(el) => {
                            // 同时设置内部 ref 和外部 ref
                            contentRef.current = el;
                            if (typeof ref === "function") ref(el as any);
                            else if (ref) (ref as React.MutableRefObject<any>).current = el;
                            // 给 wrapper 添加 class
                            if (el && className) {
                                const wrapper = el.parentElement;
                                if (wrapper) {
                                    wrapper.classList.add(...className.split(" "));
                                }
                            }
                        }}
                        className={CSS_NS + "-popover-content-wrap"}
                        side={side}
                        sideOffset={sideOffset}
                    >
                        <div className={CSS_NS + "-popover-content" + (contentClassName ? " " + contentClassName : "")} {...rest}>
                            {content}
                        </div>
                        <ReactPopover.Arrow className={CSS_NS + "-popover-arrow"} width={16} height={8} />
                    </ReactPopover.Content>
                </ReactPopover.Portal>
            </ReactPopover.Root>
        );
    },
);
