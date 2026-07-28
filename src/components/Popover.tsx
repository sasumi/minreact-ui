import "@/styles/com.popover.scss";
import * as ReactPopover from "@radix-ui/react-popover";
import { createContext, forwardRef, useContext, useRef, useState, useEffect } from "react";
import { AnyButton, SpanButton } from "./Button";

// 用于在 Popover 树内共享 trigger 的 DOM ref
const PopoverTriggerRefContext = createContext<React.MutableRefObject<any> | null>(null);

// 用于在 Popover 树内共享 className
const PopoverWrapperClassContext = createContext<string | undefined>(undefined);

type PopoverProps = React.ComponentProps<typeof ReactPopover.Root> & {
	className?: string;
};

export const Popover = ({ children, className, ...rest }: PopoverProps) => {
	const triggerRef = useRef<any>(null);
	return (
		<PopoverTriggerRefContext.Provider value={triggerRef}>
			<PopoverWrapperClassContext.Provider value={className}>
				<ReactPopover.Root {...rest}>{children}</ReactPopover.Root>
			</PopoverWrapperClassContext.Provider>
		</PopoverTriggerRefContext.Provider>
	);
};

/**
 * PopoverTrigger 组件，作为 Popover 的触发元素，必须放在 Popover 内部
 * 使用 forwardRef 转发 ref，并将 trigger 的 DOM 元素 ref 存入 context，供 PopoverContent 使用
 */
export const PopoverAnchor = ReactPopover.Anchor;

export const PopoverTrigger = forwardRef<HTMLElement, React.ComponentProps<typeof ReactPopover.Trigger>>(({ children, className = "", ...rest }, ref) => {
	const triggerRef = useContext(PopoverTriggerRefContext);
	return (
		<ReactPopover.Trigger
			asChild
			ref={(el) => {
				// 同时写入 context ref 和外部 ref
				if (triggerRef) triggerRef.current = el;
				if (typeof ref === "function") ref(el as any);
				else if (ref) (ref as React.MutableRefObject<any>).current = el;
			}}
			className={"popover-trigger " + className}
			{...rest}
		>
			{children}
		</ReactPopover.Trigger>
	);
});

type PopoverContentProps = React.ComponentProps<typeof ReactPopover.Content> & {
	onCloseBy?: (target: HTMLElement) => boolean;
};

export const PopoverContent = forwardRef<HTMLDivElement, PopoverContentProps>(({ children, className, onCloseBy, ...rest }, ref) => {
	const triggerRef = useContext(PopoverTriggerRefContext);
	const wrapperClassName = useContext(PopoverWrapperClassContext);
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
				align="start"
				className="popover-content-wrap"
				onInteractOutside={handleDismiss}
				onFocusOutside={handleDismiss}
				{...rest}
			>
				<div className={"popover-content" + (className ? " " + className : "")}>{children}</div>
				<ReactPopover.Arrow className="popover-arrow" width={20} height={10} />
			</ReactPopover.Content>
		</ReactPopover.Portal>
	);
});

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
						className="popover-content-wrap"
						side={side}
						sideOffset={sideOffset}
					>
						<div className={"popover-content" + (contentClassName ? " " + contentClassName : "")} {...rest}>
							{content}
						</div>
						<ReactPopover.Arrow className="popover-arrow" width={16} height={8} />
					</ReactPopover.Content>
				</ReactPopover.Portal>
			</ReactPopover.Root>
		);
	},
);

interface SelectProps {
	name?: string;
	items: Array<{ label: string; value: any }>;
	selectedIndex?: number;
	disabled?: boolean;
	disabledValues?: any[];
	disabledIndexes?: number[];
	lite?: boolean;
	value?: any;
	onChange?: (value: any) => void;
}

/**
 * Select 选择组件，基于 Popover 实现
 */
export const Select = ({
	items,
	name,
	selectedIndex = 0,
	disabled = false,
	lite = false,
	disabledValues = [],
	disabledIndexes = [],
	value,
	onChange,
}: SelectProps) => {
	const [open, setOpen] = useState(false);
	const [current, setCurrent] = useState(value != null ? items.find((item) => item.value === value) : items[selectedIndex] || items[0]);

	// 当外部 value 变化时，同步更新 current
	useEffect(() => {
		if (value != null) {
			const found = items.find((item) => item.value === value);
			if (found) {
				setCurrent(found);
			}
		}
	}, [value, items]);

	return (
		<Popover open={open} onOpenChange={setOpen}>
			<PopoverTrigger asChild>
				<SpanButton className={"element select-ui" + (lite ? " select-ui-lite" : "")} disabled={disabled} aria-label={name}>
					<span className="txt">{current?.label || ""}</span>
					{name && <input type="hidden" name={name} value={current?.value} />}
				</SpanButton>
			</PopoverTrigger>
			<PopoverContent>
				<ul className="menu">
					{items.map((item, index) => (
						<AnyButton
							tag="li"
							className={item.value === current?.value ? "active" : ""}
							key={item.value}
							disabled={disabledValues.includes(item.value) || disabledIndexes.includes(index)}
							onClick={() => {
								if (onChange) onChange(item.value);
								setCurrent(item);
								setOpen(false);
							}}
						>
							{item.label}
						</AnyButton>
					))}
				</ul>
			</PopoverContent>
		</Popover>
	);
};
